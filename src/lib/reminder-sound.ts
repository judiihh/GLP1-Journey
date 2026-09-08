const SOUND_ENABLED_KEY = "glp1-reminder-sound-enabled";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) {
    audioContext = new AudioCtx();
  }
  return audioContext;
}

export function isReminderSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    // Storage blocked (private/secret mode) — fall back to the default.
    return true;
  }
}

export function setReminderSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {
    // Preference just won't persist on this device.
  }
}

/** Call from a user gesture (button tap) so mobile browsers allow audio later. */
export async function unlockReminderAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function playBellStrike(
  ctx: AudioContext,
  startTime: number,
  baseFrequency: number,
  volume = 0.18
): void {
  const partials = [1, 2.4, 3.8, 5.2];

  for (const [index, ratio] of partials.entries()) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFrequency * ratio, startTime);

    const peak = volume / (index + 1);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4 + index * 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.6);
  }
}

/** Soft two-tone bell chime — works on desktop and mobile when audio is unlocked. */
export async function playReminderChime(): Promise<void> {
  if (!isReminderSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    playBellStrike(ctx, now, 659.25); // E5
    playBellStrike(ctx, now + 0.45, 783.99, 0.14); // G5
  } catch {
    // Audio blocked or unavailable — notification still shows without sound.
  }
}
