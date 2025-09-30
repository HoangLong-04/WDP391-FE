import NavBar from '../components/navBar/NavBar'
import { Outlet } from 'react-router'

function AuthenLayout() {
  return (
    <div>
        <header className='fixed top-0 right-0 left-0'>
            <NavBar />
        </header>
        <main>
            <Outlet />
        </main>
    </div>
  )
}

export default AuthenLayout