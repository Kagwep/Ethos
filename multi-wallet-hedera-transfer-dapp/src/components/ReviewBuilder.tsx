import React, { useState, ChangeEvent } from 'react';
import { ReviewBuilderProps, ReviewStructure } from '../config/types';
import { uploadToIPFS } from './Infura';


const ReviewBuilder: React.FC<ReviewBuilderProps> = ({ 
  isOpen = false, 
  onClose, 
  onSubmit 
}) => {
  const [reviewStructure, setReviewStructure] = useState<ReviewStructure>({
    id: `review_${Date.now()}`,
    productName: '',
    category: '',
    description: '',
    deadline: '',
    purchaseRequired: false,
    compensation: '',
    reviewCriteria: [],
    productFiles: [],
    responses: []
  });

  const [uploading, setUploading] = useState(false);
  const [tempCriteria, setTempCriteria] = useState('');
  const [error, setError] = useState<string | null>(null);



  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      setError(null);
      const files = Array.from(e.target.files);

      try {
        const uploadPromises = files.map(async (file) => {
          const uploadedUrl = await uploadToIPFS(file);
          return {
            name: file.name,
            type: file.type,
            url: uploadedUrl
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        setReviewStructure(prev => ({
          ...prev,
          productFiles: [...prev.productFiles, ...uploadedFiles as any]
        }));
      } catch (error) {
        setError('File upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleBasicInfoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setReviewStructure(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setReviewStructure(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCriteriaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempCriteria(e.target.value);
  };

  const handleCriteriaBlur = () => {
    setReviewStructure(prev => ({
      ...prev,
      reviewCriteria: tempCriteria.split('\n').filter(Boolean)
    }));
  };

  const removeFile = (index: number) => {
    setReviewStructure(prev => ({
      ...prev,
      productFiles: prev.productFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewStructure.productName || !reviewStructure.category) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit?.(reviewStructure);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Feedback Campaign Builder</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Topic/Experience *
              </label>

              <input
                type="text"
                name="productName"
                required
                value={reviewStructure.productName}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product or service name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                value={reviewStructure.category}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a category</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Experience">Experience</option> {/* For general feedback */}
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={reviewStructure.description}
                onChange={handleBasicInfoChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what aspects of the  you want feedback"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Files
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                         file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {uploading && (
                <div className="mt-2 text-sm text-blue-600">
                  Uploading files...
                </div>
              )}
              {reviewStructure.productFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {reviewStructure.productFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-50 rounded-md p-2">
                      <div className="text-sm text-gray-600">
                        <div>{file.name}</div>
                        <div className="text-xs text-gray-500">{file.type}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={reviewStructure.deadline}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="purchaseRequired"
                name="purchaseRequired"
                checked={reviewStructure.purchaseRequired}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label 
                htmlFor="purchaseRequired"
                className="ml-2 text-sm text-gray-700"
              >
                Purchase required for review
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compensation
              </label>
              <input
                type="text"
                name="compensation"
                value={reviewStructure.compensation}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="HBAR"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Criteria (one per line)
              </label>
              <textarea
                value={tempCriteria}
                onChange={handleCriteriaChange}
                onBlur={handleCriteriaBlur}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter each review criterion on a new line&#10;e.g.,&#10;Quality&#10;Life&#10;Comfort"
              />
            </div>

            {reviewStructure.reviewCriteria.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Feedback Criteria Preview</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {reviewStructure.reviewCriteria.map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                       rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent 
                       rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Feedback Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewBuilder;