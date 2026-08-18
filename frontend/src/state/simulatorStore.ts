import { useState } from 'react';
import type {
  ProjectData,
  PhysicsComponent,
  AppliedForce,
  AppliedTorque,
  SpringConnection,
  JointConstraint,
  TransformMode,
  TelemetryFrame,
  CollisionRecord
} from '../types/physics';
import { PRESET_SCENARIOS } from '../utils/presets';
import { calculateMass } from '../utils/materials';
import type { CompoundStructure } from '../utils/structures';

export function createInitialProject(): ProjectData {
  return {
    id: `project-${Date.now()}`,
    name: 'New Virtual Prototype',
    description: 'Custom 3D rigid body physics assembly',
    scene: {
      objects: [
        {
          id: 'ground-default',
          name: 'Ground Surface',
          type: 'plane',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 40, y: 0.2, z: 40 },
          mass: 1000,
          density: 2700,
          materialId: 'aluminium',
          friction: 0.5,
          restitution: 0.3,
          isFixed: true,
          linearVelocity: { x: 0, y: 0, z: 0 },
          angularVelocity: { x: 0, y: 0, z: 0 },
          color: '#334155'
        },
        {
          id: 'cube-demo',
          name: 'Steel Prototype Block',
          type: 'cube',
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 2, y: 2, z: 2 },
          mass: 62.8,
          density: 7850,
          materialId: 'steel',
          friction: 0.5,
          restitution: 0.5,
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
        timeStep: 0.01666,
        timeScale: 1.0,
        airResistance: 0.02
      }
    }
  };
}

