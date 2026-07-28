import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  if (!stored.startsWith('scrypt$')) return stored === password;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const hash = parts[2];
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      res.status(500).json({ status: 'error', message: 'db_error' });
      return;
    }
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ status: 'error', message: 'unknown' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: '参数错误' });
      return;
    }
    const passwordHash = hashPassword(password);
    const { data, error } = await supabase
      .from('users')
      .insert({ username, password: passwordHash })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(400).json({ success: false, message: '用户名已存在' });
        return;
      }
      res.status(500).json({ success: false, message: '注册失败' });
      return;
    }
    res.json({ success: true, userId: data.id });
  } catch (error) {
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: '参数错误' });
      return;
    }
    const { data, error } = await supabase
      .from('users')
      .select('id, password')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      res.status(500).json({ success: false, message: '登录失败' });
      return;
    }
    if (!data || !verifyPassword(password, data.password)) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }
    res.json({ success: true, userId: data.id });
  } catch {
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

app.get('/api/:userId/characters', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: '获取人物列表失败' });
      return;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: '获取人物列表失败' });
  }
});

app.post('/api/:userId/characters', async (req, res) => {
  try {
    const { name, server } = req.body;
    const userId = Number(req.params.userId);
    const { data, error } = await supabase
      .from('characters')
      .insert({ user_id: userId, name, server })
      .select('id')
      .single();

    if (error) {
      res.status(500).json({ success: false, message: '添加人物失败' });
      return;
    }
    res.json({ success: true, characterId: data.id });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加人物失败' });
  }
});

app.delete('/api/:userId/characters/:characterId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ success: false, message: '删除人物失败' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除人物失败' });
  }
});

app.get('/api/:userId/characters/:characterId/stats', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('character_id', characterId)
      .eq('user_id', userId);

    if (expenseError) {
      res.status(500).json({ success: false, message: '获取统计失败' });
      return;
    }

    const { data: incomes, error: incomeError } = await supabase
      .from('incomes')
      .select('*')
      .eq('character_id', characterId)
      .eq('user_id', userId);

    if (incomeError) {
      res.status(500).json({ success: false, message: '获取统计失败' });
      return;
    }

    const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

    const expenseByType = {
      point: 0,
      month: 0,
      year: 0,
      equipment: 0,
      pet: 0
    };
    expenses.forEach(e => {
      expenseByType[e.type] += parseFloat(e.amount);
    });
    
    const incomeByType = {
      money: 0,
      pet: 0,
      equipment: 0
    };
    incomes.forEach(i => {
      incomeByType[i.type] += parseFloat(i.amount);
    });

    res.json({ totalExpense, totalIncome, expenseByType, incomeByType });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计失败' });
  }
});

app.get('/api/:userId/characters/:characterId/expenses/:type', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const type = req.params.type;
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('character_id', characterId)
      .eq('user_id', userId)
      .eq('type', type)
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: '获取消费记录失败' });
      return;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: '获取消费记录失败' });
  }
});

app.post('/api/:userId/characters/:characterId/expenses', async (req, res) => {
  try {
    const { type, amount, date, note } = req.body;
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        character_id: characterId,
        user_id: userId,
        type,
        amount,
        date,
        note: note || null
      })
      .select('id')
      .single();

    if (error) {
      res.status(500).json({ success: false, message: '添加消费记录失败' });
      return;
    }
    res.json({ success: true, expenseId: data.id });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加消费记录失败' });
  }
});

app.delete('/api/:userId/characters/:characterId/expenses/:expenseId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const expenseId = Number(req.params.expenseId);
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('character_id', characterId)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ success: false, message: '删除消费记录失败' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除消费记录失败' });
  }
});

app.get('/api/:userId/characters/:characterId/incomes/:type', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const type = req.params.type;
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('character_id', characterId)
      .eq('user_id', userId)
      .eq('type', type)
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: '获取收入记录失败' });
      return;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: '获取收入记录失败' });
  }
});

app.post('/api/:userId/characters/:characterId/incomes', async (req, res) => {
  try {
    const { type, amount, date, note } = req.body;
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const { data, error } = await supabase
      .from('incomes')
      .insert({
        character_id: characterId,
        user_id: userId,
        type,
        amount,
        date,
        note: note || null
      })
      .select('id')
      .single();

    if (error) {
      res.status(500).json({ success: false, message: '添加收入记录失败' });
      return;
    }
    res.json({ success: true, incomeId: data.id });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加收入记录失败' });
  }
});

app.delete('/api/:userId/characters/:characterId/incomes/:incomeId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const characterId = Number(req.params.characterId);
    const incomeId = Number(req.params.incomeId);
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', incomeId)
      .eq('character_id', characterId)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ success: false, message: '删除收入记录失败' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除收入记录失败' });
  }
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
