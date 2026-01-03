import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AdminAttendanceView3() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [employeesAttendance, setEmployeesAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all employees and their attendance
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch employees
                const employeesResponse = await axios.get('http://localhost:3000/api/profile', {
                    withCredentials: true
                });
                const employeesList = employeesResponse.data.data || [];

                // Fetch attendance for the month
                const startDate = startOfMonth(selectedMonth);
                const endDate = endOfMonth(selectedMonth);

                const attendanceResponse = await axios.get(
                    'http://localhost:3000/api/attendance/all',
                    {
                        params: {
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString(),
                            limit: 1000
                        },
                        withCredentials: true
                    }
                );
                const attendanceData = attendanceResponse.data.data || [];

                // Group attendance by employee
                const attendanceByEmployee = {};
                attendanceData.forEach(att => {
                    const userId = att.user?._id;
                    if (userId) {
                        if (!attendanceByEmployee[userId]) {
                            attendanceByEmployee[userId] = [];
                        }
                        attendanceByEmployee[userId].push(att);
                    }
                });

                // Combine employees with their attendance
                const combined = employeesList.map(emp => {
                    const userId = emp.user?._id;
                    const attendance = attendanceByEmployee[userId] || [];
                    
                    // Calculate stats
                    const presentDays = attendance.filter(a => 
                        a.checkIn || a.status === 'PRESENT'
                    ).length;
                    const leaveDays = attendance.filter(a => a.status === 'LEAVE').length;
                    
                    return {
                        ...emp,
                        attendance,
                        presentDays,
                        leaveDays
                    };
                });

                setEmployeesAttendance(combined);
            } catch (error) {
                console.error('Error fetching data:', error);
                setEmployeesAttendance([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth]);

    // Filter employees by search query
    const filteredEmployees = employeesAttendance.filter(emp => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = emp.user?.name?.toLowerCase() || '';
        const employeeId = emp.user?.employeeId?.toLowerCase() || '';
        return name.includes(query) || employeeId.includes(query);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-gray-600 mt-1">View all employee attendance records</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="text-lg font-semibold text-gray-900 min-w-[150px] text-center">
                        {format(selectedMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search by name or employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Employee Attendance List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No employees found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredEmployees.map((emp) => (
                        <div key={emp._id} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                        {emp.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{emp.user?.name || 'Unknown'}</h3>
                                        <p className="text-sm text-gray-600">{emp.user?.employeeId}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Count of days present</p>
                                        <p className="text-2xl font-bold text-green-600">{emp.presentDays}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Leaves count</p>
                                        <p className="text-2xl font-bold text-orange-600">{emp.leaveDays}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Total working days</p>
                                        <p className="text-2xl font-bold text-gray-900">22</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
