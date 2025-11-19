const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Configurações
app.use(cors()); // Libera o Angular (porta 4200) para acessar aqui
app.use(express.json()); // Permite receber JSON

// 2. Conexão com MongoDB (Local ou Atlas)
// Se você tiver o MongoDB instalado no PC, a url é essa padrão:
mongoose.connect('mongodb://127.0.0.1:27017/barrydb')
  .then(() => console.log('✅ MongoDB Conectado com Sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar no Mongo:', err));

// 3. Criação do Modelo (Schema) do Usuário
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Em produção, usaríamos bcrypt para criptografar
    tipo: { type: String, default: 'basic' } // basic, premium, admin
});

const User = mongoose.model('User', UserSchema);

// 4. Rotas da API

// Rota de Registro
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, senha, tipo } = req.body;

        // Verifica se já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Cria novo usuário
        const newUser = new User({
            name,
            email,
            password: senha, // Salvando senha direta (simples para TCC)
            tipo
        });

        await newUser.save();

        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Busca usuário pelo email
        const user = await User.findOne({ email });

        // Verifica se achou e se a senha bate
        if (!user || user.password !== senha) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Retorna os dados para o Angular
        res.json({
            token: 'token-real-do-mongo-' + user._id, // Token simulado
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

// 5. Rodar o servidor na porta 5000
app.listen(5000, () => {
    console.log('🚀 Servidor Node.js rodando na porta 5000');
});

// ... códigos anteriores (login/register) ...

// ROTA PARA O ADMIN: Listar todos os usuários
app.get('/api/users', async (req, res) => {
    try {
        // Busca todos os usuários, mas ESCONDE a senha ('-password')
        // Sort({ _id: -1 }) faz aparecer os mais novos primeiro
        const users = await User.find({}, '-password').sort({ _id: -1 });
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
});

// Rota para deletar usuário (Opcional, mas útil pro Admin)
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar' });
    }
});

// ... app.listen ...