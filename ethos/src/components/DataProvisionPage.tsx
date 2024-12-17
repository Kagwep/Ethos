import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import AddDataSourceModal from './AddDataSourceModal';
import { ContractFunctionParameterBuilder } from '../services/wallets/contractFunctionParameterBuilder';
import { DATAMANAGEMENTAbi, DATAMANAGEMENTCONTRACT, DATAMANAGEMENTCONTRACTID } from '../config/constants';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { AccountId, ContractId } from '@hashgraph/sdk';
import { ethers } from 'ethers';
import { RequestAccessButton } from './RequestAccessButton';
import { dappConnector } from '../services/wallets/walletconnect/walletConnectClient';
import { encryptionService } from '../services/EncryptionService';
import { HederaMessageSender } from '../services/HederaMessageSender';
import { v4 as uuidv4 } from 'uuid';
import InsightsTrigger from './DataInsightsViewer';

interface DataSource {
  id: number;
  name: string;
  dataType: string;
  size: number;
  lastUpdated: number;
  isActive: boolean;
  owner: string;
  storageLink: string;
  metadataLink: string;
  accessFee: number;
}

interface DataRequest {
  id: string;
  title: string;
  requester: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  description: string;
}

interface AccessRequest {
  requestId: number;
  requester: string;
  dataSourceId: number;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: number;
  paidAmount: string;  // In HBAR
}



const DataProvisionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accountId, walletInterface } = useWalletInterface();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

  const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
  const abi = DATAMANAGEMENTAbi;
  const contractAddress = DATAMANAGEMENTCONTRACT; // Make sure this is the EVM address


  const sender = new HederaMessageSender(
    process.env.REACT_APP_MY_ACCOUNT_ID!,
    process.env.REACT_APP_MY_ETHOS!
  );
  
  
  console.log(accountId)

  const contract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  );

  const getDataSourceById = (id: number): DataSource | undefined => {
    return dataSources.find(dataSource => dataSource.id === id);
  };

  const fetchDataSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    const data = await response.json();



      // Get counter
      const count = await contract.dataSourceCounter();
  
      const sources = [];
      // Fetch each data source
      for (let i = 1; i <= count.toNumber(); i++) {
        const details = await contract.getDataSourceDetails(i, data.evm_address);

        console.log(details)
        
        sources.push({
          id: i,
          name: details[0],
          dataType: details[1],
          size: details[2].toNumber(),
          lastUpdated: details[3].toNumber(),
          isActive: details[4],
          owner: details[5],
          accessFee: Number(details[6]),
          storageLink: details[7],
          metadataLink: details[8],
          
        });
      }

      console.log(sources)
  
      setDataSources(sources as any);
    } catch (err) {
      console.error('Error fetching data sources:', err);
      setError('Failed to load data sources');
    } finally {
      setIsLoading(false);
    }
  };

  const RequestStatusMapper: { [key: number]: string } = {
    0: "Pending",
    1: "Approved",
    2: "Rejected",
  };
  // Function to fetch access requests using ethers
const fetchAccessRequests = async () => {
  try {
    setRequestsLoading(true);

    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json'
      }
  });
  const data = await response.json();

    
    const count = await contract.requestCounter();
    const requests = [];

    for(let i = 1; i <= count.toNumber(); i++) {
      const details = await contract.getRequestDetails(i, data.evm_address);
     
      requests.push({
        requestId: i,
        requester: details[0],
        dataSourceId: details[1].toNumber(),
        purpose: details[2],
        status: RequestStatusMapper[details[3]], // Enum: 0=Pending, 1=Approved, 2=Rejected
        requestDate: details[4].toNumber(),
        paidAmount: Number(details[5]) / 10 ** 8
      });
    }

    console.log("da ", requests)

    setRequests(requests as any);
  } catch (error) {
    console.error('Error fetching requests:', error);
    setRequestError('Failed to load access requests');
  } finally {
    setRequestsLoading(false);
  }
};

