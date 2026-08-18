import type { PhysicsComponent, JointConstraint, AppliedForce } from '../types/physics';
import { calculateMass, STANDARD_MATERIALS } from './materials';

export interface CompoundStructure {
  id: string;
  name: string;
  description: string;
  iconType: string;
  objects: PhysicsComponent[];
  joints?: JointConstraint[];
  forces?: AppliedForce[];
}

export function generateBuildingFrame(originX = 0, originZ = 0): CompoundStructure {
  const time = Date.now();
  const steelMat = STANDARD_MATERIALS.find(m => m.id === 'steel')!;
  const woodMat = STANDARD_MATERIALS.find(m => m.id === 'wood')!;

  const objects: PhysicsComponent[] = [];

  // Ground Base Foundation
  const baseId = `building-base-${time}`;
  objects.push({
    id: baseId,
    name: 'Foundation Pad',
    type: 'cube',
    position: { x: originX, y: 0.2, z: originZ },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 9, y: 0.4, z: 9 },
    mass: 1000,
    density: steelMat.density,
    materialId: 'steel',
    friction: 0.6,
    restitution: 0.2,
    isFixed: true,
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#475569'
  });

  // Level 1 Pillars (4 Column Beams)
  const pillarOffsets = [
    { x: -3.5, z: -3.5 },
    { x: 3.5, z: -3.5 },
    { x: -3.5, z: 3.5 },
    { x: 3.5, z: 3.5 }
  ];

  pillarOffsets.forEach((off, idx) => {
    objects.push({
      id: `l1-pillar-${idx}-${time}`,
      name: `L1 Column ${idx + 1}`,
      type: 'beam',
      position: { x: originX + off.x, y: 2.7, z: originZ + off.z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.6, y: 4.6, z: 0.6 },
      mass: calculateMass('beam', { x: 0.6, y: 4.6, z: 0.6 }, steelMat.density),
      density: steelMat.density,
      materialId: 'steel',
      friction: 0.5,
      restitution: 0.3,
      isFixed: false,
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      color: '#38bdf8'
    });
  });

  // 1st Floor Slab
  objects.push({
    id: `floor-1-slab-${time}`,
    name: 'Level 1 Deck Slab',
    type: 'cube',
    position: { x: originX, y: 5.2, z: originZ },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 8.5, y: 0.4, z: 8.5 },
    mass: calculateMass('cube', { x: 8.5, y: 0.4, z: 8.5 }, woodMat.density),
    density: woodMat.density,
    materialId: 'wood',
    friction: 0.5,
    restitution: 0.3,
    isFixed: false,
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#854d0e'
  });

  // Level 2 Pillars (4 Column Beams)
  pillarOffsets.forEach((off, idx) => {
    objects.push({
      id: `l2-pillar-${idx}-${time}`,
      name: `L2 Column ${idx + 1}`,
      type: 'beam',
      position: { x: originX + off.x, y: 7.7, z: originZ + off.z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.6, y: 4.6, z: 0.6 },
      mass: calculateMass('beam', { x: 0.6, y: 4.6, z: 0.6 }, steelMat.density),
      density: steelMat.density,
      materialId: 'steel',
      friction: 0.5,
      restitution: 0.3,
      isFixed: false,
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      color: '#0ea5e9'
    });
  });

  // 2nd Floor Roof Deck
  objects.push({
    id: `roof-slab-${time}`,
    name: 'Roof Platform Deck',
    type: 'cube',
    position: { x: originX, y: 10.2, z: originZ },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 8.5, y: 0.4, z: 8.5 },
    mass: calculateMass('cube', { x: 8.5, y: 0.4, z: 8.5 }, woodMat.density),
    density: woodMat.density,
    materialId: 'wood',
    friction: 0.5,
    restitution: 0.3,
    isFixed: false,
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#eab308'
  });

  return {
    id: `building-${time}`,
    name: '2-Story Building Frame',
    description: 'Multi-story structural frame with 8 support columns and 2 floor slabs',
    iconType: 'building',
    objects
  };
}

