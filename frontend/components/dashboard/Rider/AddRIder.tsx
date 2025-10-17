'use client'
import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
// Removed validateField import - using simple inline validation
import { AddRiderProps, ValidationErrors, UploadedFile } from '../../helperMethods/interface'
import RiderForm from './RiderForm'

const AddRider: React.FC<AddRiderProps> = ({ isModalOpen, setIsModalOpen }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        upiId: "",
        phoneNumber: "",
        weeklyRentAmount: "500",
        aadhaarCard: "",
        panCard: "",
        address: "",
        bankAccountNumber: "",
        batterySmartCard: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Simple validation for all required fields
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.upiId.trim()) {
            newErrors.upiId = 'UPI ID is required';
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(formData.upiId.trim())) {
            newErrors.upiId = 'Please enter a valid UPI ID (e.g., username@provider)';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }

        if (!formData.weeklyRentAmount.trim()) {
            newErrors.weeklyRentAmount = 'Weekly rent amount is required';
        } else {
            const amount = parseFloat(formData.weeklyRentAmount);
            if (isNaN(amount) || amount < 100) {
                newErrors.weeklyRentAmount = 'Weekly rent amount must be at least ₹100';
            } else if (amount > 10000) {
                newErrors.weeklyRentAmount = 'Weekly rent amount cannot exceed ₹10,000';
            }
        }

        if (!uploadedFiles.aadhaar) {
            newErrors.aadhaarCard = 'Please upload Aadhaar document';
        } else if (formData.aadhaarCard.trim() && !/^\d{12}$/.test(formData.aadhaarCard.trim())) {
            newErrors.aadhaarCard = 'Aadhaar card number must be 12 digits';
        }

        if (!uploadedFiles.pan) {
            newErrors.panCard = 'Please upload PAN document';
        } else if (formData.panCard.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard.trim().toUpperCase())) {
            newErrors.panCard = 'Please enter a valid PAN card number (e.g., ABCDE1234F)';
        }

        if (!uploadedFiles.bankProof) {
            newErrors.bankAccountNumber = 'Please upload bank passbook document';
        } else if (formData.bankAccountNumber.trim() && !/^\d{9,18}$/.test(formData.bankAccountNumber.trim())) {
            newErrors.bankAccountNumber = 'Bank account number must be 9-18 digits';
        }

        if (!uploadedFiles.addressProof) {
            newErrors.addressProof = 'Please upload address proof document (electricity bill)';
        }

        if (!uploadedFiles.picture) {
            newErrors.picture = 'Please upload profile picture';
        }

        // Optional battery card validation
        if (uploadedFiles.batteryCard && !formData.batterySmartCard.trim()) {
            newErrors.batterySmartCard = 'Battery smart card number is required when document is uploaded';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // File upload handler

    const handleFileUpload = async (file: File, documentType: string) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploadingFiles(prev => ({ ...prev, [documentType]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);

            const response = await apiClient.post('/api/upload/rider-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUploadedFiles(prev => ({
                    ...prev,
                    [documentType]: response.data.data
                }));
                
                // Clear validation errors for this document type
                setErrors(prev => {
                    const newErrors = { ...prev };
                    if (documentType === 'aadhaar') {
                        delete newErrors.aadhaarCard;
                    } else if (documentType === 'pan') {
                        delete newErrors.panCard;
                    } else if (documentType === 'bankProof') {
                        delete newErrors.bankAccountNumber;
                    } else if (documentType === 'addressProof') {
                        delete newErrors.addressProof;
                    } else if (documentType === 'picture') {
                        delete newErrors.picture;
                    }
                    return newErrors;
                });
                
                toast.success(`${documentType} uploaded successfully`);
            } else {
                toast.error(response.data.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploadingFiles(prev => ({ ...prev, [documentType]: false }));
        }
    };

    // File input change handler
    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file, documentType);
        }
    };

    // Trigger file input
    const triggerFileInput = (documentType: string) => {
        // Mark the field as touched when user clicks to upload
        setTouched(prev => ({ ...prev, [documentType]: true }));
        fileInputRefs.current[documentType]?.click();
    };

    // Remove uploaded file
    const removeUploadedFile = (documentType: string) => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[documentType];
            return newFiles;
        });
        
        // Re-validate the field when file is removed
        setTimeout(() => {
            validateForm();
        }, 100);
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof ValidationErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        // Simple field validation on blur
        let error: string | undefined;
        
        switch (name) {
            case 'fullName':
                if (!value.trim()) error = 'Full name is required';
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'upiId':
                if (!value.trim()) {
                    error = 'UPI ID is required';
                } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(value.trim())) {
                    error = 'Please enter a valid UPI ID (e.g., username@provider)';
                }
                break;
            case 'phoneNumber':
                if (!value.trim()) {
                    error = 'Phone number is required';
                } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
                    error = 'Please enter a valid 10-digit mobile number';
                }
                break;
            case 'address':
                if (!value.trim()) {
                    error = 'Address is required';
                } else if (value.trim().length < 10) {
                    error = 'Address must be at least 10 characters';
                }
                break;
            case 'weeklyRentAmount':
                if (!value.trim()) {
                    error = 'Weekly rent amount is required';
                } else {
                    const amount = parseFloat(value);
                    if (isNaN(amount) || amount < 100) {
                        error = 'Weekly rent amount must be at least ₹100';
                    } else if (amount > 10000) {
                        error = 'Weekly rent amount cannot exceed ₹10,000';
                    }
                }
                break;
            case 'aadhaarCard':
                if (!uploadedFiles.aadhaar) {
                    error = 'Please upload Aadhaar document';
                } else if (value.trim() && !/^\d{12}$/.test(value.trim())) {
                    error = 'Aadhaar card number must be 12 digits';
                }
                break;
            case 'panCard':
                if (!uploadedFiles.pan) {
                    error = 'Please upload PAN document';
                } else if (value.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.trim().toUpperCase())) {
                    error = 'Please enter a valid PAN card number (e.g., ABCDE1234F)';
                }
                break;
            case 'bankAccountNumber':
                if (!uploadedFiles.bankProof) {
                    error = 'Please upload bank passbook document';
                } else if (value.trim() && !/^\d{9,18}$/.test(value.trim())) {
                    error = 'Bank account number must be 9-18 digits';
                }
                break;
            case 'batterySmartCard':
                if (uploadedFiles.batteryCard && !value.trim()) {
                    error = 'Battery smart card number is required when document is uploaded';
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        // Mark all fields as touched including file upload fields
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);
        
        // Mark all file upload and document fields as touched for validation display
        allTouched.aadhaarCard = true;
        allTouched.panCard = true;
        allTouched.bankAccountNumber = true;
        allTouched.addressProof = true;
        allTouched.picture = true;
        allTouched.batterySmartCard = true;
        
        setTouched(allTouched);

        // Validate form immediately
        const isValid = validateForm();
        
        if (!isValid) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }
        
        // If validation passes, proceed with submission
        proceedWithSubmission();
    };

    const proceedWithSubmission = async () => {

        setIsLoading(true);

        try {
            // PhonePe Authorization (using backend proxy)
            const phonepeAuthResponse = await apiClient.post(API_ENDPOINTS.PHONEPE.AUTHORIZATION);

            if (!phonepeAuthResponse.data.success || !phonepeAuthResponse.data.access_token) {
                return toast.error('Connection to PhonePe failed');
            }

            const merchantOrderId = `MO${Date.now()}`;
            const merchantSubscriptionId = `MS${Date.now()}`;
            const phonepe_access_token = phonepeAuthResponse.data.access_token;

            // PhonePe Subscription Setup (using backend proxy)
            const phonepeSubscriptionResponse = await apiClient.post(
                API_ENDPOINTS.PHONEPE.SUBSCRIPTION_SETUP,
                {
                    access_token: phonepe_access_token,
                    subscriptionData: {
                        merchantOrderId: merchantOrderId,
                        amount: parseFloat(formData.weeklyRentAmount) * 100, // Convert to paise
                        expireAt: Date.now() + (10 * 60 * 1000), // 10 minutes from now
                        paymentFlow: {
                            type: "SUBSCRIPTION_SETUP",
                            merchantSubscriptionId: merchantSubscriptionId,
                            authWorkflowType: "TRANSACTION",
                            amountType: "FIXED",
                            maxAmount: parseFloat(formData.weeklyRentAmount) * 100, // FIXED: maxAmount must equal amount
                            frequency: "ON_DEMAND",
                            expireAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year from now
                            paymentMode: {
                                type: "UPI_COLLECT",
                                details: {
                                    type: "VPA",
                                    vpa: formData.upiId.trim()
                                }
                            }
                        }
                    }
                }
            );

            // Prepare the data for the API
            const riderData = {
                name: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phoneNumber.trim(),
                upiId: formData.upiId.trim(),
                weeklyRentAmount: parseFloat(formData.weeklyRentAmount),
                aadhaarCard: formData.aadhaarCard.trim(),
                panCard: formData.panCard.trim(),
                address: formData.address.trim(),
                bankAccountNumber: formData.bankAccountNumber.trim(),
                batterySmartCard: formData.batterySmartCard.trim(),
                documents: {
                    aadhaar: uploadedFiles.aadhaar?.url || '',
                    pan: uploadedFiles.pan?.url || '',
                    addressProof: uploadedFiles.addressProof?.url || '',
                    bankProof: uploadedFiles.bankProof?.url || '',
                    batteryCard: uploadedFiles.batteryCard?.url || '',
                    picture: uploadedFiles.picture?.url || ''
                },
                mandateId: phonepeSubscriptionResponse.data.orderId,
                merchantOrderId,
                merchantSubscriptionId,
                mandateStatus: phonepeSubscriptionResponse.data.state,
            };

            const response = await apiClient.post(API_ENDPOINTS.RIDERS.CREATE, riderData);

            if (response.data.success) {
                toast.success('Rider created successfully!');
                closeModal();

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('riderCreated', {
                        detail: response.data.rider
                    }));
                }
            } else {
                toast.error(response.data.message || 'Failed to create Rider');
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                // Check if backend returned field-specific validation errors
                if (error.response.data?.errors && typeof error.response.data.errors === 'object') {
                    // Map backend errors to form fields
                    const backendErrors: ValidationErrors = {};
                    const fieldsTouched: Record<string, boolean> = {};

                    Object.keys(error.response.data.errors).forEach(key => {
                        backendErrors[key as keyof ValidationErrors] = error.response.data.errors[key];
                        fieldsTouched[key] = true;
                    });

                    setErrors(backendErrors);
                    setTouched(prev => ({ ...prev, ...fieldsTouched }));
                    toast.error('Please fix the validation errors below');
                } else {
                    // Show generic error message if no field-specific errors
                    const errorMessage = error.response.data.message || 'Invalid data provided';
                    toast.error(errorMessage);
                }
            } else if (error.response?.status === 409) {
                const errorMessage = error.response.data.message || 'A Rider with this information already exists';
                toast.error(errorMessage);
            } else if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to create Riders');
            } else {
                toast.error('Failed to create Rider. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            fullName: '',
            email: '',
            upiId: '',
            phoneNumber: '',
            weeklyRentAmount: '500',
            aadhaarCard: '',
            panCard: '',
            address: '',
            bankAccountNumber: '',
            batterySmartCard: '',
        });
        setErrors({});
        setTouched({});
        setUploadedFiles({});
        setUploadingFiles({});
        setIsLoading(false);
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#000000C2] flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4 lg:mb-6">
                    <div className="flex justify-start items-start gap-3 lg:gap-4">
                        <div className="p-2 rounded-xl bg-black">
                            <Image src="/group-user-icon.svg" alt="onboarding" width={24} height={24} className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-semibold text-black">Add New Rider</h2>
                            <p className="text-xs lg:text-sm text-gray-600">Create Rider and setup weekly payment mandate.</p>
                        </div>
                    </div>
                    <button
                        type='button'
                        title='close-modal'
                        onClick={closeModal}
                        className="text-white bg-black rounded-full p-1.5 lg:p-2 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                        <X className="w-3 h-3 lg:w-4 lg:h-4" color='white' />
                    </button>
                </div>

                <RiderForm
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    isLoading={isLoading}
                    uploadedFiles={uploadedFiles}
                    uploadingFiles={uploadingFiles}
                    fileInputRefs={fileInputRefs}
                    handleInputChange={handleInputChange}
                    handleBlur={handleBlur}
                    handleSubmit={handleSubmit}
                    handleFileInputChange={handleFileInputChange}
                    triggerFileInput={triggerFileInput}
                    removeUploadedFile={removeUploadedFile}
                    closeModal={closeModal}
                />
            </div>
        </div>
    )
}

export default AddRider