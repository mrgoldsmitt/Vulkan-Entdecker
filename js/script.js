import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'https://unpkg.com/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js';

// --- Performance Management (Adaptive Quality) ---
class PerformanceManager {
    constructor() {
        this.isLowPerf = false;
        this.isLiteMode = false;
        this.frameCounter = 0;
        this.startTime = 0;
        this.enabled = true;
        this.gpuInfo = "Unknown";
        
        this.detectInitialQuality();
    }

    detectInitialQuality() {
        try {
            // Check for manual override from localStorage
            const manualMode = localStorage.getItem('vulkan_mode');
            
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    this.gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
            
            const pixelLoad = window.screen.width * window.screen.height * Math.pow(window.devicePixelRatio, 2);
            
            // Refined Detection logic
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

            if (manualMode) {
                this.isLiteMode = manualMode === 'lite';
            } else {
                // Determine Lite Mode automatically
                if (isTouchDevice) {
                    const maxDim = Math.max(window.screen.width, window.screen.height);
                    if (maxDim <= 1080) {
                        this.isLiteMode = true;
                    }
                }
                
                // FORCE 3D for Desktops / M1 Macs if no touch is present and no manual override
                if (isMac && !isTouchDevice) {
                    this.isLiteMode = false;
                    this.isLowPerf = false;
                }
            }
            
            // Apply mode classes
            if (this.isLiteMode) {
                this.isLowPerf = true;
                document.body.classList.add('is-lite', 'low-perf');
                const videoContainer = document.getElementById('video-background-container');
                if (videoContainer) {
                    videoContainer.innerHTML = ''; 
                    videoContainer.classList.add('lite-bg');
                }
                // Mode logic applied
            } else {
                document.body.classList.remove('is-lite');
            }

            console.log(`PerformanceManager: LiteMode=${this.isLiteMode}, LowPerf=${this.isLowPerf}, GPU=${this.gpuInfo}`);

        } catch (e) {
            console.error("Perf Check Failed", e);
        }
    }

    applyLowPerfModeEarly() {
        console.warn("PerformanceManager: Applying Early Low Performance Mode!");
        document.body.classList.add('low-perf');
        this.isLowPerf = true;
    }

    applyLowPerfModeLate() {
        if (this.isLowPerf) return; // already applied
        console.warn("PerformanceManager: Applying Late Low Performance Mode!");
        this.isLowPerf = true;
        document.body.classList.add('low-perf');
        
        // Pause video
        const video = document.getElementById('bg-video');
        if (video) {
            video.pause();
            video.style.display = 'none';
        }
        
        // Lower limit for particle system if already active
        if (typeof particleSystem !== 'undefined' && particleSystem) {
             particleSystem.limit = 300;
        }
    }

    startMonitoring() {
        this.startTime = performance.now();
    }

    update() {
        if (this.isLowPerf || !this.enabled) return;

        this.frameCounter++;
        
        // Check after ~2 seconds (120 frames at 60fps)
        if (this.frameCounter === 120) {
            const elapsed = performance.now() - this.startTime;
            const avgFPS = (this.frameCounter / elapsed) * 1000;
            
            console.log(`PerformanceManager: Startup average FPS = ${avgFPS.toFixed(1)}`);
            
            if (avgFPS < 30) {
                this.applyLowPerfModeLate();
            } else {
                console.log("PerformanceManager: Device performance is good. Keeping high quality.");
            }
            this.enabled = false; // Stop monitoring
        }
    }
}

const perfManager = new PerformanceManager();


