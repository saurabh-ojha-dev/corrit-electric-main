import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    isLoading = false
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1 && !isLoading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !isLoading) {
            onPageChange(currentPage + 1);
        }
    };

    // Don't render pagination if there are no items
    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6">
            {/* Previous Button */}
            <button 
                onClick={handlePrevious}
                disabled={currentPage <= 1 || isLoading}
                className={`px-3 sm:px-4 py-2 border border-gray-300 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto flex items-center justify-center gap-2 ${
                    currentPage <= 1 || isLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#0063B0] text-white hover:bg-blue-700'
                }`}
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </button>

            {/* Page Info */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
                <span className="text-[#0063B0] text-sm sm:text-base font-medium">
                    Page {currentPage} of {totalPages}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">
                    Showing {startItem}-{endItem} of {totalItems} items
                </span>
            </div>

            {/* Next Button */}
            <button 
                onClick={handleNext}
                disabled={currentPage >= totalPages || isLoading}
                className={`px-3 sm:px-4 py-2 border border-gray-300 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto flex items-center justify-center gap-2 ${
                    currentPage >= totalPages || isLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#0063B0] text-white hover:bg-blue-700'
                }`}
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    )
}

export default Pagination