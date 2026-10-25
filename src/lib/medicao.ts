// Medição sem invadir. Três eventos: clique_whatsapp (origem, servico), clique_como_chegar (app)
// e clique_ligar. Sem cookies, sem identificador, sem script de terceiros.
//
// Ferramenta: Umami auto-hospedado, na mesma origem do site (ou por um proxy /api/send). O
// evento vai direto para a API do Umami (POST /api/send), sem carregar o script dele.
// Configuração no build: PUBLIC_MEDICAO_URL (ex.: "/api/send") e PUBLIC_MEDICAO_SITE (id do
// site no Umami). Sem as duas, nada sai do navegador: o evento só é disparado na página
// (CustomEvent "tensini:medicao"), o que serve para os testes e para conferir no preview.
// Se o endpoint estiver em outro domínio, o envio só acontece depois do "Aceitar".
import { lerConsentimento } from '../components/consentimento/estado.ts';

export type Evento = 'clique_whatsapp' | 'clique_como_chegar' | 'clique_ligar';
export type AppRota = 'google-maps' | 'waze' | 'apple-mapas' | 'mapa-estatico';
export type DadosEvento = Record<string, string>;

/** Atributos de um link de rota (Google Maps, Waze, Apple Mapas, mapa estático). */
export const ctaRota = (app: AppRota) => ({ 'data-cta': 'como-chegar', 'data-app': app }) as const;
/** Atributos de um link tel:. */
export const ctaLigar = () => ({ 'data-cta': 'ligar' }) as const;

const env: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const ENDPOINT = env['PUBLIC_MEDICAO_URL']?.trim() || null;
const SITE = env['PUBLIC_MEDICAO_SITE']?.trim() || null;

/** Registra um evento. Nunca lança erro: medição não pode quebrar o agendamento. */
export function registrar(evento: Evento, dados: DadosEvento = {}): void {
  try {
    dispatchEvent(new CustomEvent('tensini:medicao', { detail: { evento, ...dados } }));
    if (!ENDPOINT || !SITE) return;
    const destino = new URL(ENDPOINT, location.href);
    if (destino.origin !== location.origin && lerConsentimento() !== 'aceito') return;
    void fetch(destino, {
      method: 'POST',
      keepalive: true,
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'event',
        payload: {
          website: SITE,
          hostname: location.hostname,
          language: navigator.language,
          url: location.pathname,
          title: document.title,
          name: evento,
          data: dados,
        },
      }),
    }).catch(() => {});
  } catch {
    // sem medição, segue o clique
  }
}

/** Um ouvinte só, no documento: lê os data-* do link clicado e registra o evento certo. */
export function iniciarMedicao(): void {
  const ouvir = (e: Event) => {
    const alvo = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cta]') : null;
    if (!alvo) return;
    const d = alvo.dataset;
    if (d['cta'] === 'whatsapp')
      registrar('clique_whatsapp', {
        origem: d['origem'] ?? 'desconhecida',
        servico: d['servico'] ?? '',
      });
    else if (d['cta'] === 'como-chegar') registrar('clique_como_chegar', { app: d['app'] ?? '' });
    else if (d['cta'] === 'ligar') registrar('clique_ligar');
  };
  // click cobre mouse, toque e Enter; auxclick cobre o botão do meio (nova aba).
  document.addEventListener('click', ouvir, { capture: true });
  document.addEventListener('auxclick', ouvir, { capture: true });
}
