import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Check, AlertTriangle, Info, X } from 'lucide-react';
import { OpenAI } from 'openai';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface InsightsTriggerProps {
  ipfsHash: string;
  children?: React.ReactNode;
}

interface DataInsightsModalProps {
  ipfsHash: string;
  onClose: () => void;
}

interface InsightsData {
  Summary: string;
  KeyFindings: string[];
  StatisticalAnalysis: string;
  Trends: string;
  Recommendations: string[];
  PotentialIssues?: string[];
}

// Alert component using pure Tailwind
const Alert: React.FC<AlertProps> = ({ children, variant = 'default' }) => {
  const baseClasses = "p-4 rounded-lg flex items-start gap-3 text-sm";
  const variants = {
    default: "bg-blue-50 text-blue-800 border border-blue-200",
    destructive: "bg-red-50 text-red-800 border border-red-200"
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </div>
  );
};

// Button to trigger the modal
export const InsightsTrigger: React.FC<InsightsTriggerProps> = ({ ipfsHash, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {children || 'View Insights'}
      </button>
      
      {isOpen && (
        <DataInsightsModal 
          ipfsHash={ipfsHash} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
};

const DataInsightsModal: React.FC<DataInsightsModalProps> = ({ ipfsHash, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeIpfsData = async () => {
      try {
        // Fetch IPFS data
        const response = await fetch(ipfsHash);
        const ipfsData = await response.json();
        
        // Analyze with OpenAI
        const openai = new OpenAI({
          apiKey: process.env.REACT_APP_ETHOS as string,
          dangerouslyAllowBrowser: true
        });

        const analysisResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Analyze this data and provide detailed insights in the following structure:
                - Summary: Brief overview of the data
                - Key Findings: Major patterns and insights (as array)
                - Statistical Analysis: Important statistical measures
                - Trends: Notable trends and patterns
                - Recommendations: Suggested actions or further analysis (as array)
                - Potential Issues: Data quality or concerning patterns (as array)
                
                Format the response as a JSON object with these keys.`
            },
            {
              role: "user",
              content: JSON.stringify(ipfsData)
            }
          ],
          temperature: 0.5,
          max_tokens: 1000
        });

        
        const analysisResults = JSON.parse(analysisResponse.choices[0].message.content || '') as InsightsData;
        console.log(analysisResults)

        setInsights(analysisResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    analyzeIpfsData();
  }, [ipfsHash]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-700">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold ">Data Insights</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-800 hover:bg-gray-100 rounded-full"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Analyzing data...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>Error analyzing data: {error}</div>
            </Alert>
          )}

          {insights && (
            <div className="space-y-6">
              {/* Summary */}
              <Alert>
                <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Summary</h3>
                  <p className="text-sm">{insights.Summary}</p>
                </div>
              </Alert>

              {/* Key Findings */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Key Findings
                </h2>
                <div className="space-y-2">
                  {insights.KeyFindings?.map((finding, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                      <p className="text-gray-700">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats and Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold mb-4">Statistical Analysis</h2>
                  <p className="text-gray-700">{insights.StatisticalAnalysis}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold mb-4">Trends</h2>
                  <p className="text-gray-700">{insights.Trends}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Recommendations
                </h2>
                <ul className="space-y-2">
                  {insights.Recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 font-medium">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Issues */}
              {insights.PotentialIssues && insights.PotentialIssues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Potential Issues</h3>
                    <ul className="space-y-2">
                      {insights.PotentialIssues.map((issue, index) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </div>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsTrigger;