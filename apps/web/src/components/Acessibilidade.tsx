import { useEffect, useId, useRef, useState } from 'react';
import { FONTE_MAX, definirPrefs, falar, redefinirPrefs, usePrefsA11y, vozDisponivel } from '../lib/acessibilidade';
import { Ic, IcFechar } from './icons';

/**
 * Menu de acessibilidade do painel (RF04): botão fixo no canto inferior direito,
 * presente em todas as telas (inclusive login), com as mesmas ferramentas da
 * landing page — tamanho do texto, alto contraste, preto e branco, leitura em
 * voz alta e VLibras —, mais a redução de movimento, e o botão de redefinir.
 */

const IcAcessibilidade = () => (
  <Ic lg>
    <circle cx="12" cy="4.5" r="1.8" />
    <path d="M4.5 8.5 12 10l7.5-1.5M12 10v4.5M12 14.5 8.5 21M12 14.5l3.5 6.5" />
  </Ic>
);
const IcVoz = () => <Ic d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />;
const IcMaos = () => (
  <Ic d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 10.5V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v6.5M17 10a1.5 1.5 0 0 1 3 0v3.5a7.5 7.5 0 0 1-7.5 7.5h-1a6 6 0 0 1-5-2.7L4 14.7a1.5 1.5 0 0 1 2.4-1.8L8 15" />
);

type VLibrasWindow = Window & { VLibras?: { Widget: new (path: string) => unknown } };

/** Injeta o widget oficial do VLibras uma única vez (mesmo código da landing page). */
function useVLibras() {
  useEffect(() => {
    if (document.getElementById('vlibras-wrapper')) return;
    const container = document.createElement('div');
    container.id = 'vlibras-wrapper';
    container.setAttribute('vw', '');
    container.className = 'enabled';
    container.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(container);

    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      const { VLibras } = window as VLibrasWindow;
      if (VLibras) new VLibras.Widget('https://vlibras.gov.br/app');
    };
    document.body.appendChild(script);
  }, []);
}

/* ---------- Leitura em voz alta ao clicar ou focar (RF05) ---------- */

// elementos "com significado" que são lidos inteiros, em vez do pedaço clicado
const LEGIVEL =
  'button, a, label, summary, legend, input, select, textarea, [role="button"], [role="tab"], [role="link"], [role="option"], [role="menuitem"], [role="checkbox"], [role="radio"], [role="switch"], [role="alert"], [role="status"], h1, h2, h3, h4, h5, h6, p, li, dt, dd, th, td, .ps-helper, .ps-label, .ps-badge, [data-tip], [aria-label]';
// texto solto (um <div> grande clicado no vazio) só é lido se for curto
const MAX_SOLTO = 240;

function textoDe(el: Element | null): string {
  return el instanceof HTMLElement ? el.innerText.replace(/\s+/g, ' ').trim() : '';
}

function textoDescricao(el: HTMLElement): string {
  const ids = el.getAttribute('aria-describedby');
  if (!ids) return '';
  return ids
    .split(/\s+/)
    .map((id) => textoDe(document.getElementById(id)))
    .filter(Boolean)
    .join('. ');
}

/** Nome do campo: <label> ligado, aria-label, aria-labelledby ou placeholder. */
function rotuloDoCampo(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  const porLabel = el.labels && el.labels.length ? textoDe(el.labels[0]).replace(/\s*\*$/, '') : '';
  const porIds = (el.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .map((id) => textoDe(document.getElementById(id)))
    .filter(Boolean)
    .join(' ');
  return el.getAttribute('aria-label') || porLabel || porIds || el.getAttribute('placeholder') || '';
}

function textoDoCampo(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  const partes = [rotuloDoCampo(el)];
  if (el instanceof HTMLSelectElement) {
    partes.push(el.selectedOptions[0]?.text ?? '');
  } else if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    partes.push(el.checked ? 'marcado' : 'desmarcado');
  } else if (el instanceof HTMLInputElement && el.type === 'password') {
    // nunca lê a senha em voz alta
    partes.push(el.value ? 'campo de senha preenchido' : 'campo de senha vazio');
  } else {
    partes.push(el.value ? el.value : 'vazio');
  }
  if (el.getAttribute('aria-invalid') === 'true') partes.push('Campo com erro');
  partes.push(textoDescricao(el));
  return partes.filter(Boolean).join('. ');
}

/** Texto a ler para o elemento clicado ou focado. */
function textoParaLer(alvo: EventTarget | null): string {
  if (!(alvo instanceof Element)) return '';
  // o próprio widget do VLibras tem seus controles
  if (alvo.closest('[vw]')) return '';
  const el = alvo.closest<HTMLElement>(LEGIVEL);
  if (!el) {
    const solto = textoDe(alvo);
    return solto.length <= MAX_SOLTO ? solto : '';
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    return textoDoCampo(el);
  }
  const visivel = textoDe(el);
  // Como no cálculo de nome acessível (ARIA), o aria-label vem antes do conteúdo; um texto
  // curto visível que o rótulo não cita (ex.: contador "2" no botão Filtros) é lido em seguida.
  const aria = (el.getAttribute('aria-label') ?? '').trim();
  let base: string;
  if (aria) {
    const extra = visivel && visivel.length <= 20 && !aria.toLowerCase().includes(visivel.toLowerCase()) ? `. ${visivel}` : '';
    base = aria + extra;
  } else {
    // botões só com ícone sem aria-label: vale a dica
    base = visivel || el.getAttribute('data-tip') || el.getAttribute('title') || '';
  }
  const estado = el.getAttribute('aria-pressed');
  return estado === 'true' ? `${base}. Ativado` : estado === 'false' ? `${base}. Desativado` : base;
}

