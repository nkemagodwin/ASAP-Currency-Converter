// BillingForm.js
import React, { useState } from 'react';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' }
];

const BillingForm = ({ billingDetails, onUpdate, darkMode }) => {
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch(name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email address';
      case 'phone':
        return /^[\d\s\+\-\(\)]{10,}$/.test(value) ? '' : 'Invalid phone number';
      case 'zipCode':
        return /^[\d\w\s\-]{3,10}$/.test(value) ? '' : 'Invalid zip/postal code';
      default:
        return value.trim() ? '' : 'This field is required';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission is handled by parent component
  };

  return (
    <form className={`billing-form ${darkMode ? 'dark' : 'light'}`} onSubmit={handleSubmit}>
      <h3 className="form-title">Billing Information</h3>
      
      <div className="form-row">
        <div className="form-group full">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={billingDetails.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className={errors.fullName ? 'error' : ''}
            required
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={billingDetails.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={billingDetails.phone}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
            className={errors.phone ? 'error' : ''}
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group full">
          <label htmlFor="address">Street Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={billingDetails.address}
            onChange={handleChange}
            placeholder="123 Main St"
            className={errors.address ? 'error' : ''}
            required
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={billingDetails.city}
            onChange={handleChange}
            placeholder="New York"
            className={errors.city ? 'error' : ''}
            required
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <select
            id="country"
            name="country"
            value={billingDetails.country}
            onChange={handleChange}
            required
          >
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">ZIP / Postal Code *</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={billingDetails.zipCode}
            onChange={handleChange}
            placeholder="10001"
            className={errors.zipCode ? 'error' : ''}
            required
          />
          {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
        </div>
      </div>

      <div className="form-footer">
        <p className="required-note">* Required fields</p>
      </div>
    </form>
  );
};

export default BillingForm;