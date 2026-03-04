import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export const PasscodeLock = ({ correctPasscode, hint, onSuccess }: { correctPasscode: string, hint: string, onSuccess: () => void }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleInput = (num: string) => {
    if (passcode.length < 6) {
      const newPasscode = passcode + num;
      setPasscode(newPasscode);
      setError(false);

      if (newPasscode.length === 6) {
        if (newPasscode === correctPasscode) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => setPasscode(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1a1818] text-[#e8d8c8] p-6">
      <Lock size={48} className="mb-6 text-[#a49484]" />
      <h2 className="text-xl font-medium mb-2">Enter Passcode</h2>
      {hint && <p className="text-sm text-[#a49484] text-center mb-8 max-w-[250px]">Hint: {hint}</p>}

      <div className={`flex gap-4 mb-12 ${error ? 'animate-bounce text-red-500' : ''}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < passcode.length ? 'bg-current border-current' : 'border-[#3a3532]'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-[280px] w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleInput(num.toString())}
            className="w-16 h-16 rounded-full bg-[#2a2522] flex items-center justify-center text-2xl border-2 border-[#3a3532] active:bg-[#3a3532] transition-colors mx-auto"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleInput('0')}
          className="w-16 h-16 rounded-full bg-[#2a2522] flex items-center justify-center text-2xl border-2 border-[#3a3532] active:bg-[#3a3532] transition-colors mx-auto"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-medium text-[#a49484] active:text-[#e8d8c8] transition-colors mx-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
