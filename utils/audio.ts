
export const playPcmAudio = async (arrayBuffer: ArrayBuffer, sampleRate: number = 24000): Promise<void> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  
  // Create an AudioBuffer
  // Gemini TTS output is mono (1 channel), 24kHz (usually), Int16 PCM
  const pcmData = new Int16Array(arrayBuffer);
  const buffer = audioContext.createBuffer(1, pcmData.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Convert Int16 to Float32 [-1.0, 1.0]
  for (let i = 0; i < pcmData.length; i++) {
    channelData[i] = pcmData[i] / 32768.0;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();

  return new Promise((resolve) => {
    source.onended = () => {
      resolve();
      // Ideally close context if not reused often, but for this app keeping one or letting GC handle it is okay-ish.
      // Better to suspend/close if creating many.
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  });
};
