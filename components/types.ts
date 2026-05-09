export type UrgencyLevel = "red" | "yellow" | "green";

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate: string; // ISO string
  daysLeft: number;
  urgency: UrgencyLevel;
  estimatedValue: number;
  emoji: string;
  isShared: boolean; // posted to social board
  autoShared: boolean; // auto-posted because red
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  expiringIngredients: string[];
  allIngredients: string[];
  savingsEstimate: number;
}

export interface FriendPost {
  id: string;
  friendName: string;
  friendInitials: string;
  ingredientName: string;
  ingredientEmoji: string;
  daysLeft: number;
  urgency: UrgencyLevel;
  quantity: string;
  isAutoShared: boolean; // true = expiring, false = surplus
  requested: boolean;
}

export interface UserProfile {
  name: string;
  initials: string;
  savedThisMonth: number;
  ingredientsRescued: number;
  co2Saved: number;
  mealsCooked: number;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  type: "warning" | "info" | "success";
  read: boolean;
}