// --- Configuration ---
const CONFIG = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        posX: 0, posY: 2, posZ: 10
    },
    controls: {
        minDist: 3,
        maxDist: 15,
        targetY: 1
    },
    transition: {
        fadeStart: 8, // Distance to start fading exterior
        fadeEnd: 5    // Distance where exterior is fully invisible
    },
    labels: [
        // Center/Bottom
        { id: 'magma', text: 'Magmakammer', position: new THREE.Vector3(0, -1.2, 0), pos2D: { x: 50, y: 78 } },

        // Main Shaft Upwards
        { id: 'vent', text: 'Hauptschlot', position: new THREE.Vector3(0, -0.2, 0), pos2D: { x: 50, y: 55 } },
        { id: 'throat', text: 'Vulkanschlund', position: new THREE.Vector3(0, 1.4, 0), pos2D: { x: 48, y: 35 } },
        { id: 'vent_opening', text: 'Austrittsöffnung', position: new THREE.Vector3(0, 1.8, 0.5), pos2D: { x: 55, y: 32 } },
        { id: 'crater', text: 'Krater', position: new THREE.Vector3(0, 2.3, 0), pos2D: { x: 50, y: 28 } },

        // Eruption (Initially Hidden)
        { id: 'ash', text: 'Aschewolke', position: new THREE.Vector3(0, 4.0, 0), pos2D: { x: 50, y: 15 }, hidden: true },
        { id: 'lava_flow', text: 'Lavastrom', position: new THREE.Vector3(2.0, 1.0, 0.5), pos2D: { x: 65, y: 45 }, hidden: true },

        // Side features
        { id: 'side_vent', text: 'Seitenschlot', position: new THREE.Vector3(0.8, 0.0, 0), pos2D: { x: 58, y: 48 } },
        { id: 'side_eruption', text: 'Seitenöffnung', position: new THREE.Vector3(1.6, 0.2, 0), pos2D: { x: 62, y: 52 } },
        { id: 'parasitic_cone', text: 'Nebenkrater', position: new THREE.Vector3(2.0, 0.5, 0), pos2D: { x: 68, y: 55 } },
        { id: 'sill', text: 'Lagergang', position: new THREE.Vector3(-1.8, -1.0, 0), pos2D: { x: 35, y: 65 } },

        // Layers
        { id: 'layer', text: 'Lava- und Ascheschichten', position: new THREE.Vector3(-1.8, 0.5, 0), pos2D: { x: 30, y: 40 } },
        { id: 'crust', text: 'Erdkruste', position: new THREE.Vector3(2.5, -1.2, 0), pos2D: { x: 80, y: 70 } }
    ],
    explanations: {
        magma: { title: "Magmakammer / Magmareservoir", text: "Willkommen in der Küche des Vulkans! Ganz tief unten sammelt sich das flüssige Gestein – das Magma – und wartet darauf, dass der Druck groß genug für den Ausbruch wird." },
        vent: { title: "Förderschlot / Hauptschlot", text: "Das ist die Hauptstraße des Vulkans! Wie ein riesiger Strohhalm führt dieser Gang von ganz tief unten bis nach ganz oben." },
        crust: { title: "Gesteinsschichten der Erdkruste", text: "Das ist der feste Boden unter unseren Füßen. Er besteht aus vielen verschiedenen Lagen Stein, die schon seit Millionen von Jahren dort liegen." },
        crater: { title: "Krater", text: "Stell dir den Krater wie eine riesige Schüssel ganz oben auf dem Gipfel vor. In dieser Schüssel sammelt sich die glühende Lava, bevor sie den Berg hinunterläuft." },
        ash: { title: "Aschewolke", text: "Hust, hust! Wenn der Vulkan so richtig Schwung hat, pustet er eine riesige Wolke aus Staub und feiner Asche kilometerhoch in den Himmel. Das sieht aus wie dunkler Rauch!" },
        throat: { title: "Vulkanschlund", text: "Das ist der oberste Teil des Halses vom Vulkan. Er sitzt direkt unter dem Krater und ist wie der Rachen eines Drachen!" },
        side_vent: { title: "Seitenschlot", text: "Das ist ein kleinerer Abzweig vom Hauptweg – fast so wie eine Seitenstraße bei einer Autobahn." },
        layer: { title: "Lava- und Ascheschichten", text: "Ein Vulkan wächst wie ein Turm aus bunten Steinen. Jedes Mal, wenn er ausbricht, kommt eine neue Schicht aus abgekühlter Lava und Asche obendrauf." },
        lava_flow: { title: "Lavastrom", text: "Vorsicht, heiß! Sobald das flüssige Gestein aus dem Vulkan fließt, nennen wir es Lava. Sie kriecht wie ein glühender, langsamer Fluss den Hang hinunter." },
        side_eruption: { title: "Seitenöffnung / seitlicher Ausbruch", text: "Manchmal ist der Hauptweg nach oben verstopft. Dann sucht sich die Lava einfach einen kleinen Umweg durch die Seite des Berges." },
        parasitic_cone: { title: "Nebenkrater / Parasitärkrater", text: "Das ist wie ein kleiner Bruder des großen Vulkans. Er wächst an der Seite des Hauptberges und spuckt dort sein eigenes Feuer." },
        sill: { title: "Lagergang", text: "Hier hat sich das flüssige Gestein einfach flach zwischen zwei andere Erdschichten gequetscht und ist dort hart geworden, wie eine Füllung in einem Keks." },
        vent_opening: { title: "Austrittsöffnung / Schlotöffnung", text: "Das ist das 'Tor' nach draußen. Hier oben kommt alles ans Tageslicht, was tief unten im Bauch des Vulkans brodelt." }
    }
};

