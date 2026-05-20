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
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['Profile'],
      transformResponse: (response) => response.data,
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/updateProfile',
        method: 'PATCH',
        body: data,
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
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useDeleteAccountMutation } = apiSlice;
