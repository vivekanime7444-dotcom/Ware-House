import type { MaterialProp, ComponentType, Vector3D } from '../types/physics';

export const STANDARD_MATERIALS: MaterialProp[] = [
  {
    id: 'steel',
    name: 'Steel',
    density: 7850,
    friction: 0.5,
    restitution: 0.4,
    color: '#64748b',
    metadata_info: { category: 'Metal', description: 'Structural steel with high density and strength.' }
  },
  {
    id: 'aluminium',
    name: 'Aluminium',
    density: 2700,
    friction: 0.45,
    restitution: 0.5,
    color: '#94a3b8',
    metadata_info: { category: 'Metal', description: 'Lightweight aerospace alloy.' }
  },
  {
    id: 'copper',
    name: 'Copper',
    density: 8960,
    friction: 0.55,
    restitution: 0.35,
    color: '#b45309',
    metadata_info: { category: 'Metal', description: 'Dense reddish metal.' }
  },
  {
    id: 'rubber',
    name: 'Rubber',
    density: 1100,
    friction: 0.9,
    restitution: 0.85,
    color: '#334155',
    metadata_info: { category: 'Elastomer', description: 'High grip, high elasticity elastomer.' }
  },
  {
    id: 'wood',
    name: 'Wood (Oak)',
    density: 750,
    friction: 0.4,
    restitution: 0.3,
    color: '#854d0e',
    metadata_info: { category: 'Organic', description: 'Dense hardwood (approximate value).' }
  },
  {
    id: 'ice',
    name: 'Ice',
    density: 917,
    friction: 0.05,
    restitution: 0.1,
    color: '#38bdf8',
    metadata_info: { category: 'Solid', description: 'Ultra-low friction ice surface.' }
  }
];

export function calculateVolume(type: ComponentType, scale: Vector3D): number {
  const sx = Math.max(0.001, scale.x);
  const sy = Math.max(0.001, scale.y);
  const sz = Math.max(0.001, scale.z);

  switch (type) {
    case 'cube':
    case 'beam':
    case 'rod':
      return sx * sy * sz;
    case 'sphere':
      const r = (sx + sy + sz) / 6.0;
      return (4 / 3) * Math.PI * Math.pow(r, 3);
    case 'cylinder':
    case 'wheel':
    case 'disc':
      const rCyl = sx / 2.0;
      return Math.PI * Math.pow(rCyl, 2) * sy;
    case 'capsule':
      const rCap = sx / 2.0;
      const hCap = Math.max(0.01, sy - 2 * rCap);
      return Math.PI * Math.pow(rCap, 2) * hCap + (4 / 3) * Math.PI * Math.pow(rCap, 3);
    case 'cone':
      const rCone = sx / 2.0;
      return (1 / 3) * Math.PI * Math.pow(rCone, 2) * sy;
    case 'plane':
      return 0.001;
    default:
      return sx * sy * sz;
  }
}

export function calculateMass(type: ComponentType, scale: Vector3D, density: number): number {
  const volume = calculateVolume(type, scale);
  const mass = volume * density;
  return Math.max(0.01, Number(mass.toFixed(3)));
}
