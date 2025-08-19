'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import AdminManagementUserDetails from './AdminManagementUserDetails'
import EditAdmin from './EditAdmin'

const AdminManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [editIsModalOpen, setEditIsModalOpen] = useState(false);

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

          {/* Customer Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex gap-6">
                {/* Left Section - Avatar and Actions */}
                <div className="flex flex-col items-start gap-4">
                  {/* Avatar with Active Status */}
                  <div className="relative">
                    <div className="w-60 h-60 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white text-9xl font-normal">A</span>
                    </div>
                    <div className="absolute top-0  bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                      Active
                    </div>
                  </div>
                  {/* Change Password Button */}
                  <button
                    type='button'
                    className='bg-[#0063B0] w-full text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                  >
                    Change Password
                  </button>
                </div>

                {/* Right Section - User Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-black">Ankit Kumar</h2>
                      <p className="text-sm text-gray-600">@superadmin</p>
                    </div>
                    <button
                      type='button'
                      className='bg-[#0063B0] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2'
                      onClick={() => setEditIsModalOpen(true)}
                    >
                      <Edit className='w-4 h-4' />
                      <span>Edit</span>
                    </button>
                  </div>

                  <hr className='my-4' />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">Name:</span>
                      <span className="text-black">Ankit Kumar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">Email:</span>
                      <span className="text-black">ankit@superadmin.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">Role:</span>
                      <span className="text-black">Superadmin</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">Phone:</span>
                      <span className="text-black">+91 98765 43210</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">Created On:</span>
                      <span className="text-black">10 Feb 2024</span>
                    </div>
                  </div>
                </div>
                <EditAdmin isModalOpen={editIsModalOpen} setIsModalOpen={setEditIsModalOpen} />
              </div>
            </div>
          </div>

          <AdminManagementUserDetails />
        </main>
      </div>
    </div>
  )
}

export default AdminManagement