import { Edit, User } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import AddAdmin from './AddAdmin';
import EditAdmin from './EditAdmin';
import { apiClient, API_ENDPOINTS } from '@/utils/api';
import toast from 'react-hot-toast';

interface AdminData {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Card Component
const AdminCard = ({ admin, onEdit, onAdminUpdated }: { 
    admin: AdminData; 
    onEdit: (admin: AdminData) => void;
    onAdminUpdated: () => void;
}) => {
    const [editIsModalOpen, setEditIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = () => {
        onEdit(admin);
        setEditIsModalOpen(true);
    };

    const handleSuspend = async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            const response = await apiClient.put(API_ENDPOINTS.ADMIN.SUSPEND(admin._id), {
                isActive: false
            });
            
            if (response.data.success) {
                toast.success('Admin suspended successfully');
                onAdminUpdated(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to suspend admin');
            }
        } catch (error: any) {
            console.error('Error suspending admin:', error);
            toast.error(error.response?.data?.message || 'Failed to suspend admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsuspend = async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            const response = await apiClient.put(API_ENDPOINTS.ADMIN.SUSPEND(admin._id), {
                isActive: true
            });
            
            if (response.data.success) {
                toast.success('Admin unsuspended successfully');
                onAdminUpdated(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to unsuspend admin');
            }
        } catch (error: any) {
            console.error('Error unsuspending admin:', error);
            toast.error(error.response?.data?.message || 'Failed to unsuspend admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            const response = await apiClient.delete(API_ENDPOINTS.ADMIN.DELETE(admin._id));
            
            if (response.data.success) {
                toast.success('Admin deleted successfully');
                onAdminUpdated(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to delete admin');
            }
        } catch (error: any) {
            console.error('Error deleting admin:', error);
            toast.error(error.response?.data?.message || 'Failed to delete admin');
        } finally {
            setIsLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get avatar initial from username
    const getAvatar = (username: string) => {
        return username.charAt(0).toUpperCase();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 border border-[#0063B0] p-4 rounded-xl">
            {/* Left Section - Avatar and Actions */}
            <div className="flex flex-col items-center gap-4">
                {/* Avatar with Active Status */}
                <div className="relative">
                    <div className="w-40 h-40 lg:w-60 lg:h-60 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white text-6xl lg:text-9xl font-normal">{getAvatar(admin.username)}</span>
                    </div>
                    <div className={`absolute top-0 text-white text-xs px-2 py-1 rounded-md ${
                        admin.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
                    {admin.isActive ? (
                        <button
                            type='button'
                            onClick={handleSuspend}
                            disabled={isLoading}
                            className={`w-full text-white px-4 py-2 rounded-md transition-colors text-sm lg:text-base ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#0063B0] hover:bg-blue-700'
                            }`}
                        >
                            {isLoading ? 'Processing...' : 'Suspend'}
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={handleUnsuspend}
                            disabled={isLoading}
                            className={`w-full text-white px-4 py-2 rounded-md transition-colors text-sm lg:text-base ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {isLoading ? 'Processing...' : 'Unsuspend'}
                        </button>
                    )}
                    <button
                        type='button'
                        onClick={handleDelete}
                        disabled={isLoading}
                        className={`w-full text-white px-4 lg:px-6 py-2 rounded-md transition-colors text-sm lg:text-base ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#E51E25] hover:bg-red-700'
                        }`}
                    >
                        {isLoading ? 'Processing...' : 'Delete'}
                    </button>
                </div>
            </div>

            {/* Right Section - User Info */}
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                        <h2 className="text-lg lg:text-xl font-bold text-black">{admin.username}</h2>
                        <p className="text-sm text-gray-600">@{admin.role}</p>
                    </div>
                    <button
                        type='button'
                        className='bg-[#0063B0] text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm lg:text-base'
                        onClick={handleEdit}
                    >
                        <Edit className='w-3 h-3 lg:w-4 lg:h-4' />
                        <span>Edit</span>
                    </button>
                </div>

                <hr className='my-4' />

                <div className="space-y-2 lg:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Username:</span>
                        <span className="text-black text-sm lg:text-base">{admin.username}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Email:</span>
                        <span className="text-black text-sm lg:text-base">{admin.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Role:</span>
                        <span className="text-black text-sm lg:text-base">{admin.role}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Phone:</span>
                        <span className="text-black text-sm lg:text-base">{admin.phone}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Created On:</span>
                        <span className="text-black text-sm lg:text-base">{formatDate(admin.createdAt)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Status:</span>
                        <span className="text-black text-sm lg:text-base">{admin.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>
            
            <EditAdmin 
                isModalOpen={editIsModalOpen} 
                setIsModalOpen={setEditIsModalOpen}
                adminData={admin}
                onAdminUpdated={() => {
                    onAdminUpdated(); // Use the passed callback instead of reload
                }}
            />
        </div>
    );
};

const AdminManagementUserDetails = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);
    const [admins, setAdmins] = useState<AdminData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch admins from API
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.LIST);
            
            if (response.data.success) {
                setAdmins(response.data.data);
            } else {
                setError('Failed to fetch admins');
                toast.error('Failed to fetch admins');
            }
        } catch (error: any) {
            console.error('Error fetching admins:', error);
            setError(error.response?.data?.message || 'Failed to fetch admins');
            toast.error(error.response?.data?.message || 'Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    // Load admins on component mount
    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleEditAdmin = (admin: AdminData) => {
        setSelectedAdmin(admin);
    };

    // Filter admins based on search term
    const filteredAdmins = admins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (<>
        {/* Heading */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className="flex flex-col items-start justify-staadrt gap-2">
                <h1 className="text-xl lg:text-2xl font-semibold text-black">Admins list</h1>
                <p className="text-base lg:text-lg font-normal text-black">Manage admins, roles, and system access.</p>
            </div>
            <div className='flex items-center gap-2 w-full sm:w-auto'>
                <button
                    type='button'
                    onClick={() => setIsModalOpen(true)}
                    className='bg-[#0063B0] text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto'
                >
                    <User className='w-4 h-4 text-white' />
                    <span>Add New Admin</span>
                </button>
            </div>
        </div>

        {/* Search Bar and Admin Cards */}
        <div className="bg-white rounded-xl">
            <div className="relative flex-1 w-full lg:w-1/2 px-4 lg:px-6 pt-4 lg:pt-6">
                <input
                    type="text"
                    placeholder="Search Admins by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#00000008] placeholder:text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
                <svg className="absolute left-6 lg:left-9 top-6 lg:top-8 h-4 w-4 lg:h-5 lg:w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0063B0]"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="text-red-500 text-center">
                        <p className="mb-2">{error}</p>
                        <button
                            onClick={fetchAdmins}
                            className="bg-[#0063B0] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Admin Cards Grid */}
            {!loading && !error && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredAdmins.length > 0 ? (
                        filteredAdmins.map((admin) => (
                            <div key={admin._id} className="bg-white rounded-xl p-4 lg:p-6">
                                <AdminCard 
                                    admin={admin} 
                                    onEdit={handleEditAdmin} 
                                    onAdminUpdated={fetchAdmins}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex justify-center items-center py-8">
                            <p className="text-gray-500">
                                {searchTerm ? 'No admins found matching your search.' : 'No admins found.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <AddAdmin 
            isModalOpen={isModalOpen} 
            setIsModalOpen={setIsModalOpen}
            onAdminCreated={() => {
                // Refresh the admin list when a new admin is created
                fetchAdmins();
            }}
        />

    </>
    )
}

export default AdminManagementUserDetails