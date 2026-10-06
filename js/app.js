(() => {
    'use strict';
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];
    const money = value => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(value);
    const el = (tag, text, className) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    };
    function notify(message) {
        const status = $('#store-status');
        status.textContent = message;
        status.hidden = false;
    }
    function save(kind, items) {
        if (!Store.write(kind, items)) {
            notify('Penyimpanan browser tidak tersedia atau penuh. Perubahan belum disimpan.');
            return false;
        }
        refresh();
        return true;
    }
    function add(id) {
        const cart = Store.read('cart');
        const item = cart.find(p => p.id === id);
        if (item && item.quantity >= Store.max) { notify(`Maksimal ${Store.max} per produk.`); return; }
        if (item) item.quantity++;
        else cart.push({id, quantity:1});
        if (save('cart',cart)) notify('Produk ditambahkan ke keranjang.');
    }
    function toggle(id) {
        const list = Store.read('wishlist');
        const exists = list.some(p => p.id === id);
        if(save('wishlist', exists ? list.filter(p => p.id !== id) : [...list,{id}])) notify(exists?'Produk dihapus dari wishlist.':'Produk ditambahkan ke wishlist.');
    }
    function button(label, action, className='btn btn-primary mt-3') {
        const node = el('button',label,className); node.type='button'; node.addEventListener('click',action); return node;
    }
    function productIcon(name) {
        const source = document.querySelector(name === 'cart' ? '.nav-btns [aria-label="Keranjang"] svg' : '.nav-btns [aria-label="Wishlist"] svg');
        const icon = source.cloneNode(true);
        icon.classList.add('product-action-icon');
        return icon;
    }
    function cards(target, products) {
        if (!target) return;
        target.replaceChildren();
        if (!products.length) { target.append(el('p','Tidak ada produk untuk ditampilkan.','text-center text-muted')); return; }
        for (const p of products) {
            const card = el('div',undefined,`col-md-6 col-lg-4 col-xl-3 p-2 product-card ${p.category}`);
            const img = el('img',undefined,'w-100 product-image'); img.src=p.image; img.alt=p.name; img.loading='lazy';
            const body = el('div',undefined,'text-center');
            const heart = button('',()=>toggle(p.id),'btn wishlist-toggle'); heart.dataset.id=p.id;
            heart.append(productIcon('heart'));
            const cartButton = button('',()=>add(p.id),'btn btn-primary add-to-cart');
            cartButton.append(productIcon('cart'),el('span','Add to Cart'));
            const actions = el('div',undefined,'product-actions');
            actions.append(cartButton,heart);
            body.append(el('p',p.name,'text-capitalize mt-3 mb-1'),el('span',money(p.price),'fw-bold d-block'),actions);
            const imageFrame = el('div',undefined,'product-image-frame');
            imageFrame.append(img);
            card.append(imageFrame,body); target.append(card);
        }
    }
    const cartSelection = new Map();
    let claimedVoucher = null;
    function renderCart() {
        const target=$('#cart-content'); if(!target) return;
        target.replaceChildren();
        const cart=Store.read('cart');
        for (const id of cartSelection.keys()) if (!cart.some(p=>p.id===id)) cartSelection.delete(id);
        cart.forEach(p=>{if(!cartSelection.has(p.id))cartSelection.set(p.id,true);});
        if(!cart.length){
            claimedVoucher = null;
            const empty=el('div',undefined,'cart-empty');
            const link=el('a','Jelajahi Koleksi','btn');link.href='index.html#collection';
            empty.append(el('h3','Keranjang Anda masih kosong'),el('p','Pilih buket untuk momen istimewa Anda.'),link);target.append(empty);return;
        }
        const layout=el('div',undefined,'cart-layout'),list=el('div',undefined,'cart-items');
        const toolbar=el('div',undefined,'cart-toolbar');
        const allLabel=el('label',undefined,'cart-select-all'),all=el('input');all.type='checkbox';
        const removeSelected=button('Hapus',()=>{
            if(save('cart',Store.read('cart').filter(p=>!cartSelection.get(p.id))))renderCart();
        },'cart-text-button');removeSelected.setAttribute('aria-label','Hapus produk terpilih');
        all.setAttribute('aria-label',`Pilih semua ${cart.length} produk`);
        allLabel.append(all,el('span','Produk'));
        toolbar.append(allLabel,...['Harga Satuan','Kuantitas','Total Harga','Aksi'].map(label=>el('span',label,'cart-column-label')));
        const storeHeading=el('div',undefined,'cart-store-heading');
        storeHeading.append(el('strong',storeConfig.name),el('span',`${cart.length} produk`),removeSelected);
        list.append(toolbar,storeHeading);
        const summary=el('aside',undefined,'cart-summary');summary.setAttribute('aria-labelledby','cart-summary-title');
        const title=el('h3','Ringkasan Belanja');title.id='cart-summary-title';
        const totalLine=el('div',undefined,'cart-summary-total'),totalLabel=el('span'),total=el('strong',undefined,'cart-total');
        total.setAttribute('aria-live','polite');totalLine.append(totalLabel,total);
        const checkout=button('Checkout belum tersedia',()=>{},'btn cart-checkout');checkout.disabled=true;
        const voucherForm=el('form',undefined,'voucher-form');
        const voucherLabel=el('label','Kode voucher');voucherLabel.htmlFor='voucher-code';
        const voucherInput=el('input',undefined,'form-control');
        Object.assign(voucherInput,{id:'voucher-code',type:'text',placeholder:'Masukkan kode',maxLength:40,autocomplete:'off'});
        voucherInput.setAttribute('aria-describedby','voucher-message');
        const claim=el('button','Klaim','btn voucher-claim');claim.type='submit';
        const voucherRow=el('div',undefined,'voucher-input-row');voucherRow.append(voucherInput,claim);
        const voucherMessage=el('p',undefined,'voucher-message');voucherMessage.id='voucher-message';voucherMessage.setAttribute('role','status');
        const removeVoucher=button('Hapus voucher',()=>{claimedVoucher=null;voucherInput.value='';voucherInput.removeAttribute('aria-invalid');updateSummary();},'cart-text-button voucher-remove');
        voucherForm.append(voucherLabel,voucherRow,el('p','Coba VINSKANNA10 untuk diskon demo 10%.','voucher-hint'),voucherMessage,removeVoucher);
        const subtotalRow=el('div',undefined,'cart-summary-total voucher-breakdown'),subtotalValue=el('span');subtotalRow.append(el('span','Subtotal'),subtotalValue);
        const discountRow=el('div',undefined,'cart-summary-total voucher-discount'),discountValue=el('span');discountRow.append(el('span','Potongan voucher'),discountValue);
        summary.append(title,voucherForm,subtotalRow,discountRow,totalLine,el('p','Ongkir belum termasuk.','cart-shipping-note'),checkout,el('p','Mode demo — pesanan dan pembayaran belum tersedia.','cart-demo-note'));
        function updateSummary(){
            const selected=cart.filter(p=>cartSelection.get(p.id));
            const subtotal=selected.reduce((sum,p)=>sum+p.price*p.quantity,0);
            const discount=claimedVoucher?Math.min(subtotal,Math.floor(subtotal*claimedVoucher.percent/100)):0;
            all.checked=selected.length===cart.length;all.indeterminate=selected.length>0&&selected.length<cart.length;
            removeSelected.disabled=!selected.length;
            totalLabel.textContent=`Total (${selected.reduce((sum,p)=>sum+p.quantity,0)} barang)`;
            total.textContent=money(subtotal-discount);
            subtotalValue.textContent=money(subtotal);discountValue.textContent='− '+money(discount);
            subtotalRow.hidden=discountRow.hidden=!claimedVoucher;
            removeVoucher.hidden=!claimedVoucher;
            if(claimedVoucher){
                voucherInput.value=claimedVoucher.code;
                voucherMessage.textContent=selected.length?`${claimedVoucher.code} aktif: diskon ${claimedVoucher.percent}%.`:'Pilih produk untuk menggunakan voucher.';
            }else voucherMessage.textContent='';
        }
        voucherForm.addEventListener('submit',event=>{
            event.preventDefault();
            const code=voucherInput.value.trim().toUpperCase();
            const found=(storeConfig.vouchers||[]).find(v=>v.code===code&&Number.isFinite(v.percent)&&v.percent>0&&v.percent<=100);
            if(!found){voucherMessage.textContent=code?'Kode voucher tidak valid.':'Masukkan kode voucher terlebih dahulu.';voucherInput.setAttribute('aria-invalid','true');return;}
            if(!cart.some(p=>cartSelection.get(p.id))){voucherMessage.textContent='Pilih minimal satu produk terlebih dahulu.';return;}
            claimedVoucher={code:found.code,percent:found.percent};
            voucherInput.removeAttribute('aria-invalid');updateSummary();
        });
        all.addEventListener('change',()=>{cart.forEach(p=>cartSelection.set(p.id,all.checked));list.querySelectorAll('.cart-item-select').forEach(input=>input.checked=all.checked);updateSummary();});
        for(const p of cart){
            const item=el('article',undefined,'cart-item');
            const check=el('input',undefined,'cart-item-select');check.type='checkbox';check.checked=cartSelection.get(p.id);check.setAttribute('aria-label',`Pilih ${p.name}`);
            check.addEventListener('change',()=>{cartSelection.set(p.id,check.checked);updateSummary();});
            const img=el('img',undefined,'cart-item-image');Object.assign(img,{src:p.image,alt:p.name,width:90,height:120});
            const details=el('div',undefined,'cart-item-details');details.append(el('h3',p.name));
            const price=el('div',money(p.price),'cart-item-price');price.dataset.label='Harga Satuan';
            const lineTotal=el('strong',money(p.price*p.quantity),'cart-line-total');lineTotal.dataset.label='Total Harga';
            const actions=el('div',undefined,'cart-item-actions');
            const heart=button('',()=>toggle(p.id),'cart-icon-button wishlist-toggle');heart.dataset.id=p.id;heart.append(productIcon('heart'));
            const remove=button('',()=>{if(save('cart',Store.read('cart').filter(x=>x.id!==p.id)))renderCart();},'cart-icon-button');remove.setAttribute('aria-label',`Hapus ${p.name}`);remove.title='Hapus produk';remove.classList.add('cart-remove-button');
            const trash=document.createElementNS('http://www.w3.org/2000/svg','svg');
            for(const [key,value] of Object.entries({viewBox:'0 0 24 24',width:'19',height:'19',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}))trash.setAttribute(key,value);
            const trashPath=document.createElementNS('http://www.w3.org/2000/svg','path');
            trashPath.setAttribute('d','M3 6h18M9 6V4h6v2M5 6l1 15h12l1-15M10 10v7M14 10v7');
            trash.append(trashPath);remove.append(trash);
            const quantity=el('div',undefined,'cart-quantity'),input=el('input',undefined,'quantity-input');
            Object.assign(input,{type:'number',min:'1',max:String(Store.max),step:'1',value:String(p.quantity)});input.setAttribute('aria-label',`Jumlah ${p.name}`);
            function changeQuantity(n){
                if(!Number.isInteger(n)||n<1||n>Store.max){input.value=String(p.quantity);notify(`Jumlah harus bilangan bulat 1–${Store.max}.`);return;}
                const current=Store.read('cart'),entry=current.find(x=>x.id===p.id);
                if(entry){entry.quantity=n;if(save('cart',current))renderCart();else input.value=String(p.quantity);}
            }
            const minus=button('−',()=>changeQuantity(p.quantity-1),'cart-quantity-button'),plus=button('+',()=>changeQuantity(p.quantity+1),'cart-quantity-button');
            minus.disabled=p.quantity===1;plus.disabled=p.quantity===Store.max;
            minus.setAttribute('aria-label',`Kurangi ${p.name}`);plus.setAttribute('aria-label',`Tambah ${p.name}`);
            input.addEventListener('change',()=>changeQuantity(Number(input.value)));
            quantity.append(minus,input,plus);quantity.setAttribute('aria-label',`Kuantitas ${p.name}`);
            actions.append(heart,remove);
            const product=el('div',undefined,'cart-product-cell');product.append(check,img,details);
            item.append(product,price,quantity,lineTotal,actions);list.append(item);
        }
        layout.append(list,summary);target.append(layout);updateSummary();refresh();
    }
    function refresh() {
        $$('[data-cart-count]').forEach(n=>n.textContent=Store.read('cart').reduce((sum,p)=>sum+p.quantity,0));
        const list=Store.read('wishlist');
        $$('[data-wishlist-count]').forEach(n=>n.textContent=list.length);
        if($('#wishlist-content'))cards($('#wishlist-content'),list);
        $$('.wishlist-toggle').forEach(b=>{const active=list.some(p=>p.id===b.dataset.id);const label=active?'Hapus dari wishlist':'Tambah ke wishlist';b.setAttribute('aria-label',label);b.title=label;b.setAttribute('aria-pressed',String(active));});
    }
    $$('[data-store-name]').forEach(n=>n.textContent=storeConfig.name);
    $$('[data-store-contact]').forEach(n=>n.textContent=storeConfig.contact);
    $$('[data-footer-contact]').forEach(node => {
        const value = storeConfig[node.dataset.footerContact];
        if (typeof value === 'string' && value.trim()) node.textContent = value.trim();
    });
    $$('[data-social]').forEach(node => {
        const value = storeConfig.socialLinks?.[node.dataset.social];
        try {
            const url = new URL(value);
            if (url.protocol !== 'https:') return;
            const link = el('a', undefined, node.className);
            link.href = url.href;
            link.setAttribute('aria-label', node.dataset.social);
            link.title = node.dataset.social;
            link.append(...node.childNodes);
            node.replaceWith(link);
        } catch { /* Leave unconfigured channels as non-clickable icons. */ }
    });
    document.title=document.title.replace('Vinskanna',storeConfig.name);
    cards($('.collection-list'),allProducts.filter(p=>p.category!=='special'));
    cards($('.special-list'),allProducts.filter(p=>p.category==='special'));
    if($('#results-content')) {
        const query=(new URLSearchParams(location.search).get('q')||'').trim().slice(0,200);
        $('#search-title').textContent=query?`Hasil Pencarian untuk: ${query}`:'Silakan masukkan kata kunci pencarian.';
        cards($('#results-content'),query?allProducts.filter(p=>[p.name,...p.tags].some(t=>t.toLocaleLowerCase('id').includes(query.toLocaleLowerCase('id')))):[]);
    }
    const filterButtons = $$('.filter-button-group button');
    const collectionCards = $$('.collection-list > div');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let filterRun = 0;
    let filterAnimations = [];
    function cancelFilterAnimations() {
        filterAnimations.forEach(animation => animation.cancel());
        filterAnimations = [];
    }
    async function filterCollection(button) {
        const run = ++filterRun;
        cancelFilterAnimations();
        filterButtons.forEach(item => {
            item.classList.toggle('active-filter-btn', item === button);
            item.setAttribute('aria-pressed', String(item === button));
        });
        const matches = card => button.dataset.filter === '*' || card.classList.contains(button.dataset.filter.slice(1));
        if (reducedMotion.matches || !Element.prototype.animate) {
            collectionCards.forEach(card => card.hidden = !matches(card));
            return;
        }
        const before = new Map(collectionCards.filter(card => !card.hidden).map(card => [card, card.getBoundingClientRect()]));
        const exiting = collectionCards.filter(card => !card.hidden && !matches(card));
        filterAnimations = exiting.map(card => card.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.96)' }
        ], { duration: 120, easing: 'ease-out', fill: 'forwards' }));
        await Promise.allSettled(filterAnimations.map(animation => animation.finished));
        if (run !== filterRun) return;
        collectionCards.forEach(card => card.hidden = !matches(card));
        cancelFilterAnimations();
        filterAnimations = collectionCards.filter(card => !card.hidden).map(card => {
            const previous = before.get(card);
            const next = card.getBoundingClientRect();
            return card.animate(previous ? [
                { transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px)` },
                { transform: 'translate(0, 0)' }
            ] : [
                { opacity: 0, transform: 'translateY(10px) scale(0.97)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
            ], { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        });
        await Promise.allSettled(filterAnimations.map(animation => animation.finished));
        if (run === filterRun) cancelFilterAnimations();
    }
    filterButtons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.classList.contains('active-filter-btn')));
        button.addEventListener('click', () => {
            if (!button.classList.contains('active-filter-btn')) filterCollection(button);
        });
    });
    function settleFilter() {
        ++filterRun;
        cancelFilterAnimations();
        const active = filterButtons.find(button => button.classList.contains('active-filter-btn'));
        if (active) collectionCards.forEach(card => card.hidden = active.dataset.filter !== '*' && !card.classList.contains(active.dataset.filter.slice(1)));
    }
    window.addEventListener('resize', settleFilter);
    reducedMotion.addEventListener('change', settleFilter);
    const search = $('#search-form'), trigger = $('#search-icon-btn');
    let searchAnimation;
    function closeSearch() {
        if (trigger.getAttribute('aria-expanded') !== 'true') return;
        trigger.setAttribute('aria-expanded', 'false');
        const width = search.getBoundingClientRect().width;
        if (searchAnimation) searchAnimation.cancel();
        if (reducedMotion.matches) { search.hidden = true; return; }
        searchAnimation = search.animate([
            { width: `${width}px`, opacity: 1 },
            { width: '0px', opacity: 0 }
        ], { duration: 180, easing: 'ease-in-out' });
        searchAnimation.onfinish = () => { search.hidden = true; searchAnimation = undefined; };
    }
    trigger.addEventListener('click', () => {
        if (trigger.getAttribute('aria-expanded') === 'true') { closeSearch(); return; }
        if (searchAnimation) searchAnimation.cancel();
        search.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        if (!reducedMotion.matches) {
            const width = search.getBoundingClientRect().width;
            searchAnimation = search.animate([
                { width: '0px', opacity: 0 },
                { width: `${width}px`, opacity: 1 }
            ], { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        }
        search.querySelector('input').focus({ preventScroll: true });
    });
    document.addEventListener('click', event => {
        if (!search.contains(event.target) && !trigger.contains(event.target)) closeSearch();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !search.hidden) { closeSearch(); trigger.focus(); }
    });
    $('#search-form input').value = (new URLSearchParams(location.search).get('q') || '').slice(0,200);
    window.addEventListener('storage',()=>{refresh();renderCart();});
    if ($('#header') || $('#cart')) {
        const navbar = $('.navbar');
        const syncNavbarHeight = () => document.documentElement.style.setProperty('--navbar-height', `${navbar.getBoundingClientRect().height}px`);
        syncNavbarHeight();
        new ResizeObserver(syncNavbarHeight).observe(navbar);
    }
    refresh();renderCart();
})();
