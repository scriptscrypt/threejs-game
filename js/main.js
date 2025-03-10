import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/examples/jsm/controls/OrbitControls.js';

// Game variables
let scene, camera, renderer, controls;
let player, gun, bullets = [], targets = [], planets = [];
let score = 0;
let health = 100;
let isGameOver = false;
let raycaster, mouse;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let playerVelocity = new THREE.Vector3();
let playerDirection = new THREE.Vector3();
let clock = new THREE.Clock();

// Gun variables
let currentGun = 'assault';
let fireMode = 'auto'; // 'single', 'burst', 'auto'
let isShooting = false;
let canShoot = true;
let recoilAmount = 0;
let maxRecoil = 0.05;
let recoilRecovery = 0.005;
let bulletSpread = 0.02;
let ammo = 30;
let maxAmmo = 30;
let totalAmmo = 120;
let isReloading = false;
let burstCount = 0;
let burstMax = 3;
let fireRate = 100; // milliseconds between shots
let lastShotTime = 0;
let hitMarkers = [];

// DOM elements
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart');
const weaponInfoElement = document.getElementById('weapon-info');
const ammoElement = document.createElement('div');
ammoElement.id = 'ammo';
ammoElement.style.position = 'absolute';
ammoElement.style.bottom = '10px';
ammoElement.style.right = '10px';
ammoElement.style.color = 'white';
ammoElement.style.fontSize = '24px';
document.body.appendChild(ammoElement);

// Gun definitions
const guns = {
    pistol: {
        name: 'Pistol',
        damage: 25,
        fireRate: 300,
        recoil: 0.03,
        recovery: 0.01,
        spread: 0.01,
        ammo: 12,
        maxAmmo: 12,
        totalAmmo: 60,
        reloadTime: 1000,
        fireMode: 'single',
        model: null
    },
    assault: {
        name: 'Assault Rifle',
        damage: 15,
        fireRate: 100,
        recoil: 0.05,
        recovery: 0.005,
        spread: 0.02,
        ammo: 30,
        maxAmmo: 30,
        totalAmmo: 120,
        reloadTime: 2000,
        fireMode: 'auto',
        model: null
    },
    shotgun: {
        name: 'Shotgun',
        damage: 10,
        fireRate: 800,
        recoil: 0.1,
        recovery: 0.02,
        spread: 0.1,
        ammo: 8,
        maxAmmo: 8,
        totalAmmo: 32,
        reloadTime: 2500,
        fireMode: 'single',
        pellets: 8,
        model: null
    }
};

// Initialize the game
function init() {
    // Reset game state
    score = 0;
    health = 100;
    isGameOver = false;
    bullets = [];
    targets = [];
    planets = [];
    
    // Reset gun state
    currentGun = 'assault';
    fireMode = guns[currentGun].fireMode;
    ammo = guns[currentGun].ammo;
    maxAmmo = guns[currentGun].maxAmmo;
    totalAmmo = guns[currentGun].totalAmmo;
    isReloading = false;
    
    // Update UI
    scoreElement.textContent = `Score: ${score}`;
    healthElement.textContent = `Health: ${health}`;
    updateAmmoDisplay();
    updateWeaponInfoDisplay();
    gameOverElement.style.display = 'none';
    restartButton.style.display = 'none';
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = createStarBackground();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create player (invisible container for camera and gun)
    player = new THREE.Object3D();
    player.position.set(0, 0, 0);
    scene.add(player);
    
    // Create gun
    createGun();
    
    // Create planets
    createPlanets(6);
    
    // Setup raycaster for shooting
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    // Create targets
    createTargets(10);
    
    // Start animation loop
    animate();
}

// Update ammo display
function updateAmmoDisplay() {
    ammoElement.textContent = `${ammo} / ${totalAmmo}`;
    
    // Change color based on ammo level
    if (ammo === 0) {
        ammoElement.style.color = 'red';
    } else if (ammo <= maxAmmo * 0.3) {
        ammoElement.style.color = 'orange';
    } else {
        ammoElement.style.color = 'white';
    }
}

// Update weapon info display
function updateWeaponInfoDisplay() {
    weaponInfoElement.textContent = `${guns[currentGun].name} | ${fireMode.charAt(0).toUpperCase() + fireMode.slice(1)}`;
}

