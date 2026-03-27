console.log('🔄 FORCING FRONTEND DATA REFRESH');
console.log('==================================');

// Clear all caches
localStorage.clear();
sessionStorage.clear();

// Force refresh with cache bust
const timestamp = Date.now();
window.location.href = `${window.location.origin}${window.location.pathname}?_refresh=${timestamp}`;

console.log('✅ Cache cleared and refreshing...');
