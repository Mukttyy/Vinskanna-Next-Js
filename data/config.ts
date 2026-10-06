export interface Voucher {
  code: string;
  percent: number;
}

export interface StoreConfig {
  name: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    whatsapp: string;
    pinterest: string;
  };
  storagePrefix: string;
  vouchers: Voucher[];
  maxQuantity: number;
}

export const storeConfig: StoreConfig = Object.freeze({
  name: 'Vinskanna',
  contact: 'Kontak belum dikonfigurasi.',
  address: '',
  email: '',
  phone: '',
  socialLinks: { facebook: '', twitter: '', instagram: '', whatsapp: '', pinterest: '' },
  storagePrefix: 'vinskanna',
  vouchers: [{ code: 'VINSKANNA10', percent: 10 }],
  maxQuantity: 99
});
