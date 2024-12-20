import axios from "axios";
import {
  authorizeProps,
  getAccessTokenProps,
  ProviderClassProps,
  ProviderInterface,
} from "../types/types";

export class ProviderClass implements ProviderInterface {
  protected providerData: ProviderClassProps;

  constructor(
    data: ProviderClassProps,
    getUserInfo: (token: string) => Promise<any>
  ) {
    if (!data.requestHandlerUrl) {
      data.requestHandlerUrl = `/api/auth/${data.providerName.toLowerCase()}/authorize`;
    }

    if (typeof window !== undefined) {
      data.state = data.providerName;
    }

    this.providerData = data;
    this.getUserInfo = getUserInfo;
  }

  // get the user data --------
  getUserInfo: (token: string) => Promise<any>;

  getData() {
    return {
      handleCallback: this.providerData.handleCallback,
      requestHandlerUrl: this.providerData.requestHandlerUrl,
      providerName: this.providerData.providerName,
      scope: this.providerData.scope, // can be handled outside by provides constructor
      access_type: this.providerData.access_type, // can be handled outside by provides constructor
      state: this.providerData.state, // can be handled outside by provides constructor
    };
  }

  // Generates the Authorization URL --------
  authorize({
    redirect_uri,
    response_type,
    scope,
    state,
    access_type,
    code_challenge_method,
    code_challenge,
  }: authorizeProps) {
    try {
      const params = new URLSearchParams();
      params.append("client_id", this.providerData.client_id);
      params.append("redirect_uri", redirect_uri);
      params.append("response_type", response_type);
      params.append("scope", scope);
      params.append("state", state);
      if (access_type) {
        params.append("access_type", access_type);
      }
      if (code_challenge_method) {
        params.append("code_challenge_method", code_challenge_method);
      }
      if (code_challenge) {
        params.append("code_challenge", code_challenge);
      }

      return `${this.providerData.authUrl}?${params.toString()}`;
    } catch (error) {
      console.log(
        `Error: Error Occured in generating Auth URL from ${this.providerData.providerName}`,
        error
      );
      return false;
    }
  }

  // Generates the access token from code --------
  async getAccessToken({
    code,
    state,
    redirect_uri,
    code_verifier,
  }: getAccessTokenProps) {
    try {
      let body :any = {
        code,
        client_id: this.providerData.client_id,
        client_secret: this.providerData.client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      };

      if (code_verifier) {
        body = {
          code,
          client_id: this.providerData.client_id,
          grant_type: "authorization_code",
          redirect_uri,
          code_verifier
        };
      }

      const response = await axios.post(this.providerData.tokenUrl, body);

      if (response.status !== 200) {
        throw new Error("Invalid Response for token");
      }

      return response.data;
    } catch (error) {
      console.log("Error: Error Occured in getting access token", error);
      return false;
    }
  }
}
