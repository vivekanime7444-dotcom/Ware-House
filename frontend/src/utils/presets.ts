import type { ProjectData } from '../types/physics';

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  data: ProjectData;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'falling-ball',
    title: '1. Falling Ball & Collision',
    description: 'A heavy steel sphere drops under gravity (9.81 m/s²) and bounces off a rigid rubber floor plane, demonstrating kinetic/potential energy conversion.',
    data: {
      id: 'preset-falling-ball',
      name: 'Falling Ball Demonstration',
      description: 'Free fall bounce under gravity',
      scene: {
        objects: [
          {
            id: 'ground-1',
            name: 'Ground Floor',
            type: 'plane',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 20, y: 0.2, z: 20 },
            mass: 1000,
            density: 1100,
            materialId: 'rubber',
            friction: 0.8,
            restitution: 0.8,
            isFixed: true,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#334155'
          },
          {
            id: 'ball-1',
            name: 'Steel Sphere',
            type: 'sphere',
            position: { x: 0, y: 8, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1.5, y: 1.5, z: 1.5 },
            mass: 13.87,
            density: 7850,
            materialId: 'steel',
            friction: 0.5,
            restitution: 0.75,
            isFixed: false,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#38bdf8'
          }
        ],
        forces: [],
        torques: [],
        springs: [],
        constraints: [],
        environment: {
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 0.0166,
          timeScale: 1.0,
          airResistance: 0.05
        }
      }
    }
  },
  {
    id: 'sliding-block',
    title: '2. Sliding Block (Friction)',
    description: 'A wooden block propelled across a surface with an initial velocity, showing kinetic friction damping stopping distance.',
    data: {
      id: 'preset-sliding-block',
      name: 'Sliding Block Friction Demo',
      description: 'Friction deceleration on horizontal plane',
      scene: {
        objects: [
          {
            id: 'ground-2',
            name: 'Track Floor',
            type: 'cube',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 30, y: 0.4, z: 6 },
            mass: 1000,
            density: 2700,
            materialId: 'aluminium',
            friction: 0.35,
            restitution: 0.2,
            isFixed: true,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#475569'
          },
          {
            id: 'block-1',
            name: 'Sliding Oak Block',
            type: 'cube',
            position: { x: -10, y: 0.7, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1.5, y: 1.0, z: 1.5 },
            mass: 1.68,
            density: 750,
            materialId: 'wood',
            friction: 0.4,
            restitution: 0.2,
            isFixed: false,
            linearVelocity: { x: 12.0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#eab308'
          }
        ],
        forces: [],
        torques: [],
        springs: [],
        constraints: [],
        environment: {
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 0.0166,
          timeScale: 1.0,
          airResistance: 0.02
        }
      }
    }
  },
  {
    id: 'projectile-launch',
    title: '3. Projectile Launch',
    description: 'A sphere launched with initial horizontal and vertical velocity components (vx = 15 m/s, vy = 12 m/s), matching classical parabolic kinematics.',
    data: {
      id: 'preset-projectile',
      name: 'Projectile Motion Demo',
      description: 'Parabolic flight path validation',
      scene: {
        objects: [
          {
            id: 'ground-3',
            name: 'Landing Ground',
            type: 'plane',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 40, y: 0.2, z: 20 },
            mass: 1000,
            density: 2700,
            materialId: 'aluminium',
            friction: 0.5,
            restitution: 0.5,
            isFixed: true,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#334155'
          },
          {
            id: 'projectile-1',
            name: 'Launch Cannonball',
            type: 'sphere',
            position: { x: -15, y: 1.0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1.2, y: 1.2, z: 1.2 },
            mass: 7.1,
            density: 7850,
            materialId: 'steel',
            friction: 0.4,
            restitution: 0.6,
            isFixed: false,
            linearVelocity: { x: 15.0, y: 12.0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#f97316'
          }
        ],
        forces: [],
        torques: [],
        springs: [],
        constraints: [],
        environment: {
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 0.0166,
          timeScale: 1.0,
          airResistance: 0.01
        }
      }
    }
  },
  {
    id: 'spring-system',
    title: '4. Harmonic Spring Mass',
    description: 'An object suspended on a vertical coil spring demonstrating Simple Harmonic Motion and energy exchange.',
    data: {
      id: 'preset-spring',
      name: 'Spring Mass System',
      description: 'Simple harmonic spring oscillation',
      scene: {
        objects: [
          {
            id: 'anchor-1',
            name: 'Fixed Ceiling Anchor',
            type: 'cube',
            position: { x: 0, y: 10, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 2.0, y: 0.5, z: 2.0 },
            mass: 100,
            density: 7850,
            materialId: 'steel',
            friction: 0.5,
            restitution: 0.5,
            isFixed: true,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#64748b'
          },
          {
            id: 'bob-1',
            name: 'Oscillating Mass',
            type: 'sphere',
            position: { x: 0, y: 5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1.5, y: 1.5, z: 1.5 },
            mass: 5.0,
            density: 2700,
            materialId: 'aluminium',
            friction: 0.5,
            restitution: 0.5,
            isFixed: false,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#a855f7'
          }
        ],
        forces: [],
        torques: [],
        springs: [
          {
            id: 'spring-1',
            name: 'Main Suspension Spring',
            objectAId: 'anchor-1',
            objectBId: 'bob-1',
            restLength: 3.5,
            stiffness: 80.0,
            damping: 0.5,
            enabled: true
          }
        ],
        constraints: [],
        environment: {
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 0.0166,
          timeScale: 1.0,
          airResistance: 0.02
        }
      }
    }
  },
  {
    id: 'vehicle-wheel',
    title: '5. Vehicle Axle & Wheel',
    description: 'A rotational wheel attached to a fixed chassis axle with continuous torque drive demonstrating rotational dynamics and angular acceleration.',
    data: {
      id: 'preset-wheel',
      name: 'Rotational Axle & Wheel',
      description: 'Angular acceleration under applied torque',
      scene: {
        objects: [
          {
            id: 'chassis-1',
            name: 'Vehicle Frame Chassis',
            type: 'beam',
            position: { x: 0, y: 3, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 4.0, y: 0.5, z: 1.0 },
            mass: 50.0,
            density: 7850,
            materialId: 'steel',
            friction: 0.5,
            restitution: 0.5,
            isFixed: true,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#475569'
          },
          {
            id: 'wheel-1',
            name: 'Drive Wheel Disc',
            type: 'disc',
            position: { x: 0, y: 3, z: 1.2 },
            rotation: { x: 90, y: 0, z: 0 },
            scale: { x: 2.5, y: 0.4, z: 2.5 },
            mass: 4.2,
            density: 1100,
            materialId: 'rubber',
            friction: 0.9,
            restitution: 0.6,
            isFixed: false,
            linearVelocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            color: '#10b981'
          }
        ],
        forces: [],
        torques: [
          {
            id: 'torque-1',
            name: 'Axle Drive Motor Torque',
            targetObjectId: 'wheel-1',
            vector: { x: 0, y: 0, z: 15.0 },
            enabled: true
          }
        ],
        springs: [],
        constraints: [
          {
            id: 'joint-1',
            name: 'Axle Hinge Constraint',
            type: 'hinge',
            objectAId: 'chassis-1',
            objectBId: 'wheel-1',
            anchorA: { x: 0, y: 0, z: 0.6 },
            anchorB: { x: 0, y: 0, z: 0 },
            axisA: { x: 0, y: 0, z: 1 },
            axisB: { x: 0, y: 0, z: 1 },
            enabled: true
          }
        ],
        environment: {
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 0.0166,
          timeScale: 1.0,
          airResistance: 0.05
        }
      }
    }
  }
];
