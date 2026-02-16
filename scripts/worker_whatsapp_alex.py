"""
Worker WhatsApp Alex - PUV Score exclusivo
Fluxo 2 passos: puv_menu (envia opcoes) | puv_execute (gera deliverables) | puv_help (orientacao)
"""
import os, sys, json, subprocess, time, re, glob, requests
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
RESULTS_DIR = os.path.join(BASE_DIR, "results")
PROMPT_FILE = os.path.join(BASE_DIR, ".whatsapp_prompt.json")
WHATSAPP_API = "http://localhost:21350/api/send"
WHATSAPP_DOC_API = "http://localhost:21350/api/send-document"
MAX_RESPONSE_LEN = 4000
PUV_TIMEOUT = 600  # 10 min
CLAUDE_MODEL = "claude-sonnet-4-5-20250929"

# Mapeamento opcoes do menu
DELIVERABLES = {
    1: {"key": "scorecard", "label": "Scorecard Visual (HTML)", "file": "scorecard.html"},
    2: {"key": "slides", "label": "Slides Apresentacao (PDF)", "file": "slides-apresentacao"},
    3: {"key": "documento", "label": "Documento Recomendacoes (PDF)", "file": "documento-recomendacoes"},
    4: {"key": "data", "label": "Dados Brutos (JSON)", "file": "data.json"},
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


def find_puv_results(results_dir):
    files = {}
    for pattern, key in [
        ("scorecard*.html", "scorecard"),
        ("slides*.pdf", "slides"),
        ("documento*.pdf", "documento"),
        ("document*.pdf", "documento"),
        ("recomend*.pdf", "documento"),
        ("data.json", "data"),
    ]:
        matches = glob.glob(os.path.join(results_dir, pattern))
        if matches and key not in files:
            files[key] = matches[0]
    if "slides" not in files or "documento" not in files:
        all_pdfs = glob.glob(os.path.join(results_dir, "*.pdf"))
        for pdf in all_pdfs:
            name = os.path.basename(pdf).lower()
            if "slide" in name and "slides" not in files:
                files["slides"] = pdf
            elif "documento" not in files:
                files["documento"] = pdf
    return files


def build_prompt(url, selection, output_dir):
    """Monta o prompt Claude baseado na selecao do usuario."""
    # Mapear selecao para deliverables
    needs_scorecard = 1 in selection
    needs_slides = 2 in selection
    needs_documento = 3 in selection
    needs_data = 4 in selection

    needs_pdf = needs_slides or needs_documento

    selected_labels = [DELIVERABLES[n]["label"] for n in sorted(selection) if n in DELIVERABLES]
    safe_print(f"[PUV] Deliverables: {', '.join(selected_labels)}")

    # Montar instrucoes de arquivos
    file_instructions = []
    if needs_data:
        file_instructions.append(
            f'a) data.json - {{"nome":"...","url":"{url}","score":N,"criterios":[{{"nome":"...","nota":N,"obs":"..."}}...]}}'
        )
    if needs_scorecard:
        file_instructions.append(
            "b) scorecard.html - HTML standalone com CSS inline, score visual, barra por criterio, radar chart SVG"
        )
    if needs_slides:
        file_instructions.append(
            "c) slides-apresentacao.md - 8 slides markdown (titulo, resumo, criterios principais, recomendacoes, conclusao)"
        )
    if needs_documento:
        file_instructions.append(
            "d) documento-recomendacoes.md - Diagnostico completo + 5 recomendacoes priorizadas"
        )

    files_text = "\n".join(file_instructions)

    pdf_step = ""
    if needs_pdf:
        cmds = []
        if needs_slides:
            cmds.append("npx --yes md-to-pdf slides-apresentacao.md")
        if needs_documento:
            cmds.append("npx --yes md-to-pdf documento-recomendacoes.md")
        pdf_step = f"\nPASSO 4 - CONVERTER PARA PDF (executar na pasta {output_dir}):\ncd {output_dir} && {' && '.join(cmds)}"

    prompt = f"""Voce eh o agente PUV Score. Analise a Proposta Unica de Valor de: {url}

PASSO 1 - PESQUISA (rapido):
- WebFetch em {url} para extrair: nome, proposta de valor, publico-alvo, diferenciais
- WebSearch para "{url}" concorrentes e presenca digital
- Se o site bloquear, use apenas WebSearch

PASSO 2 - AVALIACAO (10 criterios, 0-2 pts cada, max 20):
Clareza PUV | Diferenciacao | Publico-alvo | Beneficios | Prova social | CTA | Marca | Presenca digital | UX | Conversao

PASSO 3 - GERAR ARQUIVOS em {output_dir}:
{files_text}
{pdf_step}
RESPOSTA FINAL: apenas JSON {{"score": N, "nome": "Nome", "path": "{output_dir}"}}"""

    return prompt


def run_claude(prompt):
    """Executa Claude CLI com streaming de output no terminal."""
    safe_print("=" * 60)
    safe_print("[CLAUDE OUTPUT]")
    safe_print("=" * 60)

    try:
        env = os.environ.copy()
        git_bash = env.get("CLAUDE_CODE_GIT_BASH_PATH", r"D:\Git\bin\bash.exe")
        for key in list(env.keys()):
            if key.startswith("CLAUDECODE") or key.startswith("CLAUDE_CODE"):
                del env[key]
        env["CLAUDE_CODE_GIT_BASH_PATH"] = git_bash

        proc = subprocess.Popen(
            ["claude", "-p", prompt, "--dangerously-skip-permissions", "--model", CLAUDE_MODEL],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=BASE_DIR,
            encoding="utf-8",
            errors="replace",
            env=env
        )

        output_lines = []
        deadline = time.time() + PUV_TIMEOUT
        while True:
            if time.time() > deadline:
                proc.kill()
                safe_print("\n[TIMEOUT] Claude excedeu limite.")
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
        safe_print(f"[/CLAUDE] ({len(output)} chars, exit={proc.returncode})")
        safe_print("=" * 60)

        return output

    except Exception as e:
        safe_print(f"[ERR] Claude: {e}")
        return f"[Erro: {e}]"


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
        f"*1* - Scorecard Visual (HTML)\n"
        f"*2* - Slides Apresentacao (PDF)\n"
        f"*3* - Documento Recomendacoes (PDF)\n"
        f"*4* - Dados Brutos (JSON)\n"
        f"*5* - Todos (completo)\n\n"
        f"_Responda com os numeros separados por virgula._\n"
        f"_Ex: *1,2* ou *5* para tudo._\n"
        f"_(expira em 5 min)_"
    )
    send_whatsapp(chat, msg)
    safe_print("[DONE] Menu enviado.")


