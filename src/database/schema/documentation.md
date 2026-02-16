# Historical Data Pipeline - Database Schema Documentation

## Overview

This document describes the database schema for the historical data pipeline that loads 2+ years of odds and match results from Betfair API into PostgreSQL.

## Tables

### 1. sports
**Purpose:** Master data for sports and their configurations

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PRIMARY KEY |
| sport_name | VARCHAR(100) | Internal sport identifier | UNIQUE, NOT NULL |
| display_name | VARCHAR(100) | User-friendly sport name | NOT NULL |
| is_active | BOOLEAN | Whether sport is active | DEFAULT TRUE |
| priority | INTEGER | Priority for data collection | DEFAULT 0 |
| data_source | VARCHAR(50) | Data source identifier | DEFAULT 'betfair' |
| betfair_market_type | VARCHAR(100) | Betfair market type |  |
| betfair_event_type_id | VARCHAR(50) | Betfair event type ID |  |
| timezone | VARCHAR(50) | Timezone for sport | DEFAULT 'UTC' |
| trading_hours_start | TIME | Start of trading hours |  |
| trading_hours_end | TIME | End of trading hours |  |
| created_at | TIMESTAMP | Record creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Record update timestamp | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- idx_is_active (is_active)
- idx_priority (priority)
- idx_data_source (data_source)

### 2. markets
**Purpose:** Master data for betting markets and their configurations

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PRIMARY KEY |
| market_name | VARCHAR(255) | Internal market identifier | NOT NULL |
| display_name | VARCHAR(255) | User-friendly market name | NOT NULL |
| sport_id | BIGINT | Foreign key to sports table | NOT NULL, FOREIGN KEY |
| is_active | BOOLEAN | Whether market is active | DEFAULT TRUE |
| priority | INTEGER | Priority for data collection | DEFAULT 0 |
| market_type | VARCHAR(100) | Market type code | NOT NULL |
| betfair_market_type | VARCHAR(100) | Betfair market type |  |
| betfair_selection_type | VARCHAR(100) | Betfair selection type |  |
| has_handicap | BOOLEAN | Whether market includes handicap | DEFAULT FALSE |
| has_over_under | BOOLEAN | Whether market includes over/under | DEFAULT FALSE |
| has_both_teams_to_score | BOOLEAN | Whether market includes BTTS | DEFAULT FALSE |
| created_at | TIMESTAMP | Record creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Record update timestamp | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- unique_market_sport (market_name, sport_id)

**Indexes:**
- idx_sport_id (sport_id)
- idx_is_active (is_active)
- idx_priority (priority)
- idx_market_type (market_type)

### 3. match_results
**Purpose:** Historical match results with scores and outcomes

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PRIMARY KEY |
| betfair_event_id | VARCHAR(255) | Unique Betfair event identifier | NOT NULL, UNIQUE |
| external_event_id | VARCHAR(255) | External event identifier |  |
| sport | VARCHAR(100) | Sport name | NOT NULL |
| competition | VARCHAR(255) | Competition name |  |
| competition_id | VARCHAR(255) | Competition identifier |  |
| home_team | VARCHAR(255) | Home team name | NOT NULL |
| away_team | VARCHAR(255) | Away team name | NOT NULL |
| match_name | VARCHAR(500) | Match name (home vs away) | NOT NULL |
| match_date | TIMESTAMP | Match start date/time | NOT NULL |
| home_score | INTEGER | Final home score |  |
| away_score | INTEGER | Final away score |  |
| full_time_result | VARCHAR(10) | Full time result (H/D/A) |  |
| half_time_result | VARCHAR(10) | Half time result |  |
| status | VARCHAR(50) | Match status | DEFAULT 'completed', CHECK constraint |
| is_active | BOOLEAN | Whether record is active | DEFAULT TRUE |
| created_at | TIMESTAMP | Record creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Record update timestamp | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- unique_match (betfair_event_id)
- chk_scores_positive (home_score >= 0 AND away_score >= 0)
- chk_valid_result (valid score/result combination)

**Indexes:**
- idx_sport (sport)
- idx_competition (competition)
- idx_match_date (match_date)
- idx_home_team (home_team)
- idx_away_team (away_team)
- idx_status (status)
- idx_sport_date (sport, match_date)

