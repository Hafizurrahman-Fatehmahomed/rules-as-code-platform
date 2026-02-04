'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/lib/language-context';
import InfoPopover from './InfoPopover';
import BedragIneensCard from './BedragIneensCard';

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name required'),
  age: z.number().min(18).max(99),
  grossIncome: z.number().min(0, 'Income must be positive'),
  pensionContributionPercentage: z.number().min(0).max(100),
  lumpSumPercentage: z.number().min(0).max(10),
  housingCosts: z.number().min(0),
  childrenCount: z.number().min(0).max(10),
  maritalStatus: z.enum(['single', 'married']),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

interface ScenarioBuilderProps {
  onCalculationUpdate?: (data: any) => void;
  onParamsUpdate?: (params: any) => void;
}

export default function ScenarioBuilder({ onCalculationUpdate, onParamsUpdate }: ScenarioBuilderProps) {
  const { t, language } = useLanguage();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      name: language === 'nl' ? 'Mijn Pensioen' : 'My Pension',
      age: 62,
      grossIncome: 50000,
      pensionContributionPercentage: 5,
      lumpSumPercentage: 0,
      housingCosts: 400,
      childrenCount: 0,
      maritalStatus: 'single',
    },
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchedValues = watch();
  const monthlyPension = (watchedValues.grossIncome * watchedValues.pensionContributionPercentage) / 100 / 12;

  // Auto-calculate when input values change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoCalculate();
      // Emit params for syncing to ScenarioComparison
      if (onParamsUpdate) {
        onParamsUpdate({
          grossIncome: watchedValues.grossIncome,
          pensionPct: watchedValues.pensionContributionPercentage,
          lumpSumPct: watchedValues.lumpSumPercentage,
          housingCosts: watchedValues.housingCosts,
          children: watchedValues.childrenCount,
        });
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [watchedValues.grossIncome, watchedValues.pensionContributionPercentage, watchedValues.lumpSumPercentage, watchedValues.housingCosts, watchedValues.childrenCount, watchedValues.maritalStatus]);

  const handleAutoCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/calculations/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gross_income: watchedValues.grossIncome,
          pension_contribution_percentage: watchedValues.pensionContributionPercentage,
          lump_sum_percentage: watchedValues.lumpSumPercentage,
          housing_costs: watchedValues.housingCosts,
          children_count: watchedValues.childrenCount,
          marital_status: watchedValues.maritalStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(t('error'));
      }
      const result = await response.json();
      setResults(result);
      if (onCalculationUpdate) {
        onCalculationUpdate(result);
      }
    } catch (err: any) {
      setError(err.message || t('error'));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ScenarioFormData) => {
    await handleAutoCalculate();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'nl' ? 'nl-NL' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{t('builder.title')}</h2>
        <p className="text-indigo-100">{t('builder.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-8 space-y-6 sticky top-24">
            {/* Scenario Name - Fixed Display */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                {language === 'nl' ? 'Scenario Naam' : 'Scenario Name'}
              </label>
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                {language === 'nl' ? 'Mijn Pensioen' : 'My Pension'}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                {language === 'nl' ? 'Leeftijd' : 'Age'}
                <InfoPopover title={language === 'nl' ? 'Leeftijd' : 'Age'} content={language === 'nl' ? 'Bepaalt wanneer u bedrag ineens mag nemen (minimum 67)' : 'Determines when you can take lump sum (minimum 67)'} />
              </label>
              <div className="relative">
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  min="18"
                  max="99"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <span className="absolute right-4 top-3 text-gray-500 font-semibold">{language === 'nl' ? 'jaar' : 'yrs'}</span>
              </div>
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            {/* Gross Income */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                {t('builder.income')}
                <InfoPopover title={t('builder.income')} content={t('builder.incomeHelp')} />
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-semibold">€</span>
                <input
                  {...register('grossIncome', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              {errors.grossIncome && <p className="text-red-500 text-xs mt-1">{errors.grossIncome.message}</p>}
            </div>

            {/* Pension Contribution */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                {t('builder.pensionPercentage')} ({watchedValues.pensionContributionPercentage}%)
                <InfoPopover title={t('builder.pensionPercentage')} content={t('builder.pensionHelp')} />
              </label>
              <input
                {...register('pensionContributionPercentage', { valueAsNumber: true })}
                type="range"
                min="0"
                max="20"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span className="text-indigo-600 font-semibold">{monthlyPension.toFixed(2)} €/month</span>
                <span>20%</span>
              </div>
            </div>

            {/* Lump Sum - Hidden (will display as formal rule card in results) */}
            <input
              {...register('lumpSumPercentage', { valueAsNumber: true })}
              type="hidden"
            />

            {/* Housing Costs */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                {t('builder.housing')}
                <InfoPopover title={t('builder.housing')} content={t('builder.housingHelp')} />
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-semibold">€</span>
                <input
                  {...register('housingCosts', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Children */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                {t('builder.children')}
                <InfoPopover title={t('builder.children')} content={t('builder.childrenHelp')} />
              </label>
              <input
                {...register('childrenCount', { valueAsNumber: true })}
                type="number"
                min="0"
                max="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                {t('builder.maritalStatus')}
                <InfoPopover title={t('builder.maritalStatus')} content={t('builder.maritalStatusHelp')} />
              </label>
              <select
                {...register('maritalStatus')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="single">{language === 'nl' ? 'Ongehuwd' : 'Single'}</option>
                <option value="married">{language === 'nl' ? 'Gehuwd/Samenwonend' : 'Married/Cohabiting'}</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Auto-calculation status */}
            <div className="text-center text-xs text-gray-500 p-2 bg-gray-50 rounded-lg">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span>
                  {language === 'nl' ? 'Berekening wordt bijgewerkt...' : 'Updating calculations...'}
                </span>
              ) : (
                <span>{language === 'nl' ? '✓ Realtime berekening actief' : '✓ Real-time calculation active'}</span>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {results ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gross Income */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">{t('builder.grossIncome')}</p>
                  <p className="text-3xl font-bold text-blue-900">{formatCurrency(results.gross_income)}</p>
                  <p className="text-xs text-blue-600 mt-2">{language === 'nl' ? 'Jaarlijks' : 'Annual'}</p>
                </div>

                {/* Pension Contribution */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <p className="text-sm text-green-600 font-semibold mb-1">{t('builder.pensionContribution')}</p>
                  <p className="text-3xl font-bold text-green-900">{formatCurrency((results.gross_income * watchedValues.pensionContributionPercentage) / 100)}</p>
                  <p className="text-xs text-green-600 mt-2">({watchedValues.pensionContributionPercentage}%)</p>
                </div>

                {/* Taxable Income */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <p className="text-sm text-purple-600 font-semibold mb-1">{t('builder.taxableIncome')}</p>
                  <p className="text-3xl font-bold text-purple-900">{formatCurrency(results.taxable_income || 0)}</p>
                  <p className="text-xs text-purple-600 mt-2">{language === 'nl' ? 'Na aftrek' : 'After deductions'}</p>
                </div>

                {/* Income Tax */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                  <p className="text-sm text-red-600 font-semibold mb-1">{t('builder.incomeTax')}</p>
                  <p className="text-3xl font-bold text-red-900">-{formatCurrency(results.income_tax || 0)}</p>
                  <p className="text-xs text-red-600 mt-2">{language === 'nl' ? 'Jaarlijks' : 'Annual'}</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{language === 'nl' ? 'Gedetailleerde Afrekening' : 'Detailed Breakdown'}</h3>
                <div className="space-y-4">
                  {/* Income Items */}
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">{t('builder.grossIncome')}</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(results.gross_income)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-red-600">
                      <span className="text-gray-700 font-medium">{t('builder.pensionContribution')}</span>
                      <span className="font-semibold">-{formatCurrency((results.gross_income * watchedValues.pensionContributionPercentage) / 100)}</span>
                    </div>
                  </div>

                  {/* Taxes & Premiums */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-3">{language === 'nl' ? 'Belastingen & Premies' : 'Taxes & Premiums'}</p>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{t('builder.incomeTax')}</span>
                      <span className="text-red-600 font-semibold">-{formatCurrency(results.income_tax || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{t('builder.aowPremium')}</span>
                      <span className="text-red-600 font-semibold">-{formatCurrency(results.aow_premium || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{t('builder.wwPremium')}</span>
                      <span className="text-red-600 font-semibold">-{formatCurrency(results.ww_premium || 0)}</span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-3">{t('builder.benefits')}</p>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{t('builder.housingAllowance')}</span>
                      <span className="text-green-600 font-semibold">+{formatCurrency(results.housing_allowance || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{t('builder.healthcareSubsidy')}</span>
                      <span className="text-green-600 font-semibold">+{formatCurrency(results.healthcare_subsidy || 0)}</span>
                    </div>
                    {watchedValues.childrenCount > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">{t('builder.childBenefit')}</span>
                        <span className="text-green-600 font-semibold">+{formatCurrency(results.child_benefit || 0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Net Income */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-indigo-900">{t('builder.netIncome')}</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatCurrency((results.net_income || 0) / 12)}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 mt-1">{language === 'nl' ? 'Maandelijks' : 'Monthly'}</p>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-3">{t('builder.tax.title')}</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p className="font-semibold">{t('builder.tax.brackets2025')}:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                    <li>{t('builder.tax.bracket1')}</li>
                    <li>{t('builder.tax.bracket2')}</li>
                    <li>{t('builder.tax.bracket3')}</li>
                    <li>{t('builder.tax.bracket4')}</li>
                  </ul>
                  <p className="pt-2 border-t border-blue-200 mt-2">{t('builder.tax.allowance')}</p>
                </div>
              </div>

              {/* Bedrag Ineens - Formal Rule Object */}
              <BedragIneensCard
                selectedPercentage={watchedValues.lumpSumPercentage}
                grossIncome={watchedValues.grossIncome}
                pensionPercentage={watchedValues.pensionContributionPercentage}
                age={watchedValues.age}
                onPercentageChange={(value) => {
                  setValue('lumpSumPercentage', value);
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-indigo-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{language === 'nl' ? 'Klaar om te berekenen?' : 'Ready to calculate?'}</h3>
              <p className="text-gray-600 mb-4">{language === 'nl' ? 'Vul de gegevens in en klik op "Berekenen" om uw scenario te zien.' : 'Fill in your details and click "Calculate" to see your scenario.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
