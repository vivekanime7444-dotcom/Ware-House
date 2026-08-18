import * as THREE from 'three';
import type { Vector3D } from '../types/physics';

export function createForceArrowHelper(
  position: Vector3D,
  direction: Vector3D,
  magnitude: number,
  color: number = 0xef4444
): THREE.ArrowHelper {
  const dirVec = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
  const origin = new THREE.Vector3(position.x, position.y, position.z);
  const length = Math.min(6.0, Math.max(1.0, magnitude / 10.0));

  return new THREE.ArrowHelper(dirVec, origin, length, color, 0.4, 0.3);
}
