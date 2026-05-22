import React, { useMemo, useState } from 'react';
import DishCard from '../Components/DishCard';
import { useGetCategoriesQuery, useGetDishesQuery, useGetTagsQuery } from '../redux/api/apiSlice';
import { normalizeCategory, normalizeDish, normalizeTag, tagMatchesDish } from '../utils/menuTransforms';

const MenuPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTags, setActiveTags] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const { data: dishes = [], isLoading: dishesLoading, isError: dishesError } = useGetDishesQuery();
  const { data: backendCategories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: tagsResponse, isLoading: tagsLoading } = useGetTagsQuery({ perPage: 100 });

  const menuDishes = useMemo(() => dishes.map(normalizeDish), [dishes]);
  const categories = useMemo(
    () => [{ id: 'all', name: 'All', icon: 'fa-border-all' }, ...backendCategories.map(normalizeCategory)],
    [backendCategories]
  );
  const tagFilters = useMemo(
    () => (tagsResponse?.data || []).map(normalizeTag),
    [tagsResponse]
  );
  const highestPrice = useMemo(
    () => Math.ceil(Math.max(0, ...menuDishes.map(dish => dish.price))),
    [menuDishes]
  );
  const selectedMaxPrice = maxPrice === '' ? highestPrice : Number(maxPrice);

  const filteredDishes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = menuDishes.filter(dish => {
      const matchesSearch = !normalizedSearch || [
        dish.name,
        dish.description,
        dish.categoryName,
        dish.badges.join(' '),
      ].some(value => value?.toLowerCase().includes(normalizedSearch));
      const matchesCategory = activeCategory === 'all' || dish.category === activeCategory;
      const matchesTags = activeTags.length === 0 || activeTags.some(tagId => {
        const filter = tagFilters.find(tag => tag.id === tagId);
        return filter ? tagMatchesDish(dish, filter) : false;
      });
      const matchesPrice = maxPrice === '' || dish.price <= selectedMaxPrice;

      return matchesSearch && matchesCategory && matchesTags && matchesPrice;
    });

    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [activeCategory, activeTags, maxPrice, menuDishes, search, selectedMaxPrice, sortBy, tagFilters]);

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
        return { ...item, qty: Math.max(0, item.qty + delta) };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setActiveTags([]);
    setMaxPrice('');
  };

  const toggleTag = (tagId) => {
    setActiveTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const isLoading = dishesLoading || categoriesLoading || tagsLoading;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mt-[72px] relative h-[280px] overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,15,0,0.82)_40%,rgba(26,15,0,0.3)_100%),url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85')] bg-center bg-cover no-repeat"></div>
        <div className="relative z-[1] px-[5%] w-full">
          <span className="inline-block mb-3 px-4 py-1 rounded-full border border-[rgba(200,146,42,0.5)] text-gold-light text-[0.72rem] tracking-[0.18em] uppercase">
            Our Full Menu
          </span>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,5vw,3.4rem)] font-bold text-white leading-[1.1] mb-2">
            Explore Our<br /><em className="text-gold-light italic not-italic">Flavours</em>
          </h1>
          <p className="text-[rgba(255,255,255,0.65)] text-[0.92rem]">
            From hearty traditional dishes to light bites, crafted fresh every day.
          </p>
        </div>
      </div>

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
            {categories.map(cat => (
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
            {tagFilters.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] font-medium text-[0.8rem] transition-all whitespace-nowrap ${activeTags.includes(tag.id) ? 'bg-brown-dark border-brown-dark text-gold' : 'bg-white border-beige text-text-mid hover:border-gold hover:text-gold'}`}
              >
                <i className={`fas ${tag.icon} text-[0.75rem]`}></i> {tag.name}
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
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gold text-[0.75rem] pointer-events-none"></i>
          </div>

          {highestPrice > 0 && (
            <div className="flex items-center gap-3 min-w-[220px]">
              <label htmlFor="max-price" className="text-[0.78rem] font-semibold text-text-mid whitespace-nowrap">
                Up to <span className="text-gold">{selectedMaxPrice.toFixed(0)} DH</span>
              </label>
              <input
                id="max-price"
                type="range"
                min="0"
                max={highestPrice}
                step="5"
                value={selectedMaxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-gold cursor-pointer"
              />
            </div>
          )}

          <span className="text-[0.78rem] text-text-mid whitespace-nowrap">
            <strong className="text-gold font-bold">{filteredDishes.length}</strong> dishes
          </span>
        </div>
      </div>

      <main className="px-[5%] py-12 pb-24">
        {isLoading && (
          <div className="py-20 flex flex-col items-center text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-gold mb-4"></i>
            <p className="text-text-mid text-[0.9rem]">Loading menu...</p>
          </div>
        )}

        {dishesError && (
          <div className="py-20 flex flex-col items-center text-center">
            <i className="fas fa-triangle-exclamation text-3xl text-gold mb-4"></i>
            <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] text-brown-dark font-bold mb-2">Menu is unavailable</h3>
            <p className="text-text-mid text-[0.88rem]">Please make sure the backend server is running.</p>
          </div>
        )}

        {!isLoading && !dishesError && activeCategory === 'all' && (
          filteredDishes.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center">
              <i className="fas fa-utensils text-4xl mb-4 text-gold"></i>
              <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] text-brown-dark font-bold mb-2">No dishes found</h3>
              <p className="text-text-mid text-[0.88rem]">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="mt-6 text-gold font-medium underline">Clear all filters</button>
            </div>
          ) : (
            categories.filter(c => c.id !== 'all').map(cat => {
              const catDishes = filteredDishes.filter(d => d.category === cat.id);
              if (catDishes.length === 0) return null;

              return (
                <section key={cat.id} id={`sec-${cat.id}`} className="mb-16 animate-[fadeUp_0.5s_ease_both]">
                  <div className="flex items-end justify-between mb-8 pb-4 border-b border-beige relative">
                    <div className="absolute bottom-[-1px] left-0 w-16 h-[3px] bg-gold rounded-full"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gold-pale flex items-center justify-center text-[0.85rem] font-bold text-gold shrink-0">
                        {cat.initials}
                      </div>
                      <div>
                        <h2 className="font-['Cormorant_Garamond'] text-[1.7rem] font-bold text-brown-dark leading-tight">
                          {cat.name}
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
          )
        )}

        {!isLoading && !dishesError && activeCategory !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeUp_0.5s_ease_both]">
            {filteredDishes.map(dish => (
              <DishCard key={dish.id} {...dish} onAddToCart={() => addToCart(dish)} />
            ))}
            {filteredDishes.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <i className="fas fa-utensils text-4xl mb-4 text-gold"></i>
                <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] text-brown-dark font-bold mb-2">No dishes found</h3>
                <p className="text-text-mid text-[0.88rem]">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="mt-6 text-gold font-medium underline">Clear all filters</button>
              </div>
            )}
          </div>
        )}
      </main>

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
                      <div className="text-[0.82rem] text-gold font-semibold">{item.price.toFixed(2)} DH</div>
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
              <strong className="font-['Cormorant_Garamond'] text-[1.4rem] font-bold text-brown-dark">{cartTotal.toFixed(2)} DH</strong>
            </div>
            <button className="w-full py-4 rounded-full bg-gold text-white font-semibold text-[0.92rem] shadow-[0_4px_16px_rgba(200,146,42,0.35)] hover:bg-brown transition-all flex items-center justify-center gap-2">
              Proceed to Checkout <i className="fas fa-arrow-right text-[0.8rem]"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[80] hidden xl:flex flex-col gap-2">
        {categories.filter(c => c.id !== 'all').map(cat => (
          <div key={cat.id} className="group relative">
            <a
              href={`#sec-${cat.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`sec-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' });
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
