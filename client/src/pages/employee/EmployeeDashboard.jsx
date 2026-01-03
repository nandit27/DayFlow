import { useState } from 'react';
import { Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Data
const EMPLOYEES = Array(12).fill(null).map((_, i) => {
    let name = `Employee ${i + 1}`;
    if (i === 0) name = "Jay Patel";
    if (i === 5) name = "Sarah Conner";

    return {
        id: i === 0 ? '1' : (i + 1).toString(), // Ensure ID is string for routing consistency
        name: name,
        status: i % 3 === 0 ? 'online' : 'offline',
    };
});

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);

    const [userRole, setUserRole] = useState('admin'); // 'admin' or 'employee'

    const handleNavigation = (tab) => {
        if (tab === 'Attendance') {
            navigate('/attendance');
        } else if (tab === 'Employees') {
            navigate('/employee');
        } else if (tab === 'Time Off') {
            // For now, route to attendance as time off is there
            navigate('/attendance');
        }
    };

    const handleCheckIn = () => {
        setIsCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const handleCheckOut = () => {
        setIsCheckedIn(false);
        setCheckInTime(null);
    };

    // Determine status dot color
    const getStatusDotColor = () => {
        if (userRole === 'admin') return 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]';
        return isCheckedIn ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* Top Navigation Bar */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="text-xl font-bold tracking-tight">Company Logo</div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-4">
                        {['Employees', 'Attendance', 'Time Off'].map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigation(item)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${item === 'Employees'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Side: Profile & Actions */}
                <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full transition-colors duration-300 ${getStatusDotColor()}`} />

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                                JE
                            </div>
                            <ChevronDown className={`h-4 w-4 text-gray-500 duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                <button
                                    onClick={() => { navigate('/employee/me'); setIsProfileOpen(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                >
                                    <User className="h-4 w-4" /> My Profile
                                </button>
                                <div className="h-px bg-gray-100 my-1" />
                                {/* Role Toggle for Demo */}
                                <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold tracking-wider">
                                    Simulate Role
                                </div>
                                <button
                                    onClick={() => setUserRole('admin')}
                                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left ${userRole === 'admin' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-600'}`}
                                >
                                    Admin
                                </button>
                                <button
                                    onClick={() => setUserRole('employee')}
                                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left ${userRole === 'employee' ? 'text-green-600 font-medium bg-green-50' : 'text-gray-600'}`}
                                >
                                    Employee
                                </button>
                                <div className="h-px bg-gray-100 my-1" />
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                    <LogOut className="h-4 w-4" /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">

                {/* Left: Employee Grid */}
                <div className="flex-1 space-y-6">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        {userRole === 'admin' && (
                            <button
                                onClick={() => navigate('/employee/new')}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-sm font-semibold border border-purple-200 hover:bg-purple-200 transition-colors"
                            >
                                NEW
                            </button>
                        )}

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Employee Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {EMPLOYEES.map((emp) => (
                            <div
                                key={emp.id}
                                onClick={() => navigate(`/employee/${emp.id}`)}
                                className="group relative bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer hover:border-blue-400"
                            >
                                <div className={`absolute top-4 right-4 h-3 w-3 rounded-full border border-white ${emp.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />

                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                                        <p className="text-xs text-gray-500">Employee</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Check-In/Out Widget */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Daily Action</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCheckIn}
                                    disabled={isCheckedIn}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isCheckedIn
                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700'
                                        }`}
                                >
                                    <span className="font-medium">Check IN</span>
                                </button>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="text-xs text-gray-500">
                                        {isCheckedIn ? `Checked in at ${checkInTime}` : 'Not checked in yet'}
                                    </div>
                                    <button
                                        onClick={handleCheckOut}
                                        disabled={!isCheckedIn}
                                        className={`w-full flex items-center justify-between p-2 rounded-md font-medium text-sm transition-colors ${!isCheckedIn
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        Check Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    JE
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Jenil07</h4>
                                    <p onClick={() => navigate('/employee/me')} className="text-xs text-blue-600 hover:underline cursor-pointer">View Profile</p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Status</span>
                                    <span className="text-green-600 font-medium">Active</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Role</span>
                                    <span className="text-gray-900 capitalize">{userRole}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
