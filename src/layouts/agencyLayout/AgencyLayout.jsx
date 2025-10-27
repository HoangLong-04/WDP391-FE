import React from 'react'
import AgencySidebar from './AgencySidebar'
import { Outlet } from 'react-router'

function AgencyLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 left-0 h-screen">
        <AgencySidebar />
      </aside>

      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className='text-4xl font-medium mb-6'>Agency</div>
        <Outlet />
      </main>
    </div>
  )
}

export default AgencyLayout