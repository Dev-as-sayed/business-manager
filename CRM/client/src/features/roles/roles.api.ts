import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  PermissionOption,
  Role,
  RoleInput,
  RoleListArgs,
} from '@/features/roles/roles.types';

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRoles: build.query<Paginated<Role>, RoleListArgs | void>({
      query: (args) => ({ url: '/roles', params: args ?? {} }),
      transformResponse: unwrapList<Role>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Role' as const, id: item.id })),
              { type: 'Role' as const, id: 'LIST' },
            ]
          : [{ type: 'Role' as const, id: 'LIST' }],
    }),
    getRole: build.query<Role, string>({
      query: (id) => `/roles/${id}`,
      transformResponse: unwrap<Role>,
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),
    listPermissions: build.query<PermissionOption[], void>({
      query: () => '/roles/permissions',
      transformResponse: unwrap<PermissionOption[]>,
      providesTags: [{ type: 'Role', id: 'PERMISSIONS' }],
    }),
    createRole: build.mutation<Role, RoleInput>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      transformResponse: withSuccessToast<Role>(),
      invalidatesTags: [
        { type: 'Role', id: 'LIST' },
        { type: 'Role', id: 'PERMISSIONS' },
      ],
    }),
    updateRole: build.mutation<Role, { id: string; body: Partial<RoleInput> }>({
      query: ({ id, body }) => ({ url: `/roles/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<Role>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
        { type: 'Role', id: 'PERMISSIONS' },
      ],
    }),
    deleteRole: build.mutation<null, string>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const {
  useListRolesQuery,
  useGetRoleQuery,
  useListPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
