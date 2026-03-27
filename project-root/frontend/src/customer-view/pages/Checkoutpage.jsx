import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import { calculateOrderPricing } from '../services/pricingService';
import './Checkout.css';
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from '../../firebase';
import Nav from './Nav';

const Checkoutpage = () => {
  const [showAdvanced, setShowAdvanced] = useState(true); // Toggle between components
  const navigate = useNavigate();

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
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

  // ── Pricing ───────────────────────────────────────────────────────────────
  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    packagingFee: 0,
    gst: 0,
    platformFee: 0,
    total: 0,
    breakdown: {}
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.finalPrice || item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  // Calculate dynamic pricing whenever subtotal changes
  useEffect(() => {
    const calculatePricing = async () => {
      if (subtotal === 0) {
        setPricing({
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          packagingFee: 0,
          gst: 0,
          platformFee: 0,
          total: 0,
          breakdown: {}
        });
        return;
      }

      setPricingLoading(true);
      try {
        // Default to 5km distance for delivery calculation
        const pricingResult = await calculateOrderPricing(subtotal, 5);
        setPricing(pricingResult);
      } catch (error) {
        console.error('Error calculating pricing:', error);
        // Fallback to simple calculation
        const discount = Math.round(subtotal * 0.20);
        const deliveryFee = 0;
        const packaging = 0;
        const gst = Math.round((subtotal - discount) * 0.05);
        const total = subtotal - discount + deliveryFee + packaging + gst;
        
        setPricing({
          subtotal,
          discount,
          deliveryFee,
          packagingFee: packaging,
          gst,
          platformFee: 0,
          total,
          breakdown: {}
        });
      } finally {
        setPricingLoading(false);
      }
    };

    calculatePricing();
  }, [subtotal]);

  // ── Phone / OTP state ─────────────────────────────────────────────────────
  const [phoneStep, setPhoneStep]               = useState('input'); // input | otp | verified
  const [phoneNumber, setPhoneNumber]           = useState('');
  const [otp, setOtp]                           = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError]             = useState(false);
  const [otpError, setOtpError]                 = useState(false);
  const [resendTimer, setResendTimer]           = useState(0);
  const [otpExpiryTimer, setOtpExpiryTimer]     = useState(90);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOTP, setIsSendingOTP]         = useState(false);
  const [otpExpired, setOtpExpired]             = useState(false);
  const recaptchaVerifierRef                    = useRef(null);
  const otpInputsRef                            = useRef([]);
  const otpExpiryTimeoutRef                     = useRef(null);

  // ── Address state ─────────────────────────────────────────────────────────
  const [addressStep, setAddressStep]       = useState('location'); // location | manual | saved
  const [detectedAddress, setDetectedAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);

  const [addressForm, setAddressForm]       = useState({
    flatNo: '', landmark: '', addressType: 'home',
    fullName: '', addressLine1: '', addressLine2: '',
    city: 'Pune', state: 'Maharashtra', pinCode: ''
  });

  // ── Instructions / modal state ────────────────────────────────────────────
  const [instructionsStep, setInstructionsStep] = useState(false);
  const [deliveryNote, setDeliveryNote]         = useState('');
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber]                           = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // ── Payment method state ───────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'

  // ── Resend timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ── OTP expiry timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phoneStep === 'otp' && otpExpiryTimer > 0) {
      const t = setTimeout(() => setOtpExpiryTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    } else if (otpExpiryTimer === 0 && phoneStep === 'otp') {
      setOtpExpired(true);
      setOtpError(true);
    }
  }, [otpExpiryTimer, phoneStep]);

  // Cleanup OTP expiry timeout when component unmounts or phone step changes
  useEffect(() => {
    return () => {
      if (otpExpiryTimeoutRef.current) {
        clearTimeout(otpExpiryTimeoutRef.current);
      }
    };
  }, []);

  // ── reCAPTCHA init ────────────────────────────────────────────────────────
  useEffect(() => {
    // Only initialize when on input step
    if (phoneStep !== 'input') return;
    
    const timer = setTimeout(() => {
      try {
        const container = document.getElementById('checkout-recaptcha-container');
        if (!container) { 
          console.error('❌ reCAPTCHA container not found'); 
          return; 
        }
        
        // Check if container is still in DOM
        if (!document.contains(container)) {
          console.error('❌ reCAPTCHA container not in DOM');
          return;
        }
        
        // Clear any existing content first
        try {
          container.innerHTML = '';
        } catch (e) {
          console.warn('⚠️ Container clear warning:', e);
        }
        
        // Create new verifier with error handling
        try {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'checkout-recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('✅ reCAPTCHA solved');
              // Don't clear immediately after solve
            },
            'expired-callback': () => {
              console.log('⚠️ reCAPTCHA expired');
              // Clear verifier when expired
              setTimeout(() => {
                if (recaptchaVerifierRef.current) {
                  try { 
                    recaptchaVerifierRef.current.clear(); 
                    recaptchaVerifierRef.current = null;
                  } catch (_) {}
                }
              }, 100);
            }
          });
          console.log('✅ reCAPTCHA initialized');
        } catch (err) {
          console.error('❌ reCAPTCHA init error:', err);
          // Don't throw error, just log it
        }
      } catch (err) {
        console.error('❌ reCAPTCHA setup error:', err);
      }
    }, 500); // Increased delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, [phoneStep]);

  // Separate effect for cleanup on unmount only
  useEffect(() => {
    return () => {
      // Clear reCAPTCHA on unmount with longer delay to avoid race conditions
      setTimeout(() => {
        if (recaptchaVerifierRef.current) {
          try { 
            recaptchaVerifierRef.current.clear(); 
            recaptchaVerifierRef.current = null;
          } catch (_) {}
        }
      }, 200);
    };
  }, []); // Empty dependency array = only runs on unmount

  // ── Phone / OTP handlers ──────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) { setPhoneError(true); return; }
    setPhoneError(false);
    setIsSendingOTP(true);
    try {
      // Try to initialize reCAPTCHA if not already done
      if (!recaptchaVerifierRef.current) {
        const container = document.getElementById('checkout-recaptcha-container');
        if (container) {
          try {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'checkout-recaptcha-container', {
              size: 'invisible',
              callback: () => console.log('✅ reCAPTCHA solved'),
              'expired-callback': () => {
                console.log('⚠️ reCAPTCHA expired');
                if (recaptchaVerifierRef.current) {
                  try { recaptchaVerifierRef.current.clear(); } catch (_) {}
                  recaptchaVerifierRef.current = null;
                }
              }
            });
          } catch (err) {
            console.error('❌ reCAPTCHA init error in handleSendOTP:', err);
          }
        }
      }
      
      if (!recaptchaVerifierRef.current) throw new Error('reCAPTCHA not initialized.');
      const confirmation = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setPhoneStep('otp');
      setResendTimer(45);
      setOtpExpiryTimer(90);
      setOtpExpired(false);
      setOtpError(false);
      console.log('✅ OTP sent');
    } catch (error) {
      console.error('❌ OTP send error:', error);
      setPhoneError(true);
      if (error.code === 'auth/too-many-requests') alert('Too many attempts. Please try again later.');
      else if (error.code === 'auth/operation-not-allowed') alert('Phone auth not enabled.');
      else if (error.message.includes('reCAPTCHA')) alert('reCAPTCHA error. Please refresh the page and try again.');
      else alert('Failed to send OTP. Please try again.');
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
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
    if (value && index < 5) otpInputsRef.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) handleVerifyOTP(newOtp.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputsRef.current[index - 1]?.focus();
  };

  const handleVerifyOTP = async (otpOverride) => {
    const otpValue = otpOverride || otp.join('');
    if (otpValue.length < 6) { setOtpError(true); return; }
    if (otpExpired) {
      alert('OTP has expired. Please request a new one.');
      setPhoneStep('input');
      return;
    }
    try {
      if (!confirmationResult) throw new Error('No confirmation result. Request OTP again.');
      const result = await confirmationResult.confirm(otpValue);
      setOtpError(false);
      setPhoneStep('verified');
      localStorage.setItem('verifiedPhone', result.user.phoneNumber);
      console.log('✅ Phone verified:', result.user.phoneNumber);
    } catch (error) {
      console.error('❌ OTP verify error:', error);
      setOtpError(true);
      if (error.code === 'auth/invalid-verification-code') {
        if (otpExpired) {
          alert('OTP has expired. Please request a new one.');
          setPhoneStep('input');
        } else {
          alert('Invalid OTP. Please try again.');
        }
      }
      else if (error.code === 'auth/code-expired') { 
        alert('OTP expired. Request a new one.'); 
        setPhoneStep('input'); 
      }
      else alert('Invalid OTP. Please try again.');
    }
  };

  const handleChangePhone = () => {
    setPhoneStep('input');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
    setOtpExpired(false);
    setOtpExpiryTimer(90);
    setResendTimer(0);
  };

  const handleResendOTP = async () => {
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
    await handleSendOTP();
  };

  // ── Address handlers ──────────────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setDetectedAddress({ loading: true });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          console.log('📍 Location detected:', { latitude, longitude });

          // FREE — no API key needed, OpenStreetMap's geocoding service
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                // Nominatim requires a User-Agent identifying your app
                'User-Agent': 'YHK-FoodApp/1.0'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch address');
          }

          const data = await response.json();
          console.log('📍 Nominatim response:', data);

          if (data && data.address) {
            const a = data.address;

            const area = 
              a.neighbourhood || 
              a.suburb        || 
              a.village       || 
              a.town          || 
              a.county        || 
              '';

            const streetAddress = 
              [a.house_number, a.road].filter(Boolean).join(' ') || area;

            const city    = a.city || a.town || a.village || a.county || '';
            const state   = a.state || '';
            const pinCode = a.postcode || '';

            const detected = {
              area,
              city: `${city}, ${state} ${pinCode}`.trim(),
              fullAddress: data.display_name,
              latitude,
              longitude,
              loading: false
            }

            setDetectedAddress(detected);

            // Populate address form with detected location
            setAddressForm(prev => ({
              ...prev,
              flatNo: '',
              landmark: '',
              addressType: 'home',
              fullName: '',
              addressLine1: streetAddress || '',
              addressLine2: area || '',
              city: city || '',
              state: state || '',
              pinCode: pinCode || '',
            }));

            console.log('✅ Address detected and filled');
          } else {
            alert('Could not fetch address. Please enter manually.');
            setDetectedAddress(null);
          }
        } catch (err) {
          console.error('❌ Nominatim error:', err);
          alert('Failed to fetch address. Please enter manually.');
          setDetectedAddress(null);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setDetectedAddress(null);
        setLocationLoading(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          alert('❌ Location access denied. Please allow location access in browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert('❌ Location unavailable. Please enter address manually.');
        } else if (error.code === error.TIMEOUT) {
          alert('❌ Location request timed out. Please try again.');
        } else {
          alert('❌ Failed to get location. Please enter manually.');
        }
      },
      { 
        timeout: 15000, 
        maximumAge: 60000, 
        enableHighAccuracy: true 
      }
    );
  };

  const handleConfirmAddress = () => {
    // Ensure address form is populated before proceeding
    if (!addressForm || !addressForm.addressLine1) {
      console.error('❌ Address form is not properly populated');
      alert('Please ensure address is filled before continuing.');
      return;
    }
    
    setInstructionsStep(true);
    setTimeout(() => {
      document.getElementById('instructionsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddressTab    = (tab)   => {
    setAddressStep(tab);
    
    // When switching to manual tab, pre-populate with detected address if available
    if (tab === 'manual' && detectedAddress && detectedAddress.area) {
      setAddressForm({
        flatNo: '',
        landmark: '',
        addressType: 'home',
        fullName: '',
        addressLine1: detectedAddress.area || '', // Use detected area as address line
        addressLine2: '',
        city: 'Pune',
        state: 'Maharashtra',
        pinCode: '411018'
      });
    }
  };
  const handleAddressSelect = (index) => setSelectedAddress(index);
  const handleAddressFormChange = (field, value) => setAddressForm({ ...addressForm, [field]: value });

  // ── Place order / payment ─────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) { alert('Your cart is empty.'); navigate('/'); return; }
    if (phoneStep !== 'verified') { alert('Please verify your phone number first.'); return; }

    // Comprehensive validation before proceeding
    if (!addressForm) {
      console.error('❌ Address form is undefined');
      alert('Please fill in your address details.');
      return;
    }

    if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pinCode) {
      console.error('❌ Address form is incomplete');
      alert('Please fill in all address details.');
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Create order
      const orderResponse = await fetch(`${API_CONFIG.API_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customer: {
            name: addressForm.fullName || JSON.parse(localStorage.getItem('user') || '{}').name || 'Guest',
            phone: phoneNumber,
            email: JSON.parse(localStorage.getItem('user') || '{}').email || 'customer@example.com'
          },
          orderItems: cartItems.map(item => ({
            menuItem: item.id || item._id,
            name: item.name,
            price: item.finalPrice || item.price,
            quantity: item.quantity || 1,
            subtotal: (item.finalPrice || item.price) * (item.quantity || 1)
          })),
          deliveryAddress: {
            street: addressForm?.addressLine1 || 'Default Address',
            city: addressForm?.city || '',
            state: addressForm?.state || '',
            zipCode: addressForm?.pinCode || '',
            apartment: addressForm?.flatNo || '',
            landmark: addressForm?.landmark || '',
            instructions: deliveryNote || ''
          },
          orderType: 'delivery',
          paymentMethod: paymentMethod === 'cash' ? 'cash' : 'online',
          delivery: { 
            type: 'standard',
            estimatedTime: typeof Date !== 'undefined' ? new Date(Date.now() + 30 * 60 * 1000) : null,
            actualTime: null,
            deliveryPerson: null
          },
          specialInstructions: deliveryNote
        })
      });

      if (!orderResponse.ok) {
        const err = await orderResponse.json();
        console.error('❌ Order creation failed:', err);
        throw new Error(err.message || 'Failed to create order');
      }
      const orderResult = await orderResponse.json();
      console.log('✅ Order created:', orderResult.data);
      console.log('✅ Order ID:', orderResult.data._id);
      console.log('✅ Order userId:', orderResult.data.userId); // 
      const orderId = orderResult.data._id;
      console.log('✅ Order created:', orderId);

      // ── COD: Skip Razorpay, mark payment as pending ──
      if (paymentMethod === 'cash') {
        localStorage.removeItem('checkoutCart');
        setShowSuccessModal(true);
        return;
      }

      // ── Online: Razorpay flow ──
      // Step 2: Create Razorpay order
      const razorpayOrderResponse = await fetch(`${API_CONFIG.API_URL}/payments/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: pricing.total })
      });

      if (!razorpayOrderResponse.ok) throw new Error('Failed to create Razorpay order');
      const razorpayOrderResult = await razorpayOrderResponse.json();
      const razorpayOrderId = razorpayOrderResult.data.id;

      // Step 3: Load Razorpay SDK
      const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) { resolve(window.Razorpay); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(window.Razorpay);
        document.body.appendChild(script);
      });
      const Razorpay = await loadRazorpay();

      // Step 4: Open Razorpay checkout
      const rzp = new Razorpay({
        key: 'rzp_live_SSKxoURQgSmXB7',
        amount: pricing.total * 100,
        currency: 'INR',
        name: "Yeswanth's Healthy Kitchen",
        description: `Order #${orderNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const paymentResponse = await fetch(`${API_CONFIG.API_URL}/payments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId,
                amount: pricing.total,
                paymentMethod: 'razorpay',
                paymentStatus: 'completed',
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                razorpayPaymentId: response.razorpay_payment_id
              })
            });

            if (paymentResponse.ok) {
              localStorage.removeItem('checkoutCart');
              setShowSuccessModal(true);
              console.log('✅ Payment saved successfully');
            } else {
              const errBody = await paymentResponse.json();
              console.error('❌ Payment save failed — server:', errBody);
              alert(`Payment captured but record save failed (${errBody.error || 'unknown'}). Order ID: ${orderId}`);
              setShowSuccessModal(true);
            }
          } catch (saveError) {
            console.error('❌ Payment save network error:', saveError);
            alert(`Payment captured but save failed. Order ID: ${orderId}`);
            setShowSuccessModal(true);
          } finally {
          }
        },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled. Please try again.');
          }
        },
        prefill: {
          name: addressForm.fullName || 'Customer',
          email: 'customer@example.com',
          contact: phoneNumber
        },
        theme: { color: '#22c55e' }
      });
      rzp.open();

    } catch (error) {
      console.error('❌ Order/payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  // ── Modal close ───────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    localStorage.removeItem('checkoutCart');
    navigate('/track-order');
  };

  const formatPhone = (phone) =>
    phone.length >= 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;

  // Format currency to avoid floating-point precision issues
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount).replace('₹', '₹');
  };

  // ── Empty cart guard ──────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  // Safety check: ensure all critical variables are defined
  if (typeof addressForm === 'undefined' || addressForm === null) {
    console.error('❌ addressForm is not initialized');
    return <div className="checkout-page"><div className="checkout-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}><h2>Loading...</h2></div></div>;
  }

  return (
    <div className="checkout-page">
      {/* reCAPTCHA containers — always rendered, never conditional */}
      <div id="recaptcha-container"></div>
      <div id="checkout-recaptcha-container" style={{ display: 'none' }}></div>

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
          {cartItems.length} items · <span>{formatCurrency(pricing.total)}</span>
        </div>
      </nav>

      <div className="checkout-page-container">
        <div className="checkout-page-grid">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div>

            {/* STEP 1: Phone verification */}
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

                  {phoneStep === 'input' && (
                    <div id="phoneInputStep">
                      <div className="input-group">
                        
                        <div className="send-otp-row">
                          <div className="country-code">🇮🇳 +91</div>
                          <input
                            type="tel"
                            className="checkout-input-field"
                            placeholder="Enter 10-digit number"
                            maxLength="10"
                            value={phoneNumber}
                            onChange={e => {
                              const rawValue = e.target.value;
                              const cleanValue = rawValue.replace(/\D/g, '');
                              console.log('📱 Phone input change:', { raw: rawValue, clean: cleanValue });
                              setPhoneNumber(cleanValue);
                            }}
                            onFocus={() => console.log('📱 Phone input focused')}
                            onBlur={() => console.log('📱 Phone input blurred, current value:', phoneNumber)}
                            onWheel={e => e.preventDefault()} // Prevent mouse wheel from changing value
                          />
                          <button
                            className="btn btn-primary"
                            style={{ width: 'auto', padding: '0 20px' }}
                            onClick={handleSendOTP}
                            disabled={isSendingOTP}
                          >
                            {isSendingOTP ? 'Sending...' : 'Send OTP'}
                          </button>
                        </div>
                     
                        <div className={`error-text ${phoneError ? 'show' : ''}`}>
                          Please enter a valid 10-digit mobile number.
                        </div>
                      </div>
                      <div className="or-divider">or continue with</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
                          <span>📧</span> Email Address
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
                          <span>🔵</span> Google Login
                        </button>
                      </div>
                    </div>
                  )}

                  {phoneStep === 'otp' && (
                    <div id="otpStep">
                      <div className="otp-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                        <div className="otp-label-row">
                          <p>OTP sent to <strong>{formatPhone(phoneNumber)}</strong></p>
                          <button className="btn-ghost" onClick={handleChangePhone}>Change</button>
                        </div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', display: 'block', marginBottom: '10px' }}>
                          Enter 6-Digit OTP
                        </label>
                        <div className="otp-boxes">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={el => otpInputsRef.current[index] = el}
                              type="text"
                              className={`otp-box ${digit ? 'filled' : ''}`}
                              maxLength="1"
                              value={digit}
                              onChange={e => handleOtpChange(index, e.target.value)}
                              onKeyDown={e => handleOtpKeyDown(index, e)}
                            />
                          ))}
                        </div>
                        <div className="otp-resend">
                          <div style={{ marginBottom: '8px', fontSize: '12px', color: otpExpired ? '#ef4444' : '#6b7280' }}>
                            {otpExpired ? '⏰ OTP expired' : `⏱️ Valid for ${otpExpiryTimer}s`}
                          </div>
                          <div>
                            Didn't receive it?{' '}
                            <a 
                              onClick={handleResendOTP} 
                              style={{ 
                                cursor: 'pointer', 
                                color: resendTimer > 0 ? '#9ca3af' : '#22c55e',
                                textDecoration: resendTimer > 0 ? 'none' : 'underline'
                              }} 
                            >
                              Resend OTP
                            </a>
                            {resendTimer > 0 && <span style={{ color: '#6b7280', marginLeft: '4px' }}> ({resendTimer}s)</span>}
                          </div>
                        </div>
                        <div className={`error-text ${otpError ? 'show' : ''}`}>
                          Invalid OTP. Please try again.
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleVerifyOTP()}>
                          Verify & Continue →
                        </button>
                      </div>
                    </div>
                  )}

                  {phoneStep === 'verified' && (
                    <div id="verifiedStep">
                      <div className="otp-verified">
                        <span className="check">✅</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>Phone Verified!</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{formatPhone(phoneNumber)}</div>
                        </div>
                        <button className="btn-ghost" style={{ marginLeft: 'auto', color: 'var(--accent2)' }} onClick={handleChangePhone}>Change</button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>







            {/* STEP 2: Delivery address */}
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
                <div className="tab-bar">
                  {['location', 'manual', 'saved'].map(tab => (
                    <div
                      key={tab}
                      className={`tab ${addressStep === tab ? 'active' : ''}`}
                      onClick={() => handleAddressTab(tab)}
                    >
                      {tab === 'location' ? '📍 Use My Location' : tab === 'manual' ? '✏️ Enter Manually' : '🏠 Saved Addresses'}
                    </div>
                  ))}
                </div>

                  {/* Detect Location Button */}
                <button 
                  className="detect-location-btn"
                  onClick={handleDetectLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <span className="spinner"></span>
                      Detecting location...
                    </>
                  ) : (
                    <>
                      📍 Detect My Location
                    </>
                  )}
                </button>

                {/* Detected Address Display */}
                {detectedAddress && !detectedAddress.loading && (
                  <div className="detected-address">
                    <div className="detected-icon">✅</div>
                    <div className="detected-info">
                      <strong>Location Detected</strong>
                      <p>{detectedAddress.fullAddress}</p>
                      <small>
                        📍 Lat: {detectedAddress.latitude?.toFixed(6)}, 
                        Lng: {detectedAddress.longitude?.toFixed(6)}
                      </small>
                    </div>
                  </div>
                )}

                {/* Confirm Address Button for Detected Location */}
                {detectedAddress && !detectedAddress.loading && (
                  <div className="full">
                    <button className="btn btn-primary" onClick={handleConfirmAddress} style={{ marginTop: '15px' }}>
                      Confirm Address →
                    </button>
                  </div>
                )}

                {addressStep === 'manual' && (
                  <div id="manualTab">
                    <div className="checkout-form-grid">
                      <div className="full input-group">
                        <label>Full Name</label>
                        <input type="text" className="checkout-input-field" placeholder="Recipient name"
                          value={addressForm.fullName} onChange={e => handleAddressFormChange('fullName', e.target.value)} />
                      </div>
                      <div className="full input-group">
                        <label>Address Line 1</label>
                        <input type="text" className="checkout-input-field" placeholder="House / Flat No., Street Name"
                          value={addressForm.addressLine1} onChange={e => handleAddressFormChange('addressLine1', e.target.value)} />
                      </div>
                      <div className="full input-group">
                        <label>Address Line 2 (Optional)</label>
                        <input type="text" className="checkout-input-field" placeholder="Landmark, Area"
                          value={addressForm.addressLine2} onChange={e => handleAddressFormChange('addressLine2', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>City</label>
                        <input type="text" className="checkout-input-field" placeholder="City"
                          value={addressForm.city} onChange={e => handleAddressFormChange('city', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>State</label>
                        <select className="checkout-input-field" value={addressForm.state} onChange={e => handleAddressFormChange('state', e.target.value)}>
                          <option>Maharashtra</option><option>Karnataka</option><option>Tamil Nadu</option><option>Delhi</option><option>Gujarat</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>PIN Code</label>
                        <input type="text" className="checkout-input-field" placeholder="6-digit PIN" maxLength="6"
                          value={addressForm.pinCode} onChange={e => handleAddressFormChange('pinCode', e.target.value.replace(/\D/g, ''))} />
                      </div>
                      <div className="input-group">
                        <label>Address Type</label>
                        <select className="checkout-input-field" value={addressForm.addressType} onChange={e => handleAddressFormChange('addressType', e.target.value)}>
                          <option>🏠 Home</option><option>💼 Work</option><option>📍 Other</option>
                        </select>
                      </div>
                      <div className="full">
                        <button className="btn btn-primary" onClick={handleConfirmAddress}>Save & Continue →</button>
                      </div>
                    </div>
                  </div>
                )}

                {addressStep === 'saved' && (
                  <div id="savedTab">
                    <div className="address-options" style={{ flexDirection: 'column' }}>
                      {[
                        { icon: '🏠', label: 'Home', detail: 'A-402, Greenview Apts, Sector 14, Pimpri, Pune – 411018' },
                        { icon: '💼', label: 'Work', detail: 'IT Park, Hinjewadi Phase 2, Pune – 411057' }
                      ].map((addr, i) => (
                        <div key={i} className={`addr-opt ${selectedAddress === i ? 'selected' : ''}`} onClick={() => handleAddressSelect(i)}>
                          <div className="opt-icon">{addr.icon}</div>
                          <div className="opt-info"><p>{addr.label}</p><span>{addr.detail}</span></div>
                          <div className="radio"></div>
                        </div>
                      ))}
                      <div className="addr-opt" onClick={() => handleAddressTab('manual')}
                        style={{ borderStyle: 'dashed', justifyContent: 'center', gap: '8px', color: 'var(--accent2)' }}>
                        <div className="opt-icon">➕</div>
                        <div className="opt-info"><p style={{ color: 'var(--accent2)' }}>Add New Address</p></div>
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={handleConfirmAddress}>Deliver Here →</button>
                  </div>
                )}

              </div>
            </div>

            {/* STEP 3: Delivery instructions */}
            <div className="section-card" id="instructionsSection"
              style={{ opacity: instructionsStep ? '1' : '.55', pointerEvents: instructionsStep ? 'auto' : 'none' }}>
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
                    style={{ height: 'auto', padding: '12px 16px', resize: 'vertical' }}
                    placeholder="e.g. Ring the bell, leave at door, call before arriving…"
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input type="checkbox" id="contactlessCheck" checked={contactlessDelivery}
                    onChange={e => setContactlessDelivery(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                  <label htmlFor="contactlessCheck" style={{ fontSize: '13px', cursor: 'pointer' }}>
                    🤝 Contactless Delivery (leave at door)
                  </label>
                </div>

                {/* ── Payment Method Selector ── */}
                <div style={{ marginTop: '24px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', display: 'block', marginBottom: '12px' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                      onClick={() => setPaymentMethod('online')}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${paymentMethod === 'online' ? 'var(--accent)' : 'var(--border)'}`,
                        background: paymentMethod === 'online' ? 'var(--accent)10' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>💳</div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Pay Online</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>UPI, Card, Net Banking</div>
                    </div>
                    <div
                      onClick={() => setPaymentMethod('cash')}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${paymentMethod === 'cash' ? '#f59e0b' : 'var(--border)'}`,
                        background: paymentMethod === 'cash' ? '#f59e0b10' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>💵</div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Cash on Delivery</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Pay when order arrives</div>
                    </div>
                  </div>
                  {paymentMethod === 'cash' && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f59e0b15', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                      💡 Please keep exact change of <strong>{formatCurrency(pricing.total)}</strong> ready for the delivery partner.
                    </div>
                  )}
                </div>

                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : paymentMethod === 'cash' ? `🛵 Place Order · ${formatCurrency(pricing.total)}` : `💳 Continue to Payment · ${formatCurrency(pricing.total)}`}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Order summary ───────────────────────────────── */}
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
                    <div className="oi-price">{formatCurrency(item.price * (item.quantity || 1))}</div>
                  </div>
                ))}
              </div>

              <div className="order-divider"></div>

              <div className="coupon-row">
                <input type="text" className="checkout-input-field" placeholder="🏷️ Coupon code" />
                <button className="btn btn-outline" style={{ height: '42px' }}>Apply</button>
              </div>

              <div className="order-totals">
                {pricingLoading ? (
                  <div className="total-row"><span>Calculating...</span></div>
                ) : (
                  <>
                    <div className="total-row subtotal"><span>Subtotal ({cartItems.length} items)</span><span>{formatCurrency(pricing.subtotal)}</span></div>
                    {pricing.discount > 0 && (
                      <div className="total-row discount"><span>Discount</span><span>−{formatCurrency(pricing.discount)}</span></div>
                    )}
                    <div className="total-row delivery">
                      <span>Delivery fee</span>
                      <span style={{ color: pricing.deliveryFee === 0 ? 'var(--green)' : 'inherit', fontWeight: 600 }}>
                        {pricing.deliveryFee === 0 ? 'FREE' : formatCurrency(pricing.deliveryFee)}
                      </span>
                    </div>
                    {pricing.packagingFee > 0 && (
                      <div className="total-row delivery"><span>Packaging</span><span>{formatCurrency(pricing.packagingFee)}</span></div>
                    )}
                    {pricing.gst > 0 && (
                      <div className="total-row delivery"><span>GST</span><span>{formatCurrency(pricing.gst)}</span></div>
                    )}
                    {pricing.platformFee > 0 && (
                      <div className="total-row delivery"><span>Platform Fee</span><span>{formatCurrency(pricing.platformFee)}</span></div>
                    )}
                    <div className="total-row grand"><span>Total</span><span>{formatCurrency(pricing.total)}</span></div>
                  </>
                )}
              </div>

              <button className="place-order-btn" onClick={handlePlaceOrder} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `🛵 Place Order · ${formatCurrency(pricing.total)}`}
              </button>

              <div className="secure-note">🔒 Secure checkout · 256-bit SSL encrypted</div>
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
          <p style={{ fontSize: '13px' }}>
            Estimated delivery: <strong style={{ color: 'var(--accent2)' }}>28–35 min</strong>
            <br />We'll notify you at every step 🛵
          </p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={handleCloseModal}>
            Track My Order →
          </button>
        </div>
      </div>
    </div>
  );
};


export default Checkoutpage;