'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User, Loader2, MapPin, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '../common/Pagination'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
import { Notification } from '../helperMethods/interface'
import Image from 'next/image'

const Notifications = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(searchTerm && { search: searchTerm }),
                ...(typeFilter && { type: typeFilter })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params}`);

            if (response.data.success) {
                setNotifications(response.data.notifications || []);
                setTotalNotifications(response.data.total || 0);
            } else {
                toast.error('Failed to fetch notifications');
            }
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            if (error.response?.status === 401) {
                router.push('/admin/auth/login');
            } else {
                toast.error('Failed to fetch notifications');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Mark notification as read
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setActionLoading(notificationId);
            const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));

            if (response.data.success) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif._id === notificationId 
                            ? { ...notif, isRead: true }
                            : notif
                    )
                );
                toast.success('Notification marked as read');
            } else {
                toast.error('Failed to mark notification as read');
            }
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        } finally {
            setActionLoading(null);
        }
    };

    // Mark notification as unread
    const handleMarkAsUnread = async (notificationId: string) => {
        try {
            setActionLoading(notificationId);
            const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_UNREAD(notificationId));

            if (response.data.success) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif._id === notificationId 
                            ? { ...notif, isRead: false }
                            : notif
                    )
                );
                toast.success('Notification marked as unread');
            } else {
                toast.error('Failed to mark notification as unread');
            }
        } catch (error: any) {
            console.error('Error marking notification as unread:', error);
            toast.error('Failed to mark notification as unread');
        } finally {
            setActionLoading(null);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            setIsMarkingAllRead(true);
            const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);

            if (response.data.success) {
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, isRead: true }))
                );
                toast.success('All notifications marked as read');
            } else {
                toast.error('Failed to mark all notifications as read');
            }
        } catch (error: any) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        } finally {
            setIsMarkingAllRead(false);
        }
    };

    // Handle action button clicks
    const handleButtonClick = async (action: string, notification: Notification) => {
        switch (action) {
            case 'resend':
                // Handle resend payment
                toast.success('Payment resend initiated');
                break;
            case 'viewOnMap':
                // Navigate to tracking page
                router.push(`/admin/dashboard/tracking?riderId=${notification.riderId?._id}`);
                break;
            case 'markAsRead':
                await handleMarkAsRead(notification._id);
                break;
            case 'markAsUnread':
                await handleMarkAsUnread(notification._id);
                break;
            default:
                break;
        }
    };

    // Fetch notifications on component mount and when filters change
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/auth/login');
            return;
        }
        fetchNotifications();
    }, [currentPage, searchTerm, typeFilter, router]);

    // Helper functions
    const getAlertTypeInfo = (notification: Notification) => {
        const typeMap: { [key: string]: { label: string; color: string } } = {
            'payment_failed': { label: 'Payment Issue', color: 'bg-[#F4CA0D] text-black' },
            'mandate_expired': { label: 'Payment Alert', color: 'bg-[#F4CA0D] text-black' },
            'mandate_expiring': { label: 'Payment Alert', color: 'bg-[#F4CA0D] text-black' },
            'location_alert': { label: 'Location Alert', color: 'bg-[#E51E25] text-white' },
            'gps_signal_lost': { label: 'Location Alert', color: 'bg-[#E51E25] text-white' },
            'system_alert': { label: 'System Alert', color: 'bg-[#E51E25] text-white' },
            'new_rider_registered': { label: 'System Alert', color: 'bg-[#E51E25] text-white' },
            'document_uploaded': { label: 'System Alert', color: 'bg-[#E51E25] text-white' },
            'document_verified': { label: 'System Alert', color: 'bg-[#E51E25] text-white' },
            'payment_success': { label: 'Payment Alert', color: 'bg-[#F4CA0D] text-black' },
            'payment_retry': { label: 'Payment Alert', color: 'bg-[#F4CA0D] text-black' },
            'mandate_created': { label: 'Payment Alert', color: 'bg-[#F4CA0D] text-black' },
            'mandate_failed': { label: 'Payment Issue', color: 'bg-[#F4CA0D] text-black' }
        };
        
        return typeMap[notification.type] || { label: 'System Alert', color: 'bg-[#E51E25] text-white' };
    };

    const getActionButtons = (notification: Notification) => {
        const buttons = [];
        
        if (notification.actionType === 'resend_payment') {
            buttons.push({ text: 'Resend', type: 'primary', action: 'resend' });
        }
        
        if (notification.actionType === 'view_on_map') {
            buttons.push({ text: 'View on Map', type: 'primary', action: 'viewOnMap' });
        }
        
        if (notification.isRead) {
            buttons.push({ text: 'Mark as Unread', type: 'secondary', action: 'markAsUnread' });
        } else {
            buttons.push({ text: 'Mark as Read', type: 'secondary', action: 'markAsRead' });
        }
        
        return buttons;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (

        <div className="flex h-full bg-[#F8F8F8] ml-2 lg:ml-5 w-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-y-auto gap-4 lg:gap-6 p-3 lg:p-6">
                    {/* Heading */}
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <div className="flex items-start justify-start gap-2">
                            <Image src="/back-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-5 lg:h-5 cursor-pointer" onClick={() => router.back()} />
                            <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Notification</h1>
                        </div>
                        <div className='flex items-center gap-2 w-full sm:w-auto'>
                            <button
                                type='button'
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAllRead}
                                className='bg-white border border-[#0063B0] text-[#0063B0] px-3 lg:px-4 py-2 rounded-md hover:bg-blue-300 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isMarkingAllRead ? (
                                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                                ) : (
                                <Image src="/mark-all-as-read.svg" alt="image" width={16} height={16} className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                )}
                                <span>{isMarkingAllRead ? 'Marking...' : 'Mark all as read'}</span>
                            </button>
                        </div>
                    </div>

                    {/* search bar and filter button */}
                    <div className="py-1">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
                            <div className="relative flex-1 w-full lg:max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search notifications by title, description, or rider name..."
                                    className="bg-[#00000008] placeholder:text-black w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                        <select title='type' className="appearance-none bg-white border border-gray-300 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="" className="py-2 px-3">All</option>
                                            <option value="payment_failed" className="py-2 px-3">Payment Issue</option>
                                            <option value="location_alert" className="py-2 px-3">Location Alert</option>
                                            <option value="gps_signal_lost" className="py-2 px-3">GPS Signal Lost</option>
                                            <option value="mandate_expiring" className="py-2 px-3">Payment Alert</option>
                                            <option value="system_alert" className="py-2 px-3">System Alert</option>
                                            <option value="new_rider_registered" className="py-2 px-3">New Rider</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                                            <svg className="h-3 w-3 lg:h-4 lg:w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-[#0063B0]" />
                                <span className="ml-2 text-gray-600">Loading notifications...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v6h-5V3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                                <p className="text-gray-500 text-center">No notifications match your current filters.</p>
                            </div>
                        ) : (
                            <>
                        {/* Notification Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {notifications.map((notification) => {
                                        const alertTypeInfo = getAlertTypeInfo(notification);
                                        const actionButtons = getActionButtons(notification);
                                        const riderName = notification.riderId?.name || notification.metadata?.riderName || 'Unknown Rider';
                                        const riderId = notification.riderId?.riderId || notification.metadata?.riderId || 'Unknown ID';
                                        
                                        return (
                                            <div key={notification._id} className={`bg-white rounded-[40px] p-4 shadow-sm border border-[#0000001A] flex flex-col h-full ${notification.isRead ? 'opacity-75' : ''}`}>
                                                <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 p-[10px] border border-[#0000003D] rounded-[66px] flex items-center justify-center">
                                                <div className='bg-black w-full h-full flex items-center justify-center px-4 py-2 rounded-full'>
                                                                <span className="text-white text-sm font-medium">{riderName.charAt(0).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                                    <span className={`${alertTypeInfo.color} text-xs font-medium p-[10px] rounded-lg`}>
                                                        {alertTypeInfo.label}
                                        </span>
                                    </div>

                                    <div className='flex flex-col items-start justify-start my-4'>
                                                    <p className="text-sm font-medium text-gray-900">{riderName} ({riderId})</p>
                                                    <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2 text-2xl">{notification.title}</h3>
                                        <p className="text-sm text-black">{notification.description}</p>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                                    {actionButtons.map((button, index) => (
                                            <button
                                                key={index}
                                                            onClick={() => handleButtonClick(button.action, notification)}
                                                            disabled={actionLoading === notification._id}
                                                className={`${button.type === 'primary'
                                                        ? 'bg-[#0063B0] text-white hover:bg-[#0063B0]/80'
                                                        : 'border border-[#0063B0] text-[#0063B0] hover:bg-[#0063B0]/10'
                                                                } px-3 py-1.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                                            >
                                                            {actionLoading === notification._id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : null}
                                                {button.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalNotifications > 20 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalItems={totalNotifications}
                                            itemsPerPage={20}
                                            onPageChange={setCurrentPage}
                                            isLoading={isLoading}
                                        />
                        </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Notifications
