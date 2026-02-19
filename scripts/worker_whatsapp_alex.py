"""
Worker WhatsApp Alex - PUV Score exclusivo
Fluxo: Qwen CLI analisa → Pipeline Modelo 3 gera visuais → WhatsApp entrega

Design System: Modelo 3 (Sentient Executive Edition)
- Cores: Carbono #0A0A0A, Cyber Cyan #00F5FF
- Heatmap: 0-7 Critical #FF3B30 | 8-14 Improving #FFCC00 | 15-20 Dominant #34C759
- Tipografia: JetBrains Mono, Inter, Space Mono
- Pipeline: scorecard-gen.js, slides-gen.js, document-gen.js (Puppeteer)

Engine: Qwen CLI (custo $0) para analise | Node.js pipeline para visuais
"""
import os, sys, json, subprocess, time, re, glob, requests
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
RESULTS_DIR = os.path.join(BASE_DIR, "results")
PROMPT_FILE = os.path.join(BASE_DIR, ".whatsapp_prompt.json")
WHATSAPP_API = "http://localhost:21350/api/send"
WHATSAPP_DOC_API = "http://localhost:21350/api/send-document"
WHATSAPP_IMG_API = "http://localhost:21350/api/send-image"
MAX_RESPONSE_LEN = 4000
PUV_TIMEOUT = 600  # 10 min
QWEN_MODEL = "qwen3-coder"

# Pipeline Modelo 3 paths
PUV_SQUAD_DIR = os.path.join(BASE_DIR, "squads/puv-score")
SCORECARD_GEN = os.path.join(PUV_SQUAD_DIR, "scripts/scorecard-gen.js")
SLIDES_GEN = os.path.join(PUV_SQUAD_DIR, "scripts/slides-gen.js")
DOCUMENT_GEN = os.path.join(PUV_SQUAD_DIR, "scripts/document-gen.js")
PUV_PROMPT_TEMPLATE = os.path.join(PUV_SQUAD_DIR, "templates/puv-prompt.md")

# Mapeamento opcoes do menu (Modelo 3: scorecard=JPG, slides=PDF, documento=PDF)
DELIVERABLES = {
    1: {"key": "scorecard", "label": "Scorecard Visual (JPG)", "file": "scorecard.jpg"},
    2: {"key": "slides", "label": "Slides Apresentacao (PDF)", "file": "slides.pdf"},
    3: {"key": "documento", "label": "Documento Recomendacoes (PDF)", "file": "report.pdf"},
    4: {"key": "data", "label": "Dados Brutos (JSON)", "file": "analysis.json"},
}


def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode())
    sys.stdout.flush()


def send_whatsapp(chat_id, message):
    try:
        jid = f"{chat_id}@g.us"
        res = requests.post(WHATSAPP_API, json={"chat": jid, "message": message}, timeout=10)
        if res.ok:
            safe_print(f"[OK] WhatsApp ({len(message)} chars)")
            return True
        else:
            safe_print(f"[ERR] WhatsApp API: {res.status_code}")
            return False
    except Exception as e:
        safe_print(f"[ERR] WhatsApp: {e}")
        return False


def send_image(chat_id, file_path, caption=""):
    try:
        jid = f"{chat_id}@g.us"
        payload = {
            "chat": jid,
            "filePath": file_path.replace("\\", "/"),
            "caption": caption
        }
        res = requests.post(WHATSAPP_IMG_API, json=payload, timeout=30)
        if res.ok:
            safe_print(f"[OK] Imagem enviada: {os.path.basename(file_path)}")
            return True
        else:
            safe_print(f"[ERR] Image API: {res.status_code}")
            return False
    except Exception as e:
        safe_print(f"[ERR] Image: {e}")
        return False


def send_document(chat_id, file_path, file_name=None, caption=""):
    try:
        jid = f"{chat_id}@g.us"
        payload = {
            "chat": jid,
            "filePath": file_path.replace("\\", "/"),
            "fileName": file_name or os.path.basename(file_path),
            "caption": caption
        }
        if file_path.endswith(".html"):
            payload["mimetype"] = "text/html"
        res = requests.post(WHATSAPP_DOC_API, json=payload, timeout=30)
        if res.ok:
            safe_print(f"[OK] Doc enviado: {payload['fileName']}")
            return True
        else:
            safe_print(f"[ERR] Doc API: {res.status_code}")
            return False
    except Exception as e:
        safe_print(f"[ERR] Doc: {e}")
        return False


