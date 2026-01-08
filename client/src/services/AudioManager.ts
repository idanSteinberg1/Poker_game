class AudioManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    private muted: boolean = false;

    constructor() {
        this.loadSounds();
    }

    private loadSounds() {
        // We will assume these files exist in public/sounds/
        // If they don't, it will just log a warning in console but won't crash
        const soundFiles: Record<string, string> = {
            deal: '/sounds/card-flip.mp3',
            chip: '/sounds/chips-stack.mp3',
            win: '/sounds/win-sound.mp3',
            fold: '/sounds/fold.mp3',
            check: '/sounds/check.mp3',
            notify: '/sounds/notification.mp3'
        };

        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = 0.5; // Default volume 50%
            this.sounds[key] = audio;
        });
    }

    public play(soundName: string) {
        if (this.muted) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => {
                // Browsers often block auto-play until user interaction
                // We ignore this error to prevent console spam
                if (err.name !== 'NotAllowedError') {
                    console.warn(`Failed to play sound: ${soundName}`, err);
                }
            });
        }
    }

    public toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    public isMuted() {
        return this.muted;
    }
}

export const audioManager = new AudioManager();
