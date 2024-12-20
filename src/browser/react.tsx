import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { OAuthClient } from "../core/OAuthClient";
import { getAccessToken, login } from "./jsHelper";
import { Navigate } from "react-router-dom";

type authContextProps = {
  isAuthenticated: boolean;
  user: null;
  loading: boolean;
  loginFn: (providerName: string) => void;
  logout: () => void;
};

const AuthContext = createContext<authContextProps | null>(null);

const AuthProvider = ({
  client,
  children,
}: {
  client: OAuthClient;
  children: ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginFn = (providerName: string) => {
    login(client, providerName);
  };

  const logout = () => {
    console.log("Logging out");
    window.sessionStorage.removeItem("pkce_code_verifier");
    window.sessionStorage.removeItem("code");
    window.sessionStorage.removeItem("state");
    setIsAuthenticated(false);
    setUser(null);
  };

  const extractTokenFromUrl = () => {
    console.log("url is", window.location.href)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const code =
      hashParams.get("code") || urlParams.get("code");
    const state = hashParams.get("state") || urlParams.get("state");

    return { code, state };
  };

  const handleLoginFlow = async () => {
    try {
      const localData = {
        codeVerifier: sessionStorage.getItem("pkce_code_verifier"),
        code: sessionStorage.getItem("code"),
        state: sessionStorage.getItem("state"), // here it is provider
      };

      // user is locally active ----------------------
      if (localData.codeVerifier && localData.state && localData.code) {
        const data = await getAccessToken(
          client,
          sessionStorage.getItem("state") as string,
          sessionStorage.getItem("code") as string
        );
        setIsAuthenticated(true);
        setUser(data);
      }

      // check if the url after login is found ----
      else {
        const { code, state } = extractTokenFromUrl();

        if (!code || !state) {
          throw new Error("Error occured in logging in");
        }

        sessionStorage.setItem("code", code);
        sessionStorage.setItem("state", state);
        setIsAuthenticated(true);

        const data = await getAccessToken(client, state as string, code);
        setUser(data);
      }

    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoginFlow();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loginFn, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return { ...useContext(AuthContext) };
};

const ProtectedRoute = ({navigateTo, allowWhenUnauthenticated = false ,children}:{navigateTo:string,allowWhenUnauthenticated?:boolean, children: ReactNode}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading....</div>;
  }

  // only if both are same i.e either both true or both false
  if(!allowWhenUnauthenticated === isAuthenticated){
    return <>
      {children}
    </>
  }

  return <Navigate to={navigateTo} />
};

export { AuthProvider as default, ProtectedRoute, useAuth };
