"""API endpoints for rules and rule traceability"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from decimal import Decimal

from ..rules_engine.calculator import (
    TAX_BRACKETS_2025, GENERAL_TAX_ALLOWANCE, LABOUR_TAX_ALLOWANCE,
    calculate_income_tax_2025, calculate_aow_premium, calculate_ww_premium,
    calculate_huurtoeslag, calculate_zorgtoeslag, calculate_kindgebonden_budget
)

router = APIRouter()

RULES_CATALOG = {
    "income_tax": {
        "id": "income_tax",
        "name": "Dutch Income Tax (Inkomstenbelasting)",
        "legal_reference": "Wet inkomstenbelasting 2001",
        "category": "tax",
        "year": 2025,
        "description": "Progressive income tax on taxable earnings",
        "url": "https://www.belastingdienst.nl",
        "brackets": [
            {"min": 0, "max": 36950, "rate": 0.1155},
            {"min": 36950, "max": 71900, "rate": 0.2385},
            {"min": 71900, "max": 96750, "rate": 0.405},
            {"min": 96750, "max": None, "rate": 0.495}
        ],
        "allowances": {
            "general_allowance": float(GENERAL_TAX_ALLOWANCE),
            "labour_allowance": float(LABOUR_TAX_ALLOWANCE)
        }
    },
    "aow_premium": {
        "id": "aow_premium",
        "name": "AOW Premium (State Pension)",
        "legal_reference": "Algemene Ouderdomswet",
        "category": "social_security",
        "year": 2025,
        "description": "Mandatory contribution for state pension",
        "rate": 0.1955
    },
    "ww_premium": {
        "id": "ww_premium",
        "name": "WW Premium (Unemployment)",
        "legal_reference": "Werkloosheidswet",
        "category": "social_security",
        "year": 2025,
        "description": "Unemployment insurance contribution",
        "rate": 0.022
    },
    "huurtoeslag": {
        "id": "huurtoeslag",
        "name": "Housing Allowance (Huurtoeslag)",
        "legal_reference": "Wet op de huurtoeslag 2014",
        "category": "benefits",
        "year": 2025,
        "description": "Means-tested housing assistance for renters",
        "url": "https://www.toeslagen.nl/huurtoeslag",
        "income_thresholds": {
            "single": 25000,
            "couple": 35000
        },
        "max_costs": {
            "single": 500,
            "couple": 600
        }
    },
    "zorgtoeslag": {
        "id": "zorgtoeslag",
        "name": "Healthcare Subsidy (Zorgtoeslag)",
        "legal_reference": "Zorgverzekeringswet",
        "category": "benefits",
        "year": 2025,
        "description": "Healthcare cost assistance for lower incomes",
        "url": "https://www.toeslagen.nl/zorgtoeslag",
        "income_thresholds": {
            "single": 23200,
            "partner": 31400,
            "couple": 47300
        }
    },
    "kindgebonden_budget": {
        "id": "kindgebonden_budget",
        "name": "Child Benefits (Kindgebonden Budget)",
        "legal_reference": "Wet op het kindgebonden budget",
        "category": "benefits",
        "year": 2025,
        "description": "Monthly allowance per dependent child",
        "url": "https://www.toeslagen.nl/kindgebonden-budget",
        "income_threshold": 115000,
        "budget_per_child": 220
    }
}

RULE_DEPENDENCIES = {
    "income_tax": [],
    "aow_premium": ["income_tax"],
    "ww_premium": ["income_tax"],
    "huurtoeslag": ["income_tax", "aow_premium", "ww_premium"],
    "zorgtoeslag": ["income_tax"],
    "kindgebonden_budget": ["income_tax"]
}

@router.get("/")
async def list_rules() -> Dict[str, Any]:
    """List all available rules"""
    return {
        "total_rules": len(RULES_CATALOG),
        "year": 2025,
        "rules": list(RULES_CATALOG.values())
    }

@router.get("/{rule_id}")
async def get_rule(rule_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific rule"""
    if rule_id not in RULES_CATALOG:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")
    
    rule = RULES_CATALOG[rule_id]
    dependencies = RULE_DEPENDENCIES.get(rule_id, [])
    
    return {
        **rule,
        "dependencies": [
            RULES_CATALOG[dep_id] for dep_id in dependencies
        ]
    }

