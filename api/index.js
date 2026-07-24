import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS characters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        server VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        character_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('point', 'month', 'year', 'equipment', 'pet') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS incomes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        character_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('money', 'pet', 'equipment') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

initDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );
    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: '用户名已存在' });
    } else {
      res.status(500).json({ success: false, message: '注册失败' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (users.length > 0) {
      res.json({ success: true, userId: users[0].id });
    } else {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

app.get('/api/:userId/characters', async (req, res) => {
  try {
    const [characters] = await pool.execute(
      'SELECT * FROM characters WHERE user_id = ?',
      [req.params.userId]
    );
    res.json(characters);
  } catch (error) {
    res.status(500).json({ success: false, message: '获取人物列表失败' });
  }
});

app.post('/api/:userId/characters', async (req, res) => {
  try {
    const { name, server } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO characters (user_id, name, server) VALUES (?, ?, ?)',
      [req.params.userId, name, server]
    );
    res.json({ success: true, characterId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加人物失败' });
  }
});

app.delete('/api/:userId/characters/:characterId', async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM characters WHERE id = ? AND user_id = ?',
      [req.params.characterId, req.params.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除人物失败' });
  }
});

app.get('/api/:userId/characters/:characterId/stats', async (req, res) => {
  try {
    const [expenses] = await pool.execute(
      'SELECT * FROM expenses WHERE character_id = ? AND user_id = ?',
      [req.params.characterId, req.params.userId]
    );
    const [incomes] = await pool.execute(
      'SELECT * FROM incomes WHERE character_id = ? AND user_id = ?',
      [req.params.characterId, req.params.userId]
    );
    
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
    const [expenses] = await pool.execute(
      'SELECT * FROM expenses WHERE character_id = ? AND user_id = ? AND type = ? ORDER BY date DESC',
      [req.params.characterId, req.params.userId, req.params.type]
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ success: false, message: '获取消费记录失败' });
  }
});

app.post('/api/:userId/characters/:characterId/expenses', async (req, res) => {
  try {
    const { type, amount, date, note } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO expenses (character_id, user_id, type, amount, date, note) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.characterId, req.params.userId, type, amount, date, note]
    );
    res.json({ success: true, expenseId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加消费记录失败' });
  }
});

app.delete('/api/:userId/characters/:characterId/expenses/:expenseId', async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM expenses WHERE id = ? AND character_id = ? AND user_id = ?',
      [req.params.expenseId, req.params.characterId, req.params.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除消费记录失败' });
  }
});

app.get('/api/:userId/characters/:characterId/incomes/:type', async (req, res) => {
  try {
    const [incomes] = await pool.execute(
      'SELECT * FROM incomes WHERE character_id = ? AND user_id = ? AND type = ? ORDER BY date DESC',
      [req.params.characterId, req.params.userId, req.params.type]
    );
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ success: false, message: '获取收入记录失败' });
  }
});

app.post('/api/:userId/characters/:characterId/incomes', async (req, res) => {
  try {
    const { type, amount, date, note } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO incomes (character_id, user_id, type, amount, date, note) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.characterId, req.params.userId, type, amount, date, note]
    );
    res.json({ success: true, incomeId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加收入记录失败' });
  }
});

app.delete('/api/:userId/characters/:characterId/incomes/:incomeId', async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM incomes WHERE id = ? AND character_id = ? AND user_id = ?',
      [req.params.incomeId, req.params.characterId, req.params.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除收入记录失败' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
