import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brown-dark text-[rgba(255,255,255,0.6)] px-[5%] py-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
        <div className="flex flex-col">
          <a href="/" className="font-['Cormorant_Garamond'] text-[1.7rem] font-bold text-white no-underline mb-4">
            Saha<span className="text-gold">Serve</span>
          </a>
          <p className="text-[0.85rem] leading-[1.7] max-w-[240px]">
            Bringing the warmth of Moroccan hospitality to your table since
            2010. Every meal is a celebration.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="w-[38px] h-[38px] rounded-full border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.5)] flex items-center justify-center no-underline text-[0.9rem] transition-all hover:border-gold hover:text-gold hover:bg-[rgba(200,146,42,0.1)]">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="w-[38px] h-[38px] rounded-full border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.5)] flex items-center justify-center no-underline text-[0.9rem] transition-all hover:border-gold hover:text-gold hover:bg-[rgba(200,146,42,0.1)]">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="w-[38px] h-[38px] rounded-full border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.5)] flex items-center justify-center no-underline text-[0.9rem] transition-all hover:border-gold hover:text-gold hover:bg-[rgba(200,146,42,0.1)]">
              <i className="fab fa-tiktok"></i>
            </a>
            <a href="#" className="w-[38px] h-[38px] rounded-full border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.5)] flex items-center justify-center no-underline text-[0.9rem] transition-all hover:border-gold hover:text-gold hover:bg-[rgba(200,146,42,0.1)]">
              <i className="fab fa-tripadvisor"></i>
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="text-white text-[0.85rem] font-semibold tracking-[0.08em] uppercase mb-5">Explore</h4>
          <ul className="list-none flex flex-col gap-[0.65rem]">
            <li><a href="/menu" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Menu</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Reservations</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Events</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Gift Cards</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-[0.85rem] font-semibold tracking-[0.08em] uppercase mb-5">Company</h4>
          <ul className="list-none flex flex-col gap-[0.65rem]">
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">About Us</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Careers</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Press</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Blog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-[0.85rem] font-semibold tracking-[0.08em] uppercase mb-5">Support</h4>
          <ul className="list-none flex flex-col gap-[0.65rem]">
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">FAQ</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Contact</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Privacy Policy</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">Terms</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] pt-7 flex flex-wrap justify-between items-center gap-4">
        <p className="text-[0.82rem]">© 2026 <span className="text-gold">SahaServe</span>. All rights reserved.</p>
        <p className="text-[0.82rem]">Crafted with <span className="text-gold">♥</span> in Morocco</p>
      </div>
    </footer>
  );
};

export default Footer;
