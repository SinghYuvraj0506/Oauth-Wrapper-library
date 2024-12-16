import { ProviderClass } from "../providers/ProviderClass";

export type OAuthClientProps = {
  providers: ProviderClass[],
  successRedirectUrl: string;
  errorRedirectUrl?:string;
}

export type AuthorizationDataType ={
  response_type: string;
  scope: string;
  state: string;
  access_type?: string;
}

export type ProviderClassProps = {
  providerName: string;
  authUrl: string;
  tokenUrl: string;
  client_id: string;
  client_secret?: string;
  handleCallback: (providerData: CallbackReponse) => void;
  requestHandlerUrl?: string; // by default /auth/providername
  redirect_uri?:string
  scope?: string;
  state?: string;
  access_type?: string;
};

export type CallbackReponse = {
    userData:any
}

export type ProviderInputProps = {
  client_id:string;
  client_secret?:string;
  handleCallback:(data:CallbackReponse) => any;
  requestHandlerUrl?:string;
  redirect_uri?:string
  scope?: string | string[];
  state?: string;
  access_type?: string;
};