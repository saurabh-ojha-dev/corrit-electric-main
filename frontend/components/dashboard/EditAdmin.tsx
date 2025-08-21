'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Mail, Phone, User, X, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient, API_ENDPOINTS } from '@/utils/api'

interface AdminData {
    _id: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface EditAdminProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    adminData: AdminData | null;
    onAdminUpdated?: () => void;
    isProfileEdit?: boolean; // New prop to distinguish profile edit from admin management
}

const EditAdmin: React.FC<EditAdminProps> = ({
    isModalOpen,
    setIsModalOpen,
    adminData,
    onAdminUpdated,
    isProfileEdit = false
}) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        role: 'admin',
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    // Populate form when adminData changes
    useEffect(() => {
        setFormData({
            username: adminData?.username || '',
            email: adminData?.email || '',
            phone: adminData?.phone || '',
            role: adminData?.role || 'admin',
            isActive: adminData?.isActive !== undefined ? adminData.isActive : true
        });
    }, [adminData]);

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
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let apiData;
            let endpoint;

            if (isProfileEdit) {
                // Profile edit - only allow username, email, phone
                apiData = {
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone
                };
                endpoint = API_ENDPOINTS.AUTH.UPDATE_PROFILE;
            } else {
                // Admin management - allow role and isActive changes
                apiData = {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    isActive: formData.isActive === 'true' || formData.isActive === true
                };
                endpoint = API_ENDPOINTS.ADMIN.UPDATE(adminData!._id);
            }

            await apiClient.put(endpoint, apiData);
            toast.success(isProfileEdit ? 'Profile updated successfully!' : 'Admin updated successfully!');

            setIsModalOpen(false);
            if (onAdminUpdated) {
                onAdminUpdated();
            }
        } catch (error: any) {
            console.error('Error updating:', error);
            const errorMessage = error.response?.data?.message || (isProfileEdit ? 'Failed to update profile' : 'Failed to update admin');
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            username: '',
            email: '',
            phone: '',
            role: 'admin',
            isActive: true
        });
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-[#000000C2] flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4 lg:mb-6">
                    <div className="flex justify-start items-start gap-3 lg:gap-4">
                        <div className="p-2 rounded-xl bg-black">
                            <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-semibold text-black">
                                {isProfileEdit ? 'Edit Profile' : 'Edit Admin'}
                            </h2>
                            <p className="text-xs lg:text-sm text-gray-600">
                                {isProfileEdit 
                                    ? 'Update your account details.'
                                    : 'Update admin account details and permissions.'
                                }
                            </p>
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
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter username"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
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
                                    placeholder="Enter email address"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" fill='black' />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>
                        
                        {/* Only show role and status for admin management, not profile edit */}
                        {!isProfileEdit && (
                            <>
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                            required
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="Superadmin">Super Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Status</label>
                                    <div className="relative">
                                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-100 flex items-center justify-center absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <select
                                            name="isActive"
                                            value={formData.isActive.toString()}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* What happens next section */}
                    <div className="border border-[#0063B0] rounded-lg p-3 lg:p-4 bg-[#F4FAFF]">
                        <div className="flex items-center gap-2 lg:gap-3 mb-1">
                            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm lg:text-base">What happens next?</h3>
                        </div>
                        <ul className="space-y-1 text-xs lg:text-sm text-gray-700 ml-7 lg:ml-10">
                            {isProfileEdit ? (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                        <span>Your profile will be updated in the system</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                        <span>Changes will take effect immediately</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                        <span>You may need to log in again with updated credentials</span>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                        <span>Admin account will be updated in the system</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                        <span>Changes will take effect immediately</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                                        <span>Admin will retain their login access</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-[#0063B0] text-white px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="whitespace-nowrap">
                                {isSubmitting 
                                    ? 'Saving...' 
                                    : (isProfileEdit ? 'Update Profile' : 'Update Admin')
                                }
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={isSubmitting}
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

export default EditAdmin