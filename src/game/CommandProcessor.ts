import { CommandResult, GameState } from '../types/types';
import { items, locations, initialGameState } from './GameState';

export const processCommand = (command: string, gameState: GameState): CommandResult => {
  const lowerCommand = command.toLowerCase();
  const commandParts = lowerCommand.split(' ');
  const action = commandParts[0];
  
  // If game is over, only allow restart
  if (gameState.gameOver) {
    if (action === 'restart') {
      return handleRestart();
    } else {
      return {
        output: gameState.won
          ? 'Game complete! Type "restart" to play again.'
          : 'Game over! Type "restart" to try again.',
        updatedState: gameState
      };
    }
  }

  switch (action) {
    case 'help':
      return handleHelp();
    case 'look':
      return handleLook(gameState);
    case 'go':
    case 'move':
    case 'north':
    case 'south':
    case 'east':
    case 'west':
    case 'enter':
      return handleMovement(commandParts, action, gameState);
    case 'inventory':
    case 'i':
      return handleInventory(gameState);
    case 'take':
    case 'get':
    case 'pickup':
      return handleTake(commandParts.slice(1).join(' '), gameState);
    case 'use':
      return handleUse(commandParts.slice(1).join(' '), gameState);
    case 'examine':
    case 'inspect':
      return handleExamine(commandParts.slice(1).join(' '), gameState);
    case 'drop':
      return handleDrop(commandParts.slice(1).join(' '), gameState);
    case 'health':
    case 'status':
      return handleStatus(gameState);
    case 'clear':
      return { output: 'Screen cleared.', updatedState: gameState };
    case 'theme':
      return { output: 'Use the color buttons at the top to change the theme.', updatedState: gameState };
    default:
      return {
        output: `I don't understand '${command}'. Type 'help' for a list of commands.`,
        updatedState: gameState,
        isError: true
      };
  }
};

const handleHelp = (): CommandResult => {
  return {
    output: `
Available commands:
  - help: Show this help message
  - look: Describe your current surroundings
  - go [direction]: Move in a direction (north, south, east, west)
  - inventory: Check your inventory
  - take [item]: Pick up an item
  - drop [item]: Drop an item from your inventory
  - use [item]: Use an item
  - examine [item]: Examine an item or object
  - health: Check your health status
  - clear: Clear the terminal screen
  - theme: Change terminal color theme

You can also type a direction (north, south, east, west) to move.
    `,
    updatedState: { ...initialGameState }
  };
};

const handleLook = (gameState: GameState): CommandResult => {
  const { location } = gameState;
  const locationData = locations[location];
  
  if (!locationData) {
    return {
      output: 'ERROR: Location not found in game data.',
      updatedState: gameState,
      isError: true
    };
  }
  
  // Check for items in this location
  const itemsHere = Object.entries(items)
    .filter(([_, itemData]) => itemData.location === location)
    .map(([itemId, _]) => itemId);
  
  let output = locationData.description;
  
  if (itemsHere.length > 0) {
    output += '\n\nYou can see:';
    itemsHere.forEach(item => {
      // Only show items that haven't been picked up
      if (!gameState.inventory.includes(item)) {
        output += `\n- ${formatItemName(item)}`;
      }
    });
  }
  
  output += '\n\nExits:';
  Object.entries(locationData.exits).forEach(([direction, destination]) => {
    output += `\n- ${direction} to ${formatLocationName(destination)}`;
  });
  
  return { output, updatedState: gameState };
};

const handleMovement = (
  commandParts: string[],
  action: string,
  gameState: GameState
): CommandResult => {
  const { location } = gameState;
  const locationData = locations[location];
  
  let direction: string;
  
  // Handle "go north" vs just "north"
  if (action === 'go' || action === 'move') {
    if (commandParts.length < 2) {
      return {
        output: 'Go where? Please specify a direction.',
        updatedState: gameState,
        isError: true
      };
    }
    direction = commandParts[1];
  } else {
    direction = action; // The action itself is the direction
  }
  
  // Check if the direction is valid
  if (!locationData.exits[direction]) {
    return {
      output: `You can't go ${direction} from here.`,
      updatedState: gameState,
      isError: true
    };
  }
  
  // Move to the new location
  const newLocation = locationData.exits[direction];
  const updatedState = {
    ...gameState,
    location: newLocation,
    visited: {
      ...gameState.visited,
      [newLocation]: true
    }
  };
  
  // Get the description of the new location
  const { output } = handleLook(updatedState);
  
  return { output, updatedState };
};

const handleInventory = (gameState: GameState): CommandResult => {
  const { inventory } = gameState;
  
  if (inventory.length === 0) {
    return {
      output: 'Your inventory is empty.',
      updatedState: gameState
    };
  }
  
  let output = 'You are carrying:';
  inventory.forEach(item => {
    output += `\n- ${formatItemName(item)}: ${items[item]?.description || 'Unknown item'}`;
  });
  
  return { output, updatedState: gameState };
};

