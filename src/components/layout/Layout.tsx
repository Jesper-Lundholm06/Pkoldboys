import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between bg-primary px-4 py-3 md:hidden">
        <span className="text-lg font-bold text-white">PK Oldboys Bowling</span>
        <button
          type="button"
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
          onClick={() => setIsSidebarOpen((open) => !open)}
          className="min-h-11 rounded-md border-2 border-white/50 px-4 py-2 text-lg font-semibold text-white transition-colors hover:bg-white/10"
        >
          {isSidebarOpen ? 'Stäng meny' : 'Meny'}
        </button>
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />

        <main className="flex-1 px-6 py-8 md:px-10">
          <div className="mx-auto w-full max-w-[1080px] text-left">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
