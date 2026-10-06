(function (root) {
    'use strict';
    const products = root.allProducts;
    const max = root.storeConfig.maxQuantity;
    const key = kind => `${root.storeConfig.storagePrefix}:${kind}`;
    function normalize(value, kind) {
        if (!Array.isArray(value)) return [];
        const seen = new Set();
        return value.flatMap(entry => {
            if (!entry || typeof entry !== 'object' || seen.has(entry.id)) return [];
            const product = products.find(p => p.id === entry.id);
            if (!product) return [];
            if (kind === 'cart' && (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > max)) return [];
            seen.add(entry.id);
            return [{ ...product, ...(kind === 'cart' ? { quantity: entry.quantity } : {}) }];
        });
    }
    function read(kind) {
        try { return normalize(JSON.parse(root.localStorage.getItem(key(kind)) || '[]'), kind); }
        catch { return []; }
    }
    function write(kind, items) {
        try {
            root.localStorage.setItem(key(kind), JSON.stringify(normalize(items, kind).map(p => ({id:p.id, ...(kind === 'cart' ? {quantity:p.quantity} : {})}))));
            return true;
        } catch { return false; }
    }
    root.Store = { read, write, normalize, max };
})(window);
