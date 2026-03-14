import { useState, useEffect } from "react";
import { Trash2, ArrowLeft, RefreshCw, CheckCircle, BrainCircuit } from "lucide-react";
import { Button } from "./ui/button";
import { AdminDemoOverlay } from "./AdminDemoOverlay"; // Інтегруємо AI сюди
import { fetchProblems } from "../utils/api"; 
import type { EcoProblem } from "../types";

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'moderation' | 'ai-demo'>('moderation');
  const [problems, setProblems] = useState<EcoProblem[]>([]);
  const [loading, setLoading] = useState(false);
  

  const [showAiDemo, setShowAiDemo] = useState(false);

  const API_TOKEN = import.meta.env.VITE_API_TOKEN || "dev-token";

  const loadData = async () => {
    setLoading(true);
    try {

      const data = await fetchProblems();
      setProblems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm("Видалити цей запис?")) return;
    try {
        await fetch(`/api/problems/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        setProblems(prev => prev.filter(p => p.id !== id));
    } catch (e) {
        alert("Помилка видалення");
    }
  };

  if (showAiDemo) {
    return <AdminDemoOverlay onClose={() => {
        setShowAiDemo(false);
        loadData(); // Оновити список після генерації
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">

        <div className="w-64 bg-emerald-900 text-white p-6 flex flex-col shrink-0">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                Admin Panel
            </h2>
            
            <nav className="space-y-2 flex-1">
                <button 
                    onClick={() => setActiveTab('moderation')}
                    className={`w-full text-left p-3 rounded transition-colors flex items-center gap-2 ${activeTab === 'moderation' ? 'bg-emerald-800' : 'hover:bg-emerald-800/50'}`}
                >
                    <CheckCircle className="w-4 h-4"/> Модерація
                </button>
                <button 
                    onClick={() => setShowAiDemo(true)}
                    className={`w-full text-left p-3 rounded transition-colors flex items-center gap-2 hover:bg-emerald-800/50`}
                >
                    <BrainCircuit className="w-4 h-4"/> AI Generator
                </button>
            </nav>

            <Button 
                variant="outline" 
                className="mt-auto border-emerald-700 text-emerald-100 hover:bg-emerald-800 hover:text-white" 
                onClick={onClose}
            >
                <ArrowLeft className="w-4 h-4 mr-2"/> На сайт
            </Button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Черга Модерації</h1>
                <Button variant="outline" onClick={loadData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/> 
                    Оновити
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <tr>
                            <th className="p-4 w-20">ID</th>
                            <th className="p-4">Проблема</th>
                            <th className="p-4 w-32">Локація</th>
                            <th className="p-4 w-32">Статус</th>
                            <th className="p-4 w-24 text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map(p => (
                            <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-4 text-gray-400 font-mono text-xs">#{p.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{p.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-md">{p.description}</div>
                                </td>
                                <td className="p-4 text-sm">{p.city || "Unknown"}</td>
                                <td className="p-4">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                        Активний
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {problems.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Записів не знайдено
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}