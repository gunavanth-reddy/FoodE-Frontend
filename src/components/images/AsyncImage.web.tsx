import React, {ReactNode, useEffect, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  Image as ExpoImage,
  type ImageContentFit,
  type ImageSource,
} from 'expo-image';
import {ForkKnife, Storefront} from 'phosphor-react-native';
import {resolveImageUri} from './resolveImageUri';

interface AsyncImageProps {
  source?: ImageSource | string | null;
  style: StyleProp<ViewStyle>;
  kind?: 'food' | 'restaurant';
  resizeMode?: ImageContentFit;
  retryKey?: string | number;
  placeholder?: ReactNode;
}

const AsyncImage: React.FC<AsyncImageProps> = ({
  source,
  style,
  kind = 'food',
  resizeMode = 'cover',
  retryKey,
  placeholder,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const sourceUri = typeof source === 'string' ? source.trim() : undefined;
  const imageSource =
    typeof source === 'string'
      ? sourceUri
        ? {uri: resolveImageUri(sourceUri)}
        : undefined
      : source || undefined;
  const normalizedImageSource =
    imageSource &&
    typeof imageSource === 'object' &&
    !Array.isArray(imageSource) &&
    'uri' in imageSource &&
    typeof imageSource.uri === 'string'
      ? {...imageSource, uri: resolveImageUri(imageSource.uri)}
      : imageSource;
  const imageUri =
    normalizedImageSource &&
    typeof normalizedImageSource === 'object' &&
    !Array.isArray(normalizedImageSource) &&
    'uri' in normalizedImageSource &&
    typeof normalizedImageSource.uri === 'string'
      ? normalizedImageSource.uri
      : undefined;
  const shouldCacheImage =
    typeof imageUri === 'string';
  const sourceKey =
    sourceUri ??
    (    typeof normalizedImageSource === 'number'
      ? `asset:${normalizedImageSource}`
      : imageUri ?? '');

  useEffect(() => {
    setImageFailed(false);
  }, [sourceKey, retryKey]);

  return (
    <View style={[style, styles.container]}>
      {normalizedImageSource && !imageFailed ? (
        <ExpoImage
          source={normalizedImageSource}
          style={StyleSheet.absoluteFill}
          contentFit={resizeMode}
          cachePolicy={shouldCacheImage ? 'memory-disk' : 'disk'}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          {placeholder ??
            (kind === 'restaurant' ? (
              <Storefront size={30} color="#C9CDD3" weight="regular" />
            ) : (
              <ForkKnife size={30} color="#C9CDD3" weight="regular" />
            ))}
        </View>
      )}
    </View>
  );
};

export default AsyncImage;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
});
