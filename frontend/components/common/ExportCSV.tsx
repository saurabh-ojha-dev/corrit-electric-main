import { Download } from 'lucide-react'

const ExportCSV = ({ handleExportCSV, isExporting }: { handleExportCSV: () => void, isExporting: boolean }) => {
    return (
        <button
            type='button'
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-black text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-between items-center gap-2 text-sm lg:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isExporting ? (
                <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <Download className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
    )
}

export default ExportCSV