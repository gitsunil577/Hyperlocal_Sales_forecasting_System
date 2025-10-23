'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import  Image from 'next/image';
import './register.css';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  location: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  businessName?: string;
  location?: string;
  agreeToTerms?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    location: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      alert('Registration successful! Redirecting to dashboard...');
      setIsLoading(false);
    }, 1500);

    // Your actual registration logic would go here:
    // try {
    //   const response = await fetch('/api/auth/register', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       fullName: formData.fullName,
    //       email: formData.email,
    //       password: formData.password,
    //       businessName: formData.businessName,
    //       location: formData.location
    //     })
    //   });
    //   const data = await response.json();
    //   // Handle successful registration
    // } catch (error) {
    //   console.error('Registration error:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="register-wrapper">
      <div className="animated-bg">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="register-container">
        <div className="register-left">
          <span className="logo-icon-large">
            <Image 
                src="/forecast.png" 
                alt="SalesForecast Logo" 
                width={80}
                height={80}/>
                </span>
          <h1>SalesForecast</h1>
          <p>Join thousands of businesses using AI-powered sales predictions</p>
          
          <div className="benefits">
            <div className="benefit-item">
              <div className="benefit-icon">✨</div>
              <div className="benefit-text">
                <h3>Smart Predictions</h3>
                <p>AI-driven forecasts tailored to your location</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">📈</div>
              <div className="benefit-text">
                <h3>Real-Time Insights</h3>
                <p>Monitor trends and patterns as they happen</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <div className="benefit-text">
                <h3>Increase Revenue</h3>
                <p>Make data-driven decisions to boost sales</p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-right">
          <h2>Create Account</h2>
          <p className="subtitle">Start your 14-day free trial today</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="Your Business Ltd."
                value={formData.businessName}
                onChange={handleChange}
                className={errors.businessName ? 'error' : ''}
              />
              {errors.businessName && <span className="error-text">{errors.businessName}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="location">Business Location</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeToTerms">
                I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
              </label>
            </div>
            {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="divider">OR</div>

            <div className="login-link">
              Already have an account? <a href="/login">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}