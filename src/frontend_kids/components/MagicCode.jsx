import { Box, Input } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

const MagicCode = ({ updateCode }) => {
  const [inputs, setInputs] = useState(Array(4).fill(""));

  const inputRefs = useRef(inputs.map(() => React.createRef()));

  const handleChange = (value, index) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    updateCode(newInputs.join(''));

    if (value.length > 0 && index < inputs.length - 1) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && inputs[index] === '' && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const paste = event.clipboardData.getData('text').replace(/\n/g, '').split('').slice(0, inputs.length);
    const newInputs = [...inputs];

    // Start pasting from the first input or the current focused input
    let startIndex = inputRefs.current.findIndex(ref => ref.current === document.activeElement);
    startIndex = startIndex === -1 ? 0 : startIndex;

    for (let i = 0; i < paste.length; i++) {
      if (startIndex + i < inputs.length) {
        newInputs[startIndex + i] = paste[i];
        if (inputRefs.current[startIndex + i + 1]) {
          inputRefs.current[startIndex + i + 1].current.focus();
        }
      }
    }

    setInputs(newInputs);
    updateCode(newInputs.join(''));
  };

  useEffect(() => {
    const inputsContainer = document.querySelector(".magic-code-input-container");
    inputsContainer.addEventListener('paste', handlePaste);

    return () => {
      inputsContainer.removeEventListener('paste', handlePaste);
    };
  }, [inputs]);

  return (
    <Box display='flex' gap='2' className='magic-code-input-container'>
      {inputs.map((input, index) => (
        <Input
          type='number'
          key={index}
          ref={inputRefs.current[index]}
          value={input}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
          isRequired
          size='lg'
          textAlign='center'
          className='magic-code-input'
        />
      ))}
    </Box>
  );
};

export default MagicCode;
