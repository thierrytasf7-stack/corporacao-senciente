#!/usr/bin/env python3
"""
Testa APIs de Tênis e coleta dados de teste
"""

import requests
import json
import sys
import os

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Chaves de API
API_SPORTS_KEY = '57859f891d75e1d04e5062d75c05c677'
THEODDS_API_KEY = '57859f891d75e1d04e5062d75c05c677'

API_SPORTS_BASE = 'https://v1.api-sports.io/tennis'
THEODDS_BASE = 'https://api.theoddsapi.com/v4'

HEADERS = {'x-apisports-key': API_SPORTS_KEY}

def test_api_sports():
    """Testa API-Sports (tennis)"""
    print("\n" + "="*60)
    print("TESTANDO API-SPORTS (Tênis)")
    print("="*60)
    
    try:
        # Testar endpoint de matches (data de exemplo)
        response = requests.get(
            f'{API_SPORTS_BASE}/matches',
            headers=HEADERS,
            params={'date': '2025-02-15'},
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            matches = data.get('response', [])
            print(f"[OK] API-Sports funcionando!")
            print(f"Partidas encontradas (15/02/2025): {len(matches)}")
            
            if matches:
                print("\nExemplo de partida:")
                m = matches[0]
                print(f"  Tournament: {m.get('tournament', {}).get('name', 'N/A')}")
                print(f"  Players: {m.get('players', [{}])[0].get('name', 'N/A')} vs {m.get('players', [{}])[1].get('name', 'N/A')}")
                print(f"  Status: {m.get('status', {}).get('short', 'N/A')}")
            
            return True, matches
        else:
            print(f"[ERRO] API retornou status {response.status_code}")
            print(f"Resposta: {response.text[:500]}")
            return False, []
            
    except Exception as e:
        print(f"[ERRO] Erro ao testar API-Sports: {e}")
        return False, []

def test_theodds_api():
    """Testa TheOddsAPI"""
    print("\n" + "="*60)
    print("TESTANDO THEODDSAPI")
    print("="*60)
    
    try:
        response = requests.get(
            f'{THEODDS_BASE}/sports/tennis_atp/odds',
            params={
                'apiKey': THEODDS_API_KEY,
                'regions': 'eu',
                'markets': 'h2h'
            },
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] TheOddsAPI funcionando!")
            if isinstance(data, list):
                print(f"Eventos encontrados: {len(data)}")
            return True, data
        else:
            print(f"[ERRO] API retornou status {response.status_code}")
            print(f"Resposta: {response.text[:500]}")
            return False, []
            
    except Exception as e:
        print(f"[ERRO] Erro ao testar TheOddsAPI: {e}")
        return False, []

def fetch_tennis_data(days=7):
    """Busca dados reais de tênis dos últimos dias"""
    print("\n" + "="*60)
    print(f"COLETANDO DADOS DE TÊNIS (Últimos {days} dias)")
    print("="*60)
    
    from datetime import datetime, timedelta
    
    all_matches = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    current = start_date
    while current <= end_date:
        date_str = current.strftime('%Y-%m-%d')
        print(f"\nBuscando {date_str}...")
        
        try:
            response = requests.get(
                f'{API_SPORTS_BASE}/matches',
                headers=HEADERS,
                params={'date': date_str},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                matches = data.get('response', [])
                print(f"  {len(matches)} partidas encontradas")
                all_matches.extend(matches)
            else:
                print(f"  Erro: {response.status_code}")
            
        except Exception as e:
            print(f"  Erro: {e}")
        
        current += timedelta(days=1)
    
    print(f"\nTotal de partidas coletadas: {len(all_matches)}")
    return all_matches

def save_matches(matches, output_file='tennis-matches-raw.json'):
    """Salva partidas em arquivo JSON"""
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', output_file)
    
    # Criar diretório se não existir
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(matches, f, indent=2, ensure_ascii=False)
    
    print(f"[OK] Dados salvos em: {output_path}")
    return output_path

if __name__ == '__main__':
    print("\n" + "="*60)
    print("TESTE DE APIs DE TÊNIS")
    print("="*60)
    
    # Testar APIs
    api_sports_ok, _ = test_api_sports()
    theodds_ok, _ = test_theodds_api()
    
    # Se APIs funcionarem, coletar dados
    if api_sports_ok:
        matches = fetch_tennis_data(days=7)
        if matches:
            save_matches(matches)
            print("\n[OK] Coleta de teste concluída!")
        else:
            print("\n[AVISO] Nenhuma partida encontrada")
    else:
        print("\n[ERRO] API-Sports não funcionou. Verifique a chave de API.")
    
    print("\n" + "="*60)
    print("TESTE CONCLUÍDO")
    print("="*60)
