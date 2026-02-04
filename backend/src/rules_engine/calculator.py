"""
Rules Engine - Dutch Pension, Tax & Benefits Calculations
Implements transparent, traceable rule evaluation
"""

from typing import Dict, List, Any, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class RuleResult:
    """Result of rule evaluation with full traceability"""
    rule_id: str
    rule_name: str
    value: Decimal
    formula_used: str
    legal_reference: str
    inputs_used: Dict[str, Any]
    dependencies: List[str] = field(default_factory=list)
    explanation: str = ""

class RulesEngine:
    """Central rules evaluation engine"""
    
    def __init__(self):
        self.rules: Dict[str, Dict] = {}
        self.evaluation_cache: Dict = {}
        self.trace_log: List = []
        
    def register_rule(self, rule_id: str, rule_definition: Dict) -> None:
        """Register a new rule"""
        self.rules[rule_id] = rule_definition
    
    def evaluate(self, rule_id: str, context: Dict[str, Any]) -> RuleResult:
        """Evaluate a single rule with full trace"""
        if rule_id not in self.rules:
            raise ValueError(f"Rule {rule_id} not found")
        
        rule = self.rules[rule_id]
        
        # Check dependencies
        dependencies = rule.get("dependencies", [])
        for dep in dependencies:
            if dep not in context:
                context[dep] = self.evaluate(dep, context)
        
        # Evaluate rule
        result = rule["calculate"](context)
        
        trace_entry = {
            "timestamp": datetime.now().isoformat(),
            "rule_id": rule_id,
            "context": context,
            "result": result
        }
        self.trace_log.append(trace_entry)
        
        return result
    
    def evaluate_all(self, context: Dict[str, Any]) -> Dict[str, RuleResult]:
        """Evaluate all applicable rules"""
        results = {}
        for rule_id in self.rules.keys():
            try:
                results[rule_id] = self.evaluate(rule_id, context)
            except Exception as e:
                results[rule_id] = None
        return results


# ============ TAX CALCULATIONS (2025) ============

TAX_BRACKETS_2025 = [
    {"min": Decimal(0), "max": Decimal(36950), "rate": Decimal("0.1155")},
    {"min": Decimal(36950), "max": Decimal(71900), "rate": Decimal("0.2385")},
    {"min": Decimal(71900), "max": Decimal(96750), "rate": Decimal("0.405")},
    {"min": Decimal(96750), "max": None, "rate": Decimal("0.495")},
]

GENERAL_TAX_ALLOWANCE = Decimal("3107")  # 2025
LABOUR_TAX_ALLOWANCE = Decimal("1800")   # 2025
ELDERLY_TAX_ALLOWANCE = Decimal("1732")  # 2025

def calculate_income_tax_2025(gross_income: Decimal) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate Dutch income tax for 2025 with bracket details
    Returns (total_tax, bracket_details)
    
    Reference: Belastingdienst - Inkomstenbelasting 2025
    """
    # Apply tax allowances
    taxable_income = max(Decimal(0), gross_income - GENERAL_TAX_ALLOWANCE - LABOUR_TAX_ALLOWANCE)
    
    total_tax = Decimal(0)
    bracket_details = []
    
    for bracket in TAX_BRACKETS_2025:
        bracket_min = bracket["min"]
        bracket_max = bracket["max"]
        rate = bracket["rate"]
        
        if taxable_income <= bracket_min:
            break
        
        if bracket_max is None:
            taxable_in_bracket = max(Decimal(0), taxable_income - bracket_min)
        else:
            taxable_in_bracket = min(bracket_max, taxable_income) - bracket_min
        
        tax_in_bracket = (taxable_in_bracket * rate).quantize(Decimal("0.01"), ROUND_HALF_UP)
        total_tax += tax_in_bracket
        
        bracket_details.append({
            "bracket_min": float(bracket_min),
            "bracket_max": float(bracket_max) if bracket_max else None,
            "rate": float(rate),
            "taxable_amount": float(taxable_in_bracket),
            "tax": float(tax_in_bracket)
        })
    
    return total_tax, bracket_details


# ============ PENSION CALCULATIONS ============

AOW_PREMIUM_RATE = Decimal("0.1955")  # 2025
WW_PREMIUM_RATE = Decimal("0.022")   # 2025
EMPLOYEE_INSURANCE_RATE = Decimal("0.0") # Paid by employer in NL

def calculate_pension_contribution(gross_income: Decimal, contribution_percentage: float) -> Decimal:
    """
    Calculate pension contribution amount
    
    Reference: Pensioenwet, Pensioenverordeningenwijziging
    """
    return (gross_income * Decimal(str(contribution_percentage)) / Decimal(100)).quantize(
        Decimal("0.01"), ROUND_HALF_UP
    )

def calculate_aow_premium(gross_income: Decimal) -> Decimal:
    """
    Calculate AOW (state pension) premium
    
    Reference: Algemene Ouderdomswet (AOW)
    """
    return (gross_income * AOW_PREMIUM_RATE).quantize(Decimal("0.01"), ROUND_HALF_UP)

def calculate_ww_premium(gross_income: Decimal) -> Decimal:
    """
    Calculate WW (unemployment) premium
    
    Reference: Werkloosheidswet (WW)
    """
    return (gross_income * WW_PREMIUM_RATE).quantize(Decimal("0.01"), ROUND_HALF_UP)


# ============ BENEFITS CALCULATIONS ============

def calculate_huurtoeslag(
    gross_income: Decimal,
    household_members: int,
    housing_costs: Decimal
) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate housing allowance (Huurtoeslag) 2025
    
    Reference: Wet op de huurtoeslag 2014
    https://www.toeslagen.nl/huurtoeslag
    
    Returns: (allowance_amount, calculation_steps)
    """
    steps = []
    
    # Income threshold for housing allowance eligibility
    income_thresholds_single = Decimal("25000")
    income_thresholds_couple = Decimal("35000")
    
    threshold = income_thresholds_couple if household_members >= 2 else income_thresholds_single
    
    if gross_income > threshold:
        return Decimal(0), [{"type": "rejected", "reason": "income_exceeds_threshold"}]
    
    # Housing costs limits (2025)
    max_housing_costs_single = Decimal("500")
    max_housing_costs_couple = Decimal("600")
    
    max_costs = max_housing_costs_couple if household_members >= 2 else max_housing_costs_single
    
    if housing_costs > max_costs * 12:  # Annual
        eligible_costs = max_costs * 12
    else:
        eligible_costs = housing_costs
    
    # Calculation: percentage of costs based on income
    # Simplified model - actual calculation is more complex
    income_factor = (threshold - gross_income) / threshold
    allowance = (eligible_costs * income_factor * Decimal("0.65")).quantize(
        Decimal("0.01"), ROUND_HALF_UP
    )
    
    steps.append({
        "type": "eligible",
        "household_members": household_members,
        "income_threshold": float(threshold),
        "eligible_housing_costs": float(eligible_costs),
        "income_factor": float(income_factor),
        "calculated_allowance": float(allowance)
    })
    
    return allowance, steps


def calculate_zorgtoeslag(
    gross_income: Decimal,
    household_members: int,
    is_partner: bool = False
) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate healthcare subsidy (Zorgtoeslag) 2025
    
    Reference: Zorgverzekeringswet
    https://www.toeslagen.nl/zorgtoeslag
    """
    steps = []
    
    # Income thresholds 2025
    thresholds = {
        "single": Decimal("23200"),
        "partner": Decimal("31400"),
        "couple": Decimal("47300")
    }
    
    threshold = thresholds["partner"] if is_partner else thresholds["single"]
    
    if gross_income > threshold:
        return Decimal(0), [{"type": "rejected", "reason": "income_exceeds_threshold"}]
    
    # Subsidy calculation (simplified)
    # Actual: complex tables based on age, income, family composition
    base_subsidy = Decimal("2200") if not is_partner else Decimal("1100")
    
    # Reduce by 16% of income above minimum
    excess_income = max(Decimal(0), gross_income - Decimal("15000"))
    reduction = (excess_income * Decimal("0.16")).quantize(Decimal("0.01"), ROUND_HALF_UP)
    
    subsidy = max(Decimal(0), base_subsidy - reduction)
    
    steps.append({
        "type": "calculated",
        "threshold": float(threshold),
        "base_subsidy": float(base_subsidy),
        "excess_income": float(excess_income),
        "reduction": float(reduction),
        "final_subsidy": float(subsidy)
    })
    
    return subsidy, steps


def calculate_kindgebonden_budget(
    children_count: int,
    gross_income: Decimal
) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate child benefits (Kindgebonden budget) 2025
    
    Reference: Wet op het kindgebonden budget
    """
    steps = []
    
    if children_count == 0:
        return Decimal(0), steps
    
    # Income threshold
    income_threshold = Decimal("115000")
    
    if gross_income > income_threshold:
        return Decimal(0), [{"type": "rejected", "reason": "income_exceeds_threshold"}]
    
    # Budget per child per year (2025)
    budget_per_child = Decimal("220")
    total_budget = Decimal(children_count) * budget_per_child
    
    # Additional benefit for lower incomes
    if gross_income < Decimal("50000"):
        supplementary = total_budget * Decimal("0.2")
        total_budget += supplementary
    
    monthly_benefit = (total_budget / Decimal(12)).quantize(Decimal("0.01"), ROUND_HALF_UP)
    
    steps.append({
        "type": "calculated",
        "children_count": children_count,
        "budget_per_child": float(budget_per_child),
        "base_total": float(children_count * budget_per_child),
        "monthly_benefit": float(monthly_benefit)
    })
    
    return monthly_benefit, steps


