import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Filter, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAttendanceStore } from '@/store/attendanceStore';

export default function AdminAttendanceView() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    const { allAttendance, isLoading, fetchAllAttendance } = useAttendanceStore();

    // Fetch attendance data for selected date
    useEffect(() => {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);

        fetchAllAttendance({
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            limit: 100,
        });
    }, [selectedDate, fetchAllAttendance]);

    // Filter logic based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(allAttendance);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allAttendance.filter(record => {
            const userName = record.user?.name?.toLowerCase() || '';
            const userEmail = record.user?.email?.toLowerCase() || '';
            return userName.includes(lowerQuery) || userEmail.includes(lowerQuery);
        });
        setFilteredData(filtered);
    }, [searchQuery, allAttendance]);

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

    // Get status badge styles
    const getStatusStyles = (status) => {
        switch (status) {
            case 'PRESENT':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'ABSENT':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'HALF_DAY':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'LEAVE':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Top Controls Row */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Attendance Log</h2>
                    <p className="text-neutral-500 mt-1">Manage and view daily attendance records.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-500 transition-colors h-4 w-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search employee..."
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:text-neutral-900 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">

                {/* Date Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9" 
                            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9" 
                            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="ghost" className="h-10 px-4 font-medium text-base hover:bg-neutral-100">
                        {format(selectedDate, 'MMM dd')} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>

                    <Button 
                        variant="secondary" 
                        className="h-10 px-4 font-medium shadow-none bg-neutral-100 hover:bg-neutral-200"
                        onClick={() => setSelectedDate(new Date())}
                    >
                        Today
                    </Button>
                </div>

                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-neutral-100">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Date Header */}
            <div className="py-2">
                <h3 className="text-xl font-semibold text-neutral-800">{format(selectedDate, 'EEEE, dd MMMM yyyy')}</h3>
            </div>

            {/* Admin Table */}
            {isLoading ? (
                <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-neutral-500">Loading attendance records...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Check Out</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Work Hours</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Clock className="h-12 w-12 text-neutral-300 mb-3" />
                                            <p className="text-neutral-500 font-medium">No attendance records found</p>
                                            <p className="text-neutral-400 text-sm mt-1">
                                                {searchQuery ? 'Try adjusting your search' : 'No employees checked in on this date'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((record, idx) => (
                                    <motion.tr
                                        key={record._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-neutral-50/80 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-neutral-900">{record.user?.name || 'N/A'}</div>
                                            <div className="text-xs text-neutral-500">{record.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-neutral-700">
                                            {record.checkIn ? format(new Date(record.checkIn), 'HH:mm') : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-neutral-700">
                                            {record.checkOut ? format(new Date(record.checkOut), 'HH:mm') : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-neutral-700">
                                            {calculateWorkHours(record.checkIn, record.checkOut)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusStyles(record.status)}`}>
                                                {record.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
