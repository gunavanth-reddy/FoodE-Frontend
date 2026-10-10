export interface MenuItem {
  id: string;
  name: string;
  image: any;
  category: 'Popular' | 'Biryani' | 'Starters' | 'Meals' | 'Drinks' | 'Desserts';
  price: number;
  rating: number;
  description: string;
  isVeg: boolean;
  isPopular: boolean;
}

export const menuData: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Dum Biryani',
    image: require('../../../assets/images/foods/food1.jpg'),
    category: 'Biryani',
    price: 249,
    rating: 4.8,
    description:
      'Authentic Hyderabadi dum biryani with juicy chicken pieces and aromatic basmati rice.',
    isVeg: false,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Mutton Dum Biryani',
    image: require('../../../assets/images/foods/food2.jpg'),
    category: 'Biryani',
    price: 329,
    rating: 4.9,
    description:
      'Slow-cooked mutton biryani prepared with premium spices.',
    isVeg: false,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Veg Dum Biryani',
    image: require('../../../assets/images/foods/food3.jpg'),
    category: 'Biryani',
    price: 199,
    rating: 4.6,
    description:
      'Flavorful vegetable dum biryani served with raita.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: '4',
    name: 'Chicken 65',
    image: require('../../../assets/images/foods/food4.jpg'),
    category: 'Starters',
    price: 219,
    rating: 4.7,
    description:
      'Crispy and spicy Chicken 65 made with traditional South Indian spices.',
    isVeg: false,
    isPopular: true,
  },
  {
    id: '5',
    name: 'Paneer 65',
    image: require('../../../assets/images/foods/food5.jpg'),
    category: 'Starters',
    price: 189,
    rating: 4.5,
    description:
      'Crispy paneer cubes tossed in spicy masala.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: '6',
    name: 'Veg Meals',
    image: require('../../../assets/images/foods/food6.jpg'),
    category: 'Meals',
    price: 179,
    rating: 4.4,
    description:
      'Complete South Indian veg meal with rice, curries and dessert.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: '7',
    name: 'Chicken Meals',
    image: require('../../../assets/images/foods/food7.jpg'),
    category: 'Meals',
    price: 249,
    rating: 4.7,
    description:
      'Full chicken meal served with rice, curry and fry.',
    isVeg: false,
    isPopular: true,
  },
  {
    id: '8',
    name: 'Coca-Cola',
    image: require('../../../assets/images/foods/food8.jpg'),
    category: 'Drinks',
    price: 49,
    rating: 4.5,
    description:
      'Chilled Coca-Cola 750 ml.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: '9',
    name: 'Fresh Lime Soda',
    image: require('../../../assets/images/foods/food9.jpg'),
    category: 'Drinks',
    price: 69,
    rating: 4.6,
    description:
      'Refreshing sweet and salted lime soda.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: '10',
    name: 'Double Ka Meetha',
    image: require('../../../assets/images/foods/food10.jpg'),
    category: 'Desserts',
    price: 99,
    rating: 4.7,
    description:
      'Traditional Hyderabadi dessert prepared with bread and dry fruits.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: '11',
    name: 'Gulab Jamun',
    image: require('../../../assets/images/foods/food11.jpg'),
    category: 'Desserts',
    price: 79,
    rating: 4.8,
    description:
      'Soft and juicy gulab jamuns served warm.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: '12',
    name: 'Ice Cream',
    image: require('../../../assets/images/foods/food12.jpg'),
    category: 'Desserts',
    price: 89,
    rating: 4.5,
    description:
      'Vanilla ice cream topped with chocolate syrup.',
    isVeg: true,
    isPopular: false,
  },
];

export const popularItems = menuData.filter(item => item.isPopular);

export const biryaniItems = menuData.filter(
  item => item.category === 'Biryani',
);

export const starterItems = menuData.filter(
  item => item.category === 'Starters',
);

export const mealItems = menuData.filter(
  item => item.category === 'Meals',
);

export const drinkItems = menuData.filter(
  item => item.category === 'Drinks',
);

export const dessertItems = menuData.filter(
  item => item.category === 'Desserts',
);
