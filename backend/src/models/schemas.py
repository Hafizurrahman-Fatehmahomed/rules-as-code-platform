from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from enum import Enum
from decimal import Decimal
from datetime import datetime

# ============ Request/Response Models ============

class ScenarioRequest(BaseModel):
    """Request to create or update a scenario"""
    name: str = Field(..., description="Scenario name")
    user_id: str = Field(..., description="User identifier")
    base_income: Decimal = Field(..., description="Gross annual income")
    pension_contribution_percentage: float = Field(0.0, description="Pension contribution %")
    housing_costs: Decimal = Field(0, description="Monthly housing costs")
    children_count: int = Field(0, description="Number of dependent children")
    marital_status: str = Field("single", description="single | married | partnership")
    parameters: Dict[str, Any] = Field(default_factory=dict)

class ScenarioResponse(BaseModel):
    """Complete scenario with all calculations"""
    id: str
    name: str
    created_at: datetime
    parameters: Dict[str, Any]
    calculations: Dict[str, Any]
    summary: Dict[str, Decimal]

class ComparisonRequest(BaseModel):
    """Request to compare multiple scenarios"""
    scenarios: List[ScenarioRequest]
    compare_fields: List[str] = Field(
        default=["net_income", "tax_burden", "benefits_total", "pension_amount"]
    )

class ComparisonResponse(BaseModel):
    """Comparison results with deltas"""
    scenarios: List[ScenarioResponse]
    comparison_matrix: Dict[str, List[Dict[str, Any]]]
    insights: List[str]

class RuleDefinition(BaseModel):
    """Definition of a single rule"""
    id: str
    name: str
    legal_reference: str
    category: str  # tax | pension | benefits | social_security
    year: int
    conditions: Dict[str, Any]
    calculation_formula: str
    dependencies: List[str] = Field(default_factory=list)
    threshold_effects: bool = False
    notes: Optional[str] = None

class CalculationStep(BaseModel):
    """Single step in calculation trace"""
    rule_id: str
    rule_name: str
    legal_reference: str
    calculation_formula: str
    inputs: Dict[str, Any]
    result: Decimal
    dependencies_used: List[str] = Field(default_factory=list)
    explanation: str

class CalculationTrace(BaseModel):
    """Complete trace of calculations for transparency"""
    field_name: str
    initial_value: Decimal
    final_value: Decimal
    steps: List[CalculationStep]
    total_impact: Decimal

class ScenarioDelta(BaseModel):
    """Difference between two scenarios"""
    field: str
    value_scenario_a: Decimal
    value_scenario_b: Decimal
    absolute_delta: Decimal
    percentage_delta: float
    caused_by_rules: List[str]

class RuleImpact(BaseModel):
    """Impact of a single rule"""
    rule_id: str
    rule_name: str
    impact_amount: Decimal
    affected_fields: List[str]
    threshold_crossed: bool = False

class ScenarioInsight(BaseModel):
    """Actionable insight for decision-making"""
    type: str  # recommendation | warning | opportunity
    title: str
    description: str
    potential_impact: Decimal
    confidence: float
    action: Optional[str] = None

class TaxBracketInfo(BaseModel):
    """Information about tax bracket"""
    bracket_min: Decimal
    bracket_max: Optional[Decimal]
    rate: float
    description: str

class BenefitThreshold(BaseModel):
    """Information about benefit threshold"""
    benefit_name: str
    threshold_amount: Decimal
    cliff_effect: bool
    impact_if_exceeded: str
