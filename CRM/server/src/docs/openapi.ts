import '@/docs/zod-openapi';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  type ResponseConfig,
  type RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { env } from '@/config/env';
import {
  changePasswordBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from '@/modules/auth/auth.validation';
import {
  createCustomerBodySchema,
  customerIdParamsSchema,
  listCustomersQuerySchema,
  updateCustomerBodySchema,
  updateCustomerStatusBodySchema,
} from '@/modules/customers/customers.validation';
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  updateUserStatusBodySchema,
  userIdParamsSchema,
} from '@/modules/users/users.validation';
import {
  createRoleBodySchema,
  listRolesQuerySchema,
  roleIdParamsSchema,
  updateRoleBodySchema,
} from '@/modules/roles/roles.validation';
import {
  createSupplierBodySchema,
  listSuppliersQuerySchema,
  supplierIdParamsSchema,
  updateSupplierBodySchema,
  updateSupplierStatusBodySchema,
} from '@/modules/suppliers/suppliers.validation';
import {
  assignProductRequestBodySchema,
  createProductRequestBodySchema,
  listProductRequestsQuerySchema,
  productRequestIdParamsSchema,
  updateProductRequestBodySchema,
  updateProductRequestStatusBodySchema,
} from '@/modules/product-requests/product-requests.validation';
import {
  createQuotationBodySchema,
  listQuotationsQuerySchema,
  quotationIdParamsSchema,
  updateQuotationBodySchema,
  updateQuotationStatusBodySchema,
} from '@/modules/quotations/quotations.validation';
import {
  createPurchaseOrderBodySchema,
  listPurchaseOrdersQuerySchema,
  purchaseOrderIdParamsSchema,
  updatePurchaseOrderBodySchema,
  updatePurchaseOrderStatusBodySchema,
} from '@/modules/purchase-orders/purchase-orders.validation';
import {
  createQcReportBodySchema,
  listQcReportsQuerySchema,
  qcReportIdParamsSchema,
  updateQcReportBodySchema,
  updateQcReportStatusBodySchema,
} from '@/modules/quality-control/quality-control.validation';
import {
  createShipmentBodySchema,
  listShipmentsQuerySchema,
  shipmentIdParamsSchema,
  updateShipmentBodySchema,
  updateShipmentStatusBodySchema,
} from '@/modules/shipments/shipments.validation';
import {
  createCustomsRecordBodySchema,
  customsRecordIdParamsSchema,
  listCustomsRecordsQuerySchema,
  updateCustomsRecordBodySchema,
  updateCustomsStatusBodySchema,
} from '@/modules/customs/customs.validation';
import {
  createLedgerEntryBodySchema,
  exportLedgerEntriesQuerySchema,
  ledgerEntryIdParamsSchema,
  listLedgerEntriesQuerySchema,
  purchaseOrderProfitQuerySchema,
  updateLedgerEntryBodySchema,
} from '@/modules/finance/finance.validation';
import {
  attachmentIdParamsSchema,
  listAttachmentsQuerySchema,
} from '@/modules/attachments/attachments.validation';
import { ATTACHMENT_ENTITY_TYPES } from '@/modules/attachments/attachments.types';

const registry = new OpenAPIRegistry();

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.registerComponent('schemas', 'SuccessEnvelope', {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    message: { type: 'string' },
    data: {},
    meta: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
      },
      required: ['page', 'limit', 'total'],
    },
  },
  required: ['success', 'message', 'data'],
});

registry.registerComponent('schemas', 'ErrorResponse', {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [false] },
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['message'],
      },
    },
    stack: { type: 'string' },
  },
  required: ['success', 'message', 'errors'],
});

const RegisterBody = registry.register('RegisterBody', registerBodySchema);
const LoginBody = registry.register('LoginBody', loginBodySchema);
const RefreshBody = registry.register('RefreshBody', refreshBodySchema);
const LogoutBody = registry.register('LogoutBody', logoutBodySchema);
const ForgotPasswordBody = registry.register('ForgotPasswordBody', forgotPasswordBodySchema);
const ResetPasswordBody = registry.register('ResetPasswordBody', resetPasswordBodySchema);
const ChangePasswordBody = registry.register('ChangePasswordBody', changePasswordBodySchema);

