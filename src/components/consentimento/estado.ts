// Consentimento para conteúdo de terceiros (hoje: o mapa interativo do Google; amanhã, qualquer
// medição com cookie). Guarda só a escolha, no navegador da pessoa (localStorage, sem cookie),
// e avisa a página por eventos. Sem escolha = nada de terceiros.
export type Escolha = 'aceito' | 'recusado';

const CHAVE = 'tensini:consentimento';
const VERSAO = 1;

export function lerConsentimento(): Escolha | null {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as {
      escolha?: string;
      versao?: number;
    } | null;
    if (v?.versao !== VERSAO) return null;
    return v.escolha === 'aceito' || v.escolha === 'recusado' ? v.escolha : null;
  } catch {
    return null;
  }
}

export function gravarConsentimento(escolha: Escolha): void {
  try {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({ escolha, versao: VERSAO, em: new Date().toISOString().slice(0, 10) }),
    );
  } catch {
    // navegação privada sem storage: vale só para esta página
  }
  dispatchEvent(new CustomEvent<Escolha>('tensini:consentimento', { detail: escolha }));
}

/** Abre o banner (rodapé, mapa). `motivo` aparece no texto ("para ver o mapa"). */
export function pedirConsentimento(motivo = ''): void {
  dispatchEvent(new CustomEvent<string>('tensini:pedir-consentimento', { detail: motivo }));
}
