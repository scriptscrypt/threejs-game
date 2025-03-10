import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/examples/jsm/controls/OrbitControls.js';

// Game variables
let scene, camera, renderer;
let player, character;
let isGameOver = false;
let raycaster, mouse;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let playerVelocity = new THREE.Vector3();
let playerDirection = new THREE.Vector3();
let clock = new THREE.Clock();

// Mini-map variables
let minimapPlayerIndicator, minimapDirectionIndicator;
let buildingIndicators = [];

// City variables
let currentZone = "Downtown District";
let footstepSound;
let lastFootstepTime = 0;
let footstepInterval = 400; // ms between footstep sounds
let currentFloorMaterial = "concrete"; // default floor material

// Solana city buildings data
const buildings = [
    {
        name: "Solana Shop",
        description: "A high-end tech store featuring the latest Solana-powered devices and merchandise.",
        position: new THREE.Vector3(10, 0, 10),
        color: 0x9945FF,
        website: "https://solana.com/shop",
        zone: "Commercial District",
        type: "commercial",
        height: 8,
        width: 15,
        depth: 12,
        items: [
            { name: "Solana Hardware Wallet", price: "25 SOL", description: "Secure cold storage for your Solana assets" },
            { name: "Solana Developer Kit", price: "50 SOL", description: "Everything you need to build on Solana" },
            { name: "Limited Edition NFT", price: "10 SOL", description: "Exclusive digital collectible only available in-store" }
        ]
    },
    {
        name: "Drift Exchange Tower",
        description: "The headquarters of Drift Protocol, offering perpetual futures trading with up to 20x leverage.",
        position: new THREE.Vector3(20, 0, -20),
        color: 0x00BFFF,
        website: "https://www.drift.trade/",
        zone: "Financial District",
        type: "commercial",
        height: 30,
        width: 10,
        depth: 10,
        items: [
            { name: "Trading Account", price: "5 SOL", description: "Open a trading account with Drift Exchange" },
            { name: "Trading Bot License", price: "15 SOL", description: "Automated trading software for Drift" },
            { name: "VIP Trading Floor Access", price: "10 SOL", description: "Exclusive access to premium trading features" }
        ]
    },
    {
        name: "Jito Validator Complex",
        description: "A high-security facility housing Jito's MEV infrastructure that maximizes validator rewards and improves network performance.",
        position: new THREE.Vector3(-20, 0, -20),
        color: 0xFF6347,
        website: "https://jito.network/",
        zone: "Blockchain District",
        type: "infrastructure",
        height: 15,
        width: 15,
        depth: 15,
        items: [
            { name: "Validator Node Setup", price: "20 SOL", description: "Professional installation of a Jito validator node" },
            { name: "MEV Extraction License", price: "8 SOL", description: "Permission to extract MEV on the Solana network" },
            { name: "Staking Services", price: "3 SOL", description: "Managed staking with Jito validators" }
        ]
    },
    {
        name: "Helius Developer Hub",
        description: "A modern workspace providing developer infrastructure and APIs for building applications on Solana.",
        position: new THREE.Vector3(20, 0, 20),
        color: 0x32CD32,
        website: "https://helius.xyz/",
        zone: "Tech Park",
        type: "commercial",
        height: 20,
        width: 12,
        depth: 12,
        items: [
            { name: "API Subscription", price: "12 SOL", description: "Monthly access to premium Solana APIs" },
            { name: "Developer Workspace", price: "7 SOL", description: "Rent a desk in the Helius Developer Hub" },
            { name: "Dedicated RPC Service", price: "25 SOL", description: "Your own dedicated Solana RPC node" }
        ]
    },
    {
        name: "Jupiter Trading Plaza",
        description: "A bustling marketplace where Jupiter aggregates liquidity, providing the best swap routes across all Solana exchanges.",
        position: new THREE.Vector3(-20, 0, 20),
        color: 0xFFA500,
        website: "https://jup.ag/",
        zone: "Commercial District",
        type: "commercial",
        height: 15,
        width: 20,
        depth: 15,
        items: [
            { name: "Token Swap Service", price: "6 SOL", description: "Premium access to optimized swap routes" },
            { name: "Trading Terminal Rental", price: "14 SOL", description: "Rent a professional trading terminal" },
            { name: "Liquidity Provider License", price: "9 SOL", description: "Become an official Jupiter liquidity provider" }
        ]
    },
    {
        name: "Marinade Staking Center",
        description: "A modern facility where Marinade offers liquid staking services for Solana, allowing users to stake SOL while maintaining liquidity.",
        position: new THREE.Vector3(0, 0, -30),
        color: 0x9370DB,
        website: "https://marinade.finance/",
        zone: "Financial District",
        type: "commercial",
        height: 18,
        width: 14,
        depth: 14,
        items: [
            { name: "Staking Account", price: "4 SOL", description: "Open a liquid staking account with Marinade" },
            { name: "Yield Optimization Service", price: "5 SOL", description: "Professional management of your staking rewards" },
            { name: "mSOL Conversion", price: "2 SOL", description: "Convert your SOL to mSOL for additional benefits" }
        ]
    },
    {
        name: "Pyth Oracle Headquarters",
        description: "The central hub of Pyth Network, a first-party financial oracle network delivering real-time market data to the DeFi ecosystem.",
        position: new THREE.Vector3(0, 0, 30),
        color: 0xFFD700,
        website: "https://pyth.network/",
        zone: "Data District",
        type: "infrastructure",
        height: 25,
        width: 15,
        depth: 15,
        items: [
            { name: "Data Feed Subscription", price: "18 SOL", description: "Access to premium financial data feeds" },
            { name: "Price Prediction Service", price: "22 SOL", description: "AI-powered price prediction for your portfolio" },
            { name: "Oracle Integration Package", price: "11 SOL", description: "Professional integration of Pyth oracles into your dApp" }
        ]
    },
    {
        name: "Central Plaza",
        description: "The heart of Solana City, featuring a magnificent SOL statue and information boards with the latest blockchain news.",
        position: new THREE.Vector3(0, 0, 0),
        color: 0x14F195,
        website: "https://solana.com",
        zone: "Downtown District",
        type: "public",
        height: 5,
        width: 30,
        depth: 30,
        items: [
            { name: "City Tour", price: "1 SOL", description: "Guided tour of Solana City's main attractions" },
            { name: "Information Services", price: "Free", description: "Get the latest updates on Solana ecosystem" },
            { name: "SOL Statue Souvenir", price: "0.5 SOL", description: "Miniature replica of the Central Plaza SOL statue" }
        ]
    },
    {
        name: "Residential Towers",
        description: "Luxury apartments for Solana City residents, with stunning views of the blockchain district.",
        position: new THREE.Vector3(35, 0, 0),
        color: 0x4682B4,
        website: "#",
        zone: "Residential District",
        type: "residential",
        height: 40,
        width: 15,
        depth: 15,
        items: [
            { name: "Studio Apartment", price: "50 SOL/month", description: "Compact living space for individuals" },
            { name: "Two Bedroom Apartment", price: "100 SOL/month", description: "Spacious apartment with city views" },
            { name: "Penthouse Suite", price: "300 SOL/month", description: "Luxury living at the top of Solana City" }
        ]
    },
    {
        name: "NFT Gallery",
        description: "A prestigious art space showcasing the finest NFT collections on Solana.",
        position: new THREE.Vector3(-35, 0, 0),
        color: 0xE42575,
        website: "#",
        zone: "Arts District",
        type: "cultural",
        height: 12,
        width: 25,
        depth: 15,
        items: [
            { name: "Gallery Admission", price: "2 SOL", description: "Access to all current exhibitions" },
            { name: "NFT Minting Service", price: "5 SOL", description: "Create your own NFT with professional assistance" },
            { name: "Private Viewing Room", price: "10 SOL", description: "Exclusive access to rare NFT collections" }
        ]
    }
];

