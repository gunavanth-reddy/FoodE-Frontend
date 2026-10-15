import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../../../context/AuthContext';

import {
  Plus,
  MagnifyingGlass,
  X,
  ForkKnife,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
  SquaresFour,
  FloppyDisk,
} from 'phosphor-react-native';
import {useFocusEffect} from '@react-navigation/native';
import AsyncImage from '../../../components/images/AsyncImage';

import {
  getMyCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} from '../services/categoryService';

import {
  getMyFoods,
  toggleFoodAvailability,
  deleteFood,
} from '../services/foodService';

// =====================================================
// TYPES
// =====================================================

interface Category {
  _id: string;
  restaurant: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

interface Food {
  _id: string;
  restaurant: string;

  category:
    | string
    | {
        _id: string;
        name: string;
      };

  name: string;
  description?: string;
  image?: string;

  price: number;
  discountedPrice?: number | null;

  isAvailable: boolean;

  preparationTime: number;
  isVegetarian: boolean;

  rating: number;
  totalReviews: number;
}

// =====================================================
// SCREEN
// =====================================================

const RestaurantMenuScreen = ({
  navigation,
}: any) => {
  const {token} = useAuth();

  // ===================================================
  // STATES
  // ===================================================

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [foods, setFoods] =
    useState<Food[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  // ===================================================
  // CATEGORY MODAL
  // ===================================================

  const [categoryModalVisible, setCategoryModalVisible] =
    useState(false);

  const [categoryModalMode, setCategoryModalMode] =
    useState<'add' | 'edit'>('add');

  const [categoryName, setCategoryName] =
    useState('');

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  // ===================================================
  // LOAD MENU
  // ===================================================

  const loadMenu = useCallback(
    async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          categoryData,
          foodData,
        ] = await Promise.all([
          getMyCategories(token),
          getMyFoods(token),
        ]);

        const normalizedCategories: Category[] =
          Array.isArray(categoryData)
            ? (categoryData as Category[])
            : Array.isArray(
                (categoryData as any)?.categories,
              )
            ? (categoryData as any).categories
            : [];

        const normalizedFoods: Food[] =
          Array.isArray(foodData)
            ? (foodData as Food[])
            : Array.isArray(
                (foodData as any)?.foods,
              )
            ? (foodData as any).foods
            : [];

        setCategories(normalizedCategories);
        setFoods(normalizedFoods);
      } catch (error: any) {
        console.log(
          'LOAD MENU ERROR:',
          error,
        );

        Alert.alert(
          'Error',
          error?.message ||
            'Failed to load menu.',
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      loadMenu();
    }, [loadMenu]),
  );

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh =
    async () => {
      if (!token) {
        return;
      }

      try {
        setRefreshing(true);

        const [
          categoryData,
          foodData,
        ] = await Promise.all([
          getMyCategories(token),
          getMyFoods(token),
        ]);

        const normalizedCategories: Category[] =
          Array.isArray(categoryData)
            ? (categoryData as Category[])
            : Array.isArray(
                (categoryData as any)?.categories,
              )
            ? (categoryData as any).categories
            : [];

        const normalizedFoods: Food[] =
          Array.isArray(foodData)
            ? (foodData as Food[])
            : Array.isArray(
                (foodData as any)?.foods,
              )
            ? (foodData as any).foods
            : [];

        setCategories(normalizedCategories);
        setFoods(normalizedFoods);
      } catch (error: any) {
        Alert.alert(
          'Error',
          error?.message ||
            'Failed to refresh menu.',
        );
      } finally {
        setRefreshing(false);
      }
    };

  // ===================================================
  // CATEGORY FILTERS
  // ===================================================

