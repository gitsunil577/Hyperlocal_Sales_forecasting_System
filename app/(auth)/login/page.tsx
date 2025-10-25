'use client';

import React, { useState, FormEvent } from 'react';
import './login.css';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      alert('Login functionality would be implemented here!');
      setIsLoading(false);
    }, 1500);

    // Your actual login logic would go here:
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password })
    //   });
    //   const data = await response.json();
    //   // Handle successful login
    // } catch (error) {
    //   console.error('Login error:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="login-wrapper">
      <div className="animated-bg">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <span className="logo-icon-large">
            <Image 
                src="/forecast.png" 
                alt="SalesForecast Logo" 
                width={80}
                height={80}/>
                </span>
          <h1>SalesForecast</h1>
          <p>Predict your local sales trends with AI-powered analytics and data-driven insights</p>
          <div className="feature-icon">
            <div className="icon">🎯</div>
            <span>Accurate Predictions</span>
          </div>
          <div className="feature-icon">
            <div className="icon">📍</div>
            <span>Location-Based Insights</span>
          </div>
          <div className="feature-icon">
            <div className="icon">📈</div>
            <span>Real-Time Analytics</span>
          </div>
        </div>

        <div className="login-right">
          <h2>Welcome Back</h2>
          <p className="subtitle">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="divider">OR</div>

            <div className="signup-link">
              Don't have an account? <a href="/register">Sign up now</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}