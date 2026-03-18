import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from '../../firebase';
// import { API_CONFIG } from '../../config/api';
import { API_CONFIG } from '../../config/api';
import './Checkout.css';

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
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.finalPrice || item.discountPrice || item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  const discount = Math.round(subtotal * 0.20);
  const deliveryFee = 0; // Free delivery
  const packaging = cartItems.length > 0 ? 0 : 0;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + deliveryFee + packaging + gst;

  // Phone verification state
  const [phoneStep, setPhoneStep] = useState('input'); // input, otp, verified
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [orderNumber] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const recaptchaVerifierRef = useRef(null);
  
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

  // Initialize reCAPTCHA for checkout phone verification
  useEffect(() => {
    if (phoneStep === 'input' && !recaptchaVerifierRef.current) {
      const timer = setTimeout(() => {
        try {
          const recaptchaContainer = document.getElementById('checkout-recaptcha-container');
          
          if (!recaptchaContainer) {
            console.error('❌ Checkout reCAPTCHA container not found');
            return;
          }

          recaptchaContainer.innerHTML = '';

          recaptchaVerifierRef.current = new RecaptchaVerifier(
            auth,
            'checkout-recaptcha-container',
            {
              size: 'invisible',
              callback: (response) => {
                console.log('✅ Checkout reCAPTCHA solved');
              },
              'expired-callback': () => {
                console.log('⚠️ Checkout reCAPTCHA expired');
              }
            }
          );

          console.log('✅ Checkout reCAPTCHA initialized successfully');
        } catch (error) {
          console.error('❌ Checkout reCAPTCHA init error:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null; // ← add this so it doesn't re-clear
        } catch (err) {
          // Silently ignore — Firebase throws internal-error on already-cleared verifiers
        }
      }
    };
  }, [phoneStep]);

  // Phone/OTP handlers - Real Firebase OTP
  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError(true);
      return;
    }
    
    setPhoneError(false);
    setIsSendingOTP(true);
    
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not initialized. Please refresh and try again.');
      }

      const phoneNumberWithCode = `+91${phoneNumber}`;
      console.log('📱 Sending checkout OTP to:', phoneNumberWithCode);
      
      const confirmation = await signInWithPhoneNumber(
        auth, 
        phoneNumberWithCode, 
        recaptchaVerifierRef.current
      );
      
      setConfirmationResult(confirmation);
      setPhoneStep('otp');
      setResendTimer(30);
      
      console.log('✅ Checkout OTP sent successfully');
    } catch (error) {
      console.error('❌ Checkout OTP send error:', error);
      
      if (error.code === 'auth/invalid-phone-number') {
        setPhoneError(true);
        alert('Invalid phone number format');
      } else if (error.code === 'auth/too-many-requests') {
        setPhoneError(true);
        alert('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setPhoneError(true);
        alert('Phone authentication is not enabled. Please use email login.');
      } else {
        setPhoneError(true);
        alert('Failed to send OTP. Please try again.');
      }
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (err) {
          console.log('reCAPTCHA reset error:', err);
        }
      }
    } finally {
      setIsSendingOTP(false);
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

  // Verify OTP using Firebase
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setOtpError(true);
      return;
    }
    
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result found. Please request OTP again.');
      }

      const result = await confirmationResult.confirm(otpValue);
      const user = result.user;
      
      setOtpError(false);
      setPhoneStep('verified');
      console.log('✅ Checkout phone number verified successfully!', user.phoneNumber);
      
      // Optional: You can store the verified phone number or user info
      localStorage.setItem('verifiedPhone', user.phoneNumber);
      
    } catch (error) {
      console.error('❌ Checkout OTP verification error:', error);
      setOtpError(true);
      
      if (error.code === 'auth/invalid-verification-code') {
        alert('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        alert('OTP has expired. Please request a new OTP.');
        setPhoneStep('input');
      } else {
        alert('Invalid OTP. Please try again.');
      }
    }
  };

  const handleChangePhone = () => {
    setPhoneStep('input');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
  };

  // Resend OTP using Firebase
  const handleResendOTP = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError(true);
      return;
    }
    
    try {
      // Reset reCAPTCHA and send new OTP
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          console.log('reCAPTCHA reset error:', err);
        }
        recaptchaVerifierRef.current = null;
      }
      
      // Re-initialize reCAPTCHA and send OTP
      await handleSendOTP();
      
      // Reset OTP inputs
      setOtp(['', '', '', '', '', '']);
      setOtpError(false);
      
      console.log('✅ Checkout OTP resent successfully');
    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      alert('Failed to resend OTP. Please try again.');
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

  // Payment handler - Real Razorpay Integration (CDN)
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items first.');
      navigate('/');
      return;
    }

    if (phoneStep !== 'verified') {
      alert('Please verify your phone number first.');
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

      const orderResponse = await fetch(`${API_CONFIG.API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.data._id;
      
      console.log('✅ Order created successfully:', orderId);

      // Create Razorpay order via backend
      const razorpayOrderResponse = await fetch(`${API_CONFIG.API_URL}/payments/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ amount: total })
      });

      if (!razorpayOrderResponse.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const razorpayOrderResult = await razorpayOrderResponse.json();
      const razorpayOrderId = razorpayOrderResult.data.id;

      // Load Razorpay from CDN
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(window.Razorpay);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => {
            resolve(window.Razorpay);
          };
          document.body.appendChild(script);
        });
      };

      const Razorpay = await loadRazorpay();

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_live_SSKxoURQgSmXB7', // Live key
        amount: total * 100, // Razorpay expects amount in paise (INR * 100)
        currency: 'INR',
        name: 'Yeswanth\'s Healthy Kitchen',
        description: `Order #${orderNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Payment successful
          try {
            // First save payment record
            const paymentResponse = await fetch(`${API_CONFIG.API_URL}/payments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
              },
              body: JSON.stringify({
                orderId: orderId,
                amount: total,
                paymentMethod: 'razorpay',
                paymentStatus: 'completed',
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                razorpayPaymentId: response.razorpay_payment_id // Store separately
              })
            });

        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            alert('Payment cancelled. Please try again.');
          }
        },
        prefill: {
          name: addressForm.fullName || 'Customer',
          email: 'customer@example.com',
          contact: phoneNumber
        },
        theme: {
          color: '#22c55e' // Your brand color
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

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
    navigate('/track-order');
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
            <h1>Yashwant's Healthy Kitchen</h1>
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
      
      {/* Always render checkout reCAPTCHA container (never conditionally hidden) */}
      <div id="checkout-recaptcha-container" style={{display: 'none'}}></div>

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
                      {/* reCAPTCHA Container - removed since it's always rendered above */}
                      
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
                            disabled={isSendingOTP}
                          >
                            {isSendingOTP ? 'Sending...' : 'Send OTP'}
                          </button>
                        </div>
                        <div className="hint">📱 You'll receive a 6-digit OTP via SMS for verification</div>
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
                  <span>🎉 YHK20 (-20%)</span>
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