let cityBuildings = [];
let currentBuilding = null;

// DOM elements
const locationInfoElement = document.getElementById('location-info');
const buildingInfoElement = document.getElementById('protocol-info');
const buildingNameElement = buildingInfoElement.querySelector('h2');
const buildingDescElement = buildingInfoElement.querySelector('p');
const visitButtonElement = document.getElementById('visit-button');
const zoneIndicatorElement = document.getElementById('zone-indicator');
const cityInfoPanelElement = document.getElementById('city-info-panel');

// Initialize the game
function init() {
    // Reset game state
    isGameOver = false;
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2b3c); // Dark blue city sky
    
    // Create fog for atmosphere
    scene.fog = new THREE.FogExp2(0x1a2b3c, 0.008);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.7; // Eye level for a person
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Add city lights
    const cityLightColor = 0x14F195; // Solana green
    const cityLight1 = new THREE.PointLight(cityLightColor, 1, 100);
    cityLight1.position.set(30, 20, 30);
    scene.add(cityLight1);
    
    const cityLight2 = new THREE.PointLight(0xE42575, 1, 100); // Solana pink
    cityLight2.position.set(-30, 20, -30);
    scene.add(cityLight2);
    
    const cityLight3 = new THREE.PointLight(0xFFD700, 1, 100); // Gold
    cityLight3.position.set(-30, 20, 30);
    scene.add(cityLight3);
    
    const cityLight4 = new THREE.PointLight(0x00BFFF, 1, 100); // Blue
    cityLight4.position.set(30, 20, -30);
    scene.add(cityLight4);
    
    // Create player (invisible container for camera and character)
    player = new THREE.Object3D();
    player.position.set(0, 0, 0);
    scene.add(player);
    
    // Create character (visible representation of player)
    createCharacter();
    
    // Create city ground
    createCityGround();
    
    // Create skybox
    createSkybox();
    
    // Create city buildings
    createCityBuildings();
    
    // Create roads
    createRoads();
    
    // Create central plaza
    createCentralPlaza();
    
    // Create street furniture (benches, lamp posts, etc.)
    createStreetFurniture();
    
    // Setup raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Initialize footstep sound
    footstepSound = document.getElementById('footstep-sound');
    
    // Initialize mini-map
    initMinimap();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('click', onClick);
    
    // Set up visit button event
    visitButtonElement.addEventListener('click', () => {
        if (currentBuilding) {
            if (currentBuilding.name === "Solana Shop") {
                // Special interaction for Solana Shop
                const currentText = locationInfoElement.textContent;
                locationInfoElement.textContent = "Entering the Solana Shop...";
                
                // Teleport player inside the shop
                const shopPosition = new THREE.Vector3(
                    currentBuilding.position.x,
                    player.position.y,
                    currentBuilding.position.z + 3
                );
                player.position.copy(shopPosition);
                
                // Face the interior
                player.rotation.y = Math.PI;
                
                setTimeout(() => {
                    locationInfoElement.textContent = currentText;
                }, 2000);
            } else {
                // For other buildings, open their website
                window.open(currentBuilding.website, '_blank');
            }
        }
    });
    
    // Show city info panel
    cityInfoPanelElement.style.display = 'block';
    
    // Start animation loop
    animate();
}

