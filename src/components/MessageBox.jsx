import Messages from '@/pages/providers/Messages'
import React from 'react'

export default function MessageBox() {
  return (
    <div className=' '>
     <main className='h-screen bg-gradient-to-br w-full from-black via-gray-900 to-black font-sans'> 
          <div className='mt-12'>
             <Messages/>
    
          </div>
     </main>
    </div>
  )
}
