import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-[linear-gradient(rgba(26,15,0,0.6),rgba(26,15,0,0.6)),url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1800&q=80')] bg-center bg-cover no-repeat">
        <div className="animate-[fadeUp_0.8s_ease_both]">
          <p className="text-white/90 text-[1.1rem] tracking-[0.15em] uppercase mb-4">Since 2010</p>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(3rem,8vw,5rem)] text-white font-bold leading-tight">
            Our <em className="text-gold italic not-italic">Story</em>
          </h1>
        </div>
      </section>

      {/* ─── HISTORY SECTION ─── */}
      <section className="py-24 px-[5%] max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-[fadeUp_0.8s_ease_both]">
            <span className="text-gold uppercase font-semibold text-[0.85rem] tracking-[0.15em] mb-4 block">Tradition & Passion</span>
            <h2 className="font-['Cormorant_Garamond'] text-[2.8rem] text-brown-dark leading-tight mb-6">
              The heart of <em className="text-gold italic not-italic">Moroccan</em> hospitality
            </h2>
            <p className="text-text-mid text-[1.05rem] leading-relaxed mb-6">
              SahaServe was born from a simple dream: to share the rich, vibrant flavors of Morocco with the world. Our journey started in a small kitchen in Marrakech, where secrets of spices and slow-cooking were passed down through generations.
            </p>
            <p className="text-text-mid text-[1.05rem] leading-relaxed mb-10">
              Today, we bring that same authentic experience to your table. Every dish we serve is a tribute to our heritage, prepared with the finest local ingredients and a deep respect for traditional techniques.
            </p>
            <Link to="/menu" className="btn btn-gold">Explore Our Menu</Link>
          </div>
          <div className="relative rounded-[24px] overflow-hidden shadow-custom-lg animate-[fadeUp_0.8s_0.2s_ease_both] group">
            <img 
              src="https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80" 
              alt="Traditional Cooking" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-brown-dark py-16 px-[5%]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "15+", label: "Years of Excellence" },
            { num: "24", label: "Master Chefs" },
            { num: "12k", label: "Happy Guests" },
            { num: "4.9", label: "Average Rating" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="font-['Cormorant_Garamond'] text-[3rem] text-gold font-bold">{stat.num}</span>
              <span className="text-white/60 text-[0.85rem] uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── VALUES SECTION ─── */}
      <section className="py-24 px-[5%] max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-gold uppercase font-semibold text-[0.85rem] tracking-[0.15em] mb-4 block">Our Philosophy</span>
          <h2 className="font-['Cormorant_Garamond'] text-[2.8rem] text-brown-dark leading-tight">
            What <em className="text-gold italic not-italic">defines</em> us
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: "fa-leaf", 
              title: "Pure Ingredients", 
              desc: "We source only the freshest, most authentic ingredients directly from local Moroccan farmers and producers." 
            },
            { 
              icon: "fa-hand-holding-heart", 
              title: "Crafted with Love", 
              desc: "Cooking is an art and a language of love. Each tagine and couscous is prepared with patience and passion." 
            },
            { 
              icon: "fa-utensils", 
              title: "Authentic Taste", 
              desc: "We stay true to the original recipes that have made Moroccan cuisine world-renowned for centuries." 
            }
          ].map((value, i) => (
            <div key={i} className="bg-white p-10 rounded-[24px] shadow-custom text-center transition-all duration-300 hover:-translate-y-3 animate-[fadeUp_0.8s_ease_both]" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-[60px] h-[60px] bg-gold-pale text-gold rounded-full flex items-center justify-center text-[1.5rem] mx-auto mb-6">
                <i className={`fas ${value.icon}`}></i>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-brown-dark mb-4">{value.title}</h3>
              <p className="text-text-mid text-[0.95rem] leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="bg-gold-pale py-24 px-[5%] text-center animate-[fadeUp_0.8s_ease_both]">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-['Cormorant_Garamond'] text-[3rem] font-bold text-brown-dark mb-6">Ready to taste the tradition?</h2>
          <p className="text-text-mid text-[1.1rem] leading-relaxed mb-10">
            Join us for an unforgettable culinary journey through the heart of Morocco. Every seat at our table is an invitation to explore a thousand years of flavor.
          </p>
          <Link to="/menu" className="px-12 py-4 rounded-full bg-gold text-white font-bold text-[1rem] tracking-widest uppercase shadow-[0_6px_20px_rgba(200,146,42,0.4)] hover:bg-brown-dark hover:-translate-y-[2px] transition-all inline-block">
            Book a Table
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
