'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Download, Eye, EyeOff, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Pagination from '../common/Pagination'
import { API_ENDPOINTS, apiClient } from '@/utils/api'

interface PaymentData {
    id: string;
    riderName: string;
    riderEmail: string;
    riderPhone: string;
    riderId: string;
    riderIntial: string;
    amount: string;
    status: 'Success' | 'Failed' | 'Pending' | 'Unknown';
    type: string;
    date: string;
    time: string;
    phonepeOrderId: string;
    phonepeStatus: string;
    utr: string;
    transactionId: string;
    failureReason: string;
    webhookData: any;
    phonepeResponse: any;
    autoDebitWindow: {
        from: string;
        to: string;
    };
}

const PaymentHistory = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [expandedDebugRows, setExpandedDebugRows] = useState<Set<string>>(new Set());
    const [phonepeOrderStatus, setPhonepeOrderStatus] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isCheckingStatus, setIsCheckingStatus] = useState<string | null>(null);
    const router = useRouter();

    // Fetch payment history from API
    const fetchPaymentHistory = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.AUTOPAY.LIST}?${params}`);
            
            if (response.data.success) {
                setPayments(response.data.payments);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                toast.error('Failed to fetch payment history');
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            toast.error('Failed to fetch payment history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        fetchPaymentHistory();
    }, [router, currentPage, searchTerm, statusFilter])

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Handle status filter
    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

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

    const toggleDebugRow = (paymentId: string) => {
        setExpandedDebugRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(paymentId)) {
                newSet.delete(paymentId);
            } else {
                newSet.add(paymentId);
            }
            return newSet;
        });
    };

    const handlePhonepeOrderStatusCheck = async (paymentId: string) => {
        try {
            setIsCheckingStatus(paymentId);
            
            const response = await apiClient.post(API_ENDPOINTS.AUTOPAY.CHECK_ORDER_STATUS, {
                merchantOrderId: paymentId
            });

            if (response.data.success) {
                toast.success('PhonePe order status checked successfully');
                setPhonepeOrderStatus(paymentId);
                
                // Refresh the payment history to show updated data
                await fetchPaymentHistory();
            } else {
                toast.error('Failed to check PhonePe order status');
            }
        } catch (error) {
            console.error('Error checking PhonePe order status:', error);
            toast.error('Failed to check PhonePe order status');
        } finally {
            setIsCheckingStatus(null);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            {/* Heading */}
            <div className="flex flex-col items-start justify-start gap-2">
                <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Payment History</h1>
                <span className="text-sm lg:text-lg font-normal text-black">All payment transactions and their status</span>
            </div>

            {/* Table with search bar filter and export button */}
            <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                {/* Search and Filter Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <input
                            type="text"
                            placeholder="Search Riders by name, email, or UPI ID..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-[#00000008] placeholder:text-black w-full pl-8 lg:pl-10 pr-8 lg:pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                        />
                        <svg className="absolute left-2 lg:left-3 top-2.5 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {/* Microphone icon */}
                        <svg className="absolute right-2 lg:right-3 top-2.5 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
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
                                    onChange={handleStatusFilter}
                                    className="appearance-none bg-white border border-gray-300 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                >
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
                                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tl-[12px] text-xs lg:text-sm">Riders</th>
                                <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Amount</th>
                                <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Status</th>
                                <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Type</th>
                                <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Date</th>
                                <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tr-[12px] text-xs lg:text-sm">Debug</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No payment records found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment, index) => (
                                <React.Fragment key={payment.id}>
                                    <tr className="hover:bg-gray-50 cursor-pointer">
                                        <td className="text-left py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-black rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs lg:text-sm">
                                                        {payment.riderIntial}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-xs lg:text-sm">{payment.riderName}</p>
                                                    <p className="text-xs lg:text-sm text-gray-500">ID: {payment.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                            <span className="font-medium text-gray-900 text-xs lg:text-sm">{payment.amount}</span>
                                        </td>
                                        <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                            {payment.status === "Success" ? (
                                                <span className="inline-flex items-center px-2 py-1 lg:py-[10px] rounded-full text-xs lg:text-sm font-medium bg-[#D6FFDF] text-[#0063B0]">
                                                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                                    Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 lg:px-4 py-1 lg:py-[10px] rounded-full text-xs lg:text-sm font-medium bg-[#FFCACC] text-[#E51E25]">
                                                    <XCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                            <span className="text-xs lg:text-sm text-gray-900">{payment.type}</span>
                                        </td>
                                        <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                            <div className="text-xs lg:text-sm">
                                                <div className="text-gray-900">{payment.date}</div>
                                                <div className="text-gray-500">{payment.time}</div>
                                            </div>
                                        </td>
                                        <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                            <button
                                                type='button'
                                                className="inline-flex items-center gap-1 text-black hover:text-gray-500"
                                                onClick={() => toggleDebugRow(payment.id)}
                                            >
                                                {expandedDebugRows.has(payment.id) ? (
                                                    <EyeOff className="w-3 h-3 lg:w-4 lg:h-4" color='#000000' />
                                                ) : (
                                                    <Eye className="w-3 h-3 lg:w-4 lg:h-4" color='#000000' />
                                                )}
                                                <span className="text-xs lg:text-sm">Debug</span>
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedDebugRows.has(payment.id) && (
                                        <tr>
                                            <td colSpan={6} className="px-2 lg:px-3 py-3 lg:py-4 bg-[#F5F5F5]">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#0000003D] rounded-xl py-2 lg:py-3 px-3 lg:px-4 gap-2 lg:gap-0">
                                                    <span className="text-sm lg:text-base font-medium text-black">PhonePe order Status Check</span>
                                                    <button
                                                        type='button'
                                                        disabled={isCheckingStatus === payment.id}
                                                        className="inline-flex items-center gap-1 lg:gap-2 bg-[#0063B0] text-white p-1.5 lg:p-2 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer text-xs lg:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => handlePhonepeOrderStatusCheck(payment.id)}
                                                    >
                                                        <RefreshCw className={`w-3 h-3 lg:w-4 lg:h-4 ${isCheckingStatus === payment.id ? 'animate-spin' : ''}`} />
                                                        <span>{isCheckingStatus === payment.id ? 'Checking...' : 'Check Phonepe'}</span>
                                                    </button>
                                                </div>
                                                {phonepeOrderStatus === payment.id && (
                                                    <>
                                                        <div className="mt-2 bg-white flex flex-col rounded-xl py-2 lg:py-3 px-3 lg:px-4">
                                                            <span className="text-sm lg:text-base font-semibold text-[#020202]">PhonePe status</span>
                                                            {payment.utr ? (
                                                                <span className="text-xs lg:text-base font-normal text-[#6C757D]">
                                                                    Payment successful! UTR: {payment.utr}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs lg:text-base font-normal text-[#6C757D]">
                                                                    {payment.failureReason || 'No additional details available'}
                                                                </span>
                                                            )}
                                                            <p className="text-xs lg:text-base font-normal text-[#020202] flex flex-col sm:flex-row sm:justify-between gap-1">
                                                                <span>State: {payment.phonepeStatus}</span>
                                                                {payment.phonepeOrderId && (
                                                                    <span>Order ID: {payment.phonepeOrderId}</span>
                                                                )}
                                                            </p>
                                                            {payment.transactionId && (
                                                                <p className="text-xs lg:text-base font-normal text-[#020202]">
                                                                    Transaction ID: {payment.transactionId}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {payment.autoDebitWindow && (
                                                            <div className="mt-2 bg-[#F4FAFF] flex flex-col rounded-xl py-2 lg:py-3 px-3 lg:px-4 cursor-pointer"
                                                                onClick={() => router.push(`/admin/dashboard/payments/${payment.id}`)}
                                                            >
                                                                <span className="text-sm lg:text-base font-semibold text-[#0063B0]">Auto-Debit Window</span>
                                                                <span className="text-xs lg:text-base font-normal text-[#0063B0]">
                                                                    From: {formatDate(payment.autoDebitWindow.from)}
                                                                </span>
                                                                <span className="text-xs lg:text-base font-normal text-[#0063B0]">
                                                                    To: {formatDate(payment.autoDebitWindow.to)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={payments.length * totalPages}
                        itemsPerPage={10}
                        onPageChange={setCurrentPage}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </>
    )
}

export default PaymentHistory