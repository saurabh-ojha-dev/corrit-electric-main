'use client'
import React from 'react'
import Image from 'next/image'
import { useAdminProfile } from '@/hooks/useAdminProfile'
import { useRouter } from 'next/navigation'

const Topheader = () => {
    const { getFirstLetter, loading, profile } = useAdminProfile();
    const router = useRouter();
    return (
        <header className="bg-[#1A1818] shadow-sm border-b" >
            <div className="px-3 sm:px-4 lg:px-6 py-1">
                <div className="flex justify-between items-center">
                    <div>
                        <Image 
                            src="/corrit_electric_logo_white.svg" 
                            alt="logo" 
                            width={200} 
                            height={60} 
                            className="w-32 sm:w-40 lg:w-48 xl:w-52"
                        />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                        <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full p-2 sm:p-3 lg:p-4 cursor-pointer"
                        onClick={()=>router.push('/admin/dashboard/notifications')}>
                            <Image 
                                src="/notification.svg" 
                                alt="notification" 
                                width={20} 
                                height={20} 
                                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                            />
                        </div>
                        <div className='py-1 sm:py-2'>
                            <div className="flex items-center gap-1 sm:gap-2 bg-[#FFFFFF1A] rounded-lg p-1 sm:p-2 cursor-pointer">
                                <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-[25px] px-2 sm:px-3 lg:px-4 py-1 sm:py-2 cursor-pointer">
                                    <span className="text-black text-sm sm:text-base lg:text-xl font-medium">{getFirstLetter()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white text-xs sm:text-sm font-semibold">{profile?.username}</span>
                                    <span className="text-[#7F7F7F] text-xs font-normal">{profile?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Topheader