'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Mail, Phone, User, X, CreditCard, User2, Loader2, MapPin, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { apiClient, API_ENDPOINTS } from '@/utils/api'

interface AddCustomerProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

interface ValidationErrors {
    fullName?: string;
    email?: string;
    upiId?: string;
    phoneNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    weeklyRentAmount?: string;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ isModalOpen, setIsModalOpen }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        upiId: '',
        phoneNumber: '',
        weeklyRentAmount: '500',
        street: '',
        city: '',
        state: '',
        pincode: '',
        gender: 'other'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const modalRef = useRef<HTMLDivElement>(null);

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

    const validateStreet = (value: string): string | undefined => {
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Street address must be at least 5 characters';
        return undefined;
    };

    const validateCity = (value: string): string | undefined => {
        if (!value.trim()) return 'City is required';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'City can only contain letters and spaces';
        return undefined;
    };

    const validateState = (value: string): string | undefined => {
        if (!value.trim()) return 'State is required';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'State can only contain letters and spaces';
        return undefined;
    };

    const validatePincode = (value: string): string | undefined => {
        if (!value.trim()) return 'Pincode is required';
        if (!/^\d{6}$/.test(value.trim())) return 'Please enter a valid 6-digit pincode';
        return undefined;
    };

    const validateWeeklyRentAmount = (value: string): string | undefined => {
        if (!value.trim()) return 'Weekly rent amount is required';
        const amount = parseFloat(value);
        if (isNaN(amount) || amount < 100) return 'Weekly rent amount must be at least ₹100';
        if (amount > 10000) return 'Weekly rent amount cannot exceed ₹10,000';
        return undefined;
    };

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'fullName':
                return validateFullName(value);
            case 'email':
                return validateEmail(value);
            case 'upiId':
                return validateUpiId(value);
            case 'phoneNumber':
                return validatePhoneNumber(value);
            case 'street':
                return validateStreet(value);
            case 'city':
                return validateCity(value);
            case 'state':
                return validateState(value);
            case 'pincode':
                return validatePincode(value);
            case 'weeklyRentAmount':
                return validateWeeklyRentAmount(value);
            default:
                return undefined;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        Object.keys(formData).forEach(key => {
            if (key !== 'gender') {
                const error = validateField(key, formData[key as keyof typeof formData]);
                if (error) {
                    newErrors[key as keyof ValidationErrors] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
        
        const error = validateField(name, value);
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
            // Prepare the data for the API
            const riderData = {
                name: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phoneNumber.trim(),
                upiId: formData.upiId.trim(),
                weeklyRentAmount: parseFloat(formData.weeklyRentAmount),
                address: {
                    street: formData.street.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                },
                gender: formData.gender
            };

            const response = await apiClient.post(API_ENDPOINTS.RIDERS.CREATE, riderData);

            if (response.data.success) {
                toast.success('Customer created successfully!');
                closeModal();
                
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('riderCreated', {
                        detail: response.data.rider
                    }));
                }
            } else {
                toast.error(response.data.message || 'Failed to create customer');
            }
        } catch (error: any) {
            console.error('Error creating customer:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message || 'Invalid data provided';
                toast.error(errorMessage);
            } else if (error.response?.status === 409) {
                toast.error('A customer with this phone number or email already exists');
            } else if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to create customers');
            } else {
                toast.error('Failed to create customer. Please try again.');
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
            street: '',
            city: '',
            state: '',
            pincode: '',
            gender: 'other'
        });
        setErrors({});
        setTouched({});
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
                            <h2 className="text-lg lg:text-xl font-semibold text-black">Add New Customer</h2>
                            <p className="text-xs lg:text-sm text-gray-600">Create customer and setup weekly payment mandate.</p>
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

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                    {/* Input Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter full name"
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.fullName && errors.fullName 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.fullName && errors.fullName && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.fullName && errors.fullName && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter email address"
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.email && errors.email 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.email && errors.email && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.email && errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">UPI ID</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="upiId"
                                    value={formData.upiId}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Username@Phonepay"
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.upiId && errors.upiId 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.upiId && errors.upiId && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.upiId && errors.upiId && (
                                <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" fill='black' />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter Phone number"
                                    maxLength={10}
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.phoneNumber && errors.phoneNumber 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.phoneNumber && errors.phoneNumber && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.phoneNumber && errors.phoneNumber && (
                                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                            )}
                        </div>
                    </div>

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Street Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter street address"
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.street && errors.street 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.street && errors.street && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.street && errors.street && (
                                <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">City</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter city"
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.city && errors.city 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.city && errors.city && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.city && errors.city && (
                                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">State</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter state"
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.state && errors.state 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.state && errors.state && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.state && errors.state && (
                                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Pincode</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter pincode"
                                    maxLength={6}
                                    className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.pincode && errors.pincode 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.pincode && errors.pincode && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.pincode && errors.pincode && (
                                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                            )}
                        </div>
                    </div>

                    {/* Gender and Weekly Rent Amount */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                required
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Weekly Rent Amount ₹</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">₹</span>
                                <input
                                    title='weekly-rent-amount'
                                    type="number"
                                    name="weeklyRentAmount"
                                    value={formData.weeklyRentAmount}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    min="100"
                                    max="10000"
                                    className={`w-full pl-6 lg:pl-8 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                                        touched.weeklyRentAmount && errors.weeklyRentAmount 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                    required
                                />
                                {touched.weeklyRentAmount && errors.weeklyRentAmount && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {touched.weeklyRentAmount && errors.weeklyRentAmount && (
                                <p className="text-red-500 text-xs mt-1">{errors.weeklyRentAmount}</p>
                            )}
                        </div>
                    </div>

                    {/* What happens next section */}
                    <div className="border border-[#0063B0] rounded-lg p-3 lg:p-4 bg-[#F4FAFF]">
                        <div className="flex items-center gap-2 lg:gap-3 mb-1">
                            <Image src="/Addcustomer-icon.svg" alt="info" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                            <h3 className="font-medium text-gray-900 text-sm lg:text-base">What happens next?</h3>
                        </div>
                        <ul className="space-y-1 text-xs lg:text-sm text-gray-700 ml-7 lg:ml-10">
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                <span>Customer will be created in the system</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                <span>PhonePe mandate authorization will be initiated</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                <span>Customer will receive UPI collect request to approve the mandate</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-[#0063B0] text-white px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <User2 className="w-3 h-3 lg:w-4 lg:h-4" fill='white' />
                            )}
                            <span className="whitespace-nowrap">
                                {isLoading ? 'Creating Customer...' : 'Create Customer & Setup Mandate'}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={isLoading}
                            className="flex-1 bg-[#D7D7D7] text-black px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddCustomer