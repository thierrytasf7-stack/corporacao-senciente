"""
Market Opportunity Value Object
Oportunidades de mercado identificadas para criação de subsidiárias
"""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field, validator
from decimal import Decimal
from datetime import datetime


class OpportunitySource(Enum):
    """Fonte da identificação da oportunidade"""
    MARKET_RESEARCH = "market_research"
    COMPETITIVE_ANALYSIS = "competitive_analysis"
    CUSTOMER_FEEDBACK = "customer_feedback"
    TREND_ANALYSIS = "trend_analysis"
    TECHNOLOGICAL_BREAKTHROUGH = "technological_breakthrough"
    REGULATORY_CHANGE = "regulatory_change"
    ECONOMIC_INDICATOR = "economic_indicator"
    SOCIAL_TREND = "social_trend"


class OpportunityStatus(Enum):
    """Status da oportunidade"""
    IDENTIFIED = "identified"
    ANALYZED = "analyzed"
    VALIDATED = "validated"
    PRIORITIZED = "prioritized"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class MarketOpportunity(BaseModel):
    """Oportunidade de mercado para criação de subsidiária"""
    id: str = Field(..., description="Identificador único da oportunidade")
    title: str = Field(..., description="Título descritivo da oportunidade")
    description: str = Field(..., description="Descrição detalhada da oportunidade")
    source: OpportunitySource = Field(..., description="Fonte da identificação")
    status: OpportunityStatus = Field(default=OpportunityStatus.IDENTIFIED)

    # Métricas de mercado
    tam: Decimal = Field(..., description="Total Addressable Market em USD", gt=0)
    sam: Decimal = Field(..., description="Serviceable Addressable Market em USD", gt=0)
    som: Decimal = Field(..., description="Serviceable Obtainable Market em USD", gt=0)
    growth_rate: Decimal = Field(..., description="Taxa de crescimento anual (%)", ge=0, le=1000)
    competition_level: str = Field(..., description="Nível de competição (low/medium/high)")
    market_maturity: str = Field(..., description="Maturidade do mercado (nascent/growing/mature)")

    # Análise de viabilidade
    technical_feasibility: int = Field(..., description="Viabilidade técnica (0-100)", ge=0, le=100)
    business_feasibility: int = Field(..., description="Viabilidade de negócio (0-100)", ge=0, le=100)
    financial_feasibility: int = Field(..., description="Viabilidade financeira (0-100)", ge=0, le=100)

    # Características da oportunidade
    target_business_type: str = Field(..., description="Tipo de negócio alvo")
    target_revenue_model: str = Field(..., description="Modelo de receita sugerido")
    estimated_initial_investment: Decimal = Field(..., description="Investimento inicial estimado", ge=0)
    estimated_time_to_market: int = Field(..., description="Tempo para ir ao mercado (meses)", ge=1)
    estimated_first_year_revenue: Decimal = Field(..., description="Receita estimada no primeiro ano", ge=0)

    # Metadados
    identified_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    created_by: str = Field(..., description="Agente que identificou a oportunidade")
    tags: List[str] = Field(default_factory=list, description="Tags para categorização")
    priority_score: Optional[int] = Field(None, description="Pontuação de prioridade (0-100)", ge=0, le=100)

    @validator('sam', 'som')
    def validate_market_sizes(cls, v, values):
        """Valida que SAM e SOM são menores ou iguais ao TAM"""
        if 'tam' in values and v > values['tam']:
            raise ValueError("SAM/SOM não pode ser maior que TAM")
        return v

    @validator('competition_level')
    def validate_competition_level(cls, v):
        """Valida nível de competição"""
        valid_levels = ['low', 'medium', 'high']
        if v.lower() not in valid_levels:
            raise ValueError(f"Nível de competição deve ser: {', '.join(valid_levels)}")
        return v.lower()

    @validator('market_maturity')
    def validate_market_maturity(cls, v):
        """Valida maturidade do mercado"""
        valid_levels = ['nascent', 'growing', 'mature']
        if v.lower() not in valid_levels:
            raise ValueError(f"Maturidade deve ser: {', '.join(valid_levels)}")
        return v.lower()

    def calculate_overall_score(self) -> int:
        """Calcula pontuação geral da oportunidade (0-100)"""
        # Pesos: mercado (30%), viabilidade técnica (25%), negócio (25%), financeira (20%)
        market_score = self._calculate_market_score()
        technical_score = self.technical_feasibility
        business_score = self.business_feasibility
        financial_score = self.financial_feasibility

        overall_score = int(
            market_score * 0.30 +
            technical_score * 0.25 +
            business_score * 0.25 +
            financial_score * 0.20
        )

        return min(100, max(0, overall_score))

    def _calculate_market_score(self) -> int:
        """Calcula pontuação baseada em métricas de mercado"""
        score = 0

        # TAM size (até 40 pontos)
        if self.tam >= 1000000000:  # $1B+
            score += 40
        elif self.tam >= 500000000:  # $500M+
            score += 30
        elif self.tam >= 100000000:  # $100M+
            score += 20
        elif self.tam >= 10000000:   # $10M+
            score += 10

        # Growth rate (até 30 pontos)
        if self.growth_rate >= 50:
            score += 30
        elif self.growth_rate >= 25:
            score += 20
        elif self.growth_rate >= 10:
            score += 10

        # Competition level (até 20 pontos)
        if self.competition_level == 'low':
            score += 20
        elif self.competition_level == 'medium':
            score += 10

        # Market maturity (até 10 pontos)
        if self.market_maturity == 'nascent':
            score += 10
        elif self.market_maturity == 'growing':
            score += 5

        return score

    def calculate_roi_potential(self) -> Decimal:
        """Calcula potencial de ROI"""
        if self.estimated_initial_investment <= 0:
            return Decimal('0')

        # ROI = (Receita Ano 1 - Investimento) / Investimento
        net_profit = self.estimated_first_year_revenue - self.estimated_initial_investment

        if self.estimated_initial_investment > 0:
            roi = (net_profit / self.estimated_initial_investment) * 100
            return Decimal(str(roi)).quantize(Decimal('0.01'))

        return Decimal('0')

    def get_risk_assessment(self) -> Dict[str, Any]:
        """Avaliação de riscos da oportunidade"""
        risks = {
            'market_risk': self._assess_market_risk(),
            'technical_risk': self._assess_technical_risk(),
            'execution_risk': self._assess_execution_risk(),
            'financial_risk': self._assess_financial_risk()
        }

        overall_risk = sum(risks.values()) / len(risks)

        return {
            'detailed_risks': risks,
            'overall_risk_score': overall_risk,
            'risk_level': self._get_risk_level(overall_risk)
        }

    def _assess_market_risk(self) -> int:
        """Avalia risco de mercado (0-100)"""
        risk = 50  # Base

        # Competition increases risk
        if self.competition_level == 'high':
            risk += 30
        elif self.competition_level == 'medium':
            risk += 15

        # Market maturity decreases risk
        if self.market_maturity == 'mature':
            risk -= 20
        elif self.market_maturity == 'growing':
            risk -= 10

        # TAM size decreases risk
        if self.tam >= 500000000:
            risk -= 15

        return max(0, min(100, risk))

    def _assess_technical_risk(self) -> int:
        """Avalia risco técnico"""
        return 100 - self.technical_feasibility

    def _assess_execution_risk(self) -> int:
        """Avalia risco de execução"""
        risk = 50

        # Time to market impact
        if self.estimated_time_to_market > 12:
            risk += 25
        elif self.estimated_time_to_market > 6:
            risk += 10

        # Investment size impact
        if self.estimated_initial_investment > 500000:
            risk += 20
        elif self.estimated_initial_investment > 100000:
            risk += 10

        return max(0, min(100, risk))

    def _assess_financial_risk(self) -> int:
        """Avalia risco financeiro"""
        return 100 - self.financial_feasibility

    def _get_risk_level(self, risk_score: float) -> str:
        """Converte score de risco em nível"""
        if risk_score >= 80:
            return 'very_high'
        elif risk_score >= 60:
            return 'high'
        elif risk_score >= 40:
            return 'medium'
        elif risk_score >= 20:
            return 'low'
        else:
            return 'very_low'

    def get_recommendation(self) -> Dict[str, Any]:
        """Gera recomendação para a oportunidade"""
        overall_score = self.calculate_overall_score()
        roi_potential = self.calculate_roi_potential()
        risk_assessment = self.get_risk_assessment()

        # Decision matrix
        if overall_score >= 80 and risk_assessment['overall_risk_score'] <= 30:
            decision = 'APPROVE'
            confidence = 'high'
        elif overall_score >= 70 and risk_assessment['overall_risk_score'] <= 50:
            decision = 'APPROVE_WITH_MONITORING'
            confidence = 'medium'
        elif overall_score >= 60:
            decision = 'FURTHER_ANALYSIS'
            confidence = 'medium'
        else:
            decision = 'REJECT'
            confidence = 'high'

        return {
            'decision': decision,
            'confidence_level': confidence,
            'overall_score': overall_score,
            'roi_potential_percent': roi_potential,
            'risk_assessment': risk_assessment,
            'next_steps': self._get_next_steps(decision)
        }

    def _get_next_steps(self, decision: str) -> List[str]:
        """Define próximos passos baseado na decisão"""
        steps_map = {
            'APPROVE': [
                'Criar blueprint detalhado da subsidiária',
                'Alocar recursos iniciais',
                'Definir equipe de desenvolvimento',
                'Iniciar desenvolvimento MVP'
            ],
            'APPROVE_WITH_MONITORING': [
                'Realizar due diligence adicional',
                'Desenvolver plano de contingência',
                'Definir métricas de sucesso',
                'Iniciar desenvolvimento com checkpoints regulares'
            ],
            'FURTHER_ANALYSIS': [
                'Coletar dados adicionais de mercado',
                'Realizar pesquisa com potenciais clientes',
                'Analisar concorrentes em detalhes',
                'Refinar estimativas financeiras'
            ],
            'REJECT': [
                'Documentar razões da rejeição',
                'Arquivar oportunidade para referência futura',
                'Monitorar evolução do mercado',
                'Buscar oportunidades similares'
            ]
        }

        return steps_map.get(decision, ['Reavaliar critérios de decisão'])

    def update_status(self, new_status: OpportunityStatus, updated_by: str):
        """Atualiza status da oportunidade"""
        self.status = new_status

        if new_status == OpportunityStatus.ANALYZED:
            self.analyzed_at = datetime.utcnow()
        elif new_status == OpportunityStatus.VALIDATED:
            self.validated_at = datetime.utcnow()

    def add_tag(self, tag: str):
        """Adiciona tag à oportunidade"""
        if tag not in self.tags:
            self.tags.append(tag)

    def remove_tag(self, tag: str):
        """Remove tag da oportunidade"""
        if tag in self.tags:
            self.tags.remove(tag)

    class Config:
        """Configuração Pydantic"""
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }


class MarketOpportunityValidator:
    """Validador para oportunidades de mercado"""

    @staticmethod
    def validate_opportunity_data(data: Dict[str, Any]) -> MarketOpportunity:
        """Valida dados de uma oportunidade de mercado"""
        try:
            return MarketOpportunity(**data)
        except Exception as e:
            raise ValueError(f"Dados de oportunidade inválidos: {str(e)}")

    @staticmethod
    def get_opportunity_template() -> Dict[str, Any]:
        """Retorna template para criação de nova oportunidade"""
        return {
            "id": "",  # Deve ser gerado
            "title": "",
            "description": "",
            "source": OpportunitySource.MARKET_RESEARCH.value,
            "tam": 0,
            "sam": 0,
            "som": 0,
            "growth_rate": 0,
            "competition_level": "medium",
            "market_maturity": "growing",
            "technical_feasibility": 50,
            "business_feasibility": 50,
            "financial_feasibility": 50,
            "target_business_type": "",
            "target_revenue_model": "",
            "estimated_initial_investment": 0,
            "estimated_time_to_market": 6,
            "estimated_first_year_revenue": 0,
            "created_by": "",
            "tags": []
        }