import os
import re
import random
from urllib.parse import quote
from datetime import datetime
from typing import List
import bcrypt
import google.generativeai as genai
from fastapi import FastAPI, HTTPException # <--- Adicionei HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from pymongo import MongoClient

# 1. Carrega Variáveis de Ambiente
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

# 2. Configura MongoDB
chat_collection = None
users_collection = None # <--- Coleção de usuários

if mongo_uri:
    try:
        client = MongoClient(mongo_uri)
        db = client.get_database() 
        chat_collection = db["historico_conversas"]
        users_collection = db["usuarios"] # <--- Define onde salvar usuários
        print("✅ Conectado ao MongoDB com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao conectar no MongoDB: {e}")
else:
    print("⚠️ AVISO: MONGO_URI não encontrado.")


# 4. Configura o Gemini
if api_key:
    genai.configure(api_key=api_key)

safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

generation_config = {
    "temperature": 1.0,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2000,
    "response_mime_type": "text/plain",
}

system_instruction = (
    "Você é o Barry AI, inspirado no herói Flash. "
    "Responda de forma extremamente rápida, curta e direta ao ponto. "
    "REGRAS ESPECIAIS PARA GERAÇÃO DE IMAGEM:"
    "1. Se o usuário pedir para 'criar', 'gerar', 'desenhar' ou 'fazer' uma imagem:"
    "2. NÃO tente gerar o link Markdown você mesmo."
    "3. APENAS escreva este comando no texto: [IMG: Descrição detalhada em inglês]"
    "4. Exemplo: Claro! [IMG: A futuristic red car]"
)

# Mudei para 1.5 pois o 2.5 não existe publicamente ainda e daria erro
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config,
    system_instruction=system_instruction,
    safety_settings=safety_settings
)

app = FastAPI(title="Barry AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite que o Vercel acesse
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS (ESTRUTURAS DE DADOS) ---
class HistoryItem(BaseModel):
    role: str
    parts: List[str]

class UserRequest(BaseModel):
    message: str
    history: List[HistoryItem] = [] 
    user_email: str = None # Opcional: para saber quem está falando

class UserAuth(BaseModel): # <--- Novo model para Login/Registro
    email: str
    password: str

# --- FUNÇÕES AUXILIARES ---
def processar_resposta(texto):
    padrao = r'\[IMG:\s*(.*?)\]'
    def substituir_por_link(match):
        descricao = match.group(1).strip()
        descricao_url = quote(descricao)
        seed = random.randint(0, 999999)
        url = f"https://image.pollinations.ai/prompt/{descricao_url}?nologo=true&seed={seed}&width=1024&height=768&model=turbo"
        return f"\n![Imagem Gerada]({url})\n"
    return re.sub(padrao, substituir_por_link, texto, flags=re.IGNORECASE)

# --- ROTAS DE AUTENTICAÇÃO (LOGIN E REGISTRO) ---

# --- ROTA DE REGISTRO (COM PROTEÇÃO DE TAMANHO) ---
@app.post("/register")
async def register_user(user: UserAuth):
    try:
        if users_collection is None:
            raise HTTPException(status_code=503, detail="Banco de dados desconectado")
        
        # Verifica duplicidade
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
        
        # --- CRIPTOGRAFIA NOVA (BCRYPT PURO) ---
        # 1. Transforma a senha em bytes
        senha_bytes = user.password.encode('utf-8')
        # 2. Gera o sal e o hash
        salt = bcrypt.gensalt()
        hashed_bytes = bcrypt.hashpw(senha_bytes, salt)
        # 3. Transforma de volta em string para salvar no Mongo
        hashed_password = hashed_bytes.decode('utf-8')
        
        users_collection.insert_one({
            "email": user.email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        })
        
        return {"message": "Usuário criado com sucesso!"}

    except Exception as e:
        print("ERRO NO REGISTRO:")
        import traceback
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# --- ROTA DE LOGIN (COM BCRYPT DIRETO) ---
@app.post("/login")
async def login_user(user: UserAuth):
    try:
        if users_collection is None:
            raise HTTPException(status_code=503, detail="Banco de dados desconectado")

        user_found = users_collection.find_one({"email": user.email})
        
        if not user_found:
            raise HTTPException(status_code=400, detail="Email ou senha incorretos.")
        
        # --- VERIFICAÇÃO NOVA (BCRYPT PURO) ---
        senha_enviada = user.password.encode('utf-8')
        senha_no_banco = user_found["password"].encode('utf-8')

        if not bcrypt.checkpw(senha_enviada, senha_no_banco):
            raise HTTPException(status_code=400, detail="Email ou senha incorretos.")
        
        return {"message": "Login realizado com sucesso!", "email": user.email}

    except Exception as e:
        print("ERRO NO LOGIN:")
        import traceback
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# --- ROTA DO CHAT ---

@app.post("/chat")
async def chat_with_barry(request: UserRequest):
    try:
        if not api_key:
            return {"response": "Erro: Chave API ausente."}

        formatted_history = []
        for item in request.history:
            formatted_history.append({"role": item.role, "parts": item.parts})

        chat = model.start_chat(history=formatted_history)
        response = await chat.send_message_async(request.message)
        
        if response.text:
            texto_final = processar_resposta(response.text)
            
            # Salva no MongoDB (agora inclui o email se vier na requisição)
            if chat_collection is not None:
                chat_doc = {
                    "data": datetime.utcnow(),
                    "email_usuario": request.user_email, # Salva quem mandou a msg
                    "usuario_msg": request.message,
                    "ia_resposta": texto_final,
                }
                chat_collection.insert_one(chat_doc)

            return {"response": texto_final}
        else:
            return {"response": "Erro na geração."}

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return {"response": f"Erro interno: {str(e)}"}