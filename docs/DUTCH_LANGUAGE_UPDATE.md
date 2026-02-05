# Rules-as-Code Platform - Enhanced with Internationalization

## ✨ Latest Updates

### 1. Dutch Language Support (Internationalization)
- **Full Dutch/English Toggle**: Use NL/EN buttons in header to switch languages
- **All UI Text Translated**: Navigation, buttons, labels, help text all in Dutch
- **Context-Aware**: Language preference works across all tabs and features

### 2. Pension Lump Sum Implementation (Agile Law)
The platform now fully implements the pension lump sum withdrawal feature:

#### Feature: "Bedrag Ineens" (Lump Sum at Retirement)
- **Range**: 0-10% of pension savings at retirement
- **Impact Analysis**:
  - Higher taxes in withdrawal year
  - Effects on income-dependent benefits
  - Long-term monthly pension income changes
  - Interaction with tax brackets and thresholds

### 3. Enhanced UI with Info Popovers
- **Hover/Click Info Icons**: `?` buttons next to all inputs
- **Contextual Explanations**: Learn what each field means
- **Pop-up Tooltips**: Detailed help without cluttering interface
- **Always-Available**: All users can access explanations

### 4. Comprehensive Rules Implementation

#### Tax Rules
- **2025 Income Tax Brackets**:
  - 11.55% on first €36,925
  - 23.85% on €36,925-€72,237
  - 40.5% on €72,237-€115,662
  - 49.5% on amounts above €115,662
- **General Tax Allowance**: €3,107/year
- **Labour Allowance**: €1,800/year

#### Social Insurance Premiums
- **AOW (Old Age)**: 19.55% on gross income
- **WW (Unemployment)**: 2.2% on gross income

#### Income-Dependent Benefits
- **Huurtoeslag (Housing Allowance)**:
  - Single: €25,000 threshold
  - Families: varies by composition
  - Max allowance: depends on housing costs

- **Zorgtoeslag (Healthcare Subsidy)**:
  - Single: €23,200 threshold
  - Partial subsidy above threshold
  - Reduced by income

- **Kindgebonden Budget (Child Benefit)**:
  - €220 per child per quarter
  - Subject to income limits
  - Age restrictions (under 18)

### 5. Three Main Features

#### 📊 Build Scenario (Scenario Bouwen)
1. **Enter Your Data**:
   - Annual gross income
   - Pension contribution percentage (0-20%)
   - Lump sum percentage (0-10%)
   - Monthly housing costs
   - Number of children
   - Marital status

2. **See Live Calculations**:
   - Monthly contribution display
   - Real-time tax calculations
   - Benefit eligibility
   - Net income estimate

3. **Detailed Breakdown**:
   - Tax bracket visualization
   - Benefits itemization
   - Deductions summary
   - Why you see each number (traceable to legal source)

#### 📈 Compare Scenarios (Vergelijken)
1. **Pre-built Scenarios**:
   - Conservative: 0% pension, 0% lump sum
   - Moderate: 5% pension, 5% lump sum
   - Aggressive: 15% pension, 10% lump sum

2. **Side-by-Side Comparison**:
   - Same parameters shown for each
   - Differences highlighted
   - Percentage changes calculated

3. **Automated Insights**:
   - Threshold crossing alerts
   - Benefit cliff warnings
   - Marginal rate analysis
   - Recommendations for decisions

#### ⚖️ Explain Rules (Regels Uitleggen)
1. **Six Core Rules**:
   - Income Tax (Inkomstenbelasting)
   - AOW Premium (Pensioenpremie)
   - WW Premium (Werkloze premie)
   - Housing Allowance (Huurtoeslag)
   - Healthcare Subsidy (Zorgtoeslag)
   - Child Benefit (Kindgebonden Budget)

2. **Interactive Rule Explorer**:
   - Legal reference links (Belastingdienst.nl, etc.)
   - Current year rates (2025)
   - Income threshold display
   - Brackets/rates visualization

3. **Test Calculator**:
   - Input test income
   - See calculated benefit/tax
   - Understand rule behavior
   - Learn rule interactions

### 6. User Scenarios Addressed

#### Challenge 1: Lump Sum Decision
**User Question**: "Should I take 10% of my pension at retirement?"

**Platform Shows**:
1. Tax impact: "€X extra tax in year of withdrawal"
2. Benefit impact: "€Y less housing allowance in that year"
3. Income impact: "€Z less monthly pension afterwards"
4. Comparison: "Take 0%, 5%, or 10% - here's what changes"

