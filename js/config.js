// Ganti identitas toko di sini. Konten editorial/footer dapat diubah pada HTML.
window.storeConfig = Object.freeze({
    name: 'Vinskanna',
    contact: 'Kontak belum dikonfigurasi.',
    address: '',
    email: '',
    phone: '',
    socialLinks: { facebook: '', twitter: '', instagram: '', whatsapp: '', pinterest: '' },
    storagePrefix: 'vinskanna', // Ganti untuk setiap toko pada domain yang sama.
    // Voucher simulasi; validasi transaksi nyata harus dilakukan di server.
    vouchers: [{ code: 'VINSKANNA10', percent: 10 }],
    maxQuantity: 99
});
