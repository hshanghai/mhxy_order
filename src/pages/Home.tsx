import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../store';
import { EXPENSE_TYPE_LABELS, INCOME_TYPE_LABELS } from '../types';
import { Plus, Trash2 } from 'lucide-react';

function Home() {
  const { characters, getCharacterStats, addCharacter, deleteCharacter } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newServer, setNewServer] = useState('');

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newServer) {
      addCharacter(newName, newServer);
      setNewName('');
      setNewServer('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            梦幻西游消费记录
          </h1>
          <p className="text-slate-400">记录您的游戏消费与收入</p>
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
            const stats = getCharacterStats(character.id);
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
                      if (confirm('确定要删除这个人物吗？这将同时删除所有相关记录。')) {
                        deleteCharacter(character.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-500/10 rounded-xl p-4">
                    <p className="text-red-400 text-sm mb-1">总消费</p>
                    <p className="text-2xl font-bold text-red-300">¥{stats.totalExpense.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4">
                    <p className="text-green-400 text-sm mb-1">总收入</p>
                    <p className="text-2xl font-bold text-green-300">¥{stats.totalIncome.toFixed(2)}</p>
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

          {characters.length === 0 && (
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
