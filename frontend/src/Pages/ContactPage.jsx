import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[45vh] min-h-[350px] flex items-center justify-center text-center bg-[linear-gradient(rgba(26,15,0,0.65),rgba(26,15,0,0.65)),url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=1600&q=80')] bg-center bg-cover no-repeat">
        <div className="animate-[fadeUp_0.8s_ease_both] px-6">
          <p className="text-gold-light text-[0.9rem] tracking-[0.2em] uppercase mb-4">{t('contact.hearFromYou')}</p>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(2.5rem,7vw,4.5rem)] text-white font-bold leading-tight">
            {t('contact.contactTitle1')} <em className="text-gold-light italic not-italic">{t('contact.contactTitle2')}</em>
          </h1>
        </div>
      </section>

      <section className="py-24 px-[5%] max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* ─── CONTACT INFO ─── */}
          <div className="lg:col-span-5 space-y-10 animate-[fadeUp_0.8s_ease_both]">
            <div>
              <span className="text-gold uppercase font-semibold text-[0.85rem] tracking-[0.15em] mb-4 block">{t('contact.findUs')}</span>
              <h2 className="font-['Cormorant_Garamond'] text-[2.4rem] text-brown-dark font-bold leading-tight mb-8">
                {t('contact.contactTitle1')} <em className="text-gold italic not-italic">{t('contact.contactTitle2')}</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
              {[
                { 
                  icon: "fa-location-dot", 
                  title: t('contact.locationTitle'), 
                  content: "123 Spice Route Avenue, Marrakech, Morocco",
                  link: "#"
                },
                { 
                  icon: "fa-phone", 
                  title: t('contact.callTitle'), 
                  content: "+212 522-123456",
                  link: "tel:+212522123456"
                },
                { 
                  icon: "fa-envelope", 
                  title: t('contact.emailTitle'), 
                  content: "hello@sahaserve.com",
                  link: "mailto:hello@sahaserve.com"
                },
                { 
                  icon: "fa-clock", 
                  title: t('contact.openingTitle'), 
                  content: "Mon - Sun: 11:00 AM - 11:00 PM",
                  link: null
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 p-6 rounded-[20px] bg-white shadow-sm border border-beige/50 transition-all hover:shadow-md">
                  <div className="w-12 h-12 rounded-full bg-gold-pale text-gold flex items-center justify-center text-[1.2rem] shrink-0">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-brown-dark text-[1rem] mb-1">{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} className="text-text-mid text-[0.92rem] hover:text-gold transition-colors">{item.content}</a>
                    ) : (
                      <p className="text-text-mid text-[0.92rem]">{item.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── CONTACT FORM ─── */}
          <div className="lg:col-span-7 animate-[fadeUp_0.8s_0.2s_ease_both]">
            <div className="bg-white p-10 md:p-12 rounded-[32px] shadow-custom-lg border border-beige/30">
              <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] text-brown-dark font-bold mb-8">
                {t('contact.messageTitle1')} <em className="text-gold italic not-italic">{t('contact.messageTitle2')}</em>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[0.85rem] font-bold text-brown-dark ml-2">{t('contact.firstName')}</label>
                    <input 
                      type="text" 
                      name="firstName"
                      required
                      placeholder={t('contact.placeholderFirstName')}
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-full border border-beige bg-cream/30 focus:border-gold focus:bg-white outline-none transition-all text-[0.95rem]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.85rem] font-bold text-brown-dark ml-2">{t('contact.lastName')}</label>
                    <input 
                      type="text" 
                      name="lastName"
                      required
                      placeholder={t('contact.placeholderLastName')}
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-full border border-beige bg-cream/30 focus:border-gold focus:bg-white outline-none transition-all text-[0.95rem]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[0.85rem] font-bold text-brown-dark ml-2">{t('contact.emailLabel')}</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder={t('contact.placeholderEmail')}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-full border border-beige bg-cream/30 focus:border-gold focus:bg-white outline-none transition-all text-[0.95rem]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.85rem] font-bold text-brown-dark ml-2">{t('contact.phoneLabel')}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder={t('contact.placeholderPhone')}
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-full border border-beige bg-cream/30 focus:border-gold focus:bg-white outline-none transition-all text-[0.95rem]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.85rem] font-bold text-brown-dark ml-2">{t('contact.subject')}</label>
                  <div className="relative">
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-full border border-beige bg-cream/30 focus:border-gold focus:bg-white outline-none transition-all text-[0.95rem] appearance-none cursor-pointer"
                    >
                      <option value="general">{t('contact.subjectGeneral')}</option>
                      <option value="reservation">{t('contact.subjectReservation')}</option>
                      <option value="event">{t('contact.subjectEvent')}</option>
                      <option value="feedback">{t('contact.subjectFeedback')}</option>
                      <option value="careers">{t('contact.subjectCareers')}</option>
                    </select>
                    <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-gold pointer-events-none"></i>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.85rem] font-bold text-brown-dark ml-2">{t('contact.message')}</label>
                  <textarea 
                    name="message"
                    required
                    rows="5"
                    placeholder={t('contact.placeholderMessage')}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-6 py-5 rounded-[24px] border border-beige bg-cream/30 focus:border-gold focus:bg-white outline-none transition-all text-[0.95rem] resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submitted}
                  className={`w-full py-5 rounded-full font-bold text-[1rem] tracking-widest uppercase transition-all shadow-lg ${submitted ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-gold text-white hover:bg-brown-dark hover:-translate-y-1 shadow-gold-200'}`}
                >
                  {submitted ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-check-circle"></i> {t('contact.messageSent')}
                    </span>
                  ) : t('contact.sendMessage')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAP SECTION ─── */}
      <section className="h-[450px] w-full grayscale hover:grayscale-0 transition-all duration-700">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108703.4093844616!2d-8.077893962630594!3d31.634602280456633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8d96116267%3A0xad32159173516333!2sMarrakesh!5e0!3m2!1sen!2sma!4v1716912345678!5m2!1sen!2sma" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="SahaServe Location"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactPage;
