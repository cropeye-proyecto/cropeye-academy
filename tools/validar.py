"""Valida el contenido de CropEye Academy.

Uso: python tools/validar.py [raíz del sitio]

Sale con 0 si todo está bien. Si no, imprime un problema por línea y sale
con 1. Revisa el currículo, los archivos de lecciones, los bloques, los
diagramas y la estructura mínima de cada lección.
"""

import json
import re
import sys
from pathlib import Path

MIN_PALABRAS = 1200
MAX_PALABRAS = 2000

BLOQUE_RE = re.compile(r"^:::\s*(note|warning|objetivos|autoevaluacion|comision)\s*$")
CIERRE_BLOQUE_RE = re.compile(r"^:::\s*$")
FENCE_RE = re.compile(r"^```")
SVG_RE = re.compile(r"^!\[[^\]]*\]\((assets/diagramas/[^)\s]+\.svg)\)\s*$")


def contar_palabras(texto: str) -> int:
    sin_codigo = re.sub(r"```.*?```", " ", texto, flags=re.S)
    return len(re.findall(r"\w+", sin_codigo))


def revisar_bloques(lineas: list[str]) -> tuple[list[str], dict[str, list[list[str]]]]:
    """Devuelve (problemas, bloques por tipo con sus líneas)."""
    problemas: list[str] = []
    bloques: dict[str, list[list[str]]] = {}
    abierto: str | None = None
    en_codigo = False
    contenido: list[str] = []
    for n, linea in enumerate(lineas, 1):
        if FENCE_RE.match(linea):
            en_codigo = not en_codigo
            continue
        if en_codigo:
            continue
        m = BLOQUE_RE.match(linea)
        if m:
            if abierto:
                problemas.append(f"línea {n}: se abre :::{m.group(1)} sin cerrar :::{abierto}")
            abierto, contenido = m.group(1), []
        elif CIERRE_BLOQUE_RE.match(linea):
            if abierto:
                bloques.setdefault(abierto, []).append(contenido)
                abierto = None
            else:
                problemas.append(f"línea {n}: ::: de cierre sin bloque abierto")
        elif abierto:
            contenido.append(linea)
    if en_codigo:
        problemas.append("bloque de código ``` sin cerrar")
    if abierto:
        problemas.append(f"bloque :::{abierto} sin cerrar")
    return problemas, bloques


def validar(raiz: Path) -> list[str]:
    problemas: list[str] = []
    try:
        cur = json.loads((raiz / "content" / "curriculum.json").read_text(encoding="utf-8"))
        partes = cur["parts"]
    except (OSError, ValueError, KeyError) as e:
        return [f"curriculum.json ilegible: {e}"]

    usados: set[str] = set()
    for parte in partes:
        for leccion in parte.get("lessons", []):
            archivo = leccion.get("file", "")
            ident = leccion.get("id", "?")
            usados.add(Path(archivo).name)
            ruta = raiz / archivo
            if not ruta.is_file():
                problemas.append(f"{ident}: falta el archivo {archivo}")
                continue
            texto = ruta.read_text(encoding="utf-8")
            lineas = texto.splitlines()
            pref = f"{ident} ({archivo})"

            h1 = next((l for l in lineas if l.startswith("# ")), None)
            if h1 is None or h1[2:].strip() != leccion.get("title", ""):
                problemas.append(f"{pref}: el H1 no coincide con el título del currículo")

            p_bloques, bloques = revisar_bloques(lineas)
            problemas += [f"{pref}: {p}" for p in p_bloques]

            for linea in lineas:
                m = SVG_RE.match(linea.strip())
                if m and not (raiz / m.group(1)).is_file():
                    problemas.append(f"{pref}: falta el diagrama {m.group(1)}")

            comisiones = len(bloques.get("comision", []))
            if leccion.get("kind") == "cierre":
                if not 4 <= comisiones <= 6:
                    problemas.append(f"{pref}: un cierre necesita de 4 a 6 :::comision (tiene {comisiones})")
                continue

            if "objetivos" not in bloques:
                problemas.append(f"{pref}: falta :::objetivos")
            autoeval = bloques.get("autoevaluacion", [])
            preguntas = sum(1 for b in autoeval for l in b if l.strip().startswith("? "))
            if not 3 <= preguntas <= 5:
                problemas.append(f"{pref}: la autoevaluación necesita de 3 a 5 preguntas (tiene {preguntas})")
            if comisiones < 1:
                problemas.append(f"{pref}: falta :::comision")
            palabras = contar_palabras(texto)
            if not MIN_PALABRAS <= palabras <= MAX_PALABRAS:
                problemas.append(f"{pref}: {palabras} palabras (debe tener entre {MIN_PALABRAS} y {MAX_PALABRAS})")

    carpeta = raiz / "content" / "lessons"
    if carpeta.is_dir():
        for md in sorted(carpeta.glob("*.md")):
            if md.name not in usados:
                problemas.append(f"{md.name}: archivo que no está en el currículo")
    return problemas


def main() -> int:
    raiz = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    problemas = validar(raiz)
    for p in problemas:
        print(p)
    if not problemas:
        print("Contenido válido.")
    return 1 if problemas else 0


if __name__ == "__main__":
    sys.exit(main())
