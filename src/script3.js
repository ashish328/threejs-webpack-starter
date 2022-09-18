import './style.css';
import * as THREE from 'three';

let xrSession, canvas, gl, localReferenceSpace, renderer, scene, camera; 

//canvas creation 
canvas = document.createElement("canvas");
canvas.classList.add('webgl')
document.body.appendChild(canvas)

 // Create a scene
 scene = new THREE.Scene()

 // Objects
 const length = 12, width = 8;
 const shape = new THREE.Shape();
 shape.moveTo( 0,0 );
 shape.lineTo( 0, width );
 shape.lineTo( length, width );
 shape.lineTo( length, 0 );
 shape.lineTo( 0, 0 );

 const extrudeSettings = {
   steps: 2,
   depth: 16,
   bevelEnabled: true,
   bevelThickness: 1,
   bevelSize: 1,
   bevelOffset: 0,
   bevelSegments: 1
 };
 const geometry = new THREE.BoxGeometry( 1, 1, 1 ); //new THREE.ExtrudeGeometry( shape, extrudeSettings );
 const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 const cube = new THREE.Mesh( geometry, material ) ;
 scene.add( cube );

 // Lights
 const light = new THREE.AmbientLight( 0x404040 ); // soft white light
 scene.add( light );

 // camera
 const sizes = {
  width: 800,
  height: 600
}
 window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

 camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
//  camera.matrixAutoUpdate = false;
camera.position.z = 3

 scene.add(camera)

 // To help with working with 3D on the web, we'll use three.js.
 // Set up the WebGLRenderer, which handles rendering to our session's base layer.

 renderer = new THREE.WebGLRenderer({
   canvas,
 });
 renderer.setSize(sizes.width, sizes.height)
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 renderer.autoClear = false;

 const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    cube.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// const scene = new THREE.Scene()

// // Red Cube
// const geometry = new THREE.BoxGeometry( 1, 1, 1 )
// const material = new THREE.MeshBasicMaterial( { color: "#ffff00" } )
// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)


// const sizes = {
//   width: 800,
//   height: 600
// }

// // Camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)
// camera.position.z = 3
// // camera.position.x = 2
// // camera.position.y = 1
// scene.add(camera)

// // Renderer
// // const canvas = document.querySelector('.webgl')
// const renderer = new THREE.WebGLRenderer({
//   canvas
// })
// renderer.setSize(sizes.width, sizes.height)

// renderer.render(scene, camera)