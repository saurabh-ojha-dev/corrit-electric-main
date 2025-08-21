'use client'
import React, { useEffect, useRef, useState } from 'react'
import { X, Shield, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient, API_ENDPOINTS } from '@/utils/api'

interface AddAdminProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

const ChangePasswordModal: React.FC<AddAdminProps> = ({ isModalOpen, setIsModalOpen }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const modalRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New password and confirm password do not match');
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            toast.error('New password must be different from current password');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            toast.success('Password changed successfully');
            
            // Close modal immediately after success
            setIsModalOpen(false);
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    // Don't render the modal if it's not open
    if (!isModalOpen) {
        return null;
    }

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
                            <h2 className="text-lg lg:text-xl font-semibold text-black">Change Password</h2>
                            <p className="text-xs lg:text-sm text-gray-600">Update your account password for enhanced security.</p>
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
                    {/* Current Password Field */}
                    <div>
                        <label htmlFor="currentPassword" className="block text-base font-normal text-[#00000099] mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[#191C1F]" />
                            </div>
                            <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                                <div className="w-px h-6 bg-gray-300"></div>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="currentPassword"
                                className="block placeholder:text-[#00000099] w-full pl-16 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* New Password Field */}
                    <div>
                        <label htmlFor="newPassword" className="block text-base font-normal text-[#00000099] mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[#191C1F]" />
                            </div>
                            <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                                <div className="w-px h-6 bg-gray-300"></div>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                className="block placeholder:text-[#00000099] w-full pl-16 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-base font-normal text-[#00000099] mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[#191C1F]" />
                            </div>
                            <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                                <div className="w-px h-6 bg-gray-300"></div>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                className="block placeholder:text-[#00000099] w-full pl-16 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-[#0063B0] text-white px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="whitespace-nowrap">
                                {isLoading ? 'Changing Password...' : 'Change Password'}
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

export default ChangePasswordModal