// Create star background
function createStarBackground() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false
    });
    
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    
    // Create a cube texture for the background
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const cubeTexture = cubeTextureLoader.load([
        createStarCanvas(),
        createStarCanvas(),
        createStarCanvas(),
        createStarCanvas(),
        createStarCanvas(),
        createStarCanvas()
    ]);
    
    scene.add(stars);
    
    return cubeTexture;
}

// Create a canvas with stars for the background
function createStarCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.fillStyle = '#000020';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2;
        const hue = Math.random() * 360;
        
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fillStyle = 'hsl(' + hue + ', 50%, 80%)';
        context.fill();
    }
    
    return canvas.toDataURL();
}

// Create gun model
function createGun() {
    // Gun body
    const gunBody = new THREE.Group();
    
    // Main body (rectangle)
    const bodyGeometry = new THREE.BoxGeometry(0.2, 0.3, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.z = -0.5;
    gunBody.add(body);
    
    // Barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16);
    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -1.1;
    gunBody.add(barrel);
    
    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.2);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.35;
    handle.position.z = -0.4;
    gunBody.add(handle);
    
    // Sight
    const sightGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.05);
    const sightMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sight = new THREE.Mesh(sightGeometry, sightMaterial);
    sight.position.y = 0.2;
    sight.position.z = -0.2;
    gunBody.add(sight);
    
    // Magazine
    const magGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.2);
    const magMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const magazine = new THREE.Mesh(magGeometry, magMaterial);
    magazine.position.y = -0.3;
    magazine.position.z = -0.6;
    gunBody.add(magazine);
    
    // Position the gun in front of the camera
    gunBody.position.set(0.3, -0.3, -0.5);
    
    // Store original position for recoil
    gunBody.userData.originalPosition = gunBody.position.clone();
    
    // Add gun to player
    player.add(gunBody);
    gun = gunBody;
    
    // Add camera to player
    player.add(camera);
    
    // Store gun models
    guns.assault.model = gunBody;
}

// Create planets
function createPlanets(count) {
    const planetTextures = [
        { color: 0xff9933, emissive: 0x220000 }, // Mars-like
        { color: 0x99ccff, emissive: 0x001133 }, // Earth-like
        { color: 0xffcc99, emissive: 0x332200 }, // Venus-like
        { color: 0xffff99, emissive: 0x333300 }, // Saturn-like
        { color: 0x99ff99, emissive: 0x003300 }, // Alien planet
        { color: 0xcc99ff, emissive: 0x220033 }  // Purple planet
    ];
    
    for (let i = 0; i < count; i++) {
        // Random size
        const radius = 5 + Math.random() * 15;
        
        // Create planet geometry
        const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
        
        // Choose a random texture
        const textureIndex = Math.floor(Math.random() * planetTextures.length);
        const planetMaterial = new THREE.MeshStandardMaterial({
            color: planetTextures[textureIndex].color,
            emissive: planetTextures[textureIndex].emissive,
            roughness: 0.7,
            metalness: 0.2
        });
        
        // Create planet mesh
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Random position (far from origin)
        let x, y, z;
        do {
            x = (Math.random() - 0.5) * 500;
            y = (Math.random() - 0.5) * 500;
            z = (Math.random() - 0.5) * 500;
        } while (Math.sqrt(x*x + y*y + z*z) < 100); // Ensure planets are not too close to origin
        
        planet.position.set(x, y, z);
        
        // Add rings to some planets
        if (Math.random() > 0.6) {
            const ringGeometry = new THREE.RingGeometry(radius + 2, radius + 5, 32);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }
        
        // Add moons to some planets
        if (Math.random() > 0.5) {
            const moonCount = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < moonCount; j++) {
                const moonRadius = radius * 0.2;
                const moonGeometry = new THREE.SphereGeometry(moonRadius, 16, 16);
                const moonMaterial = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    roughness: 0.8
                });
                const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                
                // Create a container for the moon to orbit around the planet
                const moonOrbit = new THREE.Object3D();
                moonOrbit.rotation.x = Math.random() * Math.PI;
                moonOrbit.rotation.y = Math.random() * Math.PI;
                
                // Position the moon
                moon.position.set(radius + 8, 0, 0);
                
                // Add moon to orbit container
                moonOrbit.add(moon);
                
                // Add orbit to planet
                planet.add(moonOrbit);
                
                // Store the rotation speed
                moonOrbit.userData.rotationSpeed = 0.01 + Math.random() * 0.02;
            }
        }
        
        // Store rotation speed
        planet.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
        
        scene.add(planet);
        planets.push(planet);
    }
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

