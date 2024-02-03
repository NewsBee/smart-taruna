// import React, { useState, useEffect } from 'react';

// const CountdownTimer = ({ duration , onTimeUp }) => {
//   const [timeLeft, setTimeLeft] = useState(duration * 60); // converting duration to seconds

//   useEffect(() => {
//     // exit early when we reach 0
//     if (!timeLeft) {
//       onTimeUp();
//       return;
//     }

//     // save intervalId to clear the interval when the component re-renders
//     const intervalId = setInterval(() => {
//       setTimeLeft(timeLeft - 1);
//     }, 1000);

//     // clear interval on re-render to avoid memory leaks
//     return () => clearInterval(intervalId);
//   }, [timeLeft, onTimeUp]);

//   // format timeLeft into minutes and seconds for display
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;

//   return (
//     <div>
//       Time left: {minutes}:{seconds < 10 ? '0' : ''}{seconds}
//     </div>
//   );
// };

// export default CountdownTimer;
