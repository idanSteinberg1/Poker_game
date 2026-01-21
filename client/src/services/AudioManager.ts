class AudioManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    private muted: boolean = false;
    private initialized: boolean = false;

    constructor() {
        this.loadSounds();
    }

    private loadSounds() {
        // We will assume these files exist in public/sounds/
        // If they don't, it will just log a warning in console but won't crash
        const soundFiles: Record<string, string> = {
            deal: '/sounds/deal.mp3',
            chip: '/sounds/chip.mp3',
            win: '/sounds/win.mp3',
            notify: '/sounds/notify.mp3'
            // fold: '/sounds/fold.mp3', // Missing
            // check: '/sounds/check.mp3' // Missing
        };

        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = 0.5; // Default volume 50%
            this.sounds[key] = audio;
        });
    }

    public async unlock() {
        if (this.initialized) return;

        console.log("Audio unlock attempted...");

        // Try to unlock all sounds by playing them muted for a split second
        // This tells the browser we have user intent
        const unlockPromises = Object.values(this.sounds).map(audio => {
            return new Promise<void>((resolve) => {
                const originalVolume = audio.volume;
                audio.volume = 0;
                audio.play()
                    .then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = originalVolume;
                        resolve();
                    })
                    .catch((err) => {
                        console.warn("Audio unlock failed for one clip:", err);
                        resolve(); // Resolve anyway
                    });
            });
        });

        await Promise.all(unlockPromises);
        this.initialized = true;
        console.log("Audio system unlocked!");
    }

    public play(soundName: string) {
        if (this.muted) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => {
                // Browsers often block auto-play until user interaction
                if (err.name === 'NotAllowedError') {
                    console.error(`Audio blocked by browser policy! Application needs user interaction first. Sound: ${soundName}`);
                } else {
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
