import React from 'react'

const Pagination = () => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6">
            <button className="bg-[#0063B0] px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto">
                Previous
            </button>
            <span className="text-[#0063B0] text-sm sm:text-base font-medium">Page 1 of 04</span>
            <button className="bg-[#0063B0] px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto">
                Next
            </button>
        </div>
    )
}

export default Pagination