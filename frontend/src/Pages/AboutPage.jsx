import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-[linear-gradient(rgba(26,15,0,0.6),rgba(26,15,0,0.6)),url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1800&q=80')] bg-center bg-cover no-repeat">
        <div className="animate-[fadeUp_0.8s_ease_both]">
          <p className="text-white/90 text-[1.1rem] tracking-[0.15em] uppercase mb-4">{t('about.sinceTag')}</p>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(3rem,8vw,5rem)] text-white font-bold leading-tight">
            {t('about.storyTitle1')} <em className="text-gold italic not-italic">{t('about.storyTitle2')}</em>
          </h1>
        </div>
      </section>

      {/* ─── HISTORY SECTION ─── */}
      <section className="py-24 px-[5%] max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-[fadeUp_0.8s_ease_both]">
            <span className="text-gold uppercase font-semibold text-[0.85rem] tracking-[0.15em] mb-4 block">{t('about.traditionTag')}</span>
            <h2 className="font-['Cormorant_Garamond'] text-[2.8rem] text-brown-dark leading-tight mb-6">
              {t('about.hospitalityTitle1')} <em className="text-gold italic not-italic">{t('about.hospitalityTitle2')}</em> {t('about.hospitalityTitle3')}
            </h2>
            <p className="text-text-mid text-[1.05rem] leading-relaxed mb-6">
              {t('about.desc1')}
            </p>
            <p className="text-text-mid text-[1.05rem] leading-relaxed mb-10">
              {t('about.desc2')}
            </p>
            <Link to="/menu" className="btn btn-gold">{t('about.exploreMenu')}</Link>
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
            { num: "15+", label: t('about.yearsExcellence') },
            { num: "24", label: t('about.masterChefs') },
            { num: "12k", label: t('about.happyGuests') },
            { num: "4.9", label: t('about.avgRating') }
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
          <span className="text-gold uppercase font-semibold text-[0.85rem] tracking-[0.15em] mb-4 block">{t('about.philosophyTag')}</span>
          <h2 className="font-['Cormorant_Garamond'] text-[2.8rem] text-brown-dark leading-tight">
            {t('about.definesTitle1')} <em className="text-gold italic not-italic">{t('about.definesTitle2')}</em> {t('about.definesTitle3')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: "fa-leaf", 
              title: t('about.value1Title'), 
              desc: t('about.value1Desc') 
            },
            { 
              icon: "fa-hand-holding-heart", 
              title: t('about.value2Title'), 
              desc: t('about.value2Desc') 
            },
            { 
              icon: "fa-utensils", 
              title: t('about.value3Title'), 
              desc: t('about.value3Desc') 
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
          <h2 className="font-['Cormorant_Garamond'] text-[3rem] font-bold text-brown-dark mb-6">{t('about.readyTitle')}</h2>
          <p className="text-text-mid text-[1.1rem] leading-relaxed mb-10">
            {t('about.ctaDesc')}
          </p>
          <Link to="/menu" className="px-12 py-4 rounded-full bg-gold text-white font-bold text-[1rem] tracking-widest uppercase shadow-[0_6px_20px_rgba(200,146,42,0.4)] hover:bg-brown-dark hover:-translate-y-[2px] transition-all inline-block">
            {t('about.bookTable')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
