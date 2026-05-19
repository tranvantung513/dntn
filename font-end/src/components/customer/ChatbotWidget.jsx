import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi } from '../../api/chatApi';
import { menuItemApi } from '../../api/menuItemApi';
import CustomerProductModal from './CustomerProductModal';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { addToCartContext } = useCart();
  const toast = useToast();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProduct = async (id) => {
    try {
      const res = await menuItemApi.getById(id);
      let data = res.data?.data || res.data?.content || res.data;
      if (data) {
        setSelectedProduct(data);
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error("Lỗi lấy thông tin món ăn:", e);
    }
  };

  const handleAddToCart = async (product, quantity) => {
    try {
      await addToCartContext(product, quantity);
      toast.success(`Đã thêm món "${product.name}" vào giỏ hàng!`);
    } catch (err) {
      console.error(err);
      toast.error(`Thêm món "${product.name}" thất bại!`);
    }
    setIsModalOpen(false);
  };

  const quickReplies = [
    "Khuyến mãi hôm nay có gì?",
    "Nhà hàng mấy giờ đóng cửa?",
    "Giới thiệu các món bán chạy",
    "Phí giao hàng bao nhiêu?"
  ];

  // Determine session ID
  const sessionId = React.useMemo(() => {
    if (userId) return `user_${userId}`;
    let guestSession = localStorage.getItem('chatbotGuestSession');
    if (!guestSession) {
      guestSession = 'guest_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('chatbotGuestSession', guestSession);
    }
    return guestSession;
  }, [userId]);

  // Load chat history from local storage based on sessionId
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chatHistory_${sessionId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        setMessages([]);
      }
    } else {
      // Default welcome message
      setMessages([
        { id: 'welcome', sender: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?' }
      ]);
    }
  }, [sessionId]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Keep only last 50 messages to prevent local storage overflow
      const messagesToSave = messages.slice(-50);
      localStorage.setItem(`chatHistory_${sessionId}`, JSON.stringify(messagesToSave));
    }
  }, [messages, sessionId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (eOrMsg) => {
    let userMsg = '';
    
    if (typeof eOrMsg === 'string') {
      userMsg = eOrMsg;
    } else {
      eOrMsg?.preventDefault();
      userMsg = inputMessage.trim();
    }
    
    if (!userMsg || isLoading) return;

    setInputMessage('');
    
    // Add user message to UI
    const newMessages = [
      ...messages, 
      { id: Date.now().toString(), sender: 'user', text: userMsg }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Call backend API
      const response = await chatApi.sendMessage(userMsg, sessionId);
      
      // Expected structure from backend or fallback to parsing if it's text
      let botResponseText = 'Xin lỗi, tôi không thể xử lý yêu cầu lúc này.';
      if (response.data) {
        // Backend could return a plain string, or an object like { answer: "..." }
        if (typeof response.data === 'string') {
           botResponseText = response.data;
        } else if (response.data.answer || response.data.reply || response.data.message || response.data.response) {
           botResponseText = response.data.answer || response.data.reply || response.data.message || response.data.response;
        } else {
           // Fallback, stringify object if unknown structure
           botResponseText = JSON.stringify(response.data);
        }
      }

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponseText }
      ]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Đã xảy ra lỗi kết nối với máy chủ AI. Vui lòng thử lại sau!' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot-widget-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          className="chatbot-fab" 
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={28} />
          <span className="chatbot-fab-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar bg-white text-orange-500">
                <Bot size={20} />
              </div>
              <div className="chatbot-titles">
                <h3>Trợ lý ảo Saffron</h3>
                <span>Luôn sẵn sàng hỗ trợ</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                {msg.sender === 'bot' && (
                  <div className="message-avatar bot-avatar">
                    <Bot size={16} />
                  </div>
                )}
                <div className="message-bubble">
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown 
                      className="markdown-content"
                      components={{
                        a: ({node, ...props}) => {
                          if (props.href && props.href.startsWith('#product:')) {
                            const id = props.href.split(':')[1];
                            return (
                              <button 
                                onClick={(e) => { e.preventDefault(); handleViewProduct(id); }} 
                                className="bot-view-btn"
                              >
                                {props.children || 'Xem sản phẩm'}
                              </button>
                            );
                          }
                          return <a {...props} target="_blank" rel="noopener noreferrer" />;
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === 'user' && (
                  <div className="message-avatar user-avatar">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message message-bot">
                <div className="message-avatar bot-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Footer Input */}
          <form className="chatbot-footer" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chatbot-send-btn" 
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}

      {isModalOpen && selectedProduct && (
        <CustomerProductModal 
          item={selectedProduct} 
          onClose={() => setIsModalOpen(false)} 
          onAddToCart={handleAddToCart} 
        />
      )}
    </div>
  );
};

export default ChatbotWidget;
