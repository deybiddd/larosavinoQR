"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import Webcam from "react-webcam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// react-webcam is client-side; imported above with types

export default function ScannerPage() {
  const webcamRef = useRef<React.ElementRef<typeof Webcam>>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scanning, setScanning] = useState(true);
  const [lastSecret, setLastSecret] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<MediaTrackConstraints["facingMode"]>("environment");
  const [manualSecret, setManualSecret] = useState("");

  const scanFrame = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current) return;
    const video = (webcamRef.current as unknown as { video?: HTMLVideoElement })?.video;
    if (!video || video.readyState !== 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Read image data and attempt QR decode
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const jsQR = (await import("jsqr")).default;
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code && code.data) {
      const secret = code.data;
      if (secret === lastSecret) return; // avoid duplicate spam
      setLastSecret(secret);
      setScanning(false);
      const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ secret }) });
      const json = await res.json();
      if (json.valid) {
        toast.success("Checked in ✅");
      } else {
        const reason = json.reason || "invalid";
        const label = reason === "duplicate" ? "Already checked in" : reason === "revoked" ? "Revoked" : "Invalid";
        toast.error(label);
      }
      setTimeout(() => setScanning(true), 800);
    }
  }, [lastSecret]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (scanning) void scanFrame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scanFrame, scanning]);

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10">
      <Toaster richColors closeButton />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>QR Scanner</span>
            <Badge variant="secondary">{scanning ? "Scanning" : "Processing"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
              className="text-xs rounded-md px-3 py-1 border border-border hover:bg-accent hover:text-accent-foreground"
              aria-label="Switch camera"
            >
              Switch camera
            </button>
            <label className="text-xs rounded-md px-3 py-1 border border-border cursor-pointer hover:bg-accent hover:text-accent-foreground">
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const img = new Image();
                  img.onload = async () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const jsQR = (await import("jsqr")).default;
                    const code = jsQR(data.data, data.width, data.height);
                    if (code?.data) {
                      const secret = code.data;
                      const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ secret }) });
                      const json = await res.json();
                      if (json.valid) toast.success("Checked in ✅");
                      else toast.error(json.reason || "Invalid");
                    } else {
                      toast.error("No QR found in image");
                    }
                  };
                  img.src = URL.createObjectURL(file);
                }}
              />
            </label>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode }}
              className="h-full w-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Point the camera at the attendee’s QR code. Results will appear as toast alerts.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <input
              value={manualSecret}
              onChange={(e) => setManualSecret(e.target.value)}
              placeholder="Or paste code manually…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              aria-label="Manual code"
            />
            <button
              type="button"
              onClick={async () => {
                if (!manualSecret.trim()) return;
                const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ secret: manualSecret.trim() }) });
                const json = await res.json();
                if (json.valid) toast.success("Checked in ✅");
                else toast.error(json.reason || "Invalid");
              }}
              className="text-xs rounded-md px-3 py-2 border border-border hover:bg-accent hover:text-accent-foreground"
            >
              Verify
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


