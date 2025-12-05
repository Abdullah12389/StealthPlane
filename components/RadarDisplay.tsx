"use client";

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { RadarResult } from '@/lib/radarPhysics';

interface RadarDisplayProps {
  result: RadarResult;
  radarRange: number;
  planePosition: { x: number; y: number; z: number };
  stealthMode: boolean;
}

export default function RadarDisplay({ result, radarRange, planePosition, stealthMode }: RadarDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 20;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw concentric circles (range rings)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const radius = (maxRadius * i) / 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Range labels
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText(
        `${((radarRange * i) / 4).toFixed(0)}km`,
        centerX + 5,
        centerY - radius + 15
      );
    }
    
    // Draw crosshairs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Draw sweep line (rotating)
    const time = Date.now() / 1000;
    const sweepAngle = (time * Math.PI / 2) % (Math.PI * 2);
    
    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + Math.cos(sweepAngle) * maxRadius,
      centerY + Math.sin(sweepAngle) * maxRadius
    );
    gradient.addColorStop(0, stealthMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.5)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(sweepAngle) * maxRadius,
      centerY + Math.sin(sweepAngle) * maxRadius
    );
    ctx.stroke();
    
    // Calculate plane position on radar (1 scene unit = 1 km)
    const planeDistance = Math.sqrt(planePosition.x ** 2 + planePosition.z ** 2);
    const planeAngle = Math.atan2(planePosition.x, planePosition.z);
    const distanceRatio = planeDistance / radarRange;
    const targetRadius = Math.min(distanceRatio * maxRadius, maxRadius);
    
    const targetX = centerX + Math.sin(planeAngle) * targetRadius;
    const targetY = centerY - Math.cos(planeAngle) * targetRadius;
    
    // Draw plane tracking dot (always visible)
    const dotSize = 4;
    const pulseSize = dotSize + Math.sin(time * 3) * 2;
    
    // Draw trailing path
    ctx.strokeStyle = stealthMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw plane dot
    ctx.fillStyle = stealthMode ? 'rgba(34, 197, 94, 0.9)' : 'rgba(59, 130, 246, 0.9)';
    ctx.beginPath();
    ctx.arc(targetX, targetY, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw outer ring
    ctx.strokeStyle = stealthMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, targetY, pulseSize + 4, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw detected target (only if detected and not in stealth mode)
    if (result.isDetected && !stealthMode) {
      const detectedPulseSize = 6 + Math.sin(time * 5) * 3;
      
      ctx.fillStyle = `rgba(239, 68, 68, ${result.detectionProbability})`;
      ctx.beginPath();
      ctx.arc(targetX, targetY, detectedPulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw target ring
      ctx.strokeStyle = `rgba(239, 68, 68, ${result.detectionProbability * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, detectedPulseSize + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Stealth mode indicator
    if (stealthMode) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('STEALTH MODE ACTIVE', 10, 20);
    }
    
    // Animate
    const animationId = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(animationId);
  }, [result, radarRange, planePosition, stealthMode]);
  
  // Redraw every frame for animation
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Trigger re-render by updating a dummy state or calling the effect again
        const event = new Event('draw');
        canvas.dispatchEvent(event);
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [result, radarRange, planePosition, stealthMode]);
  
  return (
    <div className="space-y-4">
      {/* Radar Screen */}
      <Card className="p-4 bg-slate-800 border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-3">Radar Display</h3>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full border-2 border-slate-600 rounded-lg"
          />
        </div>
      </Card>
      
      {/* Numerical Readouts */}
      <Card className="p-4 bg-slate-800 border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-3">Detection Data</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Distance</div>
            <div className="text-xl font-mono text-white">
              {(result.distance / 1000).toFixed(2)} km
            </div>
          </div>
          
          <div>
            <div className="text-slate-400">Angle</div>
            <div className="text-xl font-mono text-white">
              {result.angle.toFixed(1)}°
            </div>
          </div>
          
          <div>
            <div className="text-slate-400">Effective RCS</div>
            <div className="text-xl font-mono text-white">
              {result.effectiveRCS.toFixed(4)} m²
            </div>
          </div>
          
          <div>
            <div className="text-slate-400">Signal Strength</div>
            <div className="text-xl font-mono text-white">
              {result.signalStrength.toFixed(1)} dBm
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="text-slate-400">Detection Probability</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    stealthMode
                      ? 'bg-green-500'
                      : result.detectionProbability > 0.7
                      ? 'bg-red-500'
                      : result.detectionProbability > 0.3
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: stealthMode ? '0%' : `${result.detectionProbability * 100}%` }}
                />
              </div>
              <div className="text-xl font-mono text-white w-16">
                {stealthMode ? '0' : (result.detectionProbability * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className={`text-lg font-bold ${
              stealthMode ? 'text-green-500' : result.isDetected ? 'text-red-500' : 'text-green-500'
            }`}>
              {stealthMode ? '🛡️ STEALTH MODE' : result.isDetected ? '⚠️ DETECTED' : '✓ STEALTH SUCCESSFUL'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}