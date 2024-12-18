import { Google, generateCodeVerifier, generateState } from "arctic";
import * as v from "valibot";
import { config } from "../../config";
import type { User } from "../users/users.models";
import { usersService } from "../users/users.service";
import { type GoogleProfile, googleProfileSchema } from "./auth.models";

class OAuthService {
  private google = new Google(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URI);

  public getGoogleAuthUrl() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes = ["openid", "email", "profile"];
    const url = this.google.createAuthorizationURL(state, codeVerifier, scopes);

    return { url, state, codeVerifier };
  }

  public async verifyGoogleCallback(code: string, codeVerifier: string) {
    try {
      const tokens = await this.google.validateAuthorizationCode(code, codeVerifier);
      return tokens;
    } catch (error) {}
  }

  public async getGoogleProfile(accessToken: string) {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    
    const result = v.safeParse(googleProfileSchema, data);

    if (result.success) {
      return result.output;
    }
  }

  public async mergeGoogleProfile(user: User, profile: GoogleProfile) {
    const updatedUser = {
      ...user,
      googleId: profile.sub,
    }
    if (!user.picture) {
      updatedUser.picture = profile.picture;
    }

    return await usersService.update(user.id, updatedUser);
  }

  public async createUserFromGoogleProfile(profile: GoogleProfile) {
    const user = {
      email: profile.email,
      googleId: profile.sub,
      picture: profile.picture,
      emailVerified: profile.email_verified,
    }

    return await usersService.create(user);
  }
}

export const oAuthService = new OAuthService();
