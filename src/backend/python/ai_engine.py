import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# Se você optou por colocar a chave direto, pode remover o dotenv
from dotenv import load_dotenv 
from fastapi.middleware.cors import CORSMiddleware
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# 1. Configuração da Chave (Se estiver usando .env)
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# --- OU --- Se preferir a chave direto no código (Opção TCC Rápido):
# api_key = "AIzaSy.....Sua_Chave_Aqui......"

if not api_key:
    # Para não travar o servidor se esquecer a chave, vamos avisar no print
    print("AVISO: Chave API não encontrada.")

# 2. Configura o Gemini
if api_key:
    genai.configure(api_key=api_key)

# CONFIGURAÇÃO DE SEGURANÇA (Isso resolve o erro finish_reason)
# Estamos dizendo para o Google: "Não bloqueie nada, é só um personagem"
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 700, # Aumentei um pouco para não cortar
    "response_mime_type": "text/plain",
}

system_instruction = (
    "Você é o Barry AI, inspirado no herói Flash. "
    "Sua principal característica é a velocidade. "
    "Responda de forma extremamente rápida, curta e direta ao ponto. "
    "Não enrole. Se perguntarem quem você é, diga que é a IA mais rápida viva."
    "Você tem muitos tokens para usar, mas não significa que deve usá-los todos. Seja rápido quando a respota permitir."
    "Quando for pedido instruções para você, seja específico se necessário."
)

# Inicializa o modelo
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
    system_instruction=system_instruction,
    safety_settings=safety_settings # <--- APLICANDO A SEGURANÇA AQUI
)

app = FastAPI(title="Barry AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_barry(request: UserRequest):
    try:
        if not api_key:
            return {"response": "Erro: A chave da API não foi configurada no servidor."}

        # Faz a chamada assíncrona
        response = await model.generate_content_async(request.message)
        
        # PROTEÇÃO CONTRA O ERRO (Se vier vazio, não quebra)
        if response.candidates and response.candidates[0].content.parts:
            return {"response": response.text}
        else:
            print(f"Bloqueio do Gemini. Motivo: {response.prompt_feedback}")
            return {"response": "Minha conexão com a força de aceleração falhou (Erro de Filtro/Token). Tente outra pergunta."}

    except Exception as e:
        print(f"Erro no servidor: {e}")
        # Retorna uma resposta amigável em vez de erro 500
        return {"response": "Estou correndo muito rápido e não entendi. (Erro interno)"}

# Para rodar: uvicorn ai_engine:app --reload