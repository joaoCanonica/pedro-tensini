// Horário ao vivo no navegador: status (aberto/fecha em/abre) e "hoje" na tabela.
// O HTML estático já traz a tabela completa (é o que o Google e as IAs leem); isto só
// hidrata no cliente o 'agora': o rótulo do status e a linha de hoje.
import { diaLocal, diaSemanaDe, statusEm } from '../../lib/horario.ts';

function atualizar(): void {
  const agora = new Date();
  const s = statusEm(agora);
  for (const el of document.querySelectorAll<HTMLElement>('[data-status-vivo]')) {
    const texto = el.querySelector('.status__texto');
    if (texto) texto.textContent = s.rotulo;
    el.dataset['aberto'] = String(s.aberto);
  }
  const hoje = String(diaSemanaDe(diaLocal(agora)));
  for (const linha of document.querySelectorAll<HTMLElement>(
    '[data-tabela-horario] tr[data-dia]',
  )) {
    const eHoje = linha.dataset['dia'] === hoje;
    if (eHoje) linha.setAttribute('aria-current', 'date');
    else linha.removeAttribute('aria-current');
    const marca = linha.querySelector<HTMLElement>('.tabela__hoje');
    if (marca) marca.hidden = !eHoje;
  }
}

// Atualiza na virada de cada minuto ("Fecha em N min" muda por minuto), só com a aba visível:
// aba escondida não gasta nada; ao voltar, atualiza na hora e retoma o ritmo.
let proximo: ReturnType<typeof setTimeout> | undefined;
function agendar(): void {
  clearTimeout(proximo);
  if (document.hidden) return;
  proximo = setTimeout(
    () => {
      atualizar();
      agendar();
    },
    60_000 - (Date.now() % 60_000) + 50,
  );
}

atualizar();
agendar();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) atualizar();
  agendar();
});
