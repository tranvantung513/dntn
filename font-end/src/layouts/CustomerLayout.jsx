import React from 'react';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerFooter from '../components/customer/CustomerFooter';
import ChatbotWidget from '../components/customer/ChatbotWidget';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  return (
    <div className="customer-app">
      <CustomerHeader />
      <main className="customer-main-content">
        {children}
      </main>
      <CustomerFooter />
      <ChatbotWidget />
    </div>
  );
};

export default CustomerLayout;
