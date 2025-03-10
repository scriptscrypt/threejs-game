# Space Shooter - 3D Shooting Game with Three.js

A 3D space shooting game created with Three.js where you navigate through space, explore planets, and shoot enemy targets with realistic gun mechanics.

## How to Run

There are several ways to run the game:

### Option 1: Using the included Node.js server

1. Make sure you have Node.js installed on your computer
2. Open a terminal in the project directory
3. Run `node server.js`
4. Open your browser and navigate to `http://localhost:3000`

### Option 2: Using Python's built-in HTTP server

1. Make sure you have Python installed on your computer
2. Open a terminal in the project directory
3. Run `python -m http.server` (Python 3) or `python -m SimpleHTTPServer` (Python 2)
4. Open your browser and navigate to `http://localhost:8000`

### Option 3: Using VS Code Live Server

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

## Game Controls

- **W/A/S/D or Arrow Keys**: Move through space
- **Mouse Movement**: Look around and aim your gun
- **Mouse Click**: Shoot bullets
- **R Key**: Reload your weapon
- **F Key**: Toggle fire mode (single/burst/auto)
- **1-3 Keys**: Switch weapons (Pistol, Assault Rifle, Shotgun)
- **Restart Button**: Appears after game over to restart the game

## Weapons System

### Available Weapons
- **Pistol**: High damage, medium fire rate, low recoil, high accuracy
- **Assault Rifle**: Medium damage, high fire rate, medium recoil, medium accuracy
- **Shotgun**: Low damage per pellet (fires 8 pellets), low fire rate, high recoil, low accuracy

### Fire Modes
- **Single**: One shot per click
- **Burst**: Three-round burst per click
- **Auto**: Continuous fire while holding the mouse button

### Weapon Mechanics
- **Recoil**: Guns have realistic recoil that affects aim
- **Bullet Spread**: Accuracy varies by weapon and decreases during rapid fire
- **Ammo Management**: Limited ammo with reload system
- **Hit Markers**: Visual feedback when hitting targets
- **Damage Numbers**: Shows damage dealt to targets

## Game Features

- **Space Environment**: Explore a vast space with stars and planets
- **Planets**: Navigate around or through various planets with unique colors and features
- **Gun**: Control realistic-looking guns with advanced shooting mechanics
- **Enemies**: Shoot the red glowing spheres to earn points
- **Visual Effects**: Muzzle flashes, explosions, and glowing projectiles

## Game Rules

- Shoot the red spheres to earn 10 points per hit
- Avoid collisions with the red spheres, as each collision reduces your health by 10 points
- Navigate through space and explore the planets
- Manage your ammo and reload when necessary
- The game ends when your health reaches 0

## Technical Details

- Built with Three.js
- Uses ES6 modules
- Implements 3D collision detection
- Features a first-person shooter perspective
- Includes particle effects for explosions and muzzle flashes
- Realistic space environment with stars and planets
- Advanced gun mechanics with recoil, spread, and fire modes

## Troubleshooting

If you encounter issues with module loading, make sure you're running the game through a web server (not opening the HTML file directly). This is necessary because browsers enforce security restrictions on loading ES modules from local files.

## Future Improvements

- Add sound effects for weapons and explosions
- Implement power-ups and collectibles
- Create different types of enemies with varying behaviors
- Add levels with increasing difficulty
- Improve graphics and visual effects
- Add a minimap to help with navigation
- Implement more weapon types and customization options 