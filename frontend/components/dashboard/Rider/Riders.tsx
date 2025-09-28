'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
import { Rider } from '@/components/helperMethods/interface'
import AddRider from './AddRIder'
import Pagination from '@/components/common/Pagination'
import ExportCSV from '@/components/common/ExportCSV'
import { formatDate, getNextPaymentDate } from '@/components/helperMethods/FormatDate'

const Riders = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [riders, setRiders] = useState<Rider[]>([]);
    const [totalRiders, setTotalRiders] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [mandateStatusUpdates, setMandateStatusUpdates] = useState<Record<string, string>>({});
    const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
    const [cancellingMandate, setCancellingMandate] = useState<string | null>(null);
    const router = useRouter();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch riders data
    const fetchRiders = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                verificationStatus: 'approved', // Add this line to filter only approved riders
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(statusFilter && { mandateStatus: statusFilter })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.RIDERS.LIST}?${params}`);

            if (response.data.success) {
                setRiders(response.data.riders || []);
                setTotalRiders(response.data.total || 0);
            } else {
                toast.error('Failed to fetch Riders');
            }
        } catch (error: any) {
            console.error('Error fetching riders:', error);
            if (error.response?.status === 401) {
                router.push('/admin/login');
            } else if (error.response?.status === 404) {
                // 404 is expected when there are no riders, don't show error
                setRiders([]);
                setTotalRiders(0);
            } else {
                toast.error('Failed to fetch Riders');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Check mandate status
    const handleCheckStatus = async (riderId: string) => {
        try {
            setCheckingStatus(riderId);
            const response = await apiClient.post(API_ENDPOINTS.RIDERS.CHECK_MANDATE(riderId));

            if (response.data.success) {
                // Update the rider status in the list
                setRiders(prevRiders => 
                    prevRiders.map(r => 
                        r._id === riderId 
                            ? { ...r, mandateStatus: response.data.mandateStatus }
                            : r
                    )
                );
                
                toast.success(`Mandate status updated: ${response.data.mandateStatus}`);
            } else {
                toast.error(response.data.message || 'Failed to check mandate status');
            }
        } catch (error: any) {
            console.error('Error checking mandate status:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else {
                toast.error('Failed to check mandate status');
            }
        } finally {
            setCheckingStatus(null);
        }
    };

    // Cancel mandate
    const handleCancelMandate = async (riderId: string) => {
        if (!confirm('Are you sure you want to cancel this mandate? This will stop all future automatic payments for this rider.')) {
            return;
        }

        try {
            setCancellingMandate(riderId);
            const response = await apiClient.post(API_ENDPOINTS.RIDERS.CANCEL_MANDATE(riderId));

            if (response.data.success) {
                // Update the rider status in the list
                setRiders(prevRiders => 
                    prevRiders.map(r => 
                        r._id === riderId 
                            ? { ...r, mandateStatus: 'cancelled' }
                            : r
                    )
                );
                
                toast.success('Mandate cancelled successfully');
                
                // Show warning if PhonePe API failed
                if (response.data.warning) {
                    toast.error(response.data.warning);
                }
            } else {
                toast.error(response.data.message || 'Failed to cancel mandate');
            }
        } catch (error: any) {
            console.error('Error cancelling mandate:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || 'Invalid request';
                toast.error(errorMessage);
            } else {
                toast.error('Failed to cancel mandate');
            }
        } finally {
            setCancellingMandate(null);
        }
    };

    // Delete rider
    const handleDeleteRider = async (riderId: string) => {
        if (!confirm('Are you sure you want to delete this Rider? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(riderId);
            const response = await apiClient.delete(API_ENDPOINTS.RIDERS.DELETE(riderId));

            if (response.data.success) {
                toast.success('Rider deleted successfully');
                fetchRiders(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to delete Rider');
            }
        } catch (error: any) {
            console.error('Error deleting rider:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to delete Riders');
            } else if (error.response?.status === 400) {
                // Show the specific backend error message for 400 status
                const errorMessage = error.response?.data?.message || 'Invalid request';
                toast.error(errorMessage);
            } else if (error.response?.status === 404) {
                toast.error('Rider not found');
            } else {
                // For other errors, try to get the backend message or show generic message
                const errorMessage = error.response?.data?.message || 'Failed to delete Rider';
                toast.error(errorMessage);
            }
        } finally {
            setIsDeleting(null);
        }
    };

    // Listen for new rider creation
    useEffect(() => {
        const handleRiderCreated = () => {
            fetchRiders();
        };

        window.addEventListener('riderCreated', handleRiderCreated);
        return () => {
            window.removeEventListener('riderCreated', handleRiderCreated);
        };
    }, []);

    // Real-time mandate status updates
    useEffect(() => {
        const handleMandateStatusUpdate = (event: CustomEvent) => {
            const { riderId, mandateStatus } = event.detail;
            setMandateStatusUpdates(prev => ({
                ...prev,
                [riderId]: mandateStatus
            }));
            
            // Show notification for status change
            if (mandateStatus === 'active') {
                toast.success(`Mandate activated for rider ${riderId}`);
            } else if (mandateStatus === 'failed') {
                toast.error(`Mandate failed for rider ${riderId}`);
            }
        };

        window.addEventListener('mandateStatusUpdate', handleMandateStatusUpdate as EventListener);
        return () => {
            window.removeEventListener('mandateStatusUpdate', handleMandateStatusUpdate as EventListener);
        };
    }, []);

    // Poll for mandate status updates every 30 seconds
    useEffect(() => {
        const pollMandateStatus = async () => {
            try {
                // Only poll if there are riders with pending mandates
                const pendingRiders = riders.filter(rider => 
                    rider.mandateStatus === 'pending' || 
                    rider.mandateStatus === 'PENDING'
                );
                
                if (pendingRiders.length === 0) return;

                // Check status for each pending rider
                for (const rider of pendingRiders) {
                    try {
                        const response = await apiClient.get(API_ENDPOINTS.RIDERS.MANDATE_STATUS(rider._id));
                        
                        if (response.data.success && response.data.mandateStatus !== rider.mandateStatus) {
                            // Status has changed, update the rider
                            setRiders(prevRiders => 
                                prevRiders.map(r => 
                                    r._id === rider._id 
                                        ? { ...r, mandateStatus: response.data.mandateStatus }
                                        : r
                                )
                            );
                            
                            // Dispatch custom event
                            window.dispatchEvent(new CustomEvent('mandateStatusUpdate', {
                                detail: {
                                    riderId: rider.riderId,
                                    mandateStatus: response.data.mandateStatus
                                }
                            }));
                        }
                    } catch (error) {
                        console.error(`Error checking status for rider ${rider.riderId}:`, error);
                    }
                }
            } catch (error) {
                console.error('Error polling mandate status:', error);
            }
        };

        // Poll every 30 seconds
        const interval = setInterval(pollMandateStatus, 30000);
        
        // Initial poll
        pollMandateStatus();

        return () => clearInterval(interval);
    }, [riders]);

    // Fetch riders when component mounts or filters change
    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        fetchRiders();
    }, [currentPage, debouncedSearchTerm, statusFilter, router]);

    // Fetch all riders for CSV export (without pagination)
    const fetchAllRidersForExport = async () => {
        try {
            const params = new URLSearchParams({
                limit: '1000', // Large limit to get all riders
                verificationStatus: 'approved', // Only approved riders
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(statusFilter && { mandateStatus: statusFilter })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.RIDERS.LIST}?${params}`);

            if (response.data.success) {
                return response.data.riders || [];
            } else {
                throw new Error('Failed to fetch riders for export');
            }
        } catch (error: any) {
            console.error('Error fetching riders for export:', error);
            throw error;
        }
    };

    // Convert riders data to CSV format
    const convertToCSV = (riders: Rider[]) => {
        const headers = [
            'Rider Name',
            'Rider ID',
            'Email',
            'Phone',
            'UPI ID',
            'Address',
            'Weekly Rent Amount',
            'Mandate Status',
            'Verification Status',
            'Created At',
            'Next Payment Date'
        ];

        const csvRows = [headers.join(',')];

        riders.forEach(rider => {
            const row = [
                `"${rider.name || ''}"`,
                `"${rider.riderId || ''}"`,
                `"${rider.email || ''}"`,
                `"${rider.phone || ''}"`,
                `"${rider.upiId || ''}"`,
                `"${rider.address || ''}"`,
                rider.weeklyRentAmount || 0,
                rider.mandateStatus || 'pending',
                rider.verificationStatus || 'pending',
                `"${formatDate(rider.createdAt)}"`,
                `"${getNextPaymentDate(rider.createdAt)}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    };

    // Export CSV function
    const handleExportCSV = async () => {
        try {
            setIsExporting(true);
            const loadingToast = toast.loading('Preparing CSV export...');

            // Fetch all riders for export
            const allRiders = await fetchAllRidersForExport();

            if (allRiders.length === 0) {
                toast.dismiss(loadingToast);
                toast.error('No riders found to export');
                return;
            }

            // Convert to CSV
            const csvContent = convertToCSV(allRiders);

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `riders_${timestamp}.csv`;
            link.download = filename;

            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss(loadingToast);
            toast.success(`CSV exported successfully with ${allRiders.length} riders`);
        } catch (error: any) {
            console.error('Error exporting CSV:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else {
                toast.error('Failed to export CSV');
            }
        } finally {
            setIsExporting(false);
        }
    };

    const getMandateStatusBadge = (rider: Rider) => {
        const currentStatus = mandateStatusUpdates[rider.riderId] || rider.mandateStatus;
        const isUpdating = mandateStatusUpdates[rider.riderId] && mandateStatusUpdates[rider.riderId] !== rider.mandateStatus;
        
        switch (currentStatus) {
            case 'active':
            case 'ACTIVE':
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                        Active
                    </span>
                );
            case 'failed':
            case 'FAILED':
            case 'CANCELLED':
            case 'REVOKED':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                        Failed
                    </span>
                );
            case 'revoked':
            case 'REVOKED':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Revoked
                    </span>
                );
            case 'cancelled':
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Cancelled
                    </span>
                );
            case 'pending':
            case 'PENDING':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1 animate-spin" />
                                Pending
                            </>
                        )}
                    </span>
                );
            case 'suspended':
            case 'SUSPENDED':
            case 'PAUSED':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Suspended
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {currentStatus}
                    </span>
                );
        }
    };

    if (isLoading && riders.length === 0) {
        return (
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 lg:mt-4 text-black text-sm lg:text-base">Loading Riders...</p>
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
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <div className="flex flex-col items-start justify-start gap-2">
                            <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Riders</h1>
                            <p className="text-sm lg:text-lg font-normal text-black">Manage bike rental Riders and their Payment manadates</p>
                        </div>
                        <div className='flex items-center gap-2 w-full sm:w-auto'>
                            <button
                                type='button'
                                onClick={() => setIsModalOpen(true)}
                                className='bg-[#0063B0] text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto'
                            >
                                <User className='w-3 h-3 lg:w-4 lg:h-4 text-white' />
                                <span>Add Rider</span>
                            </button>
                        </div>
                    </div>

                    {/* Table with search bar filter and export button */}
                    <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
                            <div className="relative flex-1 w-full lg:max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search Riders by name, email, or UPI ID..."
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
                                        <select title='status' className="appearance-none bg-white border border-gray-300 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="" className="py-2 px-3">All Status</option>
                                            <option value="active" className="py-2 px-3">🟢 Active</option>
                                            <option value="failed" className="py-2 px-3">🔴 Failed</option>
                                            <option value="cancelled" className="py-2 px-3">⚫ Cancelled</option>
                                            <option value="revoked" className="py-2 px-3">⚪ Revoked</option>
                                            <option value="pending" className="py-2 px-3">⚪ Pending</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                                            <svg className="h-3 w-3 lg:h-4 lg:w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <ExportCSV handleExportCSV={handleExportCSV} isExporting={isExporting} />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {isLoading && riders.length > 0 && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    <span className="ml-2 text-sm text-gray-600">Refreshing...</span>
                                </div>
                            )}
                            <table className="w-full border-collapse-separate min-w-[800px]">
                                <thead className='bg-[#020202] border border-[#FEFDFF]'>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tl-[12px] text-xs lg:text-sm">Riders</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Contact Info</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Mandate Status</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Weekly Amount</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Next payment</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tr-[12px] text-xs lg:text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riders.map((rider, index) => (
                                        <tr key={rider._id} className="hover:bg-gray-50">
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex items-center space-x-2 lg:space-x-3">
                                                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-black rounded-full flex items-center justify-center">
                                                        <span className="text-xs lg:text-sm font-medium text-white">{rider.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-xs lg:text-sm">{rider.name}</p>
                                                        <p className="text-xs lg:text-sm text-gray-500">{rider.riderId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="space-y-1 flex flex-col">
                                                    <div className="flex items-center space-x-1 lg:space-x-2">
                                                        <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                                        <span className="text-xs lg:text-sm text-gray-900 truncate">{rider.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 lg:space-x-2">
                                                        <Phone className="w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                                        <span className="text-xs lg:text-sm text-gray-900">{rider.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                {getMandateStatusBadge(rider)}
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm font-medium text-gray-900">{rider.weeklyRentAmount}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{getNextPaymentDate(rider.createdAt)}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                                    <button 
                                                        onClick={() => handleCheckStatus(rider._id)}
                                                        disabled={checkingStatus === rider._id}
                                                        className="text-xs lg:text-sm text-[#2BB048] hover:text-blue-800 disabled:opacity-50"
                                                    >
                                                        {checkingStatus === rider._id ? (
                                                            <>
                                                                <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin inline mr-1" />
                                                                Checking...
                                                            </>
                                                        ) : (
                                                            'Check Status'
                                                        )}
                                                    </button>
                                                    {rider.mandateStatus === 'active' && (
                                                        <button 
                                                            title='Cancel-mandate' 
                                                            type='button' 
                                                            onClick={() => handleCancelMandate(rider._id)}
                                                            disabled={cancellingMandate === rider._id}
                                                            className="text-xs lg:text-sm text-[#E51E25] hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {cancellingMandate === rider._id ? (
                                                                <>
                                                                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin inline mr-1" />
                                                                    Cancelling...
                                                                </>
                                                            ) : (
                                                                'Cancel Mandate'
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        title='delete'
                                                        type='button'
                                                        onClick={() => handleDeleteRider(rider._id)}
                                                        className="text-[#E51E25] hover:text-red-800"
                                                        disabled={isDeleting === rider._id}
                                                    >
                                                        {isDeleting === rider._id ? <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" /> : <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!isLoading && riders.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Riders found</h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first Rider.'}
                                    </p>
                                    {!searchTerm && !statusFilter && (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="bg-[#0063B0] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add Rider
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalRiders}
                            itemsPerPage={10}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                        />
                    </div>
                </main>
            </div>

            {/* Add New Rider Modal */}
            <AddRider isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>
    )
}

export default Riders