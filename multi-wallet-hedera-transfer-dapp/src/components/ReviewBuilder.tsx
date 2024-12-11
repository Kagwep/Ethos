import React, { useState, ChangeEvent } from 'react';

interface ReviewStructure {
  productName: string;
  category: string;
  description: string;
  deadline: string;
  purchaseRequired: boolean;
  compensation: string;
  reviewCriteria: string[];
  requiredEvidence: string[];
}

const ReviewBuilder: React.FC = () => {
  const [reviewStructure, setReviewStructure] = useState<ReviewStructure>({
    productName: '',
    category: '',
    description: '',
    deadline: '',
    purchaseRequired: false,
    compensation: '',
    reviewCriteria: [],
    requiredEvidence: []
  });

  const [tempCriteria, setTempCriteria] = useState('');
  const [tempEvidence, setTempEvidence] = useState('');

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

  const handleEvidenceChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempEvidence(e.target.value);
  };

  const handleEvidenceBlur = () => {
    setReviewStructure(prev => ({
      ...prev,
      requiredEvidence: tempEvidence.split('\n').filter(Boolean)
    }));
  };

  const generateJSON = (): void => {
    console.log('Review Structure:', reviewStructure);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Review Campaign Builder</h2>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product/Service Name
          </label>
          <input
            type="text"
            name="productName"
            value={reviewStructure.productName}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter product or service name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={reviewStructure.category}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select a category</option>
            <option value="Electronics">Electronics</option>
            <option value="Home & Living">Home & Living</option>
            <option value="Fashion">Fashion</option>
            <option value="Beauty">Beauty</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Services">Services</option>
            <option value="Software">Software</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
            placeholder="Describe what aspects of the product/service you want reviewed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={reviewStructure.deadline}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="purchaseRequired"
            name="purchaseRequired"
            checked={reviewStructure.purchaseRequired}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Keep the product + $20 gift card"
          />
        </div>
      </div>

      {/* Review Criteria */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Review Criteria (one per line)
        </label>
        <textarea
          value={tempCriteria}
          onChange={handleCriteriaChange}
          onBlur={handleCriteriaBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
          placeholder="Enter each review criterion on a new line
e.g.,
Ease of use
Build quality
Value for money"
        />
      </div>

      {/* Required Evidence */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Evidence (one per line)
        </label>
        <textarea
          value={tempEvidence}
          onChange={handleEvidenceChange}
          onBlur={handleEvidenceBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
          placeholder="Enter each required evidence on a new line
e.g.,
Product photos
Usage video
Proof of purchase"
        />
      </div>

      {/* Preview Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Campaign Preview</h3>
        <div className="space-y-3">
          {reviewStructure.reviewCriteria.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Review Criteria:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewStructure.reviewCriteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ul>
            </div>
          )}
          {reviewStructure.requiredEvidence.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Required Evidence:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewStructure.requiredEvidence.map((evidence, index) => (
                  <li key={index}>{evidence}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Generate JSON Button */}
      <button
        onClick={generateJSON}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Generate Review Campaign JSON
      </button>
    </div>
  );
};

export default ReviewBuilder;