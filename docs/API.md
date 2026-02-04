# API Reference

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.pensioen-beslissingstool.nl`

## Authentication

Not required for MVP (public endpoints). Production should implement:
- JWT tokens
- Rate limiting
- API key management

## Endpoints

### Health & Status

#### GET /health
Check API health status

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

---

### Scenarios

#### POST /api/v1/scenarios
Create a new scenario with full calculations

**Request Body:**
```json
{
  "name": "My Scenario",
  "user_id": "user_123",
  "base_income": 50000,
  "pension_contribution_percentage": 5.0,
  "housing_costs": 400,
  "children_count": 0,
  "marital_status": "single",
  "parameters": {}
}
```

**Response:**
```json
{
  "id": "scenario_abc123",
  "name": "My Scenario",
  "created_at": "2024-02-04T10:30:00Z",
  "parameters": {...},
  "calculations": {
    "gross_income": 50000,
    "pension_amount": 2500,
    "income_tax": 8500,
    "huurtoeslag": 200,
    "zorgtoeslag": 150,
    "kindgebonden_budget": 0,
    "net_income": 38350
  },
  "summary": {
    "gross_income": 50000,
    "pension_contribution": 2500,
    "income_tax": 8500,
    "total_benefits": 350,
    "net_income": 38350
  }
}
```

#### GET /api/v1/scenarios
List all scenarios, optionally filtered by user

**Query Parameters:**
- `user_id` (optional): Filter by user

**Response:**
```json
[
  {
    "id": "scenario_abc123",
    "name": "My Scenario",
    ...
  }
]
```

#### GET /api/v1/scenarios/{scenario_id}
Get a specific scenario

**Response:**
```json
{
  "id": "scenario_abc123",
  "name": "My Scenario",
  ...
}
```

#### DELETE /api/v1/scenarios/{scenario_id}
Delete a scenario

**Response:**
```json
{
  "status": "deleted",
  "scenario_id": "scenario_abc123"
}
```

#### POST /api/v1/scenarios/compare
Compare multiple scenarios

**Request Body:**
```json
{
  "scenarios": [
    {
      "name": "Conservative",
      "base_income": 50000,
      "pension_contribution_percentage": 0,
      "housing_costs": 400,
      "children_count": 0,
      "marital_status": "single"
    },
    {
      "name": "Aggressive",
      "base_income": 50000,
      "pension_contribution_percentage": 15,
      "housing_costs": 400,
      "children_count": 0,
      "marital_status": "single"
    }
  ],
  "compare_fields": [
    "net_income",
    "tax_burden",
    "benefits_total"
  ]
}
```

**Response:**
```json
{
  "scenarios": [...],
  "comparison_matrix": {
    "net_income": [
      {
        "scenario_name": "Conservative",
        "value": 38500,
        "scenario_id": "..."
      },
      {
        "scenario_name": "Aggressive",
        "value": 36200,
        "scenario_id": "..."
      }
    ]
  },
  "insights": [
    "💰 Best net income: Conservative (€38,500)",
    "🏛️ Lowest tax: Conservative (€8,000)",
    ...
  ]
}
```

---

### Rules

#### GET /api/v1/rules
List all available rules

**Response:**
```json
{
  "total_rules": 6,
  "year": 2025,
  "rules": [
    {
      "id": "income_tax",
      "name": "Dutch Income Tax (Inkomstenbelasting)",
      "legal_reference": "Wet inkomstenbelasting 2001",
      "category": "tax",
      "year": 2025,
      "description": "Progressive income tax on taxable earnings",
      "brackets": [
        {
          "min": 0,
          "max": 36950,
          "rate": 0.1155
        },
        ...
      ]
    },
    ...
  ]
}
```

#### GET /api/v1/rules/{rule_id}
Get detailed information about a specific rule

**Response:**
```json
{
  "id": "income_tax",
  "name": "Dutch Income Tax (Inkomstenbelasting)",
  "legal_reference": "Wet inkomstenbelasting 2001",
  "category": "tax",
  "year": 2025,
  "description": "Progressive income tax on taxable earnings",
  "url": "https://www.belastingdienst.nl",
  "brackets": [...],
  "allowances": {
    "general_allowance": 3107,
    "labour_allowance": 1800
  },
  "dependencies": []
}
```

#### GET /api/v1/rules/trace/{rule_id}
Trace how a specific rule is calculated for given income

**Query Parameters:**
- `gross_income` (required): Income to calculate for

**Response:**
```json
{
  "rule_id": "income_tax",
  "rule": {...},
  "input": {
    "gross_income": 50000
  },
  "steps": [
    {
      "step": "Apply tax allowances",
      "amount": 4907
    },
    {
      "step": "Calculate taxable income",
      "amount": 45093
    },
    {
      "step": "Apply tax brackets",
      "brackets": [...]
    }
  ],
  "result": 8500
}
```

#### GET /api/v1/rules/dependencies/{rule_id}
Get the dependency graph for a rule

**Response:**
```json
{
  "rule_id": "huurtoeslag",
  "rule_name": "Housing Allowance (Huurtoeslag)",
  "depends_on": [
    {
      "rule_id": "income_tax",
      "rule_name": "Dutch Income Tax (Inkomstenbelasting)",
      "depends_on": []
    },
    {
      "rule_id": "aow_premium",
      "rule_name": "AOW Premium (State Pension)",
      "depends_on": []
    }
  ]
}
```

#### GET /api/v1/rules/impact-analysis
Analyze the combined impact of all rules on income

**Query Parameters:**
- `gross_income` (required): Gross income
- `pension_pct` (required): Pension contribution percentage

**Response:**
```json
{
  "gross_income": 50000,
  "pension_contribution": 2500,
  "impacts_by_rule": {
    "income_tax": {
      "rule": {...},
      "impact": 8500,
      "type": "deduction"
    },
    "aow_premium": {
      "rule": {...},
      "impact": 9775,
      "type": "deduction"
    },
    "ww_premium": {
      "rule": {...},
      "impact": 1100,
      "type": "deduction"
    }
  },
  "total_deductions": 19375,
  "after_deductions": 28625
}
```

---

### Calculations

#### POST /api/v1/calculations/scenario
Complete scenario calculation with full transparency

**Request Body:**
```json
{
  "gross_income": 50000,
  "pension_contribution_percentage": 5.0,
  "housing_costs": 400,
  "children_count": 0,
  "marital_status": "single"
}
```

**Response:**
```json
{
  "gross_income": 50000,
  "pension_contribution_pct": 5.0,
  "pension_amount": 2500,
  "taxable_income": 47500,
  "income_tax": 8257,
  "tax_brackets": [...],
  "aow_premium": 9297,
  "ww_premium": 1045,
  "total_deductions": 20599,
  "huurtoeslag": 200,
  "zorgtoeslag": 150,
  "kindgebonden_budget": 0,
  "total_benefits": 350,
  "net_income": 29651,
  "effective_tax_rate": 17.38,
  "breakdown": {
    "gross_income": 50000,
    "minus_pension": 2500,
    "minus_tax": 8257,
    "minus_aow": 9297,
    "minus_ww": 1045,
    "plus_benefits": 350,
    "equals_net": 29651
  },
  "trace": {
    "calculation_steps": [...]
  }
}
```

#### POST /api/v1/calculations/tax-analysis
Deep dive into tax calculation with bracket details

**Request Body:**
```json
{
  "gross_income": 50000
}
```

**Response:**
```json
{
  "gross_income": 50000,
  "tax_brackets": [
    {
      "bracket_min": 0,
      "bracket_max": 36950,
      "rate": 0.1155,
      "taxable_amount": 36950,
      "tax": 4270
    },
    {
      "bracket_min": 36950,
      "bracket_max": 71900,
      "rate": 0.2385,
      "taxable_amount": 13050,
      "tax": 3109
    }
  ],
  "total_tax": 7379,
  "effective_tax_rate": 14.76,
  "marginal_tax_rate": 23.85,
  "explanation": {
    "general_allowance": 3107,
    "labour_allowance": 1800,
    "total_allowances": 4907,
    "note": "These allowances reduce your taxable income before brackets are applied"
  }
}
```

#### POST /api/v1/calculations/benefits-analysis
Analyze eligibility and amounts for all benefits

**Request Body:**
```json
{
  "gross_income": 50000,
  "household_members": 1,
  "housing_costs": 400,
  "children": 0,
  "is_partner": false
}
```

**Response:**
```json
{
  "income": 50000,
  "benefits": {
    "huurtoeslag": {
      "amount": 200,
      "annual": 2400,
      "trace": [...],
      "legal_reference": "Wet op de huurtoeslag 2014",
      "url": "https://www.toeslagen.nl/huurtoeslag"
    },
    "zorgtoeslag": {
      "amount": 150,
      "annual": 1800,
      "trace": [...],
      "legal_reference": "Zorgverzekeringswet",
      "url": "https://www.toeslagen.nl/zorgtoeslag"
    },
    "kindgebonden_budget": {
      "amount": 0,
      "annual": 0,
      "trace": [...],
      "legal_reference": "Wet op het kindgebonden budget",
      "url": "https://www.toeslagen.nl/kindgebonden-budget"
    }
  },
  "total_monthly_benefits": 350,
  "total_annual_benefits": 4200
}
```

#### POST /api/v1/calculations/threshold-analysis
Identify income thresholds and cliff effects

**Request Body:**
```json
{
  "gross_income": 50000
}
```

**Response:**
```json
{
  "current_income": 50000,
  "thresholds": {
    "housing_allowance_single": {
      "threshold": 25000,
      "current_income": 50000,
      "distance": -25000,
      "percentage_to_threshold": -100,
      "status": "ABOVE",
      "crossing": ""
    },
    "housing_allowance_couple": {
      "threshold": 35000,
      "current_income": 50000,
      "distance": -15000,
      "percentage_to_threshold": -42.86,
      "status": "ABOVE",
      "crossing": ""
    },
    ...
  ]
}
```

#### POST /api/v1/calculations/scenario-delta
Calculate the delta between two scenarios

**Request Body:**
```json
{
  "base_params": {
    "gross_income": 50000,
    "pension_contribution_percentage": 0,
    "housing_costs": 400,
    "children_count": 0
  },
  "modified_params": {
    "gross_income": 50000,
    "pension_contribution_percentage": 15,
    "housing_costs": 400,
    "children_count": 0
  }
}
```

**Response:**
```json
{
  "base_scenario": {...},
  "modified_scenario": {...},
  "deltas": {
    "gross_income": {
      "base": 50000,
      "modified": 50000,
      "delta": 0,
      "percentage_change": 0,
      "direction": "no change"
    },
    "pension_amount": {
      "base": 0,
      "modified": 7500,
      "delta": 7500,
      "percentage_change": 100,
      "direction": "increase"
    },
    "income_tax": {
      "base": 7500,
      "modified": 5250,
      "delta": -2250,
      "percentage_change": -30,
      "direction": "decrease"
    },
    "total_benefits": {
      "base": 350,
      "modified": 500,
      "delta": 150,
      "percentage_change": 42.86,
      "direction": "increase"
    },
    "net_income": {
      "base": 38500,
      "modified": 36850,
      "delta": -1650,
      "percentage_change": -4.29,
      "direction": "decrease"
    }
  },
  "summary": {
    "best_income": "base",
    "net_income_improvement": -1650
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400,
  "type": "validation_error"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid input parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Example Error

```json
{
  "detail": "Calculation error: Invalid income value",
  "status_code": 400,
  "type": "validation_error"
}
```

---

## Data Types

### Decimal Values

All financial amounts are returned as decimal numbers (not strings):

```json
{
  "gross_income": 50000,
  "pension_amount": 2500.50,
  "effective_tax_rate": 17.38
}
```

### Dates

All timestamps use ISO 8601 format:

```json
{
  "created_at": "2024-02-04T10:30:00Z"
}
```

---

## Rate Limits

Currently no rate limits. Production should implement:
- 100 requests/minute per IP
- 1000 requests/minute per authenticated user

---

## Documentation

- **Interactive API Docs**: `/docs` (Swagger UI)
- **Alternative API Docs**: `/redoc` (ReDoc)
- **OpenAPI Schema**: `/openapi.json`

---

## Examples

### Complete Scenario Workflow

```bash
# 1. Create base scenario
curl -X POST http://localhost:8000/api/v1/calculations/scenario \
  -H "Content-Type: application/json" \
  -d '{
    "gross_income": 50000,
    "pension_contribution_percentage": 5,
    "housing_costs": 400,
    "children_count": 1,
    "marital_status": "single"
  }'

# 2. Get tax analysis
curl "http://localhost:8000/api/v1/calculations/tax-analysis?gross_income=47500"

# 3. Get benefits analysis
curl -X POST http://localhost:8000/api/v1/calculations/benefits-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "gross_income": 47500,
    "household_members": 1,
    "housing_costs": 400,
    "children": 1,
    "is_partner": false
  }'

# 4. Analyze thresholds
curl "http://localhost:8000/api/v1/calculations/threshold-analysis?gross_income=25000"

# 5. Compare with alternative scenario
curl -X POST http://localhost:8000/api/v1/calculations/scenario-delta \
  -H "Content-Type: application/json" \
  -d '{
    "base_params": {...},
    "modified_params": {...}
  }'
```

---

**Last Updated**: February 2024
**API Version**: 1.0.0
