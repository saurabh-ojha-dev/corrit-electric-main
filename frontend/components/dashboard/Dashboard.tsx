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
import DashboardStatusGrid from './DashboardStatusGrid'
import { apiClient } from '@/utils/api'
import { API_ENDPOINTS } from '@/utils/api'

interface ForecastData {
    day: number;
    base: number;
    top: number;
    mandates: number;
    failed: number;
}

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<ForecastData[]>([]);
    const [predictedMonthlyCollection, setPredictedMonthlyCollection] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<string>('');
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

    useEffect(() => {
        const fetchForecastData = async () => {
            try {
                const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.FORECAST);
                if (response.data.success) {
                    setChartData(response.data.forecast);
                    
                    // Calculate predicted monthly collection from forecast
                    const totalCollection = response.data.forecast.reduce((sum: number, day: ForecastData) => {
                        return sum + day.base + day.top;
                    }, 0);
                    setPredictedMonthlyCollection(totalCollection);
                }
            } catch (error) {
                console.error('Error fetching forecast data:', error);
            }
        };

        if (!isLoading) {
            fetchForecastData();
            // Update last updated timestamp
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const formattedTime = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            setLastUpdated(`Last updated ${formattedDate} ${formattedTime}`);
        }
    }, [isLoading]);

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

    // Calculate max value for Y-axis
    const maxValue = chartData.length > 0 
        ? Math.max(...chartData.map(d => Math.max(d.base + d.top, d.mandates, d.failed)))
        : 2500;
    const yAxisMax = Math.ceil(maxValue / 500) * 500; // Round up to nearest 500

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
                            {lastUpdated && (
                                <>
                                    <span className='text-[#595959] font-normal pl-2'>|</span>
                                    <span className='text-[#595959] font-normal pl-2'>{lastUpdated}</span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <DashboardStatusGrid />

                    {/* Admin Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">

                        <div className="bg-[#F4FAFF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex items-center justify-start gap-3 lg:gap-4">
                                <div className="p-2 lg:p-4 rounded-lg" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #63B0EC 0%, #0063B0 100%)' }}>
                                    <Image src="/group-user-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className="text-xs lg:text-sm font-semibold text-black uppercase">Add New Rider</p>
                                    <p className="text-xs font-normal text-[#595959]">Set up a new bike rental subscription</p>
                                </div>
                            </div>
                            <button type='button' className='bg-[#0063B0] rounded-lg p-2 lg:p-[10px] w-full text-white mt-2 text-xs lg:text-sm'
                                onClick={() => router.push('/admin/dashboard/riders')}
                            > Go to Riders </button>
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
                            <button type='button' className='bg-[#2BB048] rounded-lg p-2 lg:p-[10px] w-full text-white mt-2 text-xs lg:text-sm'
                                onClick={() => router.push('/admin/dashboard/payments')}
                            >View Payments</button>
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
                            <button type='button' className='bg-[#F4CA0D] rounded-lg p-2 lg:p-[10px] w-full text-white mt-2 text-xs lg:text-sm'
                                onClick={() => router.push('/admin/dashboard/notifications')}
                            >Configure Alerts</button>
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
                                    {chartData.length > 0 ? (
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
                                                domain={[0, yAxisMax]}
                                                ticks={Array.from({ length: Math.floor(yAxisMax / 500) + 1 }, (_, i) => i * 500)}
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
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">Loading chart data...</p>
                                        </div>
                                    )}
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
                                    <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1">
                                        {predictedMonthlyCollection > 0 
                                            ? `₹${(predictedMonthlyCollection / 100).toLocaleString('en-IN')}`
                                            : '₹0'
                                        }
                                    </div>
                                    <p className="text-xs text-black">Based on forecast for next 30 days.</p>
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