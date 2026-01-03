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


    // Mock Data based on the image
    const employeeData = {
        name: "Jay Patel",
        role: "Software Engineer",
        loginId: "jay.patel",
        email: "jay.patel@company.com",
        mobile: "+91 98765 43210",
        company: "Tech Solutions Inc.",
        department: "Engineering",
        manager: "Sarah Conner",
        location: "Ahmedabad, India",
        about: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        jobLove: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
        hobbies: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
        skills: ["React", "Node.js", "Python", "UI/UX Design"],
        certifications: ["AWS Certified Developer", "Meta Frontend Developer"]
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
                            <div className="h-8 w-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold">
                                JD
                            </div>
                            <ChevronDown className={`h-4 w-4 text-gray-500 duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
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
                            <span className="text-4xl text-red-400">✏️</span>
                            <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="mt-2 text-center">
                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {employeeData.name}
                            </span>
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
                        {['Resume', 'Private Info'].concat(userRole === 'admin' ? ['Salary Info'] : []).map((tab) => (
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
                        ))}
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
                {activeTab === 'Private Info' && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">

                        {/* Private Contact */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Private Contact</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Address</span>
                                    <span className="text-gray-900 text-sm">123, Maple Street, Thaltej, Ahmedabad - 380054</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Email</span>
                                    <span className="text-gray-900 text-sm">jay.patel.personal@gmail.com</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Phone</span>
                                    <span className="text-gray-900 text-sm">+91 98765 43210</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Language</span>
                                    <span className="text-gray-900 text-sm">English, Hindi, Gujarati</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Home-Work Distance</span>
                                    <span className="text-gray-900 text-sm">12 km</span>
                                </div>
                            </div>
                        </section>

                        {/* Citizenship */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Citizenship</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Nationality</span>
                                    <span className="text-gray-900 text-sm">Indian</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Identification No</span>
                                    <span className="text-gray-900 text-sm">1234 5678 9012</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Passport No</span>
                                    <span className="text-gray-900 text-sm">X1234567</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Gender</span>
                                    <span className="text-gray-900 text-sm">Male</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Date of Birth</span>
                                    <span className="text-gray-900 text-sm">15 Aug 1995</span>
                                </div>
                            </div>
                        </section>

                        {/* Marital Status */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Marital Status</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Marital Status</span>
                                    <span className="text-gray-900 text-sm">Single</span>
                                </div>
                            </div>
                        </section>

                        {/* Emergency */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Emergency</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Contact Name</span>
                                    <span className="text-gray-900 text-sm">Ramesh Patel</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Relationship</span>
                                    <span className="text-gray-900 text-sm">Father</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Phone</span>
                                    <span className="text-gray-900 text-sm">+91 98798 76543</span>
                                </div>
                            </div>
                        </section>

                        {/* Work Permit */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Work Permit</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Visa No</span>
                                    <span className="text-gray-900 text-sm">-</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Work Permit No</span>
                                    <span className="text-gray-900 text-sm">-</span>
                                </div>
                            </div>
                        </section>

                        {/* Education */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Education</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Certificate Level</span>
                                    <span className="text-gray-900 text-sm">Bachelor</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">Field of Study</span>
                                    <span className="text-gray-900 text-sm">Computer Engineering</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <span className="text-gray-500 text-sm">School</span>
                                    <span className="text-gray-900 text-sm">G.H. Patel College of Engineering & Technology</span>
                                </div>
                            </div>
                        </section>

                    </div>
                )}

                {activeTab === 'Salary Info' && userRole === 'admin' && (
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
            </div>
        </div>
    );
}
