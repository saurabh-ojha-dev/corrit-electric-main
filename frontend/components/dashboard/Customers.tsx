'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '../common/Pagination'
import { customerStatusData } from '@/constants/data'
import AddCustomer from './AddCustomer'

const Customers = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

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
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 lg:mt-4 text-black text-sm lg:text-base">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const getMandateStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                        Active
                    </span>
                );
            case 'Failed':
                return (
                    <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                        Failed
                    </span>
                );
            case 'Revoked':
                return (
                    <span className="inline-flex items-center text-xs font-medium text-gray-800">
                        Revoked
                    </span>
                );
            default:
                return status;
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
                        <div className="flex flex-col items-start justify-start gap-2">
                            <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Customers</h1>
                            <p className="text-sm lg:text-lg font-normal text-black">Manage bike rental Customers and their Payment manadates
                                <span className='text-[#595959] font-normal pl-2'>|</span>
                                <span className='text-[#595959] font-normal pl-2'>23 total customers</span>
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
                                        <select title='status' className="appearance-none bg-white border border-gray-300 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium">
                                            <option value="" className="py-2 px-3">All Status</option>
                                            <option value="active" className="py-2 px-3">🟢 Active</option>
                                            <option value="failed" className="py-2 px-3">🔴 Failed</option>
                                            <option value="revoked" className="py-2 px-3">⚪ Revoked</option>
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
                                    {customerStatusData.map((customer, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex items-center space-x-2 lg:space-x-3">
                                                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-black rounded-full flex items-center justify-center">
                                                        <span className="text-xs lg:text-sm font-medium text-white">{customer.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-xs lg:text-sm">{customer.name}</p>
                                                        <p className="text-xs lg:text-sm text-gray-500">{customer.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="space-y-1 flex flex-col">
                                                    <div className="flex items-center space-x-1 lg:space-x-2">
                                                        <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                                        <span className="text-xs lg:text-sm text-gray-900 truncate">{customer.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 lg:space-x-2">
                                                        <Phone className="w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                                        <span className="text-xs lg:text-sm text-gray-900">{customer.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                {getMandateStatusBadge(customer.mandateStatus)}
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm font-medium text-gray-900">{customer.weeklyAmount}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{customer.nextPayment}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                                    <button className="text-xs lg:text-sm text-[#2BB048] hover:text-blue-800">
                                                        Check Status
                                                    </button>
                                                    {customer.mandateStatus === 'Active' && (
                                                        <button title='Cancel-mandate' type='button' className="text-xs lg:text-sm text-[#E51E25] hover:text-red-800">
                                                            Cancel Mandate
                                                        </button>
                                                    )}
                                                    {customer.hasDeleteAction && (
                                                        <button title='delete' type='button' className="text-[#E51E25] hover:text-red-800">
                                                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination />
                    </div>
                </main>
            </div>

            {/* Add Customer Modal */}
            <AddCustomer isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>
    )
}

export default Customers