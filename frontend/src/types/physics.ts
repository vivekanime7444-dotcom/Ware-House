export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type ComponentType =
  | 'cube'
  | 'sphere'
  | 'cylinder'
  | 'capsule'
  | 'plane'
  | 'cone'
  | 'rod'
  | 'beam'
  | 'wheel'
  | 'disc';

export type MaterialId = 'steel' | 'aluminium' | 'copper' | 'rubber' | 'wood' | 'ice' | 'custom';

export interface MaterialProp {
  id: MaterialId | string;
  name: string;
  density: number; // kg/m^3
  friction: number; // 0 to 1
  restitution: number; // 0 to 1
  color?: string;
  metadata_info?: Record<string, any>;
}

export interface PhysicsComponent {
  id: string;
  name: string;
  type: ComponentType;
  position: Vector3D;
  rotation: Vector3D; // Euler angles in degrees
  scale: Vector3D;
  mass: number; // kg
  density: number; // kg/m^3
  materialId: MaterialId | string;
  friction: number;
  restitution: number;
  isFixed: boolean; // Static immovable body vs dynamic
  linearVelocity: Vector3D;
  angularVelocity: Vector3D;
  color?: string;

  // Runtime dynamic calculated telemetry (updated during simulation step)
  acceleration?: Vector3D;
  appliedForceVector?: Vector3D;
  kineticEnergy?: number;
  potentialEnergy?: number;
  totalEnergy?: number;
}

export interface AppliedForce {
  id: string;
  targetObjectId: string;
  name: string;
  magnitude: number; // Newtons
  direction: Vector3D; // Normalized direction vector
  applicationPoint: Vector3D; // Local offset (x, y, z)
  isImpulse: boolean;
  enabled: boolean;
}

export interface AppliedTorque {
  id: string;
  targetObjectId: string;
  name: string;
  vector: Vector3D; // Nm around X, Y, Z axes
  enabled: boolean;
}

export interface SpringConnection {
  id: string;
  name: string;
  objectAId: string;
  objectBId: string;
  restLength: number; // meters
  stiffness: number; // k in N/m
  damping: number; // damping factor
  enabled: boolean;
}

export type JointType = 'fixed' | 'hinge' | 'distance';

export interface JointConstraint {
  id: string;
  name: string;
  type: JointType;
  objectAId: string;
  objectBId: string;
  anchorA: Vector3D;
  anchorB: Vector3D;
  axisA?: Vector3D;
  axisB?: Vector3D;
  enabled: boolean;
}

export interface SimulationSettings {
  gravity: Vector3D;
  timeStep: number; // Seconds (e.g. 0.01666 = 1/60)
  timeScale: number; // Playback multiplier (e.g. 0.5x, 1x, 2x)
  airResistance: number; // Damping
}

export interface ObjectTelemetry {
  pos: Vector3D;
  vel: Vector3D;
  speed: number;
  accel: Vector3D;
  force: Vector3D;
  ke: number;
  pe: number;
  e: number;
}

export interface TelemetryFrame {
  simTime: number;
  objectsData: Record<string, ObjectTelemetry>;
  totalKE: number;
  totalPE: number;
  totalE: number;
  collisionCount: number;
  fps: number;
}

export interface CollisionRecord {
  id: string;
  time: number;
  objectAId: string;
  objectAName: string;
  objectBId: string;
  objectBName: string;
  impactVelocity: number;
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  scene: {
    objects: PhysicsComponent[];
    forces: AppliedForce[];
    torques: AppliedTorque[];
    springs: SpringConnection[];
    constraints: JointConstraint[];
    environment: SimulationSettings;
  };
}

export type TransformMode = 'translate' | 'rotate' | 'scale' | 'select';
