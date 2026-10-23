export interface Food {
  id: string;
  name: string;
  image: any;
  restaurant: string;
  rating: number;
  price: number;
  originalPrice?: number;
  category: 'veg' | 'nonVeg';
  isRecommended?: boolean;
  isPopular?: boolean;
  under20?: boolean;
}

export const foodData: Food[] = [
  {
    id: '1',
    name: 'Chicken Biryani',
    restaurant: 'Biryani Palace',
    image: require('../../../../../assets/images/foods/food1.jpg'),
    rating: 4.9,
    price: 249,
    originalPrice: 299,
    category: 'nonVeg',
    isPopular: true,
    isRecommended: true,
    under20: false,
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    restaurant: 'Veg Delight',
    image: require('../../../../../assets/images/foods/food2.jpg'),
    rating: 4.8,
    price: 199,
    originalPrice: 249,
    category: 'veg',
    isPopular: true,
    isRecommended: true,
    under20: false,
  },
  {
    id: '3',
    name: 'Chicken Burger',
    restaurant: 'Burger House',
    image: require('../../../../../assets/images/foods/food3.jpg'),
    rating: 4.7,
    price: 179,
    originalPrice: 229,
    category: 'nonVeg',
    isRecommended: true,
    under20: true,
  },
  {
    id: '4',
    name: 'Veg Burger',
    restaurant: 'Burger House',
    image: require('../../../../../assets/images/foods/food4.jpg'),
    rating: 4.6,
    price: 159,
    originalPrice: 199,
    category: 'veg',
    isRecommended: true,
    under20: true,
  },
  {
    id: '5',
    name: 'Chicken Shawarma',
    restaurant: 'Arabian Grill',
    image: require('../../../../../assets/images/foods/food5.jpg'),
    rating: 4.8,
    price: 189,
    originalPrice: 229,
    category: 'nonVeg',
    isPopular: true,
    under20: true,
  },
  {
    id: '6',
    name: 'Veg Fried Rice',
    restaurant: 'Chinese Wok',
    image: require('../../../../../assets/images/foods/food6.jpg'),
    rating: 4.5,
    price: 169,
    originalPrice: 199,
    category: 'veg',
    under20: true,
  },
  {
    id: '7',
    name: 'Chicken Pizza',
    restaurant: 'Pizza Hub',
    image: require('../../../../../assets/images/foods/food7.jpg'),
    rating: 4.8,
    price: 299,
    originalPrice: 349,
    category: 'nonVeg',
    isRecommended: true,
  },
  {
    id: '8',
    name: 'Margherita Pizza',
    restaurant: 'Pizza Hub',
    image: require('../../../../../assets/images/foods/food8.jpg'),
    rating: 4.7,
    price: 249,
    originalPrice: 299,
    category: 'veg',
    isPopular: true,
  },
  {
    id: '9',
    name: 'Grilled Chicken',
    restaurant: 'BBQ Nation',
    image: require('../../../../../assets/images/foods/food9.jpg'),
    rating: 4.9,
    price: 329,
    originalPrice: 379,
    category: 'nonVeg',
    isRecommended: true,
  },
  {
    id: '10',
    name: 'French Fries',
    restaurant: 'Snack Point',
    image: require('../../../../../assets/images/foods/food10.jpg'),
    rating: 4.4,
    price: 99,
    originalPrice: 129,
    category: 'veg',
    under20: true,
  },
  {
    id: '11',
    name: 'Chicken Wings',
    restaurant: 'KFC Style',
    image: require('../../../../../assets/images/foods/food11.jpg'),
    rating: 4.8,
    price: 219,
    originalPrice: 259,
    category: 'nonVeg',
    isPopular: true,
  },
  {
    id: '12',
    name: 'Veg Noodles',
    restaurant: 'Chinese Wok',
    image: require('../../../../../assets/images/foods/food12.jpg'),
    rating: 4.6,
    price: 149,
    originalPrice: 179,
    category: 'veg',
    isRecommended: true,
    under20: true,
  },
];

// ⭐ Top Rated
export const topRatedFoods = [...foodData].sort(
  (a, b) => b.rating - a.rating,
);

// ⚡ Under 20 Minutes
export const under20Minutes = foodData.filter(
  food => food.under20,
);

// Chicken Picks
export const chickenPicks = foodData.filter(
  food => food.category === 'nonVeg',
);

// Veg Picks
export const vegPicks = foodData.filter(
  food => food.category === 'veg',
);

// Recommended For You
export const recommendedFoods = foodData.filter(
  food => food.isRecommended,
);

// Popular Foods
export const popularFoods = foodData.filter(
  food => food.isPopular,
);