// Create character model
function createCharacter() {
    // Create a first-person perspective character (just hands)
    const characterGroup = new THREE.Group();
    
    // Arms and hands will be positioned to appear at the bottom of the screen
    // Left arm
    const leftArmGroup = new THREE.Group();
    
    // Left arm (upper)
    const leftUpperArmGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeometry, armMaterial);
    leftUpperArm.position.set(0, -0.25, 0);
    leftUpperArm.rotation.z = Math.PI / 12;
    leftUpperArm.castShadow = true;
    leftArmGroup.add(leftUpperArm);
    
    // Left arm (lower)
    const leftLowerArmGeometry = new THREE.CylinderGeometry(0.07, 0.06, 0.5, 8);
    const leftLowerArm = new THREE.Mesh(leftLowerArmGeometry, armMaterial);
    leftLowerArm.position.set(0.1, -0.5, 0);
    leftLowerArm.rotation.z = Math.PI / 8;
    leftLowerArm.castShadow = true;
    leftArmGroup.add(leftLowerArm);
    
    // Left hand
    const handGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const leftHand = new THREE.Mesh(handGeometry, handMaterial);
    leftHand.position.set(0.2, -0.75, 0);
    leftHand.scale.set(1, 0.7, 0.5);
    leftHand.castShadow = true;
    leftArmGroup.add(leftHand);
    
    // Left fingers
    const fingerGeometry = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 8);
    const fingerMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    
    // Create 4 fingers for left hand
    for (let i = 0; i < 4; i++) {
        const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        const angleOffset = (i - 1.5) * 0.15;
        finger.position.set(0.25 + Math.sin(angleOffset) * 0.05, -0.85, Math.cos(angleOffset) * 0.05);
        finger.rotation.z = Math.PI / 2 + angleOffset;
        finger.castShadow = true;
        leftArmGroup.add(finger);
    }
    
    // Position left arm group
    leftArmGroup.position.set(-0.3, -0.5, -0.5);
    leftArmGroup.rotation.x = Math.PI / 6;
    characterGroup.add(leftArmGroup);
    
    // Right arm
    const rightArmGroup = new THREE.Group();
    
    // Right arm (upper)
    const rightUpperArmGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeometry, armMaterial);
    rightUpperArm.position.set(0, -0.25, 0);
    rightUpperArm.rotation.z = -Math.PI / 12;
    rightUpperArm.castShadow = true;
    rightArmGroup.add(rightUpperArm);
    
    // Right arm (lower)
    const rightLowerArmGeometry = new THREE.CylinderGeometry(0.07, 0.06, 0.5, 8);
    const rightLowerArm = new THREE.Mesh(rightLowerArmGeometry, armMaterial);
    rightLowerArm.position.set(-0.1, -0.5, 0);
    rightLowerArm.rotation.z = -Math.PI / 8;
    rightLowerArm.castShadow = true;
    rightArmGroup.add(rightLowerArm);
    
    // Right hand
    const rightHand = new THREE.Mesh(handGeometry, handMaterial);
    rightHand.position.set(-0.2, -0.75, 0);
    rightHand.scale.set(1, 0.7, 0.5);
    rightHand.castShadow = true;
    rightArmGroup.add(rightHand);
    
    // Right fingers
    for (let i = 0; i < 4; i++) {
        const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        const angleOffset = (i - 1.5) * 0.15;
        finger.position.set(-0.25 - Math.sin(angleOffset) * 0.05, -0.85, Math.cos(angleOffset) * 0.05);
        finger.rotation.z = -Math.PI / 2 - angleOffset;
        finger.castShadow = true;
        rightArmGroup.add(finger);
    }
    
    // Position right arm group
    rightArmGroup.position.set(0.3, -0.5, -0.5);
    rightArmGroup.rotation.x = Math.PI / 6;
    characterGroup.add(rightArmGroup);
    
    // Add character to player
    player.add(characterGroup);
    character = characterGroup;
    
    // Add camera to player
    player.add(camera);
}

