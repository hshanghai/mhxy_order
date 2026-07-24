import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('username', username);
        navigate('/');
      } else {
        alert(data.message || '注册失败');
      }
    } catch (error) {
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            梦幻西游消费记录
          </h1>
          <p className="text-slate-400">创建您的账户</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">用户名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-amber-500 focus:outline-none text-white"
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-amber-500 focus:outline-none text-white"
                placeholder="请输入密码"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 rounded-xl border border-slate-600 focus:border-amber-500 focus:outline-none text-white"
                placeholder="请再次输入密码"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-slate-400">
            已有账户？{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
