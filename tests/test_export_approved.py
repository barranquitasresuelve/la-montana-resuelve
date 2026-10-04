import unittest

from scripts.export_approved import APPROVED, export_public


HEADER = [
    "Timestamp", "Nombre del negocio o nombre profesional que deseas mostrar",
    "Nombre de la persona de contacto", "Teléfono principal",
    "WhatsApp, si es diferente al teléfono principal", "Correo electrónico",
    "Pueblo base", "Si seleccionaste “Otro pueblo”, indícalo",
    "¿En qué pueblos ofreces tus servicios? (Selecciona todos los que correspondan)",
    "Categoría principal de tus servicios", "Servicios específicos que realizas",
    "Descripción breve de tu negocio o experiencia",
    "Autorizo a La Montaña Resuelve a publicar únicamente los datos públicos indicados arriba, después de confirmar la información conmigo.",
    "# Fundador",
]


def row(name, number, authorization="Sí"):
    return ["fecha", name, "NOMBRE PRIVADO", "7870000000", "", "PRIVADO@example.com",
            "Barranquitas", "", "Aibonito, Barranquitas",
            "Electricidad", "Instalaciones", "Descripción", authorization, str(number)]


class ExportApprovedTests(unittest.TestCase):
    def test_only_explicit_approved_names_and_public_fields(self):
        rows = [HEADER, row("No aprobado", 8), *(row(name, num) for name, num in APPROVED.items())]
        exported = export_public(rows)
        self.assertEqual([entry["businessName"] for entry in exported], list(APPROVED))
        self.assertEqual([entry["id"] for entry in exported], [1, 2, 3])
        serialized = repr(exported)
        self.assertNotIn("NOMBRE PRIVADO", serialized)
        self.assertNotIn("PRIVADO@example.com", serialized)
        self.assertNotIn("No aprobado", serialized)
        self.assertNotIn("fecha", serialized)
        self.assertEqual(exported[0]["town"], "Barranquitas")
        self.assertEqual(exported[0]["coverageTowns"], ["Aibonito", "Barranquitas"])

    def test_missing_confirmed_row_fails_closed(self):
        with self.assertRaises(ValueError):
            export_public([HEADER, row("Santiago Electrical Solutions", 1)])

    def test_wrong_number_fails_closed(self):
        rows = [HEADER, *(row(name, 12 if num == 3 else num) for name, num in APPROVED.items())]
        with self.assertRaises(ValueError):
            export_public(rows)

    def test_missing_publication_authorization_fails_closed(self):
        rows = [HEADER, *(row(name, num, "" if num == 2 else "Sí") for name, num in APPROVED.items())]
        with self.assertRaises(ValueError):
            export_public(rows)


if __name__ == "__main__":
    unittest.main()
