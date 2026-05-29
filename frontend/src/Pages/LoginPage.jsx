import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [shake, setShake] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const { login, loginWithToken, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const getPostLoginPath = (user) => {
    if (user?.roles?.some((role) => role.name === 'admin')) return '/admin-dashboard';
    if (user?.roles?.some((role) => role.name === 'chef')) return '/chef-dashboard';
    return '/';
  };

  React.useEffect(() => {
    // Check if token exists in URL query string (for Google OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      const handleTokenLogin = async () => {
        setIsLoading(true);
        const result = await loginWithToken(tokenParam);
        setIsLoading(false);
        if (result.success) {
          setIsSuccess(true);
          setTimeout(() => {
            navigate(getPostLoginPath(result.user), { replace: true });
          }, 1500);
        } else {
          setError(result.error || t('errors.googleFailed'));
          triggerShake();
        }
      };
      handleTokenLogin();
    }
  }, [navigate, loginWithToken, t]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id === 'inp-email' ? 'email' : id === 'inp-pw' ? 'password' : 'rememberMe']: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError(t('errors.loginRequired'));
      triggerShake();
      return;
    }
    
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, formData.rememberMe);
    setIsLoading(false);
    
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate(getPostLoginPath(result.user), { replace: true });
      }, 1500);
    } else {
      setError(result.error || t('errors.invalidCredentials'));
      triggerShake();
    }
  };

  const handleGoogleLogin = () => {
    // Redirect user to google auth page on laravel backend
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error(t('errors.emailRequired') || 'Please enter your email address');
      return;
    }
    setIsForgotLoading(true);
    const result = await forgotPassword(forgotEmail);
    setIsForgotLoading(false);
    if (result.success) {
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden md:flex relative overflow-hidden bg-brown-dark flex-col justify-end p-12 min-h-screen">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(160deg,rgba(26,15,0,0.25)_0%,rgba(26,15,0,0.88)_100%),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85')] bg-center bg-cover no-repeat"></div>
        <div className="absolute inset-0 z-1 bg-[radial-gradient(ellipse_at_70%_25%,rgba(200,146,42,0.2)_0%,transparent_55%)]"></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.22)_0%,transparent_70%)] z-1 w-[320px] h-[320px] -top-[60px] -left-[80px]"></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.22)_0%,transparent_70%)] z-1 w-[200px] h-[200px] bottom-[30%] -right-[40px]"></div>
        
        <div className="relative z-[2]">
          <span className="inline-block mb-[1.2rem] px-4 py-[0.3rem] rounded-[50px] border border-[rgba(200,146,42,0.5)] text-gold-light text-[0.75rem] tracking-[0.18em] uppercase">
            {t('auth.welcomeBack')}
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-[2.6rem] font-bold leading-[1.15] text-white mb-4">
            {t('auth.goodToSee')}<br /><em className="text-gold-light italic not-italic">{t('auth.youAgain')}</em>
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.9rem] leading-[1.75] mb-8">
            {t('auth.loginSub')}
          </p>

          <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(200,146,42,0.2)] rounded-2xl p-[1.3rem_1.4rem] mb-6">
            <div className="text-gold text-[0.8rem] mb-[0.6rem]">★★★★★</div>
            <p className="font-['Cormorant_Garamond'] italic text-[1rem] text-[rgba(255,255,255,0.8)] leading-[1.65] mb-[0.9rem]">
              "{t('auth.testimonialText') || "Signing in took seconds — and my favourite table was reserved before I even arrived. Pure magic."}"
            </p>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/80?img=12" className="w-9 h-9 rounded-full object-cover border-2 border-gold" alt="Avatar" />
              <div>
                <div className="text-[0.82rem] font-semibold text-white">Karim Bennani</div>
                <div className="text-[0.72rem] text-[rgba(255,255,255,0.455)]">Casablanca, Morocco</div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 mt-6 pt-5 border-t border-[rgba(255,255,255,0.1)]">
            <div className="text-center">
              <span className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-gold-light block">12k+</span>
              <span className="text-[0.72rem] text-[rgba(255,255,255,0.45)] uppercase tracking-widest">{t('about.happyGuests')}</span>
            </div>
            <div className="text-center">
              <span className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-gold-light block">4.9/5</span>
              <span className="text-[0.72rem] text-[rgba(255,255,255,0.45)] uppercase tracking-widest">{t('about.avgRating')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex flex-col items-center justify-center p-6 md:p-16 bg-cream relative pt-36 overflow-hidden">
        {/* Arabesque watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none user-select-none z-0">
          <span className="text-gold opacity-[0.04] text-[28rem] font-serif leading-none">✦</span>
        </div>

        <div className={`w-full max-w-[420px] relative z-[1] ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
          {!isSuccess ? (
            <>
              <div className="mb-9">
                <span className="inline-block mb-1 text-[0.75rem] tracking-[0.18em] uppercase text-gold font-medium">{t('auth.secureAccess')}</span>
                <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-bold text-brown-dark leading-[1.2] mb-1">{t('auth.signInTo')} <em className="text-gold italic not-italic">SahaServe</em></h2>
                <div className="w-9 h-[3px] bg-gold rounded-[2px] my-3"></div>
                <p className="text-[0.87rem] text-text-mid leading-[1.6]">{t('auth.enterCredentials')}</p>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <button type="button" onClick={handleGoogleLogin} className="w-full py-3 px-5 border-[1.5px] border-beige rounded-xl bg-white flex items-center justify-center gap-3 text-[0.88rem] font-medium text-text-dark hover:border-gold hover:bg-gold-pale transition-all">
                  <i className="fab fa-google text-[#db4437]"></i> {t('auth.continueWithGoogle')}
                </button>
                <button type="button" className="w-full py-3 px-5 border-[1.5px] border-beige rounded-xl bg-white flex items-center justify-center gap-3 text-[0.88rem] font-medium text-text-dark hover:border-gold hover:bg-gold-pale transition-all opacity-60 cursor-not-allowed">
                  <i className="fab fa-facebook-f text-[#1877f2]"></i> {t('auth.continueWithFacebook')}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-[1px] bg-beige"></div>
                <span className="text-[0.75rem] uppercase tracking-widest text-text-mid">{t('auth.orWithEmail')}</span>
                <div className="flex-1 h-[1px] bg-beige"></div>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-[1.1rem]">
                {error && (
                  <div className="flex items-center gap-2 bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.2)] rounded-xl p-[0.65rem_0.9rem] text-[0.82rem] text-[#c0392b] animate-[fadeUp_0.3s_ease]">
                    <i className="fas fa-exclamation-circle text-[0.8rem] shrink-0"></i> {error}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('auth.emailAddress')}</label>
                  <div className="relative flex items-center">
                    <i className="fas fa-envelope absolute left-4 text-gold text-[0.85rem]"></i>
                    <input type="email" id="inp-email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide flex justify-between">
                    {t('auth.password')}
                    <a href="#" className="text-[0.75rem] text-gold font-medium hover:underline" onClick={(e) => { e.preventDefault(); setIsForgotModalOpen(true); }}>{t('auth.forgotPassword')}</a>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fas fa-lock absolute left-4 text-gold text-[0.85rem]"></i>
                    <input type={showPassword ? "text" : "password"} id="inp-pw" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full pl-11 pr-11 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                    <button type="button" className="absolute right-4 text-text-mid hover:text-gold transition-colors" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-[0.55rem] cursor-pointer group">
                    <input type="checkbox" id="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="hidden" />
                    <div className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-beige flex items-center justify-center transition-all ${formData.rememberMe ? 'bg-gold border-gold' : 'bg-white'}`}>
                      {formData.rememberMe && <span className="text-white text-[0.7rem] font-bold">✓</span>}
                    </div>
                    <span className="text-[0.82rem] text-text-mid group-hover:text-gold transition-colors">{t('auth.remember30Days')}</span>
                  </label>
                </div>

                <button type="submit" disabled={isLoading} className={`w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,146,42,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}>
                  {isLoading ? (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-[rgba(255,255,255,0.3)] border-t-white animate-spin"></div>
                  ) : (
                    <>{t('auth.signIn')} <i className="fas fa-arrow-right text-[0.8rem]"></i></>
                  )}
                </button>
              </form>

              <div className="text-center mt-7 text-[0.83rem] text-text-mid leading-[1.7]">
                {t('auth.noAccount')} <Link to="/register" className="text-gold font-bold hover:underline">{t('auth.createAccount')}</Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4 animate-[fadeUp_0.5s_ease_both]">
              <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,#c8922a,#a0721e)] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(200,146,42,0.4)] animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_both]">
                <i className="fas fa-check text-2xl text-white"></i>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-bold text-brown-dark mb-2">{t('auth.welcomeTitle')}</h2>
              <p className="text-[0.9rem] text-text-mid leading-[1.65] max-w-[300px]">
                {t('auth.successLogin')}
              </p>
              <Link to="/" className="w-full max-w-[280px] py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] transition-all flex items-center justify-center gap-2 no-underline mt-7">
                <i className="fas fa-home text-[0.85rem]"></i> {t('nav.home')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-[rgba(26,15,0,0.55)] backdrop-blur-[6px] flex items-center justify-center animate-[fadeOverlay_0.25s_ease]">
          <form onSubmit={handleForgotPasswordSubmit} className="bg-white rounded-[24px] p-10 w-full max-w-[400px] mx-4 shadow-custom-lg animate-[slideModal_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_both] relative">
            <button type="button" className="absolute top-[1.2rem] right-[1.2rem] w-8 h-8 rounded-full bg-cream text-text-mid flex items-center justify-center text-[0.85rem] hover:bg-gold-pale hover:text-gold transition-all" onClick={() => setIsForgotModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gold-pale text-gold flex items-center justify-center text-[1.3rem] mb-[1.2rem]">
              <i className="fas fa-key"></i>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-brown-dark mb-[0.4rem]">{t('auth.forgotPassword')}</h3>
            <p className="text-[0.85rem] text-text-mid leading-[1.65] mb-[1.5rem]">{t('auth.forgotPasswordDesc') || "No worries! Enter your email address and we'll send you a verification code to reset your password."}</p>
            <div className="flex flex-col gap-1 mb-[1.2rem]">
              <label className="text-[0.8rem] font-medium text-brown-mid mb-1">{t('auth.emailAddress')}</label>
              <div className="relative flex items-center">
                <i className="fas fa-envelope absolute left-4 text-gold text-[0.85rem]"></i>
                <input required type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
              </div>
            </div>
            <button type="submit" disabled={isForgotLoading} className="w-full py-[0.85rem] rounded-[50px] bg-gold text-white font-semibold text-[0.9rem] shadow-[0_4px_16px_rgba(200,146,42,0.35)] hover:bg-brown hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2">
              {isForgotLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[rgba(255,255,255,0.3)] border-t-white animate-spin"></div>
              ) : (
                t('auth.sendVerification') || 'Send Verification Code'
              )}
            </button>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-7px); }
          40%, 80% { transform: translateX(7px); }
        }
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideModal {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: none; }
        }
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default LoginPage;
