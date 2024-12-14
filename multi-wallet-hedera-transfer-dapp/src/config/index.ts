import { networkConfig } from "./networks";
import { AppConfig } from "./types";
import * as constants from "./constants";


import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime-types';


export * from "./types";

export const appConfig: AppConfig & {
  constants: typeof constants
} = {
  networks: networkConfig,
  constants
}



export const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};


export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSizeBytes?: number;
}

const validateFile = async (
  file: File,
  options: FileValidationOptions
): Promise<boolean> => {
  // Validate options
  if (!options.allowedMimeTypes?.length) {
    throw new Error('Must specify at least one allowed MIME type');
  }

  // Check file size if limit specified
  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    throw new Error(`File size exceeds maximum limit of ${options.maxSizeBytes} bytes`);
  }

  // Check file extension MIME type
  const extensionMimeType = mime.lookup(file.name);
  if (!extensionMimeType) {
    throw new Error('Could not determine file type from extension');
  }
  
  if (!options.allowedMimeTypes.includes(extensionMimeType)) {
    throw new Error(
      `File type ${extensionMimeType} not allowed. Supported types: ${options.allowedMimeTypes.join(', ')}`
    );
  }

  // Check actual file content MIME type
  try {
    const fileBuffer = await file.arrayBuffer();
    const fileHeader = await fileTypeFromBuffer(Buffer.from(fileBuffer));
    
    // Some text files may not have identifiable headers
    if (fileHeader) {
      if (!options.allowedMimeTypes.includes(fileHeader.mime)) {
        throw new Error(
          `File content type ${fileHeader.mime} does not match allowed types`
        );
      }
    } else {
      // For text files without headers, validate content is actually text
      const textDecoder = new TextDecoder();
      try {
        textDecoder.decode(fileBuffer);
      } catch {
        throw new Error('Invalid text file content');
      }
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to validate file content');
  }
};

export default validateFile;