  const categoryFilters =
    useMemo(() => {
      return [
        {
          id: 'all',
          name: 'All',
        },

        ...categories
          .filter(
            category =>
              category.isActive,
          )
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder,
          )
          .map(category => ({
            id: category._id,
            name: category.name,
          })),
      ];
    }, [categories]);

  // ===================================================
  // FOOD CATEGORY ID
  // ===================================================

  const getFoodCategoryId =
    (food: Food): string => {
      if (
        typeof food.category ===
        'string'
      ) {
        return food.category;
      }

      return food.category?._id || '';
    };

  // ===================================================
  // FOOD CATEGORY NAME
  // ===================================================

  const getFoodCategoryName =
    (food: Food): string => {
      if (
        typeof food.category ===
        'object'
      ) {
        return (
          food.category?.name ||
          ''
        );
      }

      const category =
        categories.find(
          item =>
            item._id ===
            food.category,
        );

      return category?.name || '';
    };

  // ===================================================
  // FILTER FOODS
  // ===================================================

  const filteredFoods =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return foods.filter(
        food => {
          const categoryMatch =
            selectedCategory ===
              'all' ||
            getFoodCategoryId(
              food,
            ) ===
              selectedCategory;

          const searchMatch =
            !query ||
            food.name
              .toLowerCase()
              .includes(query) ||
            (food.description ||
              '')
              .toLowerCase()
              .includes(query);

          return (
            categoryMatch &&
            searchMatch
          );
        },
      );
    }, [
      foods,
      categories,
      selectedCategory,
      search,
    ]);

  // ===================================================
  // ADD CATEGORY
  // ===================================================

  const handleAddCategory =
    () => {
      console.log(
        'ADD CATEGORY PRESSED',
      );

      setCategoryModalMode(
        'add',
      );

      setCategoryName('');

      setEditingCategory(null);

      setCategoryModalVisible(
        true,
      );
    };

  // ===================================================
  // EDIT CATEGORY
  // ===================================================

  const handleEditCategory =
    (category: Category) => {
      setCategoryModalMode(
        'edit',
      );

      setCategoryName(
        category.name,
      );

      setEditingCategory(
        category,
      );

      setCategoryModalVisible(
        true,
      );
    };

  // ===================================================
  // CLOSE CATEGORY MODAL
  // ===================================================

  const closeCategoryModal =
    () => {
      if (saving) {
        return;
      }

      setCategoryModalVisible(
        false,
      );

      setCategoryName('');

      setEditingCategory(null);
    };

  // ===================================================
  // SAVE CATEGORY
  // ===================================================

  const handleSaveCategory =
    async () => {
      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login again.',
        );
        return;
      }

      const name =
        categoryName.trim();

      if (!name) {
        Alert.alert(
          'Category Name Required',
          'Please enter a category name.',
        );
        return;
      }

      try {
        setSaving(true);

        if (
          categoryModalMode ===
          'add'
        ) {
          await createCategory(
            token,
            {
              name,
              description: '',
              displayOrder:
                categories.length,
            },
          );

          Alert.alert(
            'Success',
            'Category created successfully.',
          );
        } else {
          if (
            !editingCategory
          ) {
            return;
          }

          await updateCategory(
            token,
            editingCategory._id,
            {
              name,
            },
          );

          Alert.alert(
            'Success',
            'Category updated successfully.',
          );
        }

        closeCategoryModal();

        await loadMenu();
      } catch (error: any) {
        console.log(
          'SAVE CATEGORY ERROR:',
          error,
        );

        Alert.alert(
          'Error',
          error?.message ||
            'Failed to save category.',
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // DELETE CATEGORY
  // ===================================================

  const handleDeleteCategory =
    (category: Category) => {
      if (!token) {
        return;
      }

      Alert.alert(
        'Delete Category',
        `Delete "${category.name}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  setSaving(true);

                  await deleteCategory(
                    token,
                    category._id,
                  );

                  if (
                    selectedCategory ===
                    category._id
                  ) {
                    setSelectedCategory(
                      'all',
                    );
                  }

                  await loadMenu();

                  Alert.alert(
                    'Success',
                    'Category deleted.',
                  );
                } catch (
                  error: any
                ) {
                  Alert.alert(
                    'Error',
                    error?.message ||
                      'Failed to delete category.',
                  );
                } finally {
                  setSaving(false);
                }
              },
          },
        ],
      );
    };

  // ===================================================
  // TOGGLE CATEGORY
  // ===================================================

  const handleToggleCategory =
    async (
      category: Category,
    ) => {
      if (!token) {
        return;
      }

      const newStatus =
        !category.isActive;

      try {
        setCategories(
          current =>
            current.map(
              item =>
                item._id ===
                category._id
                  ? {
                      ...item,
                      isActive:
                        newStatus,
                    }
                  : item,
            ),
        );

        await updateCategoryStatus(
          token,
          category._id,
          newStatus,
        );
      } catch (error: any) {
        await loadMenu();

        Alert.alert(
          'Error',
          error?.message ||
            'Failed to update category.',
        );
      }
    };

  // ===================================================
  // ADD FOOD
  // ===================================================

  const handleAddFood =
    () => {
      if (
        categories.length ===
        0
      ) {
        Alert.alert(
          'Create Category First',
          'Please create a category before adding food.',
        );

        return;
      }

      navigation.navigate(
        'AddFood',
      );
    };

  // ===================================================
  // EDIT FOOD
  // ===================================================

  const handleEditFood =
    (food: Food) => {
      navigation.navigate(
        'EditFood',
        {
          food,
        },
      );
    };

  // ===================================================
  // TOGGLE FOOD
  // ===================================================

  const handleToggleFood =
    async (food: Food) => {
      if (!token) {
        return;
      }

      const newValue =
        !food.isAvailable;

      try {
        setFoods(
          current =>
            current.map(
              item =>
                item._id ===
                food._id
                  ? {
                      ...item,
                      isAvailable:
                        newValue,
                    }
                  : item,
            ),
        );

        await toggleFoodAvailability(
          token,
          food._id,
        );
      } catch (error: any) {
        await loadMenu();

        Alert.alert(
          'Error',
          error?.message ||
            'Failed to update food availability.',
        );
      }
    };

  // ===================================================
  // DELETE FOOD
  // ===================================================

  const handleDeleteFood =
    (food: Food) => {
      if (!token) {
        return;
      }

      Alert.alert(
        'Delete Food',
        `Delete "${food.name}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },

          {
            text: 'Delete',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  setSaving(true);

                  await deleteFood(
                    token,
                    food._id,
                  );

                  setFoods(
                    current =>
                      current.filter(
                        item =>
                          item._id !==
                          food._id,
                      ),
                  );

                  Alert.alert(
                    'Success',
                    'Food deleted.',
                  );
                } catch (
                  error: any
                ) {
                  Alert.alert(
                    'Error',
                    error?.message ||
                      'Failed to delete food.',
                  );
                } finally {
                  setSaving(false);
                }
              },
          },
        ],
      );
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
        edges={['top', 'left', 'right']}>
        <StatusBar hidden={true} />

        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text
          style={
            styles.loadingText
          }>
          Loading menu...
        </Text>
      </SafeAreaView>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>

      <StatusBar hidden={true} />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            colors={[
              '#FF7A00',
            ]}
            tintColor="#FF7A00"
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }>

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <View
          style={
            styles.header
          }>

          <View>
            <Text
              style={
                styles.headerSmall
              }>
              Restaurant
            </Text>

            <Text
              style={
                styles.headerTitle
              }>
              Menu
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleAddFood
            }
            style={
              styles.addFoodButton
            }>

            <View style={styles.buttonContent}>
              <Plus size={17} color="#FFFFFF" weight="bold" />
              <Text style={styles.addFoodButtonText}>
                Add Food
              </Text>
            </View>

          </TouchableOpacity>

        </View>

        {/* ========================================= */}
        {/* SEARCH */}
        {/* ========================================= */}

        <View
          style={
            styles.searchBox
          }>

          <MagnifyingGlass
            size={20}
            color="#777"
            weight="regular"
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search food..."
            placeholderTextColor="#999"
            style={
              styles.searchInput
            }
          />

          {search.length >
            0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }>
              <X
                size={19}
                color="#777"
                weight="bold"
              />
            </TouchableOpacity>
          )}

        </View>

        {/* ========================================= */}
        {/* CATEGORY HEADER */}
        {/* ========================================= */}

        <View
          style={
            styles.sectionHeader
          }>

          <View>
            <Text
              style={
                styles.sectionTitle
              }>
              Categories
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              Manage your menu categories
            </Text>
          </View>

          {/* IMPORTANT BUTTON */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              handleAddCategory
            }
            style={
              styles.categoryButton
            }>

            <View style={styles.buttonContent}>
              <Plus size={15} color="#FF7A00" weight="bold" />
              <Text style={styles.categoryButtonText}>
                Category
              </Text>
            </View>

          </TouchableOpacity>

        </View>

        {/* ========================================= */}
        {/* CATEGORY FILTER */}
        {/* ========================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryScroll
          }>

          {categoryFilters.map(
            category => {
              const active =
                selectedCategory ===
                category.id;

              return (
                <TouchableOpacity
                  key={
                    category.id
                  }
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    setSelectedCategory(
                      category.id,
                    )
                  }
                  style={[
                    styles.filterButton,
                    active &&
                      styles.filterButtonActive,
                  ]}>

                  <Text
                    style={[
                      styles.filterText,
                      active &&
                        styles.filterTextActive,
                    ]}>
                    {
                      category.name
                    }
                  </Text>

                </TouchableOpacity>
              );
            },
          )}

        </ScrollView>

        {/* ========================================= */}
        {/* CATEGORY MANAGEMENT */}
        {/* ========================================= */}

        {categories.length >
          0 && (
          <View
            style={
              styles.categoryList
            }>

            {categories.map(
              category => (
                <View
                  key={
                    category._id
                  }
                  style={
                    styles.categoryCard
                  }>

                  <View
                    style={
                      styles.categoryInfo
                    }>

                    <Text
                      style={
                        styles.categoryName
                      }>
                      {
                        category.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.categoryStatus
                      }>
                      {category.isActive
                        ? 'Active'
                        : 'Disabled'}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.categoryActions
                    }>

                    <TouchableOpacity
                      onPress={() =>
                        handleToggleCategory(
                          category,
                        )
                      }>

                      {category.isActive ? (
                        <XCircle
                          size={20}
                          color="#FF7A00"
                          weight="regular"
                        />
                      ) : (
                        <CheckCircle
                          size={20}
                          color="#20A957"
                          weight="regular"
                        />
                      )}

                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        handleEditCategory(
                          category,
                        )
                      }>

                      <PencilSimple
                        size={20}
                        color="#FF7A00"
                        weight="regular"
                      />

                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteCategory(
                          category,
                        )
                      }>

                      <Trash
                        size={20}
                        color="#E04444"
                        weight="regular"
                      />

                    </TouchableOpacity>

                  </View>

                </View>
              ),
            )}

          </View>
        )}

        {/* ========================================= */}
        {/* FOOD HEADER */}
        {/* ========================================= */}

        <View
          style={
            styles.foodHeader
          }>

          <View>
            <Text
              style={
                styles.foodHeaderTitle
              }>
              Food Items
            </Text>

            <Text
              style={
                styles.foodHeaderSubtitle
              }>
              {
                filteredFoods.length
              }{' '}
              items
            </Text>
          </View>

          <View
            style={
              styles.availableBadge
            }>

            <View
              style={
                styles.greenDot
              }
            />

            <Text
              style={
                styles.availableText
              }>
              {
                foods.filter(
                  food =>
                    food.isAvailable,
                ).length
              }{' '}
              available
            </Text>

          </View>

        </View>

        {/* ========================================= */}
        {/* FOOD LIST */}
        {/* ========================================= */}

        {filteredFoods.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }>

            <View style={styles.emptyIcon}>
              <ForkKnife
                size={38}
                color="#FF7A00"
                weight="duotone"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              {foods.length ===
              0
                ? 'No food items yet'
                : 'No food found'}
            </Text>

            <Text
              style={
                styles.emptyDescription
              }>
              {foods.length ===
              0
                ? 'Add your first food item to start building your menu.'
                : 'Try another category or search term.'}
            </Text>

            {foods.length ===
              0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  handleAddFood
                }
                style={
                  styles.emptyButton
                }>

                <View style={styles.buttonContent}>
                  <Plus size={17} color="#FFFFFF" weight="bold" />
                  <Text style={styles.emptyButtonText}>
                    Add Food
                  </Text>
                </View>

              </TouchableOpacity>
            )}

          </View>
        ) : (
          <View
            style={
              styles.foodList
            }>

            {filteredFoods.map(
              food => (
                <View
                  key={
                    food._id
                  }
                  style={
                    styles.foodCard
                  }>

                  {/* IMAGE */}

                  <View
                    style={
                      styles.foodImage
                    }>

                    <AsyncImage
                      source={food.image}
                      style={styles.foodImageActual}
                      kind="food"
                    />

                  </View>

                  {/* INFO */}

                  <View
                    style={
                      styles.foodInfo
                    }>

                    <View
                      style={
                        styles.foodNameRow
                      }>

                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.foodName
                        }>
                        {
                          food.name
                        }
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          handleEditFood(
                            food,
                          )
                        }>

                        <PencilSimple
                          size={19}
                          color="#FF7A00"
                          weight="regular"
                        />

                      </TouchableOpacity>

                    </View>

                    <Text
                      style={
                        styles.foodCategory
                      }>
                      {
                        getFoodCategoryName(
                          food,
                        )
                      }
                    </Text>

                    <Text
                      numberOfLines={
                        2
                      }
                      style={
                        styles.foodDescription
                      }>
                      {food.description ||
                        'No description'}
                    </Text>

                    <View
                      style={
                        styles.foodBottom
                      }>

                      <Text
                        style={
                          styles.foodPrice
                        }>
                        ₹
                        {
                          food.price
                        }
                      </Text>

                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        onPress={() =>
                          handleToggleFood(
                            food,
                          )
                        }
                        style={[
                          styles.availabilityButton,
                          food.isAvailable
                            ? styles.availableButton
                            : styles.unavailableButton,
                        ]}>

                        <View
                          style={[
                            styles.statusDot,
                            food.isAvailable
                              ? styles.availableDot
                              : styles.unavailableDot,
                          ]}
                        />

                        <Text
                          style={
                            styles.availabilityText
                          }>
                          {food.isAvailable
                            ? 'Available'
                            : 'Unavailable'}
                        </Text>

                      </TouchableOpacity>

                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteFood(
                          food,
                        )
                      }>

                      <Trash
                        size={19}
                        color="#E04444"
                        weight="regular"
                      />

                    </TouchableOpacity>

                  </View>

                </View>
              ),
            )}

          </View>
        )}

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

      {/* ========================================= */}
      {/* CATEGORY MODAL */}
      {/* ========================================= */}

      <Modal
        visible={
          categoryModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeCategoryModal
        }>

        <View
          style={
            styles.modalOverlay
          }>

          <View
            style={
              styles.modalCard
            }>

            <Text
              style={
                styles.modalTitle
              }>
              {categoryModalMode ===
              'add'
                ? 'Add Category'
                : 'Edit Category'}
            </Text>

            <Text
              style={
                styles.modalSubtitle
              }>
              Create a category for your restaurant menu.
            </Text>

            <TextInput
              value={
                categoryName
              }
              onChangeText={
                setCategoryName
              }
              placeholder="Enter category name"
              placeholderTextColor="#999"
              autoFocus
              style={
                styles.modalInput
              }
            />

            <View
              style={
                styles.modalButtons
              }>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeCategoryModal
                }
                disabled={
                  saving
                }
                style={
                  styles.cancelButton
                }>

                <Text
                  style={
                    styles.cancelButtonText
                  }>
                  Cancel
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  handleSaveCategory
                }
                disabled={
                  saving
                }
                style={
                  styles.saveButton
                }>

                {saving ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <View style={styles.buttonContent}>
                    <FloppyDisk size={17} color="#FFFFFF" weight="bold" />
                    <Text style={styles.saveButtonText}>
                      Save
                    </Text>
                  </View>
                )}

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

      {/* ========================================= */}
      {/* SAVING OVERLAY */}
      {/* ========================================= */}

      {saving && (
        <View
          pointerEvents="none"
          style={
            styles.savingOverlay
          }>

          <ActivityIndicator
            color="#FFFFFF"
            size="small"
          />

          <Text
            style={
              styles.savingText
            }>
            Updating...
          </Text>

        </View>
      )}

    </SafeAreaView>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#F8F8FA',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    // HEADER

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 20,
    },

    headerSmall: {
      fontSize: 13,
      color: '#888',
      marginBottom: 3,
    },

    headerTitle: {
      fontSize: 29,
      fontWeight: '800',
      color: '#111',
    },

    addFoodButton: {
      backgroundColor:
        '#FF7A00',
      paddingHorizontal: 17,
      paddingVertical: 12,
      borderRadius: 14,
    },

    addFoodButtonText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '800',
    },

    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },

    // SEARCH

    searchBox: {
      height: 52,
      backgroundColor:
        '#FFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#EEEEF2',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginBottom: 25,
    },


    searchInput: {
      flex: 1,
      fontSize: 14,
      color: '#111',
    },


    // SECTIONS

    sectionHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 13,
    },

    sectionTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#111',
    },

    sectionSubtitle: {
      fontSize: 12,
      color: '#888',
      marginTop: 3,
    },

    categoryButton: {
      backgroundColor:
        '#FFF0E3',
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 11,
    },

    categoryButtonText: {
      color: '#FF7A00',
      fontSize: 12,
      fontWeight: '800',
    },

    // FILTER

    categoryScroll: {
      paddingBottom: 16,
      gap: 9,
    },

    filterButton: {
      backgroundColor:
        '#FFF',
      paddingHorizontal: 17,
      paddingVertical: 10,
      borderRadius: 13,
    },

    filterButtonActive: {
      backgroundColor:
        '#FF7A00',
    },

    filterText: {
      color: '#777',
      fontSize: 12,
      fontWeight: '700',
    },

    filterTextActive: {
      color: '#FFF',
    },

    // CATEGORY LIST

    categoryList: {
      marginBottom: 24,
      gap: 8,
    },

    categoryCard: {
      backgroundColor:
        '#FFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#EEEEF2',
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    categoryInfo: {
      flex: 1,
    },

    categoryName: {
      fontSize: 14,
      fontWeight: '800',
      color: '#111',
    },

    categoryStatus: {
      fontSize: 10,
      color: '#888',
      marginTop: 3,
    },

    categoryActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },



    // FOOD HEADER

    foodHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },

    foodHeaderTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#111',
    },

    foodHeaderSubtitle: {
      fontSize: 11,
      color: '#888',
      marginTop: 3,
    },

    availableBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#EAF8EF',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
    },

    greenDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        '#20A957',
      marginRight: 6,
    },

    availableText: {
      fontSize: 10,
      color: '#267A4A',
      fontWeight: '700',
    },

    // FOOD

    foodList: {
      gap: 12,
    },

    foodCard: {
      backgroundColor:
        '#FFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#EEEEF2',
      padding: 13,
      flexDirection: 'row',
    },

    foodImage: {
      width: 90,
      height: 90,
      borderRadius: 15,
      backgroundColor:
        '#FFF0E3',
      alignItems: 'center',
      justifyContent:
        'center',
      overflow: 'hidden',
    },

    foodImageActual: {
      width: '100%',
      height: '100%',
    },


    foodInfo: {
      flex: 1,
      marginLeft: 13,
    },

    foodNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    foodName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
      color: '#111',
      marginRight: 8,
    },


    foodCategory: {
      color: '#FF7A00',
      fontSize: 10,
      fontWeight: '700',
      marginTop: 3,
    },

    foodDescription: {
      color: '#888',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 5,
    },

    foodBottom: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginTop: 9,
    },

    foodPrice: {
      color: '#111',
      fontSize: 16,
      fontWeight: '800',
    },

    availabilityButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
    },

    availableButton: {
      backgroundColor:
        '#EAF8EF',
    },

    unavailableButton: {
      backgroundColor:
        '#F1F1F2',
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    availableDot: {
      backgroundColor:
        '#20A957',
    },

    unavailableDot: {
      backgroundColor:
        '#999',
    },

    availabilityText: {
      color: '#555',
      fontSize: 9,
      fontWeight: '800',
    },


    // EMPTY

    emptyIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: '#FFF0E3',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    foodPlaceholderIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyCard: {
      backgroundColor:
        '#FFF',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      justifyContent:
        'center',
    },


    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#111',
    },

    emptyDescription: {
      textAlign: 'center',
      color: '#888',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
    },

    emptyButton: {
      marginTop: 15,
      backgroundColor:
        '#FF7A00',
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 13,
    },

    emptyButtonText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '800',
    },

    // MODAL

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.55)',
      justifyContent:
        'center',
      alignItems: 'center',
      paddingHorizontal: 25,
    },

    modalCard: {
      width: '100%',
      backgroundColor:
        '#FFF',
      borderRadius: 22,
      padding: 23,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111',
    },

    modalSubtitle: {
      fontSize: 12,
      color: '#888',
      lineHeight: 18,
      marginTop: 5,
      marginBottom: 18,
    },

    modalInput: {
      height: 52,
      borderWidth: 1,
      borderColor: '#E1E1E1',
      borderRadius: 14,
      paddingHorizontal: 15,
      fontSize: 14,
      color: '#111',
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
    },

    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        '#F1F1F2',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    cancelButtonText: {
      color: '#555',
      fontSize: 13,
      fontWeight: '700',
    },

    saveButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        '#FF7A00',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    saveButtonText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '800',
    },

    // SAVING

    savingOverlay: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 25,
      height: 45,
      borderRadius: 14,
      backgroundColor:
        '#171717',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    savingText: {
      color: '#FFF',
      fontSize: 11,
      fontWeight: '700',
    },

    loadingContainer: {
      flex: 1,
      backgroundColor:
        '#F8F8FA',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 12,
      color: '#777',
      fontSize: 13,
    },

    bottomSpace: {
      height: 80,
    },
  });

export default RestaurantMenuScreen;
