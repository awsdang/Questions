import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast} from 'three-mesh-bvh'
import { IFCLoader } from "web-ifc-three/IFCLoader"
import CameraControls from "camera-controls"
CameraControls.install( { THREE: THREE } )
let container, model
let renderer, camera, scene, clock, controls;
let ifcLoader = new IFCLoader()
ifcLoader.ifcManager.useWebWorkers(true, "./worker/IFCWorker.js"); //THE ISSUE IS HERE!!
ifcLoader.ifcManager.setWasmPath("./wasm/")
await init()
render()
async function init() {
	setupScene()
	await ifcLoad("./models/05.ifc")	
}
function setupScene(){
	container = document.getElementById("container")
	renderer = new THREE.WebGLRenderer( { antialias: true })
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.setClearColor( 0xffffff, 1 )
	container.appendChild( renderer.domElement )
	// scene setup
	const ambientLight = new THREE.AmbientLight(0xffffee, 0.25)
	scene.add(ambientLight)
	// camera setup
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50)
	camera.position.set( 10, 10, 10 )
	camera.updateProjectionMatrix()
	window.camera = camera
	clock = new THREE.Clock()
	controls = new CameraControls(camera,renderer.domElement)
	controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM
}

async function ifcLoad(url) {
	ifcLoader.ifcManager.applyWebIfcConfig({
			COORDINATE_TO_ORIGIN: true,
			USE_FAST_BOOLS: true,
	})
	ifcLoader.ifcManager.setupThreeMeshBVH(
		computeBoundsTree,
		disposeBoundsTree,
		acceleratedRaycast
	  );
	model = await ifcLoader.loadAsync(url)
	scene.add(model)
}
function render() {
	requestAnimationFrame( render )
	controls.update()
	renderer.render(scene, camera)
}
