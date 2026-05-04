# 🌾 Farmer-Buyer Digital Contract Platform

A comprehensive mobile application connecting farmers and buyers for direct agricultural trade with digital contracts, negotiation, and secure payments.

## 📱 Features

### Authentication
- Email/Password login & signup
- Google OAuth integration
- Password reset via security questions (no SMTP required)
- Role-based access (Farmer/Buyer)

### For Farmers
- 📊 Dashboard with analytics and earnings
- 🌾 Add/Edit/Delete crop listings with multiple images
- 📸 Upload crop images via Cloudinary
- 💰 Real-time market price comparison
- 📄 View and manage contract requests
- 💳 Track payments (30% advance + 70% remaining)
- 📜 View transaction history
- ✏️ Edit profile with photo upload

### For Buyers
- 🛒 Browse marketplace with advanced filters
- 🔍 Search crops by category, price, location
- 💬 Real-time chat with farmers (end-to-end encrypted)
- 🤝 Negotiate prices with counter-offers
- 📄 Create digital contracts
- 💸 Make secure payments (30% advance, 70% on delivery)
- 📥 Download contracts as PDF
- ⭐ Rate and review farmers

### Contract Management
- Digital contract generation
- PDF download with terms & conditions
- Contract status tracking (Pending/Active/Completed)
- Automatic crop disabling after contract
- 30/70 payment split system

### Communication
- Real-time messaging with encryption
- Push notifications for:
  - New contract requests
  - Negotiation messages
  - Payment updates
  - Delivery updates

### Additional Features
- 🌓 Dark/Light theme
- 🌐 Multi-language support (English, हिन्दी, मराठी)
- 🤖 AI-powered farming chatbot (Gemini API)
- 📍 Location-based crop suggestions
- 📊 Market price trends and predictions
- 🔔 In-app notifications

## 🛠️ Tech Stack

### Frontend
- React Native (Expo Go)
- React Navigation
- Context API for state management
- NativeWind for styling

### Backend & Services
- Firebase Authentication
- Firebase Firestore (Database)
- Cloudinary (Image Storage)
- Razorpay (Payment Gateway)
- Google Gemini AI (Chatbot)
- Expo Notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo Go app on mobile device
- Firebase account
- Cloudinary account
- Razorpay account (optional for testing)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/farmer-buyer-contract.git
cd farmer-buyer-contract