import React, { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import "../styles/FrontPageTerminal.css";
import { useNavigate } from "react-router-dom";
import CinematicPage from "../components/CinematicPage";
export default function FrontPageTerminal() {
  const navigate = useNavigate();
  const el = useRef(null);
  const textAreaRef = useRef(null);

  // 1. Create a ref to store the Typed.js instance
  const typedInstance = useRef(null);

  const [userInput, setUserInput] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState("COMMAND");

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
      cursorChar:'█',
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
      "Welcome to the underworld linkedin !  ^1000 <br/> Are you a new user or a returning goon?<br/> ^500",
      "> Type :  Login/Sign Up : ",
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
      const input = userInput.trim(); // Don't lowercase yet, IDs might be case-sensitive

      if (currentStep === "COMMAND") {
        if (input.toLowerCase() === "login") {
          setTerminalHistory((prev) => [
            ...prev,
            `>Type : Login/Sign Up : ${input}`,
          ]);
          setUserInput("");
          setCurrentStep("ID");
          startTypedAnimation([
            "<br/>>ACCESSING DATABASE... ^500 <br/>> ENTER GOON ID: ",
          ]);
        } else if (input.toLowerCase() === "sign up") {
          setTerminalHistory((prev) => [
            ...prev,
            `Type : Login/Sign Up : ${input}`,
          ]);
          setUserInput("");
          setCurrentStep("ID_signup");
          startTypedAnimation([
            "<br/>WELCOME !... ^500 <br/>> ENTER GOON ID: ",
          ]);
        } else {
          startTypedAnimation([
            '<br/>INVALID COMMAND. ^300 <br/>> Type "Login" or "Sign Up": ',
          ]);
          setUserInput("");
        }
      } else if (currentStep === "ID") {
        // Save ID and move to Password
        setTerminalHistory((prev) => [...prev, `> ENTER GOON ID: ${input}`]);
        setLoginData((prev) => ({ ...prev, username: input }));
        setUserInput("");
        getUsers().then((users) => {
          const user = users.find((u) => u.username == input);
          if (!user) {
            startTypedAnimation(["<br/>NO SUCH USER EXISTS ^500 <br/>>"]);
          } else {
            setCurrentStep("PASS");
          }
        });
        startTypedAnimation([
          "<br/>ENCRYPTING CHANNEL... ^500 <br/>> ENTER PASSWORD: ",
        ]);
      } else if (currentStep === "PASS") {
        /*
    const url = 'http://localhost:8080/api/register'; 

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  // This is the data he is sending to your backend
  body: JSON.stringify({
    username: "test_user_1",
    password: "password123"
  })
})
.then(response => response.json())
.then(data => {
  console.log("Success! Backend says:", data);
})
.catch(error => console.error("Error:", error));
    
    */

        /*
const url = 'http://localhost:8080/api/users';

fetch(url)
  .then(response => response.json())
  .then(usersList => {
    console.log("All registered users:", usersList);
  })
  .catch(error => console.error("Error fetching users:", error));

*/
        // Final Step: Password entered
        setTerminalHistory((prev) => [...prev, `> ENTER PASSWORD: ********`]);
        console.log(input);
        setLoginData((prev) => ({ ...prev, pass: input }));
        setUserInput("");

        // Here you would call your handleLogin(loginData.username, input) function
        startTypedAnimation(["<br/>VERIFYING... ^800 " + loginData.username]);
        const url = "http://sicari.works/api/users";
        fetch(url)
          .then((response) => response.json())
          .then((usersList) => {
            console.log("All registered users:", usersList, typeof usersList);
            const user = usersList.find(
              (u) => u.username == loginData.username,
            );
            if (user) {
              console.log(user);
              if (user.password == input) {
                startTypedAnimation(
                  [
                    "<br/>ACCESS GRANTED. Welcome, ^500" + loginData.username,
                    "^200",
                  ],
                  () => {
                    navigate("/feed");
                  },
                );
              } else {
                startTypedAnimation([
                  "<br/>INVALID PASSWORD, TRY AGAIN . . . ^500" +
                    loginData.username,
                ]);
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            startTypedAnimation([
              "<br/>SERVER DOWN :( ^800 " + loginData.username,
            ]);
          });
      } else if (currentStep === "ID_signup") {
        setTerminalHistory((prev) => [...prev, `> ENTER GOON ID: ${input}`]);
        getUsers().then((users) => {
          const user = users.find((u) => u.username == input);
          if (!user) {
            setLoginData((prev) => ({ ...prev, username: input }));
            setCurrentStep("PASS_signup");
            // setCurrentStep("PASS");
            setUserInput("");
            startTypedAnimation([
              "<br/>ENCRYPTING CHANNEL... ^500 <br/>> ENTER PASSWORD: ",
            ]);
          } else {
            startTypedAnimation(["<br/>USERNAME ALREADY IN USE ! ^500 "]);
          }
        });
      } else if (currentStep === "PASS_signup") {
        // Final Step: Password entered
        setTerminalHistory((prev) => [...prev, `> ENTER PASSWORD: ********`]);
        setLoginData((prev) => ({ ...prev, pass: input }));
        setUserInput("");
        startTypedAnimation([
          "<br/>Storing in database ^800 " + loginData.username,
        ]);
        console.log(loginData);
        const url = "http://sicari.works/api/register";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // This is the data he is sending to your backend
          body: JSON.stringify({
            username: loginData.username,
            password: input,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success! Backend says:", data);
            finished();
          })
          .catch((error) => {
            console.error("Error:", error);
            startTypedAnimation([
              "<br/>Server Down :(^800 " + loginData.username,
            ]);
          });
        // Here you would call your handleLogin(loginData.username, input) function
      }
    }
  };
  function finished() {
    startTypedAnimation(["<br/> ^800 Welcome  " + loginData.username], () => {
      navigate("/feed");
    });
    //redirecting
  }

  const url = "http://sicari.works/api/users";

  async function getUsers() {
    try {
      const response = await fetch(url);

      // Check if the server returned an error (like 404 or 500)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const usersList = await response.json();
      console.log("All registered users:", usersList);
      return usersList; // Return the data so you can use it elsewhere
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

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
