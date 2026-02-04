'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';

interface RuleEvent {
  rule: string;
  triggered: boolean;
  condition: string;
  impact: string;
  threshold?: number;
  crossed?: boolean;
}

interface RuleTracePanelProps {
  calculationData?: any;
  lumpSumPercentage?: number;
  grossIncome?: number;
}

const TAX_BRACKETS_2025 = [
  { name: 'Bracket 1', min: 0, max: 21869, rate: 0.0885 },
  { name: 'Bracket 2', min: 21869, max: 53608, rate: 0.1385 },
  { name: 'Bracket 3', min: 53608, max: 240876, rate: 0.495 },
  { name: 'Bracket 4', min: 240876, max: Infinity, rate: 0.49 },
];

const BENEFIT_THRESHOLDS_2025 = {
  zorgatslag: 38520,
  huisvesting: 42000,
  kinderbijslag: 50000,
};

export default function RuleTracePanel({ calculationData, lumpSumPercentage = 0, grossIncome = 50000 }: RuleTracePanelProps) {
  const { language } = useLanguage();

  if (!calculationData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        <p>{language === 'nl' ? 'Vul eerst een scenario in om de regeltoepassing te zien' : 'Enter a scenario first to see rule application'}</p>
      </div>
    );
  }

  const generateRuleTrace = () => {
    const events: RuleEvent[] = [];
    const annualPension = grossIncome * (calculationData.pension_contribution_percentage || 5) / 100;
    const lumpSumAmount = (annualPension * lumpSumPercentage) / 10;
    const baseIncome = grossIncome;
    const taxableIncomeBeforeLump = calculationData.taxable_income_before_lump_sum || baseIncome;
    const taxableIncomeAfterLump = calculationData.taxable_income_with_lump_sum || baseIncome;

    // Rule 1: Lump sum eligibility
    if (lumpSumPercentage > 0) {
      events.push({
        rule: language === 'nl' ? 'Bedrag Ineens - Eligible' : 'Lump Sum - Eligible',
        triggered: true,
        condition: language === 'nl' 
          ? `${lumpSumPercentage}% ≤ 10% (maximaal) en op pensioneringsdatum`
          : `${lumpSumPercentage}% ≤ 10% (max) and at retirement date`,
        impact: language === 'nl'
          ? `€${lumpSumAmount.toFixed(2)} lump sum ontvangen`
          : `Receive €${lumpSumAmount.toFixed(2)} lump sum`,
      });
    }

    // Rule 2: Tax bracket movement
    const bracketBefore = TAX_BRACKETS_2025.find(b => taxableIncomeBeforeLump >= b.min && taxableIncomeBeforeLump < b.max);
    const bracketAfter = TAX_BRACKETS_2025.find(b => taxableIncomeAfterLump >= b.min && taxableIncomeAfterLump < b.max);
    
    if (bracketBefore && bracketAfter && bracketBefore.name !== bracketAfter.name) {
      events.push({
        rule: language === 'nl' ? 'Belastingschijf Progressie' : 'Tax Bracket Progression',
        triggered: true,
        condition: language === 'nl'
          ? `Lump sum verplaatst inkomen van €${taxableIncomeBeforeLump.toFixed(0)} naar €${taxableIncomeAfterLump.toFixed(0)}`
          : `Lump sum moves income from €${taxableIncomeBeforeLump.toFixed(0)} to €${taxableIncomeAfterLump.toFixed(0)}`,
        impact: language === 'nl'
          ? `${bracketBefore.name} (${(bracketBefore.rate * 100).toFixed(1)}%) → ${bracketAfter.name} (${(bracketAfter.rate * 100).toFixed(1)}%)`
          : `${bracketBefore.name} (${(bracketBefore.rate * 100).toFixed(1)}%) → ${bracketAfter.name} (${(bracketAfter.rate * 100).toFixed(1)}%)`,
      });
    }

    // Rule 3: Zorgatslag eligibility
    const zorgatslagThreshold = BENEFIT_THRESHOLDS_2025.zorgatslag;
    const zoragslagEligibleBefore = taxableIncomeBeforeLump <= zorgatslagThreshold;
    const zoragtslagEligibleAfter = taxableIncomeAfterLump <= zorgatslagThreshold;
    
    if (zoragslagEligibleBefore !== zoragtslagEligibleAfter) {
      events.push({
        rule: language === 'nl' ? 'Zorgatslag Drempel' : 'Healthcare Allowance Threshold',
        triggered: true,
        condition: language === 'nl'
          ? `Threshold: €${zorgatslagThreshold.toFixed(0)}`
          : `Threshold: €${zorgatslagThreshold.toFixed(0)}`,
        impact: zoragtslagEligibleAfter
          ? (language === 'nl' ? '❌ Zorgatslag VERLOREN' : '❌ Healthcare allowance LOST')
          : (language === 'nl' ? '✅ Zorgatslag behouden' : '✅ Healthcare allowance retained'),
        threshold: zorgatslagThreshold,
        crossed: !zoragtslagEligibleAfter,
      });
    }

    // Rule 4: Housing allowance
    const housingThreshold = BENEFIT_THRESHOLDS_2025.huisvesting;
    const housingEligibleBefore = taxableIncomeBeforeLump <= housingThreshold;
    const housingEligibleAfter = taxableIncomeAfterLump <= housingThreshold;
    
    if (housingEligibleBefore !== housingEligibleAfter) {
      events.push({
        rule: language === 'nl' ? 'Huisvestingstoeslagen Drempel' : 'Housing Allowance Threshold',
        triggered: true,
        condition: language === 'nl'
          ? `Threshold: €${housingThreshold.toFixed(0)}`
          : `Threshold: €${housingThreshold.toFixed(0)}`,
        impact: housingEligibleAfter
          ? (language === 'nl' ? '❌ Huisvestingstoeslagen VERLOREN' : '❌ Housing allowance LOST')
          : (language === 'nl' ? '✅ Huisvestingstoeslagen behouden' : '✅ Housing allowance retained'),
        threshold: housingThreshold,
        crossed: !housingEligibleAfter,
      });
    }

    return events;
  };

  const ruleEvents = generateRuleTrace();

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚖️</span>
        <h3 className="text-lg font-semibold text-indigo-900">
          {language === 'nl' ? 'Regeltoepassing Tracering' : 'Rule Application Trace'}
        </h3>
      </div>

      {ruleEvents.length === 0 ? (
        <p className="text-indigo-700 text-sm">{language === 'nl' ? 'Geen regels triggered' : 'No rules triggered'}</p>
      ) : (
        <div className="space-y-3">
          {ruleEvents.map((event, idx) => (
            <div
              key={idx}
              className={`border-l-4 p-3 rounded ${
                event.crossed
                  ? 'border-red-500 bg-red-50'
                  : 'border-green-500 bg-green-50'
              }`}
            >
              <p className={`font-semibold text-sm mb-1 ${
                event.crossed ? 'text-red-900' : 'text-green-900'
              }`}>
                {event.rule}
              </p>
              <p className={`text-xs mb-2 ${
                event.crossed ? 'text-red-800' : 'text-green-800'
              }`}>
                {language === 'nl' ? 'Voorwaarde: ' : 'Condition: '} {event.condition}
              </p>
              <p className={`font-semibold text-sm ${
                event.crossed ? 'text-red-700' : 'text-green-700'
              }`}>
                {event.impact}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-indigo-200 rounded p-3 mt-4 text-xs text-indigo-900">
        <p className="font-semibold mb-2">{language === 'nl' ? '💡 Wat dit betekent:' : '💡 What this means:'}</p>
        {lumpSumPercentage > 0 ? (
          <p>
            {language === 'nl'
              ? `Het nemen van ${lumpSumPercentage}% eenmalige uitkering voegt €${((grossIncome * (calculationData.pension_contribution_percentage || 5) / 100 * lumpSumPercentage) / 10).toFixed(2)} toe aan uw belastbaar inkomen. Dit kan u uit de bereikbaarheid van bepaalde toeslagen brengen.`
              : `Taking a ${lumpSumPercentage}% lump sum adds €${((grossIncome * (calculationData.pension_contribution_percentage || 5) / 100 * lumpSumPercentage) / 10).toFixed(2)} to your taxable income. This may make you ineligible for certain benefits.`}
          </p>
        ) : (
          <p>
            {language === 'nl'
              ? 'Geen lump sum nemen betekent dat uw inkomsten stabiel blijven en u kwalificaties voor toeslagen behoudt.'
              : 'Not taking a lump sum means your income stays stable and you keep benefit eligibility.'}
          </p>
        )}
      </div>
    </div>
  );
}
