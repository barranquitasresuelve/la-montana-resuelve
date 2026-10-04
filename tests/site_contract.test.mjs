import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (relative) => readFileSync(new URL(relative, root), "utf8");
const providers = JSON.parse(read("app/src/data/providers.json"));
const approved = ["Santiago Electrical Solutions", "AJ Exterminating", "4J Pest Control"];
const fields = ["id", "businessName", "phone", "whatsapp", "town", "coverageTowns", "primaryCategory", "serviceTags", "description"].sort();

test("solo se exportan tres negocios aprobados y sus campos públicos autorizados", () => {
  assert.deepEqual(providers.map((provider) => provider.businessName), approved);
  assert.deepEqual(providers.map((provider) => provider.id), [1, 2, 3]);
  for (const provider of providers) assert.deepEqual(Object.keys(provider).sort(), fields);
});

test("la fachada compilada enlaza solo al formulario actual y no conserva fuentes previas", () => {
  const assets = readdirSync(new URL("dist-site/assets/", root));
  const javascript = assets.filter((file) => file.endsWith(".js")).map((file) => read(`dist-site/assets/${file}`)).join("\n");
  const html = read("dist-site/index.html");
  const bundle = html + javascript;
  assert.match(bundle, /1yhRwoAGxL2NNcBiK5UudcHBE7oFZy1ahld-_iannbP4/);
  assert.doesNotMatch(bundle, /14vyiDSWsfO1rnnh8MkUUkgCZbsQ0sYmFmXQzRgm3aAo/);
  assert.doesNotMatch(bundle, /Form Responses [23]/);
  assert.doesNotMatch(bundle, /Nombre de la persona de contacto|Correo electrónico/);
  for (const name of approved) assert.ok(bundle.includes(name));
});