// --- DOM Elements ---
const canvas = document.getElementById('three-canvas');
const container = document.getElementById('scene-container');
const labelsContainer = document.getElementById('labels-container');
const liteLabelsContainer = document.getElementById('lite-labels-container');
if (perfManager.isLiteMode && labelsContainer) labelsContainer.style.display = 'none'; // Prevent 3D labels from bleeding through
const characterContainer = document.getElementById('character-container');
const characterText = document.getElementById('character-text');
const topicTitle = document.getElementById('topic-title');
const btnEruption = document.getElementById('btn-eruption');
const btnReset = document.getElementById('btn-reset');
const bgVideo = document.getElementById('bg-video');
const bgPlaceholder = document.querySelector('.video-placeholder');

if (bgVideo) bgVideo.playbackRate = 0.75;

// --- Three.js Setup (Conditional) ---
let scene, camera, renderer, controls;

if (!perfManager.isLiteMode) {
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        CONFIG.camera.fov,
        container.offsetWidth / container.offsetHeight,
        CONFIG.camera.near,
        CONFIG.camera.far
    );
    camera.position.set(CONFIG.camera.posX, CONFIG.camera.posY, CONFIG.camera.posZ);

    // Renderer (Adaptive Antialiasing and PixelRatio setup)
    renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: !perfManager.isLowPerf // disable AA early if low perf
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(perfManager.isLowPerf ? 1 : Math.min(window.devicePixelRatio, 2));

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2; // Closer minimum for better inspection
    controls.maxDistance = 50; // Further max for large models
    controls.target.set(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Brighter
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2); // Stronger sun
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffedd0, 2, 20); // Warm fill
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
} else {
    console.log("Three.js initialization skipped: Lite Mode active.");
    // Hide 3D canvas
    canvas.style.display = 'none';
}

// --- Models ---
let particleSystem; // Declare early for animate loop
let volcanoExterior, volcanoInterior;
// Draco Compression Support (Conditional)
const loader = !perfManager.isLiteMode ? new GLTFLoader() : null;

if (loader) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/gltf/');
    loader.setDRACOLoader(dracoLoader);

    // Enable KTX2 and Meshopt support
    const ktx2Loader = new KTX2Loader().setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/');
    loader.setKTX2Loader(ktx2Loader.detectSupport(renderer));
    loader.setMeshoptDecoder(MeshoptDecoder);
}

function fitModelToScene(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Reset position to center logic
    if (model.position) {
        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);
    }

    // Scale adjustment
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 5; // Balanced size
    const scale = targetSize / maxDim;

    model.scale.setScalar(scale);

    console.log(`Model Loaded: Scaled by ${scale} to fit scene.`);
}

// Load Models (Only in 3D Mode)
if (!perfManager.isLiteMode) {
    // Load Exterior
    loader.load('assets/models/volcano_exterior.glb', (gltf) => {
        volcanoExterior = gltf.scene;
        fitModelToScene(volcanoExterior);
        volcanoExterior.position.y = -0.7;
        volcanoExterior.scale.multiplyScalar(1.05); // 5% Larger as requested
        volcanoExterior.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 1;
                child.material.side = THREE.DoubleSide;
            }
        });
        scene.add(volcanoExterior);
    }, undefined, (error) => console.error('Error loading exterior:', error));

    // Load Interior
    loader.load('assets/models/volcano_interior.glb', (gltf) => {
        volcanoInterior = gltf.scene;
        fitModelToScene(volcanoInterior);
        volcanoInterior.position.y = -2.0;
        scene.add(volcanoInterior);
    }, undefined, (error) => console.error('Error loading interior:', error));
} else {
    // Enable Lite layer interaction
    const liteContainer = document.getElementById('lite-container');
    if (liteContainer) liteContainer.classList.add('is-active');
}


// --- Labels System ---
const labelElements = [];

