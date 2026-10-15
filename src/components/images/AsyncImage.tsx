import React, {ReactNode, useEffect, useState} from 'react';
import {
  Image,
  ImageResizeMode,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {ForkKnife, Storefront} from 'phosphor-react-native';

const isFoodECdnUrl = (uri: string): boolean =>
  /^https?:\/\/cdn\.foode\.site(?:\/|$)/i.test(uri);

interface AsyncImageProps {
  source?: ImageSourcePropType | string | null;
  style: StyleProp<ViewStyle>;
  kind?: 'food' | 'restaurant';
  resizeMode?: ImageResizeMode;
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

  const imageSource: ImageSourcePropType | undefined =
    typeof source === 'string'
      ? source.trim()
        ? {uri: source.trim()}
        : undefined
      : source || undefined;
  const cachedImageSource: ImageSourcePropType | undefined =
    imageSource &&
    typeof imageSource === 'object' &&
    !Array.isArray(imageSource) &&
    typeof imageSource.uri === 'string' &&
    isFoodECdnUrl(imageSource.uri)
      ? {...imageSource, cache: 'force-cache'}
      : imageSource;

  const sourceKey =
    typeof source === 'string'
      ? source.trim()
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
      {imageSource && !imageFailed ? (
        <Image
          source={cachedImageSource}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
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