def extract_name_from_url(url):
    try:
        domain = re.sub(r'https?://(www\.)?', '', url).split('/')[0]
        name = domain.split('.')[0]
        return re.sub(r'[^a-zA-Z0-9-]', '', name) or "site"
    except Exception:
        return "site"


def build_analysis_prompt(url):
    """Monta prompt para Qwen usando a rubrica oficial PUV (5 criterios x 4pts = 20pts)."""
    # Carregar template da rubrica se existir
    rubric_text = ""
    try:
        with open(PUV_PROMPT_TEMPLATE, "r", encoding="utf-8") as f:
            rubric_text = f.read()
    except Exception:
        pass

    prompt = f"""Voce eh o agente PUV Score (Sentient Executive Edition).
Analise a Proposta Unica de Valor de: {url}

PASSO 1 - PESQUISA:
- Acesse {url} e extraia: nome do negocio, proposta de valor, publico-alvo, diferenciais, CTAs, prova social
- Pesquise sobre concorrentes e presenca digital
- Se o site bloquear acesso direto, use pesquisa web

PASSO 2 - AVALIACAO com a rubrica PUV Score (5 criterios, 0-4 pts cada, max 20):

1. Diferenciacao e Posicionamento (/4)
   0=Nenhuma | 1=Vaga | 2=Basica | 3=Clara e relevante | 4=Excepcional e memoravel

2. Clareza da Proposta/Beneficio (/4)
   0=Confusa | 1=Ambigua | 2=Razoavel | 3=Clara em 10s | 4=Imediata em 5s

3. Linguagem e Conexao Emocional (/4)
   0=Generica | 1=Funcional | 2=Conexao parcial | 3=Emocional que ressoa | 4=Irresistivel

4. Credibilidade e Confianca (/4)
   0=Sem prova | 1=Minima | 2=Moderada | 3=Forte | 4=Indiscutivel

5. Jornada Guiada e CTA (/4)
   0=Sem CTA | 1=Vago | 2=Presente mas fraco | 3=Claro e visivel | 4=Jornada completa irresistivel

PASSO 3 - Retorne EXCLUSIVAMENTE um JSON valido (sem markdown, sem code blocks, sem texto adicional):
{{
  "alvo": {{
    "nome": "Nome do negocio",
    "canal": "website",
    "url": "{url}"
  }},
  "score_total": 0,
  "score_max": 20,
  "classificacao": "Fraco|Abaixo da Media|Media|Forte|Excelente",
  "criterios": [
    {{
      "nome": "Diferenciacao e Posicionamento",
      "score": 0,
      "justificativa": "Analise detalhada em 2-3 frases",
      "exemplos_do_alvo": ["Exemplo concreto encontrado"],
      "oportunidade_salto": "O que falta para subir 1 ponto"
    }},
    {{
      "nome": "Clareza da Proposta",
      "score": 0,
      "justificativa": "...",
      "exemplos_do_alvo": ["..."],
      "oportunidade_salto": "..."
    }},
    {{
      "nome": "Linguagem e Conexao",
      "score": 0,
      "justificativa": "...",
      "exemplos_do_alvo": ["..."],
      "oportunidade_salto": "..."
    }},
    {{
      "nome": "Credibilidade e Confianca",
      "score": 0,
      "justificativa": "...",
      "exemplos_do_alvo": ["..."],
      "oportunidade_salto": "..."
    }},
    {{
      "nome": "Jornada e CTA",
      "score": 0,
      "justificativa": "...",
      "exemplos_do_alvo": ["..."],
      "oportunidade_salto": "..."
    }}
  ],
  "top3_acoes": [
    "Acao 1 especifica e acionavel em 1 semana",
    "Acao 2 especifica e acionavel em 1 semana",
    "Acao 3 especifica e acionavel em 1 semana"
  ],
  "comunicacao_5_segundos": true,
  "persona_detectada": {{
    "primaria": "Descricao da persona principal",
    "secundaria": "Persona secundaria se houver",
    "conflito": "Conflito de comunicacao entre personas se houver"
  }},
  "documento_secoes": {{
    "diagnostico_performance": "Texto completo secao 1 - diagnostico detalhado...",
    "desconstrucao_puv": "Texto completo secao 2 - analise criterio a criterio...",
    "reposicionamento_persona": "Texto completo secao 3 - segmentacao e personas...",
    "engenharia_linguagem": "Texto completo secao 4 - exemplos antes/depois de copy...",
    "estrategias_autoridade": "Texto completo secao 5 - como construir credibilidade...",
    "plano_acao_imediato": "Texto completo secao 6 - timeline de implementacao..."
  }}
}}

CLASSIFICACOES: 0-5=Fraco | 6-9=Abaixo da Media | 10-13=Media | 14-17=Forte | 18-20=Excelente

REGRAS:
- Use dados REAIS do site, nao frases genericas
- Exemplos antes/depois na secao linguagem
- Score consistente com a rubrica
- Tom: Sentient Executive - autoritario, profissional, orientado a dados
- RETORNE APENAS O JSON, nada mais"""

    return prompt


def run_qwen_analysis(prompt):
    """Executa Qwen CLI para analise PUV. Retorna JSON string."""
    safe_print("=" * 60)
    safe_print("[QWEN] Iniciando analise PUV...")
    safe_print("=" * 60)

    prompt_tmp = os.path.join(BASE_DIR, ".puv_prompt_tmp.txt")
    try:
        with open(prompt_tmp, "w", encoding="utf-8") as f:
            f.write(prompt)
    except Exception as e:
        safe_print(f"[ERR] Salvar prompt: {e}")
        return None

    try:
        env = os.environ.copy()
        cmd = f'type "{prompt_tmp}" | qwen --approval-mode yolo --model {QWEN_MODEL}'

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=BASE_DIR,
            encoding="utf-8",
            errors="replace",
            env=env,
            shell=True
        )

        output_lines = []
        deadline = time.time() + PUV_TIMEOUT
        while True:
            if time.time() > deadline:
                proc.kill()
                safe_print("\n[TIMEOUT] Qwen excedeu limite.")
                break
            line = proc.stdout.readline()
            if not line and proc.poll() is not None:
                break
            if line:
                line_stripped = line.rstrip('\n\r')
                output_lines.append(line_stripped)
                safe_print(f"  | {line_stripped}")

        proc.wait(timeout=5)
        output = "\n".join(output_lines).strip()

        safe_print("=" * 60)
        safe_print(f"[/QWEN] ({len(output)} chars, exit={proc.returncode})")
        safe_print("=" * 60)

        return output

    except Exception as e:
        safe_print(f"[ERR] Qwen: {e}")
        return None
    finally:
        try:
            os.remove(prompt_tmp)
        except Exception:
            pass


