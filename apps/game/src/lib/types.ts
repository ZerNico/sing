export type User = LocalUser | ApiUser;


export interface LocalUser {
  id: string;
  username: string;
  picture: string | null;
  type: "local";
}

export interface ApiUser {
  email: string;
  emailVerified: boolean;
  id: number;
  username: string | null;
  picture: string | null;
  createdAt: Date;
  lobbyId: string | null;
};
