import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path # <--- Adicione isso

# 1. Carrega variáveis FORÇANDO o caminho correto
env_path = Path(__file__).parent / '.env' # Pega a pasta onde este arquivo está
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")

# Debug: Vamos imprimir no terminal para ver se achou (depois você apaga)
print(f"Tentando ler o arquivo em: {env_path}")
print(f"Chave encontrada? {'SIM' if api_key else 'NÃO'}")

if not api_key:
    raise ValueError("ERRO: A chave GOOGLE_API_KEY não foi encontrada no .env. Verifique se o arquivo existe e não está como .txt")


# 2. Configura o Google Gemini
genai.configure(api_key=api_key)

# Configuração da IA (Persona do Barry)
generation_config = {
    "temperature": 0.7, # Criatividade moderada
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 200, # Respostas curtas
    "response_mime_type": "text/plain",
}

# Define a persona no System Prompt
system_instruction = (
    "Você é o Barry AI, inspirado no herói Flash. "
    "Sua principal característica é a velocidade. "
    "Responda de forma extremamente rápida, curta e direta ao ponto. "
    "Não enrole. Se perguntarem quem você é, diga que é a IA mais rápida viva."
)

# Inicializa o modelo "Gemini 1.5 Flash" (Rápido e Grátis)
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=system_instruction
)

# 3. Inicia o FastAPI
app = FastAPI(title="Barry AI API")

# 4. Configura CORS
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
        # O Gemini usa start_chat ou generate_content. 
        # Para uma resposta simples e rápida (sem memória longa), usamos generate_content.
        
        # Usamos await para ser assíncrono e rápido
        response = await model.generate_content_async(request.message)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao processar a velocidade da força de aceleração.")

# Para rodar (dentro da pasta backend/python):
# uvicorn ai_engine:app --reload