#!/usr/bin/env python3
"""Extrae solo campos públicos de los negocios aprobados de Form Responses 4.

El formulario no es una base pública: jamás publicar el JSON bruto de Sheets.
Un número en X no reemplaza la aprobación explícita del propietario: mantener
APPROVED manualmente sincronizado con las confirmaciones directas recibidas.
"""

import json
import subprocess
from pathlib import Path

SHEET_ID = "1HfQxwQUfR9k_4ngszBLvEAuKzJS4PuIaFnhVCQQhwSQ"
TAB = "Form Responses 4"
APPROVED = {
    "Santiago Electrical Solutions": 1,
    "AJ Exterminating": 2,
    "4J Pest Control": 3,
}
DESTINATION = Path(__file__).resolve().parents[1] / "app/src/data/providers.json"


def export_public(rows):
    if not rows:
        raise ValueError("No se recibieron filas de la pestaña oficial")
    header = rows[0]
    required = {
        "name": "Nombre del negocio o nombre profesional que deseas mostrar",
        "phone": "Teléfono principal",
        "whatsapp": "WhatsApp, si es diferente al teléfono principal",
        "town": "Pueblo base",
        "other_town": "Si seleccionaste “Otro pueblo”, indícalo",
        "coverage": "¿En qué pueblos ofreces tus servicios? (Selecciona todos los que correspondan)",
        "category": "Categoría principal de tus servicios",
        "services": "Servicios específicos que realizas",
        "description": "Descripción breve de tu negocio o experiencia",
        "authorization": "Autorizo a La Montaña Resuelve a publicar únicamente los datos públicos indicados arriba, después de confirmar la información conmigo.",
        "founder": "# Fundador",
    }
    if any(header.count(label) != 1 for label in required.values()):
        raise ValueError("Falta un encabezado necesario o está repetido en la pestaña oficial")
    indices = {key: header.index(label) for key, label in required.items()}
    found = {}
    for sheet_row_number, row in enumerate(rows[1:], start=2):
        value = lambda key: str(row[indices[key]]).strip() if len(row) > indices[key] else ""
        name = value("name")
        if name not in APPROVED:
            continue
        if name in found:
            raise ValueError(f"Nombre aprobado repetido en fila {sheet_row_number}: {name}")
        expected = APPROVED[name]
        if value("founder") != str(expected):
            raise ValueError(f"Número de fundador inesperado para {name} en fila {sheet_row_number}")
        if value("authorization").casefold() not in {"sí", "si"}:
            raise ValueError(f"Sin autorización de publicación para {name}")
        for field in ("phone", "town", "coverage", "category", "services"):
            if not value(field):
                raise ValueError(f"Falta {field} para {name}")
        town = value("other_town") if value("town") == "Otro pueblo" else value("town")
        if not town:
            raise ValueError(f"No se especificó el pueblo base de {name}")
        found[name] = {
            "id": expected,
            "businessName": name,
            "phone": value("phone"),
            "whatsapp": value("whatsapp") or None,
            "town": town,
            "coverageTowns": [part.strip() for part in value("coverage").split(",") if part.strip()],
            "primaryCategory": value("category"),
            "serviceTags": [value("services")],
            "description": value("description") or None,
        }
    missing = set(APPROVED) - set(found)
    if missing:
        raise ValueError("No aparecen en la pestaña oficial: " + ", ".join(sorted(missing)))
    return sorted(found.values(), key=lambda item: item["id"])


def main():
    params = json.dumps({"spreadsheetId": SHEET_ID, "range": f"'{TAB}'!A1:X1000"})
    completed = subprocess.run(
        ["gws", "sheets", "spreadsheets", "values", "get", "--params", params],
        check=True, capture_output=True, text=True,
    )
    rows = json.loads(completed.stdout)["values"]
    approved = export_public(rows)
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    DESTINATION.write_text(json.dumps(approved, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Exportados {len(approved)} negocios aprobados de {TAB}; sin campos personales ni respuestas sin confirmar.")


if __name__ == "__main__":
    main()
