import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    otp: ['', '', '', '', '', '']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: t('auth.strengthPlaceholder') || 'Enter a password to check strength', color: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { sendOtp, register } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      'inp-name': 'name',
      'inp-email': 'email',
      'inp-phone': 'phone',
      'inp-address': 'address',
      'inp-pw': 'password',
      'inp-pw2': 'confirmPassword'
    };
    setFormData((prev) => ({ ...prev, [fieldMap[id]]: value }));

    if (id === 'inp-pw') {
      checkStrength(value);
    }
  };

  const checkStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const msgs = [
      t('auth.strengthVeryWeak') || 'Very Weak',
      t('auth.strengthWeak') || 'Weak — add uppercase, numbers & symbols',
      t('auth.strengthFair') || 'Fair — getting better!',
      t('auth.strengthGood') || 'Good — almost there',
      t('auth.strengthStrong') || 'Strong — great password ✓'
    ];
    const colors = ['', '#e74c3c', '#e67e22', '#c8922a', '#27ae60'];
    
    setPasswordStrength({
      score,
      label: pw ? msgs[score] : (t('auth.strengthPlaceholder') || 'Enter a password to check strength'),
      color: colors[score]
    });
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      const newOtp = [...formData.otp];
      newOtp[index] = value;
      setFormData((prev) => ({ ...prev, otp: newOtp }));
      if (index < 5) otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
      const newOtp = [...formData.otp];
      newOtp[index - 1] = '';
      setFormData((prev) => ({ ...prev, otp: newOtp }));
    }
  };

  const goStep2 = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error(t('errors.allFieldsRequired') || 'Please fill in all required fields.');
      triggerShake();
      return;
    }

    if (formData.name.length < 3) {
      toast.error(t('errors.nameMinLength') || 'Name must be at least 3 characters.');
      triggerShake();
      return;
    }

    // Phone number digit validation (digits:10)
    const normalizedPhone = formData.phone.replace(/\D/g, '');
    if (normalizedPhone.length !== 10) {
      toast.error(t('errors.phoneInvalid') || 'Phone number must be exactly 10 digits.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    const result = await sendOtp({
      ...formData,
      phone: normalizedPhone
    });
    setIsLoading(false);

    if (result.success) {
      setStep(2);
      setCountdown(60);
    } else {
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const submitForm = async () => {
    const otpString = formData.otp.join('');
    if (otpString.length < 6) {
      toast.error(t('errors.otpRequired') || 'Please enter the full 6-digit OTP code.');
      triggerShake();
      return;
    }

    if (!formData.password) {
      toast.error(t('errors.passwordRequired') || 'Please enter a password.');
      triggerShake();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors.passwordMismatch'));
      triggerShake();
      return;
    }

    setIsLoading(true);
    const normalizedPhone = formData.phone.replace(/\D/g, '');
    const result = await register({
      ...formData,
      phone: normalizedPhone
    }, otpString);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      triggerShake();
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    setFormData((prev) => ({ ...prev, otp: ['', '', '', '', '', ''] }));
    setIsLoading(true);
    const normalizedPhone = formData.phone.replace(/\D/g, '');
    const result = await sendOtp({
      ...formData,
      phone: normalizedPhone
    });
    setIsLoading(false);
    
    if (result.success) {
      setCountdown(60);
      otpRefs.current[0].focus();
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden md:flex relative overflow-hidden bg-brown-dark flex-col justify-end p-12 min-h-screen">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(26,15,0,0.3)_0%,rgba(26,15,0,0.85)_100%),url('https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=1200&q=85')] bg-center bg-cover no-repeat"></div>
        <div className="absolute inset-0 z-1 bg-[radial-gradient(ellipse_at_30%_20%,rgba(200,146,42,0.22)_0%,transparent_55%)]"></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.25)_0%,transparent_70%)] z-1 w-[380px] h-[380px] -top-20 -right-[100px]"></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.25)_0%,transparent_70%)] z-1 w-[220px] h-[220px] top-[40%] -left-[60px]"></div>
        <div className="relative z-[2]">
          <span className="inline-block mb-[1.2rem] px-4 py-[0.3rem] rounded-[50px] border border-[rgba(200,146,42,0.5)] text-gold-light text-[0.75rem] tracking-[0.18em] uppercase">
            {t('auth.joinUsTag')}
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-[2.6rem] font-bold leading-[1.15] text-white mb-4">
            {t('auth.culinaryJourney')}<br /><em className="text-gold-light italic not-italic">{t('auth.journeyTitle')}</em>
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.9rem] leading-[1.75] mb-8">
            {t('auth.registerSub')}
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "calendar-check", text: t('auth.perk1') || "Priority table reservations" },
              { icon: "tag", text: t('auth.perk2') || "Exclusive member offers & discounts" },
              { icon: "robot", text: t('auth.perk3') || "Access to our AI menu assistant" },
              { icon: "star", text: t('auth.perk4') || "Earn loyalty points on every visit" },
              { icon: "bell", text: t('auth.perk5') || "Early access to seasonal menus" }
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-3 text-[rgba(255,255,255,0.75)] text-[0.85rem]">
                <i className={`fas fa-${perk.icon} text-gold w-4 text-[0.8rem]`}></i> {perk.text}
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.1)] font-['Cormorant_Garamond'] italic text-[rgba(255,255,255,0.45)] text-[0.9rem] leading-[1.6]">
            "{t('auth.proverb') || "Food is the ingredient that binds us together."}" — {t('auth.proverbOrigin') || "Moroccan Proverb"}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex flex-col items-center justify-center p-6 md:p-16 bg-cream relative pt-36">
        <div className={`w-full max-w-[440px] ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
          {!isSuccess ? (
            <>
              {/* STEPPER */}
              <div className="flex items-center mb-10">
                <div className={`flex flex-col items-center gap-[0.4rem] flex-1 ${step >= 1 ? 'active' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.85rem] font-bold border-2 transition-all ${step > 1 ? 'bg-brown-dark border-brown-dark text-gold' : step === 1 ? 'bg-gold border-gold text-white shadow-[0_4px_16px_rgba(200,146,42,0.4)]' : 'border-beige bg-white text-text-mid'}`}>
                    {step > 1 ? <i className="fas fa-check text-[0.75rem]"></i> : '1'}
                  </div>
                  <div className={`text-[0.72rem] font-medium tracking-[0.05em] uppercase transition-colors ${step === 1 ? 'text-gold' : step > 1 ? 'text-brown-dark' : 'text-text-mid'}`}>{t('auth.step1Label') || 'Your Info'}</div>
                </div>
                <div className={`flex-1 h-[2px] -mt-5 transition-colors ${step > 1 ? 'bg-gold' : 'bg-beige'}`}></div>
                <div className={`flex flex-col items-center gap-[0.4rem] flex-1 ${step === 2 ? 'active' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.85rem] font-bold border-2 transition-all ${step === 2 ? 'bg-gold border-gold text-white shadow-[0_4px_16px_rgba(200,146,42,0.4)]' : 'border-beige bg-white text-text-mid'}`}>
                    2
                  </div>
                  <div className={`text-[0.72rem] font-medium tracking-[0.05em] uppercase transition-colors ${step === 2 ? 'text-gold' : 'text-text-mid'}`}>{t('auth.step2Label') || 'Verify & Secure'}</div>
                </div>
              </div>

              {step === 1 ? (
                <div className="animate-[slideIn_0.4s_ease_both]">
                  <div className="mb-8">
                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src={logoImg}
                        alt="SahaServe Logo"
                        className="h-16 w-16 object-cover rounded-full border border-gold/20 shadow-md bg-white p-0.5 animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_both]"
                      />
                      <div>
                        <span className="block mb-0.5 text-[0.75rem] tracking-[0.18em] uppercase text-gold font-semibold">✦ {t('auth.stepCounter') || 'Step 1 of 2'}</span>
                        <h2 className="font-['Cormorant_Garamond'] text-[1.9rem] font-bold text-brown-dark leading-[1.2]">{t('auth.aboutYouTitle1') || 'Tell us about'} <em className="text-gold italic not-italic">{t('auth.aboutYouTitle2') || 'yourself'}</em></h2>
                      </div>
                    </div>
                    <div className="w-9 h-[3px] bg-gold rounded-[2px] my-3"></div>
                    <p className="text-[0.87rem] text-text-mid leading-[1.6]">{t('auth.step1Desc') || 'Fill in your details below. This takes less than a minute.'}</p>
                  </div>

                  <div className="flex flex-col gap-[1.1rem]">
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('auth.fullName')} <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-user absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="text" id="inp-name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Youssef El Fassi" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('auth.emailAddress')} <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-envelope absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="email" id="inp-email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('contact.phoneLabel')} <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-phone absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="tel" id="inp-phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. 0612345678" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('common.address')} <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-map-marker-alt absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="text" id="inp-address" value={formData.address} onChange={handleInputChange} placeholder="Street, City, Morocco" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-[0.9rem]">
                    <button disabled={isLoading} className="w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,146,42,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-80" onClick={goStep2}>
                      {isLoading ? (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[rgba(255,255,255,0.3)] border-t-white animate-spin"></div>
                      ) : (
                        <>{t('common.next')} <i className="fas fa-arrow-right text-[0.8rem]"></i></>
                      )}
                    </button>
                  </div>

                  <div className="text-center mt-7 text-[0.82rem] text-text-mid">
                    {t('auth.hasAccount')} <Link to="/login" className="text-gold font-medium hover:underline">{t('auth.signIn')}</Link>
                    <div className="mt-2 text-[0.75rem]">{t('auth.agreeTermsPrefix') || 'By continuing you agree to our'} <a href="#" className="text-gold hover:underline">{t('auth.terms') || 'Terms'}</a> & <a href="#" className="text-gold hover:underline">{t('auth.privacy') || 'Privacy Policy'}</a></div>
                  </div>
                </div>
              ) : (
                <div className="animate-[slideIn_0.4s_ease_both]">
                  <div className="mb-8">
                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src={logoImg}
                        alt="SahaServe Logo"
                        className="h-16 w-16 object-cover rounded-full border border-gold/20 shadow-md bg-white p-0.5 animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_both]"
                      />
                      <div>
                        <span className="block mb-0.5 text-[0.75rem] tracking-[0.18em] uppercase text-gold font-semibold">✦ {t('auth.stepCounter2') || 'Step 2 of 2'}</span>
                        <h2 className="font-['Cormorant_Garamond'] text-[1.9rem] font-bold text-brown-dark leading-[1.2]">{t('auth.verifyTitle1') || 'Verify &'} <em className="text-gold italic not-italic">{t('auth.verifyTitle2') || 'Secure'}</em></h2>
                      </div>
                    </div>
                    <div className="w-9 h-[3px] bg-gold rounded-[2px] my-3"></div>
                    <p className="text-[0.87rem] text-text-mid leading-[1.6]">{t('auth.verifyDesc') || 'Enter the OTP sent to your email and set a strong password.'}</p>
                  </div>

                  <div className="flex flex-col gap-[1.1rem]">
                    <div className="bg-gold-pale border border-[rgba(200,146,42,0.3)] rounded-xl p-3 flex items-start gap-[0.65rem] mb-2">
                      <i className="fas fa-shield-alt text-gold text-[0.85rem] mt-[0.1rem]"></i>
                      <p className="text-[0.8rem] text-brown-mid leading-[1.55]">{t('auth.otpSentTo') || 'A 6-digit code has been sent to'} <strong className="text-brown-dark">{formData.email}</strong>. {t('auth.otpEnterCode') || 'Please enter it below to verify your identity.'}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide uppercase text-center block mb-2 opacity-60">{t('auth.otpLabel') || 'One-Time Password (OTP)'} <span className="text-gold">*</span></label>
                      <div className="flex justify-center gap-[0.6rem]">
                        {formData.otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => (otpRefs.current[i] = el)}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e, i)}
                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                            className={`w-[52px] h-[56px] border-[1.5px] border-beige rounded-xl bg-white text-center font-['Cormorant_Garamond'] text-[1.5rem] font-bold text-brown-dark outline-none transition-all focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] ${digit ? 'border-gold bg-gold-pale' : ''}`}
                            inputMode="numeric"
                          />
                        ))}
                      </div>
                      <div className="text-center text-[0.78rem] text-text-mid mt-2">
                        {t('auth.noOtp') || "Didn't receive it?"} <span className="text-gold font-medium underline cursor-pointer" onClick={resendOTP}>{t('auth.resendOtp') || 'Resend OTP'}</span> {countdown > 0 ? `(${countdown}s)` : ''}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('auth.password')} <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-lock absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type={showPassword ? "text" : "password"} id="inp-pw" value={formData.password} onChange={handleInputChange} placeholder="Min. 6 characters" className="w-full pl-11 pr-11 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                        <button type="button" className="absolute right-4 text-text-mid hover:text-gold transition-colors" onClick={() => setShowPassword(!showPassword)}>
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="h-1 bg-beige rounded-full overflow-hidden mb-1">
                          <div className="h-full transition-all duration-400" style={{ width: `${passwordStrength.score * 25}%`, backgroundColor: passwordStrength.color }}></div>
                        </div>
                        <div className="text-[0.72rem] transition-colors" style={{ color: passwordStrength.color }}>{passwordStrength.label}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">{t('auth.confirmPassword')} <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-lock absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type={showConfirmPassword ? "text" : "password"} id="inp-pw2" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat your password" className="w-full pl-11 pr-11 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                        <button type="button" className="absolute right-4 text-text-mid hover:text-gold transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className={`text-[0.75rem] mt-1 ${formData.password === formData.confirmPassword ? 'text-[#27ae60]' : 'text-[#e74c3c]'}`}>
                          {formData.password === formData.confirmPassword ? `✓ ${t('auth.pwMatch') || 'Passwords match'}` : `✗ ${t('auth.pwNoMatch') || 'Passwords do not match'}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-[0.9rem]">
                    <button disabled={isLoading} className="w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,146,42,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-80" onClick={submitForm}>
                      {isLoading ? (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[rgba(255,255,255,0.3)] border-t-white animate-spin"></div>
                      ) : (
                        <><i className="fas fa-check-circle text-[0.9rem]"></i> {t('auth.createAccount')}</>
                      )}
                    </button>
                    <button type="button" className="w-full py-[0.95rem] px-6 rounded-[50px] bg-transparent border-[1.5px] border-beige text-text-mid text-[0.95rem] font-semibold hover:border-gold hover:text-gold hover:bg-gold-pale transition-all flex items-center justify-center gap-2" onClick={() => setStep(1)}>
                      <i className="fas fa-arrow-left text-[0.8rem]"></i> {t('auth.backStep1') || 'Back to Step 1'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4 animate-[slideIn_0.4s_ease_both]">
              <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,#c8922a,#a0721e)] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(200,146,42,0.4)] animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_both]">
                <i className="fas fa-check text-2xl text-white"></i>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-bold text-brown-dark mb-2">{t('auth.accountCreated')}</h2>
              <p className="text-[0.9rem] text-text-mid leading-[1.65] max-w-[320px]">
                {t('auth.successRegister')}
              </p>
              <div className="mt-8 w-full max-w-[280px]">
                <Link to="/" className="w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] transition-all flex items-center justify-center gap-2 no-underline">
                  <i className="fas fa-utensils text-[0.85rem]"></i> {t('home.viewMenu')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default RegisterPage;
