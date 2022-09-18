import './style.css';
import * as THREE from 'three'


let xrSession, canvas, gl, localReferenceSpace, renderer, scene, camera, clock;

const dance = [
  'dance/dance-01.png',
  'dance/dance-02.png',
  'dance/dance-03.png',
  'dance/dance-04.png',
  'dance/dance-05.png',
  'dance/dance-06.png',
  'dance/dance-07.png',
  'dance/dance-08.png',
  'dance/dance-09.png',
  'dance/dance-10.png'
]

const activateXR = async () => {
  try {
    /** Initialize a WebXR session using "immersive-ar". */
    xrSession = await navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ['hit-test', 'dom-overlay'],
      domOverlay: { root: document.body }
    });

    /** Create the canvas that will contain our camera's background and our virtual scene. */
    createXRCanvas();

    /** With everything set up, start the app. */
    await onSessionStarted();

    document.body.classList.add("ar-mode")
    document.querySelector('.exit-ar').addEventListener('click', function() {
      xrSession.end()
    })
    xrSession.addEventListener('end', deactivateXR)
  } catch(e) {
    console.log(e);
    onNoXRDevice();
  }
}

(async function() {
  const isArSessionSupported =
      navigator.xr &&
      navigator.xr.isSessionSupported &&
      await navigator.xr.isSessionSupported("immersive-ar");
  if (isArSessionSupported) {
    document.getElementById("enter-ar").addEventListener("click", activateXR);
  } else {
    onNoXRDevice();
  }
})();


function createXRCanvas () {
  canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  gl = canvas.getContext("webgl", {xrCompatible: true});

  xrSession.updateRenderState({
    baseLayer: new XRWebGLLayer(xrSession, gl)
  });
}

async function onSessionStarted() {
  /** To help with working with 3D on the web, we'll use three.js. */
  setupThreeJs();

  /** Setup an XRReferenceSpace using the "local" coordinate system. */
  localReferenceSpace = await xrSession.requestReferenceSpace('local');

  /** Create another XRReferenceSpace that has the viewer as the origin. */
  const viewerSpace = await xrSession.requestReferenceSpace('viewer');

  /** Perform hit testing using the viewer as origin. */
  // this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });

  /** Start a rendering loop using this.onXRFrame. */
  clock = new THREE.Clock()
  xrSession.requestAnimationFrame(onXRFrame);
  
  // this.xrSession.addEventListener("select", this.onSelect);
}

/**
   * Called on the XRSession's requestAnimationFrame.
   * Called with the time and XRPresentationFrame.
   */
 function onXRFrame(time, frame) {
  // Queue up the next draw request.
  xrSession.requestAnimationFrame(onXRFrame);

  // Bind the graphics framebuffer to the baseLayer's framebuffer.
  const framebuffer = xrSession.renderState.baseLayer.framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  renderer.setFramebuffer(framebuffer);

  // Retrieve the pose of the device.
  // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
  const pose = frame.getViewerPose(localReferenceSpace);
  if (pose) {
  // In mobile AR, we only have one view.
    const view = pose.views[0];

    const viewport = xrSession.renderState.baseLayer.getViewport(view);
    renderer.setSize(viewport.width, viewport.height)
    
    // Use the view's transform matrix and projection matrix to configure the THREE.camera.
    camera.matrix.fromArray(view.transform.matrix)
    camera.projectionMatrix.fromArray(view.projectionMatrix);
    camera.updateMatrixWorld(true);

    // Render the scene with THREE.WebGLRenderer.
    renderer.render(scene, camera)
  }
}

/**
   * Initialize three.js specific rendering code, including a WebGLRenderer,
   * a demo scene, and a camera for viewing the 3D content.
   */
function setupThreeJs() {
  // Create a scene
  scene = new THREE.Scene()

  // Objects
  const length = 4, width = 10;
  const geometry = new THREE.BoxGeometry( 10, 14, 2);
  // const newTexture = new THREE.TextureLoader().load('cool-dog.jpg')
  // const material = new THREE.MeshBasicMaterial( { map: newTexture } );
  // const mesh = new THREE.Mesh( geometry, material ) ;
  // mesh.position.set (0, 0, -30)
  // scene.add( mesh );

  const galleryFramesGroup = new THREE.Group();
  scene.add( galleryFramesGroup );
  const numberOfFrames = 10;
  const radiusOfFramesCircle = 20;
  const radianInterval = (2.0 * Math.PI) / numberOfFrames;
  const centerOfFrameCircle = {
    x: 0,
    y: 1,
    z:0,
  }

  for(let i=0; i < numberOfFrames; i++) {
    const geometry = new THREE.BoxGeometry( 10, 14, 1);
    const newTexture = new THREE.TextureLoader().load(`dance/dance-${(i+1)>=10 ? i+1 : '0'+(i+1)}.png`)
    const material = new THREE.MeshBasicMaterial( { map: newTexture } );
    const galleryFrame = new THREE.Mesh( geometry, material ) ;
    galleryFrame.position.set (
      centerOfFrameCircle.x + (Math.cos(radianInterval * i) * radiusOfFramesCircle),
      centerOfFrameCircle.y,
      centerOfFrameCircle.z + (Math.sin(radianInterval * i) * radiusOfFramesCircle)
    )
    galleryFrame.rotation.y = (radianInterval*i) * (Math.PI / 180)

    console.log(galleryFrame.position, galleryFrame.rotation)

    galleryFramesGroup.add( galleryFrame );
  }

  // Lights
  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  // camera
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  camera = new THREE.PerspectiveCamera();
  // camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)
  // camera.position.z = 6
  camera.matrixAutoUpdate = false;
  scene.add(camera)

  // To help with working with 3D on the web, we'll use three.js.
  // Set up the WebGLRenderer, which handles rendering to our session's base layer.

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas,
    context: gl
  });
  renderer.autoClear = false;
}

function onNoXRDevice() {
  document.body.classList.add('unsupported');
}

function deactivateXR() {
  xrSession.removeEventListener('end', deactivateXR)
  document.body.classList.remove('ar-mode')
  xrSession = null
}