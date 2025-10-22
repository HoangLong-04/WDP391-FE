import React from 'react'
import AgencySidebar from './AgencySidebar'
import { Outlet } from 'react-router'

function AgencyLayout() {
  return (
    <div className="flex">
      <aside className="sticky top-0 left-0 w-[250px] h-screen">
        <AgencySidebar />
      </aside>

      <main className="flex-1 bg-gray-50 p-6">
        <div className='text-4xl font-medium'>Agency</div>
        <Outlet />
      </main>
    </div>
  )
}

export default AgencyLayout