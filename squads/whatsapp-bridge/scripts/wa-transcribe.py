#!/usr/bin/env python3
"""
wa-transcribe.py - Transcreve audios do WhatsApp usando Whisper (local)

Uso:
  python wa-transcribe.py --file audio.ogg
  python wa-transcribe.py --dir ./exports/alex-semana/reenvio/media/
  python wa-transcribe.py --dir ./logs/media/ --output ./transcricoes/
  python wa-transcribe.py --number 5511999999999 --from 2026-02-01
  python wa-transcribe.py --file audio.ogg --model large-v3 --lang pt

Modelos disponiveis (menor → maior qualidade):
  tiny, base, small, medium, large-v3
  Default: base (rapido e bom para pt-BR)
"""

import os
import sys
import json
import glob
import argparse
from datetime import datetime
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
LOG_FILE = BASE_DIR / "apps" / "backend" / "integrations" / "whatsapp" / "logs" / "messages.jsonl"
MEDIA_DIR = BASE_DIR / "apps" / "backend" / "integrations" / "whatsapp" / "logs" / "media"


def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode("ascii", "replace").decode())
    sys.stdout.flush()


def load_model(model_size="base", device="auto"):
    """Carrega modelo Whisper"""
    safe_print(f"[WHISPER] Carregando modelo '{model_size}'...")
    from faster_whisper import WhisperModel

    # auto = GPU se disponivel, senao CPU
    if device == "auto":
        try:
            model = WhisperModel(model_size, device="cuda", compute_type="float16")
            safe_print("[WHISPER] Usando GPU (CUDA)")
        except Exception:
            model = WhisperModel(model_size, device="cpu", compute_type="int8")
            safe_print("[WHISPER] Usando CPU")
    else:
        compute = "float16" if device == "cuda" else "int8"
        model = WhisperModel(model_size, device=device, compute_type=compute)

    safe_print(f"[WHISPER] Modelo '{model_size}' carregado.")
    return model


def transcribe_file(model, filepath, language="pt"):
    """Transcreve um arquivo de audio"""
    segments, info = model.transcribe(
        str(filepath),
        language=language,
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500)
    )

    text_parts = []
    for segment in segments:
        text_parts.append(segment.text.strip())

    full_text = " ".join(text_parts)
    return full_text, info


def find_audio_files_from_jsonl(number=None, from_date=None, to_date=None):
    """Busca arquivos de audio no JSONL por filtros"""
    if not LOG_FILE.exists():
        safe_print(f"[ERR] Log nao encontrado: {LOG_FILE}")
        return []

    entries = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            # Filtrar por tipo audio
            if entry.get("msgType") != "audioMessage":
                continue

            # Filtrar por mediaFile existente
            if not entry.get("mediaFile"):
                continue

            # Filtrar por numero
            if number:
                num = number.replace("+", "").replace(" ", "").replace("-", "")
                if num not in entry.get("from", ""):
                    continue

            # Filtrar por data
            if from_date:
                ts = entry.get("timestamp", "")
                if ts < from_date:
                    continue
            if to_date:
                ts = entry.get("timestamp", "")
                if ts > to_date + "T23:59:59":
                    continue

            media_path = MEDIA_DIR / entry["mediaFile"]
            if media_path.exists():
                entries.append({
                    "file": media_path,
                    "timestamp": entry.get("timestamp", ""),
                    "from": entry.get("from", ""),
                    "fromMe": entry.get("fromMe", False),
                    "chat": entry.get("chat", "")
                })

    return entries


