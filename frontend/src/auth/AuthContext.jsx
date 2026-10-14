import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./authContext";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../api/auth/client";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    setAuthError("");

    try {
      setUser(await getCurrentUser());
    } catch (error) {
      setUser(null);
      if (error.status !== 401) {
        setAuthError(error.message || "Unable to check your session.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const handleSessionExpired = () => {
      setUser(null);
      setAuthError("");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        setUser(null);
        if (error.status !== 401) {
          setAuthError(error.message || "Unable to check your session.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, [refreshAuth]);

  const login = useCallback(async (credentials) => {
    const result = await loginUser(credentials);
    setUser(result.user);
    setAuthError("");
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      if (error.status === 401) setUser(null);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshAuth,
    }),
    [user, loading, authError, login, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
