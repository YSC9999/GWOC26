export type PasswordStrength = "Weak" | "Moderate" | "Strong";

export interface PasswordFeedback {
    score: number; // 0-4
    label: PasswordStrength;
    color: string;
    requirements: {
        length: boolean;
        upper: boolean;
        lower: boolean;
        number: boolean;
    };
}

export function getPasswordStrength(password: string): PasswordFeedback {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const lengthValid = password.length >= 6;

    // Calculate score logic
    // 0: Very Weak (empty or very short)
    // 1: Weak (some chars but missing reqs)
    // 2: Moderate (all reqs met but short-ish or just bare minimum)
    // 3: Strong (all reqs + longer)

    let score = 0;
    if (!password) return {
        score: 0,
        label: "Weak",
        color: "bg-gray-200",
        requirements: { length: false, upper: false, lower: false, number: false }
    };

    if (lengthValid) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;

    const requirements = {
        length: lengthValid,
        upper: hasUpper,
        lower: hasLower,
        number: hasNumber
    };

    // Enforce "Weak" if ANY requirement is missing
    if (!lengthValid || !hasLower || !hasUpper || !hasNumber) {
        return {
            score: score, // Keep score for progress bar visualization
            label: "Weak",
            color: "bg-red-500",
            requirements
        };
    }

    // If all requirements met
    if (password.length >= 10) {
        return { score: 4, label: "Strong", color: "bg-green-500", requirements };
    } else {
        return { score: 3, label: "Moderate", color: "bg-yellow-500", requirements };
    }
}