// Create city ground
function createCityGround() {
    // Create city base
    const groundSize = 200;
    const floorGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333, // Dark asphalt color
        roughness: 0.8,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Add grid pattern to represent city blocks
    const gridSize = 20;
    const gridLineWidth = 0.2;
    const gridMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.7,
        metalness: 0.4
    });
    
    // Create horizontal grid lines
    for (let i = -groundSize/2; i <= groundSize/2; i += gridSize) {
        if (i === 0) continue; // Skip center lines as they'll be main roads
        
        const gridLineGeometry = new THREE.PlaneGeometry(groundSize, gridLineWidth);
        const gridLine = new THREE.Mesh(gridLineGeometry, gridMaterial);
        gridLine.rotation.x = -Math.PI / 2;
        gridLine.position.set(0, 0.01, i);
        gridLine.receiveShadow = true;
        scene.add(gridLine);
    }
    
    // Create vertical grid lines
    for (let i = -groundSize/2; i <= groundSize/2; i += gridSize) {
        if (i === 0) continue; // Skip center lines as they'll be main roads
        
        const gridLineGeometry = new THREE.PlaneGeometry(gridLineWidth, groundSize);
        const gridLine = new THREE.Mesh(gridLineGeometry, gridMaterial);
        gridLine.rotation.x = -Math.PI / 2;
        gridLine.position.set(i, 0.01, 0);
        gridLine.receiveShadow = true;
        scene.add(gridLine);
    }
    
    // Add some variation to the ground with scattered details
    for (let i = 0; i < 200; i++) {
        const detailSize = 0.5 + Math.random() * 2;
        const detailGeometry = new THREE.PlaneGeometry(detailSize, detailSize);
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222 + Math.random() * 0x111111,
            roughness: 0.9,
            metalness: 0.2
        });
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        detail.rotation.x = -Math.PI / 2;
        detail.position.set(
            (Math.random() - 0.5) * groundSize,
            0.011,
            (Math.random() - 0.5) * groundSize
        );
        detail.receiveShadow = true;
        scene.add(detail);
    }
}

// Create skybox
function createSkybox() {
    // Implement skybox creation logic here
}