const handleTake = (
  itemName: string,
  gameState: GameState
): CommandResult => {
  if (!itemName) {
    return {
      output: 'Take what?',
      updatedState: gameState,
      isError: true
    };
  }
  
  const { location, inventory } = gameState;
  
  // Find the item
  const itemId = Object.keys(items).find(
    id => id.toLowerCase() === itemName.toLowerCase() ||
          formatItemName(id).toLowerCase() === itemName.toLowerCase()
  );
  
  if (!itemId) {
    return {
      output: `I don't see a ${itemName} here.`,
      updatedState: gameState,
      isError: true
    };
  }
  
  // Check if the item is in the current location
  if (items[itemId].location !== location) {
    return {
      output: `I don't see a ${formatItemName(itemId)} here.`,
      updatedState: gameState,
      isError: true
    };
  }
  
  // Check if the item is already in inventory
  if (inventory.includes(itemId)) {
    return {
      output: `You already have the ${formatItemName(itemId)}.`,
      updatedState: gameState,
      isError: true
    };
  }
  
  // Add the item to inventory
  const updatedState = {
    ...gameState,
    inventory: [...inventory, itemId]
  };
  
  return {
    output: `You pick up the ${formatItemName(itemId)}.`,
    updatedState
  };
};

const handleDrop = (
  itemName: string,
  gameState: GameState
): CommandResult => {
  if (!itemName) {
    return {
      output: 'Drop what?',
      updatedState: gameState,
      isError: true
    };
  }
  
  const { location, inventory } = gameState;
  
  // Find the item in inventory
  const itemId = inventory.find(
    id => id.toLowerCase() === itemName.toLowerCase() ||
          formatItemName(id).toLowerCase() === itemName.toLowerCase()
  );
  
  if (!itemId) {
    return {
      output: `You don't have a ${itemName}.`,
      updatedState: gameState,
      isError: true
    };
  }
  
  // Remove the item from inventory and place it in the current location
  const updatedInventory = inventory.filter(item => item !== itemId);
  const updatedState = {
    ...gameState,
    inventory: updatedInventory
  };
  
  // Update the item's location
  items[itemId].location = location;
  
  return {
    output: `You drop the ${formatItemName(itemId)}.`,
    updatedState
  };
};

const handleExamine = (
  target: string,
  gameState: GameState
): CommandResult => {
  if (!target) {
    return {
      output: 'Examine what?',
      updatedState: gameState,
      isError: true
    };
  }
  
  const { location, inventory } = gameState;
  
  // First, check if it's an item in the inventory
  const inventoryItem = inventory.find(
    item => item.toLowerCase() === target.toLowerCase() ||
            formatItemName(item).toLowerCase() === target.toLowerCase()
  );
  
  if (inventoryItem) {
    return {
      output: `${formatItemName(inventoryItem)}: ${items[inventoryItem].description}`,
      updatedState: gameState
    };
  }
  
  // Then, check if it's an item in the current location
  const locationItem = Object.keys(items).find(
    item => (items[item].location === location) &&
           (item.toLowerCase() === target.toLowerCase() ||
            formatItemName(item).toLowerCase() === target.toLowerCase())
  );
  
  if (locationItem) {
    return {
      output: `${formatItemName(locationItem)}: ${items[locationItem].description}`,
      updatedState: gameState
    };
  }
  
  // If we get here, the target wasn't found
  return {
    output: `You don't see a ${target} here.`,
    updatedState: gameState,
    isError: true
  };
};