function createLabels() {
    labelsContainer.innerHTML = ''; // Clear existing
    CONFIG.labels.forEach((data) => {
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = data.text;
        div.style.cursor = 'pointer';

        // Initial visibility
        if (data.hidden) {
            div.style.display = 'none';
        }

        // Interaction
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            if (CONFIG.explanations[data.id]) {
                showCharacter(CONFIG.explanations[data.id].title, CONFIG.explanations[data.id].text);
            }
        });

// Add to Lite Container as well if in Lite Mode
        if (perfManager.isLiteMode && liteLabelsContainer) {
            const liteDiv = div.cloneNode(true);
            liteDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                if (CONFIG.explanations[data.id]) {
                    showCharacter(CONFIG.explanations[data.id].title, CONFIG.explanations[data.id].text);
                }
            });
            liteLabelsContainer.appendChild(liteDiv);
            labelItemsLite.push({
                element: liteDiv,
                pos2D: data.pos2D,
                id: data.id
            });
        }

        // Add to 3D Container
        labelsContainer.appendChild(div);

        // Track
        labelElements.push({
            element: div,
            position: data.position,
            id: data.id 
        });
    });
}
const labelItemsLite = [];
createLabels();

function updateLabels() {
    if (perfManager.isLiteMode) {
        // Fix labels in Lite Mode wrapper
        labelItemsLite.forEach((labelItem) => {
            labelItem.element.style.left = `${labelItem.pos2D.x}%`;
            labelItem.element.style.top = `${labelItem.pos2D.y}%`;
        });
        return;
    }

    if (!camera) return;
    
    labelElements.forEach((labelItem) => {
        if (labelItem.element.style.display === 'none') return;

        const tempV = labelItem.position.clone();
        tempV.project(camera);

        const x = (tempV.x * .5 + .5) * container.offsetWidth;
        const y = (tempV.y * -.5 + .5) * container.offsetHeight;

        labelItem.element.style.transform = `translate(-50%, -50%)`;
        labelItem.element.style.left = `${x}px`;
        labelItem.element.style.top = `${y}px`;
    });
}

// Helpers for Visibility
function setLabelVisibility(id, visible) {
    const label = labelElements.find(l => l.id === id);
    if (label) {
        label.element.style.display = visible ? 'block' : 'none';
    }
}


// --- UI Logic ---
function showCharacter(title, text) {
    if (topicTitle) topicTitle.textContent = title;
    characterText.textContent = text;
    characterContainer.classList.remove('hidden');
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (!perfManager.isLiteMode) {
        controls.update();

        // Zoom Transition Logic
        if (volcanoExterior) {
            // Optimization: less frequent traverse logic on low perf devices
            const shouldTraverse = !perfManager.isLowPerf || perfManager.frameCounter % 4 === 0;
            
            if (shouldTraverse) {
                const dist = camera.position.distanceTo(controls.target);

                // Calculate Opacity based on distance
                let opacity = (dist - CONFIG.transition.fadeEnd) / (CONFIG.transition.fadeStart - CONFIG.transition.fadeEnd);
                opacity = Math.max(0, Math.min(1, opacity));

                volcanoExterior.traverse((child) => {
                    if (child.isMesh) {
                        child.material.opacity = opacity;
                        child.material.depthWrite = opacity > 0.5;
                        child.visible = opacity > 0;
                    }
                });
            }
        }

        updateLabels();

        // Animate Particles
        if (particleSystem) particleSystem.update();

        renderer.render(scene, camera);
        
        // Track FPS
        perfManager.update();
    } else {
        // In Lite Mode, just update labels (only needed on resize really, but keeps logic consistent)
        updateLabels();
    }
}

perfManager.startMonitoring();
animate();

// --- Resize Handling ---
window.addEventListener('resize', () => {
    if (!perfManager.isLiteMode) {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
    updateLabels();
});


// --- Click Raycasting (Debug / Advanced Interaction) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

container.addEventListener('click', (event) => {
    if (perfManager.isLiteMode) return; 

    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Only set raycaster if renderer/camera exists
    if (camera) raycaster.setFromCamera(mouse, camera);
});


// --- Eruption Logic ---
let volcanoAsh;
let isErupting = false;

if (!perfManager.isLowPerf && !perfManager.isLiteMode) {
    loader.load('assets/models/volcano_ash.glb', (gltf) => {
        volcanoAsh = gltf.scene;
        fitModelToScene(volcanoAsh);
        volcanoAsh.position.y += 2.1; // Raised as requested
        volcanoAsh.scale.set(0, 0, 0);

        volcanoAsh.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0;
            }
        });

        scene.add(volcanoAsh);
    }, undefined, (error) => {
        console.error('Error loading ash cloud:', error);
    });
}

