import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Music, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Track = {
  id: string;
  label: string;
  emoji: string;
  url: string | null; // null = coming soon
};

const TRACKS: Track[] = [
  {
    id: "rain",
    label: "Rain",
    emoji: "🌧️",
    url: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3",
  },
  {
    id: "stream",
    label: "Stream",
    emoji: "🌊",
    url: "https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-loop-1244.mp3",
  },
  {
    id: "forest",
    label: "Forest",
    emoji: "🌲",
    url: "https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-ambience-55.mp3",
  },
  {
    id: "lofi",
    label: "Lo-Fi",
    emoji: "🎵",
    url: null, // Coming soon
  },
];

export function FocusMusicWidget() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([60]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTrackClick = (track: Track) => {
    if (!track.url) return; // Coming soon

    if (activeId === track.id && isPlaying) {
      // Pause current
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Start new
    const audio = new Audio(track.url);
    audio.loop = true;
    audio.volume = volume[0] / 100;
    audioRef.current = audio;
    setActiveId(track.id);
    void audio.play().catch(() => {
      // Audio blocked by browser policy — still show as active
    });
    setIsPlaying(true);
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val[0] / 100;
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Card
      className="shadow-card border-0 bg-sky-pale widget-accent-sky"
      data-ocid="dashboard.music.card"
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
          <Music className="w-4 h-4 text-sky" />
          Focus Sounds
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        {/* Track buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {TRACKS.map((track) => {
            const isActive = activeId === track.id;
            const isComingSoon = track.url === null;
            return (
              <button
                key={track.id}
                type="button"
                data-ocid={`dashboard.music.toggle.${TRACKS.indexOf(track) + 1}`}
                onClick={() => handleTrackClick(track)}
                disabled={isComingSoon}
                title={isComingSoon ? "Coming soon" : track.label}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-display font-medium transition-all
                  ${
                    isActive && isPlaying
                      ? "bg-sky text-white shadow-pastel scale-95"
                      : isComingSoon
                        ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                        : "bg-sky-light text-sky hover:bg-sky hover:text-white"
                  }`}
              >
                <span className="text-base">{track.emoji}</span>
                <span className="leading-tight text-[10px]">
                  {isComingSoon ? "Soon" : track.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Play/pause + volume */}
        {activeId && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              data-ocid="dashboard.music.button"
              onClick={handleTogglePlay}
              className="w-7 h-7 rounded-full bg-sky text-white flex items-center justify-center shrink-0 hover:bg-sky/80 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>
            <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Slider
              data-ocid="dashboard.music.toggle"
              value={volume}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
          </div>
        )}

        {!activeId && (
          <p className="text-xs text-muted-foreground text-center py-0.5">
            Pick a sound to start focusing 🎧
          </p>
        )}
      </CardContent>
    </Card>
  );
}
