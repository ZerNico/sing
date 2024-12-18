import { Google, generateCodeVerifier, generateState } from "arctic";
import { config } from "../../config";

class OAuthService {
  private google = new Google(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URI);

  public getGoogleAuthUrl() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes = ["openid", "email", "profile"];
    const url = this.google.createAuthorizationURL(state, codeVerifier, scopes);

    return { url, state, codeVerifier };
  }
}

export const authService = new OAuthService();