@router.get("/trace/{rule_id}")
async def trace_rule_calculation(rule_id: str, gross_income: float) -> Dict[str, Any]:
    """
    Trace how a specific rule is calculated for given income
    Shows all intermediate steps and dependencies
    """
    if rule_id not in RULES_CATALOG:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")
    
    income = Decimal(str(gross_income))
    
    trace = {
        "rule_id": rule_id,
        "rule": RULES_CATALOG[rule_id],
        "input": {
            "gross_income": float(income)
        },
        "steps": [],
        "result": None
    }
    
    # Calculate based on rule type
    if rule_id == "income_tax":
        result, brackets = calculate_income_tax_2025(income)
        trace["steps"] = [
            {"step": "Apply tax allowances", "amount": float(GENERAL_TAX_ALLOWANCE + LABOUR_TAX_ALLOWANCE)},
            {"step": "Calculate taxable income", "amount": float(income - GENERAL_TAX_ALLOWANCE - LABOUR_TAX_ALLOWANCE)},
            {"step": "Apply tax brackets", "brackets": brackets}
        ]
        trace["result"] = float(result)
        
    elif rule_id == "aow_premium":
        result = calculate_aow_premium(income)
        trace["steps"] = [
            {"step": "Apply AOW rate", "rate": 0.1955, "calculation": f"{float(income)} × 0.1955"}
        ]
        trace["result"] = float(result)
        
    elif rule_id == "ww_premium":
        result = calculate_ww_premium(income)
        trace["steps"] = [
            {"step": "Apply WW rate", "rate": 0.022, "calculation": f"{float(income)} × 0.022"}
        ]
        trace["result"] = float(result)
    
    return trace

@router.get("/dependencies/{rule_id}")
async def get_rule_dependencies(rule_id: str) -> Dict[str, Any]:
    """
    Get the dependency graph for a rule
    Shows which other rules must be calculated first
    """
    if rule_id not in RULES_CATALOG:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")
    
    def build_dependency_tree(rid: str, visited=None) -> Dict:
        if visited is None:
            visited = set()
        if rid in visited:
            return {"rule_id": rid, "circular": True}
        
        visited.add(rid)
        deps = RULE_DEPENDENCIES.get(rid, [])
        
        return {
            "rule_id": rid,
            "rule_name": RULES_CATALOG[rid].get("name", rid),
            "depends_on": [build_dependency_tree(dep_id, visited.copy()) for dep_id in deps]
        }
    
    return build_dependency_tree(rule_id)

@router.get("/impact-analysis")
async def analyze_rule_impacts(gross_income: float, pension_pct: float) -> Dict[str, Any]:
    """
    Analyze the combined impact of all rules on income
    Shows how income flows through each rule
    """
    income = Decimal(str(gross_income))
    pension_contribution = income * Decimal(str(pension_pct)) / Decimal(100)
    taxable_income = income - pension_contribution
    
    impacts = {
        "gross_income": float(income),
        "pension_contribution": float(pension_contribution),
        "impacts_by_rule": {}
    }
    
    # Calculate each rule
    income_tax, _ = calculate_income_tax_2025(taxable_income)
    aow = calculate_aow_premium(taxable_income)
    ww = calculate_ww_premium(taxable_income)
    
    impacts["impacts_by_rule"] = {
        "income_tax": {
            "rule": RULES_CATALOG["income_tax"],
            "impact": float(income_tax),
            "type": "deduction"
        },
        "aow_premium": {
            "rule": RULES_CATALOG["aow_premium"],
            "impact": float(aow),
            "type": "deduction"
        },
        "ww_premium": {
            "rule": RULES_CATALOG["ww_premium"],
            "impact": float(ww),
            "type": "deduction"
        }
    }
    
    total_deductions = income_tax + aow + ww
    impacts["total_deductions"] = float(total_deductions)
    impacts["after_deductions"] = float(income - pension_contribution - total_deductions)
    
    return impacts
