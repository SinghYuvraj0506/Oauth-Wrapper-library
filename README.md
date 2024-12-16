# OAuth Integration with Express

In this guide, we will walk you through the implementation of OAuth authentication using an Express server and a third-party OAuth provider. We'll use a simple library to handle OAuth requests and token management while explaining its core features.

## Key Features of the OAuth Implementation

1. **Authorization URL**: By default, the OAuth library generates the authorization URL at the route `/api/auth/[providername]/authorize`, where `[providername]` is the name of the OAuth provider (e.g., Google, GitHub, etc.).
   
2. **Callback URL**: The callback URL where the OAuth provider redirects the user after authentication is automatically set as `/api/auth/[providername]/callback`.

3. **HandleCallback**: The OAuth implementation allows you to handle user data after successful authentication through the `handleCallback` feature. You can save this data (like user information) into your database.

4. **Token Refresh**: You can refresh access tokens by sending a request to `/api/auth/refresh` with a valid refresh token.

5. **Logout**: Users can log out by clearing their access and refresh tokens via the `/api/auth/logout` route.

## Steps to Implement OAuth in Express

### 1. Install Required Dependencies

You need to install the `express`, `cookie-parser`, and your OAuth library (e.g., `oauth-wrapper-lib`).

```bash
npm install express cookie-parser oauth-wrapper-lib
```

### 2. Setup OAuth Configuration in Express

Here’s a simplified example showing how to integrate OAuth authentication into your Express app using the `oauth-wrapper-lib`. In this example, we'll use Google as the OAuth provider, but you can easily extend it for other providers like Facebook, GitHub, etc.

```javascript
const express = require("express");
const { OAuthClient, GoogleProvider, ExpressHelper } = require("oauth-wrapper-lib");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// Basic route to verify server is running
app.get("/", (req, res) => {
  res.send("OAuth Integration Working");
});

// Google OAuth Provider Configuration
const google = new GoogleProvider({
  client_id: "YOUR_GOOGLE_CLIENT_ID",
  client_secret: "YOUR_GOOGLE_CLIENT_SECRET",
  requestHandlerUrl: "/api/google" // Default is "/api/auth/google/authorize" if not set
});

// Initialize OAuth client with the Google provider
const client = new OAuthClient({
  providers: [google],
  successRedirectUrl: "http://localhost:3000",
  errorRedirectUrl: "http://localhost:3000/error",
});

// Use the ExpressHelper middleware for OAuth authentication
app.use(ExpressHelper.AuthMiddleware(client));

// Endpoint to access user data
app.get("/me", ExpressHelper.verifyJWT, (req, res) => {
  return res.send(req.user);
});

// Start the Express app
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

### 3. Understanding the Core Features

#### 3.1. OAuth Authorization Flow

- **Request Handler URL**: When a user visits `/api/google` (or `/api/auth/google/authorize` if `requestHandlerUrl` is not provided), the OAuth library redirects the user to the Google authorization URL. This is where the user will grant your app access.
  
- **Callback URL**: After successful authentication, Google will redirect the user back to `/api/auth/google/callback` with an authorization code.

#### 3.2. HandleCallback

- The `handleCallback` function allows you to process the user data returned from the OAuth provider and store it in your database. You can customize this function to fit your needs (e.g., save the user's profile information).

#### 3.3. Token Management

- **Access and Refresh Tokens**: After successfully authenticating the user, the system generates an access token (short-lived) and a refresh token (long-lived). These tokens are stored as HTTP-only cookies.

#### 3.4. Refresh Tokens

- You can refresh the access token by making a request to `/api/auth/refresh`. The server verifies the refresh token and returns a new access token.

#### 3.5. Logout

- When a user logs out, their access and refresh tokens are cleared from the cookies by making a request to `/api/auth/logout`.

### 4. Setting up Environment Variables

In your project’s `.env` file, you need to store sensitive information like your client ID, client secret, and JWT secret:

```dotenv
BASE_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

### 5. Directory Structure

For clarity, your directory structure might look something like this:

```
/your-project
  |- .env
  |- server.js (or app.js)
  |- /node_modules
  |- /package.json
  |- /package-lock.json
```

### 6. Customizing OAuth for Your Provider

While this guide uses Google as the OAuth provider, the same pattern applies to other providers. You simply need to:

- Configure the provider by passing the `client_id` and `client_secret`.
- Set any provider-specific URLs or scopes if required.
- Handle the OAuth flow by defining routes for authorization and callback handling.

### Summary of Key Routes

- **/api/auth/[providername]/authorize**: Redirects the user to the OAuth provider for authentication.
- **/api/auth/[providername]/callback**: Handles the callback from the OAuth provider after authentication.
- **/api/auth/refresh**: Refreshes the access token using a valid refresh token.
- **/api/auth/logout**: Logs out the user by clearing the access and refresh tokens.

## Conclusion

This implementation allows you to easily integrate OAuth authentication into your Express app with a variety of OAuth providers. You can handle user authentication, manage tokens, and use custom callback handling to save user data into your database.