const CreateCustomerBody = registry.register('CreateCustomerBody', createCustomerBodySchema);
const UpdateCustomerBody = registry.register('UpdateCustomerBody', updateCustomerBodySchema);
const UpdateCustomerStatusBody = registry.register(
  'UpdateCustomerStatusBody',
  updateCustomerStatusBodySchema,
);
const CustomerIdParams = registry.register('CustomerIdParams', customerIdParamsSchema);
const ListCustomersQuery = registry.register('ListCustomersQuery', listCustomersQuerySchema);

const CreateUserBody = registry.register('CreateUserBody', createUserBodySchema);
const UpdateUserBody = registry.register('UpdateUserBody', updateUserBodySchema);
const UpdateUserStatusBody = registry.register('UpdateUserStatusBody', updateUserStatusBodySchema);
const UserIdParams = registry.register('UserIdParams', userIdParamsSchema);
const ListUsersQuery = registry.register('ListUsersQuery', listUsersQuerySchema);

const CreateRoleBody = registry.register('CreateRoleBody', createRoleBodySchema);
const UpdateRoleBody = registry.register('UpdateRoleBody', updateRoleBodySchema);
const RoleIdParams = registry.register('RoleIdParams', roleIdParamsSchema);
const ListRolesQuery = registry.register('ListRolesQuery', listRolesQuerySchema);

const CreateSupplierBody = registry.register('CreateSupplierBody', createSupplierBodySchema);
const UpdateSupplierBody = registry.register('UpdateSupplierBody', updateSupplierBodySchema);
const UpdateSupplierStatusBody = registry.register(
  'UpdateSupplierStatusBody',
  updateSupplierStatusBodySchema,
);
const SupplierIdParams = registry.register('SupplierIdParams', supplierIdParamsSchema);
const ListSuppliersQuery = registry.register('ListSuppliersQuery', listSuppliersQuerySchema);

const CreateProductRequestBody = registry.register(
  'CreateProductRequestBody',
  createProductRequestBodySchema,
);
const UpdateProductRequestBody = registry.register(
  'UpdateProductRequestBody',
  updateProductRequestBodySchema,
);
const UpdateProductRequestStatusBody = registry.register(
  'UpdateProductRequestStatusBody',
  updateProductRequestStatusBodySchema,
);
const AssignProductRequestBody = registry.register(
  'AssignProductRequestBody',
  assignProductRequestBodySchema,
);
const ProductRequestIdParams = registry.register(
  'ProductRequestIdParams',
  productRequestIdParamsSchema,
);
const ListProductRequestsQuery = registry.register(
  'ListProductRequestsQuery',
  listProductRequestsQuerySchema,
);

const CreateQuotationBody = registry.register('CreateQuotationBody', createQuotationBodySchema);
const UpdateQuotationBody = registry.register('UpdateQuotationBody', updateQuotationBodySchema);
const UpdateQuotationStatusBody = registry.register(
  'UpdateQuotationStatusBody',
  updateQuotationStatusBodySchema,
);
const QuotationIdParams = registry.register('QuotationIdParams', quotationIdParamsSchema);
const ListQuotationsQuery = registry.register('ListQuotationsQuery', listQuotationsQuerySchema);

const CreatePurchaseOrderBody = registry.register(
  'CreatePurchaseOrderBody',
  createPurchaseOrderBodySchema,
);
const UpdatePurchaseOrderBody = registry.register(
  'UpdatePurchaseOrderBody',
  updatePurchaseOrderBodySchema,
);
const UpdatePurchaseOrderStatusBody = registry.register(
  'UpdatePurchaseOrderStatusBody',
  updatePurchaseOrderStatusBodySchema,
);
const PurchaseOrderIdParams = registry.register(
  'PurchaseOrderIdParams',
  purchaseOrderIdParamsSchema,
);
const ListPurchaseOrdersQuery = registry.register(
  'ListPurchaseOrdersQuery',
  listPurchaseOrdersQuerySchema,
);

const CreateQcReportBody = registry.register('CreateQcReportBody', createQcReportBodySchema);
const UpdateQcReportBody = registry.register('UpdateQcReportBody', updateQcReportBodySchema);
const UpdateQcReportStatusBody = registry.register(
  'UpdateQcReportStatusBody',
  updateQcReportStatusBodySchema,
);
const QcReportIdParams = registry.register('QcReportIdParams', qcReportIdParamsSchema);
const ListQcReportsQuery = registry.register('ListQcReportsQuery', listQcReportsQuerySchema);

