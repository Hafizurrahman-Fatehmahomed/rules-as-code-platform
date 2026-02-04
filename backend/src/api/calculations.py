"""API endpoints for detailed calculations and traceability"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from decimal import Decimal

from ..rules_engine.calculator import (
    calculate_net_income, calculate_income_tax_2025,
    calculate_huurtoeslag, calculate_zorgtoeslag,
    calculate_kindgebonden_budget, calculate_aow_premium, calculate_ww_premium
)

router = APIRouter()

@router.post("/scenario")
async def calculate_scenario(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Complete scenario calculation with full transparency
    """
    
    gross_income = Decimal(str(params.get("gross_income", 50000)))
    pension_pct = params.get("pension_contribution_percentage", 5.0)
    lump_sum_pct = params.get("lump_sum_percentage", 0)
    housing_costs = Decimal(str(params.get("housing_costs", 400)))
    children = params.get("children_count", 0)
    marital_status = params.get("marital_status", "single")
    
    try:
        result = calculate_net_income(
            gross_income=gross_income,
            pension_contribution_pct=pension_pct,
            lump_sum_percentage=lump_sum_pct,
            housing_costs=housing_costs,
            household_members=1 if marital_status == "single" else 2,
            children_count=children,
            is_partner=marital_status != "single"
        )
        
        # Add calculation trace
        result["trace"] = {
            "calculation_steps": [
                {"step": 1, "description": "Gross income", "amount": float(gross_income)},
                {"step": 2, "description": f"Minus pension contribution ({pension_pct}%)", "amount": float(gross_income) * (pension_pct/100), "rule": "Pension Scheme"},
                {"step": 3, "description": "Taxable income", "amount": float(gross_income - (gross_income * Decimal(str(pension_pct)) / Decimal(100))), "rule": "Income Tax Rule"},
                {"step": 4, "description": "Minus income tax", "amount": result["income_tax"], "rule": "Tax Brackets 2025"},
                {"step": 5, "description": "Minus social security (AOW+WW)", "amount": result["aow_premium"] + result["ww_premium"], "rule": "AOW & WW Premiums"},
                {"step": 6, "description": "Plus benefits (housing+healthcare+children)", "amount": result["total_benefits"], "rule": "Benefits Rules"},
                {"step": 7, "description": "Final net income", "amount": result["net_income"], "rule": "Net Income Calculation"}
            ]
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@router.post("/tax-analysis")
async def analyze_tax_impact(gross_income: float) -> Dict[str, Any]:
    """
    Deep dive into tax calculation with bracket details
    """
    income = Decimal(str(gross_income))
    tax, brackets = calculate_income_tax_2025(income)
    
    return {
        "gross_income": float(income),
        "tax_brackets": brackets,
        "total_tax": float(tax),
        "effective_tax_rate": float(tax / income * 100) if income > 0 else 0,
        "marginal_tax_rate": float(brackets[-1]["rate"] * 100) if brackets else 0,
        "explanation": {
            "general_allowance": 3107,
            "labour_allowance": 1800,
            "total_allowances": 4907,
            "note": "These allowances reduce your taxable income before brackets are applied"
        }
    }

@router.post("/benefits-analysis")
async def analyze_benefits_impact(
    gross_income: float,
    household_members: int = 1,
    housing_costs: float = 400,
    children: int = 0,
    is_partner: bool = False
) -> Dict[str, Any]:
    """
    Analyze eligibility and amounts for all benefits
    """
    income = Decimal(str(gross_income))
    housing_annual = Decimal(str(housing_costs * 12))
    
    # Calculate each benefit
    huurtoeslag, huurtoeslag_trace = calculate_huurtoeslag(income, household_members, housing_annual)
    zorgtoeslag, zorgtoeslag_trace = calculate_zorgtoeslag(income, household_members, is_partner)
    kindgebonden, kindgebonden_trace = calculate_kindgebonden_budget(children, income)
    
    return {
        "income": float(income),
        "benefits": {
            "huurtoeslag": {
                "amount": float(huurtoeslag),
                "annual": float(huurtoeslag * 12),
                "trace": huurtoeslag_trace,
                "legal_reference": "Wet op de huurtoeslag 2014",
                "url": "https://www.toeslagen.nl/huurtoeslag"
            },
            "zorgtoeslag": {
                "amount": float(zorgtoeslag),
                "annual": float(zorgtoeslag * 12),
                "trace": zorgtoeslag_trace,
                "legal_reference": "Zorgverzekeringswet",
                "url": "https://www.toeslagen.nl/zorgtoeslag"
            },
            "kindgebonden_budget": {
                "amount": float(kindgebonden),
                "annual": float(kindgebonden * 12),
                "trace": kindgebonden_trace,
                "legal_reference": "Wet op het kindgebonden budget",
                "url": "https://www.toeslagen.nl/kindgebonden-budget"
            }
        },
        "total_monthly_benefits": float(huurtoeslag + zorgtoeslag + kindgebonden),
        "total_annual_benefits": float((huurtoeslag + zorgtoeslag) * 12 + kindgebonden * 12)
    }

@router.post("/threshold-analysis")
async def analyze_thresholds(gross_income: float) -> Dict[str, Any]:
    """
    Identify income thresholds and cliff effects
    Shows what happens at key threshold levels
    """
    income = Decimal(str(gross_income))
    
    thresholds = {
        "housing_allowance_single": Decimal("25000"),
        "housing_allowance_couple": Decimal("35000"),
        "healthcare_subsidy_single": Decimal("23200"),
        "healthcare_subsidy_couple": Decimal("47300"),
        "child_benefits": Decimal("115000")
    }
    
    analysis = {
        "current_income": float(income),
        "thresholds": {}
    }
    
    for threshold_name, threshold_value in thresholds.items():
        distance = threshold_value - income
        percentage_to_threshold = (distance / threshold_value * 100) if threshold_value > 0 else 0
        
        analysis["thresholds"][threshold_name] = {
            "threshold": float(threshold_value),
            "current_income": float(income),
            "distance": float(distance),
            "percentage_to_threshold": float(percentage_to_threshold),
            "status": "BELOW" if income < threshold_value else "ABOVE",
            "crossing": "Approaching" if 0 < distance < threshold_value * Decimal("0.1") else ""
        }
    
    return analysis

@router.post("/scenario-delta")
async def calculate_scenario_delta(
    base_params: Dict[str, Any],
    modified_params: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate the delta between two scenarios
    Shows exactly what changed and why
    """
    
    # Calculate both scenarios
    base_result = calculate_net_income(
        gross_income=Decimal(str(base_params.get("gross_income", 50000))),
        pension_contribution_pct=base_params.get("pension_contribution_percentage", 0),
        housing_costs=Decimal(str(base_params.get("housing_costs", 400))),
        household_members=1,
        children_count=base_params.get("children_count", 0),
        is_partner=False
    )
    
    modified_result = calculate_net_income(
        gross_income=Decimal(str(modified_params.get("gross_income", 50000))),
        pension_contribution_pct=modified_params.get("pension_contribution_percentage", 0),
        housing_costs=Decimal(str(modified_params.get("housing_costs", 400))),
        household_members=1,
        children_count=modified_params.get("children_count", 0),
        is_partner=False
    )
    
    # Calculate deltas
    deltas = {}
    for field in ["gross_income", "pension_amount", "income_tax", "total_benefits", "net_income"]:
        base_val = base_result.get(field, 0)
        modified_val = modified_result.get(field, 0)
        delta = modified_val - base_val
        pct_delta = (delta / base_val * 100) if base_val != 0 else 0
        
        deltas[field] = {
            "base": base_val,
            "modified": modified_val,
            "delta": delta,
            "percentage_change": pct_delta,
            "direction": "increase" if delta > 0 else "decrease" if delta < 0 else "no change"
        }
    
    return {
        "base_scenario": base_result,
        "modified_scenario": modified_result,
        "deltas": deltas,
        "summary": {
            "best_income": "modified" if modified_result["net_income"] > base_result["net_income"] else "base",
            "net_income_improvement": float(modified_result["net_income"] - base_result["net_income"])
        }
    }

@router.get("/rule-catalog")
async def get_rule_catalog() -> Dict[str, Any]:
    """
    Get complete catalog of all rules with legal references
    """
    return {
        "year": 2025,
        "rules": [
            {
                "id": "income_tax",
                "name": "Dutch Income Tax",
                "legal_ref": "Wet inkomstenbelasting 2001",
                "category": "tax",
                "impact": "primary - affects all other benefits"
            },
            {
                "id": "aow_premium",
                "name": "AOW (State Pension) Premium",
                "legal_ref": "Algemene Ouderdomswet",
                "category": "social_security",
                "impact": "deduction from income"
            },
            {
                "id": "ww_premium",
                "name": "WW (Unemployment) Premium",
                "legal_ref": "Werkloosheidswet",
                "category": "social_security",
                "impact": "deduction from income"
            },
            {
                "id": "huurtoeslag",
                "name": "Housing Allowance",
                "legal_ref": "Wet op de huurtoeslag 2014",
                "category": "benefits",
                "impact": "depends on income_tax, has income threshold"
            },
            {
                "id": "zorgtoeslag",
                "name": "Healthcare Subsidy",
                "legal_ref": "Zorgverzekeringswet",
                "category": "benefits",
                "impact": "depends on income_tax, has income threshold"
            },
            {
                "id": "kindgebonden_budget",
                "name": "Child Benefits",
                "legal_ref": "Wet op het kindgebonden budget",
                "category": "benefits",
                "impact": "depends on income_tax, per child"
            }
        ]
    }
