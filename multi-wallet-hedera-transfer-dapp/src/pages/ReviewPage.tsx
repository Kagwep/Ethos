import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, Star, Image, ThumbsUp, MessageCircle, Calendar, ShoppingBag, ArrowRight, StarHalf } from 'lucide-react';

interface Review {
  id: number;
  productName: string;
  category: string;
  description: string;
  purchaseRequired: boolean;
  compensation: string | null;
  deadline: string;
  participantCount: number;
  avgRating: number;
  status: 'open' | 'closed';
  reviewCriteria: string[];
  requiredEvidence: string[];
  isActive: boolean;
}

const ReviewPage = () => {
  const [activeTab, setActiveTab] = useState('participate');
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      productName: "Eco-Friendly Water Bottle",
      category: "Sustainable Living",
      description: "Share your experience with our new insulated water bottle. Focus on durability, temperature retention, and daily usage.",
      purchaseRequired: true,
      compensation: "Keep the product + $20 gift card",
      deadline: "2024-04-15",
      participantCount: 24,
      avgRating: 4.5,
      status: 'open',
      reviewCriteria: [
        "Temperature retention",
        "Ease of cleaning",
        "Durability",
        "Design and aesthetics"
      ],
      requiredEvidence: ["Proof of purchase", "Usage photos", "Temperature test results"],
      isActive: true
    },
    {
      id: 2,
      productName: "Smart Home Security System",
      category: "Electronics",
      description: "Evaluate our new AI-powered security system. Test installation process, mobile app, and detection accuracy.",
      purchaseRequired: false,
      compensation: "$150 + 1 year free subscription",
      deadline: "2024-05-01",
      participantCount: 15,
      avgRating: 4.2,
      status: 'open',
      reviewCriteria: [
        "Installation experience",
        "App functionality",
        "Detection accuracy",
        "Alert system",
        "Video quality"
      ],
      requiredEvidence: ["Installation video", "Test scenario recordings", "Screenshot of settings"],
      isActive: true
    }
  ]);

  console.log(showModal)

  const handleDelete = (id: number) => {
    setReviews(reviews.filter(review => review.id !== id));
  };

  const StarRating = ({ rating }: { rating: number }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  const AdminView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Reviews</h1>
          <p className="text-gray-600">Manage your product review campaigns</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Review Campaign
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{review.productName}</h3>
                  <p className="text-sm text-green-600 font-medium mt-1">{review.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  review.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {review.status}
                </span>
              </div>
              
              <p className="text-gray-600 mt-3">{review.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Current Ratings</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.avgRating} />
                    <span className="text-sm text-gray-600">({review.participantCount})</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Deadline</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(review.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Review Criteria</h4>
                <div className="flex flex-wrap gap-2">
                  {review.reviewCriteria.map((criterion, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                      {criterion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                onClick={() => handleDelete(review.id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ParticipantView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700">Available Reviews</h1>
        <p className="text-green-600">Share your experience and earn rewards</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reviews.filter(review => review.isActive).map((review) => (
          <div key={review.id} className="border border-green-200 rounded-lg shadow-sm overflow-hidden transition-colors hover:border-green-400">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-green-700">{review.productName}</h3>
                  <p className="text-sm text-green-600 font-medium mt-1">{review.category}</p>
                </div>
                {review.purchaseRequired && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    Purchase Required
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mt-3">{review.description}</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Deadline</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(review.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Review Criteria</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {review.reviewCriteria.map((criterion, index) => (
                        <span key={index} className="px-2 py-1 bg-green-50 rounded-full text-xs text-green-700">
                          {criterion}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Image className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Required Evidence</h4>
                    <ul className="text-sm text-gray-600 list-disc ml-4 mt-1">
                      {review.requiredEvidence.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShoppingBag className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Compensation</h4>
                    <p className="text-sm text-green-600 font-medium">
                      {review.compensation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Current Participation</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.avgRating} />
                      <span className="text-sm text-gray-600">
                        ({review.participantCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-green-100">
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                Apply to Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('participate')}
              className={`px-4 py-2 -mb-px font-medium ${
                activeTab === 'participate'
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Participate
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 -mb-px font-medium ${
                activeTab === 'manage'
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Reviews
            </button>
          </div>
        </div>

        {activeTab === 'participate' ? <ParticipantView /> : <AdminView />}
      </div>
      </div>
    </div>
  );
};

export default ReviewPage;