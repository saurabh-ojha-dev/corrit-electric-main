'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '../common/Pagination'
import { customerStatusData } from '@/constants/data'
import AddCustomer from './AddCustomer'
import { apiClient, API_ENDPOINTS } from '@/utils/api'

interface Rider {
    _id: string;
    riderId: string;
    name: string;
    email: string;
    phone: string;
    upiId: string;
    weeklyRentAmount: number;
    mandateStatus: 'pending' | 'active' | 'failed' | 'revoked';
    verificationStatus: 'pending' | 'verified' | 'rejected';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const Customers = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [riders, setRiders] = useState<Rider[]>([]);
    const [totalRiders, setTotalRiders] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(statusFilter && { mandateStatus: statusFilter })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.RIDERS.LIST}?${params}`);
            
            if (response.data.success) {
                setRiders(response.data.riders || []);
                setTotalRiders(response.data.total || 0);
            } else {
                toast.error('Failed to fetch customers');
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
                toast.error('Failed to fetch customers');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Delete rider
    const handleDeleteRider = async (riderId: string) => {
        if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(riderId);
            const response = await apiClient.delete(API_ENDPOINTS.RIDERS.DELETE(riderId));
            
            if (response.data.success) {
                toast.success('Customer deleted successfully');
                fetchRiders(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to delete customer');
            }
        } catch (error: any) {
            console.error('Error deleting rider:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to delete customers');
            } else {
                toast.error('Failed to delete customer');
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

    // Fetch riders when component mounts or filters change
    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        fetchRiders();
    }, [currentPage, debouncedSearchTerm, statusFilter, router]);

    const getMandateStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                        Active
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                        Failed
                    </span>
                );
            case 'revoked':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Revoked
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    if (isLoading && riders.length === 0) {
        return (
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 lg:mt-4 text-black text-sm lg:text-base">Loading customers...</p>
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
                            <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Customers</h1>
                            <p className="text-sm lg:text-lg font-normal text-black">Manage bike rental Customers and their Payment manadates
                                <span className='text-[#595959] font-normal pl-2'>|</span>
                                <span className='text-[#595959] font-normal pl-2'>{totalRiders} total customers</span>
                            </p>
                        </div>
                        <div className='flex items-center gap-2 w-full sm:w-auto'>
                            <button 
                                type='button' 
                                onClick={() => setIsModalOpen(true)}
                                className='bg-[#0063B0] text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto'
                            >
                                <User className='w-3 h-3 lg:w-4 lg:h-4 text-white' />
                                <span>Add Customer</span>
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
                                    placeholder="Search Customers by name, email, or UPI ID..."
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
                                <button type='button' className="bg-black text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto">
                                    <Download className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                    <span>Export CSV</span>
                                </button>
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
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tl-[12px] text-xs lg:text-sm">Customers</th>
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
                                                {getMandateStatusBadge(rider.mandateStatus)}
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm font-medium text-gray-900">{rider.weeklyRentAmount}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{rider.updatedAt}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                                    <button className="text-xs lg:text-sm text-[#2BB048] hover:text-blue-800">
                                                        Check Status
                                                    </button>
                                                    {rider.mandateStatus === 'active' && (
                                                        <button title='Cancel-mandate' type='button' className="text-xs lg:text-sm text-[#E51E25] hover:text-red-800">
                                                            Cancel Mandate
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
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first customer.'}
                                    </p>
                                    {!searchTerm && !statusFilter && (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="bg-[#0063B0] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add Customer
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

            {/* Add Customer Modal */}
            <AddCustomer isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>
    )
}

export default Customers