const handleDownload = async (id: number) => {
  const specificDataSource = getDataSourceById(id);

  if(!specificDataSource) return;

        const message = {
          eventType: "Download Data",
          timestamp: new Date().toISOString(),
          userId: accountId,
          dataId: uuidv4(),
          action: "call",
          details: {
              ipfsencoded: specificDataSource.storageLink
          }
      };

      await sender.sendMessage(
        process.env.REACT_APP_PROVISIONS_TOPIC_ID as any, 
        JSON.stringify(message)
    );


  try {
    const decryptedLink = encryptionService.decrypt(specificDataSource.storageLink);
    
    fetch(decryptedLink)
    .then(response => {
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'downloaded_file'; // Default name
  
      // Extract filename from headers if available
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }


  
      return response.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Use extracted or default filename
      document.body.appendChild(link);
      link.click();
  
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch(error => console.error('Error during file download:', error));
  
  } catch (error) {
    console.error('Error during download:', error);
  }
}

const handleProcessRequest = async (requestId: number, approved: boolean) => {
  try {
    const params = new ContractFunctionParameterBuilder()
      .addParam({
        type: "uint256",
        name: "requestId",
        value: requestId
      })
      .addParam({
        type: "bool",
        name: "approved",
        value: approved
      });

    await walletInterface?.executeContractFunction(
      DATAMANAGEMENTCONTRACTID as unknown as ContractId,
      "processAccessRequest",
      params,
      300000
    );

    

    const message = {
      eventType: "Process request Data",
      timestamp: new Date().toISOString(),
      userId: accountId,
      dataId: uuidv4(),
      action: "call",
      details: {
          funationName: "processAccessRequest"
      }
  };

  await sender.sendMessage(
    process.env.REACT_APP_PROVISIONS_TOPIC_ID as any, 
    JSON.stringify(message)
);

    // Refresh the requests list
    await fetchAccessRequests();
    
  } catch (error) {
    console.error('Error processing request:', error);
    setRequestError(`Failed to ${approved ? 'approve' : 'reject'} request`);
  }
};

  useEffect(() => {
    if (walletInterface) {
      fetchDataSources();
      fetchAccessRequests();
    }
  }, [walletInterface]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Provision</h1>
          <p className="mt-2 text-gray-600">Manage your data sources and access requests</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Data
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Access Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'manage' && (
            <>
              {/* Data Sources List */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your Data Sources</h2>
                    <button
                      onClick={fetchDataSources}
                      className="text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <AddDataSourceModal onSuccess={fetchDataSources} />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading data sources...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {dataSources.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No data sources found. Add your first data source to get started.
                      </div>
                    ) : (
                      dataSources.map((source) => (
                        <div key={source.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <h3 className="font-medium text-gray-900">{source.name}</h3>
                            <div className="mt-1 text-sm text-gray-500">
                              <span>{source.dataType}</span>
                              <span className="mx-2">•</span>
                              <span>{(source.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span className="mx-2">•</span>
                              <span>Updated {new Date(source.lastUpdated * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span>Access Fee: {source.accessFee} HBAR</span>
                            </div>
                            <div className="flex items-center space-x-2 py-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-blue-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 16h-1v-4h-1m0 0h2m-2 0h-2m5 0v6m-4-6v6m1-10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                  />
                                </svg>
                                <span className="text-gray-600">{source.metadataLink}</span>
                              </div>

                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            source.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {source.isActive ? 'Active' : 'Inactive'}
                          </span>
                    
                            <RequestAccessButton 
                              dataSource={source}
                              onSuccess={() => {
                                fetchDataSources()
                              }}
                            />
                          
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Access Requests</h2>
                  <button
                    onClick={fetchAccessRequests}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={requestsLoading}
                  >
                    <RefreshCw className={`w-5 h-5 ${requestsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {requestError && (
                <div className="p-4 bg-red-50 text-red-700">
                  {requestError}
                </div>
              )}

              {requestsLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading access requests...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No access requests found.
                    </div>
                  ) : (
                    requests.map((request) => (
                      <div key={request.requestId} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">
                                Request for Data Source #{request.dataSourceId}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {request.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              From: {request.requester.slice(0, 6)}...{request.requester.slice(-4)}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">{request.purpose}</p>
                            <div className="mt-2 text-sm text-gray-500">
                              <span>Requested: {new Date(request.requestDate * 1000).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span>Access Amount: {request.paidAmount} HBAR</span>
                            </div>
                          </div>

                          {request.status === 'Pending' && (
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleProcessRequest(request.requestId, true)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleProcessRequest(request.requestId, false)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                              {request.status === 'Approved' && (
                                <div className="flex items-center gap-4">
                                <InsightsTrigger ipfsHash={encryptionService.decrypt(getDataSourceById(request.dataSourceId)?.storageLink as any)}>
                                  Analyze 
                                </InsightsTrigger>
                                <button
                                  onClick={() => handleDownload(request.dataSourceId)}
                                  className="flex items-center gap-2 px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                                >
                                  <Download size={16} />
                                  Download Data
                                </button>
                              </div>

                                )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataProvisionPage;