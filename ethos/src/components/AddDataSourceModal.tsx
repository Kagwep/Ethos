import React, { useState } from 'react';
import { Plus, X, Upload, AlertCircle } from 'lucide-react';
import { uploadToIPFS } from './Infura';
import { toast } from 'react-hot-toast';
import { AccountId, ContractId, TokenId, TransactionId } from "@hashgraph/sdk";
import { ALLOWED_MIME_TYPES, DATAMANAGEMENTCONTRACT, DATAMANAGEMENTCONTRACTID } from '../config/constants';
import { ContractFunctionParameterBuilder } from '../services/wallets/contractFunctionParameterBuilder';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { encryptionService } from '../services/EncryptionService';
import * as fileType from 'file-type';
import mime from 'mime-types';
import validateFile, { FileValidationOptions } from '../config';
import { ContentAnalysisAgent } from './ContentAnalysisConfig';
import FileAnalysisFeedback from './ FileAnalysisFeedback';
import { HederaMessageSender } from '../services/HederaMessageSender';
import { v4 as uuidv4 } from 'uuid';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const DATA_TYPES = ['CSV', 'JSON', 'XML', 'PDF'];

interface AddDataSourceModalProps {
    onSuccess: () => void;  // callback function to refresh the data sources list
  }

const AddDataSourceModal:React.FC<AddDataSourceModalProps> = ({ onSuccess }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dataType: '',
    accessFee: '',
    description: ''
  });
  const [error, setError] = useState('');
  const { accountId,walletInterface } = useWalletInterface();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>();

  const agent = new ContentAnalysisAgent({
    openaiApiKey: process.env.REACT_APP_ETHOS as any || ' ',
    maxSizeBytes: 5 * 1024 * 1024 // 5MB
});

const sender = new HederaMessageSender(
  process.env.REACT_APP_MY_ACCOUNT_ID!,
  process.env.REACT_APP_MY_ETHOS!
);

  const handleFileChange = async (event: any) => {
    const selectedFile = event.target.files[0];
  
    if (selectedFile) {
      if (selectedFile.size > MAX_SIZE_BYTES) {
        setError(`File size must be less than ${MAX_SIZE_MB}MB`);
        setFile(null);
      } else {
        setError('');
        setIsAnalyzing(true);
        try {

          const options: FileValidationOptions = {
            allowedMimeTypes: ALLOWED_MIME_TYPES,
            maxSizeBytes: 5 * 1024 * 1024 // 5MB
          };
          
         const isValid = await validateFile(selectedFile, options);

         console.log(isValid)

         const analysis = await agent.analyzeContent(selectedFile);
         setAnalysisResult(analysis as any);

          if (analysis.isValid) {
              if (analysis.warnings?.length) {
                  console.warn('Content warnings:', analysis.warnings);
              }
              console.log(analysis)
              console.log('Analysis insights:', analysis.insights);
              
              // Now safe to upload to IPFS
              const fileUrl = await uploadToIPFS(selectedFile);

              if (!fileUrl) {
                setAnalysisResult({
                  isValid: false,
                  error: 'Failed to upload file. Please try again.'
                });
              } else {
                setFileName(selectedFile)
                setFile(fileUrl as any);
              }
              
          }
          
        } catch (error) {
          setAnalysisResult({
            isValid: false,
            error: 'An error occurred during file upload.'
          });
        }finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!file) return 'Please select a file';
    if (!formData.name.trim()) return 'Please enter a name';
    if (!formData.dataType) return 'Please select a data type';
    if (!formData.accessFee || parseFloat(formData.accessFee) <= 0) {
      return 'Please enter a valid access fee';
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }


    try {
      if (!fileName && !file) {
        toast.error('File name is missing. Please provide a valid file.');
        return;
      }

      const encryptedLink = encryptionService.encrypt(file!);

      const paramBuilder = new ContractFunctionParameterBuilder()
        .addParam({
          type: "string",
          name: "name",
          value: formData.name,
        })
        .addParam({
          type: "string",
          name: "dataType",
          value: formData.dataType,
        })
        .addParam({
          type: "uint256",
          name: "size",
          value: (fileName as any).size,
        })
        .addParam({
          type: "string",
          name: "storageLink",
          value: encryptedLink, // You'll need to implement IPFS upload
        })
        .addParam({
          type: "string",
          name: "metadataLink",
          value: formData.description,
        })
        .addParam({
          type: "uint256",
          name: "accessFee",
          value: formData.accessFee,
        });

        console.log(paramBuilder)
    
      const result = await walletInterface?.executeContractFunction(
        DATAMANAGEMENTCONTRACTID as unknown as ContractId,
        "addDataSource",
        paramBuilder,
        800000 // gas limit
      );

          const message = {
            eventType: "Add Data",
            timestamp: new Date().toISOString(),
            userId: accountId,
            dataId: uuidv4(),
            action: "call",
            details: {
                ipfsencoded: encryptedLink
            }
        };
     
          await sender.sendMessage(
            process.env.REACT_APP_PROVISIONS_TOPIC_ID as any, 
            JSON.stringify(message)
        );

      console.log(result)
    
      toast.success('Data source added successfully!');
      console.log(formData);
      setIsOpen(false);
      setFile(null);
      setFormData({
        name: '',
        dataType: '',
        accessFee: '',
        description: '',
      });
      setError('');
      onSuccess();
    } catch (err) {
        console.log(err)
      toast.error('Failed to add data source. Please try again.');
      setError('Failed to add data source. Please try again.');
    }
    
  };

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add New
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 relative">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Data Source</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data Source Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data Type
                </label>
                <select
                  name="dataType"
                  value={formData.dataType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="" className='text-gray-700'>Select data type</option>
                  {DATA_TYPES.map(type => (
                    <option key={type} value={type} className='text-gray-700'>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Access Fee (HBAR)
                </label>
                <input
                  type="number"
                  name="accessFee"
                  value={formData.accessFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.0001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  placeholder="Enter access fee in HBAR"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  placeholder="Enter description"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload File (Max {MAX_SIZE_MB}MB)
                </label>
                <FileAnalysisFeedback 
                    analysis={analysisResult}
                    isAnalyzing={isAnalyzing}
                    onComplete={() => setAnalysisResult(null)}
                  />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700">Upload a file</span>
                        <input
                          type="file"
                          className="hidden text-gray-700"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {file && (
                      <div className="mt-2 text-sm text-gray-500">
                        Selected: {(fileName as any).name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Data Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDataSourceModal;

function executeContractFunction(contractId: ContractId, arg1: string, paramBuilder: any, arg3: number) {
    throw new Error('Function not implemented.');
}
