# TGP Land Viewer

A 3D property visualization application that allows users to plan and design their land layout interactively. Upload aerial maps, place structures, and explore your property in both aerial and first-person views.

## Features

### 🗺️ Terrain Visualization
- Upload aerial maps or surveys to create a 3D terrain
- Automatic terrain generation from uploaded images
- Customizable terrain dimensions

### 🏠 Placeable Structures
The application includes a variety of 3D models that can be placed on your property:

**Residential:**
- Single Wide Mobile Home
- Double Wide Mobile Home
- Single Family Houses (3 different styles)

**Vehicles:**
- RV / Camper

**Outdoor:**
- Deer Blind
- Small Bridge (for streams and creeks)

### 🎮 Dual View Modes

**Aerial View:**
- Top-down view of your property
- Drag-and-drop placement of structures
- Orbit camera controls
- Object selection and transformation
- Perfect for planning and layout design

**First-Person View:**
- Walk through your property design
- WASD movement controls
- Mouse look controls
- Run (hold Shift) and jump (Space)
- Experience your design at ground level

### 🛠️ Interactive Controls
- Click on placed objects to select them
- Transform selected objects (move, rotate, scale)
- Real-time 3D rendering with shadows and lighting
- Intuitive drag-and-drop interface

### 💾 Project Management
- Save your property layouts to `.tgp` files
- Load previously saved projects
- Name and organize your designs
- Export functionality for sharing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. **Upload an Aerial Map**
   - Click the "Aerial Map / Survey" upload button
   - Select an image of your property
   - The terrain will be generated automatically

2. **Place Structures**
   - Expand object categories in the left panel
   - Drag items from the menu
   - Drop them onto the terrain in the aerial view
   - Objects will snap to the terrain surface

3. **Position and Adjust**
   - Click on any placed object to select it
   - Use the transform controls to move and position
   - Switch between aerial and first-person views to verify placement

4. **Explore in First Person**
   - Toggle to "First Person" view
   - Click on the 3D view to capture mouse
   - Use WASD to move, mouse to look around
   - Hold Shift to run, press Space to jump

5. **Save Your Work**
   - Enter a project name in the menu
   - Click "Save Project" to download your design
   - Use "Load Project" to restore saved layouts

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful 3D utilities
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Project Structure

```
src/
├── components/
│   ├── objects/          # 3D models for placeable objects
│   │   ├── Bridge.tsx
│   │   ├── DeerBlind.tsx
│   │   ├── DoubleWideMobileHome.tsx
│   │   ├── Object3D.tsx
│   │   ├── RV.tsx
│   │   ├── SingleFamilyHouse.tsx
│   │   └── SingleWideMobileHome.tsx
│   ├── FirstPersonControls.tsx
│   ├── MenuPanel.tsx
│   ├── PlacedObjects.tsx
│   ├── Scene.tsx
│   ├── Terrain.tsx
│   └── ViewerPanel.tsx
├── hooks/
│   └── useAppStore.ts    # Zustand store
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   └── saveLoad.ts       # Save/load utilities
├── App.tsx               # Main application
└── main.tsx              # Entry point
```

## Controls Reference

### Aerial View
- **Left Mouse + Drag**: Orbit camera
- **Right Mouse + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Left Click on Object**: Select object
- **Drag from Menu**: Place new object

### First Person View
- **W/A/S/D or Arrow Keys**: Move
- **Mouse**: Look around
- **Space**: Jump
- **Shift**: Run
- **Click Canvas**: Capture mouse (required for controls)
- **Escape**: Release mouse

## Future Enhancements

- Height map generation from aerial imagery
- Additional structure models (barns, sheds, fences)
- Terrain editing tools
- Photo markers and 360° views
- Measurement tools
- Sun position and shadow simulation
- Export to various formats
- Collaborative editing

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
