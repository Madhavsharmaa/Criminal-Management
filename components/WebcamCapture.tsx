"use client";

import { useEffect, useRef, useState } from "react";

export default function WebcamCapture({
  onCapture,
  burstCount = 5,
  captureLabel = "Capture 5 Photos",
}: {
  onCapture: (frames: string[]) => void;
  burstCount?: number;
  captureLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        setError("");

        const video = videoRef.current;

        if (!video) {
          throw new Error("Video element not found.");
        }

        if (!navigator.mediaDevices) {
          throw new Error(
            "navigator.mediaDevices is unavailable."
          );
        }

        if (!navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "getUserMedia is unavailable in this browser."
          );
        }

        console.log("Requesting camera...");

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

        console.log(
          "Camera stream:",
          stream
        );

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await video.play();

        console.log(
          "VIDEO DIMENSIONS:",
          video.videoWidth,
          video.videoHeight
        );

        if (
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          throw new Error(
            "Camera stream opened, but video dimensions are 0."
          );
        }

        setReady(true);
      } catch (err) {
        console.error(
          "CAMERA ERROR:",
          err
        );

        if (
          err instanceof DOMException
        ) {
          console.error(
            "name:",
            err.name
          );

          console.error(
            "message:",
            err.message
          );
        }

        setReady(false);

        setError(
          err instanceof Error
            ? `${err.name}: ${err.message}`
            : String(err)
        );
      }
    }

    start();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError(
        "Camera has no video frames."
      );

      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const frames: string[] = [];

    for (
      let i = 0;
      i < burstCount;
      i++
    ) {
      frames.push(
        canvas.toDataURL(
          "image/jpeg",
          0.9
        )
      );
    }

    onCapture(frames);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
      </div>

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={capture}
        disabled={!ready}
        className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {ready
          ? captureLabel
          : "Starting Camera..."}
      </button>
    </div>
  );
}