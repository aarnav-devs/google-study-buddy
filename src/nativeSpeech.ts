import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export async function startNativeSpeechRecognition(language: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;

  const { available } = await SpeechRecognition.available();
  if (!available) throw new Error('Speech recognition is unavailable on this device.');

  const permission = await SpeechRecognition.requestPermissions();
  if (permission.speechRecognition !== 'granted') {
    throw new Error('Microphone permission was not granted.');
  }

  const result = await SpeechRecognition.start({ language, maxResults: 1, popup: true });
  return result.matches?.[0] ?? null;
}

export async function stopNativeSpeechRecognition(): Promise<void> {
  if (Capacitor.isNativePlatform()) await SpeechRecognition.stop();
}