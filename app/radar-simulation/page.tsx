"use client";

import { useState, useEffect } from 'react';
import RadarScene from '@/components/RadarScene';
import RadarScene2D from '@/components/RadarScene2D';
import ControlPanel from '@/components/ControlPanel';
import RadarDisplay from '@/components/RadarDisplay';
import { PlaneParameters, RadarParameters, calculateRadarReturn, RadarResult, getOptimalStealthParams, isOptimalStealthConfig } from '@/lib/radarPhysics';
import { Button } from '@/components/ui/button';
import { Home, Shield, Box, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

export default function RadarSimulationPage() {
  const [planeParams, setPlaneParams] = useState<PlaneParameters>({
    radarCrossSection: 0.01,
    absorptionCoefficient: 0.8,
    geometry: 'stealth',
    angleToRadar: 0,
    position: { x: 10, y: 8, z: 15 },
  });
  
  const [radarParams, setRadarParams] = useState<RadarParameters>({
    frequency: 10,
    power: 500,
    range: 100,
    sensitivity: -90,
  });
  
  const [radarResult, setRadarResult] = useState<RadarResult>({
    distance: 0,
    angle: 0,
    detectionProbability: 0,
    signalStrength: -200,
    effectiveRCS: 0,
    isDetected: false,
  });
  
  const [radarWaves, setRadarWaves] = useState<Array<{ id: number; progress: number; distance: number }>>([]);
  const [waveCounter, setWaveCounter] = useState(0);
  const [stealthMode, setStealthMode] = useState(false);
  const [sceneMode, setSceneMode] = useState<'3d' | '2d'>('3d');
  
  // Calculate radar return
  useEffect(() => {
    const result = calculateRadarReturn(planeParams, radarParams);
    setRadarResult(result);
  }, [planeParams, radarParams]);
  
  // Auto-deactivate stealth mode if parameters don't match optimal config
  useEffect(() => {
    if (stealthMode && !isOptimalStealthConfig(planeParams)) {
      setStealthMode(false);
    }
  }, [planeParams, stealthMode]);
  
  // Update plane rotation based on angle to radar
  const planeRotation = {
    x: 0,
    y: (planeParams.angleToRadar * Math.PI) / 180,
    z: 0,
  };
  
  // Emit radar waves periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveCounter((prev) => prev + 1);
      setRadarWaves((prev) => [
        ...prev,
        { id: Date.now(), progress: 0, distance: 0 },
      ]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animate radar waves
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarWaves((prev) =>
        prev
          .map((wave) => ({
            ...wave,
            progress: wave.progress + 0.02,
            distance: wave.distance + 1,
          }))
          .filter((wave) => wave.progress < 1 && wave.distance < 40)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePlaneParamsChange = (params: Partial<PlaneParameters>) => {
    setPlaneParams((prev) => ({ ...prev, ...params }));
  };
  
  const handleRadarParamsChange = (params: Partial<RadarParameters>) => {
    setRadarParams((prev) => ({ ...prev, ...params }));
  };

  const toggleStealthMode = () => {
    if (!stealthMode) {
      // Enabling stealth mode: apply optimal parameters
      const optimalParams = getOptimalStealthParams(planeParams.position);
      setPlaneParams(optimalParams);
      setStealthMode(true);
    } else {
      // Disabling stealth mode
      setStealthMode(false);
    }
  };

  const toggleSceneMode = () => {
    setSceneMode((prev) => prev === '3d' ? '2d' : '3d');
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Acoustic Stealth Plane Radar Simulator</h1>
            <p className="text-slate-400 text-sm mt-1">
              Simulate radar detection of stealth aircraft with real-time physics
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={toggleSceneMode}
            >
              {sceneMode === '3d' ? <Grid3x3 className="mr-2 h-4 w-4" /> : <Box className="mr-2 h-4 w-4" />}
              {sceneMode === '3d' ? '2D View' : '3D View'}
            </Button>
            <Button 
              variant={stealthMode ? "default" : "outline"} 
              size="sm"
              onClick={toggleStealthMode}
              className={stealthMode ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Shield className="mr-2 h-4 w-4" />
              {stealthMode ? "Stealth Active" : "Go Stealth Mode"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scene */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              {sceneMode === '3d' ? (
                <RadarScene
                  planePosition={planeParams.position}
                  planeRotation={planeRotation}
                  geometry={planeParams.geometry}
                  radarWaves={radarWaves}
                  isDetected={radarResult.isDetected}
                  stealthMode={stealthMode}
                />
              ) : (
                <RadarScene2D
                  planePosition={planeParams.position}
                  radarWaves={radarWaves}
                  stealthMode={stealthMode}
                />
              )}
            </div>
            
            {/* Info Panel */}
            <div className="mt-4 p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">How It Works</h3>
              <p className="text-slate-400 text-sm">
                {sceneMode === '3d' ? (
                  <>
                    This simulator uses the radar equation to calculate detection probability. 
                    Stealth aircraft minimize their Radar Cross Section (RCS) through shape design 
                    and radar-absorbing materials. The detection depends on distance, radar power, 
                    frequency, target RCS, and angle of incidence.
                  </>
                ) : (
                  <>
                    The 2D view shows radar waves as straight lines traveling from the radar to the plane. 
                    In <span className="text-blue-400 font-semibold">normal mode</span>, waves reflect back to the radar for detection. 
                    In <span className="text-green-400 font-semibold">stealth mode</span>, waves bend around the plane and never return!
                  </>
                )}
                {stealthMode && (
                  <span className="text-green-400 font-semibold"> STEALTH MODE ACTIVE: Optimal parameters applied (RCS=0.001m², Absorption=95%, Angle=0°). Any manual parameter change will deactivate stealth mode.</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Right Column - Controls and Display */}
          <div className="space-y-6">
            <div className="max-h-[600px] overflow-y-auto">
              <ControlPanel
                planeParams={planeParams}
                radarParams={radarParams}
                onPlaneParamsChange={handlePlaneParamsChange}
                onRadarParamsChange={handleRadarParamsChange}
              />
            </div>
            
            <RadarDisplay 
              result={radarResult} 
              radarRange={radarParams.range}
              planePosition={planeParams.position}
              stealthMode={stealthMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}