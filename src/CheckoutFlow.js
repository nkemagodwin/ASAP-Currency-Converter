import React, { useState } from 'react';
import { useCheckout } from './CheckoutContext';
import ShoppingCart from './ShoppingCart';
import PaymentMethods from './PaymentMethods';
import BillingForm from './BillingForm';
import { 
  CardPaymentForm, 
  CryptoPaymentForm, 
  GiftCardPaymentForm,
  BankTransferForm,
  PayPalForm 
} from './PaymentForms';
import OrderReview from './OrderReview';
import OrderComplete from './OrderComplete';
import { formatNumber } from './utils/formatters';

const CheckoutFlow = ({ darkMode, onClose, initialCartItems = [], onCheckoutComplete }) => {
  const {
    state,
    setCheckoutStep,
    setPaymentMethod,
    updateBillingDetails,
    updatePaymentDetails,
    processPayment,
    resetCheckout,
    clearCart
  } = useCheckout();

  const [processing, setProcessing] = useState(false);

  // Initialize cart with initial items if provided
  React.useEffect(() => {
    if (initialCartItems.length > 0 && state.cart.items.length === 0) {
      initialCartItems.forEach(item => {
        // This would need to be added to your context
        // You might want to add a method to bulk add items
      });
    }
  }, [initialCartItems, state.cart.items.length]);

  const handleProceedToCheckout = () => {
    setCheckoutStep('payment');
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleContinueToReview = () => {
    setCheckoutStep('review');
  };

  const handleBackToCart = () => {
    setCheckoutStep('cart');
  };

  const handleBackToPayment = () => {
    setCheckoutStep('payment');
  };

  const handleConfirmOrder = async () => {
    setProcessing(true);
    const result = await processPayment({
      billingDetails: state.billingDetails,
      timestamp: new Date().toISOString()
    });
    setProcessing(false);
    
    if (result.success) {
      if (onCheckoutComplete) {
        onCheckoutComplete(state.cart.items);
      }
      clearCart();
    }
  };

  const handleContinueShopping = () => {
    resetCheckout();
    onClose();
  };

  const renderPaymentForm = () => {
    switch(state.paymentMethod) {
      case 'card':
        return (
          <CardPaymentForm
            paymentDetails={state.paymentDetails}
            onUpdate={updatePaymentDetails}
            darkMode={darkMode}
          />
        );
      case 'crypto':
        return (
          <CryptoPaymentForm
            cryptoPayment={state.cryptoPayment}
            onUpdate={updatePaymentDetails}
            darkMode={darkMode}
          />
        );
      case 'giftcard':
        return (
          <GiftCardPaymentForm
            giftCardPayment={state.giftCardPayment}
            onUpdate={updatePaymentDetails}
            darkMode={darkMode}
          />
        );
      case 'bank':
        return <BankTransferForm darkMode={darkMode} />;
      case 'paypal':
        return <PayPalForm darkMode={darkMode} />;
      default:
        return null;
    }
  };

  return (
    <div className={`checkout-flow ${darkMode ? 'dark' : 'light'}`}>
      <div className="checkout-header">
        <button onClick={onClose} className="close-checkout-btn">✕</button>
        <h2 className="checkout-title">Checkout</h2>
        <div className="checkout-steps">
          <div className={`step ${state.checkoutStep === 'cart' ? 'active' : ''} ${state.checkoutStep !== 'cart' ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Cart</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${state.checkoutStep === 'payment' ? 'active' : ''} ${state.checkoutStep === 'review' || state.checkoutStep === 'complete' ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Payment</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${state.checkoutStep === 'review' ? 'active' : ''} ${state.checkoutStep === 'complete' ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Review</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${state.checkoutStep === 'complete' ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Complete</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        {state.checkoutStep === 'cart' && (
          <ShoppingCart darkMode={darkMode} onCheckout={handleProceedToCheckout} />
        )}

        {state.checkoutStep === 'payment' && (
          <div className="payment-step">
            <div className="payment-left">
              <PaymentMethods
                selectedMethod={state.paymentMethod}
                onSelect={handlePaymentMethodSelect}
                darkMode={darkMode}
              />
              {state.paymentMethod && (
                <div className="payment-form-container">
                  {renderPaymentForm()}
                </div>
              )}
            </div>
            
            <div className="payment-right">
              <div className="order-summary-sidebar">
                <h3>Order Summary</h3>
                <div className="sidebar-items">
                  {state.cart.items.map((item, index) => (
                    <div key={index} className="sidebar-item">
                      <span className="item-name">{item.name} x{item.quantity}</span>
                      <span className="item-price">${formatNumber(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="sidebar-total">
                  <span>Total:</span>
                  <span className="total-amount">${formatNumber(state.cart.total)}</span>
                </div>
                <button
                  onClick={handleContinueToReview}
                  disabled={!state.paymentMethod}
                  className="continue-btn"
                >
                  Continue to Review
                </button>
                <button onClick={handleBackToCart} className="back-btn">
                  ← Back to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {state.checkoutStep === 'review' && (
          <div className="review-step">
            <div className="review-left">
              <BillingForm
                billingDetails={state.billingDetails}
                onUpdate={updateBillingDetails}
                darkMode={darkMode}
              />
            </div>
            
            <div className="review-right">
              <OrderReview
                cart={state.cart}
                paymentMethod={state.paymentMethod}
                billingDetails={state.billingDetails}
                onConfirm={handleConfirmOrder}
                darkMode={darkMode}
                processing={processing}
              />
              <button onClick={handleBackToPayment} className="back-btn">
                ← Back to Payment
              </button>
            </div>
          </div>
        )}

        {state.checkoutStep === 'complete' && (
          <OrderComplete
            order={state.orderHistory[0]}
            onContinue={handleContinueShopping}
            darkMode={darkMode}
          />
        )}
      </div>

      {state.error && (
        <div className="checkout-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{state.error}</span>
          <button onClick={() => setCheckoutStep('payment')} className="error-retry">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutFlow;