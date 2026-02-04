'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';

// Hardcoded content as fallback
const introContent = {
  nl: {
    title: 'Wat is een eenmalige uitkering bij pensioen?',
    description: 'Nieuwe Nederlandse pensionwetgeving geeft u de mogelijkheid om tot 10% van uw pensioenopbouw eenmalig op te nemen ("bedrag ineens"). Dit klinkt eenvoudig, maar de echte impact is complex.',
    impactTitle: 'Wat zijn de gevolgen van een eenmalige uitkering?',
    impacts: [
      {
        icon: '📈',
        title: 'Hogere belastingen in het ontvangstjaar',
        description: 'De eenmalige uitkering is belastbaar en kan u in een hoger belastingtarief brengen'
      },
      {
        icon: '🏠',
        title: 'Verlies of vermindering van inkomensafhankelijke toeslagen',
        description: 'Uw inkomsten stijgen tijdelijk, waardoor u huurtoeslag of zorgtoeslag kunt verliezen'
      },
      {
        icon: '📊',
        title: 'Effecten op uw maandelijke pensioen',
        description: 'Een eenmalige uitkering betekent minder vermogen voor pensioen-inkomsten later'
      }
    ],
    keyMessage: 'Deze effecten hangen af van meerdere interactieve regels: belastingwetgeving, pensioenwetten en gemeentelijke regelingen.',
    solutionTitle: 'Hoe helpt deze tool?',
    solutionPoints: [
      'Vergelijk verschillende scenario\'s (0%, 5%, 10% uitkering)',
      'Zie précies wat de gevolgen zijn voor uw inkomsten',
      'Begrijp welke regels van toepassing zijn en waarom',
      'Maak een weloverwogen keuze met volledige transparantie'
    ],
    cta: 'Begin met de Scenario Bouwen tab om uw situatie te verkennen',
  },
  en: {
    title: 'What is a lump sum pension withdrawal?',
    description: 'New Dutch pension legislation gives you the option to withdraw up to 10% of your pension savings at retirement ("bedrag ineens"). While this sounds simple, the real-world impact is complex.',
    impactTitle: 'What are the consequences of a lump sum withdrawal?',
    impacts: [
      {
        icon: '📈',
        title: 'Higher taxes in the withdrawal year',
        description: 'The lump sum is taxable income and may push you into a higher tax bracket'
      },
      {
        icon: '🏠',
        title: 'Loss or reduction of income-dependent allowances',
        description: 'Your income temporarily rises, causing you to lose housing or healthcare allowances'
      },
      {
        icon: '📊',
        title: 'Effects on your monthly pension income',
        description: 'A lump sum means less capital earning pension income later'
      }
    ],
    keyMessage: 'These effects depend on multiple interacting rules: national tax law, pension rules, and municipal regulations.',
    solutionTitle: 'How does this tool help?',
    solutionPoints: [
      'Compare different scenarios (0%, 5%, 10% withdrawal)',
      'See exactly what the impact is on your income',
      'Understand which rules apply and why',
      'Make an informed choice with complete transparency'
    ],
    cta: 'Start with the Build Scenario tab to explore your situation',
  }
};

export default function IntroductionSection() {
  const { language } = useLanguage();
  const intro = introContent[language as keyof typeof introContent] || introContent.nl;

  return (
    <div className="space-y-8 mb-12">
      {/* Hero Section with Image */}
      <div className="relative rounded-lg shadow-xl overflow-hidden bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {intro.title}
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                {intro.description}
              </p>
            </div>

            {/* Impact Cards */}
            <div className="space-y-4 mt-8">
              <h3 className="text-3xl font-bold text-gray-900">{intro.impactTitle}</h3>
              <div className="space-y-4">
                {intro.impacts.map((impact: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-5 rounded-lg">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl flex-shrink-0">{impact.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xl">{impact.title}</h4>
                        <p className="text-gray-700 mt-2 text-lg">{impact.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Message */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mt-8">
              <p className="text-gray-900 font-semibold text-center text-xl">
                ⚠️ {intro.keyMessage}
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex justify-center items-center">
            <div className="relative w-full h-96 lg:h-full min-h-96 rounded-lg overflow-hidden shadow-lg bg-gray-200">
              <Image
                src="/pension-image.jpg"
                alt="Pension Decision Making"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
