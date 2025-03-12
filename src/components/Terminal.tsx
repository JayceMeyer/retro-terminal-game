import React, { useState, useRef, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { TypeAnimation } from 'react-type-animation';
import { processCommand } from '../game/CommandProcessor';
import { ColorScheme, HistoryEntry } from '../types/types';
import { initialGameState } from '../game/GameState';

const TerminalContainer = styled.div`
  width: 90%;
  height: 90%;
  max-width: 1000px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.primary};
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 0 0 20px ${props => props.theme.primary}, 
              inset 0 0 10px ${props => props.theme.primary};
  font-size: 1.2rem;
  line-height: 1.5;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      transparent 0px,
      rgba(0, 0, 0, 0.1) 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const TerminalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px;
  border-bottom: 1px solid ${props => props.theme.primary};
`;

const TerminalTitle = styled.div`
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const TerminalOutput = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 10px;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.background};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.primary};
    border-radius: 20px;
  }
`;

const TerminalInput = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.background};
  border-top: 1px solid ${props => props.theme.primary};
  padding: 10px;
`;

const Prompt = styled.span`
  color: ${props => props.theme.primary};
  margin-right: 10px;
`;

const Input = styled.input`
  flex: 1;
  background-color: transparent;
  border: none;
  color: ${props => props.theme.text};
  font-family: inherit;
  font-size: inherit;
  outline: none;
  caret-color: ${props => props.theme.cursor};
  
  &::selection {
    background-color: ${props => props.theme.highlight};
  }
`;

const OutputLine = styled.div<{ isError?: boolean }>`
  margin: 5px 0;
  color: ${props => props.isError ? '#ff0000' : props.theme.text};
  word-break: break-word;
`;

const CommandLine = styled.div`
  margin: 5px 0;
  margin-top: 15px;
  
  .prompt {
    color: ${props => props.theme.primary};
    margin-right: 10px;
  }
  
  .command {
    color: ${props => props.theme.text};
  }
`;

const ThemeSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const ThemeOption = styled.div<{ color: string; isSelected: boolean }>`
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${props => props.isSelected ? '#ffffff' : 'transparent'};
`;

const TypedLine = ({ text, delay = 2000 }: { text: string; delay?: number }) => {
  return (
    <TypeAnimation
      sequence={[
        text,
        delay,
      ]}
      wrapper="span"
      cursor={false}
      speed={80}
      style={{ display: 'inline-block' }}
    />
  );
};

const WELCOME_MESSAGE = `
▄▄▄█████▓▓█████  ██▀███   ███▄ ▄███▓ ██▓ ███▄    █  ▄▄▄       ██▓    
▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒▓██▒▀█▀ ██▒▓██▒ ██ ▀█   █ ▒████▄    ▓██▒    
▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒▓██    ▓██░▒██▒▓██  ▀█ ██▒▒██  ▀█▄  ▒██░    
░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄  ▒██    ▒██ ░██░▓██▒  ▐▌██▒░██▄▄▄▄██ ▒██░    
  ▒██▒ ░ ░▒████▒░██▓ ▒██▒▒██▒   ░██▒░██░▒██░   ▓██░ ▓█   ▓██▒░██████▒
  ▒ ░░   ░░ ▒░ ░░ ▒▓ ░▒▓░░ ▒░   ░  ░░▓  ░ ▒░   ▒ ▒  ▒▒   ▓▒█░░ ▒░▓  ░
    ░     ░ ░  ░  ░▒ ░ ▒░░  ░      ░ ▒ ░░ ░░   ░ ▒░  ▒   ▒▒ ░░ ░ ▒  ░
  ░         ░     ░░   ░ ░      ░    ▒ ░   ░   ░ ░   ░   ▒     ░ ░   
            ░  ░   ░            ░    ░           ░       ░  ░    ░  ░
                                                                     
ADVENTURE v1.0.0
Type 'help' to see available commands.
`;

const Terminal: React.FC = () => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [gameState, setGameState] = useState(initialGameState);
  const { theme, changeTheme } = useContext(ThemeContext);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const colorOptions: { color: ColorScheme; hex: string }[] = [
    { color: 'green', hex: '#00ff00' },
    { color: 'red', hex: '#ff0000' },
    { color: 'blue', hex: '#0000ff' },
    { color: 'amber', hex: '#ffbf00' },
    { color: 'white', hex: '#ffffff' }
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && command.trim()) {
      e.preventDefault();
      executeCommand(command);
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    
    // Process the command
    const { output, updatedState, isError } = processCommand(trimmedCmd, gameState);
    
    // Update game state
    setGameState(updatedState);
    
    // Add to history
    setHistory(prev => [...prev, { command: trimmedCmd, result: output, isError }]);
    
    // Clear the input
    setCommand('');
  };

  const handleThemeChange = (newTheme: ColorScheme) => {
    changeTheme(newTheme);
  };

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalTitle>RETRO ADVENTURE TERMINAL</TerminalTitle>
        <ThemeSelector>
          {colorOptions.map((option) => (
            <ThemeOption
              key={option.color}
              color={option.hex}
              isSelected={theme === option.color}
              onClick={() => handleThemeChange(option.color)}
            />
          ))}
        </ThemeSelector>
      </TerminalHeader>
      
      <TerminalOutput ref={outputRef}>
        <pre><TypedLine text={WELCOME_MESSAGE} /></pre>
        
        {history.map((entry, index) => (
          <React.Fragment key={index}>
            <CommandLine>
              <span className="prompt">&gt;</span>
              <span className="command">{entry.command}</span>
            </CommandLine>
            <OutputLine isError={entry.isError}>
              <TypedLine text={entry.result} />
            </OutputLine>
          </React.Fragment>
        ))}
      </TerminalOutput>
      
      <TerminalInput>
        <Prompt>&gt;</Prompt>
        <Input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </TerminalInput>
    </TerminalContainer>
  );
};

export default Terminal;
