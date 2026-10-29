import {ImageSourcePropType} from 'react-native';

export interface CategoryItem {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

export const categories: CategoryItem[] = [
  {
    id: '1',
    name: 'Biryani',
    image: require('../../../../../assets/categories/biriyani.png'),
  },
  {
    id: '2',
    name: 'Veg Biryani',
    image: require('../../../../../assets/categories/veg_biriyani.webp'),
  },
  {
    id: '3',
    name: 'Chinese',
    image: require('../../../../../assets/categories/chinese.webp'),
  },
  {
    id: '14',
    name: 'Fruits',
    image: require('../../../../../assets/categories/fruits.png'),
  },
  {
    id: '12',
    name: 'Mini Burgers',
    image: require('../../../../../assets/categories/mini_burgers.png'),
  },
  {
    id: '15',
    name: 'Bakery',
    image: require('../../../../../assets/categories/bakery.png'),
  },
  {
    id: '16',
    name: 'Curries',
    image: require('../../../../../assets/categories/curry.png'),
  },
  {
    id: '4',
    name: 'Cakes',
    image: require('../../../../../assets/categories/cakes.png'),
  },
  {
    id: '5',
    name: 'Snacks',
    image: require('../../../../../assets/categories/snacks.png'),
  },
  {
    id: '6',
    name: 'Pickles',
    image: require('../../../../../assets/categories/pickles.png'),
  },
  {
    id: '7',
    name: 'Brownies',
    image: require('../../../../../assets/categories/brownies.png'),
  },
  {
    id: '8',
    name: 'Tubs',
    image: require('../../../../../assets/categories/tubs.png'),
  },
  {
    id: '9',
    name: 'Brownie Slabs',
    image: require('../../../../../assets/categories/brownie_slabs.png'),
  },
  {
    id: '10',
    name: 'Drinks',
    image: require('../../../../../assets/categories/drinks.png'),
  },
  {
    id: '11',
    name: 'Pizza',
    image: require('../../../../../assets/categories/pizza.png'),
  },
  {
    id: '13',
    name: 'Sandwich',
    image: require('../../../../../assets/categories/sandwich.png'),
  },
  {
    id: 'all',
    name: 'See All',
    image: require('../../../../../assets/categories/see_all.png'),
  },
];
