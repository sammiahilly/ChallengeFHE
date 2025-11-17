import { SDK_CDN_URL, SDK_LOCAL_URL } from "./constants";

declare global {
  interface Window {
    relayerSDK?: {
      initSDK: (options?: unknown) => Promise<boolean>;
      createInstance: (config: any) => Promise<any>;
      SepoliaConfig: Record<string, any> & { aclContractAddress: `0x${string}` };
    };
  }
}

async function loadScriptOnce(src: string): Promise<void> {
  if (typeof window === "undefined") return;
  const existing = Array.from(document.getElementsByTagName("script")).find(s => s.src === src);
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if ((existing as any).dataset.loaded === "true") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    });
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => { (script as any).dataset.loaded = "true"; resolve(); }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

export async function loadRelayerSDK() {
  if (typeof window === "undefined") {
    throw new Error("Relayer SDK can only be loaded in the browser");
  }
  if (!window.relayerSDK) {
    try {
      await loadScriptOnce(SDK_CDN_URL);
      // eslint-disable-next-line no-console
      console.log("[RelayerSDKLoader] Successfully loaded from CDN");
    } catch {
      await loadScriptOnce(SDK_LOCAL_URL);
      // eslint-disable-next-line no-console
      console.log("[RelayerSDKLoader] Loaded from local backup");
    }
  }
  if (!window.relayerSDK) {
    throw new Error("Failed to load Relayer SDK (UMD).");
  }
  return window.relayerSDK!;
}


