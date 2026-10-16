// =====================================================
// FOOD E RESTAURANT TYPE
// =====================================================

export interface Restaurant {
  // MongoDB restaurant ID
  _id: string;

  // Backward-compatible IDs for older UI components
  id?: string;
  backendId?: string;

  // Basic information
  name: string;
  description?: string;

  // Images
  image?: string;
  logo?: string;
  coverImage?: string;

  // Location
  address?: string;
  location?: string;
  city?: string;

  // Cuisine
  cuisine?: string | string[];
  cuisines?: string | string[];

  // Restaurant information
  rating?: number;
  totalReviews?: number;
  deliveryTime?: string | {min?: number; max?: number};
  deliveryFee?: number;
  minimumOrder?: number;
  priceForTwo?: string | number;

  // Offers
  offer?: string;
  freeDelivery?: boolean;

  // Status
  isOpen?: boolean;
  isActive?: boolean;
  isApproved?: boolean;

  // Type
  isVeg?: boolean;

  // Contact
  phone?: string;
  email?: string;

  // Timing
  openingTime?: string;
  closingTime?: string;

  // Database timestamps
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// RESTAURANT ID HELPER
// =====================================================

export const getRestaurantId = (
  restaurant: Restaurant,
): string => {
  return (
    restaurant._id ||
    restaurant.backendId ||
    restaurant.id ||
    ''
  );
};

// =====================================================
// CUISINE HELPER
// =====================================================

export const getRestaurantCuisine = (
  restaurant: Restaurant,
): string[] => {
  const cuisine =
    restaurant.cuisine ?? restaurant.cuisines;

  if (!cuisine) {
    return [];
  }

  return Array.isArray(cuisine)
    ? cuisine
    : [cuisine];
};
