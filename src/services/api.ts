// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ApiResponse, AuthResponse, Course, CourseStats, DashboardOverview, Level, UsersResponse } from "../utils/typeDef";
import { string } from "@tensorflow/tfjs";
import { normalizeObject } from "../utils/urlUtils";

export interface Exercise {
    id: number;
    title: string;
    type: string;
    duration: number;
    cover?: string;
    description?: string;
    contentUrl: string;
    isActive: boolean;
    level: Level;
    createdBy: any;
    createdAt: string;
    updatedAt: string;
}

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // Don't force JSON content-type here — it would override the
        // multipart/form-data boundary header the browser sets for FormData
        // bodies (file uploads), which breaks them server-side. fetchBaseQuery
        // already sets 'Content-Type: application/json' by itself for plain
        // JSON bodies when no content-type is present yet.
        return headers;
    },
});

const baseQueryWithNormalization: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.data) {
        result.data = normalizeObject(result.data);
    }
    return result;
};

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQueryWithNormalization(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken && window.location.pathname !== "/login") {
            console.log('🔄 Token expired, attempting refresh...');

            const refreshResult = await baseQueryWithNormalization(
                {
                    url: '/auth/refresh-token',
                    method: 'POST',
                    body: { refresh_token: refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                const data = refreshResult.data as ApiResponse<AuthResponse>;

                console.log('✅ Token refreshed successfully');

                localStorage.setItem('accessToken', data.payload.token);
                localStorage.setItem('refreshToken', data.payload.refreshToken);

                result = await baseQuery(args, api, extraOptions);
            } else {
                console.error('❌ Token refresh failed');

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        } else if (window.location.pathname !== "/login") {
            localStorage.clear();
            window.location.href = "/login";
        }
    }

    return result;
};

export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'User',
        'Admin',
        'Dashboard',
        'Users',
        'Courses',
        'Categories',
        'Levels',
        'Exercises',
        'Reels',
        'Faqs',
        'Quotes',
        'LandingPageContent',
        'LandingServices',
        'PricingPlans',
        'FormationTags',
        'Books',
        'BookCategories',
    ],
    endpoints: (builder) => ({
        // ========== AUTH ==========
        login: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string; remember?: boolean }>({
            query: (credentials) => ({
                url: "/auth/signin",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    localStorage.setItem('accessToken', data.payload.token);
                    localStorage.setItem('refreshToken', data.payload.refreshToken);
                } catch (error) {
                    console.error('❌ Login failed:', error);
                }
            },
        }),

        logout: builder.mutation<ApiResponse<any>, void>({
            query: () => ({
                url: "/auth/signout",
                method: "POST",
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                } catch (error) {
                    console.error('❌ Logout failed:', error);
                }
            },
        }),

        loadUser: builder.query<ApiResponse<any>, any>({
            query: () => '/auth/load-user',
            providesTags: ['User'],
        }),

        updateUserProfile: builder.mutation<ApiResponse<any>, { firstname?: string; lastname?: string; phone?: string }>({
            query: (data) => ({
                url: '/auth/update-user-info',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        updatePassword: builder.mutation<ApiResponse<any>, { currentPassword: string; newPassword: string }>({
            query: (data) => ({
                url: '/auth/update-password',
                method: 'PUT',
                body: data,
            }),
        }),

        // ========== ADMIN DASHBOARD ==========
        getDashboardOverview: builder.query<ApiResponse<DashboardOverview>, void>({
            query: () => '/admin/dashboard/overview',
            providesTags: ['Dashboard'],
        }),

        getUsersGrowthChart: builder.query<ApiResponse<Array<{ date: string; count: number }>>, number>({
            query: (days = 30) => `/admin/dashboard/users-growth?days=${days}`,
            providesTags: ['Dashboard'],
        }),

        getUsersByLevel: builder.query<ApiResponse<Array<{ level: string; count: number }>>, void>({
            query: () => '/admin/dashboard/users-by-level',
            providesTags: ['Dashboard'],
        }),

        getRecentActivity: builder.query<ApiResponse<any>, number>({
            query: (limit = 10) => `/admin/dashboard/recent-activity?limit=${limit}`,
            providesTags: ['Dashboard'],
        }),

        // ========== USERS MANAGEMENT ==========
        getAllUsers: builder.query<ApiResponse<UsersResponse>, {
            page?: number;
            limit?: number;
            level?: string;
            role?: string;
            search?: string;
        }>({
            query: ({ page = 1, limit = 20, level, role, search }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (level) params.append('level', level);
                if (role) params.append('role', role);
                if (search) params.append('search', search);

                return `/admin/users?${params.toString()}`;
            },
            providesTags: ['Users'],
        }),

        getUserDetails: builder.query<ApiResponse<any>, number>({
            query: (id) => `/admin/users/${id}`,
            providesTags: ['Users'],
        }),

        deleteUser: builder.mutation<ApiResponse<any>, number>({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users', 'Dashboard'],
        }),

        // ========== COURSES MANAGEMENT ==========
        getAllCourses: builder.query<ApiResponse<any>, {
            page?: number;
            limit?: number;
            status?: string;
            level?: string;
            search?: string;
        }>({
            query: ({ page = 1, limit = 20, status, level, search }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (status) params.append('status', status);
                if (level) params.append('level', level);
                if (search) params.append('search', search);

                return `/admin/courses?${params.toString()}`;
            },
            providesTags: ['Courses'],
        }),

        getCourseById: builder.query<ApiResponse<Course>, number>({
            query: (id) => `/app/courses/${id}`,
            providesTags: (result, error, id) => [{ type: 'Courses', id }],
        }),

        deleteCourse: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/app/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Courses'],
        }),

        togglePublishCourse: builder.mutation<ApiResponse<Course>, number>({
            query: (id) => ({
                url: `/app/courses/${id}/publish`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Courses'],
        }),

        // Tu pourras ajouter ces endpoints au backend plus tard si besoin
        getCourseStats: builder.query<ApiResponse<CourseStats>, void>({
            query: () => `/admin/courses/stats`,
            providesTags: ['Courses'],
        }),

        getAllLevels: builder.query<ApiResponse<Level[]>, void>({
            query: () => `/app/levels`,
        }),

        // ========== STATS ==========
        getFaqsStats: builder.query<ApiResponse<any>, void>({
            query: () => '/admin/stats/faqs',
        }),

        getMessagesStats: builder.query<ApiResponse<any>, void>({
            query: () => '/admin/stats/messages',
        }),
        refreshToken: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/refresh-token',
                method: 'POST',
                body: { refresh_token: localStorage.getItem('refreshToken') },
            }),
        }),
        getAllCategories: builder.query<ApiResponse<any>, {
            page?: number;
            limit?: number;
            search?: string;
        }>({
            query: ({ page = 1, limit = 20, search }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (search) params.append('search', search);

                return `/app/categories?${params.toString()}`;
            },
            providesTags: ['Categories'],
        }),

        getCategoryById: builder.query<ApiResponse<any>, number>({
            query: (id) => `/app/categories/${id}`,
            providesTags: ['Categories'],
        }),

        createCategory: builder.mutation<ApiResponse<any>, { title: string; cover?: string }>({
            query: (data) => ({
                url: '/app/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Categories'],
        }),

        updateCategory: builder.mutation<ApiResponse<any>, { id: number; data: { title?: string; cover?: string } }>({
            query: ({ id, data }) => ({
                url: `/app/categories/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Categories'],
        }),

        deleteCategory: builder.mutation<ApiResponse<any>, number>({
            query: (id) => ({
                url: `/app/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Categories'],
        }),

        getCategoryStats: builder.query<ApiResponse<any>, void>({
            query: () => '/app/categories/stats',
            providesTags: ['Categories'],
        }),

        getCoursesByCategory: builder.query<ApiResponse<any>, number>({
            query: (id) => `/app/categories/${id}/courses`,
            providesTags: ['Courses'],
        }),
        getCourseDetails: builder.query<ApiResponse<any>, number>({
            query: (id) => ({
                url: `/app/courses/${id}`,
                params: { id }
            }),
            providesTags: ['Courses'],
        }),
        createCourse: builder.mutation<ApiResponse<Course>, FormData>({
            query: (data) => ({
                url: '/app/courses',
                method: 'POST',
                body: data,
                formData: true,
            }),
            invalidatesTags: ['Courses'],
        }),
        updateCourse: builder.mutation<ApiResponse<Course>, { id: number; data: FormData }>({
            query: ({ id, data }) => ({
                url: `/app/courses/${id}`,
                method: 'PUT',
                body: data,
                formData: true,
            }),
            invalidatesTags: ['Courses'],
        }),
        createSection: builder.mutation<ApiResponse<any>, { courseId: number; data: any }>({
            query: ({ courseId, data }) => ({
                url: `/app/courses/${courseId}/sections`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Courses'],
        }),
        getLevels: builder.query<ApiResponse<Level[]>, void>({
            query: () => `/app/levels`,
            providesTags: ['Courses'],
        }),

        // ========== ADMIN LEVELS ==========
        getAdminLevels: builder.query<ApiResponse<any>, { page?: number; limit?: number; search?: string; sortField?: string; sortDirection?: 'ASC' | 'DESC' }>({
            query: ({ page = 1, limit = 20, search = '', sortField, sortDirection }) => ({
                url: '/admin/levels',
                params: { page, limit, search, ...(sortField && { sortField }), ...(sortDirection && { sortDirection }) }
            }),
            providesTags: ['Levels'],
        }),

        getLevelById: builder.query<ApiResponse<any>, number>({
            query: (id) => `/admin/levels/${id}`,
            providesTags: ['Levels'],
        }),

        createLevel: builder.mutation<ApiResponse<any>, { name: string; rank: number; is_public?: boolean }>({
            query: (data) => ({
                url: '/admin/levels',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Levels'],
        }),

        updateLevel: builder.mutation<ApiResponse<any>, { id: number; data: { name?: string; rank?: number; is_public?: boolean } }>({
            query: ({ id, data }) => ({
                url: `/admin/levels/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Levels'],
        }),

        deleteLevel: builder.mutation<ApiResponse<any>, number>({
            query: (id) => ({
                url: `/admin/levels/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Levels'],
        }),

        getLevelsStats: builder.query<ApiResponse<any>, void>({
            query: () => '/admin/stats/levels',
            providesTags: ['Levels'],
        }),

        // ========== ADMIN EXERCISES ==========
        getAdminExercises: builder.query<ApiResponse<any>, { page?: number; limit?: number; search?: string; type?: string; isActive?: boolean | undefined }>({
            query: ({ page = 1, limit = 10, search = '', type = '', isActive = undefined }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (search) params.append('search', search);
                if (type) params.append('type', type);
                if (isActive !== undefined) params.append('isActive', isActive.toString());
                return `/admin/exercises?${params.toString()}`;
            },
            providesTags: ['Exercises'],
        }),

        getExerciseById: builder.query<ApiResponse<Exercise>, number>({
            query: (id) => `/admin/exercises/${id}`,
            providesTags: ['Exercises'],
        }),

        deleteExercise: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/admin/exercises/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Exercises'],
        }),

        toggleActiveExercise: builder.mutation<ApiResponse<Exercise>, number>({
            query: (id) => ({
                url: `/admin/exercises/${id}/toggle-active`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Exercises'],
        }),

        // ========== ADMIN REELS ==========
        getAdminReels: builder.query<ApiResponse<any>, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (search) params.append('search', search);
                return `/admin/reels?${params.toString()}`;
            },
            providesTags: ['Reels'],
        }),

        getReelById: builder.query<ApiResponse<any>, number>({
            query: (id) => `/admin/reels/${id}`,
            providesTags: ['Reels'],
        }),

        deleteReel: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/admin/reels/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Reels'],
        }),

        toggleActiveReel: builder.mutation<ApiResponse<any>, number>({
            query: (id) => ({
                url: `/admin/reels/${id}/toggle-active`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Reels'],
        }),

        // ========== ADMIN FAQs ==========
        getAdminFaqs: builder.query<ApiResponse<any>, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (search) params.append('search', search);
                return `/admin/faqs?${params.toString()}`;
            },
            providesTags: ['Faqs'],
        }),

        getFaqById: builder.query<ApiResponse<any>, number>({
            query: (id) => `/admin/faqs/${id}`,
            providesTags: ['Faqs'],
        }),

        createFaq: builder.mutation<ApiResponse<any>, any>({
            query: (data) => ({
                url: `/admin/faqs`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Faqs'],
        }),

        updateFaq: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/admin/faqs/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Faqs'],
        }),

        deleteFaq: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/admin/faqs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Faqs'],
        }),

        // ========== ADMIN QUOTES ==========
        getAdminQuotes: builder.query<ApiResponse<any>, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });
                if (search) params.append('search', search);
                return `/admin/quotes?${params.toString()}`;
            },
            providesTags: ['Quotes'],
        }),

        getQuoteById: builder.query<ApiResponse<any>, number>({
            query: (id) => `/admin/quotes/${id}`,
            providesTags: ['Quotes'],
        }),

        createQuote: builder.mutation<ApiResponse<any>, any>({
            query: (data) => ({
                url: `/admin/quotes`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Quotes'],
        }),

        updateQuote: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/admin/quotes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Quotes'],
        }),

        deleteQuote: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/admin/quotes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Quotes'],
        }),

        // ========== LANDING PAGE - PUBLIC ==========
        getLandingPageContent: builder.query<ApiResponse<any>, void>({
            query: () => '/app/landing-page/content',
            providesTags: ['LandingPageContent'],
        }),

        getLandingServices: builder.query<ApiResponse<any>, void>({
            query: () => '/app/landing-page/services',
            providesTags: ['LandingServices'],
        }),

        getPricingPlans: builder.query<ApiResponse<any>, void>({
            query: () => '/app/landing-page/pricing',
            providesTags: ['PricingPlans'],
        }),

        getFormationTags: builder.query<ApiResponse<any>, void>({
            query: () => '/app/landing-page/tags',
            providesTags: ['FormationTags'],
        }),

        // ========== LANDING PAGE - ADMIN ==========
        updateLandingPageContent: builder.mutation<ApiResponse<any>, { section: string; data: any }>({
            query: ({ section, data }) => ({
                url: `/app/admin/landing-page/content/${section}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['LandingPageContent'],
        }),

        createLandingService: builder.mutation<ApiResponse<any>, any>({
            query: (data) => ({
                url: '/app/admin/landing-page/services',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['LandingServices'],
        }),

        updateLandingService: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/app/admin/landing-page/services/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['LandingServices'],
        }),

        deleteLandingService: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/app/admin/landing-page/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['LandingServices'],
        }),

        createPricingPlan: builder.mutation<ApiResponse<any>, any>({
            query: (data) => ({
                url: '/app/admin/landing-page/pricing',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PricingPlans'],
        }),

        updatePricingPlan: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/app/admin/landing-page/pricing/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PricingPlans'],
        }),

        deletePricingPlan: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/app/admin/landing-page/pricing/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PricingPlans'],
        }),

        createFormationTag: builder.mutation<ApiResponse<any>, any>({
            query: (data) => ({
                url: '/app/admin/landing-page/tags',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['FormationTags'],
        }),

        updateFormationTag: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/app/admin/landing-page/tags/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['FormationTags'],
        }),

        deleteFormationTag: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/app/admin/landing-page/tags/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['FormationTags'],
        }),

        // ========== BOOKS (public) ==========
        getBooks: builder.query<ApiResponse<any[]>, { category?: string; q?: string; sort?: string } | void>({
            query: (filters) => ({
                url: '/app/books',
                params: filters || undefined,
            }),
            providesTags: ['Books'],
        }),

        getBook: builder.query<ApiResponse<any>, number>({
            query: (id) => `/app/books/${id}`,
            providesTags: ['Books'],
        }),

        getBookCategories: builder.query<ApiResponse<any[]>, void>({
            query: () => '/app/book-categories',
            providesTags: ['BookCategories'],
        }),

        // ========== BOOKS (admin) ==========
        getAdminBooks: builder.query<ApiResponse<any[]>, void>({
            query: () => '/app/admin/books',
            providesTags: ['Books'],
        }),

        createBook: builder.mutation<ApiResponse<any>, FormData>({
            query: (data) => ({
                url: '/app/admin/books',
                method: 'POST',
                body: data,
                formData: true,
            }),
            invalidatesTags: ['Books'],
        }),

        updateBook: builder.mutation<ApiResponse<any>, { id: number; data: FormData }>({
            query: ({ id, data }) => ({
                url: `/app/admin/books/${id}`,
                method: 'PUT',
                body: data,
                formData: true,
            }),
            invalidatesTags: ['Books'],
        }),

        deleteBook: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/app/admin/books/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Books'],
        }),

        createBookCategory: builder.mutation<ApiResponse<any>, any>({
            query: (data) => ({
                url: '/app/admin/book-categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['BookCategories'],
        }),

        updateBookCategory: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/app/admin/book-categories/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['BookCategories'],
        }),

        deleteBookCategory: builder.mutation<ApiResponse<null>, number>({
            query: (id) => ({
                url: `/app/admin/book-categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['BookCategories'],
        }),

    }),
});

