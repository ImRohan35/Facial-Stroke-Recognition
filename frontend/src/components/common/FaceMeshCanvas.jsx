import React, { useRef, useEffect } from 'react';

/**
 * Renders the MediaPipe landmark mesh and anatomical symmetry axes over a facial image.
 * Shows:
 * - Distinct colors for each anatomical region (Mouth: Red, Eyes: Cyan, Brows: Purple, Nose: Green, Jaw: Amber)
 * - Mid-sagittal reference axis (Glabella -> Menton)
 * - Bilateral mouth corner horizontal alignment vector
 * - Anatomical color-coded legend
 */
export const FaceMeshCanvas = ({
  imageUrl,
  landmarks = [],
  showMesh = true,
  showAxes = true,
  showRegions = true,
  showLegend = true,
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
      const mouthIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 13];
      const eyeIndices = [33, 160, 158, 133, 153, 144, 263, 387, 385, 362, 380, 373];
      const browIndices = [70, 63, 105, 66, 107, 300, 293, 334, 296, 336];
      const noseIndices = [9, 168, 1, 2, 164, 0, 197, 195, 5, 4];
      const jawIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

      const getCoord = (idx) => {
        const pt = landmarks.find(p => p.idx === idx);
        return pt ? { x: pt.x * w, y: pt.y * h } : null;
      };

      // 1. Draw connecting contour lines for realism and clarity
      if (showMesh) {
        // Eyebrow lines
        const drawPoly = (indices, strokeColor, lineWidth = 1.5) => {
          ctx.beginPath();
          let started = false;
          indices.forEach(idx => {
            const p = getCoord(idx);
            if (p) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else { ctx.lineTo(p.x, p.y); }
            }
          });
          if (started) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        };

        // Left & Right Eyebrow contours (Purple)
        drawPoly([70, 63, 105, 66, 107], 'rgba(168, 85, 247, 0.7)');
        drawPoly([300, 293, 334, 296, 336], 'rgba(168, 85, 247, 0.7)');

        // Eyes loops (Cyan)
        drawPoly([33, 160, 158, 133, 153, 144, 33], 'rgba(6, 182, 212, 0.7)');
        drawPoly([263, 387, 385, 362, 380, 373, 263], 'rgba(6, 182, 212, 0.7)');

        // Lips loop (Rose-Red)
        drawPoly([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 61], 'rgba(244, 63, 94, 0.7)');

        // Jawline perimeter (Amber)
        drawPoly([234, 127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356, 454], 'rgba(245, 158, 11, 0.4)', 1);

        // 2. Draw Landmark Points with distinct colors
        landmarks.forEach((pt) => {
          const px = pt.x * w;
          const py = pt.y * h;
          const idx = pt.idx;

          let color = '#f59e0b'; // Amber for jawline
          let radius = 2.5;

          const isMouth = mouthIndices.includes(idx);
          const isEye = eyeIndices.includes(idx);
          const isBrow = browIndices.includes(idx);
          const isNose = noseIndices.includes(idx);

          if (isMouth) {
            color = '#f43f5e'; // Rose-Red
            radius = (highlightRegion === 'mouth' || highlightRegion === 'all') ? 3.5 : 2.5;
          } else if (isEye) {
            color = '#06b6d4'; // Cyan
            radius = (highlightRegion === 'eyes' || highlightRegion === 'all') ? 3.5 : 2.5;
          } else if (isBrow) {
            color = '#a855f7'; // Purple
            radius = (highlightRegion === 'eyebrows' || highlightRegion === 'all') ? 3.5 : 2.5;
          } else if (isNose) {
            color = '#10b981'; // Emerald Green
            radius = 3.5;
          }

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 3. Draw Anatomical Axes & Vectors
      if (showAxes) {
        const glabella = getCoord(9) || getCoord(168);
        const menton = getCoord(152);
        const lMouth = getCoord(61);
        const rMouth = getCoord(291);

        // Mid-Sagittal Vertical Reference Line (Neon Lime dashed)
        if (glabella && menton) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2.5;
          ctx.moveTo(glabella.x, glabella.y);
          ctx.lineTo(menton.x, menton.y);
          ctx.stroke();
          ctx.restore();
        }

        // Horizontal Oral Commissure Line (Hot Pink dashed)
        if (lMouth && rMouth) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2.5;
          ctx.moveTo(lMouth.x, lMouth.y);
          ctx.lineTo(rMouth.x, rMouth.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. Region Highlight Box around Mouth Asymmetry
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
          ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
          ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
          ctx.restore();
        }
      }
    };
  }, [imageUrl, landmarks, showMesh, showAxes, showRegions, highlightRegion]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950 flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className={className} />
      
      {showLegend && (
        <div className="w-full bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-300">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block"></span>
            <span>Mouth / Lips</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block"></span>
            <span>Eyes</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] inline-block"></span>
            <span>Eyebrows</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block"></span>
            <span>Nose / Midline</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span>
            <span>Jawline</span>
          </div>
        </div>
      )}
    </div>
  );
};
