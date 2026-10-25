export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  image: any;
  category: string;
  price: number;
  discountedPrice?: number | null;
  rating: number;
  totalReviews?: number;
  description: string;
  isVeg: boolean;
  isPopular: boolean;
  isAvailable?: boolean;
  /** Original MongoDB food record used by authenticated actions. */
  foodRecord?: import('../../../restaurant/services/foodService').Food;
}
