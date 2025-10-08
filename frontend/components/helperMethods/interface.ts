export interface AddRiderProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

export interface ValidationErrors {
    fullName?: string;
    email?: string;
    upiId?: string;
    phoneNumber?: string;
    weeklyRentAmount?: string;
    aadhaarCard?: string;
    panCard?: string;
    address?: string;
    bankAccountNumber?: string;
    batterySmartCard?: string;
}

export interface UploadedFile {
    url: string;
    fileName: string;
    fileSize: number;
    documentType: string;
}

export interface RiderFormProps {
    formData: {
        fullName: string;
        email: string;
        upiId: string;
        phoneNumber: string;
        weeklyRentAmount: string;
        aadhaarCard: string;
        panCard: string;
        address: string;
        bankAccountNumber: string;
        batterySmartCard: string;
    };
    errors: ValidationErrors;
    touched: Record<string, boolean>;
    isLoading: boolean;
    uploadedFiles: Record<string, UploadedFile>;
    uploadingFiles: Record<string, boolean>;
    fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => void;
    triggerFileInput: (documentType: string) => void;
    removeUploadedFile: (documentType: string) => void;
    closeModal: () => void;
}

export interface RiderFileUploadProps {
    documentType: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    uploadedFiles: Record<string, UploadedFile>;
    uploadingFiles: Record<string, boolean>;
    triggerFileInput: (documentType: string) => void;
    removeUploadedFile: (documentType: string) => void;
}

export interface Rider {
    _id: string;
    riderId: string;
    name: string;
    email: string;
    phone: string;
    upiId: string;
    address: string;
    weeklyRentAmount: number;
    mandateStatus: 'pending' | 'active' | 'failed' | 'suspended' | 'cancelled' | 'PENDING' | 'ACTIVE' | 'FAILED' | 'CANCELLED' | 'REVOKED' | 'COMPLETED';
    verificationStatus: 'pending' | 'approved' | 'rejected';
    documents: {
        aadhaar?: string;
        pan?: string;
        addressProof?: string;
        bankProof?: string;
        batteryCard?: string;
        picture?: string;
    };
    assignedAdmin: string;
    isActive: boolean;
    mandateDetails?: {
        phonepeOrderId?: string;
        phonepeSubscriptionId?: string;
        merchantOrderId?: string;
        merchantSubscriptionId?: string;
        amount?: number;
        maxAmount?: number;
        frequency?: string;
        authWorkflowType?: string;
        amountType?: string;
        errorCode?: string;
        detailedErrorCode?: string;
        failureReason?: string;
    };
    nextDebitDate?: string | null;
    lastDebitDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Vehicle {
  _id: string;
  vehicleName: string;
  vehicleRegistrationNumber: string;
  vehicleChassisNumber: string;
  vehicleMotorNumber: string;
  iotImeiNumber: string;
  controllerNumber?: string;
  isActive: boolean;
  createdAt: string;
  riderId?: {
    _id: string;
    name: string;
    riderId: string;
  };
  assignedRiderId?: {
    _id: string;
    name: string;
    riderId: string;
  };
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  description: string;
  riderId?: {
    _id: string;
    name: string;
    riderId: string;
  };
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  actionType: string;
  actionLink?: string;
  actionData?: any;
  metadata?: {
    amount?: number;
    riderName?: string;
    riderId?: string;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    timestamp?: string;
    deviceInfo?: string;
    errorCode?: string;
    retryCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}
