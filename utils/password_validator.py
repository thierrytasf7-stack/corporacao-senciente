#!/usr/bin/env python3
"""
Validador de Senha - Criado pelo Agent Zero
"""

import re


def validate_password(password: str, min_length: int = 8) -> dict:
    """
    Valida se uma senha atende aos requisitos de seguranca.
    
    Args:
        password: Senha a ser validada
        min_length: Comprimento minimo (padrao: 8)
        
    Returns:
        dict com 'valid' (bool) e 'errors' (list)
    """
    
    result = {
        'valid': False,
        'errors': [],
        'strength': 'weak'
    }
    
    if not isinstance(password, str):
        result['errors'].append("Senha deve ser string")
        return result
    
    if len(password) < min_length:
        result['errors'].append(f"Senha deve ter pelo menos {min_length} caracteres")
    
    if not re.search(r'[A-Z]', password):
        result['errors'].append("Senha deve conter pelo menos uma letra maiuscula")
    
    if not re.search(r'[a-z]', password):
        result['errors'].append("Senha deve conter pelo menos uma letra minuscula")
    
    if not re.search(r'\d', password):
        result['errors'].append("Senha deve conter pelo menos um numero")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        result['errors'].append("Senha deve conter pelo menos um caractere especial")
    
    if not result['errors']:
        result['valid'] = True
        
        # Calcular forca
        strength_score = 0
        if len(password) >= 12:
            strength_score += 2
        elif len(password) >= 10:
            strength_score += 1
        
        if re.search(r'[A-Z]', password):
            strength_score += 1
        if re.search(r'[a-z]', password):
            strength_score += 1
        if re.search(r'\d', password):
            strength_score += 1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            strength_score += 1
        
        if strength_score >= 5:
            result['strength'] = 'strong'
        elif strength_score >= 3:
            result['strength'] = 'medium'
    
    return result


if __name__ == "__main__":
    print("Testando validador de senha\n")
    
    test_passwords = [
        "Senha123!",
        "senha",
        "SENHA123",
        "Senha123",
        "S3nh@F0rt3!",
        ""
    ]
    
    for pwd in test_passwords:
        result = validate_password(pwd)
        print(f"\nSenha: '{pwd}'")
        print(f"  Valida: {result['valid']}")
        print(f"  Forca: {result['strength']}")
        if result['errors']:
            print(f"  Erros:")
            for error in result['errors']:
                print(f"    - {error}")
    
    print("\nTestes concluidos!")