const CreateShipmentBody = registry.register('CreateShipmentBody', createShipmentBodySchema);
const UpdateShipmentBody = registry.register('UpdateShipmentBody', updateShipmentBodySchema);
const UpdateShipmentStatusBody = registry.register(
  'UpdateShipmentStatusBody',
  updateShipmentStatusBodySchema,
);
const ShipmentIdParams = registry.register('ShipmentIdParams', shipmentIdParamsSchema);
const ListShipmentsQuery = registry.register('ListShipmentsQuery', listShipmentsQuerySchema);

const CreateCustomsRecordBody = registry.register(
  'CreateCustomsRecordBody',
  createCustomsRecordBodySchema,
);
const UpdateCustomsRecordBody = registry.register(
  'UpdateCustomsRecordBody',
  updateCustomsRecordBodySchema,
);
const UpdateCustomsStatusBody = registry.register(
  'UpdateCustomsStatusBody',
  updateCustomsStatusBodySchema,
);
const CustomsRecordIdParams = registry.register(
  'CustomsRecordIdParams',
  customsRecordIdParamsSchema,
);
const ListCustomsRecordsQuery = registry.register(
  'ListCustomsRecordsQuery',
  listCustomsRecordsQuerySchema,
);

const CreateLedgerEntryBody = registry.register(
  'CreateLedgerEntryBody',
  createLedgerEntryBodySchema,
);
const UpdateLedgerEntryBody = registry.register(
  'UpdateLedgerEntryBody',
  updateLedgerEntryBodySchema,
);
const LedgerEntryIdParams = registry.register('LedgerEntryIdParams', ledgerEntryIdParamsSchema);
const ListLedgerEntriesQuery = registry.register(
  'ListLedgerEntriesQuery',
  listLedgerEntriesQuerySchema,
);
const ExportLedgerEntriesQuery = registry.register(
  'ExportLedgerEntriesQuery',
  exportLedgerEntriesQuerySchema,
);
const PurchaseOrderProfitQuery = registry.register(
  'PurchaseOrderProfitQuery',
  purchaseOrderProfitQuerySchema,
);

const AttachmentIdParams = registry.register('AttachmentIdParams', attachmentIdParamsSchema);
const ListAttachmentsQuery = registry.register('ListAttachmentsQuery', listAttachmentsQuerySchema);

type JsonSchema = z.ZodType | Record<string, unknown>;

const jsonResponse = (
  description: string,
  schema: JsonSchema = ref('SuccessEnvelope'),
): ResponseConfig => ({
  description,
  content: {
    'application/json': {
      schema: schema as never,
    },
  },
});

const csvResponse = (description: string): ResponseConfig => ({
  description,
  content: {
    'text/csv': {
      schema: { type: 'string' },
    },
  },
});

const standardErrors: RouteConfig['responses'] = {
  400: jsonResponse('Validation failed', ref('ErrorResponse')),
  401: jsonResponse('Authentication required', ref('ErrorResponse')),
  403: jsonResponse('Insufficient permissions', ref('ErrorResponse')),
  404: jsonResponse('Resource not found', ref('ErrorResponse')),
  409: jsonResponse('Conflict', ref('ErrorResponse')),
};

const withErrors = (responses: RouteConfig['responses'] = {}): RouteConfig['responses'] => ({
  ...standardErrors,
  ...responses,
});

type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type OperationOptions = Omit<RouteConfig, 'method' | 'path' | 'responses' | 'tags' | 'security'> & {
  responses?: RouteConfig['responses'];
};

const apiPath = (
  method: ApiMethod,
  path: string,
  tag: string,
  summary: string,
  options: OperationOptions = {},
  secured = true,
) => {
  registry.registerPath({
    method,
    path: `/api/v1${path}`,
    tags: [tag],
    summary,
    security: secured ? [{ bearerAuth: [] }] : [],
    ...options,
    responses: withErrors(options.responses),
  });
};

const body = (schema: JsonSchema) => ({
  required: true,
  content: {
    'application/json': {
      schema: schema as never,
    },
  },
});

const params = (schema: JsonSchema) => ({ params: schema as never });
const query = (schema: JsonSchema) => ({ query: schema as never });

