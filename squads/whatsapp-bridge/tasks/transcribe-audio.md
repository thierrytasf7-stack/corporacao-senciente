# Task: Transcrever Audios WhatsApp

## Descricao
Transcreve audios do WhatsApp usando Whisper (modelo local, sem API externa).

## Instrucoes

### 1. Transcrever arquivo unico
```bash
python squads/whatsapp-bridge/scripts/wa-transcribe.py --file path/to/audio.ogg
```

### 2. Transcrever diretorio inteiro
```bash
python squads/whatsapp-bridge/scripts/wa-transcribe.py --dir ./exports/fulano/media/
```

### 3. Transcrever por filtro (numero/data)
```bash
python squads/whatsapp-bridge/scripts/wa-transcribe.py --number 5511999999999 --from 2026-02-01
```

### 4. Opcoes
| Flag | Descricao | Default |
|------|-----------|---------|
| `--file` | Arquivo unico | - |
| `--dir` | Diretorio com audios | - |
| `--number` | Filtrar por numero (JSONL) | - |
| `--from` | Data inicio | - |
| `--to` | Data fim | - |
| `--output` | Pasta de saida | ./exports/transcricoes/ |
| `--model` | Modelo Whisper | base |
| `--lang` | Idioma | pt |
| `--device` | auto/cpu/cuda | auto |

### 5. Modelos
| Modelo | Velocidade | Qualidade | RAM |
|--------|-----------|-----------|-----|
| tiny | Muito rapido | Basica | ~1GB |
| base | Rapido | Boa | ~1GB |
| small | Medio | Muito boa | ~2GB |
| medium | Lento | Excelente | ~5GB |
| large-v3 | Muito lento | Maxima | ~10GB |

### 6. Output
- `transcricoes.json` - JSON com texto + metadados por audio
- `transcricoes.txt` - Texto legivel formatado

## Dependencias
- Python 3.10+
- `pip install faster-whisper`
