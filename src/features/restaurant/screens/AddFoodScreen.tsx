import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  Camera,
  Clock,
  Plus,
} from 'phosphor-react-native';

// =====================================================
// SERVICES
// =====================================================

import {
  getMyCategories,
  Category,
} from '../services/categoryService';

import {
  createFood,
  CreateFoodData,
} from '../services/foodService';
import AsyncImage from '../../../components/images/AsyncImage';

// =====================================================
// AUTH
// =====================================================

import {useAuth} from '../../../context/AuthContext';

// =====================================================
// SCREEN
// =====================================================

const AddFoodScreen = ({
  navigation,
}: any) => {

  // ===================================================
  // AUTH
  // ===================================================

  const {token} = useAuth();

  // ===================================================
  // STATES
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  // ===================================================
  // FORM
  // ===================================================

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('');

  const [price, setPrice] =
    useState('');

  const [discountedPrice, setDiscountedPrice] =
    useState('');

  const [preparationTime, setPreparationTime] =
    useState('20');

  const [image, setImage] =
    useState('');

  const [isVegetarian, setIsVegetarian] =
    useState(false);

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  const loadCategories = useCallback(async () => {
      try {
        setLoading(true);

        if (!token) {
          setCategories([]);
          return;
        }

        const data =
          await getMyCategories(token);

        const activeCategories =
          Array.isArray(data)
            ? data.filter(
                category =>
                  category.isActive,
              )
            : [];

        setCategories(
          activeCategories,
        );

        // Automatically select first category
        if (
          activeCategories.length > 0
        ) {
          setSelectedCategory(
            activeCategories[0]._id,
          );
        } else {
          setSelectedCategory('');
        }

      } catch (error: any) {
        console.log(
          'Load Categories Error:',
          error,
        );

        Alert.alert(
          'Error',
          error?.message ||
            'Failed to load categories.',
        );

      } finally {
        setLoading(false);
      }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm =
    (): boolean => {

      // Food name
      if (!name.trim()) {
        Alert.alert(
          'Required',
          'Food name is required.',
        );

        return false;
      }

      // Category
      if (!selectedCategory) {
        Alert.alert(
          'Required',
          'Please select a category.',
        );

        return false;
      }

      // Price
      if (!price.trim()) {
        Alert.alert(
          'Required',
          'Food price is required.',
        );

        return false;
      }

      const numericPrice =
        Number(price);

      if (
        Number.isNaN(
          numericPrice,
        ) ||
        numericPrice < 0
      ) {
        Alert.alert(
          'Invalid Price',
          'Please enter a valid price.',
        );

        return false;
      }

      // Discounted price
      if (
        discountedPrice.trim()
      ) {
        const discounted =
          Number(
            discountedPrice,
          );

        if (
          Number.isNaN(
            discounted,
          ) ||
          discounted < 0
        ) {
          Alert.alert(
            'Invalid Discount',
            'Please enter a valid discounted price.',
          );

          return false;
        }

        if (
          discounted >=
          numericPrice
        ) {
          Alert.alert(
            'Invalid Discount',
            'Discounted price should be less than the original price.',
          );

          return false;
        }
      }

      // Preparation time
      if (
        !preparationTime.trim()
      ) {
        Alert.alert(
          'Required',
          'Preparation time is required.',
        );

        return false;
      }

      const preparation =
        Number(
          preparationTime,
        );

      if (
        Number.isNaN(
          preparation,
        ) ||
        preparation < 0
      ) {
        Alert.alert(
          'Invalid Time',
          'Please enter a valid preparation time.',
        );

        return false;
      }

      return true;
    };

  // ===================================================
  // CREATE FOOD
  // ===================================================

  const handleCreateFood =
    async () => {

      // -----------------------------------------------
      // AUTH CHECK
      // -----------------------------------------------

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login again.',
        );

        return;
      }

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);

        // ---------------------------------------------
        // FOOD DATA
        // ---------------------------------------------

        const foodData: CreateFoodData = {
          category:
            selectedCategory,

          name:
            name.trim(),

          description:
            description.trim(),

          image:
            image.trim(),

          price:
            Number(price),

          discountedPrice:
            discountedPrice.trim()
              ? Number(
                  discountedPrice,
                )
              : null,

          preparationTime:
            Number(
              preparationTime,
            ),

          // Keep both fields in sync for backend compatibility.
          isVegetarian,
          foodType: isVegetarian ? 'veg' : 'non-veg',
        };

        console.log(
          'Creating food:',
          foodData,
        );

        // ---------------------------------------------
        // CREATE FOOD
        // ---------------------------------------------

        const response =
          await createFood(
            token,
            foodData,
          );

        console.log(
          'Food Created:',
          response,
        );

        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        Alert.alert(
          'Food Added',
          `${name.trim()} has been added to your menu.`,
          [
            {
              text: 'OK',

              onPress: () => {
                navigation.replace(
                  'RestaurantMenu',
                );
              },
            },
          ],
        );

      } catch (error: any) {

        console.log(
          'Create Food Error:',
          error,
        );

        Alert.alert(
          'Failed',
          error?.message ||
            'Unable to create food.',
        );

      } finally {
        setSaving(false);
      }
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
          Loading categories...
        </Text>

      </SafeAreaView>
    );
  }

  // ===================================================
  // NO CATEGORIES
  // ===================================================

  if (
    categories.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.emptyContainer}
        edges={['top', 'left', 'right']}>

        <StatusBar hidden={true} />

        <Text
          style={
            styles.emptyIcon
          }>
          📂
        </Text>

        <Text
          style={
            styles.emptyTitle
          }>
          No Categories Yet
        </Text>

        <Text
          style={
            styles.emptyText
          }>
          Create a menu category before
          adding food.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.replace(
              'RestaurantMenu',
            )
          }
          style={
            styles.backButton
          }>

          <Text
            style={
              styles.backButtonText
            }>
            Go Back
          </Text>

        </TouchableOpacity>

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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }>

        {/* =========================================
            HEADER
        ========================================= */}

        <View
          style={
            styles.header
          }>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.replace(
                'RestaurantMenu',
              )
            }
            style={
              styles.backIconButton
            }>

            <ArrowLeft
              size={22}
              color="#17171B"
              weight="bold"
            />

          </TouchableOpacity>

          <View
            style={
              styles.headerText
            }>

            <Text
              style={
                styles.smallText
              }>
              Restaurant
            </Text>

            <Text
              style={
                styles.title
              }>
              Add Food
            </Text>

          </View>

        </View>

        {/* =========================================
            FOOD INFORMATION
        ========================================= */}

        <SectionTitle
          title="Food Information"
        />

        <InputField
          label="Food Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Chicken Biryani"
        />

        <InputField
          label="Description"
          value={description}
          onChangeText={
            setDescription
          }
          placeholder="Describe your food"
          multiline
        />

        {/* =========================================
            CATEGORY
        ========================================= */}

        <SectionTitle
          title="Category"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryContainer
          }>

          {categories.map(
            category => {

              const selected =
                selectedCategory ===
                category._id;

              return (
                <TouchableOpacity
                  key={
                    category._id
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    setSelectedCategory(
                      category._id,
                    )
                  }
                  style={[
                    styles.categoryButton,
                    selected &&
                      styles.selectedCategory,
                  ]}>

                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.selectedCategoryText,
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

        {/* =========================================
            PRICING
        ========================================= */}

        <SectionTitle
          title="Pricing"
        />

        <View
          style={
            styles.row
          }>

          <View
            style={
              styles.halfField
            }>

            <InputField
              label="Price"
              value={price}
              onChangeText={
                setPrice
              }
              placeholder="180"
              keyboardType="numeric"
            />

          </View>

          <View
            style={
              styles.halfField
            }>

            <InputField
              label="Discounted Price"
              value={
                discountedPrice
              }
              onChangeText={
                setDiscountedPrice
              }
              placeholder="150"
              keyboardType="numeric"
            />

          </View>

        </View>

        {/* =========================================
            PREPARATION TIME
        ========================================= */}

        <InputField
          label="Preparation Time (minutes)"
          value={
            preparationTime
          }
          onChangeText={
            setPreparationTime
          }
          placeholder="20"
          keyboardType="numeric"
        />

        {/* =========================================
            IMAGE
        ========================================= */}

        <SectionTitle
          title="Food Image"
        />

        <View style={styles.imagePreviewCard}>
          <AsyncImage
            source={image.trim() || undefined}
            style={styles.selectedImage}
            kind="food"
            placeholder={
              <View style={styles.imagePlaceholder}>
                <Camera size={36} color="#FF7A00" weight="duotone" />
                <Text style={styles.imagePlaceholderText}>No image selected</Text>
              </View>
            }
          />

        </View>

        <Text style={styles.helperText}>
          Paste a publicly accessible image URL to preview the food image.
        </Text>

        <InputField
          label="Food Image URL (optional)"
          value={image}
          onChangeText={setImage}
          placeholder="https://example.com/food.jpg"
          autoCapitalize="none"
        />

        {/* =========================================
            FOOD TYPE
        ========================================= */}

        <Text style={styles.foodTypeLabel}>Food Type</Text>

        <View style={styles.foodTypeContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{selected: isVegetarian}}
            onPress={() => setIsVegetarian(true)}
            style={[
              styles.foodTypeButton,
              styles.vegButton,
              isVegetarian && styles.selectedVegButton,
            ]}>
            <View style={styles.foodTypeOptionContent}>
              <View style={[styles.foodTypeDot, styles.vegDot]} />
              <Text
                style={[
                  styles.foodTypeButtonText,
                  isVegetarian && styles.selectedVegText,
                ]}>
                Vegetarian
              </Text>
            </View>
            <Text style={styles.foodTypeDescription}>
              Veg
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{selected: !isVegetarian}}
            onPress={() => setIsVegetarian(false)}
            style={[
              styles.foodTypeButton,
              styles.nonVegButton,
              !isVegetarian && styles.selectedNonVegButton,
            ]}>
            <View style={styles.foodTypeOptionContent}>
              <View style={[styles.foodTypeDot, styles.nonVegDot]} />
              <Text
                style={[
                  styles.foodTypeButtonText,
                  !isVegetarian && styles.selectedNonVegText,
                ]}>
                Non-Vegetarian
              </Text>
            </View>
            <Text style={styles.foodTypeDescription}>
              Non-Veg
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================================
            PREVIEW
        ========================================= */}

        <SectionTitle
          title="Preview"
        />

        <View
          style={
            styles.previewCard
          }>

          <View
            style={
              styles.previewImage
            }>

            <AsyncImage
              source={image.trim() || undefined}
              style={styles.previewImageContent}
              kind="food"
            />

          </View>

          <View
            style={
              styles.previewInfo
            }>

            <Text
              style={
                styles.previewName
              }>
              {name ||
                'Food Name'}
            </Text>

            <Text
              style={
                styles.previewCategory
              }>

              {categories.find(
                category =>
                  category._id ===
                  selectedCategory,
              )?.name ||
                'Category'}

            </Text>

            <Text
              style={
                styles.previewDescription
              }>

              {description ||
                'Food description'}

            </Text>

            <View
              style={
                styles.previewBottom
              }>

              <Text
                style={
                  styles.previewPrice
                }>
                ₹
                {price ||
                  '0'}
              </Text>

              <View style={styles.previewTimeContainer}>
                <Clock
                  size={14}
                  color="#777780"
                  weight="regular"
                />
                <Text style={styles.previewTime}>
                  {preparationTime || '20'} min
                </Text>
              </View>

            </View>

          </View>

        </View>

        {/* =========================================
            CREATE BUTTON
        ========================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            handleCreateFood
          }
          disabled={saving}
          style={[
            styles.createButton,
            saving &&
              styles.createButtonDisabled,
          ]}>

          {saving ? (
            <View
              style={
                styles.savingContent
              }>

              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }>
                Adding Food...
              </Text>

            </View>
          ) : (
            <View style={styles.createButtonContent}>
              <Plus
                size={19}
                color="#FFFFFF"
                weight="bold"
              />
              <Text style={styles.createButtonText}>
                Add Food
              </Text>
            </View>
          )}

        </TouchableOpacity>

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
};

// =====================================================
// SECTION TITLE
// =====================================================

interface SectionTitleProps {
  title: string;
}

const SectionTitle:
  React.FC<
    SectionTitleProps
  > = ({
    title,
  }) => (
    <Text
      style={
        styles.sectionTitle
      }>
      {title}
    </Text>
  );

// =====================================================
// INPUT FIELD
// =====================================================

interface InputFieldProps {
  label: string;

  value: string;

  onChangeText: (
    value: string,
  ) => void;

  placeholder?: string;

  multiline?: boolean;

  keyboardType?:
    | 'default'
    | 'numeric'
    | 'phone-pad'
    | 'email-address';

  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
    | 'characters';
}

const InputField:
  React.FC<
    InputFieldProps
  > = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType =
      'default',
    autoCapitalize =
      'sentences',
  }) => (

    <View
      style={
        styles.inputGroup
      }>

      <Text
        style={
          styles.inputLabel
        }>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#A0A0A8"
        multiline={
          multiline
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        textAlignVertical={
          multiline
            ? 'top'
            : 'center'
        }
        style={[
          styles.input,
          multiline &&
            styles.multilineInput,
        ]}
      />

    </View>
  );

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

    // ================================================
    // LOADING
    // ================================================

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#F8F8FA',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: '#777780',
    },

    // ================================================
    // EMPTY
    // ================================================

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 30,
      backgroundColor:
        '#F8F8FA',
    },

    emptyIcon: {
      fontSize: 45,
      marginBottom: 15,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#17171B',
    },

    emptyText: {
      fontSize: 13,
      color: '#909099',
      textAlign: 'center',
      lineHeight: 19,
      marginTop: 7,
    },

    backButton: {
      backgroundColor:
        '#FF7A00',
      paddingHorizontal: 25,
      paddingVertical: 13,
      borderRadius: 14,
      marginTop: 20,
    },

    backButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },

    // ================================================
    // HEADER
    // ================================================

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 28,
    },

    backIconButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        '#FFFFFF',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 12,
    },

    backIcon: {
      fontSize: 31,
      color: '#17171B',
      marginTop: -3,
    },

    headerText: {
      flex: 1,
    },

    smallText: {
      fontSize: 12,
      color: '#8A8A93',
      marginBottom: 3,
    },

    title: {
      fontSize: 27,
      fontWeight: '800',
      color: '#17171B',
    },

    // ================================================
    // SECTION
    // ================================================

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#17171B',
      marginBottom: 14,
      marginTop: 4,
    },

    // ================================================
    // INPUT
    // ================================================

    inputGroup: {
      marginBottom: 16,
    },

    inputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#676770',
      marginBottom: 7,
    },

    input: {
      height: 50,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 14,
      paddingHorizontal: 14,
      fontSize: 13,
      color: '#17171B',
    },

    multilineInput: {
      height: 90,
      paddingTop: 14,
    },

    imagePreviewCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 10,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: '#EEEEF2',
    },

    selectedImage: {
      width: '100%',
      height: 190,
      borderRadius: 12,
      backgroundColor: '#FFF1E6',
    },

    imagePlaceholder: {
      height: 150,
      borderRadius: 12,
      backgroundColor: '#FFF5ED',
      alignItems: 'center',
      justifyContent: 'center',
    },

    imagePlaceholderText: {
      color: '#909099',
      fontSize: 13,
      fontWeight: '600',
    },

    previewImageContent: {
      width: '100%',
      height: '100%',
      borderRadius: 16,
    },

    helperText: {
      fontSize: 11,
      color: '#909099',
      lineHeight: 17,
      marginTop: -7,
      marginBottom: 22,
    },

    // ================================================
    // CATEGORY
    // ================================================

    categoryContainer: {
      gap: 9,
      paddingBottom: 24,
    },

    categoryButton: {
      backgroundColor:
        '#FFFFFF',
      paddingHorizontal: 17,
      paddingVertical: 11,
      borderRadius: 13,
    },

    selectedCategory: {
      backgroundColor:
        '#FF7A00',
    },

    categoryText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#777780',
    },

    selectedCategoryText: {
      color: '#FFFFFF',
    },

    // ================================================
    // ROW
    // ================================================

    row: {
      flexDirection: 'row',
      gap: 10,
    },

    halfField: {
      flex: 1,
    },

    // ================================================
    // FOOD TYPE (VEG / NON-VEG)
    // ================================================

    foodTypeLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#676770',
      marginBottom: 9,
    },

    foodTypeContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 28,
    },

    foodTypeButton: {
      flex: 1,
      minHeight: 76,
      paddingHorizontal: 12,
      paddingVertical: 13,
      borderRadius: 14,
      borderWidth: 1.5,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
    },

    vegButton: {
      borderColor: '#DDEBDD',
    },

    selectedVegButton: {
      borderColor: '#218838',
      backgroundColor: '#F0F9F1',
    },

    nonVegButton: {
      borderColor: '#F0DEDE',
    },

    selectedNonVegButton: {
      borderColor: '#D93025',
      backgroundColor: '#FFF3F2',
    },

    foodTypeOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    foodTypeDot: {
      width: 11,
      height: 11,
      borderRadius: 2,
      marginRight: 7,
    },

    vegDot: {
      borderWidth: 1.5,
      borderColor: '#218838',
      backgroundColor: '#218838',
    },

    nonVegDot: {
      borderWidth: 1.5,
      borderColor: '#D93025',
      backgroundColor: '#D93025',
    },

    foodTypeButtonText: {
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '700',
      color: '#676770',
    },

    selectedVegText: {
      color: '#176B2C',
    },

    selectedNonVegText: {
      color: '#B42318',
    },

    foodTypeDescription: {
      marginTop: 6,
      marginLeft: 18,
      fontSize: 10,
      color: '#909099',
      fontWeight: '600',
    },

    // ================================================
    // PREVIEW
    // ================================================

    previewCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 13,
      flexDirection: 'row',
      marginBottom: 25,
    },

    previewImage: {
      width: 92,
      height: 92,
      borderRadius: 16,
      backgroundColor:
        '#FFF1E6',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    previewEmoji: {
      fontSize: 32,
    },

    previewInfo: {
      flex: 1,
      marginLeft: 13,
    },

    previewName: {
      fontSize: 15,
      fontWeight: '800',
      color: '#17171B',
    },

    previewCategory: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FF7A00',
      marginTop: 3,
    },

    previewDescription: {
      fontSize: 11,
      color: '#909099',
      marginTop: 5,
      lineHeight: 16,
    },

    previewBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: 7,
    },

    previewPrice: {
      fontSize: 15,
      fontWeight: '800',
      color: '#17171B',
    },

    previewTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    previewTime: {
      fontSize: 10,
      color: '#777780',
    },

    // ================================================
    // CREATE
    // ================================================

    createButton: {
      height: 55,
      backgroundColor:
        '#FF7A00',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    createButtonDisabled: {
      opacity: 0.7,
    },

    createButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    createButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    savingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    bottomSpace: {
      height: 45,
    },
  });

export default AddFoodScreen;
