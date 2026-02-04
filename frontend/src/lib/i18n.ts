export type Language = 'nl' | 'en';

export const translations = {
  nl: {
    // Header & Navigation
    title: '🇳🇱 Pensioen Beslissingstool',
    subtitle: 'Inzicht in uw pensioenkeuzes',
    tabs: {
      builder: 'Scenario Bouwen',
      compare: 'Vergelijken',
      explain: 'Regels Uitleggen',
    },
    
    // Language selector
    language: 'Taal',
    
    // Introduction Section
    intro: {
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
    
    // Builder Tab
    builder: {
      title: 'Bouw uw Scenario',
      description: 'Voer uw persoonlijke gegevens in en zien hoe pensioenkeuzes u beïnvloeden',
      
      income: 'Jaarlijkse Bruto Inkomsten',
      incomeHelp: 'Uw totale jaarlijkse bruto salaris voor inkomstenbelasting',
      
      pensionPercentage: 'Pensioenbijdrage (%)',
      pensionHelp: 'Percentage van uw bruto inkomsten dat naar pensioen gaat',
      
      lumpSum: 'Eenmalige Uitkering bij Pensionering (%)',
      lumpSumHelp: 'Nederlandse wet: tot 10% van pensioenopbouw kan eenmalig worden opgenomen',
      
      housing: 'Maandelijkse Woonkosten',
      housingHelp: 'Uw huurkosten (voor huurtoeslag berekening)',
      
      children: 'Aantal Kinderen',
      childrenHelp: 'Aantal onderhoudsplichtigen onder 18 jaar',
      
      maritalStatus: 'Burgerlijke Status',
      maritalStatusHelp: 'Voor berekening van toeslagen en belastingkortingen',
      single: 'Ongehuwd',
      married: 'Gehuwd/Samenwonend',
      
      calculate: 'Berekenen',
      
      results: 'Resultaten',
      grossIncome: 'Bruto Inkomsten',
      pensionContribution: 'Pensioenbijdrage',
      taxableIncome: 'Belastbaar Inkomen',
      incomeTax: 'Inkomstenbelasting',
      aowPremium: 'AOW Premie',
      wwPremium: 'WW Premie',
      totalDeductions: 'Totale Aftrekken',
      
      benefits: 'Toeslagen & Tegemoetkomingen',
      housingAllowance: 'Huurtoeslag',
      healthcareSubsidy: 'Zorgtoeslag',
      childBenefit: 'Kindgebonden Budget',
      totalBenefits: 'Totale Tegemoetkomingen',
      
      netIncome: 'Maandelijks Netto Inkomen',
      monthlyBreakdown: 'Maandelijkse Uitsplitsing',
      
      explanation: 'Waarom ziet u deze bedragen?',
      lumpSumExplanation: 'Eenmalige Uitkering Toelichting',
      lumpSumDescription: 'Als u 10% opneemt bij pensionering:',
      
      tax: {
        title: 'Belastingberekening',
        brackets2025: '2025 Belastingtarieven:',
        bracket1: 'Tot €36.950: 11,55%',
        bracket2: 'Tot €71.900: 23,85%',
        bracket3: 'Tot €96.750: 40,5%',
        bracket4: 'Boven: 49,5%',
        allowance: 'Algemene Aftrek: €3.107/jaar',
      },
    },
    
    // Comparison Tab
    compare: {
      title: 'Vergelijk Scenario\'s',
      description: 'Zien hoe verschillende pensioenkeuzes verschillen',
      setup: 'Scenario Instellingen',
      compare: 'Vergelijken',
      results: 'Vergelijkingsresultaten',
      scenario: 'Scenario',
      difference: 'Verschil',
      percentChange: 'Verandering',
      insights: 'Inzichten',
    },
    
    // Rules Tab
    explain: {
      title: 'Begrijp de Regels',
      description: 'Ontdek hoe Nederlandse pensioenwetten werken',
      selectRule: 'Selecteer een Regel',
      rule: 'Regel',
      category: 'Categorie',
      legalReference: 'Wettelijke Basis',
      year: 'Jaar',
      brackets: 'Belastingtarieven',
      thresholds: 'Inkomstendrempels',
      testCalculation: 'Testberekening',
      income: 'Testinkomsten',
      calculate: 'Testen',
      result: 'Resultaat',
      ruleDescription: 'Beschrijving',
      formula: 'Formule',
      example: 'Voorbeeld',
    },
    
    // Help & Info
    help: {
      whyThis: 'Waarom ziet u dit?',
      howWorks: 'Hoe werkt dit?',
      thresholdEffect: 'Drempeleffect',
      thresholdDesc: 'Een klein inkomensverschil kan grote gevolgen hebben vanwege inkomensdrempels',
      cliffEffect: 'Cliff-effect',
      cliffDesc: 'Meer inkomsten kunnen tot minder netto-inkomen leiden omdat toeslagen wegvallen',
      disclaimer: 'Disclaimer: Deze tool geeft geen bindend juridisch of financieel advies. Raadpleeg een professional.',
    },
    
    // Common
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    retry: 'Opnieuw Proberen',
    close: 'Sluiten',
    more: 'Meer informatie',
    less: 'Minder informatie',
  },
  
  en: {
    // Header & Navigation
    title: '🇳🇱 Pension Decision Tool',
    subtitle: 'Insight into your pension choices',
    tabs: {
      builder: 'Build Scenario',
      compare: 'Compare Scenarios',
      explain: 'Explain Rules',
    },
    
    // Language selector
    language: 'Language',
    
    // Introduction Section
    intro: {
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
    },
    
    // Builder Tab
    builder: {
      title: 'Build Your Scenario',
      description: 'Enter your personal information and see how pension choices affect you',
      
      income: 'Annual Gross Income',
      incomeHelp: 'Your total annual gross salary before income tax',
      
      pensionPercentage: 'Pension Contribution (%)',
      pensionHelp: 'Percentage of your gross income going to pension',
      
      lumpSum: 'Lump Sum at Retirement (%)',
      lumpSumHelp: 'Dutch law: up to 10% of pension can be withdrawn as lump sum',
      
      housing: 'Monthly Housing Costs',
      housingHelp: 'Your rent (used for housing allowance calculation)',
      
      children: 'Number of Children',
      childrenHelp: 'Number of dependents under 18',
      
      maritalStatus: 'Marital Status',
      maritalStatusHelp: 'Used to calculate allowances and tax benefits',
      single: 'Single',
      married: 'Married/Cohabiting',
      
      calculate: 'Calculate',
      
      results: 'Results',
      grossIncome: 'Gross Income',
      pensionContribution: 'Pension Contribution',
      taxableIncome: 'Taxable Income',
      incomeTax: 'Income Tax',
      aowPremium: 'AOW Premium',
      wwPremium: 'WW Premium',
      totalDeductions: 'Total Deductions',
      
      benefits: 'Allowances & Benefits',
      housingAllowance: 'Housing Allowance',
      healthcareSubsidy: 'Healthcare Subsidy',
      childBenefit: 'Child Benefit',
      totalBenefits: 'Total Benefits',
      
      netIncome: 'Monthly Net Income',
      monthlyBreakdown: 'Monthly Breakdown',
      
      explanation: 'Why do you see these amounts?',
      lumpSumExplanation: 'Lump Sum Explanation',
      lumpSumDescription: 'If you withdraw 10% at retirement:',
      
      tax: {
        title: 'Tax Calculation',
        brackets2025: '2025 Tax Brackets:',
        bracket1: 'Up to €36,925: 11.55%',
        bracket2: 'Up to €72,237: 23.85%',
        bracket3: 'Up to €115,662: 40.5%',
        bracket4: 'Above: 49.5%',
        allowance: 'General Tax Allowance: €3,107/year',
      },
    },
    
    // Comparison Tab
    compare: {
      title: 'Compare Scenarios',
      description: 'See how different pension choices differ',
      setup: 'Scenario Setup',
      compare: 'Compare',
      results: 'Comparison Results',
      scenario: 'Scenario',
      difference: 'Difference',
      percentChange: 'Change',
      insights: 'Insights',
    },
    
    // Rules Tab
    explain: {
      title: 'Understand the Rules',
      description: 'Explore how Dutch pension laws work',
      selectRule: 'Select a Rule',
      rule: 'Rule',
      category: 'Category',
      legalReference: 'Legal Basis',
      year: 'Year',
      brackets: 'Tax Brackets',
      thresholds: 'Income Thresholds',
      testCalculation: 'Test Calculation',
      income: 'Test Income',
      calculate: 'Test',
      result: 'Result',
      ruleDescription: 'Description',
      formula: 'Formula',
      example: 'Example',
    },
    
    // Help & Info
    help: {
      whyThis: 'Why do you see this?',
      howWorks: 'How does this work?',
      thresholdEffect: 'Threshold Effect',
      thresholdDesc: 'A small income difference can have large consequences due to income thresholds',
      cliffEffect: 'Cliff Effect',
      cliffDesc: 'Higher income can result in less net income because benefits are lost',
      disclaimer: 'Disclaimer: This tool does not provide binding legal or financial advice. Consult a professional.',
    },
    
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
    more: 'More information',
    less: 'Less information',
  },
};

export function getTranslation(lang: Language, key: string): any {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return value;
}
