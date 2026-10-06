const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext(); const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8765')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto('http://127.0.0.1:8765');
 assert.equal(await page.locator('.collection-list .product-image').count(),8);
 await page.getByRole('button',{name:'Best Sellers',exact:true}).click();
 await page.waitForFunction(() => [...document.querySelectorAll('.collection-list > div')].filter(card => !card.hidden).length === 3 && document.querySelector('.collection-list').getAnimations({subtree:true}).length === 0);
 assert.equal(await page.locator('.collection-list > div:visible').count(),3);
 await page.getByRole('button',{name:'All',exact:true}).click();
 await page.getByRole('button',{name:'Add to Cart',exact:true}).first().click();
 await page.getByRole('button',{name:'Tambah ke wishlist',exact:true}).first().click();
 assert.equal(await page.locator('[data-cart-count]').innerText(),'1');
 await page.goto('http://127.0.0.1:8765/wishlist.html');
 assert.equal(await page.locator('.product-image').count(),1);
 await page.getByRole('button',{name:'Add to Cart',exact:true}).click();
 await page.goto('http://127.0.0.1:8765/cart.html');
 await page.locator('.quantity-input').fill('3');await page.locator('.quantity-input').dispatchEvent('change');
 assert.match(await page.locator('.cart-total').innerText(),/660.000/);
 await page.locator('.quantity-input').fill('-1');await page.locator('.quantity-input').dispatchEvent('change');assert.equal(await page.locator('.quantity-input').inputValue(),'3');
 assert.equal(await page.locator('#checkout-form').count(),0);
 await page.getByRole('button',{name:'Hapus Mix Yellow',exact:true}).click();assert.match(await page.locator('#cart-content').innerText(),/kosong/);
 await page.goto('http://127.0.0.1:8765/search-results.html?q='+encodeURIComponent('<img src=x onerror="window.xss=1">'));
 assert.equal(await page.locator('#search-title img').count(),0);assert.equal(await page.evaluate(()=>window.xss),undefined);
 await page.goto('http://127.0.0.1:8765/search-results.html?q=%20rose%20');assert.equal(await page.locator('.product-image').count(),2);
 await page.evaluate(()=>localStorage.setItem('vinskanna:cart','{broken'));await page.goto('http://127.0.0.1:8765/cart.html');assert.match(await page.locator('#cart-content').innerText(),/kosong/);
 await page.setViewportSize({width:390,height:844});
 for(const path of ['index.html','cart.html','wishlist.html','search-results.html?q=bunga']){
 await page.goto('http://127.0.0.1:8765/'+path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow on ${path}`);
 }
 await page.goto('http://127.0.0.1:8765/index.html');await page.screenshot({path:'/tmp/vinskanna-mobile.png',fullPage:false});
 await page.getByRole('button',{name:'Buka navigasi',exact:true}).click();await page.getByRole('button',{name:'Cari',exact:true}).click();await page.getByRole('searchbox',{name:'Cari produk'}).fill('tulip');await page.getByRole('searchbox',{name:'Cari produk'}).press('Enter');assert.equal(await page.locator('.product-image').count(),2);
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw Error('blocked');};});
 const blockedPage=await blocked.newPage();await blockedPage.goto('http://127.0.0.1:8765');await blockedPage.getByRole('button',{name:'Add to Cart',exact:true}).first().click();assert.match(await blockedPage.locator('#store-status').innerText(),/belum disimpan/);
 assert.deepEqual(errors,[]);console.log('PASS: browser shopping, filtering, search, XSS, corrupted/blocked storage, mobile overflow');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
