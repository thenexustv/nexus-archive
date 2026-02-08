import { useCallback, useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  src: string;
  duration: string | null;
  fileSize: string | null;
  title: string;
}

export function parseDuration(str: string | null): number {
  if (!str) return 0;
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [state, setState] = useState<PlayerState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState<number | null>(null);
  const [useSyntheticViz, setUseSyntheticViz] = useState(false);
  const zeroFrameCount = useRef(0);
  const corsFailedRef = useRef(false);

  // Create the audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audio.src = src;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setRealDuration(audio.duration);
    const onEnded = () => setState("paused");
    const onError = () => {
      // If CORS blocked loading entirely, retry without crossOrigin
      if (!corsFailedRef.current && audio.crossOrigin) {
        corsFailedRef.current = true;
        audio.crossOrigin = null;
        audio.src = src;
        setUseSyntheticViz(true);
      } else {
        setState("error");
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      if (ctxRef.current) ctxRef.current.close();
    };
  }, [src]);

  const initAudioContext = useCallback(() => {
    if (ctxRef.current || corsFailedRef.current || useSyntheticViz) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      setUseSyntheticViz(true);
    }
  }, [useSyntheticViz]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    initAudioContext();
    if (ctxRef.current?.state === "suspended") {
      await ctxRef.current.resume();
    }

    setState("loading");
    try {
      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }, [initAudioContext]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState("paused");
  }, []);

  const togglePlay = useCallback(() => {
    if (state === "playing") pause();
    else play();
  }, [state, play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || Infinity));
    setCurrentTime(audio.currentTime);
    zeroFrameCount.current = 0;
  }, []);

  const skip = useCallback(
    (delta: number) => {
      seek((audioRef.current?.currentTime ?? 0) + delta);
    },
    [seek],
  );

  // Detect CORS zero-data after play starts
  const checkFrequencyData = useCallback(
    (data: Uint8Array) => {
      if (useSyntheticViz || state !== "playing") return;
      const allZero = data.every((v) => v === 0);
      if (allZero) {
        zeroFrameCount.current++;
        if (zeroFrameCount.current > 60) {
          setUseSyntheticViz(true);
        }
      } else {
        zeroFrameCount.current = 0;
      }
    },
    [useSyntheticViz, state],
  );

  return {
    audioRef,
    analyserRef,
    state,
    currentTime,
    realDuration,
    useSyntheticViz,
    play,
    pause,
    togglePlay,
    seek,
    skip,
    checkFrequencyData,
  };
}

function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

const STORAGE_KEY = "nexus.player";

function NativePlayer({ src, duration, fileSize, onSwitchPlayer }: {
  src: string;
  duration: string | null;
  fileSize: string | null;
  onSwitchPlayer: () => void;
}) {
  const fileSizeMB = fileSize
    ? (parseInt(fileSize) / 1_048_576).toFixed(1)
    : null;

  return (
    <div className="mb-8 p-4 bg-gray-50 dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg shadow-sm">
      <audio controls preload="none" className="w-full">
        <source src={src} type="audio/mpeg" />
      </audio>
      <div className="mt-2 text-xs text-gray-500 dark:text-stone-400 flex items-center gap-4">
        {duration && <span>Duration: {duration}</span>}
        {fileSizeMB && <span>Size: {fileSizeMB} MB</span>}
        <a
          href={src}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          download
        >
          Download MP3
        </a>
        <span className="flex-1" />
        <button
          type="button"
          aria-label="Player settings"
          onClick={onSwitchPlayer}
          className="p-1 text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300 focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus-visible:outline-none"
        >
          <GearIcon />
        </button>
      </div>
    </div>
  );
}

export default function AudioPlayer({
  src,
  duration,
  fileSize,
  title,
}: AudioPlayerProps) {
  const [useNative, setUseNative] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "native";
    } catch {
      return false;
    }
  });

  const togglePlayerType = useCallback(() => {
    setUseNative((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem(STORAGE_KEY, "native");
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
      return next;
    });
  }, []);

  if (useNative) {
    return (
      <NativePlayer
        src={src}
        duration={duration}
        fileSize={fileSize}
        onSwitchPlayer={togglePlayerType}
      />
    );
  }

  return (
    <CustomPlayer
      src={src}
      duration={duration}
      fileSize={fileSize}
      title={title}
      onSwitchPlayer={togglePlayerType}
    />
  );
}

