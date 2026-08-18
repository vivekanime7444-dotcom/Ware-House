import RAPIER from '@dimforge/rapier3d-compat';
import type {
  PhysicsComponent,
  Vector3D,
  AppliedForce,
  AppliedTorque,
  SpringConnection,
  JointConstraint,
  SimulationSettings,
  ObjectTelemetry,
  CollisionRecord
} from '../types/physics';

export class RapierManager {
  private isInitialized = false;
  private world: RAPIER.World | null = null;
  private eventQueue: RAPIER.EventQueue | null = null;
  private bodies: Map<string, RAPIER.RigidBody> = new Map();
  private colliders: Map<string, RAPIER.Collider> = new Map();
  private initialStates: Map<string, { pos: Vector3D; rot: Vector3D }> = new Map();
  private collisions: CollisionRecord[] = [];
  private totalCollisionCount = 0;

  async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      await RAPIER.init();
      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('Failed to initialize Rapier WASM physics:', e);
      return false;
    }
  }

  setupWorld(
    settings: SimulationSettings,
    components: PhysicsComponent[],
    constraints: JointConstraint[] = []
  ) {
    if (!this.isInitialized) return;

    if (this.world) {
      try {
        this.world.free();
      } catch (e) {
        // Ignore WASM GC pointer cleanup error
      }
      this.world = null;
    }

    const gravity = new RAPIER.Vector3(
      settings.gravity.x,
      settings.gravity.y,
      settings.gravity.z
    );

    this.world = new RAPIER.World(gravity);
    this.eventQueue = new RAPIER.EventQueue(true);
    this.bodies.clear();
    this.colliders.clear();
    this.initialStates.clear();
    this.collisions = [];
    this.totalCollisionCount = 0;

    components.forEach(comp => {
      this.createBodyForComponent(comp, settings.airResistance);
    });

    constraints.forEach(joint => {
      if (joint.enabled) {
        this.createJoint(joint);
      }
    });
  }

  private createBodyForComponent(comp: PhysicsComponent, airResistance: number) {
    if (!this.world) return;

    let bodyDesc: RAPIER.RigidBodyDesc;
    if (comp.isFixed) {
      bodyDesc = RAPIER.RigidBodyDesc.fixed();
    } else {
      bodyDesc = RAPIER.RigidBodyDesc.dynamic();
      bodyDesc.setLinearDamping(airResistance);
      bodyDesc.setAngularDamping(airResistance);
    }

    bodyDesc.setTranslation(comp.position.x, comp.position.y, comp.position.z);

    const radX = (comp.rotation.x * Math.PI) / 180;
    const radY = (comp.rotation.y * Math.PI) / 180;
    const radZ = (comp.rotation.z * Math.PI) / 180;
    const q = eulerToQuaternion(radX, radY, radZ);
    bodyDesc.setRotation({ w: q.w, x: q.x, y: q.y, z: q.z });

    bodyDesc.setLinvel(
      comp.linearVelocity.x,
      comp.linearVelocity.y,
      comp.linearVelocity.z
    );
    bodyDesc.setAngvel({
      x: comp.angularVelocity.x,
      y: comp.angularVelocity.y,
      z: comp.angularVelocity.z
    });

    const body = this.world.createRigidBody(bodyDesc);

    let colliderDesc: RAPIER.ColliderDesc;
    const sx = Math.max(0.001, comp.scale.x / 2);
    const sy = Math.max(0.001, comp.scale.y / 2);
    const sz = Math.max(0.001, comp.scale.z / 2);

    switch (comp.type) {
      case 'sphere':
        colliderDesc = RAPIER.ColliderDesc.ball(sx);
        break;
      case 'cylinder':
      case 'wheel':
      case 'disc':
        colliderDesc = RAPIER.ColliderDesc.cylinder(sy, sx);
        break;
      case 'capsule':
        colliderDesc = RAPIER.ColliderDesc.capsule(sy, sx);
        break;
      case 'cone':
        colliderDesc = RAPIER.ColliderDesc.cone(sy, sx);
        break;
      case 'plane':
        colliderDesc = RAPIER.ColliderDesc.cuboid(sx, 0.1, sz);
        break;
      case 'cube':
      case 'beam':
      case 'rod':
      default:
        colliderDesc = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
        break;
    }

    colliderDesc.setFriction(comp.friction);
    colliderDesc.setRestitution(comp.restitution);
    colliderDesc.setMass(comp.mass);
    colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = this.world.createCollider(colliderDesc, body);

    this.bodies.set(comp.id, body);
    this.colliders.set(comp.id, collider);

    this.initialStates.set(comp.id, {
      pos: { ...comp.position },
      rot: { ...comp.rotation }
    });
  }

  private createJoint(joint: JointConstraint) {
    if (!this.world) return;
    const bodyA = this.bodies.get(joint.objectAId);
    const bodyB = this.bodies.get(joint.objectBId);
    if (!bodyA || !bodyB) return;

    const anchorA = new RAPIER.Vector3(joint.anchorA.x, joint.anchorA.y, joint.anchorA.z);
    const anchorB = new RAPIER.Vector3(joint.anchorB.x, joint.anchorB.y, joint.anchorB.z);

    if (joint.type === 'fixed') {
      const params = RAPIER.JointData.fixed(
        anchorA,
        { w: 1, x: 0, y: 0, z: 0 },
        anchorB,
        { w: 1, x: 0, y: 0, z: 0 }
      );
      this.world.createImpulseJoint(params, bodyA, bodyB, true);
    } else if (joint.type === 'hinge') {
      const axisA = new RAPIER.Vector3(joint.axisA?.x ?? 0, joint.axisA?.y ?? 0, joint.axisA?.z ?? 1);
      const params = RAPIER.JointData.revolute(anchorA, anchorB, axisA);
      this.world.createImpulseJoint(params, bodyA, bodyB, true);
    }
  }

  step(
    dt: number,
    forces: AppliedForce[],
    torques: AppliedTorque[],
    springs: SpringConnection[],
    components: PhysicsComponent[]
  ): {
    objectsData: Record<string, ObjectTelemetry>;
    totalKE: number;
    totalPE: number;
    totalE: number;
    collisions: CollisionRecord[];
    collisionCount: number;
  } {
    if (!this.world || !this.eventQueue) {
      return { objectsData: {}, totalKE: 0, totalPE: 0, totalE: 0, collisions: [], collisionCount: 0 };
    }

    forces.forEach(f => {
      if (!f.enabled) return;
      const body = this.bodies.get(f.targetObjectId);
      if (body && !body.isFixed()) {
        const forceVec = new RAPIER.Vector3(
          f.direction.x * f.magnitude,
          f.direction.y * f.magnitude,
          f.direction.z * f.magnitude
        );
        if (f.isImpulse) {
          body.applyImpulse(forceVec, true);
        } else {
          body.addForce(forceVec, true);
        }
      }
    });

    torques.forEach(t => {
      if (!t.enabled) return;
      const body = this.bodies.get(t.targetObjectId);
      if (body && !body.isFixed()) {
        const torqueVec = new RAPIER.Vector3(t.vector.x, t.vector.y, t.vector.z);
        body.addTorque(torqueVec, true);
      }
    });

    springs.forEach(s => {
      if (!s.enabled) return;
      const bodyA = this.bodies.get(s.objectAId);
      const bodyB = this.bodies.get(s.objectBId);
      if (!bodyA || !bodyB) return;

      const posA = bodyA.translation();
      const posB = bodyB.translation();
      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;
      const dz = posB.z - posA.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > 0.0001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const nz = dz / dist;
        const delta = dist - s.restLength;
        const springForceMag = s.stiffness * delta;

        const velA = bodyA.linvel();
        const velB = bodyB.linvel();
        const rvel = (velB.x - velA.x) * nx + (velB.y - velA.y) * ny + (velB.z - velA.z) * nz;
        const dampingForceMag = s.damping * rvel;

        const totalMag = springForceMag + dampingForceMag;
        const forceA = new RAPIER.Vector3(nx * totalMag, ny * totalMag, nz * totalMag);
        const forceB = new RAPIER.Vector3(-nx * totalMag, -ny * totalMag, -nz * totalMag);

        if (!bodyA.isFixed()) bodyA.addForce(forceA, true);
        if (!bodyB.isFixed()) bodyB.addForce(forceB, true);
      }
    });

    this.world.step(this.eventQueue);

    const compMap = new Map(components.map(c => [c.id, c.name]));

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      if (started) {
        this.totalCollisionCount++;
        let objAId = '';
        let objBId = '';

        for (const [id, collider] of this.colliders.entries()) {
          if (collider.handle === handle1) objAId = id;
          if (collider.handle === handle2) objBId = id;
        }

        const bodyA = this.bodies.get(objAId);
        const bodyB = this.bodies.get(objBId);
        let impactSpeed = 0;
        if (bodyA && bodyB) {
          const vA = bodyA.linvel();
          const vB = bodyB.linvel();
          const dvx = vA.x - vB.x;
          const dvy = vA.y - vB.y;
          const dvz = vA.z - vB.z;
          impactSpeed = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);
        }

        const record: CollisionRecord = {
          id: `${Date.now()}-${Math.random()}`,
          time: Number(this.world?.timestep || 0),
          objectAId: objAId,
          objectAName: compMap.get(objAId) || 'Object A',
          objectBId: objBId,
          objectBName: compMap.get(objBId) || 'Object B',
          impactVelocity: Number(impactSpeed.toFixed(2))
        };
        this.collisions.unshift(record);
        if (this.collisions.length > 50) this.collisions.pop();
      }
    });

    const objectsData: Record<string, ObjectTelemetry> = {};
    let totalKE = 0;
    let totalPE = 0;

    components.forEach(comp => {
      const body = this.bodies.get(comp.id);
      if (!body) return;

      const pos = body.translation();
      const vel = body.linvel();
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);

      const ke = 0.5 * comp.mass * (speed * speed);
      const gravityY = Math.abs(this.world?.gravity.y ?? 9.81);
      const pe = comp.mass * gravityY * Math.max(0, pos.y);

      totalKE += ke;
      totalPE += pe;

      const accel = {
        x: Number((vel.x - comp.linearVelocity.x) / Math.max(0.001, dt)),
        y: Number((vel.y - comp.linearVelocity.y) / Math.max(0.001, dt)),
        z: Number((vel.z - comp.linearVelocity.z) / Math.max(0.001, dt))
      };

      objectsData[comp.id] = {
        pos: { x: pos.x, y: pos.y, z: pos.z },
        vel: { x: vel.x, y: vel.y, z: vel.z },
        speed: Number(speed.toFixed(3)),
        accel,
        force: { x: accel.x * comp.mass, y: accel.y * comp.mass, z: accel.z * comp.mass },
        ke: Number(ke.toFixed(3)),
        pe: Number(pe.toFixed(3)),
        e: Number((ke + pe).toFixed(3))
      };

      comp.position = { x: pos.x, y: pos.y, z: pos.z };
      comp.linearVelocity = { x: vel.x, y: vel.y, z: vel.z };

      const rotQ = body.rotation();
      comp.rotation = quaternionToEuler(rotQ);
      comp.kineticEnergy = Number(ke.toFixed(3));
      comp.potentialEnergy = Number(pe.toFixed(3));
      comp.totalEnergy = Number((ke + pe).toFixed(3));
    });

    return {
      objectsData,
      totalKE: Number(totalKE.toFixed(3)),
      totalPE: Number(totalPE.toFixed(3)),
      totalE: Number((totalKE + totalPE).toFixed(3)),
      collisions: this.collisions,
      collisionCount: this.totalCollisionCount
    };
  }

  reset(components: PhysicsComponent[]) {
    components.forEach(comp => {
      const init = this.initialStates.get(comp.id);
      const body = this.bodies.get(comp.id);
      if (init && body) {
        body.setTranslation(new RAPIER.Vector3(init.pos.x, init.pos.y, init.pos.z), true);
        body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
        body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);

        const radX = (init.rot.x * Math.PI) / 180;
        const radY = (init.rot.y * Math.PI) / 180;
        const radZ = (init.rot.z * Math.PI) / 180;
        const q = eulerToQuaternion(radX, radY, radZ);
        body.setRotation({ w: q.w, x: q.x, y: q.y, z: q.z }, true);

        comp.position = { ...init.pos };
        comp.rotation = { ...init.rot };
        comp.linearVelocity = { x: 0, y: 0, z: 0 };
        comp.angularVelocity = { x: 0, y: 0, z: 0 };
      }
    });
    this.collisions = [];
    this.totalCollisionCount = 0;
  }
}

