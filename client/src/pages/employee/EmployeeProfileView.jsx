import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronDown,
    User,
    LogOut,
    Search,
    MapPin,
    Building,
    Mail,
    Phone,
    Calendar,
    Edit2,
    Save,
    X,
    Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { format } from 'date-fns';

export default function EmployeeProfileView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, logout } = useAuthStore();
    const { myProfile, isLoading, isUpdating, fetchMyProfile, updateMyProfile } = useProfileStore();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Resume');
    const [isEditing, setIsEditing] = useState(false);

    // Simulated Role for Demo (can be synced with user.role later)
    const isAdmin = user?.role === 'Admin' || user?.role === 'HR';
    const isOwnProfile = id === 'me' || (user && id === user._id);
    const isNewEmployee = id === 'new';

    // Salary Input
    const [monthWage, setMonthWage] = useState(50000);

    // Salary Calculations
    const salaryComponents = useMemo(() => {
        const annualWage = monthWage * 12;
        const basic = monthWage * 0.50; // 50%
        const hra = basic * 0.50; // 50% of Basic
        const stdAllowance = 4167; // Fixed mostly
        const perfBonus = basic * 0.0833; // 8.33% of Basic
        const lta = basic * 0.0833; // 8.33% of Basic

        // Fixed Allowance = Wage - Sum of all other components
        const totalOtherComponents = basic + hra + stdAllowance + perfBonus + lta;
        const fixedAllowance = monthWage - totalOtherComponents;

        const pfEmployee = basic * 0.12;
        const pfEmployer = basic * 0.12;
        const profTax = 200;

        return {
            annualWage,
            basic,
            hra,
            stdAllowance,
            perfBonus,
            lta,
            fixedAllowance,
            pfEmployee,
            pfEmployer,
            profTax
        };
    }, [monthWage]);

    // Data Templates
    const jayPatelData = {
        name: "Jay Patel",
        role: "Senior Developer",
        loginId: "jay.patel",
        email: "jay.patel@company.com",
        mobile: "+91 98765 43211",
        company: "Tech Solutions Inc.",
        department: "Engineering",
        manager: "Sarah Conner",
        location: "Ahmedabad, India",
        about: "Experienced developer with a strong background in backend systems.",
        jobLove: "Mentoring junior developers and architecting robust solutions.",
        hobbies: "Traveling, Photography",
        skills: ["Java", "Spring Boot", "AWS", "System Design"],
        certifications: ["Oracle Certified Professional"],
        dob: "20 Sep 1990",
        address: "456, Oak Avenue, Ahmedabad",
        nationality: "Indian",
        personalEmail: "jay.patel@gmail.com",
        gender: "Male",
        maritalStatus: "Married",
        doj: "15 Mar 2018",
        bankAccount: "0987654321",
        bankName: "ICICI Bank",
        ifsc: "ICIC0001234",
        pan: "FGHIJ5678K",
        uan: "500600700800",
        empCode: "EMP002"
    };

    // Form Data state for editing
    const [formData, setFormData] = useState({
        name: "",
        department: "",
        designation: "",
        address: "",
        personalEmail: "",
        mobile: "",
        dob: "",
        gender: "",
        maritalStatus: "",
        bankAccount: "",
        bankName: "",
        ifsc: "",
        pan: "",
        uan: "",
        empCode: ""
    });

    // Fetch profile on mount if "me"
    useEffect(() => {
        if (isOwnProfile) {
            fetchMyProfile();
        }
    }, [isOwnProfile, fetchMyProfile]);

    // Determine what data to show
    const displayData = useMemo(() => {
        if (isNewEmployee) return {};
        if (isOwnProfile && myProfile) {
            return {
                ...myProfile,
                name: user?.name,
                email: user?.email,
                role: user?.role,
                loginId: user?.employeeId,
                mobile: user?.phone,
                // Map store fields to view fields
                department: myProfile.department || "Engineering",
                location: "Ahmedabad, India",
                about: myProfile.about || "Passionate software engineer building DayFlow.",
                jobLove: "Building tools that help people work better.",
                hobbies: "Coding, Traveling, Reading",
                skills: ["React", "Node.js", "MongoDB"],
                certifications: [],
                dob: myProfile.dateOfBirth ? format(new Date(myProfile.dateOfBirth), 'dd MMM yyyy') : "N/A",
                personalEmail: user?.email, // Fallback
                gender: myProfile.gender || "Not set",
                maritalStatus: "Single",
                doj: myProfile.joiningDate ? format(new Date(myProfile.joiningDate), 'dd MMM yyyy') : "N/A",
            };
        }
        return jayPatelData; // Mock for anyone else
    }, [id, isOwnProfile, myProfile, user]);

    // Initialize formData when profile/displayData changes
    useEffect(() => {
        if (displayData) {
            setFormData({
                name: displayData.name || "",
                department: displayData.department || "",
                designation: displayData.role || "",
                address: displayData.address || "",
                personalEmail: displayData.personalEmail || "",
                mobile: displayData.mobile || "",
                dob: displayData.dob || "",
                gender: displayData.gender || "",
                maritalStatus: displayData.maritalStatus || "",
                bankAccount: displayData.bankAccount || "",
                bankName: displayData.bankName || "",
                ifsc: displayData.ifsc || "",
                pan: displayData.pan || "",
                uan: displayData.uan || "",
                empCode: displayData.empCode || ""
            });
        }
    }, [displayData]);

    const handleSaveProfile = async () => {
        if (!isOwnProfile) return;

        const updates = {
            address: formData.address,
            department: formData.department,
            gender: formData.gender,
            // Add other fields supported by store/backend
        };

        const result = await updateMyProfile(updates);
        if (result.success) {
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data is handled by displayData useEffect
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
    }

    if (isOwnProfile && isLoading && !myProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Loading your profile...</p>
            </div>
        );
    }

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

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                                {user?.name?.charAt(0) || displayData?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm font-medium hidden md:block">{user?.name || displayData?.name}</span>
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

            {/* Profile Content */}
            <div className="max-w-7xl mx-auto p-6">

                {/* Header with Edit Button for Own Profile */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-200 relative">
                                {isNewEmployee ? (
                                    <User className="h-12 w-12 text-blue-400" />
                                ) : (
                                    <span className="text-4xl text-blue-600 font-bold">
                                        {displayData?.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                                <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="mt-2 text-center">
                                {isNewEmployee ? (
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="text-center bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm w-full"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                ) : (
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {displayData?.department || "Employee"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-3xl font-serif text-gray-900 italic border-b border-gray-300 pb-1 mb-4">
                                        {isNewEmployee ? "New Employee" : displayData?.name}
                                    </h1>
                                </div>

                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm">Employee ID</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.loginId || "N/A"}</span>

                                    <span className="text-gray-500 text-sm">Email</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.email || "N/A"}</span>

                                    <span className="text-gray-500 text-sm">Phone</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.mobile || "N/A"}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 md:pt-0">
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm">Company</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.company || "DayFlow Corp"}</span>

                                    <span className="text-gray-500 text-sm">Department</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.department || "N/A"}</span>

                                    <span className="text-gray-500 text-sm">Manager</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.manager || "Sarah Conner"}</span>

                                    <span className="text-gray-500 text-sm">Location</span>
                                    <span className="text-gray-900 border-b border-gray-200 pb-1">{displayData?.location || "India"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit controls if owner */}
                    {isOwnProfile && (
                        <div className="flex-shrink-0">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        <span>Save</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex gap-8">
                        {['Resume', 'Private Info', 'Salary Info', 'Security'].map((tab) => {
                            const isSensitive = tab === 'Salary Info' || tab === 'Security' || tab === 'Private Info';
                            if (isSensitive && !isAdmin && !isOwnProfile) return null;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content - Resume */}
                {activeTab === 'Resume' && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xl font-serif text-gray-900 mb-3 italic">About</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {displayData?.about}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-serif text-gray-900 mb-3 italic">What I love about my job</h3>
                                <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-gray-200 pl-4 italic">
                                    {displayData.jobLove}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-serif text-gray-900 mb-3 italic">My interests and hobbies</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {displayData.hobbies}
                                </p>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayData.skills?.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                    {isOwnProfile && <button className="px-3 py-1 text-sm text-blue-600 hover:underline">+ Add Skills</button>}
                                </div>
                            </section>

                            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Certifications</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayData.certifications?.map(cert => (
                                        <span key={cert} className="px-3 py-1 bg-white border border-green-200 text-green-700 rounded-full text-sm shadow-sm">
                                            {cert}
                                        </span>
                                    ))}
                                    {isOwnProfile && <button className="px-3 py-1 text-sm text-blue-600 hover:underline">+ Add</button>}
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* Tab Content - Private Info */}
                {activeTab === 'Private Info' && (isAdmin || isOwnProfile) && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                        {/* Left Column - Personal Details */}
                        <div className="space-y-8">
                            <h3 className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2">Personal Details</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Date of Birth</span>
                                    {isEditing ? (
                                        <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full border-b border-blue-500 py-1 px-2 text-gray-900 bg-blue-50 focus:outline-none" />
                                    ) : (
                                        <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900">{displayData.dob}</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Residing Address</span>
                                    {isEditing ? (
                                        <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border-b border-blue-500 py-1 px-2 text-gray-900 bg-blue-50 focus:outline-none" />
                                    ) : (
                                        <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900">{displayData.address}</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Personal Email</span>
                                    {isEditing ? (
                                        <input type="email" value={formData.personalEmail} onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })} className="w-full border-b border-blue-500 py-1 px-2 text-gray-900 bg-blue-50 focus:outline-none" />
                                    ) : (
                                        <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900">{displayData.personalEmail}</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Gender</span>
                                    {isEditing ? (
                                        <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full border-b border-blue-500 py-1 px-2 text-gray-900 bg-blue-50 focus:outline-none">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900">{displayData.gender}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Bank Details */}
                        <div className="space-y-8">
                            <h3 className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2">Bank Details</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Account Number</span>
                                    <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 font-mono">•••• •••• {displayData.bankAccount?.slice(-4) || "0000"}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Bank Name</span>
                                    <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900">{displayData.bankName || "HDFC Bank"}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">PAN No</span>
                                    <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 uppercase">{displayData.pan || "••••••"}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Emp Code</span>
                                    <span className="w-full border-b border-gray-300 py-1 px-2 text-gray-900">{displayData.empCode || "EMP001"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content - Salary Info */}
                {activeTab === 'Salary Info' && (isAdmin || isOwnProfile) && (
                    <div className="animate-in fade-in duration-300 space-y-12">
                        {/* Top Salary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-200 pb-8">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-700 font-medium">Month Wage</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={monthWage}
                                            onChange={(e) => setMonthWage(Number(e.target.value))}
                                            className="border-b border-gray-300 text-right py-1 px-2 focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                        <span className="text-gray-500 font-mono">/ Month</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-700 font-medium">Yearly wage</label>
                                    <div className="flex items-center gap-2">
                                        <span className="border-b border-gray-300 text-right py-1 px-2 min-w-[100px] font-mono block">
                                            {salaryComponents.annualWage}
                                        </span>
                                        <span className="text-gray-500 font-mono">/ Yearly</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 text-sm text-gray-500">
                                <p>This calculation is based on standard company policy. Standard deductions like PF and Tax are already included in the components check below.</p>
                            </div>
                        </div>

                        {/* Salary Components & Deductions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Salary Components */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Salary Components</h3>

                                <div className="space-y-6">
                                    {[
                                        { label: "Basic Salary", val: salaryComponents.basic, pct: "50.00 %" },
                                        { label: "House Rent Allowance", val: salaryComponents.hra, pct: "50.00 %" },
                                        { label: "Standard Allowance", val: salaryComponents.stdAllowance, pct: "16.67 %" },
                                        { label: "Performance Bonus", val: salaryComponents.perfBonus, pct: "8.33 %" },
                                        { label: "Fixed Allowance", val: salaryComponents.fixedAllowance, pct: "11.67 %" },
                                    ].map((comp, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-end justify-between">
                                                <span className="text-gray-800 font-medium">{comp.label}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-mono text-gray-900 min-w-[100px] text-right border-b border-gray-300 pb-1">
                                                        {formatCurrency(comp.val)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">/ month</span>
                                                    <span className="font-mono text-gray-900 w-16 text-right border-b border-gray-300 pb-1 text-sm">{comp.pct}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PF & Tax */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deductions</h3>
                                <div className="space-y-6">
                                    <div className="flex items-end justify-between">
                                        <span className="text-gray-800 font-medium">PF (Employee 12%)</span>
                                        <span className="font-mono text-red-600 border-b border-gray-300 pb-1">
                                            - {formatCurrency(salaryComponents.pfEmployee)}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-gray-800 font-medium">Professional Tax</span>
                                        <span className="font-mono text-red-600 border-b border-gray-300 pb-1">
                                            - {formatCurrency(salaryComponents.profTax)}
                                        </span>
                                    </div>
                                    <div className="pt-8 flex items-end justify-between text-lg font-bold">
                                        <span className="text-gray-900">Net Take Home</span>
                                        <span className="text-green-600">
                                            {formatCurrency(monthWage - salaryComponents.pfEmployee - salaryComponents.profTax)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content - Security (Credentials) */}
                {activeTab === 'Security' && (isAdmin || isOwnProfile) && (
                    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto border border-gray-200 rounded-xl p-8 bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><User className="h-5 w-5" /></span>
                            {isOwnProfile ? 'Change Password' : 'Credential Management'}
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <p className="text-sm text-yellow-700">
                                    {isOwnProfile
                                        ? "You can update your password here. Please choose a strong password."
                                        : "Set up the initial login credentials for the employee."
                                    }
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">System Login ID</span>
                                    <input
                                        type="text"
                                        defaultValue={displayData.loginId || ""}
                                        readOnly
                                        className="w-full border-b border-gray-300 py-1 px-2 text-gray-500 bg-transparent focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                                    <label className="text-gray-700 font-medium">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 bg-white" />
                                </div>
                                <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                                    <label className="text-gray-700 font-medium">Confirm Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 bg-white" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    {isOwnProfile ? 'Update Password' : 'Save Credentials'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
