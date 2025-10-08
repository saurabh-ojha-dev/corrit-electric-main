'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Download, User, Phone, Mail, MapPin, CreditCard, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_ENDPOINTS, apiClient } from '@/utils/api'

interface RiderDetails {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    upiId: string;
    weeklyRentAmount: number;
    mandateStatus: string;
    mandateCreatedAt: string;
    mandateExpiryDate: string;
    mandateDetails: {
        phonepeOrderId: string;
        phonepeSubscriptionId: string;
        amount: number;
        maxAmount: number;
        frequency: string;
    };
}

interface PaymentDetails {
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

const PaymentDetailsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [riderDetails, setRiderDetails] = useState<RiderDetails | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentDetails[]>([]);
    const [isCheckingStatus, setIsCheckingStatus] = useState<string | null>(null);
    const [phonepeOrderStatus, setPhonepeOrderStatus] = useState<string>('');
    const router = useRouter();
    const params = useParams();
    const paymentId = params.id as string;

    // Fetch rider details and payment history
    const fetchPaymentDetails = async () => {
        try {
            setIsLoading(true);
            
            // Fetch rider details by payment ID
            const riderResponse = await apiClient.get(`${API_ENDPOINTS.RIDERS.LIST}?merchantOrderId=${paymentId}`);
            
            if (riderResponse.data.success && riderResponse.data.riders.length > 0) {
                const rider = riderResponse.data.riders[0];
                setRiderDetails(rider);
                
                // Fetch payment history for this specific rider using riderId
                const paymentResponse = await apiClient.get(`${API_ENDPOINTS.AUTOPAY.LIST}?riderId=${rider._id}`);
                
                if (paymentResponse.data.success) {
                    setPaymentHistory(paymentResponse.data.payments);
                }
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
            toast.error('Failed to fetch payment details');
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
        fetchPaymentDetails();
    }, [router, paymentId])

    const handlePhonepeOrderStatusCheck = async (paymentId: string) => {
        try {
            setIsCheckingStatus(paymentId);
            
            const response = await apiClient.post(API_ENDPOINTS.AUTOPAY.CHECK_ORDER_STATUS, {
                merchantOrderId: paymentId
            });

            if (response.data.success) {
                toast.success('PhonePe order status checked successfully');
                setPhonepeOrderStatus(paymentId);
                
                // Refresh the payment details
                await fetchPaymentDetails();
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

    // Calculate payment statistics
    const calculateStats = () => {
        const totalRevenue = paymentHistory
            .filter(p => p.status === 'Success')
            .reduce((sum, p) => sum + parseFloat(p.amount.replace('₹', '')), 0);
        
        const successCount = paymentHistory.filter(p => p.status === 'Success').length;
        const failedCount = paymentHistory.filter(p => p.status === 'Failed').length;
        const successRate = paymentHistory.length > 0 ? Math.round((successCount / paymentHistory.length) * 100) : 0;
        
        const lastPayment = paymentHistory.length > 0 ? paymentHistory[0] : null;
        
        return {
            totalRevenue,
            successRate,
            failedCount,
            lastPayment
        };
    };

    const stats = calculateStats();

    if (isLoading) {
        return (
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 lg:mt-4 text-black text-sm lg:text-base">Loading payment details...</p>
                </div>
            </div>
        )
    }

    if (!riderDetails) {
        return (
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-black mb-2">Payment Not Found</h2>
                    <p className="text-gray-600 mb-4">The payment you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/admin/dashboard/payments')}
                        className="bg-[#0063B0] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Payments
                    </button>
                </div>
            </div>
        )
    }

  return (
        <div className="flex h-full bg-[#F8F8F8] ml-2 lg:ml-5 w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 flex flex-col overflow-y-auto gap-4 lg:gap-6 p-3 lg:p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => router.push('/admin/dashboard/payments')}
                            className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            title="Back to payments"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-semibold text-black">{riderDetails.name} Payments</h1>
                            <p className="text-sm lg:text-base text-gray-600">Complete payment history and details</p>
                        </div>
                    </div>

                    {/* Rider Information Card */}
                    <div className="bg-white rounded-xl shadow p-4 lg:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-[#E51E25]">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-black">Rider Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Name:</span>
                                    <span className="text-sm text-gray-900">{riderDetails.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                                    <span className="text-sm text-gray-900">{riderDetails.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Email:</span>
                                    <span className="text-sm text-gray-900">{riderDetails.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Address:</span>
                                    <span className="text-sm text-gray-900">{riderDetails.address}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">UPI ID:</span>
                                    <span className="text-sm text-gray-900">{riderDetails.upiId}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Weekly Rent:</span>
                                    <span className="text-sm text-gray-900">₹{riderDetails.weeklyRentAmount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Gender:</span>
                                    <span className="text-sm text-gray-900">{riderDetails.gender}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Mandate Status:</span>
                                    <span className={`text-sm px-2 py-1 rounded-full ${
                                        riderDetails.mandateStatus === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {riderDetails.mandateStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <span className="text-green-600 text-lg">₹</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">TOTAL REVENUE</p>
                                    <p className="text-xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                                    <p className="text-xs text-gray-500">From successful payments</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-yellow-100">
                                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">SUCCESS RATE</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.successRate}%</p>
                                    <p className="text-xs text-gray-500">{paymentHistory.filter(p => p.status === 'Success').length}/{paymentHistory.length} payments</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-100">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">FAILED PAYMENTS</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.failedCount}</p>
                                    <p className="text-xs text-gray-500">Require attention</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">LAST PAYMENT</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {stats.lastPayment ? stats.lastPayment.date.split(' ')[0] : 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {stats.lastPayment ? stats.lastPayment.date.split(' ')[1] : 'No payments'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="bg-white rounded-xl shadow p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-black">Payment History</h3>
                            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-700">Amount</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-700">Type</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-700">Transaction ID</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-700">Order ID</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-gray-500">
                                                No payment records found
                                            </td>
                                        </tr>
                                    ) : (
                                        paymentHistory.map((payment, index) => (
                                            <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{payment.date}</div>
                                                        <div className="text-gray-500">{payment.time}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-medium text-gray-900">{payment.amount}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {payment.status === "Success" ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Failed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="text-sm text-gray-900">{payment.type}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="text-sm text-gray-600 font-mono">{payment.transactionId || 'N/A'}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="text-sm text-gray-600 font-mono">{payment.phonepeOrderId || 'N/A'}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => handlePhonepeOrderStatusCheck(payment.id)}
                                                        disabled={isCheckingStatus === payment.id}
                                                        className="inline-flex items-center gap-1 bg-[#0063B0] text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <RefreshCw className={`w-3 h-3 ${isCheckingStatus === payment.id ? 'animate-spin' : ''}`} />
                                                        {isCheckingStatus === payment.id ? 'Checking...' : 'Check Status'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PaymentDetailsPage