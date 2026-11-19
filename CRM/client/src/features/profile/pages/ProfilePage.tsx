import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { PageHeader } from '@/shared/components/page-header';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import { formatDateTime } from '@/shared/utils/format';
import { roleLabel } from '@/shared/utils/roles';

export const ProfilePage = () => {
  const user = useAppSelector(selectAuthUser);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Account"
        title={`${user.firstName} ${user.lastName}`}
        description={`${roleLabel(user.role)} · ${user.email}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/change-password">
              <KeyRound className="size-4" />
              Change password
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <DetailSection title="Identity">
          <DetailList
            items={[
              { label: 'First name', value: user.firstName },
              { label: 'Last name', value: user.lastName },
              {
                label: 'Email',
                value: (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    {user.email}
                  </span>
                ),
              },
              { label: 'Phone', value: user.phone || '—', mono: Boolean(user.phone) },
              { label: 'Status', value: <StatusBadge status={user.status} /> },
              { label: 'Role', value: roleLabel(user.role) },
            ]}
          />
        </DetailSection>

        <DetailSection title="Session">
          <DetailList
            items={[
              { label: 'Last login', value: formatDateTime(user.lastLoginAt) },
              { label: 'Member since', value: formatDateTime(user.createdAt) },
              {
                label: 'Customer scope',
                value: user.customerId ? 'Linked customer account' : 'Internal user',
              },
              {
                label: 'Security',
                value: (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-muted-foreground" />
                    Password sign-in
                  </span>
                ),
              },
            ]}
          />
        </DetailSection>
      </div>

      <DetailSection
        title={`Permissions (${user.permissions.length})`}
        action={
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Granted by role
          </span>
        }
      >
        {user.permissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No granular permissions granted.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {user.permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-sm border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {permission}
              </span>
            ))}
          </div>
        )}
      </DetailSection>
    </div>
  );
};
