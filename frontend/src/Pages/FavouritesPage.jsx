import React from 'react';
import { Link } from 'react-router-dom';
import DishCard from '../components/DishCard';

const FavouritesPage = ({ isLoggedIn = false, favourites = [] }) => {
  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="fixed w-[300px] h-[300px] bg-gold-pale blur-[80px] z-0 opacity-40 top-[20%] -left-[100px] rounded-full"></div>
      <div className="fixed w-[400px] h-[400px] bg-beige blur-[80px] z-0 opacity-40 bottom-[10%] -right-[150px] rounded-full"></div>

      <div className="relative z-1 pt-32 pb-20 px-[5%]">
        <section className="text-center mb-16 animate-[fadeUp_0.8s_ease_both]">
          <span className="block mb-4 text-gold font-semibold uppercase tracking-widest text-[0.8rem]">✦ Personal Selection</span>
          <h1 className="font-['Cormorant_Garamond'] text-[3.2rem] font-bold text-brown-dark leading-tight">
            Your <em className="text-gold italic not-italic">Favourites</em>
          </h1>
        </section>

        {!isLoggedIn ? (
          <section className="flex justify-center animate-[fadeUp_0.8s_0.2s_ease_both]">
            <div className="max-w-[600px] w-full p-16 bg-white rounded-[24px] shadow-custom-md flex flex-col items-center text-center relative overflow-hidden">
              {/* Moroccan watermark */}
              <div className="absolute -top-5 -right-5 text-[10rem] text-gold opacity-[0.05] pointer-events-none select-none font-serif">✦</div>
              
              <div className="w-[100px] h-[100px] rounded-full bg-gold-pale flex items-center justify-center mb-8">
                <i className="fas fa-heart text-[2.5rem] text-gold animate-[pulse_2s_infinite]"></i>
              </div>
              
              <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-bold text-brown-dark mb-4">Save the Flavours You Love</h2>
              <p className="text-text-mid text-[1rem] leading-relaxed mb-10 max-w-[440px]">
                To curate your personal collection of favorite Moroccan delicacies and access them across all your devices, please sign in to your account or join our community.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center w-full">
                <Link to="/login" className="px-8 py-3.5 rounded-full border-[1.5px] border-beige text-text-mid font-semibold text-[0.95rem] hover:border-gold hover:text-gold hover:bg-gold-pale transition-all min-w-[160px]">
                  Sign In
                </Link>
                <Link to="/register" className="px-8 py-3.5 rounded-full bg-gold text-white font-semibold text-[0.95rem] shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all min-w-[160px]">
                  Create Account
                </Link>
              </div>
            </div>
          </section>
        ) : favourites.length === 0 ? (
          <section className="flex flex-col items-center py-20 animate-[fadeUp_0.8s_0.2s_ease_both]">
            <div className="w-20 h-20 rounded-full bg-gold-pale flex items-center justify-center mb-6">
              <i className="far fa-heart text-2xl text-gold"></i>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-2">No favourites yet</h2>
            <p className="text-text-mid mb-8">Start exploring our menu and heart your top dishes!</p>
            <Link to="/menu" className="btn btn-gold">Browse Menu</Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-[fadeUp_0.8s_0.2s_ease_both]">
            {favourites.map(dish => (
              <DishCard key={dish.id} {...dish} isFavourite={true} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;
