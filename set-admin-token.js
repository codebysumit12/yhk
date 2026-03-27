// This script can be run in the browser console to set the admin token
// Copy and paste this into the browser console on the admin login page

localStorage.setItem('adminToken', 'fake-admin-token-for-testing');
console.log('Admin token set in localStorage');
console.log('Token:', localStorage.getItem('adminToken'));
console.log('You can now navigate to the admin dashboard');
