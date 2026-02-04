'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

type ApiType = 'openai' | 'google';

interface ChatBotProps {
  calculationContext?: any;
}

const detectApiType = (key: string): ApiType => {
  if (key.startsWith('sk-')) return 'openai';
  if (key.startsWith('AIza')) return 'google';
  return 'openai'; // default
};

export default function ChatBot({ calculationContext }: ChatBotProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiType, setApiType] = useState<ApiType>('openai');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('chat_api_key') || '';
    setApiKey(savedKey);
    setTempApiKey(savedKey);
    setApiType(detectApiType(savedKey));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      const detectedType = detectApiType(tempApiKey);
      setApiKey(tempApiKey);
      setApiType(detectedType);
      localStorage.setItem('chat_api_key', tempApiKey);
      localStorage.setItem('chat_api_type', detectedType);
      setShowApiKeyModal(false);
    }
  };

  const buildSystemPrompt = () => {
    const context = calculationContext ? `
Current Pension Calculation Data:
- Gross Income: €${calculationContext.gross_income}
- Pension Contribution: ${calculationContext.pension_contribution_pct}%
- Lump Sum Withdrawal: ${calculationContext.lump_sum_percentage}%
- Income Tax: €${calculationContext.income_tax}
- Housing Allowance: €${calculationContext.huurtoeslag}
- Healthcare Allowance: €${calculationContext.zorgtoeslag}
- Net Monthly Income: €${(calculationContext.net_income / 12).toFixed(2)}
- Effective Tax Rate: ${calculationContext.effective_tax_rate}%

Tax Brackets 2025:
- 0-€36,950: 11.55%
- €36,950-€71,900: 23.85%
- €71,900-€96,750: 40.5%
- Above €96,750: 49.5%

Dutch Social Benefits:
- Housing Allowance (Huurtoeslag)
- Healthcare Allowance (Zorgtoeslag)
- Child Budget (Kindgebonden Budget)
- AOW Premium
- WW Premium
` : '';

    return `You are a professional financial advisor for Dutch pension and benefits calculations. You provide clear, professional advice in ${language === 'nl' ? 'Dutch (formal and spoken)' : 'English'}.

${context}

When answering questions:
1. Reference specific calculations when relevant
2. Explain Dutch tax laws and benefits clearly
3. Be professional but approachable
4. Provide actionable insights
5. If asked about complex scenarios, suggest consulting a tax professional for official advice

Always respond in the language the user is using.`;
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Show modal if no API key and user tries to send
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      if (apiType === 'openai') {
        await sendToOpenAI(currentInput, messages);
      } else if (apiType === 'google') {
        await sendToGoogle(currentInput, messages);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: language === 'nl'
          ? `Fout: ${error.message}. Controleer uw API-sleutel.`
          : `Error: ${error.message}. Please check your API key.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendToOpenAI = async (input: string, previousMessages: Message[]) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          ...previousMessages.map((msg) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: input,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response');
    }

    const data = await response.json();
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: data.choices[0].message.content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const sendToGoogle = async (input: string, previousMessages: Message[]) => {
    // Convert to Gemini format
    const contents = [
      ...previousMessages
        .filter((msg) => msg.type === 'user' || msg.type === 'bot')
        .map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      {
        role: 'user',
        parts: [{ text: input }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: buildSystemPrompt() }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Google');
    }

    const data = await response.json();
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: data.candidates[0]?.content?.parts[0]?.text || 'No response',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center text-2xl hover:scale-110 z-40"
        title={language === 'nl' ? 'Chat-assistent openen' : 'Open chat assistant'}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col h-96 z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">
                {language === 'nl' ? 'Pensioen Assistent' : 'Pension Assistant'}
              </h3>
              <p className="text-xs text-indigo-100">
                {language === 'nl' ? 'Vragen over uw pensioen en berekeningen' : 'Questions about your pension and calculations'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-indigo-100 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-4 space-y-3">
                <p className="text-2xl">👋</p>
                <p>{language === 'nl' ? 'Hallo! Stel vragen over uw pensioen en berekeningen.' : 'Hello! Ask questions about your pension and calculations.'}</p>
                {!apiKey && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 mt-4 space-y-2">
                    <p className="font-semibold">
                      {language === 'nl' ? '🔑 API-sleutel benodigd' : '🔑 API key required'}
                    </p>
                    <p className="text-blue-600">{language === 'nl' ? 'Kies een optie:' : 'Choose one:'}</p>
                    <div className="space-y-1 ml-2">
                      <div>
                        <p className="font-semibold text-blue-800">OpenAI (sk-...)</p>
                        <a
                          href="https://platform.openai.com/account/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800 text-xs"
                        >
                          → {language === 'nl' ? 'Sleutel ophalen' : 'Get key'}
                        </a>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800">Google Gemini (AIza...)</p>
                        <a
                          href="https://aistudio.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800 text-xs"
                        >
                          → {language === 'nl' ? 'Sleutel ophalen' : 'Get key'}
                        </a>
                      </div>
                    </div>
                    <p className="text-blue-600 mt-2 font-semibold">
                      {language === 'nl' ? 'Klik op ⚙️ om in te voeren' : 'Click ⚙️ to enter'}
                    </p>
                  </div>
                )}
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={language === 'nl' ? 'Uw vraag...' : 'Your question...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputValue.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              {language === 'nl' ? 'Sturen' : 'Send'}
            </button>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
              title={language === 'nl' ? 'API-sleutel configureren' : 'Configure API key'}
            >
              ⚙️
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {language === 'nl' ? 'AI-assistent configureren' : 'Configure AI Assistant'}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              {language === 'nl'
                ? 'Voer een API-sleutel in van OpenAI of Google. Dit wordt lokaal opgeslagen.'
                : 'Enter an API key from OpenAI or Google. This is stored locally.'}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-xs text-blue-700 space-y-2">
              <p className="font-semibold mb-2">✅ {language === 'nl' ? 'Ondersteunde services' : 'Supported services'}</p>
              <div className="space-y-2">
                <div className="border-b border-blue-200 pb-2">
                  <p className="font-semibold">OpenAI</p>
                  <p>{language === 'nl' ? 'Sleutel begint met sk-' : 'Key starts with sk-'}</p>
                  <p className="text-blue-600 text-xs mt-1">
                    {language === 'nl'
                      ? '1. Ga naar https://platform.openai.com/account/api-keys'
                      : '1. Go to https://platform.openai.com/account/api-keys'}
                  </p>
                  <p className="text-blue-600 text-xs">
                    {language === 'nl' ? '2. Kopieer de sleutel (sk-xxxxx...)' : '2. Copy the key (sk-xxxxx...)'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Google Gemini</p>
                  <p>{language === 'nl' ? 'Sleutel begint met AIza' : 'Key starts with AIza'}</p>
                  <p className="text-blue-600 text-xs mt-1">
                    {language === 'nl'
                      ? '1. Ga naar https://aistudio.google.com'
                      : '1. Go to https://aistudio.google.com'}
                  </p>
                  <p className="text-blue-600 text-xs">
                    {language === 'nl'
                      ? '2. Klik op "Get API key" in linkermenu'
                      : '2. Click "Get API key" in left menu'}
                  </p>
                  <p className="text-blue-600 text-xs">
                    {language === 'nl'
                      ? '3. Kopieer ALLEEN de sleutel (AIzaxxxxx...)'
                      : '3. Copy ONLY the key (AIzaxxxxx...)'}
                  </p>
                </div>
              </div>
            </div>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder={language === 'nl' ? 'Plak uw sleutel hier (sk-... of AIza...)' : 'Paste your key here (sk-... or AIza...)'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {tempApiKey && (
              <div className="mb-4">
                {(tempApiKey.includes('://') || tempApiKey.includes('aistudio') || tempApiKey.includes('platform')) ? (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                    <p className="font-semibold mb-1">❌ {language === 'nl' ? 'Dit is een URL, geen sleutel!' : 'This is a URL, not a key!'}</p>
                    <p>
                      {language === 'nl'
                        ? 'Plak ALLEEN de sleutel (begint met sk- of AIza), niet de hele URL.'
                        : 'Paste ONLY the key (starts with sk- or AIza), not the full URL.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="text-gray-700 text-xs">
                      {language === 'nl' ? 'Gedetecteerde service: ' : 'Detected service: '}
                      <span className="font-semibold text-green-700">
                        {detectApiType(tempApiKey) === 'openai' ? 'OpenAI' : 'Google Gemini'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={saveApiKey}
                disabled={!tempApiKey.trim()}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {language === 'nl' ? 'Opslaan' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setTempApiKey(apiKey);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                {language === 'nl' ? 'Annuleren' : 'Cancel'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {language === 'nl'
                ? '🔒 Uw API-sleutel is veilig opgeslagen in uw browser en wordt nooit naar servers verzonden.'
                : '🔒 Your API key is securely stored in your browser and never sent to our servers.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
