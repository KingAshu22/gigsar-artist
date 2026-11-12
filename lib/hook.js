import { useEffect, useState } from "react";

// Asks the server whether this browser has a valid signed session cookie.
// localStorage is kept in sync only because existing pages read "mobile" from
// it; it is never trusted for access decisions.
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = still checking

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok && data.authenticated) {
          localStorage.setItem("mobile", data.mobile);
          if (!localStorage.getItem("authExpiry")) {
            localStorage.setItem(
              "authExpiry",
              (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
            );
          }
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("mobile");
          localStorage.removeItem("authExpiry");
          setIsAuthenticated(false);
        }
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  return isAuthenticated;
};

export default useAuth;