function triggerEruption() {
    if (isErupting) return;
    isErupting = true;

    // Show Eruption Labels
    setLabelVisibility('ash', true);
    setLabelVisibility('lava_flow', true);

    if (perfManager.isLiteMode) {
        // Correct labels for Lite Mode eruption
        const ashLabel = labelItemsLite.find(l => l.id === 'ash');
        if (ashLabel) ashLabel.element.style.display = 'block';
        
        const flowLabel = labelItemsLite.find(l => l.id === 'lava_flow');
        if (flowLabel) flowLabel.element.style.display = 'block';
        
        showCharacter("Vulkanausbruch!", "Der Vulkan bricht aus! Lavaströme fließen die Hänge hinab.");
        return;
    }

    // Start Particles
    if (particleSystem) particleSystem.startEruption();

    // Ash Cloud Animation
    if (volcanoAsh) {
        const finalScale = 1.5;
        let progress = 0;

        function animateEruption() {
            if (!isErupting) return;

            progress += 0.01;
            const currentScale = Math.min(progress * finalScale, finalScale);
            volcanoAsh.scale.set(currentScale, currentScale, currentScale);
            volcanoAsh.rotation.y += 0.005;

            volcanoAsh.traverse((child) => {
                if (child.isMesh) {
                    child.material.opacity = Math.min(progress * 2, 1);
                }
            });

            if (progress < 1.5) {
                requestAnimationFrame(animateEruption);
            }
        }
        animateEruption();
    }
}

function resetEruption() {
    isErupting = false;

    // Hide Eruption Labels
    setLabelVisibility('ash', false);
    setLabelVisibility('lava_flow', false);

    // Stop Particles
    if (particleSystem) particleSystem.stopEruption();

    // Reset Ash Cloud
    if (volcanoAsh) {
        volcanoAsh.scale.set(0, 0, 0);
        volcanoAsh.traverse((child) => {
            if (child.isMesh) {
                child.material.opacity = 0;
            }
        });
    }

    showCharacter("Reset", "Der Vulkan schläft wieder.");
}


btnEruption.addEventListener('click', () => {
    showCharacter("Vulkanausbruch!", "Achtung! Der Vulkan bricht aus! Asche und Rauch steigen auf.");
    triggerEruption();
});

btnReset.addEventListener('click', () => {
    resetEruption();
});

// Video Toggle
const videoObj = document.getElementById('bg-video');
const videoBtn = document.getElementById('btn-video-toggle');

const pauseSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
const playSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;

if (perfManager.isLowPerf && videoObj) {
    videoObj.pause();
    videoObj.style.display = 'none';
}

if (videoBtn && videoObj && !perfManager.isLiteMode) {
    videoBtn.addEventListener('click', () => {
        if (videoObj.paused) {
            videoObj.play();
            videoBtn.innerHTML = pauseSVG;
        } else {
            videoObj.pause();
            videoBtn.innerHTML = playSVG;
        }
    });
} else if (videoBtn && perfManager.isLiteMode) {
    videoBtn.style.display = 'none'; // Hide video controls in Lite mode
}

// --- Mode Toggle Logic ---
const modeToggle = document.getElementById('mode-toggle');
if (modeToggle) {
    // Sync UI with state
    modeToggle.checked = perfManager.isLiteMode;
    
    modeToggle.addEventListener('change', (e) => {
        const newMode = e.target.checked ? 'lite' : '3d';
        localStorage.setItem('vulkan_mode', newMode);
        
        // Brief delay before reload for visual feedback
        setTimeout(() => {
            window.location.reload();
        }, 300);
    });
}


// --- Particle System Class ---

