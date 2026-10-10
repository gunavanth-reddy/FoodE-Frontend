export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  image: any;
  category: string;
  price: number;
  rating: number;
  description: string;
  isVeg: boolean;
  isPopular: boolean;
}
