"""Pruebas del validador: python -m unittest tools/test_validar.py"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from validar import validar  # noqa: E402

RELLENO = " ".join(["palabra"] * 1300)

LECCION_OK = f"""# Lección uno

{RELLENO}

![Flujo](assets/diagramas/flujo.svg)

:::objetivos
- explicar algo
:::

:::autoevaluacion
? Uno
= R
? Dos
= R
? Tres
= R
:::

:::comision
? Pregunta
Respuesta.
:::
"""

CIERRE_OK = "# Cierre: preguntas de la comisión\n\n" + "\n".join(
    ":::comision\n? P\nR\n:::\n" for _ in range(4)
)


class ValidarTest(unittest.TestCase):
    def armar(self, leccion: str = LECCION_OK, cierre: str = CIERRE_OK, extra: bool = False) -> Path:
        raiz = Path(tempfile.mkdtemp())
        (raiz / "content" / "lessons").mkdir(parents=True)
        (raiz / "assets" / "diagramas").mkdir(parents=True)
        (raiz / "assets" / "diagramas" / "flujo.svg").write_text("<svg/>", encoding="utf-8")
        cur = {
            "version": 2,
            "parts": [
                {
                    "id": "p1",
                    "title": "P",
                    "lessons": [
                        {"id": "p1-01", "title": "Lección uno", "file": "content/lessons/p1-01.md"},
                        {"id": "p1-cierre", "title": "Cierre: preguntas de la comisión",
                         "file": "content/lessons/p1-cierre.md", "kind": "cierre"},
                    ],
                }
            ],
        }
        (raiz / "content" / "curriculum.json").write_text(json.dumps(cur), encoding="utf-8")
        if leccion is not None:
            (raiz / "content" / "lessons" / "p1-01.md").write_text(leccion, encoding="utf-8")
        (raiz / "content" / "lessons" / "p1-cierre.md").write_text(cierre, encoding="utf-8")
        if extra:
            (raiz / "content" / "lessons" / "huerfano.md").write_text("# x", encoding="utf-8")
        return raiz

    def problemas(self, **kw) -> str:
        return "\n".join(validar(self.armar(**kw)))

    def test_sitio_correcto(self):
        self.assertEqual(validar(self.armar()), [])

    def test_archivo_faltante(self):
        self.assertIn("falta el archivo", self.problemas(leccion=None))

    def test_h1_distinto(self):
        self.assertIn("H1 no coincide", self.problemas(leccion=LECCION_OK.replace("# Lección uno", "# Otra")))

    def test_bloque_sin_cerrar(self):
        roto = LECCION_OK.replace("- explicar algo\n:::", "- explicar algo\n")
        self.assertIn("sin cerrar", self.problemas(leccion=roto))

    def test_svg_inexistente(self):
        self.assertIn("falta el diagrama", self.problemas(leccion=LECCION_OK.replace("flujo.svg", "otro.svg")))

    def test_sin_comision(self):
        sin = LECCION_OK.split(":::comision")[0]
        self.assertIn("falta :::comision", self.problemas(leccion=sin))

    def test_cierre_con_pocas_preguntas(self):
        cierre = "# Cierre: preguntas de la comisión\n\n:::comision\n? P\nR\n:::\n" * 1
        self.assertIn("de 4 a 6", self.problemas(cierre=cierre))

    def test_archivo_huerfano(self):
        self.assertIn("no está en el currículo", self.problemas(extra=True))


if __name__ == "__main__":
    unittest.main()
