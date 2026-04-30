
import * as THREE from 'three';
import { PlanetData } from './constants';
import saturnRingTex from './img/8k_saturn_ring_alpha.png';

const textureLoader = new THREE.TextureLoader();

export function createSun(data?: PlanetData) {
  const geometry = new THREE.SphereGeometry(data?.radius || 2, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    emissive: 0xFFFF00,
    emissiveIntensity: 1,
    color: 0xFFFF00,
  });

  if (data?.textureUrl) {
    material.map = textureLoader.load(data.textureUrl);
    material.emissiveMap = material.map;
  }
  
  const sun = new THREE.Mesh(geometry, material);
  sun.name = data?.name || "Sun";
  
  // Add a glow (generated via canvas)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }
  const glowTexture = new THREE.CanvasTexture(canvas);

  const spriteMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xFFFFEE,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(12, 12, 1);
  sun.add(sprite);
  
  return sun;
}

export function createPlanet(data: PlanetData, index?: number) {
  const planetGroup = new THREE.Group();
  planetGroup.name = data.name;

  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(data.textureUrl),
    roughness: 0.8,
    metalness: 0.1
  });

  if (data.normalUrl) {
    material.normalMap = textureLoader.load(data.normalUrl);
  }

  const planetMesh = new THREE.Mesh(geometry, material);
  planetMesh.name = `${data.name}_mesh`;
  planetGroup.add(planetMesh);

  // Add Billboard Name Label (Sci-fi styled)
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    canvas.width = 512;
    canvas.height = 128;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw modern sci-fi brackets
    context.strokeStyle = data.color;
    context.lineWidth = 6;
    context.beginPath();
    // Left bracket
    context.moveTo(140, 20);
    context.lineTo(120, 20);
    context.lineTo(120, 108);
    context.lineTo(140, 108);
    // Right bracket
    context.moveTo(372, 20);
    context.lineTo(392, 20);
    context.lineTo(392, 108);
    context.lineTo(372, 108);
    context.stroke();

    context.font = 'bold 70px Inter, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(data.name.toUpperCase(), 256, 64);
    
    // Draw Number Marker
    if (index !== undefined) {
      context.fillStyle = data.color;
      context.beginPath();
      context.arc(70, 64, 30, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'black';
      context.font = 'bold 36px Inter, sans-serif';
      context.fillText((index + 1).toString().padStart(2, '0'), 70, 66);
    }

    const textTexture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.y = data.radius + 0.8;
    sprite.scale.set(3, 0.75, 1);
    planetGroup.add(sprite);
  }

  // If layers exist, create them inside but hidden or collapsed
  if (data.layers) {
    const layerGroup = new THREE.Group();
    layerGroup.name = `${data.name}_layers`;
    layerGroup.visible = false;
    
    data.layers.forEach((layer) => {
      const layerGeo = new THREE.SphereGeometry(layer.radius, 32, 32);
      const layerMat = new THREE.MeshStandardMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.9,
      });
      const layerMesh = new THREE.Mesh(layerGeo, layerMat);
      layerMesh.name = layer.name;
      layerGroup.add(layerMesh);
    });
    
    planetGroup.add(layerGroup);
  }

  // Ring for Saturn
  if (data.name === "Saturn") {
    const ringGeo = new THREE.RingGeometry(2.2, 3.5, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load(saturnRingTex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planetGroup.add(ring);
  }

  return planetGroup;
}

export function createOrbitLine(distance: number, colorStr: string) {
  const curve = new THREE.EllipseCurve(0, 0, distance, distance);
  const points = curve.getPoints(120);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const material = new THREE.LineDashedMaterial({ 
    color: new THREE.Color(colorStr), 
    transparent: true, 
    opacity: 0.3,
    dashSize: 0.5,
    gapSize: 0.3
  });
  const line = new THREE.LineLoop(geometry, material);
  line.computeLineDistances();
  return line;
}
