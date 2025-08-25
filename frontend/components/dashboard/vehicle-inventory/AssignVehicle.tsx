'use client'
import React, { useEffect, useRef, useState } from 'react'
import { X, Shield, Bike, User2, Loader2, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient, API_ENDPOINTS } from '@/utils/api'

interface Rider {
    _id: string;
    name: string;
    riderId: string;
    email: string;
    phone: string;
}

interface AssignVehicleProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    vehicle: any; // Selected vehicle object
    onVehicleAssigned?: () => void;
    onVehicleUnassigned?: () => void;
    mode: 'assign' | 'unassign'; // New prop to determine mode
}

const AssignVehicle: React.FC<AssignVehicleProps> = ({ 
    isModalOpen, 
    setIsModalOpen, 
    vehicle, 
    onVehicleAssigned,
    onVehicleUnassigned,
    mode 
}) => {
    const [formData, setFormData] = useState({
        riderId: '',
    });
    const [riders, setRiders] = useState<Rider[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    // Fetch available riders when modal opens (only for assign mode)
    useEffect(() => {
        if (isModalOpen && mode === 'assign') {
            fetchAvailableRiders();
        }
    }, [isModalOpen, mode]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    // Fetch available riders (not currently assigned to any vehicle)
    const fetchAvailableRiders = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.RIDERS.LIST);
            
            if (response.data.success) {
                // Filter out riders who are already assigned to vehicles
                const allRiders = response.data.riders || [];
                const availableRiders = allRiders.filter((rider: Rider) => {
                    // For now, we'll show all riders. In a real scenario, you might want to check
                    // if they're already assigned to another vehicle
                    return true;
                });
                setRiders(availableRiders);
            } else {
                toast.error('Failed to fetch riders');
            }
        } catch (error: any) {
            console.error('Error fetching riders:', error);
            toast.error('Failed to fetch riders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vehicle?._id) {
            toast.error('Vehicle not selected');
            return;
        }

        if (mode === 'assign' && !formData.riderId) {
            toast.error('Please select a rider');
            return;
        }

        try {
            setIsSubmitting(true);
            
            if (mode === 'assign') {
                console.log("assigning vehicle", vehicle._id, "to rider", formData.riderId);
                
                // Use the assign endpoint
                const response = await apiClient.post(API_ENDPOINTS.VEHICLES.ASSIGN(vehicle._id), {
                    riderId: formData.riderId
                });
                console.log("assignment response", response);

                if (response.data.success) {
                    toast.success('Vehicle assigned successfully!');
                    setIsModalOpen(false);
                    
                    // Trigger callback to refresh the vehicle list
                    if (onVehicleAssigned) {
                        onVehicleAssigned();
                    }
                    
                    // Dispatch custom event for other components to listen
                    window.dispatchEvent(new CustomEvent('vehicleAssigned'));
                } else {
                    toast.error(response.data.message || 'Failed to assign vehicle');
                }
            } else {
                // Unassign mode
                console.log("unassigning vehicle", vehicle._id);
                
                // Use the unassign endpoint
                const response = await apiClient.post(API_ENDPOINTS.VEHICLES.UNASSIGN(vehicle._id));
                console.log("unassignment response", response);

                if (response.data.success) {
                    toast.success('Vehicle unassigned successfully!');
                    setIsModalOpen(false);
                    
                    // Trigger callback to refresh the vehicle list
                    if (onVehicleUnassigned) {
                        onVehicleUnassigned();
                    }
                    
                    // Dispatch custom event for other components to listen
                    window.dispatchEvent(new CustomEvent('vehicleUnassigned'));
                } else {
                    toast.error(response.data.message || 'Failed to unassign vehicle');
                }
            }
        } catch (error: any) {
            console.error(`Error ${mode === 'assign' ? 'assigning' : 'unassigning'} vehicle:`, error);
            const errorMessage = error.response?.data?.message || `Failed to ${mode === 'assign' ? 'assign' : 'unassign'} vehicle`;
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            riderId: '',
        });
        setIsSubmitting(false);
    };

    // Don't render the modal if it's not open
    if (!isModalOpen) {
        return null;
    }

    const isAssigned = vehicle?.riderId || vehicle?.assignedRiderId;
    const assignedRiderName = vehicle?.riderId?.name || vehicle?.assignedRiderId?.name;

    return (
        <div className="fixed inset-0 bg-[#000000C2] flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4 lg:mb-6">
                    <div className="flex justify-start items-start gap-3 lg:gap-4">
                        <div className="p-2 rounded-xl bg-black">
                            <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-semibold text-black">
                                {mode === 'assign' ? 'Assign Rider' : 'Unassign Rider'}
                            </h2>
                            <p className="text-xs lg:text-sm text-gray-600">
                                {mode === 'assign' ? 'Assign a vehicle to a rider.' : 'Remove the current rider assignment.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type='button'
                        title='close-modal'
                        onClick={closeModal}
                        className="text-white bg-black rounded-full p-1.5 lg:p-2 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                        <X className="w-3 h-3 lg:w-4 lg:h-4" color='white' />
                    </button>
                </div>

                {/* Vehicle Information */}
                {vehicle && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Vehicle Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="font-medium">Name:</span> {vehicle.vehicleName}
                            </div>
                            <div>
                                <span className="font-medium">Registration:</span> {vehicle.vehicleRegistrationNumber}
                            </div>
                            <div>
                                <span className="font-medium">Chassis:</span> {vehicle.vehicleChassisNumber}
                            </div>
                            <div>
                                <span className="font-medium">Tracker ID:</span> {vehicle.iotImeiNumber}
                            </div>
                            {isAssigned && (
                                <div className="md:col-span-2">
                                    <span className="font-medium">Currently Assigned to:</span> {assignedRiderName}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                    {/* Input Fields - Only show for assign mode */}
                    {mode === 'assign' && (
                        <div className="grid grid-cols-1 gap-3 lg:gap-4">
                            <div>
                                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Select Rider</label>
                                <div className="relative">
                                    <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-black" />
                                    {isLoading ? (
                                        <div className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                            <span className="ml-2 text-sm text-gray-500">Loading riders...</span>
                                        </div>
                                    ) : (
                                        <select
                                            title='rider'
                                            name="riderId"
                                            value={formData.riderId}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-white"
                                            required
                                        >
                                            <option value="">Select a rider</option>
                                            {riders.map((rider) => (
                                                <option key={rider._id} value={rider._id}>
                                                    {rider.name} ({rider.riderId}) - {rider.phone}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                {riders.length === 0 && !isLoading && (
                                    <p className="text-xs text-red-500 mt-1">No available riders found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Confirmation message for unassign mode */}
                    {mode === 'unassign' && isAssigned && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                Are you sure you want to unassign <strong>{assignedRiderName}</strong> from this vehicle?
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || (mode === 'assign' && (isLoading || riders.length === 0))}
                            className={`flex-1 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                                mode === 'assign' 
                                    ? 'bg-[#0063B0] text-white hover:bg-blue-700' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                                    <span>{mode === 'assign' ? 'Assigning...' : 'Unassigning...'}</span>
                                </>
                            ) : (
                                <>
                                    {mode === 'assign' ? (
                                        <>
                                            <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span className="whitespace-nowrap">Assign Vehicle</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserMinus className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span className="whitespace-nowrap">Unassign Vehicle</span>
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#D7D7D7] text-black px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AssignVehicle