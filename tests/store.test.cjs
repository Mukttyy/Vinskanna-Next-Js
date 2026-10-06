const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(storage = {}) {
 const values = new Map();
 const window = {localStorage: {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),...storage}};
 const context = vm.createContext({window});
 for(const file of ['config','products','store'])vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),context);
 return {window,values,Store:window.Store};
}
test('invalid storage cannot crash the store',()=>{
 const {Store,values}=setup();
 for(const input of ['{','null','{}','[null,3,"x"]']){values.set('vinskanna:cart',input);assert.equal(Store.read('cart').length,0);}
});
test('only catalog data is trusted, duplicates and unknown IDs are rejected',()=>{
 const {Store,window}=setup();const id=window.allProducts[0].id;
 assert.equal(Store.write('cart',[{id,quantity:2,name:'<img onerror=alert(1)>',price:1},{id,quantity:3},{id:'unknown',quantity:1}]),true);
 const cart=Store.read('cart');assert.equal(cart.length,1);assert.equal(cart[0].price,220000);assert.equal(cart[0].quantity,2);
});
test('quantity must be bounded positive integer',()=>{
 const {Store,window}=setup();const id=window.allProducts[0].id;
 for(const quantity of [0,-1,1.5,100,Infinity,'2',null])assert.equal(Store.normalize([{id,quantity}],'cart').length,0);
 assert.equal(Store.normalize([{id,quantity:99}],'cart').length,1);
});
test('storage errors are reported, not treated as successful saves',()=>{
 const {Store}=setup({getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('quota');}});
 assert.equal(Store.read('cart').length,0);assert.equal(Store.write('cart',[]),false);
});
test('catalog IDs are unique and all product images exist',()=>{
 const {window}=setup();assert.equal(new Set(window.allProducts.map(p=>p.id)).size,window.allProducts.length);
 for(const p of window.allProducts){assert.ok(fs.existsSync(p.image),p.image);assert.ok(Number.isSafeInteger(p.price)&&p.price>0);}
});
