import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { cn } from '@/lib/utils';

export default function Navbar({ activeTab = '' }) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { getTodayStatus } = useAttendanceStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isAdmin = user?.role === 'HR' || user?.role === 'Admin';
    const todayStatus = getTodayStatus();
    const isCheckedIn = !!todayStatus?.checkIn;
    const hasCheckedOut = !!todayStatus?.checkOut;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleNavigation = (tab) => {
        const routes = {
            'Dashboard': isAdmin ? '/admin/dashboard' : '/dashboard',
            'Employees': '/employees',
            'Attendance': '/attendance',
            'Time Off': '/leaves',
            'Payroll': '/payroll'
        };
        navigate(routes[tab] || '/');
        setIsProfileOpen(false);
    };

    // Navigation items based on role
    const navItems = isAdmin 
        ? ['Dashboard', 'Employees', 'Attendance', 'Time Off', 'Payroll']
        : ['Dashboard', 'Attendance', 'Time Off'];

    // Status dot color based on role and check-in status
    const getStatusDotColor = () => {
        if (isAdmin) return 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.6)]';
        return isCheckedIn && !hasCheckedOut 
            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
            : 'bg-red-500';
    };

    return (
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-50 shadow-sm">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-8">
                <div 
                    onClick={() => handleNavigation('Dashboard')}
                    className="text-xl font-bold tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
                >
                    DayFlow
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                        <button
                            key={item}
                            onClick={() => handleNavigation(item)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                activeTab === item
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right: Status & Profile */}
            <div className="flex items-center gap-4">
                {/* Role Badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <div className={cn('h-2.5 w-2.5 rounded-full', getStatusDotColor())} />
                    <span className="text-xs font-medium text-gray-700">
                        {isAdmin ? 'Admin' : 'Employee'}
                    </span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                    >
                        <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium hidden lg:block">{user?.name}</span>
                        <ChevronDown className={cn(
                            'h-4 w-4 text-gray-500 transition-transform duration-200',
                            isProfileOpen && 'rotate-180'
                        )} />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">ID: {user?.employeeId}</p>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        handleNavigation('Dashboard');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                >
                                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        navigate('/employee/me');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                >
                                    <User className="h-4 w-4" /> My Profile
                                </button>
                                
                                <div className="h-px bg-gray-100 my-1" />
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                >
                                    <LogOut className="h-4 w-4" /> Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
