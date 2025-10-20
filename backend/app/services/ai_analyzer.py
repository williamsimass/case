from openai import OpenAI
from app.core.config import settings
import json

def get_openai_client():
    """
    Cria o cliente OpenAI sob demanda (lazy loading).
    Isso evita que o container crashe se houver problema com a API key durante a importação.
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY não configurada no arquivo .env")
    
    try:
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        raise ValueError(f"Erro ao criar cliente OpenAI: {e}")

def analyze_text_with_ai(text_content: str) -> dict:
    """
    Envia o conteúdo do texto para a IA para extrair insights de vendas em formato JSON.
    """
    if not settings.OPENAI_API_KEY:
        return {"error": "OPENAI_API_KEY não configurada."}

    system_prompt = (
        "Você é um analista de inteligência de vendas. Sua tarefa é analisar o texto fornecido "
        "de um website e extrair informações críticas para a preparação de uma reunião de vendas. "
        "Você DEVE retornar a resposta EXCLUSIVAMENTE em formato JSON com os seguintes campos:\n\n"
        "- nome_empresa: Nome da empresa dona do site\n"
        "- principal_servico_produto: O principal serviço ou produto oferecido\n"
        "- publico_alvo: O público-alvo principal da empresa\n"
        "- proposta_de_valor: Um resumo conciso (máximo 2 frases) da proposta de valor\n"
        "- pontos_de_venda_usp: Array com 3 a 5 pontos de venda únicos (USPs) que o time de vendas pode usar\n"
        "- resumo_executivo: Um resumo executivo do conteúdo do site para a reunião\n\n"
        "Mantenha as respostas concisas e focadas em vendas."
    )

    try:
        # Cria o cliente apenas quando necessário
        client = get_openai_client()
        
        completion = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analise o seguinte texto e retorne um JSON:\n\n{text_content}"}
            ],
            response_format={"type": "json_object"}
        )

        json_string = completion.choices[0].message.content
        result = json.loads(json_string)
        
        # Validação básica dos campos obrigatórios
        required_fields = ["nome_empresa", "principal_servico_produto", "publico_alvo", 
                          "proposta_de_valor", "pontos_de_venda_usp", "resumo_executivo"]
        
        for field in required_fields:
            if field not in result:
                result[field] = "Não disponível"
        
        return result

    except ValueError as e:
        # Erro de configuração
        print(f"Erro de configuração da OpenAI: {e}")
        return {"error": f"Erro de configuração: {e}"}
    except Exception as e:
        # Erro na chamada da API
        print(f"Erro na chamada da API OpenAI: {e}")
        return {"error": f"Falha na análise da IA: {e}"}
