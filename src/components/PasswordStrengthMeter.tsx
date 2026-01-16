"use client";

import { motion } from "framer-motion";
import { PasswordFeedback } from "@/lib/password-utils";

interface PasswordStrengthMeterProps {
    feedback: PasswordFeedback;
}

export default function PasswordStrengthMeter({ feedback }: PasswordStrengthMeterProps) {
    const { score, label, color, requirements } = feedback;

    return (
        <div className="mt-2 space-y-2">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{
                        width: label === "Weak" ? "33%" : label === "Moderate" ? "66%" : "100%"
                    }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <div className="flex justify-between items-start">
                <p className={`text-xs font-semibold ${label === "Weak" ? "text-red-600" :
                    label === "Moderate" ? "text-yellow-600" :
                        "text-green-600"
                    }`}>
                    Password strength: {label}
                </p>
            </div>

            {/* Requirements Feedback */}
            {label === "Weak" && (
                <div className="grid grid-cols-2 gap-1 px-1">
                    <RequirementItem met={requirements.length} text="6+ chars" />
                    <RequirementItem met={requirements.upper} text="1 Uppercase" />
                    <RequirementItem met={requirements.lower} text="1 Lowercase" />
                    <RequirementItem met={requirements.number} text="1 Number" />
                </div>
            )}

            {label === "Strong" && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-100 text-green-600 text-[10px] flex items-center justify-center border border-green-600">✓</span>
                    Strong password!
                </p>
            )}
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <span className={`text-[10px] flex items-center gap-1 ${met ? "text-green-600" : "text-gray-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${met ? "bg-green-500" : "bg-gray-300"}`}></span>
            {text}
        </span>
    )
}
