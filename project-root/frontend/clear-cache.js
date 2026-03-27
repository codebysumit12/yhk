console.log('🧹 Clearing frontend cache...');

// Clear all localStorage items that might cache item data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('item') || key.includes('menu') || key.includes('category'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => localStorage.removeItem(key));
console.log(`Cleared ${keysToRemove.length} cache keys:`, keysToRemove);

// Clear session storage too
sessionStorage.clear();

console.log('✅ Cache cleared! Please refresh the page.');
