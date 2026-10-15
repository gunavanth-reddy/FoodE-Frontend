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

  const imageSource: ImageSource | undefined =
    typeof source === 'string'
      ? source.trim()
        ? {uri: resolveImageUri(source)}
        : undefined
      : source || undefined;
  const uriSource =
    imageSource &&
    typeof imageSource === 'object' &&
    !Array.isArray(imageSource) &&
    'uri' in imageSource &&
    typeof imageSource.uri === 'string'
      ? {...imageSource, uri: resolveImageUri(imageSource.uri)}
      : imageSource;
  const imageUri =
    uriSource &&
    typeof uriSource === 'object' &&
    !Array.isArray(uriSource) &&
    'uri' in uriSource &&
    typeof uriSource.uri === 'string'
      ? uriSource.uri
      : undefined;
  const resolvedImageSource = uriSource;

  const sourceKey =
    typeof source === 'string'
      ? imageUri || source.trim()
      : typeof source === 'number'
        ? `asset:${source}`
        : source &&
            typeof source === 'object' &&
            'uri' in source &&
            typeof source.uri === 'string'
          ? source.uri
          : '';

  useEffect(() => {
    setImageFailed(false);
  }, [sourceKey, retryKey]);

  return (
    <View style={[style, styles.container]}>
      {resolvedImageSource && !imageFailed ? (
        <ExpoImage
          source={resolvedImageSource}
          style={StyleSheet.absoluteFill}
          contentFit={resizeMode}
          cachePolicy="memory-disk"
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
