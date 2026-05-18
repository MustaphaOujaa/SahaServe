import React, { useState } from 'react';

const DishCard = ({ 
  name, 
  description, 
  price, 
  image, 
  badge, 
  rating = 4.8, 
  reviews = 120,
  time = '20 min',
  weight = 'Medium',
  onAddToCart,
  onToggleFav
}) => {
  const [isFav, setIsFav] = useState(false);
  
  // Convert a single badge string to an array for compatibility with the mockup mapping
  const badges = badge ? [badge] : [];

  return (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-custom transition-all duration-300 hover:-translate-y-2 hover:shadow-custom-lg relative group cursor-pointer flex flex-col h-full">
      <div className="relative overflow-hidden h-[200px] shrink-0">
        <img
          src={image}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={name}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
          {badges.map((b, i) => (
            <span key={i} className={`px-[0.6rem] py-[0.2rem] rounded-full text-[0.65rem] font-bold tracking-[0.05em] uppercase text-white ${
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
        <button 
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${isFav ? 'text-[#e74c3c]' : 'text-text-mid hover:text-[#e74c3c]'}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsFav(!isFav);
            if (onToggleFav) onToggleFav(!isFav);
          }}
        >
          <i className={`${isFav ? 'fas' : 'far'} fa-heart`}></i>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-['Cormorant_Garamond'] text-[1.25rem] font-bold text-brown-dark leading-tight">{name}</h3>
          <span className="text-[1.1rem] font-bold text-gold shrink-0">${price}</span>
        </div>

        <div className="flex gap-3 items-center mb-2">
          <div className="flex items-center gap-1.5 text-[0.75rem] text-text-mid">
            <i className="fas fa-clock text-gold"></i> {time}
          </div>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-text-mid">
            <i className="fas fa-weight text-gold"></i> {weight}
          </div>
        </div>

        <p className="text-[0.82rem] text-text-mid leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-brown-dark">
            <i className="fas fa-star text-gold"></i> {rating} 
            <span className="text-text-mid font-normal text-[0.72rem]">({reviews} reviews)</span>
          </div>
          <button 
            className="w-9 h-9 rounded-full bg-gold text-white flex items-center justify-center shadow-[0_3px_12px_rgba(200,146,42,0.4)] hover:bg-brown-dark hover:scale-110 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) onAddToCart();
            }}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
