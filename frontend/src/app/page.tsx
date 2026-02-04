'use client';

import React, { useState } from 'react';
import ScenarioComparison from '@/components/ScenarioComparison';
import RuleExplainer from '@/components/RuleExplainer';
import ScenarioBuilder from '@/components/ScenarioBuilder';
import IntroductionSection from '@/components/IntroductionSection';
import RuleTracePanel from '@/components/RuleTracePanel';
import ChatBot from '@/components/ChatBot';
import { LanguageProvider, useLanguage } from '@/lib/language-context';

function PageContent() {
  const [activeTab, setActiveTab] = useState<'intro' | 'explain'>('intro');
  const [calculationData, setCalculationData] = useState<any>(null);
  const [builderParams, setBuilderParams] = useState<any>({
    grossIncome: 50000,
    pensionPct: 5,
    housingCosts: 400,
    children: 0,
  });
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Tax Year 2025 | Rules-as-Code
              </div>
              {/* Language Selector */}
              <div className="flex space-x-2 border-l border-gray-200 pl-4">
                <button
                  onClick={() => setLanguage('nl')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                    language === 'nl'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🇳🇱 NL
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                    language === 'en'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('intro')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'intro'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ℹ️ {language === 'nl' ? 'Introductie' : 'Introduction'}
            </button>
            <button
              onClick={() => setActiveTab('explain')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'explain'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚖️ {t('tabs.explain')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'intro' && (
          <div className="space-y-12">
            <IntroductionSection />
            <div className="border-t-2 border-gray-300 pt-12">
              <ScenarioBuilder onCalculationUpdate={setCalculationData} onParamsUpdate={setBuilderParams} />
            </div>
            
            {/* Rule Trace Panel - Shows WHY outcomes changed */}
            {calculationData && (
              <div className="border-t-2 border-gray-300 pt-12">
                <RuleTracePanel 
                  calculationData={calculationData} 
                  lumpSumPercentage={builderParams.lumpSumPct}
                  grossIncome={builderParams.grossIncome}
                />
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 pt-12">
              <ScenarioComparison baseParams={builderParams} />
            </div>
          </div>
        )}
        {activeTab === 'explain' && <RuleExplainer />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">{language === 'nl' ? 'Over' : 'About'}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Over het Project' : 'About the Project'}</a></li>
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Gebruikte Regels' : 'Rules Used'}</a></li>
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Privacybeleid' : 'Privacy Policy'}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{language === 'nl' ? 'Bronnen' : 'Resources'}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://belastingdienst.nl" target="_blank" className="hover:text-white">Belastingdienst.nl</a></li>
                <li><a href="https://toeslagen.nl" target="_blank" className="hover:text-white">Toeslagen.nl</a></li>
                <li><a href="https://uwv.nl" target="_blank" className="hover:text-white">UWV.nl</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{language === 'nl' ? 'Juridisch' : 'Legal'}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Belastingwet 2025' : 'Tax Law 2025'}</a></li>
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Toeslagenregels' : 'Benefits Rules'}</a></li>
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Pensioenwet' : 'Pension Law'}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{language === 'nl' ? 'Ondersteuning' : 'Support'}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Documentatie' : 'Documentation'}</a></li>
                <li><a href="#" className="hover:text-white">{language === 'nl' ? 'Contact' : 'Contact'}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{language === 'nl' ? 'Gebouwd met transparantie voor Nederlandse burgers | Rules-as-Code Platform 2025' : 'Built with transparency for Dutch citizens | Rules-as-Code Platform 2025'}</p>
            <p className="mt-2 text-xs text-gray-400">{t('help.disclaimer')}</p>
          </div>
        </div>
      </footer>

      {/* Chat Bot */}
      <ChatBot calculationContext={calculationData} />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <PageContent />
    </LanguageProvider>
  );
}
