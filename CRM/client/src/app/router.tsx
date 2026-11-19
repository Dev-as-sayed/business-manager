import { lazy, type ReactNode } from 'react';
import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isDesktop } from '@/app/platform';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PermissionGuard } from '@/shared/guards/PermissionGuard';
import { ProtectedRoute } from '@/shared/guards/ProtectedRoute';
import { RoleGuard } from '@/shared/guards/RoleGuard';
import { RouteErrorBoundary } from '@/shared/components/route-error-boundary';
import { getDefaultRoute } from '@/shared/utils/roles';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const ForbiddenPage = lazy(() =>
  import('@/features/auth/pages/ForbiddenPage').then((module) => ({
    default: module.ForbiddenPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('@/features/auth/pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
const AssignmentsPage = lazy(() =>
  import('@/features/assignments/pages/AssignmentsPage').then((module) => ({
    default: module.AssignmentsPage,
  })),
);
const CustomersListPage = lazy(() =>
  import('@/features/customers/pages/CustomersListPage').then((module) => ({
    default: module.CustomersListPage,
  })),
);
const CustomerDetailPage = lazy(() =>
  import('@/features/customers/pages/CustomerDetailPage').then((module) => ({
    default: module.CustomerDetailPage,
  })),
);
const CustomerFormPage = lazy(() =>
  import('@/features/customers/pages/CustomerFormPage').then((module) => ({
    default: module.CustomerFormPage,
  })),
);
const SuppliersListPage = lazy(() =>
  import('@/features/suppliers/pages/SuppliersListPage').then((module) => ({
    default: module.SuppliersListPage,
  })),
);
const SupplierDetailPage = lazy(() =>
  import('@/features/suppliers/pages/SupplierDetailPage').then((module) => ({
    default: module.SupplierDetailPage,
  })),
);
const SupplierFormPage = lazy(() =>
  import('@/features/suppliers/pages/SupplierFormPage').then((module) => ({
    default: module.SupplierFormPage,
  })),
);
const ProductRequestsListPage = lazy(() =>
  import('@/features/product-requests/pages/ProductRequestsListPage').then((module) => ({
    default: module.ProductRequestsListPage,
  })),
);
const ProductRequestDetailPage = lazy(() =>
  import('@/features/product-requests/pages/ProductRequestDetailPage').then((module) => ({
    default: module.ProductRequestDetailPage,
  })),
);
const ProductRequestFormPage = lazy(() =>
  import('@/features/product-requests/pages/ProductRequestFormPage').then((module) => ({
    default: module.ProductRequestFormPage,
  })),
);
const QuotationsListPage = lazy(() =>
  import('@/features/quotations/pages/QuotationsListPage').then((module) => ({
    default: module.QuotationsListPage,
  })),
);
const QuotationDetailPage = lazy(() =>
  import('@/features/quotations/pages/QuotationDetailPage').then((module) => ({
    default: module.QuotationDetailPage,
  })),
);
const QuotationFormPage = lazy(() =>
  import('@/features/quotations/pages/QuotationFormPage').then((module) => ({
    default: module.QuotationFormPage,
  })),
);
const PurchaseOrdersListPage = lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrdersListPage').then((module) => ({
    default: module.PurchaseOrdersListPage,
  })),
);
const PurchaseOrderDetailPage = lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrderDetailPage').then((module) => ({
    default: module.PurchaseOrderDetailPage,
  })),
);
const PurchaseOrderFormPage = lazy(() =>
  import('@/features/purchase-orders/pages/PurchaseOrderFormPage').then((module) => ({
    default: module.PurchaseOrderFormPage,
  })),
);
const QualityControlListPage = lazy(() =>
  import('@/features/quality-control/pages/QualityControlListPage').then((module) => ({
    default: module.QualityControlListPage,
  })),
);
const QualityControlDetailPage = lazy(() =>
  import('@/features/quality-control/pages/QualityControlDetailPage').then((module) => ({
    default: module.QualityControlDetailPage,
  })),
);
const QualityControlFormPage = lazy(() =>
  import('@/features/quality-control/pages/QualityControlFormPage').then((module) => ({
    default: module.QualityControlFormPage,
  })),
);
const ShipmentsListPage = lazy(() =>
  import('@/features/shipments/pages/ShipmentsListPage').then((module) => ({
    default: module.ShipmentsListPage,
  })),
);
const ShipmentDetailPage = lazy(() =>
  import('@/features/shipments/pages/ShipmentDetailPage').then((module) => ({
    default: module.ShipmentDetailPage,
  })),
);
const ShipmentFormPage = lazy(() =>
  import('@/features/shipments/pages/ShipmentFormPage').then((module) => ({
    default: module.ShipmentFormPage,
  })),
);
const CustomsListPage = lazy(() =>
  import('@/features/customs/pages/CustomsListPage').then((module) => ({
    default: module.CustomsListPage,
  })),
);
const CustomsDetailPage = lazy(() =>
  import('@/features/customs/pages/CustomsDetailPage').then((module) => ({
    default: module.CustomsDetailPage,
  })),
);
const CustomsFormPage = lazy(() =>
  import('@/features/customs/pages/CustomsFormPage').then((module) => ({
    default: module.CustomsFormPage,
  })),
);
const FinanceListPage = lazy(() =>
  import('@/features/finance/pages/FinanceListPage').then((module) => ({
    default: module.FinanceListPage,
  })),
);
const FinanceDetailPage = lazy(() =>
  import('@/features/finance/pages/FinanceDetailPage').then((module) => ({
    default: module.FinanceDetailPage,
  })),
);
const FinanceFormPage = lazy(() =>
  import('@/features/finance/pages/FinanceFormPage').then((module) => ({
    default: module.FinanceFormPage,
  })),
);
const UsersListPage = lazy(() =>
  import('@/features/users/pages/UsersListPage').then((module) => ({
    default: module.UsersListPage,
  })),
);
const UserDetailPage = lazy(() =>
  import('@/features/users/pages/UserDetailPage').then((module) => ({
    default: module.UserDetailPage,
  })),
);
const UserFormPage = lazy(() =>
  import('@/features/users/pages/UserFormPage').then((module) => ({
    default: module.UserFormPage,
  })),
);
const RolesListPage = lazy(() =>
  import('@/features/roles/pages/RolesListPage').then((module) => ({
    default: module.RolesListPage,
  })),
);
const RoleDetailPage = lazy(() =>
  import('@/features/roles/pages/RoleDetailPage').then((module) => ({
    default: module.RoleDetailPage,
  })),
);
const RoleFormPage = lazy(() =>
  import('@/features/roles/pages/RoleFormPage').then((module) => ({
    default: module.RoleFormPage,
  })),
);
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import('@/features/auth/pages/ChangePasswordPage').then((module) => ({
    default: module.ChangePasswordPage,
  })),
);

