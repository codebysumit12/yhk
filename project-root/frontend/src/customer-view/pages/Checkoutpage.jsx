import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import './Checkout.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByJyNj9tzbNcSuD9HOQwc71hRN69L15ms",
  authDomain: "yhk-61561.firebaseapp.com",
  projectId: "yhk-61561",
  storageBucket: "yhk-61561.firebasestorage.app",
  messagingSenderId: "701646445349",
  appId: "1:701646445349:web:1071e6daf71e2cbf1858cc",
  measurementId: "G-CMLE6L54V8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Setup reCAPTCHA verifier
const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }
  return window.recaptchaVerifier;
};

const Checkoutpage = () => {
  const navigate = useNavigate();
  
  // Get cart data from localStorage (set by RelatedItems or Menu page)
  const [cartItems, setCartItems] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Try to get cart data from localStorage
    const savedCart = localStorage.getItem('checkoutCart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCartItems(cartData.items || []);
      setRestaurantInfo({
        restaurantId: cartData.restaurantId,
        restaurantName: cartData.restaurantName
      });
    }
  }, []);

  // Order summary calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.round(subtotal * 0.20);
  const deliveryFee = 0; // Free delivery
  const packaging = cartItems.length > 0 ? 20 : 0;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + deliveryFee + packaging + gst;

  // Phone verification state
  const [phoneStep, setPhoneStep] = useState('input'); // input, otp, verified
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderNumber] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Address state
  const [addressStep, setAddressStep] = useState('location'); // location, manual, saved
  const [detectedAddress, setDetectedAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [addressForm, setAddressForm] = useState({
    flatNo: '',
    landmark: '',
    addressType: 'home',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: ''
  });

  // Instructions state
  const [instructionsStep, setInstructionsStep] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [contactlessDelivery, setContactlessDelivery] = useState(false);

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // OTP input refs
  const otpInputsRef = useRef([]);

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Phone/OTP handlers - Mock OTP for development
  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError(true);
      return;
    }
    
    setIsLoading(true);
    setPhoneError(false);
    
    try {
      // Mock OTP sending - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, use a fixed OTP: 123456
      console.log(`Mock OTP sent to +91${phoneNumber}: 123456`);
      
      // Set phone step to OTP verification
      setPhoneStep('otp');
      setResendTimer(30);
      
      // Show success message
      alert('OTP sent successfully! For testing, use: 123456');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setPhoneError(true);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerifyOTP();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Verify OTP using Mock System
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setOtpError(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock verification - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For development, accept only the fixed OTP: 123456
      if (otpValue === '123456') {
        setOtpError(false);
        setPhoneStep('verified');
        console.log('Phone number verified successfully!');
      } else {
        setOtpError(true);
        alert('Invalid OTP. For testing, use: 123456');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError(true);
      alert('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePhone = () => {
    setPhoneStep('input');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
  };

  // Resend OTP using Mock System
  const handleResendOTP = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock OTP sending - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, use a fixed OTP: 123456
      console.log(`Mock OTP resent to +91${phoneNumber}: 123456`);
      
      // Reset OTP inputs and timer
      setOtp(['', '', '', '', '', '']);
      setResendTimer(30);
      setOtpError(false);
      
      // Show success message
      alert('OTP resent successfully! For testing, use: 123456');
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Address handlers
  const handleDetectLocation = () => {
    // Simulate location detection
    setTimeout(() => {
      setDetectedAddress({
        area: 'Sector 14, Pimpri-Chinchwad',
        city: 'Pune, Maharashtra 411018'
      });
    }, 1400);
  };

  const handleConfirmAddress = () => {
    setInstructionsStep(true);
    // Scroll to instructions section
    setTimeout(() => {
      document.getElementById('instructionsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddressTab = (tab) => {
    setAddressStep(tab);
  };

  const handleAddressSelect = (index) => {
    setSelectedAddress(index);
  };

  const handleAddressFormChange = (field, value) => {
    setAddressForm({ ...addressForm, [field]: value });
  };

  // Payment handler - Simulated payment for development
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items first.');
      navigate('/');
      return;
    }

    setIsProcessing(true);
    
    try {
      // First create order
      const orderData = {
        customer: {
          name: addressForm.fullName || 'Customer',
          phone: phoneNumber,
          email: 'customer@example.com'
        },
        orderItems: cartItems.map(item => ({
          menuItem: item.id || item._id,
          name: item.name,
          price: item.finalPrice || item.price,
          quantity: item.quantity || 1,
          subtotal: (item.finalPrice || item.price) * (item.quantity || 1)
        })),
        deliveryAddress: {
          street: addressForm.addressLine1 || 'Default Address',
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.pinCode,
          apartment: addressForm.flatNo,
          landmark: addressForm.landmark,
          instructions: deliveryNote
        },
        orderType: 'delivery',
        paymentMethod: 'online',
        delivery: {
          type: 'standard'
        },
        specialInstructions: deliveryNote
      };

      const orderResponse = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.data._id;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save payment record (simulated successful payment)
      const paymentResponse = await fetch('http://localhost:5001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: total,
          paymentMethod: 'online',
          transactionId: 'demo_payment_' + Date.now(),
          paymentStatus: 'completed'
        })
      });

      if (paymentResponse.ok) {
        // Clear cart and show success
        localStorage.removeItem('checkoutCart');
        setShowSuccessModal(true);
      } else {
        console.error('Payment save failed');
        setShowSuccessModal(true); // Still show success for demo
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Clear cart data
    localStorage.removeItem('checkoutCart');
    navigate('/');
  };

  // Get formatted phone for display
  const formatPhone = (phone) => {
    if (phone.length >= 10) {
      return `+91 ${phone.slice(0,5)} ${phone.slice(5)}`;
    }
    return phone;
  };

  // If cart is empty, show message
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <nav className="checkout-topnav">
          <div className="checkout-brand">
            <div className="checkout-brand-icon">🍽️</div>
            <h1>FeastOS</h1>
          </div>
        </nav>
        <div className="checkout-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Your cart is empty</h2>
          <p>Please add items to your cart first</p>
          <button className="btn btn-primary" style={{ marginTop: '20px', width: 'auto' }} onClick={() => navigate('/')}>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Hidden reCAPTCHA container for Firebase */}
      <div id="recaptcha-container"></div>

      {/* TOP NAV */}
      <nav className="checkout-topnav">
        <div className="checkout-brand">
          <div className="checkout-brand-icon">🍽️</div>
          <h1>FeastOS</h1>
        </div>
        <div className="checkout-nav-steps">
          <div className="step-pill done">✓ Cart</div>
          <div className="step-sep">›</div>
          <div className="step-pill active">2 Checkout</div>
          <div className="step-sep">›</div>
          <div className="step-pill pending">3 Payment</div>
        </div>
        <div className="checkout-nav-right">
          {cartItems.length} items · <span>₹{total}</span>
        </div>
      </nav>

      {/* PAGE */}
      <div className="checkout-page-container">
        <div className="checkout-page-grid">

          {/* LEFT COLUMN */}
          <div>

            {/* ── STEP 1: PHONE VERIFICATION ── */}
            <div className="section-card" id="phoneSection">
              <div className="section-head">
                <div className={`section-num ${phoneStep === 'verified' ? 'done' : ''}`}>
                  {phoneStep === 'verified' ? '✓' : '1'}
                </div>
                <div>
                  <h2>Verify Your Phone</h2>
                  <p>We'll send an OTP to confirm your identity</p>
                </div>
              </div>
              <div className="section-body">
                <div className="phone-wrap">

                  {/* Phone input */}
                  {phoneStep === 'input' && (
                    <div id="phoneInputStep">
                      <div className="input-group">
                        <label>Mobile Number</label>
                        <div className="send-otp-row">
                          <div className="country-code">🇮🇳 +91</div>
                          <input 
                            type="tel" 
                            className="checkout-input-field" 
                            placeholder="Enter 10-digit number" 
                            maxLength="10"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          />
                          <button 
                            className="btn btn-primary" 
                            style={{width: 'auto', padding: '0 20px'}}
                            onClick={handleSendOTP}
                          >
                            Send OTP
                          </button>
                        </div>
                        <div className="hint">📱 You'll receive a 6-digit OTP via SMS (Testing: Use 123456)</div>
                        <div className={`error-text ${phoneError ? 'show' : ''}`}>
                          Please enter a valid 10-digit mobile number.
                        </div>
                      </div>

                      <div className="or-divider">or continue with</div>

                      <div style={{display: 'flex', gap: '10px'}}>
                        <button className="btn btn-outline" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px'}}>
                          <span>📧</span> Email Address
                        </button>
                        <button className="btn btn-outline" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px'}}>
                          <span>🔵</span> Google Login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OTP Verification */}
                  {phoneStep === 'otp' && (
                    <div id="otpStep">
                      <div className="otp-section" style={{border: 'none', padding: 0, margin: 0}}>
                        <div className="otp-label-row">
                          <p>OTP sent to <strong>{formatPhone(phoneNumber)}</strong></p>
                          <button className="btn-ghost" onClick={handleChangePhone}>Change</button>
                        </div>
                        <label style={{fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', display: 'block', marginBottom: '10px'}}>
                          Enter 6-Digit OTP
                        </label>
                        <div className="otp-boxes">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => otpInputsRef.current[index] = el}
                              type="text"
                              className={`otp-box ${digit ? 'filled' : ''}`}
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            />
                          ))}
                        </div>
                        <div className="otp-resend">
                          Didn't receive it?{' '}
                          <a onClick={handleResendOTP}>Resend OTP</a>
                          {resendTimer > 0 && <span> ({resendTimer}s)</span>}
                        </div>
                        <div className={`error-text ${otpError ? 'show' : ''}`}>
                          Invalid OTP. Please try again.
                        </div>
                        <button className="btn btn-primary" style={{marginTop: '16px'}} onClick={handleVerifyOTP}>
                          Verify & Continue →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verified state */}
                  {phoneStep === 'verified' && (
                    <div id="verifiedStep">
                      <div className="otp-verified">
                        <span className="check">✅</span>
                        <div>
                          <div style={{fontSize: '14px', fontWeight: 700, color: 'var(--green)'}}>Phone Verified!</div>
                          <div style={{fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, marginTop: '1px'}}>
                            {formatPhone(phoneNumber)}
                          </div>
                        </div>
                        <button className="btn-ghost" style={{marginLeft: 'auto', color: 'var(--accent2)'}} onClick={handleChangePhone}>
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* ── STEP 2: DELIVERY ADDRESS ── */}
            <div className={`section-card ${!instructionsStep ? '' : 'disabled'}`} id="addressSection">
              <div className="section-head">
                <div className={`section-num ${instructionsStep ? 'done' : ''}`}>
                  {instructionsStep ? '✓' : '2'}
                </div>
                <div>
                  <h2>Delivery Address</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>
              <div className="section-body">

                {/* Address method tabs */}
                <div className="tab-bar">
                  <div 
                    className={`tab ${addressStep === 'location' ? 'active' : ''}`}
                    onClick={() => handleAddressTab('location')}
                  >
                    📍 Use My Location
                  </div>
                  <div 
                    className={`tab ${addressStep === 'manual' ? 'active' : ''}`}
                    onClick={() => handleAddressTab('manual')}
                  >
                    ✏️ Enter Manually
                  </div>
                  <div 
                    className={`tab ${addressStep === 'saved' ? 'active' : ''}`}
                    onClick={() => handleAddressTab('saved')}
                  >
                    🏠 Saved Addresses
                  </div>
                </div>

                {/* TAB: USE LOCATION */}
                {addressStep === 'location' && (
                  <div id="locationTab">
                    <div className="location-detect" onClick={handleDetectLocation}>
                      <div className="loc-icon">📡</div>
                      <div className="loc-info">
                        <p>{detectedAddress ? 'Location Detected ✓' : 'Detect My Current Location'}</p>
                        <span>Allow browser location access for accurate delivery</span>
                      </div>
                      <div className="loc-arrow">›</div>
                    </div>

                    {/* After detection result */}
                    {detectedAddress && (
                      <div className="detected-addr" id="detectedAddr">
                        <div className="pin">📍</div>
                        <div className="addr-text">
                          <p id="detectedAddrText">{detectedAddress.area}</p>
                          <span>{detectedAddress.city}</span>
                        </div>
                        <div className="change-btn" onClick={handleDetectLocation}>Re-detect</div>
                      </div>
                    )}

                    {detectedAddress && (
                      <div className="checkout-form-grid" id="locationFormFields">
                        <div className="full input-group">
                          <label>Flat / House No. & Building Name</label>
                          <input 
                            type="text" 
                            className="checkout-input-field" 
                            placeholder="e.g. A-402, Greenview Apartments"
                            value={addressForm.flatNo}
                            onChange={(e) => handleAddressFormChange('flatNo', e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Landmark (Optional)</label>
                          <input 
                            type="text" 
                            className="checkout-input-field" 
                            placeholder="e.g. Near City Mall"
                            value={addressForm.landmark}
                            onChange={(e) => handleAddressFormChange('landmark', e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Address Type</label>
                          <select 
                            className="checkout-input-field"
                            value={addressForm.addressType}
                            onChange={(e) => handleAddressFormChange('addressType', e.target.value)}
                          >
                            <option>🏠 Home</option>
                            <option>💼 Work</option>
                            <option>📍 Other</option>
                          </select>
                        </div>
                        <div className="full">
                          <button className="btn btn-primary" onClick={handleConfirmAddress}>
                            Confirm Address →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: MANUAL */}
                {addressStep === 'manual' && (
                  <div id="manualTab">
                    <div className="checkout-form-grid">
                      <div className="full input-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          className="checkout-input-field" 
                          placeholder="Recipient name"
                          value={addressForm.fullName}
                          onChange={(e) => handleAddressFormChange('fullName', e.target.value)}
                        />
                      </div>
                      <div className="full input-group">
                        <label>Address Line 1</label>
                        <input 
                          type="text" 
                          className="checkout-input-field" 
                          placeholder="House / Flat No., Street Name"
                          value={addressForm.addressLine1}
                          onChange={(e) => handleAddressFormChange('addressLine1', e.target.value)}
                        />
                      </div>
                      <div className="full input-group">
                        <label>Address Line 2 (Optional)</label>
                        <input 
                          type="text" 
                          className="checkout-input-field" 
                          placeholder="Landmark, Area"
                          value={addressForm.addressLine2}
                          onChange={(e) => handleAddressFormChange('addressLine2', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>City</label>
                        <input 
                          type="text" 
                          className="checkout-input-field" 
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) => handleAddressFormChange('city', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>State</label>
                        <select 
                          className="checkout-input-field"
                          value={addressForm.state}
                          onChange={(e) => handleAddressFormChange('state', e.target.value)}
                        >
                          <option>Maharashtra</option>
                          <option>Karnataka</option>
                          <option>Tamil Nadu</option>
                          <option>Delhi</option>
                          <option>Gujarat</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>PIN Code</label>
                        <input 
                          type="text" 
                          className="checkout-input-field" 
                          placeholder="6-digit PIN"
                          maxLength="6"
                          value={addressForm.pinCode}
                          onChange={(e) => handleAddressFormChange('pinCode', e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div className="input-group">
                        <label>Address Type</label>
                        <select 
                          className="checkout-input-field"
                          value={addressForm.addressType}
                          onChange={(e) => handleAddressFormChange('addressType', e.target.value)}
                        >
                          <option>🏠 Home</option>
                          <option>💼 Work</option>
                          <option>📍 Other</option>
                        </select>
                      </div>
                      <div className="full">
                        <button className="btn btn-primary" onClick={handleConfirmAddress}>
                          Save & Continue →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: SAVED ADDRESSES */}
                {addressStep === 'saved' && (
                  <div id="savedTab">
                    <div className="address-options" style={{flexDirection: 'column'}}>

                      <div 
                        className={`addr-opt ${selectedAddress === 0 ? 'selected' : ''}`}
                        onClick={() => handleAddressSelect(0)}
                      >
                        <div className="opt-icon">🏠</div>
                        <div className="opt-info">
                          <p>Home</p>
                          <span>A-402, Greenview Apts, Sector 14, Pimpri, Pune – 411018</span>
                        </div>
                        <div className="radio"></div>
                      </div>

                      <div 
                        className={`addr-opt ${selectedAddress === 1 ? 'selected' : ''}`}
                        onClick={() => handleAddressSelect(1)}
                      >
                        <div className="opt-icon">💼</div>
                        <div className="opt-info">
                          <p>Work</p>
                          <span>IT Park, Hinjewadi Phase 2, Pune – 411057</span>
                        </div>
                        <div className="radio"></div>
                      </div>

                      <div 
                        className="addr-opt" 
                        onClick={() => handleAddressTab('manual')}
                        style={{borderStyle: 'dashed', justifyContent: 'center', gap: '8px', color: 'var(--accent2)'}}
                      >
                        <div className="opt-icon">➕</div>
                        <div className="opt-info"><p style={{color: 'var(--accent2)'}}>Add New Address</p></div>
                      </div>

                    </div>
                    <button className="btn btn-primary" style={{marginTop: '8px'}} onClick={handleConfirmAddress}>
                      Deliver Here →
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* ── STEP 3: DELIVERY INSTRUCTIONS ── */}
            <div className="section-card" id="instructionsSection" style={{opacity: instructionsStep ? '1' : '.55', pointerEvents: instructionsStep ? 'auto' : 'none'}}>
              <div className="section-head">
                <div className="section-num">3</div>
                <div>
                  <h2>Delivery Instructions</h2>
                  <p>Optional — help the rider find you</p>
                </div>
              </div>
              <div className="section-body">
                <div className="input-group">
                  <label>Add a note for the rider</label>
                  <textarea 
                    className="checkout-input-field" 
                    rows="3" 
                    style={{height: 'auto', padding: '12px 16px', resize: 'vertical'}}
                    placeholder="e.g. Ring the bell, leave at door, call before arriving…"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                  ></textarea>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px'}}>
                  <input 
                    type="checkbox" 
                    id="contactlessCheck" 
                    checked={contactlessDelivery}
                    onChange={(e) => setContactlessDelivery(e.target.checked)}
                    style={{accentColor: 'var(--accent)', width: '16px', height: '16px'}}
                  />
                  <label htmlFor="contactlessCheck" style={{fontSize: '13px', cursor: 'pointer'}}>
                    🤝 Contactless Delivery (leave at door)
                  </label>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{marginTop: '20px'}}
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment →'}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div>
            <div className="order-card">
              <div className="order-head">
                <h3>Your Order</h3>
                {restaurantInfo && <p>{restaurantInfo.restaurantName}</p>}
                <p>Estimated delivery: 28–35 min 🕐</p>
              </div>

              <div className="order-items">
                {cartItems.map((item, index) => (
                  <div className="order-item" key={index}>
                    <div className="oi-emoji">{item.emoji || '🍽️'}</div>
                    <div className="oi-info">
                      <p>{item.name}</p>
                      <span>{item.description || 'Regular'}</span>
                    </div>
                    <div className="oi-qty">×{item.quantity || 1}</div>
                    <div className="oi-price">₹{item.price * (item.quantity || 1)}</div>
                  </div>
                ))}
              </div>

              <div className="order-divider"></div>

              <div className="coupon-row">
                <input type="text" className="checkout-input-field" placeholder="🏷️ Coupon code" />
                <button className="btn btn-outline" style={{height: '42px'}}>Apply</button>
              </div>

              <div className="order-totals">
                <div className="total-row subtotal">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="total-row discount">
                  <span>🎉 FEAST20 (-20%)</span>
                  <span>−₹{discount}</span>
                </div>
                <div className="total-row delivery">
                  <span>Delivery fee</span>
                  <span style={{color: 'var(--green)', fontWeight: 600}}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="total-row delivery">
                  <span>Packaging</span>
                  <span>₹{packaging}</span>
                </div>
                <div className="total-row delivery">
                  <span>GST (5%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="total-row grand">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `🛵 Place Order · ₹${total}`}
              </button>

              <div className="secure-note">
                🔒 Secure checkout · 256-bit SSL encrypted
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SUCCESS MODAL */}
      <div className={`success-overlay ${showSuccessModal ? 'show' : ''}`}>
        <div className="success-modal">
          <div className="success-circle">🎉</div>
          <h2>Order Placed!</h2>
          <p>Your delicious food is being prepared by our chefs right now.</p>
          <div className="order-num">{orderNumber}</div>
          <p style={{fontSize: '13px'}}>
            Estimated delivery: <strong style={{color: 'var(--accent2)'}}>28–35 min</strong>
            <br />We'll notify you at every step 🛵
          </p>
          <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={handleCloseModal}>
            Track My Order →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkoutpage;
