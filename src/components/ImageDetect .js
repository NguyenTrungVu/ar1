import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import hdrFilePath from "../textures/photo_studio_01_1k.hdr";
import axios from "axios";


const cloudinaryUrl =
    "https://cors-anywhere.herokuapp.com/https://api.cloudinary.com/v1_1/dcrqeomcc/resources/raw/upload";
  const options = {
    headers: {
      Authorization:
        "Basic " + btoa("647449414761263:1J70qEJJTg45n0GfEoRpUNa7XIE"),
    },
    params: {
      resource_type: "raw",
      prefix: "3dmodel/",
      format: "json",
    },
  };

export default function ImageDetec() {
  var context = require.context("../3d", true, /\.(glb|gltf)$/); //get all 3d model
  var res = context.keys().map(context);
  const [modelList, setModelList] = useState([]);
  const [isAR, setIsAR] = useState(false);
  var ref = useRef(null);
  var navigate = useNavigate();
  var container;
  var camera, scene, renderer, workingVec3;
  var controller;
  var reticle, pmremGenerator, current_object, controls, envmap;
  var touchDown, touchX, touchY, deltaX, deltaY;
  var hitTestSource = null;
  var hitTestSourceRequested = false;
  var num;
  
  // get model from cloudinary.
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const results = await axios.get(cloudinaryUrl, options);
        setModelList(results.data.resources);
      } catch (err) {
        console.log(err);
      }
    };
    fetchFiles();
  }, []);

  //change model on click
 
  console.log(modelList[1]);
  //init scene, ar setup
  useEffect(() => {
    const elm = ref.current;
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

      let overlayContent = document.getElementById("content");

      elm.appendChild(
        ARButton.createButton(renderer, {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: overlayContent },
        })
      );
      workingVec3 = new THREE.Vector3();
      function onSelect() {
        if (reticle.visible) {
          if (current_object.visible) {
            workingVec3.setFromMatrixPosition(reticle.matrix);
          } else {
            current_object.position.setFromMatrixPosition(reticle.matrix);
            current_object.visible = true;
          }
          // current_object.visible = true;
          // current_object.position.setFromMatrixPosition(reticle.matrix);
          // current_object.newPath()
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
      // console.log(controller);
      // console.log(renderer.xr.isPresenting);
    }
    init();
    animate();
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
        console.log(pmremGenerator);
        envmap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envmap;
        texture.dispose();
        pmremGenerator.dispose();
        render();

        const loader = new GLTFLoader();

        modelList.map((e, i) => {
          
          if (i + 1 == model) {
            loader.load(
              e,
              function (glb) {
                current_object = glb.scene;
                // current_object.scale.set(.5,.5,.5);
                console.log("i am here!!!!!");
                console.log(current_object);
                scene.add(current_object);

                arPlace();
                var box = new THREE.Box3();
                box.setFromObject(current_object);
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

      if (session) {
        document.getElementById("ends").style.display = "block";
      } else {
        document.getElementById("ends").style.display = "none";
      }

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

      const endar = () => {
        session.end();
        renderer.xr.dispose = true;
        navigate(-1);
      };
      const el = document.getElementById("ends");
      el.addEventListener("click", endar);

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
    <div className="w-full flex-auto">
      <div id="content" className="w-full absolute">
        <div
          id="mySidenav"
          className="h-full ml-5 duration-500 bg-slate-300 w-24 hidden"
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
        <div className=" absolute w-full flex">
          <div className=" text-xl cursor-pointer left-2 w-1/2" id="open">
            <span className="absolute rounded-md bg-slate-100 p-1 left-4">
              OPEN
            </span>
          </div>
          <div className="text-center align-middle w-1/2 ">
            <span
              className=" absolute rounded-md bg-slate-100 p-1 right-4 cursor-pointer"
              id="ends"
            >
              {" "}
              STOP AR{" "}
            </span>
          </div>
        </div>
      </div>

      <div id="container" ref={ref} className="w-fit h-fit"></div>
    </div>
  );
}
