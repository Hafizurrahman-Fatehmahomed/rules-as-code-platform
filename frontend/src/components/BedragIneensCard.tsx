'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';

interface BedragIneensCardProps {
  selectedPercentage: number;
  grossIncome: number;
  pensionPercentage: number;
  age?: number;
  onPercentageChange: (value: number) => void;
}

export default function BedragIneensCard({
  selectedPercentage,
  grossIncome,
  pensionPercentage,
  age = 62,
  onPercentageChange,
}: BedragIneensCardProps) {
  const { language } = useLanguage();

  const RETIREMENT_AGE = 67; // Dutch statutory retirement age
  const isAtRetirement = age >= RETIREMENT_AGE;
  const isPreviewMode = !isAtRetirement;

  const annualPension = (grossIncome * pensionPercentage) / 100;
  const selectedAmount = (annualPension * selectedPercentage) / 10;
  const remainingPensionCapital = annualPension - selectedAmount;
  const monthlyPensionBefore = annualPension / 12;
  const monthlyPensionAfter = remainingPensionCapital / 12;

  const legalLimitPercent = 10;
  const maxAmount = (annualPension * legalLimitPercent) / 10;

  return (
    <div className="bg-white border-2 border-purple-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            💰 {language === 'nl' ? 'Bedrag Ineens' : 'Lump Sum'}
            <span className={`text-xs px-2 py-1 rounded font-normal ${
              isPreviewMode
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {isPreviewMode
                ? (language === 'nl' ? 'PREVIEW (niet beschikbaar tot 67)' : 'PREVIEW (unavailable until 67)')
                : (language === 'nl' ? 'Regel' : 'Rule')}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isPreviewMode ? (
              language === 'nl'
                ? `Beschikbaar op pensioneringsleeftijd (nu ${age} jaar oud, minimum 67)`
                : `Available at retirement age (you are ${age}, minimum 67)`
            ) : (
              language === 'nl'
                ? 'Nederlands pensioenrecht - maximaal eenmalige uitkering'
                : 'Dutch pension law - maximum lump sum withdrawal'
            )}
          </p>
        </div>
      </div>

      {/* Rule Details Box */}
      <div className="bg-purple-50 border border-purple-200 rounded p-4 mb-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">{language === 'nl' ? 'Wettelijke limiet' : 'Legal limit'}</p>
            <p className="text-lg font-bold text-purple-900">{legalLimitPercent}%</p>
            <p className="text-xs text-purple-700">€{maxAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">{language === 'nl' ? 'Uw keuze' : 'Your choice'}</p>
            <p className="text-lg font-bold text-purple-900">{selectedPercentage}%</p>
            <p className="text-xs text-purple-700">€{selectedAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">{language === 'nl' ? 'Status' : 'Status'}</p>
            {isPreviewMode ? (
              <>
                <p className="text-lg font-bold text-yellow-700">⏸️ {language === 'nl' ? 'PREVIEW' : 'PREVIEW'}</p>
                <p className="text-xs text-yellow-600">{language === 'nl' ? 'Actief vanaf 67' : 'Active from age 67'}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-green-700">✅ {language === 'nl' ? 'Toegestaan' : 'Allowed'}</p>
                <p className="text-xs text-gray-600">{language === 'nl' ? 'bij pensionering' : 'at retirement'}</p>
              </>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">{language === 'nl' ? 'Restpensio' : 'Remaining pension'}</p>
            <p className="text-lg font-bold text-blue-700">€{remainingPensionCapital.toFixed(2)}/jaar</p>
            <p className="text-xs text-blue-600">€{monthlyPensionAfter.toFixed(2)}/mnd</p>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">
            {language === 'nl' ? 'Selecteer % bedrag ineens' : 'Select % lump sum'}
          </label>
          <span className="text-lg font-bold text-purple-600">{selectedPercentage}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={selectedPercentage}
          onChange={(e) => onPercentageChange(Number(e.target.value))}
          disabled={isPreviewMode}
          className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${
            isPreviewMode
              ? 'bg-gray-200 opacity-50 cursor-not-allowed'
              : 'bg-purple-200 accent-purple-600 cursor-pointer'
          }`}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>5%</span>
          <span>10% {language === 'nl' ? '(max)' : '(max)'}</span>
        </div>
        {isPreviewMode && (
          <p className="text-xs text-yellow-700 font-semibold mt-2">
            ⏸️ {language === 'nl'
              ? 'Slider is gesloten tot pensioneringsdatum'
              : 'Slider is locked until retirement'}
          </p>
        )}
      </div>

      {/* Tax Treatment Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-xs">
        <p className="font-semibold text-yellow-900 mb-1">⚠️ {language === 'nl' ? 'Belastingeffect' : 'Tax treatment'}</p>
        <p className="text-yellow-800">
          {language === 'nl'
            ? `€${selectedAmount.toFixed(2)} wordt gelijk belast als normale inkomsten. Dit verhoogt uw belastbare inkomen in het pensionatieringsjaar.`
            : `€${selectedAmount.toFixed(2)} is taxed as regular income. This increases your taxable income in the retirement year.`}
        </p>
      </div>

      {/* Threshold Warnings - Show which benefits may be affected */}
      {selectedPercentage > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-xs space-y-2">
          <p className="font-semibold text-red-900">🚨 {language === 'nl' ? 'Risico op toeslaginvloed' : 'Risk to benefit eligibility'}</p>
          
          {(() => {
            const warningsTriggered = [];
            const newTaxableIncome = grossIncome - ((grossIncome * pensionPercentage) / 100) + selectedAmount;

            // Zorgatslag threshold
            if (newTaxableIncome > 38520) {
              warningsTriggered.push({
                name: language === 'nl' ? 'Zorgatslag' : 'Healthcare Allowance',
                threshold: 38520,
                loss: language === 'nl' ? 'VERLOREN' : 'LOST',
              });
            }

            // Housing allowance threshold
            if (newTaxableIncome > 42000) {
              warningsTriggered.push({
                name: language === 'nl' ? 'Huisvesting' : 'Housing Allowance',
                threshold: 42000,
                loss: language === 'nl' ? 'VERLOREN' : 'LOST',
              });
            }

            return warningsTriggered.length > 0 ? (
              warningsTriggered.map((warning, idx) => (
                <p key={idx} className="text-red-800">
                  ❌ <span className="font-semibold">{warning.name}</span>
                  <br />
                  {language === 'nl'
                    ? `Drempel €${warning.threshold.toLocaleString('nl-NL')} - u bent boven dit bedrag.`
                    : `Threshold €${warning.threshold.toLocaleString('en-GB')} - you exceed this.`}
                </p>
              ))
            ) : (
              <p className="text-green-700">
                ✅ {language === 'nl'
                  ? 'Geen directe impact op voornamige toeslagen.'
                  : 'No direct impact on major benefits.'}
              </p>
            );
          })()}
        </div>
      )}

      {/* Impact on Monthly Pension */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
        <p className="font-semibold text-blue-900 mb-2">📉 {language === 'nl' ? 'Effect op maandelijks pensioen' : 'Impact on monthly pension'}</p>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">{language === 'nl' ? 'Voor:' : 'Before:'}</span>
            <span className="text-blue-700 font-bold ml-2">€{monthlyPensionBefore.toFixed(2)}/mnd</span>
          </p>
          <p>
            <span className="font-semibold">{language === 'nl' ? 'Na:' : 'After:'}</span>
            <span className="text-blue-700 font-bold ml-2">€{monthlyPensionAfter.toFixed(2)}/mnd</span>
          </p>
          {selectedPercentage > 0 && (
            <p className="text-red-600 font-semibold mt-2">
              {language === 'nl' 
                ? `−€${(monthlyPensionBefore - monthlyPensionAfter).toFixed(2)}/mnd permanent`
                : `−€${(monthlyPensionBefore - monthlyPensionAfter).toFixed(2)}/month permanently`}
            </p>
          )}
        </div>
      </div>

      {/* Plain-language summary */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-100 text-sm text-gray-700">
        {selectedPercentage === 0 ? (
          <p>
            {language === 'nl'
              ? '✅ Geen lump sum nemen. Uw pensioen blijft stabiel en u behoudt recht op toeslagen.'
              : '✅ Taking no lump sum. Your pension stays stable and you keep benefit eligibility.'}
          </p>
        ) : (
          <p>
            {language === 'nl'
              ? `Nemen van ${selectedPercentage}% bedrag ineens geeft u €${selectedAmount.toFixed(2)} nu, maar uw maandelijkse pensioen daalt permanent met €${(monthlyPensionBefore - monthlyPensionAfter).toFixed(2)}. Dit kan u ook uit toeslaginrkeingsbereiken brengen.`
              : `Taking ${selectedPercentage}% lump sum gives you €${selectedAmount.toFixed(2)} now, but your monthly pension drops permanently by €${(monthlyPensionBefore - monthlyPensionAfter).toFixed(2)}. This may also affect your benefit eligibility.`}
          </p>
        )}
      </div>
    </div>
  );
}
