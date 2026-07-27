import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, LogOut } from 'lucide-react';

const API_BASE = '/api';

const INCOME_TYPE_LABELS: Record<string, string> = {
  money: '出菜收入',
  pet: '宝宝收入',
  equipment: '装备收入'
};

interface Character {
  id: number;
  name: string;
  server: string;
}

interface Income {
  id: number;
  type: string;
  amount: number;
  date: string;
  note: string;
}

function IncomeDetail() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId && id && type) {
      loadData();
    }
  }, [userId, id, type]);

  const loadData = async () => {
    try {
      setLoading(true);
      const charsResponse = await fetch(`${API_BASE}/${userId}/characters`);
      const characters = await charsResponse.json();
      const char = characters.find((c: Character) => c.id === parseInt(id!));
      setCharacter(char);

      if (char) {
        const incomeResponse = await fetch(`${API_BASE}/${userId}/characters/${char.id}/incomes/${type}`);
        setIncomes(await incomeResponse.json());
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!userId || !id || isNaN(numAmount) || numAmount <= 0) return;

    try {
      const response = await fetch(`${API_BASE}/${userId}/characters/${id}/incomes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount: numAmount, date, note })
      });
      const data = await response.json();
      if (data.success) {
        loadData();
        setAmount('');
        setNote('');
        setShowAddModal(false);
      } else {
        alert(data.message || '添加失败');
      }
    } catch (error) {
      alert('添加失败，请稍后重试');
    }
  };

  const handleDeleteIncome = async (incomeId: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    if (!userId || !id) return;

    try {
      await fetch(`${API_BASE}/${userId}/characters/${id}/incomes/${incomeId}`, {
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

  const totalAmount = incomes.reduce((sum, i) => sum + (typeof i.amount === 'string' ? parseFloat(i.amount) : i.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">加载中...</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4 text-white">人物不存在</p>
          <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to={`/character/${id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-amber-400">{character.name}</h1>
          <p className="text-2xl text-green-400">{INCOME_TYPE_LABELS[type as keyof typeof INCOME_TYPE_LABELS]}</p>
          <p className="text-4xl font-bold text-green-300 mt-4">¥{totalAmount.toFixed(2)}</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            添加记录
          </button>
        </div>

        <div className="space-y-3">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    {income.date}
                  </div>
                  {income.note && <p className="text-slate-300">{income.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-400">
                    ¥{(typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteIncome(income.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {incomes.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg mb-2">还没有记录</p>
              <p className="text-sm">点击上方按钮添加第一条记录</p>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-green-400">
                添加{INCOME_TYPE_LABELS[type as keyof typeof INCOME_TYPE_LABELS]}记录
              </h2>
              <form onSubmit={handleAddIncome}>
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">金额</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="请输入金额"
                    autoFocus
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-slate-400 mb-2">备注（可选）</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="添加备注"
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
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold hover:shadow-lg transition-all"
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

export default IncomeDetail;
