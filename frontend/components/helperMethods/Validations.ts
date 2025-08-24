import { UploadedFile } from './interface';

// Validation functions
const validateFullName = (value: string): string | undefined => {
    if (!value.trim()) return 'Full name is required';
    if (value.trim().length < 2) return 'Full name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Full name can only contain letters and spaces';
    return undefined;
};

const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
    return undefined;
};

const validateUpiId = (value: string): string | undefined => {
    if (!value.trim()) return 'UPI ID is required';
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
    if (!upiRegex.test(value.trim())) return 'Please enter a valid UPI ID (e.g., username@provider)';
    return undefined;
};

const validatePhoneNumber = (value: string): string | undefined => {
    if (!value.trim()) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(value.trim())) return 'Please enter a valid 10-digit mobile number';
    return undefined;
};

const validateAddress = (value: string): string | undefined => {
    if (!value.trim()) return 'Address is required';
    if (value.trim().length < 10) return 'Address must be at least 10 characters';
    return undefined;
};

const validateAadhaarCard = (value: string, uploadedFiles: Record<string, UploadedFile>): string | undefined => {
    if (!value.trim() && !uploadedFiles.aadhaar) return 'Aadhaar card number or document is required';
    if (value.trim() && !/^\d{12}$/.test(value.trim())) return 'Aadhaar card number must be 12 digits';
    return undefined;
};

const validatePanCard = (value: string, uploadedFiles: Record<string, UploadedFile>): string | undefined => {
    if (!value.trim() && !uploadedFiles.pan) return 'PAN card number or document is required';
    if (value.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.trim().toUpperCase())) {
        return 'Please enter a valid PAN card number (e.g., ABCDE1234F)';
    }
    return undefined;
};

const validateBankAccountNumber = (value: string, uploadedFiles: Record<string, UploadedFile>): string | undefined => {
    if (!value.trim() && !uploadedFiles.bankProof) return 'Bank account number or document is required';
    if (value.trim() && !/^\d{9,18}$/.test(value.trim())) return 'Bank account number must be 9-18 digits';
    return undefined;
};

const validateBatterySmartCard = (value: string): string | undefined => {
    // Optional field - only validate if provided
    if (value.trim() && value.trim().length < 3) {
        return 'Battery smart card number must be at least 3 characters';
    }
    return undefined;
};

const validateWeeklyRentAmount = (value: string): string | undefined => {
    if (!value.trim()) return 'Weekly rent amount is required';
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 100) return 'Weekly rent amount must be at least ₹100';
    if (amount > 10000) return 'Weekly rent amount cannot exceed ₹10,000';
    return undefined;
};

export const validateField = (name: string, value: string, uploadedFiles: Record<string, UploadedFile> = {}): string | undefined => {
    switch (name) {
        case 'fullName':
            return validateFullName(value);
        case 'email':
            return validateEmail(value);
        case 'upiId':
            return validateUpiId(value);
        case 'phoneNumber':
            return validatePhoneNumber(value);
        case 'address':
            return validateAddress(value);
        case 'aadhaarCard':
            return validateAadhaarCard(value, uploadedFiles);
        case 'panCard':
            return validatePanCard(value, uploadedFiles);
        case 'bankAccountNumber':
            return validateBankAccountNumber(value, uploadedFiles);
        case 'batterySmartCard':
            return validateBatterySmartCard(value);
        case 'weeklyRentAmount':
            return validateWeeklyRentAmount(value);
        default:
            return undefined;
    }
};