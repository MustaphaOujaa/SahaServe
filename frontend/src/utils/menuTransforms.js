const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85';

const tagIcons = {
  vegetarian: 'fa-leaf',
  vegetaria: 'fa-leaf',
  vegan: 'fa-leaf',
  spicy: 'fa-pepper-hot',
  'gluten-free': 'fa-wheat-awn-circle-exclamation',
  traditional: 'fa-mortar-pestle',
  'chef-s-special': 'fa-star',
};

const tagAliases = {
  vegetarian: ['vegetarian', 'vegetaria', 'vegitarian', 'vegan'],
  vegetaria: ['vegetarian', 'vegetaria', 'vegitarian', 'vegan'],
  vegitarian: ['vegetarian', 'vegetaria', 'vegitarian', 'vegan'],
  vegan: ['vegetarian', 'vegetaria', 'vegitarian', 'vegan'],
};

const categoryIcons = {
  tagines: { icon: 'fa-fire', initials: 'Tg' },
  couscous: { icon: 'fa-bowl-rice', initials: 'Cs' },
  appetizers: { icon: 'fa-leaf', initials: 'Ap' },
  starters: { icon: 'fa-leaf', initials: 'St' },
  desserts: { icon: 'fa-star', initials: 'Ds' },
  drinks: { icon: 'fa-mug-hot', initials: 'Dr' },
};

export const slugify = (value = '') =>
  value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

export const resolveAssetUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}/storage/${path.replace(/^\/+/, '')}`;
};

export const normalizeDish = (dish) => {
  const categoryName = dish.category?.name || 'Uncategorized';
  const tags = dish.tags?.map(tag => tag.name) || [];
  const tagSlugs = tags.map(tag => slugify(tag));

  return {
    ...dish,
    category: slugify(categoryName),
    categoryName,
    type: tagSlugs.join(' '),
    tagSlugs,
    price: Number(dish.price || 0),
    rating: Number(dish.rating || 4.8),
    reviews: dish.reviews_count || dish.reviews?.length || 0,
    time: dish.time || '20 min',
    weight: dish.weight || (Number(dish.price || 0) >= 100 ? 'Heavy' : 'Medium'),
    kcal: dish.kcal || 450,
    badges: tags.slice(0, 2),
    badge: tags[0],
    image: resolveAssetUrl(dish.images?.[0]?.url || dish.image),
  };
};

export const normalizeTag = (tag) => {
  const id = slugify(tag.name);

  return {
    id,
    name: tag.name,
    icon: tagIcons[id] || 'fa-tag',
    aliases: tagAliases[id] || [id],
  };
};

export const tagMatchesDish = (dish, tagFilter) => {
  const dishTags = dish.tagSlugs || [];
  const aliases = tagFilter.aliases || [tagFilter.id];

  return aliases.some(alias => dishTags.includes(alias));
};

export const normalizeCategory = (category) => {
  const slug = slugify(category.name);
  const meta = categoryIcons[slug] || { icon: 'fa-utensils', initials: category.name?.slice(0, 2) || 'Ct' };

  return {
    id: slug,
    name: category.name,
    icon: meta.icon,
    initials: meta.initials,
    desc: category.description || 'Freshly prepared dishes from our kitchen',
  };
};