const guard = (page: ReactNode, resource: string, action = 'read', roles?: string[]): ReactNode => (
  <PermissionGuard resource={resource} action={action}>
    {roles ? <RoleGuard roles={roles}>{page}</RoleGuard> : page}
  </PermissionGuard>
);

const HomeRedirect = () => {
  const user = useAppSelector(selectAuthUser);
  return <Navigate to={user ? getDefaultRoute(user.role) : '/login'} replace />;
};

const routeConfig = [
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage />, handle: { title: 'Sign in' } },
          {
            path: '/forgot-password',
            element: <ForgotPasswordPage />,
            handle: { title: 'Forgot password' },
          },
          {
            path: '/reset-password',
            element: <ResetPasswordPage />,
            handle: { title: 'Reset password' },
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <HomeRedirect /> },
              { path: '/dashboard', element: <DashboardPage />, handle: { title: 'Dashboard' } },
              {
                path: '/assignments',
                element: guard(<AssignmentsPage />, 'product_requests', 'read', [
                  'CHINA_OPERATIONS',
                ]),
                handle: { title: 'Assignments' },
              },
              {
                path: '/customers',
                element: guard(<CustomersListPage />, 'customers'),
                handle: { title: 'Customers' },
              },
              {
                path: '/customers/new',
                element: guard(<CustomerFormPage />, 'customers', 'create'),
                handle: { title: 'New customer' },
              },
              {
                path: '/customers/:id',
                element: guard(<CustomerDetailPage />, 'customers'),
                handle: { title: 'Customer' },
              },
              {
                path: '/customers/:id/edit',
                element: guard(<CustomerFormPage />, 'customers', 'update'),
                handle: { title: 'Edit customer' },
              },
              {
                path: '/suppliers',
                element: guard(<SuppliersListPage />, 'suppliers'),
                handle: { title: 'Suppliers' },
              },
              {
                path: '/suppliers/new',
                element: guard(<SupplierFormPage />, 'suppliers', 'create'),
                handle: { title: 'New supplier' },
              },
              {
                path: '/suppliers/:id',
                element: guard(<SupplierDetailPage />, 'suppliers'),
                handle: { title: 'Supplier' },
              },
              {
                path: '/suppliers/:id/edit',
                element: guard(<SupplierFormPage />, 'suppliers', 'update'),
                handle: { title: 'Edit supplier' },
              },
              {
                path: '/product-requests',
                element: guard(<ProductRequestsListPage />, 'product_requests'),
                handle: { title: 'Product requests' },
              },
              {
                path: '/product-requests/new',
                element: guard(<ProductRequestFormPage />, 'product_requests', 'create'),
                handle: { title: 'New request' },
              },
              {
                path: '/product-requests/:id',
                element: guard(<ProductRequestDetailPage />, 'product_requests'),
                handle: { title: 'Product request' },
              },
              {
                path: '/product-requests/:id/edit',
                element: guard(<ProductRequestFormPage />, 'product_requests', 'update'),
                handle: { title: 'Edit request' },
              },
              {
                path: '/quotations',
                element: guard(<QuotationsListPage />, 'quotations'),
                handle: { title: 'Quotations' },
              },
              {
                path: '/quotations/new',
                element: guard(<QuotationFormPage />, 'quotations', 'create'),
                handle: { title: 'New quotation' },
              },
              {
                path: '/quotations/:id',
                element: guard(<QuotationDetailPage />, 'quotations'),
                handle: { title: 'Quotation' },
              },
              {
                path: '/quotations/:id/edit',
                element: guard(<QuotationFormPage />, 'quotations', 'update'),
                handle: { title: 'Edit quotation' },
              },
              {
                path: '/purchase-orders',
                element: guard(<PurchaseOrdersListPage />, 'purchase_orders'),
                handle: { title: 'Purchase orders' },
              },
              {
                path: '/purchase-orders/new',
                element: guard(<PurchaseOrderFormPage />, 'purchase_orders', 'create'),
                handle: { title: 'New purchase order' },
              },
              {
                path: '/purchase-orders/:id',
                element: guard(<PurchaseOrderDetailPage />, 'purchase_orders'),
                handle: { title: 'Purchase order' },
              },
              {
                path: '/purchase-orders/:id/edit',
                element: guard(<PurchaseOrderFormPage />, 'purchase_orders', 'update'),
                handle: { title: 'Edit purchase order' },
              },
              {
                path: '/quality-control',
                element: guard(<QualityControlListPage />, 'quality_control'),
                handle: { title: 'Quality control' },
              },
              {
                path: '/quality-control/new',
                element: guard(<QualityControlFormPage />, 'quality_control', 'create'),
                handle: { title: 'New QC report' },
              },
              {
                path: '/quality-control/:id',
                element: guard(<QualityControlDetailPage />, 'quality_control'),
                handle: { title: 'QC report' },
              },
              {
                path: '/quality-control/:id/edit',
                element: guard(<QualityControlFormPage />, 'quality_control', 'update'),
                handle: { title: 'Edit QC report' },
              },
              {
                path: '/shipments',
                element: guard(<ShipmentsListPage />, 'shipments'),
                handle: { title: 'Shipments' },
              },
              {
                path: '/shipments/new',
                element: guard(<ShipmentFormPage />, 'shipments', 'create'),
                handle: { title: 'New shipment' },
              },
              {
                path: '/shipments/:id',
                element: guard(<ShipmentDetailPage />, 'shipments'),
                handle: { title: 'Shipment' },
              },
              {
                path: '/shipments/:id/edit',
                element: guard(<ShipmentFormPage />, 'shipments', 'update'),
                handle: { title: 'Edit shipment' },
              },
              {
                path: '/customs',
                element: guard(<CustomsListPage />, 'customs'),
                handle: { title: 'Customs' },
              },
              {
                path: '/customs/new',
                element: guard(<CustomsFormPage />, 'customs', 'create'),
                handle: { title: 'New customs record' },
              },
              {
                path: '/customs/:id',
                element: guard(<CustomsDetailPage />, 'customs'),
                handle: { title: 'Customs record' },
              },
              {
                path: '/customs/:id/edit',
                element: guard(<CustomsFormPage />, 'customs', 'update'),
                handle: { title: 'Edit customs record' },
              },
              {
                path: '/finance',
                element: guard(<FinanceListPage />, 'finance'),
                handle: { title: 'Finance' },
              },
              {
                path: '/finance/new',
                element: guard(<FinanceFormPage />, 'finance', 'create'),
                handle: { title: 'New ledger entry' },
              },
              {
                path: '/finance/:id',
                element: guard(<FinanceDetailPage />, 'finance'),
                handle: { title: 'Ledger entry' },
              },
              {
                path: '/finance/:id/edit',
                element: guard(<FinanceFormPage />, 'finance', 'update'),
                handle: { title: 'Edit ledger entry' },
              },
              {
                path: '/users',
                element: guard(<UsersListPage />, 'users'),
                handle: { title: 'Users' },
              },
              {
                path: '/users/new',
                element: guard(<UserFormPage />, 'users', 'create'),
                handle: { title: 'New user' },
              },
              {
                path: '/users/:id',
                element: guard(<UserDetailPage />, 'users'),
                handle: { title: 'User' },
              },
              {
                path: '/users/:id/edit',
                element: guard(<UserFormPage />, 'users', 'update'),
                handle: { title: 'Edit user' },
              },
              {
                path: '/roles',
                element: guard(<RolesListPage />, 'roles'),
                handle: { title: 'Roles' },
              },
              {
                path: '/roles/new',
                element: guard(<RoleFormPage />, 'roles', 'create'),
                handle: { title: 'New role' },
              },
              {
                path: '/roles/:id',
                element: guard(<RoleDetailPage />, 'roles'),
                handle: { title: 'Role' },
              },
              {
                path: '/roles/:id/edit',
                element: guard(<RoleFormPage />, 'roles', 'update'),
                handle: { title: 'Edit role' },
              },
              { path: '/profile', element: <ProfilePage />, handle: { title: 'Profile' } },
              {
                path: '/change-password',
                element: <ChangePasswordPage />,
                handle: { title: 'Change password' },
              },
              { path: '/403', element: <ForbiddenPage />, handle: { title: 'Restricted' } },
              { path: '*', element: <NotFoundPage />, handle: { title: 'Not found' } },
            ],
          },
        ],
      },
    ],
  },
];

export const router = isDesktop ? createHashRouter(routeConfig) : createBrowserRouter(routeConfig);
