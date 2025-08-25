'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Mail, Phone, User, X, Shield, Lock, Bike } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { apiClient, API_ENDPOINTS } from '@/utils/api'

interface AddAdminProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

const AddVehicle: React.FC<AddAdminProps> = ({ isModalOpen, setIsModalOpen }) => {
    const [formData, setFormData] = useState({
        vehicleName: '',
        vehicleRegistrationNumber: '',
        vehicleChassisNumber: '',
        vehicleMotorNumber: '',
        iotImeiNumber: '',
        controllerNumber: '',
    });

    const modalRef = useRef<HTMLDivElement>(null);

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log("sending data", formData);
            // Send form data directly as it matches the backend structure
            const response = await apiClient.post(API_ENDPOINTS.VEHICLES.CREATE, formData);
            console.log("get response", response);

            if (response.data.success) {
                toast.success('Vehicle created successfully!');
                setIsModalOpen(false);
                setFormData({
                    vehicleName: '',
                    vehicleRegistrationNumber: '',
                    vehicleChassisNumber: '',
                    vehicleMotorNumber: '',
                    iotImeiNumber: '',
                    controllerNumber: '',
                });
            } else {
                toast.error(response.data.message || 'Failed to create vehicle');
            }
        } catch (error: any) {
            console.error('Error creating vehicle:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create vehicle';
            toast.error(errorMessage);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            vehicleName: '',
            vehicleRegistrationNumber: '',
            vehicleChassisNumber: '',
            vehicleMotorNumber: '',
            iotImeiNumber: '',
            controllerNumber: '',
        });
    };

    // Don't render the modal if it's not open
    if (!isModalOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-[#000000C2] flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4 lg:mb-6">
                    <div className="flex justify-start items-start gap-3 lg:gap-4">
                        <div className="p-2 rounded-xl bg-black">
                            <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-semibold text-black">Add New Vehicle</h2>
                            <p className="text-xs lg:text-sm text-gray-600">Create a new vehicle and assign it to a rider.</p>
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
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Vehicle Name</label>
                            <div className="relative">
                                <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="vehicleName"
                                    value={formData.vehicleName}
                                    onChange={handleInputChange}
                                    placeholder="Enter vehicle name"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Vehicle Registration Number</label>
                            <div className="relative">
                                <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="vehicleRegistrationNumber"
                                    value={formData.vehicleRegistrationNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter vehicle registration number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Vehicle Chassis Number</label>
                            <div className="relative">
                                <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="vehicleChassisNumber"
                                    value={formData.vehicleChassisNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter vehicle chassis number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Vehicle Motor Number</label>
                            <div className="relative">
                                <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" fill='black' />
                                <input
                                    type="text"
                                    name="vehicleMotorNumber"
                                    value={formData.vehicleMotorNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter vehicle motor number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* IOT IMEI number */}
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">IOT IMEI number</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="number"
                                    name="iotImeiNumber"
                                    value={formData.iotImeiNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter IOT IMEI number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* Controller number */}
                        <div>
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Controller number (Optional)-</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="number"
                                    name="controllerNumber"
                                    value={formData.controllerNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter controller number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-[#0063B0] text-white px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
                        >
                            <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="whitespace-nowrap">Create new Vehicle</span>
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 bg-[#D7D7D7] text-black px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm lg:text-base"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddVehicle