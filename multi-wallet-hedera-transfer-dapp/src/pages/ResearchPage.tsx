import React, { useState } from 'react';
import { Send, Link, Brain, Loader2, Coins, X } from 'lucide-react';
import { DataAnalysisAgent } from '../components/DataAnalysisAgent';
import { HederaMessageSender } from '../services/HederaMessageSender';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InsightsState {
  initialAnalysis: string;
  messages: Message[];
  error?: string;
}

const AIResearchInsights = () => {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [insights, setInsights] = useState<InsightsState>({
    initialAnalysis: '',
    messages: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('5');
  const [showModal, setShowModal] = useState(false);

  const agent = new DataAnalysisAgent({
    openaiApiKey: process.env.REACT_APP_ETHOS as any || ' '
  });


  const sender = new HederaMessageSender(
    process.env.REACT_APP_MY_ACCOUNT_ID!,
    process.env.REACT_APP_MY_ETHOS!
  );

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response_data = await fetch(url);
      const ipfsData = await response_data.json();
      const response = await agent.analyzeData(ipfsData);
      setInsights({
        initialAnalysis: response.insights,
        messages: [],
        error: response.error
      });
    } catch (error) {
      setInsights({
        initialAnalysis: '',
        messages: [],
        error: `Failed to analyze data: ${(error as any).message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !insights.initialAnalysis) return;
    
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setInsights(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    
    try {
      const response = await agent.askFollowUp(insights.initialAnalysis, message);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.error || response.insights,
        timestamp: new Date()
      };

      setInsights(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        error: response.error
      }));
    } catch (error) {
      setInsights(prev => ({
        ...prev,
        error: `Failed to process follow-up: ${(error as any).message}`
      }));
    }
    
    setMessage('');
  };

  const handleFundAgent = () => {
    console.log(`Funding agent: $${amount}`);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setShowModal(true)}
          className="absolute top-10 px-4 my-12 mx-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
        >
          <Coins className="w-4 h-4" />
          Fund Agent
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Fund Ethos AI Agent</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600">
                  Support this AI agent to help it continue providing research insights and analysis.
                </p>
                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
                <button
                  onClick={handleFundAgent}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Coins className="w-4 h-4" />
                  Fund Agent
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 mt-12">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Link className="w-5 h-5" />
                Enter Data URL
              </h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your JSON data..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  Analyze
                </button>
              </form>
            </div>
          </div>

          {insights.error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{insights.error}</p>
                </div>
              </div>
            </div>
          )}

          {insights.initialAnalysis && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Initial Analysis</h2>
              </div>
              <div className="p-4">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{insights.initialAnalysis}</p>
                </div>
              </div>
            </div>
          )}

          {insights.messages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Conversation History</h2>
              </div>
              <div className="p-4 space-y-4">
                {insights.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.initialAnalysis && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Ask Follow-up Questions</h2>
              </div>
              <div className="p-4">
                <form onSubmit={handleMessageSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a question about this data..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResearchInsights;