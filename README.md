# Recoil - Solana Ecosystem Explorer

An interactive 3D circus-themed explorer for the Solana ecosystem, where you can walk around and discover different Solana protocols represented as circus stalls.

## Overview

Recoil transforms the Solana ecosystem into a vibrant circus environment where each protocol is represented as a colorful stall. Walk around the circus, approach different protocol stalls, and learn about what each protocol offers. When you find a protocol you're interested in, you can visit their website directly from the application.

## Featured Protocols

- **Drift Protocol**: A decentralized exchange offering perpetual futures trading
- **Jito**: MEV infrastructure provider for Solana validators
- **Helius**: Developer infrastructure and APIs for Solana applications
- **Jupiter**: Liquidity aggregator for Solana
- **Marinade**: Liquid staking protocol for Solana
- **Pyth Network**: First-party financial oracle network

## How to Run

There are several ways to run the application:

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

## Controls

- **W/A/S/D or Arrow Keys**: Move through the Solana Circus
- **Mouse Movement**: Look around
- **Mouse Click**: Visit the website of a protocol when near its stall

## Features

- **Interactive 3D Environment**: Explore a colorful circus tent with protocol stalls
- **Protocol Information**: Learn about each Solana protocol as you approach its stall
- **Direct Website Access**: Visit protocol websites directly from the application
- **Immersive Experience**: Walk around as a character in first-person view
- **Visual Indicators**: Each protocol has a unique colored stall for easy identification

## Technical Details

- Built with Three.js
- Uses ES6 modules
- Features first-person character controls
- Implements proximity detection for protocol interactions
- Responsive design that works across different screen sizes

## Deployment

This application can be easily deployed to Vercel or any static site hosting service.

## Future Improvements

- Add more Solana protocols and ecosystem projects
- Implement more detailed stall designs with protocol logos
- Add ambient sounds and music for a more immersive experience
- Create animated characters representing protocol team members
- Add interactive elements at each stall to demonstrate protocol functionality
- Implement a minimap to help with navigation 