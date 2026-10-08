import React, { useEffect, useRef } from 'react';

/**
 * WatermarkOverlay: Implements steganographic-like/extremely low opacity hidden watermarking
 * over a video player element for leak tracking, as per Section 7.3 specifications.
 */
export default function WatermarkOverlay({ encodedToken }) {
  const canvasRef = useRef(null);

  // Helper to decode the signed/encoded token at draw time ONLY.
  // Never stores the decoded value in state, refs, or local storage.
  const decodeWatermark = (token) => {
    try {
      if (!token) return 'LSA-UNKNOWN';
      // Simple base64 decoding simulation (real system would use JWT/signatures)
      return atob(token);
    } catch (e) {
      return 'LSA-ERROR';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const drawWatermark = () => {
      // Decode inside the drawing loop only
      const watermarkText = decodeWatermark(encodedToken);
      
      // Ensure canvas matches its layout size (responsive)
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Setup text options
      ctx.save();
      ctx.scale(dpr, dpr);
      
      // Extremely low opacity - invisible to the eye, but reveals under high contrast filter
      ctx.fillStyle = 'rgba(255, 255, 255, 0.006)'; 
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.textAlign = 'center';
      
      // Draw watermark in a grid pattern covering the entire canvas
      const width = rect.width;
      const height = rect.height;
      const xSpacing = 160;
      const ySpacing = 100;
      
      for (let x = 40; x < width; x += xSpacing) {
        for (let y = 30; y < height; y += ySpacing) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 12); // subtle tilt to make it harder to crop/bypass
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }
      }
      
      ctx.restore();
      
      // Keep drawing to prevent simple canvas manipulation/state freezes
      animationFrameId = requestAnimationFrame(drawWatermark);
    };

    // Start render loop
    drawWatermark();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [encodedToken]);

  return (
    <canvas 
      ref={canvasRef} 
      className="watermark-overlay-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // pass events through to video controls
        zIndex: 10
      }}
    />
  );
}
