'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import AdminManagementUserDetails from './AdminManagementUserDetails'
import EditAdmin from './EditAdmin'
import { useAdminProfile } from '@/hooks/useAdminProfile'
import { API_ENDPOINTS, apiClient } from '@/utils/api'
import ChangePasswordModal from './ChangePasswordModal'

const AdminManagement = () => {
  interface AdminData {
    _id: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [editIsModalOpen, setEditIsModalOpen] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const { profile: currentAdmin } = useAdminProfile();
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const fetchSuperAdminData = async () => {
    try {
      if (!currentAdmin?._id) {
        toast.error('Admin ID not found');
        return;
      }

      const response = await apiClient.get(API_ENDPOINTS.ADMIN.GET(currentAdmin._id));

      if (response.data.success) {
        setAdminData(response.data.data);
      } else {
        toast.error('Failed to fetch admin data');
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch admin data');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    if (currentAdmin) {
      fetchSuperAdminData();
    }

    setIsLoading(false);
  }, [router, currentAdmin])

  if (isLoading) {
    return (
      <div className="flex w-full  h-full bg-[#F8F8F8] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#F8F8F8] ml-5 w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto gap-6">

          {/* Heading */}
          <div className="flex items-start justify-start gap-2">
            <h1 className="text-2xl font-semibold text-black border-b-2 border-[#E51E25]">Admin Managements</h1>
          </div>

          {/* Admin Information Section */}
          <div className="w-full">
            {/* Admin Information Card */}
            <div className="bg-white rounded-xl shadow p-6 max-w-4xl">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Avatar and Actions */}
                <div className="flex flex-col items-start gap-4">
                  {/* Avatar with Active Status */}
                  <div className="relative">
                    <div className="w-48 h-48 lg:w-60 lg:h-60 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white text-6xl lg:text-9xl font-normal">
                        {adminData?.username?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                      {adminData?.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  {/* Change Password Button */}
                  <button
                    type='button'
                    className='bg-[#0063B0] w-full text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                    onClick={() => {
                      setChangePasswordModalOpen(true)
                    }}
                  >
                    Change Password
                  </button>
                </div>
                <ChangePasswordModal
                  isModalOpen={changePasswordModalOpen}
                  setIsModalOpen={setChangePasswordModalOpen}
                />

                {/* Right Section - User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-black">{adminData?.username || 'Loading...'}</h2>
                      <p className="text-sm text-gray-600">@{adminData?.role || 'loading'}</p>
                    </div>
                    <button
                      type='button'
                      className='bg-[#0063B0] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit'
                      onClick={() => setEditIsModalOpen(true)}
                    >
                      <Edit className='w-4 h-4' />
                      <span>Edit</span>
                    </button>
                  </div>

                  <hr className='my-4' />

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-bold text-gray-700">Name:</span>
                      <span className="text-black">{adminData?.username || 'Loading...'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-bold text-gray-700">Email:</span>
                      <span className="text-black break-all">{adminData?.email || 'Loading...'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-bold text-gray-700">Role:</span>
                      <span className="text-black">{adminData?.role || 'Loading...'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-bold text-gray-700">Phone:</span>
                      <span className="text-black">{adminData?.phone || 'Loading...'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-bold text-gray-700">Created On:</span>
                      <span className="text-black">
                        {adminData?.createdAt ? new Date(adminData.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {adminData && (
            <EditAdmin
              isModalOpen={editIsModalOpen}
              setIsModalOpen={setEditIsModalOpen}
              adminData={adminData}
              onAdminUpdated={() => {
                fetchSuperAdminData();
              }}
            />
          )}

          <AdminManagementUserDetails />
        </main>
      </div>
    </div>
  )
}

export default AdminManagement