function CustomPlayer({
  src,
  duration,
  fileSize,
  title,
  onSwitchPlayer,
}: AudioPlayerProps & { onSwitchPlayer: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  const metaDuration = parseDuration(duration);
  const fileSizeMB = fileSize
    ? (parseInt(fileSize) / 1_048_576).toFixed(1)
    : null;

  const {
    analyserRef,
    state,
    currentTime,
    realDuration,
    useSyntheticViz,
    togglePlay,
    seek,
    skip,
    checkFrequencyData,
  } = useAudioPlayer(src);

  const totalDuration = realDuration ?? metaDuration;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  // Dark mode detection
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = 80 * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = "80px";
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 40;
    const dataArray = new Uint8Array(64);
    const barColor = isDark
      ? "rgba(96, 165, 250, 0.8)"
      : "rgba(59, 130, 246, 0.8)";
    const progressColor = isDark
      ? "rgba(96, 165, 250, 0.6)"
      : "rgba(59, 130, 246, 0.6)";
    const bgColor = isDark ? "#1c1917" : "#f9fafb";

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, w, h);

      const analyser = analyserRef.current;
      const isPlaying = state === "playing";

      if (isPlaying && analyser && !useSyntheticViz) {
        analyser.getByteFrequencyData(dataArray);
        checkFrequencyData(dataArray);
      } else if (isPlaying && useSyntheticViz) {
        // Synthetic visualization based on playback time
        const t = performance.now() / 1000;
        for (let i = 0; i < dataArray.length; i++) {
          const wave =
            Math.sin(t * 2 + i * 0.4) * 0.3 +
            Math.sin(t * 3.7 + i * 0.7) * 0.2 +
            Math.sin(t * 1.3 + i * 1.1) * 0.15 +
            0.35;
          dataArray[i] = Math.floor(Math.max(0, Math.min(1, wave)) * 200);
        }
      } else {
        // When paused/idle, show low ambient bars
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = useSyntheticViz || state === "paused" ? 15 : 10;
        }
      }

      const gap = 3;
      const dpr = window.devicePixelRatio || 1;
      const barWidth = (w - gap * (barCount + 1)) / barCount;
      const radius = 2 * dpr;

      ctx!.fillStyle = barColor;
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255;
        const barHeight = Math.max(4 * dpr, value * (h - 8 * dpr));
        const x = gap + i * (barWidth + gap);
        const y = h - barHeight - 4 * dpr;

        ctx!.beginPath();
        ctx!.moveTo(x + radius, y);
        ctx!.lineTo(x + barWidth - radius, y);
        ctx!.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx!.lineTo(x + barWidth, y + barHeight);
        ctx!.lineTo(x, y + barHeight);
        ctx!.lineTo(x, y + radius);
        ctx!.quadraticCurveTo(x, y, x + radius, y);
        ctx!.fill();
      }

      // Progress bar at bottom
      const progressBarHeight = 3 * dpr;
      ctx!.fillStyle = progressColor;
      ctx!.fillRect(0, h - progressBarHeight, w * progress, progressBarHeight);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    isDark,
    state,
    useSyntheticViz,
    analyserRef,
    checkFrequencyData,
    progress,
  ]);

  // Seek on canvas click/touch
  const handleCanvasSeek = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas || totalDuration <= 0) return;
      const rect = canvas.getBoundingClientRect();
      const fraction = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      seek(fraction * totalDuration);
    },
    [seek, totalDuration],
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(5);
          break;
        case "j":
          e.preventDefault();
          skip(-15);
          break;
        case "l":
          e.preventDefault();
          skip(15);
          break;
      }
    },
    [togglePlay, skip],
  );

  if (state === "error") {
    return (
      <div className="mb-8 p-4 bg-gray-50 dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg shadow-sm text-gray-500 dark:text-stone-400 text-sm">
        Episode audio unavailable.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`Audio player for ${title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="mb-8 bg-gray-50 dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none overflow-hidden"
    >
      {/* Visualization canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full cursor-pointer"
        style={{ height: "80px", display: "block" }}
        onClick={(e) => handleCanvasSeek(e.clientX)}
        onTouchEnd={(e) => {
          if (e.changedTouches[0]) handleCanvasSeek(e.changedTouches[0].clientX);
        }}
      />

      {/* Controls row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Rewind 15s */}
        <button
          type="button"
          aria-label="Rewind 15 seconds"
          onClick={() => skip(-15)}
          className="p-1.5 text-gray-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus-visible:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 17a5 5 0 1 0 0-6" />
            <polyline points="11 7 11 13 7 11" />
            <text
              x="15"
              y="17"
              fontSize="7"
              fill="currentColor"
              stroke="none"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              15
            </text>
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          type="button"
          aria-label={state === "playing" ? "Pause" : "Play"}
          onClick={togglePlay}
          className="p-2 text-gray-700 dark:text-stone-200 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus-visible:outline-none"
        >
          {state === "loading" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-spin"
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
            </svg>
          ) : state === "playing" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Forward 15s */}
        <button
          type="button"
          aria-label="Forward 15 seconds"
          onClick={() => skip(15)}
          className="p-1.5 text-gray-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus-visible:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 17a5 5 0 1 1 0-6" />
            <polyline points="13 7 13 13 17 11" />
            <text
              x="9"
              y="17"
              fontSize="7"
              fill="currentColor"
              stroke="none"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              15
            </text>
          </svg>
        </button>

        {/* Time display */}
        <span
          className="ml-2 text-sm font-mono text-gray-600 dark:text-stone-400 select-none"
          aria-live="off"
        >
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Download link */}
        <a
          href={src}
          download
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 py-0.5 focus-visible:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {fileSizeMB ? `${fileSizeMB} MB` : "Download"}
        </a>

        {/* Settings */}
        <button
          type="button"
          aria-label="Switch to native player"
          onClick={onSwitchPlayer}
          className="p-1 text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300 focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus-visible:outline-none"
        >
          <GearIcon />
        </button>
      </div>
    </div>
  );
}
