import { Google, generateCodeVerifier, generateState } from "arctic";
import { config } from "../config";
import type { User } from "../types";
import { userService } from "./user";

class OAuthService {
  private google = new Google(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URI);

  public googleAuthUrl() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes = ["openid", "email", "profile"];
    const url = this.google.createAuthorizationURL(state, codeVerifier, scopes);

    return { url, codeVerifier };
  }

  public async verifyGoogleCode(code: string, codeVerifier: string) {
    const tokens = await this.google.validateAuthorizationCode(code, codeVerifier);

    const user = await this.getGoogleUser(tokens.accessToken());
    return { user, tokens };
  }

  public async getGoogleUser(accessToken: string) {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return;
    }

    return response.json() as Promise<GoogleUserInfo>;
  }

  public async mergeGoogleUser(user: User, googleUser: GoogleUserInfo) {
    const updatedUser = { ...user, googleId: googleUser.sub, emailVerified: true };
    if (!user.picture) {
      updatedUser.picture = googleUser.picture;
    }

    return await userService.update(user.id, updatedUser);
  }

  public async createUserFromGoogle(googleUser: GoogleUserInfo) {
    const user = {
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.sub,
      picture: googleUser.picture,
      emailVerified: true,
    };

    return userService.create(user);
  }
}

export const oauthService = new OAuthService();

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}
