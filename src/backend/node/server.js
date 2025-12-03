const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// --- CONFIGURAÇÃO DO BANCO ---

const mongoUri = 'mongodb://localhost:27017/barrydb'; 

console.log('⏳ Tentando conectar ao MongoDB...');

const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Conexão
mongoose.connect(mongoUri, options)
  .then(() => {
      console.log('✅ BANCO CONECTADO COM SUCESSO!');
      startServer(); // Só liga o servidor se o banco conectar
  })
  .catch(err => {
      console.error('❌ FALHA NA CONEXÃO COM O BANCO:', err.message);
  });

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipo: { type: String, default: 'basic' }
});
const User = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema({
    userId: String,
    sender: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// --- ROTAS ---

// 1. Registro
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, senha, password, tipo } = req.body;
        const passFinal = password || senha;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email já existe' });

        const newUser = new User({ name, email, password: passFinal, tipo: tipo || 'basic' });
        await newUser.save();
        
        res.status(201).json({ message: 'Sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar', error: error.message });
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha, password } = req.body;
        const passFinal = password || senha;
        
        const user = await User.findOne({ email });
        if (!user || user.password !== passFinal) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        
        res.json({
            token: 'token-' + user._id,
            usuario: { id: user._id, name: user.name, email: user.email, tipo: user.tipo }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no login' });
    }
});

// 3. Salvar Mensagem
app.post('/api/messages', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }
});

// 4. Histórico
app.get('/api/messages/:userId', async (req, res) => {
    try {
        const msgs = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
        res.json(msgs);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

// 5. Admin (Listar usuários)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ _id: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

// --- INICIAR SERVIDOR ---
function startServer() {
    app.listen(5000, () => {
        console.log('🚀 Servidor pronto na porta 5000!');
    });
}