function eulerToQuaternion(rx: number, ry: number, rz: number) {
  const c1 = Math.cos(ry / 2);
  const s1 = Math.sin(ry / 2);
  const c2 = Math.cos(rz / 2);
  const s2 = Math.sin(rz / 2);
  const c3 = Math.cos(rx / 2);
  const s3 = Math.sin(rx / 2);

  return {
    w: c1 * c2 * c3 - s1 * s2 * s3,
    x: s1 * s2 * c3 + c1 * c2 * s3,
    y: s1 * c2 * c3 + c1 * s2 * s3,
    z: c1 * s2 * c3 - s1 * c2 * s3
  };
}

function quaternionToEuler(q: { w: number; x: number; y: number; z: number }): Vector3D {
  const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
  const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
  const rx = Math.atan2(sinr_cosp, cosr_cosp);

  const sinp = 2 * (q.w * q.y - q.z * q.x);
  let ry = 0;
  if (Math.abs(sinp) >= 1) ry = (Math.sign(sinp) * Math.PI) / 2;
  else ry = Math.asin(sinp);

  const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  const rz = Math.atan2(siny_cosp, cosy_cosp);

  return {
    x: Number(((rx * 180) / Math.PI).toFixed(2)),
    y: Number(((ry * 180) / Math.PI).toFixed(2)),
    z: Number(((rz * 180) / Math.PI).toFixed(2))
  };
}
