import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { OAuthClient } from "../core/OAuthClient";
import { getUserInfo, login } from "./jsHelper";
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
    window.localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  const extractTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const accessToken =
      hashParams.get("access_token") || urlParams.get("access_token");
    const state = hashParams.get("state") || urlParams.get("state");

    return { accessToken, state };
  };

  const handleLoginFlow = async () => {
    try {
      const localData = {
        accessToken: localStorage.getItem("access_token"),
        state: localStorage.getItem("state"), // here it is provider
      };

      // user is locally active ----------------------
      if (localData.accessToken && localData.state) {
        const data = await getUserInfo(
          client,
          localStorage.getItem("state") as string,
          localStorage.getItem("access_token") as string
        );
        setIsAuthenticated(true);
        setUser(data);
      }

      // check if the url after login is found ----
      else {
        const { accessToken, state } = extractTokenFromUrl();

        if (!accessToken || !state) {
          throw new Error("Erro occured in logging in");
        }

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("state", state);
        setIsAuthenticated(true);

        const data = await getUserInfo(client, state as string, accessToken);
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
