import { useEffect, useState } from "react";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize as null to differentiate between loading and not authenticated

  useEffect(() => {
    const checkAuth = () => {
      const mobile = localStorage.getItem("mobile");
      const authExpiry = localStorage.getItem("authExpiry");

      console.log("Mobile:", mobile);
      console.log("Auth Expiry:", authExpiry);

      if (mobile && authExpiry && Date.now() < parseInt(authExpiry, 10)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};

export default useAuth;
