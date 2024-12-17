# OAuth Integration Library (Client & Server)

This library provides a unified way to integrate OAuth authentication in both **React** (Client-side) and **Express** (Server-side) applications. It supports multiple OAuth providers like Google, Facebook, GitHub, etc., and manages tokens, user authentication, and routing seamlessly.

---

## **Client-Side Integration (React)**

### **1. Install Dependencies**

Install the OAuth library:

```bash
npm install oauth-wrapper-lib
```

---
g
### **2. Setup OAuth Providers**

Example setup with **Google**:

```javascript
import { GoogleProvider } from "oauth-wrapper-lib/providers";
import OAuthClient from "oauth-wrapper-lib";

const google = new GoogleProvider({
  client_id: "YOUR_GOOGLE_CLIENT_ID",
  handleCallback: () => {}, // Optional callback function
});

const client = new OAuthClient({
  providers: [google],
  successRedirectUrl: "/landing", // Redirect on successful login
});
```

---

### **3. Wrap the React App**

Wrap your app with the `AuthProvider` to make authentication accessible.

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider, { ProtectedRoute } from "oauth-wrapper-lib/react";
import Login from "./pages/Login";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider client={client}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute navigateTo="/landing" allowWhenUnauthenticated>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landing"
            element={
              <ProtectedRoute navigateTo="/">
                <Landing />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

### **4. Use the `useAuth` Hook**

Access authentication status, user data, and login/logout functionality.

```javascript
import { useAuth } from "oauth-wrapper-lib/react";

const Login = () => {
  const { loginFn, isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      <h2>Login Page</h2>
      {!isAuthenticated ? (
        <button onClick={() => loginFn("google")}>Login with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};
```

---

### **5. Protect Routes with `ProtectedRoute`**

Control route access based on authentication status.

```javascript
<ProtectedRoute
  navigateTo="/login"
  allowWhenUnauthenticated={false} // Blocks unauthenticated users
>
  <Dashboard />
</ProtectedRoute>
```

---

### **Client-Side Props**

#### **`AuthProvider` Props**
| Prop         | Type              | Required | Description                          |
|--------------|-------------------|----------|--------------------------------------|
| `client`     | `OAuthClient`     | Yes      | OAuth client instance.               |
| `children`   | `ReactNode`       | Yes      | Components to render.                |

#### **`useAuth` Hook**
| Property           | Type                     | Description                           |
|--------------------|--------------------------|---------------------------------------|
| `isAuthenticated`  | `boolean`                | Whether the user is authenticated.    |
| `user`             | `any`                    | User data after login.                |
| `loading`          | `boolean`                | Shows authentication loading state.   |
| `loginFn`          | `(providerName: string)` | Triggers login with a provider.       |
| `logout`           | `() => void`             | Logs out the user.                    |

#### **`ProtectedRoute` Props**
| Prop                     | Type        | Required | Default | Description                               |
|--------------------------|-------------|----------|---------|-------------------------------------------|
| `navigateTo`             | `string`    | Yes      | -       | Redirect path if access is denied.        |
| `allowWhenUnauthenticated` | `boolean` | No       | `false` | Allows unauthenticated users if `true`.   |
| `children`               | `ReactNode` | Yes      | -       | Components rendered if access is granted. |

---

Here’s the updated **server-side integration guide** with Express, reflecting the changes you mentioned:

---

# Server-side integration with Express


## Key Features

1. **Customizable Routes**:  
   - The default route for OAuth authorization is `/api/auth/[providername]/authorize`.  
   - This can be customized using the `requestHandlerUrl` option.

2. **Custom JWT Payload**:  
   - Use the `handleCallback` method to process user data returned by the OAuth provider and define the payload to embed in the JWT.  
   - By default, the raw provider data is embedded in the JWT if `handleCallback` is not specified.

3. **Token Management**:  
   - **Access Tokens**: Short-lived tokens embedded in HTTP-only cookies.  
   - **Refresh Tokens**: Allows you to fetch new access tokens when they expire.

4. **Routes for Refresh and Logout**:  
   - `/api/auth/refresh`: Refresh the access token.  
   - `/api/auth/logout`: Clear access and refresh tokens.

---

## 1. Install Required Dependencies

Install the required libraries:

```bash
npm install express cookie-parser jsonwebtoken dotenv
npm install --save-dev @types/express @types/jsonwebtoken
```

---

## 2. Setting Up OAuth in Express


```javascript
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { OAuthClient, GoogleProvider } = require("oauth-wrapper-lib");
const { AuthMiddleware, verifyJWT } = require("oauth-wrapper-lib/express");

const app = express();
app.use(cookieParser());

// Basic health route
app.get("/", (req, res) => res.send("OAuth Integration Working"));

// Google OAuth Provider Configuration
const google = new GoogleProvider({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  requestHandlerUrl: "/api/google/auth", // Custom route instead of default
});

// OAuth Client Setup
const client = new OAuthClient({
  providers: [google],
  successRedirectUrl: "http://localhost:3000/dashboard", // Redirect after success
  errorRedirectUrl: "http://localhost:3000/error", // Redirect after error
  handleCallback: (providerData) => {
    // Customize the JWT payload
    return {
      userId: providerData.id,
      email: providerData.email,
      name: providerData.name,
    };
  },
});

// Use AuthMiddleware to handle routes automatically
app.use(AuthMiddleware(client));

// Endpoint to get authenticated user data
app.get("/me", verifyJWT, (req, res) => {
  return res.json({ message: "Authenticated User", user: req.user });
});

// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 3. Key Configuration Options

### OAuth Client Configuration

| Option              | Description                                                                                     |
|---------------------|-------------------------------------------------------------------------------------------------|
| `providers`         | Array of OAuth provider instances (e.g., `GoogleProvider`, `GitHubProvider`).                   |
| `successRedirectUrl`| The URL to redirect the user after successful authentication.                                  |
| `errorRedirectUrl`  | The URL to redirect the user in case of an error.                                              |
| `handleCallback`    | A function to customize the payload for the JWT token. Defaults to embedding provider data.    |

### `GoogleProvider` Configuration

| Option             | Description                                                                |
|--------------------|----------------------------------------------------------------------------|
| `client_id`        | The client ID provided by the OAuth provider.                             |
| `client_secret`    | The client secret provided by the OAuth provider.                         |
| `requestHandlerUrl`| Optional custom URL for the OAuth authorization flow. Default: `/api/auth/[providername]/authorize` |

---

## 4. Default and Customizable Routes

### Default Routes

| Route                                 | Description                                                     |
|--------------------------------------|-----------------------------------------------------------------|
| `/api/auth/[providername]/authorize` | Redirects the user to the OAuth provider for authentication.    |
| `/api/auth/[providername]/callback`  | Handles the callback from the OAuth provider after authentication. |
| `/api/auth/refresh`                  | Refreshes the access token using a valid refresh token.         |
| `/api/auth/logout`                   | Clears access and refresh tokens, logging the user out.         |

### Customizing the Routes

If you want to customize the route for authorization, use the `requestHandlerUrl` option when configuring the provider:

```javascript
const google = new GoogleProvider({
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",
  requestHandlerUrl: "/api/google/auth", // Custom URL
});
```

---

## 5. Token Management

- **Access Token**: Short-lived tokens sent as HTTP-only cookies.
- **Refresh Token**: Allows fetching new access tokens when the old one expires.

### Refresh Tokens

To refresh the access token, make a POST request to `/api/auth/refresh`:

```http
POST /api/auth/refresh
```

The server will validate the refresh token and return a new access token.

### Logout

To log out a user and clear the tokens, make a POST request to `/api/auth/logout`:

```http
POST /api/auth/logout
```

---

## 6. Securing Routes with `verifyJWT`

You can protect specific routes using the `verifyJWT` middleware provided by the library:

```javascript
app.get("/protected", verifyJWT, (req, res) => {
  res.json({ message: "Protected Route", user: req.user });
});
```

---

## 7. Setting Up Environment Variables

Create a `.env` file in your project root to store sensitive information:

```dotenv
BASE_URL = http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

---

## 8. Directory Structure

Your directory structure can look like this:

```
/your-project
  |- .env
  |- server.js (or app.js)
  |- /node_modules
  |- package.json
  |- package-lock.json
```

---

## Summary

### Key Features

1. **Customizable Routes**: Change default routes for flexibility.
2. **Custom JWT Payload**: Define what data to include in JWT using `handleCallback`.
3. **Built-in Token Management**: Access tokens, refresh tokens, and logout flows are handled seamlessly.
4. **Secure Routes**: Use `verifyJWT` to protect endpoints requiring authentication.

### Important Routes

| Route                             | Description                                                     |
|----------------------------------|-----------------------------------------------------------------|
| `/api/auth/[providername]/authorize` | Redirects the user for OAuth authentication.                   |
| `/api/auth/refresh`              | Refreshes access tokens.                                        |
| `/api/auth/logout`               | Logs out the user.                                              |
| `/me`                            | Protected route returning user details (requires `verifyJWT`).  |

---

# Conclusion
This project provides a robust and secure OAuth integration using Express on the server-side and React on the client-side. It handles user authentication, JWT token management, and route protection seamlessly. With customizable OAuth flows and token handling, it ensures flexibility for various OAuth providers.

