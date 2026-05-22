import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DishCard from '../Components/DishCard';
import { useGetDishQuery, useGetDishesQuery } from '../redux/api/apiSlice';
import { normalizeDish } from '../utils/menuTransforms';

const ShowDishPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description | reviews
  const { data: backendDish, isLoading, isError } = useGetDishQuery(id);
  const { data: dishes = [] } = useGetDishesQuery();
  const dish = useMemo(() => backendDish ? normalizeDish(backendDish) : null, [backendDish]);
  const menuDishes = useMemo(() => dishes.map(normalizeDish), [dishes]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
  }, [id]);

  useEffect(() => {
    if (isError) {
      navigate('/menu');
    }
  }, [isError, navigate]);

  if (isLoading || !dish) {
    return (
      <div className="min-h-screen bg-cream pt-[72px]">
        <div className="py-20 flex flex-col items-center text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-gold mb-4"></i>
          <p className="text-text-mid text-[0.9rem]">Loading dish...</p>
        </div>
      </div>
    );
  }

  const recommendations = menuDishes.filter(d => d.id !== dish.id && d.category === dish.category).slice(0, 4);
  if (recommendations.length < 4) {
    const more = menuDishes.filter(d => d.id !== dish.id && !recommendations.find(r => r.id === d.id)).slice(0, 4 - recommendations.length);
    recommendations.push(...more);
  }

  // Mock Reviews
  const mockReviews = [
    { id: 1, user: "Yassine B.", rating: 5, date: "May 18, 2026", text: "Absolutely fantastic! The flavors are incredibly authentic and the portion size is very generous." },
    { id: 2, user: "Sarah M.", rating: 4, date: "May 10, 2026", text: "Very tasty, reminded me of my grandmother's cooking. A bit too spicy for my taste but still great." },
    { id: 3, user: "Amine K.", rating: 5, date: "April 22, 2026", text: "Best I've ever had in Casablanca. Will definitely be ordering this again." }
  ];

  return (
    <div className="min-h-screen bg-cream pt-[72px]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.85rem] text-text-mid mb-8 font-medium">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[0.6rem]"></i>
          <Link to="/menu" className="hover:text-gold transition-colors">Menu</Link>
          <i className="fas fa-chevron-right text-[0.6rem]"></i>
          <span className="text-gold font-bold">{dish.name}</span>
        </div>

        {/* Dish Hero */}
        <div className="bg-white rounded-[24px] shadow-custom p-6 md:p-10 flex flex-col md:flex-row gap-10 mb-12 animate-[fadeUp_0.4s_ease_both]">
          {/* Image */}
          <div className="w-full md:w-1/2 relative rounded-[16px] overflow-hidden group">
            <img 
              src={dish.image} 
              alt={dish.name} 
              className="w-full h-full object-cover min-h-[300px] md:min-h-[400px] transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {dish.badges.map((b, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-[0.75rem] font-bold tracking-[0.05em] uppercase text-white shadow-md ${
                  b === "Chef's Pick" ? 'bg-gold' : 
                  b === "Vegan" ? 'bg-[#27ae60]' : 
                  b === "Spicy" ? 'bg-[#e74c3c]' : 
                  b === "Popular" ? 'bg-brown-dark text-gold-light' : 
                  b === "New" ? 'bg-[#9b59b6]' : 'bg-gold'
                }`}>
                  {b}
                </span>
              ))}
            </div>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-text-mid flex items-center justify-center hover:text-[#e74c3c] shadow-md transition-colors">
              <i className="far fa-heart text-lg"></i>
            </button>
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gold font-bold text-[0.9rem] uppercase tracking-wider">{dish.categoryName}</span>
            </div>
            
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] md:text-[3.5rem] font-bold text-brown-dark leading-tight mb-2">
              {dish.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-gold text-[1.1rem]">
                <i className="fas fa-star"></i>
                <span className="font-bold text-brown-dark">{dish.rating}</span>
                <span className="text-text-mid text-[0.85rem] font-normal">({dish.reviews} Reviews)</span>
              </div>
            </div>

            <p className="text-[1.05rem] text-text-mid leading-relaxed mb-8">
              {dish.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-cream rounded-[12px] p-4 flex flex-col items-center justify-center text-center gap-1">
                <i className="fas fa-clock text-gold text-xl mb-1"></i>
                <span className="text-[0.8rem] text-text-mid uppercase font-bold tracking-wider">Prep Time</span>
                <span className="text-[1.1rem] font-bold text-brown-dark">{dish.time}</span>
              </div>
              <div className="bg-cream rounded-[12px] p-4 flex flex-col items-center justify-center text-center gap-1">
                <i className="fas fa-weight-hanging text-gold text-xl mb-1"></i>
                <span className="text-[0.8rem] text-text-mid uppercase font-bold tracking-wider">Weight</span>
                <span className="text-[1.1rem] font-bold text-brown-dark">{dish.weight}</span>
              </div>
              <div className="bg-cream rounded-[12px] p-4 flex flex-col items-center justify-center text-center gap-1">
                <i className="fas fa-fire-alt text-gold text-xl mb-1"></i>
                <span className="text-[0.8rem] text-text-mid uppercase font-bold tracking-wider">Calories</span>
                <span className="text-[1.1rem] font-bold text-brown-dark">{dish.kcal} kcal</span>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center gap-6 mt-auto">
              <span className="font-['Cormorant_Garamond'] text-[2.5rem] md:text-[3rem] font-bold text-gold leading-none whitespace-nowrap">
                {dish.price.toFixed(2)} DH
              </span>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 xl:ml-auto">
                <div className="flex items-center bg-cream rounded-full p-1 border border-beige">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-full bg-white text-text-mid flex items-center justify-center hover:text-gold transition-colors shadow-sm cursor-pointer"
                  >
                    <i className="fas fa-minus text-[0.8rem]"></i>
                  </button>
                  <span className="w-12 text-center font-bold text-brown-dark text-[1.1rem]">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-full bg-white text-text-mid flex items-center justify-center hover:text-gold transition-colors shadow-sm cursor-pointer"
                  >
                    <i className="fas fa-plus text-[0.8rem]"></i>
                  </button>
                </div>
                
                <button
                  type="button"
                  className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-full bg-gold px-7 text-white font-bold text-[0.95rem] leading-none shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="fas fa-shopping-bag text-[0.95rem]"></i>
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="bg-white rounded-[24px] shadow-custom p-6 md:p-10 mb-12 animate-[fadeUp_0.4s_0.1s_ease_both]">
          <div className="flex items-center gap-8 border-b border-beige mb-8">
            <button 
              onClick={() => setActiveTab('description')}
              className={`pb-4 text-[1.1rem] font-bold transition-colors relative cursor-pointer ${activeTab === 'description' ? 'text-gold' : 'text-text-mid hover:text-brown-dark'}`}
            >
              Detailed Info
              {activeTab === 'description' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-[1.1rem] font-bold transition-colors relative cursor-pointer ${activeTab === 'reviews' ? 'text-gold' : 'text-text-mid hover:text-brown-dark'}`}
            >
              Reviews ({dish.reviews})
              {activeTab === 'reviews' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full"></span>}
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="animate-[fadeUp_0.3s_ease_both]">
              <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-4">About This Dish</h3>
              <p className="text-[1.05rem] text-text-mid leading-relaxed mb-6">
                Our {dish.name} is prepared daily using the freshest local ingredients. 
                {dish.description} The blend of authentic spices and careful preparation guarantees a taste that transports you straight to the heart of Morocco.
              </p>
              <h4 className="font-bold text-brown-dark mb-2">Ingredients</h4>
              <ul className="list-disc pl-5 text-text-mid space-y-1">
                <li>Locally sourced primary ingredients</li>
                <li>Signature Moroccan spice blend (Ras el Hanout, Cumin, Saffron)</li>
                <li>Fresh herbs (Cilantro, Parsley, Mint)</li>
                <li>Premium Argan or Olive Oil</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-[fadeUp_0.3s_ease_both]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark">Customer Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-gold text-[1.1rem]">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star-half-alt"></i>
                    </div>
                    <span className="font-bold text-brown-dark text-[1.1rem]">{dish.rating} out of 5</span>
                  </div>
                </div>
                <button className="px-6 py-2.5 rounded-full border-2 border-gold text-gold font-bold text-[0.9rem] hover:bg-gold hover:text-white transition-all cursor-pointer">
                  Write a Review
                </button>
              </div>

              <div className="space-y-6">
                {mockReviews.map(review => (
                  <div key={review.id} className="bg-cream rounded-[16px] p-6 border border-beige">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold font-bold text-[1.1rem]">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-brown-dark">{review.user}</h4>
                          <span className="text-[0.75rem] text-text-mid">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex text-gold text-[0.8rem]">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"}></i>
                        ))}
                      </div>
                    </div>
                    <p className="text-[0.95rem] text-text-mid">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="mb-12 animate-[fadeUp_0.4s_0.2s_ease_both]">
          <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-bold text-brown-dark mb-6 border-b border-beige pb-3">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(rec => (
              <DishCard key={rec.id} {...rec} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShowDishPage;
