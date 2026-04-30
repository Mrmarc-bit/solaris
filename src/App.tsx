/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import React, { useEffect, useRef, useState } from 'react';
import { SolarSystemScene } from './scene';
import { InteractionManager } from './interaction';
import UIOverlay from './UIOverlay';
import LandingPage from './components/LandingPage';
import { Howl } from 'howler';

const backgroundAudio = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'], // Placeholder for ambient space sound
  loop: true,
  volume: 0.3
});

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SolarSystemScene | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [orbitMultiplier, setOrbitMultiplier] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [realisticScale, setRealisticScale] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [arMode, setArMode] = useState<'surface' | 'marker'>('surface');
  const [arState, setArState] = useState({ isReticleVisible: false, isPlaced: false });

  useEffect(() => {
    if (containerRef.current && !sceneRef.current && !showLanding) {
      const scene = new SolarSystemScene(containerRef.current);
      sceneRef.current = scene;
      
      // Initialize AR with the selected mode
      scene.initAR(arMode);

      scene.onARStateChange = (state) => {
        setArState(state);
      };
      
      scene.onPlanetSelectCallback = (planetData) => {
        setSelectedPlanet({ name: planetData.name, data: planetData });
      };

      new InteractionManager(
        scene, 
        (planet) => {
          setSelectedPlanet(planet);
        },
        (hovered, pos) => {
          setHoveredPlanet(hovered);
          setMousePos(pos);
        },
        (deltaX, deltaY) => {
          scene.rotateFocusedPlanet(deltaX, deltaY);
        }
      );

      // Start ambient sound on user interaction hint
      backgroundAudio.play();
    }
  }, [showLanding]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.focusPlanet(selectedPlanet ? selectedPlanet.name : null);
    }
  }, [selectedPlanet]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.orbitSpeedMultiplier = orbitMultiplier;
    }
  }, [orbitMultiplier]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.showOrbits = showOrbits;
    }
  }, [showOrbits]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateScales(realisticScale);
    }
  }, [realisticScale]);

  const handleExplode = (planetName: string, active: boolean) => {
    sceneRef.current?.explodePlanet(planetName, active);
  };

  const handleStartAR = (mode: 'surface' | 'marker') => {
    setArMode(mode);
    setShowLanding(false);
  };

  return (
    <div className={`w-full ${showLanding ? 'min-h-screen bg-[#050505]' : 'h-screen overflow-hidden bg-transparent'} relative`}>
      {showLanding ? (
        <LandingPage onStartAR={handleStartAR} />
      ) : (
        <>
          <div ref={containerRef} className="w-full h-full" />
          
          <UIOverlay 
            selectedPlanet={selectedPlanet} 
            onClose={() => setSelectedPlanet(null)}
            hoveredPlanet={hoveredPlanet}
            mousePos={mousePos}
            onExplode={handleExplode}
            orbitMultiplier={orbitMultiplier}
            setOrbitMultiplier={setOrbitMultiplier}
            showOrbits={showOrbits}
            setShowOrbits={setShowOrbits}
            realisticScale={realisticScale}
            setRealisticScale={setRealisticScale}
            arState={arState}
            arMode={arMode}
          />
        </>
      )}
    </div>
  );
}

