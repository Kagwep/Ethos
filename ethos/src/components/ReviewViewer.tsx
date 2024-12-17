import React, { useState, FormEvent } from 'react';
import { Star, Image, Upload, ShoppingBag } from 'lucide-react';

interface ReviewCampaign {
  productName: string;
  category: string;
  description: string;
  deadline: string;
  purchaseRequired: boolean;
  compensation: string;
  reviewCriteria: string[];
  requiredEvidence: string[];
}

interface ReviewViewerProps {
  reviewStructure: ReviewCampaign;
  onSubmit: (review: ReviewSubmission) => void;
}

interface ReviewSubmission {
  productId: string;
  reviewer: {
    name: string;
    email: string;
  };
  ratings: { [key: string]: number };
  review: string;
  evidenceUrls: string[];
  submitDate: string;
  purchaseVerified: boolean;
}

const ReviewViewer: React.FC<ReviewViewerProps> = ({ reviewStructure, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [review, setReview] = useState<Partial<ReviewSubmission>>({
    reviewer: {
      name: '',
      email: ''
    },
    ratings: {},
    review: '',
    evidenceUrls: [],
    purchaseVerified: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});

  const handleStarClick = (criterion: string, rating: number) => {
    setReview(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [criterion]: rating
      }
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, evidenceType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [evidenceType]: file
      }));
      // In a real implementation, you would upload the file here
      // and store the URL in evidenceUrls
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate ratings
    const missingRatings = reviewStructure.reviewCriteria
      .filter(criterion => !review.ratings?.[criterion]);

    if (missingRatings.length > 0) {
      alert(`Please rate all criteria: ${missingRatings.join(', ')}`);
      return;
    }

    // Validate evidence
    const missingEvidence = reviewStructure.requiredEvidence
      .filter(evidence => !uploadedFiles[evidence]);

    if (missingEvidence.length > 0) {
      alert(`Please provide all required evidence: ${missingEvidence.join(', ')}`);
      return;
    }

    const formattedReview: ReviewSubmission = {
      productId: reviewStructure.productName.toLowerCase().replace(/\s+/g, '-'),
      reviewer: review.reviewer!,
      ratings: review.ratings!,
      review: review.review!,
      evidenceUrls: [], // Would be populated with actual URLs after upload
      submitDate: new Date().toISOString(),
      purchaseVerified: review.purchaseVerified!
    };

    onSubmit(formattedReview);
    setSubmitted(true);
  };

  const StarRating = ({ criterion, rating }: { criterion: string, rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer ${
            star <= (review.ratings?.[criterion] || 0)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => handleStarClick(criterion, star)}
        />
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-medium text-green-800 mb-2">Review Submitted!</h3>
        <p className="text-green-700">Thank you for your review. Your compensation will be processed soon.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setIsSubmitting(false);
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Back to Product Details
        </button>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Review</h2>
        <p className="text-gray-600 mb-6">{reviewStructure.productName}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Reviewer Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={review.reviewer?.name || ''}
                onChange={(e) => setReview(prev => ({
                  ...prev,
                  reviewer: { ...prev.reviewer!, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={review.reviewer?.email || ''}
                onChange={(e) => setReview(prev => ({
                  ...prev,
                  reviewer: { ...prev.reviewer!, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ratings</h3>
            {reviewStructure.reviewCriteria.map((criterion) => (
              <div key={criterion} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{criterion}</span>
                <StarRating criterion={criterion} rating={review.ratings?.[criterion] || 0} />
              </div>
            ))}
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Review <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={review.review || ''}
              onChange={(e) => setReview(prev => ({ ...prev, review: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Share your detailed experience with the product..."
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Required Evidence</h3>
            {reviewStructure.requiredEvidence.map((evidence) => (
              <div key={evidence} className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {evidence}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:bg-gray-50">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploadedFiles[evidence]?.name || 'Choose file...'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, evidence)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {reviewStructure.purchaseRequired && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="purchaseVerified"
                checked={review.purchaseVerified || false}
                onChange={(e) => setReview(prev => ({
                  ...prev,
                  purchaseVerified: e.target.checked
                }))}
                className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <label 
                htmlFor="purchaseVerified"
                className="text-sm text-gray-700"
              >
                I confirm that I have purchased and used this product
              </label>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsSubmitting(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Product Info */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{reviewStructure.productName}</h2>
            <p className="text-sm text-green-600 font-medium mt-1">{reviewStructure.category}</p>
          </div>
          {reviewStructure.purchaseRequired && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              Purchase Required
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-4">{reviewStructure.description}</p>
      </div>

      {/* Review Details */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Review Deadline</h3>
            <p className="mt-1">
              {new Date(reviewStructure.deadline).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Compensation</h3>
            <p className="mt-1 text-green-600 font-medium">{reviewStructure.compensation}</p>
          </div>
        </div>

        {/* Review Criteria */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Review Criteria</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {reviewStructure.reviewCriteria.map((criterion, index) => (
                <li key={index} className="text-gray-700">• {criterion}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Required Evidence */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Required Evidence</h3>
          <div className="space-y-2">
            {reviewStructure.requiredEvidence.map((evidence, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <Image className="w-4 h-4 text-gray-400" />
                <span>{evidence}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsSubmitting(true)}
          className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2"
        >
          Write Review
        </button>
      </div>
    </div>
  );
};

export default ReviewViewer;