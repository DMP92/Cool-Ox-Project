import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from 'gsap';

import * as dat from 'lil-gui'

// Loaders
const loadingBar = document.querySelector('.loading-bar');
const enterButton = document.querySelector('.enter');
const loadingScreenText = document.querySelector('.loading-screen-text');
const webgl = document.querySelector('.webgl');
const body = document.body;

function enter() 
{
    // Play micelle animations
    animations[0].play().setLoop(THREE.LoopOnce);
    animations[1].play().setLoop(THREE.LoopOnce);
    animations[2].play().setLoop(THREE.LoopOnce);
    animations[3].play().setLoop(THREE.LoopOnce);
    animations[4].play().setLoop(THREE.LoopOnce);
    
    // Fade overlay out
    gsap.to(overlayMats.uniforms.uAlpha, { duration: 3, value: 0 });

    enterButton.style.display = 'none';
    loadingScreenText.style.display = 'none';

    // Remove overlay
    // Fade in particles
    setTimeout(() => {
        scene.remove(overlay);
        gsap.to(particlesMaterial, { duration: 3, opacity: 1 })
        
        // Remove enter button
        webgl.style.position = 'relative !important'
        body.style.cssText = 'overflow-y: scroll !important';
    }, 2500);
}

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        setTimeout(() => { 
            loadingBar.classList.add('ended');
            loadingBar.style.transform = '';
        }, 500);
        
        setTimeout(() => 
        {
            
            enterButton.style.display = 'block';
            enterButton.addEventListener('click', () =>
            {
                enter();
            })
        }, 1500);
    },
    // Progress
    (itemsUrl, itemsLoaded, itemsTotal) => 
    {
        body.classList.add('stop-scrolling');
        webgl.classList.add('stop-scrolling');

        const progressRatio = itemsLoaded / itemsTotal;
        loadingBar.style.transform = `scaleX(${progressRatio})`;
    }
);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

// const gui = new dat.GUI();


const parameters = {
    lightColor: 0xffffff,
    headColor: 0xffffff,
    tailColor: 0xffffff,
    ambientBright: 0.5,
    rectLight: 82,
    pointLight: 0.75,
    particleColor: 'white'
}

// gui
//     .addColor(parameters, 'particleColor')
//     .onChange(() => {
//         particlesMaterial.color.set(parameters.particleColor);
//     })

// gui
//     .addColor(parameters, 'headColor')
//     .onChange(() => {
//         headMaterial.color.set(parameters.headColor);
//     })

// gui
//     .addColor(parameters, 'tailColor')
//     .onChange(() => {
//         tailMats.color.set(parameters.tailColor);
//     })

// gui 
//     .add(parameters, 'ambientBright').min(0).max(50).step(0.25)
//     .onChange(() => {
//         ambientLight.intensity = (parameters.ambientBright);
//         blackAmbientLight.intensity = (parameters.ambientBright);
//     })
    
// gui
//     .add(parameters, 'rectLight').min(0).max(500).step(0.25)
//     .onChange(() => {
//         rectAreaLight.intensity = (parameters.rectLight);
//         rectAreaLight2.intensity = (parameters.rectLight);
//         rectAreaLight3.intensity = (parameters.rectLight);
//         rectAreaLight4.intensity = (parameters.rectLight);
//     })
    
// gui
//     .add(parameters, 'pointLight').min(0).max(50).step(0.25)
//     .onChange(() => {
//         pointLight.intensity = (parameters.pointLight);
//         pointLight2.intensity = (parameters.pointLight);
//         pointLight3.intensity = (parameters.pointLight);
//     })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Overlay
const overlayGeo = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMats = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    uniforms: 
    {
       uAlpha: { value: 1 }
    },
    vertexShader: `
    void main() 
    {
        gl_Position = vec4(position, 1.0);
    }`,
    fragmentShader: `
    uniform float uAlpha;

    void main()
    {

        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }`
})

const overlay = new THREE.Mesh(overlayGeo, overlayMats);
scene.add(overlay);


// Textures
 const textureLoader = new THREE.TextureLoader(loadingManager);

//  * Update all materials
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Particles
 */
