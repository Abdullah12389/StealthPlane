// Radar physics calculations for stealth plane simulation

export interface PlaneParameters {
  // Material properties
  radarCrossSection: number; // Base RCS in m²
  absorptionCoefficient: number; // 0-1, how much radar energy is absorbed
  
  // Shape parameters
  geometry: 'stealth' | 'conventional' | 'fighter';
  angleToRadar: number; // degrees
  
  // Position
  position: { x: number; y: number; z: number };
}

export interface RadarParameters {
  frequency: number; // GHz
  power: number; // kW
  range: number; // km
  sensitivity: number; // dBm
}

export interface RadarResult {
  distance: number;
  angle: number;
  detectionProbability: number;
  signalStrength: number; // dBm
  effectiveRCS: number; // m²
  isDetected: boolean;
}

/**
 * Optimal stealth parameters based on RCS equation:
 * Pr = (Pt × G² × λ² × σ) / ((4π)³ × R⁴)
 * 
 * To minimize detection probability (Pr), we minimize σ (RCS) by:
 * - Using minimum radarCrossSection (0.001 m²)
 * - Maximum absorption coefficient (0.95 = 95%)
 * - Stealth geometry with angular surfaces
 * - Optimal angle (0° front-facing for lowest RCS)
 */
export const OPTIMAL_STEALTH_PARAMS = {
  radarCrossSection: 0.001,
  absorptionCoefficient: 0.95,
  geometry: 'stealth' as const,
  angleToRadar: 0,
};

/**
 * Check if current plane parameters match optimal stealth configuration
 */
export function isOptimalStealthConfig(params: PlaneParameters): boolean {
  return (
    params.radarCrossSection === OPTIMAL_STEALTH_PARAMS.radarCrossSection &&
    params.absorptionCoefficient === OPTIMAL_STEALTH_PARAMS.absorptionCoefficient &&
    params.geometry === OPTIMAL_STEALTH_PARAMS.geometry &&
    params.angleToRadar === OPTIMAL_STEALTH_PARAMS.angleToRadar
  );
}

/**
 * Get optimal stealth parameters while preserving position
 */
export function getOptimalStealthParams(currentPosition: { x: number; y: number; z: number }): PlaneParameters {
  return {
    ...OPTIMAL_STEALTH_PARAMS,
    position: currentPosition,
  };
}

/**
 * Calculate effective RCS based on plane geometry and angle
 */
export function calculateEffectiveRCS(params: PlaneParameters): number {
  const { radarCrossSection, geometry, angleToRadar } = params;
  
  // Convert angle to radians
  const angleRad = (angleToRadar * Math.PI) / 180;
  
  // Geometry-specific RCS modifiers
  const geometryFactors = {
    stealth: 0.001, // Very low base RCS
    fighter: 5.0,   // Moderate RCS
    conventional: 25.0, // High RCS
  };
  
  const baseFactor = geometryFactors[geometry];
  
  // Angular dependency - stealth aircraft have strong angular RCS variation
  // Front and back have lowest RCS, sides have higher RCS
  const angularFactor = geometry === 'stealth' 
    ? 1 + 50 * Math.pow(Math.sin(angleRad), 4) // Strong variation for stealth
    : 1 + 2 * Math.pow(Math.sin(angleRad), 2);  // Moderate variation for others
  
  return radarCrossSection * baseFactor * angularFactor;
}

/**
 * Calculate radar equation: Pr = (Pt * G² * λ² * σ) / ((4π)³ * R⁴)
 */
export function calculateRadarReturn(
  planeParams: PlaneParameters,
  radarParams: RadarParameters
): RadarResult {
  const { position } = planeParams;
  const { frequency, power, range, sensitivity } = radarParams;
  
  // Calculate distance to plane
  const distance = Math.sqrt(
    position.x ** 2 + position.y ** 2 + position.z ** 2
  );
  
  // Calculate angle
  const angle = Math.atan2(position.x, position.z) * (180 / Math.PI);
  
  // Check if plane is within radar range
  if (distance > range * 1000) {
    return {
      distance,
      angle,
      detectionProbability: 0,
      signalStrength: -200,
      effectiveRCS: 0,
      isDetected: false,
    };
  }
  
  // Calculate effective RCS considering material absorption
  const baseRCS = calculateEffectiveRCS(planeParams);
  const effectiveRCS = baseRCS * (1 - planeParams.absorptionCoefficient);
  
  // Wavelength in meters
  const wavelength = (3e8) / (frequency * 1e9);
  
  // Radar equation (simplified, assume unity gain)
  const Pt = power * 1000; // Convert to watts
  const R = distance; // meters
  
  // Received power in watts
  const Pr = (Pt * wavelength ** 2 * effectiveRCS) / 
             (Math.pow(4 * Math.PI, 3) * Math.pow(R, 4));
  
  // Convert to dBm
  const signalStrength = 10 * Math.log10(Pr * 1000);
  
  // Detection probability based on signal strength vs sensitivity
  const SNR = signalStrength - sensitivity;
  let detectionProbability = 0;
  
  if (SNR > 10) {
    detectionProbability = 1.0;
  } else if (SNR > 0) {
    detectionProbability = SNR / 10;
  } else if (SNR > -10) {
    detectionProbability = Math.max(0, (SNR + 10) / 20);
  }
  
  // Stealth is successful only when detection probability is below 30%
  const isDetected = detectionProbability > 0.3;
  
  return {
    distance,
    angle,
    detectionProbability,
    signalStrength,
    effectiveRCS,
    isDetected,
  };
}

/**
 * Calculate radar wave propagation time
 */
export function calculatePropagationTime(distance: number): number {
  // Speed of light: 3e8 m/s
  // Return time is double (to and from)
  return (2 * distance) / 3e8;
}
