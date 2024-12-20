import { OAuthClient } from "../core/OAuthClient";

export const login = async (client: OAuthClient, provider: string) => {
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

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem("pkce_code_verifier", codeVerifier);

  const authorizationUrl = providerData.authorize({
    redirect_uri: `${window.location.origin}${client.data.successRedirectUrl}`,
    response_type: "code",
    scope: scope,
    state,
    access_type,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  if (typeof authorizationUrl !== "string") {
    throw new Error("Invalid AuthURl");
  }

  window.open(authorizationUrl, "_self");
};

export const getAccessToken = async (
  client: OAuthClient,
  provider: string,
  code: string,
) => {
  const providerData = client.data.providers?.find(
    (e) => e.getData().providerName === provider
  );

  if (!providerData) {
    throw new Error("Provder not found to login");
  }

  let codeVerifier = sessionStorage.getItem("pkce_code_verifier");

  if (codeVerifier) {
    const data = await providerData.getAccessToken({
      code,
      code_verifier: codeVerifier,
      redirect_uri: `${window.location.origin}${client.data.successRedirectUrl}`
    });

    if (!data) {
      throw new Error("User data not found");
    }

    return data
  } else {
    throw new Error("SOmething went wrong");
  }
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

// Generate a random string for the code verifier
export const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// Generate the code challenge by hashing the code verifier with SHA-256
export const generateCodeChallenge = async (codeVerifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};
