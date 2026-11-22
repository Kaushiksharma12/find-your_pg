"use client";

import * as React from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "renter" | "owner";
  phone?: string;
}

export interface AuthModalOptions {
  mode?: "sign-in" | "create-account";
  reason?: string;
  intendedAction?: () => void;
  accountType?: "renter" | "owner";
}

interface AuthActionResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authModalState: {
    isOpen: boolean;
    mode: "sign-in" | "create-account";
    reason?: string;
    intendedAction?: () => void;
    accountType?: "renter" | "owner";
  };
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  login: (
    credentials: { email: string; password?: string; role?: "renter" | "owner" },
    intendedAction?: () => void
  ) => Promise<AuthActionResult>;
  register: (
    data: { name: string; email: string; password?: string; phone?: string; role: "renter" | "owner" },
    intendedAction?: () => void
  ) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void, options: { reason: string; mode?: "sign-in" | "create-account" }) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const [authModalState, setAuthModalState] = React.useState<{
    isOpen: boolean;
    mode: "sign-in" | "create-account";
    reason?: string;
    intendedAction?: () => void;
    accountType?: "renter" | "owner";
  }>({
    isOpen: false,
    mode: "sign-in",
  });

  // Fetch real session from /api/v1/auth/me on mount
  React.useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const openAuthModal = React.useCallback((options?: AuthModalOptions) => {
    setAuthModalState({
      isOpen: true,
      mode: options?.mode || "sign-in",
      reason: options?.reason,
      intendedAction: options?.intendedAction,
      accountType: options?.accountType || "renter",
    });
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setAuthModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const login = React.useCallback(
    async (
      credentials: { email: string; password?: string; role?: "renter" | "owner" },
      intendedAction?: () => void
    ): Promise<AuthActionResult> => {
      try {
        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok || !data.user) {
          // MUST NOT set user client state on failure
          setUser(null);
          return {
            success: false,
            error: data.error || "Invalid login credentials.",
          };
        }

        // Single Source of Truth: Set authenticated user returned by MongoDB session
        setUser(data.user);
        closeAuthModal();

        if (intendedAction) {
          setTimeout(() => {
            intendedAction();
          }, 100);
        }

        return { success: true };
      } catch (err: unknown) {
        setUser(null);
        return {
          success: false,
          error: "Unable to connect to authentication server. Please check database connectivity.",
        };
      }
    },
    [closeAuthModal]
  );

  const register = React.useCallback(
    async (
      registerData: { name: string; email: string; password?: string; phone?: string; role: "renter" | "owner" },
      intendedAction?: () => void
    ): Promise<AuthActionResult> => {
      try {
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerData),
        });

        const data = await res.json();

        if (!res.ok || !data.user) {
          setUser(null);
          return {
            success: false,
            error: data.error || "Registration failed. Please try again.",
          };
        }

        setUser(data.user);
        closeAuthModal();

        if (intendedAction) {
          setTimeout(() => {
            intendedAction();
          }, 100);
        }

        return { success: true };
      } catch (err: unknown) {
        setUser(null);
        return {
          success: false,
          error: "Unable to connect to registration server. Please check database connectivity.",
        };
      }
    },
    [closeAuthModal]
  );

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const requireAuth = React.useCallback(
    (action: () => void, options: { reason: string; mode?: "sign-in" | "create-account" }) => {
      if (user) {
        action();
      } else {
        openAuthModal({
          mode: options.mode || "sign-in",
          reason: options.reason,
          intendedAction: action,
        });
      }
    },
    [user, openAuthModal]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authModalState,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
