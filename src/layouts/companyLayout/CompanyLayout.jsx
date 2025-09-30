import React from 'react'
import CompanySidebar from './CompanySidebar'
import { Outlet } from 'react-router'

function CompanyLayout() {
  return (
    <div className="flex">
      <aside className="sticky top-0 left-0 w-[250px] h-screen">
        <CompanySidebar />
      </aside>

      <main className="flex-1 bg-gray-50 p-6">
        <div className='text-4xl font-medium'>Admin</div>
        <Outlet />
      </main>
    </div>
  )
}

export default CompanyLayout