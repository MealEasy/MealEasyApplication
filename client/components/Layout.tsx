import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  return (
    <div className="layout-body flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-grow justify-center">
        <div className="max-w-screen-2xl px-4">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}
