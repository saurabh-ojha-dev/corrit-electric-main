'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle, Download, X, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Pagination from '../common/Pagination'
import { nitinKumarPayments } from '@/constants/data'

const PaymentHistoryDetails = () => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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

    return (
        <div className="flex h-full bg-[#F8F8F8] ml-2 lg:ml-5 w-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-y-auto gap-4 lg:gap-6 p-3 lg:p-6">

                    {/* Heading */}
                    <div className="flex items-start justify-start gap-2">
                        <Image src="/back-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-5 lg:h-5 cursor-pointer" onClick={() => router.back()} />
                        <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Nitin Kumar Payments</h1>
                    </div>

                    {/* Rider Information Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {/* Rider Information Card */}
                        <div className="bg-white rounded-xl shadow py-3 lg:py-4">
                            <div className="bg-[#E51E25] text-white px-3 lg:px-4 py-2 rounded-tr-3xl w-1/2 mb-3 lg:mb-4">
                                <h2 className="font-semibold text-sm lg:text-base">Rider Information</h2>
                            </div>
                            <div className="space-y-2 lg:space-y-3 px-3 lg:px-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <span className="font-bold text-gray-700 text-xs lg:text-sm">Name:</span>
                                    <span className="text-black text-xs lg:text-sm">Nitin Kumar</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <span className="font-bold text-gray-700 text-xs lg:text-sm">Phone:</span>
                                    <span className="text-black text-xs lg:text-sm">+91-9876543210</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <span className="font-bold text-gray-700 text-xs lg:text-sm">Email:</span>
                                    <span className="text-black text-xs lg:text-sm">nitinkumar@gmail.com</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <span className="font-bold text-gray-700 text-xs lg:text-sm">Address:</span>
                                    <span className="text-black text-xs lg:text-sm">123 Green Street, Gopalganj - 841428</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <span className="font-bold text-gray-700 text-xs lg:text-sm">Gender:</span>
                                    <span className="text-black text-xs lg:text-sm">Male</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <span className="font-bold text-gray-700 text-xs lg:text-sm">Payment ID:</span>
                                    <span className="text-black text-xs lg:text-sm">nitinkumar@iptsx</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Picture Card */}
                        <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex items-center justify-center">
                            <Image src="/profile-image.svg" alt="image" width={200} height={200} className="w-48 h-48 lg:w-64 lg:h-64" />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">

                        <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Total Revenue</p>
                                <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}>
                                    <Image src="/rupee-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">₹ 2100</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">From successful payments</p>
                            </div>
                        </div>

                        <div className="bg-[#FFFAE6] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Success Rate</p>
                                <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FFEB8F 0%, #F4CA0D 100%)' }}>
                                    <CheckCircle className='w-5 h-5 lg:w-6 lg:h-6 text-white' />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">100%</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">3/3 payments</p>
                            </div>
                        </div>

                        <div className="bg-[#FFF6F6] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Failed Payments</p>
                                <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FF6666 0%, #FF0000 100%)' }}>
                                    <XCircle className='w-5 h-5 lg:w-6 lg:h-6 text-white' />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">00</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">Require attention</p>
                            </div>
                        </div>

                        <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Last Payment</p>
                                <div className="p-2 rounded-xl" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}>
                                    <Calendar className='w-5 h-5 lg:w-6 lg:h-6 text-white' />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">July 24</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">2025</p>
                            </div>
                        </div>

                    </div>

                    {/* Table with search bar filter and export button */}
                    <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
                            <div className="relative flex-1 w-full lg:max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search Payments by order id..."
                                    className="bg-[#00000008] placeholder:text-black w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                                />
                                <svg className="absolute left-2 lg:left-3 top-2.5 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
                                    <div className='bg-[#E51E25] w-7 h-7 lg:w-9 lg:h-9 p-1.5 lg:p-2 rounded-md flex items-center justify-center'>
                                        <svg className="h-3 w-3 lg:h-5 lg:w-5 text-white" fill="#E51E25" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                        </svg>
                                    </div>
                                    <div className="relative">
                                        <select title='status' className="appearance-none bg-white border border-gray-300 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium">
                                            <option value="" className="py-2 px-3">All Status</option>
                                            <option value="success" className="py-2 px-3">✔ Success</option>
                                            <option value="failed" className="py-2 px-3">X Failed</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                                            <svg className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <select title='status' className="appearance-none bg-white border border-gray-300 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium">
                                            <option value="" className="py-2 px-3">All Types</option>
                                            <option value="success" className="py-2 px-3">UPI</option>
                                            <option value="failed" className="py-2 px-3">Bank</option>
                                            <option value="failed" className="py-2 px-3">Wallet</option>
                                            <option value="failed" className="py-2 px-3">Card</option>
                                            <option value="failed" className="py-2 px-3">Net Banking</option>
                                            <option value="failed" className="py-2 px-3">Cash</option>
                                            <option value="failed" className="py-2 px-3">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                                            <svg className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse-separate min-w-[800px]">
                                <thead className='bg-[#020202] border border-[#FEFDFF]'>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tl-[12px] text-xs lg:text-sm">Date & Time</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Amount</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Status</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Type</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Transaction ID</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tr-[12px] text-xs lg:text-sm">Order ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nitinKumarPayments.map((payment, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-xs lg:text-sm">{payment.date}</p>
                                                    <p className="text-xs lg:text-sm text-gray-500">{payment.time}</p>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="font-medium text-gray-900 text-xs lg:text-sm">{payment.amount}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="inline-flex items-center gap-1 bg-[#EAFFEF] text-[#2BB048] px-2 lg:px-3 py-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                                    <span className="text-xs lg:text-sm font-medium">{payment.status}</span>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{payment.type}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-500">{payment.transactionId}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-500">{payment.orderId}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {/* <Pagination /> */}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PaymentHistoryDetails