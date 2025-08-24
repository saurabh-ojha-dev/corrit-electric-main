import Image from 'next/image'
import React from 'react'
import { Rider } from '../../helperMethods/interface'

const RiderStatusGrid = ({ riders }: { riders: Rider[] }) => {
  // Calculate statistics from riders data
  const totalRiders = riders.length;
  const approvedRiders = riders.filter(rider => rider.verificationStatus === 'approved').length;
  const pendingRiders = riders.filter(rider => rider.verificationStatus === 'pending').length;
  const rejectedRiders = riders.filter(rider => rider.verificationStatus === 'rejected').length;

  // Calculate percentage changes (simplified - you can enhance this with actual last week data)
  const calculatePercentageChange = (current: number, total: number) => {
    if (total === 0) return 0;
    const percentage = (current / total) * 100;
    return Math.round(percentage);
  };

  // Calculate total percentage change based on current vs previous period
  // For now, using a simple calculation based on total riders
  // You can replace this with actual last week data comparison
  const totalPercentageChange = totalRiders > 0 ? Math.round((totalRiders / 10) * 100) : 0;
  const approvedPercentageChange = calculatePercentageChange(approvedRiders, totalRiders);
  const pendingPercentageChange = calculatePercentageChange(pendingRiders, totalRiders);
  const rejectedPercentageChange = calculatePercentageChange(rejectedRiders, totalRiders);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">
      <div className="bg-[#F4FAFF] rounded-xl shadow p-3 lg:p-4">
        <div className="flex justify-between">
          <p className="text-xs lg:text-sm font-semibold text-black uppercase">Total Riders in Onboarding</p>
          <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #63B0EC 0%, #0063B0 100%)' }}>
            <Image src="/group-user-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
        <div className="">
          <div className="flex items-center gap-1 lg:gap-2">
            <p className="text-xl lg:text-3xl font-bold text-black">{totalRiders}</p>
            <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+{totalPercentageChange}% from last week</span>
          </div>
          <p className="text-xs lg:text-sm text-gray-500">Currently onboarding</p>
        </div>
      </div>

      <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
        <div className="flex justify-between">
          <p className="text-xs lg:text-sm font-semibold text-black uppercase">Completed Profiles</p>
          <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}>
            <Image src="/rupee-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
        <div className="">
          <div className="flex items-center gap-1 lg:gap-2">
            <p className="text-xl lg:text-3xl font-bold text-black">{approvedRiders}</p>
            <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+{approvedPercentageChange}% from last week</span>
          </div>
          <p className="text-xs lg:text-sm text-gray-500">All docs verified</p>
        </div>
      </div>

      <div className="bg-[#FFFAE6] rounded-xl shadow p-3 lg:p-4">
        <div className="flex justify-between">
          <p className="text-xs lg:text-sm font-semibold text-black uppercase">Pending Verification</p>
          <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FFEB8F 0%, #F4CA0D 100%)' }}>
            <Image src="/timeline-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
        <div className="">
          <div className="flex items-center gap-1 lg:gap-2">
            <p className="text-xl lg:text-3xl font-bold text-black">{pendingRiders}</p>
            <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+{pendingPercentageChange}% from last week</span>
          </div>
          <p className="text-xs lg:text-sm text-gray-500">Awaiting review</p>
        </div>
      </div>

      <div className="bg-[#FFF6F6] rounded-xl shadow p-3 lg:p-4">
        <div className="flex justify-between">
          <p className="text-xs lg:text-sm font-semibold text-black uppercase">Documents Rejected</p>
          <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FF6666 0%, #FF0000 100%)' }}>
            <Image src="/rejected-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
        <div className="">
          <div className="flex items-center gap-1 lg:gap-2">
            <p className="text-xl lg:text-3xl font-bold text-black">{rejectedRiders}</p>
            <span className="text-xs lg:text-sm font-medium text-[#2BB048]">+{rejectedPercentageChange}% from last week</span>
          </div>
          <p className="text-xs lg:text-sm text-gray-500">Needs re-upload</p>
        </div>
      </div>
    </div>
  )
}

export default RiderStatusGrid