def handle_execute(data):
    """Passo 2: Executa analise PUV com deliverables selecionados."""
    chat = data.get("chat", "")
    url = data.get("url", "")
    selection = data.get("selection", [5])

    # Opcao 5 = todos
    if 5 in selection:
        selection = [1, 2, 3, 4]

    nome = extract_name_from_url(url)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    output_dir = os.path.join(RESULTS_DIR, f"puv-{nome}-{timestamp}")
    os.makedirs(output_dir, exist_ok=True)

    selected_labels = [DELIVERABLES[n]["label"] for n in sorted(selection) if n in DELIVERABLES]

    safe_print(f"[PUV] URL: {url}")
    safe_print(f"[PUV] Selecao: {selection}")
    safe_print(f"[PUV] Output: {output_dir}")

    if chat:
        items = "\n".join([f"  - {l}" for l in selected_labels])
        send_whatsapp(chat, f"*PUV Score Bot:*\n\nAnalisando {url}\nGerando:\n{items}\n\n_Aguarde ~3-5 min..._")

    # Montar e executar prompt
    prompt = build_prompt(url, selection, output_dir)
    output = run_claude(prompt)

    # Extrair score do JSON
    score = None
    nome_negocio = nome
    try:
        json_match = re.search(r'\{[^{}]*"score"[^{}]*\}', output)
        if json_match:
            result_data = json.loads(json_match.group())
            score = result_data.get("score")
            nome_negocio = result_data.get("nome", nome)
    except Exception:
        pass

    safe_print(f"[PUV] Score: {score} | Nome: {nome_negocio}")

    # Enviar resultados
    if chat:
        score_text = f"{score}/20" if score is not None else "N/A"
        summary = f"*PUV Score Bot:*\n\n*{nome_negocio}*\nScore: *{score_text}*\nURL: {url}"

        files = find_puv_results(output_dir)
        # Filtrar apenas os deliverables selecionados
        wanted_keys = set()
        for n in selection:
            if n in DELIVERABLES:
                wanted_keys.add(DELIVERABLES[n]["key"])
        files = {k: v for k, v in files.items() if k in wanted_keys}

        if files:
            summary += f"\n\nEntregaveis: {len(files)} arquivo(s)"
            send_whatsapp(chat, summary)

            for key, fpath in files.items():
                caption = f"PUV {key.title()} - {nome_negocio}"
                send_document(chat, fpath, caption=caption)
                time.sleep(1)
        else:
            if len(output) > MAX_RESPONSE_LEN:
                output = output[:MAX_RESPONSE_LEN] + "\n\n[...truncado]"
            summary += f"\n\n(Arquivos nao gerados)\n\n{output}"
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
        "1 - Scorecard Visual (HTML)\n"
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