### 4. historical_odds
**Purpose:** Historical odds data from Betfair API with market and selection details

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | BIGSERIAL | Primary key | PRIMARY KEY |
| betfair_market_id | VARCHAR(255) | Unique Betfair market identifier | NOT NULL |
| betfair_selection_id | VARCHAR(255) | Unique Betfair selection identifier | NOT NULL |
| betfair_event_id | VARCHAR(255) | Unique Betfair event identifier | NOT NULL |
| sport | VARCHAR(100) | Sport name | NOT NULL |
| competition | VARCHAR(255) | Competition name |  |
| event_name | VARCHAR(500) | Event name | NOT NULL |
| market_name | VARCHAR(255) | Market name | NOT NULL |
| selection_name | VARCHAR(255) | Selection name | NOT NULL |
| price | DECIMAL(10,3) | Odds price (decimal format) | NOT NULL, CHECK > 0 |
| size | DECIMAL(15,2) | Available size/lay amount | CHECK >= 0 OR NULL |
| side | VARCHAR(10) | Back or Lay side | NOT NULL, CHECK constraint |
| timestamp_utc | TIMESTAMP | Timestamp when odds were captured | NOT NULL |
| captured_at | TIMESTAMP | Timestamp when record was inserted | DEFAULT CURRENT_TIMESTAMP |
| is_active | BOOLEAN | Whether record is active | DEFAULT TRUE |
| source | VARCHAR(50) | Data source identifier | DEFAULT 'betfair' |
| created_at | TIMESTAMP | Record creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Record update timestamp | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- unique_odds (betfair_market_id, betfair_selection_id, timestamp_utc, side)
- chk_odds_price_positive (price > 0)
- chk_odds_size_positive (size >= 0 OR NULL)

**Indexes:**
- idx_sport (sport)
- idx_event_id (betfair_event_id)
- idx_market_id (betfair_market_id)
- idx_timestamp (timestamp_utc)
- idx_captured_at (captured_at)
- idx_sport_timestamp (sport, timestamp_utc)
- idx_historical_odds_active (partial index for active records)

## ETL Pipeline Process

### 1. Data Extraction
- **Betfair API:** Historical odds data via listMarketBook endpoint
- **Public API:** Match results via football-data.org API

### 2. Data Transformation
- Validate data integrity
- Transform to internal schema format
- Generate UUIDs for primary keys
- Calculate derived fields (results, timestamps)

### 3. Data Loading
- Use PostgreSQL COPY for bulk inserts
- Implement upsert logic for existing records
- Transaction-based loading with rollback on failure
- Performance optimization with batch processing

## Performance Considerations

### Query Performance
- Composite indexes on frequently queried columns
- Partial indexes for active records
- Partitioning strategy for large historical tables

### Data Volume
- Expected: 10M+ records for 2+ years of data
- Optimization: Batch processing, connection pooling
- Monitoring: Query performance, index usage

### Scalability
- Horizontal scaling with read replicas
- Connection pooling for concurrent access
- Archiving strategy for old data

## Security Considerations

### Data Protection
- SSL encryption for database connections
- Access controls and role-based permissions
- Audit logging for data modifications

### API Security
- API key management for external services
- Rate limiting and request throttling
- Error handling to prevent information leakage

## Monitoring and Maintenance

### Health Checks
- Database connection monitoring
- Query performance monitoring
- Data integrity checks

### Maintenance Tasks
- Index maintenance and vacuuming
- Backup and recovery procedures
- Performance tuning based on query patterns

## Error Handling

### Retry Logic
- Exponential backoff for API calls
- Dead letter queue for failed records
- Alerting for persistent failures

### Data Validation
- Schema validation before loading
- Business rule validation
- Data quality checks and reporting

## Future Enhancements

### Partitioning
- Time-based partitioning for historical_odds
- Hash partitioning for high-cardinality columns

### Caching
- Redis caching for frequently accessed data
- Materialized views for complex aggregations

### Real-time Processing
- Kafka integration for streaming data
- Change data capture for real-time updates

This schema provides a solid foundation for historical data analysis and supports the requirements for 2+ years of betting data with high performance and data integrity.