import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    async function checkAndApplyUpdates() {
      // Skips checking during local USB/Wi-Fi development
      if (__DEV__) return;

      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          // Downloads the update files to the phone storage
          await Updates.fetchUpdateAsync();

          // Freezes the screen with a mandatory prompt
          Alert.alert(
            "अपडेट उपलब्ध छ (Update Available)",
            "LeafDocApp को नयाँ संस्करण उपलब्ध छ। कृपया एपलाई तुरुन्तै अपडेट गर्नुहोस्।",
            [
              {
                text: "अपडेट गर्नुहोस् (Update Now)",
                onPress: async () => {
                  // Instantly restarts the app into the new code
                  await Updates.reloadAsync();
                }
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.log("Error checking for updates:", error);
      }
    }

    checkAndApplyUpdates();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
