import { useParams, Link } from 'react-router-dom';
import useAppStore from '../store';
import { EXPENSE_TYPE_LABELS, INCOME_TYPE_LABELS } from '../types';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const { characters, getCharacterStats } = useAppStore();
  const character = characters.find(c => c.id === id);

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

  const stats = getCharacterStats(character.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </Link>

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
            <p className="text-3xl font-bold text-red-300">¥{stats.totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <p className="text-green-400">总收入</p>
            </div>
            <p className="text-3xl font-bold text-green-300">¥{stats.totalIncome.toFixed(2)}</p>
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
                  <span className="font-semibold text-lg">{label as string}</span>
                  <span className="text-red-400 font-bold text-xl">
                    ¥{stats.expenseByType[type as keyof typeof stats.expenseByType].toFixed(2)}
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
                  <span className="font-semibold text-lg">{label as string}</span>
                  <span className="text-green-400 font-bold text-xl">
                    ¥{stats.incomeByType[type as keyof typeof stats.incomeByType].toFixed(2)}
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
