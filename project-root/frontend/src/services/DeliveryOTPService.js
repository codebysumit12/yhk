import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from '../firebase';

// Firebase OTP Service for Delivery Verification
class DeliveryOTPService {
  constructor() {
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
  }

  // Initialize reCAPTCHA for phone verification
  initializeRecaptcha(containerId) {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }
    return this.recaptchaVerifier;
  }

  // Send OTP to customer's phone
  async sendOTP(phoneNumber, orderId) {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      // Format phone number with country code if not present
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      // Send OTP using Firebase
      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier
      );

      console.log(`OTP sent to ${formattedPhone} for order ${orderId}`);
      
      return {
        success: true,
        message: `OTP sent to ${formattedPhone}`,
        orderId: orderId
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }

  // Verify OTP entered by customer
  async verifyOTP(otp) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP verification in progress');
      }

      const result = await this.confirmationResult.confirm(otp);
      
      // Clear the confirmation result after successful verification
      this.confirmationResult = null;
      
      return {
        success: true,
        message: 'OTP verified successfully',
        user: result.user
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error(`Invalid OTP: ${error.message}`);
    }
  }

  // Generate a fallback 6-digit OTP (if Firebase fails)
  generateFallbackOTP(orderId) {
    // Use last 6 digits of order number as fallback
    return orderId.slice(-6).padStart(6, '0');
  }
}

export default new DeliveryOTPService();
