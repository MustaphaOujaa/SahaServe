import React, { useState, useEffect, useMemo } from 'react';
import DishCard from '../components/DishCard';

const DISHES = [
  {
    id: 1,
    name: "Zaalouk Salad",
    category: "starters",
    type: "vegan",
    price: 12,
    rating: 4.7,
    reviews: 124,
    time: "10 min",
    weight: "Light",
    kcal: 180,
    badges: ["Vegan", "Popular"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=85",
    description: "Smoky roasted eggplant & tomato dip with warm khobz bread and a drizzle of argan oil."
  },
  {
    id: 2,
    name: "Lamb Tagine",
    category: "tagines",
    type: "heavy",
    price: 28,
    rating: 4.9,
    reviews: 312,
    time: "35 min",
    weight: "Heavy",
    kcal: 680,
    badges: ["Chef's Pick", "Heavy"],
    image: "https://images.unsplash.com/photo-1529050273815-177c284bdb39?w=600&q=85",
    description: "Slow-cooked lamb shoulder with prunes, toasted almonds & signature ras el hanout spice blend."
  },
  {
    id: 3,
    name: "Kefta Brochettes",
    category: "grills",
    type: "heavy spicy",
    price: 24,
    rating: 4.8,
    reviews: 218,
    time: "20 min",
    weight: "Heavy",
    kcal: 540,
    badges: ["Spicy", "Heavy"],
    image: "https://images.unsplash.com/photo-1544025162-d76594e8bb76?w=600&q=85",
    description: "Minced beef & lamb skewers seasoned with cumin, coriander and harissa, grilled over charcoal."
  },
  {
    id: 4,
    name: "Royal Couscous",
    category: "couscous",
    type: "heavy",
    price: 22,
    rating: 4.8,
    reviews: 275,
    time: "30 min",
    weight: "Heavy",
    kcal: 720,
    badges: ["Popular", "Heavy"],
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3b28?w=600&q=85",
    description: "Steamed semolina crowned with seven vegetables, chickpeas, merguez sausage and tender lamb."
  },
  {
    id: 5,
    name: "Merguez Sandwich",
    category: "fastfood",
    type: "fast spicy",
    price: 14,
    rating: 4.6,
    reviews: 198,
    time: "8 min",
    weight: "Fast",
    kcal: 420,
    badges: ["Fast", "Spicy"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85",
    description: "Grilled spicy merguez in a toasted Moroccan baguette with harissa mayo, tomato and fries."
  },
  {
    id: 6,
    name: "Bastilla Sucrée",
    category: "desserts",
    type: "fast",
    price: 9,
    rating: 4.9,
    reviews: 145,
    time: "15 min",
    weight: "Light",
    kcal: 320,
    badges: ["New", "Chef's Pick"],
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=85",
    description: "Thin layers of crispy pastry filled with almond cream, topped with cinnamon and honey."
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'fa-border-all' },
  { id: 'starters', name: 'Starters', icon: 'fa-leaf', emoji: '🥗', desc: 'Fresh, vibrant beginnings to awaken your palate' },
  { id: 'tagines', name: 'Tagines', icon: 'fa-fire', emoji: '🫕', desc: 'Hours of patience, layers of flavour' },
  { id: 'grills', name: 'Grills', icon: 'fa-drumstick-bite', emoji: '🔥', desc: 'Fire-kissed meats with Moroccan spice rubs' },
  { id: 'couscous', name: 'Couscous', icon: 'fa-bowl-rice', emoji: '🫙', desc: "Morocco's iconic Friday dish, served every day" },
  { id: 'fastfood', name: 'Fast Food', icon: 'fa-bolt', emoji: '⚡', desc: 'Quick, satisfying bites when time is short' },
  { id: 'desserts', name: 'Desserts', icon: 'fa-star', emoji: '🍮', desc: 'A sweet finale worthy of the journey' },
  { id: 'drinks', name: 'Drinks', icon: 'fa-mug-hot', emoji: '☕', desc: 'Refreshing traditional teas and cold infusions' }
];

const TYPES = [
  { id: 'heavy', name: 'Heavy', icon: '🍖' },
  { id: 'fast', name: 'Fast', icon: '⚡' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'spicy', name: 'Spicy', icon: '🌶️' }
];

const MenuPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTypes, setActiveTypes] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const filteredDishes = useMemo(() => {
    let result = DISHES.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || dish.category === activeCategory;
      const matchesTypes = activeTypes.length === 0 || activeTypes.some(type => dish.type.includes(type));
      return matchesSearch && matchesCategory && matchesTypes;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [search, activeCategory, activeTypes, sortBy]);

  const addToCart = (dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => item.id === dish.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...dish, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const toggleType = (typeId) => {
    setActiveTypes(prev => prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── HERO BANNER ─── */}
      <div className="mt-[72px] relative h-[280px] overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,15,0,0.82)_40%,rgba(26,15,0,0.3)_100%),url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85')] bg-center bg-cover no-repeat"></div>
        <div className="relative z-[1] px-[5%] w-full">
          <span className="inline-block mb-3 px-4 py-1 rounded-full border border-[rgba(200,146,42,0.5)] text-gold-light text-[0.72rem] tracking-[0.18em] uppercase">
            ✦ Our Full Menu · Morocco
          </span>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,5vw,3.4rem)] font-bold text-white leading-[1.1] mb-2">
            Explore Our<br /><em className="text-gold-light italic not-italic">Flavours</em>
          </h1>
          <p className="text-[rgba(255,255,255,0.65)] text-[0.92rem]">
            From hearty traditional dishes to light bites — crafted fresh, every day.
          </p>
        </div>
      </div>

      {/* ─── FILTER BAR ─── */}
      <div className="sticky top-[72px] z-[90] bg-[rgba(250,245,236,0.97)] border-b border-[rgba(200,146,42,0.12)] px-[5%] py-3 shadow-[0_4px_20px_rgba(26,15,0,0.06)] backdrop-blur-md">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-[280px]">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gold text-[0.85rem]"></i>
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-beige rounded-full bg-white text-[0.85rem] outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.1)] transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] font-medium text-[0.8rem] transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-gold border-gold text-white shadow-[0_3px_12px_rgba(200,146,42,0.3)]' : 'bg-white border-beige text-text-mid hover:border-gold hover:text-gold'}`}
              >
                <i className={`fas ${cat.icon} text-[0.75rem]`}></i> {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-l border-beige pl-4 ml-2">
            {TYPES.map(type => (
              <button 
                key={type.id} 
                onClick={() => toggleType(type.id)}
                className={`px-4 py-2 rounded-full border-[1.5px] font-medium text-[0.8rem] transition-all whitespace-nowrap ${activeTypes.includes(type.id) ? 'bg-brown-dark border-brown-dark text-gold' : 'bg-white border-beige text-text-mid hover:border-gold hover:text-gold'}`}
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>

          <div className="relative ml-auto">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-4 pr-10 py-2.5 border-[1.5px] border-beige rounded-full bg-white text-[0.8rem] text-text-mid outline-none cursor-pointer appearance-none focus:border-gold transition-all"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A–Z</option>
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gold text-[0.75rem] pointer-events-none"></i>
          </div>

          <span className="text-[0.78rem] text-text-mid whitespace-nowrap">
            <strong className="text-gold font-bold">{filteredDishes.length}</strong> dishes
          </span>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className="px-[5%] py-12 pb-24">
        {activeCategory === 'all' ? (
          CATEGORIES.filter(c => c.id !== 'all').map(cat => {
            const catDishes = filteredDishes.filter(d => d.category === cat.id);
            if (catDishes.length === 0) return null;
            return (
              <section key={cat.id} id={`sec-${cat.id}`} className="mb-16 animate-[fadeUp_0.5s_ease_both]">
                <div className="flex items-end justify-between mb-8 pb-4 border-b border-beige relative">
                  <div className="absolute bottom-[-1px] left-0 w-16 h-[3px] bg-gold rounded-full"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gold-pale flex items-center justify-center text-[1.3rem] shrink-0">{cat.emoji}</div>
                    <div>
                      <h2 className="font-['Cormorant_Garamond'] text-[1.7rem] font-bold text-brown-dark leading-tight">
                        {cat.name.slice(0, -2)}<em className="text-gold italic not-italic">{cat.name.slice(-2)}</em>
                      </h2>
                      <p className="text-[0.82rem] text-text-mid mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {catDishes.map(dish => (
                    <DishCard key={dish.id} {...dish} onAddToCart={() => addToCart(dish)} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeUp_0.5s_ease_both]">
            {filteredDishes.map(dish => (
              <DishCard key={dish.id} {...dish} onAddToCart={() => addToCart(dish)} />
            ))}
            {filteredDishes.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] text-brown-dark font-bold mb-2">No dishes found</h3>
                <p className="text-text-mid text-[0.88rem]">Try adjusting your filters or search terms.</p>
                <button onClick={() => { setSearch(''); setActiveCategory('all'); setActiveTypes([]); }} className="mt-6 text-gold font-medium underline">Clear all filters</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── CART DRAWER ─── */}
      <div className={`fixed inset-0 z-[2000] bg-[rgba(26,15,0,0.5)] backdrop-blur-[4px] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)}>
        <div className={`absolute top-0 right-0 bottom-0 w-full max-w-[380px] bg-cream shadow-2xl transition-transform duration-350 cubic-bezier(0.4,0,0.2,1) flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-beige flex items-center justify-between">
            <h3 className="font-['Cormorant_Garamond'] text-[1.5rem] font-bold text-brown-dark">Your Order</h3>
            <button className="w-8.5 h-8.5 rounded-full bg-beige text-text-mid flex items-center justify-center hover:bg-gold hover:text-white transition-all" onClick={() => setIsCartOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-mid gap-3">
                <i className="fas fa-shopping-bag text-4xl text-beige"></i>
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center py-4 border-b border-beige">
                    <img src={item.image} className="w-14 h-14 rounded-xl object-cover shrink-0" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.88rem] font-semibold text-brown-dark mb-0.5 truncate">{item.name}</div>
                      <div className="text-[0.82rem] text-gold font-semibold">${item.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded-full border border-beige bg-white text-[0.75rem] text-text-mid flex items-center justify-center hover:border-gold hover:text-gold transition-all" onClick={() => updateQty(item.id, -1)}>-</button>
                      <span className="text-[0.85rem] font-bold min-w-[1.2rem] text-center">{item.qty}</span>
                      <button className="w-7 h-7 rounded-full border border-beige bg-white text-[0.75rem] text-text-mid flex items-center justify-center hover:border-gold hover:text-gold transition-all" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-beige bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[0.9rem] text-text-mid">Subtotal</span>
              <strong className="font-['Cormorant_Garamond'] text-[1.4rem] font-bold text-brown-dark">${cartTotal}</strong>
            </div>
            <button className="w-full py-4 rounded-full bg-gold text-white font-semibold text-[0.92rem] shadow-[0_4px_16px_rgba(200,146,42,0.35)] hover:bg-brown transition-all flex items-center justify-center gap-2">
              Proceed to Checkout <i className="fas fa-arrow-right text-[0.8rem]"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Category Nav */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[80] hidden xl:flex flex-col gap-2">
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
          <div key={cat.id} className="group relative">
            <a 
              href={`#sec-${cat.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`sec-${cat.id}`).scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-2 h-2 rounded-full block transition-all duration-300 ${activeCategory === cat.id ? 'bg-gold scale-150' : 'bg-beige hover:bg-gold hover:scale-125'}`}
            ></a>
            <span className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-white rounded shadow-sm text-[0.7rem] font-medium text-text-mid opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
