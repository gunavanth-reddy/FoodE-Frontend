export interface FoodClassificationFields {
  foodType?: string | null;
  isVegetarian?: boolean | null;
}

// Prefer the explicit type, and use the legacy boolean only when type is absent.
export const isFoodVegetarian = ({
  foodType,
  isVegetarian,
}: FoodClassificationFields): boolean => {
  if (foodType === 'veg') {
    return isVegetarian === true;
  }

  if (foodType === 'non-veg') {
    return false;
  }

  return !foodType && isVegetarian === true;
};

export const isFoodNonVegetarian = ({
  foodType,
  isVegetarian,
}: FoodClassificationFields): boolean => {
  if (foodType === 'non-veg') {
    return isVegetarian === false;
  }

  if (foodType === 'veg') {
    return false;
  }

  return !foodType && isVegetarian === false;
};
