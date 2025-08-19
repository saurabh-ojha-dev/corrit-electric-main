'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useAdminProfile } from '@/hooks/useAdminProfile'
import Pagination from '../common/Pagination'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart
} from 'recharts'

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { getFirstLetter, loading, profile } = useAdminProfile();

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        setIsLoading(false);
    }, [router])

    if (isLoading) {
        return (
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 lg:mt-4 text-black text-sm lg:text-base">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // Chart data for Recharts
    const chartData = [
        { day: 2, base: 550, top: 100, mandates: 800, failed: 550 },
        { day: 4, base: 580, top: 120, mandates: 900, failed: 580 },
        { day: 6, base: 600, top: 200, mandates: 980, failed: 600 },
        { day: 8, base: 620, top: 230, mandates: 1050, failed: 620 },
        { day: 10, base: 650, top: 250, mandates: 1150, failed: 650 },
        { day: 12, base: 670, top: 330, mandates: 1250, failed: 670 },
        { day: 14, base: 700, top: 350, mandates: 1300, failed: 700 },
        { day: 16, base: 720, top: 380, mandates: 1400, failed: 720 },
        { day: 18, base: 750, top: 400, mandates: 1450, failed: 750 },
        { day: 20, base: 780, top: 470, mandates: 1500, failed: 780 },
        { day: 22, base: 800, top: 550, mandates: 1550, failed: 800 },
        { day: 24, base: 820, top: 630, mandates: 1600, failed: 820 },
        { day: 26, base: 850, top: 750, mandates: 1800, failed: 850 },
        { day: 28, base: 880, top: 970, mandates: 2100, failed: 880 },
        { day: 30, base: 900, top: 1150, mandates: 2450, failed: 900 }
    ];

    return (
        <div className="flex h-full bg-[#F8F8F8] ml-2 lg:ml-5 w-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-y-auto gap-4 lg:gap-6 p-3 lg:p-6">

                    {/* Heading */}
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Dashboard</h1>
                        <p className="text-sm lg:text-lg font-normal text-black">Overview of your bike rental business
                            <span className='text-[#595959] font-normal pl-2'>|</span>
                            <span className='text-[#595959] font-normal pl-2'>Last updated Aug 12, 2025 AM17545109692 10:11</span>
                        </p>
                    </div>

                    {/* Stats Grid */}
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

                    {/* customers Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">

                        <div className="bg-[#F4FAFF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex items-center justify-start gap-3 lg:gap-4">
                                <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #63B0EC 0%, #0063B0 100%)' }}>
                                    <Image src="/group-user-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">Add New Customers</p>
                                    <p className="text-xs font-normal text-[#595959]">Set up a new bike rental subscription</p>
                                </div>
                            </div>
                            <button type='button' className='bg-[#0063B0] rounded-lg p-2 lg:p-[10px] w-full text-white mt-2 text-xs lg:text-sm'> Go to Customers </button>
                        </div>

                        <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex items-center justify-start gap-3 lg:gap-4">
                                <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}>
                                    <Image src="/rupee-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">View Payments</p>
                                    <p className="text-xs font-normal text-[#595959]">Track all payments transactions</p>
                                </div>
                            </div>
                            <button type='button' className='bg-[#2BB048] rounded-lg p-2 lg:p-[10px] w-full text-white mt-2 text-xs lg:text-sm'>View Payments</button>
                        </div>

                        <div className="bg-[#FFFAE6] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex items-center justify-start gap-3 lg:gap-4">
                                <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FFEB8F 0%, #F4CA0D 100%)' }}>
                                    <Image src="/notification-fill.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">Payments Notifications</p>
                                    <p className="text-xs font-normal text-[#595959]">Manage weekly payment reminders</p>
                                </div>
                            </div>
                            <button type='button' className='bg-[#F4CA0D] rounded-lg p-2 lg:p-[10px] w-full text-white mt-2 text-xs lg:text-sm'>Configure Alerts</button>
                        </div>

                    </div>

                    {/* payment graph */}
                    <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            {/* Graph Area */}
                            <div className="flex-1 min-w-0">
                                <div className="mb-3 lg:mb-4">
                                    <h3 className="text-base lg:text-lg font-semibold text-black">Payment & Mandate Forecast</h3>
                                    <p className="text-xs lg:text-sm text-black font-normal">Next 30 Days</p>
                                </div>

                                {/* Graph Container */}
                                <div className="bg-white border border-[#0000001A] rounded-2xl p-3 lg:p-4" style={{ height: '280px', minHeight: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis 
                                                dataKey="day" 
                                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                                axisLine={false}
                                                tickLine={false}
                                                domain={[0, 2500]}
                                                ticks={[0, 500, 1000, 1500, 2000, 2500]}
                                            />
                                            <Tooltip />
                                            <Bar dataKey="base" stackId="a" fill="#22C55E" barSize={20} />
                                            <Bar dataKey="top" stackId="a" fill="#86EFAC" barSize={20} />
                                            <Line 
                                                type="monotone" 
                                                dataKey="mandates" 
                                                stroke="#3B82F6" 
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="failed" 
                                                stroke="#EF4444" 
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={false}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right Side Cards */}
                            <div className="w-full lg:w-64 xl:w-72 space-y-3 lg:space-y-4 lg:mt-16">
                                {/* graph Card */}
                                <div className="bg-white border border-[#0000001A] rounded-2xl p-3 lg:p-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-1 lg:w-4 lg:h-1 bg-blue-500 rounded"></div>
                                            <span className="text-xs lg:text-sm text-black font-normal">Active mandates forecast</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-1 lg:w-4 lg:h-1 bg-green-500 rounded"></div>
                                            <span className="text-xs lg:text-sm text-black font-normal">Expected daily collections</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-1 lg:w-4 lg:h-1 bg-red-500 rounded border-dashed border-red-500"></div>
                                            <span className="text-xs lg:text-sm text-black font-normal">Predicted failed mandates</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Predicted Monthly Collection Card */}
                                <div className="bg-white border border-[#0000001A] rounded-2xl p-3 lg:p-4">
                                    <h4 className="text-sm lg:text-base font-semibold text-black mb-2">Predicted Monthly Collection</h4>
                                    <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1">₹3,20,000</div>
                                    <p className="text-xs text-black">Slight growth expected from last month's ₹2,45,000.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Dashboard