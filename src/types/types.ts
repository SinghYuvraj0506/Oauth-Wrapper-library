export type OAuthClientProps = {
  providers: ProviderInterface[];
  successRedirectUrl: string;
  errorRedirectUrl?: string;
};

export type AuthorizationDataType = {
  response_type: string;
  scope: string;
  state: string;
  access_type?: string;
};

export type ProviderClassProps = {
  providerName: string;
  authUrl: string;
  tokenUrl: string;
  client_id: string;
  client_secret?: string;
  handleCallback: (providerData: CallbackReponse) => void;
  requestHandlerUrl?: string; // by default /auth/providername
  redirect_uri?: string;
  scope?: string;
  state?: string;
  access_type?: string;
};

export type CallbackReponse = {
  userData: any;
};

export type ProviderInputProps = {
  client_id: string;
  client_secret?: string;
  handleCallback: (data: CallbackReponse) => any;
  requestHandlerUrl?: string;
  redirect_uri?: string;
  scope?: string | string[];
  state?: string;
  access_type?: string;
};

export type authorizeProps = {
  redirect_uri: string;
  response_type: string;
  scope: string;
  state: string;
  access_type?: string;
};

export type getAccessTokenProps = {
  code: string;
  state: string;
  redirect_uri: string;
};

export interface ProviderInterface {
  getUserInfo: (token: string) => Promise<any>;
  authorize: (data: authorizeProps) => string | boolean;
  getAccessToken: (data:getAccessTokenProps) => Promise<any | boolean>
  getData: ()=> Partial<ProviderClassProps>
}
