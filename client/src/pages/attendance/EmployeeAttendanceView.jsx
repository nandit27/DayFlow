import { useState, useEffect } from 'react';
import { format, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Mock Data Generator
const generateMockData = (date) => {
    const records = [];
    const baseDate = new Date(date);
    // Generate 5 days of data around the selected date
    for (let i = -2; i <= 2; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        records.push({
            date: format(d, 'yyyy-MM-dd'),
            checkIn: "09:00",
            checkOut: "18:00",
            workHours: "9h 0m",
            extra: "0h 0m",
            status: "Present"
        });
    }
    return records;
};

export default function EmployeeAttendanceView() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [records, setRecords] = useState([]);
    const [activeStat, setActiveStat] = useState('present');

    // Load mock data when date changes
    useEffect(() => {
        setRecords(generateMockData(selectedDate));
    }, [selectedDate]);

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

            {/* Header controls row */}
            <div className="flex flex-col md:flex-row gap-6">

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
                        <StatsCard id="present" title="Days Present" value="22" subtitle="This Month" />
                        <StatsCard id="leaves" title="Leaves Taken" value="2" subtitle="Approved" />
                        <StatsCard id="total" title="Working Days" value="24" subtitle="Expected" />
                    </div>
                </div>
            </div>

            {/* Date Header */}
            <div className="flex items-baseline gap-4 pb-4">
                <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
                    {format(selectedDate, 'dd, MMMM yyyy')}
                </h2>
                <span className="text-neutral-500 text-lg">Daily Log</span>
            </div>

            {/* Modern Table */}
            <div className="bg-white rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 bg-neutral-50 p-4 border-b border-neutral-100 text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                    <div>Date</div>
                    <div>Check In</div>
                    <div>Check Out</div>
                    <div>Work Hours</div>
                    <div>Extra Hours</div>
                </div>

                <div className="divide-y">
                    {records.map((record, idx) => (
                        <motion.div
                            key={record.date}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="grid grid-cols-5 p-5 hover:bg-neutral-50 transition-colors items-center"
                        >
                            <div className="font-medium text-neutral-900">
                                {format(new Date(record.date), 'dd/MM/yyyy')}
                            </div>
                            <div>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                                    {record.checkIn}
                                </span>
                            </div>
                            <div>
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                                    {record.checkOut}
                                </span>
                            </div>
                            <div className="font-mono text-neutral-600">{record.workHours}</div>
                            <div className="font-mono text-purple-600 font-medium">{record.extra}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
}
