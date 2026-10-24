// Horário ao vivo no navegador: status (aberto/fecha em/abre) e "hoje" na tabela.
// O HTML estático já traz a tabela completa; isto só acrescenta o agora.
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

atualizar();
// Reavalia a cada 30 s (o rótulo "Fecha em N min" muda por minuto).
setInterval(atualizar, 30_000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) atualizar();
});