// Handle mouse down
function onMouseDown(event) {
    if (event.button === 0) { // Left mouse button
        isShooting = true;
        
        if (fireMode === 'single') {
            shoot();
        } else if (fireMode === 'burst') {
            burstCount = 0;
            shootBurst();
        }
    }
}

// Handle mouse up
function onMouseUp(event) {
    if (event.button === 0) { // Left mouse button
        isShooting = false;
    }
}

// Handle mouse click (for single shot mode)
function onMouseClick() {
    // This is now handled by onMouseDown and onMouseUp
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
        case 'KeyR':
            reload();
            break;
        case 'KeyF':
            toggleFireMode();
            break;
        case 'Digit1':
            switchWeapon('pistol');
            break;
        case 'Digit2':
            switchWeapon('assault');
            break;
        case 'Digit3':
            switchWeapon('shotgun');
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

// Toggle fire mode
function toggleFireMode() {
    if (isReloading) return;
    
    const modes = ['single', 'burst', 'auto'];
    const currentIndex = modes.indexOf(fireMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    fireMode = modes[nextIndex];
    
    // Update weapon info display
    updateWeaponInfoDisplay();
    
    // Show fire mode change
    const modeText = document.createElement('div');
    modeText.textContent = `Fire Mode: ${fireMode.toUpperCase()}`;
    modeText.style.position = 'absolute';
    modeText.style.top = '50%';
    modeText.style.left = '50%';
    modeText.style.transform = 'translate(-50%, -50%)';
    modeText.style.color = 'white';
    modeText.style.fontSize = '24px';
    modeText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modeText.style.padding = '10px';
    modeText.style.borderRadius = '5px';
    document.body.appendChild(modeText);
    
    setTimeout(() => {
        document.body.removeChild(modeText);
    }, 1000);
}

// Switch weapon
function switchWeapon(weaponName) {
    if (isReloading || !guns[weaponName]) return;
    
    // Save current ammo
    guns[currentGun].ammo = ammo;
    guns[currentGun].totalAmmo = totalAmmo;
    
    // Switch to new weapon
    currentGun = weaponName;
    fireMode = guns[currentGun].fireMode;
    ammo = guns[currentGun].ammo;
    maxAmmo = guns[currentGun].maxAmmo;
    totalAmmo = guns[currentGun].totalAmmo;
    fireRate = guns[currentGun].fireRate;
    bulletSpread = guns[currentGun].spread;
    maxRecoil = guns[currentGun].recoil;
    recoilRecovery = guns[currentGun].recovery;
    
    updateAmmoDisplay();
    updateWeaponInfoDisplay();
    
    // Show weapon change
    const weaponText = document.createElement('div');
    weaponText.textContent = `Weapon: ${guns[currentGun].name}`;
    weaponText.style.position = 'absolute';
    weaponText.style.top = '50%';
    weaponText.style.left = '50%';
    weaponText.style.transform = 'translate(-50%, -50%)';
    weaponText.style.color = 'white';
    weaponText.style.fontSize = '24px';
    weaponText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    weaponText.style.padding = '10px';
    weaponText.style.borderRadius = '5px';
    document.body.appendChild(weaponText);
    
    setTimeout(() => {
        document.body.removeChild(weaponText);
    }, 1000);
}

// Reload weapon
function reload() {
    if (isReloading || ammo === maxAmmo || totalAmmo <= 0) return;
    
    isReloading = true;
    
    // Show reloading text
    const reloadText = document.createElement('div');
    reloadText.textContent = 'RELOADING...';
    reloadText.style.position = 'absolute';
    reloadText.style.bottom = '50px';
    reloadText.style.right = '10px';
    reloadText.style.color = 'yellow';
    reloadText.style.fontSize = '20px';
    document.body.appendChild(reloadText);
    
    // Animate gun during reload
    const reloadAnimation = setInterval(() => {
        gun.rotation.x = Math.sin(Date.now() * 0.01) * 0.1;
    }, 16);
    
    // Complete reload after delay
    setTimeout(() => {
        isReloading = false;
        
        // Calculate how much ammo to add
        const ammoNeeded = maxAmmo - ammo;
        const ammoToAdd = Math.min(ammoNeeded, totalAmmo);
        
        totalAmmo -= ammoToAdd;
        ammo += ammoToAdd;
        
        updateAmmoDisplay();
        document.body.removeChild(reloadText);
        clearInterval(reloadAnimation);
        
        // Reset gun rotation
        gun.rotation.x = 0;
    }, guns[currentGun].reloadTime);
}

// Shoot burst fire
function shootBurst() {
    if (burstCount < burstMax) {
        shoot();
        burstCount++;
        
        setTimeout(() => {
            if (isShooting) {
                shootBurst();
            }
        }, fireRate);
    }
}

// Shoot function
function shoot() {
    if (isGameOver || isReloading || !canShoot) return;
    
    // Check ammo
    if (ammo <= 0) {
        // Play empty click sound
        playEmptySound();
        
        // Auto reload if out of ammo
        if (totalAmmo > 0) {
            reload();
        }
        return;
    }
    
    // Rate of fire check
    const now = Date.now();
    if (now - lastShotTime < fireRate) return;
    lastShotTime = now;
    
    // Decrease ammo
    ammo--;
    updateAmmoDisplay();
    
    // Apply recoil
    applyRecoil();
    
    // Add camera shake
    addCameraShake();
    
    // Create bullet(s)
    if (currentGun === 'shotgun') {
        // Shotgun fires multiple pellets
        for (let i = 0; i < guns.shotgun.pellets; i++) {
            createBullet(true);
        }
    } else {
        createBullet();
    }
    
    // Add muzzle flash effect
    createMuzzleFlash();
    
    // Auto reload if out of ammo
    if (ammo === 0 && totalAmmo > 0) {
        reload();
    }
}

// Create bullet
function createBullet(isShotgunPellet = false) {
    // Create bullet
    const bulletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    // Position bullet at gun barrel
    const bulletPosition = new THREE.Vector3(0, 0, -1.5);
    bulletPosition.applyQuaternion(gun.quaternion);
    bulletPosition.add(gun.getWorldPosition(new THREE.Vector3()));
    bullet.position.copy(bulletPosition);
    
    // Set bullet direction based on player's orientation with spread
    const spread = isShotgunPellet ? bulletSpread * 2 : bulletSpread;
    bullet.userData.direction = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        -1
    );
    bullet.userData.direction.normalize();
    bullet.userData.direction.applyQuaternion(player.quaternion);
    
    // Set bullet damage
    bullet.userData.damage = guns[currentGun].damage;
    
    // Add bullet light
    const bulletLight = new THREE.PointLight(0xffff00, 1, 5);
    bullet.add(bulletLight);
    
    // Add bullet to scene and bullets array
    scene.add(bullet);
    bullets.push(bullet);
}

// Apply recoil to gun and camera
function applyRecoil() {
    // Add recoil to gun position
    recoilAmount = maxRecoil;
    
    // Apply recoil to gun position
    gun.position.z = gun.userData.originalPosition.z + recoilAmount;
}

// Add camera shake
function addCameraShake() {
    const intensity = maxRecoil * 10;
    camera.rotation.x += (Math.random() - 0.5) * intensity;
    camera.rotation.y += (Math.random() - 0.5) * intensity * 0.5;
    
    // Reset camera shake after a short delay
    setTimeout(() => {
        camera.rotation.y = 0;
    }, 100);
}

// Play empty gun sound
function playEmptySound() {
    // Create a temporary element to show "Click!" text
    const clickText = document.createElement('div');
    clickText.textContent = '*click*';
    clickText.style.position = 'absolute';
    clickText.style.top = '50%';
    clickText.style.left = '50%';
    clickText.style.transform = 'translate(-50%, -50%)';
    clickText.style.color = 'white';
    clickText.style.fontSize = '24px';
    document.body.appendChild(clickText);
    
    setTimeout(() => {
        document.body.removeChild(clickText);
    }, 500);
}

// Create muzzle flash effect
function createMuzzleFlash() {
    const flashGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 1
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    // Position flash at gun barrel
    const flashPosition = new THREE.Vector3(0, 0, -1.5);
    flashPosition.applyQuaternion(gun.quaternion);
    flashPosition.add(gun.getWorldPosition(new THREE.Vector3()));
    flash.position.copy(flashPosition);
    
    // Add flash to scene
    scene.add(flash);
    
    // Add point light for muzzle flash
    const flashLight = new THREE.PointLight(0xffff00, 2, 10);
    flashLight.position.copy(flashPosition);
    scene.add(flashLight);
    
    // Animate flash
    let opacity = 1;
    const fadeOut = setInterval(() => {
        opacity -= 0.1;
        if (opacity <= 0) {
            clearInterval(fadeOut);
            scene.remove(flash);
            scene.remove(flashLight);
        }
        flashMaterial.opacity = opacity;
        flashLight.intensity = opacity * 2;
    }, 20);
}

// Create targets
function createTargets(count) {
    for (let i = 0; i < count; i++) {
        const targetGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const targetMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        
        // Random position in space
        target.position.x = (Math.random() - 0.5) * 200;
        target.position.y = (Math.random() - 0.5) * 200;
        target.position.z = (Math.random() - 0.5) * 200;
        
        // Ensure targets are not too close to player
        const distanceToPlayer = target.position.distanceTo(player.position);
        if (distanceToPlayer < 50) {
            i--; // Try again
            continue;
        }
        
        // Random movement direction
        target.userData.direction = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize();
        
        target.userData.speed = 0.2 + Math.random() * 0.3;
        
        // Add glow effect
        const targetLight = new THREE.PointLight(0xff0000, 1, 3);
        target.add(targetLight);
        
        scene.add(target);
        targets.push(target);
    }
}

// Create hit marker
function createHitMarker(position, damage) {
    // Create hit marker text
    const hitMarkerDiv = document.createElement('div');
    hitMarkerDiv.textContent = damage;
    hitMarkerDiv.style.position = 'absolute';
    hitMarkerDiv.style.color = 'red';
    hitMarkerDiv.style.fontSize = '24px';
    hitMarkerDiv.style.fontWeight = 'bold';
    hitMarkerDiv.style.textShadow = '2px 2px 2px black';
    document.body.appendChild(hitMarkerDiv);
    
    // Store hit marker data
    const hitMarker = {
        element: hitMarkerDiv,
        position: position.clone(),
        createdAt: Date.now(),
        lifetime: 1000, // 1 second
        opacity: 1
    };
    
    hitMarkers.push(hitMarker);
}

// Update hit markers
function updateHitMarkers() {
    for (let i = hitMarkers.length - 1; i >= 0; i--) {
        const marker = hitMarkers[i];
        
        // Check if marker should be removed
        if (Date.now() - marker.createdAt > marker.lifetime) {
            document.body.removeChild(marker.element);
            hitMarkers.splice(i, 1);
            continue;
        }
        
        // Update marker position
        const screenPosition = marker.position.clone().project(camera);
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPosition.y * 0.5) + 0.5) * window.innerHeight;
        
        marker.element.style.left = `${x}px`;
        marker.element.style.top = `${y}px`;
        
        // Update opacity
        const elapsed = Date.now() - marker.createdAt;
        marker.opacity = 1 - (elapsed / marker.lifetime);
        marker.element.style.opacity = marker.opacity;
        
        // Move upward
        marker.position.y += 0.05;
    }
}

