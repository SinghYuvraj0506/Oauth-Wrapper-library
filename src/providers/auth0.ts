import axios from "axios";
import { ProviderInputProps } from "../types/types";
import { ProviderClass } from "./ProviderClass";

export class Auth0Provider extends ProviderClass {
  constructor(private inputData: ProviderInputProps, authOdomain:string) {
    const dataWithDefaults = {
      ...inputData,
      authUrl: `${authOdomain}/authorize`,
      tokenUrl: `${authOdomain}/oauth/token`,
      providerName: "auth0",
      access_type: undefined,
      scope: Array.isArray(inputData.scope)
        ? inputData.scope.join(" ")
        : inputData.scope ||
          "email profile",
      state: inputData.state || "asdasdasdasdas",
    };

    const getUserInfo = async (token: string) => {
      return null;
    };

    // Pass data to the superclass constructor
    super(dataWithDefaults, getUserInfo);
  }
}
