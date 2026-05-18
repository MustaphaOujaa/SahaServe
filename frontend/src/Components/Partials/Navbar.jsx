import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAuthPage = 
    location.pathname.toLowerCase().includes('register') || 
    location.pathname.toLowerCase().includes('login') ||
    window.location.pathname.toLowerCase().includes('register') ||
    window.location.pathname.toLowerCase().includes('login') ||
    window.location.hash.toLowerCase().includes('register') ||
    window.location.hash.toLowerCase().includes('login');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[5%] transition-all duration-300 ${
      isAuthPage 
        ? 'bg-transparent h-[72px] border-none shadow-none backdrop-blur-none' 
        : scrolled 
          ? 'bg-white h-16 shadow-custom-md px-[4%]' 
          : 'bg-[rgba(250,245,236,0.96)] h-[72px] backdrop-blur-[18px] border-b border-[rgba(200,146,42,0.15)] shadow-custom'
    }`}>
      <Link to="/" className={`font-['Cormorant_Garamond'] text-[1.7rem] font-bold no-underline transition-colors duration-300 ${isAuthPage ? 'text-white' : 'text-brown-dark'}`}>
        Saha<span className="text-gold">Serve</span>
      </Link>

      {!isAuthPage ? (
        <>
          <ul className="hidden md:flex gap-8 list-none">
            <li><Link to="/" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">Home</Link></li>
            <li><Link to="/menu" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">Menu</Link></li>
            <li><Link to="/about" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">About</Link></li>
            <li><Link to="/contact" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">Contact</Link></li>
          </ul>
          <div className="flex gap-[0.7rem] items-center">
            <Link to="/notifications" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold text-[0.95rem] hover:bg-gold hover:text-white transition-all">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-gold text-white text-[0.62rem] font-bold flex items-center justify-center">2</span>
            </Link>
            <Link to="/favourites" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold text-[0.95rem] hover:bg-gold hover:text-white transition-all">
              <i className="fas fa-heart"></i>
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brown-dark text-white text-[0.62rem] font-bold flex items-center justify-center">0</span>
            </Link>
            <Link to="/cart" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold text-[0.95rem] hover:bg-gold hover:text-white transition-all">
              <i className="fas fa-shopping-bag"></i>
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brown-dark text-white text-[0.62rem] font-bold flex items-center justify-center">0</span>
            </Link>
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold text-[0.95rem] hover:bg-gold hover:text-white transition-all">
                <i className="fas fa-user"></i>
                <i className="fas fa-chevron-down text-[0.5rem] ml-[2px] opacity-70"></i>
              </button>
              <div className="absolute top-[100%] right-0 w-[200px] bg-white rounded-custom-sm shadow-custom-lg border border-[rgba(200,146,42,0.1)] p-3 flex flex-col gap-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-[10px] transition-all duration-300 z-[1001] mt-[10px]">
                <div className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-gold px-3 mb-1">Accounts & Roles</div>
                <Link to="/profile" className="flex items-center gap-3 p-[0.65rem] rounded-[10px] text-text-mid text-[0.85rem] font-medium hover:bg-gold-pale hover:text-gold transition-all">
                  <i className="fas fa-user-circle text-gold w-[18px]"></i> Client Profile
                </Link>
                <div className="h-[1px] bg-[rgba(200,146,42,0.1)] my-[0.4rem]"></div>
                <Link to="/admin" className="flex items-center gap-3 p-[0.65rem] rounded-[10px] text-text-mid text-[0.85rem] font-medium hover:bg-gold-pale hover:text-gold transition-all">
                  <i className="fas fa-user-gear text-gold w-[18px]"></i> Admin Panel
                </Link>
                <Link to="/server" className="flex items-center gap-3 p-[0.65rem] rounded-[10px] text-text-mid text-[0.85rem] font-medium hover:bg-gold-pale hover:text-gold transition-all">
                  <i className="fas fa-concierge-bell text-gold w-[18px]"></i> Server View
                </Link>
                <Link to="/delivery" className="flex items-center gap-3 p-[0.65rem] rounded-[10px] text-text-mid text-[0.85rem] font-medium hover:bg-gold-pale hover:text-gold transition-all">
                  <i className="fas fa-motorcycle text-gold w-[18px]"></i> Delivery Port
                </Link>
                <Link to="/chef" className="flex items-center gap-3 p-[0.65rem] rounded-[10px] text-text-mid text-[0.85rem] font-medium hover:bg-gold-pale hover:text-gold transition-all">
                  <i className="fas fa-utensils text-gold w-[18px]"></i> Chef Dashboard
                </Link>
              </div>
            </div>
            <Link to="/register" className="hidden lg:inline-flex items-center gap-[0.4rem] px-[1.3rem] py-[0.55rem] rounded-[50px] bg-gold text-white text-[0.83rem] font-medium shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown hover:-translate-y-[1px] transition-all">
              Register
            </Link>
          </div>
        </>
      ) : (
        <Link to="/" className="flex items-center gap-2 text-[0.85rem] text-text-mid no-underline font-medium">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
