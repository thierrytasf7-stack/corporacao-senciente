#!/usr/bin/env python3
"""
Validador de Email - Criado pelo Agent Zero
"""

import re


def validate_email(email: str) -> bool:
    """
    Valida se um email e valido usando regex.
    
    Args:
        email: String contendo o email a ser validado
        
    Returns:
        True se o email e valido, False caso contrario
    """
    
    if not isinstance(email, str):
        raise TypeError(f"Email deve ser string, recebido: {type(email).__name__}")
    
    if not email or not email.strip():
        return False
    
    try:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        match = re.match(email_pattern, email.strip())
        return match is not None
        
    except Exception as e:
        print(f"Erro ao validar email: {e}")
        return False


if __name__ == "__main__":
    print("Testando validador de email\n")
    
    test_cases = [
        ("user@example.com", True),
        ("test.user@domain.co.uk", True),
        ("invalid.email", False),
        ("@example.com", False),
        ("user@", False),
        ("", False),
    ]
    
    for email, expected in test_cases:
        try:
            result = validate_email(email)
            status = "OK" if result == expected else "FALHOU"
            print(f"{status} '{email}' -> {result} (esperado: {expected})")
        except Exception as e:
            print(f"ERRO '{email}' -> {e}")
    
    print("\nTestes concluidos!")
