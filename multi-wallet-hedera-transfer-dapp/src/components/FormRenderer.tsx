import React, { useState, ChangeEvent, FormEvent } from 'react';
import { FormStructure, FormField, FormResponse } from '../config/types';

interface FormRendererProps {
  formStructure: FormStructure;
  onSubmit: (response: FormResponse) => void;
}

// Image upload handling
const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      // Using FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
  
      // Replace with your IPFS upload endpoint
      const response = await fetch('YOUR_IPFS_UPLOAD_URL', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      return data.cid; // or data.url depending on your IPFS service
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload image');
    }
  };

const FormRenderer: React.FC<FormRendererProps> = ({ formStructure, onSubmit }) => {
  const [responses, setResponses] = useState<FormResponse['responses']>({});
  const [submitted, setSubmitted] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (field: FormField, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [field.id]: field.type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingRequired = formStructure.fields
      .filter(field => field.required)
      .filter(field => !responses[field.id]);

    if (missingRequired.length > 0) {
      alert(`Please fill in all required fields: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    const formResponse: FormResponse = {
      formId: formStructure.title.toLowerCase().replace(/\s+/g, '-'),
      responses,
      submittedAt: new Date().toISOString()
    };

    onSubmit(formResponse);
    setSubmitted(true);
  };

  const handleImageUpload = async (field: FormField, file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => ({
        ...prev,
        [field.id]: previewUrl
      }));

      // Set uploading state
      setUploading(prev => ({
        ...prev,
        [field.id]: true
      }));

      // Upload to IPFS
      const ipfsUrl = await uploadToIPFS(file);

      // Update responses with IPFS URL
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-medium text-green-800 mb-2">Thank you!</h3>
        <p className="text-green-700">Your response has been recorded.</p>
        <button
          onClick={() => {
            setResponses({});
            setSubmitted(false);
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{formStructure.title}</h2>
      <p className="text-gray-600 mb-6">{formStructure.description}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formStructure.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={(responses[field.id] as string) || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={(responses[field.id] as string) || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required={field.required}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={(responses[field.id] as number) || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

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
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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

            {field.type === 'select' && field.options && (
              <select
                value={(responses[field.id] as string) || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                {field.options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
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
                    />
                    <label
                    htmlFor={`file-${field.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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



        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};


export default FormRenderer