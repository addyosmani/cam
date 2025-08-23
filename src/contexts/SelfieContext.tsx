import React, { createContext, useContext, useState, useEffect } from 'react';
import { Selfie, SelfieContextType } from '../types/selfie';
import { useAuth } from './AuthContext';

const SelfieContext = createContext<SelfieContextType | undefined>(undefined);

export const SelfieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selfies, setSelfies] = useState<Selfie[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const savedSelfies = localStorage.getItem(`selfies_${user.id}`);
      if (savedSelfies) {
        setSelfies(JSON.parse(savedSelfies));
      }
    }
  }, [user]);

  const addSelfie = (selfieData: Omit<Selfie, 'id'>) => {
    const newSelfie: Selfie = {
      ...selfieData,
      id: Date.now().toString(),
    };

    const updatedSelfies = [...selfies, newSelfie];
    setSelfies(updatedSelfies);
    
    if (user) {
      localStorage.setItem(`selfies_${user.id}`, JSON.stringify(updatedSelfies));
    }
  };

  const createSelfiesAlbum = async (accessToken: string): Promise<string | null> => {
    try {
      const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          album: {
            title: 'Daily Selfies',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to create album:', error);
      return null;
    }
  };

  const findSelfiesAlbum = async (accessToken: string): Promise<string | null> => {
    try {
      const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const selfiesAlbum = data.albums?.find((album: any) => 
          album.title === 'Daily Selfies' || album.title === 'selfies'
        );
        return selfiesAlbum?.id || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to find albums:', error);
      return null;
    }
  };

  const uploadMediaItem = async (accessToken: string, photoBlob: Blob): Promise<string | null> => {
    try {
      // Step 1: Upload the raw bytes
      const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
          'X-Goog-Upload-Content-Type': 'image/jpeg',
          'X-Goog-Upload-Protocol': 'raw',
        },
        body: photoBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload raw bytes');
      }

      const uploadToken = await uploadResponse.text();

      // Step 2: Create the media item
      const createResponse = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newMediaItems: [
            {
              description: `Daily selfie - ${new Date().toDateString()}`,
              simpleMediaItem: {
                fileName: `selfie-${Date.now()}.jpg`,
                uploadToken: uploadToken,
              },
            },
          ],
        }),
      });

      if (createResponse.ok) {
        const data = await createResponse.json();
        return data.newMediaItemResults?.[0]?.mediaItem?.id || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to upload media item:', error);
      return null;
    }
  };

  const addToAlbum = async (accessToken: string, albumId: string, mediaItemId: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://photoslibrary.googleapis.com/v1/albums/${albumId}:batchAddMediaItems`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaItemIds: [mediaItemId],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to add to album:', error);
      return false;
    }
  };
  const uploadToGooglePhotos = async (selfie: Selfie): Promise<boolean> => {
    if (!user?.accessToken) return false;

    setLoading(true);
    try {
      // Convert data URL to blob
      const response = await fetch(selfie.photoUrl);
      const photoBlob = await response.blob();

      // Find or create the selfies album
      let albumId = await findSelfiesAlbum(user.accessToken);
      if (!albumId) {
        albumId = await createSelfiesAlbum(user.accessToken);
      }

      // Upload the photo
      const mediaItemId = await uploadMediaItem(user.accessToken, photoBlob);
      if (!mediaItemId) {
        throw new Error('Failed to upload photo');
      }

      // Add to album if we have one
      if (albumId) {
        await addToAlbum(user.accessToken, albumId, mediaItemId);
      }
      
      const updatedSelfies = selfies.map(s => 
        s.id === selfie.id ? { ...s, uploaded: true, googlePhotosId: mediaItemId } : s
      );
      
      setSelfies(updatedSelfies);
      if (user) {
        localStorage.setItem(`selfies_${user.id}`, JSON.stringify(updatedSelfies));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to upload to Google Photos:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();
  const todaysSelfie = selfies.find(selfie => new Date(selfie.timestamp).toDateString() === today) || null;

  return (
    <SelfieContext.Provider value={{ 
      selfies, 
      todaysSelfie, 
      addSelfie, 
      uploadToGooglePhotos, 
      loading 
    }}>
      {children}
    </SelfieContext.Provider>
  );
};

export const useSelfie = () => {
  const context = useContext(SelfieContext);
  if (context === undefined) {
    throw new Error('useSelfie must be used within a SelfieProvider');
  }
  return context;
};