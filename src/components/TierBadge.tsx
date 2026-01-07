"use client";

import { UserTier, TIER_LEVELS } from "@/lib/tiers";
import { Lock } from "lucide-react";

interface TierBadgeProps {
  tier: UserTier | string;
  showLabel?: boolean;
}

export function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
  const tierData = TIER_LEVELS[tier as UserTier];

  if (!tierData) return null;

  const tierColors: Record<UserTier, { bg: string; text: string }> = {
    [UserTier.TIER_0]: { bg: "bg-gray-100", text: "text-gray-700" },
    [UserTier.TIER_1]: { bg: "bg-blue-100", text: "text-blue-700" },
    [UserTier.TIER_2]: { bg: "bg-purple-100", text: "text-purple-700" },
    [UserTier.TIER_3]: { bg: "bg-amber-100", text: "text-amber-700" },
  };

  const colors = tierColors[tier as UserTier] || tierColors[UserTier.TIER_0];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-sm font-semibold`}
    >
      {tier}
      {showLabel && <span className="text-xs ml-1">({tierData.name})</span>}
    </span>
  );
}

interface TierLockedProps {
  requiredTier: UserTier;
  userTier?: UserTier;
}

export function TierLocked({
  requiredTier,
  userTier = UserTier.TIER_0,
}: TierLockedProps) {
  const requiredTierData = TIER_LEVELS[requiredTier];
  const userTierData = TIER_LEVELS[userTier];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <Lock className="w-8 h-8 text-gray-400 mb-3" />
      <p className="text-gray-600 font-semibold mb-2">
        This feature requires {requiredTierData.name} tier
      </p>
      <p className="text-gray-500 text-sm mb-4">
        Your current tier: {userTierData.name}
      </p>
      {userTier !== requiredTier && (
        <button className="btn-primary px-4 py-2 text-sm">Upgrade Now</button>
      )}
    </div>
  );
}

interface TierComparisonProps {
  selectedTier?: UserTier;
}

export function TierComparison({ selectedTier }: TierComparisonProps) {
  const tiers = Object.values(UserTier);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {tiers.map((tier) => {
        const tierData = TIER_LEVELS[tier];
        const isSelected = selectedTier === tier;

        return (
          <div
            key={tier}
            className={`card p-6 ${isSelected ? "ring-2 ring-clay" : ""}`}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-soil mb-2">
                {tierData.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {tierData.description}
              </p>
              <div className="text-3xl font-bold text-clay mb-2">
                ${tierData.priceMonthly}
              </div>
              <p className="text-xs text-gray-500">/month</p>
            </div>

            <ul className="space-y-3 mb-6">
              {tierData.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-clay mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {isSelected ? (
              <button className="btn-primary w-full" disabled>
                Current Plan
              </button>
            ) : (
              <button className="btn-secondary w-full">Choose Plan</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