apiPath(
  'post',
  '/auth/register',
  'Auth',
  'Register a customer account',
  { request: { body: body(RegisterBody) }, responses: { 201: jsonResponse('Registered') } },
  false,
);
apiPath(
  'post',
  '/auth/login',
  'Auth',
  'Log in',
  { request: { body: body(LoginBody) }, responses: { 200: jsonResponse('Logged in') } },
  false,
);
apiPath(
  'post',
  '/auth/refresh',
  'Auth',
  'Rotate a refresh token',
  { request: { body: body(RefreshBody) }, responses: { 200: jsonResponse('Token refreshed') } },
  false,
);
apiPath(
  'post',
  '/auth/logout',
  'Auth',
  'Log out',
  { request: { body: body(LogoutBody) }, responses: { 200: jsonResponse('Logged out') } },
  false,
);
apiPath('post', '/auth/logout-all', 'Auth', 'Log out all sessions', {
  responses: { 200: jsonResponse('All sessions revoked') },
});
apiPath(
  'post',
  '/auth/forgot-password',
  'Auth',
  'Request a password reset',
  {
    request: { body: body(ForgotPasswordBody) },
    responses: { 200: jsonResponse('Password reset requested') },
  },
  false,
);
apiPath(
  'post',
  '/auth/reset-password',
  'Auth',
  'Reset a password',
  {
    request: { body: body(ResetPasswordBody) },
    responses: { 200: jsonResponse('Password reset') },
  },
  false,
);
apiPath('post', '/auth/change-password', 'Auth', 'Change the current password', {
  request: { body: body(ChangePasswordBody) },
  responses: { 200: jsonResponse('Password changed') },
});
apiPath('get', '/auth/me', 'Auth', 'Get the current user', {
  responses: { 200: jsonResponse('Current user') },
});

apiPath('post', '/customers', 'Customers', 'Create a customer', {
  request: { body: body(CreateCustomerBody) },
  responses: { 201: jsonResponse('Customer created') },
});
apiPath('get', '/customers', 'Customers', 'List customers', {
  request: query(ListCustomersQuery),
  responses: { 200: jsonResponse('Customers retrieved') },
});
apiPath('get', '/customers/{id}', 'Customers', 'Get a customer', {
  request: params(CustomerIdParams),
  responses: { 200: jsonResponse('Customer retrieved') },
});
apiPath('patch', '/customers/{id}/status', 'Customers', 'Update customer status', {
  request: { ...params(CustomerIdParams), body: body(UpdateCustomerStatusBody) },
  responses: { 200: jsonResponse('Customer status updated') },
});
apiPath('patch', '/customers/{id}', 'Customers', 'Update a customer', {
  request: { ...params(CustomerIdParams), body: body(UpdateCustomerBody) },
  responses: { 200: jsonResponse('Customer updated') },
});
apiPath('delete', '/customers/{id}', 'Customers', 'Delete a customer', {
  request: params(CustomerIdParams),
  responses: { 200: jsonResponse('Customer deleted') },
});

apiPath('post', '/users', 'Users', 'Create a user', {
  request: { body: body(CreateUserBody) },
  responses: { 201: jsonResponse('User created') },
});
apiPath('get', '/users', 'Users', 'List users', {
  request: query(ListUsersQuery),
  responses: { 200: jsonResponse('Users retrieved') },
});
apiPath('get', '/users/{id}', 'Users', 'Get a user', {
  request: params(UserIdParams),
  responses: { 200: jsonResponse('User retrieved') },
});
apiPath('patch', '/users/{id}/status', 'Users', 'Update user status', {
  request: { ...params(UserIdParams), body: body(UpdateUserStatusBody) },
  responses: { 200: jsonResponse('User status updated') },
});
apiPath('patch', '/users/{id}', 'Users', 'Update a user', {
  request: { ...params(UserIdParams), body: body(UpdateUserBody) },
  responses: { 200: jsonResponse('User updated') },
});
apiPath('delete', '/users/{id}', 'Users', 'Delete a user', {
  request: params(UserIdParams),
  responses: { 200: jsonResponse('User deleted') },
});

