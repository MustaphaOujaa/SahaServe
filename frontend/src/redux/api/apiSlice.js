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
  tagTypes: ['Profile', 'Users', 'Roles', 'Orders', 'Reservations', 'Tables', 'Dishes', 'Categories', 'Tags'],
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
      query: () => '/tables',
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
      query: (page = 1) => `/tags?page=${page}`,
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
  useUpdateReservationMutation,
  useDeleteReservationMutation,
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useGetDishesQuery,
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
} = apiSlice;