// Update player movement
function updatePlayerMovement(delta) {
    // Calculate movement direction
    playerDirection.z = Number(moveForward) - Number(moveBackward);
    playerDirection.x = Number(moveRight) - Number(moveLeft);
    playerDirection.normalize();
    
    // Apply movement to velocity
    const speed = 30;
    if (moveForward || moveBackward) playerVelocity.z = -playerDirection.z * speed * delta;
    if (moveLeft || moveRight) playerVelocity.x = -playerDirection.x * speed * delta;
    
    // Apply rotation to movement direction
    playerVelocity.applyQuaternion(player.quaternion);
    
    // Update player position
    player.position.add(playerVelocity);
    
    // Reset velocity
    playerVelocity.set(0, 0, 0);
}

// Update gun
function updateGun() {
    // Recover from recoil
    if (recoilAmount > 0) {
        recoilAmount -= recoilRecovery;
        if (recoilAmount < 0) recoilAmount = 0;
        
        // Apply recoil recovery to gun position
        gun.position.z = gun.userData.originalPosition.z + recoilAmount;
    }
    
    // Handle automatic fire
    if (isShooting && fireMode === 'auto' && !isReloading) {
        shoot();
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.position.add(bullet.userData.direction.clone().multiplyScalar(1));
        
        // Remove bullet if it goes too far
        if (bullet.position.distanceTo(player.position) > 500) {
            scene.remove(bullet);
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions with targets
        for (let j = targets.length - 1; j >= 0; j--) {
            const target = targets[j];
            const distance = bullet.position.distanceTo(target.position);
            
            if (distance < 0.6) { // Hit!
                // Create hit marker
                createHitMarker(target.position, bullet.userData.damage);
                
                // Remove bullet
                scene.remove(bullet);
                bullets.splice(i, 1);
                
                // Remove target
                scene.remove(target);
                targets.splice(j, 1);
                
                // Increase score
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
                
                // Create explosion effect
                createExplosion(target.position);
                
                // Create new target
                setTimeout(() => {
                    if (!isGameOver) createTargets(1);
                }, 1000);
                
                break;
            }
        }
    }
}

// Create explosion effect
function createExplosion(position) {
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Position particle at explosion center
        particle.position.copy(position);
        
        // Random direction
        particle.userData.direction = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize();
        
        particle.userData.speed = 0.1 + Math.random() * 0.2;
        
        scene.add(particle);
        particles.push(particle);
    }
    
    // Animate particles
    let size = 0.1;
    const animateExplosion = setInterval(() => {
        size += 0.05;
        let particlesRemaining = particles.length;
        
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            if (!particle) continue;
            
            // Move particle
            particle.position.add(particle.userData.direction.clone().multiplyScalar(particle.userData.speed));
            
            // Increase size
            particle.scale.set(size, size, size);
            
            // Fade out
            particle.material.opacity -= 0.02;
            
            if (particle.material.opacity <= 0) {
                scene.remove(particle);
                particles[i] = null;
                particlesRemaining--;
            }
        }
        
        if (particlesRemaining === 0) {
            clearInterval(animateExplosion);
        }
    }, 20);
}