apiPath('get', '/roles/permissions', 'Roles', 'List permissions', {
  responses: { 200: jsonResponse('Permissions retrieved') },
});
apiPath('post', '/roles', 'Roles', 'Create a role', {
  request: { body: body(CreateRoleBody) },
  responses: { 201: jsonResponse('Role created') },
});
apiPath('get', '/roles', 'Roles', 'List roles', {
  request: query(ListRolesQuery),
  responses: { 200: jsonResponse('Roles retrieved') },
});
apiPath('get', '/roles/{id}', 'Roles', 'Get a role', {
  request: params(RoleIdParams),
  responses: { 200: jsonResponse('Role retrieved') },
});
apiPath('patch', '/roles/{id}', 'Roles', 'Update a role', {
  request: { ...params(RoleIdParams), body: body(UpdateRoleBody) },
  responses: { 200: jsonResponse('Role updated') },
});
apiPath('delete', '/roles/{id}', 'Roles', 'Delete a role', {
  request: params(RoleIdParams),
  responses: { 200: jsonResponse('Role deleted') },
});

apiPath('post', '/suppliers', 'Suppliers', 'Create a supplier', {
  request: { body: body(CreateSupplierBody) },
  responses: { 201: jsonResponse('Supplier created') },
});
apiPath('get', '/suppliers', 'Suppliers', 'List suppliers', {
  request: query(ListSuppliersQuery),
  responses: { 200: jsonResponse('Suppliers retrieved') },
});
apiPath('get', '/suppliers/{id}', 'Suppliers', 'Get a supplier', {
  request: params(SupplierIdParams),
  responses: { 200: jsonResponse('Supplier retrieved') },
});
apiPath('patch', '/suppliers/{id}/status', 'Suppliers', 'Update supplier status', {
  request: { ...params(SupplierIdParams), body: body(UpdateSupplierStatusBody) },
  responses: { 200: jsonResponse('Supplier status updated') },
});
apiPath('patch', '/suppliers/{id}', 'Suppliers', 'Update a supplier', {
  request: { ...params(SupplierIdParams), body: body(UpdateSupplierBody) },
  responses: { 200: jsonResponse('Supplier updated') },
});
apiPath('delete', '/suppliers/{id}', 'Suppliers', 'Delete a supplier', {
  request: params(SupplierIdParams),
  responses: { 200: jsonResponse('Supplier deleted') },
});

apiPath('post', '/product-requests', 'Product Requests', 'Create a product request', {
  request: { body: body(CreateProductRequestBody) },
  responses: { 201: jsonResponse('Product request created') },
});
apiPath('get', '/product-requests', 'Product Requests', 'List product requests', {
  request: query(ListProductRequestsQuery),
  responses: { 200: jsonResponse('Product requests retrieved') },
});
apiPath('get', '/product-requests/{id}', 'Product Requests', 'Get a product request', {
  request: params(ProductRequestIdParams),
  responses: { 200: jsonResponse('Product request retrieved') },
});
apiPath('patch', '/product-requests/{id}/status', 'Product Requests', 'Update request status', {
  request: { ...params(ProductRequestIdParams), body: body(UpdateProductRequestStatusBody) },
  responses: { 200: jsonResponse('Product request status updated') },
});
apiPath('patch', '/product-requests/{id}/assign', 'Product Requests', 'Assign a request', {
  request: { ...params(ProductRequestIdParams), body: body(AssignProductRequestBody) },
  responses: { 200: jsonResponse('Product request assigned') },
});
apiPath('patch', '/product-requests/{id}', 'Product Requests', 'Update a product request', {
  request: { ...params(ProductRequestIdParams), body: body(UpdateProductRequestBody) },
  responses: { 200: jsonResponse('Product request updated') },
});
apiPath('delete', '/product-requests/{id}', 'Product Requests', 'Delete a product request', {
  request: params(ProductRequestIdParams),
  responses: { 200: jsonResponse('Product request deleted') },
});