const handleUse = (
  itemName: string,
  gameState: GameState
): CommandResult => {
  if (!itemName) {
    return {
      output: 'Use what?',
      updatedState: gameState,
      isError: true
    };
  }
  
  const { location, inventory, gameProgress } = gameState;
  
  // Find the item in inventory
  const itemId = inventory.find(
    id => id.toLowerCase() === itemName.toLowerCase() ||
          formatItemName(id).toLowerCase() === itemName.toLowerCase()
  );
  
  if (!itemId) {
    return {
      output: `You don't have a ${itemName}.`,
      updatedState: gameState,
      isError: true
    };
  }
  
  // Handle specific item uses
  switch (itemId) {
    case 'repairKit':
      if (location === 'ship') {
        let output = 'You use the repair kit to fix some of the ship\'s systems.';
        let updatedInventory = [...inventory];
        let updatedProgress = gameProgress;
        
        // Remove the item after use
        updatedInventory = updatedInventory.filter(item => item !== itemId);
        updatedProgress += 1;
        
        if (updatedProgress >= 3 && inventory.includes('powerCell') && inventory.includes('alienArtifact')) {
          output += '\n\nWith the ship\'s systems repaired, the power cell installed, and the alien artifact providing navigation data, your ship is ready for launch! You\'ve successfully completed your mission!';
          
          return {
            output,
            updatedState: {
              ...gameState,
              inventory: updatedInventory,
              gameProgress: updatedProgress,
              gameOver: true,
              won: true
            }
          };
        } else {
          output += '\n\nYou\'ll need more components to fully repair the ship.';
          
          return {
            output,
            updatedState: {
              ...gameState,
              inventory: updatedInventory,
              gameProgress: updatedProgress
            }
          };
        }
      } else {
        return {
          output: 'The repair kit would be more useful at your ship.',
          updatedState: gameState
        };
      }
    
    case 'powerCell':
      if (location === 'ship') {
        let output = 'You install the power cell into the ship\'s main reactor. The lights flicker on!';
        let updatedInventory = [...inventory];
        let updatedProgress = gameProgress;
        
        // Remove the item after use
        updatedInventory = updatedInventory.filter(item => item !== itemId);
        updatedProgress += 1;
        
        if (updatedProgress >= 3 && updatedInventory.includes('alienArtifact') && !inventory.includes('repairKit')) {
          output += '\n\nWith the ship\'s systems repaired, the power cell installed, and the alien artifact providing navigation data, your ship is ready for launch! You\'ve successfully completed your mission!';
          
          return {
            output,
            updatedState: {
              ...gameState,
              inventory: updatedInventory,
              gameProgress: updatedProgress,
              gameOver: true,
              won: true
            }
          };
        } else {
          output += '\n\nThe ship is gaining power, but you\'ll need more components to fully repair it.';
          
          return {
            output,
            updatedState: {
              ...gameState,
              inventory: updatedInventory,
              gameProgress: updatedProgress
            }
          };
        }
      } else {
        return {
          output: 'The power cell would be more useful at your ship.',
          updatedState: gameState
        };
      }
    
    case 'alienArtifact':
      if (location === 'ship') {
        let output = 'You connect the alien artifact to the ship\'s navigation system. The star charts update with new information!';
        let updatedInventory = [...inventory];
        let updatedProgress = gameProgress;
        
        // Remove the item after use
        updatedInventory = updatedInventory.filter(item => item !== itemId);
        updatedProgress += 1;
        
        if (updatedProgress >= 3 && !inventory.includes('powerCell') && !inventory.includes('repairKit')) {
          output += '\n\nWith the ship\'s systems repaired, the power cell installed, and the alien artifact providing navigation data, your ship is ready for launch! You\'ve successfully completed your mission!';
          
          return {
            output,
            updatedState: {
              ...gameState,
              inventory: updatedInventory,
              gameProgress: updatedProgress,
              gameOver: true,
              won: true
            }
          };
        } else {
          output += '\n\nThe navigation system is working, but you\'ll need more components to fully repair the ship.';
          
          return {
            output,
            updatedState: {
              ...gameState,
              inventory: updatedInventory,
              gameProgress: updatedProgress
            }
          };
        }
      } else if (location === 'pyramid') {
        return {
          output: 'The artifact glows brightly in response to the symbols on the pyramid walls. Strange patterns appear, possibly a map of some kind.',
          updatedState: gameState
        };
      } else {
        return {
          output: 'Nothing happens when you use the artifact here.',
          updatedState: gameState
        };
      }
    
    case 'communicator':
      return {
        output: 'You attempt to call for help, but only static comes through. It seems the communicator is damaged or out of range.',
        updatedState: gameState
      };
    
    default:
      return {
        output: `You're not sure how to use the ${formatItemName(itemId)} here.`,
        updatedState: gameState
      };
  }
};

const handleStatus = (gameState: GameState): CommandResult => {
  const { health, gameProgress } = gameState;
  
  let status = '';
  if (health >= 75) {
    status = 'Good';
  } else if (health >= 50) {
    status = 'Moderate';
  } else if (health >= 25) {
    status = 'Poor';
  } else {
    status = 'Critical';
  }
  
  let objective = '';
  if (gameProgress === 0) {
    objective = 'Explore the area and find a way to repair your ship.';
  } else if (gameProgress < 3) {
    objective = 'Continue gathering components to repair your ship.';
  } else {
    objective = 'Return to your ship to complete repairs and launch!';
  }
  
  return {
    output: `
Health: ${health}% (${status})
Mission Objective: ${objective}
Progress: ${gameProgress}/3 ship components installed
    `,
    updatedState: gameState
  };
};

const handleRestart = (): CommandResult => {
  const output = 'Starting a new game...\n\n' + locations.ship.description;
  
  return {
    output,
    updatedState: { ...initialGameState }
  };
};

// Helper functions
const formatItemName = (itemId: string): string => {
  // Convert camelCase to spaces and capitalize first letter
  return itemId
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

const formatLocationName = (locationId: string): string => {
  // Convert camelCase to spaces and capitalize first letter
  return locationId
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};
