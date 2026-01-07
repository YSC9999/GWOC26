// Tier System Implementation
// Tiers determine user access levels and product availability

export enum UserTier {
  TIER_0 = "tier-0",    // Free users
  TIER_1 = "tier-1",    // Basic subscribers
  TIER_2 = "tier-2",    // Premium subscribers
  TIER_3 = "tier-3",    // VIP/Admin users
}

export interface TierLevel {
  name: string;
  description: string;
  order: number;
  permissions: string[];
  priceMonthly: number;
  features: string[];
}

export const TIER_LEVELS: Record<UserTier, TierLevel> = {
  [UserTier.TIER_0]: {
    name: "Guest",
    description: "Free tier with basic access",
    order: 0,
    permissions: ["view_products", "view_home", "view_about"],
    priceMonthly: 0,
    features: [
      "Browse all products",
      "Read blog posts",
      "Access public workshops",
    ],
  },
  [UserTier.TIER_1]: {
    name: "Basic",
    description: "Basic subscriber with standard features",
    order: 1,
    permissions: [
      "view_products",
      "view_home",
      "view_about",
      "purchase_items",
      "access_workshops",
      "newsletter",
    ],
    priceMonthly: 4.99,
    features: [
      "All free features",
      "Purchase ceramics",
      "Join workshops",
      "Newsletter",
      "10% discount",
    ],
  },
  [UserTier.TIER_2]: {
    name: "Premium",
    description: "Premium subscriber with exclusive access",
    order: 2,
    permissions: [
      "view_products",
      "view_home",
      "view_about",
      "purchase_items",
      "access_workshops",
      "newsletter",
      "exclusive_products",
      "early_access",
      "artist_chat",
    ],
    priceMonthly: 9.99,
    features: [
      "All basic features",
      "Exclusive products",
      "Early access to new releases",
      "Chat with artists",
      "20% discount",
      "Free shipping",
    ],
  },
  [UserTier.TIER_3]: {
    name: "VIP",
    description: "VIP tier with full access and special privileges",
    order: 3,
    permissions: [
      "view_products",
      "view_home",
      "view_about",
      "purchase_items",
      "access_workshops",
      "newsletter",
      "exclusive_products",
      "early_access",
      "artist_chat",
      "custom_orders",
      "admin_panel",
    ],
    priceMonthly: 19.99,
    features: [
      "All premium features",
      "Custom ceramic orders",
      "Private consultations",
      "VIP events",
      "30% discount",
      "Free shipping worldwide",
      "Personal artist liaison",
    ],
  },
};

// Helper function to check if user has permission
export function hasPermission(
  userTier: UserTier,
  requiredPermission: string
): boolean {
  const tierLevel = TIER_LEVELS[userTier];
  return tierLevel.permissions.includes(requiredPermission);
}

// Helper function to get all tiers
export function getAllTiers(): UserTier[] {
  return Object.values(UserTier);
}

// Helper function to get tier by order
export function getTierByOrder(order: number): UserTier | null {
  const tiers = Object.entries(TIER_LEVELS);
  const found = tiers.find(([_, level]) => level.order === order);
  return found ? (found[0] as UserTier) : null;
}

// Helper function to check if user tier is higher or equal
export function isTierOrHigher(userTier: UserTier, requiredTier: UserTier): boolean {
  return (
    TIER_LEVELS[userTier].order >= TIER_LEVELS[requiredTier].order
  );
}