apiPath('post', '/quotations', 'Quotations', 'Create a quotation', {
  request: { body: body(CreateQuotationBody) },
  responses: { 201: jsonResponse('Quotation created') },
});
apiPath('get', '/quotations', 'Quotations', 'List quotations', {
  request: query(ListQuotationsQuery),
  responses: { 200: jsonResponse('Quotations retrieved') },
});
apiPath('get', '/quotations/{id}', 'Quotations', 'Get a quotation', {
  request: params(QuotationIdParams),
  responses: { 200: jsonResponse('Quotation retrieved') },
});
apiPath('patch', '/quotations/{id}/status', 'Quotations', 'Update quotation status', {
  request: { ...params(QuotationIdParams), body: body(UpdateQuotationStatusBody) },
  responses: { 200: jsonResponse('Quotation status updated') },
});
apiPath('patch', '/quotations/{id}/approve', 'Quotations', 'Approve a quotation', {
  request: params(QuotationIdParams),
  responses: { 200: jsonResponse('Quotation approved') },
});
apiPath('patch', '/quotations/{id}', 'Quotations', 'Update a quotation', {
  request: { ...params(QuotationIdParams), body: body(UpdateQuotationBody) },
  responses: { 200: jsonResponse('Quotation updated') },
});
apiPath('delete', '/quotations/{id}', 'Quotations', 'Delete a quotation', {
  request: params(QuotationIdParams),
  responses: { 200: jsonResponse('Quotation deleted') },
});

apiPath('post', '/purchase-orders', 'Purchase Orders', 'Create a purchase order', {
  request: { body: body(CreatePurchaseOrderBody) },
  responses: { 201: jsonResponse('Purchase order created') },
});
apiPath('get', '/purchase-orders', 'Purchase Orders', 'List purchase orders', {
  request: query(ListPurchaseOrdersQuery),
  responses: { 200: jsonResponse('Purchase orders retrieved') },
});
apiPath('get', '/purchase-orders/{id}', 'Purchase Orders', 'Get a purchase order', {
  request: params(PurchaseOrderIdParams),
  responses: { 200: jsonResponse('Purchase order retrieved') },
});
apiPath('patch', '/purchase-orders/{id}/status', 'Purchase Orders', 'Update order status', {
  request: { ...params(PurchaseOrderIdParams), body: body(UpdatePurchaseOrderStatusBody) },
  responses: { 200: jsonResponse('Purchase order status updated') },
});
apiPath('patch', '/purchase-orders/{id}/approve', 'Purchase Orders', 'Approve an order', {
  request: params(PurchaseOrderIdParams),
  responses: { 200: jsonResponse('Purchase order approved') },
});
apiPath('patch', '/purchase-orders/{id}', 'Purchase Orders', 'Update a purchase order', {
  request: { ...params(PurchaseOrderIdParams), body: body(UpdatePurchaseOrderBody) },
  responses: { 200: jsonResponse('Purchase order updated') },
});
apiPath('delete', '/purchase-orders/{id}', 'Purchase Orders', 'Delete a purchase order', {
  request: params(PurchaseOrderIdParams),
  responses: { 200: jsonResponse('Purchase order deleted') },
});

apiPath('post', '/quality-control', 'Quality Control', 'Create a QC report', {
  request: { body: body(CreateQcReportBody) },
  responses: { 201: jsonResponse('QC report created') },
});
apiPath('get', '/quality-control', 'Quality Control', 'List QC reports', {
  request: query(ListQcReportsQuery),
  responses: { 200: jsonResponse('QC reports retrieved') },
});
apiPath('get', '/quality-control/{id}', 'Quality Control', 'Get a QC report', {
  request: params(QcReportIdParams),
  responses: { 200: jsonResponse('QC report retrieved') },
});
apiPath('patch', '/quality-control/{id}/status', 'Quality Control', 'Update QC status', {
  request: { ...params(QcReportIdParams), body: body(UpdateQcReportStatusBody) },
  responses: { 200: jsonResponse('QC status updated') },
});
apiPath('patch', '/quality-control/{id}', 'Quality Control', 'Update a QC report', {
  request: { ...params(QcReportIdParams), body: body(UpdateQcReportBody) },
  responses: { 200: jsonResponse('QC report updated') },
});

