'use client'
import Topheader from "@/components/common/Topheader";
import Sidebar from "@/components/dashboard/Sidebar";
import { usePathname } from 'next/navigation';
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Determine active page based on current path
    let activePage = 'dashboard';
    if (pathname.includes('/rider-onboarding')) {
        activePage = 'rideronboarding';
    } else if (pathname.includes('/customers')) {
        activePage = 'customers';
    } else if (pathname.includes('/payments')) {
        activePage = 'payments';
    } else if (pathname.includes('/management')) {
        activePage = 'management';
    } else if (pathname.includes('/legals')) {
        activePage = 'legals';
    }

    return (
        <div className="relative w-full flex min-h-screen">
            <div className={`flex-1 flex flex-col bg-[#F8F8F8]`}>
                <Topheader />
                <div className={`flex w-full h-full items-start justify-start p-4`}>
                    <Sidebar activePage={activePage} />
                    {children}
                </div>
            </div>
        </div>
    );
}
