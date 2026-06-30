<img width="1917" height="1023" alt="image" src="https://github.com/user-attachments/assets/0849fccc-3bca-4031-b145-a93a1937b618" />

# 🌴 Virtual Experience Engine
## **RockerBeach Island**

A real-time open-world 3D simulation engine built with **Three.js**, featuring dynamic environments, vehicles, and characters. RockerBeach Island is designed to deliver immersive sandbox-style gameplay inspired by high-end cinematic rendering and AAA open-world systems.

---

## 🌐 Concept Origin

<img width="2160" height="1200" alt="rockerbeach-island-05" src="https://github.com/user-attachments/assets/ceff4221-084e-4867-bba0-c982b2e69d8d" />

The name **RockerBeach Island** reflects the project's focus on a large tropical island environment featuring coastal regions, beaches, roads, towns, and interconnected gameplay systems.

The world is designed as a seamless open environment where players can:

- Explore beaches, roads, towns, and natural landscapes
- Travel continuously without loading screens
- Experience seamless world streaming and transitions
- Interact with persistent vehicles, physics, and NPC systems
- Enjoy both realistic and stylized versions of the island

World boundaries are designed to feel invisible to the player, creating a continuous open-world experience rather than isolated levels.

---

## 🌍 Project Overview

<img width="2160" height="1200" alt="rockerbeach-island-01" src="https://github.com/user-attachments/assets/89ec48b0-6e81-4035-96b5-e0cad72d22a6" />


**RockerBeach Island** is a modular virtual world engine that combines real-time rendering, physics simulation, and dynamic world systems to create a scalable open-world experience similar to modern sandbox games.

The core environment is based on the **RockerBeach Island game world**, available in two distinct variants:

### 🏝️ RockerBeach Island Variants

https://sketchfab.com/3d-models/crateria-96e015d3465945e189bf1cc15f30976a

#### 🎮 Realistic Version
High-fidelity environment designed for cinematic visuals, advanced lighting, and physically-based rendering (PBR).

Inspired by offline rendering workflows such as 3ds Max and V-Ray pipelines.

#### 🧱 Low Poly Version
Optimized version focused on performance, scalability, and gameplay prototyping.

Ideal for large-scale simulation, AI testing, and low-end hardware support.

🔗 https://www.renderhub.com/thebeachmarket/rockerbeach-island

---

## ✨ Features

- 🏝️ Large seamless island environment
- 🌊 Beaches, coastal roads, and natural landscapes
- 🎮 Dual-mode environment (Realistic + Low Poly)
- 🚗 Dynamic vehicle system (driveable + AI-controlled)
- 🧍 Dynamic NPC character system
- ⚙️ Real-time physics simulation using Cannon.js
- 🎮 Interactive sandbox gameplay systems
- 🌐 Seamless world streaming architecture (WIP)
- 🧑‍🤝‍🧑 Multiplayer support (real-time networked simulation)

---

## 🧱 Tech Stack

- **Rendering Engine:** Three.js
- **Physics Engine:** Cannon.js
- **Language:** JavaScript / TypeScript
- **World System:** Open-world streaming architecture
- **Networking:** WebSocket-based multiplayer system
- **Asset Pipeline:** Real-time optimized 3D models

---

## 🎨 Rendering & Visual Style

RockerBeach Island aims to combine real-time performance with cinematic visual fidelity.

Inspired by:

- 3ds Max rendering workflows
- V-Ray lighting and shading techniques
- Physically-Based Rendering (PBR) pipelines

### Supports:

- 🎥 High-fidelity cinematic mode (Realistic)
- 🎮 Optimized performance mode (Low Poly)

---

## 🧠 System Architecture

- Scene Manager – world streaming & lifecycle control
- Environment Streaming System – dynamic loading/unloading
- Physics World – Cannon.js integration
- Entity System – NPCs, vehicles, props
- Input Controller – player & camera control
- Rendering Pipeline – Three.js WebGL renderer
- Network Layer – multiplayer synchronization system

---

## 🌍 World Streaming System

RockerBeach Island is built around a seamless streaming architecture where:

- The world is divided into streaming zones
- Only nearby areas are fully loaded
- Distant regions are simplified or streamed
- Transitions are seamless
- Physics and entity states persist across regions

This creates the illusion of a single continuous open-world island.

---

## 🚧 Roadmap

- [ ] NPC AI navigation system
- [ ] Advanced vehicle physics (suspension, drift system)
- [ ] Weather system & day/night cycle
- [ ] Multiplayer synchronization improvements
- [ ] World streaming optimization (LOD + chunking system)
- [ ] Advanced lighting & post-processing
- [ ] Traffic simulation system
- [ ] Dynamic beach and ocean systems

---

## 🎮 Controls

- **WASD** – Move player / vehicle
- **Mouse** – Camera control
- **Space** – Jump / Brake
- **Shift** – Sprint / Boost

---

## 🚀 Getting Started

### Prerequisites

RockerBeach Island must be run through a local web server. Opening `Rockerbeach-Island.html` directly from your file system (`file://`) may prevent models, textures, scripts, and other assets from loading correctly due to browser security restrictions.

### Run with VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Locate `rockerbeachisland.html` in the project directory.
4. Right-click `Rockerbeach-Island.html`.
5. Select **Open with Live Server**.

The application will automatically launch in your default web browser.

### Alternative Local Server Methods

#### Python

```bash
python -m http.server 8000
