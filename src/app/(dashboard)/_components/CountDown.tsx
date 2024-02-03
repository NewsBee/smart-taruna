import React, { useEffect, useState } from 'react';

const CountDown: React.FC<{ startAt: Date; duration: number; onTimeUp: () => void }> = ({ startAt, duration, onTimeUp }) => {
  const calculateTimeLeft = () => {
    const startTime = new Date(startAt).getTime();
    const endTime = startTime + duration * 60000; // Convert duration from minutes to milliseconds
    const difference = endTime - new Date().getTime();

    let timeLeft: { [key: string]: number } = {
      jam: 0,
      menit: 0,
      detik: 0,
    };

    if (difference > 0) {
      timeLeft = {
        jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
        menit: Math.floor((difference / (1000 * 60)) % 60),
        detik: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);
      
      // Check if time is up
      if (updatedTimeLeft.jam === 0 && updatedTimeLeft.menit === 0 && updatedTimeLeft.detik === 0) {
        onTimeUp(); // Call onTimeUp function when time is up
      }
    }, 1000);

    return () => clearTimeout(timer); // Clean up the timer
  }, [timeLeft, onTimeUp, startAt, duration]); // Added dependencies

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col items-center">
          <span className="text-4xl font-bold">{value < 10 ? `0${value}` : value}</span>
          <span className="text-xs font-medium">{interval.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
};

export default CountDown;
