// Test script to debug phone input issues
// Run this in browser console on the checkout page

console.log('=== Phone Input Debug Test ===');

// Test 1: Check if phone input element exists
const phoneInput = document.querySelector('input[placeholder="Enter 10-digit number"]');
if (phoneInput) {
    console.log('✅ Phone input found:', phoneInput);
    console.log('Input value:', phoneInput.value);
    console.log('Input type:', phoneInput.type);
    console.log('Input maxLength:', phoneInput.maxLength);
    console.log('Input disabled:', phoneInput.disabled);
    console.log('Input readonly:', phoneInput.readOnly);
    console.log('Input style display:', window.getComputedStyle(phoneInput).display);
    console.log('Input style visibility:', window.getComputedStyle(phoneInput).visibility);
} else {
    console.error('❌ Phone input not found');
}

// Test 2: Check if reCAPTCHA container exists
const recaptchaContainer = document.getElementById('checkout-recaptcha-container');
if (recaptchaContainer) {
    console.log('✅ reCAPTCHA container found:', recaptchaContainer);
    console.log('Container style display:', window.getComputedStyle(recaptchaContainer).display);
} else {
    console.error('❌ reCAPTCHA container not found');
}

// Test 3: Check if React state is working
// Look for React component instance
const sendOTPButton = document.querySelector('button:has-text("Send OTP")');
if (sendOTPButton) {
    console.log('✅ Send OTP button found:', sendOTPButton);
    console.log('Button disabled:', sendOTPButton.disabled);
} else {
    console.error('❌ Send OTP button not found');
}

// Test 4: Simulate typing in phone input
if (phoneInput) {
    console.log('\n=== Simulating Phone Input ===');
    
    // Clear input
    phoneInput.value = '';
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('After clear:', phoneInput.value);
    
    // Simulate typing "1234567890"
    const testNumber = '1234567890';
    for (let i = 0; i < testNumber.length; i++) {
        phoneInput.value += testNumber[i];
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`After typing ${testNumber.slice(0, i + 1)}:`, phoneInput.value);
    }
    
    // Simulate change event
    phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
}

// Test 5: Check for any error messages
const errorElements = document.querySelectorAll('.error-text');
if (errorElements.length > 0) {
    console.log('\n=== Error Messages Found ===');
    errorElements.forEach((el, index) => {
        console.log(`Error ${index + 1}:`, el.textContent, 'Visible:', el.classList.contains('show'));
    });
}

// Test 6: Check Firebase auth
if (typeof window.firebase !== 'undefined') {
    console.log('\n=== Firebase Check ===');
    console.log('Firebase available:', window.firebase);
} else {
    console.log('\n=== Firebase Check ===');
    console.log('Firebase not available on window object');
    console.log('Checking for React app Firebase...');
    
    // Look for any Firebase-related scripts
    const scripts = Array.from(document.scripts);
    const firebaseScripts = scripts.filter(script => 
        script.src && script.src.includes('firebase')
    );
    console.log('Firebase scripts found:', firebaseScripts.length);
    firebaseScripts.forEach((script, index) => {
        console.log(`Script ${index + 1}:`, script.src);
    });
}

console.log('\n=== Debug Test Complete ===');
