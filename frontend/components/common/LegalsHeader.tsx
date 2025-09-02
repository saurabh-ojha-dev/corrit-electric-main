import React from 'react'

const LegalsHeader = ({ title, description, color }: { title: string, description: string, color: string }) => {

    const Badge = ({ label }: { label: string }) => (
        <span className="inline-flex items-center rounded-lg border border-white px-2.5 py-1 text-xs font-medium text-white">
            {label}
        </span>
    );

    return (
        <div className={`w-full py-4 px-4 ${color} rounded-xl`}>
            <div className="mx-auto max-w-5xl text-center">
                <div className="flex justify-end">
                    <Badge label="Last updated: 8/2/2025" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                    {title}
                </h1>
                <p className="text-white/90 text-lg max-w-2xl mx-auto">
                    {description}
                </p>
            </div>
        </div>
    )
}

export default LegalsHeader