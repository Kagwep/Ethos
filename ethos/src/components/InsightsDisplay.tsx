import React from 'react';
import { 
  ChartBar, 
  Lightbulb, 
  AlertTriangle, 
  ArrowRight, 
  ScrollText,
  Target
} from 'lucide-react';

export interface InsightsResponse {
  insights?: string;
  error?: string;
  details?: {
    summary: string;
    keyPoints: string[];
    recommendations?: string[];
    risks?: string[];
  };
}

const InsightsDisplay = ({ data }: { data: InsightsResponse }) => {
  if (!data || data.error) {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-700 font-semibold text-lg mb-2">
          <AlertTriangle className="w-5 h-5" />
          Analysis Error
        </div>
        <p className="text-red-700">
          {data?.error || 'Failed to generate insights'}
        </p>
      </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg mb-4">
            <ScrollText className="w-5 h-5" />
            Analysis Summary
          </div>
          <p className="text-gray-700 leading-relaxed">
            {data.details?.summary}
          </p>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-lg">
              <ChartBar className="w-5 h-5" />
              Key Findings
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Important patterns and insights discovered in the data
            </p>
          </div>
          <div className="space-y-3">
            {data.details?.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 text-emerald-500" />
                <p className="text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {data.details?.recommendations && data.details.recommendations.length > 0 && (
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-purple-700 font-semibold text-lg">
                <Target className="w-5 h-5" />
                Recommendations
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Actionable insights and suggestions
              </p>
            </div>
            <div className="space-y-3">
              {data.details.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-1 flex-shrink-0 text-purple-500" />
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risks */}
      {data.details?.risks && data.details.risks.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-lg">
                <AlertTriangle className="w-5 h-5" />
                Potential Risks
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Areas that require attention or further investigation
              </p>
            </div>
            <div className="space-y-3">
              {data.details.risks.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0 text-amber-500" />
                  <p className="text-gray-700">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default InsightsDisplay;