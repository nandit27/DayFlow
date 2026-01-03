import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, User, LogOut, Search, MapPin, Building, Mail, Phone, Calendar } from 'lucide-react';

export default function EmployeeProfileView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Resume');

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
                    {/* Status Dot - Static Red for view-only page or generic */}
                    <div className="h-3 w-3 rounded-full bg-red-500" />

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
                        {['Resume', 'Private Info', 'Salary Info'].map((tab) => (
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
            </div>
        </div>
    );
}
