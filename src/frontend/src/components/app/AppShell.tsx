import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  GraduationCap,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  ocid: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    to: "/planner",
    label: "Planner",
    icon: CheckSquare,
    ocid: "nav.planner.link",
  },
  {
    to: "/timetable",
    label: "Timetable",
    icon: Calendar,
    ocid: "nav.timetable.link",
  },
  {
    to: "/materials",
    label: "Materials",
    icon: BookOpen,
    ocid: "nav.materials.link",
  },
  {
    to: "/research",
    label: "Research",
    icon: Search,
    ocid: "nav.research.link",
  },
  {
    to: "/grades",
    label: "Grades",
    icon: GraduationCap,
    ocid: "nav.grades.link",
  },
  {
    to: "/storage",
    label: "Storage",
    icon: HardDrive,
    ocid: "nav.storage.link",
  },
  {
    to: "/admin",
    label: "Admin",
    icon: ShieldCheck,
    adminOnly: true,
    ocid: "nav.admin.link",
  },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("boardboss_dark_mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      try {
        localStorage.setItem("boardboss_dark_mode", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return { dark, toggle };
}

function SidebarItem({
  item,
  isAdmin,
  currentPath,
}: { item: NavItem; isAdmin: boolean; currentPath: string }) {
  if (item.adminOnly && !isAdmin) return null;
  const isActive =
    currentPath === item.to || currentPath.startsWith(`${item.to}/`);

  return (
    <Link
      to={item.to}
      data-ocid={item.ocid}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all",
        isActive
          ? "bg-lavender-light text-lavender shadow-xs"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <item.icon
        className={cn("w-4 h-4 shrink-0", isActive && "text-lavender")}
      />
      <span>{item.label}</span>
    </Link>
  );
}

function BottomNavItem({
  item,
  isAdmin,
  currentPath,
}: { item: NavItem; isAdmin: boolean; currentPath: string }) {
  if (item.adminOnly && !isAdmin) return null;
  const isActive =
    currentPath === item.to || currentPath.startsWith(`${item.to}/`);

  return (
    <Link
      to={item.to}
      data-ocid={item.ocid}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-body transition-all",
        isActive ? "text-lavender" : "text-muted-foreground",
      )}
    >
      <item.icon className={cn("w-5 h-5", isActive && "text-lavender")} />
      <span className="font-medium">{item.label}</span>
    </Link>
  );
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { clear } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const admin = isAdmin ?? false;
  const { dark, toggle } = useDarkMode();

  // Apply dark mode class on initial render
  useEffect(() => {
    const stored = localStorage.getItem("boardboss_dark_mode") === "true";
    if (stored) document.documentElement.classList.add("dark");
  }, []);

  // Visible bottom nav items — show most important ones
  const bottomItems = NAV_ITEMS.filter((i) => !i.adminOnly || admin).slice(
    0,
    5,
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar px-3 py-5 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-lavender-light flex items-center justify-center">
            <span className="text-lg">📚</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            BoardBoss
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              isAdmin={admin}
              currentPath={currentPath}
            />
          ))}
        </nav>

        {/* Dark mode toggle + Logout */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            data-ocid="nav.darkmode.toggle"
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={clear}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span className="font-display font-bold text-base text-foreground">
              BoardBoss
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="text-muted-foreground w-8 h-8 p-0"
              data-ocid="nav.mobile.darkmode.toggle"
            >
              {dark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground"
              data-ocid="nav.mobile.logout.button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-1 flex items-center justify-around z-40 shadow-elevated overflow-x-auto">
          {bottomItems.map((item) => (
            <BottomNavItem
              key={item.to}
              item={item}
              isAdmin={admin}
              currentPath={currentPath}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
