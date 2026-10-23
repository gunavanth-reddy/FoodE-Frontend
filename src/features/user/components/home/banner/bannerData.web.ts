import type {BannerItem} from './bannerData';

const WHATSAPP_CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbEDaijD38CV27uyGB0d';

export const baseBannerData: BannerItem[] = [
  {
    id: 'banner1',
    image: {uri: 'https://cdn.foode.site/banners/banner1.png'},
  },
  {
    id: 'banner2',
    image: {uri: 'https://cdn.foode.site/banners/banner2.png'},
  },
  {
    id: 'banner3',
    image: {uri: 'https://cdn.foode.site/banners/banner3.png'},
  },
  {
    id: 'banner4',
    image: {uri: 'https://cdn.foode.site/banners/banner4.png'},
    link: WHATSAPP_CHANNEL_URL,
  },
];
