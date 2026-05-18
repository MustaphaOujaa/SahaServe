import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Enter a password to check strength', color: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

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
      'Very Weak',
      'Weak — add uppercase, numbers & symbols',
      'Fair — getting better!',
      'Good — almost there',
      'Strong — great password ✓'
    ];
    const colors = ['', '#e74c3c', '#e67e22', '#c8922a', '#27ae60'];
    
    setPasswordStrength({
      score,
      label: pw ? msgs[score] : 'Enter a password to check strength',
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

  const goStep2 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      triggerShake();
      return;
    }
    setStep(2);
    setCountdown(60);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const submitForm = () => {
    const otpString = formData.otp.join('');
    if (otpString.length < 6 || !formData.password || formData.password !== formData.confirmPassword) {
      triggerShake();
      return;
    }
    setIsSuccess(true);
  };

  const resendOTP = () => {
    setFormData((prev) => ({ ...prev, otp: ['', '', '', '', '', ''] }));
    setCountdown(60);
    otpRefs.current[0].focus();
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
            ✦ Join Us · Morocco
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-[2.6rem] font-bold leading-[1.15] text-white mb-4">
            Welcome to<br /><em className="text-gold-light italic not-italic">SahaServe</em>
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.9rem] leading-[1.75] mb-8">
            Create your account and unlock a world of authentic Moroccan
            flavours, exclusive reservations, and personalised dining
            experiences.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "calendar-check", text: "Priority table reservations" },
              { icon: "tag", text: "Exclusive member offers & discounts" },
              { icon: "robot", text: "Access to our AI menu assistant" },
              { icon: "star", text: "Earn loyalty points on every visit" },
              { icon: "bell", text: "Early access to seasonal menus" }
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-3 text-[rgba(255,255,255,0.75)] text-[0.85rem]">
                <i className={`fas fa-${perk.icon} text-gold w-4 text-[0.8rem]`}></i> {perk.text}
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.1)] font-['Cormorant_Garamond'] italic text-[rgba(255,255,255,0.45)] text-[0.9rem] leading-[1.6]">
            "Food is the ingredient that binds us together." — Moroccan Proverb
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
                  <div className={`text-[0.72rem] font-medium tracking-[0.05em] uppercase transition-colors ${step === 1 ? 'text-gold' : step > 1 ? 'text-brown-dark' : 'text-text-mid'}`}>Your Info</div>
                </div>
                <div className={`flex-1 h-[2px] -mt-5 transition-colors ${step > 1 ? 'bg-gold' : 'bg-beige'}`}></div>
                <div className={`flex flex-col items-center gap-[0.4rem] flex-1 ${step === 2 ? 'active' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.85rem] font-bold border-2 transition-all ${step === 2 ? 'bg-gold border-gold text-white shadow-[0_4px_16px_rgba(200,146,42,0.4)]' : 'border-beige bg-white text-text-mid'}`}>
                    2
                  </div>
                  <div className={`text-[0.72rem] font-medium tracking-[0.05em] uppercase transition-colors ${step === 2 ? 'text-gold' : 'text-text-mid'}`}>Verify & Secure</div>
                </div>
              </div>

              {step === 1 ? (
                <div className="animate-[slideIn_0.4s_ease_both]">
                  <div className="mb-8">
                    <span className="inline-block mb-1 text-[0.75rem] tracking-[0.18em] uppercase text-gold font-medium">✦ Step 1 of 2</span>
                    <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-bold text-brown-dark leading-[1.2] mb-1">Tell us about <em className="text-gold italic not-italic">yourself</em></h2>
                    <div className="w-9 h-[3px] bg-gold rounded-[2px] my-3"></div>
                    <p className="text-[0.87rem] text-text-mid leading-[1.6]">Fill in your details below. This takes less than a minute.</p>
                  </div>

                  <div className="flex flex-col gap-[1.1rem]">
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">Full Name <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-user absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="text" id="inp-name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Youssef El Fassi" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">Email Address <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-envelope absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="email" id="inp-email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">Phone Number <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-phone absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="tel" id="inp-phone" value={formData.phone} onChange={handleInputChange} placeholder="+212 6XX XXX XXX" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">Address <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-map-marker-alt absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type="text" id="inp-address" value={formData.address} onChange={handleInputChange} placeholder="Street, City, Morocco" className="w-full pl-11 pr-4 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-[0.9rem]">
                    <button className="w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,146,42,0.45)] transition-all flex items-center justify-center gap-2" onClick={goStep2}>
                      Continue <i className="fas fa-arrow-right text-[0.8rem]"></i>
                    </button>
                  </div>

                  <div className="text-center mt-7 text-[0.82rem] text-text-mid">
                    Already have an account? <Link to="/login" className="text-gold font-medium hover:underline">Sign in</Link>
                    <div className="mt-2 text-[0.75rem]">By continuing you agree to our <a href="#" className="text-gold hover:underline">Terms</a> & <a href="#" className="text-gold hover:underline">Privacy Policy</a></div>
                  </div>
                </div>
              ) : (
                <div className="animate-[slideIn_0.4s_ease_both]">
                  <div className="mb-8">
                    <span className="inline-block mb-1 text-[0.75rem] tracking-[0.18em] uppercase text-gold font-medium">✦ Step 2 of 2</span>
                    <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-bold text-brown-dark leading-[1.2] mb-1">Verify & <em className="text-gold italic not-italic">Secure</em></h2>
                    <div className="w-9 h-[3px] bg-gold rounded-[2px] my-3"></div>
                    <p className="text-[0.87rem] text-text-mid leading-[1.6]">Enter the OTP sent to your phone and set a strong password.</p>
                  </div>

                  <div className="flex flex-col gap-[1.1rem]">
                    <div className="bg-gold-pale border border-[rgba(200,146,42,0.3)] rounded-xl p-3 flex items-start gap-[0.65rem] mb-2">
                      <i className="fas fa-shield-alt text-gold text-[0.85rem] mt-[0.1rem]"></i>
                      <p className="text-[0.8rem] text-brown-mid leading-[1.55]">A 6-digit code has been sent to <strong className="text-brown-dark">{formData.phone}</strong>. Please enter it below to verify your identity.</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide uppercase text-center block mb-2 opacity-60">One-Time Password (OTP) <span className="text-gold">*</span></label>
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
                        Didn't receive it? <span className="text-gold font-medium underline cursor-pointer" onClick={resendOTP}>Resend OTP</span> {countdown > 0 && `(${countdown}s)`}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">Password <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-lock absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type={showPassword ? "text" : "password"} id="inp-pw" value={formData.password} onChange={handleInputChange} placeholder="Min. 8 characters" className="w-full pl-11 pr-11 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
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
                      <label className="text-[0.8rem] font-medium text-brown-mid tracking-wide">Confirm Password <span className="text-gold">*</span></label>
                      <div className="relative flex items-center">
                        <i className="fas fa-lock absolute left-4 text-gold text-[0.85rem]"></i>
                        <input type={showConfirmPassword ? "text" : "password"} id="inp-pw2" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat your password" className="w-full pl-11 pr-11 py-3 border-[1.5px] border-beige rounded-xl outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all" />
                        <button type="button" className="absolute right-4 text-text-mid hover:text-gold transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className={`text-[0.75rem] mt-1 ${formData.password === formData.confirmPassword ? 'text-[#27ae60]' : 'text-[#e74c3c]'}`}>
                          {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-[0.9rem]">
                    <button className="w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,146,42,0.45)] transition-all flex items-center justify-center gap-2" onClick={submitForm}>
                      <i className="fas fa-check-circle text-[0.9rem]"></i> Create My Account
                    </button>
                    <button className="w-full py-[0.95rem] px-6 rounded-[50px] bg-transparent border-[1.5px] border-beige text-text-mid text-[0.95rem] font-semibold hover:border-gold hover:text-gold hover:bg-gold-pale transition-all flex items-center justify-center gap-2" onClick={() => setStep(1)}>
                      <i className="fas fa-arrow-left text-[0.8rem]"></i> Back to Step 1
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
              <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-bold text-brown-dark mb-2">Welcome aboard!</h2>
              <p className="text-[0.9rem] text-text-mid leading-[1.65] max-w-[320px]">
                Your SahaServe account has been created. Get ready for an authentic Moroccan dining experience.
              </p>
              <div className="mt-8 w-full max-w-[280px]">
                <Link to="/" className="w-full py-[0.95rem] px-6 rounded-[50px] bg-gold text-white text-[0.95rem] font-semibold shadow-[0_6px_22px_rgba(200,146,42,0.4)] hover:bg-brown hover:-translate-y-[2px] transition-all flex items-center justify-center gap-2 no-underline">
                  <i className="fas fa-utensils text-[0.85rem]"></i> Explore the Menu
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
