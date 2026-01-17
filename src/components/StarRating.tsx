import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
    rating: number;
    size?: number;
    showCount?: boolean;
}

export function StarRating({ rating, size = 14, showCount = true }: StarRatingProps) {
    // Ensure rating is valid 0-5
    const clampedRating = Math.max(0, Math.min(5, Number(rating) || 0));

    const fullStars = Math.floor(clampedRating);
    const decimalPart = clampedRating % 1;
    const hasHalfStar = decimalPart >= 0.25 && decimalPart < 0.75;
    // If decimal part is >= 0.75, we usually round up to next full star, but let's stick to floor + maybe half?
    // Common logic: 
    // x.0 to x.2 -> x stars
    // x.3 to x.7 -> x.5 stars
    // x.8 to x.9 -> x+1 stars
    // Let's implement simple logic:

    // Actually, user said "partial partial stars". 
    // Let's try to be precise? 
    // Standard simple approach:
    // 4.5 -> 4 full, 1 half.
    // 4.2 -> 4 full, 0 half, 1 empty (visually 4 stars?).
    // 4.8 -> 5 stars?

    // Let's stick to simple:
    // Floor for full.
    // >= 0.5 remainder -> Half?
    // What if it's 3 stars? -> 3 stars.

    // Let's go with:
    // Full stars = Math.floor(rating)
    // Half star = (rating % 1) >= 0.5 ? 
    // But wait, standard rating components usually round to nearest 0.5.

    const roundedRating = Math.round(clampedRating * 2) / 2;
    const fulls = Math.floor(roundedRating);
    const half = roundedRating % 1 !== 0;
    const empties = 5 - fulls - (half ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5" title={`${rating} Stars`}>
            {[...Array(fulls)].map((_, i) => (
                <Star
                    key={`full-${i}`}
                    size={size}
                    className="fill-yellow-500 text-yellow-500"
                />
            ))}
            {half && (
                <div className="relative">
                    {/* Background empty star for half star? No, Lucide StarHalf is usually just the shape. 
                If we want it to look good against background, we usually don't need backing unless it's a specific UI.
                Let's just trust StarHalf.
            */}
                    <StarHalf size={size} className="fill-yellow-500 text-yellow-500" />
                </div>
            )}
            {[...Array(empties)].map((_, i) => (
                <Star
                    key={`empty-${i}`}
                    size={size}
                    className="text-gray-300 fill-transparent"
                />
            ))}
            {showCount && (
                <span className="ml-1 text-xs text-soil/70 font-medium pt-0.5">{rating}</span>
            )}
        </div>
    );
}
