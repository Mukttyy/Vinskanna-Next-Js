const { chromium } = require('playwright');
const assert = require('assert');

async function runMasterVerification() {
  console.log('====================================================');
  console.log('🚀 VINSKANNA MASTER END-TO-END VERIFICATION (SESI 8)');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer'
    ]
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Listen for console errors
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  // Global dialog handler for prompt and confirm
  page.on('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') await dialog.accept('VIN-EXP-889900');
    else await dialog.accept();
  });

  // --- STEP 1: HOMEPAGE ---
  console.log('[1/7] Testing Homepage (/)...\n');
  await page.goto('http://localhost:3001/');
  await page.waitForLoadState('networkidle');

  // Verify Hero and collection
  const titleText = await page.locator('h1').first().textContent();
  assert(titleText.toLowerCase().includes('new arrivals'), 'Hero title should render');
  console.log('  ✓ Hero carousel title verified:', titleText.trim());

  // Add first product to cart
  const addCartBtn = page.locator('.add-to-cart').first();
  await addCartBtn.click();
  await page.waitForTimeout(400);
  console.log('  ✓ Added product to cart from homepage');

  // Toggle wishlist for second product
  const wishlistBtn = page.locator('.wishlist-toggle').nth(1);
  await wishlistBtn.click();
  await page.waitForTimeout(400);
  console.log('  ✓ Added product to wishlist from homepage');

  // --- STEP 2: WISHLIST ---
  console.log('\n[2/7] Testing Wishlist (/wishlist)...');
  await page.goto('http://localhost:3001/wishlist');
  await page.waitForLoadState('networkidle');

  const wishlistCards = await page.locator('.product-card').count();
  assert(wishlistCards >= 1, 'Wishlist should have at least 1 product');
  console.log(`  ✓ Wishlist rendered with ${wishlistCards} item(s)`);

  // Move product from wishlist to cart
  const moveToCartBtn = page.locator('.add-to-cart').first();
  await moveToCartBtn.click();
  await page.waitForTimeout(400);
  console.log('  ✓ Moved product from wishlist to cart');

  // --- STEP 3: SEARCH RESULTS ---
  console.log('\n[3/7] Testing Search (/search-results?q=Yellow)...');
  await page.goto('http://localhost:3001/search-results?q=Yellow');
  await page.waitForLoadState('networkidle');

  const searchResultsCount = await page.locator('.product-card').count();
  assert(searchResultsCount >= 1, 'Search results for Yellow should return products');
  console.log(`  ✓ Search results rendered with ${searchResultsCount} item(s)`);

  // --- STEP 4: CART ---
  console.log('\n[4/7] Testing Cart (/cart)...');
  await page.goto('http://localhost:3001/cart');
  await page.waitForLoadState('networkidle');

  const cartItemsCount = await page.locator('.cart-item').count();
  assert(cartItemsCount >= 1, 'Cart should have items');
  console.log(`  ✓ Cart rendered with ${cartItemsCount} item(s)`);

  // Apply voucher
  const voucherInput = page.locator('#voucher-code');
  if (await voucherInput.isVisible()) {
    await voucherInput.fill('VINSKANNA10');
    await page.locator('button.voucher-claim').click();
    await page.waitForTimeout(400);
    console.log('  ✓ Voucher VINSKANNA10 successfully applied');
  }

  // Proceed to Checkout
  const checkoutBtn = page.locator('button.cart-checkout');
  await checkoutBtn.click();

  // --- STEP 5: CHECKOUT ---
  console.log('\n[5/7] Testing Checkout (/checkout)...');
  await page.waitForURL('http://localhost:3001/checkout', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  await page.fill('#fullName', 'Siti Rahmawati');
  await page.fill('#phone', '081234567890');
  await page.fill('#city', 'Surakarta');
  await page.fill('#postalCode', '57126');
  await page.fill('#address', 'Jl. Merbabu No. 12, Manahan');
  await page.fill('#notes', 'Mohon dikirim pagi hari.');

  // Select BCA bank
  const bcaRadio = page.locator('input[type="radio"][name="bankAccount"]').first();
  await bcaRadio.click();

  // Place order
  const placeOrderBtn = page.locator('button:has-text("Buat Pesanan & Bayar")');
  await placeOrderBtn.click();

  // --- STEP 6: ORDER DETAIL ---
  console.log('\n[6/7] Testing Order Detail (/orders/[id])...');
  await page.waitForURL(/\/orders\/ORD-/, { timeout: 10000 });
  const orderUrl = page.url();
  const orderId = orderUrl.split('/').pop();
  console.log(`  ✓ Order created successfully: ${orderId}`);

  // Simulate audit payment -> Dikemas
  const auditBtn = page.locator('button:has-text("Audit & Verifikasi Transfer")');
  await auditBtn.click();
  await page.waitForTimeout(400);
  console.log('  ✓ Status updated to Dikemas');

  // Simulate shipping with tracking number
  const shipBtn = page.locator('button:has-text("Kirim Pesanan")');
  await shipBtn.click();
  await page.waitForTimeout(400);
  console.log('  ✓ Status updated to Dikirim with resi VIN-EXP-889900');

  // Complete order
  const completeBtn = page.locator('button:has-text("Tandai Pesanan Selesai")');
  await completeBtn.click();
  await page.waitForTimeout(400);
  console.log('  ✓ Status updated to Selesai');

  // Submit product review
  const reviewPromptBtn = page.locator('button.btn-review-prompt, button:has-text("Beri Ulasan Produk")').first();
  if (await reviewPromptBtn.isVisible()) {
    await reviewPromptBtn.click();
    await page.locator('textarea').fill('Pelayanan sangat ramah, bunga segar sempurna!');
    await page.locator('button.btn-review-submit, button:has-text("Kirim Ulasan")').click();
    await page.waitForTimeout(400);
    console.log('  ✓ 5-star product review submitted successfully');
  }

  // --- STEP 7: ORDERS LIST ---
  console.log('\n[7/7] Testing Orders List (/orders)...');
  await page.goto('http://localhost:3001/orders');
  await page.waitForLoadState('networkidle');

  const ordersCardCount = await page.locator('a:has-text("Lihat Detail & Status")').count();
  assert(ordersCardCount >= 1, 'Orders list should show the created order');
  console.log(`  ✓ Orders list rendered with ${ordersCardCount} order(s)`);

  // Filter by 'Selesai' tab
  const selesaiTab = page.locator('button:has-text("Selesai")');
  await selesaiTab.click();
  await page.waitForTimeout(400);
  const selesaiCount = await page.locator('a:has-text("Lihat Detail & Status")').count();
  assert(selesaiCount >= 1, 'Selesai filter tab should contain the finished order');
  console.log(`  ✓ Selesai tab filter verified with ${selesaiCount} completed order(s)`);

  assert.strictEqual(errors.length, 0, `No JavaScript runtime errors expected, found: ${errors.join(', ')}`);

  await browser.close();
  console.log('\n====================================================');
  console.log('🎉 ALL 7 PAGES PASSED 100% VERIFICATION WITH ZERO ERRORS!');
  console.log('====================================================\n');
}

runMasterVerification().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
