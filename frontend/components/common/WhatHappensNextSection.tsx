import Image from 'next/image'
import React from 'react'

const WhatHappensNextSection = () => {
    return (
        <div className="border border-[#0063B0] rounded-lg p-3 lg:p-4 bg-[#F4FAFF]">
            <div className="flex items-center gap-2 lg:gap-3 mb-1">
                <Image src="/Addcustomer-icon.svg" alt="info" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                <h3 className="font-medium text-gray-900 text-sm lg:text-base">What happens next?</h3>
            </div>
            <ul className="space-y-1 text-xs lg:text-sm text-gray-700 ml-7 lg:ml-10">
                <li className="flex items-start gap-2">
                    <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Rider will be created in the system</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>PhonePe mandate authorization will be initiated</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-gray-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Rider will receive UPI collect request to approve the mandate</span>
                </li>
            </ul>
        </div>)
}

export default WhatHappensNextSection