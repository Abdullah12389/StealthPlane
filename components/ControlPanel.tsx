"use client";

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaneParameters, RadarParameters } from '@/lib/radarPhysics';

interface ControlPanelProps {
  planeParams: PlaneParameters;
  radarParams: RadarParameters;
  onPlaneParamsChange: (params: Partial<PlaneParameters>) => void;
  onRadarParamsChange: (params: Partial<RadarParameters>) => void;
}

export default function ControlPanel({
  planeParams,
  radarParams,
  onPlaneParamsChange,
  onRadarParamsChange,
}: ControlPanelProps) {
  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Control Panel</h2>
      
      {/* Plane Parameters */}
      <Card className="p-4 bg-slate-700 border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-3">Plane Parameters</h3>
        
        <div className="space-y-4">
          {/* Geometry Type */}
          <div className="space-y-2">
            <Label className="text-white">Plane Type</Label>
            <Select 
              value={planeParams.geometry} 
              onValueChange={(value) => onPlaneParamsChange({ geometry: value as any })}
            >
              <SelectTrigger className="bg-slate-600 text-white border-slate-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stealth">Stealth (F-117, B-2)</SelectItem>
                <SelectItem value="fighter">Fighter Jet (F-16, F-18)</SelectItem>
                <SelectItem value="conventional">Conventional (Boeing 747)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Position X */}
          <div className="space-y-2">
            <Label className="text-white">
              Position X: {planeParams.position.x.toFixed(1)}m
            </Label>
            <Slider
              value={[planeParams.position.x]}
              onValueChange={([value]) => 
                onPlaneParamsChange({ position: { ...planeParams.position, x: value } })
              }
              min={-30}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
          
          {/* Position Y */}
          <div className="space-y-2">
            <Label className="text-white">
              Position Y (Altitude): {planeParams.position.y.toFixed(1)}m
            </Label>
            <Slider
              value={[planeParams.position.y]}
              onValueChange={([value]) => 
                onPlaneParamsChange({ position: { ...planeParams.position, y: value } })
              }
              min={2}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
          
          {/* Position Z */}
          <div className="space-y-2">
            <Label className="text-white">
              Position Z: {planeParams.position.z.toFixed(1)}m
            </Label>
            <Slider
              value={[planeParams.position.z]}
              onValueChange={([value]) => 
                onPlaneParamsChange({ position: { ...planeParams.position, z: value } })
              }
              min={-30}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
          
          {/* Angle to Radar */}
          <div className="space-y-2">
            <Label className="text-white">
              Angle to Radar: {planeParams.angleToRadar.toFixed(0)}°
            </Label>
            <Slider
              value={[planeParams.angleToRadar]}
              onValueChange={([value]) => onPlaneParamsChange({ angleToRadar: value })}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Base RCS */}
          <div className="space-y-2">
            <Label className="text-white">
              Base RCS: {planeParams.radarCrossSection.toFixed(3)}m²
            </Label>
            <Slider
              value={[planeParams.radarCrossSection]}
              onValueChange={([value]) => onPlaneParamsChange({ radarCrossSection: value })}
              min={0.001}
              max={1}
              step={0.001}
              className="w-full"
            />
          </div>
          
          {/* Absorption Coefficient */}
          <div className="space-y-2">
            <Label className="text-white">
              Absorption Coefficient: {(planeParams.absorptionCoefficient * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[planeParams.absorptionCoefficient * 100]}
              onValueChange={([value]) => 
                onPlaneParamsChange({ absorptionCoefficient: value / 100 })
              }
              min={0}
              max={95}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </Card>
      
      {/* Radar Parameters */}
      <Card className="p-4 bg-slate-700 border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-3">Radar Parameters</h3>
        
        <div className="space-y-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-white">
              Frequency: {radarParams.frequency.toFixed(1)} GHz
            </Label>
            <Slider
              value={[radarParams.frequency]}
              onValueChange={([value]) => onRadarParamsChange({ frequency: value })}
              min={1}
              max={35}
              step={0.5}
              className="w-full"
            />
          </div>
          
          {/* Power */}
          <div className="space-y-2">
            <Label className="text-white">
              Power: {radarParams.power.toFixed(0)} kW
            </Label>
            <Slider
              value={[radarParams.power]}
              onValueChange={([value]) => onRadarParamsChange({ power: value })}
              min={10}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>
          
          {/* Range */}
          <div className="space-y-2">
            <Label className="text-white">
              Range: {radarParams.range.toFixed(0)} km
            </Label>
            <Slider
              value={[radarParams.range]}
              onValueChange={([value]) => onRadarParamsChange({ range: value })}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
          </div>
          
          {/* Sensitivity */}
          <div className="space-y-2">
            <Label className="text-white">
              Sensitivity: {radarParams.sensitivity.toFixed(0)} dBm
            </Label>
            <Slider
              value={[radarParams.sensitivity]}
              onValueChange={([value]) => onRadarParamsChange({ sensitivity: value })}
              min={-120}
              max={-60}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