// Create city buildings
function createCityBuildings() {
    buildings.forEach(building => {
        // Create building base
        const buildingGroup = new THREE.Group();
        
        // Stall platform
        const platformGeometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
        const platformMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.9,
            metalness: 0.1
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 0.5;
        platform.receiveShadow = true;
        buildingGroup.add(platform);
        
        // Add decorative platform border
        const borderGeometry = new THREE.BoxGeometry(building.width + 0.4, 0.2, building.depth + 0.4);
        const borderMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.7,
            metalness: 0.3,
            emissive: building.color,
            emissiveIntensity: 0.2
        });
        const platformBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        platformBorder.position.y = 0.1;
        platformBorder.receiveShadow = true;
        buildingGroup.add(platformBorder);
        
        // Add carpet/rug with Solana pattern
        const carpetGeometry = new THREE.CircleGeometry(3, 32);
        const carpetMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.9,
            metalness: 0.1
        });
        const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
        carpet.rotation.x = -Math.PI / 2;
        carpet.position.y = 0.51;
        carpet.receiveShadow = true;
        buildingGroup.add(carpet);
        
        // Add Solana logo pattern on carpet
        const solanaPatternGeometry = new THREE.RingGeometry(1.5, 1.8, 32);
        const solanaPatternMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.7,
            metalness: 0.3,
            side: THREE.DoubleSide
        });
        const solanaPattern = new THREE.Mesh(solanaPatternGeometry, solanaPatternMaterial);
        solanaPattern.rotation.x = -Math.PI / 2;
        solanaPattern.position.y = 0.52;
        solanaPattern.receiveShadow = true;
        buildingGroup.add(solanaPattern);
        
        // Circus-themed stall counter
        const counterGeometry = new THREE.BoxGeometry(5.5, 1.2, 1.8);
        const counterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xDEB887,
            roughness: 0.7,
            metalness: 0.2
        });
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.set(0, 1.1, 1.5);
        counter.castShadow = true;
        counter.receiveShadow = true;
        buildingGroup.add(counter);
        
        // Add wood grain texture to counter
        const counterDetailGeometry = new THREE.BoxGeometry(5.5, 1.2, 0.05);
        const counterDetailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA0522D,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Front panel of counter
        const counterFrontPanel = new THREE.Mesh(counterDetailGeometry, counterDetailMaterial);
        counterFrontPanel.position.set(0, 1.1, 2.4);
        counterFrontPanel.castShadow = true;
        buildingGroup.add(counterFrontPanel);
        
        // Add decorative trim to counter
        const trimGeometry = new THREE.BoxGeometry(5.7, 0.1, 2);
        const trimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5D4037,
            roughness: 0.7,
            metalness: 0.3
        });
        const counterTrim = new THREE.Mesh(trimGeometry, trimMaterial);
        counterTrim.position.set(0, 0.55, 1.5);
        counterTrim.castShadow = true;
        buildingGroup.add(counterTrim);
        
        // Counter top decoration
        const counterTopGeometry = new THREE.BoxGeometry(5.7, 0.1, 2);
        const counterTopMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.5,
            metalness: 0.5
        });
        const counterTop = new THREE.Mesh(counterTopGeometry, counterTopMaterial);
        counterTop.position.set(0, 1.7, 1.5);
        counterTop.castShadow = true;
        counterTop.receiveShadow = true;
        buildingGroup.add(counterTop);
        
        // Add decorative cloth/banner hanging from counter
        const clothGeometry = new THREE.PlaneGeometry(5, 0.8);
        const clothMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const counterCloth = new THREE.Mesh(clothGeometry, clothMaterial);
        counterCloth.position.set(0, 0.9, 2.35);
        counterCloth.castShadow = true;
        buildingGroup.add(counterCloth);
        
        // Add protocol name to the cloth banner
        const bannerDetailGeometry = new THREE.PlaneGeometry(4, 0.5);
        const bannerDetailMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const bannerDetail = new THREE.Mesh(bannerDetailGeometry, bannerDetailMaterial);
        bannerDetail.position.set(0, 0.9, 2.36);
        bannerDetail.castShadow = true;
        buildingGroup.add(bannerDetail);
        
        // Circus-themed stall roof (striped tent)
        const roofGeometry = new THREE.ConeGeometry(4.5, 3.5, 16);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.7,
            metalness: 0.3
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 5.5;
        roof.castShadow = true;
        buildingGroup.add(roof);
        
        // Roof stripes
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const stripeGeometry = new THREE.PlaneGeometry(0.5, 3.5);
            const stripeMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            
            // Position stripe on the cone
            const radius = 2.25; // Half the base diameter of the cone
            stripe.position.set(
                Math.cos(angle) * radius,
                4, // Middle of the cone height
                Math.sin(angle) * radius
            );
            
            // Rotate to face center and tilt to match cone slope
            stripe.lookAt(new THREE.Vector3(0, 5.5, 0));
            stripe.rotation.x += Math.PI / 2;
            
            roof.add(stripe);
        }
        
        // Add decorative roof trim
        const roofTrimGeometry = new THREE.TorusGeometry(4.5, 0.2, 16, 32);
        const roofTrimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            roughness: 0.3,
            metalness: 0.7,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        const roofTrim = new THREE.Mesh(roofTrimGeometry, roofTrimMaterial);
        roofTrim.position.y = 3.8;
        roofTrim.rotation.x = Math.PI / 2;
        roofTrim.castShadow = true;
        buildingGroup.add(roofTrim);
        
        // Roof flag
        const flagPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const flagPoleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            roughness: 0.3,
            metalness: 0.8
        });
        const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
        flagPole.position.y = 7.5;
        flagPole.castShadow = true;
        buildingGroup.add(flagPole);
        
        const flagGeometry = new THREE.PlaneGeometry(1, 0.5);
        const flagMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            side: THREE.DoubleSide,
            emissive: building.color,
            emissiveIntensity: 0.3
        });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(0.5, 8.2, 0);
        // Add some wave animation to the flag
        flag.rotation.y = Math.PI / 2;
        flag.rotation.x = Math.PI / 12 * Math.sin(Date.now() * 0.001);
        flag.castShadow = true;
        buildingGroup.add(flag);
        
        // Stall back wall
        const backWallGeometry = new THREE.BoxGeometry(6, 4, 0.2);
        const backWallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf0f0f0,
            roughness: 0.8,
            metalness: 0.1
        });
        const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
        backWall.position.set(0, 2.5, -2.5);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        buildingGroup.add(backWall);
        
        // Add decorative patterns to back wall
        const wallPatternGeometry = new THREE.PlaneGeometry(5.5, 3.5);
        const wallPatternMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF5F5F5,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        const wallPattern = new THREE.Mesh(wallPatternGeometry, wallPatternMaterial);
        wallPattern.position.set(0, 2.5, -2.4);
        wallPattern.castShadow = true;
        buildingGroup.add(wallPattern);
        
        // Add protocol-themed decorative elements to back wall
        const decorSize = 0.5;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const decorGeometry = new THREE.CircleGeometry(decorSize, 16);
                const decorMaterial = new THREE.MeshStandardMaterial({ 
                    color: building.color,
                    roughness: 0.5,
                    metalness: 0.5,
                    emissive: building.color,
                    emissiveIntensity: 0.2
                });
                const decor = new THREE.Mesh(decorGeometry, decorMaterial);
                decor.position.set(-2 + i * 2, 1.5 + j * 2, -2.39);
                decor.castShadow = true;
                buildingGroup.add(decor);
            }
        }
        
        // Stall side walls
        const sideWallGeometry = new THREE.BoxGeometry(0.2, 4, 5);
        
        const leftWall = new THREE.Mesh(sideWallGeometry, backWallMaterial);
        leftWall.position.set(-3, 2.5, -0.5);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        buildingGroup.add(leftWall);
        
        const rightWall = new THREE.Mesh(sideWallGeometry, backWallMaterial);
        rightWall.position.set(3, 2.5, -0.5);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        buildingGroup.add(rightWall);
        
        // Add decorative trim to walls
        const wallTrimGeometry = new THREE.BoxGeometry(6.4, 0.2, 0.1);
        const wallTrimMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.5,
            metalness: 0.5
        });
        
        // Top trim for back wall
        const backWallTopTrim = new THREE.Mesh(wallTrimGeometry, wallTrimMaterial);
        backWallTopTrim.position.set(0, 4.5, -2.5);
        backWallTopTrim.castShadow = true;
        buildingGroup.add(backWallTopTrim);
        
        // Bottom trim for back wall
        const backWallBottomTrim = new THREE.Mesh(wallTrimGeometry, wallTrimMaterial);
        backWallBottomTrim.position.set(0, 0.5, -2.5);
        backWallBottomTrim.castShadow = true;
        buildingGroup.add(backWallBottomTrim);
        
        // Side wall trims
        const sideWallTrimGeometry = new THREE.BoxGeometry(0.1, 0.2, 5);
        
        // Left wall trims
        const leftWallTopTrim = new THREE.Mesh(sideWallTrimGeometry, wallTrimMaterial);
        leftWallTopTrim.position.set(-3, 4.5, -0.5);
        leftWallTopTrim.castShadow = true;
        buildingGroup.add(leftWallTopTrim);
        
        const leftWallBottomTrim = new THREE.Mesh(sideWallTrimGeometry, wallTrimMaterial);
        leftWallBottomTrim.position.set(-3, 0.5, -0.5);
        leftWallBottomTrim.castShadow = true;
        buildingGroup.add(leftWallBottomTrim);
        
        // Right wall trims
        const rightWallTopTrim = new THREE.Mesh(sideWallTrimGeometry, wallTrimMaterial);
        rightWallTopTrim.position.set(3, 4.5, -0.5);
        rightWallTopTrim.castShadow = true;
        buildingGroup.add(rightWallTopTrim);
        
        const rightWallBottomTrim = new THREE.Mesh(sideWallTrimGeometry, wallTrimMaterial);
        rightWallBottomTrim.position.set(3, 0.5, -0.5);
        rightWallBottomTrim.castShadow = true;
        buildingGroup.add(rightWallBottomTrim);
        
        // Protocol sign
        const signGeometry = new THREE.PlaneGeometry(5, 1.2);
        const signMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 4, -2.4);
        sign.castShadow = true;
        buildingGroup.add(sign);
        
        // Add sign border
        const signBorderGeometry = new THREE.BoxGeometry(5.2, 1.4, 0.05);
        const signBorderMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.5,
            metalness: 0.5,
            emissive: building.color,
            emissiveIntensity: 0.3
        });
        const signBorder = new THREE.Mesh(signBorderGeometry, signBorderMaterial);
        signBorder.position.set(0, 4, -2.45);
        signBorder.castShadow = true;
        buildingGroup.add(signBorder);
        
        // Protocol logo (simplified as a colored sphere)
        const logoGeometry = new THREE.SphereGeometry(0.6, 24, 24);
        const logoMaterial = new THREE.MeshStandardMaterial({ 
            color: building.color,
            roughness: 0.3,
            metalness: 0.7,
            emissive: building.color,
            emissiveIntensity: 0.7
        });
        const logo = new THREE.Mesh(logoGeometry, logoMaterial);
        logo.position.set(0, 4, -2.3);
        logo.castShadow = true;
        buildingGroup.add(logo);
        
        // Add animated glow effect to logo
        const glowGeometry = new THREE.SphereGeometry(0.7, 24, 24);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: building.color,
            transparent: true,
            opacity: 0.3
        });
        const logoGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        logoGlow.position.copy(logo.position);
        logoGlow.userData.initialScale = 1;
        buildingGroup.add(logoGlow);
        
        // Add logo animation
        logo.userData.rotationSpeed = 0.005;
        logoGlow.userData.pulseSpeed = 0.003;
        
        // Create shop items display
        if (building.items && building.items.length > 0) {
            // Display items on the counter
            building.items.forEach((item, index) => {
                // Item base (like a small box or display stand)
                const itemBaseGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.1, 16);
                const itemBaseMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x333333,
                    roughness: 0.5,
                    metalness: 0.5
                });
                const itemBase = new THREE.Mesh(itemBaseGeometry, itemBaseMaterial);
                
                // Position items along the counter
                const xPos = (index - 1) * 1.5;
                itemBase.position.set(xPos, 1.75, 1.5);
                buildingGroup.add(itemBase);
                
                // Create a representative item object
                // Different geometry for each item type
                let itemGeometry;
                switch (index % 3) {
                    case 0:
                        // Book/guide
                        itemGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.8);
                        break;
                    case 1:
                        // Tool/device
                        itemGeometry = new THREE.DodecahedronGeometry(0.3, 1);
                        break;
                    case 2:
                        // Certificate/token
                        itemGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
                        break;
                }
                
                const itemMaterial = new THREE.MeshStandardMaterial({ 
                    color: new THREE.Color(building.color).offsetHSL(0.1 * index, 0, 0),
                    roughness: 0.4,
                    metalness: 0.6,
                    emissive: building.color,
                    emissiveIntensity: 0.4
                });
                
                const itemMesh = new THREE.Mesh(itemGeometry, itemMaterial);
                itemMesh.position.set(xPos, 2, 1.5);
                // Add rotation animation to items
                itemMesh.userData.rotationAxis = new THREE.Vector3(0, 1, 0).normalize();
                itemMesh.userData.rotationSpeed = 0.01 + Math.random() * 0.01;
                itemMesh.userData.floatSpeed = 0.001 + Math.random() * 0.001;
                itemMesh.userData.floatHeight = 0.1 + Math.random() * 0.1;
                itemMesh.userData.initialY = 2;
                itemMesh.castShadow = true;
                itemMesh.userData.item = item;
                buildingGroup.add(itemMesh);
                
                // Add a small price tag
                const priceTagGeometry = new THREE.PlaneGeometry(0.7, 0.3);
                const priceTagMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xFFFFFF,
                    side: THREE.DoubleSide
                });
                const priceTag = new THREE.Mesh(priceTagGeometry, priceTagMaterial);
                priceTag.position.set(xPos, 1.85, 2.1);
                priceTag.rotation.x = -Math.PI / 4;
                buildingGroup.add(priceTag);
            });
        }
        
        // Add decorative circus elements
        // Pennant flags
        for (let i = 0; i < 8; i++) {
            const pennantGeometry = new THREE.ConeGeometry(0.2, 0.5, 3);
            const pennantMaterial = new THREE.MeshStandardMaterial({ 
                color: i % 2 === 0 ? building.color : 0xFFFFFF,
                roughness: 0.7,
                metalness: 0.3
            });
            const pennant = new THREE.Mesh(pennantGeometry, pennantMaterial);
            pennant.position.set(-3.5 + i, 4.7, -2.4);
            pennant.rotation.z = Math.PI;
            pennant.castShadow = true;
            buildingGroup.add(pennant);
        }
        
        // Add string for pennants
        const stringGeometry = new THREE.CylinderGeometry(0.01, 0.01, 8, 8);
        const stringMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.set(0, 4.7, 1.5);
        buildingGroup.add(string);
        
        // Position the stall
        buildingGroup.position.copy(building.position);
        
        // Make the stall face the center
        buildingGroup.lookAt(new THREE.Vector3(0, 0, 0));
        
        // Add protocol data to the stall
        buildingGroup.userData.protocol = building;
        
        // Add to scene and protocol stalls array
        scene.add(buildingGroup);
        cityBuildings.push(buildingGroup);
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Rotate player based on mouse movement (horizontal only)
    player.rotation.y -= event.movementX * 0.002;
    
    // Limit vertical camera rotation
    const verticalRotation = camera.rotation.x - event.movementY * 0.002;
    camera.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, verticalRotation));
}

