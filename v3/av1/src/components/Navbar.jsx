import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {

  

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    closeMenu()
  }, [location])

  const user = null // Replace with actual auth state

  const navLinks = [
    { to: '/', label: '💱 Converter' },
    { to: '/trade', label: 'Trade' },
    { to: '/about', label: 'About' },
    { to: '/portfolio', label: '💼 Portfolio' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
    { to: '/signup', label: '💰 Get Started' },
    { to: '/history', label: '📊 History' },
    { to: '/signin', label: user ? 'Dashboard' : '🚀 Sign In' },
  ]

  return (
    <nav className={`bg-blue-950 sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-2xl shadow-black/30' : 'shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="text-white text-xl md:text-2xl font-bold hover:text-gray-300 transition-colors flex items-center gap-2" onClick={closeMenu}>
            <span>💱</span>
            <span className="hidden sm:inline">ASAP Currency</span>
            <span className="sm:hidden">ASAP</span>
          </Link>

          <div className="hidden md:flex items-center gap-x-1 lg:gap-x-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm lg:text-base transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none hover:text-gray-300 transition-colors p-2"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-1 pb-4 border-t border-blue-800">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-3 px-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-blue-900'
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}