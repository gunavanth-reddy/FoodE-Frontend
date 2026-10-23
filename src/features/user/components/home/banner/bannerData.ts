import {ImageSourcePropType} from 'react-native';

export interface BannerItem {
  id: string;
  image: ImageSourcePropType;
  link?: string;
}

const WHATSAPP_CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbEDaijD38CV27uyGB0d';

export const baseBannerData: BannerItem[] = [
  {
    id: 'banner1',
    image: require('../../../../../assets/banners/banner1.png'),
  },
  {
    id: 'banner2',
    image: require('../../../../../assets/banners/banner2.png'),
  },
  {
    id: 'banner3',
    image: require('../../../../../assets/banners/banner3.png'),
  },
  {
    id: 'banner4',
    image: require('../../../../../assets/banners/banner4.png'),
    link: WHATSAPP_CHANNEL_URL,
  },
];
