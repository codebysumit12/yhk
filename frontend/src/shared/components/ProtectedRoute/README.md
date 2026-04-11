# Checkout Protected Route with Notification

## Overview
This component provides a protected route for the checkout page that shows a notification popup before redirecting users to the signup page when they're not authenticated.

## How It Works
1. When a non-authenticated user tries to access the checkout page
2. Instead of immediately redirecting, it shows a modal notification
3. The notification informs the user they need to sign up to proceed with checkout
4. User can click "Sign Up Now" to be redirected to the signup page
5. The current path (/checkout) is stored for redirect after successful signup

## Components Used

### CheckoutProtectedRoute
- Location: `src/shared/components/ProtectedRoute/CheckoutProtectedRoute.jsx`
- Purpose: Wrapper component for checkout route with notification logic
- Shows notification when user is not authenticated
- Handles redirect to signup page after user interaction

### Notification
- Location: `src/shared/components/Notification/Notification.jsx`
- Purpose: Reusable notification modal component
- Features:
  - Customizable message and type
  - Auto-close after 3 seconds
  - Manual close button
  - Action buttons for user interaction
  - Smooth animations and transitions

## Usage in App.js
```jsx
<Route 
  path="/checkout" 
  element={
    <CustomerLayout>
      <CheckoutProtectedRoute>
        <Checkoutpage />
      </CheckoutProtectedRoute>
    </CustomerLayout>
  } 
/>
```

## User Experience
1. User clicks checkout button or navigates to /checkout
2. If not logged in, notification modal appears
3. Message: "You need to sign up to proceed with checkout"
4. Options:
   - "Sign Up Now" - redirects to signup page
   - "Maybe Later" - closes notification and stays on current page
   - Close button (×) - closes notification

## Technical Details
- Uses React hooks (useState, useNavigate)
- Integrates with existing authentication flow
- Stores redirect path in localStorage for post-signup navigation
- Responsive design for mobile devices
- Smooth animations and transitions

## Styling
- CSS located in `src/shared/components/Notification/Notification.css`
- Modern, clean design with proper spacing and typography
- Responsive breakpoints for mobile devices
- Hover states and micro-interactions
