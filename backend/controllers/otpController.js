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

    // Send SMS via MSG91
    try {
      const authKey = process.env.MSG91_AUTH_KEY;
      const templateId = process.env.MSG91_TEMPLATE_ID || '';
      
      const msg91Data = {
        authkey: authKey,
        mobiles: phone,
        message: `Your Yashwanth's Healthy Kitchen OTP is: ${otp}. Valid for 5 minutes.`,
        sender: 'YHKOTP',
        route: '4', // Transactional route
        country: '91' // India
      };

      // If template ID is available, use template
      if (templateId) {
        msg91Data.template_id = templateId;
        msg91Data.variables = `{ "##otp##": "${otp}" }`;
      }

      const response = await axios.post('https://control.msg91.com/api/sendotp.php', 
        new URLSearchParams(msg91Data).toString()
      );

      if (response.data.type === 'success') {
        console.log(`✅ OTP sent to ${phone}: ${otp}`);
        
        res.status(200).json({ 
          success: true, 
          message: 'OTP sent successfully',
          phone: phone
        });
      } else {
        console.error('❌ MSG91 error:', response.data);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP. Please try again.' 
        });
      }
    } catch (smsError) {
      console.error('❌ SMS error:', smsError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }
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
    const { phone, code, name } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    // Find valid OTP
    const otpRecord = await Otp.findOne({
      phone,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Mark OTP as used
    await Otp.findByIdAndUpdate(otpRecord._id, { isUsed: true });

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
        phone,
        role: 'delivery_partner',
        isPhoneVerified: true
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
