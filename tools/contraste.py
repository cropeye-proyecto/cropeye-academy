"""Comprueba el contraste WCAG AA de los pares de colores que usa el sitio.

Uso: python tools/contraste.py   (lee assets/css/tokens.css)
Sale con 1 si algún par no alcanza su mínimo.
"""

import re
import sys
from pathlib import Path

TOKENS = Path(__file__).resolve().parent.parent / "assets" / "css" / "tokens.css"

# (texto, fondo, mínimo, dónde se usa). "#fff" es literal.
PARES = [
    ("--text", "--bg", 4.5, "texto principal"),
    ("--text", "--surface", 4.5, "texto en tarjetas"),
    ("--text", "--surface-raised", 4.5, "texto en notas e índice"),
    ("--text", "--warning-bg", 4.5, "texto en advertencias"),
    ("--text-muted", "--bg", 4.5, "texto secundario"),
    ("--text-muted", "--surface", 4.5, "resúmenes en tarjetas"),
    ("--text-muted", "--surface-raised", 4.5, "secundario en el índice"),
    ("--accent", "--bg", 4.5, "enlaces"),
    ("--accent", "--surface-raised", 4.5, "enlaces en notas"),
    ("--accent-hover", "--surface", 4.5, "etiquetas y enlaces sobre arena (el salvia normal da 4,48)"),
    ("--accent-hover", "--success-bg", 4.5, "botón completado"),
    ("#fff", "--accent", 4.5, "botón principal"),
    ("--code-text", "--code-bg", 4.5, "bloques de código"),
    ("--focus-ring", "--bg", 3.0, "anillo de foco"),
    ("--warning-border", "--warning-bg", 3.0, "borde de advertencia"),
]


def leer_tokens() -> dict[str, str]:
    texto = TOKENS.read_text(encoding="utf-8")
    return {m.group(1): m.group(2) for m in re.finditer(r"(--[\w-]+):\s*(#[0-9A-Fa-f]{3,6})\b", texto)}


def luminancia(hexa: str) -> float:
    h = hexa.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    canales = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in canales]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def razon(a: str, b: str) -> float:
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main() -> int:
    tokens = leer_tokens()
    fallas = 0
    for texto, fondo, minimo, uso in PARES:
        try:
            a = texto if texto.startswith("#") else tokens[texto]
            b = fondo if fondo.startswith("#") else tokens[fondo]
        except KeyError as e:
            print(f"FALTA  {e.args[0]} ({uso})")
            fallas += 1
            continue
        r = razon(a, b)
        ok = r >= minimo
        fallas += not ok
        print(f"{'OK   ' if ok else 'FALLA'}  {r:5.2f} ≥ {minimo}  {texto} sobre {fondo}  ({uso})")
    return 1 if fallas else 0


if __name__ == "__main__":
    sys.exit(main())
