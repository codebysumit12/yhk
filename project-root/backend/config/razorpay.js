import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SSKxoURQgSmXB7',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '8M12SAay68hrhYWILxwTJQVI'
});

export default razorpay;
