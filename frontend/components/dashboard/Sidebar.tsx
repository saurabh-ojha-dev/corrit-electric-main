'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
  RefreshCcw,
  Map,
  Menu,
  X,
  Locate,
  Bike
} from 'lucide-react'
import { useAdminProfile } from '@/hooks/useAdminProfile'

interface SidebarProps {
  activePage?: string
}

interface NavigationItem {
  id: string
  label: string
  icon: any
  href: string
  hasSubmenu: boolean
  submenu?: Array<{
    id: string
    label: string
    href: string
  }>
}

export default function Sidebar({ activePage = 'dashboard' }: SidebarProps) {
  const router = useRouter()
  const { getFirstLetter, profile } = useAdminProfile()
  const [isLegalsExpanded, setIsLegalsExpanded] = useState(false)
  const [isMappingExpanded, setIsMappingExpanded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminProfile')
    router.push('/admin/auth/login')
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      hasSubmenu: false
    },
    {
      id: 'rideronboarding',
      label: 'Rider Onboarding',
      icon: Users,
      href: '/admin/dashboard/rider-onboarding',
      hasSubmenu: false
    },
    {
      id: 'riders',
      label: 'Riders',
      icon: Users,
      href: '/admin/dashboard/riders',
      hasSubmenu: false
    },
    {
      id: 'vehicle-inventory',
      label: 'Vehicle Inventory',
      icon: Bike,
      href: '/admin/dashboard/vehicle-inventory',
      hasSubmenu: false
    },
    {
      id: 'location',
      label: 'Location',
      icon: Locate,
      href: '/admin/dashboard/location',
      hasSubmenu: false
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      href: '/admin/dashboard/payments',
      hasSubmenu: false
    },
    {
      id: 'legals',
      label: 'Legals',
      icon: FileText,
      href: '/legals',
      hasSubmenu: true,
      submenu: [
        {
          id: 'privacy-policy',
          label: 'Privacy and Policy',
          href: '/legals/privacy-policy'
        },
        {
          id: 'terms-conditions',
          label: 'Terms and Conditions',
          href: '/legals/terms-conditions'
        },
        {
          id: 'refund-policy',
          label: 'Refund Policy',
          href: '/legals/refund-policy'
        }
      ]
    },
    // Only show Admins option for Superadmin users
    ...(profile?.role === 'Superadmin' ? [{
      id: 'admins',
      label: 'Admins',
      icon: Shield,
      href: '/admin/dashboard/management',
      hasSubmenu: false
    }] : [])
  ]

  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      <div className="p-3 lg:p-4 xl:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm lg:text-base xl:text-lg font-medium">{getFirstLetter()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-black font-light text-xs lg:text-sm">Hello</span>
            <span className="text-black font-semibold text-xs lg:text-sm xl:text-lg">
              {profile?.username ? `Mr. ${profile.username}` : 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto m-2 lg:m-3 xl:m-4 flex flex-col gap-2 lg:gap-3 xl:gap-4">
        {navigationItems.map((item: NavigationItem) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          const isExpanded = item.id === 'legals' ? isLegalsExpanded :
            item.id === 'mapping' ? isMappingExpanded : false

          return (
            <div key={item.id}>
              <div
                className={`flex items-center justify-between px-1 lg:px-2 py-1.5 lg:py-2 cursor-pointer transition-colors ${isActive
                  ? 'bg-gray-100 border-b-2 border-[#E51E25] rounded-lg lg:rounded-xl'
                  : 'hover:bg-gray-50'
                  }`}
                onClick={() => {
                  if (item.hasSubmenu) {
                    if (item.id === 'legals') {
                      setIsLegalsExpanded(!isLegalsExpanded)
                    } else if (item.id === 'mapping') {
                      setIsMappingExpanded(!isMappingExpanded)
                    }
                  } else {
                    router.push(item.href)
                    setIsMobileMenuOpen(false)
                  }
                }}
              >
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <Icon
                    className={`w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-black`}
                  />
                  <span
                    className={`font-medium text-black text-xs lg:text-sm xl:text-base`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.hasSubmenu && (
                  <ChevronRight
                    className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-black transition-transform ${isExpanded ? 'rotate-90' : ''
                      }`}
                  />
                )}
              </div>

              {/* Submenu for Mapping */}
              {item.hasSubmenu && item.id === 'mapping' && isMappingExpanded && item.submenu && (
                <div className="ml-1 lg:ml-2 xl:ml-4 p-1 lg:p-2 xl:p-4 border-t border-gray-200">
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`pl-3 lg:pl-4 xl:pl-6 py-1.5 lg:py-2 text-xs lg:text-sm text-black hover:bg-gray-50 cursor-pointer flex items-center space-x-2 lg:space-x-3 ${activePage === subItem.id
                        ? 'bg-gray-100 border-b-2 border-[#E51E25] rounded-lg lg:rounded-xl'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => {
                        router.push(subItem.href)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Map className="w-2.5 h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                      <span>{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submenu for Legals */}
              {item.hasSubmenu && item.id === 'legals' && isLegalsExpanded && (
                <div className="p-1 lg:p-2 xl:p-4 border-t border-gray-200">
                  <div
                    className={`pl-3 lg:pl-4 xl:pl-6 py-1.5 lg:py-2 text-xs lg:text-sm text-black hover:bg-gray-50 cursor-pointer flex items-center space-x-2 lg:space-x-3 ${activePage === 'privacy-policy'
                      ? 'bg-gray-100 border-b-2 border-[#E51E25] rounded-lg lg:rounded-xl'
                      : 'hover:bg-gray-50'
                      }`}
                    onClick={() => {
                      router.push('/legals/privacy-policy')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Shield className="w-2.5 h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                    <span>Privacy and Policy</span>
                  </div>
                  <div
                    className={`pl-3 lg:pl-4 xl:pl-6 py-1.5 lg:py-2 text-xs lg:text-sm text-black hover:bg-gray-50 cursor-pointer flex items-center space-x-2 lg:space-x-3 ${activePage === 'terms-conditions'
                      ? 'bg-gray-100 border-b-2 border-[#E51E25] rounded-lg lg:rounded-xl'
                      : 'hover:bg-gray-50'
                      }`}
                    onClick={() => {
                      router.push('/legals/terms-conditions')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <FileText className="w-2.5 h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                    <span>Terms and Conditions</span>
                  </div>
                  <div
                    className={`pl-3 lg:pl-4 xl:pl-6 py-1.5 lg:py-2 text-xs lg:text-sm text-black hover:bg-gray-50 cursor-pointer flex items-center space-x-2 lg:space-x-3 ${activePage === 'refund-policy'
                      ? 'bg-gray-100 border-b-2 border-[#E51E25] rounded-lg lg:rounded-xl'
                      : 'hover:bg-gray-50'
                      }`}
                    onClick={() => {
                      router.push('/legals/refund-policy')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <RefreshCcw className="w-2.5 h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 rotate-90" />
                    <span>Refund Policy</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Logout */}
        <div className="flex-shrink-0">
          <div
            className="flex items-center space-x-2 lg:space-x-3 px-1 lg:px-2 py-2 lg:py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              handleLogout()
              setIsMobileMenuOpen(false)
            }}
          >
            <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-black" />
            <span className="font-medium text-black text-xs lg:text-sm xl:text-base">Logout</span>
          </div>
        </div>
      </nav>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 lg:p-2 bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
          ) : (
            <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-40
        w-56 lg:w-64 xl:w-72 bg-[#FFFEFE] shadow-sm border-r border-[#E4E4E7]
        transform transition-transform duration-300 ease-in-out rounded-lg lg:rounded-xl
        flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </div>
    </>
  )
}