import { GameState } from '../types/types';

export const initialGameState: GameState = {
  location: 'ship',
  inventory: [],
  visited: {
    ship: true,
  },
  gameProgress: 0,
  health: 100,
  gameOver: false,
  won: false
};

// Game world locations and descriptions
export const locations: Record<string, { description: string, exits: Record<string, string> }> = {
  ship: {
    description: 'You are in the command center of your crashed spaceship. Emergency lights flicker ominously. Systems appear to be offline. There is a door to the north leading outside.',
    exits: {
      north: 'crashSite'
    }
  },
  crashSite: {
    description: 'The barren alien landscape stretches out before you. Your ship has created a small crater. The air is thin but breathable. You can see a strange forest to the east and a canyon to the west.',
    exits: {
      south: 'ship',
      east: 'forest',
      west: 'canyon'
    }
  },
  forest: {
    description: 'Alien vegetation surrounds you. Plants with purple leaves and glowing stems emit a soft hum. There appears to be a path leading deeper into the forest to the east, and the crash site is to the west.',
    exits: {
      west: 'crashSite',
      east: 'clearing'
    }
  },
  clearing: {
    description: 'You enter a large clearing in the alien forest. In the center, there\'s a small pyramid-like structure covered in strange symbols. The forest is to the west.',
    exits: {
      west: 'forest',
      enter: 'pyramid'
    }
  },
  pyramid: {
    description: 'Inside the pyramid, the walls are covered with glowing symbols. There appears to be a control panel in the center of the room. The exit is to the south.',
    exits: {
      south: 'clearing'
    }
  },
  canyon: {
    description: 'A deep canyon cuts through the landscape. Far below, you can see a river of glowing blue liquid. There\'s a narrow path leading down to the north, and the crash site is to the east.',
    exits: {
      east: 'crashSite',
      north: 'riverBank'
    }
  },
  riverBank: {
    description: 'You stand at the bank of a river filled with glowing blue liquid. It looks strangely energetic, possibly a source of power. There\'s a cave entrance to the west, and a path leading back up to the south.',
    exits: {
      south: 'canyon',
      west: 'cave'
    }
  },
  cave: {
    description: 'The dark cave is lit only by crystal formations that emit a soft blue glow. There seems to be some kind of ancient technology embedded in the walls. The exit is to the east.',
    exits: {
      east: 'riverBank'
    }
  }
};

// Items that can be found in the game
export const items: Record<string, { description: string, location: string }> = {
  powerCell: {
    description: 'A glowing power cell that could help repair your ship.',
    location: 'cave'
  },
  alienArtifact: {
    description: 'A strange alien artifact that pulses with energy.',
    location: 'pyramid'
  },
  repairKit: {
    description: 'A repair kit from your ship that could be useful for fixing damaged systems.',
    location: 'ship'
  },
  communicator: {
    description: 'A communicator device that might allow you to call for help.',
    location: 'crashSite'
  }
};