// Handle click
function onClick() {
    if (currentBuilding) {
        if (currentBuilding.name === "Solana Shop") {
            // Special interaction for Solana Shop
            const currentText = locationInfoElement.textContent;
            locationInfoElement.textContent = "Entering the Solana Shop...";
            
            // Teleport player inside the shop
            const shopPosition = new THREE.Vector3(
                currentBuilding.position.x,
                player.position.y,
                currentBuilding.position.z + 3
            );
            player.position.copy(shopPosition);
            
            // Face the interior
            player.rotation.y = Math.PI;
            
            setTimeout(() => {
                locationInfoElement.textContent = currentText;
            }, 2000);
        } else {
            // For other buildings, open their website
            window.open(currentBuilding.website, '_blank');
        }
    }
}

// Handle key down
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = true;
            break;
    }
}

// Handle key up
function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = false;
            break;
    }
}

// Update player movement
function updatePlayerMovement(delta) {
    // Calculate movement direction
    playerDirection.z = Number(moveForward) - Number(moveBackward);
    playerDirection.x = Number(moveRight) - Number(moveLeft);
    playerDirection.normalize();
    
    // Apply movement to velocity
    const speed = 5;
    if (moveForward || moveBackward) playerVelocity.z = -playerDirection.z * speed * delta;
    if (moveLeft || moveRight) playerVelocity.x = -playerDirection.x * speed * delta;
    
    // Apply rotation to movement direction
    playerVelocity.applyQuaternion(player.quaternion);
    
    // Update player position
    player.position.add(playerVelocity);
    
    // Limit player movement to circus area
    const distanceFromCenter = Math.sqrt(
        player.position.x * player.position.x + 
        player.position.z * player.position.z
    );
    
    if (distanceFromCenter > 45) {
        const angle = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(angle) * 45;
        player.position.z = Math.sin(angle) * 45;
    }
    
    // Reset velocity
    playerVelocity.set(0, 0, 0);
    
    // Animate hands while walking
    if (moveForward || moveBackward || moveLeft || moveRight) {
        // Get left and right arm groups
        const leftArmGroup = character.children[0];
        const rightArmGroup = character.children[1];
        
        // Bobbing motion
        const bobAmount = Math.sin(Date.now() * 0.01) * 0.05;
        
        // Swinging motion
        const swingAmount = Math.sin(Date.now() * 0.01) * 0.1;
        
        // Apply animations to arm groups
        if (leftArmGroup && rightArmGroup) {
            // Vertical bobbing
            leftArmGroup.position.y = -0.5 + bobAmount;
            rightArmGroup.position.y = -0.5 - bobAmount;
            
            // Forward/backward swinging
            leftArmGroup.rotation.x = Math.PI / 6 + swingAmount;
            rightArmGroup.rotation.x = Math.PI / 6 - swingAmount;
            
            // Slight side-to-side motion
            leftArmGroup.rotation.z = Math.PI / 30 * Math.sin(Date.now() * 0.008);
            rightArmGroup.rotation.z = -Math.PI / 30 * Math.sin(Date.now() * 0.008);
        }
    } else {
        // Reset hand positions when not moving
        const leftArmGroup = character.children[0];
        const rightArmGroup = character.children[1];
        
        if (leftArmGroup && rightArmGroup) {
            leftArmGroup.position.y = -0.5;
            rightArmGroup.position.y = -0.5;
            leftArmGroup.rotation.x = Math.PI / 6;
            rightArmGroup.rotation.x = Math.PI / 6;
            leftArmGroup.rotation.z = 0;
            rightArmGroup.rotation.z = 0;
        }
    }
}

