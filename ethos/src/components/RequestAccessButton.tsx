import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { DATAMANAGEMENTCONTRACTID } from "../config/constants";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { ContractId } from "@hashgraph/sdk";

interface RequestAccessButtonProps {
    dataSource: {
      id: number;
      accessFee: number;
      name: string;
    };
    onSuccess?: () => void;
  }
  

  interface RequestAccessProps {
    dataSourceId: number;
    accessFee: number;  // in HBAR
    onSuccess?: () => void;
  }
  
  export const RequestAccessButton: React.FC<RequestAccessButtonProps> = ({ dataSource, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { walletInterface } = useWalletInterface();

    const requestAccess = async ({ dataSourceId, accessFee, onSuccess }: RequestAccessProps) => {
        try {
          const params = new ContractFunctionParameterBuilder()
            .addParam({
              type: "uint256",
              name: "dataSourceId",
              value: dataSourceId
            })
            .addParam({
              type: "string",
              name: "purpose",
              value: "Access request for data analysis" // This could be taken from user input
            });
      
          // Execute contract function with HBAR payment
          const result = await walletInterface?.executeContractFunction(
            DATAMANAGEMENTCONTRACTID as unknown as ContractId,
            "requestAccess",
            params,
            300000,
            accessFee * 10 ** 8
          );

          console.log(result)
      
          if (result) {
            onSuccess?.();
           
            console.log("Access requested successfully");
          }
      
        } catch (error) {
          console.error('Error requesting access:', error);
          throw new Error('Failed to request access. Please try again.');
        }
      };

      
    const handleRequest = async () => {
      setIsLoading(true);
      setError(null);
  
      try {
        await requestAccess({
          dataSourceId: dataSource.id,
          accessFee: dataSource.accessFee,
          onSuccess
        });
      } catch (err) {
        setError((err as any).message);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div>
        <button
        onClick={handleRequest}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
            isLoading 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        >
        {isLoading ? (
            <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Processing...
            </span>
        ) : (
            `Request Access (${dataSource.accessFee} HBAR)`
        )}
        </button>

        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };