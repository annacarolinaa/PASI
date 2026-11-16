import { useSyncExternalStore } from 'react';

/**
 * Tema do painel (claro/escuro).
 * - Sem escolha salva, vale a preferência do sistema operacional (e acompanha
 *   a troca feita nele enquanto o painel está aberto).
 * - Ao escolher em "Aparência" (ou no botão sol/lua das telas de acesso), a escolha
 *   fica em localStorage ("pasi-tema": "claro" | "escuro") e passa a valer sempre.
 * - O resultado vai em <html data-theme="light|dark">; o CSS escuro está em
 *   styles/dark.css. O script do index.html faz o mesmo antes da primeira pintura.
 */
export type Tema = 'claro' | 'escuro';

const KEY = 'pasi-tema';
const consulta = () => window.matchMedia('(prefers-color-scheme: dark)');

function lerEscolha(): Tema | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'claro' || v === 'escuro' ? v : null;
  } catch {
    return null;
  }
}

function resolver(): Tema {
  return lerEscolha() ?? (consulta().matches ? 'escuro' : 'claro');
}

const ouvintes = new Set<() => void>();
let atual: Tema = 'claro';

function aplicar(t: Tema) {
  document.documentElement.setAttribute('data-theme', t === 'escuro' ? 'dark' : 'light');
  if (t === atual) return;
  atual = t;
  ouvintes.forEach((f) => f());
}

/** Liga o tema (chamar uma vez em main.tsx). */
export function iniciarTema() {
  atual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'escuro' : 'claro';
  aplicar(resolver());
  // acompanha o sistema enquanto não houver escolha salva
  consulta().addEventListener('change', () => {
    if (!lerEscolha()) aplicar(resolver());
  });
  // acompanha a escolha feita em outra aba aberta
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) aplicar(resolver());
  });
}

export function definirTema(t: Tema) {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
  aplicar(t);
}

function assinar(f: () => void) {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

/** Tema atual e função para trocá-lo. */
export function useTema(): [Tema, (t: Tema) => void] {
  const tema = useSyncExternalStore(assinar, () => atual, () => 'claro' as Tema);
  return [tema, definirTema];
}
