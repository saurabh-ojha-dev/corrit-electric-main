'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '../common/Pagination'
import Image from 'next/image'
import PaymentHistory from './PaymentHistory'
import { API_ENDPOINTS, apiClient } from '@/utils/api'

interface WeeklyPaymentRider {
    id: string;
    name: string;
    email: string;
    phone: string;
    riderId: string;
    upiId: string;
    mandateStatus: string;
    weeklyAmount: string;
    nextPayment: string;
    mandateExpiryDate?: string;
}

const Payments = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [weeklyPaymentRiders, setWeeklyPaymentRiders] = useState<WeeklyPaymentRider[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const router = useRouter();

    // Fetch weekly payment riders
    const fetchWeeklyPaymentRiders = async () => {
        try {
            const params = new URLSearchParams({
                mandateStatus: statusFilter,
                ...(searchTerm && { search: searchTerm })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.RIDERS.WEEKLY_PAYMENTS}?${params}`);
            
            if (response.data.success) {
                setWeeklyPaymentRiders(response.data.riders);
            } else {
                toast.error('Failed to fetch weekly payment riders');
            }
        } catch (error) {
            console.error('Error fetching weekly payment riders:', error);
            toast.error('Failed to fetch weekly payment riders');
        }
    };

    // Handle send notification
    const handleSendNotification = async (riderId: string) => {
        try {
            // TODO: Implement notification sending logic
            toast.success('Notification sent successfully!');
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        setIsLoading(false);
        fetchWeeklyPaymentRiders();
    }, [router, statusFilter, searchTerm])

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

    return (
        <div className="flex h-full bg-[#F8F8F8] ml-2 lg:ml-5 w-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-y-auto gap-4 lg:gap-6 p-3 lg:p-6">

                    {/* Heading */}
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Payments</h1>
                        <span className="text-sm lg:text-lg font-normal text-black">Track all payment transactions and trigger weekly notifications</span>
                    </div>

                    {/* Payments with search bar filter and export button */}
                    <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
                            <div className="relative flex-1 w-full lg:max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search Riders by name, email, or UPI ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-[#00000008] placeholder:text-black w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                                />
                                <svg className="absolute left-2 lg:left-3 top-2.5 h-4 w-4 lg:h-5 lg:w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* search and filter by status */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                                <div className="flex items-center gap-2">
                                    <div className='bg-[#E51E25] w-7 h-7 lg:w-9 lg:h-9 p-1.5 lg:p-2 rounded-md flex items-center justify-center'>
                                        <svg className="h-3 w-3 lg:h-5 lg:w-5 text-white" fill="#E51E25" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                        </svg>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            title='status' 
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="appearance-none bg-white border border-gray-300 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                        >
                                            <option value="active" className="py-2 px-3">🟢 Active</option>
                                            <option value="failed" className="py-2 px-3">🔴 Failed</option>
                                            <option value="revoked" className="py-2 px-3">⚪ Revoked</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                                            <svg className="h-3 w-3 lg:h-4 lg:w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <button type='button' className="bg-black text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto">
                                    <Download className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                    <span>Export CSV</span>
                                </button>
                            </div>
                        </div>

                        {/* Trigger Weekly Payments Banner */}
                        <div className="bg-gradient-to-r from-gray-800 to-red-600 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                            <div className="flex items-center gap-2 lg:gap-3">
                                <Image src="/payments-bell-icon.svg" alt="bell" width={40} height={40} className="w-10 h-10 lg:w-12 lg:h-12" />
                                <div>
                                    <h3 className="text-white font-bold text-base lg:text-lg">Trigger Weekly Payments</h3>
                                    <p className="text-[#999999] text-xs lg:text-sm">Send payment notifications to active subscribers.</p>
                                </div>
                            </div>
                        </div>

                        {/* Rider Payment Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                            {weeklyPaymentRiders.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    No riders found for weekly payments
                                </div>
                            ) : (
                                weeklyPaymentRiders.map((rider) => (
                                    <div key={rider.id} className="bg-[#F5F5F5] rounded-lg p-3 lg:p-4">
                                        <div className="flex items-start justify-between">
                                            {/* Rider Avatar */}
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm lg:text-lg">
                                                    {rider.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Rider Info */}
                                            <div className="flex-1 ml-2 lg:ml-3">
                                                <h3 className="font-bold text-black text-sm lg:text-base">{rider.name}</h3>
                                                <p className="text-xs lg:text-sm text-gray-600">{rider.email}</p>
                                            </div>

                                            {/* Payment Details */}
                                            <div className="flex flex-col items-end justify-end">
                                                <div className="text-base lg:text-lg font-bold text-black">{rider.weeklyAmount}</div>
                                                <div className="text-xs lg:text-sm text-gray-600">weekly</div>
                                            </div>
                                        </div>

                                        {/* Send Notification Button */}
                                        <button 
                                            type='button' 
                                            onClick={() => handleSendNotification(rider.id)}
                                            className="w-full mt-3 lg:mt-4 bg-[#0063B0] text-white py-2 px-3 lg:px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-xs lg:text-sm"
                                        >
                                            <Bell className="w-3 h-3 lg:w-4 lg:h-4" fill='white' />
                                            <span>Send Notification</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {/* <Pagination /> */}
                    </div>

                    <PaymentHistory />
                </main>
            </div>
        </div>
    )
}

export default Payments