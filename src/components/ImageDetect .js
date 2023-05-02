import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import hdrFilePath from "../textures/photo_studio_01_1k.hdr";

export default function ImageDetec() {
  var context = require.context("../3d", true, /\.(glb|gltf)$/); //get all 3d model
  var res = context.keys().map(context);
  const [modelList, setModelList] = useState(res);
  const [btplace, setBtplace] = useState({ display: "none" });
  var ref = useRef(null);
  var placebt = useRef(null);
  var container;
  var camera, scene, renderer;
  var controller;
  var reticle, pmremGenerator, current_object, controls, isAR, envmap;
  var touchDown, touchX, touchY, deltaX, deltaY;
  var hitTestSource = null;
  var hitTestSourceRequested = false;
  var num;

  //change model on click
  function handleClick(e) {
    num = e.target.id;
    let num1 = num;
    console.log(num1);
    if (current_object == null) {
      loadModel(num);
    } else {
      scene.remove(current_object);
      current_object = null;
      loadModel(num);
    }
    e.preventDefault();
  }

  //arbutton click

  // useEffect(() => {
  //   function placeClick() {
  //     arPlace();
  //   }
  //   document
  //     .getElementById("place-button")
  //     .addEventListener("click", placeClick);
  // }, []);

  //init scene, ar setup
  useEffect(() => {
    const elm = ref.current;
    console.log(elm);
    function init() {
      scene = new THREE.Scene();
      window.scene = scene;
      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );

      var directionalLight = new THREE.DirectionalLight(0xdddddd, 1);
      directionalLight.position.set(0, 0, 1).normalize();
      scene.add(directionalLight);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      elm.appendChild(renderer.domElement);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", render);
      controls.minDistance = 2;
      controls.maxDistance = 10;
      controls.target.set(0, 0, -0.2);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // let options = {
      //   requiredFeatures: ["hit-test"],
      //   optionalFeatures: ["dom-overlay"],
      // };
      let overlayContent = document.getElementById("content");
      // console.log(overlayContent);
      // options.domOverlay = { root: overlayContent };
      document.body.appendChild(ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: overlayContent }
    }));

      // const geometry = new THREE.CylinderGeometry(
      //   0.05,
      //   0.05,
      //   0.1,
      //   32
      // ).translate(0, 0.1, 0);

      function onSelect() {
        if (reticle.visible) {
          current_object.visible = true;
          current_object.position.setFromMatrixPosition(reticle.matrix);
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
      renderer.domElement.addEventListener(
        "touchstart",
        function (e) {
          e.preventDefault();
          touchDown = true;
          touchX = e.touches[0].pageX;
          touchY = e.touches[0].pageY;
        },
        false
      );

      renderer.domElement.addEventListener(
        "touchend",
        function (e) {
          e.preventDefault();
          touchDown = false;
        },
        false
      );

      renderer.domElement.addEventListener(
        "touchmove",
        function (e) {
          e.preventDefault();

          if (!touchDown) {
            return;
          }

          deltaX = e.touches[0].pageX - touchX;
          deltaY = e.touches[0].pageY - touchY;
          touchX = e.touches[0].pageX;
          touchY = e.touches[0].pageY;

          rotateObject();
        },
        false
      );
    }

    init();
    animate();
    rotateObject();
  }, []);

  useEffect(() => {
    function arClick() {
      isAR = true;
      console.log("clicked");

      document.getElementById("place-button").style.display = "block";
    }
    document.getElementById("ARButton").addEventListener("click", arClick);
    return () => {
      document.getElementById("ARButton").removeEventListener("click", arClick);
    };
  }, []);

  useEffect(() => {
    const myClick = () => {
      document.getElementById("mySidenav").style.display = "block";
      document.getElementById("open").style.display = "none";
    };
    document.getElementById("open").addEventListener("click", myClick);
  }, []);
  useEffect(() => {
    const myClick = () => {
      document.getElementById("mySidenav").style.display = "none";
      document.getElementById("open").style.display = "block";
    };
    document.getElementById("closebtn").addEventListener("click", myClick);
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
    new RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .load(hdrFilePath, function (texture) {
        envmap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envmap;
        texture.dispose();
        pmremGenerator.dispose();
        render();

        const loader = new GLTFLoader();

        modelList.map((e, i) => {
          console.log(model);
          if (i + 1 == model) {
            loader.load(
              e,
              function (glb) {
                current_object = glb.scene;
                // current_object.scale.set(.5,.5,.5);
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
      });
  }
  function rotateObject() {
    if (current_object && reticle.visible) {
      current_object.rotation.y += deltaX / 100;
    }
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
  // function setStyle() {
  //   if (hitTestSource) {
  //     setBtplace({ display: "block" });
  //   }
  // }

  return (
    <div className="w-full flex-auto">
      <div id="content" className="absolute">
        <div
          id="mySidenav"
          className="h-full left-0 duration-500 bg-slate-300 w-24 hidden"
        >
          <a id="closebtn">&times;</a>
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
        <span className="absolute text-xl cursor-pointer" id="open">
          OPEN
        </span>
      </div>

      <div id="container" ref={ref} className="w-fit h-fit"></div>

      <button
        type="button"
        id="place-button"
        className="absolute w-24 h-6 bottom-2 z-1000 hidden"
      >
        PLACE
      </button>
    </div>
  );
}
