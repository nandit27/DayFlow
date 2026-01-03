import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAttendanceStore } from '../../store/attendanceStore';
import toast from 'react-hot-toast';

export default function EmployeeAttendanceView() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeStat, setActiveStat] = useState('present');

    const {
        myAttendance,
        isLoading,
        isCheckingIn,
        isCheckingOut,
        fetchMyAttendance,
        checkIn,
        checkOut,
        getTodayStatus,
        getMonthlyStats,
    } = useAttendanceStore();

    // Fetch attendance data when component mounts or month changes
    useEffect(() => {
        const startDate = startOfMonth(selectedDate);
        const endDate = endOfMonth(selectedDate);
        
        fetchMyAttendance({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 100,
        });
    }, [selectedDate, fetchMyAttendance]);

    // Get today's attendance status
    const todayStatus = getTodayStatus();
    const monthlyStats = getMonthlyStats();

    // Handle Check In
    const handleCheckIn = async () => {
        await checkIn();
    };

    // Handle Check Out
    const handleCheckOut = async () => {
        await checkOut();
    };

    // Calculate work hours
    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';
        
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${diffHrs}h ${diffMins}m`;
    };

    const StatsCard = ({ title, value, id, subtitle }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveStat(id)}
            className={`flex-1 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 ${activeStat === id
                ? 'bg-black text-white shadow-lg'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
        >
            <span className="text-3xl font-bold mb-1">{value}</span>
            <span className={`text-sm font-medium ${activeStat === id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {title}
            </span>
            {subtitle && (
                <span className={`text-xs mt-1 ${activeStat === id ? 'text-neutral-400' : 'text-neutral-400'}`}>
                    {subtitle}
                </span>
            )}
        </motion.button>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Check In/Out Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Today's Attendance</h3>
                        <p className="text-sm text-neutral-600">
                            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                        </p>
                        {todayStatus && (
                            <div className="mt-3 flex gap-4 text-sm">
                                {todayStatus.checkIn && (
                                    <div className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4 text-green-600" />
                                        <span className="text-neutral-700">
                                            In: <strong>{format(new Date(todayStatus.checkIn), 'hh:mm a')}</strong>
                                        </span>
                                    </div>
                                )}
                                {todayStatus.checkOut && (
                                    <div className="flex items-center gap-2">
                                        <LogOut className="h-4 w-4 text-red-600" />
                                        <span className="text-neutral-700">
                                            Out: <strong>{format(new Date(todayStatus.checkOut), 'hh:mm a')}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleCheckIn}
                            disabled={isCheckingIn || (todayStatus && todayStatus.checkIn)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6"
                        >
                            {isCheckingIn ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking In...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Check In
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleCheckOut}
                            disabled={isCheckingOut || !todayStatus?.checkIn || todayStatus?.checkOut}
                            variant="destructive"
                            className="px-6"
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking Out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Check Out
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Header controls row */}
            <div className="flex flex-col md:flex-row gap-6">{/* ... rest remains same ... */}

                {/* Navigation Controls */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Navigation</label>
                    <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl shadow-sm w-fit">
                        <div className="flex gap-1 pr-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button variant="ghost" className="font-medium text-base px-3" onClick={() => setSelectedDate(new Date())}>
                            {format(selectedDate, 'MMMM')} <ChevronDown className="ml-2 h-4 w-4 text-neutral-400" />
                        </Button>
                    </div>
                </div>

                {/* Interactive Stats Cards */}
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Overview</label>
                    <div className="flex gap-4 h-full">
                        <StatsCard id="present" title="Days Present" value={monthlyStats.present} subtitle="This Month" />
                        <StatsCard id="leaves" title="Leaves Taken" value={monthlyStats.leave} subtitle="Approved" />
                        <StatsCard id="total" title="Total Days" value={monthlyStats.total} subtitle="Recorded" />
                    </div>
                </div>
            </div>

            {/* Date Header */}
            <div className="flex items-baseline gap-4 pb-4">
                <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
                    {format(selectedDate, 'MMMM yyyy')}
                </h2>
                <span className="text-neutral-500 text-lg">Attendance Records</span>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                    <span className="ml-3 text-neutral-600">Loading attendance...</span>
                </div>
            ) : myAttendance.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Attendance Records</h3>
                    <p className="text-neutral-500">No attendance data found for this period.</p>
                </div>
            ) : (
                /* Modern Table */
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">{/* ... rest remains same ... */}
                <div className="grid grid-cols-5 bg-neutral-50 p-4 border-b border-neutral-100 text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                    <div>Date</div>
                    <div>Check In</div>
                    <div>Check Out</div>
                    <div>Work Hours</div>
                    <div>Status</div>
                </div>

                <div className="divide-y">
                    {myAttendance.map((record, idx) => (
                        <motion.div
                            key={record._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="grid grid-cols-5 p-5 hover:bg-neutral-50 transition-colors items-center"
                        >
                            <div className="font-medium text-neutral-900">
                                {format(new Date(record.date), 'dd/MM/yyyy')}
                            </div>
                            <div>
                                {record.checkIn ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                                        {format(new Date(record.checkIn), 'hh:mm a')}
                                    </span>
                                ) : (
                                    <span className="text-neutral-400">-</span>
                                )}
                            </div>
                            <div>
                                {record.checkOut ? (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                                        {format(new Date(record.checkOut), 'hh:mm a')}
                                    </span>
                                ) : (
                                    <span className="text-neutral-400">-</span>
                                )}
                            </div>
                            <div className="font-mono text-neutral-600">
                                {calculateWorkHours(record.checkIn, record.checkOut)}
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                    record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                    record.status === 'HALF_DAY' ? 'bg-yellow-100 text-yellow-700' :
                                    record.status === 'LEAVE' ? 'bg-blue-100 text-blue-700' :
                                    'bg-neutral-100 text-neutral-600'
                                }`}>
                                    {record.status.replace('_', ' ')}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                </div>
            )}

        </div>
    );
}
