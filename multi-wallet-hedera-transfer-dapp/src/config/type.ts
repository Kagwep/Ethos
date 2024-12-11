import { LucideIcon } from 'lucide-react';

export type NetworkName = "testnet";
export type ChainId = '0x128';
export type NetworkConfig = {
  network: NetworkName,
  jsonRpcUrl: string,
  mirrorNodeUrl: string,
  chainId: ChainId,
}

// purpose of this file is to define the type of the config object
export type NetworkConfigs = {
  [key in NetworkName]: {
    network: NetworkName,
    jsonRpcUrl: string,
    mirrorNodeUrl: string,
    chainId: ChainId,
  }
};

export type AppConfig = {
  networks: NetworkConfigs,
}


export interface WalletInterface {
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
}

export interface WalletContextType {
  accountId: string | null;
  walletInterface: WalletInterface;
}

export interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
}


export type Address = `0x${string}`;


// types.ts
export type FieldType = 'text' | 'textarea' | 'number' | 'radio' | 'checkbox' | 'select' | 'imageFile';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  accept?: string; // For file inputs
}

export interface FormStructure {
  title: string;
  description: string;
  fields: FormField[];
}

export interface NewField extends Omit<FormField, 'id'> {
  options: string[];
}

export interface FormResponse {
    formId: string;
    responses: {
      [fieldId: string]: string | string[] | number;
    };
    submittedAt: string;
  }
  

//   // types.ts
// export type Tool = 'pointer' | 'rectangle' | 'circle' | 'freehand' | 'label';

// export interface Point {
//   x: number;
//   y: number;
// }



export interface Point {
  x: number;
  y: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Tool {
  id: AnnotationType;
  icon: LucideIcon;
  name: string;
  category: string;
}

interface BaseAnnotation {
  id: number;
  type: AnnotationType;
}

export interface SegmentationAnnotation extends BaseAnnotation {
  type: 'semantic-segmentation' | 'instance-segmentation';
  points: Point[];
  mask: string;
  class?: string;
  instanceId?: number;
}

export interface KeypointAnnotation extends BaseAnnotation {
  type: 'keypoint';
  point: Point;
  label?: string;
  connections?: number[];
}

export interface CuboidAnnotation extends BaseAnnotation {
  type: 'cuboid';
  basePoint: Point;
  points: Point[];
  rotation?: Rotation;
}

export interface PolylineAnnotation extends BaseAnnotation {
  type: 'polyline';
  points: Point[];
  closed?: boolean;
}

// Using type here because it's a union type, which is a recommended use case for type
export type AnnotationType = 
  | 'pointer'
  | 'semantic-segmentation'
  | 'instance-segmentation'
  | 'keypoint'
  | 'cuboid'
  | 'polyline';

export type Annotation = 
  | SegmentationAnnotation 
  | KeypointAnnotation 
  | CuboidAnnotation 
  | PolylineAnnotation;