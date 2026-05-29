import { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DishCard from '../Components/DishCard';
import { useGetDishesQuery, useGetFavoritesQuery } from '../redux/api/apiSlice';
import { normalizeDish } from '../utils/menuTransforms';

const HomePage = () => {
  const { t } = useTranslation();
  const sliderRef = useRef(null);
  const { data: dishesData = [], isLoading } = useGetDishesQuery();

  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;
  const { data: favoritesData = [] } = useGetFavoritesQuery(undefined, { skip: !isLoggedIn });

  const dishes = useMemo(() => {
    if (!dishesData.length) return [];
    return dishesData.map(normalizeDish).slice(0, 4);
  }, [dishesData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoading, dishes.length]);

  return (
    <main>
      {/* ─── HERO ─── */}
      <section id="hero" className="relative h-screen min-h-[680px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(26,15,0,0.45)_0%,rgba(26,15,0,0.75)_100%),url('https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=1800&q=90')] bg-center bg-cover bg-no-repeat after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_60%_40%,rgba(200,146,42,0.15)_0%,transparent_65%)]"></div>
        <div className="relative z-1 max-w-[720px] px-6 hero-content">
          <span className="inline-block mb-[1.2rem] px-[1.1rem] py-[0.35rem] rounded-[50px] border border-[rgba(200,146,42,0.5)] text-gold-light text-[0.8rem] tracking-[0.15em] uppercase animate-[fadeUp_0.8s_ease_forwards]">
            {t('home.heroTag')}
          </span>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(2.8rem,7vw,5.2rem)] font-bold leading-[1.08] text-white mb-[1.2rem] animate-[fadeUp_0.8s_0.15s_ease_both]">
            {t('home.heroTitle').split(' ').slice(0, -1).join(' ')}<br /><em className="text-gold-light italic not-italic">{t('home.heroTitle').split(' ').slice(-1)}</em>
          </h1>
          <p className="text-[1.05rem] text-[rgba(255,255,255,0.75)] max-w-[500px] mx-auto mb-[2.2rem] animate-[fadeUp_0.8s_0.3s_ease_both]">
            {t('home.heroSub')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-[fadeUp_0.8s_0.45s_ease_both]">
            <Link to="/menu" className="btn btn-gold">{t('home.viewMenu')}</Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[rgba(255,255,255,0.45)] text-[0.75rem] tracking-[0.1em] flex flex-col items-center gap-2 animate-[pulse_2s_infinite]">
          <span>{t('common.scroll')}</span>
          <i className="fas fa-chevron-down text-base"></i>
        </div>
      </section>

      {/* ─── DISHES ─── */}
      <section id="dishes" className="py-24 px-[5%] bg-white">
        <div className="text-center mb-12 fade-in">
          <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-gold font-medium">{t('home.specialtiesTag')}</span>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-brown-dark leading-[1.15] mb-2">
            {t('home.specialtiesTitle1')} <em className="text-gold italic not-italic">{t('home.specialtiesTitle2')}</em>
          </h2>
          <div className="w-12 h-[3px] bg-gold mx-auto my-4 rounded-[2px]"></div>
          <p className="text-text-mid max-w-[480px] mx-auto leading-[1.7] text-[0.95rem] mb-12">
            {t('home.specialtiesSub')}
          </p>
        </div>
        {isLoading ? (
          <div className="py-12 flex flex-col items-center text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-gold mb-4"></i>
            <p className="text-text-mid text-[0.9rem]">{t('home.loadingDishes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 fade-in">
            {dishes.map((dish, i) => (
              <DishCard 
                key={dish.id || i} 
                {...dish} 
                isFavourite={favoritesData.some(f => f.id === dish.id)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 px-[5%] bg-brown-dark overflow-hidden">
        <div className="fade-in mb-12">
          <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-gold font-medium">{t('home.reviewsTag')}</span>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-white leading-[1.15] mb-2">
            {t('home.reviewsTitle1')} <em className="text-gold italic not-italic">{t('home.reviewsTitle2')}</em> {t('home.reviewsTitle3')}
          </h2>
          <div className="w-12 h-[3px] bg-gold my-4 rounded-[2px]"></div>
          <p className="text-[rgba(255,255,255,0.55)] max-w-[480px] leading-[1.7] text-[0.95rem]">
            {t('home.reviewsSub')}
          </p>
        </div>
        
        <div className="relative fade-in">
          <div ref={sliderRef} className="overflow-x-auto scrollbar-none flex gap-6 scroll-smooth snap-x snap-mandatory" id="testiSlider">
            {[
              {
                stars: "★★★★★",
                text: '"An unforgettable journey through Moroccan flavours. The tagine was perfectly spiced — I felt transported to a Marrakech riad."',
                name: "Sofia Larsson",
                location: "Stockholm, Sweden",
                avatar: "https://i.pravatar.cc/80?img=47"
              },
              {
                stars: "★★★★★",
                text: '"The ambiance, the service, the food — all exceptional. The bastilla is unlike anything I\'ve had outside of Morocco. Truly extraordinary."',
                name: "James Whitmore",
                location: "London, UK",
                avatar: "https://i.pravatar.cc/80?img=33"
              },
              {
                stars: "★★★★☆",
                text: '"I used the AI assistant to pick my meal and it nailed my preferences perfectly. The couscous was generous and beautifully presented."',
                name: "Amara Diallo",
                location: "Paris, France",
                avatar: "https://i.pravatar.cc/80?img=5"
              }
            ].map((t, i) => (
              <div key={i} className="min-w-[85%] md:min-w-[calc(33.33%-1rem)] snap-start shrink-0 bg-[rgba(255,255,255,0.06)] border border-[rgba(200,146,42,0.2)] rounded-[20px] p-8 transition-colors hover:bg-[rgba(255,255,255,0.1)]">
                <div className="text-gold text-[0.95rem] mb-4 tracking-[0.1em]">{t.stars}</div>
                <p className="font-['Cormorant_Garamond'] italic text-[1.1rem] leading-[1.75] text-[rgba(255,255,255,0.85)] mb-6">
                  {t.text}
                </p>
                <div className="flex items-center gap-[0.9rem]">
                  <img src={t.avatar} className="w-11 h-11 rounded-full object-cover border-2 border-gold" alt={t.name} />
                  <div>
                    <div className="font-semibold text-white text-[0.9rem]">{t.name}</div>
                    <div className="text-[0.78rem] text-[rgba(255,255,255,0.45)]">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8 items-center">
            <button 
              onClick={() => sliderRef.current?.scrollBy({ left: -sliderRef.current.offsetWidth * 0.8, behavior: 'smooth' })}
              className="w-11 h-11 rounded-full border-[1.5px] border-[rgba(200,146,42,0.4)] bg-transparent text-gold cursor-pointer transition-all flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white"
            >
              <i className="fas fa-arrow-left text-base"></i>
            </button>
            <button 
              onClick={() => sliderRef.current?.scrollBy({ left: sliderRef.current.offsetWidth * 0.8, behavior: 'smooth' })}
              className="w-11 h-11 rounded-full border-[1.5px] border-[rgba(200,146,42,0.4)] bg-transparent text-gold cursor-pointer transition-all flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white"
            >
              <i className="fas fa-arrow-right text-base"></i>
            </button>
            <div className="flex gap-[0.4rem]">
              <div className="w-[6px] h-[6px] rounded-full bg-gold w-5 rounded-[3px]"></div>
              <div className="w-[6px] h-[6px] rounded-full bg-[rgba(255,255,255,0.25)]"></div>
              <div className="w-[6px] h-[6px] rounded-full bg-[rgba(255,255,255,0.25)]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 px-[5%] bg-cream">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative fade-in">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85"
              className="w-full rounded-[24px] object-cover h-[500px] shadow-custom-lg"
              alt="Restaurant interior"
            />
            <div className="absolute -bottom-6 -right-6 bg-gold text-white rounded-[16px] p-[1.2rem_1.5rem] text-center shadow-custom">
              <span className="font-['Cormorant_Garamond'] text-[2.2rem] font-bold block leading-none">15+</span>
              <span className="text-[0.75rem] uppercase tracking-[0.1em] opacity-85">{t('home.yearsOfTradition')}</span>
            </div>
          </div>
          <div className="fade-in">
            <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-gold font-medium">{t('home.storyTag')}</span>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-brown-dark leading-[1.15] mb-2">
              {t('home.storyTitle1')}<br />{t('home.storyTitle2')} <em className="text-gold italic not-italic">{t('home.storyTitle3')}</em>
            </h2>
            <div className="w-12 h-[3px] bg-gold my-4 rounded-[2px]"></div>
            <p className="text-text-mid leading-[1.75] mb-6 text-[0.95rem]">
              {t('home.storySub')}
            </p>
            <div className="flex flex-col gap-[1.1rem] my-8">
              {[
                { icon: "leaf", title: t('home.feature1Title'), desc: t('home.feature1Desc') },
                { icon: "mortar-pestle", title: t('home.feature2Title'), desc: t('home.feature2Desc') },
                { icon: "star", title: t('home.feature3Title'), desc: t('home.feature3Desc') }
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-gold-pale text-gold flex items-center justify-center text-[0.95rem] shrink-0">
                    <i className={`fas fa-${f.icon}`}></i>
                  </div>
                  <div>
                    <div className="font-semibold text-[0.9rem] text-brown-dark mb-[0.2rem]">{f.title}</div>
                    <div className="text-[0.83rem] text-text-mid leading-[1.6]">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn btn-gold">
              {t('common.learnMore')} <i className="fas fa-arrow-right text-[0.75rem]"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section id="gallery" className="py-24 px-[5%] bg-white pb-0 mb-8">
        <div className="text-center mb-12 fade-in">
          <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-gold font-medium">{t('home.galleryTag')}</span>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-brown-dark leading-[1.15] mb-2">
            {t('home.galleryTitle1')} <em className="text-gold italic not-italic">{t('home.galleryTitle2')}</em>
          </h2>
          <div className="w-12 h-[3px] bg-gold mx-auto my-4 rounded-[2px]"></div>
        </div>
        <div className="overflow-hidden relative fade-in">
          <div className="flex gap-4 animate-[galleryScroll_28s_linear_infinite] w-max hover:[animation-play-state:paused]">
            {[
              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=85",
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=85",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7GcKireqtZsvYX5Cg7Tn6XDOowmad2j2TFw&s",
              "https://images.immediate.co.uk/production/volatile/sites/30/2023/09/Chicken-pasta-bake-21aa719.jpg?quality=90&resize=708,643",
              "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=85",
              "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=85"
            ].concat([
              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=85",
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=85",
              "https://images.unsplash.com/photo-1476224203421-9ac39bcb3b28?w=500&q=85",
              "https://images.unsplash.com/photo-1544025162-d76594e8bb76?w=500&q=85",
              "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=85",
              "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=85"
            ]).map((src, i) => (
              <div key={i} className="w-[280px] h-[200px] rounded-[16px] overflow-hidden shrink-0 cursor-pointer">
                <img src={src} className="w-full h-full object-cover transition-all duration-500 brightness-90 hover:scale-105 hover:brightness-100" alt={`Gallery ${i}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SECTION ─── */}
      <section id="ai" className="py-24 px-[5%] bg-[linear-gradient(135deg,var(--brown-dark)_0%,#2a1200_100%)] relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,146,42,0.25)_0%,transparent_60%)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-1">
          <div className="fade-in">
            <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-gold-light font-medium">✦ Smart Feature</span>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-white leading-[1.15] mb-2">
              Not sure what<br />to <em className="text-gold italic not-italic">eat?</em>
            </h2>
            <div className="w-12 h-[3px] bg-gold my-4 rounded-[2px]"></div>
            <p className="text-[rgba(255,255,255,0.65)] leading-[1.75] mb-8 text-[0.95rem]">
              Our intelligent AI assistant learns your taste preferences and
              guides you to the perfect dish — every single time you visit.
            </p>
            <div className="flex flex-col gap-[0.9rem] mb-10">
              {[
                "Personalised meal recommendations",
                "Dietary & allergy-aware suggestions",
                "Instant answers about ingredients",
                "Available 24/7, even before you arrive"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-[rgba(255,255,255,0.8)] text-[0.9rem]">
                  <i className="fas fa-check-circle text-gold w-5"></i> {f}
                </div>
              ))}
            </div>
            <a href="#" className="btn btn-gold">
              Try Now <i className="fas fa-arrow-right text-[0.75rem]"></i>
            </a>
          </div>
          
          <div className="h-[360px] flex justify-center items-center relative fade-in">
            <div className="absolute w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.3)_0%,transparent_70%)] animate-[glowPulse_3s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-20 left-0 bg-[rgba(255,255,255,0.08)] border border-[rgba(200,146,42,0.25)] rounded-[16px_16px_16px_4px] p-[0.65rem_1rem] text-[rgba(255,255,255,0.7)] text-[0.8rem] max-w-[170px] backdrop-blur-[8px] animate-[bubbleIn_0.5s_1s_ease_both,bobble_3s_2s_ease-in-out_infinite]">
              <span>🍽️ "Try the Lamb Tagine — based on your preferences!"</span>
            </div>
            <div className="absolute top-[60px] right-0 bg-[rgba(255,255,255,0.08)] border border-[rgba(200,146,42,0.25)] rounded-[16px_16px_4px_16px] p-[0.65rem_1rem] text-[rgba(255,255,255,0.7)] text-[0.8rem] max-w-[170px] backdrop-blur-[8px] animate-[bubbleIn_0.5s_1.5s_ease_both,bobble_3s_2.5s_ease-in-out_infinite]">
              <span>👨‍🍳 "What are you in the mood for tonight?"</span>
            </div>
            <div className="relative z-1 animate-[robotFloat_4s_ease-in-out_infinite]">
              <div className="w-20 h-[65px] bg-[linear-gradient(160deg,#4a3318,#2a1800)] rounded-[16px] border-2 border-[rgba(200,146,42,0.5)] mx-auto -mb-2 relative shadow-[0_-8px_20px_rgba(200,146,42,0.15)]">
                <div className="absolute w-1 h-6 bg-[rgba(200,146,42,0.6)] top-[-24px] left-1/2 -translate-x-1/2 rounded-[2px] after:content-[''] after:absolute after:top-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-[10px] after:h-[10px] after:rounded-full after:bg-gold after:shadow-[0_0_10px_var(--gold)] after:animate-[antennaPulse_1.5s_ease-in-out_infinite]"></div>
                <div className="absolute top-[18px] left-[14px] w-4 h-4 rounded-full bg-gold shadow-[0_0_12px_var(--gold-light)] animate-[eyeBlink_4s_ease-in-out_infinite]"></div>
                <div className="absolute top-[18px] right-[14px] w-4 h-4 rounded-full bg-gold shadow-[0_0_12px_var(--gold-light)] animate-[eyeBlink_4s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-9 h-2 rounded-[0_0_10px_10px] border-2 border-gold border-top-none shadow-[0_4px_10px_rgba(200,146,42,0.4)]"></div>
              </div>
              <div className="w-[110px] h-[140px] bg-[linear-gradient(160deg,#3d2b10,#1a0f00)] rounded-[20px] border-2 border-[rgba(200,146,42,0.4)] relative mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(200,146,42,0.3)]">
                <div className="absolute left-[-22px] top-[10px] w-[18px] h-[55px] bg-[linear-gradient(160deg,#3d2b10,#2a1800)] rounded-full border border-[rgba(200,146,42,0.3)] origin-top animate-[armSwingL_4s_ease-in-out_infinite]"></div>
                <div className="absolute right-[-22px] top-[10px] w-[18px] h-[55px] bg-[linear-gradient(160deg,#3d2b10,#2a1800)] rounded-full border border-[rgba(200,146,42,0.3)] origin-top animate-[armSwingR_4s_ease-in-out_infinite]"></div>
                <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[55px] h-[35px] rounded-[10px] bg-[rgba(200,146,42,0.1)] border border-[rgba(200,146,42,0.3)] flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-[0.5rem] text-gold tracking-widest font-mono animate-[screenFlicker_2s_steps(1)_infinite]">AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-24 px-[5%] bg-cream">
        <div className="text-center mb-14 fade-in">
          <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-gold font-medium">✦ Find Us</span>
          <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-brown-dark leading-[1.15] mb-2">
            Come <em className="text-gold italic not-italic">Visit</em> Us
          </h2>
          <div className="w-12 h-[3px] bg-gold mx-auto my-4 rounded-[2px]"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start fade-in">
          <div className="flex flex-col gap-6">
            {[
              { icon: "map-marker-alt", title: "Address", content: "12 Rue des Épices, Médina Morocco" },
              { icon: "phone", title: "Phone", content: "+212 524 123 456\n+212 600 789 012" },
              { icon: "clock", title: "Opening Hours", content: "Mon – Thu: 12:00 – 22:30\nFri – Sun: 11:00 – 23:30" },
              { icon: "envelope", title: "Email", content: "hello@sahaserve.com\nreservations@sahaserve.com" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-[12px] bg-gold-pale text-gold flex items-center justify-center text-[0.95rem] shrink-0">
                  <i className={`fas fa-${item.icon}`}></i>
                </div>
                <div>
                  <h4 className="font-semibold text-[0.88rem] text-brown-dark mb-[0.2rem]">{item.title}</h4>
                  <p className="text-[0.85rem] text-text-mid leading-[1.6] whitespace-pre-line">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-80 bg-[linear-gradient(135deg,#e8d5b7,#d4b896)] rounded-[20px] overflow-hidden relative flex items-center justify-center shadow-custom">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/[-7.9811,31.6295,14]/700x320@2x?access_token=pk.placeholder')] bg-center bg-cover opacity-40"></div>
            <div className="relative z-1 text-center text-brown-dark">
              <i className="fas fa-map-marker-alt text-[2.5rem] text-gold block mb-2"></i>
              <span className="text-[0.9rem] font-semibold">SahaServe, Morocco</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section id="newsletter" className="py-20 px-[5%] bg-[linear-gradient(135deg,var(--gold)_0%,#a0721e_100%)] text-center">
        <span className="inline-block mb-2 text-[0.78rem] tracking-[0.18em] uppercase text-[rgba(255,255,255,0.7)] font-medium">✦ Stay Connected</span>
        <h2 className="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3rem)] font-bold text-white leading-[1.15] mb-2 fade-in">
          Get special offers<br />& <em className="text-[rgba(255,255,255,0.85)] italic not-italic">updates</em>
        </h2>
        <div className="w-12 h-[3px] bg-[rgba(255,255,255,0.4)] mx-auto my-4 rounded-[2px]"></div>
        <p className="text-[rgba(255,255,255,0.8)] max-w-[480px] mx-auto leading-[1.7] text-[0.95rem] mb-10 fade-in">
          Join our community and be the first to know about seasonal menus,
          exclusive events, and more.
        </p>
        <div className="flex gap-3 max-w-[480px] mx-auto fade-in">
          <input 
            type="email" 
            placeholder="Enter your email address..." 
            className="flex-1 px-[1.4rem] py-[0.85rem] rounded-[50px] border-none outline-none font-['DM_Sans'] text-[0.9rem] bg-[rgba(255,255,255,0.95)] text-brown-dark shadow-[0_4px_16px_rgba(0,0,0,0.15)] placeholder:text-[#a0876a]" 
          />
          <button className="px-[1.3rem] py-[0.55rem] rounded-[50px] bg-brown-dark text-white text-[0.83rem] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:bg-gold hover:-translate-y-[1px] transition-all">
            Subscribe
          </button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
