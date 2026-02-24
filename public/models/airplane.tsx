// This file creates a 3D plane model using Three.js
// Place this in public/models/airplane.js

import * as THREE from 'three';

export function createAirplaneGeometry() {
  const group = new THREE.Group();

  // Fuselage (body)
  const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.25, 4, 16, 8);
  const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
  const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
  fuselage.castShadow = true;
  fuselage.receiveShadow = true;
  group.add(fuselage);

  // Cockpit (front part)
  const cockpitGeometry = new THREE.ConeGeometry(0.25, 0.8, 16);
  const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x2a5a7a });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.z = 2.2;
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  group.add(cockpit);

  // Windows
  const windowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87ceeb });
  for (let i = 0; i < 3; i++) {
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(0, 0.3, 1.5 - i * 0.7);
    window.scale.set(1, 0.8, 0.5);
    window.castShadow = true;
    window.receiveShadow = true;
    group.add(window);
  }

  // Main wings
  const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
  const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
  const mainWing = new THREE.Mesh(wingGeometry, wingMaterial);
  mainWing.position.y = 0.1;
  mainWing.castShadow = true;
  mainWing.receiveShadow = true;
  group.add(mainWing);

  // Left wing
  const leftWingGeometry = new THREE.BoxGeometry(1.5, 0.08, 0.6);
  const leftWing = new THREE.Mesh(leftWingGeometry, wingMaterial);
  leftWing.position.set(-2.5, 0.05, -0.5);
  leftWing.castShadow = true;
  leftWing.receiveShadow = true;
  group.add(leftWing);

  // Right wing
  const rightWing = leftWing.clone();
  rightWing.position.x = 2.5;
  rightWing.castShadow = true;
  rightWing.receiveShadow = true;
  group.add(rightWing);

  // Tail
  const tailGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.5);
  const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.z = -1.8;
  tail.castShadow = true;
  tail.receiveShadow = true;
  group.add(tail);

  // Vertical stabilizer
  const stabilizerGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.3);
  const stabilizer = new THREE.Mesh(stabilizerGeometry, tailMaterial);
  stabilizer.position.set(0, 0.5, -1.8);
  stabilizer.castShadow = true;
  stabilizer.receiveShadow = true;
  group.add(stabilizer);

  // Landing gear (front)
  const gearGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
  const gearMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
  const frontGear = new THREE.Mesh(gearGeometry, gearMaterial);
  frontGear.position.set(0, -0.4, 1);
  frontGear.castShadow = true;
  frontGear.receiveShadow = true;
  group.add(frontGear);

  // Landing gear (rear left)
  const rearLeftGear = new THREE.Mesh(gearGeometry, gearMaterial);
  rearLeftGear.position.set(-0.5, -0.4, -0.5);
  rearLeftGear.castShadow = true;
  rearLeftGear.receiveShadow = true;
  group.add(rearLeftGear);

  // Landing gear (rear right)
  const rearRightGear = new THREE.Mesh(gearGeometry, gearMaterial);
  rearRightGear.position.set(0.5, -0.4, -0.5);
  rearRightGear.castShadow = true;
  rearRightGear.receiveShadow = true;
  group.add(rearRightGear);

  return group;
}

// Export as GLB/GLTF
export async function exportAirplaneAsGLB() {
  const airplane = createAirplaneGeometry();
  // You would need GLTFExporter to save this
  // This is just a demonstration
  return airplane;
}