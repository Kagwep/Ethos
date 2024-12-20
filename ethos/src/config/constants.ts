import DATAMANAGEMENTABI from "../abi/DataAccessManagement.json";
import SurveyAbi from "../abi/SurveyManager.json";
import FeedBackABI from "../abi/FeedbackManager.json";

export const METAMASK_GAS_LIMIT_ASSOCIATE=800_000;
export const METAMASK_GAS_LIMIT_TRANSFER_FT=50_000;
export const METAMASK_GAS_LIMIT_TRANSFER_NFT=100_000;
export const DATAMANAGEMENTCONTRACT = "0xc02D72Aef09cf406940556Fdf458Be586f634451";
export const DATAMANAGEMENTAbi = DATAMANAGEMENTABI;
export const DATAMANAGEMENTCONTRACTID = '0.0.5243021';
export const  SURVEYMANAGERCONTRACT ="0x8F021Aa1dC5642a6Ef9F49fB5e59A4f214D25151"
export const  SURVEYMANAGERCONTRACTID = '0.0.5260192'
export const SURVEYABI = SurveyAbi;
export const FEEDBACKABI = FeedBackABI;
export const FEEDBACKCONTRACT = '0xFf4A87273E321E200D5214252181027557a07e05'
export const FEEDBACKCONTRACTID = '0.0.5255131'


export const ALLOWED_MIME_TYPES = [
    'application/json',
    'text/csv',
    'text/plain',
    'application/pdf',
    'application/xml',
    'text/xml'
  ];