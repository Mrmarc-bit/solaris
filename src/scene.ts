
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { PLANETS } from './constants';
import { createSun, createPlanet, createOrbitLine } from './planets';
import gsap from 'gsap';

export class SolarSystemScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controller: THREE.Group;
  private reticle: THREE.Object3D;
  private solarSystem: THREE.Group | null = null;
  private hitTestSource: any = null;
  private hitTestSourceRequested = false;
  private clock = new THREE.Clock();
  
  public orbitSpeedMultiplier = 1; // User controlled
  private entranceOrbitSpeed = 1; // Animation controlled
  public realisticScale = false;
  public showOrbits = true;
  
  private starfield?: THREE.Points;
  
  private planets: { mesh: THREE.Group, data: any, orbitGroup: THREE.Group }[] = [];
  private orbitLines: THREE.LineLoop[] = [];
  private focusContainer: THREE.Group;
  private focusedMesh: THREE.Object3D | null = null;
  private isFocused: boolean = false;
  private targetFocusRotation = { x: 0, y: 0 };
  public mode: 'surface' | 'marker' = 'surface';
  
  public onARStateChange?: (state: { isReticleVisible: boolean, isPlaced: boolean }) => void;
  public onPlanetSelectCallback?: (planetData: any) => void;
  private lastReticleVisible = false;
  private lastPlaced = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    this.focusContainer = new THREE.Group();
    this.focusContainer.position.set(0, 0, -0.8); // 80cm in front of camera to avoid clipping
    this.camera.add(this.focusContainer);
    this.scene.add(this.camera);

    this.initLights();
    this.initReticle();
    this.initController();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onWindowResize(), 100);
    });
    
    this.initStarfield();
    
    // Spawn solar system immediately so it's visible as a fallback
    this.createSolarSystem();
    if (this.solarSystem) {
      this.solarSystem.position.set(0, -0.5, -3);
    }
    
    this.renderer.xr.addEventListener('sessionstart', () => {
      if (this.starfield) this.starfield.visible = false;
    });
    
    this.renderer.xr.addEventListener('sessionend', () => {
      if (this.starfield) this.starfield.visible = true;
      this.hitTestSourceRequested = false;
      this.hitTestSource = null;
    });
    
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  public async initAR(mode: 'surface' | 'marker') {
    this.mode = mode;
    
    // Remove old button if exists
    const oldBtn = document.getElementById('ARButton-custom');
    if (oldBtn) oldBtn.remove();

    let sessionInit: any = { requiredFeatures: [] };

    if (mode === 'surface') {
      sessionInit.requiredFeatures.push('hit-test');
    } else if (mode === 'marker') {
      sessionInit.requiredFeatures.push('image-tracking');
      
      try {
        const img = new Image();
        img.src = '/assets/card.png';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const bitmap = await createImageBitmap(img);
        
        sessionInit.trackedImages = [{
          image: bitmap,
          widthInMeters: 0.15 // 15 cm wide card
        }];
      } catch (e) {
        console.error("Failed to load tracking image", e);
      }
    }

    const arButton = ARButton.createButton(this.renderer, sessionInit);
    arButton.id = 'ARButton-custom'; // We will style this in CSS
    document.body.appendChild(arButton);
    
    // Auto-click it for seamless transition if needed, or let user click
  }

  private initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    // Add a subtle colored ambient light to make it look like a nebula
    const nebulaLight = new THREE.PointLight(0x4b70dd, 2, 50);
    nebulaLight.position.set(-5, -5, -5);
    this.scene.add(nebulaLight);
  }

  private initStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    // Create 3000 stars
    for (let i = 0; i < 3000; i++) {
      const x = THREE.MathUtils.randFloatSpread(100);
      const y = THREE.MathUtils.randFloatSpread(100);
      const z = THREE.MathUtils.randFloatSpread(100);
      vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Create a circular texture for stars
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.5, 
      map: texture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    
    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  private initReticle() {
    this.reticle = new THREE.Group();
    
    // Outer Ring
    const outerGeo = new THREE.RingGeometry(0.15, 0.18, 32);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
    const outerRing = new THREE.Mesh(outerGeo, outerMat);
    outerRing.rotation.x = -Math.PI / 2;
    this.reticle.add(outerRing);

    // Inner Cross/Square
    const innerGeo = new THREE.RingGeometry(0.05, 0.08, 4);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const innerRing = new THREE.Mesh(innerGeo, innerMat);
    innerRing.rotation.x = -Math.PI / 2;
    this.reticle.add(innerRing);
    
    
    this.reticle.visible = false;
    this.scene.add(this.reticle);
  }

  private initController() {
    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select' as any, (event) => {
      // 1. First, check if we tapped a planet!
      if (this.solarSystem && !this.isFocused) {
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(this.controller.matrixWorld);
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.setFromMatrixPosition(this.controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        
        // Use proximity selection instead of exact mesh intersection
        // because tapping tiny moving 3D objects in AR is very difficult
        const ray = raycaster.ray;
        let closestPlanet: any = null;
        let minDistanceSq = Infinity;

        this.planets.forEach(p => {
          // Calculate world position of the planet
          const worldPos = new THREE.Vector3();
          // The mesh is the group containing the planet, we want the actual mesh center
          const meshObj = p.mesh.getObjectByName(`${p.data.name}_mesh`);
          if (meshObj) {
            meshObj.getWorldPosition(worldPos);
            // Calculate distance from the tap ray to the planet center
            const distSq = ray.distanceSqToPoint(worldPos);
            
            // Allow a generous hit radius (e.g. 0.04 sq units = ~20cm radius)
            // Scale hit radius slightly by planet size to make bigger planets easier to hit
            const hitThreshold = 0.02 * (p.data.radius || 1);
            
            if (distSq < hitThreshold && distSq < minDistanceSq) {
              minDistanceSq = distSq;
              closestPlanet = p;
            }
          }
        });
        
        if (closestPlanet && this.onPlanetSelectCallback) {
          this.onPlanetSelectCallback(closestPlanet.data);
          return; // Stop here, don't reposition!
        }
      }

      // 2. If no planet was tapped, handle placement/repositioning
      if (this.mode === 'surface') {
        // If already spawned (which it is now by default), just reposition
        if (!this.isFocused && this.solarSystem) {
          // Reposition
          if (this.reticle.visible) {
            this.solarSystem.position.copy(this.reticle.position);
          } else {
            const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const pos = this.camera.position.clone().add(dir.multiplyScalar(1.5));
            pos.y -= 0.5;
            this.solarSystem.position.copy(pos);
          }
          this.solarSystem.scale.set(0.01, 0.01, 0.01);
          gsap.to(this.solarSystem.scale, { x: 0.05, y: 0.05, z: 0.05, duration: 1.2, ease: "back.out(1.5)" });
        }
      }
    });
    this.scene.add(this.controller);
  }

  private createSolarSystem() {
    this.solarSystem = new THREE.Group();
    if (this.mode === 'surface') {
      this.solarSystem.position.copy(this.reticle.position);
    }
    this.solarSystem.scale.set(0.1, 0.1, 0.1); 
    this.scene.add(this.solarSystem);

    PLANETS.forEach((data, index) => {
      if (data.name === "Sun") {
        const sun = createSun(data);
        this.solarSystem?.add(sun);
        this.planets.push({ mesh: sun as any, data, orbitGroup: this.solarSystem as any });
        return;
      }

      if (data.name === "Moon") {
        return; // Handle separately inside Earth loop or after all planets created
      }

      const orbitGroup = new THREE.Group();
      this.solarSystem?.add(orbitGroup);

      const planetModel = createPlanet(data, index);
      planetModel.position.x = data.distance;
      orbitGroup.add(planetModel);

      // Add Moon if current planet is Earth
      if (data.name === "Earth") {
        const moonData = PLANETS.find(p => p.name === "Moon");
        if (moonData) {
          const moonOrbitGroup = new THREE.Group();
          planetModel.add(moonOrbitGroup);
          
          const moonModel = createPlanet(moonData);
          moonModel.position.x = 1.5; // Offset from Earth
          moonOrbitGroup.add(moonModel);
          
          this.planets.push({ mesh: moonModel, data: moonData, orbitGroup: moonOrbitGroup });
        }
      }

      const orbitLine = createOrbitLine(data.distance, data.color);
      this.solarSystem?.add(orbitLine);
      this.orbitLines.push(orbitLine);

      this.planets.push({ mesh: planetModel, data, orbitGroup });
    });

    this.solarSystem.rotation.y = -Math.PI;
    // Spawn at 0.05 scale so it fits nicely in the room without being overwhelmingly large
    gsap.to(this.solarSystem.scale, { x: 0.05, y: 0.05, z: 0.05, duration: 1.2, ease: "back.out(1.5)" });
    gsap.to(this.solarSystem.rotation, { y: 0, duration: 1.5, ease: "power3.out" });
    
    // Cool cinematic entrance: planets spin rapidly and slow down
    this.entranceOrbitSpeed = 50;
    gsap.to(this, { entranceOrbitSpeed: 1, duration: 4, ease: "power3.out" });
  }

  private onWindowResize() {
    if (this.renderer.xr.isPresenting) return; // Do not manually resize during AR
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private render(timestamp: number, frame: any) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();

      if (this.hitTestSourceRequested === false) {
        session?.requestReferenceSpace('viewer').then((viewerSpace) => {
          session.requestHitTestSource({ space: viewerSpace }).then((source) => {
            this.hitTestSource = source;
          });
        });

        session?.addEventListener('end', () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        });

        this.hitTestSourceRequested = true;
      }

      if (this.mode === 'surface' && this.hitTestSource) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          this.reticle.visible = true;
          this.reticle.position.setFromMatrixPosition(new THREE.Matrix4().fromArray(hit.getPose(referenceSpace).transform.matrix));
          this.reticle.quaternion.setFromRotationMatrix(new THREE.Matrix4().fromArray(hit.getPose(referenceSpace).transform.matrix));
          this.reticle.children[1].rotation.z += 0.05;
        } else {
          this.reticle.visible = false;
        }
      }
      
      if (this.mode === 'marker' && frame.getImageTrackingResults) {
        const results = frame.getImageTrackingResults();
        if (results && results.length > 0) {
          const result = results[0];
          if (result.trackingState === 'tracked') {
            const pose = frame.getPose(result.imageSpace, referenceSpace);
            if (pose) {
              if (!this.solarSystem) {
                this.createSolarSystem();
              }
              // Automatically lock the solar system to the image marker!
              if (!this.isFocused && this.solarSystem) {
                this.solarSystem.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                this.solarSystem.quaternion.set(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w);
                this.solarSystem.visible = true;
              }
            }
          } else if (result.trackingState === 'emulated') {
            // Emulated means it lost strong tracking but is guessing
          }
        }
      }
    }

    const delta = this.clock.getDelta();
    this.updateAnimations(delta);
    
    if (this.starfield && this.starfield.visible) {
      this.starfield.rotation.y += delta * 0.05;
      this.starfield.rotation.x += delta * 0.02;
    }

    // Notify state changes
    const currentPlaced = this.solarSystem !== null;
    const currentReticle = this.reticle.visible;
    if (currentPlaced !== this.lastPlaced || currentReticle !== this.lastReticleVisible) {
      this.lastPlaced = currentPlaced;
      this.lastReticleVisible = currentReticle;
      if (this.onARStateChange) {
        this.onARStateChange({ isReticleVisible: currentReticle, isPlaced: currentPlaced });
      }
    }

    if (this.isFocused && this.focusedMesh) {
      // Smoothly interpolate rotation for the focused mesh
      this.focusedMesh.rotation.x += (this.targetFocusRotation.x - this.focusedMesh.rotation.x) * 0.1;
      this.focusedMesh.rotation.y += (this.targetFocusRotation.y - this.focusedMesh.rotation.y) * 0.1;
      // Also add a slow constant rotation
      this.targetFocusRotation.y += delta * 0.2;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private updateAnimations(delta: number) {
    if (!this.solarSystem) return;

    this.planets.forEach(p => {
      // Orbit
      p.orbitGroup.rotation.y += p.data.orbitSpeed * delta * this.orbitSpeedMultiplier * this.entranceOrbitSpeed * 20; // Multiply by 20 for better visibility
      
      // Rotation
      const mesh = p.mesh.getObjectByName(`${p.data.name}_mesh`);
      if (mesh) {
        mesh.rotation.y += p.data.rotationSpeed * delta * 50; // Speed up rotation for visualization
      }
    });

    this.orbitLines.forEach(line => {
      line.visible = this.showOrbits;
    });
  }

  public scaleSolarSystem(factor: number) {
    if (!this.solarSystem || this.isFocused) return;
    
    const newScale = this.solarSystem.scale.x * factor;
    // Constrain scale to reasonable limits
    const clampedScale = Math.max(0.01, Math.min(newScale, 2.0));
    this.solarSystem.scale.set(clampedScale, clampedScale, clampedScale);
  }

  public getPlanetAt(screenX: number, screenY: number) {
    if (!this.solarSystem) return null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (screenX / window.innerWidth) * 2 - 1;
    mouse.y = -(screenY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, this.camera);
    
    const meshes = this.planets.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);
    
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && !PLANETS.find(p => p.name === obj.name)) {
        obj = obj.parent;
      }
      return this.planets.find(p => p.data.name === obj.name);
    }
    return null;
  }

  public explodePlanet(planetName: string, active: boolean) {
    const planet = this.planets.find(p => p.data.name === planetName);
    if (!planet) return;

    const mesh = planet.mesh.getObjectByName(`${planetName}_mesh`);
    const layers = planet.mesh.getObjectByName(`${planetName}_layers`);

    if (active) {
      if (mesh) gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
      if (layers) {
        layers.visible = true;
        layers.children.forEach((child, i) => {
          gsap.to(child.position, { y: i * 0.5, duration: 0.5, ease: "power2.out" });
        });
      }
    } else {
      if (mesh) gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
      if (layers) {
        layers.children.forEach((child) => {
          gsap.to(child.position, { y: 0, duration: 0.5, onComplete: () => { if(layers) layers.visible = false; } });
        });
      }
    }
  }

  public updateScales(realistic: boolean) {
    this.realisticScale = realistic;
    if (!this.solarSystem || this.isFocused) return;

    this.planets.forEach(p => {
      if (realistic) {
        const scale = p.data.radius;
        gsap.to(p.mesh.scale, { x: scale, y: scale, z: scale, duration: 0.5 });
      } else {
        gsap.to(p.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
      }
    });
  }

  public focusPlanet(planetName: string | null) {
    if (!planetName) {
      // Unfocus
      this.isFocused = false;
      if (this.focusedMesh) {
        gsap.to(this.focusedMesh.scale, { x: 0, y: 0, z: 0, duration: 0.4, onComplete: () => {
          this.focusContainer.clear();
          this.focusedMesh = null;
        }});
      }
      if (this.solarSystem) {
        // Restore to 0.05 scale when closing focus
        gsap.to(this.solarSystem.scale, { x: 0.05, y: 0.05, z: 0.05, duration: 0.8, ease: "back.out(1.5)" });
        this.solarSystem.visible = true;
      }
      return;
    }

    // Focus
    const planet = this.planets.find(p => p.data.name === planetName);
    if (!planet) return;

    this.isFocused = true;
    
    // Hide solar system
    if (this.solarSystem) {
      gsap.to(this.solarSystem.scale, { x: 0, y: 0, z: 0, duration: 0.5, onComplete: () => {
        if(this.solarSystem) this.solarSystem.visible = false;
      }});
    }

    // Clear previous focus
    this.focusContainer.clear();
    
    // Create a clone for the focus view
    const meshClone = planet.mesh.getObjectByName(`${planetName}_mesh`)?.clone();
    if (meshClone) {
      // Reset position but keep it inside focus container
      meshClone.position.set(0, 0, 0);
      meshClone.scale.set(0, 0, 0);
      
      // Determine appropriate scale (make it about 0.08 meters big to avoid clipping)
      const targetScale = 0.08 / (planet.data.radius || 1);
      
      this.focusedMesh = meshClone;
      this.focusContainer.add(meshClone);
      
      // Setup initial rotation
      this.targetFocusRotation = { x: 0, y: 0 };
      this.focusedMesh.rotation.set(0, 0, 0);

      // Animate in
      gsap.to(meshClone.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.8, ease: "back.out(1.2)" });
    }
  }

  public rotateFocusedPlanet(deltaX: number, deltaY: number) {
    if (this.isFocused && this.focusedMesh) {
      this.targetFocusRotation.y += deltaX * 0.01;
      this.targetFocusRotation.x += deltaY * 0.01;
      
      // Clamp X rotation
      this.targetFocusRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetFocusRotation.x));
    } else if (!this.isFocused && this.solarSystem) {
      // Allow rotating the entire solar system
      this.solarSystem.rotation.y += deltaX * 0.01;
      this.solarSystem.rotation.x += deltaY * 0.01;
      // Clamp X rotation to prevent flipping upside down
      this.solarSystem.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.solarSystem.rotation.x));
    }
  }
}
