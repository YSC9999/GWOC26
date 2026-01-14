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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-soil/10">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-soil">Calendar</h3>

                {/* Legend */}
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                        <span className="text-soil/70">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        <span className="text-soil/70">Completed</span>
                    </div>
                </div>
            </div>

            <div className="custom-calendar-wrapper">
                <Calendar
                    onClickDay={onDateSelect}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    prevLabel={<ChevronLeft size={16} />}
                    nextLabel={<ChevronRight size={16} />}
                    prev2Label={null}
                    next2Label={null}
                    formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                />
            </div>
        </div>
    );
}
