import axios from "axios";
import { ProviderInputProps } from "../types/types";
import { ProviderClass } from "./ProviderClass";

export class GithubProvider extends ProviderClass {
  constructor(private inputData: ProviderInputProps) {
    const dataWithDefaults = {
      ...inputData,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      providerName: "Github",
      access_type: inputData.access_type || "online",
      scope: Array.isArray(inputData.scope) 
      ? inputData.scope.join(" ") 
      : inputData.scope || "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      state: inputData.state || "asdasdasdasdas",
    };


    const getUserInfo = async (token:string) => {
      const { data: profile } = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return profile;
    }

    // Pass data to the superclass constructor
    super(dataWithDefaults, getUserInfo);
  }
}
