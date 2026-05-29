import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-brown-dark text-[rgba(255,255,255,0.6)] px-[5%] py-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
        <div className="flex flex-col">
          <Link to="/" className="font-['Cormorant_Garamond'] text-[1.7rem] font-bold text-white no-underline mb-4">
            Saha<span className="text-gold">Serve</span>
          </Link>
          <p className="text-[0.85rem] leading-[1.7] max-w-[240px]">
            {t('footer.description')}
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
          <h4 className="text-white text-[0.85rem] font-semibold tracking-[0.08em] uppercase mb-5">{t('footer.explore')}</h4>
          <ul className="list-none flex flex-col gap-[0.65rem]">
            <li><Link to="/menu" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('nav.menu')}</Link></li>
            <li><Link to="/reservation" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('nav.reservations')}</Link></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('footer.events')}</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('footer.giftCards')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-[0.85rem] font-semibold tracking-[0.08em] uppercase mb-5">{t('footer.company')}</h4>
          <ul className="list-none flex flex-col gap-[0.65rem]">
            <li><Link to="/about" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('nav.about')}</Link></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('footer.careers')}</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('footer.press')}</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('footer.blog')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-[0.85rem] font-semibold tracking-[0.08em] uppercase mb-5">{t('footer.support')}</h4>
          <ul className="list-none flex flex-col gap-[0.65rem]">
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('footer.faq')}</a></li>
            <li><Link to="/contact" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('nav.contact')}</Link></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('auth.privacy')}</a></li>
            <li><a href="#" className="text-[rgba(255,255,255,0.5)] no-underline text-[0.85rem] transition-colors hover:text-gold">{t('auth.terms')}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] pt-7 flex flex-wrap justify-between items-center gap-4">
        <p className="text-[0.82rem]">© 2026 <span className="text-gold">SahaServe</span>. {t('footer.allRightsReserved')}</p>
        <p className="text-[0.82rem]">{t('footer.craftedWith', { heart: '♥' })}</p>
      </div>
    </footer>
  );
};

export default Footer;