def transcribe_directory(model, directory, language="pt", output_dir=None):
    """Transcreve todos os audios de um diretorio"""
    audio_files = sorted(
        glob.glob(os.path.join(directory, "aud_*.ogg")) +
        glob.glob(os.path.join(directory, "aud_*.mp3")) +
        glob.glob(os.path.join(directory, "aud_*.wav")) +
        glob.glob(os.path.join(directory, "aud_*.m4a"))
    )

    if not audio_files:
        safe_print(f"[WARN] Nenhum audio encontrado em {directory}")
        return {}

    safe_print(f"\n[TRANSCRIBE] {len(audio_files)} audios encontrados em {directory}\n")

    results = {}
    for i, filepath in enumerate(audio_files, 1):
        filename = os.path.basename(filepath)
        safe_print(f"[{i}/{len(audio_files)}] Transcrevendo: {filename}...")

        try:
            text, info = transcribe_file(model, filepath, language)
            duration = round(info.duration, 1)
            results[filename] = {
                "text": text,
                "duration_seconds": duration,
                "language": info.language,
                "language_probability": round(info.language_probability, 2)
            }
            # Preview
            preview = text[:100] + ("..." if len(text) > 100 else "")
            safe_print(f"  [{duration}s] {preview}")
        except Exception as e:
            safe_print(f"  [ERR] {e}")
            results[filename] = {"text": f"[ERRO: {e}]", "duration_seconds": 0}

    # Salvar resultados
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        out_path = os.path.join(output_dir, "transcricoes.json")
    else:
        out_path = os.path.join(directory, "transcricoes.json")

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Salvar texto legivel
    txt_path = out_path.replace(".json", ".txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        for filename, data in results.items():
            duration = data.get("duration_seconds", 0)
            f.write(f"=== {filename} ({duration}s) ===\n")
            f.write(data["text"] + "\n\n")

    safe_print(f"\n[OK] Transcricoes salvas:")
    safe_print(f"  JSON: {out_path}")
    safe_print(f"  TXT:  {txt_path}")
    safe_print(f"  Total: {len(results)} audios transcritos")

    return results


def main():
    parser = argparse.ArgumentParser(description="Transcritor de audios WhatsApp")
    parser.add_argument("--file", help="Arquivo de audio para transcrever")
    parser.add_argument("--dir", help="Diretorio com audios para transcrever")
    parser.add_argument("--number", help="Filtrar por numero (busca no JSONL)")
    parser.add_argument("--from", dest="from_date", help="Data inicio (YYYY-MM-DD)")
    parser.add_argument("--to", dest="to_date", help="Data fim (YYYY-MM-DD)")
    parser.add_argument("--output", help="Diretorio de saida")
    parser.add_argument("--model", default="base", help="Modelo Whisper (tiny/base/small/medium/large-v3)")
    parser.add_argument("--lang", default="pt", help="Idioma (default: pt)")
    parser.add_argument("--device", default="auto", help="Device: auto/cpu/cuda")
    args = parser.parse_args()

    model = load_model(args.model, args.device)

    # Modo 1: Arquivo unico
    if args.file:
        safe_print(f"\n[TRANSCRIBE] {args.file}\n")
        text, info = transcribe_file(model, args.file, args.lang)
        safe_print(f"[{info.duration:.1f}s | {info.language} ({info.language_probability:.0%})]")
        safe_print(text)

        # Salvar .txt ao lado do audio
        txt_path = args.file.rsplit(".", 1)[0] + ".txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        safe_print(f"\n[OK] Salvo em: {txt_path}")
        return

    # Modo 2: Diretorio
    if args.dir:
        transcribe_directory(model, args.dir, args.lang, args.output)
        return

    # Modo 3: Filtro JSONL
    if args.number or args.from_date:
        entries = find_audio_files_from_jsonl(args.number, args.from_date, args.to_date)
        if not entries:
            safe_print("[WARN] Nenhum audio encontrado com esses filtros.")
            return

        safe_print(f"\n[TRANSCRIBE] {len(entries)} audios encontrados via JSONL\n")

        results = {}
        for i, entry in enumerate(entries, 1):
            filepath = entry["file"]
            filename = filepath.name
            who = "EU" if entry["fromMe"] else entry["from"]
            ts = entry["timestamp"].replace("T", " ").split(".")[0]

            safe_print(f"[{i}/{len(entries)}] {ts} | {who} | {filename}...")

            try:
                text, info = transcribe_file(model, str(filepath), args.lang)
                duration = round(info.duration, 1)
                results[filename] = {
                    "text": text,
                    "duration_seconds": duration,
                    "timestamp": entry["timestamp"],
                    "from": entry["from"],
                    "fromMe": entry["fromMe"],
                    "chat": entry["chat"]
                }
                preview = text[:100] + ("..." if len(text) > 100 else "")
                safe_print(f"  [{duration}s] {preview}")
            except Exception as e:
                safe_print(f"  [ERR] {e}")

        # Salvar
        out_dir = args.output or str(BASE_DIR / "exports" / "transcricoes")
        os.makedirs(out_dir, exist_ok=True)

        json_path = os.path.join(out_dir, "transcricoes.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        txt_path = os.path.join(out_dir, "transcricoes.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            for filename, data in results.items():
                who = "EU" if data.get("fromMe") else data.get("from", "?")
                ts = data.get("timestamp", "").replace("T", " ").split(".")[0]
                dur = data.get("duration_seconds", 0)
                f.write(f"=== [{ts}] {who} ({dur}s) - {filename} ===\n")
                f.write(data["text"] + "\n\n")

        safe_print(f"\n[OK] Transcricoes salvas:")
        safe_print(f"  JSON: {json_path}")
        safe_print(f"  TXT:  {txt_path}")
        safe_print(f"  Total: {len(results)} audios")
        return

    # Sem argumentos - ajuda
    parser.print_help()


if __name__ == "__main__":
    main()
