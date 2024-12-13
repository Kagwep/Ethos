import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Star, StarHalf } from 'lucide-react';
import FilesSection from './FilesSection';

interface ReviewResponse {
  id: string;
  reviewId: string;
  rating: number;
  content: string;
  author: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReviewDetails {
  id: string;
  productName: string;
  category: string;
  description: string;
  deadline: string;
  purchaseRequired: boolean;
  compensation: string;
  reviewCriteria: string[];
  productFiles: {
    name: string;
    type: string;
    url: string;
  }[];
  responses: ReviewResponse[];
}

interface FeedbackResponsesViewProps {
  review: ReviewDetails;
  onBack: () => void;
}

const StatusBadge = ({ status }: { status: ReviewResponse['status'] }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`w-5 h-5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

const FeedbackResponsesView: React.FC<FeedbackResponsesViewProps> = ({ review, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-green-700 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 hover:text-green-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Feedback Responses</h2>
        </button>
      </div>

      {/* Product Summary */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{review.productName}</h1>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Category:</span>
              <span className="ml-2 text-gray-900">{review.category}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Deadline:</span>
              <span className="ml-2 text-gray-900">
                {new Date(review.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900">{review.description}</p>
          </div>

          {/* Review Criteria */}
          {review.reviewCriteria.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Review Criteria</h3>
              <ul className="list-disc list-inside text-gray-900">
                {review.reviewCriteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Files Section */}
          {review.productFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Files</h3>
              <FilesSection files={review.productFiles} />
            </div>
          )}
        </div>
      </div>

      {/* Responses Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Responses ({review.responses.length})
        </h3>

        {review.responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No responses yet
          </div>
        ) : (
          review.responses.map((response) => (
            <div key={response.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{response.author}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={response.status} />
              </div>
              
              <RatingStars rating={response.rating} />

              <div 
                className="mt-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: response.content }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackResponsesView;