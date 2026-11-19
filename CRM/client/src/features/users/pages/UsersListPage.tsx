import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useListRolesQuery } from '@/features/roles/roles.api';
import {
  USER_STATUS_OPTIONS,
  type ManagedUser,
  type UserStatus,
} from '@/features/users/users.types';
import { useListUsersQuery } from '@/features/users/users.api';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { SearchInput } from '@/shared/components/search-input';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Can } from '@/shared/guards/Can';
import { useTableParams } from '@/shared/hooks/useTableParams';
import { formatRelative } from '@/shared/utils/format';
import { roleLabel } from '@/shared/utils/roles';

export const UsersListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();
  const { data: roles } = useListRolesQuery({ limit: 100 });

  const { data, isLoading, isFetching, error, refetch } = useListUsersQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as UserStatus | undefined) || undefined,
    role: (params.role as string | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<ManagedUser>[] = [
    {
      id: 'name',
      header: 'User',
      sortable: true,
      sortKey: 'firstName',
      cell: (user) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: (user) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{roleLabel(user.role.name)}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {user.role.name}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer link',
      hideBelow: 'lg',
      cell: (user) => (
        <span className="text-sm">{user.customer?.name ?? '—'}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (user) => <StatusBadge status={user.status} />,
    },
    {
      id: 'lastLoginAt',
      header: 'Last login',
      sortable: true,
      sortKey: 'lastLoginAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (user) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {user.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Never'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Access control"
        title="Users"
        description="Staff accounts, role assignments and customer portal access."
        actions={
          <Can resource="users" action="create">
            <Button asChild>
              <Link to="/users/new">
                <Plus className="size-4" />
                New user
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(user) => user.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        emptyTitle="No matching users"
        emptyDescription="Adjust the filters or invite a new team member."
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search name, email, phone…"
              ariaLabel="Search users"
            />
            <Select
              value={(params.status as string) ?? 'ALL'}
              onValueChange={(value) => setFilter('status', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-36" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {USER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(params.role as string) ?? 'ALL'}
              onValueChange={(value) => setFilter('role', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter by role">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                {(roles?.items ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {roleLabel(role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
};
