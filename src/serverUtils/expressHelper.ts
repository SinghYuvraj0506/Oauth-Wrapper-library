import { OAuthClient } from "../core/OAuthClient";
import jwt from "jsonwebtoken";
import {
  CookieOptions,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import dotenv from "dotenv";
dotenv.config();

export class ExpressHelper {
  // Utility function to generate an access token
  private static getCookieOptions(maxAgeInMinutes: number): CookieOptions {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: maxAgeInMinutes * 60 * 1000,
    };
  }

  private static generateAccessToken(payload: object): string {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" } // Access token validity (short-lived)
    );
  }

  // Utility function to generate a refresh token
  private static generateRefreshToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
  }

  static AuthMiddleware(client: OAuthClient) {
    try {
      const providers = client.data.providers;
      const router = Router();

      providers.forEach((provider, index) => {
        const {
          requestHandlerUrl,
          providerName,
          handleCallback,
          scope,
          state,
          access_type,
        } = provider.getData();

        if (!scope || !state || !requestHandlerUrl) {
          throw new Error("Scope and state are invalid ");
        }

        const callbackUrl = `/api/auth/${providerName.toLowerCase()}/callback`;

        // start the autorization flow -------------------------------------
        router.get(requestHandlerUrl, (req, res) => {
          const authorizationUrl = provider.authorize({
            redirect_uri: `${process.env.BASE_URL}${callbackUrl}`,
            response_type: "code",
            scope: scope,
            state,
            access_type,
          });

          if (!authorizationUrl) {
            throw new Error("Invalid AuthURl");
          }

          return res.redirect(authorizationUrl);
        });

        // handleCallback from provider --------------------------------------
        router.get(callbackUrl, async (req, res) => {
          try {
            const { code, state } = req.query;

            if (typeof code !== "string" || typeof state !== "string") {
              throw new Error("Invalid Callback request");
            }

            const response = await provider.getAccessToken({
              code,
              state,
              redirect_uri: `${process.env.BASE_URL}${callbackUrl}`,
            });

            if (!response) {
              throw new Error("Invalid Callback request");
            }

            const userData = await provider.getUserData(response.access_token);

            if (!userData) {
              throw new Error("Invalid Callback request");
            }

            let payload: any = {
              name: userData?.name,
              email: userData?.email,
            };

            // send data to user to handle tasks in db -----------------
            if (handleCallback) {
              payload = handleCallback({ userData });
            }

            // Generate access and refresh tokens ---------------------------
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken(payload);

            // Set tokens in HTTP-only cookies ------------------------------
            return (
              res
                .cookie("access_token", accessToken, this.getCookieOptions(15))
                .cookie(
                  "refresh_token",
                  refreshToken,
                  this.getCookieOptions(7 * 24 * 60)
                )
                // Redirect to the desired location after login -----------------
                .redirect(client.data.successRedirectUrl)
            );
          } catch (error: any) {
            console.error(
              "Error during token generation or callback handling:",
              error
            );
            return res.redirect(
              `client.data.errorRedirectUrl?error=${error?.message}`
            );
          }
        });
      });

      // Endpoint to refresh tokens --------------------------------------
      router.get(`/api/auth/refresh`, (req, res) => {
        try {
          const refreshToken = req.cookies?.refresh_token;

          if (!refreshToken) {
            res.status(401).send("Refresh token missing.");
          }

          // Verify refresh token
          const decoded:any = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET as string
          ) as object;

          delete decoded.iat;
          delete decoded.exp;

          // Generate a new access token
          const newAccessToken = this.generateAccessToken(decoded)

          // Set the new access token in cookies
          res
            .cookie("access_token", newAccessToken, this.getCookieOptions(15))
            .send("Token refreshed successfully.");
        } catch (error) {
          console.error("Invalid refresh token:", error);
          res.status(403).send("Invalid request");
        }
      });

       // Endpoint to logout --------------------------------------
      router.get(`/api/auth/logout`, (req, res) => {
        try {
            res
            .clearCookie("access_token")
            .clearCookie("refresh_token")
            .send("User Logged Out Successfully")

        } catch (error) {
          console.error("Invalid refresh token:", error);
          res.status(403).send("Invalid request");
        }
      });

      return router;
    } catch (error) {
      console.log("Some error occured with the express auth middleware", error);
    }
  }

  static verifyJWT(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies?.access_token;

      if (!accessToken) {
        return res.status(401).json({ message: "Unauthoried access" });
      }

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);

      // Attach payload to the request object
      req.user = decoded;

      next();
    } catch (error: any) {
      console.log(error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Unauthoried access" });
      }
      return res.status(403).json({ message: "Unauthoried access" });
    }
  }
}
