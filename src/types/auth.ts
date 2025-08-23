export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

export interface AuthContextType {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  loading: boolean;
}