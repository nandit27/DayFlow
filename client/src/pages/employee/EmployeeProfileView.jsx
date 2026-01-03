import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, User, LogOut, Search, MapPin, Building, Mail, Phone, Calendar } from 'lucide-react';

export default function EmployeeProfileView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Resume');
    const [userRole, setUserRole] = useState('admin'); // 'admin' or 'employee'

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


    const isNewEmployee = id === 'new';
    const isOwnProfile = id === 'me';

    // Data Templates
    const emptyData = {
        name: "",
        role: "",
        loginId: "",
        email: "",
        mobile: "",
        company: "Tech Solutions Inc.",
        department: "",
        manager: "",
        location: "",
        about: "",
        jobLove: "",
        hobbies: "",
        skills: [],
        certifications: [],
        dob: "",
        address: "",
        nationality: "",
        personalEmail: "",
        gender: "",
        maritalStatus: "",
        doj: "",
        bankAccount: "",
        bankName: "",
        ifsc: "",
        pan: "",
        uan: "",
        empCode: ""
    };

    const jenilData = {
        name: "Jenil",
        role: "Software Engineer",
        loginId: "jenil07",
        email: "jenil07@company.com",
        mobile: "+91 98765 43210",
        company: "Tech Solutions Inc.",
        department: "Engineering",
        manager: "Sarah Conner",
        location: "Ahmedabad, India",
        about: "Passionate software engineer with a focus on full-stack development. Love building scalable applications and learning new technologies.",
        jobLove: "I love the challenge of solving complex problems and the continuous learning environment.",
        hobbies: "Coding, Gaming, Reading Tech Blogs",
        skills: ["React", "Node.js", "Python", "UI/UX Design"],
        certifications: ["AWS Certified Developer", "Meta Frontend Developer"],
        dob: "15 Aug 1995",
        address: "123, Maple Street, Thaltej, Ahmedabad",
        nationality: "Indian",
        personalEmail: "jenil.personal@gmail.com",
        gender: "Male",
        maritalStatus: "Single",
        doj: "01 Jan 2020",
        bankAccount: "1234567890",
        bankName: "HDFC Bank",
        ifsc: "HDFC0001234",
        pan: "ABCDE1234F",
        uan: "100200300400",
        empCode: "EMP001"
    };

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

    const getInitialData = () => {
        if (isNewEmployee) return emptyData;
        if (isOwnProfile) return jenilData;
        return jayPatelData;
    };

    const [employeeData, setEmployeeData] = useState(getInitialData);

    // Update data when ID changes
    useMemo(() => {
        setEmployeeData(getInitialData());
    }, [id]);

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

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* Top Navigation Bar (Copied to maintain consistency) */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="text-xl font-bold tracking-tight">Company Logo</div>

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
                    {/* Status Dot */}
                    <div className={`h-3 w-3 rounded-full ${userRole === 'admin' ? 'bg-blue-600' : 'bg-red-500'}`} />

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
                                    onClick={() => { setUserRole('admin'); setIsProfileOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left ${userRole === 'admin' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-600'}`}
                                >
                                    Admin
                                </button>
                                <button
                                    onClick={() => { setUserRole('employee'); setIsProfileOpen(false); }}
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

            {/* Profile Content */}
            <div className="max-w-7xl mx-auto p-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-200">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="h-32 w-32 rounded-full bg-red-100 flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-200 relative">
                            {isNewEmployee ? <User className="h-12 w-12 text-red-400" /> : <span className="text-4xl text-red-400">✏️</span>}
                            <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="mt-2 text-center">
                            {isNewEmployee ? (
                                <input type="text" placeholder="Name" className="text-center bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm w-full" />
                            ) : (
                                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {employeeData.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Basic Info Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-3xl font-serif text-gray-900 italic border-b border-gray-300 pb-1 mb-4 flex justify-between items-baseline">
                                    {employeeData.name}
                                </h1>
                            </div>

                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                <span className="text-gray-500 text-sm">Login ID</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.loginId}</span>

                                <span className="text-gray-500 text-sm">Email</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.email}</span>

                                <span className="text-gray-500 text-sm">Mobile</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.mobile}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 md:pt-0">
                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                <span className="text-gray-500 text-sm">Company</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.company}</span>

                                <span className="text-gray-500 text-sm">Department</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.department}</span>

                                <span className="text-gray-500 text-sm">Manager</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.manager}</span>

                                <span className="text-gray-500 text-sm">Location</span>
                                <span className="text-gray-900 border-b border-gray-200 pb-1">{employeeData.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex gap-8">
                        {['Resume', 'Private Info', 'Salary Info', 'Security'].map((tab) => {
                            const isOwnProfile = id === 'me' || id === 'new'; // 'new' also needs all tabs to fill info
                            const isAdmin = userRole === 'admin';
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xl font-serif text-gray-900 mb-3 italic">About</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {employeeData.about}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-serif text-gray-900 mb-3 italic">What I love about my job</h3>
                                <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-gray-200 pl-4 italic">
                                    {employeeData.jobLove}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-serif text-gray-900 mb-3 italic">My interests and hobbies</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {employeeData.hobbies}
                                </p>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {employeeData.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                    <button className="px-3 py-1 text-sm text-blue-600 hover:underline">+ Add Skills</button>
                                </div>
                            </section>

                            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Certifications</h3>
                                <div className="flex flex-wrap gap-2">
                                    {employeeData.certifications.map(cert => (
                                        <span key={cert} className="px-3 py-1 bg-white border border-green-200 text-green-700 rounded-full text-sm shadow-sm">
                                            {cert}
                                        </span>
                                    ))}
                                    <button className="px-3 py-1 text-sm text-blue-600 hover:underline">+ Add</button>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* Tab Content - Private Info */}
                {activeTab === 'Private Info' && (userRole === 'admin' || id === 'me' || id === 'new') && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                        {/* Left Column - Personal Details */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Date of Birth</span>
                                    <input type="text" defaultValue={employeeData.dob} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Residing Address</span>
                                    <input type="text" defaultValue={employeeData.address} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Nationality</span>
                                    <input type="text" defaultValue={employeeData.nationality} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Personal Email</span>
                                    <input type="text" defaultValue={employeeData.personalEmail} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Gender</span>
                                    <input type="text" defaultValue={employeeData.gender} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Marital Status</span>
                                    <input type="text" defaultValue={employeeData.maritalStatus} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Date of Joining</span>
                                    <input type="text" defaultValue={employeeData.doj} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Bank Details */}
                        <div className="space-y-8">
                            <h3 className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2">Bank Details</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Account Number</span>
                                    <input type="text" defaultValue={employeeData.bankAccount} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Bank Name</span>
                                    <input type="text" defaultValue={employeeData.bankName} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">IFSC Code</span>
                                    <input type="text" defaultValue={employeeData.ifsc} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">PAN No</span>
                                    <input type="text" defaultValue={employeeData.pan} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">UAN NO</span>
                                    <input type="text" defaultValue={employeeData.uan} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">Emp Code</span>
                                    <input type="text" defaultValue={employeeData.empCode} className="w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Salary Info' && (userRole === 'admin' || id === 'me' || id === 'new') && (
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

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-700 font-medium max-w-[150px]">No of working days in a week:</label>
                                    <input type="text" className="border-b border-gray-300 text-right py-1 px-2 w-32 focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-700 font-medium">Break Time:</label>
                                    <div className="flex items-center gap-2">
                                        <input type="text" className="border-b border-gray-300 text-right py-1 px-2 w-32 focus:outline-none focus:border-blue-500" />
                                        <span className="text-gray-500 font-mono">/ hrs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Salary Components & Deductions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                            {/* Salary Components */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Salary Components</h3>

                                <div className="space-y-6">
                                    {/* Component Row Utility */}
                                    {[
                                        { label: "Basic Salary", val: salaryComponents.basic, pct: "50.00 %", desc: "Define Basic salary from company cost compute it based on monthly Wages" },
                                        { label: "House Rent Allowance", val: salaryComponents.hra, pct: "50.00 %", desc: "HRA provided to employees 50% of the basic salary" },
                                        { label: "Standard Allowance", val: salaryComponents.stdAllowance, pct: "16.67 %", desc: "A standard allowance is a predetermined, fixed amount provided to employee as part of their salary" },
                                        { label: "Performance Bonus", val: salaryComponents.perfBonus, pct: "8.33 %", desc: "Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary" },
                                        { label: "Leave Travel Allowance", val: salaryComponents.lta, pct: "8.33 %", desc: "LTA is paid by the company to employees to cover their travel expenses, and calculated as a % of the basic salary" },
                                        { label: "Fixed Allowance", val: salaryComponents.fixedAllowance, pct: "11.67 %", desc: "Fixed allowance portion of wages is determined after calculating all salary components" },
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
                                            <p className="text-xs text-gray-400 italic max-w-md leading-relaxed">{comp.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PF & Tax */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Provident Fund (PF) Contribution</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-end justify-between">
                                            <span className="text-gray-800 font-medium">Employee</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-gray-900 min-w-[100px] text-right border-b border-gray-300 pb-1">
                                                    {formatCurrency(salaryComponents.pfEmployee)}
                                                </span>
                                                <span className="text-xs text-gray-500">/ month</span>
                                                <span className="font-mono text-gray-900 w-16 text-right border-b border-gray-300 pb-1 text-sm">12.00 %</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 italic">PF is calculated based on the basic salary</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-end justify-between">
                                            <span className="text-gray-800 font-medium">Employer's</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-gray-900 min-w-[100px] text-right border-b border-gray-300 pb-1">
                                                    {formatCurrency(salaryComponents.pfEmployer)}
                                                </span>
                                                <span className="text-xs text-gray-500">/ month</span>
                                                <span className="font-mono text-gray-900 w-16 text-right border-b border-gray-300 pb-1 text-sm">12.00 %</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 italic">PF is calculated based on the basic salary</p>
                                    </div>
                                </div>

                                <div className="pt-8 space-y-6">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tax Deduction</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-end justify-between">
                                            <span className="text-gray-800 font-medium">Professional Tax</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-gray-900 min-w-[100px] text-right border-b border-gray-300 pb-1">
                                                    {formatCurrency(salaryComponents.profTax)}
                                                </span>
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 italic">Professional Tax deducted from the Gross salary</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Tab Content - Security (Credentials) */}
                {activeTab === 'Security' && (userRole === 'admin' || id === 'me' || id === 'new') && (
                    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto border border-gray-200 rounded-xl p-8 bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><User className="h-5 w-5" /></span>
                            {id === 'me' ? 'Change Password' : 'Credential Management'}
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            {id === 'me'
                                                ? "You can update your password here. Please choose a strong password."
                                                : "Set up the initial login credentials for the employee. They will be required to change their password upon first login."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                                    <span className="text-gray-500 text-sm font-medium">System Login ID</span>
                                    <input
                                        type="text"
                                        defaultValue={employeeData.loginId || ""}
                                        placeholder="e.g. jay.patel"
                                        readOnly={id === 'me' && !(id === 'new')}
                                        className={`w-full border-b border-gray-300 py-1 px-2 text-gray-900 bg-transparent focus:outline-none ${id === 'me' && !(id === 'new') ? 'text-gray-500 cursor-not-allowed' : 'focus:border-blue-500'}`}
                                    />
                                </div>
                                <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                                    <label className="text-gray-700 font-medium">Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                                </div>
                                <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                                    <label className="text-gray-700 font-medium">Confirm Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    {isNewEmployee ? 'Create Employee' : (id === 'me' ? 'Update Password' : 'Update Credentials')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
