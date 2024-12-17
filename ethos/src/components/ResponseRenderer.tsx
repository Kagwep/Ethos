import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { FormResponse, FieldSubmission, FieldType } from '../config/types';
import { ContractResponse } from '../config/types';
import InsightsTrigger from './DataInsightsViewer';

interface ResponseRendererProps {
  survey: {
    id: string;
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
  const [responseData, setResponseData] = useState<FormResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const responseDataResponse = await fetch(survey.ipfsHash);
        if (!responseDataResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const respData = await responseDataResponse.json();
        setResponseData(respData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load response data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [response.ipfsHash]);

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

  const renderFieldSubmission = (submission: FieldSubmission<FieldType>) => {
    const { field, value, timestamp } = submission;

    switch (field.type) {
      case 'checkbox':
        return (
          <div className="space-y-1">
            {(value as string[]).map((item, index) => (
              <div key={index} className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
            {field.options && (
              <div className="mt-2 text-sm text-gray-500">
                Available options: {field.options.join(', ')}
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div>
            <div className="font-medium">{value as string}</div>
            {field.options && (
              <div className="mt-2 text-sm text-gray-500">
                Available options: {field.options.join(', ')}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <div className="font-medium">
              {Array.isArray(value) ? value.join(', ') : value as string}
            </div>
            {field.options && (
              <div className="mt-2 text-sm text-gray-500">
                Available options: {field.options.join(', ')}
              </div>
            )}
          </div>
        );

      case 'imageFile':
        return (
          <div className="mt-2">
            <img
              src={value as string}
              alt="Uploaded response"
              className="max-w-xs h-auto rounded border border-gray-300"
            />
            <div className="text-sm text-gray-500 mt-1">
              <div>IPFS: {value as string}</div>
              {field.accept && <div>Accepted formats: {field.accept}</div>}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
            {value as string}
          </div>
        );

      case 'number':
        return (
          <div className="font-medium">
            {value as number}
          </div>
        );

      default:
        return (
          <div className="font-medium">
            {value as string}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !responseData) {
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

      </div>

      <div className="flex-1">
          <h5 className="text-xl font-bold text-green-700">{responseData.title}</h5>
          <p className="text-green-600">{responseData.description}</p>
        </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="text-sm text-gray-600">
            <div>Submitted: {new Date(responseData.submittedAt).toLocaleString()}</div>
            {responseData.metadata && (
              <>
                <div>Version: {responseData.metadata.version}</div>
                <div>Platform: {responseData.metadata.platform}</div>
              </>
            )}
          </div>

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
            <InsightsTrigger ipfsHash={survey.ipfsHash}>
                Analyze 
            </InsightsTrigger>
          </div>

          {/* Form Submissions */}
          <div className="border-t pt-4">
            <div className="space-y-6">
              {responseData.submissions.map((submission) => (
                <div key={submission.fieldId} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {submission.field.label}
                    {submission.field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFieldSubmission(submission)}
                  <div className="text-sm text-gray-500">
                    Answered: {new Date(submission.timestamp || responseData.submittedAt).toLocaleString()}
                  </div>
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