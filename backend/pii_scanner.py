import re

def validate_luhn(card_number: str) -> bool:
    """Valida un número de tarjeta usando el algoritmo de Luhn."""
    card_number = re.sub(r'\D', '', card_number)
    if not card_number or not card_number.isdigit():
        return False
    
    digits = [int(x) for x in card_number]
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    
    checksum = sum(odd_digits)
    for d in even_digits:
        checksum += sum(divmod(d * 2, 10))
        
    return checksum % 10 == 0

def check_dni_nie(text: str) -> bool:
    """Busca patrones de DNI o NIE español."""
    # DNI: 8 números + 1 letra, NIE: X/Y/Z + 7 números + 1 letra
    dni_pattern = r'\b(?:[0-9]{8}[A-Za-z]|[XYZxyz][0-9]{7}[A-Za-z])\b'
    matches = re.findall(dni_pattern, text)
    return len(matches) > 0

def check_credit_card(text: str) -> bool:
    """Busca posibles tarjetas de crédito y las valida con Luhn."""
    # Busca 13 a 19 dígitos, permitiendo espacios o guiones
    cc_pattern = r'\b(?:\d[ -]*){13,19}\b'
    matches = re.findall(cc_pattern, text)
    
    for match in matches:
        clean_match = re.sub(r'\D', '', match)
        if 13 <= len(clean_match) <= 19:
            if validate_luhn(clean_match):
                return True
    return False

def check_iban(text: str) -> bool:
    """Busca patrones de IBAN europeo (Ej: ESXX...)."""
    # IBAN empieza por 2 letras, 2 números, y luego de 11 a 30 caracteres alfanuméricos/espacios
    iban_pattern = r'\b[a-zA-Z]{2}[0-9]{2}(?:[ ]?[a-zA-Z0-9]{4}){2,7}(?:[ ]?[a-zA-Z0-9]{1,3})?\b'
    return len(re.findall(iban_pattern, text)) > 0

def scan_text(prompt: str) -> dict:
    """Analiza un texto buscando PII. Retorna diccionario con flags."""
    pii_found = []
    
    if check_dni_nie(prompt):
        pii_found.append("DNI_NIE")
        
    if check_credit_card(prompt):
        pii_found.append("CREDIT_CARD")
        
    if check_iban(prompt):
        pii_found.append("IBAN")
        
    return {
        "has_pii": len(pii_found) > 0,
        "pii_types": ",".join(pii_found) if pii_found else None
    }
