import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { AppShell } from "./components/app/AppShell";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";
import { AIResearchPage } from "./pages/AIResearchPage";
import { AdminPage } from "./pages/AdminPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GradesPage } from "./pages/GradesPage";
import { LoginPage } from "./pages/LoginPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { PlannerPage } from "./pages/PlannerPage";
import { SetupProfilePage } from "./pages/SetupProfilePage";
import { StoragePage } from "./pages/StoragePage";
import { TimetablePage } from "./pages/TimetablePage";

// ---- Root route ----
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-2xl bg-lavender-light animate-pulse" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">
              📚
            </span>
          </div>
          <p className="text-muted-foreground font-body text-sm">
            Initializing…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return <AuthenticatedRoot />;
}

function AuthenticatedRoot() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();

  if (isActorFetching || isProfileLoading || (!actor && !profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-lavender-light animate-pulse" />
          <p className="text-muted-foreground font-body text-sm">
            Loading BoardBoss…
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.name) {
    return <SetupProfilePage />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

// ---- Routes ----
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    const navigate = useNavigate();
    void navigate({ to: "/dashboard", replace: true });
    return null;
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const plannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/planner",
  component: PlannerPage,
});

const timetableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/timetable",
  component: TimetablePage,
});

const materialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/materials",
  component: MaterialsPage,
});

const storageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/storage",
  component: StoragePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const researchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/research",
  component: AIResearchPage,
});

const gradesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/grades",
  component: GradesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  plannerRoute,
  timetableRoute,
  materialsRoute,
  storageRoute,
  adminRoute,
  researchRoute,
  gradesRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}
