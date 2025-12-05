"use client";

import { useEffect, useRef } from 'react';

interface RadarScene2DProps {
  planePosition: { x: number; y: number; z: number };
  radarWaves: Array<{ id: number; progress: number; distance: number }>;
  stealthMode: boolean;
}

export default function RadarScene2D({ planePosition, radarWaves, stealthMode }: RadarScene2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Radar tower position (left side)
      const radarX = 100;
      const radarY = height / 2;
      
      // Plane position (convert 3D to 2D)
      const scale = 15;
      const planeX = radarX + planePosition.x * scale;
      const planeY = radarY - planePosition.z * scale;
      
      // Draw radar tower
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(radarX, radarY, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw radar tower antenna
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(radarX, radarY);
      ctx.lineTo(radarX, radarY - 20);
      ctx.stroke();
      
      // Draw plane
      const planeSize = 12;
      ctx.fillStyle = stealthMode ? '#22c55e' : '#3b82f6';
      
      // Simple plane shape (triangle)
      ctx.beginPath();
      ctx.moveTo(planeX + planeSize, planeY);
      ctx.lineTo(planeX - planeSize / 2, planeY - planeSize / 2);
      ctx.lineTo(planeX - planeSize / 2, planeY + planeSize / 2);
      ctx.closePath();
      ctx.fill();
      
      // Draw plane outline
      ctx.strokeStyle = stealthMode ? '#22c55e' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw radar waves
      radarWaves.forEach((wave) => {
        const waveProgress = wave.progress;
        
        // Calculate wave end point
        const waveEndX = radarX + (planeX - radarX) * waveProgress;
        const waveEndY = radarY + (planeY - radarY) * waveProgress;
        
        if (stealthMode) {
          // STEALTH MODE: Waves bend around the plane
          if (waveProgress < 0.5) {
            // Wave traveling to plane
            ctx.strokeStyle = `rgba(34, 197, 94, ${1 - waveProgress * 2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.lineTo(waveEndX, waveEndY);
            ctx.stroke();
            
            // Draw wave front
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
            ctx.beginPath();
            ctx.arc(waveEndX, waveEndY, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Wave reaches plane and bends around (deflects)
            const bendProgress = (waveProgress - 0.5) * 2;
            
            // Calculate bend angle (waves deflect upward and downward)
            const bendAngle = Math.PI / 3; // 60 degrees deflection
            const bendDistance = bendProgress * 200;
            
            // Draw wave to plane
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.lineTo(planeX, planeY);
            ctx.stroke();
            
            // Draw bent waves (two directions)
            const bentEndX1 = planeX + Math.cos(bendAngle) * bendDistance;
            const bentEndY1 = planeY - Math.sin(bendAngle) * bendDistance;
            
            const bentEndX2 = planeX + Math.cos(-bendAngle) * bendDistance;
            const bentEndY2 = planeY - Math.sin(-bendAngle) * bendDistance;
            
            // Upper bent wave
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.6 - bendProgress * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(planeX, planeY);
            ctx.lineTo(bentEndX1, bentEndY1);
            ctx.stroke();
            
            // Lower bent wave
            ctx.beginPath();
            ctx.moveTo(planeX, planeY);
            ctx.lineTo(bentEndX2, bentEndY2);
            ctx.stroke();
            
            // Wave fronts
            if (bendProgress < 0.8) {
              ctx.fillStyle = `rgba(34, 197, 94, ${0.8 - bendProgress})`;
              ctx.beginPath();
              ctx.arc(bentEndX1, bentEndY1, 4, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.beginPath();
              ctx.arc(bentEndX2, bentEndY2, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          // NORMAL MODE: Waves reflect back
          if (waveProgress < 0.5) {
            // Wave traveling to plane
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - waveProgress * 2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.lineTo(waveEndX, waveEndY);
            ctx.stroke();
            
            // Draw wave front
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.beginPath();
            ctx.arc(waveEndX, waveEndY, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Wave reflects back
            const reflectProgress = (waveProgress - 0.5) * 2;
            const reflectX = planeX + (radarX - planeX) * reflectProgress;
            const reflectY = planeY + (radarY - planeY) * reflectProgress;
            
            // Draw outgoing wave (faded)
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.lineTo(planeX, planeY);
            ctx.stroke();
            
            // Draw reflected wave
            ctx.strokeStyle = `rgba(239, 68, 68, ${1 - reflectProgress})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(planeX, planeY);
            ctx.lineTo(reflectX, reflectY);
            ctx.stroke();
            
            // Draw reflected wave front
            ctx.fillStyle = `rgba(239, 68, 68, ${0.8 - reflectProgress * 0.8})`;
            ctx.beginPath();
            ctx.arc(reflectX, reflectY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      
      // Draw labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('RADAR', radarX - 25, radarY + 30);
      ctx.fillText('PLANE', planeX - 25, planeY + 30);
      
      // Draw mode indicator
      ctx.fillStyle = stealthMode ? '#22c55e' : '#3b82f6';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(
        stealthMode ? '🛡️ STEALTH MODE: Waves Bending' : '📡 NORMAL MODE: Waves Reflecting',
        width / 2 - 150,
        30
      );
      
      // Draw distance line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(radarX, radarY);
      ctx.lineTo(planeX, planeY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw distance label
      const distance = Math.sqrt(planePosition.x ** 2 + planePosition.z ** 2);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(
        `Distance: ${distance.toFixed(1)} km`,
        (radarX + planeX) / 2 - 50,
        (radarY + planeY) / 2 - 10
      );
      
      animationId = requestAnimationFrame(animate);
    };
    
    let animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [planePosition, radarWaves, stealthMode]);
  
  return (
    <div className="relative w-full h-full bg-slate-950">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-600">
        <div className="text-sm text-slate-300">
          <div className="font-semibold mb-1">2D Wave Visualization</div>
          {stealthMode ? (
            <div className="text-green-400">• Waves bend around aircraft</div>
          ) : (
            <div className="text-blue-400">• Waves reflect back to radar</div>
          )}
        </div>
      </div>
    </div>
  );
}
