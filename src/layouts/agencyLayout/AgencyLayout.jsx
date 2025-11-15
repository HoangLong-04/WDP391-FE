import React from 'react'
import SharedSidebar from '../../components/sidebar/SharedSidebar'
import { Outlet } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

function AgencyLayout() {
  const {user} = useAuth()
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 left-0 h-screen">
        <SharedSidebar />
      </aside>

      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className='text-4xl font-medium mb-6'>{user?.role[0]}</div>
        <Outlet />
      </main>
    </div>
  )
}

export default AgencyLayout