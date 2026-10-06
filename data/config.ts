export interface Voucher {
  code: string;
  percent: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoText: string;
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
  bankAccounts: BankAccount[];
}

export const storeConfig: StoreConfig = Object.freeze({
  name: 'Vinskanna',
  contact: 'Kontak belum dikonfigurasi.',
  address: 'Jl. Melati No. 18, Jakarta Selatan',
  email: 'contact@vinskanna.com',
  phone: '+62 812-3456-7890',
  socialLinks: { facebook: '', twitter: '', instagram: '', whatsapp: '+6281234567890', pinterest: '' },
  storagePrefix: 'vinskanna',
  vouchers: [{ code: 'VINSKANNA10', percent: 10 }],
  maxQuantity: 99,
  bankAccounts: [
    { id: 'bca', bankName: 'BCA', accountNumber: '8690-1234-56', accountHolder: 'PT Vinskanna Florist', logoText: 'BCA' },
    { id: 'mandiri', bankName: 'Mandiri', accountNumber: '137-00-1234567-8', accountHolder: 'PT Vinskanna Florist', logoText: 'Mandiri' },
    { id: 'bri', bankName: 'BRI', accountNumber: '0123-01-001234-53-3', accountHolder: 'PT Vinskanna Florist', logoText: 'BRI' },
    { id: 'bni', bankName: 'BNI', accountNumber: '0987-654-321', accountHolder: 'PT Vinskanna Florist', logoText: 'BNI' }
  ]
});
