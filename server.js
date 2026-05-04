const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const initFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    return admin.app();
  }

  if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return admin.app();
  }

  throw new Error('Firebase Admin is not configured.');
};

let firestore = null;
try {
  initFirebaseAdmin();
  firestore = admin.firestore();
} catch (error) {
  console.warn('Firebase Admin init failed:', error.message);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
app.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const order = await razorpay.orders.create({
      amount, // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment
app.post('/razorpay/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      contractId,
      type,
      amount,
      buyerId,
      farmerId,
      cropName
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expected === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid signature.' });
    }

    if (!firestore) {
      return res.status(500).json({ success: false, error: 'Firestore not configured.' });
    }

    if (!contractId || !type || amount == null || !buyerId || !farmerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment metadata for Firestore update.'
      });
    }

    const paymentsRef = firestore.collection('payments');
    const paymentRef = paymentId ? paymentsRef.doc(paymentId) : paymentsRef.doc();

    const paymentPayload = {
      contractId,
      type,
      amount,
      buyerId,
      farmerId,
      cropName: cropName || null,
      status: 'paid',
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paidAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (paymentId) {
      await paymentRef.set(paymentPayload, { merge: true });
    } else {
      await paymentRef.set({
        ...paymentPayload,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const contractRef = firestore.collection('contracts').doc(contractId);
    if (type === 'advance') {
      await contractRef.set({ advancePaid: true }, { merge: true });
    } else {
      await contractRef.set({ fullPaid: true, status: 'completed' }, { merge: true });
    }

    res.json({ success: true, paymentId: paymentRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Razorpay backend running on :${PORT}`));