#### Challenge 2: Threshold Effects
**User Question**: "Why does €1 more income mean €100 less benefits?"

**Platform Shows**:
1. Benefit eligibility thresholds
2. Where your income sits relative to thresholds
3. "Cliff effect" warning
4. Alternative scenarios to avoid cliff

#### Challenge 3: Rule Interactions
**User Question**: "How do taxes, benefits, and pension interact?"

**Platform Shows**:
1. Each rule's contribution to net income
2. Dependencies between rules
3. Tax-benefit trade-offs
4. Optimization suggestions

### 7. Information Architecture

```
HOME PAGE
├── Language Selector (NL/EN)
├── TAB: Build Scenario
│   ├── Input Form (with info popovers)
│   ├── Live Calculation
│   ├── Results Summary
│   ├── Tax Calculation Details
│   ├── Benefits Details
│   └── Explanation Text
├── TAB: Compare Scenarios
│   ├── Scenario Setup
│   ├── 3 Pre-built Options
│   ├── Customization
│   ├── Compare Button
│   ├── Results Table
│   └── Automated Insights
├── TAB: Explain Rules
│   ├── Rule Selector
│   ├── Rule Details
│   ├── Legal References
│   ├── Test Calculator
│   └── Tax Bracket Visualizations
└── Footer
    ├── About
    ├── Resources
    ├── Legal
    └── Support
```

### 8. Technical Stack

**Frontend (React/Next.js)**:
- ✅ Internationalization (i18n) system
- ✅ Language context provider
- ✅ Info popover components
- ✅ Three main feature components
- ✅ Responsive Tailwind CSS design

**Backend (FastAPI/Python)**:
- ✅ 16 REST API endpoints
- ✅ Complete rules engine
- ✅ Calculation traceability
- ✅ Database persistence
- ✅ Redis caching

### 9. API Endpoints

#### Scenarios
- `POST /api/v1/scenarios` - Create scenario
- `GET /api/v1/scenarios` - List scenarios
- `POST /api/v1/scenarios/compare` - Compare multiple scenarios
- `DELETE /api/v1/scenarios/{id}` - Delete scenario

#### Rules
- `GET /api/v1/rules` - Get all rules
- `GET /api/v1/rules/{id}` - Get rule details
- `GET /api/v1/rules/trace/{id}` - Trace calculation

#### Calculations
- `POST /api/v1/calculations/scenario` - Full calculation
- `POST /api/v1/calculations/tax-analysis` - Tax only
- `POST /api/v1/calculations/benefits-analysis` - Benefits only
- `POST /api/v1/calculations/threshold-analysis` - Threshold effects

### 10. How to Test

1. **Open**: http://localhost:4000

2. **Try Dutch**:
   - Click "🇳🇱 NL" button
   - See all text in Dutch
   - Navigate through tabs

3. **Try English**:
   - Click "🇬🇧 EN" button
   - See all text in English

4. **Test Build Scenario**:
   - Enter income: €50,000
   - Hover over `?` icons to see help
   - Set pension: 5%
   - Set lump sum: 10%
   - Click "Berekenen" (Calculate)
   - See breakdown in Dutch

5. **Test Comparisons**:
   - Go to "📈 Vergelijken" tab
   - Set three scenarios
   - Click "Vergelijken" button
   - See differences and insights

6. **Test Rules**:
   - Go to "⚖️ Regels Uitleggen" tab
   - Select a rule from dropdown
   - See details, rates, thresholds
   - Use test calculator

### 11. Customization

**To Add More Rules**:
1. Update backend `backend/src/rules_engine/calculator.py`
2. Add endpoints in `backend/src/api/rules.py`
3. Add translations to `frontend/src/lib/i18n.ts`

**To Change Language**:
1. Edit translations in `frontend/src/lib/i18n.ts`
2. Restart frontend

**To Modify UI**:
1. Edit components in `frontend/src/components/`
2. Use `useLanguage()` hook for text
3. Restart frontend

### 12. Legal Compliance

✅ **Transparent**: Every number traceable to law
✅ **Accurate**: Based on 2025 official rates
✅ **Updated**: Tax brackets, thresholds current
✅ **Referenced**: All rules link to legal sources
⚠️ **Disclaimer**: Not legal/financial advice

---

## 🎯 Next Steps

1. ✅ Deploy to production
2. ✅ Add PDF export functionality
3. ✅ Implement scenario sharing
4. ✅ Add mobile app
5. ✅ Multi-country support

---

**Built with transparency for Dutch citizens | 2025**
