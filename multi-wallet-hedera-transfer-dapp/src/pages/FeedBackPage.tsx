import React, { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, Star, Image, ThumbsUp, MessageCircle, Calendar, ShoppingBag, ArrowRight, StarHalf, XCircle, Users2, User } from 'lucide-react';
import { Feedback, ReviewStructure } from '../config';
import ReviewBuilder from '../components/ReviewBuilder';
import { uploadToIPFS } from '../components/Infura';
import toast from 'react-hot-toast';
import { ContractFunctionParameterBuilder } from '../services/wallets/contractFunctionParameterBuilder';
import { ContractId } from '@hashgraph/sdk';
import { FEEDBACKABI, FEEDBACKCONTRACT, FEEDBACKCONTRACTID } from '../config/constants';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { ethers } from 'ethers';

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

const FeedBackPage = () => {
  const [activeTab, setActiveTab] = useState('participate');
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      productName: "Eco-Friendly Water Bottle",
      category: "Sustainable Living",
      description: "Share your experience with our new insulated water bottle. Focus on durability, temperature retention, and daily usage.",
      purchaseRequired: true,
      compensation: "Keep the product + HBAR",
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
  const abi = FEEDBACKABI;
  const contractAddress = FEEDBACKCONTRACT; // Make sure this is the EVM address


  const contract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  );

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Get counter
      const count = await contract.feedbackIdCounter();
  
      const feedbackList = [];
      // Fetch each feedback
      for (let i = 1; i < count.toNumber(); i++) {
        console.log(i)
        const details = await contract.getFeedback(i);
  
        console.log(details);
  
        feedbackList.push({
          id: i,
          ipfsHash: details[0],
          topic: details[1],
          description: details[2],
          creator: details[3],
          createdAt: details[4].toNumber(),
          responseCount: details[5].toNumber(),
          active: details[6]
        });
      }
  
      console.log(feedbackList);
  
      setFeedbacks(feedbackList as any);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  console.log(showModal)

  
  const handleSubmitResponse = async (feedbackId: number) => {
    try {
      setIsLoading(true);
      setError(null);
  
      // First fetch the current feedback to get its IPFS hash
      const currentFeedback = await contract.getFeedback(feedbackId);
      
      // Here you would:
      // 1. Get the user's feedback data
      // 2. Add it to the existing IPFS data
      // 3. Upload the new combined data to IPFS
      // This is just a placeholder for the IPFS hash
      const newIpfsHash = "QmNewHash..."; 
  
      // Submit response and update IPFS hash in one transaction
      const tx = await contract.submitResponseAndUpdate(
        feedbackId,
        newIpfsHash
      );
  
      await tx.wait();
  
      // Refresh the feedback list
      await fetchFeedbacks();
  
  
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit feedback response');

    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeactivate = async (feedbackId: number) => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Call the contract's deactivate function
      const tx = await contract.deactivateFeedback(feedbackId);
      await tx.wait();
  
      // Refresh the feedback list
      await fetchFeedbacks();
  

  
    } catch (err) {
      console.error('Error deactivating feedback:', err);
      setError('Failed to deactivate feedback');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (data: ReviewStructure) => {

    if (!data) return;
  
    try {

      const jsonString = JSON.stringify(data, null, 2);

      // Create a new Blob with the JSON data
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
    
      // Create a File object from the Blob
      const jsonFile = new File([jsonBlob], `${data.productName}-feedback.json`, { type: 'application/json' });

      
      // Upload form data to IPFS first
      const ipfsHash = await uploadToIPFS(jsonFile);

      console.log(ipfsHash);

      const paramBuilder = new ContractFunctionParameterBuilder()
      .addParam({
          type: "string",
          name: "ipfsHash",
          value: ipfsHash,
      })
      .addParam({
        type: "string",
        name: "topic",
        value: data.productName,
      })
      .addParam({
        type: "string",
        name: "description",
        value: data.description,
      })

      const result = await walletInterface?.executeContractFunction(
        FEEDBACKCONTRACTID as unknown as ContractId,
        "createFeedback",
        paramBuilder,
        800000, // gas limit
      );

    console.log('Review campaign created:', data);
    toast.success('Survey deployed successfully!');
  } catch (error) {
    console.error('Error:', error);
    // Display error message
    toast.error('Failed to deploy survey. Please check the console for details.');
  }
  
  };


  useEffect(() => {
    if (walletInterface) {
      fetchFeedbacks();

    }
  }, [walletInterface]);

  const AdminView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-gray-600">Manage your feedback requests</p>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Feedback
        </button>
      </div>
  
      <div className="grid gap-6 lg:grid-cols-2">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{feedback.topic}</h3>
                  <p className="text-sm text-gray-500 mt-1">Created by: {feedback.creator}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  feedback.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {feedback.active ? 'Active' : 'Closed'}
                </span>
              </div>
              
              <p className="text-gray-600 mt-3">{feedback.description}</p>
  
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Responses</h4>
                  <p className="text-sm text-gray-600">
                    {feedback.responseCount} responses received
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(feedback.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
  
              <div className="mt-4">
                <h4 className="font-medium">IPFS Hash</h4>
                <p className="text-sm text-gray-600 break-all">{feedback.ipfsHash}</p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-4 h-4" /> View Responses
              </button>
              {feedback.active && (
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                  onClick={() => handleDeactivate(feedback.id)}
                >
                  <XCircle className="w-4 h-4" /> Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const ParticipantView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700">Available Feedback Requests</h1>
        <p className="text-green-600">Share your valuable feedback</p>
      </div>
  
      <div className="grid gap-6 lg:grid-cols-2">
        {feedbacks.filter(feedback => feedback.active).map((feedback) => (
          <div key={feedback.id} className="border border-green-200 rounded-lg shadow-sm overflow-hidden transition-colors hover:border-green-400">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-green-700">{feedback.topic}</h3>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Created {new Date(feedback.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 mt-3">{feedback.description}</p>
  
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-2">
                  <Users2 className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Current Participation</h4>
                    <p className="text-sm text-gray-600">
                      {feedback.responseCount} responses submitted
                    </p>
                  </div>
                </div>
  
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Requester</h4>
                    <p className="text-sm text-gray-600">
                      {feedback.creator}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-green-100">
              <button 
                onClick={() => handleSubmitResponse(feedback.id)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Submit Feedback
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 text-gray-700">
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
      <ReviewBuilder
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />

    </div>
  );
};

export default FeedBackPage;