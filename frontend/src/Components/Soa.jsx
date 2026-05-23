import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ASSISTANT_API_URL = import.meta.env.VITE_DISH_ASSISTANT_URL || 'http://127.0.0.1:5005/assistant/chat';

const Soa = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Salam! ✦ I am Soa, your Smart Order Assistant at SahaServe. I can guide you through our authentic Moroccan specialties, suggest the perfect dish for your taste, or find delicious vegetarian and spicy options. What are you in the mood for tonight? 🍽️",
      dishes: [],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickReplies = [
    { label: "Chef's Pick 👑", query: "Recommend a Chef's Pick" },
    { label: "Spicy Options 🌶️", query: "Do you have anything spicy?" },
    { label: "Vegetarian / Vegan 🥬", query: "Show me vegetarian options" },
    { label: "Lamb Tagine 🥩", query: "Tell me about the Lamb Tagine" }
  ];

  const handleAddDishToCart = (dish) => {
    handleSend(`Add ${dish.name} to my cart`);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(ASSISTANT_API_URL, {
        message: text,
        auth_token: localStorage.getItem('auth_token'),
      });
      
      let responseText = "Sorry, I encountered an error.";
      let recommendedDishes = [];
      
      if (response.data && response.data.response) {
        if (typeof response.data.response === 'string') {
          responseText = response.data.response;
        } else {
          if (response.data.response.summary) {
            responseText = response.data.response.summary;
          }
          if (response.data.response.recommended_dishes) {
            recommendedDishes = response.data.response.recommended_dishes;
          }
        }
      }

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        dishes: recommendedDishes,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessage = {
        id: `bot-error-${Date.now()}`,
        sender: 'bot',
        text: "I'm having trouble connecting to my brain right now. Please check your connection or try again later.",
        dishes: [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Chat cleared! ✦ Ask me anything about our delicious menu items, recommendations, or diets.",
        dishes: [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* ─── CHATBOT FAB (TRIGGER BUTTON) ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[linear-gradient(135deg,var(--brown-dark)_0%,#2a1200_100%)] border-2 border-gold/40 flex items-center justify-center cursor-pointer shadow-custom-md transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none`}
        aria-label="Toggle AI Assistant"
      >
        {/* Glow pulsing ring around the button */}
        <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-[glowPulse_3s_ease-in-out_infinite]"></div>

        {isOpen ? (
          // Close Icon
          <i className="fas fa-times text-gold text-2xl transition-transform duration-300 rotate-90 group-hover:rotate-0"></i>
        ) : (
          // Miniature Interactive floating robot head matching the page design
          <div className="relative w-10 h-10 flex flex-col justify-center items-center scale-95 group-hover:scale-100 transition-transform">
            {/* Robot head */}
            <div className="w-8 h-[26px] bg-[linear-gradient(160deg,#4a3318,#2a1800)] rounded-[8px] border border-gold/50 relative flex justify-center items-center">
              {/* Antenna */}
              <div className="absolute w-[2px] h-[8px] bg-gold/70 top-[-9px] left-1/2 -translate-x-1/2 rounded-[1px] after:content-[''] after:absolute after:top-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-[6px] after:h-[6px] after:rounded-full after:bg-gold after:shadow-[0_0_8px_var(--gold)]"></div>
              {/* Eyes */}
              <div className="flex gap-[6px]">
                <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_var(--gold-light)] animate-[eyeBlink_4.5s_ease-in-out_infinite]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_var(--gold-light)] animate-[eyeBlink_4.5s_ease-in-out_infinite]"></div>
              </div>
            </div>
            {/* Robot body preview */}
            <div className="w-6 h-[8px] bg-[linear-gradient(160deg,#3d2b10,#1a0f00)] rounded-t-[4px] border-x border-t border-gold/40 mt-[2px]"></div>
          </div>
        )}
      </button>

      {/* ─── CHAT PANEL WINDOW ─── */}
      <div
        className={`fixed right-6 z-50 flex flex-col w-[340px] sm:w-[440px] lg:w-[520px] xl:w-[560px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl border border-gold/30 shadow-custom-lg backdrop-blur-md bg-brown-dark/95 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 bottom-24 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-95 bottom-12 pointer-events-none'
        }`}
      >
        {/* Header section with glassmorphism */}
        <div className="p-4 border-b border-gold/20 flex items-center justify-between bg-black/20 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {/* Miniature floating robot header avatar */}
            <div className="w-10 h-10 rounded-full bg-brown/50 border border-gold/40 flex items-center justify-center relative shadow-[inset_0_2px_8px_rgba(200,146,42,0.1)]">
              {/* Pulse status indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-brown-dark shadow-[0_0_6px_#22c55e] animate-pulse"></span>
              
              <div className="relative w-8 h-8 flex flex-col justify-center items-center">
                <div className="w-6 h-[18px] bg-[linear-gradient(160deg,#4a3318,#2a1800)] rounded-[6px] border border-gold/50 relative flex justify-center items-center">
                  <div className="absolute w-[2px] h-[6px] bg-gold/70 top-[-7px] left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:top-[-3px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold"></div>
                  <div className="flex gap-[4px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold-light)] animate-[eyeBlink_3s_ease-in-out_infinite]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold-light)] animate-[eyeBlink_3s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white text-[0.95rem] leading-none tracking-wide flex items-center gap-1.5">
                Soa Assistant <span className="text-[0.7rem] px-1.5 py-0.5 rounded bg-gold/10 text-gold-light border border-gold/20 font-mono tracking-widest uppercase">AI</span>
              </h3>
              <p className="text-[0.73rem] text-gold-pale/60 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Ask me about dishes!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Trash button to clear chat */}
            <button
              onClick={handleClear}
              className="w-8 h-8 rounded-full border border-gold/10 hover:border-gold/30 hover:bg-gold/10 text-gold-pale/60 hover:text-gold transition-colors flex items-center justify-center cursor-pointer"
              title="Clear chat"
            >
              <i className="fas fa-trash-alt text-[0.8rem]"></i>
            </button>
            
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full border border-gold/10 hover:border-gold/30 hover:bg-gold/10 text-gold-pale/60 hover:text-gold transition-colors flex items-center justify-center cursor-pointer"
            >
              <i className="fas fa-times text-[0.9rem]"></i>
            </button>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[18px] p-3.5 shadow-sm flex flex-col gap-1 ${
                  message.sender === 'user'
                    ? 'bg-[linear-gradient(135deg,var(--gold)_0%,#a0721e_100%)] text-white rounded-br-none'
                    : 'bg-brown/40 border border-gold/15 text-cream rounded-bl-none'
                }`}
              >
                {/* Text render with support for bold formatting and lists */}
                <p className="text-[0.88rem] leading-relaxed whitespace-pre-line font-light">
                  {message.text.split('**').map((part, idx) => 
                    idx % 2 === 1 ? <strong key={idx} className="font-bold text-gold-light">{part}</strong> : part
                  )}
                </p>

                {/* Render recommended dishes inside bot messages if they exist */}
                {message.sender === 'bot' && message.dishes && message.dishes.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-gold/10 space-y-2.5 animate-[fadeUp_0.3s_ease_both]">
                    <p className="text-[0.73rem] font-bold text-gold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <i className="fas fa-utensils text-[0.7rem]"></i> Match recommendations:
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-w-full">
                      {message.dishes.map((dish) => (
                        <div 
                          key={dish.id} 
                          className="p-3 rounded-xl bg-black/40 border border-gold/20 flex justify-between items-center gap-4 hover:border-gold/45 hover:bg-black/50 transition-all duration-300"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[0.84rem] font-bold text-white truncate flex items-center gap-1">
                              {dish.name}
                            </h4>
                            {dish.reason && (
                              <p className="text-[0.7rem] text-gold-pale/75 italic mt-0.5 line-clamp-1">
                                {dish.reason}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                            <span className="text-[0.84rem] font-bold text-gold-light font-mono">
                              {typeof dish.price === 'number' ? `${dish.price.toFixed(2)} DH` : dish.price}
                            </span>
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/dish/${dish.id}`}
                                className="text-[0.72rem] text-gold hover:text-gold-light hover:underline transition-all cursor-pointer font-bold flex items-center gap-1"
                              >
                                <i className="fas fa-info-circle text-[0.68rem]"></i> Details
                              </Link>
                              <button
                                onClick={() => handleAddDishToCart(dish)}
                                disabled={isLoading}
                                className="px-2.5 py-1 rounded-full bg-[linear-gradient(135deg,var(--gold)_0%,#a0721e_100%)] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-[0.68rem] tracking-wide active:scale-95 transition-all shadow-[0_2px_6px_rgba(200,146,42,0.15)] flex items-center gap-1 cursor-pointer"
                              >
                                <i className="fas fa-plus text-[0.6rem]"></i> Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`text-[0.7rem] self-end opacity-50 ${
                    message.sender === 'user' ? 'text-white' : 'text-gold-pale'
                  }`}
                >
                  {message.time}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-brown/40 border border-gold/15 text-cream rounded-[18px] rounded-bl-none p-3.5 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies slider panel */}
        <div className="px-4 py-2 bg-black/10 border-t border-gold/10 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSend(reply.query)}
              disabled={isLoading}
              className="inline-block px-3.5 py-2 rounded-full border border-gold/20 hover:border-gold/50 bg-brown-dark text-gold-pale/85 hover:text-gold text-[0.78rem] font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {reply.label}
            </button>
          ))}
        </div>

        {/* Inputs Footer Container */}
        <div className="p-3 border-t border-gold/20 bg-black/20 flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            placeholder="Type a message or menu query..."
            className="flex-1 px-5 py-3 rounded-full bg-brown-dark/50 border border-gold/20 focus:border-gold/50 text-white placeholder:text-gold-pale/35 font-light text-[0.88rem] outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className="w-9 h-9 rounded-full bg-gold hover:bg-gold-light text-brown-dark flex items-center justify-center cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow-md shadow-gold/20"
          >
            <i className="fas fa-paper-plane text-[0.8rem]"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default Soa;
