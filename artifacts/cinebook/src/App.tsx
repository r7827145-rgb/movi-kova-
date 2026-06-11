import { useEffect, useRef } from "react";
import { ThemeProvider } from "./lib/theme";
import { ClerkProvider, SignIn, SignUp, Show } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";

import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import SeatPicker from "./pages/SeatPicker";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TheaterDashboard from "./pages/admin/TheaterDashboard";
import SplashScreen from "./components/SplashScreen";
import { useState } from "react";
import { Redirect } from "wouter";
import { getSession } from "./lib/adminData";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  "pk_test_ZmFzdC10b3J0b2lzZS01OC5jbGVyay5hY2NvdW50cy5kZXYk",
);

const clerkProxyUrl = "";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#1565c0",
    colorForeground: "#f5f5f5",
    colorMutedForeground: "#9e9e9e",
    colorDanger: "#e53935",
    colorBackground: "#1a1a2e",
    colorInput: "#16213e",
    colorInputForeground: "#f5f5f5",
    colorNeutral: "#333",
    fontFamily: "'Space Grotesk', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "glass-modal rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-display font-bold text-2xl",
    headerSubtitle: "text-gray-400 text-sm",
    socialButtonsBlockButtonText: "text-white font-medium",
    formFieldLabel: "text-gray-300 text-sm font-medium",
    footerActionLink: "text-[#42a5f5] hover:text-[#1e88e5] font-semibold",
    footerActionText: "text-gray-400",
    dividerText: "text-gray-500",
    identityPreviewEditButton: "text-[#42a5f5]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-red-300",
    logoBox: "mb-2",
    logoImage: "h-8",
    socialButtonsBlockButton: "border border-white/10 bg-white/5 hover:bg-white/10 text-white",
    formButtonPrimary: "btn-hs-primary w-full justify-center",
    formFieldInput: "bg-[#16213e] border border-white/10 text-white rounded-md focus:border-[#1e88e5] focus:ring-0",
    footerAction: "bg-transparent",
    dividerLine: "bg-white/10",
    alert: "bg-red-900/30 border border-red-500/30",
    otpCodeFieldInput: "bg-[#16213e] border border-white/10 text-white text-xl font-bold rounded-md focus:border-[#1e88e5]",
    formFieldRow: "gap-3",
    main: "gap-5",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(21,101,192,0.15) 0%, #0f0f0f 70%)" }}>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(21,101,192,0.15) 0%, #0f0f0f 70%)" }}>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function SignInRedirect() {
  useEffect(() => {
    window.location.href = `${basePath}/sign-in`;
  }, []);
  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AdminLoginPage() {
  const session = getSession();
  if (session?.type === "theater") return <Redirect to="/admin/theater" />;
  if (session?.type === "admin") return <Redirect to="/admin/dashboard" />;
  return <AdminLogin />;
}

function AdminDashboardPage() {
  const session = getSession();
  if (!session) return <Redirect to="/admin" />;
  if (session.type === "theater") return <Redirect to="/admin/theater" />;
  return <AdminDashboard />;
}

function AdminTheaterPage() {
  const session = getSession();
  if (!session) return <Redirect to="/admin" />;
  if (session.type === "admin") return <Redirect to="/admin/dashboard" />;
  return <TheaterDashboard />;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/admin" component={AdminLoginPage} />
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/admin/theater" component={AdminTheaterPage} />
        <Route path="/" component={Home} />
        <Route path="/movies/:id" component={MovieDetail} />
        <Route path="/movies/:id/seats" component={SeatPicker} />
        <Route path="/checkout">
          {() => (
            <>
              <Show when="signed-in"><Checkout /></Show>
              <Show when="signed-out"><SignInRedirect /></Show>
            </>
          )}
        </Route>
        <Route path="/profile">
          {() => (
            <>
              <Show when="signed-in"><Profile /></Show>
              <Show when="signed-out"><SignInRedirect /></Show>
            </>
          )}
        </Route>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("mk_splash_seen"));

  if (showSplash) {
    return <SplashScreen onDone={() => { sessionStorage.setItem("mk_splash_seen", "1"); setShowSplash(false); }} />;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Movi Kova account",
          },
        },
        signUp: {
          start: {
            title: "Create account",
            subtitle: "Book movies, track bookings, earn rewards",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function KeyboardShortcut() {
  useEffect(() => {
    let buffer = "";
    let timer: ReturnType<typeof setTimeout>;
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) return;
      if (!/^\d$/.test(e.key)) { buffer = ""; return; }
      buffer += e.key;
      if (buffer.length > 6) buffer = buffer.slice(-6);
      clearTimeout(timer);
      timer = setTimeout(() => { buffer = ""; }, 3000);
      if (buffer === "786786") {
        buffer = "";
        window.location.href = `${basePath}/admin`;
      }
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); clearTimeout(timer); };
  }, []);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <KeyboardShortcut />
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
