import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Stethoscope, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  Settings 
} from 'lucide-react'

export default function Navbar() {
    const navigator = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // --- YOUR ORIGINAL LOGIC PRESERVED ---
    
    // Get current role safely for display logic
    const role = localStorage.getItem('role') || 'guest';
    const isLoggedIn = !!localStorage.getItem('token');

    const information = () => {
        if (localStorage.getItem('token')) {
            navigator("/Info")
            setIsMobileMenuOpen(false) // Close mobile menu on click
        }
    }

    const navigation = () => {
        if (!localStorage.getItem('token')) {
            navigator("/Home")
        } else {
            let x = localStorage.getItem('role')?.toLowerCase()
            if (x === 'doctor') {
                navigator("/Docdes");
            }
            else if (x === 'admin') {
                localStorage.setItem('fetch', 'assignments')
                navigator("/Admindes")
            }
            else if (x === 'patient') {
                navigator("/Patides")
            }
            else if (x === 'lab_assistant') {
                navigator("/Labentry")
            }
            else {
                console.log("error in login")
            }
        }
        setIsMobileMenuOpen(false)
    }

    const logout = () => {
        localStorage.clear()
        // Logic from your original code: usually navigates to Home
        if (!localStorage.getItem('token')) {
             navigator("/Home")
        }
        setIsMobileMenuOpen(false)
    }
    // --- END ORIGINAL LOGIC ---

    // Helper for display name (Capitalize first letter)
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* LEFT: Logo and Title */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer" 
                        onClick={navigation}
                    >
                        <div className="w-10 h-10 bg-[#0284C7] rounded-xl flex items-center justify-center shadow-blue-200 shadow-lg">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Smart Health</h1>
                            <p className="text-xs text-blue-600 font-medium">{isLoggedIn ? displayRole : 'Healthcare System'}</p>
                        </div>
                    </div>

                    {/* CENTER: Navigation - Desktop Only */}
                    {isLoggedIn && (
                        <div className="hidden lg:flex items-center gap-1">
                            <button 
                                onClick={navigation}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-[#0284C7] hover:bg-blue-100 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="text-sm font-medium">Dashboard</span>
                            </button>
                            
                            {/* Profile Link (Your 'information' function) */}
                            <button 
                                onClick={information}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">Profile</span>
                            </button>

                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-medium">Settings</span>
                            </button>
                        </div>
                    )}

                    {/* RIGHT: Actions & Profile */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                {/* Notification Bell */}
                                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                </button>

                                {/* Desktop Profile Section */}
                                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                                    <div className="text-right cursor-pointer" onClick={information}>
                                        <p className="text-sm font-bold text-gray-900">
                                            {displayRole} User
                                        </p>
                                        <p className="text-xs text-gray-500">View Profile</p>
                                    </div>
                                    <div 
                                        className="w-10 h-10 bg-[#0284C7] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                        onClick={information}
                                    >
                                        {role.substring(0,2).toUpperCase()}
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={logout}
                                    className="hidden md:flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg ml-2 transition-colors border border-transparent hover:border-red-100"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => navigator("/Login")}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Login
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {isLoggedIn ? (
                            <>
                                <button 
                                    onClick={navigation}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Dashboard
                                </button>
                                <button 
                                    onClick={information}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                >
                                    <User className="w-5 h-5" />
                                    My Profile
                                </button>
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => { navigator("/Login"); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                            >
                                <User className="w-5 h-5" />
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}