import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import type {
  PhysicsComponent,
  AppliedForce,
  SpringConnection,
  TransformMode
} from '../types/physics';

interface ViewportProps {
  objects: PhysicsComponent[];
  forces: AppliedForce[];
  springs: SpringConnection[];
  selectedObjectId: string | null;
  transformMode: TransformMode;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<PhysicsComponent>) => void;
}

export const Viewport: React.FC<ViewportProps> = ({
  objects,
  forces,
  springs,
  selectedObjectId,
  transformMode,
  onSelectObject,
  onUpdateObject
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);

  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const forceArrowMapRef = useRef<Map<string, THREE.ArrowHelper>>(new Map());
  const springLineMapRef = useRef<Map<string, THREE.Line>>(new Map());

  // Initialize Three.js scene, camera, renderer, and controls
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(18, 14, 22);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.8);
    dirLight.position.set(20, 30, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);

    const hemisphereLight = new THREE.HemisphereLight('#38bdf8', '#0f172a', 0.6);
    scene.add(hemisphereLight);

    // 5. Grid Helper & Origin Axes
    const gridHelper = new THREE.GridHelper(60, 60, '#3b82f6', '#1e293b');
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.position.set(-14, 0.05, -14);
    scene.add(axesHelper);

    // 6. Orbit Controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.maxPolarAngle = Math.PI / 2 + 0.05;
    orbitControlsRef.current = orbitControls;

    // 7. Transform Controls (Gizmo)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.85;
    transformControls.addEventListener('dragging-changed', event => {
      orbitControls.enabled = !event.value;
    });

    transformControls.addEventListener('change', () => {
      if (transformControls.object && transformControls.object.userData.id) {
        const mesh = transformControls.object as THREE.Mesh;
        const id = mesh.userData.id;
        const pos = mesh.position;
        const rot = mesh.rotation;
        const scale = mesh.scale;

        onUpdateObject(id, {
          position: { x: Number(pos.x.toFixed(3)), y: Number(pos.y.toFixed(3)), z: Number(pos.z.toFixed(3)) },
          rotation: {
            x: Number(((rot.x * 180) / Math.PI).toFixed(2)),
            y: Number(((rot.y * 180) / Math.PI).toFixed(2)),
            z: Number(((rot.z * 180) / Math.PI).toFixed(2))
          },
          scale: { x: Number(scale.x.toFixed(3)), y: Number(scale.y.toFixed(3)), z: Number(scale.z.toFixed(3)) }
        });
      }
    });

    const tcObject = typeof (transformControls as any).getHelper === 'function' 
      ? (transformControls as any).getHelper() 
      : (transformControls as any);
    scene.add(tcObject);
    transformControlsRef.current = transformControls;

    // 8. Raycast Object Selection Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      if (transformControls.dragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(meshMapRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.id;
        onSelectObject(hitId);
      } else {
        onSelectObject(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handleCanvasClick);

    // 9. Resize Listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handleCanvasClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Synchronize 3D meshes when objects array updates
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMeshIds = new Set(meshMapRef.current.keys());
    const newMeshIds = new Set(objects.map(o => o.id));

    // Remove deleted meshes
    currentMeshIds.forEach(id => {
      if (!newMeshIds.has(id)) {
        const mesh = meshMapRef.current.get(id);
        if (mesh) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
          meshMapRef.current.delete(id);
        }
      }
    });

    // Create or update meshes
    objects.forEach(obj => {
      let mesh = meshMapRef.current.get(obj.id);

      if (!mesh) {
        const geom = createGeometryForType(obj.type);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.color || getColorForMaterial(obj.materialId)),
          roughness: 1.0 - (obj.friction || 0.5) * 0.5,
          metalness: obj.materialId === 'steel' || obj.materialId === 'copper' || obj.materialId === 'aluminium' ? 0.8 : 0.1
        });

        mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { id: obj.id };
        scene.add(mesh);
        meshMapRef.current.set(obj.id, mesh);
      }

      mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
      mesh.rotation.set(
        (obj.rotation.x * Math.PI) / 180,
        (obj.rotation.y * Math.PI) / 180,
        (obj.rotation.z * Math.PI) / 180
      );
      mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (obj.id === selectedObjectId) {
        mat.emissive.setHex(0x38bdf8);
        mat.emissiveIntensity = 0.35;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
  }, [objects, selectedObjectId]);

  // Synchronize 3D Force Arrows
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old force arrows
    forceArrowMapRef.current.forEach(arrow => scene.remove(arrow));
    forceArrowMapRef.current.clear();

    forces.forEach(f => {
      if (!f.enabled) return;
      const targetObj = objects.find(o => o.id === f.targetObjectId);
      if (!targetObj) return;

      const dirVec = new THREE.Vector3(f.direction.x, f.direction.y, f.direction.z).normalize();
      const origin = new THREE.Vector3(targetObj.position.x, targetObj.position.y, targetObj.position.z);
      const len = Math.min(6.0, Math.max(1.0, f.magnitude / 10.0));

      const arrow = new THREE.ArrowHelper(dirVec, origin, len, 0xef4444, 0.4, 0.3);
      scene.add(arrow);
      forceArrowMapRef.current.set(f.id, arrow);
    });
  }, [forces, objects]);

  // Synchronize 3D Spring Lines
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    springLineMapRef.current.forEach(line => {
      scene.remove(line);
      line.geometry.dispose();
    });
    springLineMapRef.current.clear();

    springs.forEach(s => {
      if (!s.enabled) return;
      const objA = objects.find(o => o.id === s.objectAId);
      const objB = objects.find(o => o.id === s.objectBId);
      if (!objA || !objB) return;

      const start = new THREE.Vector3(objA.position.x, objA.position.y, objA.position.z);
      const end = new THREE.Vector3(objB.position.x, objB.position.y, objB.position.z);
      const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 3 });

      const line = new THREE.Line(geom, mat);
      scene.add(line);
      springLineMapRef.current.set(s.id, line);
    });
  }, [springs, objects]);

  // Sync TransformControls mode and attached target object
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    if (!transformControls) return;

    if (transformMode === 'select' || !selectedObjectId) {
      transformControls.detach();
    } else {
      const targetMesh = meshMapRef.current.get(selectedObjectId);
      if (targetMesh) {
        transformControls.setMode(transformMode);
        transformControls.attach(targetMesh);
      } else {
        transformControls.detach();
      }
    }
  }, [selectedObjectId, transformMode]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

// Geometry generator helper
function createGeometryForType(type: string): THREE.BufferGeometry {
  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(0.5, 32, 32);
    case 'cylinder':
    case 'wheel':
    case 'disc':
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    case 'capsule':
      return new THREE.CapsuleGeometry(0.5, 1, 16, 32);
    case 'cone':
      return new THREE.ConeGeometry(0.5, 1, 32);
    case 'plane':
      return new THREE.BoxGeometry(1, 1, 1);
    case 'cube':
    case 'beam':
    case 'rod':
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function getColorForMaterial(matId: string): string {
  switch (matId) {
    case 'steel': return '#64748b';
    case 'aluminium': return '#94a3b8';
    case 'copper': return '#b45309';
    case 'rubber': return '#334155';
    case 'wood': return '#854d0e';
    case 'ice': return '#38bdf8';
    default: return '#38bdf8';
  }
}
