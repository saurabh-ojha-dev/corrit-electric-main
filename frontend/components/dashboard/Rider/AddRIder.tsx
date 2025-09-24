'use client'
import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { apiClient, API_ENDPOINTS, phonepeClient } from '@/utils/api'
import { validateField } from '../../helperMethods/Validations'
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

        Object.keys(formData).forEach(key => {
            if (key !== 'gender') {
                const error = validateField(key, formData[key as keyof typeof formData], uploadedFiles);
                if (error) {
                    newErrors[key as keyof ValidationErrors] = error;
                }
            }
        });

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
                toast.success(`${documentType} uploaded successfully`);
            } else {
                toast.error(response.data.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
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
        fileInputRefs.current[documentType]?.click();
    };

    // Remove uploaded file
    const removeUploadedFile = (documentType: string) => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[documentType];
            return newFiles;
        });
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

        const error = validateField(name, value, uploadedFiles);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);

        // Validate form
        if (!validateForm()) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        setIsLoading(true);

        try {
            // PhonePe Authorization
            const phonepeAuthResponse = await phonepeClient.post(API_ENDPOINTS.PHONEPE.AUTHORIZATION, {
                client_id: process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID,
                client_version: process.env.NEXT_PUBLIC_PHONEPE_CLIENT_VERSION,
                client_secret: process.env.NEXT_PUBLIC_PHONEPE_CLIENT_SECRET,
                grant_type: process.env.NEXT_PUBLIC_PHONEPE_GRANT_TYPE,
            });

            if (!phonepeAuthResponse.data.access_token) {
                return toast.error('Connection to PhonePe failed');
            }

            const merchantOrderId = `MO${Date.now()}`;
            const merchantSubscriptionId = `MS${Date.now()}`;
            const phonepe_access_token = phonepeAuthResponse.data.access_token;

            // PhonePe Subscription Setup
            const phonepeSubscriptionResponse = await phonepeClient.post(
                API_ENDPOINTS.PHONEPE.SUBSCRIPTION_SETUP,
                {
                    merchantOrderId: merchantOrderId,
                    amount: parseFloat(formData.weeklyRentAmount) * 100, // Convert to paise
                    expireAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                    paymentFlow: {
                        type: "SUBSCRIPTION_SETUP",
                        merchantSubscriptionId: merchantSubscriptionId,
                        authWorkflowType: "TRANSACTION",
                        amountType: "FIXED",
                        maxAmount: 10000 * 100, // Convert to paise
                        frequency: "WEEKLY",
                        expireAt: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
                        paymentMode: {
                            type: "UPI_COLLECT",
                            details: {
                                type: "VPA",
                                vpa: formData.upiId.trim()
                            }
                        }
                    }
                },
                {
                    headers: {
                        'Authorization': `O-Bearer ${phonepe_access_token}`,
                        'Content-Type': 'application/json'
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
            console.error('Error creating Rider:', error);

            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message || 'Invalid data provided';
                toast.error(errorMessage);
            } else if (error.response?.status === 409) {
                toast.error('A Rider with this phone number or email already exists');
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