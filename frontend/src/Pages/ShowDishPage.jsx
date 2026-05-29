import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DishCard from '../Components/DishCard';
import { 
  useGetDishQuery, 
  useGetDishesQuery, 
  useAddToCartMutation, 
  useAddFavoriteMutation, 
  useRemoveFavoriteMutation, 
  useGetFavoritesQuery,
  useGetDishReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetProfileQuery
} from '../redux/api/apiSlice';
import { normalizeDish } from '../utils/menuTransforms';
import { toast } from 'react-hot-toast';

const ShowDishPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description | reviews
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const { data: backendDish, isLoading, isError } = useGetDishQuery(id);
  const { data: dishes = [] } = useGetDishesQuery();
  const dish = useMemo(() => backendDish ? normalizeDish(backendDish) : null, [backendDish]);
  const menuDishes = useMemo(() => dishes.map(normalizeDish), [dishes]);

  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;
  const { data: favoritesData = [] } = useGetFavoritesQuery(undefined, { skip: !isLoggedIn });
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isLoggedIn });
  const {
    data: reviewsResponse,
    isLoading: isReviewsLoading,
    isFetching: isReviewsFetching,
  } = useGetDishReviewsQuery({ dishId: id, perPage: 50 }, { skip: !id });
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addFavorite, { isLoading: isAddingFav }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemovingFav }] = useRemoveFavoriteMutation();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation();

  const isFav = dish ? favoritesData.some(f => f.id === dish.id) : false;
  const liveReviews = reviewsResponse?.reviews || [];
  const reviewSummary = reviewsResponse?.summary || {};
  const reviewCount = reviewSummary.count ?? liveReviews.length ?? dish?.reviews ?? 0;
  const averageRating = Number(reviewSummary.average_rating || dish?.rating || 0);
  const hasReviewed = isLoggedIn && profile ? liveReviews.some(review => review.user_id === profile.id) : false;

  const formatReviewDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  };

  const handleToggleFav = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return navigate('/login');
    try {
      if (isFav) {
        await removeFavorite(dish.id).unwrap();
        toast.success(t('dishes.removedFromFav'));
      } else {
        await addFavorite(dish.id).unwrap();
        toast.success(t('dishes.addedToFav'));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || t('common.error'));
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/login');
    try {
      await addToCart({ dish_id: dish.id, quantity: qty }).unwrap();
      toast.success(t('dishes.addedToCartSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || t('common.error'));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return navigate('/login');

    try {
      await createReview({
        dish_id: dish.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      }).unwrap();
      setReviewComment('');
      setReviewRating(5);
      toast.success(t('dishes.reviewAdded'));
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || t('common.error'));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId).unwrap();
      toast.success(t('dishes.reviewDeleted'));
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || t('common.error'));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setMainImageIndex(0);
  }, [id]);

  useEffect(() => {
    if (isError) {
      navigate('/menu');
    }
  }, [isError, navigate]);

  if (isLoading || !dish) {
    return (
      <div className="min-h-screen bg-cream pt-[72px]">
        <div className="py-20 flex flex-col items-center text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-gold mb-4"></i>
          <p className="text-text-mid text-[0.9rem]">{t('dishes.loading')}</p>
        </div>
      </div>
    );
  }

  const recommendations = menuDishes.filter(d => d.id !== dish.id && d.category === dish.category).slice(0, 4);
  if (recommendations.length < 4) {
    const more = menuDishes.filter(d => d.id !== dish.id && !recommendations.find(r => r.id === d.id)).slice(0, 4 - recommendations.length);
    recommendations.push(...more);
  }

  // Mock Reviews
  const mockReviews = [
    { id: 1, user: "Yassine B.", rating: 5, date: "May 18, 2026", text: "Absolutely fantastic! The flavors are incredibly authentic and the portion size is very generous." },
    { id: 2, user: "Sarah M.", rating: 4, date: "May 10, 2026", text: "Very tasty, reminded me of my grandmother's cooking. A bit too spicy for my taste but still great." },
    { id: 3, user: "Amine K.", rating: 5, date: "April 22, 2026", text: "Best I've ever had in Casablanca. Will definitely be ordering this again." }
  ];

  return (
    <div className="min-h-screen bg-cream pt-[72px]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.85rem] text-text-mid mb-8 font-medium">
          <Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
          <i className={`fas fa-chevron-${isRTL ? 'left' : 'right'} text-[0.6rem]`}></i>
          <Link to="/menu" className="hover:text-gold transition-colors">{t('nav.menu')}</Link>
          <i className={`fas fa-chevron-${isRTL ? 'left' : 'right'} text-[0.6rem]`}></i>
          <span className="text-gold font-bold">{dish.name}</span>
        </div>

        {/* Dish Hero */}
        <div className="bg-white rounded-[24px] shadow-custom p-6 md:p-10 flex flex-col md:flex-row gap-10 mb-12 animate-[fadeUp_0.4s_ease_both]">
          {/* Image & Thumbnails */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full relative rounded-[16px] overflow-hidden group">
              <img 
                src={dish.images?.[mainImageIndex] || dish.image} 
                alt={dish.name} 
                className="w-full h-full object-cover min-h-[300px] md:min-h-[400px] transition-transform duration-700 group-hover:scale-105" 
              />
              <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex flex-wrap gap-2`}>
                {dish.badges.map((b, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-[0.75rem] font-bold tracking-[0.05em] uppercase text-white shadow-md ${
                    b === "Chef's Pick" ? 'bg-gold' : 
                    b === "Vegan" ? 'bg-[#27ae60]' : 
                    b === "Spicy" ? 'bg-[#e74c3c]' : 
                    b === "Popular" ? 'bg-brown-dark text-gold-light' : 
                    b === "New" ? 'bg-[#9b59b6]' : 'bg-gold'
                  }`}>
                    {t(`dishes.badges.${b}`, b)}
                  </span>
                ))}
              </div>
              <button 
                onClick={handleToggleFav}
                disabled={isAddingFav || isRemovingFav}
                className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-colors cursor-pointer z-10 disabled:opacity-70 disabled:cursor-not-allowed ${isFav ? 'text-[#e74c3c] hover:text-[#c0392b]' : 'text-text-mid hover:text-[#e74c3c]'}`}
              >
                {isAddingFav || isRemovingFav ? (
                  <i className="fas fa-spinner fa-spin text-lg"></i>
                ) : isFav ? (
                  <i className="fas fa-trash-can text-lg"></i>
                ) : (
                  <i className="far fa-heart text-lg"></i>
                )}
              </button>
            </div>
            
            {/* Thumbnails */}
            {dish.images && dish.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {dish.images.slice(0, 5).map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-[12px] overflow-hidden border-2 transition-all cursor-pointer ${mainImageIndex === idx ? 'border-gold opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={img} alt={`${dish.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gold font-bold text-[0.9rem] uppercase tracking-wider">{dish.categoryName}</span>
            </div>
            
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] md:text-[3.5rem] font-bold text-brown-dark leading-tight mb-2">
              {dish.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-gold text-[1.1rem]">
                <i className="fas fa-star"></i>
                <span className="font-bold text-brown-dark">{averageRating || '0.0'}</span>
                <span className="text-text-mid text-[0.85rem] font-normal">({t('dishes.reviewsTab', { count: reviewCount })})</span>
              </div>
            </div>

            <p className="text-[1.05rem] text-text-mid leading-relaxed mb-8">
              {dish.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-cream rounded-[12px] p-4 flex flex-col items-center justify-center text-center gap-1">
                <i className="fas fa-clock text-gold text-xl mb-1"></i>
                <span className="text-[0.8rem] text-text-mid uppercase font-bold tracking-wider">{t('dishes.prepTime')}</span>
                <span className="text-[1.1rem] font-bold text-brown-dark">{dish.time}</span>
              </div>
              <div className="bg-cream rounded-[12px] p-4 flex flex-col items-center justify-center text-center gap-1">
                <i className="fas fa-weight-hanging text-gold text-xl mb-1"></i>
                <span className="text-[0.8rem] text-text-mid uppercase font-bold tracking-wider">{t('dishes.weight')}</span>
                <span className="text-[1.1rem] font-bold text-brown-dark">{dish.weight}</span>
              </div>
              <div className="bg-cream rounded-[12px] p-4 flex flex-col items-center justify-center text-center gap-1">
                <i className="fas fa-fire-alt text-gold text-xl mb-1"></i>
                <span className="text-[0.8rem] text-text-mid uppercase font-bold tracking-wider">{t('dishes.calories')}</span>
                <span className="text-[1.1rem] font-bold text-brown-dark">{dish.kcal} {t('dishes.kcal')}</span>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center gap-6 mt-auto">
              <span className="font-['Cormorant_Garamond'] text-[2.5rem] md:text-[3rem] font-bold text-gold leading-none whitespace-nowrap">
                {dish.price.toFixed(2)} DH
              </span>
              
              <div className={`flex flex-col sm:flex-row sm:items-center gap-4 ${isRTL ? 'xl:mr-auto' : 'xl:ml-auto'}`}>
                <div className="flex items-center bg-cream rounded-full p-1 border border-beige">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-full bg-white text-text-mid flex items-center justify-center hover:text-gold transition-colors shadow-sm cursor-pointer"
                  >
                    <i className="fas fa-minus text-[0.8rem]"></i>
                  </button>
                  <span className="w-12 text-center font-bold text-brown-dark text-[1.1rem]">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-full bg-white text-text-mid flex items-center justify-center hover:text-gold transition-colors shadow-sm cursor-pointer"
                  >
                    <i className="fas fa-plus text-[0.8rem]"></i>
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-full bg-gold px-7 text-white font-bold text-[0.95rem] leading-none shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <i className="fas fa-spinner fa-spin text-[0.95rem]"></i>
                  ) : (
                    <i className="fas fa-shopping-bag text-[0.95rem]"></i>
                  )}
                  <span>{isAddingToCart ? t('dishes.adding') : t('dishes.addToCart')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="bg-white rounded-[24px] shadow-custom p-6 md:p-10 mb-12 animate-[fadeUp_0.4s_0.1s_ease_both]">
          <div className="flex items-center gap-8 border-b border-beige mb-8">
            <button 
              onClick={() => setActiveTab('description')}
              className={`pb-4 text-[1.1rem] font-bold transition-colors relative cursor-pointer ${activeTab === 'description' ? 'text-gold' : 'text-text-mid hover:text-brown-dark'}`}
            >
              {t('dishes.detailedInfo')}
              {activeTab === 'description' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-[1.1rem] font-bold transition-colors relative cursor-pointer ${activeTab === 'reviews' ? 'text-gold' : 'text-text-mid hover:text-brown-dark'}`}
            >
              {t('dishes.reviewsTab', { count: reviewCount })}
              {activeTab === 'reviews' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full"></span>}
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="animate-[fadeUp_0.3s_ease_both]">
              <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-4">{t('dishes.about')}</h3>
              <p className="text-[1.05rem] text-text-mid leading-relaxed mb-6">
                {dish.description} {t('dishes.ingredientsList')}
              </p>
              <h4 className="font-bold text-brown-dark mb-2">{t('dishes.ingredients')}</h4>
              <ul className={`list-disc ${isRTL ? 'pr-5' : 'pl-5'} text-text-mid space-y-1`}>
                <li>Locally sourced primary ingredients</li>
                <li>Signature Moroccan spice blend (Ras el Hanout, Cumin, Saffron)</li>
                <li>Fresh herbs (Cilantro, Parsley, Mint)</li>
                <li>Premium Argan or Olive Oil</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-[fadeUp_0.3s_ease_both]">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark">{t('dishes.customerReviews')}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-gold text-[1.1rem]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={i < Math.round(averageRating) ? "fas fa-star" : "far fa-star"}></i>
                      ))}
                    </div>
                    <span className="font-bold text-brown-dark text-[1.1rem]">{t('dishes.outOf5', { rating: averageRating || '0.0' })}</span>
                  </div>
                </div>
                <form onSubmit={handleSubmitReview} className="w-full lg:max-w-[520px] bg-cream rounded-[16px] border border-beige p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <label htmlFor="review-rating" className="font-bold text-brown-dark text-[0.9rem]">{t('dishes.yourRating')}</label>
                    <select
                      id="review-rating"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      disabled={!isLoggedIn || hasReviewed || isSubmittingReview}
                      className="h-10 rounded-full border border-beige bg-white px-4 text-brown-dark font-semibold outline-none focus:border-gold"
                    >
                      {[5, 4, 3, 2, 1].map(value => (
                        <option key={value} value={value}>{value === 1 ? t('dishes.star') : t('dishes.stars', { count: value })}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    disabled={!isLoggedIn || hasReviewed || isSubmittingReview}
                    placeholder={isLoggedIn ? (hasReviewed ? t('dishes.alreadyReviewed') : t('dishes.writeComment')) : t('dishes.loginToReview')}
                    className="w-full min-h-[96px] rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.95rem] text-brown-dark outline-none resize-y focus:border-gold disabled:bg-white/70"
                  />
                  <div className={`mt-3 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <button
                      type="submit"
                      disabled={!isLoggedIn || hasReviewed || isSubmittingReview}
                      className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-full bg-gold px-5 text-white font-bold text-[0.9rem] hover:bg-brown transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview && <i className="fas fa-spinner fa-spin"></i>}
                      <span>{isSubmittingReview ? t('dishes.sending') : t('dishes.postReview')}</span>
                    </button>
                  </div>
                </form>
              </div>

              {(isReviewsLoading || isReviewsFetching) && (
                <div className="py-8 text-center text-text-mid">
                  <i className="fas fa-spinner fa-spin text-gold mr-2"></i>
                  {t('common.loading')}
                </div>
              )}

              {!isReviewsLoading && liveReviews.length === 0 && (
                <div className="bg-cream rounded-[16px] p-6 border border-beige text-text-mid">
                  {t('dishes.noReviews')}
                </div>
              )}

              <div className="space-y-6">
                {liveReviews.map(review => (
                  <div key={review.id} className="bg-cream rounded-[16px] p-6 border border-beige">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold font-bold text-[1.1rem]">
                          {(review.user?.name || 'G').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-brown-dark">{review.user?.name || t('dishes.guest')}</h4>
                          <span className="text-[0.75rem] text-text-mid">{formatReviewDate(review.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex text-gold text-[0.8rem]">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"}></i>
                          ))}
                        </div>
                        {profile?.id === review.user_id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isDeletingReview}
                            className="text-text-mid hover:text-[#e74c3c] transition-colors cursor-pointer disabled:opacity-60"
                            aria-label="Delete review"
                          >
                            <i className="fas fa-trash-can"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[0.95rem] text-text-mid">{review.comment || t('dishes.noComment')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="mb-12 animate-[fadeUp_0.4s_0.2s_ease_both]">
          <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-bold text-brown-dark mb-6 border-b border-beige pb-3">
            {t('dishes.youMightLike')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(rec => (
              <DishCard key={rec.id} {...rec} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShowDishPage;
