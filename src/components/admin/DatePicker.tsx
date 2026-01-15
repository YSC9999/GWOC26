"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon, X } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "@/components/calendar.css"; // Reuse existing styles if possible or add inline

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    minDate?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Select date", className = "", minDate }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Only close if not clicking on the portal content
                // We handle this by stopping propagation on the portal content click
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateChange = (date: any) => {
        const selectedDate = new Date(date);
        const offset = selectedDate.getTimezoneOffset();
        const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
        const dateString = adjustedDate.toISOString().split('T')[0];

        onChange(dateString);
        setIsOpen(false);
    };

    const displayValue = value ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    const calendarOverlay = isOpen && mounted ? createPortal(
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
            {/* Background backdrop - guaranteed to be on top due to portal and extreme z-index */}
            <div
                className="fixed inset-0 bg-black/60 z-[1000001] transition-opacity backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            />

            {/* Popup Container - Guaranteed fixed width and extremely high z-index */}
            <div
                className="relative z-[1000002] w-[320px] bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-soil/10 animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-xs font-bold text-soil/70 uppercase tracking-wider">Select Date</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-sand/20 rounded-full text-soil/60 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="custom-calendar-container overflow-hidden rounded-2xl border border-soil/5">
                    <Calendar
                        onChange={handleDateChange}
                        value={value ? new Date(value) : null}
                        className="text-sm border-none w-full"
                        minDate={minDate ? new Date(minDate) : undefined}
                        prev2Label={null}
                        next2Label={null}
                        navigationLabel={({ date, label, locale, view }) => {
                            return <span className="text-soil font-bold text-sm">{label}</span>
                        }}
                        tileClassName={({ date, view }) => {
                            if (view === 'month' && value) {
                                const d = new Date(value);
                                if (date.getDate() === d.getDate() && date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()) {
                                    return 'bg-clay text-white rounded-full font-bold shadow-md scale-95';
                                }
                            }
                            return 'text-soil hover:bg-sand/20 rounded-full text-xs font-medium transition-all hover:scale-110 aspect-square flex items-center justify-center';
                        }}
                    />
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 border rounded-lg text-base md:text-sm bg-white cursor-pointer flex items-center justify-between hover:border-clay/50 transition-colors"
                style={{ minHeight: '42px' }}
            >
                <span className={value ? "text-soil" : "text-gray-400"}>
                    {displayValue || placeholder}
                </span>
                <CalendarIcon size={16} className="text-soil/50" />
            </div>

            {calendarOverlay}
        </div>
    );
}