function useLeituraAoClicar(ativa: boolean) {
  useEffect(() => {
    if (!ativa) return;
    let ultimo = { texto: '', quando: 0 };
    const ler = (texto: string) => {
      const agora = Date.now();
      // o clique num campo também o foca: não lê duas vezes seguidas
      if (!texto || (texto === ultimo.texto && agora - ultimo.quando < 800)) return;
      ultimo = { texto, quando: agora };
      falar(texto);
    };
    const aoClicar = (e: MouseEvent) => ler(textoParaLer(e.target));
    const aoFocar = (e: FocusEvent) => {
      // só o foco por teclado (Tab); o do mouse já é lido pelo clique
      const el = e.target;
      if (el instanceof HTMLElement && el.matches(':focus-visible')) ler(textoParaLer(el));
    };
    document.addEventListener('click', aoClicar, true);
    document.addEventListener('focusin', aoFocar);
    return () => {
      document.removeEventListener('click', aoClicar, true);
      document.removeEventListener('focusin', aoFocar);
    };
  }, [ativa]);
}

/* ---------- Menu ---------- */

export function MenuAcessibilidade() {
  const prefs = usePrefsA11y();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const idPainel = useId();
  const idTitulo = useId();
  const temVoz = vozDisponivel();

  useVLibras();
  useLeituraAoClicar(prefs.leitura && temVoz);

  // fecha ao clicar fora ou apertar Esc (devolvendo o foco ao botão)
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener('mousedown', fora);
    window.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fora);
      window.removeEventListener('keydown', tecla);
    };
  }, [aberto]);

  const alternarLeitura = () => {
    const ligar = !prefs.leitura;
    definirPrefs({ leitura: ligar });
    // confirma por voz que o recurso foi ligado
    if (ligar) falar('Leitura em voz alta ativada. Clique em um texto ou navegue com a tecla Tab para ouvi-lo.');
  };

  const abrirLibras = () => {
    document.querySelector<HTMLElement>('[vw-access-button]')?.click();
    setAberto(false);
  };

  return (
    <div className="ps a11y" ref={raiz}>
      <div className={'a11y-painel' + (aberto ? ' is-open' : '')} id={idPainel} role="region" aria-labelledby={idTitulo} hidden={!aberto}>
        <div className="a11y-topo">
          <strong id={idTitulo}>Acessibilidade</strong>
          <button
            type="button"
            className="a11y-fechar"
            aria-label="Fechar menu de acessibilidade"
            onClick={() => {
              setAberto(false);
              botao.current?.focus();
            }}
          >
            <IcFechar />
          </button>
        </div>

        <div className="a11y-bloco" role="group" aria-label="Tamanho do texto">
          <span className="a11y-rotulo" aria-hidden="true">
            Tamanho do texto
          </span>
          <div className="a11y-fonte">
            <button
              type="button"
              onClick={() => definirPrefs({ fonte: Math.max(prefs.fonte - 1, 0) as 0 | 1 | 2 })}
              disabled={prefs.fonte === 0}
              aria-label="Diminuir o tamanho do texto"
            >
              A<span>-</span>
            </button>
            <button
              type="button"
              className="maior"
              onClick={() => definirPrefs({ fonte: Math.min(prefs.fonte + 1, FONTE_MAX) as 0 | 1 | 2 })}
              disabled={prefs.fonte === FONTE_MAX}
              aria-label="Aumentar o tamanho do texto"
            >
              A<span>+</span>
            </button>
          </div>
        </div>

        <button type="button" className="a11y-linha" aria-pressed={prefs.contraste} onClick={() => definirPrefs({ contraste: !prefs.contraste })}>
          <span>Alto contraste</span>
          <span className={'a11y-switch' + (prefs.contraste ? ' is-on' : '')} aria-hidden="true" />
        </button>

        <button type="button" className="a11y-linha" aria-pressed={prefs.pretoBranco} onClick={() => definirPrefs({ pretoBranco: !prefs.pretoBranco })}>
          <span>Preto e branco</span>
          <span className={'a11y-switch' + (prefs.pretoBranco ? ' is-on' : '')} aria-hidden="true" />
        </button>

        <button type="button" className="a11y-linha" aria-pressed={prefs.movimento} onClick={() => definirPrefs({ movimento: !prefs.movimento })}>
          <span>
            Reduzir movimento
            <small>Desliga animações e transições.</small>
          </span>
          <span className={'a11y-switch' + (prefs.movimento ? ' is-on' : '')} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="a11y-linha"
          aria-pressed={temVoz ? prefs.leitura : undefined}
          disabled={!temVoz}
          onClick={alternarLeitura}
        >
          <span>
            <span className="a11y-titulo">
              <IcVoz />
              Leitura em voz alta
            </span>
            <small>{temVoz ? 'Clique em um texto ou use a tecla Tab para ouvi-lo.' : 'Indisponível neste navegador.'}</small>
          </span>
          {temVoz && <span className={'a11y-switch' + (prefs.leitura ? ' is-on' : '')} aria-hidden="true" />}
        </button>

        <button type="button" className="a11y-linha" onClick={abrirLibras}>
          <span className="a11y-titulo">
            <IcMaos />
            Tradução em Libras (VLibras)
          </span>
        </button>

        <button type="button" className="a11y-redefinir" onClick={redefinirPrefs}>
          Redefinir preferências
        </button>
      </div>

      <button
        type="button"
        ref={botao}
        className="a11y-botao"
        aria-expanded={aberto}
        aria-controls={idPainel}
        aria-label={aberto ? 'Fechar menu de acessibilidade' : 'Abrir menu de acessibilidade'}
        onClick={() => setAberto((a) => !a)}
      >
        <IcAcessibilidade />
      </button>
    </div>
  );
}