const particlesTexture = textureLoader.load('/Textures/Particles/1.png');


 const objectsDistance = 4;

 let particlesCount = 1000;
 const positions = new Float32Array(particlesCount * 3);
 
 for (let i = 0; i < particlesCount; i++) {
     positions[i * 3 + 0] = (Math.random() - .5) * 10;
     positions[i * 3 + 1] = objectsDistance * 1 - Math.random() * objectsDistance * 3;
     positions[i * 3 + 2] = (Math.random() - .5) * 10;
 }
 
 const particlesGeometry = new THREE.BufferGeometry();
 particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
 
 // Material
 const particlesMaterial = new THREE.PointsMaterial({
     uniforms:
     {
         uAlpha : { value: 0 }
     },
     color: '#0091ff',
     sizeAttenuation: true,
     size: .05,
     alpha: true,
     blending: THREE.AddativeBlending,
     alphaTest: .001,
     transparent: true,
     alphaMap: particlesTexture,
     depthWrite: false,
     alphaTest: 0.001,
     opacity: 0
 });

 // Particles
 const particles = new THREE.Points(particlesGeometry, particlesMaterial);
 scene.add(particles)

// Lights
const lights = 
{
    color: parameters.lightColor,
}

const blackAmbientLight = new THREE.AmbientLight('black', parameters.ambientBright);
// scene.add(blackAmbientLight);

const ambientLight = new THREE.AmbientLight(lights.color, parameters.ambientBright);
scene.add(ambientLight);

// Rect Lights
const rectAreaLight = new THREE.RectAreaLight(lights.color, parameters.rectLight, 10, 5);
rectAreaLight.position.set(-40, 3, 5)
rectAreaLight.rotation.xz = Math.PI * - 0.2;
rectAreaLight.rotation.y = Math.PI * 1.5;
scene.add(rectAreaLight);

const rectAreaLight2 = new THREE.RectAreaLight(lights.color, parameters.rectLight, 2, 10);
rectAreaLight2.position.set(0, 40, 7)
rectAreaLight2.rotation.y =  Math.PI * 2;
rectAreaLight2.rotation.x = Math.PI * - 0.5;
scene.add(rectAreaLight2);

const rectAreaLight3 = new THREE.RectAreaLight(lights.color, parameters.rectLight, 10, 5);
rectAreaLight3.position.set(40, 2, 6)
rectAreaLight3.rotation.y = Math.PI * .48;
scene.add(rectAreaLight3);

const rectAreaLight4 = new THREE.RectAreaLight(lights.color, parameters.rectLight, 10, 10);
rectAreaLight4.position.set(0, 2, 50)
scene.add(rectAreaLight4);

const pointLight = new THREE.PointLight(lights.color, parameters.pointLight);
scene.add(pointLight);
pointLight.position.set(-35, 0, 2);
pointLight.color.setHex(0xFFFFFF).convertSRGBToLinear()

const pointLight2 = new THREE.PointLight(lights.color, parameters.pointLight);
scene.add(pointLight2);
pointLight2.position.set(35, 0, 2);
pointLight2.color.setHex(0xFFFFFF).convertSRGBToLinear()

const pointLight3 = new THREE.PointLight(lights.color, parameters.pointLight);
pointLight3.position.set(0, 5, 0);
pointLight3
scene.add(pointLight3)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    setModel();
})
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100)
cameraGroup.add(camera);

cameraGroup.position.set(0, 0, 3);

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

let micelleMixer = null;

const tailMats = new THREE.MeshPhongMaterial({ 
    shininess: 20,
    specular: 'whitesmoke',
    color: '#ff5900'
});


const contaminantMats = textureLoader.load('/Baked Images/Contaminant Cube Color.jpg');
contaminantMats.flipY = false;
contaminantMats.encoding = THREE.sRGBEncoding;

const contaminantNormals = textureLoader.load('/Baked Images/Contaminant Cube Normals.jpg')
contaminantNormals.flipY = false;

const contaminant = new THREE.MeshStandardMaterial({ map: contaminantMats, roughnessMap: contaminantNormals});


const bakedMats = textureLoader.load('/Baked Images/Micelle Head_CO5.jpg');
bakedMats.encoding = THREE.sRGBEncoding;
bakedMats.flipY = false;
const headMats = new THREE.MeshStandardMaterial({ map: bakedMats, encoding: THREE.sRGBEncoding });
let turnedMesh = null;

const headMaterial = new THREE.MeshStandardMaterial({ color: '#010d6a' })

