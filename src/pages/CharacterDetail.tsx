import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, LogOut } from 'lucide-react';

const API_BASE = '/api';

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  point: '通用点卡费',
  month: '月卡费',
  year: '年卡费',
  equipment: '装备费',
  pet: '宝宝费'
};

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

interface Stats {
  totalExpense: number;
  totalIncome: number;
  expenseByType: Record<string, number>;
  incomeByType: Record<string, number>;
}

function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId && id) {
      loadData();
    }
  }, [userId, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const charsResponse = await fetch(`${API_BASE}/${userId}/characters`);
      const characters = await charsResponse.json();
      const char = characters.find((c: Character) => c.id === parseInt(id!));
      setCharacter(char);

      if (char) {
        const statsResponse = await fetch(`${API_BASE}/${userId}/characters/${char.id}/stats`);
        setStats(await statsResponse.json());
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
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
            to="/"
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
          <p className="text-slate-400">{character.server}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-6 h-6 text-red-400" />
              <p className="text-red-400">总消费</p>
            </div>
            <p className="text-3xl font-bold text-red-300">¥{stats?.totalExpense?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <p className="text-green-400">总收入</p>
            </div>
            <p className="text-3xl font-bold text-green-300">¥{stats?.totalIncome?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-amber-400" />
            消费记录
          </h2>
          <div className="space-y-3">
            {Object.entries(EXPENSE_TYPE_LABELS).map(([type, label]) => (
              <Link
                key={type}
                to={`/character/${id}/expense/${type}`}
                className="block bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-red-500/50 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{label}</span>
                  <span className="text-red-400 font-bold text-xl">
                    ¥{(stats?.expenseByType?.[type] || 0).toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            收入记录
          </h2>
          <div className="space-y-3">
            {Object.entries(INCOME_TYPE_LABELS).map(([type, label]) => (
              <Link
                key={type}
                to={`/character/${id}/income/${type}`}
                className="block bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-green-500/50 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{label}</span>
                  <span className="text-green-400 font-bold text-xl">
                    ¥{(stats?.incomeByType?.[type] || 0).toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterDetail;
