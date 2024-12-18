import { Discord, Google, generateCodeVerifier, generateState } from "arctic";
import * as v from "valibot";
import { config } from "../../config";
import type { User } from "../users/users.models";
import { usersService } from "../users/users.service";
import { type DiscordProfile, type GoogleProfile, discordProfileSchema, googleProfileSchema } from "./oauth.models";

class OAuthService {
  private google = new Google(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URI);
  private discord = new Discord(config.DISCORD_CLIENT_ID, config.DISCORD_CLIENT_SECRET, config.DISCORD_REDIRECT_URI);

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

    const result = v.safeParse(googleProfileSchema, await response.json());
    if (result.success) {
      return result.output;
    }
  }

  public async mergeGoogleProfile(user: User, profile: GoogleProfile) {
    const updatedUser = {
      ...user,
      googleId: profile.sub,
    };
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
    };

    return await usersService.create(user);
  }

  public getDiscordAuthUrl() {
    const state = generateState();
    const scopes = ["identify", "email"];
    const url = this.discord.createAuthorizationURL(state, scopes);

    return { url, state };
  }

  public async verifyDiscordCallback(code: string) {
    try {
      const tokens = await this.discord.validateAuthorizationCode(code);
      return tokens;
    } catch (error) {}
  }

  public async getDiscordProfile(accessToken: string) {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const result = v.safeParse(discordProfileSchema, await response.json());
    if (result.success) {
      return result.output;
    }
  }

  public async mergeDiscordProfile(user: User, profile: DiscordProfile) {
    const updatedUser = {
      ...user,
      discordId: profile.id,
    };
    if (!user.picture) {
      updatedUser.picture = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
    }

    return await usersService.update(user.id, updatedUser);
  }

  public async createUserFromDiscordProfile(profile: DiscordProfile) {
    const username = profile.global_name || profile.username;
    const existingUser = await usersService.getByUsername(username);

    const user = {
      username: existingUser ? undefined : username,
      email: profile.email,
      discordId: profile.id,
      picture: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
      emailVerified: profile.verified,
    };

    return await usersService.create(user);
  }
}

export const oAuthService = new OAuthService();
