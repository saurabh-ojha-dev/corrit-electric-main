import Image from 'next/image'
import React from 'react'

const DashboardStatusGrid = () => {
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">
            <div className="bg-[#F4FAFF] rounded-xl shadow p-3 lg:p-4">
                <div className="flex justify-between">
                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">ACTIVE MANADATES</p>
                    <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #63B0EC 0%, #0063B0 100%)' }}>
                        <Image src="/group-user-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center gap-1 lg:gap-2">
                        <p className="text-xl lg:text-3xl font-bold text-black">16</p>
                        <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+3% this week</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Total active subscriptions</p>
                </div>
            </div>

            <div className="bg-[#FFFAE6] rounded-xl shadow p-3 lg:p-4">
                <div className="flex justify-between">
                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">PENDING THIS WEEK</p>
                    <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FFEB8F 0%, #F4CA0D 100%)' }}>
                        <Image src="/timeline-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center gap-1 lg:gap-2">
                        <p className="text-xl lg:text-3xl font-bold text-black">16</p>
                        <span className="text-xs lg:text-sm font-medium text-[#E51E25]">-2 compared to last week</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Scheduled for payment</p>
                </div>
            </div>

            <div className="bg-[#FFF6F6] rounded-xl shadow p-3 lg:p-4">
                <div className="flex justify-between">
                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">OVERDUE PAYMENTS</p>
                    <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FF6666 0%, #FF0000 100%)' }}>
                        <Image src="/alert-line.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center gap-1 lg:gap-2">
                        <p className="text-xl lg:text-3xl font-bold text-black">16</p>
                        <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+3% since yeaterday</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Require immediate attention</p>
                </div>
            </div>

            <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
                <div className="flex justify-between">
                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">MONTHLY COLLECTION</p>
                    <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}>
                        <Image src="/rupee-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center gap-1 lg:gap-2">
                        <p className="text-xl lg:text-3xl font-bold text-black">₹ 0</p>
                        <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+8% vs last month</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">This month's revenue</p>
                </div>
            </div>

            <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
                <div className="flex justify-between">
                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">Mandate Complete</p>
                    <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}>
                        <Image src="/rupee-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center gap-1 lg:gap-2">
                        <p className="text-xl lg:text-3xl font-bold text-black">148</p>
                        <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+24% last month</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Processed this month</p>
                </div>
            </div>

            <div className="bg-[#FFF6F6] rounded-xl shadow p-3 lg:p-4">
                <div className="flex justify-between">
                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">Failed Mandate</p>
                    <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FF6666 0%, #FF0000 100%)' }}>
                        <Image src="/rejected-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center gap-1 lg:gap-2">
                        <p className="text-xl lg:text-3xl font-bold text-black">14</p>
                        <span className="text-xs lg:text-sm font-medium text-[#E51E25]">-2% from last week</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Failed this week</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardStatusGrid