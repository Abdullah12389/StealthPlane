import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radar, Plane, Radio } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
            <Radar className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Acoustic Stealth Plane
            <br />
            <span className="text-green-500">Radar Simulator</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Experience real-time radar physics simulation with stealth aircraft. 
            Understand how radar cross-section, material absorption, and geometry 
            affect detection probability.
          </p>
          <Link href="/radar-simulation">
            <Button size="lg" className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700">
              Launch Simulator
              <Radio className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Multiple Aircraft Types
            </h3>
            <p className="text-slate-400">
              Choose from stealth fighters, conventional jets, and large aircraft. 
              Each has unique radar signatures and detection profiles.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Radar className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-Time Physics
            </h3>
            <p className="text-slate-400">
              Accurate radar equation calculations including power, frequency, 
              RCS, and atmospheric effects for realistic simulations.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Interactive Controls
            </h3>
            <p className="text-slate-400">
              Adjust plane position, material properties, radar parameters, 
              and view real-time detection probability and signal strength.
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-16 max-w-4xl mx-auto bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              The simulator uses the <span className="text-green-500 font-mono">radar equation</span> to 
              calculate received power and detection probability:
            </p>
            <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              Pr = (Pt × G² × λ² × σ) / ((4π)³ × R⁴)
            </div>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Pt:</strong> Transmitted power (adjustable radar power)</li>
              <li><strong>σ (sigma):</strong> Radar Cross Section - affected by geometry and materials</li>
              <li><strong>λ (lambda):</strong> Wavelength - derived from radar frequency</li>
              <li><strong>R:</strong> Distance from radar to target</li>
            </ul>
            <p className="text-slate-400 text-sm mt-4">
              Stealth aircraft minimize detection by reducing RCS through angular surfaces, 
              radar-absorbing materials, and careful design. The simulator lets you explore 
              these concepts interactively in 3D.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}