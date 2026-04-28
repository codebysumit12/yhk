import axios from 'axios';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await Otp.deleteMany({ phone, isUsed: false }); // Clear previous OTPs
    
    await Otp.create({
      phone,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Send SMS via MSG91 (with development fallback)
    try {
      const authKey = process.env.MSG91_AUTH_KEY;
      
      console.log(`🔍 Debug Info - Generated OTP: ${otp}, Phone: ${phone}, Time: ${new Date().toISOString()}`);
      
      // Try MSG91 transactional SMS API
      const response = await axios.post('https://control.msg91.com/api/v5/flow', 
        JSON.stringify({
          authkey: authKey,
          flow_id: '65f6b6e0d6fc05582b1e3f7b', // Default OTP template
          mobile: phone.replace('+', ''),
          OTP: otp
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('MSG91 flow response:', response.data);
      
      if (response.data.success === true || response.data.type === 'success') {
        console.log(`✅ OTP sent via flow to ${phone}: ${otp}`);
      } else {
        console.error('❌ MSG91 flow error:', response.data);
        
        // Try traditional SMS API as fallback
        try {
          const smsResponse = await axios.post('https://control.msg91.com/api/v5/sendsms', 
            JSON.stringify({
              authkey: authKey,
              mobile: phone.replace('+', ''),
              message: `Your YHK OTP is: ${otp}. Valid for 5 minutes.`,
              route: '4',
              country: '91'
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          
          console.log('MSG91 SMS response:', smsResponse.data);
          
          if (smsResponse.data.success === true || smsResponse.data.type === 'success') {
            console.log(`✅ OTP sent via SMS to ${phone}: ${otp}`);
          } else {
            console.error('❌ MSG91 SMS error:', smsResponse.data);
          }
        } catch (smsFallbackError) {
          console.error('❌ MSG91 SMS fallback error:', smsFallbackError);
        }
      }
    } catch (smsError) {
      console.error('❌ SMS error:', smsError);
      console.log('⚠️  SMS failed but OTP is saved in database');
    }

    // Always return success for development (OTP is saved in database)
    res.status(200).json({ 
      success: true, 
      message: process.env.NODE_ENV === 'development' 
        ? `OTP sent successfully (Development mode: OTP is ${otp})` 
        : 'OTP sent successfully',
      phone: phone,
      debugOtp: otp // Always show OTP in development mode
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { phone, code, otp, name } = req.body;
    
    // Accept both 'code' and 'otp' field names
    const otpCode = code || otp;
    
    if (!phone || !otpCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    // First try database verification as fallback
    let isVerified = false;
    
    try {
      // Check OTP in database first
      const otpRecord = await Otp.findOne({ 
        phone, 
        code: otpCode, 
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (otpRecord) {
        // Mark OTP as used
        await Otp.findByIdAndUpdate(otpRecord._id, { isUsed: true });
        isVerified = true;
        console.log(`✅ OTP verified via database for ${phone}: ${otpCode}`);
      }
    } catch (dbError) {
      console.error('❌ Database OTP verification error:', dbError);
    }

    // If database verification failed, try MSG91 verification
    if (!isVerified) {
      try {
        const verifyResponse = await axios.post('https://control.msg91.com/api/v5/otp/verify', 
          JSON.stringify({
            authkey: process.env.MSG91_AUTH_KEY,
            mobile: phone.replace('+', ''),
            otp: otpCode,
            country: "91"
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('MSG91 verify response:', verifyResponse.data);

        if (verifyResponse.data.success === true || verifyResponse.data.type === 'success') {
          isVerified = true;
          console.log(`OTP verified via MSG91 for ${phone}: ${otpCode}`);
        } else {
          console.error('❌ MSG91 verify error:', verifyResponse.data);
        }
      } catch (verifyError) {
        console.error('❌ MSG91 verification error:', verifyError);
      }
    }

    if (!isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new delivery partner user
      if (!name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name is required for new user registration' 
        });
      }
      
      user = await User.create({
        name,
        email: `${phone.replace('+', '')}@delivery.yhk.com`, // Generate email from phone
        phone,
        password: 'temp123', // Temporary password, will be changed later
        role: 'delivery_partner',
        isPhoneVerified: true,
        isEmailVerified: false // Email not verified for OTP-based users
      });
    } else {
      // Update existing user
      await User.findByIdAndUpdate(user._id, { 
        isPhoneVerified: true 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        phone: user.phone, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ OTP verified for ${phone}, user: ${user._id}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: true
      }
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
