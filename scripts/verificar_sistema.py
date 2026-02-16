#!/usr/bin/env python3
"""
VERIFICAR SISTEMA - CORPORAÇÃO SENCIENTE
Script para validar estado do sistema antes da execução
"""

import os
import sys
from pathlib import Path

def check_structure():
    """Verificar estrutura de diretórios"""
    print("VERIFICANDO ESTRUTURA DO SISTEMA")
    print("=" * 40)

    project_dir = Path.cwd()
    dirs_needed = ['backend', 'frontend', 'scripts', 'data', 'config', 'logs']
    dirs_ok = 0

    for dir_name in dirs_needed:
        dir_path = project_dir / dir_name
        if dir_path.exists():
            print(f"[OK] {dir_name}/")
            dirs_ok += 1
        else:
            print(f"[MISSING] {dir_name}/")

    print(f"Diretorios: {dirs_ok}/{len(dirs_needed)} OK")
    return dirs_ok == len(dirs_needed)

def check_files():
    """Verificar arquivos críticos"""
    print("\nVERIFICANDO ARQUIVOS CRÍTICOS")
    print("=" * 40)

    files_needed = [
        'pyproject.toml',
        'backend/presentation/api/main.py',
        'backend/core/entities/holding.py',
        'backend/agents/specialized/auto_evolution_agent.py',
        'scripts/run_corporacao_senciente.py'
    ]

    files_ok = 0
    for file_path in files_needed:
        if Path(file_path).exists():
            print(f"[OK] {file_path}")
            files_ok += 1
        else:
            print(f"[MISSING] {file_path}")

    print(f"Arquivos: {files_ok}/{len(files_needed)} OK")
    return files_ok == len(files_needed)

def check_dependencies():
    """Verificar dependências Python"""
    print("\nVERIFICANDO DEPENDÊNCIAS")
    print("=" * 40)

    deps = ['fastapi', 'uvicorn', 'pydantic', 'sqlalchemy', 'asyncpg']
    deps_ok = 0

    for dep in deps:
        try:
            __import__(dep)
            print(f"[OK] {dep}")
            deps_ok += 1
        except ImportError:
            print(f"[MISSING] {dep}")

    print(f"Dependencias: {deps_ok}/{len(deps)} OK")
    return deps_ok == len(deps)

def check_config():
    """Verificar configurações"""
    print("\nVERIFICANDO CONFIGURAÇÕES")
    print("=" * 40)

    config_files = ['config/production.env', 'config/production.yaml']
    config_ok = False

    for config_file in config_files:
        if Path(config_file).exists():
            print(f"[OK] {config_file} encontrado")
            config_ok = True
            break

    if not config_ok:
        print("[WARN] Nenhum arquivo de configuração encontrado")
        print("Criando configuração básica...")

        basic_config = """# Configuração básica para desenvolvimento
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
OPENAI_API_KEY=your-openai-key-here
SYSTEM_ENV=development
LOG_LEVEL=INFO
"""

        config_dir = Path("config")
        config_dir.mkdir(exist_ok=True)
        config_file = config_dir / "production.env"
        config_file.write_text(basic_config)
        print("[OK] config/production.env criado")
        config_ok = True

    return config_ok

def validate_system():
    """Validação completa do sistema"""
    print("VALIDAÇÃO COMPLETA DO SISTEMA")
    print("=" * 50)

    # Configurar path para imports
    project_path = Path.cwd()
    backend_path = project_path / "backend"
    sys.path.insert(0, str(backend_path))
    sys.path.insert(0, str(project_path))

    try:
        # Testar imports principais
        from backend.core.entities.holding import Holding
        from backend.presentation.api.main import app
        from backend.agents.specialized.auto_evolution_agent import AutoEvolutionAgent

        print("[OK] Imports do sistema funcionais")

        # Testar criação de entidades
        holding = Holding(name="Test Holding", vision="Test")
        print("[OK] Entidades criadas com sucesso")

        # Testar rotas da API
        routes = len([r for r in app.routes if hasattr(r, 'path')])
        print(f"[OK] API com {routes} rotas configuradas")

        return True

    except Exception as e:
        print(f"[ERROR] Erro na validação: {e}")
        return False

def main():
    """Função principal"""
    print("CORPORACAO SENCIENTE - VERIFICACAO DE SISTEMA")
    print("=" * 60)

    checks = [
        ("Estrutura de diretorios", check_structure),
        ("Arquivos criticos", check_files),
        ("Dependencias Python", check_dependencies),
        ("Configuracoes", check_config),
        ("Validacao de sistema", validate_system)
    ]

    results = []
    for check_name, check_func in checks:
        print(f"\n{check_name.upper()}:")
        result = check_func()
        results.append(result)

    # Resultado final
    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"RESULTADO FINAL: {passed}/{total} verificações passaram")

    if passed == total:
        print("\nSISTEMA TOTALMENTE VALIDADO E PRONTO!")
        print("\nProximos passos:")
        print("1. Configure suas chaves API em config/production.env")
        print("2. Execute: python scripts/run_corporacao_senciente.py")
        print("3. Acesse: http://localhost:8000")
        return True
    else:
        print(f"\nSistema parcialmente validado ({passed}/{total})")
        print("Corrija os itens marcados como MISSING/ERROR")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)