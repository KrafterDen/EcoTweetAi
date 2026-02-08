import { useState } from "react";
import { X, Lock, LogIn, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = () => {

    if (username === "admin" && password === "admin") {
      setError("");
      setUsername("");
      setPassword("");
      onLoginSuccess();
      onClose();
    } else {
      setError("Невірний логін або пароль");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <Lock className="w-5 h-5" />
            <span>Admin Access</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="admin"
              autoFocus
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <Button 
            onClick={handleLoginSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
          >
            <LogIn className="w-4 h-4 mr-2" /> Login
          </Button>
        </div>
      </div>
    </div>
  );
}