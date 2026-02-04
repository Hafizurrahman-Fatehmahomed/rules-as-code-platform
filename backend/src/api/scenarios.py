"""API endpoints for scenarios management"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from decimal import Decimal
import uuid
from datetime import datetime

from ..models.schemas import (
    ScenarioRequest, ScenarioResponse, ComparisonRequest, ComparisonResponse,
    ScenarioDelta, ScenarioInsight
)
from ..rules_engine.calculator import calculate_net_income

router = APIRouter()

# In-memory storage (would use database in production)
scenarios_db = {}

@router.post("/", response_model=ScenarioResponse)
async def create_scenario(request: ScenarioRequest) -> ScenarioResponse:
    """Create a new scenario with calculations"""
    scenario_id = str(uuid.uuid4())
    
    try:
        # Calculate net income and all impacts
        calculations = calculate_net_income(
            gross_income=request.base_income,
            pension_contribution_pct=request.pension_contribution_percentage,
            housing_costs=request.housing_costs,
            household_members=1,  # From marital_status
            children_count=request.children_count,
            is_partner=request.marital_status != "single"
        )
        
        scenario = {
            "id": scenario_id,
            "name": request.name,
            "created_at": datetime.now(),
            "parameters": request.dict(),
            "calculations": calculations,
            "summary": {
                "gross_income": request.base_income,
                "pension_contribution": Decimal(str(calculations["pension_amount"])),
                "income_tax": Decimal(str(calculations["income_tax"])),
                "total_benefits": Decimal(str(calculations["total_benefits"])),
                "net_income": Decimal(str(calculations["net_income"]))
            }
        }
        
        scenarios_db[scenario_id] = scenario
        return ScenarioResponse(**scenario)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(scenario_id: str) -> ScenarioResponse:
    """Retrieve a saved scenario"""
    if scenario_id not in scenarios_db:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    scenario = scenarios_db[scenario_id]
    return ScenarioResponse(**scenario)

@router.get("/", response_model=List[ScenarioResponse])
async def list_scenarios(user_id: Optional[str] = Query(None)) -> List[ScenarioResponse]:
    """List all scenarios, optionally filtered by user"""
    result = []
    for scenario in scenarios_db.values():
        if user_id is None or scenario["parameters"].get("user_id") == user_id:
            result.append(ScenarioResponse(**scenario))
    return result

@router.post("/compare", response_model=ComparisonResponse)
async def compare_scenarios(request: ComparisonRequest) -> ComparisonResponse:
    """Compare multiple scenarios side-by-side"""
    
    # Create scenarios
    created_scenarios = []
    for scenario_req in request.scenarios:
        try:
            calculations = calculate_net_income(
                gross_income=scenario_req.base_income,
                pension_contribution_pct=scenario_req.pension_contribution_percentage,
                housing_costs=scenario_req.housing_costs,
                household_members=1,
                children_count=scenario_req.children_count,
                is_partner=scenario_req.marital_status != "single"
            )
            
            scenario = {
                "id": str(uuid.uuid4()),
                "name": scenario_req.name,
                "created_at": datetime.now(),
                "parameters": scenario_req.dict(),
                "calculations": calculations,
                "summary": {
                    "gross_income": scenario_req.base_income,
                    "pension_contribution": Decimal(str(calculations["pension_amount"])),
                    "income_tax": Decimal(str(calculations["income_tax"])),
                    "total_benefits": Decimal(str(calculations["total_benefits"])),
                    "net_income": Decimal(str(calculations["net_income"]))
                }
            }
            created_scenarios.append(ScenarioResponse(**scenario))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error creating scenario: {str(e)}")
    
    # Build comparison matrix
    comparison_matrix = {}
    for field in request.compare_fields:
        comparison_matrix[field] = [
            {
                "scenario_name": s.name,
                "value": float(getattr(s.summary, field, s.calculations.get(field, 0))),
                "scenario_id": s.id
            }
            for s in created_scenarios
        ]
    
    # Generate insights
    insights = generate_comparison_insights(created_scenarios)
    
    return ComparisonResponse(
        scenarios=created_scenarios,
        comparison_matrix=comparison_matrix,
        insights=insights
    )

def generate_comparison_insights(scenarios: List[ScenarioResponse]) -> List[str]:
    """Generate actionable insights from scenario comparison"""
    insights = []
    
    if len(scenarios) < 2:
        return insights
    
    # Find best net income scenario
    best_scenario = max(scenarios, key=lambda s: s.summary["net_income"])
    insights.append(f"💰 Best net income: {best_scenario.name} (€{s.summary['net_income']:.2f})")
    
    # Find scenario with lowest tax burden
    lowest_tax = min(scenarios, key=lambda s: s.calculations["income_tax"])
    insights.append(f"🏛️ Lowest tax: {lowest_tax.name} (€{lowest_tax.calculations['income_tax']:.2f})")
    
    # Analyze threshold crossings
    for scenario in scenarios:
        if scenario.calculations.get("huurtoeslag", 0) == 0:
            if scenario.summary["gross_income"] > 25000:
                insights.append(
                    f"⚠️ {scenario.name}: Income exceeds housing allowance threshold "
                    f"(€{scenario.summary['gross_income']:.2f} vs €25,000)"
                )
    
    # Calculate marginal tax effect
    if len(scenarios) >= 2:
        scenarios_sorted = sorted(scenarios, key=lambda s: s.summary["gross_income"])
        for i in range(len(scenarios_sorted) - 1):
            current = scenarios_sorted[i]
            next_scenario = scenarios_sorted[i + 1]
            
            income_diff = next_scenario.summary["gross_income"] - current.summary["gross_income"]
            net_diff = next_scenario.summary["net_income"] - current.summary["net_income"]
            
            if income_diff > 0:
                marginal_rate = 1 - (net_diff / income_diff)
                if marginal_rate > 0.4:
                    insights.append(
                        f"⚡ High marginal impact between {current.name} and {next_scenario.name}: "
                        f"{marginal_rate*100:.1f}% (due to benefit thresholds)"
                    )
    
    return insights

@router.delete("/{scenario_id}")
async def delete_scenario(scenario_id: str):
    """Delete a scenario"""
    if scenario_id not in scenarios_db:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    del scenarios_db[scenario_id]
    return {"status": "deleted", "scenario_id": scenario_id}
