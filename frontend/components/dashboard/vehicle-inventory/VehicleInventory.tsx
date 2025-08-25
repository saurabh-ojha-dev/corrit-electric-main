'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Trash2, CheckCircle, XCircle, User, Loader2, Edit, UserPlus, PlusCircleIcon, Bike, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
import Pagination from '@/components/common/Pagination'
import { formatDate } from '@/components/helperMethods/FormatDate'
import AddVehicle from './AddVehicle'
import Image from 'next/image'
import { Vehicle } from '@/components/helperMethods/interface'
import AssignVehicle from './AssignVehicle'
import EditVehicle from './EditVehicle'

const VehicleInventory = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [totalVehicles, setTotalVehicles] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [vehicleStats, setVehicleStats] = useState({ totalVehicles: 0, assignedVehicles: 0, pendingVehicles: 0 });
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedVehicleForAssignment, setSelectedVehicleForAssignment] = useState<Vehicle | null>(null);
    const [assignModalMode, setAssignModalMode] = useState<'assign' | 'unassign'>('assign');
    const router = useRouter();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch vehicles data
    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(statusFilter && { status: statusFilter })
            });

            const response = await apiClient.get(`${API_ENDPOINTS.VEHICLES.LIST}?${params}`);

            if (response.data.success) {
                setVehicles(response.data.data || []);
                setTotalVehicles(response.data.pagination?.totalItems || 0);
            } else {
                toast.error('Failed to fetch Vehicles');
            }
        } catch (error: any) {
            console.error('Error fetching vehicles:', error);
            if (error.response?.status === 401) {
                router.push('/admin/login');
            } else if (error.response?.status === 404) {
                // 404 is expected when there are no vehicles, don't show error
                setVehicles([]);
                setTotalVehicles(0);
            } else {
                toast.error('Failed to fetch Vehicles');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch vehicle statistics
    const fetchVehicleStats = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.VEHICLES.LIST);
            if (response.data.success) {
                const allVehicles = response.data.data || [];
                const total = allVehicles.length;
                const assigned = allVehicles.filter((v: Vehicle) => v.riderId || v.assignedRiderId).length;
                const pending = total - assigned;

                setVehicleStats({
                    totalVehicles: total,
                    assignedVehicles: assigned,
                    pendingVehicles: pending
                });
            }
        } catch (error) {
            console.error('Error fetching vehicle stats:', error);
        }
    };

    // Delete vehicle
    const handleDeleteVehicle = async (vehicleId: string) => {
        // Check if vehicle is assigned before attempting deletion
        const vehicle = vehicles.find(v => v._id === vehicleId);
        if (vehicle && (vehicle.riderId || vehicle.assignedRiderId)) {
            toast.error('Cannot delete vehicle that is assigned to a rider. Please unassign the rider first.');
            return;
        }

        try {
            setIsDeleting(vehicleId);
            const response = await apiClient.delete(API_ENDPOINTS.VEHICLES.DELETE(vehicleId));

            if (response.data.success) {
                toast.success('Vehicle deleted successfully');
                fetchVehicles(); // Refresh the list
                fetchVehicleStats(); // Refresh stats
            } else {
                toast.error(response.data.message || 'Failed to delete Vehicle');
            }
        } catch (error: any) {
            console.error('Error deleting vehicle:', error);
            if (error.response?.status === 400) {
                toast.error('Cannot delete vehicle that is assigned to a rider. Please unassign the rider first.');
            } else if (error.response?.status === 401) {
                toast.error('Authentication required. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to delete Vehicles');
            } else {
                toast.error('Failed to delete Vehicle');
            }
        } finally {
            setIsDeleting(null);
        }
    };

    // Listen for new vehicle creation
    useEffect(() => {
        const handleVehicleCreated = () => {
            fetchVehicles();
            fetchVehicleStats();
        };

        window.addEventListener('vehicleCreated', handleVehicleCreated);
        return () => {
            window.removeEventListener('vehicleCreated', handleVehicleCreated);
        };
    }, []);

    // Handle vehicle update
    const handleVehicleUpdated = () => {
        fetchVehicles();
        fetchVehicleStats();
    };

    // Handle vehicle assignment
    const handleVehicleAssigned = () => {
        fetchVehicles();
        fetchVehicleStats();
    };

    // Handle vehicle unassignment
    const handleVehicleUnassigned = () => {
        fetchVehicles();
        fetchVehicleStats();
    };

    // Fetch vehicles when component mounts or filters change
    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }
        fetchVehicles();
        fetchVehicleStats();
    }, [currentPage, debouncedSearchTerm, statusFilter, router]);

    const getVehicleStatusBadge = (vehicle: Vehicle) => {
        if (vehicle.riderId || vehicle.assignedRiderId) {
            return (
                <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                    Assigned
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 lg:px-3.5 py-1.5 lg:py-2.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                </span>
            );
        }
    };

    if (isLoading && vehicles.length === 0) {
        return (
            <div className="flex w-full h-full bg-[#F8F8F8] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 lg:mt-4 text-black text-sm lg:text-base">Loading Vehicles...</p>
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
                            <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Vehicle Inventory</h1>
                            <p className="text-sm lg:text-lg font-normal text-black">Manage all vehicles, assign them to riders, and track their status.</p>
                        </div>
                        <div className='flex items-center gap-2 w-full sm:w-auto'>
                            <button
                                type='button'
                                onClick={() => setIsModalOpen(true)}
                                className='bg-[#0063B0] text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto'
                            >
                                <PlusCircleIcon className='w-3 h-3 lg:w-4 lg:h-4 text-white' />
                                <span>Add Vehicle</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 bg-white rounded-[20px] p-3 lg:p-4">

                        {/* Total Vehicles */}
                        <div className="bg-[#F4FAFF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Total Vehicles</p>
                                <div className="p-4 rounded-md"
                                    style={{ background: 'radial-gradient(50% 50% at 50% 50%, #63B0EC 0%, #0063B0 100%)' }}
                                >
                                    <Image src="/bike-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">{vehicleStats.totalVehicles}</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">Total vehicles in inventory</p>
                            </div>
                        </div>

                        {/* Assigned Vehicles */}
                        <div className="bg-[#EAFFEF] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Assigned Vehicles</p>
                                <div className="p-4 rounded-md"
                                    style={{ background: 'radial-gradient(50% 50% at 50% 50%, #50E170 0%, #2BB048 100%)' }}
                                >
                                    <Image src="/bike-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">{vehicleStats.assignedVehicles}</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">Total vehicles assigned to riders</p>
                            </div>
                        </div>

                        {/* Pending Vehicles */}
                        <div className="bg-[#FFFAE6] rounded-xl shadow p-3 lg:p-4">
                            <div className="flex justify-between">
                                <p className="text-xs lg:text-sm font-semibold text-black uppercase">Pending Vehicles</p>
                                <div className="p-4 rounded-md"
                                    style={{ background: 'radial-gradient(50% 50% at 50% 50%, #FFEB8F 0%, #F4CA0D 100%)' }}
                                >
                                    <Image src="/bike-icon.svg" alt="onboarding" width={20} height={20} className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl lg:text-3xl font-bold text-black">{vehicleStats.pendingVehicles}</p>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-500">Total vehicles pending assignment</p>
                            </div>
                        </div>
                    </div>

                    {/* Table with search bar filter and export button */}
                    <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
                            <div className="relative flex-1 w-full lg:max-w-lg">
                                <input
                                    type="text"
                                    placeholder="Search by Vehicle number, Chassis number, or Tracker ID..."
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
                                        <select 
                                            title='Filter' 
                                            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[120px] lg:min-w-[140px] text-xs lg:text-sm font-medium"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="" className="py-2 px-3">All Vehicles</option>
                                            <option value="assigned" className="py-2 px-3">Assigned</option>
                                            <option value="pending" className="py-2 px-3">Pending</option>
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

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {isLoading && vehicles.length > 0 && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    <span className="ml-2 text-sm text-gray-600">Refreshing...</span>
                                </div>
                            )}
                            <table className="w-full border-collapse-separate min-w-[800px]">
                                <thead className='bg-[#020202] border border-[#FEFDFF]'>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tl-[12px] text-xs lg:text-sm">Vehicle Number</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Chassis Number</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Tracker ID</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Date Added</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Status</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white text-xs lg:text-sm">Assigned Rider</th>
                                        <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-normal border border-r border-[#FFFFFF] text-white rounded-tr-[12px] text-xs lg:text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((vehicle, index) => (
                                        <tr key={vehicle._id} className="hover:bg-gray-50">
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex items-center space-x-2 lg:space-x-3">
                                                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-black rounded-full flex items-center justify-center">
                                                        <Bike className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                    </div>
                                                    <div className="flex flex-col items-start justify-start">
                                                        <p className="font-medium text-gray-900 text-xs lg:text-sm">{vehicle.vehicleName}</p>
                                                        <p className="text-xs lg:text-sm text-gray-500">{vehicle.vehicleRegistrationNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{vehicle.vehicleChassisNumber}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{vehicle.iotImeiNumber}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">{formatDate(vehicle.createdAt)}</span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                {getVehicleStatusBadge(vehicle)}
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <span className="text-xs lg:text-sm text-gray-900">
                                                    {vehicle.riderId?.name || vehicle.assignedRiderId?.name || 'Not Assigned'}
                                                </span>
                                            </td>
                                            <td className="text-center py-2 lg:py-3 px-2 lg:px-4 border border-[#0000001A]">
                                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">

                                                    {/* assign rider */}
                                                    {vehicle.riderId || vehicle.assignedRiderId ? (
                                                        // Show Unassign button if vehicle is assigned
                                                        <button 
                                                            title='Unassign Rider' 
                                                            type='button'
                                                            className="bg-red-600 p-1 rounded-md px-2 text-xs lg:text-sm text-white hover:bg-red-700 flex items-center gap-2"
                                                            onClick={() => {
                                                                setSelectedVehicleForAssignment(vehicle);
                                                                setAssignModalMode('unassign');
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                        >
                                                            <UserMinus className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                                            Unassign
                                                        </button>
                                                    ) : (
                                                        // Show Assign button if vehicle is not assigned
                                                        <button 
                                                            title='Assign Rider' 
                                                            type='button'
                                                            className="bg-[#0063B0] p-1 rounded-md px-2 text-xs lg:text-sm text-white hover:text-blue-800 flex items-center gap-2"
                                                            onClick={() => {
                                                                setSelectedVehicleForAssignment(vehicle);
                                                                setAssignModalMode('assign');
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                        >
                                                            <UserPlus className="w-3 h-3 lg:w-4 lg:h-4 text-white " />
                                                            Assign
                                                        </button>
                                                    )}

                                                    {/* edit */}
                                                    <button title='Edit' type='button' className="text-xs lg:text-sm text-[#0063B0] hover:text-blue-800 flex items-center gap-2"
                                                        onClick={() => {
                                                            setSelectedVehicle(vehicle);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-3 h-3 lg:w-4 lg:h-4 text-[#0063B0] " />
                                                        Edit
                                                    </button>

                                                    {/* delete */}
                                                    <button
                                                        title={vehicle.riderId || vehicle.assignedRiderId ? 
                                                            'Cannot delete vehicle that is assigned to a rider' : 
                                                            'Delete vehicle'
                                                        }
                                                        type='button'
                                                        onClick={() => handleDeleteVehicle(vehicle._id)}
                                                        className={`${
                                                            vehicle.riderId || vehicle.assignedRiderId 
                                                                ? 'text-gray-400 cursor-not-allowed' 
                                                                : 'text-[#E51E25] hover:text-red-800'
                                                        }`}
                                                        disabled={isDeleting === vehicle._id || !!(vehicle.riderId || vehicle.assignedRiderId)}
                                                    >
                                                        {isDeleting === vehicle._id ? (
                                                            <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!isLoading && vehicles.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bike className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles found</h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first Vehicle.'}
                                    </p>
                                    {!searchTerm && !statusFilter && (
                                        <button
                                            type='button'
                                            title='Add Vehicle'
                                            onClick={() => setIsModalOpen(true)}
                                            className="bg-[#0063B0] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add Vehicle
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalVehicles}
                            itemsPerPage={10}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                        />
                    </div>
                </main>
            </div>

            {/* Add New Vehicle Modal */}
            <AddVehicle isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            <AssignVehicle 
                isModalOpen={isAssignModalOpen} 
                setIsModalOpen={setIsAssignModalOpen} 
                vehicle={selectedVehicleForAssignment}
                onVehicleAssigned={handleVehicleAssigned}
                onVehicleUnassigned={handleVehicleUnassigned}
                mode={assignModalMode}
            />
            <EditVehicle 
                isModalOpen={isEditModalOpen} 
                setIsModalOpen={setIsEditModalOpen} 
                vehicle={selectedVehicle}
                onVehicleUpdated={handleVehicleUpdated}
            />
        </div>
    )
}

export default VehicleInventory