# ============ LUMP SUM RECOMMENDATION ENGINE ============

def _get_lump_sum_recommendation(lump_sum_pct: float, income_tax: Decimal, taxable_income: Decimal) -> str:
    """
    Provide recommendation on whether lump sum withdrawal is advisable
    """
    if lump_sum_pct == 0:
        return "No lump sum withdrawal selected"
    
    # Tax impact analysis
    if income_tax > 0:
        effective_rate = (income_tax / taxable_income * 100) if taxable_income > 0 else 0
        if effective_rate > 35:
            return "⚠️ HIGH TAX IMPACT: Effective tax rate exceeds 35%. Consider if the lump sum is necessary."
        elif effective_rate > 25:
            return "📊 MODERATE TAX IMPACT: This will increase your taxes significantly. Evaluate if benefits outweigh costs."
        else:
            return "✅ LOWER TAX IMPACT: Manageable tax burden for this withdrawal amount."
    
    return "Consider comparing scenarios to see the full impact"


# ============ NET INCOME CALCULATION ============

def calculate_net_income(
    gross_income: Decimal,
    pension_contribution_pct: float,
    housing_costs: Decimal,
    household_members: int,
    children_count: int,
    is_partner: bool = False,
    lump_sum_percentage: float = 0
) -> Dict[str, Any]:
    """
    Complete net income calculation with all deductions and benefits
    Includes lump sum withdrawal at retirement (taxable event)
    """
    
    # Calculate lump sum amount (if applicable)
    annual_pension = gross_income * Decimal(str(pension_contribution_pct)) / Decimal(100)
    lump_sum_amount = annual_pension * Decimal(str(lump_sum_percentage)) / Decimal(10)  # Divided by 10 since max is 10%
    
    # Tax calculation - lump sum is added to taxable income in withdrawal year
    taxable_income = gross_income - calculate_pension_contribution(gross_income, pension_contribution_pct) + lump_sum_amount
    income_tax, tax_brackets = calculate_income_tax_2025(taxable_income)
    
    # Pension contribution
    pension_amount = calculate_pension_contribution(gross_income, pension_contribution_pct)
    
    # Social security
    aow_premium = calculate_aow_premium(taxable_income)
    ww_premium = calculate_ww_premium(taxable_income)
    
    # Benefits
    huurtoeslag, huurtoeslag_steps = calculate_huurtoeslag(
        taxable_income, household_members, housing_costs * 12
    )
    zorgtoeslag, zorgtoeslag_steps = calculate_zorgtoeslag(
        taxable_income, household_members, is_partner
    )
    kindgebonden_budget, kindgebonden_steps = calculate_kindgebonden_budget(
        children_count, taxable_income
    )
    
    # Final calculation
    gross_after_pension = gross_income - pension_amount
    after_tax = gross_after_pension - income_tax
    after_social = after_tax - aow_premium - ww_premium
    
    total_benefits = huurtoeslag + zorgtoeslag + kindgebonden_budget
    net_income = after_social + total_benefits
    
    return {
        "gross_income": float(gross_income),
        "lump_sum_percentage": lump_sum_percentage,
        "lump_sum_amount": float(lump_sum_amount),
        "pension_contribution_pct": pension_contribution_pct,
        "pension_amount": float(pension_amount),
        "taxable_income_before_lump_sum": float(gross_income - pension_amount),
        "taxable_income_with_lump_sum": float(taxable_income),
        "income_tax": float(income_tax),
        "tax_brackets": tax_brackets,
        "aow_premium": float(aow_premium),
        "ww_premium": float(ww_premium),
        "total_deductions": float(pension_amount + income_tax + aow_premium + ww_premium),
        "huurtoeslag": float(huurtoeslag),
        "zorgtoeslag": float(zorgtoeslag),
        "kindgebonden_budget": float(kindgebonden_budget),
        "total_benefits": float(total_benefits),
        "net_income": float(net_income),
        "effective_tax_rate": float((income_tax / taxable_income * 100)) if taxable_income > 0 else 0.0,
        "lump_sum_impact": {
            "tax_increase": float(income_tax - calculate_income_tax_2025(gross_income - calculate_pension_contribution(gross_income, pension_contribution_pct))[0]),
            "benefit_impact": "May reduce housing allowance and healthcare allowance due to higher income",
            "recommendation": _get_lump_sum_recommendation(lump_sum_percentage, income_tax, taxable_income)
        },
        "breakdown": {
            "gross_income": float(gross_income),
            "lump_sum_addition": float(lump_sum_amount),
            "minus_pension": float(pension_amount),
            "minus_tax": float(income_tax),
            "minus_aow": float(aow_premium),
            "minus_ww": float(ww_premium),
            "plus_benefits": float(total_benefits),
            "equals_net": float(net_income)
        }
    }
