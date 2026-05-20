import React, { useState, useRef, useEffect } from 'react';

const Soa = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Salam! ✦ I am Soa, your Smart Order Assistant at SahaServe. I can guide you through our authentic Moroccan specialties, suggest the perfect dish for your taste, or find delicious vegetarian and spicy options. What are you in the mood for tonight? 🍽️",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Mock Menu Database for intelligent responses
  const menuData = [
    {
      name: "Lamb Tagine",
      category: "Moroccan Classic",
      price: "28 €",
      description: "Slow-cooked to perfection with sweet prunes, toasted almonds, and our house blend of Ras El Hanout spices. A signature Chef's Pick!",
      tags: ["popular", "recommended", "chef pick", "meat", "lamb"]
    },
    {
      name: "Royal Couscous",
      category: "Moroccan Classic",
      price: "24 €",
      description: "Steamed fluffy semolina served with seven fresh seasonal vegetables, a rich spiced broth, and succulent grilled Merguez sausage.",
      tags: ["couscous", "popular", "meat", "vegetables"]
    },
    {
      name: "Zaalouk Salad",
      category: "Starter",
      price: "14 €",
      description: "A traditional smoky roasted eggplant and ripe tomato dip, seasoned with garlic, olive oil, and cumin, served with warm crusty Khobz bread.",
      tags: ["vegan", "vegetarian", "healthy", "salad", "cold starter"]
    },
    {
      name: "Bastilla au Poulet",
      category: "Moroccan Classic",
      price: "22 €",
      description: "Crispy layers of paper-thin Warqa pastry enclosing a saffron-infused shredded chicken, eggs, and sweetened almond filling, dusted with cinnamon and powdered sugar.",
      tags: ["popular", "chicken", "pastry", "sweet and savory"]
    },
    {
      name: "Margherita Pizza",
      category: "Pizza",
      price: "45 DH",
      description: "Classic Neapolitan style pizza topped with organic tomato sauce, fresh creamy mozzarella cheese, and fragrant basil leaves.",
      tags: ["vegetarian", "cheese", "pizza"]
    },
    {
      name: "Spicy Chicken Burger",
      category: "Burger",
      price: "55 DH",
      description: "Tender grilled chicken breast served in a toasted brioche bun with crispy lettuce, tomatoes, and our signature fiery hot sauce.",
      tags: ["spicy", "chicken", "burger"]
    },
    {
      name: "Caesar Salad",
      category: "Salad",
      price: "35 DH",
      description: "Crisp hearts of romaine lettuce tossed in a creamy Caesar dressing, topped with grilled chicken breast slices, garlic croutons, and freshly shaved Parmesan cheese.",
      tags: ["healthy", "salad", "chicken"]
    }
  ];

  // Quick replies definition
  const quickReplies = [
    { label: "Chef's Pick 👑", query: "Recommend a Chef's Pick" },
    { label: "Spicy Options 🌶️", query: "Do you have anything spicy?" },
    { label: "Vegetarian / Vegan 🥬", query: "Show me vegetarian options" },
    { label: "Lamb Tagine 🥩", query: "Tell me about the Lamb Tagine" }
  ];

  // Intelligent mock response logic
  const getMockResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();

    if (input.includes("hello") || input.includes("hi") || input.includes("salam") || input.includes("hey")) {
      return "Salam Alaykum! Welcome to SahaServe. ✦ How can I assist you with our menu today?";
    }

    if (input.includes("chef") || input.includes("recommend") || input.includes("signature") || input.includes("best") || input.includes("popular")) {
      const tagine = menuData[0];
      const bastilla = menuData[3];
      return `Our top recommendation is the **${tagine.name}** (${tagine.price}) — it's our signature Chef's Pick, slow-cooked with prunes, almonds, and Ras El Hanout. Another guest favorite is the sweet and savory **${bastilla.name}** (${bastilla.price}), a beautiful crispy chicken pastry!`;
    }

    if (input.includes("spicy") || input.includes("hot") || input.includes("chili")) {
      const spicyBurger = menuData[5];
      return `For a kick of heat, try our **${spicyBurger.name}** (${spicyBurger.price}) made with tender grilled chicken and our fiery signature hot sauce! You can also request extra Harissa sauce with our **Royal Couscous**.`;
    }

    if (input.includes("vegetarian") || input.includes("vegan") || input.includes("no meat") || input.includes("meatless")) {
      const zaalouk = menuData[2];
      const pizza = menuData[4];
      return `We have excellent vegetarian dishes! \n\n1. **${zaalouk.name}** (${zaalouk.price}) - A vegan smoky roasted eggplant & tomato dip served with warm bread.\n2. **${pizza.name}** (${pizza.price}) - Classic mozzarella pizza.\n\nAlso, our **Royal Couscous** can be prepared as 100% vegetarian upon request!`;
    }

    if (input.includes("tagine") || input.includes("lamb")) {
      const tagine = menuData[0];
      return `The **${tagine.name}** (${tagine.price}) is a masterpiece of Moroccan slow-cooking. We prepare it in a traditional clay tagine pot with tender halal lamb, sweet prunes, toasted almonds, and authentic Ras El Hanout spices. It's incredibly flavorful and highly recommended!`;
    }

    if (input.includes("couscous")) {
      const couscous = menuData[1];
      return `Our **${couscous.name}** (${couscous.price}) features fluffy steamed semolina piled high with seven seasonal vegetables, a rich spiced broth, and flavorful grilled Merguez sausage. Perfect for a complete, comforting meal!`;
    }

    if (input.includes("bastilla") || input.includes("chicken pastry")) {
      const bastilla = menuData[3];
      return `**${bastilla.name}** (${bastilla.price}) is an exquisite sweet and savory traditional pastry. Inside crispy, golden-brown layers of paper-thin Warqa dough, you'll find aromatic saffron-shredded chicken, egg, and roasted crushed almonds dusted with sweet cinnamon and powdered sugar.`;
    }

    if (input.includes("pizza")) {
      const pizza = menuData[4];
      return `Yes, we serve a fresh **${pizza.name}** (${pizza.price}) with aromatic tomato sauce, melted mozzarella, and fresh basil. A perfect choice for a classic, delicious option!`;
    }

    if (input.includes("burger")) {
      const burger = menuData[5];
      return `Our **${burger.name}** (${burger.price}) is delicious! It comes in a warm toasted brioche bun with grilled chicken breast, crisp lettuce, tomato, and our fiery house hot sauce.`;
    }

    if (input.includes("salad")) {
      const zaalouk = menuData[2];
      const caesar = menuData[6];
      return `We offer two fantastic salads:\n\n1. **${zaalouk.name}** (${zaalouk.price}) - Traditional smoky Moroccan eggplant & tomato dip.\n2. **${caesar.name}** (${caesar.price}) - Crisp romaine hearts with grilled chicken, crunchy croutons, and shaved Parmesan.`;
    }

    if (input.includes("price") || input.includes("cost") || input.includes("how much")) {
      return "Our delicious starters begin at 14 € (Zaalouk Salad), pizzas at 45 DH, burgers at 55 DH, and our traditional Moroccan main courses range from 22 € to 28 €. Let me know which dish you are curious about!";
    }

    // Default response using keywords match search
    const matchingDishes = menuData.filter(d => 
      input.split(' ').some(word => word.length > 2 && d.name.toLowerCase().includes(word) || d.description.toLowerCase().includes(word))
    );

    if (matchingDishes.length > 0) {
      const dish = matchingDishes[0];
      return `Are you interested in the **${dish.name}** (${dish.price})? It is a delicious ${dish.category} dish. Here is a description: ${dish.description}`;
    }

    return "I want to make sure I guide you perfectly! I recommend checking out our signature **Lamb Tagine** (Chef's Pick), traditional **Royal Couscous**, or crispy **Bastilla au Poulet**. You can also ask me about vegetarian and spicy options!";
  };

  const handleSend = (textToSend) => {
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

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = getMockResponse(text);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1200);
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
