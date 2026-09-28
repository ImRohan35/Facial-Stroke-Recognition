import React, { useRef, useEffect } from 'react';

/**
 * Renders the MediaPipe landmark mesh and anatomical symmetry axes over a facial image.
 * Shows:
 * - 468 landmark points or key contour points
 * - Mid-sagittal reference axis (Glabella -> Menton)
 * - Bilateral mouth corner horizontal alignment line
 * - Eye aperture bounding boxes
 */
export const FaceMeshCanvas = ({
  imageUrl,
  landmarks = [],
  showMesh = true,
  showAxes = true,
  showRegions = true,
  highlightRegion = 'all', // 'all', 'mouth', 'eyes', 'eyebrows', 'nose'
  className = "w-full h-auto rounded-xl"
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.naturalWidth || 640;
      canvas.height = img.naturalHeight || 480;

      // Draw base image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!landmarks || landmarks.length === 0) return;

      const w = canvas.width;
      const h = canvas.height;

      // Group landmarks by anatomical region
      const mouthIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];
      const eyeIndices = [33, 160, 158, 133, 153, 144, 263, 387, 385, 362, 380, 373];
      const browIndices = [70, 63, 105, 66, 107, 300, 293, 334, 296, 336];
      const noseIndices = [9, 168, 1, 2, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175, 152];

      // Draw Landmark Points
      if (showMesh) {
        landmarks.forEach((pt) => {
          const px = pt.x * w;
          const py = pt.y * h;
          const idx = pt.idx;

          let color = '#38bdf8'; // Default cyan
          let radius = 2.5;

          const isMouth = mouthIndices.includes(idx);
          const isEye = eyeIndices.includes(idx);
          const isBrow = browIndices.includes(idx);
          const isNose = noseIndices.includes(idx);

          if (isMouth) {
            color = '#f43f5e'; // Rose
            radius = (highlightRegion === 'mouth' || highlightRegion === 'all') ? 3.5 : 2;
          } else if (isEye) {
            color = '#3b82f6'; // Blue
            radius = (highlightRegion === 'eyes' || highlightRegion === 'all') ? 3.5 : 2;
          } else if (isBrow) {
            color = '#8b5cf6'; // Violet
            radius = (highlightRegion === 'eyebrows' || highlightRegion === 'all') ? 3.5 : 2;
          } else if (isNose) {
            color = '#10b981'; // Emerald
            radius = 3.5;
          }

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        });
      }

      // Draw Anatomical Axes & Lines
      if (showAxes) {
        // Find Mid-sagittal line points: Glabella (9) and Menton (152) or Nose Tip (1)
        const glabella = landmarks.find(p => p.idx === 9);
        const menton = landmarks.find(p => p.idx === 152);
        const nose = landmarks.find(p => p.idx === 1);
        const lMouth = landmarks.find(p => p.idx === 61);
        const rMouth = landmarks.find(p => p.idx === 291);

        // 1. Mid-Sagittal Vertical Reference Line (Green dashed)
        if (glabella && menton) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.moveTo(glabella.x * w, glabella.y * h);
          ctx.lineTo(menton.x * w, menton.y * h);
          ctx.stroke();
          ctx.restore();
        }

        // 2. Horizontal Oral Commissure Line (Red dashed)
        if (lMouth && rMouth) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.moveTo(lMouth.x * w, lMouth.y * h);
          ctx.lineTo(rMouth.x * w, rMouth.y * h);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw Highlight Boxes around anatomical regions
      if (showRegions && (highlightRegion === 'mouth' || highlightRegion === 'all')) {
        const mouthPts = landmarks.filter(p => mouthIndices.includes(p.idx));
        if (mouthPts.length > 0) {
          const xs = mouthPts.map(p => p.x * w);
          const ys = mouthPts.map(p => p.y * h);
          const minX = Math.min(...xs) - 10;
          const maxX = Math.max(...xs) + 10;
          const minY = Math.min(...ys) - 10;
          const maxY = Math.max(...ys) + 10;

          ctx.save();
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
          ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
          ctx.restore();
        }
      }
    };
  }, [imageUrl, landmarks, showMesh, showAxes, showRegions, highlightRegion]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className={className} />
    </div>
  );
};
