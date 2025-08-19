import { Edit, User } from 'lucide-react'
import React, { useState } from 'react'
import AddAdmin from './AddAdmin';
import EditAdmin from './EditAdmin';

// Mock data for admin profiles
const adminProfiles = [
    {
        id: 1,
        name: "Pankaj Kumar",
        username: "@admin",
        email: "Pankajadmin.com",
        role: "Admin",
        phone: "+91 98765 43210",
        createdOn: "10 Feb 2024",
        assignedRegion: "Bangalore Zone",
        status: "Active",
        avatar: "P"
    },
    {
        id: 2,
        name: "Pankaj Kumar",
        username: "@admin",
        email: "Pankajadmin.com",
        role: "Admin",
        phone: "+91 98765 43210",
        createdOn: "10 Feb 2024",
        assignedRegion: "Bangalore Zone",
        status: "Active",
        avatar: "P"
    }
];

// Admin Card Component
const AdminCard = ({ admin }: { admin: typeof adminProfiles[0] }) => {
    const [editIsModalOpen, setEditIsModalOpen] = useState(false);
    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 border border-[#0063B0] p-4 rounded-xl">
            {/* Left Section - Avatar and Actions */}
            <div className="flex flex-col items-center gap-4">
                {/* Avatar with Active Status */}
                <div className="relative">
                    <div className="w-40 h-40 lg:w-60 lg:h-60 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white text-6xl lg:text-9xl font-normal">{admin.avatar}</span>
                    </div>
                    <div className="absolute top-0 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                        {admin.status}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
                    <button
                        type='button'
                        className='bg-[#0063B0] w-full text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm lg:text-base'
                    >
                        Suspend
                    </button>
                    <button
                        type='button'
                        className='bg-[#E51E25] w-full text-white px-4 lg:px-6 py-2 rounded-md hover:bg-red-700 transition-colors text-sm lg:text-base'
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Right Section - User Info */}
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                        <h2 className="text-lg lg:text-xl font-bold text-black">{admin.name}</h2>
                        <p className="text-sm text-gray-600">{admin.username}</p>
                    </div>
                    <button
                        type='button'
                        className='bg-[#0063B0] text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm lg:text-base'
                        onClick={() => setEditIsModalOpen(true)}
                    >
                        <Edit className='w-3 h-3 lg:w-4 lg:h-4' />
                        <span>Edit</span>
                    </button>
                </div>

                <hr className='my-4' />

                <div className="space-y-2 lg:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Name:</span>
                        <span className="text-black text-sm lg:text-base">{admin.name}</span>
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
                        <span className="text-black text-sm lg:text-base">{admin.createdOn}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold text-gray-700 text-sm lg:text-base">Assigned Region:</span>
                        <span className="text-black text-sm lg:text-base">{admin.assignedRegion}</span>
                    </div>
                </div>
            </div>
            <EditAdmin isModalOpen={editIsModalOpen} setIsModalOpen={setEditIsModalOpen} />
        </div>
    );
};

const AdminManagementUserDetails = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (<>
        {/* Heading */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className="flex flex-col items-start justify-start gap-2">
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
                    className="bg-[#00000008] placeholder:text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
                <svg className="absolute left-6 lg:left-9 top-6 lg:top-8 h-4 w-4 lg:h-5 lg:w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Admin Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {adminProfiles.map((admin) => (
                    <div key={admin.id} className="bg-white rounded-xl p-4 lg:p-6">
                        <AdminCard admin={admin} />
                    </div>
                ))}
            </div>
        </div>

        <AddAdmin isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />

    </>
    )
}

export default AdminManagementUserDetails