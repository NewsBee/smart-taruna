// QuizContext.js
import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [isTimeUp, setIsTimeUp] = useState(false);

  return (
    <QuizContext.Provider value={{ isTimeUp, setIsTimeUp }}>
      {children}
    </QuizContext.Provider>
  );
};
