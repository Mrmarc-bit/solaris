
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Settings, Wind, Thermometer, MapPin, Layers } from 'lucide-react';
import { Howl } from 'howler';

interface PlanetInfo {
  name: string;
  data: any;
}

interface UIOverlayProps {
  selectedPlanet: PlanetInfo | null;
  onClose: () => void;
  hoveredPlanet: PlanetInfo | null;
  mousePos: { x: number, y: number };
  onExplode: (planetName: string, active: boolean) => void;
  orbitMultiplier: number;
  setOrbitMultiplier: (val: number) => void;
  showOrbits: boolean;
  setShowOrbits: (val: boolean) => void;
  realisticScale: boolean;
  setRealisticScale: (val: boolean) => void;
  arState?: { isReticleVisible: boolean, isPlaced: boolean };
  arMode?: 'surface' | 'marker';
}

const clickSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
  volume: 0.5
});

export default function UIOverlay({ 
  selectedPlanet, 
  onClose, 
  hoveredPlanet,
  mousePos,
  onExplode,
  orbitMultiplier,
  setOrbitMultiplier,
  showOrbits,
  setShowOrbits,
  realisticScale,
  setRealisticScale,
  arState,
  arMode
}: UIOverlayProps) {
  const [isExploded, setIsExploded] = useState(false);

  useEffect(() => {
    setIsExploded(false);
  }, [selectedPlanet]);

  const handleExplode = () => {
    if (!selectedPlanet) return;
    const newState = !isExploded;
    setIsExploded(newState);
    onExplode(selectedPlanet.name, newState);
    clickSound.play();
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 z-50">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full blur-[2px] animate-pulse" />
          <div>
            <h1 className="text-white font-bold text-lg leading-tight uppercase tracking-widest font-sans">Solar AR</h1>
            <p className="text-white/50 text-[10px] uppercase font-mono">Exploration System v1.0</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
            onClick={() => { setShowOrbits(!showOrbits); clickSound.play(); }}
          >
            <Settings className={`w-5 h-5 ${showOrbits ? 'text-green-400' : 'text-white'}`} />
          </button>
          <button 
            className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
            onClick={() => { setRealisticScale(!realisticScale); clickSound.play(); }}
          >
            <Info className={`w-5 h-5 ${realisticScale ? 'text-blue-400' : 'text-white'}`} />
          </button>
        </div>
      </div>

      {/* Controls */}
      {!selectedPlanet && (
        <div className="absolute bottom-32 right-6 pointer-events-auto flex flex-col items-end gap-4">
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-48 text-white shadow-2xl">
          <p className="text-[10px] uppercase text-white/50 mb-2 font-mono tracking-tighter">Orbit Speed</p>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.1"
            value={orbitMultiplier}
            onChange={(e) => setOrbitMultiplier(parseFloat(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex justify-between text-[8px] mt-1 text-white/30 uppercase">
            <span>Frozen</span>
            <span>Fast</span>
          </div>
        </div>
        </div>
      )}

      {/* Planet Info Panel */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="pointer-events-auto w-full max-w-sm"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 md:p-8 text-white relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[75vh] md:max-h-none hide-scrollbar">
              {/* Glow Accent */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>

              <div className="relative">
                <header className="mb-6">
                  <h2 className="text-5xl font-light tracking-tighter mb-1 uppercase font-sans">
                    {selectedPlanet.name}
                  </h2>
                  <div className="h-1 w-12 bg-white/40 rounded-full" />
                </header>

                <p className="text-white/70 text-sm leading-relaxed mb-8 font-serif">
                  {selectedPlanet.data.info.description}
                </p>

                {isExploded && selectedPlanet.data.layers && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 space-y-3"
                  >
                    <p className="text-[10px] text-white/50 uppercase font-mono tracking-widest border-b border-white/10 pb-2">Internal Structure</p>
                    {selectedPlanet.data.layers.map((layer: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: layer.color }} />
                        <div>
                          <p className="text-xs font-bold uppercase mb-0.5">{layer.name}</p>
                          <p className="text-[11px] text-white/60 leading-tight">{layer.description}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {!isExploded && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <Thermometer className="w-4 h-4 text-white/40 mb-2" />
                      <p className="text-[9px] text-white/30 uppercase font-mono mb-1">Temperature</p>
                      <p className="text-[11px] font-bold">{selectedPlanet.data.info.temp}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <Wind className="w-4 h-4 text-white/40 mb-2" />
                      <p className="text-[9px] text-white/30 uppercase font-mono mb-1">Atmosphere</p>
                      <p className="text-[11px] font-bold truncate">{selectedPlanet.data.info.atmosphere}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <MapPin className="w-4 h-4 text-white/40 mb-2" />
                      <p className="text-[9px] text-white/30 uppercase font-mono mb-1">Surface Gravity</p>
                      <p className="text-[11px] font-bold">{selectedPlanet.data.info.gravity}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <Layers className="w-4 h-4 text-white/40 mb-2 rotate-180" />
                      <p className="text-[9px] text-white/30 uppercase font-mono mb-1">Day Length</p>
                      <p className="text-[11px] font-bold">{selectedPlanet.data.info.dayLength}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 col-span-2">
                      <Info className="w-4 h-4 text-white/40 mb-2" />
                      <p className="text-[9px] text-white/30 uppercase font-mono mb-1">Distance from Sun</p>
                      <p className="text-[11px] font-bold">{selectedPlanet.data.info.distanceFromSun}</p>
                    </div>
                  </div>
                )}

                {selectedPlanet.data.layers && (
                  <button 
                    onClick={handleExplode}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 border ${
                      isExploded ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      {isExploded ? 'Collapse' : 'Explode View'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(!selectedPlanet && arState && !arState.isPlaced) && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shadow-2xl">
            {arMode === 'surface' ? (
              !arState.isReticleVisible ? (
                <>
                  <p className="text-white font-bold uppercase tracking-widest text-sm mb-1 animate-pulse">
                    Mencari Lantai...
                  </p>
                  <p className="text-white/60 text-[10px] font-mono leading-tight">
                    Gerakkan HP Anda perlahan, <b>ATAU langsung Tap layar</b> untuk memunculkannya di depan Anda.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-400 font-bold uppercase tracking-widest text-sm mb-1 animate-pulse">
                    Target Ditemukan!
                  </p>
                  <p className="text-white/80 text-[10px] font-mono leading-tight">
                    Sentuh (Tap) di mana saja pada layar untuk meletakkan.
                  </p>
                </>
              )
            ) : (
              <>
                <p className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-1 animate-pulse">
                  Mencari Kartu QR...
                </p>
                <p className="text-white/60 text-[10px] font-mono leading-tight">
                  Arahkan kamera ke gambar Kartu Solaris.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredPlanet && !selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ 
              position: 'fixed', 
              left: mousePos.x + 20, 
              top: mousePos.y + 20,
              pointerEvents: 'none'
            }}
            className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-2xl z-[100]"
          >
            <p className="text-white font-bold text-xs uppercase tracking-widest">{hoveredPlanet.data.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-white/40" />
              <p className="text-[10px] text-white/60 font-mono italic">{hoveredPlanet.data.info.distanceFromSun}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