export function generateTrussBridge(originX = 0): CompoundStructure {
  const time = Date.now();
  const steelMat = STANDARD_MATERIALS.find(m => m.id === 'steel')!;
  const objects: PhysicsComponent[] = [];

  // 2 Anchor Piers
  objects.push({
    id: `bridge-pier-left-${time}`,
    name: 'Left Pier Support',
    type: 'cube',
    position: { x: originX - 12, y: 2.0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 3, y: 4, z: 5 },
    mass: 1000,
    density: steelMat.density,
    materialId: 'steel',
    friction: 0.6,
    restitution: 0.2,
    isFixed: true,
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#334155'
  });

  objects.push({
    id: `bridge-pier-right-${time}`,
    name: 'Right Pier Support',
    type: 'cube',
    position: { x: originX + 12, y: 2.0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 3, y: 4, z: 5 },
    mass: 1000,
    density: steelMat.density,
    materialId: 'steel',
    friction: 0.6,
    restitution: 0.2,
    isFixed: true,
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#334155'
  });

  // Main Deck Beam
  objects.push({
    id: `bridge-deck-${time}`,
    name: 'Main Deck Span',
    type: 'beam',
    position: { x: originX, y: 4.25, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 26, y: 0.5, z: 4.5 },
    mass: calculateMass('beam', { x: 26, y: 0.5, z: 4.5 }, steelMat.density),
    density: steelMat.density,
    materialId: 'steel',
    friction: 0.5,
    restitution: 0.2,
    isFixed: false,
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#64748b'
  });

  return {
    id: `bridge-${time}`,
    name: 'Truss Bridge Assembly',
    description: 'Suspended deck span between concrete pier supports',
    iconType: 'bridge',
    objects
  };
}

export function generateJengaTower(originX = 0, originZ = 0): CompoundStructure {
  const time = Date.now();
  const woodMat = STANDARD_MATERIALS.find(m => m.id === 'wood')!;
  const objects: PhysicsComponent[] = [];

  const layers = 8;
  for (let i = 0; i < layers; i++) {
    const isEven = i % 2 === 0;
    const y = 0.35 + i * 0.7;

    for (let j = -1; j <= 1; j++) {
      const offsetX = isEven ? j * 1.5 : 0;
      const offsetZ = isEven ? 0 : j * 1.5;
      const rotY = isEven ? 0 : 90;
      const scale = isEven ? { x: 1.4, y: 0.65, z: 4.2 } : { x: 4.2, y: 0.65, z: 1.4 };

      objects.push({
        id: `tower-block-${i}-${j}-${time}`,
        name: `Tower Block L${i + 1}-${j + 2}`,
        type: 'beam',
        position: { x: originX + offsetX, y, z: originZ + offsetZ },
        rotation: { x: 0, y: rotY, z: 0 },
        scale,
        mass: calculateMass('beam', scale, woodMat.density),
        density: woodMat.density,
        materialId: 'wood',
        friction: 0.45,
        restitution: 0.2,
        isFixed: false,
        linearVelocity: { x: 0, y: 0, z: 0 },
        angularVelocity: { x: 0, y: 0, z: 0 },
        color: i % 2 === 0 ? '#eab308' : '#ca8a04'
      });
    }
  }

  return {
    id: `tower-${time}`,
    name: 'Interlocking Block Tower',
    description: '8-layer stacked wooden block tower for stability and collapse physics',
    iconType: 'tower',
    objects
  };
}

export function generateDominoRamp(originX = 0): CompoundStructure {
  const time = Date.now();
  const woodMat = STANDARD_MATERIALS.find(m => m.id === 'wood')!;
  const steelMat = STANDARD_MATERIALS.find(m => m.id === 'steel')!;
  const objects: PhysicsComponent[] = [];

  // Heavy Trigger Ball
  objects.push({
    id: `domino-trigger-${time}`,
    name: 'Heavy Trigger Sphere',
    type: 'sphere',
    position: { x: originX - 10, y: 6.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1.6, y: 1.6, z: 1.6 },
    mass: 25.0,
    density: steelMat.density,
    materialId: 'steel',
    friction: 0.3,
    restitution: 0.5,
    isFixed: false,
    linearVelocity: { x: 4.0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    color: '#ef4444'
  });

  // Domino Chain Row (10 dominoes)
  for (let i = 0; i < 10; i++) {
    const x = originX - 6 + i * 1.8;
    objects.push({
      id: `domino-${i}-${time}`,
      name: `Domino #${i + 1}`,
      type: 'cube',
      position: { x, y: 1.2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.3, y: 2.2, z: 1.2 },
      mass: calculateMass('cube', { x: 0.3, y: 2.2, z: 1.2 }, woodMat.density),
      density: woodMat.density,
      materialId: 'wood',
      friction: 0.4,
      restitution: 0.2,
      isFixed: false,
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      color: i % 2 === 0 ? '#38bdf8' : '#a855f7'
    });
  }

  return {
    id: `domino-chain-${time}`,
    name: 'Domino Chain Reaction',
    description: '10 aligned domino blocks triggered by a heavy steel sphere',
    iconType: 'domino',
    objects
  };
}
