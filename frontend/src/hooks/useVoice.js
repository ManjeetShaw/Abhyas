import { useCallback, useEffect, useRef, useState } from "react";

// Wraps the browser's native Web Speech APIs:
// - SpeechRecognition (speech-to-text) for dictating answers
// - speechSynthesis (text-to-speech) for the AI reading questions aloud
//
// Both are feature-detected; on unsupported browsers (e.g. Firefox for STT)
// the hook reports isSupported flags so the UI can hide those controls
// gracefully instead of breaking.
export function useVoice() {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");

  const SpeechRecognitionAPI =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const sttSupported = !!SpeechRecognitionAPI;
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!sttSupported) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        setTranscript((prev) => (prev ? `${prev} ${finalText}`.trim() : finalText.trim()));
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sttSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!ttsSupported || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [ttsSupported]
  );

  const pauseSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [ttsSupported]);

  const resumeSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [ttsSupported]);

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [ttsSupported]);

  return {
    sttSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
  };
}