export const {
    useLoginMutation,
    useLoadUserQuery,
    useLogoutMutation,
    useUpdateUserProfileMutation,
    useUpdatePasswordMutation,
    useGetDashboardOverviewQuery,
    useGetUsersGrowthChartQuery,
    useGetUsersByLevelQuery,
    useGetRecentActivityQuery,
    useGetAllUsersQuery,
    useGetUserDetailsQuery,
    useDeleteUserMutation,
    useGetAllCoursesQuery,
    useDeleteCourseMutation,
    useGetFaqsStatsQuery,
    useGetMessagesStatsQuery,
    useRefreshTokenMutation,
    useGetAllCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useGetCategoryStatsQuery,
    useGetCoursesByCategoryQuery,
    useTogglePublishCourseMutation,
    useGetCourseDetailsQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useCreateSectionMutation,
    useGetAllLevelsQuery,
    useGetAdminLevelsQuery,
    useGetLevelByIdQuery,
    useCreateLevelMutation,
    useUpdateLevelMutation,
    useDeleteLevelMutation,
    useGetLevelsStatsQuery,
    useGetAdminExercisesQuery,
    useGetExerciseByIdQuery,
    useDeleteExerciseMutation,
    useToggleActiveExerciseMutation,
    useGetAdminReelsQuery,
    useGetReelByIdQuery,
    useDeleteReelMutation,
    useToggleActiveReelMutation,
    useGetAdminFaqsQuery,
    useGetFaqByIdQuery,
    useCreateFaqMutation,
    useUpdateFaqMutation,
    useDeleteFaqMutation,
    useGetAdminQuotesQuery,
    useGetQuoteByIdQuery,
    useCreateQuoteMutation,
    useUpdateQuoteMutation,
    useDeleteQuoteMutation,
    useGetLandingPageContentQuery,
    useGetLandingServicesQuery,
    useGetPricingPlansQuery,
    useGetFormationTagsQuery,
    useUpdateLandingPageContentMutation,
    useCreateLandingServiceMutation,
    useUpdateLandingServiceMutation,
    useDeleteLandingServiceMutation,
    useCreatePricingPlanMutation,
    useUpdatePricingPlanMutation,
    useDeletePricingPlanMutation,
    useCreateFormationTagMutation,
    useUpdateFormationTagMutation,
    useDeleteFormationTagMutation,
    useGetBooksQuery,
    useGetBookQuery,
    useGetBookCategoriesQuery,
    useGetAdminBooksQuery,
    useCreateBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation,
    useCreateBookCategoryMutation,
    useUpdateBookCategoryMutation,
    useDeleteBookCategoryMutation,
} = api;