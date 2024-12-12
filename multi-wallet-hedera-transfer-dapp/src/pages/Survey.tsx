import React, { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2, Users, ArrowRight, ClipboardList } from 'lucide-react';
import SurveyBuilder from '../components/SurveyBuilder';
import { FormResponse, FormStructure } from '../config/types';
import { SurveyBuilderModal } from '../components/SurveyBuilderModal';
import { uploadToIPFS } from '../components/Infura';
import { toast } from 'react-hot-toast';
import { ContractSubmissionModal } from '../components/ContractSubmissionModalProps';
import { ContractFunctionParameterBuilder } from '../services/wallets/contractFunctionParameterBuilder';
import { ContractId } from '@hashgraph/sdk';
import { SURVEYABI, SURVEYMANAGERCONTRACT, SURVEYMANAGERCONTRACTID } from '../config/constants';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { ethers } from 'ethers';
import ResponseView from '../components/ResponseView';
import SurveyFormRenderer from '../components/SurveyFormRenderer';


interface Survey {
  id: string,
  creator: string;
  name: string;
  ipfsHash: string;
  responsesNeeded: number;
  responseCount: number;
  endDate: number;
  isActive: boolean;
  rewardPerResponse: number;
}



interface State {
  surveys: Survey[];
  isLoading: boolean;
  error: string | null;
}

