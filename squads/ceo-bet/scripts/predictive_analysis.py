#!/usr/bin/env python3
"""
Predictive Analysis for Sports Betting
Uses machine learning to predict outcomes and calculate value bets
"""

import sys
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class BettingPredictor:
    """
    Machine learning predictor for sports betting outcomes
    """

    def __init__(self, model_type='random_forest'):
        """
        Initialize predictor

        Args:
            model_type: 'random_forest' or 'gradient_boosting'
        """
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        elif model_type == 'gradient_boosting':
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        self.is_trained = False
        self.feature_names = None

    def prepare_features(self, data):
        """
        Extract features from betting data

        Expected columns:
        - home_team_elo: ELO rating home team
        - away_team_elo: ELO rating away team
        - home_form: Recent form (last 5 games win rate)
        - away_form: Recent form (last 5 games win rate)
        - h2h_home_wins: Head-to-head home wins
        - h2h_away_wins: Head-to-head away wins
        - avg_home_odds: Average home odds
        - avg_draw_odds: Average draw odds
        - avg_away_odds: Average away odds
        - venue_advantage: 1 if home, 0 if neutral
        """
        df = pd.DataFrame(data)

        # Feature engineering
        df['elo_diff'] = df['home_team_elo'] - df['away_team_elo']
        df['form_diff'] = df['home_form'] - df['away_form']
        df['h2h_ratio'] = df['h2h_home_wins'] / (df['h2h_home_wins'] + df['h2h_away_wins'] + 0.01)
        df['odds_home_implied'] = 1 / df['avg_home_odds']
        df['odds_away_implied'] = 1 / df['avg_away_odds']
        df['odds_draw_implied'] = 1 / df['avg_draw_odds']
        df['odds_margin'] = (df['odds_home_implied'] + df['odds_away_implied'] + df['odds_draw_implied']) - 1

        features = [
            'home_team_elo', 'away_team_elo', 'elo_diff',
            'home_form', 'away_form', 'form_diff',
            'h2h_ratio', 'venue_advantage',
            'odds_home_implied', 'odds_away_implied', 'odds_draw_implied',
            'odds_margin'
        ]

        self.feature_names = features
        return df[features].values

    def train(self, X_train, y_train):
        """
        Train the model

        Args:
            X_train: Training features (numpy array or DataFrame)
            y_train: Training labels (0=away win, 1=draw, 2=home win)
        """
        if isinstance(X_train, pd.DataFrame):
            X_train = X_train.values

        self.model.fit(X_train, y_train)
        self.is_trained = True

        # Cross-validation score
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5, scoring='accuracy')

        return {
            'cv_mean_accuracy': cv_scores.mean(),
            'cv_std_accuracy': cv_scores.std(),
            'cv_scores': cv_scores.tolist()
        }

    def predict_proba(self, X):
        """
        Predict outcome probabilities

        Returns:
            probabilities for [away_win, draw, home_win]
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")

        if isinstance(X, pd.DataFrame):
            X = X.values

        return self.model.predict_proba(X)

    def predict(self, X):
        """
        Predict outcome class

        Returns:
            0=away win, 1=draw, 2=home win
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")

        if isinstance(X, pd.DataFrame):
            X = X.values

        return self.model.predict(X)

    def find_value_bets(self, X, odds_home, odds_draw, odds_away, edge_threshold=5.0):
        """
        Find value bets comparing model probabilities vs market odds

        Args:
            X: Features
            odds_home: Market odds for home win
            odds_draw: Market odds for draw
            odds_away: Market odds for away win
            edge_threshold: Minimum edge % to consider a value bet

        Returns:
            List of value bets with recommendations
        """
        probs = self.predict_proba(X)

        value_bets = []

        for i, prob in enumerate(probs):
            prob_away, prob_draw, prob_home = prob

            # Market implied probabilities
            market_prob_home = 1 / odds_home[i]
            market_prob_draw = 1 / odds_draw[i]
            market_prob_away = 1 / odds_away[i]

            # Calculate edges
            edge_home = (prob_home - market_prob_home) / market_prob_home * 100
            edge_draw = (prob_draw - market_prob_draw) / market_prob_draw * 100
            edge_away = (prob_away - market_prob_away) / market_prob_away * 100

            # Find best edge
            edges = {
                'home': edge_home,
                'draw': edge_draw,
                'away': edge_away
            }

            best_outcome = max(edges, key=edges.get)
            best_edge = edges[best_outcome]

            if best_edge >= edge_threshold:
                value_bets.append({
                    'match_index': i,
                    'recommendation': best_outcome,
                    'edge_percent': round(best_edge, 2),
                    'model_probability': round(prob[['away', 'draw', 'home'].index(best_outcome)] * 100, 2),
                    'market_probability': round(
                        [market_prob_away, market_prob_draw, market_prob_home][
                            ['away', 'draw', 'home'].index(best_outcome)
                        ] * 100, 2
                    ),
                    'odds': [odds_away[i], odds_draw[i], odds_home[i]][
                        ['away', 'draw', 'home'].index(best_outcome)
                    ]
                })

        return value_bets

    def feature_importance(self):
        """
        Get feature importance scores
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")

        importances = self.model.feature_importances_

        return dict(zip(self.feature_names, importances.tolist()))


# CLI usage
if __name__ == "__main__":
    print("\n=== BETTING PREDICTOR - PREDICTIVE ANALYSIS ===\n")

    # Example: Generate synthetic data for demo
    np.random.seed(42)
    n_samples = 1000

    data = {
        'home_team_elo': np.random.normal(1500, 200, n_samples),
        'away_team_elo': np.random.normal(1500, 200, n_samples),
        'home_form': np.random.uniform(0, 1, n_samples),
        'away_form': np.random.uniform(0, 1, n_samples),
        'h2h_home_wins': np.random.randint(0, 10, n_samples),
        'h2h_away_wins': np.random.randint(0, 10, n_samples),
        'avg_home_odds': np.random.uniform(1.5, 4.0, n_samples),
        'avg_draw_odds': np.random.uniform(2.5, 4.5, n_samples),
        'avg_away_odds': np.random.uniform(1.5, 4.0, n_samples),
        'venue_advantage': np.random.choice([0, 1], n_samples)
    }

    # Synthetic outcomes (based on ELO and form)
    outcomes = []
    for i in range(n_samples):
        elo_diff = data['home_team_elo'][i] - data['away_team_elo'][i]
        form_diff = data['home_form'][i] - data['away_form'][i]

        prob_home = 0.4 + (elo_diff / 1000) + form_diff * 0.2
        prob_home = max(0.1, min(0.8, prob_home))

        rand = np.random.random()
        if rand < prob_home:
            outcomes.append(2)  # Home win
        elif rand < prob_home + 0.25:
            outcomes.append(1)  # Draw
        else:
            outcomes.append(0)  # Away win

    # Split data
    predictor = BettingPredictor(model_type='random_forest')

    X = predictor.prepare_features(data)
    y = np.array(outcomes)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train
    print("Training model...")
    train_results = predictor.train(X_train, y_train)
    print(f"[OK] CV Accuracy: {train_results['cv_mean_accuracy']:.2%} +/- {train_results['cv_std_accuracy']:.2%}")

    # Test
    print("\nTesting model...")
    y_pred = predictor.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"[OK] Test Accuracy: {accuracy:.2%}")

    # Feature importance
    print("\nFeature Importance:")
    importance = predictor.feature_importance()
    for feature, score in sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {feature}: {score:.4f}")

    # Find value bets in test set
    print("\nFinding value bets in test set...")
    test_indices = range(len(X_test))
    odds_home = data['avg_home_odds'][-len(X_test):]
    odds_draw = data['avg_draw_odds'][-len(X_test):]
    odds_away = data['avg_away_odds'][-len(X_test):]

    value_bets = predictor.find_value_bets(
        X_test, odds_home, odds_draw, odds_away,
        edge_threshold=5.0
    )

    print(f"[OK] Found {len(value_bets)} value bets (edge >= 5%)\n")

    if value_bets:
        print("Top 3 Value Bets:")
        for bet in sorted(value_bets, key=lambda x: x['edge_percent'], reverse=True)[:3]:
            print(f"\n  Match #{bet['match_index']}")
            print(f"  Recommendation: {bet['recommendation'].upper()}")
            print(f"  Edge: {bet['edge_percent']}%")
            print(f"  Model Probability: {bet['model_probability']}%")
            print(f"  Market Probability: {bet['market_probability']}%")
            print(f"  Odds: {bet['odds']}")

    print("\n")
