
  // ResponseRenderer.tsx
  import React, { useState, useEffect } from 'react';
  import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
  import { FormStructure, FormResponse } from '../config/types';
  import { ContractResponse, SurveyResponse } from '../config/types';
  
  interface ResponseRendererProps {
    survey: {
      id: string;
      name: string;
      ipfsHash: string;
    };
    response: ContractResponse & {
      surveyId: number;
      responseId: number;
    };
    onBack: () => void;
    onApprove?: (surveyId: number, responseId: number) => Promise<void>;
    onPay?: (surveyId: number, responseId: number) => Promise<void>;
  }
  
  const ResponseRenderer: React.FC<ResponseRendererProps> = ({
    survey,
    response,
    onBack,
    onApprove,
    onPay,
  }) => {
    const [formStructure, setFormStructure] = useState<FormStructure | null>(null);
    const [responseData, setResponseData] = useState<FormResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);
  
          // Fetch form structure and response data in parallel
          const [formResponse, responseDataResponse] = await Promise.all([
            fetch(survey.ipfsHash),
            fetch(response.ipfsHash)
          ]);
  
          if (!formResponse.ok || !responseDataResponse.ok) {
            throw new Error('Failed to fetch data');
          }
  
          const [formData, respData] = await Promise.all([
            formResponse.json(),
            responseDataResponse.json()
          ]);
  
          setFormStructure(formData);
          setResponseData(respData);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load response data');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [survey.ipfsHash, response.ipfsHash]);
  
    const handleApprove = async () => {
      if (!onApprove) return;
      
      try {
        setIsProcessing(true);
        await onApprove(response.surveyId, response.responseId);
      } catch (err) {
        console.error('Error approving response:', err);
        alert('Failed to approve response');
      } finally {
        setIsProcessing(false);
      }
    };
  
    const handlePay = async () => {
      if (!onPay) return;
      
      try {
        setIsProcessing(true);
        await onPay(response.surveyId, response.responseId);
      } catch (err) {
        console.error('Error paying response:', err);
        alert('Failed to pay response');
      } finally {
        setIsProcessing(false);
      }
    };
  
    const renderFieldValue = (field: any, value: any) => {
      switch (field.type) {
        case 'checkbox':
          return Array.isArray(value) ? (
            <div className="space-y-1">
              {value.map((item, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : null;
  
        case 'imageFile':
          return value ? (
            <div className="mt-2">
              <img
                src={value}
                alt="Uploaded response"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
              <p className="text-sm text-gray-500 mt-1">IPFS: {value}</p>
            </div>
          ) : null;
  
        case 'textarea':
          return (
            <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
              {value}
            </div>
          );
  
        default:
          return <div className="text-gray-700">{value}</div>;
      }
    };
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      );
    }
  
    if (error || !formStructure || !responseData) {
      return (
        <div className="p-8 text-center text-red-600">
          {error || 'Failed to load response data'}
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Responses
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-green-700">{survey.name}</h1>
            <p className="text-green-600">Response Details</p>
          </div>
        </div>
  
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
          <div className="space-y-6">
            {/* Response Status */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {response.isApproved ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approved
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600">
                    <XCircle className="w-4 h-4 mr-1" /> Pending Approval
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment:</span>
                {response.isPaid ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Paid
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600">
                    <XCircle className="w-4 h-4 mr-1" /> Unpaid
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Respondent:</span>
                <span className="font-mono text-gray-600">{response.respondent}</span>
              </div>
            </div>
  
            {/* Action Buttons */}
            <div className="flex gap-4">
              {!response.isApproved && onApprove && (
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Approve Response'
                  )}
                </button>
              )}
              {response.isApproved && !response.isPaid && onPay && (
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Pay Reward'
                  )}
                </button>
              )}
            </div>
  
            {/* Response Data */}
            <div className="border-t pt-4">
              <div className="space-y-6">
                {formStructure.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFieldValue(field, responseData.responses[field.id])}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ResponseRenderer;