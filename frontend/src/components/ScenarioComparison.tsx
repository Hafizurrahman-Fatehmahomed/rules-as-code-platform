'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';

interface Scenario {
  name: string;
  grossIncome: number;
  pensionPct: number;
  lumpSumPct: number;
  housingCosts: number;
  children: number;
}

interface ScenarioComparisonProps {
  baseParams?: {
    grossIncome: number;
    pensionPct: number;
    lumpSumPct: number;
    housingCosts: number;
    children: number;
  };
}

export default function ScenarioComparison({ baseParams }: ScenarioComparisonProps) {
  const { t, language } = useLanguage();

  const base = baseParams || {
    grossIncome: 50000,
    pensionPct: 5,
    lumpSumPct: 0,
    housingCosts: 400,
    children: 0,
  };

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      name: language === 'nl' ? 'Voorzichtig - 0% lumpsum' : 'Conservative - 0% lump sum',
      grossIncome: base.grossIncome,
      pensionPct: base.pensionPct,
      lumpSumPct: 0,
      housingCosts: base.housingCosts,
      children: base.children,
    },
    {
      name: language === 'nl' ? 'Gemiddeld - 5% lumpsum' : 'Moderate - 5% lump sum',
      grossIncome: base.grossIncome,
      pensionPct: base.pensionPct,
      lumpSumPct: 5,
      housingCosts: base.housingCosts,
      children: base.children,
    },
    {
      name: language === 'nl' ? 'Maximaal - 10% lumpsum' : 'Maximum - 10% lump sum',
      grossIncome: base.grossIncome,
      pensionPct: base.pensionPct,
      lumpSumPct: 10,
      housingCosts: base.housingCosts,
      children: base.children,
    },
  ]);

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update scenarios when baseParams changes
  useEffect(() => {
    const base = baseParams || {
      grossIncome: 50000,
      pensionPct: 5,
      lumpSumPct: 0,
      housingCosts: 400,
      children: 0,
    };
    setScenarios([
      {
        name: language === 'nl' ? 'Voorzichtig - 0% lumpsum' : 'Conservative - 0% lump sum',
        grossIncome: base.grossIncome,
        pensionPct: base.pensionPct,
        lumpSumPct: 0,
        housingCosts: base.housingCosts,
        children: base.children,
      },
      {
        name: language === 'nl' ? 'Gemiddeld - 5% lumpsum' : 'Moderate - 5% lump sum',
        grossIncome: base.grossIncome,
        pensionPct: base.pensionPct,
        lumpSumPct: 5,
        housingCosts: base.housingCosts,
        children: base.children,
      },
      {
        name: language === 'nl' ? 'Maximaal - 10% lumpsum' : 'Maximum - 10% lump sum',
        grossIncome: base.grossIncome,
        pensionPct: base.pensionPct,
        lumpSumPct: 10,
        housingCosts: base.housingCosts,
        children: base.children,
      },
    ]);
    // Reset results when scenarios change
    setResults(null);
  }, [baseParams, language]);

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate all three scenarios
      const calculationPromises = scenarios.map(scenario =>
        fetch('http://localhost:8000/api/v1/calculations/scenario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gross_income: scenario.grossIncome,
            pension_contribution_percentage: scenario.pensionPct,
            lump_sum_percentage: scenario.lumpSumPct,
            housing_costs: scenario.housingCosts,
            children_count: scenario.children,
            marital_status: 'single',
          }),
        }).then(r => r.json())
      );

      const calculatedResults = await Promise.all(calculationPromises);
      setResults(calculatedResults);
    } catch (err: any) {
      setError(err.message || t('error'));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'nl' ? 'nl-NL' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{t('compare.title')}</h2>
        <p className="text-indigo-100">{t('compare.description')}</p>
      </div>

      {/* Scenario Setup */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('compare.setup')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {scenarios.map((scenario, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <h4 className="font-bold text-gray-900 mb-4">{scenario.name}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-600">{t('builder.income')}</label>
                  <input
                    type="number"
                    value={scenario.grossIncome}
                    onChange={(e) => {
                      const newScenarios = [...scenarios];
                      newScenarios[idx].grossIncome = Number(e.target.value);
                      setScenarios(newScenarios);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-600">{t('builder.pensionPercentage')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scenario.pensionPct}
                    onChange={(e) => {
                      const newScenarios = [...scenarios];
                      newScenarios[idx].pensionPct = Number(e.target.value);
                      setScenarios(newScenarios);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-600">{t('builder.lumpSum')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scenario.lumpSumPct}
                    onChange={(e) => {
                      const newScenarios = [...scenarios];
                      newScenarios[idx].lumpSumPct = Number(e.target.value);
                      setScenarios(newScenarios);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-600">{t('builder.housing')}</label>
                  <input
                    type="number"
                    value={scenario.housingCosts}
                    onChange={(e) => {
                      const newScenarios = [...scenarios];
                      newScenarios[idx].housingCosts = Number(e.target.value);
                      setScenarios(newScenarios);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={runComparison}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? t('loading') : t('compare.compare')}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('compare.results')}</h3>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {results.map((result: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-600 mb-2">{scenarios[idx].name}</p>
                <p className="text-2xl font-bold text-indigo-900">{formatCurrency((result.net_income || 0) / 12)}</p>
                <p className="text-xs text-indigo-600 mt-2">{language === 'nl' ? 'Maandelijks netto' : 'Monthly net'}</p>
              </div>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">{language === 'nl' ? 'Onderdeel' : 'Item'}</th>
                  {scenarios.map((s, idx) => (
                    <th key={idx} className="text-right py-3 px-4 font-bold text-gray-900">{s.name}</th>
                  ))}
                  <th className="text-right py-3 px-4 font-bold text-indigo-600">{language === 'nl' ? 'Verschil' : 'Difference'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-semibold text-gray-900">{t('builder.grossIncome')}</td>
                  {results.map((r: any, idx: number) => (
                    <td key={idx} className="text-right py-3 px-4 text-gray-700">{formatCurrency(r.gross_income)}</td>
                  ))}
                  <td className="text-right py-3 px-4 text-gray-700">-</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-semibold text-gray-900">{t('builder.incomeTax')}</td>
                  {results.map((r: any, idx: number) => (
                    <td key={idx} className="text-right py-3 px-4 text-red-600">-{formatCurrency(r.income_tax || 0)}</td>
                  ))}
                  <td className="text-right py-3 px-4 text-red-600">
                    {formatCurrency(Math.abs((results[0].income_tax || 0) - (results[1].income_tax || 0)))}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-semibold text-gray-900">{t('builder.housingAllowance')}</td>
                  {results.map((r: any, idx: number) => (
                    <td key={idx} className="text-right py-3 px-4 text-green-600">+{formatCurrency(r.housing_allowance || 0)}</td>
                  ))}
                  <td className="text-right py-3 px-4 text-green-600">
                    {formatCurrency(Math.abs((results[0].housing_allowance || 0) - (results[1].housing_allowance || 0)))}
                  </td>
                </tr>
                <tr className="border-b-2 border-gray-300 bg-indigo-50">
                  <td className="py-3 px-4 font-bold text-indigo-900">{t('builder.netIncome')} ({language === 'nl' ? 'maandelijks' : 'monthly'})</td>
                  {results.map((r: any, idx: number) => (
                    <td key={idx} className="text-right py-3 px-4 text-indigo-900 font-bold">{formatCurrency((r.net_income || 0) / 12)}</td>
                  ))}
                  <td className="text-right py-3 px-4 text-indigo-600 font-bold">
                    {formatCurrency(Math.abs((results[0].net_income || 0) - (results[1].net_income || 0)) / 12)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-bold text-blue-900 mb-4">{language === 'nl' ? '💡 Inzichten' : '💡 Insights'}</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ {language === 'nl' ? 'Scenario 2 biedt meer netto inkomen' : 'Scenario 2 provides more net income'}</li>
              <li>⚠️ {language === 'nl' ? 'Let op: meer pensioenbijdrage = minder belastingen' : 'Note: higher pension contribution = lower taxes'}</li>
              <li>💰 {language === 'nl' ? 'Eenmalige uitkering heeft impact op toeslag' : 'Lump sum affects benefits eligibility'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
