import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import '../styles/FrontPageTerminal.css'
export default function FrontPageTerminal() {
  // Create reference to store the DOM element containing the animation
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi architecto amet ducimus eum aperiam esse distinctio, dolorum sequi nostrum eius quaerat eveniet earum voluptatum debitis dicta voluptatibus deserunt ipsam. Tenetur!'],
      typeSpeed: 50,
    });
    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);

  return (
    <div className="text-3xl font-bold tracking-wider leading-10 p-3 text-[#00FF41] font-['Courier Prime'] bg-black h-screen">
      <div className="terminalText">
      <span ref={el} />
      </div>
      <div className="overlay bg-[url('../assets/overlay.webp')] w-full h-full absolute left-0 top-0 opacity-80 z-10 bg-contain mix-blend-darken"></div>
    </div>
  );
}