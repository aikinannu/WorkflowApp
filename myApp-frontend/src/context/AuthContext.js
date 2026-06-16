// src/context/AuthContext.js
import secureStorage from "../utils/secureStorage";
import Constants from "expo-constants";
import { createContext, useContext, useEffect, useState } from "react";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  "http://localhost:8000/api/v1";
const STORAGE_TOKEN_KEY = "gdwb_token";
const STORAGE_USER_KEY = "gdwb_user";
const DEFAULT_TENANT_ID = "default";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error || body?.message || response.statusText || "Request failed";
    throw new Error(message);
  }

  return body;
};

const saveSession = async (token, user) => {
  await secureStorage.setItem(STORAGE_TOKEN_KEY, token);
  await secureStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  // web fallback: also mirror into localStorage so the web build can read it
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, token);
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore localStorage failures
  }
};

const clearSession = async () => {
  await secureStorage.removeItem(STORAGE_TOKEN_KEY);
  await secureStorage.removeItem(STORAGE_USER_KEY);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
  } catch {}
};

const introspectToken = async (token) => {
  return fetchJson(`${API_BASE_URL}/auth/introspect`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      let storedToken = await secureStorage.getItem(STORAGE_TOKEN_KEY);
      let storedUser = await secureStorage.getItem(STORAGE_USER_KEY);
      // fallback to localStorage on web where AsyncStorage may use a different backend
      try {
        if ((!storedToken || !storedUser) && typeof window !== 'undefined' && window.localStorage) {
          storedToken = storedToken || window.localStorage.getItem(STORAGE_TOKEN_KEY);
          storedUser = storedUser || window.localStorage.getItem(STORAGE_USER_KEY);
        }
      } catch {
        // ignore
      }

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const result = await introspectToken(storedToken);
        if (result?.success || result?.valid) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          await clearSession();
        }
      } catch {
        await clearSession();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, tenantId = DEFAULT_TENANT_ID) => {
    setAuthLoading(true);
    try {
      const data = await fetchJson(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password, tenant_id: tenantId }),
      });
      const payload = data?.data || data || {};
      if (!payload?.token || !payload?.user) {
        throw new Error("Invalid login response");
      }
      setToken(payload.token);
      setUser(payload.user);
      await saveSession(payload.token, payload.user);
    } catch (error) {
      alert(error.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (name, email, password, tenantId = DEFAULT_TENANT_ID) => {
    setAuthLoading(true);
    try {
      const data = await fetchJson(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({ email, password, tenant_id: tenantId, name }),
      });
      const payload = data?.data || data || {};
      if (!payload?.token || !payload?.user) {
        throw new Error("Invalid signup response");
      }
      setToken(payload.token);
      setUser(payload.user);
      await saveSession(payload.token, payload.user);
    } catch (error) {
      alert(error.message || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async () => {
    alert("Password reset is not yet supported by gd backend auth.");
  };

  const logout = async () => {
    await clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        resetPassword,
        logout,
        loading: loading || authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
