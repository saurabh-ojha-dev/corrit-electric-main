'use client'
import React from 'react'
import { Loader2, FileText, Trash2 } from 'lucide-react'
import { RiderFileUploadProps } from '../helperMethods/interface'

const RiderFileUpload: React.FC<RiderFileUploadProps> = ({
    documentType,
    title,
    description,
    icon,
    uploadedFiles,
    uploadingFiles,
    triggerFileInput,
    removeUploadedFile
}) => {
    const isUploading = uploadingFiles[documentType];
    const uploadedFile = uploadedFiles[documentType];

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => !isUploading && triggerFileInput(documentType)}>
            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 animate-spin" />
                    <div className="text-gray-700">
                        <p className="text-sm lg:text-base font-medium">Uploading...</p>
                        <p className="text-xs lg:text-sm text-gray-500">Please wait</p>
                    </div>
                </div>
            ) : uploadedFile ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                    </div>
                    <div className="text-gray-700">
                        <p className="text-sm lg:text-base font-medium text-green-600">✓ {uploadedFile.fileName}</p>
                        <p className="text-xs lg:text-sm text-gray-500">{(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedFile(documentType);
                        }}
                        className="mt-2 text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" />
                        Remove
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="text-gray-700">
                        <p className="text-sm lg:text-base font-medium">{title}</p>
                        <p className="text-xs lg:text-sm text-gray-500">{description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderFileUpload