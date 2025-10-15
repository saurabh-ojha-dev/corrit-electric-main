'use client'
import React from 'react'
import { Mail, Phone, User, CreditCard, User2, Loader2, AlertCircle, Home, Battery, Banknote } from 'lucide-react'
import Image from 'next/image'
import RiderFileUpload from '../RiderFileUpload'
import { RiderFormProps } from '../../helperMethods/interface'
import WhatHappensNextSection from '../../common/WhatHappensNextSection'

const RiderForm: React.FC<RiderFormProps> = ({
    formData,
    errors,
    touched,
    isLoading,
    uploadedFiles,
    uploadingFiles,
    fileInputRefs,
    handleInputChange,
    handleBlur,
    handleSubmit,
    handleFileInputChange,
    triggerFileInput,
    removeUploadedFile,
    closeModal
}) => {
    return (
        <div>
            {/* Hidden file inputs */}
            <input
                ref={el => { fileInputRefs.current.aadhaar = el; }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileInputChange(e, 'aadhaar')}
                className="hidden-file-input"
                aria-label="Upload Aadhaar document"
            />
            <input
                ref={el => { fileInputRefs.current.pan = el; }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileInputChange(e, 'pan')}
                className="hidden-file-input"
                aria-label="Upload Pan document"
            />
            <input
                ref={el => { fileInputRefs.current.addressProof = el; }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileInputChange(e, 'addressProof')}
                className="hidden-file-input"
                aria-label="Upload Address proof document"
            />
            <input
                ref={el => { fileInputRefs.current.bankProof = el; }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileInputChange(e, 'bankProof')}
                className="hidden-file-input"
                aria-label="Upload Bank proof document"
            />
            <input
                ref={el => { fileInputRefs.current.batteryCard = el; }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileInputChange(e, 'batteryCard')}
                className="hidden-file-input"
                aria-label="Upload Battery smart card document"
            />
            <input
                ref={el => { fileInputRefs.current.picture = el; }}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInputChange(e, 'picture')}
                className="hidden-file-input"
                aria-label="Upload Profile image"
            />

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* Input Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    {/* Full Name */}
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
                                className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.fullName && errors.fullName
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

                    {/* Email Address */}
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
                                className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.email && errors.email
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

                    {/* UPI ID */}
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
                                className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.upiId && errors.upiId
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

                    {/* Phone Number */}
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
                                className={`w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.phoneNumber && errors.phoneNumber
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

                {/* Weekly Rent Amount */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
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
                                className={`w-full pl-6 lg:pl-8 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.weeklyRentAmount && errors.weeklyRentAmount
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

                {/* Aadhaar Card */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Aadhaar Card</label>

                        {/* Aadhaar Card Number Input */}
                        <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">
                                <Image src="/id-card.svg" alt="card" width={16} height={16} className="w-4 h-4" />
                            </span>
                            <input
                                title='aadhaar-card'
                                type="text"
                                name="aadhaarCard"
                                placeholder="Enter your Aadhaar card number (optional if document uploaded)"
                                value={formData.aadhaarCard}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.aadhaarCard && errors.aadhaarCard
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                            />
                            {touched.aadhaarCard && errors.aadhaarCard && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                        {touched.aadhaarCard && errors.aadhaarCard && (
                            <p className="text-red-500 text-xs mt-1">{errors.aadhaarCard}</p>
                        )}

                        {/* Aadhaar Card File Upload */}
                        <RiderFileUpload
                            documentType="aadhaar"
                            title="Upload aadhaar"
                            description="Image/PDF"
                            icon={<Image src="/id-card.svg" alt="card" width={24} height={24} className="w-6 h-6" />}
                            uploadedFiles={uploadedFiles}
                            uploadingFiles={uploadingFiles}
                            triggerFileInput={triggerFileInput}
                            removeUploadedFile={removeUploadedFile}
                        />
                        {touched.aadhaarCard && errors.aadhaarCard && (
                            <p className="text-red-500 text-xs mt-1">{errors.aadhaarCard}</p>
                        )}
                    </div>
                </div>

                {/* Pan Card */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Pan Card</label>

                        {/* Pan Card Number Input */}
                        <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">
                                <Image src="/id-card.svg" alt="card" width={16} height={16} className="w-4 h-4" />
                            </span>
                            <input
                                title='pan-card'
                                type="text"
                                name="panCard"
                                placeholder="Enter your Pan card number (optional if document uploaded)"
                                value={formData.panCard}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.panCard && errors.panCard
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                            />
                            {touched.panCard && errors.panCard && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                        {touched.panCard && errors.panCard && (
                            <p className="text-red-500 text-xs mt-1">{errors.panCard}</p>
                        )}

                        {/* Pan Card File Upload */}
                        <RiderFileUpload
                            documentType="pan"
                            title="Upload pan"
                            description="Image/PDF"
                            icon={<Image src="/id-card.svg" alt="card" width={24} height={24} className="w-6 h-6" />}
                            uploadedFiles={uploadedFiles}
                            uploadingFiles={uploadingFiles}
                            triggerFileInput={triggerFileInput}
                            removeUploadedFile={removeUploadedFile}
                        />
                        {touched.panCard && errors.panCard && (
                            <p className="text-red-500 text-xs mt-1">{errors.panCard}</p>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Address</label>

                        {/* Address Input */}
                        <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">
                                <Home className="w-4 h-4" />
                            </span>
                            <input
                                title='address'
                                type="text"
                                name="address"
                                placeholder="Enter your Address"
                                value={formData.address}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.address && errors.address
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                required
                            />
                            {touched.address && errors.address && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                        {touched.address && errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}

                        {/* Address File Upload */}
                        <RiderFileUpload
                            documentType="addressProof"
                            title="Upload electricity bill"
                            description="Image/PDF"
                            icon={<Home className="w-6 h-6 text-blue-600" />}
                            uploadedFiles={uploadedFiles}
                            uploadingFiles={uploadingFiles}
                            triggerFileInput={triggerFileInput}
                            removeUploadedFile={removeUploadedFile}
                        />
                        {touched.addressProof && errors.addressProof && (
                            <p className="text-red-500 text-xs mt-1">{errors.addressProof}</p>
                        )}
                    </div>
                </div>

                {/* Bank Account Number*/}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Bank Account Number</label>

                        {/* Bank Account Number Input */}
                        <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">
                                <Banknote className="w-4 h-4" />
                            </span>
                            <input
                                title='bank-account-number'
                                type="text"
                                name="bankAccountNumber"
                                placeholder="Enter your Bank Account Number (optional if document uploaded)"
                                value={formData.bankAccountNumber}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.bankAccountNumber && errors.bankAccountNumber
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                            />
                            {touched.bankAccountNumber && errors.bankAccountNumber && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                        {touched.bankAccountNumber && errors.bankAccountNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber}</p>
                        )}

                        {/* Bank Passbook File Upload */}
                        <RiderFileUpload
                            documentType="bankProof"
                            title="Upload bank passbook"
                            description="Image/PDF"
                            icon={<Banknote className="w-6 h-6 text-blue-600" />}
                            uploadedFiles={uploadedFiles}
                            uploadingFiles={uploadingFiles}
                            triggerFileInput={triggerFileInput}
                            removeUploadedFile={removeUploadedFile}
                        />
                        {touched.bankAccountNumber && errors.bankAccountNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber}</p>
                        )}
                    </div>
                </div>

                {/* Battery Smart Card */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Battery Smart Card (Optional)</label>

                        {/* Battery Smart Card Input */}
                        <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">
                                <Battery className="w-4 h-4" />
                            </span>
                            <input
                                title='battery-smart-card'
                                type="text"
                                name="batterySmartCard"
                                placeholder="Enter your Battery Smart Card (optional)"
                                value={formData.batterySmartCard}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${touched.batterySmartCard && errors.batterySmartCard
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                            />
                            {touched.batterySmartCard && errors.batterySmartCard && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                        {touched.batterySmartCard && errors.batterySmartCard && (
                            <p className="text-red-500 text-xs mt-1">{errors.batterySmartCard}</p>
                        )}

                        {/* Battery Smart Card File Upload */}
                        <RiderFileUpload
                            documentType="batteryCard"
                            title="Upload battery smart card"
                            description="Image/PDF"
                            icon={<Battery className="w-6 h-6 text-blue-600" />}
                            uploadedFiles={uploadedFiles}
                            uploadingFiles={uploadingFiles}
                            triggerFileInput={triggerFileInput}
                            removeUploadedFile={removeUploadedFile}
                        />
                        {touched.batterySmartCard && errors.batterySmartCard && (
                            <p className="text-red-500 text-xs mt-1">{errors.batterySmartCard}</p>
                        )}
                    </div>
                </div>

                {/* Profile Image Card */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Profile Image</label>

                        {/* Profile Image File Upload */}
                        <RiderFileUpload
                            documentType="picture"
                            title="Upload profile image"
                            description="Image only"
                            icon={<User2 className="w-6 h-6 text-blue-600" />}
                            uploadedFiles={uploadedFiles}
                            uploadingFiles={uploadingFiles}
                            triggerFileInput={triggerFileInput}
                            removeUploadedFile={removeUploadedFile}
                        />
                        {touched.picture && errors.picture && (
                            <p className="text-red-500 text-xs mt-1">{errors.picture}</p>
                        )}
                    </div>
                </div>

                {/* What happens next section */}
                <WhatHappensNextSection />

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
                            {isLoading ? 'Creating Rider...' : 'Create Rider & Setup Mandate'}
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
    )
}

export default RiderForm