apiPath('post', '/shipments', 'Shipments', 'Create a shipment', {
  request: { body: body(CreateShipmentBody) },
  responses: { 201: jsonResponse('Shipment created') },
});
apiPath('get', '/shipments', 'Shipments', 'List shipments', {
  request: query(ListShipmentsQuery),
  responses: { 200: jsonResponse('Shipments retrieved') },
});
apiPath('get', '/shipments/{id}', 'Shipments', 'Get a shipment', {
  request: params(ShipmentIdParams),
  responses: { 200: jsonResponse('Shipment retrieved') },
});
apiPath('patch', '/shipments/{id}/status', 'Shipments', 'Update shipment status', {
  request: { ...params(ShipmentIdParams), body: body(UpdateShipmentStatusBody) },
  responses: { 200: jsonResponse('Shipment status updated') },
});
apiPath('patch', '/shipments/{id}', 'Shipments', 'Update a shipment', {
  request: { ...params(ShipmentIdParams), body: body(UpdateShipmentBody) },
  responses: { 200: jsonResponse('Shipment updated') },
});

apiPath('post', '/customs', 'Customs', 'Create a customs record', {
  request: { body: body(CreateCustomsRecordBody) },
  responses: { 201: jsonResponse('Customs record created') },
});
apiPath('get', '/customs', 'Customs', 'List customs records', {
  request: query(ListCustomsRecordsQuery),
  responses: { 200: jsonResponse('Customs records retrieved') },
});
apiPath('get', '/customs/{id}', 'Customs', 'Get a customs record', {
  request: params(CustomsRecordIdParams),
  responses: { 200: jsonResponse('Customs record retrieved') },
});
apiPath('patch', '/customs/{id}/status', 'Customs', 'Update customs status', {
  request: { ...params(CustomsRecordIdParams), body: body(UpdateCustomsStatusBody) },
  responses: { 200: jsonResponse('Customs status updated') },
});
apiPath('patch', '/customs/{id}', 'Customs', 'Update a customs record', {
  request: { ...params(CustomsRecordIdParams), body: body(UpdateCustomsRecordBody) },
  responses: { 200: jsonResponse('Customs record updated') },
});
apiPath('delete', '/customs/{id}', 'Customs', 'Delete a customs record', {
  request: params(CustomsRecordIdParams),
  responses: { 200: jsonResponse('Customs record deleted') },
});

apiPath('post', '/finance/ledger-entries', 'Finance', 'Create a ledger entry', {
  request: { body: body(CreateLedgerEntryBody) },
  responses: { 201: jsonResponse('Ledger entry created') },
});
apiPath('get', '/finance/ledger-entries', 'Finance', 'List ledger entries', {
  request: query(ListLedgerEntriesQuery),
  responses: { 200: jsonResponse('Ledger entries retrieved') },
});
apiPath('get', '/finance/ledger-entries/export', 'Finance', 'Export ledger entries as CSV', {
  request: query(ExportLedgerEntriesQuery),
  responses: { 200: csvResponse('CSV export') },
});
apiPath('get', '/finance/ledger-entries/{id}', 'Finance', 'Get a ledger entry', {
  request: params(LedgerEntryIdParams),
  responses: { 200: jsonResponse('Ledger entry retrieved') },
});
apiPath('patch', '/finance/ledger-entries/{id}/approve', 'Finance', 'Approve a ledger entry', {
  request: params(LedgerEntryIdParams),
  responses: { 200: jsonResponse('Ledger entry approved') },
});
apiPath('patch', '/finance/ledger-entries/{id}/void', 'Finance', 'Void a ledger entry', {
  request: params(LedgerEntryIdParams),
  responses: { 200: jsonResponse('Ledger entry voided') },
});
apiPath('patch', '/finance/ledger-entries/{id}', 'Finance', 'Update a ledger entry', {
  request: { ...params(LedgerEntryIdParams), body: body(UpdateLedgerEntryBody) },
  responses: { 200: jsonResponse('Ledger entry updated') },
});
apiPath('get', '/finance/profit', 'Finance', 'Get per-order profit', {
  request: query(PurchaseOrderProfitQuery),
  responses: { 200: jsonResponse('Profit retrieved') },
});

const attachmentUploadSchema = {
  type: 'object' as const,
  properties: {
    file: { type: 'string' as const, format: 'binary' },
    entityType: { type: 'string' as const, enum: [...ATTACHMENT_ENTITY_TYPES] },
    entityId: { type: 'string' as const },
  },
  required: ['file', 'entityType', 'entityId'],
};

