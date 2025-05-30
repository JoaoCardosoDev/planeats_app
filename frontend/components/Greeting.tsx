import React from 'react';

interface GreetingProps {
  name: string;
}

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Hello, {name}!</h1>
      <p className="mt-2">This is a simple component styled with Tailwind CSS.</p>
    </div>
  );
};

export default Greeting;
