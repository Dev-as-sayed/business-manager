import {
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  KeyRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { env } from '@/app/env';
import { NAV_GROUPS, getNavItemForPath } from '@/app/navigation';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { useLogoutMutation } from '@/features/auth/auth.api';
import { BrandMark } from '@/layouts/BrandMark';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { usePermission } from '@/shared/hooks/usePermission';
import { useTheme } from '@/shared/hooks/useTheme';
import { initials } from '@/shared/utils/format';
import { roleLabel } from '@/shared/utils/roles';
import { cn } from '@/shared/utils/cn';

interface RouteHandle {
  title?: string;
}

const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { can, role } = usePermission();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Main">
      {NAV_GROUPS.map((group) => {
        const visibleItems = group.items.filter((item) => {
          if (item.roles && (!role || !item.roles.includes(role))) return false;
          if (item.permission && !can(item.permission.resource, item.permission.action)) return false;
          return true;
        });

        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label} className="space-y-1">
            <p className="px-2 font-mono text-[9px] uppercase tracking-[0.22em] text-sidebar-muted">
              {group.label}
            </p>
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-active text-sidebar-foreground'
                      : 'text-sidebar-foreground/65 hover:bg-sidebar-active/50 hover:text-sidebar-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute inset-y-1 left-0 w-0.5 rounded-full',
                        isActive ? 'bg-accent' : 'bg-transparent',
                      )}
                      aria-hidden
                    />
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
};

const SidebarShell = ({ onNavigate }: { onNavigate?: () => void }) => {
  const user = useAppSelector(selectAuthUser);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-foreground/10 px-5 py-5">
        <BrandMark inverted />
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div className="border-t border-sidebar-foreground/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="border-sidebar-foreground/20">
            <AvatarFallback className="bg-sidebar-active text-sidebar-foreground">
              {user ? initials(user.firstName, user.lastName) : '—'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              {user ? `${user.firstName} ${user.lastName}` : '—'}
            </p>
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-sidebar-muted">
              {roleLabel(user?.role)}
            </p>
          </div>
        </div>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-sidebar-muted">
          {env.VITE_APP_NAME} / v0.1
        </p>
      </div>
    </div>
  );
};

export const DashboardLayout = () => {
  const user = useAppSelector(selectAuthUser);
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const matches = useMatches();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  const activeNav = getNavItemForPath(location.pathname);
  const activeHandle = [...matches]
    .reverse()
    .map((match) => match.handle as RouteHandle | undefined)
    .find((handle) => handle?.title);
  const pageTitle = activeHandle?.title;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} · ${env.VITE_APP_NAME}`
      : env.VITE_APP_NAME;
  }, [pageTitle]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Local session is cleared regardless.
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarShell />
      </aside>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="left-0 top-0 h-svh w-72 max-w-[82vw] translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <SidebarShell onNavigate={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>

            <nav className="flex min-w-0 flex-1 items-center gap-1.5" aria-label="Breadcrumb">
              <Link
                to="/dashboard"
                className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Desk
              </Link>
              {activeNav ? (
                <>
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {activeNav.label}
                  </span>
                </>
              ) : null}
              {pageTitle && pageTitle !== activeNav?.label ? (
                <>
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                    {pageTitle}
                  </span>
                </>
              ) : null}
            </nav>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Account menu">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-secondary text-[10px]">
                        {user ? initials(user.firstName, user.lastName) : '—'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                  <div className="px-2 pb-2">
                    <p className="truncate text-sm font-medium">
                      {user ? `${user.firstName} ${user.lastName}` : '—'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                      {roleLabel(user?.role)}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/profile')}>
                    <UserRound className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/change-password')}>
                    <KeyRound className="size-4" />
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    disabled={loggingOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
