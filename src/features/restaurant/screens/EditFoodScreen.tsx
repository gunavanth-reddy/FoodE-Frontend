import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  getMyCategories,
  Category,
} from '../services/categoryService';

import {
  updateFood,
  CreateFoodData,
} from '../services/foodService';

import {useAuth} from '../../../context/AuthContext';
import FoodImagePicker, {
  FoodImageAsset,
} from '../components/FoodImagePicker';

import {
  ArrowLeft,
  Clock,
  ForkKnife,
} from 'phosphor-react-native';

// =====================================================
// TYPES
// =====================================================

interface FoodToEdit {
  _id: string;

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

  preparationTime?: number;

  isVegetarian?: boolean;

  foodType?: 'veg' | 'non-veg';

  isAvailable?: boolean;
}

// =====================================================
// SCREEN
// =====================================================

const EditFoodScreen = ({
  navigation,
  route,
}: any) => {

  // ===================================================
  // AUTH
  // ===================================================

  const {token} = useAuth();

  // ===================================================
  // FOOD
  // ===================================================

  const food: FoodToEdit =
    route?.params?.food;

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
    useState('');

  const [imageUri, setImageUri] = useState('');
  const [imageAsset, setImageAsset] = useState<FoodImageAsset | undefined>();

  const [isVegetarian, setIsVegetarian] =
    useState(false);

  // ===================================================
  // CHECK FOOD
  // ===================================================

  useEffect(() => {

    if (!food) {

      Alert.alert(
        'Food Not Found',
        'Unable to load this food.',
        [
          {
            text: 'Go Back',

            onPress: () =>
              navigation.replace(
                'RestaurantMenu',
              ),
          },
        ],
      );

      return;
    }

    // ================================================
    // INITIAL FOOD VALUES
    // ================================================

    setName(
      food.name || '',
    );

    setDescription(
      food.description || '',
    );

    setPrice(
      food.price !== undefined
        ? String(food.price)
        : '',
    );

    setDiscountedPrice(
      food.discountedPrice !==
        undefined &&
      food.discountedPrice !==
        null
        ? String(
            food.discountedPrice,
          )
        : '',
    );

    setPreparationTime(
      food.preparationTime !==
        undefined
        ? String(
            food.preparationTime,
          )
        : '20',
    );

    setImageUri(
      food.image || '',
    );
    setImageAsset(undefined);

    // Prefer the explicit foodType field; fall back to isVegetarian
    // for older food records.
    setIsVegetarian(
      food.foodType === 'veg'
        ? true
        : food.foodType === 'non-veg'
          ? false
          : food.isVegetarian === true,
    );

    // ================================================
    // CATEGORY
    // ================================================

    if (
      typeof food.category ===
      'string'
    ) {

      setSelectedCategory(
        food.category,
      );

    } else {

      setSelectedCategory(
        food.category?._id ||
          '',
      );
    }

  }, [food, navigation]);

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  const loadCategories = useCallback(async () => {

      try {

        if (!token) {
          setLoading(false);
          return;
        }

        const data =
          await getMyCategories(
            token,
          );

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

        if (activeCategories.length > 0) {
          setSelectedCategory(current => current || activeCategories[0]._id);
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
    () => {

      if (!name.trim()) {

        Alert.alert(
          'Required',
          'Food name is required.',
        );

        return false;
      }

      if (!selectedCategory) {

        Alert.alert(
          'Required',
          'Please select a category.',
        );

        return false;
      }

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

      // ==============================================
      // DISCOUNT
      // ==============================================

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
            'Discounted price must be less than the original price.',
          );

          return false;
        }
      }

      // ==============================================
      // PREPARATION TIME
      // ==============================================

      if (
        !preparationTime.trim()
      ) {

        Alert.alert(
          'Required',
          'Preparation time is required.',
        );

        return false;
      }

      const time =
        Number(
          preparationTime,
        );

      if (
        Number.isNaN(time) ||
        time <= 0
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
  // UPDATE FOOD
  // ===================================================

  const handleUpdateFood =
    async () => {

      if (!token) {

        Alert.alert(
          'Login Required',
          'Please login again.',
        );

        return;
      }

      if (!food?._id) {

        Alert.alert(
          'Error',
          'Food ID is missing.',
        );

        return;
      }

      if (!validateForm()) {
        return;
      }

      try {

        setSaving(true);

        const foodData: Partial<CreateFoodData> = {

          category:
            selectedCategory,

          name:
            name.trim(),

          description:
            description.trim(),

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

        const response =
          await updateFood(
            token,
            food._id,
            foodData,
            imageAsset,
          );

        console.log(
          'Food Updated:',
          response,
        );

        // =========================================
        // SUCCESS → RESTAURANT MENU
        // =========================================

        Alert.alert(
          'Updated Successfully',
          `${name.trim()} has been updated.`,
          [
            {
              text: 'OK',

              onPress: () =>
                navigation.replace(
                  'RestaurantMenu',
                ),
            },
          ],
        );

      } catch (error: any) {

        console.log(
          'Update Food Error:',
          error,
        );

        Alert.alert(
          'Update Failed',
          error?.message ||
            'Unable to update food.',
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
        style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text
          style={
            styles.loadingText
          }>
          Loading food...
        </Text>

      </SafeAreaView>
    );
  }

  // ===================================================
  // FOOD NOT FOUND
  // ===================================================

  if (!food) {
    return null;
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
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
              styles.backButton
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
              Edit Food
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

        <FoodImagePicker
          imageUri={imageUri || undefined}
          onImageSelected={asset => {
            setImageAsset(asset);
            setImageUri(asset.uri);
          }}
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
            <Text style={styles.foodTypeDescription}>Veg</Text>
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
            <Text style={styles.foodTypeDescription}>Non-Veg</Text>
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

            {imageUri ? (
              <Image
                source={{uri: imageUri}}
                style={styles.previewImageContent}
                resizeMode="cover"
              />
            ) : (
              <ForkKnife
                size={32}
                color="#FF7A00"
                weight="duotone"
              />
            )}

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
              }
              numberOfLines={2}>

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
                ₹{price || '0'}
              </Text>

              <View style={styles.previewTimeContainer}>
                <Clock
                  size={13}
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
            UPDATE BUTTON
        ========================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={
            handleUpdateFood
          }
          style={[
            styles.updateButton,
            saving &&
              styles.disabledButton,
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
                  styles.updateButtonText
                }>
                Updating...
              </Text>

            </View>

          ) : (

            <Text
              style={
                styles.updateButtonText
              }>
              Save Changes
            </Text>

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
  > = ({title}) => (

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

      <AppTextInput
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
    // HEADER
    // ================================================

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 28,
    },

    backButton: {
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
    // SECTIONS
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
    // PRICE
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

    previewImageContent: {
      width: '100%',
      height: '100%',
      borderRadius: 16,
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
    // UPDATE BUTTON
    // ================================================

    updateButton: {
      height: 55,
      backgroundColor:
        '#FF7A00',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    disabledButton: {
      opacity: 0.7,
    },

    updateButtonText: {
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

export default EditFoodScreen;
