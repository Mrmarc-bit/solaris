
import { SolarSystemScene } from './scene';

export class InteractionManager {
  private scene: SolarSystemScene;
  private onPlanetSelect: (planet: any) => void;
  private onPlanetHover: (planet: any | null, pos: { x: number, y: number }) => void;
  private onDrag: (deltaX: number, deltaY: number) => void;

  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  constructor(
    scene: SolarSystemScene, 
    onPlanetSelect: (planet: any) => void,
    onPlanetHover: (planet: any | null, pos: { x: number, y: number }) => void,
    onDrag?: (deltaX: number, deltaY: number) => void
  ) {
    this.scene = scene;
    this.onPlanetSelect = onPlanetSelect;
    this.onPlanetHover = onPlanetHover;
    this.onDrag = onDrag || (() => {});
    
    this.init();
  }

  private init() {
    window.addEventListener('click', (event) => {
      const planet = this.scene.getPlanetAt(event.clientX, event.clientY);
      if (planet) {
        this.onPlanetSelect(planet);
      }
    });

    window.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (event) => {
      if (this.isDragging) {
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        this.onDrag(deltaX, deltaY);
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
      }
      
      const planet = this.scene.getPlanetAt(event.clientX, event.clientY);
      this.onPlanetHover(planet || null, { x: event.clientX, y: event.clientY });
    });

    window.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const planet = this.scene.getPlanetAt(touch.clientX, touch.clientY);
        if (planet) {
          this.onPlanetSelect(planet);
        }
        
        // Setup drag
        this.isDragging = true;
        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;
      } else if (event.touches.length === 2) {
        this.isDragging = false; // Stop drag on pinch
        this.lastTouchDistance = this.getTouchDistance(event.touches);
      }
    });

    window.addEventListener('touchmove', (event) => {
      if (event.touches.length === 1 && this.isDragging) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - this.lastMouseX;
        const deltaY = touch.clientY - this.lastMouseY;
        this.onDrag(deltaX, deltaY);
        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;
      } else if (event.touches.length === 2) {
        const distance = this.getTouchDistance(event.touches);
        if (this.lastTouchDistance > 0) {
          const factor = distance / this.lastTouchDistance;
          this.scene.scaleSolarSystem(factor);
        }
        this.lastTouchDistance = distance;
      }
    });

    window.addEventListener('touchend', (event) => {
      this.isDragging = false;
      if (event.touches.length < 2) {
        this.lastTouchDistance = 0;
      }
    });

    window.addEventListener('wheel', (event) => {
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      this.scene.scaleSolarSystem(factor);
    });
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private lastTouchDistance: number = 0;
}
