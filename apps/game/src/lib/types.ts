export type User = {
  email: string;
  emailVerified: boolean;
  id: number;
  username: string | null;
  picture: string | null;
  createdAt: Date;
  lobbyId: string | null;
};