export function useSimulatorState() {
  const [project, setProject] = useState<ProjectData>(createInitialProject());
  const [history, setHistory] = useState<ProjectData[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectData[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('cube-demo');
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [collisionCount, setCollisionCount] = useState<number>(0);

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryFrame[]>([]);
  const [collisionsList, setCollisionsList] = useState<CollisionRecord[]>([]);

  const [activeModal, setActiveModal] = useState<
    'none' | 'ai' | 'dashboard' | 'presets' | 'settings' | 'validation' | 'addForce' | 'addSpring' | 'addJoint'
  >('none');

  const pushHistory = (newProj: ProjectData) => {
    setHistory(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(project))]);
    setRedoStack([]);
    setProject(newProj);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [JSON.parse(JSON.stringify(project)), ...r]);
    setHistory(h => h.slice(0, -1));
    setProject(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(r => r.slice(1));
    setHistory(h => [...h, JSON.parse(JSON.stringify(project))]);
    setProject(next);
  };

  // Smart object addition: calculate offset to prevent overlapping in exact same spot
  const addObject = (comp: PhysicsComponent) => {
    const existingDynamic = project.scene.objects.filter(o => !o.isFixed);
    const count = existingDynamic.length;

    // Offset position if default (0, Y, 0)
    const smartPos = { ...comp.position };
    if (smartPos.x === 0 && smartPos.z === 0 && comp.type !== 'plane') {
      const highestY = existingDynamic.reduce((max, o) => Math.max(max, o.position.y + o.scale.y / 2), 0);
      smartPos.y = Math.max(smartPos.y, highestY + comp.scale.y / 2 + 0.1);
      if (count > 1) {
        smartPos.x = (count % 3) * 2.5 - 2.5;
        smartPos.z = Math.floor(count / 3) * 2.5 - 2.5;
      }
    }
    comp.position = smartPos;

    const updated = {
      ...project,
      scene: {
        ...project.scene,
        objects: [...project.scene.objects, comp]
      }
    };
    pushHistory(updated);
    setSelectedObjectId(comp.id);
  };

  // 1-Click Multi-Shape Compound Structure Insertion
  const addStructure = (structure: CompoundStructure) => {
    const updated = {
      ...project,
      scene: {
        ...project.scene,
        objects: [...project.scene.objects, ...structure.objects],
        constraints: [...project.scene.constraints, ...(structure.joints || [])],
        forces: [...project.scene.forces, ...(structure.forces || [])]
      }
    };
    pushHistory(updated);
    if (structure.objects.length > 0) {
      setSelectedObjectId(structure.objects[structure.objects.length - 1].id);
    }
  };

  const updateObject = (id: string, updates: Partial<PhysicsComponent>) => {
    setProject(prev => {
      const updatedObjects = prev.scene.objects.map(obj => {
        if (obj.id !== id) return obj;
        const merged = { ...obj, ...updates };
        if (updates.scale || updates.density || updates.materialId) {
          merged.mass = calculateMass(merged.type, merged.scale, merged.density);
        }
        return merged;
      });
      return {
        ...prev,
        scene: {
          ...prev.scene,
          objects: updatedObjects
        }
      };
    });
  };

  const deleteObject = (id: string) => {
    const updated = {
      ...project,
      scene: {
        ...project.scene,
        objects: project.scene.objects.filter(o => o.id !== id),
        forces: project.scene.forces.filter(f => f.targetObjectId !== id),
        torques: project.scene.torques.filter(t => t.targetObjectId !== id),
        springs: project.scene.springs.filter(s => s.objectAId !== id && s.objectBId !== id),
        constraints: project.scene.constraints.filter(c => c.objectAId !== id && c.objectBId !== id)
      }
    };
    pushHistory(updated);
    if (selectedObjectId === id) setSelectedObjectId(null);
  };

  const duplicateObject = (id: string) => {
    const target = project.scene.objects.find(o => o.id === id);
    if (!target) return;

    const dup: PhysicsComponent = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type}-${Date.now()}`,
      name: `${target.name} Copy`,
      position: { x: target.position.x + target.scale.x + 0.5, y: target.position.y, z: target.position.z }
    };
    addObject(dup);
  };

  const addForce = (force: AppliedForce) => {
    pushHistory({
      ...project,
      scene: { ...project.scene, forces: [...project.scene.forces, force] }
    });
  };

  const addTorque = (torque: AppliedTorque) => {
    pushHistory({
      ...project,
      scene: { ...project.scene, torques: [...project.scene.torques, torque] }
    });
  };

  const addSpring = (spring: SpringConnection) => {
    pushHistory({
      ...project,
      scene: { ...project.scene, springs: [...project.scene.springs, spring] }
    });
  };

  const addJoint = (joint: JointConstraint) => {
    pushHistory({
      ...project,
      scene: { ...project.scene, constraints: [...project.scene.constraints, joint] }
    });
  };

  const loadPreset = (presetId: string) => {
    const found = PRESET_SCENARIOS.find(p => p.id === presetId);
    if (found) {
      const cloned = JSON.parse(JSON.stringify(found.data));
      cloned.id = `project-${Date.now()}`;
      setProject(cloned);
      setHistory([]);
      setRedoStack([]);
      setSelectedObjectId(cloned.scene.objects[1]?.id || cloned.scene.objects[0]?.id || null);
      setIsRunning(false);
      setSimTime(0);
      setTelemetryHistory([]);
      setCollisionsList([]);
      setCollisionCount(0);
    }
  };

  const selectedObject = project.scene.objects.find(o => o.id === selectedObjectId) || null;

  return {
    project,
    setProject,
    selectedObjectId,
    setSelectedObjectId,
    selectedObject,
    transformMode,
    setTransformMode,
    isRunning,
    setIsRunning,
    simTime,
    setSimTime,
    fps,
    setFps,
    collisionCount,
    setCollisionCount,
    telemetryHistory,
    setTelemetryHistory,
    collisionsList,
    setCollisionsList,
    activeModal,
    setActiveModal,
    pushHistory,
    undo,
    redo,
    addObject,
    addStructure,
    updateObject,
    deleteObject,
    duplicateObject,
    addForce,
    addTorque,
    addSpring,
    addJoint,
    loadPreset
  };
}
