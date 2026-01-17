"use client";
import Calendar from "react-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

interface Event {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    type: string;
}

interface EventCalendarProps {
    events: Event[];
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
}

export default function EventCalendar({ events, selectedDate, onDateSelect }: EventCalendarProps) {

    // Function to check if a date has events
    const getEventsForDate = (d: Date) => {
        return events.filter((event) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            // Strip time for comparison
            const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const start = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            const end = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());

            return checkDate >= start && checkDate <= end;
        });
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            const dayEvents = getEventsForDate(date);
            if (dayEvents.length > 0) {
                // Check if any event is upcoming (end date >= today)
                const now = new Date();
                const hasUpcoming = dayEvents.some(ev => new Date(ev.endDate) >= now);

                return `has-event ${hasUpcoming ? 'has-event-upcoming' : 'has-event-completed'}`;
            }
        }
        return null;
    };

    return (
        <div className="bg-white p-4 pt-6 rounded-2xl shadow-sm border border-soil/10 relative mt-2">
            {/* Tape Effect */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#dccab6] shadow-sm rotate-[-1deg] z-20" style={{ clipPath: "polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)" }}></div>

            <div className="mb-4 flex justify-between items-center relative z-10">
                <h3 className="text-4xl font-bold text-soil" style={{ fontFamily: "var(--font-berkshire-swash)" }}>Calendar</h3>
                <div className="flex gap-2 text-[10px] font-medium">
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                        <span className="text-soil/70">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        <span className="text-soil/70">Done</span>
                    </div>
                </div>
            </div>

            <div className="custom-calendar-wrapper">
                <Calendar
                    onClickDay={onDateSelect}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    prevLabel={<span className="text-2xl font-light">‹</span>}
                    nextLabel={<span className="text-2xl font-light">›</span>}
                    prev2Label={null}
                    next2Label={null}
                    formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                />
            </div>
        </div>
    );
}
