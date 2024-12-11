import React, { useState } from 'react';
import { FormStructure } from '../config/type';

interface ContractSubmissionModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: FormStructure | null;
  onSubmit: (contractData: {
    responsesNeeded: number;
    endDate: number;
    rewardPerResponse: number;
  }) => Promise<void>;
}

export const ContractSubmissionModal: React.FC<ContractSubmissionModalProps> = ({
  showModal,
  setShowModal,
  formData,
  onSubmit
}) => {
  const [responsesNeeded, setResponsesNeeded] = useState<number>(100);
  const [rewardPerResponse, setRewardPerResponse] = useState<number>(1); // In HBAR
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = async () => {
    try {
      // Convert date to Unix timestamp
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      
      // Convert HBAR to tinybar (1 HBAR = 100,000,000 tinybar)
      const rewardInTinybar = rewardPerResponse * 100_000_000;

      await onSubmit({
        responsesNeeded,
        endDate: endTimestamp,
        rewardPerResponse: rewardInTinybar
      });

      setShowModal(false);
    } catch (error) {
      console.error('Error submitting to contract:', error);
      alert('Failed to submit to contract. Please try again.');
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Deploy Survey to Contract</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responses Needed
            </label>
            <input
              type="number"
              min="1"
              value={responsesNeeded}
              onChange={(e) => setResponsesNeeded(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward per Response (HBAR)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={rewardPerResponse}
              onChange={(e) => setRewardPerResponse(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Total cost: {(responsesNeeded * rewardPerResponse).toFixed(2)} HBAR
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button 
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSubmit}
          >
            Deploy Survey
          </button>
        </div>
      </div>
    </div>
  );
};
