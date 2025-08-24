'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '../common/Pagination'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
import Image from 'next/image'

const Notifications = () => {
    const router = useRouter();

    // Notification data array
    const notifications = [
        {
            id: 1,
            riderName: "Nitin Kumar",
            riderId: "RID-BLR25-0234",
            timestamp: "14 Aug 2025, 10:45 AM",
            alertType: "Payment Issue",
            alertTypeColor: "bg-[#F4CA0D] text-black",
            title: "Mandate Failed – RID-BLR25-0234",
            description: "UPI mandate for ₹1,200 could not be processed. Rider must re-approve in PhonePe app.",
            buttons: [
                { text: "Resend", type: "primary", action: "resend" },
                { text: "Mark as Read", type: "secondary", action: "markAsRead" }
            ]
        },
        {
            id: 2,
            riderName: "Nitin Kumar",
            riderId: "RID-BLR25-0234",
            timestamp: "14 Aug 2025, 10:45 AM",
            alertType: "Location Alert",
            alertTypeColor: "bg-[#E51E25] text-white",
            title: "GPS Signal Lost – RID-BLR25-0234",
            description: "Rider's location not updated for 30 mins. Possible device issue.",
            buttons: [
                { text: "View on Map", type: "primary", action: "viewOnMap" },
                { text: "Mark as Unread", type: "secondary", action: "markAsUnread" }
            ]
        },
        {
            id: 3,
            riderName: "Nitin Kumar",
            riderId: "RID-BLR25-0234",
            timestamp: "14 Aug 2025, 10:45 AM",
            alertType: "Payment Alert",
            alertTypeColor: "bg-[#F4CA0D] text-black",
            title: "Mandate Expiring – RID-BLR25-0234",
            description: "UPI mandate will expire in 3 days. Renewal link sent to rider.",
            buttons: [
                { text: "Mark as Unread", type: "secondary", action: "markAsUnread" }
            ]
        },
        {
            id: 4,
            riderName: "Nitin Kumar",
            riderId: "RID-BLR25-0234",
            timestamp: "14 Aug 2025, 10:45 AM",
            alertType: "System Alert",
            alertTypeColor: "bg-[#E51E25] text-white",
            title: "New Rider Registered – RID-BLR25-0234",
            description: "Rider onboarding complete. All documents verified.",
            buttons: [
                { text: "Mark as Unread", type: "secondary", action: "markAsUnread" }
            ]
        }
    ];

    const handleButtonClick = (action: string, notificationId: number) => {
        switch (action) {
            case 'resend':
                console.log('Resend clicked for notification:', notificationId);
                break;
            case 'viewOnMap':
                console.log('View on Map clicked for notification:', notificationId);
                break;
            case 'markAsRead':
                console.log('Mark as Read clicked for notification:', notificationId);
                break;
            case 'markAsUnread':
                console.log('Mark as Unread clicked for notification:', notificationId);
                break;
            default:
                break;
        }
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
                                // onClick={() => setIsModalOpen(true)}
                                className='bg-white border border-[#0063B0] text-[#0063B0] px-3 lg:px-4 py-2 rounded-md hover:bg-blue-300 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto'
                            >
                                <Image src="/mark-all-as-read.svg" alt="image" width={16} height={16} className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                <span>Mark all as read</span>
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
                                    placeholder="Search Riders by name, email, or UPI ID..."
                                    className="bg-[#00000008] placeholder:text-black w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                                // value={searchTerm}
                                // onChange={(e) => setSearchTerm(e.target.value)}
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
                                        <select title='status' className="appearance-none bg-white border border-gray-300 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                        // value={statusFilter}
                                        // onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="" className="py-2 px-3">All</option>
                                            <option value="active" className="py-2 px-3">Payment Issue</option>
                                            <option value="failed" className="py-2 px-3">Location Alert</option>
                                            <option value="revoked" className="py-2 px-3">Payment Alert</option>
                                            <option value="pending" className="py-2 px-3">System Alert</option>
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
                        {/* Notification Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="bg-white rounded-[40px] p-4 shadow-sm border border-[#0000001A] flex flex-col h-full">
                                    <div className="flex items-start justify-between    ">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 p-[10px] border border-[#0000003D]  rounded-[66px] flex items-center justify-center">
                                                <div className='bg-black w-full h-full flex items-center justify-center px-4 py-2 rounded-full'>
                                                    <span className="text-white text-sm font-medium">{notification.riderName.charAt(0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`${notification.alertTypeColor} text-xs font-medium p-[10px] rounded-lg`}>
                                            {notification.alertType}
                                        </span>
                                    </div>

                                    <div className='flex flex-col items-start justify-start my-4'>
                                        <p className="text-sm font-medium text-gray-900">{notification.riderName} ({notification.riderId})</p>
                                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2 text-2xl">{notification.title}</h3>
                                        <p className="text-sm text-black">{notification.description}</p>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        {notification.buttons.map((button, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleButtonClick(button.action, notification.id)}
                                                className={`${button.type === 'primary'
                                                        ? 'bg-[#0063B0] text-white hover:bg-[#0063B0]/80'
                                                        : 'border border-[#0063B0] text-[#0063B0] hover:bg-[#0063B0]/10'
                                                    } px-3 py-1.5 rounded-xl text-sm transition-colors`}
                                            >
                                                {button.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Notifications
