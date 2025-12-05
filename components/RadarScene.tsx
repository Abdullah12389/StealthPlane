"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface RadarSceneProps {
  planePosition: { x: number; y: number; z: number };
  planeRotation: { x: number; y: number; z: number };
  geometry: 'stealth' | 'conventional' | 'fighter';
  radarWaves: Array<{ id: number; progress: number; distance: number }>;
  isDetected: boolean;
  stealthMode: boolean;
}

function RadarTower() {
  return (
    <group position={[0, 0, 0]}>
      {/* Tower base */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Radar dish */}
      <mesh position={[0, 4.5, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Center sphere */}
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#48bb78" emissive="#48bb78" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function RotatingRadarWave() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 4.5, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 8.2, 64, 1, 0, Math.PI / 3]} />
        <meshBasicMaterial 
          color="#48bb78" 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

interface PlaneModelProps {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  geometry: 'stealth' | 'conventional' | 'fighter';
  isDetected: boolean;
  stealthMode: boolean;
}

function PlaneModel({ position, rotation, geometry, isDetected, stealthMode }: PlaneModelProps) {
  const planeRef = useRef<THREE.Group>(null);
  
  const planeColor = stealthMode ? "#22c55e" : isDetected ? "#ef4444" : "#3b82f6";
  
  // Different geometries for different plane types
  const planeGeometry = useMemo(() => {
    switch (geometry) {
      case 'stealth':
        // Angular, flat design (like F-117 or B-2)
        return (
          <group>
            {/* Main body - flat diamond shape */}
            <mesh>
              <boxGeometry args={[3, 0.3, 2]} />
              <meshStandardMaterial color={planeColor} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Wings - angled */}
            <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 12]}>
              <boxGeometry args={[2, 0.2, 3]} />
              <meshStandardMaterial color={planeColor} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[2, 0, 0]} rotation={[0, 0, -Math.PI / 12]}>
              <boxGeometry args={[2, 0.2, 3]} />
              <meshStandardMaterial color={planeColor} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Cockpit */}
            <mesh position={[0, 0.3, 0.5]}>
              <boxGeometry args={[0.6, 0.4, 0.8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      
      case 'fighter':
        // More traditional fighter jet
        return (
          <group>
            {/* Fuselage */}
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshStandardMaterial color={planeColor} metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Wings */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.2, 4, 1.5]} />
              <meshStandardMaterial color={planeColor} metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Tail */}
            <mesh position={[0, 0.5, -1.2]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.1, 1.2, 0.8]} />
              <meshStandardMaterial color={planeColor} metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Cockpit */}
            <mesh position={[0, 0.4, 1]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
            </mesh>
          </group>
        );
      
      case 'conventional':
        // Larger, less aerodynamic
        return (
          <group>
            {/* Main body */}
            <mesh>
              <boxGeometry args={[2.5, 0.8, 1.5]} />
              <meshStandardMaterial color={planeColor} metalness={0.5} roughness={0.5} />
            </mesh>
            
            {/* Wings */}
            <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[5, 0.3, 2]} />
              <meshStandardMaterial color={planeColor} metalness={0.5} roughness={0.5} />
            </mesh>
            
            {/* Tail */}
            <mesh position={[0, 0.5, -1.5]}>
              <boxGeometry args={[1.5, 1.5, 0.3]} />
              <meshStandardMaterial color={planeColor} metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        );
    }
  }, [geometry, planeColor]);
  
  return (
    <group 
      ref={planeRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      {planeGeometry}
      
      {/* Stealth field indicator */}
      {stealthMode && (
        <mesh>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.1} 
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

function RadarWaves({ 
  waves, 
  planePosition, 
  stealthMode 
}: { 
  waves: Array<{ id: number; progress: number; distance: number }>;
  planePosition: { x: number; y: number; z: number };
  stealthMode: boolean;
}) {
  return (
    <group position={[0, 4.5, 0]}>
      {waves.map((wave) => {
        if (stealthMode) {
          // Calculate if wave is near plane
          const waveRadius = wave.distance;
          const planeDistance = Math.sqrt(planePosition.x ** 2 + planePosition.z ** 2);
          const distanceToPlane = Math.abs(waveRadius - planeDistance);
          
          // If wave is near plane, bend it
          if (distanceToPlane < 3 && waveRadius > planeDistance - 3) {
            // Create bending effect by splitting the wave
            const segments = 64;
            const points: THREE.Vector3[] = [];
            
            for (let i = 0; i <= segments; i++) {
              const angle = (i / segments) * Math.PI * 2;
              const x = Math.cos(angle) * waveRadius;
              const z = Math.sin(angle) * waveRadius;
              
              // Calculate distance to plane
              const dx = x - planePosition.x;
              const dz = z - planePosition.z;
              const distToPlane = Math.sqrt(dx ** 2 + dz ** 2);
              
              // Bend away from plane
              if (distToPlane < 5) {
                const bendFactor = (5 - distToPlane) / 5;
                const bendAngle = Math.atan2(dz, dx);
                const bendDistance = bendFactor * 2;
                
                points.push(new THREE.Vector3(
                  x + Math.cos(bendAngle) * bendDistance,
                  0,
                  z + Math.sin(bendAngle) * bendDistance
                ));
              } else {
                points.push(new THREE.Vector3(x, 0, z));
              }
            }
            
            const curve = new THREE.CatmullRomCurve3(points, true);
            const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.15, 8, true);
            
            return (
              <mesh key={wave.id} rotation={[Math.PI / 2, 0, 0]}>
                <primitive object={tubeGeometry} />
                <meshBasicMaterial 
                  color="#22c55e" 
                  transparent 
                  opacity={Math.max(0, 0.6 - wave.progress * 0.6)} 
                />
              </mesh>
            );
          }
        }
        
        // Normal wave rendering
        return (
          <mesh key={wave.id} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[wave.distance - 0.5, wave.distance, 64]} />
            <meshBasicMaterial 
              color={stealthMode ? "#22c55e" : "#48bb78"} 
              transparent 
              opacity={Math.max(0, 1 - wave.progress)} 
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function RadarScene({ 
  planePosition, 
  planeRotation, 
  geometry,
  radarWaves,
  isDetected,
  stealthMode
}: RadarSceneProps) {
  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas>
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <OrbitControls makeDefault />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 10, 0]} intensity={0.5} color={stealthMode ? "#22c55e" : "#48bb78"} />
        
        {/* Grid */}
        <Grid 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={100}
          fadeStrength={1}
          position={[0, 0, 0]}
        />
        
        {/* Radar Tower */}
        <RadarTower />
        
        {/* Rotating Radar Wave */}
        <RotatingRadarWave />
        
        {/* Radar Waves */}
        <RadarWaves 
          waves={radarWaves} 
          planePosition={planePosition}
          stealthMode={stealthMode}
        />
        
        {/* Plane */}
        <PlaneModel 
          position={planePosition}
          rotation={planeRotation}
          geometry={geometry}
          isDetected={isDetected}
          stealthMode={stealthMode}
        />
        
        {/* Line from radar to plane */}
        {isDetected && !stealthMode && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  0, 4.5, 0,
                  planePosition.x, planePosition.y, planePosition.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ef4444" linewidth={2} />
          </line>
        )}
      </Canvas>
    </div>
  );
}