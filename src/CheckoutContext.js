// CheckoutContext.js
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial checkout state
const initialState = {
  cart: {
    items: [],
    subtotal: 0,
    fees: 0,
    tax: 0,
    total: 0,
    discount: 0
  },
  checkoutStep: 'cart', // cart, payment, review, complete
  paymentMethod: null,
  billingDetails: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'US',
    zipCode: ''
  },
  shippingDetails: {
    sameAsBilling: true,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'US',
    zipCode: ''
  },
  paymentDetails: {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  },
  cryptoPayment: {
    walletAddress: '',
    network: 'ERC20',
    transactionHash: ''
  },
  giftCardPayment: {
    cardNumber: '',
    pin: '',
    balance: 0
  },
  orderHistory: [],
  promoCode: '',
  promoDiscount: 0,
  processing: false,
  error: null,
  success: false
};

// Action types
const ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  APPLY_PROMO: 'APPLY_PROMO',
  SET_STEP: 'SET_STEP',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  UPDATE_BILLING: 'UPDATE_BILLING',
  UPDATE_SHIPPING: 'UPDATE_SHIPPING',
  UPDATE_PAYMENT_DETAILS: 'UPDATE_PAYMENT_DETAILS',
  PROCESS_PAYMENT: 'PROCESS_PAYMENT',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  RESET_CHECKOUT: 'RESET_CHECKOUT',
  CLEAR_CART: 'CLEAR_CART'
};

// Reducer function
const checkoutReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TO_CART: {
      const existingItemIndex = state.cart.items.findIndex(
        item => item.id === action.payload.id && item.type === action.payload.type
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.cart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + (action.payload.quantity || 1)
        };
      } else {
        newItems = [...state.cart.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }

      const subtotal = calculateSubtotal(newItems);
      const fees = calculateFees(newItems);
      const discount = calculateDiscount(subtotal, state.promoDiscount);
      const tax = calculateTax(subtotal - discount);
      const total = subtotal + fees + tax - discount;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          subtotal,
          fees,
          tax,
          total,
          discount
        }
      };
    }

    case ACTIONS.REMOVE_FROM_CART: {
      const newItems = state.cart.items.filter(item => item.id !== action.payload);
      const subtotal = calculateSubtotal(newItems);
      const fees = calculateFees(newItems);
      const discount = calculateDiscount(subtotal, state.promoDiscount);
      const tax = calculateTax(subtotal - discount);
      const total = subtotal + fees + tax - discount;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          subtotal,
          fees,
          tax,
          total,
          discount
        }
      };
    }

    case ACTIONS.UPDATE_QUANTITY: {
      const newItems = state.cart.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      const subtotal = calculateSubtotal(newItems);
      const fees = calculateFees(newItems);
      const discount = calculateDiscount(subtotal, state.promoDiscount);
      const tax = calculateTax(subtotal - discount);
      const total = subtotal + fees + tax - discount;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          subtotal,
          fees,
          tax,
          total,
          discount
        }
      };
    }

    case ACTIONS.APPLY_PROMO: {
      const discount = action.payload.discount || 0;
      const newSubtotal = state.cart.subtotal;
      const newDiscount = calculateDiscount(newSubtotal, discount);
      const newTax = calculateTax(newSubtotal - newDiscount);
      const newTotal = newSubtotal + state.cart.fees + newTax - newDiscount;

      return {
        ...state,
        promoCode: action.payload.code,
        promoDiscount: discount,
        cart: {
          ...state.cart,
          discount: newDiscount,
          tax: newTax,
          total: newTotal
        }
      };
    }

    case ACTIONS.SET_STEP:
      return {
        ...state,
        checkoutStep: action.payload
      };

    case ACTIONS.SET_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload
      };

    case ACTIONS.UPDATE_BILLING:
      return {
        ...state,
        billingDetails: {
          ...state.billingDetails,
          ...action.payload
        }
      };

    case ACTIONS.UPDATE_SHIPPING:
      return {
        ...state,
        shippingDetails: {
          ...state.shippingDetails,
          ...action.payload
        }
      };

    case ACTIONS.UPDATE_PAYMENT_DETAILS:
      return {
        ...state,
        paymentDetails: {
          ...state.paymentDetails,
          ...action.payload
        }
      };

    case ACTIONS.PROCESS_PAYMENT:
      return {
        ...state,
        processing: true,
        error: null
      };

    case ACTIONS.PAYMENT_SUCCESS: {
      const newOrder = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        items: [...state.cart.items],
        total: state.cart.total,
        paymentMethod: state.paymentMethod,
        status: 'completed',
        ...action.payload
      };

      return {
        ...state,
        processing: false,
        success: true,
        checkoutStep: 'complete',
        orderHistory: [newOrder, ...state.orderHistory].slice(0, 10)
      };
    }

    case ACTIONS.PAYMENT_ERROR:
      return {
        ...state,
        processing: false,
        error: action.payload
      };

    case ACTIONS.RESET_CHECKOUT:
      return {
        ...initialState,
        orderHistory: state.orderHistory
      };

    case ACTIONS.CLEAR_CART:
      return {
        ...state,
        cart: initialState.cart,
        checkoutStep: 'cart'
      };

    default:
      return state;
  }
};

