import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AdminAttendanceView2() {
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
    const calculateExtraHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffMs = end - start;
        const totalHours = diffMs / (1000 * 60 * 60);
        const extraHours = Math.max(0, totalHours - 9);
        const hours = Math.floor(extraHours);
        const minutes = Math.floor((extraHours - hours) * 60);
        return hours > 0 || minutes > 0 ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` : '-';
    };

    // Calculate stats
    const presentCount = attendanceData.filter(att => att.status === 'Present').length;
    const onLeaveCount = attendanceData.filter(att => att.status === 'On Leave').length;
    const totalWorkingDays = monthDays.filter(day => {
        const dayOfWeek = day.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6;
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            </div>

            {/* Employee Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or employee ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Employee Selector */}
                {searchQuery && filteredEmployees.length > 0 && (
                    <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredEmployees.map((emp, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedEmployee(emp);
                                    setSearchQuery('');
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                                <div className="text-sm font-medium text-gray-900">{emp.user?.name}</div>
                                <div className="text-xs text-gray-500">{emp.user?.employeeId}</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Employee & Month Navigation */}
            {selectedEmployee && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{selectedEmployee.user?.name}</h2>
                            <p className="text-sm text-gray-500">{selectedEmployee.user?.employeeId}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-900">
                                    {format(selectedMonth, 'MMMM yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="text-sm">
                            <span className="text-gray-600">Count of days present: </span>
                            <span className="font-semibold text-gray-900">{presentCount}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">Leaves count: </span>
                            <span className="font-semibold text-gray-900">{onLeaveCount}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">Total working days: </span>
                            <span className="font-semibold text-gray-900">{totalWorkingDays}</span>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Emp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Check In
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Check Out
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Work Hours
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Extra Hours
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {monthDays.slice(0, 10).map((day) => {
                                        const dateKey = format(day, 'yyyy-MM-dd');
                                        const attendance = attendanceMap[dateKey];
                                        const dayOfWeek = day.getDay();
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                        return (
                                            <tr key={dateKey} className={isWeekend ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {format(day, 'dd/MM/yyyy')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {attendance?.checkIn 
                                                            ? format(new Date(attendance.checkIn), 'HH:mm')
                                                            : '-'
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {attendance?.checkOut
                                                            ? format(new Date(attendance.checkOut), 'HH:mm')
                                                            : '-'
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {attendance 
                                                            ? calculateWorkHours(attendance.checkIn, attendance.checkOut)
                                                            : '-'
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {attendance
                                                            ? calculateExtraHours(attendance.checkIn, attendance.checkOut)
                                                            : '-'
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
