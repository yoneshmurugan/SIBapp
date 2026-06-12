import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'user_biometric_data';

// 1. Check Availability
export const checkBiometricAvailability = async () => {
  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    return false;
  }
};

// 2. Save Credentials (Using Preferences instead of Native Vault)
export const saveCredentialsForBiometric = async (username, password) => {
  try {
    const isAvailable = await checkBiometricAvailability();
    if (!isAvailable) return;

    // Save the data to App Private Storage
    // We store it as a JSON string
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify({ username, password }),
    });

    console.log("Credentials saved locally for biometric access.");
  } catch (error) {
    console.error("Failed to save credentials", error);
  }
};

// 3. Get Credentials (The "Guard" Logic)
export const getCredentialsFromBiometric = async () => {
  try {
    // A. FIRST: Force the user to scan finger/face
    // If they fail or cancel, this line throws an error and stops everything.
    await NativeBiometric.verifyIdentity({
      reason: "Authenticate to log in",
      title: "Biometric Login",
      subtitle: "Verify your identity",
      description: "Use FaceID or Fingerprint to continue",
    });

    // B. SECOND: If the scan was successful, retrieve the data from storage
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    
    if (!value) {
      throw new Error("No saved credentials found.");
    }

    const data = JSON.parse(value);
    return { username: data.username, password: data.password };

  } catch (error) {
    // This catches both "Fingerprint failed" and "Storage empty"
    throw error;
  }
};