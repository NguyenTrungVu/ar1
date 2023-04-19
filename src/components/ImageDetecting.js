import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";

import hiro from "../data/patt.hiro";

const THREEAR = require("threear");

export default function ImageDetecting() {
  var ref = useRef(null);
  var container;
  var camera, scene, renderer;
  var cube, markerGroup;
  var geometry, material, geometry1, material1;
  

  useEffect(() => {
    function init() {
      const elm = ref.current;
      container = document.createElement('a');
      elm.appendChild(container);

     scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    // camera.position.z = 0;

    renderer = new THREE.WebGLRenderer({
				// antialias	: true,
				alpha: true
			});
		renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
		renderer.domElement.style.top = '0px'
		renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

    markerGroup = new THREE.Group();
		scene.add(markerGroup);

    var source = new THREEAR.Source({ renderer, camera });

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
      });
    }
    init();
  });

  function initObject() {
    geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
     material = new THREE.MeshNormalMaterial();
    var torus = new THREE.Mesh(geometry, material);
    torus.position.y = 0.5;
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

  return <div ref={ref}></div>;
}
