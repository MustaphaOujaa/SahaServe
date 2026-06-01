import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ButtonSpinner } from '../UI/Loading';
import { useGetFavoritesQuery, useGetCartQuery } from '../../redux/api/apiSlice';
import { changeLanguage, languages } from '../../i18n';
import logoImg from '../../assets/logo.png';

const FlagIcon = ({ language, className = '' }) => (
  <img
    src={`https://flagcdn.com/w40/${language.flagCode}.png`}
    srcSet={`https://flagcdn.com/w40/${language.flagCode}.png 1x, https://flagcdn.com/w80/${language.flagCode}.png 2x`}
    alt={`${language.name} flag`}
    className={`lang-flag ${className}`}
    loading="lazy"
  />
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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

  const getAvatarUrl = () => {
    if (!user) return null;
    if (user.image && user.image !== 'null' && user.image !== '') {
      return user.image.startsWith('http')
        ? user.image
        : `http://localhost:8000/storage/${user.image}`;
    }
    if (user.avatar && user.avatar !== 'null' && user.avatar !== '') {
      return user.avatar;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  const isAdmin = user?.roles?.some((role) => role.name === 'admin') || false;
  const isChef = user?.roles?.some((role) => role.name === 'chef') || false;
  const isDelivery = user?.roles?.some((role) => role.name === 'delivery') || false;
  const isServer = user?.roles?.some((role) => role.name === 'server') || false;
  const isClient = !isAdmin && !isChef && !isDelivery && !isServer;

  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token && user;

  const { data: favoritesData = [] } = useGetFavoritesQuery(undefined, { skip: !isLoggedIn || !isClient });
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isLoggedIn || !isClient });

  const favCount = favoritesData?.length || 0;
  const cartCount = cartData?.items?.length || 0;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const handleLanguageChange = (lng) => {
    changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  const getDashboardLabel = () => {
    if (isAdmin) return t('nav.adminDashboard');
    if (isChef) return t('nav.chefDashboard');
    if (isDelivery) return t('nav.deliveryDashboard');
    if (isServer) return t('nav.waiterDashboard');
    return t('nav.clientProfile');
  };

  const getDashboardIcon = () => {
    if (isAdmin) return 'fa-chart-line';
    if (isChef) return 'fa-utensils';
    if (isDelivery) return 'fa-truck';
    if (isServer) return 'fa-concierge-bell';
    return 'fa-user-circle';
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[5%] transition-all duration-300 ${
      isAuthPage
        ? 'bg-transparent h-[72px] border-none shadow-none backdrop-blur-none'
        : scrolled
          ? 'bg-white h-16 shadow-custom-md px-[4%]'
          : 'bg-[rgba(250,245,236,0.96)] h-[72px] backdrop-blur-[18px] border-b border-[rgba(200,146,42,0.15)] shadow-custom'
    }`}>
      <Link to="/" className="flex items-center gap-3.5 no-underline">
        <img
          src={logoImg}
          alt="SahaServe Logo"
          className="h-11 w-11 object-cover rounded-full border border-gold/20 shadow-sm bg-white p-0.5"
        />
        <span className={`font-['Cormorant_Garamond'] text-[1.75rem] font-bold transition-colors duration-300 ${isAuthPage ? 'text-white' : 'text-brown-dark'}`}>
          Saha<span className="text-gold">Serve</span>
        </span>
      </Link>

      {!isAuthPage ? (
        <>
          <ul className="hidden md:flex gap-8 list-none">
            <li><Link to="/" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">{t('nav.home')}</Link></li>
            <li><Link to="/menu" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">{t('nav.menu')}</Link></li>
            {user && isClient && (
              <li><Link to="/reservation" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">{t('nav.reservation')}</Link></li>
            )}
            <li><Link to="/about" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">{t('nav.about')}</Link></li>
            <li><Link to="/contact" className="text-[0.84rem] font-medium tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors">{t('nav.contact')}</Link></li>
          </ul>
          <div className="flex gap-[0.7rem] items-center">
            <div className="lang-switcher">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="lang-switcher-btn"
              >
                <FlagIcon language={currentLang} />
                <i className="fas fa-chevron-down text-[0.6rem]"></i>
              </button>
              {langDropdownOpen && (
                <div className="lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                    >
                      <FlagIcon language={lang} />
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && isClient && (
              <div className="hidden md:flex gap-[0.7rem]">

                <Link to="/favourites" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold text-[0.95rem] hover:bg-gold hover:text-white transition-all">
                  <i className="fas fa-heart"></i>
                  <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brown-dark text-white text-[0.62rem] font-bold flex items-center justify-center">{favCount}</span>
                </Link>
                <Link to="/cart" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold text-[0.95rem] hover:bg-gold hover:text-white transition-all">
                  <i className="fas fa-shopping-bag"></i>
                  <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brown-dark text-white text-[0.62rem] font-bold flex items-center justify-center">{cartCount}</span>
                </Link>
              </div>
            )}

            {user ? (
              <div className="relative group">
                <button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="h-10 px-3 rounded-[50px] bg-gold-pale flex items-center gap-2 text-gold text-[0.85rem] font-medium hover:bg-gold hover:text-white transition-all border border-[rgba(200,146,42,0.15)]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      className="w-6 h-6 rounded-full object-cover border border-gold"
                      alt="User avatar"
                    />
                  ) : (
                    <i className="fas fa-user-circle text-[1.1rem]"></i>
                  )}
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name}</span>
                  <i className="fas fa-chevron-down text-[0.5rem] opacity-70"></i>
                </button>
                <div className={`absolute top-[100%] right-0 w-[200px] bg-white rounded-custom-sm shadow-custom-lg border border-[rgba(200,146,42,0.1)] p-3 flex flex-col gap-1 transition-all duration-300 z-[1001] mt-[10px] ${accountMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-[10px]'}`}>
                  <Link to={isAdmin ? "/admin-dashboard" : isChef ? "/chef-dashboard" : isDelivery ? "/delivery-dashboard" : isServer ? "/server-dashboard" : "/profile"} className="flex items-center gap-3 p-[0.65rem] rounded-[10px] text-text-mid text-[0.85rem] font-medium hover:bg-gold-pale hover:text-gold transition-all">
                    <i className={`fas ${getDashboardIcon()} text-gold w-[18px]`}></i> {getDashboardLabel()}
                  </Link>
                  <div className="h-[1px] bg-[rgba(200,146,42,0.1)] my-[0.4rem]"></div>
                  <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 p-[0.65rem] rounded-[10px] text-[rgba(231,76,60,0.9)] text-[0.85rem] font-medium hover:bg-[rgba(231,76,60,0.08)] hover:text-[#c0392b] transition-all text-left border-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-70">
                    {isLoggingOut ? <ButtonSpinner /> : <i className="fas fa-sign-out-alt w-[18px]"></i>} {isLoggingOut ? t('nav.signingOut') : t('nav.signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-[0.84rem] font-semibold tracking-[0.05em] uppercase text-text-mid no-underline hover:text-gold transition-colors mr-3">
                  {t('nav.signIn')}
                </Link>
                <Link to="/register" className="hidden lg:inline-flex items-center gap-[0.4rem] px-[1.3rem] py-[0.55rem] rounded-[50px] bg-gold text-white text-[0.83rem] font-medium shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown hover:-translate-y-[1px] transition-all">
                  {t('nav.register')}
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gold/15 text-gold bg-gold-pale hover:bg-gold hover:text-white transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle Menu"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-base`}></i>
            </button>
          </div>
        </>
      ) : (
        <Link to="/" className="flex items-center gap-2 text-[0.85rem] text-white no-underline font-medium hover:text-gold-light transition-colors">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      )}

      {!isAuthPage && mobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 right-0 bg-[rgba(250,245,236,0.98)] backdrop-blur-[24px] border-b border-gold/20 shadow-custom-lg p-6 flex flex-col gap-4 z-[999] animate-[fadeUp_0.25s_ease_both]">
          <div className="flex flex-wrap gap-2 mb-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.75rem] font-semibold transition-all ${
                  i18n.language === lang.code
                    ? 'bg-gold text-white'
                    : 'bg-gold-pale text-gold hover:bg-gold hover:text-white'
                }`}
              >
                <FlagIcon language={lang} />
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>

          {user && isClient && (
            <div className="flex gap-2 mb-4">

              <Link to="/favourites" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all">
                <i className="fas fa-heart"></i>
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brown-dark text-white text-[0.62rem] font-bold flex items-center justify-center">{favCount}</span>
              </Link>
              <Link to="/cart" className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all">
                <i className="fas fa-shopping-bag"></i>
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brown-dark text-white text-[0.62rem] font-bold flex items-center justify-center">{cartCount}</span>
              </Link>
            </div>
          )}
          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            <li>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[0.95rem] font-semibold text-brown-dark no-underline hover:text-gold border-b border-gold/5 transition-all"
              >
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[0.95rem] font-semibold text-brown-dark no-underline hover:text-gold border-b border-gold/5 transition-all"
              >
                {t('nav.menu')}
              </Link>
            </li>
            {user && isClient && (
              <li>
                <Link
                  to="/reservation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-[0.95rem] font-semibold text-brown-dark no-underline hover:text-gold border-b border-gold/5 transition-all"
                >
                  {t('nav.reservation')}
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[0.95rem] font-semibold text-brown-dark no-underline hover:text-gold border-b border-gold/5 transition-all"
              >
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[0.95rem] font-semibold text-brown-dark no-underline hover:text-gold border-b border-gold/5 transition-all"
              >
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
          {!user && (
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-center items-center gap-[0.4rem] w-full py-3 rounded-[50px] bg-gold text-white text-[0.9rem] font-semibold shadow-md hover:bg-brown transition-all mt-2"
            >
              {t('nav.register')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
