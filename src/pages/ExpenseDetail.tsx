import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, LogOut } from 'lucide-react';

const API_BASE = '/api';

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  point: '通用点卡费',
  month: '月卡费',
  year: '年卡费',
  equipment: '装备费',
  pet: '宝宝费'
};

interface Character {
  id: number;
  name: string;
  server: string;
}

interface Expense {
  id: number;
  type: string;
  amount: number;
  date: string;
  note: string;
}

function ExpenseDetail() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
        const expenseResponse = await fetch(`${API_BASE}/${userId}/characters/${char.id}/expenses/${type}`);
        setExpenses(await expenseResponse.json());
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!userId || !id || isNaN(numAmount) || numAmount <= 0) return;

    try {
      const response = await fetch(`${API_BASE}/${userId}/characters/${id}/expenses`, {
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

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    if (!userId || !id) return;

    try {
      await fetch(`${API_BASE}/${userId}/characters/${id}/expenses/${expenseId}`, {
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

  const totalAmount = expenses.reduce((sum, e) => sum + (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount), 0);

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
          <p className="text-2xl text-red-400">{EXPENSE_TYPE_LABELS[type as keyof typeof EXPENSE_TYPE_LABELS]}</p>
          <p className="text-4xl font-bold text-red-300 mt-4">¥{totalAmount.toFixed(2)}</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            添加记录
          </button>
        </div>

        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    {expense.date}
                  </div>
                  {expense.note && <p className="text-slate-300">{expense.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-400">
                    ¥{(typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg mb-2">还没有记录</p>
              <p className="text-sm">点击上方按钮添加第一条记录</p>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-red-400">
                添加{EXPENSE_TYPE_LABELS[type as keyof typeof EXPENSE_TYPE_LABELS]}记录
              </h2>
              <form onSubmit={handleAddExpense}>
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">金额</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-red-500 focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-slate-400 mb-2">备注（可选）</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-red-500 focus:outline-none transition-colors"
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
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-semibold hover:shadow-lg transition-all"
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

export default ExpenseDetail;
