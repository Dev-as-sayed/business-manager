import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type {
  CreateProductRequestInput,
  ProductRequest,
  ProductRequestListArgs,
  UpdateProductRequestStatusInput,
} from '@/features/product-requests/product-requests.types';
import type { Paginated } from '@/shared/types';

export const productRequestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listProductRequests: build.query<Paginated<ProductRequest>, ProductRequestListArgs | void>({
      query: (args) => ({ url: '/product-requests', params: args ?? {} }),
      transformResponse: unwrapList<ProductRequest>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'ProductRequest' as const, id: item.id })),
              { type: 'ProductRequest' as const, id: 'LIST' },
            ]
          : [{ type: 'ProductRequest' as const, id: 'LIST' }],
    }),
    getProductRequest: build.query<ProductRequest, string>({
      query: (id) => `/product-requests/${id}`,
      transformResponse: unwrap<ProductRequest>,
      providesTags: (_result, _error, id) => [{ type: 'ProductRequest', id }],
    }),
    createProductRequest: build.mutation<ProductRequest, CreateProductRequestInput>({
      query: (body) => ({ url: '/product-requests', method: 'POST', body }),
      transformResponse: withSuccessToast<ProductRequest>(),
      invalidatesTags: [{ type: 'ProductRequest', id: 'LIST' }],
    }),
    updateProductRequestStatus: build.mutation<ProductRequest, UpdateProductRequestStatusInput>({
      query: ({ id, status }) => ({
        url: `/product-requests/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<ProductRequest>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ProductRequest', id },
        { type: 'ProductRequest', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListProductRequestsQuery,
  useGetProductRequestQuery,
  useCreateProductRequestMutation,
  useUpdateProductRequestStatusMutation,
} = productRequestsApi;
