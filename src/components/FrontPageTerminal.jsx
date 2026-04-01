import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import '../styles/FrontPageTerminal.css'
export default function FrontPageTerminal() {
  // Create reference to store the DOM element containing the animation
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['Welcome to the underworld linkedin ! 😈 ^1000 <br/> Are you a new user or a returning goon?<br/> ^500','Type :  Login/Sign Up : '],
      typeSpeed: 50,
      backSpeed:1,
      smartBackspace:false,
      contentType:'html',
      onComplete:(self)=>{
        self.cursor.style.display="none";
      }
    });
    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);

  return (
    <div className="text-3xl font-bold tracking-wider leading-10 p-3 text-[#00FF41] font-['Courier Prime'] bg-black h-screen overflow-hidden">
      <div className="terminalText">
      <span ref={el} />
      </div>
      <div className="overlay w-full h-full absolute left-0 top-0 opacity-80 z-10 bg-contain mix-blend-darken pointer-events-none" ></div>
      <textarea name="terminalInput" id="terminalInput" className='border-none outline-0 w-full h-full resize-none '></textarea>
    </div>
  );
}