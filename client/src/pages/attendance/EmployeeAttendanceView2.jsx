import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';

export default function EmployeeAttendanceView2() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const {
        myAttendance,
        isLoading,
        fetchMyAttendance,
        getMonthlyStats
    } = useAttendanceStore();

    useEffect(() => {
        const startDate = startOfMonth(selectedMonth);
        const endDate = endOfMonth(selectedMonth);
        
        fetchMyAttendance({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 100,
        });
    }, [selectedMonth, fetchMyAttendance]);

    const monthlyStats = getMonthlyStats();
    
    // Get all days in the month
    const monthDays = eachDayOfInterval({
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth)
    });

    // Create a map of attendance by date
    const attendanceMap = {};
    myAttendance.forEach(att => {
        const dateKey = format(new Date(att.date), 'yyyy-MM-dd');
        attendanceMap[dateKey] = att;
    });

    // Calculate work hours
    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffMs = end - start;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Calculate extra hours (hours worked beyond 9 hours)
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

    const totalWorkingDays = monthDays.filter(day => {
        const dayOfWeek = day.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            </div>

            {/* Month Navigation & Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="font-medium text-gray-900">
                                {format(selectedMonth, 'MMMM yyyy')}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-sm">
                            <span className="text-gray-600">Count of days present: </span>
                            <span className="font-semibold text-gray-900">{monthlyStats.present}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">Leaves count: </span>
                            <span className="font-semibold text-gray-900">{monthlyStats.onLeave}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">Total working days: </span>
                            <span className="font-semibold text-gray-900">{totalWorkingDays}</span>
                        </div>
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
                                        Date
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
                                {monthDays.map((day) => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const attendance = attendanceMap[dateKey];
                                    const dayOfWeek = day.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                    return (
                                        <tr key={dateKey} className={isWeekend ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {format(day, 'dd/MM/yyyy')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {format(day, 'EEEE')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {attendance?.checkIn 
                                                        ? format(new Date(attendance.checkIn), 'HH:mm')
                                                        : isWeekend ? '-' : '-'
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {attendance?.checkOut
                                                        ? format(new Date(attendance.checkOut), 'HH:mm')
                                                        : isWeekend ? '-' : '-'
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
        </div>
    );
}
