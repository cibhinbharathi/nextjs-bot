import React, { useState, useEffect } from 'react';



const typingSpeed = 10;

interface TypingEffectProps {
  text: string;
  delay?: number;  // Optional delay prop
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState("");
  const [paraIndex, setParaIndex] = useState(0);
  const paragraphs = text.split("\n");

  useEffect(() => {
    if (paraIndex < paragraphs.length) {
      const currentPara = paragraphs[paraIndex];
      for (let i = 0; i < currentPara.length; i++) {
        setTimeout(() => {
          setDisplayText((prev) => prev + currentPara[i]);
          if (i === currentPara.length - 1 && paraIndex < paragraphs.length - 1) {
            setDisplayText((prev) => prev + '\n');
            setTimeout(() => {
              setParaIndex((prev) => prev + 1);
            }, delay);
          }
        }, i * typingSpeed);
      }
    }
  }, [paraIndex]);

  return <>{displayText}</>;
}
export default TypingEffect;
