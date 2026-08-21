type TurnstileInstance = {
  render: (
    container: HTMLElement,
    options: Record<string, string | ((token?: string) => void)>,
  ) => string;
  execute: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

const SCRIPT_ID = "cloudflare-turnstile-script";

function loadTurnstile(): Promise<TurnstileInstance> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const timeout = window.setTimeout(() => reject(new Error("安全验证加载超时，请检查网络后重试。")), 10_000);

    const finish = () => {
      if (!window.turnstile) return;
      window.clearTimeout(timeout);
      resolve(window.turnstile);
    };

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("安全验证加载失败，请检查网络后重试。"));
    };
    document.head.appendChild(script);
  });
}

export async function getTurnstileToken(): Promise<string> {
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  if (!sitekey) return "development-bypass";

  const turnstile = await loadTurnstile();
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  return new Promise((resolve, reject) => {
    let widgetId = "";
    const cleanup = () => {
      if (widgetId) turnstile.remove(widgetId);
      container.remove();
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("安全验证超时，请重试。"));
    }, 15_000);

    widgetId = turnstile.render(container, {
      sitekey,
      size: "invisible",
      execution: "execute",
      callback: (token?: string) => {
        window.clearTimeout(timeout);
        cleanup();
        token ? resolve(token) : reject(new Error("安全验证失败，请重试。"));
      },
      "error-callback": () => {
        window.clearTimeout(timeout);
        cleanup();
        reject(new Error("安全验证失败，请重试。"));
      },
      "timeout-callback": () => {
        window.clearTimeout(timeout);
        cleanup();
        reject(new Error("安全验证超时，请重试。"));
      },
    });
    turnstile.execute(widgetId);
  });
}
