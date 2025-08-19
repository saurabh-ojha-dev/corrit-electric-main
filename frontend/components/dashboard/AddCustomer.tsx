'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Mail, Phone, User, X, CreditCard, User2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface AddCustomerProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ isModalOpen, setIsModalOpen }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        upiId: '',
        phoneNumber: '',
        weeklyRentAmount: '500'
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement API call to create customer
        console.log('Form submitted:', formData);
        toast.success('Customer created successfully!');
        setIsModalOpen(false);
        setFormData({
            fullName: '',
            email: '',
            upiId: '',
            phoneNumber: '',
            weeklyRentAmount: '500'
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            fullName: '',
            email: '',
            upiId: '',
            phoneNumber: '',
            weeklyRentAmount: '500'
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
                                    placeholder="Enter full name"
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
                            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">UPI ID</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                <input
                                    type="text"
                                    name="upiId"
                                    value={formData.upiId}
                                    onChange={handleInputChange}
                                    placeholder="Username@Phonepay"
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
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter Phone number"
                                    className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Weekly Rent Amount */}
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
                                className="w-full pl-6 lg:pl-8 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                                required
                            />
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
                            className="flex-1 bg-[#0063B0] text-white px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
                        >
                            <User2 className="w-3 h-3 lg:w-4 lg:h-4" fill='white' />
                            <span className="whitespace-nowrap">Create Customer & Setup Mandate</span>
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

export default AddCustomer