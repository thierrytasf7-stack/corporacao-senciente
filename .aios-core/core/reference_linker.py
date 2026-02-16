from typing import Dict, List, Optional
from pathlib import Path
import json
from datetime import datetime

class ReferenceLinker:
    def __init__(self, mapping_file: str = "reference_mapping.json"):
        self.mapping_file = Path(mapping_file)
        self.reference_mapping: Dict[str, str] = {}
        self.load_mapping()

    def load_mapping(self):
        """Carrega o mapeamento de ID_Fato para URL do arquivo JSON"""
        if self.mapping_file.exists():
            try:
                with open(self.mapping_file, 'r', encoding='utf-8') as f:
                    self.reference_mapping = json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Erro ao carregar mapeamento: {e}")
                self.reference_mapping = {}
        else:
            self.reference_mapping = {}

    def save_mapping(self):
        """Salva o mapeamento atualizado para o arquivo JSON"""
        try:
            with open(self.mapping_file, 'w', encoding='utf-8') as f:
                json.dump(self.reference_mapping, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Erro ao salvar mapeamento: {e}")

    def add_reference(self, fact_id: str, url: str):
        """Adiciona um novo mapeamento de ID_Fato para URL"""
        self.reference_mapping[fact_id] = url
        self.save_mapping()

    def get_reference(self, fact_id: str) -> Optional[str]:
        """Recupera a URL associada a um ID_Fato"""
        return self.reference_mapping.get(fact_id)

    def remove_reference(self, fact_id: str):
        """Remove um mapeamento de ID_Fato"""
        if fact_id in self.reference_mapping:
            del self.reference_mapping[fact_id]
            self.save_mapping()

    def list_references(self) -> Dict[str, str]:
        """Lista todos os mapeamentos atuais"""
        return self.reference_mapping

    def validate_url(self, url: str) -> bool:
        """Valida se a URL está no formato correto"""
        # Implementação básica de validação de URL
        return url.startswith(('http://', 'https://')) and '.' in url.split('/')[2]

    def generate_fact_id(self, base_text: str) -> str:
        """Gera um ID_Fato único baseado no texto"""
        import hashlib
        hash_object = hashlib.md5(base_text.encode('utf-8'))
        return hash_object.hexdigest()[:8]  # 8 caracteres para identificação única

    def batch_add_references(self, references: List[Dict[str, str]]):
        """Adiciona múltiplos mapeamentos de uma vez"""
        for ref in references:
            if 'fact_id' in ref and 'url' in ref:
                self.add_reference(ref['fact_id'], ref['url'])

    def export_to_csv(self, csv_file: str):
        """Exporta o mapeamento para um arquivo CSV"""
        import csv
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['ID_Fato', 'URL'])
            for fact_id, url in self.reference_mapping.items():
                writer.writerow([fact_id, url])

    def import_from_csv(self, csv_file: str):
        """Importa mapeamentos de um arquivo CSV"""
        import csv
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'ID_Fato' in row and 'URL' in row:
                    self.add_reference(row['ID_Fato'], row['URL'])
