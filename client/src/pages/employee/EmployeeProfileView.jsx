import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, User, LogOut, Loader2, Edit2, Save, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function EmployeeProfileView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, logout } = useAuthStore();
    const { myProfile, isLoading, isUpdating, fetchMyProfile, updateMyProfile } = useProfileStore();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Resume');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        emergencyContact: '',
        dateOfBirth: '',
        gender: '',
    });

    // Fetch profile on mount
    useEffect(() => {
        fetchMyProfile();
    }, [fetchMyProfile]);

    // Update form data when profile loads
    useEffect(() => {
        if (myProfile) {
            setFormData({
                address: myProfile.address || '',
                emergencyContact: myProfile.emergencyContact || '',
                dateOfBirth: myProfile.dateOfBirth ? format(new Date(myProfile.dateOfBirth), 'yyyy-MM-dd') : '',
                gender: myProfile.gender || '',
            });
        }
    }, [myProfile]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        const updates = {
            ...formData,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        };

        const result = await updateMyProfile(updates);
        if (result.success) {
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to current profile data
        if (myProfile) {
            setFormData({
                address: myProfile.address || '',
                emergencyContact: myProfile.emergencyContact || '',
                dateOfBirth: myProfile.dateOfBirth ? format(new Date(myProfile.dateOfBirth), 'yyyy-MM-dd') : '',
                gender: myProfile.gender || '',
            });
        }
        setIsEditing(false);
    };

    const handleNavigation = (tab) => {
        if (tab === 'Attendance') {
            navigate('/attendance');
        } else if (tab === 'Employees') {
            navigate('/employee');
        } else if (tab === 'Time Off') {
            navigate('/attendance');
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* Top Navigation Bar */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="text-xl font-bold tracking-tight">DayFlow</div>

                    <nav className="hidden md:flex items-center gap-4">
                        {['Employees', 'Attendance', 'Time Off'].map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigation(item)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    item === 'Employees'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm font-medium">{user?.name}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-500 duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                <button 
                                    onClick={() => navigate('/employee/me')}
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
                        )}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="max-w-7xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Info Grid */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-200">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-200 relative">
                                <span className="text-4xl text-blue-600 font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                                <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="mt-2 text-center">
                                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {user?.role || 'Employee'}
                                </span>
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-3xl font-serif text-gray-900 italic border-b border-gray-300 pb-1 mb-4">
                                        {user?.name || 'N/A'}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm">Employee ID</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{user?.employeeId || 'N/A'}</span>

                                    <span className="text-gray-500 text-sm">Email</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{user?.email || 'N/A'}</span>

                                    <span className="text-gray-500 text-sm">Phone</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{user?.phone || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 md:pt-0">
                                <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm">Company</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{user?.companyName || 'N/A'}</span>

                                    <span className="text-gray-500 text-sm">Department</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{myProfile?.department || 'Not set'}</span>

                                    <span className="text-gray-500 text-sm">Designation</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{myProfile?.designation || 'Not set'}</span>

                                    <span className="text-gray-500 text-sm">Joining Date</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">
                                        {myProfile?.joiningDate ? format(new Date(myProfile.joiningDate), 'MMM dd, yyyy') : 'Not set'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <div className="flex gap-8">
                            {['Personal Info', 'Job Details'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Personal Info Tab */}
                    {activeTab === 'Personal Info' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2 border-b border-gray-200">
                                                {myProfile?.dateOfBirth ? format(new Date(myProfile.dateOfBirth), 'MMM dd, yyyy') : 'Not set'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 py-2 border-b border-gray-200">
                                                {myProfile?.gender || 'Not set'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter your address"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2 border-b border-gray-200">
                                                {myProfile?.address || 'Not set'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Emergency Contact
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.emergencyContact}
                                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Emergency contact number"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2 border-b border-gray-200">
                                                {myProfile?.emergencyContact || 'Not set'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Job Details Tab */}
                    {activeTab === 'Job Details' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <p className="text-gray-900 py-2 border-b border-gray-200">
                                            {myProfile?.department || 'Not set'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Contact HR to update</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                                        <p className="text-gray-900 py-2 border-b border-gray-200">
                                            {myProfile?.designation || 'Not set'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Contact HR to update</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                                        <p className="text-gray-900 py-2 border-b border-gray-200">
                                            {myProfile?.employmentType || 'Not set'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                                        <p className="text-gray-900 py-2 border-b border-gray-200">
                                            {myProfile?.joiningDate ? format(new Date(myProfile.joiningDate), 'MMM dd, yyyy') : 'Not set'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
