import {MenuItem} from './types';

import {paradiseMenu} from './paradise';
import {pizzaHutMenu} from './pizzahut';
import {burgerKingMenu} from './burgerking';
import {mehfilMenu} from './mehfil';
import {sriKanyaMenu} from './srikanya';
import {dominosMenu} from './dominos';

export const menuData: MenuItem[] = [
  ...paradiseMenu,
  ...pizzaHutMenu,
  ...burgerKingMenu,
  ...mehfilMenu,
  ...sriKanyaMenu,
  ...dominosMenu,
];

export const getMenuByRestaurant = (
  restaurantId: string,
): MenuItem[] => {
  return menuData.filter(
    item => item.restaurantId === restaurantId,
  );
};

export const getPopularItems = (
  restaurantId: string,
): MenuItem[] => {
  return menuData.filter(
    item =>
      item.restaurantId === restaurantId &&
      item.isPopular,
  );
};

export const getCategories = (
  restaurantId: string,
): string[] => {
  const categories = menuData
    .filter(item => item.restaurantId === restaurantId)
    .map(item => item.category);

  return ['Popular', ...new Set(categories)];
};
