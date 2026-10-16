import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {Camera, ImageSquare} from 'phosphor-react-native';

export type FoodImageAsset = ImagePicker.ImagePickerAsset;

interface FoodImagePickerProps {
  imageUri?: string;
  onImageSelected: (asset: FoodImageAsset) => void;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const FoodImagePicker: React.FC<FoodImagePickerProps> = ({
  imageUri,
  onImageSelected,
}) => {
  const [openingPicker, setOpeningPicker] = useState(false);

  const chooseImage = async () => {
    if (openingPicker) return;
    setOpeningPicker(true);

    try {
      if (ImagePicker.requestMediaLibraryPermissionsAsync) {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Photo access needed',
            'Allow access to your photos to choose a food image.',
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
        Alert.alert('Image is too large', 'Choose an image smaller than 5 MB.');
        return;
      }

      if (
        asset.mimeType &&
        !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType)
      ) {
        Alert.alert('Unsupported image', 'Choose a JPG, PNG, or WEBP image.');
        return;
      }

      onImageSelected(asset);
    } catch (error: any) {
      Alert.alert(
        'Could not open gallery',
        error?.message || 'Please try choosing the image again.',
      );
    } finally {
      setOpeningPicker(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.preview}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.emptyState}>
              <Camera size={34} color="#E97800" weight="duotone" />
              <Text style={styles.emptyText}>No image selected</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={imageUri ? 'Choose a different food image' : 'Choose food image from gallery'}
          activeOpacity={0.85}
          disabled={openingPicker}
          onPress={chooseImage}
          style={styles.button}>
          {openingPicker ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <ImageSquare size={21} color="#FFFFFF" weight="bold" />
              <Text style={styles.buttonText}>
                {imageUri ? 'Choose a Different Image' : 'Choose from Gallery'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.helper}>
        Select a JPG, PNG, or WEBP image (maximum 5 MB). It will be uploaded to FoodE.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAE7E3',
    borderRadius: 22,
    borderWidth: 1,
    padding: 13,
  },
  preview: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#FFF5E8',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#8B8B91',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    height: 46,
    borderRadius: 11,
    backgroundColor: '#FF7900',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  helper: {
    color: '#898990',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
});

export default FoodImagePicker;
