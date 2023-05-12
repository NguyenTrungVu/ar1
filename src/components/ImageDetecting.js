import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import hiro from "../data/patt.hiro";
import hiroimg from "../data/Hiro.png";

const THREEAR = require("threear");

export default function ImageDetecting() {
  var ref = useRef(null);
  var container, canvas, ctx;
  var camera, scene, renderer;
  var cube, markerGroup;
  var geometry, material, geometry1, material1;
  var navigate = useNavigate();

  useEffect(() => {
    function init() {
      const elm = ref.current;
      // const can = document.getElementById("can");
      renderer = new THREE.WebGLRenderer({
        // canvas: can,
        alpha: true,
      });
      const rect = elm.getBoundingClientRect();
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        20,
        rect.width / rect.height,
        1,
        100
      );
      scene.add(camera);
      camera.position.set(0, 0, 0);
      // console.log(can);
      
      renderer.setClearColor(new THREE.Color("lightgrey"), 0);
      renderer.setSize(rect.width, rect.height);
      renderer.domElement.style.position = "absolute";
      // renderer.domElement.style.top = "0px";
      // renderer.domElement.style.left = "0px";
      elm.appendChild(renderer.domElement);

      markerGroup = new THREE.Group();
      scene.add(markerGroup);
      const backbt = document.getElementById("back");

      var source = new THREEAR.Source({
        parent: elm,
        renderer,
        camera,
      });

      THREEAR.initialize({ source: source }).then((controller) => {
        initObject();
        var path = hiro;
        var patternMarker = new THREEAR.PatternMarker({
          patternUrl: path,
          markerObject: markerGroup,
        });
        controller.trackMarker(patternMarker);

        requestAnimationFrame(function animate(nowMsec) {
          // measure time
          var lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
          var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
          lastTimeMsec = nowMsec;
          renderer.render(scene, camera);
          controller.update(source.domElement);
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          // keep looping
          renderer.setAnimationLoop(animate);
        });
        const getback = () => {
          navigate('/');
          controller.markers.pattern.forEach((marker) => {
            scene.remove(marker.markerObject);
          });
          source.dispose();
          controller.dispose();
          
          backbt.disabled = true;
          backbt.removeEventListener("click", getback);
        };
        backbt.addEventListener("click", getback);
      });
    }
    init();
  }, []);

  function initObject() {
    geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
    material = new THREE.MeshNormalMaterial();
    var torus = new THREE.Mesh(geometry, material);

    markerGroup.add(torus);

    geometry1 = new THREE.BoxGeometry(1, 1, 1);
    material1 = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    cube = new THREE.Mesh(geometry1, material1);
    cube.position.y = geometry1.parameters.height / 2;
    markerGroup.add(cube);
  }

  return (
    <div className="grid grid-cols-5 flex">
      <div className="col-span-1">
      <button
        id="back"
        className="bg-cyan-500 shadow-lg shadow-cyan-500/50"
      >
        GO BACK
      </button>
      </div>
     
      <div ref={ref} className="col-span-4">
        {/* <canvas className=""  id="can"></canvas> */}
      </div>
    </div>
  );
}
