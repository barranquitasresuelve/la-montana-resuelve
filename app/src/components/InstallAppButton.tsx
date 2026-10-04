import { CheckCircle2, Download, MoreVertical, Share2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getInstallInstructions, detectInstallPlatform } from "@/lib/pwaInstall";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const platform = useMemo(() => detectInstallPlatform(navigator.userAgent, navigator.maxTouchPoints), []);
  const instructions = getInstallInstructions(platform);

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const confirmInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", confirmInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", confirmInstalled);
    };
  }, []);

  const startInstallation = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setInstructionsOpen(false);
    }
    setInstallPrompt(null);
  };

  if (installed) {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />{compact ? "Instalada" : "App instalada"}</span>;
  }

  return <>
    <Button type="button" variant="outline" onClick={() => setInstructionsOpen(true)} className="rounded-full border-[#1d3154]/20 bg-white px-3 text-[#1d3154] shadow-sm hover:bg-[#edf1f4] sm:px-4">
      <Download className="h-4 w-4" />
      <span>{compact ? "Instalar" : "Instalar la app"}</span>
    </Button>
    <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
      <DialogContent className="max-w-md rounded-[1.5rem] border-slate-200 bg-[#fbfaf7] text-slate-800">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d3154] text-[#f2cd57]"><Smartphone className="h-6 w-6" /></div>
          <DialogTitle className="font-serif text-2xl text-[#162b4a]">Instala La Montaña Resuelve</DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">Guarda el directorio en tu pantalla principal para abrirlo como una aplicación, sin tener que buscar el enlace.</DialogDescription>
        </DialogHeader>
        {installPrompt ? <Button type="button" onClick={startInstallation} className="mt-2 rounded-xl bg-[#1d3154] py-5 font-bold text-white hover:bg-[#294269]"><Download className="h-4 w-4" />Instalar ahora</Button> : null}
        <p className="mt-2 text-sm font-bold text-[#162b4a]">{installPrompt ? "También puedes instalarla manualmente:" : instructions.title}</p>
        <ol className="mt-2 space-y-3">
          {instructions.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2cd57] text-xs font-bold text-[#1d3154]">{index + 1}</span><span>{step}</span></li>)}
        </ol>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">{platform === "ios" ? <Share2 className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}Después de instalarla, aparecerá entre tus aplicaciones o en la pantalla principal.</p>
      </DialogContent>
    </Dialog>
  </>;
}