// Check for protocol proximity
function checkProtocolProximity() {
    let nearestBuilding = null;
    let minDistance = 5; // Minimum distance to interact
    
    cityBuildings.forEach(building => {
        const distance = player.position.distanceTo(building.position);
        
        if (distance < minDistance) {
            nearestBuilding = building.userData.protocol;
            minDistance = distance;
        }
    });
    
    // Update UI based on proximity
    if (nearestBuilding !== currentBuilding) {
        currentBuilding = nearestBuilding;
        
        if (currentBuilding) {
            // Show building info
            locationInfoElement.textContent = `Near: ${currentBuilding.name}`;
            buildingNameElement.textContent = currentBuilding.name;
            buildingDescElement.textContent = currentBuilding.description;
            
            // Update shop items
            const shopItemsContainer = document.getElementById('shop-items');
            shopItemsContainer.innerHTML = ''; // Clear previous items
            
            if (currentBuilding.items && currentBuilding.items.length > 0) {
                // Create and add shop items
                currentBuilding.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'shop-item';
                    
                    const nameElement = document.createElement('h3');
                    nameElement.textContent = item.name;
                    itemElement.appendChild(nameElement);
                    
                    const descElement = document.createElement('p');
                    descElement.textContent = item.description;
                    itemElement.appendChild(descElement);
                    
                    const priceElement = document.createElement('p');
                    priceElement.className = 'price';
                    priceElement.textContent = item.price;
                    itemElement.appendChild(priceElement);
                    
                    // Add click event to "purchase" item (just a visual effect for now)
                    itemElement.addEventListener('click', () => {
                        // Flash effect on click
                        itemElement.style.backgroundColor = 'rgba(20, 241, 149, 0.5)';
                        setTimeout(() => {
                            itemElement.style.backgroundColor = 'rgba(153, 69, 255, 0.2)';
                        }, 300);
                        
                        // Show purchase message
                        const currentText = locationInfoElement.textContent;
                        locationInfoElement.textContent = `Purchased: ${item.name}`;
                        setTimeout(() => {
                            locationInfoElement.textContent = currentText;
                        }, 2000);
                    });
                    
                    shopItemsContainer.appendChild(itemElement);
                });
                
                document.querySelector('.shop-title').style.display = 'block';
            } else {
                document.querySelector('.shop-title').style.display = 'none';
            }
            
            buildingInfoElement.style.display = 'block';
        } else {
            // Hide building info
            locationInfoElement.textContent = 'Exploring Solana City';
            buildingInfoElement.style.display = 'none';
        }
    }
}