// Helper: Soft Glow Texture
function createParticleTexture() {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Core
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fade out

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(c);
}

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.active = false;
        this.limit = perfManager.isLowPerf ? 300 : 2000; // Adaptive Max particles
        this.texture = createParticleTexture();

        // Lava Material (Additive for glow)
        this.lavaMaterial = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.3,
            map: this.texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Ash Material (Normal blend for smoke)
        this.ashMaterial = new THREE.PointsMaterial({
            color: 0x222222,
            size: 0.8,
            map: this.texture,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });

        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
    }

    createParticle(type) {
        let p;
        if (type === 'lava') {
            const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
            p = new THREE.Points(geometry, this.lavaMaterial);

            // Random start pos near vent (Raised to crater height)
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.3; // Narrower vent at top
            p.position.set(Math.cos(angle) * r, 1.8, Math.sin(angle) * r); // Start at crater height

            // Velocity: Up + Out
            p.userData = {
                type: 'lava',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5, // Spread
                    Math.random() * 5 + 3,       // Higher ejection force
                    (Math.random() - 0.5) * 1.5
                ),
                gravity: -9.8,
                life: 1.0,
                decay: Math.random() * 0.01 + 0.005
            };
        } else if (type === 'flow') {
            // Lava Flow down the side
            const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
            p = new THREE.Points(geometry, this.lavaMaterial); // Reuse lava material

            // Spawn at crater rim, right side (+X)
            const angleOffset = -0.3;
            const angle = angleOffset + (Math.random() - 0.5) * 0.8;

            const r = 0.7 + Math.random() * 0.1;
            p.position.set(Math.cos(angle) * r, 1.8, Math.sin(angle) * r);

            p.userData = {
                type: 'flow',
                velocity: new THREE.Vector3(
                    Math.cos(angle) * (Math.random() * 0.5 + 0.3),
                    0,
                    Math.sin(angle) * (Math.random() * 0.5 + 0.3)
                ),
                gravity: -1.5,
                life: 1.0,
                decay: Math.random() * 0.005 + 0.002
            };
        } else {
            // Ash
            const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
            p = new THREE.Points(geometry, this.ashMaterial);

            p.position.set(0, 2.5, 0);

            p.userData = {
                type: 'ash',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 1 + 0.5,
                    (Math.random() - 0.5) * 0.5
                ),
                scale: 1.0,
                grow: 1.01,
                life: 1.0,
                decay: 0.003
            };
        }

        this.particleGroup.add(p);
        this.particles.push(p);
    }

    startEruption() {
        this.active = true;
    }

    stopEruption() {
        this.active = false;
        this.clear();
    }

    clear() {
        for (let p of this.particles) {
            this.particleGroup.remove(p);
            p.geometry.dispose();
        }
        this.particles = [];
    }

    update() {
        // Spawn new particles if active
        // Decrease spawn rate for low performance devices
        if (this.active && this.particles.length < this.limit) {
            if (perfManager.isLowPerf) {
                for (let i = 0; i < 2; i++) this.createParticle('lava'); 
                for (let i = 0; i < 2; i++) this.createParticle('flow'); 
                for (let i = 0; i < 1; i++) this.createParticle('ash');
            } else {
                for (let i = 0; i < 5; i++) this.createParticle('lava'); // Explosive pops
                for (let i = 0; i < 8; i++) this.createParticle('flow'); // Dense stream
                for (let i = 0; i < 2; i++) this.createParticle('ash');
            }
        }

        const dt = 0.016; // Fixed timestep approx

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const data = p.userData;

            if (data.type === 'lava') {
                // Physics
                data.velocity.y += data.gravity * dt;
                p.position.addScaledVector(data.velocity, dt);

                // Floor collision (simple)
                if (p.position.y < -3) {
                    data.life = 0; // Kill
                }
                p.scale.setScalar(data.life); // Shrink

            } else if (data.type === 'flow') {
                // Flow Physics: Slide down cone
                p.position.x += data.velocity.x * dt;
                p.position.z += data.velocity.z * dt;

                const r = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);
                const slope = 0.95; // Adjusted slope for closer fit
                let surfaceY = 1.3 - (r - 0.7) * slope; // Lower starting height

                // Surface Roughness
                surfaceY += (Math.random() - 0.5) * 0.1;

                p.position.y = surfaceY;

                // Kill if too low
                if (p.position.y < -3.0) data.life = 0;

                p.scale.setScalar(data.life * 2.0); // Large flow particles

            } else {
                // Ash Physics
                p.position.addScaledVector(data.velocity, dt);

                // Grow
                data.scale *= data.grow;
                p.scale.setScalar(data.scale);

                // Drift
                data.velocity.x += (Math.random() - 0.5) * 0.01;
                data.velocity.z += (Math.random() - 0.5) * 0.01;
            }

            // Life
            data.life -= data.decay;

            if (data.life <= 0) {
                this.particleGroup.remove(p);
                this.particles.splice(i, 1);
                p.geometry.dispose();
            }
        }
    }
}

if (!perfManager.isLiteMode) {
    particleSystem = new ParticleSystem(scene);
}
