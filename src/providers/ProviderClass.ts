import axios from "axios";
import { ProviderClassProps } from "../types/types";

export class ProviderClass {
  constructor(protected providerData: ProviderClassProps, protected getUserInfo: (token:string)=> Promise<any>) {
    if (!this.providerData.requestHandlerUrl) {
      this.providerData.requestHandlerUrl = `/api/auth/${this.providerData.providerName.toLowerCase()}/authorize`;
    }
  }

  getData() {
    return {
      handleCallback: this.providerData.handleCallback,
      requestHandlerUrl: this.providerData.requestHandlerUrl,
      providerName: this.providerData.providerName,
      scope: this.providerData.scope,  // can be handled outside by provides constructor
      access_type: this.providerData.access_type,  // can be handled outside by provides constructor
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
  }: {
    redirect_uri: string;
    response_type: string;
    scope: string;
    state: string;
    access_type?: string;
  }) {
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
  async getAccessToken({ code, state, redirect_uri }: { code: string; state: string, redirect_uri:string }) {
    try {
      const response = await axios.post(this.providerData.tokenUrl, {
        code,
        client_id: this.providerData.client_id,
        client_secret: this.providerData.client_secret,
        redirect_uri,
        grant_type: 'authorization_code'
      });

      if(response.status !== 200){
        throw new Error("Invalid Response for token")
      }

      return response.data;
    } catch (error) {
      console.log("Error: Error Occured in getting access token", error);
      return false;
    }
  }

  // get the user data --------
  async getUserData(token:string){
    const data = await this.getUserInfo(token);
    return data;
  }

}
