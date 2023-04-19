import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import {Row, Col} from "react-bootstrap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "../libs/ARButton";
import { VRButton } from "../libs/VRButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// import { Stats } from "../libs/stats.module.js";

export default function ImageDetec() {
  const [model, setModel] = useState([]);
  var ref = useRef(null);
  var container;
  var camera, scene, renderer;
  var controller;

  var reticle, pmremGenerator, current_object, controls, isAR, envmap;

  var hitTestSource = null;
  var hitTestSourceRequested = false;

  useEffect(() => {
    const elm = ref.current;
    container = document.createElement("div");
    elm.appendChild(container);

    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.001, 200 );

      const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
      light.position.set( 0.5, 1, 0.25 );
      scene.add( light );

      //

      renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.xr.enabled = true;
      container.appendChild( renderer.domElement );

      //

      document.body.appendChild( ARButton.createButton( renderer, { requiredFeatures: [ 'hit-test' ] } ) );

      //

      const geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.2, 32 ).translate( 0, 0.1, 0 );

      function onSelect() {

        if ( reticle.visible ) {

          const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } );
          const mesh = new THREE.Mesh( geometry, material );
          reticle.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );
          mesh.scale.y = Math.random() * 2 + 1;
          scene.add( mesh );

        }

      }

      controller = renderer.xr.getController( 0 );
      controller.addEventListener( 'select', onSelect );
      scene.add( controller );

      reticle = new THREE.Mesh(
        new THREE.RingGeometry( 0.1, 0.1, 32 ).rotateX( - Math.PI / 2 ),
        new THREE.MeshBasicMaterial()
      );
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add( reticle );

      //

      window.addEventListener( 'resize', onWindowResize );

    }
    init();
    animate();
    console.log(controls);
  }, []);

  function arPlace() {
    if (reticle.visible) {
      current_object.position.setFromMatrixPosition(reticle.matrix);
      current_object.visible = true;
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function loadModel() {}

  function animate() {

    renderer.setAnimationLoop( render );

  }

  function render( timestamp, frame ) {

    if ( frame ) {

      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();

      if ( hitTestSourceRequested === false ) {

        session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {

          session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

            hitTestSource = source;

          } );

        } );

        session.addEventListener( 'end', function () {

          hitTestSourceRequested = false;
          hitTestSource = null;

        } );

        hitTestSourceRequested = true;

      }

      if ( hitTestSource ) {

        const hitTestResults = frame.getHitTestResults( hitTestSource );

        if ( hitTestResults.length ) {

          const hit = hitTestResults[ 0 ];

          reticle.visible = true;
          reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

        } else {

          reticle.visible = false;

        }

      }

    }

    renderer.render( scene, camera );

  }
  return (

      <div id="content" className="w-full flex-auto">
        <Row>
          <Col md={2} xs={12}>
            <div id="mySidenav" className="h-full  fixed z-1  left-0 duration-500 bg-slate-300">
              <a className="closebt absolute" ></a>
              <a className="ar-object p-3 no-underline block duration-300 text-slate-50" id="1" href="#">
                item_1
              </a>
              <a className="ar-object p-3 no-underline block duration-300 text-slate-50" id="2" href="#">
                item_2
              </a>
              <a className="ar-object p-3 no-underline block duration-300 text-slate-50" id="3" href="#">
                item_3
              </a>
              <a className="ar-object p-3 no-underline block duration-300 text-slate-50" id="4" href="#">
                item_4
              </a>
            </div>
          </Col>
          <Col md={10} xs={12}>
          <div id="container" ref={ref}></div>
          </Col>
        </Row>
        

       

        <span>open</span>

        <button type="button" id="place-button">
          PLACE
        </button>
      </div>
    
  );
}