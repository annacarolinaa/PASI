import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import * as docApi from '../api/documentos';
import type { Documento } from '../api/documentos';
import { mensagemErro } from '../api/client';
import { data } from '../lib/format';
import { IcFormulario, Ic } from './icons';
import { MensagemErro } from './Form';

const BAIXAR = 'M12 4v12M7 11l5 5 5-5M4 20h16';
const LIXEIRA = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3';
const ENVIAR = 'M12 16V4M7 9l5-5 5 5M4 20h16';

/** Um arquivo (.ps-file) com baixar e, opcionalmente, excluir. */
export function ArquivoDoc({ doc, aoExcluir }: { doc: Documento; aoExcluir?: () => void }) {
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState(false);

  async function baixar() {
    if (baixando) return;
    setBaixando(true);
    setErro(null);
    try {
      await docApi.baixar(doc);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBaixando(false);
    }
  }

  const rotulo = baixando ? 'Baixando arquivo…' : 'Baixar arquivo';
  return (
    <>
      <div className="ps-file">
        <span className="fi">
          <IcFormulario lg />
        </span>
        <div className="meta">
          <div className="name">{doc.nome_fisico || `Documento ${doc.id_documento}`}</div>
          <div className="sub">Enviado em {data(doc.dt_cadastro)}</div>
        </div>
        <button
          type="button"
          className="act tt"
          aria-label={rotulo}
          data-tip={rotulo}
          aria-busy={baixando}
          onClick={() => void baixar()}
        >
          {baixando ? <span className="giro lg" aria-hidden="true" /> : <Ic d={BAIXAR} />}
        </button>
        {aoExcluir && (
          <button type="button" className="act tt danger" aria-label="Excluir arquivo" data-tip="Excluir arquivo" onClick={aoExcluir}>
            <Ic d={LIXEIRA} />
          </button>
        )}
      </div>
      {erro && <MensagemErro>{erro}</MensagemErro>}
    </>
  );
}

/**
 * Área para soltar ou escolher um arquivo (.ps-drop). A área inteira é um botão:
 * clicar (ou Enter/Espaço) abre a seleção de arquivos.
 */
export function SoltarArquivo({ aoEscolher, enviando }: { aoEscolher: (f: File) => void; enviando?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [sobre, setSobre] = useState(false);
  const abrir = () => {
    if (!enviando) input.current?.click();
  };
  const soltar = (e: DragEvent) => {
    e.preventDefault();
    setSobre(false);
    const f = e.dataTransfer.files?.[0];
    if (f && !enviando) aoEscolher(f);
  };
  const tecla = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrir();
    }
  };
  return (
    <div
      className={'ps-drop' + (sobre ? ' is-drag' : '') + (enviando ? ' is-busy' : '')}
      role="button"
      tabIndex={0}
      aria-label="Enviar documento: arraste um arquivo até aqui ou pressione Enter para escolher. Até 10 MB."
      aria-busy={enviando || undefined}
      onClick={abrir}
      onKeyDown={tecla}
      onDragOver={(e) => {
        e.preventDefault();
        setSobre(true);
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={soltar}
    >
      <span className="ico" aria-hidden="true">
        {enviando ? <span className="giro lg" /> : <Ic d={ENVIAR} lg />}
      </span>
      <strong aria-hidden="true">{enviando ? 'Enviando…' : 'Arraste um arquivo ou escolha'}</strong>
      <span aria-hidden="true">Até 10 MB por arquivo.</span>
      {/* só visual: quem abre a seleção é a área inteira */}
      <span className="ps-btn secondary sm btn-falso" aria-hidden="true">
        Escolher arquivo
      </span>
      <input
        ref={input}
        type="file"
        hidden
        // o clique programático no input sobe até a área; sem isso ela tentaria abrir de novo
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) aoEscolher(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
