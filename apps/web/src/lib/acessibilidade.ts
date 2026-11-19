import { useSyncExternalStore } from 'react';

/**
 * Preferências de acessibilidade do painel (RF04/RF05 de docs/requisitos_acessibilidade.md).
 * - Ficam em localStorage ("pasi-a11y") e valem em todas as telas, inclusive após recarregar.
 * - Viram classes no <html> (a11y-font-1/2, a11y-contraste, a11y-pb, a11y-movimento); o CSS está em
 *   styles/acessibilidade.css. O script do index.html aplica as classes antes da primeira pintura.
 * - A leitura em voz alta usa a síntese de voz do navegador (Web Speech API), como na landing page.
 */
export interface PrefsA11y {
  /** 0 = normal, 1 = maior, 2 = muito maior */
  fonte: 0 | 1 | 2;
  contraste: boolean;
  pretoBranco: boolean;
  leitura: boolean;
  /** desliga animações e transições */
  movimento: boolean;
}

export const FONTE_MAX = 2;
const KEY = 'pasi-a11y';
const PADRAO: PrefsA11y = { fonte: 0, contraste: false, pretoBranco: false, leitura: false, movimento: false };

function ler(): PrefsA11y {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<PrefsA11y> | null;
    if (!v || typeof v !== 'object') return PADRAO;
    const fonte = v.fonte === 1 || v.fonte === 2 ? v.fonte : 0;
    return { fonte, contraste: !!v.contraste, pretoBranco: !!v.pretoBranco, leitura: !!v.leitura, movimento: !!v.movimento };
  } catch {
    return PADRAO;
  }
}

let atual: PrefsA11y = PADRAO;
const ouvintes = new Set<() => void>();

function aplicar(p: PrefsA11y) {
  const html = document.documentElement.classList;
  html.toggle('a11y-font-1', p.fonte === 1);
  html.toggle('a11y-font-2', p.fonte === 2);
  html.toggle('a11y-contraste', p.contraste);
  html.toggle('a11y-pb', p.pretoBranco);
  html.toggle('a11y-movimento', p.movimento);
  if (atual.leitura && !p.leitura) pararFala();
  atual = p;
  ouvintes.forEach((f) => f());
}

/** Liga as preferências (chamar uma vez em main.tsx). */
export function iniciarAcessibilidade() {
  atual = ler();
  aplicar(atual);
  // acompanha a mudança feita em outra aba aberta
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) aplicar(ler());
  });
}

export function definirPrefs(mudanca: Partial<PrefsA11y>) {
  const p = { ...atual, ...mudanca };
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
  aplicar(p);
}

export function redefinirPrefs() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* sem armazenamento */
  }
  aplicar(PADRAO);
}

function assinar(f: () => void) {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

/** Preferências atuais (re-renderiza quando mudam). */
export function usePrefsA11y(): PrefsA11y {
  return useSyncExternalStore(assinar, () => atual, () => PADRAO);
}

/* ---------- Leitura em voz alta (RF05) ---------- */

export const vozDisponivel = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function leituraAtiva() {
  return atual.leitura && vozDisponivel();
}

/**
 * Lê um texto em voz alta, em português do Brasil.
 * @param interromper true (padrão) para cortar a leitura em andamento; false para
 *   entrar na fila (usado pelos avisos, que não devem calar a leitura do botão clicado).
 */
// falas na fila: manter a referência evita que o Chrome descarte a fala antes de terminar
const falasAtivas = new Set<SpeechSynthesisUtterance>();
let pedido = 0;
let atraso = 0;

export function falar(texto: string, interromper = true) {
  if (!vozDisponivel()) return;
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (!limpo) return;
  const synth = window.speechSynthesis;
  const fala = new SpeechSynthesisUtterance(limpo);
  fala.lang = 'pt-BR';
  const voz = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt-br'));
  if (voz) fala.voice = voz;
  const fim = () => falasAtivas.delete(fala);
  fala.onend = fim;
  fala.onerror = fim;
  const tocar = () => {
    falasAtivas.add(fala);
    synth.speak(fala);
  };
  if (!interromper) {
    tocar();
    return;
  }
  // No Chrome (Windows), speak() logo após cancel() com uma fala em andamento às vezes é
  // descartado sem aviso (ex.: Tab do campo de busca, ainda sendo lido, para o botão Filtros).
  // Por isso, havendo fala em andamento, cancela e fala só depois de um instante; e, em Tabs
  // rápidos, vale só o último pedido.
  const meu = ++pedido;
  window.clearTimeout(atraso);
  if (synth.speaking || synth.pending) {
    synth.cancel();
    falasAtivas.clear();
    atraso = window.setTimeout(() => {
      if (meu === pedido) tocar();
    }, 80);
  } else {
    tocar();
  }
}

/** Lê um aviso do sistema (toast, alerta de erro) se a leitura estiver ligada, sem cortar a leitura em andamento. */
let ultimoAviso = { texto: '', quando: 0 };
export function lerAviso(texto: string) {
  if (!leituraAtiva()) return;
  // o mesmo aviso disparado duas vezes seguidas (ex.: efeito repetido do StrictMode) é lido uma vez só
  const agora = Date.now();
  if (texto === ultimoAviso.texto && agora - ultimoAviso.quando < 1500) return;
  ultimoAviso = { texto, quando: agora };
  falar(texto, false);
}

export function pararFala() {
  if (!vozDisponivel()) return;
  pedido++;
  window.clearTimeout(atraso);
  falasAtivas.clear();
  window.speechSynthesis.cancel();
}
