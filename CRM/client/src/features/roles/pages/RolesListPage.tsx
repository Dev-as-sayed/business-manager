import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Role } from '@/features/roles/roles.types';
import { useListRolesQuery } from '@/features/roles/roles.api';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { SearchInput } from '@/shared/components/search-input';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { useTableParams } from '@/shared/hooks/useTableParams';
import { roleLabel } from '@/shared/utils/roles';

export const RolesListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setPage, setLimit } = useTableParams({
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
  });

  const { data, isLoading, isFetching, error, refetch } = useListRolesQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  });

  const columns: DataTableColumn<Role>[] = [
    {
      id: 'name',
      header: 'Role',
      cell: (role) => (
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            {roleLabel(role.name)}
            {role.isSystem ? <Badge variant="neutral">System</Badge> : null}
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {role.name}
          </p>
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      hideBelow: 'md',
      cell: (role) => (
        <span className="text-sm text-muted-foreground">{role.description || '—'}</span>
      ),
    },
    {
      id: 'users',
      header: 'Users',
      align: 'center',
      hideBelow: 'sm',
      cell: (role) => <span className="font-mono text-xs">{role.userCount}</span>,
    },
    {
      id: 'permissions',
      header: 'Permissions',
      align: 'center',
      cell: (role) => (
        <Badge variant="neutral">
          {role.permissions.length} {role.permissions.length === 1 ? 'grant' : 'grants'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Access control"
        title="Roles"
        description="Permission bundles assigned to staff and portal accounts."
        actions={
          <Can resource="roles" action="create">
            <Button asChild>
              <Link to="/roles/new">
                <Plus className="size-4" />
                New role
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(role) => role.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(role) => navigate(`/roles/${role.id}`)}
        emptyTitle="No roles found"
        emptyDescription="Create a role to bundle permissions for a team."
        toolbar={
          <SearchInput
            value={params.search}
            onChange={setSearch}
            placeholder="Search roles…"
            ariaLabel="Search roles"
          />
        }
      />
    </div>
  );
};
