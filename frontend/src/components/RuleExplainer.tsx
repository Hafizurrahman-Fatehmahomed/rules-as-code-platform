'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';

interface RuleExplanation {
  id: string;
  title: string;
  description: string;
  formula: string;
  example: string;
}

export default function RuleExplainer() {
  const { t, language } = useLanguage();
  const [selectedRule, setSelectedRule] = useState<string>('income-tax');
  const [testIncome, setTestIncome] = useState(50000);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const rules: RuleExplanation[] = [
    {
      id: 'income-tax',
      title: language === 'nl' ? 'Inkomstenbelasting 2025' : 'Income Tax 2025',
      description:
        language === 'nl'
          ? 'De inkomstenbelasting wordt berekend op basis van het bruto inkomen met progressieve tarieven.'
          : 'Income tax is calculated on gross income using progressive tax rates.',
      formula:
        language === 'nl'
          ? 'Bruto inkomen × Belastingtarief (varies by bracket)'
          : 'Gross income × Tax rate (varies by bracket)',
      example:
        language === 'nl'
          ? '€50.000: €19.717 inkomstenbelasting (39,43%)'
          : '€50,000: €19,717 income tax (39.43%)',
    },
    {
      id: 'housing-allowance',
      title: language === 'nl' ? 'Huurtoeslag' : 'Housing Allowance',
      description:
        language === 'nl'
          ? 'Een tegemoetkoming voor huurders met een laag tot middelmatig inkomen.'
          : 'A benefit for tenants with low to moderate income.',
      formula:
        language === 'nl'
          ? 'Gebaseerd op: huurprijs, inkomen, huishoudsamenstelling'
          : 'Based on: rent, income, household composition',
      example:
        language === 'nl'
          ? 'Huur €600, inkomen €30.000: €156/maand toeslag'
          : 'Rent €600, income €30,000: €156/month allowance',
    },
    {
      id: 'child-allowance',
      title: language === 'nl' ? 'Kinderopvangtoediening' : 'Child Care Allowance',
      description:
        language === 'nl'
          ? 'Tegemoetkoming voor werkende ouders met kinderopvangkosten.'
          : 'Benefit for working parents with childcare costs.',
      formula:
        language === 'nl'
          ? 'Tot 125 euro per maand per kind'
          : 'Up to €125 per month per child',
      example:
        language === 'nl'
          ? '3 kinderen: potentieel €375/maand'
          : '3 children: potentially €375/month',
    },
    {
      id: 'pension-contribution',
      title: language === 'nl' ? 'Pensioenuitkeering' : 'Pension Payment',
      description:
        language === 'nl'
          ? 'Een deel van het bruto salaris wordt gereserveerd voor pensioen.'
          : 'A portion of gross salary is reserved for pension.',
      formula:
        language === 'nl'
          ? 'Bruto inkomen × Pensioenpercentage (0-20%)'
          : 'Gross income × Pension percentage (0-20%)',
      example:
        language === 'nl'
          ? '€50.000 × 10% = €5.000/jaar pensioen'
          : '€50,000 × 10% = €5,000/year pension',
    },
  ];

  const testRule = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/calculations/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gross_income: testIncome,
          pension_contribution_percentage: 10,
          lump_sum_percentage: 5,
          housing_costs: 400,
          children_count: 1,
          marital_status: 'single',
        }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (err: any) {
      console.error('Error testing rule:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentRule = rules.find(r => r.id === selectedRule) || rules[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'nl' ? 'nl-NL' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{t('explain.title')}</h2>
        <p className="text-purple-100">{t('explain.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{language === 'nl' ? 'Regels' : 'Rules'}</h3>
            <div className="space-y-2">
              {rules.map(rule => (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRule(rule.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition font-medium text-sm ${
                    selectedRule === rule.id
                      ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {rule.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rule Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Explanation */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{currentRule.title}</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{language === 'nl' ? 'Omschrijving' : 'Description'}</h4>
                <p className="text-gray-700 leading-relaxed">{currentRule.description}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">{language === 'nl' ? 'Formule' : 'Formula'}</h4>
                <code className="text-sm text-blue-800 font-mono block">{currentRule.formula}</code>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">{language === 'nl' ? 'Voorbeeld' : 'Example'}</h4>
                <p className="text-sm text-green-800">{currentRule.example}</p>
              </div>
            </div>
          </div>

          {/* Interactive Tester */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🧪</span>
              {language === 'nl' ? 'Test deze regel' : 'Test this rule'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('builder.income')}</label>
                <input
                  type="number"
                  value={testIncome}
                  onChange={(e) => setTestIncome(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={testRule}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? t('loading') : language === 'nl' ? 'Bereken' : 'Calculate'}
              </button>
            </div>

            {testResult && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <h4 className="font-bold text-purple-900 mb-4">{language === 'nl' ? 'Resultaten' : 'Results'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-700">{language === 'nl' ? 'Netto inkomen' : 'Net income'}</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency((testResult.net_income || 0) / 12)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">{language === 'nl' ? 'Inkomstenbelasting' : 'Income tax'}</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(testResult.income_tax || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">{language === 'nl' ? 'Huurtoeslag' : 'Housing allowance'}</p>
                    <p className="text-lg font-bold text-green-600">+{formatCurrency(testResult.housing_allowance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">{language === 'nl' ? 'Pensioen' : 'Pension'}</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(testResult.pension_contribution || 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
