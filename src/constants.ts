import sunTex from './img/8k_sun.jpg';
import mercuryTex from './img/8k_mercury.jpg';
import venusTex from './img/8k_venus_surface.jpg';
import earthTex from './img/8k_earth_daymap.jpg';
import moonTex from './img/8k_moon.jpg';
import marsTex from './img/8k_mars.jpg';
import jupiterTex from './img/8k_jupiter.jpg';
import saturnTex from './img/8k_saturn.jpg';
import uranusTex from './img/2k_uranus.jpg';
import neptuneTex from './img/2k_neptune.jpg';

export interface LayerDefinition {
  name: string;
  radius: number;
  color: string;
  textureUrl?: string;
  description?: string;
}

export interface PlanetData {
  name: string;
  distance: number; // In AU or relative units
  radius: number; // Relative radius
  orbitSpeed: number;
  rotationSpeed: number;
  color: string;
  textureUrl: string;
  normalUrl?: string;
  atmosphere?: string;
  info: {
    temp: string;
    atmosphere: string;
    distanceFromSun: string;
    description: string;
    gravity: string;
    dayLength: string;
    history: string;
  };
  layers?: LayerDefinition[];
}

export const PLANETS: PlanetData[] = [
  {
    name: "Sun",
    distance: 0,
    radius: 3, // Larger visual representation
    orbitSpeed: 0,
    rotationSpeed: 0.001,
    color: "#FFFF00",
    textureUrl: sunTex,
    info: {
      temp: "5,505°C (Surface)",
      atmosphere: "Hydrogen, Helium",
      distanceFromSun: "0 km",
      description: "The star at the center of our Solar System, providing light and energy.",
      gravity: "274 m/s²",
      dayLength: "27 Earth days",
      history: "The Sun has been worshipped as a deity in many cultures. Ancient Egyptians called it Ra, while the Greeks named it Helios. It contains 99.8% of the total mass of the solar system."
    }
  },
  {
    name: "Mercury",
    distance: 4,
    radius: 0.38,
    orbitSpeed: 0.047,
    rotationSpeed: 0.004,
    color: "#A5A5A5",
    textureUrl: mercuryTex,
    info: {
      temp: "-173 to 427°C",
      atmosphere: "Thin (Oxygen, Sodium)",
      distanceFromSun: "57.9 million km",
      description: "The smallest planet and closest to the Sun.",
      gravity: "3.7 m/s²",
      dayLength: "58.6 Earth days",
      history: "Mercury has been known since at least Sumerian times (around 3,000 BC). The Babylonians called it 'Nabu' after their god of writing. In Greek mythology, it was Hermes, the messenger of the gods, due to its rapid motion across the sky."
    }
  },
  {
    name: "Venus",
    distance: 6,
    radius: 0.95,
    orbitSpeed: 0.035,
    rotationSpeed: 0.002,
    color: "#E3BB76",
    textureUrl: venusTex,
    info: {
      temp: "462°C",
      atmosphere: "Thick (CO2, Nitrogen)",
      distanceFromSun: "108.2 million km",
      description: "The hottest planet in our solar system.",
      gravity: "8.87 m/s²",
      dayLength: "243 Earth days",
      history: "Venus is named after the Roman goddess of love and beauty. It is the second brightest natural object in the night sky after the Moon, often called the Evening Star or Morning Star. Ancient civilizations tracked its cycles with great precision."
    }
  },
  {
    name: "Earth",
    distance: 9,
    radius: 1,
    orbitSpeed: 0.029,
    rotationSpeed: 0.01,
    color: "#2233FF",
    textureUrl: earthTex,
    info: {
      temp: "-88 to 58°C",
      atmosphere: "Nitrogen, Oxygen",
      distanceFromSun: "149.6 million km",
      description: "Our home planet, the only known to harbor life.",
      gravity: "9.8 m/s²",
      dayLength: "24 hours",
      history: "The name Earth is derived from both English and German words ('earthe' and 'erda') which mean ground. Unlike other planets, it was not named after a Greek or Roman deity. It has a complex history of geological and biological evolution spanning 4.5 billion years."
    },
    layers: [
      { name: "Core", radius: 0.3, color: "#FFFF00", description: "A hot, dense ball of iron and nickel at the center." },
      { name: "Mantle", radius: 0.6, color: "#FF4400", description: "A thick layer of semi-solid rock between core and crust." },
      { name: "Crust", radius: 1.0, color: "#2233FF", description: "The thin outer shell where all life exists." }
    ]
  },
  {
    name: "Moon",
    distance: 1, // Relative to Earth
    radius: 0.27,
    orbitSpeed: 0.05,
    rotationSpeed: 0.01,
    color: "#CCCCCC",
    textureUrl: moonTex,
    info: {
      temp: "-173 to 127°C",
      atmosphere: "None",
      distanceFromSun: "149.6 million km",
      description: "Earth's only natural satellite.",
      gravity: "1.62 m/s²",
      dayLength: "27.3 Earth days",
      history: "The Moon is the only celestial body other than Earth that humans have visited. It was formed about 4.5 billion years ago, likely from the debris of a massive collision between Earth and a Mars-sized planet named Theia."
    }
  },
  {
    name: "Mars",
    distance: 12,
    radius: 0.53,
    orbitSpeed: 0.024,
    rotationSpeed: 0.009,
    color: "#E27B58",
    textureUrl: marsTex,
    info: {
      temp: "-125 to 20°C",
      atmosphere: "Thin (CO2, Nitrogen)",
      distanceFromSun: "227.9 million km",
      description: "The Red Planet, home to the largest volcano in the solar system.",
      gravity: "3.71 m/s²",
      dayLength: "24.6 hours",
      history: "Mars was named by the Romans for their god of war because its reddish color was reminiscent of blood. The Egyptians called it 'Her Desher', meaning 'the red one'. It has long been a focal point for the search for extraterrestrial life due to its similarities to Earth."
    },
    layers: [
      { name: "Core", radius: 0.3, color: "#990000", description: "Believed to be solid iron, nickel, and sulfur." },
      { name: "Mantle", radius: 0.6, color: "#CC4400", description: "Silicate mantle that once supported volcanism." },
      { name: "Crust", radius: 1.0, color: "#E27B58", description: "Rich in iron oxide, giving the planet its red color." }
    ]
  },
  {
    name: "Jupiter",
    distance: 18,
    radius: 2.2, // Scaled down for visibility but still large
    orbitSpeed: 0.013,
    rotationSpeed: 0.02,
    color: "#D39C7E",
    textureUrl: jupiterTex,
    info: {
      temp: "-110°C",
      atmosphere: "Hydrogen, Helium",
      distanceFromSun: "778.6 million km",
      description: "The largest planet, with a Great Red Spot storm.",
      gravity: "24.79 m/s²",
      dayLength: "9.9 hours",
      history: "Jupiter was named after the king of the Roman gods. It is the most massive planet in our solar system, more than twice the mass of all the other planets combined. Galileo's discovery of its four large moons in 1610 provided crucial evidence for the Copernican model of the solar system."
    }
  },
  {
    name: "Saturn",
    distance: 24,
    radius: 1.8,
    orbitSpeed: 0.009,
    rotationSpeed: 0.018,
    color: "#C5AB6E",
    textureUrl: saturnTex,
    info: {
      temp: "-140°C",
      atmosphere: "Hydrogen, Helium",
      distanceFromSun: "1.4 billion km",
      description: "Famous for its spectacular ring system.",
      gravity: "10.44 m/s²",
      dayLength: "10.7 hours",
      history: "Named for the Roman god of agriculture and time, Saturn is the farthest planet known to ancient astronomers. Its rings were first observed by Galileo in 1610, though he mistook them for ears or two large moons flanking the planet."
    }
  },
  {
    name: "Uranus",
    distance: 30,
    radius: 1.2,
    orbitSpeed: 0.006,
    rotationSpeed: 0.015,
    color: "#B5E3E3",
    textureUrl: uranusTex,
    info: {
      temp: "-195°C",
      atmosphere: "Hydrogen, Helium, Methane",
      distanceFromSun: "2.9 billion km",
      description: "An ice giant that orbits on its side.",
      gravity: "8.69 m/s²",
      dayLength: "17.2 hours",
      history: "Uranus was the first planet discovered with the aid of a telescope, found by William Herschel in 1781. It was initially thought to be a comet or a star. It's named after the Greek deity of the sky, Ouranos, the father of Saturn."
    }
  },
  {
    name: "Neptune",
    distance: 36,
    radius: 1.15,
    orbitSpeed: 0.005,
    rotationSpeed: 0.016,
    color: "#4B70DD",
    textureUrl: neptuneTex,
    info: {
      temp: "-201°C",
      atmosphere: "Hydrogen, Helium, Methane",
      distanceFromSun: "4.5 billion km",
      description: "The most distant planet, with the strongest winds.",
      gravity: "11.15 m/s²",
      dayLength: "16.1 hours",
      history: "Neptune was the first planet to be predicted by mathematical calculations before being directly observed. Based on perturbations in the orbit of Uranus, astronomers Le Verrier and Adams independently predicted its position, leading to its discovery in 1846."
    }
  }
];
