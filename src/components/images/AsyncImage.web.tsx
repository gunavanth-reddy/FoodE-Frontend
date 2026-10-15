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

const isFoodECdnUrl = (uri: string): boolean =>
  /^https?:\/\/cdn\.foode\.site(?:\/|$)/i.test(uri);

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
        ? {uri: sourceUri}
        : undefined
      : source || undefined;
  const imageUri =
    typeof imageSource === 'object' && imageSource && 'uri' in imageSource
      ? imageSource.uri
      : undefined;
  const shouldCacheImage =
    typeof imageUri === 'string' && isFoodECdnUrl(imageUri);
  const sourceKey =
    sourceUri ??
    (typeof imageSource === 'number' ? `asset:${imageSource}` : imageUri ?? '');

  useEffect(() => {
    setImageFailed(false);
  }, [sourceKey, retryKey]);

  return (
    <View style={[style, styles.container]}>
      {imageSource && !imageFailed ? (
        <ExpoImage
          source={imageSource}
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
