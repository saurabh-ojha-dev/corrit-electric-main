import Image from 'next/image'
import React from 'react'

const TransitView = () => {
  return (
    <div className='bg-white rounded-xl p-2 flex items-center gap-4 w-full h-full justify-center'>
        <Image src='/transit.png' alt='transit-view' width={400} height={100} className='w-full h-full object-cover' />
    </div>
  )
}

export default TransitView