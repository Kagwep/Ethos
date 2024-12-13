import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FilesSection from './FilesSection';
import { ArrowLeft } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface ReviewResponse {
  id: string;
  reviewId: string;
  rating: number;
  content: string;
  author: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}


export interface ReviewDetails {
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
  responses: ReviewResponse[]
}


interface FeedbackRespondProps {
  review: ReviewDetails;
  feedbackId:number;
  onSubmit: (responseData: any) => void;
  onBack: () => void;  
}

const FeedbackRespond: React.FC<FeedbackRespondProps> = ({ review,feedbackId, onSubmit, onBack }) => {
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Write your review here...</p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] px-3 py-2'
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const response: ReviewResponse = {
      id: `response_${Date.now()}`,
      reviewId: review.id,
      rating,
      content: content,
      author,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedReview: ReviewDetails = {
      ...review,
      responses: [...review.responses, response]
    };

    console.log(review.id)

    onSubmit({
      reviewId: feedbackId,
      response: response,
      updatedReview: updatedReview
    });
    console.log(updatedReview)
  };

  

  console.log(review)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-green-700">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 hover:text-green-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Submit Feedback Response</h2>
        </button>
      </div>
      {/* Review Details Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{review.productName}</h1>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 text-gray-900">{review.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
              <p className="mt-1 text-gray-900">{new Date(review.deadline).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900">{review.description}</p>
          </div>

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

          {review.productFiles.length > 0 && (
            <FilesSection files={review.productFiles} />
          )}
        </div>
      </div>

      {/* Response Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Your Response</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-500">Out of 5</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Review
            </label>
            <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <RichTextEditor 
              content={content}
              onChange={(newContent) => setContent(newContent)}
            />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Response
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackRespond;