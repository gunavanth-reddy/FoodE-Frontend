import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  RestaurantOwnerStackParamList,
} from '../navigation/RestaurantOwnerNavigator';
import {formatTime12, to24Hour} from '../../../utils/time';

import {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  RestaurantData,
  Restaurant,
} from '../services/restaurantService';
import {useFocusEffect} from '@react-navigation/native';
import AsyncImage from '../../../components/images/AsyncImage';

import {useAuth} from '../../../context/AuthContext';

import {
  ImagePickerAsset,
  launchImageLibraryAsync,
} from 'expo-image-picker';

import {
  Camera,
  FloppyDisk,
} from 'phosphor-react-native';

// =====================================================
// TYPES
// =====================================================

type Props = NativeStackScreenProps<
  RestaurantOwnerStackParamList,
  'RestaurantDetails'
>;

// =====================================================
// SCREEN
// =====================================================

const RestaurantDetailsScreen: React.FC<Props> = ({
  navigation,
}) => {
  const {token} = useAuth();

  // ===================================================
  // RESTAURANT
  // ===================================================

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ===================================================
  // BASIC INFORMATION
  // ===================================================

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  // ===================================================
  // IMAGES
  // ===================================================

  const [logo, setLogo] =
    useState<string | ImagePickerAsset>('');

  const [coverImage, setCoverImage] =
    useState<string | ImagePickerAsset>('');

  // ===================================================
  // CONTACT
  // ===================================================

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  // ===================================================
  // LOCATION
  // ===================================================

  const [address, setAddress] =
    useState('');

  const [city, setCity] =
    useState('');

  // ===================================================
  // DELIVERY
  // ===================================================

  const [deliveryTimeMin, setDeliveryTimeMin] =
    useState('');

  const [deliveryTimeMax, setDeliveryTimeMax] =
    useState('');

  const [deliveryFee, setDeliveryFee] =
    useState('');

  const [minimumOrder, setMinimumOrder] =
    useState('');

  // ===================================================
  // OTHER
  // ===================================================

  const [cuisines, setCuisines] =
    useState('');

  const [openingTime, setOpeningTime] =
    useState('');

  const [closingTime, setClosingTime] =
    useState('');

  // ===================================================
  // IMAGE PICKER
  // ===================================================

  const pickRestaurantImage = async (
    type: 'logo' | 'coverImage',
  ) => {
    try {
      const result =
        await launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: false,
          quality: 1,
        });

      if (result.canceled) {
        return;
      }

      const asset =
        result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'No Image Selected',
          'Please select an image.',
        );
        return;
      }

      if (type === 'logo') {
        setLogo(asset);
      } else {
        setCoverImage(asset);
      }
    } catch (error: any) {
      Alert.alert(
        'Image Picker Error',
        error?.message ||
          'Unable to open image gallery.',
      );
    }
  };

  // ===================================================
  // IMAGE URI
  // ===================================================

  const getImageUri = (
    image: string | ImagePickerAsset,
  ): string => {
    if (typeof image === 'string') {
      return image;
    }

    return image?.uri || '';
  };

  // ===================================================
  // DELIVERY TIME READER
  // ===================================================

  const getDeliveryTimeValues = (
    data: Restaurant,
  ): {
    min: string;
    max: string;
  } => {
    const value: any =
      (data as any).deliveryTime;

    // New backend format:
    // { min: 20, max: 35 }

    if (
      value &&
      typeof value === 'object'
    ) {
      return {
        min:
          value.min !== undefined
            ? String(value.min)
            : '',

        max:
          value.max !== undefined
            ? String(value.max)
            : '',
      };
    }

    // Old numeric format
    if (
      typeof value === 'number'
    ) {
      return {
        min: String(value),
        max: String(value),
      };
    }

    // Old string format
    if (
      typeof value === 'string'
    ) {
      const match =
        value.match(
          /(\d+)\s*[-–]\s*(\d+)/,
        );

      if (match) {
        return {
          min: match[1],
          max: match[2],
        };
      }

      const numberValue =
        Number(
          value.replace(
            /[^0-9]/g,
            '',
          ),
        );

      if (
        Number.isFinite(
          numberValue,
        ) &&
        numberValue > 0
      ) {
        return {
          min: String(numberValue),
          max: String(numberValue),
        };
      }
    }

    return {
      min: '',
      max: '',
    };
  };

  // ===================================================
  // FILL FORM
  // ===================================================

  const fillForm = (
    data: Restaurant,
  ) => {
    setName(
      data.name || '',
    );

    setDescription(
      data.description || '',
    );

    setLogo(
      data.logo || '',
    );

    setCoverImage(
      data.coverImage || '',
    );

    setPhone(
      data.phone || '',
    );

    setEmail(
      data.email || '',
    );

    setAddress(
      data.address || '',
    );

    setCity(
      data.city || '',
    );

    // =================================================
    // DELIVERY TIME
    // =================================================

    const delivery =
      getDeliveryTimeValues(
        data,
      );

    setDeliveryTimeMin(
      delivery.min,
    );

    setDeliveryTimeMax(
      delivery.max,
    );

    // =================================================
    // DELIVERY FEE
    // =================================================

    setDeliveryFee(
      data.deliveryFee !==
        undefined
        ? String(
            data.deliveryFee,
          )
        : '',
    );

    // =================================================
    // MINIMUM ORDER
    // =================================================

    setMinimumOrder(
      data.minimumOrder !==
        undefined
        ? String(
            data.minimumOrder,
          )
        : '',
    );

    // =================================================
    // CUISINES
    // =================================================

    const cuisineValue: any =
      (data as any).cuisines;

    if (
      Array.isArray(
        cuisineValue,
      )
    ) {
      setCuisines(
        cuisineValue.join(', '),
      );
    } else if (
      typeof cuisineValue ===
      'string'
    ) {
      setCuisines(
        cuisineValue,
      );
    } else {
      setCuisines('');
    }

    // =================================================
    // OPENING HOURS
    // =================================================

    setOpeningTime(
      (data as any).openingTime ||
        '',
    );

    setClosingTime(
      (data as any).closingTime ||
        '',
    );
  };

  // ===================================================
  // LOAD RESTAURANT
  // ===================================================

  const loadRestaurant =
    useCallback(async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await getMyRestaurant(
            token,
          );

        setRestaurant(
          data || null,
        );

        if (data) {
          fillForm(data);
        }
      } catch (error: any) {
        console.log(
          'Load restaurant error:',
          error,
        );

        Alert.alert(
          'Error',
          error?.message ||
            'Failed to load restaurant.',
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadRestaurant();
    }, [loadRestaurant]),
  );

  // ===================================================
  // VALIDATE FORM
  // ===================================================

  const validateForm =
    (): boolean => {
      // ===============================================
      // NAME
      // ===============================================

      if (!name.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter your restaurant name.',
        );

        return false;
      }

      // ===============================================
      // PHONE
      // ===============================================

      if (!phone.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter your phone number.',
        );

        return false;
      }

      // ===============================================
      // ADDRESS
      // ===============================================

      if (!address.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter your restaurant address.',
        );

        return false;
      }

      // ===============================================
      // CITY
      // ===============================================

      if (!city.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter your city.',
        );

        return false;
      }

      // ===============================================
      // DELIVERY TIME
      // ===============================================

      const minDeliveryTime =
        Number(
          deliveryTimeMin,
        );

      const maxDeliveryTime =
        Number(
          deliveryTimeMax,
        );

      if (
        !deliveryTimeMin.trim() ||
        !deliveryTimeMax.trim() ||
        !Number.isFinite(
          minDeliveryTime,
        ) ||
        !Number.isFinite(
          maxDeliveryTime,
        )
      ) {
        Alert.alert(
          'Invalid Delivery Time',
          'Please enter both minimum and maximum delivery times.',
        );

        return false;
      }

      if (
        minDeliveryTime <= 0 ||
        maxDeliveryTime <= 0
      ) {
        Alert.alert(
          'Invalid Delivery Time',
          'Delivery time must be greater than 0 minutes.',
        );

        return false;
      }

      if (
        minDeliveryTime >
        maxDeliveryTime
      ) {
        Alert.alert(
          'Invalid Delivery Time',
          'Minimum delivery time cannot be greater than maximum delivery time.',
        );

        return false;
      }

      // ===============================================
      // DELIVERY FEE
      // ===============================================

      if (!deliveryFee.trim()) {
        Alert.alert(
          'Invalid Delivery Fee',
          'Please enter a delivery fee.',
        );

        return false;
      }

      const fee =
        Number(deliveryFee);

      if (
        !Number.isFinite(fee)
      ) {
        Alert.alert(
          'Invalid Delivery Fee',
          'Please enter a valid delivery fee.',
        );

        return false;
      }

      if (
        fee < 10 ||
        fee > 40
      ) {
        Alert.alert(
          'Invalid Delivery Fee',
          'Delivery fee must be between ₹10 and ₹40.',
        );

        return false;
      }

      // ===============================================
      // MINIMUM ORDER
      // ===============================================

      if (
        minimumOrder.trim()
      ) {
        const minimum =
          Number(
            minimumOrder,
          );

        if (
          !Number.isFinite(
            minimum,
          ) ||
          minimum < 0
        ) {
          Alert.alert(
            'Invalid Minimum Order',
            'Please enter a valid minimum order amount.',
          );

          return false;
        }
      }

      return true;
    };

  // ===================================================
  // SAVE RESTAURANT
  // ===================================================

  const handleSave =
    async () => {
      // ===============================================
      // TOKEN
      // ===============================================

      if (!token) {
        Alert.alert(
          'Session Expired',
          'Please login again.',
        );

        return;
      }

      // ===============================================
      // VALIDATION
      // ===============================================

      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);

        // =============================================
        // CUISINES
        // =============================================

        const cuisineArray =
          cuisines
            .split(',')
            .map(
              item =>
                item.trim(),
            )
            .filter(Boolean);

        // =============================================
        // NUMBERS
        // =============================================

        const minDeliveryTime =
          Number(
            deliveryTimeMin,
          );

        const maxDeliveryTime =
          Number(
            deliveryTimeMax,
          );

        const fee =
          Number(
            deliveryFee,
          );

        const minimum =
          minimumOrder.trim()
            ? Number(
                minimumOrder,
              )
            : 0;

        // =============================================
        // RESTAURANT DATA
        // =============================================

        /*
         * The backend expects:
         *
         * deliveryTime: {
         *   min: number,
         *   max: number
         * }
         */

        const restaurantData =
          {
            name:
              name.trim(),

            description:
              description.trim() ||
              undefined,

            logo:
              logo || undefined,

            coverImage:
              coverImage ||
              undefined,

            phone:
              phone.trim(),

            email:
              email.trim() ||
              undefined,

            address:
              address.trim(),

            city:
              city.trim(),

            deliveryTime: {
              min:
                minDeliveryTime,

              max:
                maxDeliveryTime,
            },

            deliveryFee:
              fee,

            minimumOrder:
              minimum,

            cuisines:
              cuisineArray,

            openingTime:
              openingTime.trim() ||
              undefined,

            closingTime:
              closingTime.trim() ||
              undefined,
          } as any as RestaurantData;

        console.log(
          'Restaurant payload:',
          restaurantData,
        );

        // =============================================
        // CREATE
        // =============================================

        if (!restaurant) {
          console.log(
            'Creating restaurant...',
          );

          await createRestaurant(
            token,
            restaurantData,
          );

          console.log(
            'Restaurant created successfully.',
          );

          navigation.replace(
            'RestaurantDashboard',
          );

          return;
        }

        // =============================================
        // UPDATE
        // =============================================

        console.log(
          'Updating restaurant...',
        );

        await updateMyRestaurant(
          token,
          restaurantData,
        );

        console.log(
          'Restaurant updated successfully.',
        );

        navigation.replace(
          'RestaurantDashboard',
        );
      } catch (error: any) {
        console.log(
          'Save restaurant error:',
          error,
        );

        Alert.alert(
          'Unable to Save',
          error?.message ||
            'Something went wrong while saving the restaurant.',
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
        style={
          styles.loadingContainer
        }
        edges={['left', 'right']}>
        <StatusBar hidden={true} />

        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text
          style={
            styles.loadingText
          }>
          Loading restaurant...
        </Text>
      </SafeAreaView>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['left', 'right']}>
      <StatusBar hidden={true} />

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }>

          {/* =========================================
              HEADER
          ========================================= */}

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text
                style={
                  styles.subtitle
                }>
                {restaurant
                  ? 'Update your restaurant information'
                  : 'Set up your restaurant'}
              </Text>

            </View>
          </View>

          {/* =========================================
              BASIC INFORMATION
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Restaurant Information
            </Text>

            <Text
              style={styles.label}>
              Restaurant Name *
            </Text>

            <AppTextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. FoodE Kitchen"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!saving}
            />

            <Text
              style={styles.label}>
              Description
            </Text>

            <AppTextInput
              value={description}
              onChangeText={
                setDescription
              }
              placeholder="Describe your restaurant"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              style={[
                styles.input,
                styles.textArea,
              ]}
              editable={!saving}
            />


          </View>

          {/* =========================================
              IMAGES
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Restaurant Images
            </Text>

            <Text
              style={styles.helper}>
              Select images from your gallery.
            </Text>

            {/* LOGO */}

            <Text
              style={styles.label}>
              Restaurant Logo
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.imagePicker
              }
              onPress={() =>
                pickRestaurantImage(
                  'logo',
                )
              }
              disabled={saving}>

              {getImageUri(logo) ? (
                <AsyncImage
                  source={getImageUri(logo)}
                  style={styles.logoPreview}
                  kind="restaurant"
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }>
                  <Camera
                    size={30}
                    color="#FF7A00"
                    weight="duotone"
                  />

                  <Text
                    style={
                      styles.imagePlaceholderText
                    }>
                    Choose Logo
                  </Text>
                </View>
              )}

              <Text
                style={
                  styles.imageAction
                }>
                {getImageUri(
                  logo,
                )
                  ? 'Change Logo'
                  : 'Select Logo'}
              </Text>

            </TouchableOpacity>

            {/* COVER */}

            <Text
              style={styles.label}>
              Restaurant Cover Image
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.coverPicker
              }
              onPress={() =>
                pickRestaurantImage(
                  'coverImage',
                )
              }
              disabled={saving}>

              {getImageUri(coverImage) ? (
                <AsyncImage
                  source={getImageUri(coverImage)}
                  style={styles.coverPreview}
                  kind="restaurant"
                />
              ) : (
                <View
                  style={
                    styles.coverPlaceholder
                  }>
                  <Camera
                    size={30}
                    color="#FF7A00"
                    weight="duotone"
                  />

                  <Text
                    style={
                      styles.imagePlaceholderText
                    }>
                    Choose Cover Image
                  </Text>
                </View>
              )}

            </TouchableOpacity>

            <Text
              style={
                styles.imageAction
              }>
              {getImageUri(
                coverImage,
              )
                ? 'Change Cover Image'
                : 'Select Cover Image'}
            </Text>

          </View>

          {/* =========================================
              CONTACT
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Contact
            </Text>

            <Text
              style={styles.label}>
              Phone *
            </Text>

            <AppTextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              style={styles.input}
              editable={!saving}
            />

            <Text
              style={styles.label}>
              Email
            </Text>

            <AppTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="restaurant@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              editable={!saving}
            />

          </View>

          {/* =========================================
              LOCATION
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Location
            </Text>

            <Text
              style={styles.label}>
              Address *
            </Text>

            <AppTextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Restaurant address"
              placeholderTextColor="#999"
              multiline
              style={styles.input}
              editable={!saving}
            />

            <Text
              style={styles.label}>
              City *
            </Text>

            <AppTextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Amaravati"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!saving}
            />

          </View>

          {/* =========================================
              DELIVERY
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Delivery
            </Text>

            {/* MINIMUM */}

            <Text
              style={styles.label}>
              Minimum Delivery Time (minutes)
            </Text>

            <AppTextInput
              value={
                deliveryTimeMin
              }
              onChangeText={
                setDeliveryTimeMin
              }
              placeholder="20"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={styles.input}
              editable={!saving}
            />

            {/* MAXIMUM */}

            <Text
              style={styles.label}>
              Maximum Delivery Time (minutes)
            </Text>

            <AppTextInput
              value={
                deliveryTimeMax
              }
              onChangeText={
                setDeliveryTimeMax
              }
              placeholder="35"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={styles.input}
              editable={!saving}
            />

            {/* FEE */}

            <Text
              style={styles.label}>
              Delivery Fee (₹)
            </Text>

            <AppTextInput
              value={deliveryFee}
              onChangeText={
                setDeliveryFee
              }
              placeholder="10"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={styles.input}
              editable={!saving}
            />

            <Text
              style={styles.helper}>
              Delivery fee must be between ₹10 and ₹40.
            </Text>

            {/* MINIMUM ORDER */}

            <Text
              style={styles.label}>
              Minimum Order (₹)
            </Text>

            <AppTextInput
              value={
                minimumOrder
              }
              onChangeText={
                setMinimumOrder
              }
              placeholder="100"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={styles.input}
              editable={!saving}
            />

          </View>

          {/* =========================================
              CUISINES
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Cuisines
            </Text>

            <Text
              style={styles.helper}>
              Separate cuisines with commas.
            </Text>

            <AppTextInput
              value={cuisines}
              onChangeText={
                setCuisines
              }
              placeholder="Biryani, Chinese, Burgers"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!saving}
            />

          </View>

          {/* =========================================
              OPENING HOURS
          ========================================= */}

          <View
            style={styles.section}>

            <Text
              style={
                styles.sectionTitle
              }>
              Opening Hours
            </Text>

            <Text
              style={styles.label}>
              Opening Time
            </Text>

            <AppTextInput
              value={openingTime}
              onChangeText={value => setOpeningTime(to24Hour(value))}
              placeholder="10:00"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!saving}
            />

            <Text style={styles.timeHint}>Display: {formatTime12(openingTime) || '10:00 AM'}</Text>

            <Text
              style={styles.label}>
              Closing Time
            </Text>

            <AppTextInput
              value={closingTime}
              onChangeText={value => setClosingTime(to24Hour(value))}
              placeholder="22:00"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!saving}
            />

            <Text style={styles.timeHint}>Display: {formatTime12(closingTime) || '10:00 PM'}</Text>

          </View>

          {/* =========================================
              SAVE
          ========================================= */}

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleSave}
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}>

            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <View style={styles.saveContent}>
                <FloppyDisk
                  size={19}
                  color="#FFFFFF"
                  weight="bold"
                />
                <Text
                  style={
                    styles.saveText
                  }>
                  {restaurant
                    ? 'Save Changes'
                    : 'Create Restaurant'}
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
      </KeyboardAvoidingView>
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
      backgroundColor: '#F7F8FA',
    },

    keyboardContainer: {
      flex: 1,
    },

    content: {
      padding: 20,
      paddingBottom: 55,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#777777',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 26,
      paddingHorizontal: 2,
    },

    headerIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: '#FFF1E6',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 26,
      fontWeight: '900',
      color: '#17171B',
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: '#777777',
    },

    section: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EEEEF2',
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#17171B',
      marginBottom: 14,
    },

    label: {
      fontSize: 13,
      fontWeight: '700',
      color: '#333333',
      marginTop: 10,
      marginBottom: 7,
    },

    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: '#E3E3E7',
      borderRadius: 14,
      paddingHorizontal: 15,
      fontSize: 15,
      color: '#17171B',
      backgroundColor: '#FAFAFB',
    },

    textArea: {
      minHeight: 110,
      paddingTop: 14,
    },

    helper: {
      fontSize: 12,
      lineHeight: 18,
      color: '#888888',
      marginBottom: 6,
    },

    saveButton: {
      height: 56,
      borderRadius: 17,
      backgroundColor: '#FF7A00',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },

    disabledButton: {
      opacity: 0.6,
    },

    saveContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    saveText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    imagePicker: {
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: '#E3E3E7',
      borderRadius: 16,
      borderStyle: 'dashed',
      backgroundColor: '#FAFAFB',
    },

    logoPreview: {
      width: 112,
      height: 112,
      borderRadius: 18,
      backgroundColor: '#EEEEEE',
    },

    coverPicker: {
      height: 160,
      borderWidth: 1,
      borderColor: '#E3E3E7',
      borderRadius: 16,
      borderStyle: 'dashed',
      overflow: 'hidden',
      backgroundColor: '#FAFAFB',
      alignItems: 'center',
      justifyContent: 'center',
    },

    coverPreview: {
      width: '100%',
      height: '100%',
    },

    imagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 112,
    },

    coverPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    imagePlaceholderText: {
      marginTop: 5,
      fontSize: 13,
      color: '#777777',
      fontWeight: '600',
    },

    imageAction: {
      marginTop: 8,
      marginBottom: 6,
      textAlign: 'center',
      color: '#FF7A00',
      fontSize: 13,
      fontWeight: '700',
    },

    bottomSpace: {
      height: 30,
    },

    timeHint: {
      fontSize: 11,
      color: '#8A8F98',
      marginTop: 4,
      marginBottom: 4,
      fontWeight: '600',
    },
  });

export default RestaurantDetailsScreen;
