import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import hdrFilePath from "../textures/photo_studio_01_1k.hdr";
import { useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import model1 from "../3d/1.glb";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// const url = require("../3d/");
// import { Stats } from "../libs/stats.module.js";

export default function ImageDetec() {
  const [model, setModel] = useState(1);
  var context = require.context("../3d", true, /\.(glb|gltf)$/); //get all 3d model
  var res = context.keys().map(context);
  const [modelList, setModelList] = useState(res);
  var ref = useRef(null);
  var container;
  var camera, scene, renderer;
  var controller;
  var reticle, pmremGenerator, current_object, controls, isAR, envmap;
  var hitTestSource = null;
  var hitTestSourceRequested = false;

  //change model on click
  function handleClick(e) {
    let num = e.target.id;
    modelList.map((element, i) => {
      if (i + 1 == num) {
        setModel(num);
      }
    });
  }

  //init scene, ar setup
  useEffect(() => {
    const elm = ref.current;
    container = document.createElement("div");
    elm.appendChild(container);
    console.log(elm);
    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      light.position.set(0.5, 1, 0.25);
      scene.add(light);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      container.appendChild(renderer.domElement);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", render);
      controls.minDistance = 2;
      controls.maxDistance = 10;
      controls.target.set(0, 0, -0.2);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      document.body.appendChild(
        ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
      );
      const geometry = new THREE.CylinderGeometry(
        0.05,
        0.05,
        0.1,
        32
      ).translate(0, 0.1, 0);

      function onSelect() {
        if (reticle.visible) {
          loadModel(model);
          // const material = new THREE.MeshPhongMaterial({
          //   color: 0xffffff * Math.random(),
          // });
          // const mesh = new THREE.Mesh(geometry, material);
          // reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
          // mesh.scale.y = Math.random() * 2 + 1;
          // scene.add(mesh);
        }
      }

      controller = renderer.xr.getController(0);
      controller.addEventListener("select", onSelect);
      scene.add(controller);

      reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.07, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial()
      );
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add(reticle);
      window.addEventListener("resize", onWindowResize);
    }

    init();
    animate();
    
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

  function loadModel(model) {
    console.log(modelList);
    new RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .load(hdrFilePath, function (texture) {
        envmap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envmap;
        texture.dispose();
        pmremGenerator.dispose();
        render();

        const loader = new GLTFLoader();
        if (current_object != null) {
          scene.remove(current_object);
          console.log(current_object);

        } else {
          modelList.map((e, i) => {
            console.log(model);
            if (i + 1 == model) {
              loader.load(
                e,
                function (glb) {
                  current_object = glb.scene;
                  console.log("i am here!!!!!");
                  scene.add(current_object);
                  console.log(current_object);
                  arPlace();

                  var box = new THREE.Box3();
                  box.setFromObject(current_object);
                  // box.center(controls.target);

                  controls.update();
                  render();
                },
                function (xhr) {
                  console.log((xhr.loaded / xhr.total) * 100 + "% loaded"); // Show the progress in percentage
                },
                function (error) {
                  console.error(error);
                }
              );
            }
          });
        }
      });
  }

  function animate() {
    renderer.setAnimationLoop(render);
    requestAnimationFrame(animate);
    controls.update();
  }

  function render(timestamp, frame) {
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();

      if (hitTestSourceRequested === false) {
        session.requestReferenceSpace("viewer").then(function (referenceSpace) {
          session
            .requestHitTestSource({ space: referenceSpace })
            .then(function (source) {
              hitTestSource = source;
            });
        });

        session.addEventListener("end", function () {
          hitTestSourceRequested = false;
          hitTestSource = null;
        });

        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length) {
          const hit = hitTestResults[0];

          reticle.visible = true;
          reticle.matrix.fromArray(
            hit.getPose(referenceSpace).transform.matrix
          );
        } else {
          reticle.visible = false;
        }
      }
    }

    renderer.render(scene, camera);
  }
  return (
    <div id="content" className="w-full flex-auto">
      <Row>
        <Col md={2} xs={12}>
          <div
            id="mySidenav"
            className="h-full  fixed z-1  left-0 duration-500 bg-slate-300"
          >
            <a className="closebt absolute"></a>
            {modelList.map((m, index) => (
              <a
                onClick={handleClick}
                key={index + 1}
                className="ar-object p-3 no-underline block duration-300 text-slate-50"
                id={index + 1}
                href="#"
              >
                Item_{index + 1}
              </a>
            ))}
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
