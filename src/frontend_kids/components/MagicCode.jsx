import { Box, Input } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

const MagicCode = ({ updateCode }) => {
  // State to hold the values of each input
  const [inputs, setInputs] = useState(Array(4).fill(""));

  // Array of refs to access inputs
  const inputRefs = useRef(inputs.map(() => React.createRef()));

  // Handle change in inputs
  const handleChange = (value, index) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    updateCode(newInputs.join(''));

    // Automatically move to next input if there's a next input and current input is filled
    if (value.length > 0 && index < inputs.length - 1) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  // Handle backspace for empty inputs to move focus to previous input
  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && inputs[index] === '' && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  return (
    <Box display='flex' gap='2'>
      {inputs.map((input, index) => (
        <Input
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
