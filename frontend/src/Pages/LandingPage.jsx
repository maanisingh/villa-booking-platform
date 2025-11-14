import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAirbnb, FaHotel, FaHome, FaCalendarAlt, FaChartLine, FaUsers, FaCog, FaShieldAlt, FaRocket, FaCheck, FaBars, FaTimes } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FaCalendarAlt />,
      title: 'Smart Booking Management',
      description: 'Manage all your villa bookings in one centralized dashboard. Never miss a reservation with real-time updates.'
    },
    {
      icon: <FaChartLine />,
      title: 'Advanced Analytics',
      description: 'Track occupancy rates, revenue trends, and booking patterns with powerful analytics and insights.'
    },
    {
      icon: <FaUsers />,
      title: 'Team Collaboration',
      description: 'Invite your team members, assign roles, and collaborate seamlessly on property management tasks.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure & Encrypted',
      description: 'Bank-level security with AES-256 encryption ensures your data and credentials are always protected.'
    },
    {
      icon: <FaCog />,
      title: 'Automation Tools',
      description: 'Automate pricing, availability sync, and guest communications to save time and increase efficiency.'
    },
    {
      icon: <FaRocket />,
      title: 'Fast & Reliable',
      description: 'Lightning-fast performance with 99.9% uptime. Your business never sleeps, and neither do we.'
    }
  ];

  const integrations = [
    {
      name: 'Airbnb',
      icon: <FaAirbnb />,
      color: '#FF5A5F',
      description: 'Sync listings, bookings, and calendars automatically'
    },
    {
      name: 'Booking.com',
      icon: <FaHotel />,
      color: '#003580',
      description: 'Two-way sync with the world\'s leading booking platform'
    },
    {
      name: 'VRBO',
      icon: <FaHome />,
      color: '#2B6CB0',
      description: 'Manage VRBO properties with ease and efficiency'
    },
    {
      name: 'Expedia',
      icon: <FaHome />,
      color: '#FFC72C',
      description: 'Connect to Expedia\'s global traveler network'
    }
  ];

  const stats = [
    { number: '500+', label: 'Properties Managed' },
    { number: '10K+', label: 'Bookings Processed' },
    { number: '99.9%', label: 'Uptime Guaranteed' },
    { number: '24/7', label: 'Support Available' }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      features: [
        'Up to 5 properties',
        'Basic analytics',
        '2 platform integrations',
        'Email support',
        'Mobile app access'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      features: [
        'Up to 20 properties',
        'Advanced analytics',
        'All platform integrations',
        'Priority support',
        'Team collaboration (5 users)',
        'Custom branding',
        'API access'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited properties',
        'Enterprise analytics',
        'All integrations + custom',
        'Dedicated account manager',
        'Unlimited team members',
        'White-label solution',
        'Advanced API & webhooks',
        'SLA guarantee'
      ],
      highlighted: false
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-content">
          <div className="navbar-brand">
            <span className="logo">🏡 VillaBook</span>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#features">Features</a>
            <a href="#integrations">Integrations</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Manage Your Vacation Rentals
              <span className="gradient-text"> With Confidence</span>
            </h1>
            <p className="hero-subtitle">
              The all-in-one platform for villa owners and property managers.
              Sync with major booking platforms, automate operations, and grow your business.
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-large btn-primary"
                onClick={() => navigate('/register')}
              >
                Start Free Trial
              </button>
              <button
                className="btn btn-large btn-outline-white"
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Demo
              </button>
            </div>
            <p className="hero-note">
              ✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Succeed</h2>
            <p>Powerful features designed for modern villa managers</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="integrations-section">
        <div className="container">
          <div className="section-header">
            <h2>Connect to Leading Platforms</h2>
            <p>Seamless integrations with the booking platforms you already use</p>
          </div>
          <div className="integrations-grid">
            {integrations.map((integration, index) => (
              <div key={index} className="integration-card">
                <div
                  className="integration-icon"
                  style={{ color: integration.color }}
                >
                  {integration.icon}
                </div>
                <h3>{integration.name}</h3>
                <p>{integration.description}</p>
                <div className="integration-badge">
                  <FaCheck /> Connected
                </div>
              </div>
            ))}
          </div>
          <div className="integrations-cta">
            <button
              className="btn btn-primary btn-large"
              onClick={() => navigate('/register')}
            >
              View All Integrations
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Get Started in Minutes</h2>
            <p>Simple setup, powerful results</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Your Account</h3>
              <p>Sign up in seconds with your email. No credit card required for your free trial.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Connect Your Properties</h3>
              <p>Add your villas and connect to Airbnb, Booking.com, VRBO, and other platforms.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Managing</h3>
              <p>Automate bookings, sync calendars, and grow your business from one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your business</p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
              >
                {plan.highlighted && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <ul className="features-list">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <FaCheck className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-outline'} btn-block`}
                  onClick={() => navigate('/register')}
                >
                  {plan.highlighted ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Villa Business?</h2>
            <p>Join hundreds of successful property managers using VillaBook</p>
            <button
              className="btn btn-large btn-white"
              onClick={() => navigate('/register')}
            >
              Start Your Free Trial
            </button>
            <p className="cta-note">14-day free trial. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>🏡 VillaBook</h4>
              <p>The modern platform for vacation rental management.</p>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#integrations">Integrations</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-col">
              <h5>Support</h5>
              <a href="#help">Help Center</a>
              <a href="#docs">Documentation</a>
              <a href="#api">API Reference</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 VillaBook. All rights reserved.</p>
            <div>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