const SurveyPage = () => {
  const [activeTab, setActiveTab] = useState('participate');
  const [showModal, setShowModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<FormStructure | null>(null);
  const { accountId, walletInterface } = useWalletInterface();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSurvey, setActiveSurvey] = useState(null);


  const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
  const abi = SURVEYABI;
  const contractAddress = SURVEYMANAGERCONTRACT; // Make sure this is the EVM address

  console.log(accountId)

  const contract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  );

  console.log(activeSurvey)


  const fetchSurveys = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Get counter
      const count = await contract.surveyCount();
  
      const surveys = [];
      // Fetch each survey
      for (let i = 0; i <= count.toNumber(); i++) {
        const details = await contract.getSurveyDetails(i);
  
        console.log(details)
  
        surveys.push({
          id: i,
          creator: details[0],
          name: details[1],
          ipfsHash: details[2],
          responsesNeeded: details[3].toNumber(),
          responseCount: details[4].toNumber(),
          endDate: details[5].toNumber(),
          isActive: details[6],
          rewardPerResponse: Number(details[7]),
        });
      }
  
      console.log(surveys)
  
      setSurveys(surveys as any);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError('Failed to load surveys');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDelete = (id: number) => {
  //   setSurveys(surveys.filter(survey => survey.id !== id));
  // };

  const handleSurveySubmit = async (formData: FormStructure) => {
    // Store the form data and open the contract submission modal
    setCurrentFormData(formData);
    setShowSurveyModal(false);
    setShowContractModal(true);
  };

  const handleContractSubmit = async (contractData: {
    responsesNeeded: number;
    endDate: number;
    rewardPerResponse: number;
  }) => {
    if (!currentFormData) return;
  
    try {

      const jsonString = JSON.stringify(currentFormData, null, 2);

      // Create a new Blob with the JSON data
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
    
      // Create a File object from the Blob
      const jsonFile = new File([jsonBlob], `${currentFormData.title}-survey.json`, { type: 'application/json' });

      
      // Upload form data to IPFS first
      const ipfsHash = await uploadToIPFS(jsonFile);

      console.log(ipfsHash);
  

      const paramBuilder = new ContractFunctionParameterBuilder()
      .addParam({
          type: "string",
          name: "name",
          value: currentFormData.title,
      })
      .addParam({
          type: "string",
          name: "ipfsHash",
          value: ipfsHash,
      })
      .addParam({
          type: "uint256",
          name: "responsesNeeded",
          value: contractData.responsesNeeded,
      })
      .addParam({
          type: "uint256",
          name: "endDate",
          value: contractData.endDate,
      })
      .addParam({
          type: "uint256",
          name: "rewardPerResponse",
          value: contractData.rewardPerResponse,
      });

        console.log(paramBuilder)
    
      const result = await walletInterface?.executeContractFunction(
        SURVEYMANAGERCONTRACTID as unknown as ContractId,
        "createSurvey",
        paramBuilder,
        800000, // gas limit
        contractData.rewardPerResponse * contractData.responsesNeeded
      );
    
       console.log(contractData)
      // Display success message
      toast.success('Survey deployed successfully!');
    } catch (error) {
      console.error('Error:', error);
      // Display error message
      toast.error('Failed to deploy survey. Please check the console for details.');
    }
  };
  


  // Dummy handler for response submission
  const handleResponseSubmit = async (surveyId: any, response: FormResponse) => {
    console.log('Submitting response for survey:', surveyId);
    console.log('Response content:', response);

    if (!response) return;

    try {

    const jsonString = JSON.stringify(response, null, 2);

    // Create a new Blob with the JSON data
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a File object from the Blob
    const jsonFile = new File([jsonBlob], `${response.formId}-survey.json`, { type: 'application/json' });

    
    // Upload form data to IPFS first
    const ipfsHash = await uploadToIPFS(jsonFile);
    

    const paramBuilder = new ContractFunctionParameterBuilder()
    .addParam({
      type: "uint256",
      name: "surveyId",
      value: surveyId,
    })
    .addParam({
      type: "string",
      name: "ipfsHash",
      value: ipfsHash,
    });


    const result = await walletInterface?.executeContractFunction(
      SURVEYMANAGERCONTRACTID as unknown as ContractId,
      "submitResponse",
      paramBuilder,
      800000
    );
  

    toast.success('Survey response created successfully!');
  } catch (error) {
    console.error('Error:', error);
    // Display error message
    toast.error('Failed to submit survey response. Please check the console for details.');
  }

    setActiveSurvey(null); // Return to survey list
  };

// Handler for when user clicks "Participate Now"
const handleParticipate = (survey: any) => {
  // Check if user has already responded

  // Verify survey is still active
  if (!survey.isActive) {
    alert('This survey is no longer active');
    return;
  }
  
  // Check if survey has reached response limit
  if (survey.responseCount >= survey.responsesNeeded) {
    alert('This survey has reached its response limit');
    return;
  }
  
  // Check if survey has ended
  if (Date.now() / 1000 > survey.endDate) {
    alert('This survey has ended');
    return;
  }
  
  // All checks passed, set active survey
  setActiveSurvey(survey);
};

  const AdminView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Surveys</h1>
          <p className="text-gray-600">Manage your surveys and responses</p>
        </div>
        
        <button
          onClick={() => setShowSurveyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Survey
        </button>
      </div>
      {!surveys || surveys.length === 0 ? (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No surveys created yet</h3>
        <p className="text-gray-500">Click the 'Add New Survey' button to create your first survey</p>
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <div key={survey.id} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold">{survey.name}</h3>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Ends: {new Date(survey.endDate * 1000).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Responses: {survey.responseCount} / {survey.responsesNeeded}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {survey.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-gray-600">
                  Reward: {survey.rewardPerResponse / 100_000_000} HBAR
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
        )}
    </div>
      
  );
  
  const ParticipantView = ({ onParticipate }:{ onParticipate: any }) => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700">Available Surveys</h1>
        <p className="text-green-600">Participate in active surveys</p>
      </div>
      {!surveys || surveys.length === 0 ? (
      <div className="text-center py-12 border-2 border-dashed border-green-200 rounded-lg">
        <ClipboardList className="w-12 h-12 text-green-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-green-900 mb-1">No surveys available</h3>
        <p className="text-green-600">Check back later for new surveys to participate in</p>
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <div key={survey.id} className="border border-green-200 rounded-lg shadow-sm overflow-hidden transition-colors hover:border-green-400">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-700">{survey.name}</h3>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {survey.responseCount} / {survey.responsesNeeded} responses
                </p>
                <p className="text-sm text-gray-600">
                  Ends: {new Date(survey.endDate * 1000).toLocaleDateString()}
                </p>
                <p className="text-sm text-green-600">
                  Reward: {survey.rewardPerResponse / 100_000_000} HBAR
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-green-100">
              {survey.isActive && 
               survey.responseCount < survey.responsesNeeded && 
               Date.now() / 1000 < survey.endDate ? (
              <button
                onClick={() => handleParticipate(survey)} 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Participate Now
                <ArrowRight className="w-4 h-4" />
              </button>
              ) : (
                <div className="w-full py-3 text-center text-gray-500">
                  {!survey.isActive ? "Survey Inactive" : 
                   survey.responseCount >= survey.responsesNeeded ? "Response Limit Reached" :
                   "Survey Ended"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
       )}
    </div>
  );

  useEffect(() => {
    if (walletInterface) {
      fetchSurveys();

    }
  }, [walletInterface]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 text-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="border-b">
          <div className="flex gap-4">
            {!activeSurvey && (
              <>
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
                  Manage Surveys
                </button>
              </>
            )}
          </div>
        </div>

        {activeSurvey ? (
          <SurveyFormRenderer
            survey={activeSurvey}
            onBack={() => setActiveSurvey(null)}
            onSubmit={handleResponseSubmit}
          />
        ) : (
          activeTab === 'participate' ? 
            <ParticipantView onParticipate={setActiveSurvey} /> : 
            <AdminView />
        )}
      </div>
      <SurveyBuilderModal
        showModal={showSurveyModal}
        setShowModal={setShowSurveyModal}
        onSubmit={handleSurveySubmit}
      />
      <ContractSubmissionModal
        showModal={showContractModal}
        setShowModal={setShowContractModal}
        formData={currentFormData}
        onSubmit={handleContractSubmit}
      />
     </div>
    </div>
  );
};

export default SurveyPage;