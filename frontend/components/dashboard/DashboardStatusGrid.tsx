'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { apiClient } from '@/utils/api'
import { API_ENDPOINTS } from '@/utils/api'

interface DashboardStats {
    activeMandates: {
        count: number;
        change: number;
        changeType: 'positive' | 'negative';
        label: string;
    };
    pendingThisWeek: {
        count: number;
        change: number;
        changeType: 'positive' | 'negative';
        label: string;
    };
    overduePayments: {
        count: number;
        change: number;
        changeType: 'positive' | 'negative';
        label: string;
    };
    monthlyCollection: {
        amount: number;
        change: number;
        changeType: 'positive' | 'negative';
        label: string;
    };
    mandateComplete: {
        count: number;
        change: number;
        changeType: 'positive' | 'negative';
        label: string;
    };
    failedMandate: {
        count: number;
        change: number;
        changeType: 'positive' | 'negative';
        label: string;
    };
}

const DashboardStatusGrid = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        // Amount is in paise, convert to rupees
        const rupees = amount / 100;
        if (rupees >= 100000) {
            return `₹${(rupees / 100000).toFixed(1)}L`;
        } else if (rupees >= 1000) {
            return `₹${(rupees / 1000).toFixed(1)}K`;
        }
        return `₹${rupees.toFixed(0)}`;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl shadow p-3 lg:p-4 animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

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
                        <p className="text-xl lg:text-3xl font-bold text-black">{stats.activeMandates.count}</p>
                        <span className={`text-xs lg:text-sm font-medium ${stats.activeMandates.changeType === 'positive' ? 'text-[#2BB048]' : 'text-[#E51E25]'}`}>
                            {stats.activeMandates.label}
                        </span>
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
                        <p className="text-xl lg:text-3xl font-bold text-black">{stats.pendingThisWeek.count}</p>
                        <span className={`text-xs lg:text-sm font-medium ${stats.pendingThisWeek.changeType === 'positive' ? 'text-[#2BB048]' : 'text-[#E51E25]'}`}>
                            {stats.pendingThisWeek.label}
                        </span>
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
                        <p className="text-xl lg:text-3xl font-bold text-black">{stats.overduePayments.count}</p>
                        <span className={`text-xs lg:text-sm font-medium ${stats.overduePayments.changeType === 'positive' ? 'text-[#2BB048]' : 'text-[#E51E25]'}`}>
                            {stats.overduePayments.label}
                        </span>
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
                        <p className="text-xl lg:text-3xl font-bold text-black">{formatCurrency(stats.monthlyCollection.amount)}</p>
                        <span className={`text-xs lg:text-sm font-medium ${stats.monthlyCollection.changeType === 'positive' ? 'text-[#2BB048]' : 'text-[#E51E25]'}`}>
                            {stats.monthlyCollection.label}
                        </span>
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
                        <p className="text-xl lg:text-3xl font-bold text-black">{stats.mandateComplete.count}</p>
                        <span className={`text-xs lg:text-sm font-medium ${stats.mandateComplete.changeType === 'positive' ? 'text-[#2BB048]' : 'text-[#E51E25]'}`}>
                            {stats.mandateComplete.label}
                        </span>
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
                        <p className="text-xl lg:text-3xl font-bold text-black">{stats.failedMandate.count}</p>
                        <span className={`text-xs lg:text-sm font-medium ${stats.failedMandate.changeType === 'positive' ? 'text-[#2BB048]' : 'text-[#E51E25]'}`}>
                            {stats.failedMandate.label}
                        </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500">Failed this week</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardStatusGrid