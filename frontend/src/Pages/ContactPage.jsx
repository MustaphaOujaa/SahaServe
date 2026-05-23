import React, { useState } from 'react';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(false);
      e.target.reset();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center text-center bg-[linear-gradient(rgba(26,15,0,0.6),rgba(26,15,0,0.6)),url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1800&q=80')] bg-center bg-cover no-repeat">
        <div className="animate-[fadeUp_0.8s_ease_both]">
          <p className="text-white/90 text-[1.1rem] tracking-[0.1em] uppercase mb-4">We'd Love to Hear From You</p>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(3rem,8vw,5rem)] text-white font-bold leading-tight">
            Contact <em className="text-gold italic not-italic">Us</em>
          </h1>
        </div>
      </section>

      {/* ─── CONTACT CONTENT ─── */}
      <div className="max-w-[1200px] mx-auto px-[5%] -mt-20 relative z-10 pb-24 animate-[fadeUp_0.8s_0.2s_ease_both]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          
          {/* Contact Form Card */}
          <div className="bg-white rounded-[24px] shadow-custom-lg p-8 md:p-14">
            <h2 className="font-['Cormorant_Garamond'] text-[2.5rem] font-bold text-brown-dark mb-10 leading-tight">
              Send us a <em className="text-gold italic not-italic">Message</em>
            </h2>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-text-mid uppercase tracking-wider">First Name</label>
                <input type="text" placeholder="e.g. Ahmed" className="px-5 py-4 rounded-[12px] border-[1.5px] border-beige bg-cream text-[1rem] outline-none focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10 transition-all" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-text-mid uppercase tracking-wider">Last Name</label>
                <input type="text" placeholder="e.g. Mansouri" className="px-5 py-4 rounded-[12px] border-[1.5px] border-beige bg-cream text-[1rem] outline-none focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10 transition-all" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-text-mid uppercase tracking-wider">Email Address</label>
                <input type="email" placeholder="ahmed@example.com" className="px-5 py-4 rounded-[12px] border-[1.5px] border-beige bg-cream text-[1rem] outline-none focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10 transition-all" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-text-mid uppercase tracking-wider">Phone Number</label>
                <input type="tel" placeholder="+212 6XX-XXXXXX" className="px-5 py-4 rounded-[12px] border-[1.5px] border-beige bg-cream text-[1rem] outline-none focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10 transition-all" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[0.85rem] font-bold text-text-mid uppercase tracking-wider">Subject</label>
                <select className="px-5 py-4 rounded-[12px] border-[1.5px] border-beige bg-cream text-[1rem] outline-none focus:border-gold focus:bg-white transition-all appearance-none cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Table Reservation</option>
                  <option>Event Booking</option>
                  <option>Feedback & Suggestions</option>
                  <option>Careers</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[0.85rem] font-bold text-text-mid uppercase tracking-wider">Your Message</label>
                <textarea rows="5" placeholder="How can we help you?" className="px-5 py-4 rounded-[12px] border-[1.5px] border-beige bg-cream text-[1rem] outline-none focus:border-gold focus:bg-white transition-all resize-none" required></textarea>
              </div>
              
              <div className="md:col-span-2">
                <button type="submit" className="px-12 py-4 rounded-full bg-gold text-white font-bold text-[1rem] tracking-widest uppercase shadow-[0_6px_20px_rgba(200,146,42,0.4)] hover:bg-brown-dark hover:-translate-y-[2px] transition-all disabled:bg-gray-400 disabled:translate-y-0" disabled={submitted}>
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="flex flex-col gap-8">
            <div className="bg-brown-dark text-white p-10 rounded-[24px] shadow-custom">
              <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] text-gold font-bold mb-8">Find Us</h3>
              <ul className="flex flex-col gap-8">
                {[
                  { icon: 'fa-location-dot', title: 'Our Location', content: '123 Rue de la Liberté, Quartier Gauthier, Casablanca, Morocco' },
                  { icon: 'fa-phone', title: 'Call Us', content: '+212 522-123456\n+212 612-345678' },
                  { icon: 'fa-envelope', title: 'Email Us', content: 'hello@sahaserve.com\nevents@sahaserve.com' },
                  { icon: 'fa-clock', title: 'Opening Hours', content: 'Mon - Thu: 12:00 PM - 10:00 PM\nFri - Sun: 12:00 PM - 11:30 PM' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-5 items-start">
                    <i className={`fas ${item.icon} text-gold text-[1.2rem] mt-1.5 w-5 text-center`}></i>
                    <div>
                      <strong className="block text-white mb-1 font-semibold">{item.title}</strong>
                      <p className="text-white/70 text-[0.95rem] leading-relaxed whitespace-pre-line">{item.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Google Maps Embed */}
            <div className="h-[350px] rounded-[24px] overflow-hidden shadow-custom">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.8463519391094!2d-7.640656923456!3d33.58334467333642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d2938361074d%3A0x6b2e1b12f2c27b0!2sQuartier%20Gauthier%2C%20Casablanca%2020250%2C%20Morocco!5e0!3m2!1sen!2sma!4v1715850000000!5m2!1sen!2sma" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="SahaServe Location"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
