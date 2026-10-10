import {ImageSourcePropType} from 'react-native';

export interface BannerItem {
  id: string;
  image: ImageSourcePropType;
}

export const bannerData: BannerItem[] = [
  {
    id: '1',
    image: require(
      '../../../../../assets/banners/banner1.jpg',
    ),
  },

  {
    id: '2',
    image: require(
      '../../../../../assets/banners/banner2.jpg',
    ),
  },

  {
    id: '3',
    image: require(
      '../../../../../assets/banners/banner3.jpg',
    ),
  },

  {
    id: '4',
    image: require(
      '../../../../../assets/banners/banner4.jpg',
    ),
  },
];
