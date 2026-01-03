import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const ALL_EMPLOYEES = [
    { id: 1, name: "Sarah Chen", empId: "EMP001", checkIn: "09:00", checkOut: "17:30", department: "Engineering" },
    { id: 2, name: "Michael Lee", empId: "EMP002", checkIn: "09:15", checkOut: "18:00", department: "Design" },
    { id: 3, name: "David Kim", empId: "EMP003", checkIn: "08:45", checkOut: "17:00", department: "Product" },
    { id: 4, name: "Jessica Wu", empId: "EMP004", checkIn: "09:30", checkOut: "18:30", department: "Engineering" },
];

export default function AdminAttendanceView() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState(ALL_EMPLOYEES);

    // Filter logic
    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = ALL_EMPLOYEES.filter(emp =>
            emp.name.toLowerCase().includes(lowerQuery) ||
            emp.empId.toLowerCase().includes(lowerQuery)
        );
        setFilteredData(filtered);
    }, [searchQuery]);

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

                {/* Date Controls (Wireframe Style) */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="ghost" className="h-10 px-4 font-medium text-base hover:bg-neutral-100">
                        {format(selectedDate, 'MMM dd')} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>

                    <Button variant="secondary" className="h-10 px-4 font-medium shadow-none bg-neutral-100 hover:bg-neutral-200">
                        Day View
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
            <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Check In</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Check Out</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filteredData.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-neutral-500">No employees found.</td></tr>
                        ) : (
                            filteredData.map((emp, idx) => (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-neutral-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-neutral-900">{emp.name}</div>
                                        <div className="text-xs text-neutral-500">{emp.empId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {emp.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-neutral-700">{emp.checkIn}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-neutral-700">{emp.checkOut}</td>
                                    <td className="px-6 py-4">
                                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                                        <span className="text-sm font-medium text-green-700">Present</span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
