export type InstallPlatform = "ios" | "android" | "desktop";

export function detectInstallPlatform(userAgent: string, maxTouchPoints = 0): InstallPlatform {
  const normalized = userAgent.toLowerCase();
  const isAppleMobile = /iphone|ipad|ipod/.test(normalized)
    || (normalized.includes("macintosh") && maxTouchPoints > 1);

  if (isAppleMobile) return "ios";
  if (normalized.includes("android")) return "android";
  return "desktop";
}

export function getInstallInstructions(platform: InstallPlatform) {
  if (platform === "ios") {
    return {
      title: "Añadir en iPhone o iPad",
      steps: ["Toca Compartir en Safari.", "Selecciona “Añadir a pantalla de inicio”.", "Confirma con “Añadir”."],
    };
  }

  if (platform === "android") {
    return {
      title: "Instalar en Android",
      steps: ["Abre el menú de Chrome (⋮).", "Selecciona “Instalar aplicación” o “Añadir a pantalla principal”.", "Confirma la instalación."],
    };
  }

  return {
    title: "Instalar en esta computadora",
    steps: ["Abre el menú del navegador.", "Busca “Instalar La Montaña Resuelve” o el icono de instalación en la barra de direcciones.", "Confirma la instalación."],
  };
}