// Update targets
function updateTargets() {
    for (const target of targets) {
        // Move target
        target.position.add(target.userData.direction.clone().multiplyScalar(target.userData.speed));
        
        // Check for collision with player
        const distance = target.position.distanceTo(player.position);
        if (distance < 2) {
            health -= 10;
            healthElement.textContent = `Health: ${health}`;
            
            // Move target away from player
            target.position.add(target.userData.direction.clone().multiplyScalar(5));
            
            if (health <= 0) {
                gameOver();
            }
        }
    }
}

// Update planets
function updatePlanets() {
    for (const planet of planets) {
        // Rotate planet
        planet.rotation.y += planet.userData.rotationSpeed;
        
        // Rotate moons
        planet.children.forEach(child => {
            if (child.userData.rotationSpeed) {
                child.rotation.y += child.userData.rotationSpeed;
            }
        });
        
        // Check if player is inside a planet
        const distance = planet.position.distanceTo(player.position);
        const planetRadius = planet.geometry.parameters.radius;
        
        if (distance < planetRadius) {
            // Player is inside the planet - move them out
            const direction = new THREE.Vector3().subVectors(player.position, planet.position).normalize();
            player.position.copy(planet.position).add(direction.multiplyScalar(planetRadius + 1));
        }
    }
}

// Game over
function gameOver() {
    isGameOver = true;
    gameOverElement.style.display = 'block';
    restartButton.style.display = 'block';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isGameOver) {
        updatePlayerMovement(delta);
        updateGun();
        updateBullets();
        updateTargets();
        updatePlanets();
        updateHitMarkers();
    }
    
    renderer.render(scene, camera);
}

// Restart game
restartButton.addEventListener('click', () => {
    // Remove old renderer
    document.body.removeChild(renderer.domElement);
    
    // Remove all objects from scene
    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
    }
    
    // Remove all hit markers
    for (const marker of hitMarkers) {
        document.body.removeChild(marker.element);
    }
    hitMarkers = [];
    
    // Initialize new game
    init();
});

// Start the game
init(); 