apiPath('post', '/attachments', 'Attachments', 'Upload an attachment', {
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: attachmentUploadSchema,
        },
      },
    },
  },
  responses: { 201: jsonResponse('Attachment uploaded') },
});
apiPath('get', '/attachments', 'Attachments', 'List attachments for an entity', {
  request: query(ListAttachmentsQuery),
  responses: { 200: jsonResponse('Attachments retrieved') },
});
apiPath('get', '/attachments/{id}', 'Attachments', 'Get an attachment', {
  request: params(AttachmentIdParams),
  responses: { 200: jsonResponse('Attachment retrieved') },
});
apiPath('delete', '/attachments/{id}', 'Attachments', 'Delete an attachment', {
  request: params(AttachmentIdParams),
  responses: { 200: jsonResponse('Attachment deleted') },
});

apiPath('get', '/consignments', 'Consignments', 'List consignments', {
  responses: { 200: jsonResponse('Consignments retrieved') },
});
apiPath('post', '/consignments', 'Consignments', 'Create a consignment', {
  responses: { 201: jsonResponse('Consignment created') },
});
apiPath('get', '/consignments/users', 'Consignments', 'List consignments by user', {
  responses: { 200: jsonResponse('Consignments retrieved') },
});
apiPath('get', '/consignments/{id}', 'Consignments', 'Get a consignment', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('Consignment retrieved') },
});
apiPath('put', '/consignments/{id}', 'Consignments', 'Update a consignment', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('Consignment updated') },
});
apiPath('delete', '/consignments/{id}', 'Consignments', 'Delete a consignment', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('Consignment deleted') },
});
apiPath('post', '/consignments/{id}/product', 'Consignments', 'Add a product', {
  request: params(z.object({ id: z.string() })),
  responses: { 201: jsonResponse('Product added') },
});
apiPath('put', '/consignments/{id}/product', 'Consignments', 'Update a product', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('Product updated') },
});
apiPath('post', '/consignments/{id}/payment', 'Consignments', 'Add a payment', {
  request: params(z.object({ id: z.string() })),
  responses: { 201: jsonResponse('Transaction added') },
});

apiPath('get', '/reports', 'Reports', 'Get business reports', {
  responses: { 200: jsonResponse('Report retrieved') },
});

apiPath('get', '/directory/users', 'Directory', 'List directory users', {
  responses: { 200: jsonResponse('Users retrieved') },
});
apiPath('post', '/directory/users', 'Directory', 'Create a directory user', {
  responses: { 201: jsonResponse('User created') },
});
apiPath('get', '/directory/users/{id}', 'Directory', 'Get a directory user', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('User retrieved') },
});
apiPath('put', '/directory/users/{id}', 'Directory', 'Update a directory user', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('User updated') },
});
apiPath('delete', '/directory/users/{id}', 'Directory', 'Delete a directory user', {
  request: params(z.object({ id: z.string() })),
  responses: { 200: jsonResponse('User deleted') },
});

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Liveness check',
  security: [],
  responses: { 200: jsonResponse('Service is alive') },
});
registry.registerPath({
  method: 'get',
  path: '/health/ready',
  tags: ['Health'],
  summary: 'Readiness check',
  security: [],
  responses: { 200: jsonResponse('Service is ready') },
});

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'CRM API',
    version: '1.0.0',
    description: 'Business manager CRM API',
  },
  servers: [{ url: `http://localhost:${env.PORT}` }],
  tags: [
    { name: 'Auth', description: 'Authentication and session management' },
    { name: 'Customers', description: 'Customer records' },
    { name: 'Users', description: 'User administration' },
    { name: 'Roles', description: 'Roles and permissions' },
    { name: 'Suppliers', description: 'Supplier records' },
    { name: 'Product Requests', description: 'Customer product requests' },
    { name: 'Quotations', description: 'Quotations and approval' },
    { name: 'Purchase Orders', description: 'Purchase orders' },
    { name: 'Quality Control', description: 'QC inspections' },
    { name: 'Shipments', description: 'Shipment consolidation and tracking' },
    { name: 'Customs', description: 'Customs clearance records' },
    { name: 'Finance', description: 'Append-only ledger and profit' },
    { name: 'Attachments', description: 'Cloudinary-backed file attachments' },
    { name: 'Consignments', description: 'Consignment tracking and profitability' },
    { name: 'Reports', description: 'Business reporting and analytics' },
    { name: 'Directory', description: 'Web-compatible user, customer, and supplier directory' },
    { name: 'Health', description: 'Liveness and readiness checks' },
  ],
});
