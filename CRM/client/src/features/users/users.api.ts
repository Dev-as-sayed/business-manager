import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserListArgs,
} from '@/features/users/users.types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<Paginated<ManagedUser>, UserListArgs | void>({
      query: (args) => ({ url: '/users', params: args ?? {} }),
      transformResponse: unwrapList<ManagedUser>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'User' as const, id: item.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    getUser: build.query<ManagedUser, string>({
      query: (id) => `/users/${id}`,
      transformResponse: unwrap<ManagedUser>,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: build.mutation<ManagedUser, CreateUserInput>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      transformResponse: withSuccessToast<ManagedUser>(),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        { type: 'Role', id: 'LIST' },
      ],
    }),
    updateUser: build.mutation<ManagedUser, { id: string; body: UpdateUserInput }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<ManagedUser>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'Role', id: 'LIST' },
      ],
    }),
    updateUserStatus: build.mutation<ManagedUser, UpdateUserStatusInput>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<ManagedUser>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'Role', id: 'LIST' },
      ],
    }),
    deleteUser: build.mutation<null, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        { type: 'Role', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;
