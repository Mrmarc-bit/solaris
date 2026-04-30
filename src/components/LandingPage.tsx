import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PLANETS, PlanetData } from '../constants';
import { ArrowRight, X, ChevronRight, Globe, Info, Clock, Thermometer, Wind } from 'lucide-react';

interface LandingPageProps {
  onStartAR: (mode: 'surface' | 'marker') => void;
}

export default function LandingPage({ onStartAR }: LandingPageProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Globe className="text-black w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">Solaris AR</span>
          </div>
          <button 
            onClick={onStartAR}
            className="relative overflow-hidden group flex items-center gap-3 px-8 py-3.5 bg-white/5 text-white rounded-full font-bold hover:bg-white hover:text-black transition-all duration-500 text-xs md:text-sm uppercase tracking-widest border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative z-10">Initialize AR</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        {/* Hero Section */}
        <section className="mb-32 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-[8rem] font-black mb-8 leading-[0.85] tracking-tighter"
          >
            EXPLORE THE <br/><span className="bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent italic pr-4">UNIVERSE.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/50 leading-relaxed font-light"
          >
            An interactive journey through our solar system, combining cutting-edge augmented reality with scientific data. Professional exploration tools for the modern enthusiast.
          </motion.p>
        </section>

        {/* Planet Grid */}
        <section className="pb-24">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">Celestial Bodies</h2>
            <p className="text-[10px] uppercase font-mono text-white/20">{PLANETS.length} Bodies Detected</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PLANETS.map((planet, idx) => (
              <motion.div
                key={planet.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelectedPlanet(planet)}
                className="group relative min-h-[450px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden cursor-pointer hover:bg-white/[0.06] transition-all duration-500 hover:border-white/30 hover:-translate-y-2 shadow-2xl flex flex-col"
              >
                {/* Planet Preview Image with Glow */}
                <div className="relative h-[240px] flex items-center justify-center p-6 transition-all duration-700 group-hover:scale-110">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-[80px] group-hover:bg-white/10 transition-colors" />
                  <img 
                    src={planet.textureUrl} 
                    alt={planet.name}
                    className="h-full aspect-square object-contain rounded-full shadow-[0_0_50px_rgba(255,255,255,0.05)] relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card Content */}
                <div className="flex-1 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent p-10 flex flex-col justify-end relative z-20">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-mono text-white/40 uppercase mb-3 block tracking-[0.3em]">Sector 0{idx + 1}</span>
                    <h3 className="text-4xl font-bold tracking-tighter uppercase mb-6 leading-none">{planet.name}</h3>
                    <div className="flex items-center justify-between text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold border-t border-white/10 pt-6">
                      <span>Exploration Profile</span>
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:scale-110">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Planet Detail Modal */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-3xl" 
              onClick={() => setSelectedPlanet(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,1)] max-h-[90vh]"
            >
              {/* Visual Section */}
              <div className="w-full md:w-1/2 h-56 md:h-auto shrink-0 relative bg-[#0e0e0e] flex items-center justify-center p-6 md:p-12 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color),transparent_70%)] opacity-30" style={{ '--color': selectedPlanet.color } as any} />
                </div>
                <img 
                  src={selectedPlanet.textureUrl} 
                  alt={selectedPlanet.name}
                  className="w-full max-w-[400px] aspect-square object-cover rounded-full shadow-[0_0_120px_rgba(255,255,255,0.08)] animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 p-6 md:p-16 flex-1 overflow-y-auto">
                <button 
                  onClick={() => setSelectedPlanet(null)}
                  className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-12">
                  <span className="text-sm font-mono text-white/30 uppercase tracking-[0.3em] mb-4 block">Scientific Data // Solaris OS</span>
                  <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-6">{selectedPlanet.name}</h2>
                  <p className="text-white/40 text-lg leading-relaxed font-light mb-8 italic">
                    {selectedPlanet.info.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-12">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <Thermometer className="w-5 h-5 text-white/40 mb-3" />
                    <p className="text-[10px] uppercase text-white/30 mb-1 font-mono tracking-widest">Temperature</p>
                    <p className="text-lg font-bold">{selectedPlanet.info.temp}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <Wind className="w-5 h-5 text-white/40 mb-3" />
                    <p className="text-[10px] uppercase text-white/30 mb-1 font-mono tracking-widest">Atmosphere</p>
                    <p className="text-lg font-bold truncate">{selectedPlanet.info.atmosphere}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                     <Globe className="w-5 h-5 text-white/40 mb-3" />
                    <p className="text-[10px] uppercase text-white/30 mb-1 font-mono tracking-widest">Gravity</p>
                    <p className="text-lg font-bold">{selectedPlanet.info.gravity}</p>
                  </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <Clock className="w-5 h-5 text-white/40 mb-3" />
                    <p className="text-[10px] uppercase text-white/30 mb-1 font-mono tracking-widest">Day Length</p>
                    <p className="text-lg font-bold">{selectedPlanet.info.dayLength}</p>
                  </div>
                </div>

                <div className="mb-12">
                  <h3 className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-white/40" />
                    Historical Context
                  </h3>
                  <p className="text-white/60 leading-relaxed font-light first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                    {selectedPlanet.info.history}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => onStartAR('surface')}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group shadow-[0_10px_40px_rgba(147,51,234,0.3)] hover:shadow-[0_10px_60px_rgba(147,51,234,0.5)] border border-white/20"
                  >
                    Start Surface AR 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => onStartAR('marker')}
                    className="w-full py-5 bg-white/10 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group border border-white/20"
                  >
                    Start Card AR (QR)
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
