import React, { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import "../styles/FrontPageTerminal.css";
import { useNavigate } from "react-router-dom";
import CinematicPage from "../components/CinematicPage";

export default function FrontPageTerminal() {
  const navigate = useNavigate();
  const el = useRef(null);
  const textAreaRef = useRef(null);

  // Production API base for deployed frontend.
  const apiBaseUrl = "https://api.sicari.works";

  // 1. Create a ref to store the Typed.js instance
  const typedInstance = useRef(null);

  const [userInput, setUserInput] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState("ROLE");
  const [isProcessingInput, setIsProcessingInput] = useState(false);

  // 2. Wrap the animation logic to handle cleanup
  const startTypedAnimation = (strings, callback = null) => {
    // Kill any existing animation before starting a new one
    if (typedInstance.current) {
      typedInstance.current.destroy();
    }

    setIsTypingDone(false);

    typedInstance.current = new Typed(el.current, {
      strings: strings,
      typeSpeed: 30,
      showCursor: true, // Keep this false since you have a manual one
      cursorChar: "█",
      contentType: "html",
      preStringTyped: (arrayPos, self) => {
        self.cursor.style.display = "inline-block";
      },
      onComplete: (self) => {
        setIsTypingDone(true);
        self.cursor.style.display = "none";
        if (callback) {
          callback();
        }
        // Ensure focus after animation finishes
        setTimeout(() => textAreaRef.current?.focus(), 10);
      },
    });
  };

  // Initial Boot
  useEffect(() => {
    startTypedAnimation([
      "Welcome to the underworld linkedin !  ^1000 <br/> Are you a Sicario or a Fixer?<br/> ^500",
      "> Type :  Sicario/Fixer : ",
    ]);

    // Cleanup on component unmount
    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy();
      }
    };
  }, []);

  const [loginData, setLoginData] = useState({ username: "", pass: "" });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isTypingDone || isProcessingInput) {
        return;
      }
      const input = userInput.trim(); // Don't lowercase yet, IDs might be case-sensitive
      if (!input) {
        return;
      }
      setIsProcessingInput(true);

      if (currentStep === "ROLE") {
        const roleInput = input.toLowerCase();
        if (roleInput === "sicario" || roleInput === "fixer") {
          setTerminalHistory((prev) => [
            ...prev,
            `> Type :  sicario/fixer : ${input}`,
          ]);
          setUserInput("");
          setCurrentStep("COMMAND");
          startTypedAnimation(["<br/>> Type : Login/Sign Up : "]);
          setIsProcessingInput(false);
        } else {
          startTypedAnimation([
            '<br/>INVALID ROLE. ^300 <br/>> Type "Sicario" or "Fixer": ',
          ]);
          setUserInput("");
          setIsProcessingInput(false);
        }
      } else if (currentStep === "COMMAND") {
        if (input.toLowerCase() === "login") {
          setTerminalHistory((prev) => [
            ...prev,
            `>Type : Login/Sign Up : ${input}`,
          ]);
          setUserInput("");
          setCurrentStep("ID");
          startTypedAnimation([
            "<br/>>ACCESSING DATABASE... ^500 <br/>> ENTER Sicario ID: ",
          ]);
          setIsProcessingInput(false);
        } else if (input.toLowerCase() === "sign up") {
          setTerminalHistory((prev) => [
            ...prev,
            `Type : Login/Sign Up : ${input}`,
          ]);
          setUserInput("");
          setCurrentStep("ID_signup");
          startTypedAnimation([
            "<br/>WELCOME !... ^500 <br/>> ENTER Sicario ID: ",
          ]);
          setIsProcessingInput(false);
        } else {
          startTypedAnimation([
            '<br/>INVALID COMMAND. ^300 <br/>> Type "Login" or "Sign Up": ',
          ]);
          setUserInput("");
          setIsProcessingInput(false);
        }
      } else if (currentStep === "ID") {
        // Login Flow: Save ID and move to Password
        setTerminalHistory((prev) => [...prev, `> ENTER Sicario ID: ${input}`]);
        setLoginData((prev) => ({ ...prev, username: input }));
        setUserInput("");
        setCurrentStep("PASS");
        startTypedAnimation([
          "<br/>ENCRYPTING CHANNEL... ^500 <br/>> ENTER PASSWORD: ",
        ]);
        setIsProcessingInput(false);
      } else if (currentStep === "PASS") {
        // Login Flow: Password entered, call the API
        setTerminalHistory((prev) => [...prev, `> ENTER PASSWORD: ********`]);
        const password = input;
        setUserInput("");
        setIsProcessingInput(true);

        startTypedAnimation(["<br/>VERIFYING... ^800 "]);
        
        // 
        fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // REQUIRES COOKIES
          body: JSON.stringify({
            username: loginData.username,
            password: password,
          }),
        })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data?.message || "Login failed");
            }
            return data;
          })
          .then((data) => {
            // SUCCESS! The cookie is now set by the browser.
            startTypedAnimation(
              [`<br/>ACCESS GRANTED. Welcome, ^500${data.user.username}`],
              () => navigate("/feed"),
            );
          })
          .catch((error) => {
            console.error("Login error:", error);
            // Show the actual error from the server
            startTypedAnimation([
              `<br/>LOGIN FAILED: ${error.message}. ^800 <br/>> Type "Login" or "Sign Up": `,
            ]);
            setCurrentStep("COMMAND"); // Go back to the command prompt
            setIsProcessingInput(false);
          });
      } else if (currentStep === "ID_signup") {
        // Sign Up Flow: Save ID and move to Password
        setTerminalHistory((prev) => [...prev, `> ENTER sicario ID: ${input}`]);
        setLoginData({ username: input, pass: "" }); // Set new username
        setUserInput("");
        setCurrentStep("PASS_signup");
        startTypedAnimation([
          "<br/>ENCRYPTING CHANNEL... ^500 <br/>> ENTER PASSWORD: ",
        ]);
        setIsProcessingInput(false);
      } else if (currentStep === "PASS_signup") {
        
        setTerminalHistory((prev) => [...prev, `> ENTER PASSWORD: ********`]);
        const password = input;
        setUserInput("");
        setIsProcessingInput(true);

        startTypedAnimation(["<br/>CREATING IDENTITY... ^800 "]);

        fetch(`${apiBaseUrl}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // REQUIRES COOKIES
          // This is the data he is sending to your backend
          body: JSON.stringify({
            username: loginData.username,
            password: password,
          }),
        })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
              // This will catch "Username already in use"
              throw new Error(
                data?.message || `Registration failed: ${response.status}`,
              );
            }
            return data;
          })
          .then((data) => {
            startTypedAnimation(
              [
                `<br/>REGISTRATION COMPLETE. Welcome, ^500${data.user.username}`,
              ],
              () => navigate("/feed"),
            );
          })
          .catch((error) => {
            console.error("Registration error:", error);
            startTypedAnimation([
              `<br/>REGISTRATION FAILED: ${error.message}. ^800 <br/>> Type "Login" or "Sign Up": `,
            ]);
            setCurrentStep("COMMAND");
            setIsProcessingInput(false);
          });
      } else {
        setIsProcessingInput(false);
      }
    }
  };

  return (
    <CinematicPage>
      <div
        onClick={() => textAreaRef.current?.focus()}
        className="terminalParent relative text-2xl font-bold tracking-wider leading-10 p-6 text-[#00FF41] font-mono before:content-[''] before:bg-[url('/assets/grain.gif')] before:z-10 before:w-screen before:h-screen before:block before:absolute before:opacity-7 before: bg-black h-screen overflow-hidden before:left-0 before:top-0 "
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
              <span className="terminal-cursor ">█</span>
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
    </CinematicPage>
  );
}