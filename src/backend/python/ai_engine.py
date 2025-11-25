import os
import re # <--- NOVO: Para processar o texto
import random # <--- NOVO: Para o seed aleatório
from urllib.parse import quote # <--- NOVO: Para corrigir espaços no link
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List 
from dotenv import load_dotenv 
from fastapi.middleware.cors import CORSMiddleware
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# 1. Configuração da Chave
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("AVISO: Chave API não encontrada.")

# 2. Configura o Gemini
if api_key:
    genai.configure(api_key=api_key)

# Configurações de Segurança
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

generation_config = {
    "temperature": 1.0, # Criatividade alta
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2000,
    "response_mime_type": "text/plain",
}

# --- ATUALIZAÇÃO: INSTRUÇÕES SIMPLIFICADAS PARA IMAGEM ---
system_instruction = (
    "Você é o Barry AI, inspirado no herói Flash. "
    "Sua principal característica é a velocidade. "
    "Responda de forma extremamente rápida, curta e direta ao ponto. "
    "Mantenha o contexto da conversa. "
    "Não enrole. "
    "Seja descontraído, mas não rude."
    
    "REGRAS ESPECIAIS PARA GERAÇÃO DE IMAGEM:"
    "1. Se o usuário pedir para 'criar', 'gerar', 'desenhar' ou 'fazer' uma imagem:"
    "2. NÃO tente gerar o link Markdown você mesmo."
    "3. APENAS escreva este comando no texto: [IMG: Descrição detalhada em inglês]"
    "4. Exemplo: Claro! [IMG: A futuristic red car]"
)

# 3. Inicializa o modelo
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config,
    system_instruction=system_instruction,
    safety_settings=safety_settings
)

app = FastAPI(title="Barry AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ESTRUTURAS ---
class HistoryItem(BaseModel):
    role: str
    parts: List[str]

class UserRequest(BaseModel):
    message: str
    history: List[HistoryItem] = [] 


# --- PROCESSADOR DE COMANDOS ---
def processar_resposta(texto):
    padrao = r'\[IMG:\s*(.*?)\]'
    
    def substituir_por_link(match):
        descricao = match.group(1).strip()
        print(f"🎨 SOLICITAÇÃO DE IMAGEM: {descricao}")
        
        # 1. Limpa a descrição
        descricao_url = quote(descricao)
        
        # 2. Semente aleatória
        seed = random.randint(0, 999999)
        
        # 3. Monta o link (MUDANÇA AQUI: Adicionei &model=turbo)
        # O modelo 'turbo' é mais rápido e raramente cai.
        url = f"https://image.pollinations.ai/prompt/{descricao_url}?nologo=true&seed={seed}&width=1024&height=768&model=turbo"
        
        print(f"🔗 LINK GERADO: {url}")
        
        return f"\n![Imagem Gerada]({url})\n"

    return re.sub(padrao, substituir_por_link, texto, flags=re.IGNORECASE)

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
            # AQUI APLICAMOS A MÁGICA ANTES DE DEVOLVER
            texto_final = processar_resposta(response.text)
            return {"response": texto_final}
        else:
            return {"response": "Erro na geração."}

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return {"response": "Erro interno."}