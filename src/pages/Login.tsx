import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '../context/POSContext';
import { Lock, UserCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = usePOS();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      navigate('/');
    } else {
      setError('Invalid PIN. Try 1234 (Admin) or 0000 (Cashier)');
      setPin('');
    }
  };

  const handleNumpad = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 text-center bg-indigo-600 text-white">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 backdrop-blur-sm">
            <Lock className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Ordino</h1>
          <p className="text-indigo-200 mt-1 text-xs md:text-sm">Enter your PIN to access the terminal</p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleLogin} className="flex flex-col items-center">
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center text-xl md:text-2xl font-bold transition-all ${
                    pin[i] ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {pin[i] ? '•' : ''}
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-xs md:text-sm mb-4 font-medium text-center">{error}</p>}

            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpad(num.toString())}
                  className="h-14 md:h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xl md:text-2xl font-semibold transition-colors shadow-sm border border-slate-100"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDelete}
                className="h-14 md:h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-base md:text-lg font-medium transition-colors border border-slate-200"
              >
                DEL
              </button>
              <button
                type="button"
                onClick={() => handleNumpad('0')}
                className="h-14 md:h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xl md:text-2xl font-semibold transition-colors shadow-sm border border-slate-100"
              >
                0
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="h-14 md:h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-base md:text-lg font-medium transition-colors shadow-md shadow-indigo-200"
              >
                OK
              </button>
            </div>
          </form>
        </div>
        
        <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] md:text-xs text-slate-500 flex items-center justify-center gap-2">
          <UserCircle2 className="w-3 h-3 md:w-4 md:h-4" />
          Admin: 1234 | Cashier: 0000
        </div>
      </div>
    </div>
  );
};
