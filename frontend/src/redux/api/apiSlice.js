import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Users', 'Roles', 'Orders', 'Reservations', 'Tables', 'Dishes', 'Categories', 'Tags', 'Cart', 'Favorites', 'Reviews'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['Profile'],
      transformResponse: (response) => response.data,
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/updateProfile',
        method: data instanceof FormData ? 'POST' : 'PATCH',
        body: data instanceof FormData
          ? (() => {
              data.append('_method', 'PATCH');
              return data;
            })()
          : data,
      }),
      invalidatesTags: ['Profile'],
    }),
    deleteAccount: builder.mutation({
      query: ({ password }) => ({
        url: '/deleteAccount',
        method: 'DELETE',
        body: { password },
      }),
    }),
    getUsers: builder.query({
      query: (page = 1) => `/all-users?page=${page}`,
      providesTags: ['Users'],
      transformResponse: (response) => response.users,
    }),
    getRolesAndPermissions: builder.query({
      query: () => '/roles-permissions',
      providesTags: ['Roles'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Orders'],
      transformResponse: (response) => response.data,
    }),
    getOrder: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_result, _error, orderId) => [{ type: 'Orders', id: orderId }],
      transformResponse: (response) => response.data,
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
    getReservations: builder.query({
      query: () => '/all-reservations',
      providesTags: ['Reservations'],
      transformResponse: (response) => response.data,
    }),
    getUserReservations: builder.query({
      query: () => '/user-reservations',
      providesTags: ['Reservations'],
      transformResponse: (response) => response.data,
    }),
    createReservation: builder.mutation({
      query: (data) => ({
        url: '/reservations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reservations'],
    }),
    updateReservation: builder.mutation({
      query: ({ reservationId, data }) => ({
        url: `/reservations/${reservationId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Reservations'],
    }),
    deleteReservation: builder.mutation({
      query: (reservationId) => ({
        url: `/reservations/${reservationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reservations'],
    }),
    getTables: builder.query({
      query: (availableOnly = false) => availableOnly ? '/tables?available=1' : '/tables',
      providesTags: ['Tables'],
      transformResponse: (response) => response.data,
    }),
    createTable: builder.mutation({
      query: (data) => ({
        url: '/tables',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tables'],
    }),
    updateTable: builder.mutation({
      query: ({ tableId, data }) => ({
        url: `/tables/${tableId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Tables'],
    }),
    deleteTable: builder.mutation({
      query: (tableId) => ({
        url: `/tables/${tableId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tables'],
    }),
    getDishes: builder.query({
      query: () => '/dishes',
      providesTags: ['Dishes'],
      transformResponse: (response) => response.data,
    }),
    getDish: builder.query({
      query: (dishId) => `/dishes/${dishId}`,
      providesTags: (_result, _error, dishId) => [{ type: 'Dishes', id: dishId }],
      transformResponse: (response) => response.data,
    }),
    createDish: builder.mutation({
      query: (data) => ({
        url: '/dishes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Dishes'],
    }),
    updateDish: builder.mutation({
      query: ({ dishId, data }) => ({
        url: `/dishes/${dishId}`,
        method: data instanceof FormData ? 'POST' : 'PATCH',
        body: data instanceof FormData
          ? (() => {
              data.append('_method', 'PATCH');
              return data;
            })()
          : data,
      }),
      invalidatesTags: ['Dishes'],
    }),
    deleteDish: builder.mutation({
      query: (dishId) => ({
        url: `/dishes/${dishId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dishes'],
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Categories'],
      transformResponse: (response) => response.data,
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories', 'Dishes'],
    }),
    updateCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/categories/${categoryId}`,
        method: data instanceof FormData ? 'POST' : 'PATCH',
        body: data instanceof FormData
          ? (() => {
              data.append('_method', 'PATCH');
              return data;
            })()
          : data,
      }),
      invalidatesTags: ['Categories', 'Dishes'],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Dishes'],
    }),
    getTags: builder.query({
      query: (params = 1) => {
        const queryParams = typeof params === 'object'
          ? new URLSearchParams({
              page: params.page || 1,
              per_page: params.perPage || 10,
            })
          : new URLSearchParams({ page: params });

        return `/tags?${queryParams.toString()}`;
      },
      providesTags: ['Tags'],
      transformResponse: (response) => response.data,
    }),
    createTag: builder.mutation({
      query: (data) => ({
        url: '/add-tag',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tags'],
    }),
    updateTag: builder.mutation({
      query: ({ tagId, data }) => ({
        url: `/update-tag/${tagId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Tags', 'Dishes'],
    }),
    deleteTag: builder.mutation({
      query: (tagId) => ({
        url: `/delete-tag/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tags', 'Dishes'],
    }),
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
      transformResponse: (response) => response.data,
    }),
    addToCart: builder.mutation({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    placeOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
    getMyOrders: builder.query({
      query: () => '/my-orders',
      providesTags: ['Orders'],
      transformResponse: (response) => response.data,
    }),
    getFavorites: builder.query({
      query: () => '/favorites',
      providesTags: ['Favorites'],
      transformResponse: (response) => response.data,
    }),
    getReviews: builder.query({
      query: ({ date, dishId, perPage = 50 } = {}) => {
        const params = new URLSearchParams({ per_page: perPage });
        if (date) params.set('date', date);
        if (dishId) params.set('dish_id', dishId);
        return `/reviews?${params.toString()}`;
      },
      providesTags: ['Reviews'],
      transformResponse: (response) => response.data,
    }),
    getDishReviews: builder.query({
      query: ({ dishId, perPage = 50 }) => `/dishes/${dishId}/reviews?per_page=${perPage}`,
      providesTags: (_result, _error, arg) => [
        'Reviews',
        { type: 'Reviews', id: `DISH-${arg.dishId}` },
      ],
      transformResponse: (response) => ({
        reviews: response.data?.data || [],
        pagination: response.data,
        summary: response.summary || { count: 0, average_rating: 0 },
      }),
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        'Reviews',
        { type: 'Reviews', id: `DISH-${arg.dish_id}` },
        { type: 'Dishes', id: arg.dish_id },
        'Dishes',
      ],
    }),
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews', 'Dishes'],
    }),
    analyzeReviews: builder.query({
      async queryFn(arg = {}, api, extraOptions, baseQuery) {
        const params = new URLSearchParams({ per_page: arg.perPage || 200 });
        if (arg.date) params.set('date', arg.date);
        const reviewsResult = await baseQuery(`/reviews?${params.toString()}`, api, extraOptions);

        if (reviewsResult.error) {
          return { error: reviewsResult.error };
        }

        const reviewsPage = reviewsResult.data?.data;
        const reviews = reviewsPage?.data || [];

        if (!reviews.length) {
          return {
            data: {
              analysis: null,
              reviews: [],
              reviewCount: 0,
              analyzedAt: new Date().toISOString(),
            },
          };
        }

        const reviewAnalysisUrl = `${import.meta.env.VITE_REVIEW_ANALYSIS_URL || 'http://localhost:5000/review'}/analyze`;
        let analysisResponse;

        try {
          analysisResponse = await fetch(reviewAnalysisUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              reviews: reviews.map((review) => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment || '',
                dish: review.dish?.name || null,
                customer: review.user?.name || null,
                created_at: review.created_at,
              })),
            }),
          });
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: { message: error.message || 'Review analysis service is unavailable.' },
            },
          };
        }

        const analysisData = await analysisResponse.json().catch(() => null);

        if (!analysisResponse.ok) {
          return {
            error: {
              status: analysisResponse.status,
              data: analysisData || { message: 'Failed to analyze reviews.' },
            },
          };
        }

        return {
          data: {
            analysis: analysisData,
            reviews,
            reviewCount: reviewsPage?.total || reviews.length,
            analyzedAt: new Date().toISOString(),
          },
        };
      },
      providesTags: ['Reviews'],
    }),
    addFavorite: builder.mutation({
      query: (dishId) => ({
        url: '/favorites',
        method: 'POST',
        body: { dish_id: dishId },
      }),
      invalidatesTags: ['Favorites'],
    }),
    removeFavorite: builder.mutation({
      query: (dishId) => ({
        url: `/favorites/${dishId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useGetUsersQuery,
  useGetRolesAndPermissionsQuery,
  useUpdateUserRoleMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useGetReservationsQuery,
  useGetUserReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useGetDishesQuery,
  useGetDishQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetFavoritesQuery,
  useGetReviewsQuery,
  useGetDishReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useAnalyzeReviewsQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = apiSlice;
