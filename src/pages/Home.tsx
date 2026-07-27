import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, LogOut } from 'lucide-react';

const API_BASE = '/api';

interface Character {
  id: number;
  name: string;
  server: string;
  created_at: string;
}

interface Stats {
  totalExpense: number;
  totalIncome: number;
  expenseByType: Record<string, number>;
  incomeByType: Record<string, number>;
}

function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [stats, setStats] = useState<Record<number, Stats>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newServer, setNewServer] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const charsResponse = await fetch(`${API_BASE}/${userId}/characters`);
      const charsData = await charsResponse.json();
      setCharacters(charsData);

      const statsData: Record<number, Stats> = {};
      for (const char of charsData) {
        const statsResponse = await fetch(`${API_BASE}/${userId}/characters/${char.id}/stats`);
        statsData[char.id] = await statsResponse.json();
      }
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newName || !newServer) return;

    try {
      const response = await fetch(`${API_BASE}/${userId}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, server: newServer })
      });
      const data = await response.json();
      if (data.success) {
        loadData();
        setNewName('');
        setNewServer('');
        setShowAddModal(false);
      } else {
        alert(data.message || '添加失败');
      }
    } catch (error) {
      alert('添加失败，请稍后重试');
    }
  };

  const handleDeleteCharacter = async (characterId: number) => {
    if (!confirm('确定要删除这个人物吗？这将同时删除所有相关记录。')) return;
    if (!userId) return;

    try {
      await fetch(`${API_BASE}/${userId}/characters/${characterId}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (error) {
      alert('删除失败，请稍后重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-2">加载中...</p>
          <p className="text-slate-400">正在连接数据库</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-slate-400">
            欢迎，<span className="text-amber-400">{localStorage.getItem('username')}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            梦幻西游消费记录
          </h1>
          <p className="text-slate-400">记录您的游戏消费与收入（数据云端同步）</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            添加人物
          </button>
        </div>

        <div className="space-y-4">
          {characters.map((character) => {
            const charStats = stats[character.id] || { totalExpense: 0, totalIncome: 0 };
            return (
              <div
                key={character.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-400">{character.name}</h3>
                    <p className="text-slate-400 text-sm">{character.server}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character.id);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-500/10 rounded-xl p-4">
                    <p className="text-red-400 text-sm mb-1">总消费</p>
                    <p className="text-2xl font-bold text-red-300">
                      ¥{charStats.totalExpense?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4">
                    <p className="text-green-400 text-sm mb-1">总收入</p>
                    <p className="text-2xl font-bold text-green-300">
                      ¥{charStats.totalIncome?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/character/${character.id}`}
                  className="block w-full py-3 bg-slate-700/50 rounded-xl text-center hover:bg-slate-700 transition-colors"
                >
                  查看详情
                </Link>
              </div>
            );
          })}

          {characters.length === 0 && !loading && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg mb-2">还没有添加人物</p>
              <p className="text-sm">点击上方按钮添加您的第一个人物</p>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-amber-400">添加人物</h2>
              <form onSubmit={handleAddCharacter}>
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">人物名称</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="请输入人物名称"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-slate-400 mb-2">服务器</label>
                  <input
                    type="text"
                    value={newServer}
                    onChange={(e) => setNewServer(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="请输入服务器名称"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