def parse_analysis_json(raw_output):
    """Extrai e parseia JSON da resposta do Qwen."""
    if not raw_output:
        return None

    # Remover code blocks markdown
    cleaned = re.sub(r'```json\s*', '', raw_output)
    cleaned = re.sub(r'```\s*', '', cleaned)

    # Tentar encontrar o JSON principal (com alvo e score_total)
    try:
        # Buscar o JSON mais completo (que contem "alvo" ou "score_total")
        json_match = re.search(r'\{.*"score_total".*\}', cleaned, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    # Fallback: tentar qualquer JSON grande
    try:
        json_match = re.search(r'\{.*"criterios".*\}', cleaned, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    # Ultimo fallback: qualquer JSON com score
    try:
        json_match = re.search(r'\{[^{}]*"score"[^{}]*\}', cleaned)
        if json_match:
            data = json.loads(json_match.group())
            # Converter formato antigo para novo se necessario
            if "score" in data and "score_total" not in data:
                data["score_total"] = data.pop("score")
            if "nome" in data and "alvo" not in data:
                data["alvo"] = {"nome": data.pop("nome"), "url": data.get("url", ""), "canal": "website"}
            return data
    except json.JSONDecodeError:
        pass

    safe_print(f"[ERR] Nao consegui parsear JSON da resposta")
    safe_print(f"[RAW] {raw_output[:500]}")
    return None


def run_pipeline_gen(script_path, analysis_file, output_file, theme="black"):
    """Executa um script Node.js do pipeline Modelo 3."""
    script_name = os.path.basename(script_path)
    safe_print(f"[PIPELINE] {script_name} ({theme})...")

    try:
        result = subprocess.run(
            ["node", script_path, "--analysis", analysis_file, "--output", output_file, "--theme", theme],
            cwd=BASE_DIR,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            shell=True
        )

        # stdout tem o JSON de resultado, stderr tem os logs
        if result.stderr:
            for line in result.stderr.strip().split("\n"):
                if line.strip():
                    safe_print(f"  | {line}")

        if result.returncode == 0 and os.path.exists(output_file):
            size = os.path.getsize(output_file)
            safe_print(f"[OK] {script_name} -> {os.path.basename(output_file)} ({size} bytes)")
            return True
        else:
            safe_print(f"[ERR] {script_name} falhou (exit={result.returncode})")
            if result.stdout:
                safe_print(f"  stdout: {result.stdout[:200]}")
            return False

    except subprocess.TimeoutExpired:
        safe_print(f"[ERR] {script_name} timeout (120s)")
        return False
    except Exception as e:
        safe_print(f"[ERR] {script_name}: {e}")
        return False


def generate_deliverables(analysis, output_dir, selection, theme="black"):
    """Gera deliverables usando pipeline Modelo 3 (Node.js + Puppeteer)."""
    generated = {}

    # Salvar analysis.json (sempre, pois pipeline precisa dele)
    analysis_file = os.path.join(output_dir, "analysis.json")
    with open(analysis_file, "w", encoding="utf-8") as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    safe_print(f"[FILE] analysis.json")

    if 4 in selection:
        generated["data"] = analysis_file

    # Scorecard JPG via scorecard-gen.js + template Modelo 3
    if 1 in selection:
        scorecard_out = os.path.join(output_dir, "scorecard.jpg")
        if run_pipeline_gen(SCORECARD_GEN, analysis_file, scorecard_out, theme):
            generated["scorecard"] = scorecard_out

    # Slides PDF via slides-gen.js (Modelo 3)
    if 2 in selection:
        slides_out = os.path.join(output_dir, "slides.pdf")
        if run_pipeline_gen(SLIDES_GEN, analysis_file, slides_out, theme):
            generated["slides"] = slides_out

    # Documento PDF via document-gen.js (Modelo 3)
    if 3 in selection:
        doc_out = os.path.join(output_dir, "report.pdf")
        if run_pipeline_gen(DOCUMENT_GEN, analysis_file, doc_out, theme):
            generated["documento"] = doc_out

    return generated


def handle_menu(data):
    """Passo 1: Envia menu de opcoes ao usuario."""
    chat = data.get("chat", "")
    url = data.get("url", "")
    if not chat:
        return

    msg = (
        f"*PUV Score Bot*\n\n"
        f"Link recebido: {url}\n\n"
        f"*O que deseja gerar?*\n\n"
        f"*1* - Scorecard Visual (JPG)\n"
        f"*2* - Slides Apresentacao (PDF)\n"
        f"*3* - Documento Recomendacoes (PDF)\n"
        f"*4* - Dados Brutos (JSON)\n"
        f"*5* - Todos (completo)\n\n"
        f"*Modelo:* black (padrao) ou white\n\n"
        f"_Responda com numeros + modelo._\n"
        f"_Ex: *1,2 black* | *5 white* | *3*_\n"
        f"_(expira em 5 min)_"
    )
    send_whatsapp(chat, msg)
    safe_print("[DONE] Menu enviado.")


def handle_execute(data):
    """Passo 2: Qwen analisa → Pipeline Modelo 3 gera → WhatsApp entrega."""
    chat = data.get("chat", "")
    url = data.get("url", "")
    selection = data.get("selection", [5])
    theme = data.get("theme", "black")

    if 5 in selection:
        selection = [1, 2, 3, 4]

    nome = extract_name_from_url(url)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    output_dir = os.path.join(RESULTS_DIR, f"puv-{nome}-{timestamp}")
    os.makedirs(output_dir, exist_ok=True)

    selected_labels = [DELIVERABLES[n]["label"] for n in sorted(selection) if n in DELIVERABLES]

    safe_print(f"[PUV] URL: {url}")
    safe_print(f"[PUV] Selecao: {selection}")
    safe_print(f"[PUV] Tema: {theme}")
    safe_print(f"[PUV] Output: {output_dir}")
    safe_print(f"[PUV] Design System: Modelo 3 (Sentient Executive)")

    if chat:
        items = "\n".join([f"  - {l}" for l in selected_labels])
        send_whatsapp(chat, f"*PUV Score Bot:*\n\nAnalisando {url}\nGerando:\n{items}\n\n_Aguarde ~3-5 min..._")

    # FASE 1: Qwen analisa (retorna JSON estruturado)
    safe_print("[FASE 1] Analise via Qwen CLI...")
    prompt = build_analysis_prompt(url)
    raw_output = run_qwen_analysis(prompt)

    analysis = parse_analysis_json(raw_output)

    if not analysis:
        safe_print("[ERR] Analise falhou - sem JSON valido")
        if chat:
            send_whatsapp(chat, "*PUV Score Bot:*\n\nDesculpe, nao consegui analisar este site. Tente novamente.")
        return

    score = analysis.get("score_total", 0)
    nome_negocio = analysis.get("alvo", {}).get("nome", nome)
    classificacao = analysis.get("classificacao", "N/A")

    safe_print(f"[PUV] Score: {score}/20 ({classificacao}) | Nome: {nome_negocio}")

    # FASE 2: Pipeline Modelo 3 gera visuais (Node.js + Puppeteer)
    safe_print(f"[FASE 2] Gerando visuais (Pipeline Modelo 3 - {theme})...")
    generated = generate_deliverables(analysis, output_dir, selection, theme)

    safe_print(f"[PUV] Gerados: {len(generated)} de {len(selection)} solicitados")

    # FASE 3: Enviar resultados via WhatsApp
    if chat:
        score_text = f"{score}/20"
        summary = f"*PUV Score Bot:*\n\n*{nome_negocio}*\nScore: *{score_text}* ({classificacao})\nURL: {url}"

        if generated:
            summary += f"\n\nEntregaveis: {len(generated)} arquivo(s)"
            send_whatsapp(chat, summary)

            for key, fpath in generated.items():
                caption = f"PUV {key.title()} - {nome_negocio}"
                if fpath.endswith(('.jpg', '.jpeg', '.png')):
                    send_image(chat, fpath, caption=caption)
                else:
                    send_document(chat, fpath, caption=caption)
                time.sleep(1)
        else:
            fallback = raw_output or "(sem resposta)"
            if len(fallback) > MAX_RESPONSE_LEN:
                fallback = fallback[:MAX_RESPONSE_LEN] + "\n\n[...truncado]"
            summary += f"\n\n(Arquivos nao gerados - pipeline falhou)\n\n{fallback}"
            send_whatsapp(chat, summary)


def handle_help(data):
    """Envia orientacao de uso."""
    chat = data.get("chat", "")
    if not chat:
        return

    msg = (
        "*PUV Score Bot*\n\n"
        "Analiso a *Proposta Unica de Valor* do seu negocio.\n\n"
        "*Como usar:*\n"
        "1. Envie o *link* do site/Instagram/pagina\n"
        "2. Escolha o que deseja gerar (1-5)\n"
        "3. Receba os entregaveis no chat!\n\n"
        "*Exemplos:*\n"
        "- https://seunegocio.com.br\n"
        "- https://instagram.com/sualoja\n\n"
        "*Entregaveis disponiveis:*\n"
        "1 - Scorecard Visual (JPG)\n"
        "2 - Slides Apresentacao (PDF)\n"
        "3 - Documento Recomendacoes (PDF)\n"
        "4 - Dados Brutos (JSON)\n"
        "5 - Todos\n\n"
        "_Envie um link para comecar!_"
    )
    send_whatsapp(chat, msg)
    safe_print("[DONE] Help enviado.")


def main():
    safe_print("====================================================")
    safe_print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] WHATSAPP PUV WORKER")
    safe_print(f"  Engine: Qwen CLI ({QWEN_MODEL})")
    safe_print(f"  Design System: Modelo 3 (Sentient Executive)")
    safe_print(f"  Pipeline: scorecard-gen.js | slides-gen.js | document-gen.js")
    safe_print("====================================================")

    if not os.path.exists(PROMPT_FILE):
        safe_print("[ERR] Prompt nao encontrado!")
        return

    try:
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        safe_print(f"[ERR] Falha ao ler prompt: {e}")
        return

    msg_type = data.get("type", "")
    safe_print(f"[TYPE] {msg_type}")

    if msg_type == "puv_menu":
        handle_menu(data)
    elif msg_type == "puv_execute":
        handle_execute(data)
    elif msg_type == "puv_help":
        handle_help(data)
    else:
        safe_print(f"[SKIP] Tipo desconhecido: {msg_type}")

    # Limpar prompt
    try:
        os.remove(PROMPT_FILE)
    except Exception:
        pass

    safe_print("[DONE] Worker finalizado.")


if __name__ == "__main__":
    main()
