import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';
import '../styles/FrontPageTerminal.css';

export default function FrontPageTerminal() {
  const el = useRef(null);
  const textAreaRef = useRef(null);
  
  // 1. Create a ref to store the Typed.js instance
  const typedInstance = useRef(null);

  const [userInput, setUserInput] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState("COMMAND");

  // 2. Wrap the animation logic to handle cleanup
  const startTypedAnimation = (strings) => {
    // Kill any existing animation before starting a new one
    if (typedInstance.current) {
      typedInstance.current.destroy();
    }

    setIsTypingDone(false);

    typedInstance.current = new Typed(el.current, {
      strings: strings,
      typeSpeed: 50,
      showCursor: false, // Keep this false since you have a manual one
      contentType: 'html',
      onComplete: (self) => {
        setIsTypingDone(true);
        // Ensure focus after animation finishes
        setTimeout(() => textAreaRef.current?.focus(), 10);
      }
    });
  };

  // Initial Boot
  useEffect(() => {
    startTypedAnimation([
      'Welcome to the underworld linkedin ! 😈 ^1000 <br/> Are you a new user or a returning goon?<br/> ^500', 
      'Type :  Login/Sign Up : '
    ]);

    // Cleanup on component unmount
    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy();
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = userInput.trim().toLowerCase();
      
      // Save the line to history
      setTerminalHistory(prev => [...prev, `Type : Login/Sign Up : ${userInput}`]);
      setUserInput(""); 

      if (currentStep === "COMMAND") {
        if (command === "login") {
          setCurrentStep("ID");
          startTypedAnimation(['<br/>ACCESSING DATABASE... ^500 <br/>ENTER GOON ID: ']);
        } else {
          startTypedAnimation(['<br/>INVALID COMMAND. ^300 <br/>Type "Login" or "Sign Up": ']);
        }
      }
    }
  };

  return (
    <div 
      onClick={() => textAreaRef.current?.focus()}
      className="relative text-2xl font-bold tracking-wider leading-10 p-6 text-[#00FF41] font-mono bg-black h-screen overflow-hidden"
    >
      <div className="terminal-content">
        {terminalHistory.map((line, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
        ))}

        {/* The target for Typed.js */}
        <span ref={el} />

        {/* Manual Cursor: Only shows when Typed.js is NOT typing */}
        {isTypingDone && (
          <span className="text-[#00FF41]">
            {userInput}
            <span className="terminal-cursor">█</span>
          </span>
        )}
      </div>

      <textarea
        ref={textAreaRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 p-0 m-0 w-0 h-0 pointer-events-none"
      />

      <div className="scanlines absolute inset-0 pointer-events-none opacity-40"></div>
    </div>
  );
}