// Initialize mini-map
function initMinimap() {
    // Get mini-map elements
    const minimapContainer = document.getElementById('minimap');
    minimapPlayerIndicator = document.querySelector('.player-indicator');
    minimapDirectionIndicator = document.querySelector('.direction-indicator');
    
    // Clear any existing building indicators
    buildingIndicators.forEach(indicator => {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    });
    buildingIndicators = [];
    
    // Create building indicators on the mini-map
    buildings.forEach(building => {
        const indicator = document.createElement('div');
        indicator.className = 'building-indicator';
        minimapContainer.appendChild(indicator);
        buildingIndicators.push(indicator);
    });
}

// Update mini-map
function updateMinimap() {
    // Mini-map dimensions
    const mapSize = 150;
    const mapRadius = mapSize / 2;
    const worldRadius = 50; // Radius of the playable area
    
    // Update player position on mini-map
    const playerX = player.position.x;
    const playerZ = player.position.z;
    
    // Convert world coordinates to mini-map coordinates
    const minimapX = (playerX / worldRadius) * mapRadius + mapRadius;
    const minimapZ = (playerZ / worldRadius) * mapRadius + mapRadius;
    
    // Update player indicator position
    minimapPlayerIndicator.style.left = `${minimapX}px`;
    minimapPlayerIndicator.style.top = `${minimapZ}px`;
    
    // Update direction indicator
    const directionX = minimapX + Math.sin(player.rotation.y) * 10;
    const directionZ = minimapZ - Math.cos(player.rotation.y) * 10;
    
    minimapDirectionIndicator.style.left = `${minimapX}px`;
    minimapDirectionIndicator.style.top = `${minimapZ}px`;
    minimapDirectionIndicator.style.transform = `translate(-50%, -100%) rotate(${player.rotation.y}rad)`;
    
    // Update building indicators
    buildings.forEach((building, index) => {
        if (index < buildingIndicators.length) {
            const indicator = buildingIndicators[index];
            const buildingX = (building.position.x / worldRadius) * mapRadius + mapRadius;
            const buildingZ = (building.position.z / worldRadius) * mapRadius + mapRadius;
            
            indicator.style.left = `${buildingX}px`;
            indicator.style.top = `${buildingZ}px`;
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!isGameOver) {
        const delta = clock.getDelta();
        
        // Update player movement
        updatePlayerMovement(delta);
        
        // Check for protocol proximity
        checkProtocolProximity();
        
        // Update mini-map
        updateMinimap();
    }
    
    renderer.render(scene, camera);
}

// Start the game
init(); 