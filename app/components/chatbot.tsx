'use client';

import React, { useState, useRef, useEffect } from 'react';
import './chatbot.css';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your SalesForecast assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FAQ Database - Will be replaced with API calls later
  const faqs: FAQ[] = [
    {
      question: "What is SalesForecast?",
      answer: "SalesForecast is an AI-powered sales prediction platform that helps businesses optimize inventory management through localized forecasting. We use machine learning to analyze historical data and predict future sales trends with 95% accuracy.",
      keywords: ["what is", "about", "salesforecast", "platform", "what does"]
    },
    {
      question: "How does the AI prediction work?",
      answer: "Our AI engine analyzes your historical sales data, local market trends, seasonal patterns, and demographic factors. It uses advanced machine learning algorithms to identify patterns and generate accurate forecasts for your specific location and business type.",
      keywords: ["how", "ai", "prediction", "work", "algorithm", "machine learning"]
    },
    {
      question: "What are the pricing plans?",
      answer: "We offer three plans:\n\n**Starter ($29/month)**: Up to 1,000 products, basic predictions, 1 location\n\n**Professional ($79/month)**: Up to 10,000 products, advanced AI, 5 locations, custom reports\n\n**Enterprise ($199/month)**: Unlimited products, premium AI, unlimited locations, API access, dedicated manager\n\nAll plans include a 14-day free trial!",
      keywords: ["price", "pricing", "cost", "plans", "how much", "subscription", "pay"]
    },
    {
      question: "How accurate are the predictions?",
      answer: "Our AI-powered predictions achieve 95% accuracy on average. Accuracy improves over time as the system learns from your business patterns. We continuously refine our models based on actual vs. predicted performance.",
      keywords: ["accurate", "accuracy", "reliable", "how good", "precision"]
    },
    {
      question: "What features are included?",
      answer: "Key features include:\n• Location-based sales forecasting\n• AI-powered demand predictions\n• Smart inventory optimization\n• Real-time analytics dashboard\n• Automated low-stock alerts\n• Cost optimization insights\n• Custom reports and exports\n• Multi-location support",
      keywords: ["features", "what can", "capabilities", "functionality", "includes"]
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy!\n1. Click 'Get Started Free' or 'Sign Up'\n2. Create your account\n3. Connect your sales data (CSV upload or API integration)\n4. Add your business location\n5. Get your first predictions within 24 hours!\n\nOur team will guide you through the setup process.",
      keywords: ["start", "begin", "setup", "sign up", "register", "onboard"]
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! We offer a 14-day free trial on all plans. No credit card required. You'll get full access to all features during the trial period so you can experience the power of AI-driven sales forecasting.",
      keywords: ["free trial", "trial", "free", "demo", "test"]
    },
    {
      question: "What kind of businesses can use SalesForecast?",
      answer: "SalesForecast is perfect for:\n• Retail stores\n• E-commerce businesses\n• Restaurants and cafes\n• Wholesale distributors\n• Manufacturing companies\n• Multi-location chains\n\nAny business that manages inventory and wants to optimize stock levels can benefit!",
      keywords: ["business", "who can", "suitable", "industry", "type", "use"]
    },
    {
      question: "How does location-based forecasting work?",
      answer: "Our system analyzes local factors like:\n• Regional market trends\n• Local demographics\n• Seasonal patterns in your area\n• Local events and holidays\n• Weather patterns\n• Competition density\n\nThis ensures predictions are tailored to your specific location, not generic national trends.",
      keywords: ["location", "localized", "local", "regional", "area"]
    },
    {
      question: "Can I integrate with my existing systems?",
      answer: "Yes! We support:\n• CSV/Excel file imports\n• API integrations\n• Popular POS systems\n• E-commerce platforms (Shopify, WooCommerce, etc.)\n• Inventory management systems\n• ERP systems\n\nOur Enterprise plan includes custom API access and dedicated integration support.",
      keywords: ["integrate", "integration", "api", "connect", "import", "export", "sync"]
    },
    {
      question: "What support do you provide?",
      answer: "Support varies by plan:\n• **Starter**: Email support (24-48 hour response)\n• **Professional**: Priority email support + live chat\n• **Enterprise**: 24/7 support + dedicated account manager + phone support\n\nAll plans include comprehensive documentation and video tutorials.",
      keywords: ["support", "help", "customer service", "assistance", "contact"]
    },
    {
      question: "How secure is my data?",
      answer: "We take security seriously:\n• 256-bit SSL encryption\n• SOC 2 Type II certified\n• GDPR compliant\n• Regular security audits\n• Encrypted data storage\n• Role-based access controls\n\nYour data is never shared with third parties and you maintain full ownership.",
      keywords: ["secure", "security", "safe", "privacy", "data protection", "encryption"]
    }
  ];

  const quickActions = [
    "What is SalesForecast?",
    "How does it work?",
    "Pricing plans",
    "Free trial"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Find FAQ with most keyword matches
    let bestMatch: FAQ | null = null;
    let maxMatches = 0;

    for (const faq of faqs) {
      const matches = faq.keywords.filter(keyword => 
        lowerQuery.includes(keyword)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = faq;
      }
    }

    if (bestMatch && maxMatches > 0) {
      return bestMatch.answer;
    }

    // Default response if no match found
    return "I'd be happy to help! Here are some topics I can assist with:\n\n• Platform features and capabilities\n• Pricing and plans\n• How AI predictions work\n• Getting started guide\n• Integration options\n• Security and data privacy\n\nCould you please rephrase your question or ask about one of these topics?";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate API delay and get response
    setTimeout(() => {
      const botResponse = findBestAnswer(inputText);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);

    // In production, replace with actual API call:
    // try {
    //   const response = await fetch('/api/chatbot', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ message: inputText })
    //   });
    //   const data = await response.json();
    //   // Add bot response
    // } catch (error) {
    //   console.error('Chatbot error:', error);
    // }
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
    handleSendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <span className="chat-icon">🤖</span>
        <span className="chat-badge">SalesForecast Assistant</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h3>SalesForecast Assistant</h3>
                <span className="status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
              >
                {message.isBot && <div className="message-avatar">🤖</div>}
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="quick-actions">
              <p className="quick-actions-title">Quick questions:</p>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}