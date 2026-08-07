import type { GoalShape, VoxelSlot } from '../types/goal-blueprint';

/** Ordered voxel slots — blocks appear in this sequence as savings grow. */
export const SHAPE_TEMPLATES: Record<GoalShape, VoxelSlot[]> = {
  house: [
    // Layer 0: Ground Foundation (3x3)
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 }, // Door threshold
    { x: 2, y: 0, layer: 0 },
    { x: 0, y: 1, layer: 0 },
    { x: 1, y: 1, layer: 0 },
    { x: 2, y: 1, layer: 0 },
    { x: 0, y: 2, layer: 0 },
    { x: 1, y: 2, layer: 0 },
    { x: 2, y: 2, layer: 0 },

    // Layer 1: Walls & Windows (3x3 outer ring, empty inside)
    { x: 0, y: 0, layer: 1 }, // Left pillar
    { x: 2, y: 0, layer: 1 }, // Right pillar
    { x: 0, y: 1, layer: 1 }, // Left wall
    { x: 2, y: 1, layer: 1 }, // Right wall
    { x: 0, y: 2, layer: 1 }, // Back-left corner
    { x: 1, y: 2, layer: 1 }, // Back wall center
    { x: 2, y: 2, layer: 1 }, // Back-right corner

    // Layer 2: Roof Base & Ceiling
    { x: 0, y: 0, layer: 2 },
    { x: 1, y: 0, layer: 2 }, // Front roof overhang
    { x: 2, y: 0, layer: 2 },
    { x: 0, y: 1, layer: 2 },
    { x: 1, y: 1, layer: 2 },
    { x: 2, y: 1, layer: 2 },
    { x: 0, y: 2, layer: 2 },
    { x: 1, y: 2, layer: 2 },
    { x: 2, y: 2, layer: 2 },

    // Layer 3: sloped Roof Pitch & Chimney
    { x: 0, y: 1, layer: 3 }, // Roof ridge left
    { x: 1, y: 1, layer: 3 }, // Roof ridge middle
    { x: 2, y: 1, layer: 3 }, // Roof ridge right
    { x: 2, y: 2, layer: 3 }, // Chimney block!
  ],
  car: [
    // Layer 0: Wheels & Center Chassis (3 wide, 4 long)
    { x: 0, y: 0, layer: 0 }, // Back-Left Wheel
    { x: 3, y: 0, layer: 0 }, // Front-Left Wheel
    { x: 0, y: 2, layer: 0 }, // Back-Right Wheel
    { x: 3, y: 2, layer: 0 }, // Front-Right Wheel
    { x: 1, y: 1, layer: 0 }, // Middle chassis support
    { x: 2, y: 1, layer: 0 }, // Middle chassis support
    { x: 1, y: 0, layer: 0 }, 
    { x: 2, y: 0, layer: 0 },
    { x: 1, y: 2, layer: 0 },
    { x: 2, y: 2, layer: 0 },

    // Layer 1: Main Car Body (4x3 solid block)
    { x: 0, y: 0, layer: 1 }, // Rear bumper left
    { x: 1, y: 0, layer: 1 },
    { x: 2, y: 0, layer: 1 },
    { x: 3, y: 0, layer: 1 }, // Front hood left
    { x: 0, y: 1, layer: 1 }, // Rear bumper center
    { x: 1, y: 1, layer: 1 },
    { x: 2, y: 1, layer: 1 },
    { x: 3, y: 1, layer: 1 }, // Front hood center
    { x: 0, y: 2, layer: 1 }, // Rear bumper right
    { x: 1, y: 2, layer: 1 },
    { x: 2, y: 2, layer: 1 },
    { x: 3, y: 2, layer: 1 }, // Front hood right

    // Layer 2: Cabin & Windshield (leaves hood x=3 and trunk x=0 open)
    { x: 1, y: 0, layer: 2 }, // Side window left
    { x: 2, y: 0, layer: 2 }, // Side window left
    { x: 1, y: 1, layer: 2 }, // Cabin interior
    { x: 2, y: 1, layer: 2 }, // Windshield center
    { x: 1, y: 2, layer: 2 }, // Side window right
    { x: 2, y: 2, layer: 2 }, // Side window right

    // Layer 3: Cabin Roof
    { x: 1, y: 0, layer: 3 },
    { x: 2, y: 0, layer: 3 },
    { x: 1, y: 1, layer: 3 },
    { x: 2, y: 1, layer: 3 },
    { x: 1, y: 2, layer: 3 },
    { x: 2, y: 2, layer: 3 },
  ],
  plane: [
    // Layer 0: Wings & Fuselage base
    { x: 0, y: 2, layer: 0 }, // Left wingtip
    { x: 1, y: 2, layer: 0 }, // Left wing inner
    { x: 2, y: 2, layer: 0 }, // Left wing root
    { x: 4, y: 2, layer: 0 }, // Right wing root
    { x: 5, y: 2, layer: 0 }, // Right wing inner
    { x: 6, y: 2, layer: 0 }, // Right wingtip
    
    // Fuselage center line
    { x: 3, y: 0, layer: 0 }, // Nose
    { x: 3, y: 1, layer: 0 }, 
    { x: 3, y: 2, layer: 0 }, // Center crossing
    { x: 3, y: 3, layer: 0 }, 
    { x: 3, y: 4, layer: 0 }, // Tail

    // Layer 1: Fuselage body
    { x: 3, y: 0, layer: 1 }, // Nose cone
    { x: 3, y: 1, layer: 1 }, // Cabin
    { x: 3, y: 2, layer: 1 }, // Mid-cabin
    { x: 3, y: 3, layer: 1 }, 
    { x: 3, y: 4, layer: 1 }, // Tail cone

    // Layer 2: Cockpit windows & Tail Fin
    { x: 3, y: 1, layer: 2 }, // Cockpit glass
    { x: 3, y: 4, layer: 2 }, // Tail fin base
    { x: 3, y: 4, layer: 3 }, // Tail fin top
  ],
  phone: [
    // Layer 0: Phone Back Bezel
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 },
    { x: 2, y: 0, layer: 0 },
    { x: 0, y: 1, layer: 0 },
    { x: 1, y: 1, layer: 0 },
    { x: 2, y: 1, layer: 0 },
    { x: 0, y: 2, layer: 0 },
    { x: 1, y: 2, layer: 0 },
    { x: 2, y: 2, layer: 0 },
    { x: 0, y: 3, layer: 0 },
    { x: 1, y: 3, layer: 0 },
    { x: 2, y: 3, layer: 0 },
    { x: 0, y: 4, layer: 0 },
    { x: 1, y: 4, layer: 0 },
    { x: 2, y: 4, layer: 0 },

    // Layer 1: Screen & Camera Notch
    { x: 0, y: 0, layer: 1 }, // Bottom chin
    { x: 1, y: 0, layer: 1 },
    { x: 2, y: 0, layer: 1 },
    { x: 0, y: 1, layer: 1 }, // Screen
    { x: 1, y: 1, layer: 1 },
    { x: 2, y: 1, layer: 1 },
    { x: 0, y: 2, layer: 1 }, // Screen
    { x: 1, y: 2, layer: 1 },
    { x: 2, y: 2, layer: 1 },
    { x: 0, y: 3, layer: 1 }, // Screen
    { x: 1, y: 3, layer: 1 },
    { x: 2, y: 3, layer: 1 },
    { x: 0, y: 4, layer: 1 }, // Top bezel
    { x: 1, y: 4, layer: 1 }, // Dynamic island/notch
    { x: 2, y: 4, layer: 1 },
  ],
  laptop: [
    // Keyboard Base (Layer 0)
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 },
    { x: 2, y: 0, layer: 0 },
    { x: 0, y: 1, layer: 0 },
    { x: 1, y: 1, layer: 0 },
    { x: 2, y: 1, layer: 0 },
    { x: 0, y: 2, layer: 0 },
    { x: 1, y: 2, layer: 0 },
    { x: 2, y: 2, layer: 0 },

    // Screen (Layer 1, stand-up on the back row y=2)
    { x: 0, y: 2, layer: 1 },
    { x: 1, y: 2, layer: 1 },
    { x: 2, y: 2, layer: 1 },
    { x: 0, y: 2, layer: 2 },
    { x: 1, y: 2, layer: 2 },
    { x: 2, y: 2, layer: 2 },
  ],
  gift: [
    // Gift Box Base (2x2)
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 },
    { x: 0, y: 1, layer: 0 },
    { x: 1, y: 1, layer: 0 },
    { x: 0, y: 0, layer: 1 },
    { x: 1, y: 0, layer: 1 },
    { x: 0, y: 1, layer: 1 },
    { x: 1, y: 1, layer: 1 },

    // Ribbon Bow (Layer 2)
    { x: 0, y: 0, layer: 2 },
    { x: 1, y: 1, layer: 2 },
  ],
  education: [
    // Book stack
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 },
    { x: 2, y: 0, layer: 0 },
    { x: 0, y: 0, layer: 1 },
    { x: 1, y: 0, layer: 1 },
    { x: 2, y: 0, layer: 1 },
    { x: 1, y: 0, layer: 2 }, // Graduation cap top button
  ],
  wedding: [
    // Double hearts
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 },
    { x: 0, y: 1, layer: 0 },
    { x: 1, y: 1, layer: 0 },
    { x: 1, y: 0, layer: 1 },
    { x: 2, y: 0, layer: 1 },
  ],
  rocket: [
    // Rocket body standing
    { x: 1, y: 1, layer: 0 }, // Engines
    { x: 1, y: 1, layer: 1 }, // Thruster
    { x: 1, y: 1, layer: 2 }, // Fuel tank
    { x: 1, y: 1, layer: 3 }, // Cabin
    { x: 1, y: 1, layer: 4 }, // Nose cone
    { x: 0, y: 1, layer: 1 }, // Left fin
    { x: 2, y: 1, layer: 1 }, // Right fin
  ],
  tower: [
    { x: 0, y: 0, layer: 0 },
    { x: 1, y: 0, layer: 0 },
    { x: 0, y: 1, layer: 0 },
    { x: 1, y: 1, layer: 0 },
    { x: 0, y: 0, layer: 1 },
    { x: 1, y: 0, layer: 1 },
    { x: 0, y: 1, layer: 1 },
    { x: 1, y: 1, layer: 1 },
    { x: 0, y: 0, layer: 2 },
    { x: 1, y: 0, layer: 2 },
    { x: 0, y: 1, layer: 2 },
    { x: 1, y: 1, layer: 2 },
  ],
};

export function getShapeSlots(shape: GoalShape): VoxelSlot[] {
  return SHAPE_TEMPLATES[shape] ?? SHAPE_TEMPLATES.tower;
}

export function getShapeBounds(slots: VoxelSlot[]) {
  const maxX = Math.max(...slots.map((s) => s.x), 0);
  const maxY = Math.max(...slots.map((s) => s.y), 0);
  const maxLayer = Math.max(...slots.map((s) => s.layer), 0);
  return { maxX, maxY, maxLayer };
}