// Helper functions
const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const calculateFees = (items) => {
  return items.reduce((sum, item) => {
    const feeRate = item.type === 'giftcard' ? 0 : 0.001; // 0.1% fee for non-gift cards
    return sum + (item.price * item.quantity * feeRate);
  }, 0);
};

const calculateTax = (amount) => {
  return amount * 0.07; // 7% tax
};

const calculateDiscount = (subtotal, promoDiscount) => {
  return subtotal * (promoDiscount / 100);
};

// Create context
const CheckoutContext = createContext();

// Provider component
export const CheckoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const addToCart = useCallback((item) => {
    dispatch({ type: ACTIONS.ADD_TO_CART, payload: item });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: itemId });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id, quantity } });
  }, []);

  const applyPromoCode = useCallback(async (code) => {
    // Simulate API call to validate promo code
    const validCodes = {
      'SAVE10': 10,
      'SAVE20': 20,
      'WELCOME15': 15,
      'FLASH50': 50
    };

    const discount = validCodes[code.toUpperCase()] || 0;
    
    if (discount > 0) {
      dispatch({
        type: ACTIONS.APPLY_PROMO,
        payload: { code: code.toUpperCase(), discount }
      });
      return { success: true, discount };
    }
    return { success: false, message: 'Invalid promo code' };
  }, []);

  const setCheckoutStep = useCallback((step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  }, []);

  const setPaymentMethod = useCallback((method) => {
    dispatch({ type: ACTIONS.SET_PAYMENT_METHOD, payload: method });
  }, []);

  const updateBillingDetails = useCallback((details) => {
    dispatch({ type: ACTIONS.UPDATE_BILLING, payload: details });
  }, []);

  const updateShippingDetails = useCallback((details) => {
    dispatch({ type: ACTIONS.UPDATE_SHIPPING, payload: details });
  }, []);

  const updatePaymentDetails = useCallback((details) => {
    dispatch({ type: ACTIONS.UPDATE_PAYMENT_DETAILS, payload: details });
  }, []);

  const processPayment = useCallback(async (paymentData) => {
    dispatch({ type: ACTIONS.PROCESS_PAYMENT });

    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          dispatch({
            type: ACTIONS.PAYMENT_SUCCESS,
            payload: paymentData
          });
          resolve({ success: true });
        } else {
          dispatch({
            type: ACTIONS.PAYMENT_ERROR,
            payload: 'Payment failed. Please try again.'
          });
          resolve({ success: false, error: 'Payment failed' });
        }
      }, 2000);
    });
  }, []);

  const resetCheckout = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_CHECKOUT });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  }, []);

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
    setCheckoutStep,
    setPaymentMethod,
    updateBillingDetails,
    updateShippingDetails,
    updatePaymentDetails,
    processPayment,
    resetCheckout,
    clearCart
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

// Custom hook to use checkout context
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};