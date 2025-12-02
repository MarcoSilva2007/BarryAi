import os
import re
import random
from urllib.parse import quote
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from pymongo import MongoClient # <--- ADICIONADO: Para conectar no banco
from datetime import datetime

# 1. Carrega Variáveis de Ambiente
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
mongo_uri = os.getenv("MONGO_URI") # <--- ADICIONADO

# 2. Configura MongoDB
if mongo_uri:
    try:
        client = MongoClient(mongo_uri)
        db = client.get_database() # Pega o banco definido na string de conexão
        chat_collection = db["historico_conversas"] # Nome da coleção
        print("✅ Conectado ao MongoDB com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao conectar no MongoDB: {e}")
        chat_collection = None
else:
    print("⚠️ AVISO: MONGO_URI não encontrado. O histórico não será salvo.")
    chat_collection = None

# 3. Configura o Gemini
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

# Usei a versão 1.5 Flash que é estável e rápida
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config,
    system_instruction=system_instruction,
    safety_settings=safety_settings
)

app = FastAPI(title="Barry AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoryItem(BaseModel):
    role: str
    parts: List[str]

class UserRequest(BaseModel):
    message: str
    history: List[HistoryItem] = [] 

def processar_resposta(texto):
    padrao = r'\[IMG:\s*(.*?)\]'
    def substituir_por_link(match):
        descricao = match.group(1).strip()
        descricao_url = quote(descricao)
        seed = random.randint(0, 999999)
        url = f"https://image.pollinations.ai/prompt/{descricao_url}?nologo=true&seed={seed}&width=1024&height=768&model=turbo"
        return f"\n![Imagem Gerada]({url})\n"
    return re.sub(padrao, substituir_por_link, texto, flags=re.IGNORECASE)

@app.post("/chat")
async def chat_with_barry(request: UserRequest):
    try:
        if not api_key:
            return {"response": "Erro: Chave API ausente."}

        # Formata histórico para o Gemini
        formatted_history = []
        for item in request.history:
            formatted_history.append({"role": item.role, "parts": item.parts})

        chat = model.start_chat(history=formatted_history)
        response = await chat.send_message_async(request.message)
        
        if response.text:
            texto_final = processar_resposta(response.text)
            
            # --- SALVAR NO MONGODB ---
            if chat_collection is not None:
                chat_doc = {
                    "data": datetime.utcnow(),
                    "usuario_msg": request.message,
                    "ia_resposta": texto_final,
                    # Se quiser salvar o histórico completo, descomente abaixo:
                    # "historico_completo": [h.dict() for h in request.history]
                }
                chat_collection.insert_one(chat_doc)
            # -------------------------

            return {"response": texto_final}
        else:
            return {"response": "Erro na geração."}

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return {"response": f"Erro interno: {str(e)}"}