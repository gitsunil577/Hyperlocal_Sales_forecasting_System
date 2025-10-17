'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import './home.css';
import Image from 'next/image';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-wrapper">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon"><Image 
                src="/Sales_forecast.png" 
                alt="SalesForecast Logo" 
                width={40}  // Adjust this
                height={40} // Adjust this
              /></span>
            <span className="logo-text">SalesForecast</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login" className="nav-login-btn">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-circle"></div>
          <div className="hero-circle"></div>
          <div className="hero-circle"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 AI-Powered Analytics</span>
          </div>
          <h1 className="hero-title">
            Localized Sales Prediction for
            <span className="gradient-text"> Smart Inventory Management</span>
          </h1>
          <p className="hero-description">
            Predict sales trends with precision using AI-driven analytics. Optimize inventory, 
            reduce waste, and maximize profits with location-based forecasting tailored to your business.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="btn btn-primary">
              Get Started Free
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Businesses</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">30%</div>
              <div className="stat-label">Cost Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Smart Decisions</h2>
            <p>Everything you need to optimize your inventory and boost sales</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Location-Based Forecasting</h3>
              <p>Get precise predictions based on local market trends, demographics, and seasonal patterns specific to your area.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Predictions</h3>
              <p>Advanced machine learning algorithms analyze historical data to forecast future sales with exceptional accuracy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Smart Inventory Control</h3>
              <p>Automatically optimize stock levels, prevent overstocking, and eliminate stockouts with intelligent recommendations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-Time Analytics</h3>
              <p>Monitor sales performance, inventory turnover, and demand patterns through interactive dashboards.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Automated Alerts</h3>
              <p>Receive instant notifications for low stock, unusual trends, and restocking recommendations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Cost Optimization</h3>
              <p>Reduce carrying costs and minimize waste while maximizing profit margins through data-driven insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in three simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Connect Your Data</h3>
              <p>Import your sales history, inventory data, and business location information seamlessly.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI engine analyzes patterns, seasonality, and local market factors to build accurate models.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get Predictions</h3>
              <p>Access actionable forecasts and inventory recommendations through your personalized dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="dashboard-preview">
        <div className="container">
          <div className="section-header">
            <h2>Your Control Center</h2>
            <p>Intuitive dashboard with everything at your fingertips</p>
          </div>
          <div className="preview-container">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="preview-title">Sales Prediction Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-stat-row">
                  <div className="preview-stat">
                    <span className="preview-label">Projected Sales</span>
                    <span className="preview-value">$45,230</span>
                    <span className="preview-change positive">+12.5%</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-label">Inventory Value</span>
                    <span className="preview-value">$32,100</span>
                    <span className="preview-change neutral">Optimal</span>
                  </div>
                </div>
                <div className="preview-chart">
                  <div className="chart-bar" style={{height: '60%'}}></div>
                  <div className="chart-bar" style={{height: '75%'}}></div>
                  <div className="chart-bar" style={{height: '55%'}}></div>
                  <div className="chart-bar" style={{height: '85%'}}></div>
                  <div className="chart-bar" style={{height: '70%'}}></div>
                  <div className="chart-bar" style={{height: '90%'}}></div>
                </div>
                <div className="preview-items">
                  <div className="preview-item">📦 Items needing restock: 8</div>
                  <div className="preview-item">📈 Trending products: 12</div>
                  <div className="preview-item">⚠️ Low stock alerts: 3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your Plan</h2>
            <p>Flexible pricing for businesses of all sizes</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Starter</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">29</span>
                <span className="period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>✓ Up to 1,000 products</li>
                <li>✓ Basic predictions</li>
                <li>✓ Email support</li>
                <li>✓ 1 location</li>
              </ul>
              <Link href="/register" className="pricing-btn">Start Free Trial</Link>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <h3>Professional</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">79</span>
                <span className="period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>✓ Up to 10,000 products</li>
                <li>✓ Advanced AI predictions</li>
                <li>✓ Priority support</li>
                <li>✓ 5 locations</li>
                <li>✓ Custom reports</li>
              </ul>
              <Link href="/register" className="pricing-btn">Start Free Trial</Link>
            </div>
            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">199</span>
                <span className="period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>✓ Unlimited products</li>
                <li>✓ Premium AI predictions</li>
                <li>✓ 24/7 support</li>
                <li>✓ Unlimited locations</li>
                <li>✓ API access</li>
                <li>✓ Dedicated manager</li>
              </ul>
              <Link href="/register" className="pricing-btn">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Inventory Management?</h2>
            <p>Join thousands of businesses already using AI-powered sales predictions</p>
            <div className="cta-buttons">
              <Link href="/register" className="btn btn-white">
                Start Your 14-Day Free Trial
              </Link>
              <Link href="/login" className="btn btn-outline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">📊</span>
                <span className="logo-text">SalesForecast</span>
              </div>
              <p>AI-powered sales prediction and inventory management for modern businesses.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#how-it-works">How It Works</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SalesForecast. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}