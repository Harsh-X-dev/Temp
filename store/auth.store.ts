/**
 * Auth store — the single UI source of truth for authentication state.
 *
 * Supabase remains the authentication source of truth.
 * This store reflects the Supabase state for synchronous UI reads.
 *
 * NOT persisted to localStorage. AuthProvider populates it on mount
 * by reading from Supabase and keeps it in sync via onAuthStateChange.
 */
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile, Address } from "@/components/account/types";

interface AuthState {
  // ── State ──────────────────────────────────────────────────────────────
  /** Supabase User object. Null when logged out. */
  user: User | null;
  /** Supabase Session object. Null when logged out. */
  session: Session | null;
  /** Profile data fetched from public.profiles table. */
  profile: UserProfile | null;
  /** User's saved addresses from public.addresses table. */
  addresses: Address[];
  /** True when user has an active Supabase session. */
  isAuthenticated: boolean;
  /** True while the initial session check is in progress. */
  loading: boolean;
  /** True after the first auth check completes (success or failure). */
  initialized: boolean;
  /** True when an explicit OTP login transition is actively in progress. */
  loginInProgress: boolean;

  // ── Actions ────────────────────────────────────────────────────────────
  /** Set user + session together after successful authentication. */
  setAuth: (user: User, session: Session) => void;
  /** Set the fetched profile. */
  setProfile: (profile: UserProfile | null) => void;
  /** Set the fetched address list or update via function. */
  setAddresses: (addresses: Address[] | ((prev: Address[]) => Address[])) => void;
  /** Clear all auth state — called on logout or session expiry. */
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setLoginInProgress: (loginInProgress: boolean) => void;
}

const initialState = {
  user: null as User | null,
  session: null as Session | null,
  profile: null as UserProfile | null,
  addresses: [] as Address[],
  isAuthenticated: false,
  loading: true,
  initialized: false,
  loginInProgress: false,
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...initialState,

  setAuth: (user, session) =>
    set({
      user,
      session,
      isAuthenticated: true,
    }),

  setProfile: (profile) => set({ profile }),

  setAddresses: (addresses) =>
    set((state) => ({
      addresses: typeof addresses === "function" ? addresses(state.addresses) : addresses,
    })),

  clear: () =>
    set({
      user: null,
      session: null,
      profile: null,
      addresses: [],
      isAuthenticated: false,
      loginInProgress: false,
    }),

  setLoading: (loading) => set({ loading }),

  setInitialized: (initialized) => set({ initialized }),

  setLoginInProgress: (loginInProgress) => set({ loginInProgress }),
}));
