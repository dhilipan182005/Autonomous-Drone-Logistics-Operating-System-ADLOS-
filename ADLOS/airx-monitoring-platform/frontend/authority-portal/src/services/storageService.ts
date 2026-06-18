import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Secure file upload utility handling .json flight logs and .jpg ESP32 camera captures.
 */
export const uploadDroneFile = async (droneId: string, file: File, type: 'LOG' | 'IMAGE'): Promise<string> => {
  let path = '';
  
  if (type === 'LOG') {
    if (!file.name.endsWith('.json')) throw new Error('Logs must be JSON format');
    path = 'flight_logs/' + droneId + '/' + file.name;
  } else if (type === 'IMAGE') {
    if (!file.type.startsWith('image/')) throw new Error('Images must be image/* format');
    path = 'camera_captures/' + droneId + '/' + file.name;
  }

  const storageRef = ref(storage, path);
  
  // Upload to Firebase Storage
  const snapshot = await uploadBytes(storageRef, file);
  
  // Return the public download URL
  return await getDownloadURL(snapshot.ref);
};
