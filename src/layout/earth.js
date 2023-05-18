import React from "react";
import { useRef } from "react";
import { TextureLoader } from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import earthTexture from "../image/earth.jpg";
import cloudTexture from "../image/cloud.jpg";

const EarthCanvas = () => {
  const earthRef = useRef();
  const cloudRef = useRef();
  const [cloudMap, earthMap] = useLoader(TextureLoader, [
    cloudTexture,
    earthTexture,
  ]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    cloudRef.current.rotation.y = elapsedTime / 10;
    earthRef.current.rotation.y = elapsedTime / 10;
  });

  return (
    <group dispose={null}>
      <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      <PerspectiveCamera makeDefault fov={30} position={[0, 0, 70]} />
      <ambientLight color="#333333" position={[0, 50, 0]} intensity={30} />
      {/* <pointLight color="#ffffff" position={[0, -50, -70]} intensity={1000} /> */}
      
      <Stars
        radius={300}
        depth={60}
        count={40000}
        factor={10}
        saturation={0}
        fade={true}
      />
      
      
      <mesh ref={cloudRef} position={[0, -40, -60]}>
        <sphereGeometry args={[30.0124, 100, 100]} />
        <meshPhongMaterial
          map={cloudMap}
          opacity={0.4}
          depthWrite={true}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={earthRef} position={[0, -40, -60]}>
        <sphereGeometry args={[30, 100, 100]} />
        <meshPhongMaterial
          map={earthMap}
          opacity={1}
          metalness={0.4}
          roughness={0.7}
        />
        
      </mesh>
    </group>
  );
};
export default EarthCanvas;