const animations = [];
const motionArray = {};

const gltfSceneOptions = {};
gltfSceneOptions.scale = 1.25

gltfLoader.load(
	// resource URL
	'/Models/Final Micelle Revision.glb',
	// called when the resource is loaded
	( gltf ) =>
    {
        console.log(gltf.scene.children);
        gltf.scene.rotation.y = Math.PI * 3.5;
        gltf.scene.position.set(- 0.75, 2, 0)
		gltf.scene.scale.set(gltfSceneOptions.scale, gltfSceneOptions.scale, gltfSceneOptions.scale)

        turnedMesh = gltf.scene;
        gltf.scene.traverse((child) =>
        {
            console.log(child)
            console.log(child.name);

            switch(true)
            {
                case child.name === 'Contaminant001':
                    console.log('shee')
                    child.material = contaminant;
                    child.frustumCulled = false;
                    turnedMesh = child;
                break;
                case child.name === 'Micelle_Tails173': 
                    child.material = tailMats;
                    motionArray.tails = child;
                    break;
                    case child.name === 'Micelle_Tails242': 
                    child.material = tailMats;
                    motionArray.tails2 = child;
                break;
                case child.name === 'Micelle_Head381': 
                    child.material = headMaterial;
                    motionArray.head = child;
                    break;
                    case child.name === 'Micelle_Head198': 
                    child.material = headMaterial;
                    motionArray.head2 = child;
                break;

            }
        })

        scene.add(gltf.scene);
        micelleMixer = new THREE.AnimationMixer(gltf.scene);

        const micelleMotion1 = micelleMixer.clipAction(gltf.animations[0]);
        const micelleMotion2 = micelleMixer.clipAction(gltf.animations[1]);
        const micelleMotion3 = micelleMixer.clipAction(gltf.animations[2]);
        const micelleMotion4 = micelleMixer.clipAction(gltf.animations[3]);
        const micelleMotion5 = micelleMixer.clipAction(gltf.animations[4]);
        micelleMotion1.clampWhenFinished = true;
        micelleMotion2.clampWhenFinished = true;
        micelleMotion3.clampWhenFinished = true;
        micelleMotion4.clampWhenFinished = true;
        micelleMotion5.clampWhenFinished = true;
        animations.push(micelleMotion1);
        animations.push(micelleMotion2);
        animations.push(micelleMotion3);
        animations.push(micelleMotion4);
        animations.push(micelleMotion5);
    
        updateAllMaterials()
    }
);

// Responsive Model Size
function setModel()
{
    switch(true)
    {
        case window.innerWidth > 950:
            gsap.to(gltfSceneOptions, {duration: 2, scale: 1.25 });
            break;
        case window.innerWidth === 950:
            console.log('=');
            break;
        case window.innerWidth < 950:
            gsap.to(gltfSceneOptions, {duration: 2, scale: 1 });
            break;
    }
}
setModel();

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    // physicallyCorrectLights: true,
    gammaOutput: true,
    gammaFactor: 2.2,
    transparent: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000, 0)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.colorManagement = true;
renderer.outputEncoding = THREE.sRGBEncoding;

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

/**
 * Cursor
 */
 const cursor = {};
 cursor.x = 0;
 cursor.y = 0;
 
 window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth -.5;
    cursor.y = event.clientY / window.innerHeight - .5;
 })

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // MicelleMixer
    if(micelleMixer)
    {
        micelleMixer.update(deltaTime);
    }
    // Update scene
    if (turnedMesh !== null)
    {
        turnedMesh.rotation.y += Math.PI * 0.001;
        turnedMesh.rotation.z += Math.PI * 0.001;
    }

 
    if (motionArray.head !== undefined && motionArray.tails !== undefined)
    {
        motionArray.head.position.y += Math.cos(elapsedTime) / 1000;
        motionArray.head2.position.y += Math.cos(elapsedTime) / 1000;
        motionArray.tails.position.y += Math.cos(elapsedTime) / 1000;
        motionArray.tails2.position.y += Math.cos(elapsedTime) / 1000;
    }
    

    // Animate camera
    camera.position.y = - scrollY / Math.round(sizes.height) *  2;

    const parallaxX = cursor.x * 0.5;
    const parallaxY = - cursor.y * 0.5;

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;

    // Violent shaking was due to the line below
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()
