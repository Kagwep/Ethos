import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { FormStructure, FormField, FormResponse } from '../config/types';

interface SurveyFormProps {
  survey: {
    id: string;
    name: string;
    ipfsHash: string;
    rewardPerResponse: number;
    endDate: number;
  };
  onBack: () => void;
  onSubmit: (surveyId: string, responses: FormResponse) => Promise<void>;
}

const SurveyFormRenderer: React.FC<SurveyFormProps> = ({ survey, onBack, onSubmit }) => {
  const [formStructure, setFormStructure] = useState<FormStructure | null>(null);
  const [responses, setResponses] = useState<FormResponse['responses']>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchFormStructure = async () => {
      try {
        const response = await fetch(survey.ipfsHash);
        const data = await response.json();
        setFormStructure(data);
      } catch (error) {
        console.error('Error fetching form structure:', error);
        alert('Failed to load survey form');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormStructure();
  }, [survey.ipfsHash]);

  const handleInputChange = (field: FormField, value: string | string[] | number) => {
    setResponses(prev => ({
      ...prev,
      [field.id]: value
    }));
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('YOUR_IPFS_UPLOAD_URL', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return data.cid;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleImageUpload = async (field: FormField, file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => ({
        ...prev,
        [field.id]: previewUrl
      }));

      setUploading(prev => ({
        ...prev,
        [field.id]: true
      }));

      const ipfsUrl = await uploadToIPFS(file);
      setResponses(prev => ({
        ...prev,
        [field.id]: ipfsUrl
      }));
    } catch (error) {
      console.error('Error handling image upload:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(prev => ({
        ...prev,
        [field.id]: false
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formStructure) return;

    const missingRequired = formStructure.fields
      .filter(field => field.required)
      .filter(field => !responses[field.id]);

    if (missingRequired.length > 0) {
      alert(`Please fill in all required fields: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const formResponse: FormResponse = {
        formId: formStructure.title.toLowerCase().replace(/\s+/g, '-'),
        responses,
        submittedAt: new Date().toISOString()
      };

      await onSubmit(survey.id, formResponse);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!formStructure) {
    return (
      <div className="p-8 text-center text-red-600">
        Failed to load survey form
      </div>
    );
  }

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
          {/* <h1 className="text-3xl font-bold text-green-700">{survey.name}</h1> */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{formStructure.title}</h2>
            <p className="text-gray-600 mb-6">{formStructure.description}</p>

            <div className="space-y-6">
              {formStructure.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {/* Text Input */}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={(responses[field.id] as string) || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                    />
                  )}

                  {/* Textarea */}
                  {field.type === 'textarea' && (
                    <textarea
                      value={(responses[field.id] as string) || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      required={field.required}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                    />
                  )}

                  {/* Number Input */}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={(responses[field.id] as number) || ''}
                      onChange={(e) => handleInputChange(field, Number(e.target.value))}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                    />
                  )}

                  {/* Radio Buttons */}
                  {field.type === 'radio' && field.options && (
                    <div className="space-y-2">
                      {field.options.map((option, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="radio"
                            id={`${field.id}-${index}`}
                            name={field.id}
                            value={option}
                            checked={(responses[field.id] as string) === option}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            required={field.required}
                            className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`${field.id}-${index}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Checkboxes */}
                  {field.type === 'checkbox' && field.options && (
                    <div className="space-y-2">
                      {field.options.map((option, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${field.id}-${index}`}
                            value={option}
                            checked={(responses[field.id] as string[])?.includes(option)}
                            onChange={(e) => {
                              const currentValues = (responses[field.id] as string[]) || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option]
                                : currentValues.filter(v => v !== option);
                              handleInputChange(field, newValues);
                            }}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`${field.id}-${index}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Select Dropdown */}
                  {field.type === 'select' && field.options && (
                    <select
                      value={(responses[field.id] as string) || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                    >
                      <option value="">Select an option</option>
                      {field.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Image Upload */}
                  {field.type === 'imageFile' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(field, file);
                            }
                          }}
                          required={field.required}
                          className="hidden"
                          id={`file-${field.id}`}
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor={`file-${field.id}`}
                          className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                          Choose Image
                        </label>
                        {uploading[field.id] && (
                          <span className="text-sm text-gray-500">Uploading...</span>
                        )}
                      </div>

                      {imagePreviews[field.id] && (
                        <div className="mt-2">
                          <img
                            src={imagePreviews[field.id]}
                            alt="Preview"
                            className="max-w-xs h-auto rounded border border-gray-300"
                          />
                          {responses[field.id] && (
                            <p className="text-sm text-gray-500 mt-1">
                              Uploaded to IPFS: {responses[field.id]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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

export default SurveyFormRenderer;