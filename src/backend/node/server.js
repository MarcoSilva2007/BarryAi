const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Configurações Básicas
app.use(cors()); // Libera o Angular
app.use(express.json()); // Permite ler JSON

// 2. Conexão com MongoDB (Local)
// Salva no banco "barrydb" no seu computador
mongoose.connect('mongodb://127.0.0.1:27017/barrydb')
  .then(() => console.log('✅ MongoDB Conectado com Sucesso! (Banco: barrydb)'))
  .catch(err => console.error('❌ Erro ao conectar no Mongo:', err));

// 3. Modelo do Usuário
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipo: { type: String, default: 'basic' } // basic, premium, admin
});

const User = mongoose.model('User', UserSchema);


const MessageSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Quem conversou?
    sender: { type: String, required: true }, // 'user' ou 'ai'
    text: { type: String, required: true },   // O que foi dito
    timestamp: { type: Date, default: Date.now } // Quando
});

const Message = mongoose.model('Message', MessageSchema);

// ==========================================
// 4. ROTAS DA API
// ==========================================

// --- REGISTRO ---
app.post('/api/register', async (req, res) => {
    console.log('📩 Registro:', req.body.email);
    try {
        const { name, email, senha, tipo } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        const newUser = new User({
            name,
            email,
            password: senha, // Mapeia "senha" do Angular para "password" do Banco
            tipo
        });

        await newUser.save();
        console.log('✅ Usuário criado:', newUser._id);
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error('Erro register:', error);
        res.status(500).json({ message: 'Erro no servidor', error });
    }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
    console.log('🔑 Login:', req.body.email);
    try {
        const { email, senha } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== senha) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        res.json({
            token: 'token-real-' + user._id,
            usuario: {
                id: user._id,
                name: user.name,
                email: user.email,
                tipo: user.tipo
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno', error });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { userId, sender, text } = req.body;
        const newMessage = new Message({ userId, sender, text });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }
});

app.get('/api/messages/:userId', async (req, res) => {
    try {
        // Pega as mensagens desse usuário, ordenadas por data
        const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});''

// --- ADMIN: LISTAR USUÁRIOS (Faltava arrumar isso) ---
app.get('/api/users', async (req, res) => {
    try {
        // Retorna todos, ordenados pelo mais novo (_id: -1)
        const users = await User.find({}, '-password').sort({ _id: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
});

// --- ADMIN: DELETAR USUÁRIO ---
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar' });
    }
});

// ==========================================
// 5. INICIALIZAR SERVIDOR (Sempre por último)
// ==========================================
app.listen(5000, () => {
    console.log('🚀 Servidor Node.js rodando na porta 5000');
    console.log('📂 Banco de Dados: mongodb://127.0.0.1:27017/barrydb');
});