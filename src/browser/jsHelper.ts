import { OAuthClient } from "../core/OAuthClient";

export const login = (client: OAuthClient, provider: string) => {
  const providerData = client.data.providers?.find(
    (e) => e.getData().providerName === provider
  );

  if (!providerData) {
    throw new Error("Provder not found to login");
  }

  const {
    requestHandlerUrl,
    providerName,
    handleCallback,
    scope,
    state,
    access_type,
  } = providerData.getData();

  if (!scope || !state || !requestHandlerUrl) {
    throw new Error("Scope and state are invalid ");
  }

  const authorizationUrl = providerData.authorize({
    redirect_uri: `${window.location.origin}${client.data.successRedirectUrl}`,
    response_type: "token",
    scope: scope,
    state,
    access_type,
  });

  if (typeof authorizationUrl !== "string") {
    throw new Error("Invalid AuthURl");
  }

  window.open(authorizationUrl, "_self");
};

export const getUserInfo = async (
  client: OAuthClient,
  provider: string,
  token: string
) => {
  const providerData = client.data.providers?.find(
    (e) => e.getData().providerName === provider
  );

  if (!providerData) {
    throw new Error("Provder not found to login");
  }

  const data = await providerData.getUserInfo(token);

  if (!data) {
    throw new Error("User data not found");
  }

  return data;
};
