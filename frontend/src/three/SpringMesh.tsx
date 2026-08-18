import * as THREE from 'three';
import type { Vector3D } from '../types/physics';

export function createSpringLineMesh(
  posA: Vector3D,
  posB: Vector3D,
  color: number = 0xa855f7
): THREE.Line {
  const start = new THREE.Vector3(posA.x, posA.y, posA.z);
  const end = new THREE.Vector3(posB.x, posB.y, posB.z);
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });

  return new THREE.Line(geometry, material);
}
