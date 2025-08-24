'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, CheckCircle, XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Pagination from '../common/Pagination'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
import { Rider } from '../helperMethods/interface'
import RiderStatusGrid from './Rider/RiderStatusGrid'
import ExportCSV from '../common/ExportCSV'

const RiderOnboarding = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const router = useRouter();

    const [riders, setRiders] = useState<Rider[]>([]);
    const [totalRiders, setTotalRiders] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch riders data
    const fetchRiders = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(statusFilter && { verificationStatus: statusFilter })
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
                setRiders([]);
                setTotalRiders(0);
            } else {
                toast.error('Failed to fetch Riders');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Approve rider
    const handleApproveRider = async (riderId: string) => {
        try {
            setIsUpdating(riderId);
            const response = await apiClient.patch(`${API_ENDPOINTS.RIDERS.UPDATE(riderId)}`, {
                verificationStatus: 'approved'
            });

            if (response.data.success) {
                toast.success('Rider approved successfully');
                fetchRiders(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to approve Rider');
            }
        } catch (error: any) {
            console.error('Error approving rider:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to approve Riders');
            } else {
                toast.error('Failed to approve Rider');
            }
        } finally {
            setIsUpdating(null);
        }
    };

    // Reject rider
    const handleRejectRider = async (riderId: string) => {
        try {
            setIsUpdating(riderId);
            const response = await apiClient.patch(`${API_ENDPOINTS.RIDERS.UPDATE(riderId)}`, {
                verificationStatus: 'rejected'
            });

            if (response.data.success) {
                toast.success('Rider rejected successfully');
                fetchRiders(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to reject Rider');
            }
        } catch (error: any) {
            console.error('Error rejecting rider:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to reject Riders');
            } else {
                toast.error('Failed to reject Rider');
            }
        } finally {
            setIsUpdating(null);
        }
    };

    // Get document status
    const getDocumentStatus = (documentUrl: string | undefined) => {
        return documentUrl && documentUrl.length > 0 ? 'uploaded' : 'not_uploaded';
    };
    
    // Download document function
    const handleDownloadDocument = async (documentUrl: string, documentType: string, riderName: string) => {
        try {
            // Show loading toast
            const loadingToast = toast.loading('Downloading document...');

            // Fetch the file from S3
            const response = await fetch(documentUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch document');
            }

            // Get the blob
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract file extension from URL
            const fileExtension = documentUrl.split('.').pop() || 'jpg';
            const fileName = `${riderName}_${documentType}.${fileExtension}`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss(loadingToast);
            toast.success('Document downloaded successfully');
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Failed to download document');
        }
    };

    // Fetch all riders for CSV export (without pagination)
    const fetchAllRidersForExport = async () => {
        try {
            const params = new URLSearchParams({
                limit: '1000', // Large limit to get all riders
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(statusFilter && { verificationStatus: statusFilter })
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
            'Aadhaar Status',
            'PAN Status',
            'Address Proof Status',
            'Bank Proof Status',
            'Battery Card Status',
            'Picture Status',
            'Verification Status',
            'Mandate Status',
            'Created At'
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
                getDocumentStatus(rider?.documents?.aadhaar),
                getDocumentStatus(rider?.documents?.pan),
                getDocumentStatus(rider?.documents?.addressProof),
                getDocumentStatus(rider?.documents?.bankProof),
                rider?.documents?.batteryCard && rider.documents.batteryCard.startsWith('https://') ? 'uploaded' : 'optional',
                getDocumentStatus(rider?.documents?.picture),
                rider.verificationStatus || 'pending',
                rider.mandateStatus || 'pending',
                `"${new Date(rider.createdAt).toLocaleDateString()}"`
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
            const filename = `rider_onboarding_${timestamp}.csv`;
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

    // Fetch riders when component mounts or filters change
    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        fetchRiders();
    }, [currentPage, debouncedSearchTerm, statusFilter, router]);

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
                        <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Rider Onboarding Status</h1>
                        <span className="text-sm lg:text-lg font-normal text-black">Monitor and verify rider documents to ensure smooth onboarding and mandate activation</span>
                    </div>

                    {/* Stats Grid */}
                   <RiderStatusGrid riders={riders} />

                    {/* Table with search bar filter and export button */}
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
                                <svg className="absolute left-2 lg:left-3 top-2.5 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="appearance-none bg-white border border-gray-300 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                        >
                                            <option value="" className="py-2 px-3">All Status</option>
                                            <option value="pending" className="py-2 px-3">🟡 Pending Verification</option>
                                            <option value="approved" className="py-2 px-3">🟢 Approved</option>
                                            <option value="rejected" className="py-2 px-3">🔴 Documents Rejected</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none">
                                            <svg className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <table className="w-full border-collapse-separate min-w-[1000px]">
                                <thead className='bg-[#020202] border border-[#FEFDFF]'>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tl-[12px] text-xs lg:text-sm">Rider Name</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Aadhaar</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">PAN</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Address Proof</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Bank Proof</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Battery Card</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Picture</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tr-[12px] text-xs lg:text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riders.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-8 text-gray-500">
                                                No riders found
                                            </td>
                                        </tr>
                                    ) : (
                                        riders.map((rider, index) => (
                                            <tr key={rider._id || index} className="hover:bg-gray-50">
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-xs lg:text-sm">{rider.name}</p>
                                                        <p className="text-xs lg:text-sm text-gray-500">{rider.riderId}</p>
                                                    </div>
                                                </td>

                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    {getDocumentStatus(rider?.documents?.aadhaar) === 'uploaded' ? (
                                                        <div
                                                            className="w-8 h-8 lg:w-12 lg:h-12 bg-[#F8F8F8] p-1 lg:p-2 rounded flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => rider.documents.aadhaar && handleDownloadDocument(rider.documents.aadhaar, 'aadhaar', rider.name)}
                                                            title="Click to download Aadhaar document"
                                                        >
                                                            <Image src="/image-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-6 lg:h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs lg:text-sm text-red-500">Not Uploaded</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    {getDocumentStatus(rider?.documents?.pan) === 'uploaded' ? (
                                                        <div
                                                            className="w-8 h-8 lg:w-12 lg:h-12 bg-[#F8F8F8] p-1 lg:p-2 rounded flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => rider.documents.pan && handleDownloadDocument(rider.documents.pan, 'pan', rider.name)}
                                                            title="Click to download PAN document"
                                                        >
                                                            <Image src="/image-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-6 lg:h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs lg:text-sm text-red-500">Not Uploaded</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    {getDocumentStatus(rider?.documents?.addressProof) === 'uploaded' ? (
                                                        <div
                                                            className="w-8 h-8 lg:w-12 lg:h-12 bg-[#F8F8F8] p-1 lg:p-2 rounded flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => rider.documents.addressProof && handleDownloadDocument(rider.documents.addressProof, 'address_proof', rider.name)}
                                                            title="Click to download Address Proof document"
                                                        >
                                                            <Image src="/image-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-6 lg:h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs lg:text-sm text-red-500">Not Uploaded</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    {getDocumentStatus(rider?.documents?.bankProof) === 'uploaded' ? (
                                                        <div
                                                            className="w-8 h-8 lg:w-12 lg:h-12 bg-[#F8F8F8] p-1 lg:p-2 rounded flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => rider.documents.bankProof && handleDownloadDocument(rider.documents.bankProof, 'bank_proof', rider.name)}
                                                            title="Click to download Bank Proof document"
                                                        >
                                                            <Image src="/image-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-6 lg:h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs lg:text-sm text-red-500">Not Uploaded</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    {rider?.documents?.batteryCard && rider.documents.batteryCard.startsWith('https://') ? (
                                                        <div
                                                            className="w-8 h-8 lg:w-12 lg:h-12 bg-[#F8F8F8] p-1 lg:p-2 rounded flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => rider.documents.batteryCard && handleDownloadDocument(rider.documents.batteryCard, 'battery_card', rider.name)}
                                                            title="Click to download Battery Card document"
                                                        >
                                                            <Image src="/image-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-6 lg:h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs lg:text-sm text-gray-500">Optional</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                    {getDocumentStatus(rider?.documents?.picture) === 'uploaded' ? (
                                                        <div
                                                            className="w-8 h-8 lg:w-12 lg:h-12 bg-[#F8F8F8] p-1 lg:p-2 rounded flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                                                            onClick={() => rider.documents.picture && handleDownloadDocument(rider.documents.picture, 'picture', rider.name)}
                                                            title="Click to download Picture"
                                                        >
                                                            <Image src="/image-icon.svg" alt="image" width={16} height={16} className="w-4 h-4 lg:w-6 lg:h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs lg:text-sm text-red-500">Not Uploaded</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-2 lg:py-3 px-2 lg:px-2 border border-[#0000001A]">
                                                    <div className="flex flex-col sm:flex-col gap-1 lg:gap-2 justify-center">
                                                        {rider?.verificationStatus === 'pending' && (
                                                            <>
                                                                <button
                                                                    type='button'
                                                                    title='Approve'
                                                                    onClick={() => handleApproveRider(rider._id)}
                                                                    disabled={isUpdating === rider._id}
                                                                    className="bg-[#0063B0] text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                                                >
                                                                    {isUpdating === rider._id ? (
                                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <CheckCircle className="w-3 h-3" />
                                                                    )}
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type='button'
                                                                    title='Reject'
                                                                    onClick={() => handleRejectRider(rider._id)}
                                                                    disabled={isUpdating === rider._id}
                                                                    className="border border-[#E51E25] text-[#E51E25] px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                                                >
                                                                    {isUpdating === rider._id ? (
                                                                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <XCircle className="w-3 h-3" />
                                                                    )}
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {rider?.verificationStatus === 'approved' && (
                                                            <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Approved
                                                            </span>
                                                        )}
                                                        {rider?.verificationStatus === 'rejected' && (
                                                            <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <XCircle className="w-3 h-3 mr-1" />
                                                                Rejected
                                                            </span>
                                                        )}

                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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
        </div>
    )
}

export default RiderOnboarding