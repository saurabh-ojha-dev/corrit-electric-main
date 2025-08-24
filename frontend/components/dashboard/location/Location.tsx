'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Mail, Phone, Trash2, CheckCircle, XCircle, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient, API_ENDPOINTS } from '@/utils/api'
import HoverView from './HoverView'
import TransitView from './TransitView'

const Location = () => {
    const [activeView, setActiveView] = useState<'transit' | 'hover'>('transit');

    return (
        <div className="flex h-full bg-[#F8F8F8] ml-2 lg:ml-5 w-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-y-auto gap-4 lg:gap-6 p-3 lg:p-6">

                    {/* Heading */}
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-xl lg:text-2xl font-semibold text-black border-b-2 border-[#E51E25] pb-1">Location</h1>
                        <p className="text-sm lg:text-lg font-normal text-black">Track current location of riders in real time</p>
                    </div>

                    <ToggleView activeView={activeView} setActiveView={setActiveView} />
                    
                    {/* Display the active component */}
                    {activeView === 'transit' ? <TransitView /> : <HoverView />}
                </main>
            </div>
        </div>
    )
}

export default Location

function ToggleView({ activeView, setActiveView }: { activeView: 'transit' | 'hover', setActiveView: (view: 'transit' | 'hover') => void }) {

    return (
        <div className='bg-white rounded-xl p-2 flex items-center gap-4 w-full sm:w-1/4 justify-center'>
            <button
                type='button'
                onClick={() => setActiveView('transit')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto ${
                    activeView === 'transit' 
                        ? 'bg-[#0063B0] text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                Transit View
            </button>
            <button
                type='button'
                onClick={() => setActiveView('hover')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto ${
                    activeView === 'hover' 
                        ? 'bg-[#0063B0] text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                Hover View
            </button>
        </div>
    )

}