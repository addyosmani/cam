export interface Selfie {
  id: string;
  date: string;
  timestamp: number;
  photoUrl: string;
  googlePhotosId?: string;
  uploaded: boolean;
}

export interface SelfieContextType {
  selfies: Selfie[];
  todaysSelfie: Selfie | null;
  addSelfie: (selfie: Omit<Selfie, 'id'>) => void;
  uploadToGooglePhotos: (selfie: Selfie) => Promise<boolean>;
  loading: boolean;
}