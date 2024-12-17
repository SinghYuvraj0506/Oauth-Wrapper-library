Here's a final `README.md` that combines both your React and Express server setup for OAuth authentication:

---

# OAuth Integration with Express & React

This project integrates OAuth authentication in both the **Express** server and **React** client, using providers like Google. It includes secure authentication, JWT management, and custom routing. The client and server are connected for seamless OAuth handling and token management.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Server Setup](#server-setup)
4. [Client Setup](#client-setup)
5. [Routing Overview](#routing-overview)
6. [Token Management](#token-management)
7. [Securing Routes](#securing-routes)
8. [Customizing the Flow](#customizing-the-flow)
9. [Project Structure](#project-structure)

---

## 1. Prerequisites

Before starting, make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn

---

## 2. Installation

### Server (Express)

1. Install the required dependencies for the server:

```bash
cd server
npm install express cookie-parser jsonwebtoken dotenv oauth-wrapper-lib
npm install --save-dev @types/express @types/jsonwebtoken
```

2. Create a `.env` file in the `server` directory and add the following:

```dotenv
JWT_SECRET=your_jwt_secret_key
BASE_URL = "http://localhost:3000"
```

### Client (React)

1. Install dependencies for the React client:

```bash
cd client
npm install oauth-wrapper-lib
```

---

## 3. Server Setup (Express)

### Express Configuration

The Express server handles the OAuth flow, including Google authentication, token management, and secure routes. Below is an example configuration for the server.

```javascript
// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { OAuthClient, GoogleProvider } = require("oauth-wrapper-lib");
const { AuthMiddleware, verifyJWT } = require("oauth-wrapper-lib/express");

const app = express();
app.use(cookieParser());

// Google OAuth Provider Configuration
const google = new GoogleProvider({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  requestHandlerUrl: "/api/google/auth", // Custom URL for OAuth flow
});

// OAuth Client Setup
const client = new OAuthClient({
  providers: [google],
  successRedirectUrl: "http://localhost:3000/dashboard",  // React app route
  errorRedirectUrl: "http://localhost:3000/error",      // Error page route
  handleCallback: (providerData) => {
    // Customize JWT payload
    return {
      userId: providerData.id,
      email: providerData.email,
      name: providerData.name,
    };
  },
});

// Use AuthMiddleware to protect routes
app.use(AuthMiddleware(client));

// Sample protected route
app.get("/me", verifyJWT, (req, res) => {
  return res.json({ message: "Authenticated User", user: req.user });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 4. Client Setup (React)

### React OAuth Integration

On the client-side, we will handle OAuth redirection and manage JWT tokens after successful login. Here’s how you can integrate it with React:

```javascript
// App.js (React)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider, { ProtectedRoute } from "oauth-wrapper-lib/react";
import { GoogleProvider } from "oauth-wrapper-lib/providers";
import OAuthClient from "oauth-wrapper-lib";
import Login from "./pages/Login";
import Landing from "./pages/Landing";

const google = new GoogleProvider({
  client_id: "YOUR_GOOGLE_CLIENT_ID",
  requestHandlerUrl: "/api/google",
  handleCallback: () => {}, // Optional callback function
});

const client = new OAuthClient({
  providers: [google],
  successRedirectUrl: "/landing", // Redirect on successful login
});

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

export default App;
```

---


## 5. Routing Overview

### Default Routes

| Route                                    | Description                                                                                     |
|------------------------------------------|-------------------------------------------------------------------------------------------------|
| `/api/auth/[providername]/authorize`     | Redirects to OAuth provider for authentication.                                                  |
| `/api/auth/[providername]/callback`      | Handles the callback after authentication, including token storage and JWT creation.            |
| `/api/auth/refresh`                      | Refreshes the access token using a valid refresh token.                                         |
| `/api/auth/logout`                       | Logs the user out and clears all tokens.                                                        |
| `/me`                                    | Protected route, requires JWT authentication. Returns the authenticated user information.        |

---

## 6. Token Management

- **Access Token**: The server generates and sends an access token stored in HTTP-only cookies.
- **Refresh Token**: If the access token expires, a refresh token can be used to generate a new access token.

### Example API for Refreshing Token:

```http
POST /api/auth/refresh
```

### Example API for Logging Out:

```http
POST /api/auth/logout
```

---

## 7. Securing Routes

Use `verifyJWT` middleware to secure any route that requires authentication:

```javascript
app.get("/protected", verifyJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
```

---

## 8. Customizing the Flow

You can customize the OAuth flow, such as changing the payload for the JWT by using `handleCallback`.

Example of a custom JWT payload:

```javascript
const handleCallback = (providerData) => {
  return {
    userId: providerData.id,
    email: providerData.email,
    name: providerData.name,
  };
};
```

---

## 9. Project Structure

Here’s a sample project structure:

```
/your-project
  |- /server
    |- .env
    |- server.js
  |- /client
    |- .env
    |- /src
      |- App.js
  |- package.json
  |- README.md
```

---

## Conclusion

This project provides a robust and secure OAuth integration using **Express** on the server-side and **React** on the client-side. It handles user authentication, JWT token management, and route protection seamlessly. With customizable OAuth flows and token handling, it ensures flexibility for various OAuth providers.

Feel free to modify the routing, JWT handling, and token management to fit your needs.

---