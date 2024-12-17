import React, { useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';

const ResponseView = ({ survey, onBack, onSubmit }:{ survey: any, onBack: any, onSubmit: any }) => {
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleSubmit = async () => {
      if (!response.trim()) {
        alert('Please enter a response');
        return;
      }
  
      setIsSubmitting(true);
      try {
        await onSubmit(survey.id, response);
        // Success is handled by parent component
      } catch (error) {
        console.error('Failed to submit response:', error);
        alert('Failed to submit response. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Surveys
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-green-700">{survey.name}</h1>
            <p className="text-green-600">Submit your response</p>
          </div>
        </div>
  
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Reward: {survey.rewardPerResponse / 100_000_000} HBAR</span>
              <span>Ends: {new Date(survey.endDate * 1000).toLocaleDateString()}</span>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Your Response</h3>
              <textarea
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
  
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Response
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ResponseView;