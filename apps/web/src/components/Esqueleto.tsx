import type { CSSProperties, ReactNode } from 'react';

/**
 * Loading skeleton: blocos cinza com brilho animado (.ps-skel do design system)
 * no formato dos componentes que vão aparecer. Assim a pessoa vê que a tela está
 * carregando — e não que travou ou que não há registros.
 * Tudo aqui é decorativo (aria-hidden); quem anuncia o carregamento ao leitor de
 * tela é o <TelaCarregando>, com role="status".
 */
export function Esq({
  w = '100%',
  h = 12,
  r,
  circulo = false,
  estilo,
}: {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  circulo?: boolean;
  estilo?: CSSProperties;
}) {
  return (
    <span
      className={'ps-skel' + (circulo ? ' circle' : '')}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0, width: w, height: h, ...(r !== undefined ? { borderRadius: r } : {}), ...estilo }}
    />
  );
}

/** Envolve o esqueleto de uma tela e avisa o leitor de tela que está carregando. */
export function TelaCarregando({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="esq-tela" role="status" aria-live="polite" aria-busy="true">
      <span className="ps-sr">{rotulo}</span>
      {children}
    </div>
  );
}

/** Cabeçalho da página: migalhas, título (com avatar e selos opcionais) e ações. */
export function EsqCabecalho({
  titulo = 280,
  selos = 0,
  avatar = 0,
  acoes = 0,
  migalhas = 3,
}: {
  titulo?: number;
  selos?: number;
  /** tamanho do avatar em px (0 = sem avatar) */
  avatar?: number;
  acoes?: number;
  migalhas?: number;
}) {
  return (
    <header className="page-head" aria-hidden="true">
      <div className="ph-bloco">
        {migalhas > 0 && (
          <div className="crumbs esq-linha" style={{ gap: 10 }}>
            {Array.from({ length: migalhas }, (_, i) => (
              <Esq key={i} w={i === migalhas - 1 ? 110 : 70} h={12} />
            ))}
          </div>
        )}
        <div className="esq-linha" style={{ gap: 12 }}>
          {avatar > 0 && <Esq w={avatar} h={avatar} circulo />}
          <Esq w={titulo} h={30} r={8} />
          {Array.from({ length: selos }, (_, i) => (
            <Esq key={i} w={76} h={24} r={999} />
          ))}
        </div>
      </div>
      {acoes > 0 && (
        <div className="actions">
          {Array.from({ length: acoes }, (_, i) => (
            <Esq key={i} w={i === acoes - 1 ? 150 : 110} h={44} r={10} />
          ))}
        </div>
      )}
    </header>
  );
}

/** Card (.panel) com título e um corpo de esqueleto. */
export function EsqPainel({
  titulo = 150,
  acao = false,
  children,
  rodape,
}: {
  titulo?: number;
  /** botão pequeno no cabeçalho do card */
  acao?: boolean;
  children?: ReactNode;
  rodape?: ReactNode;
}) {
  return (
    <section className="panel" aria-hidden="true">
      <header>
        <Esq w={titulo} h={18} r={6} />
        {acao && <Esq w={130} h={36} r={10} />}
      </header>
      {children && <div className="pb">{children}</div>}
      {rodape && <footer>{rodape}</footer>}
    </section>
  );
}

/** Pares rótulo/valor (.kv). */
export function EsqKv({ n = 4, colunas = 2 }: { n?: number; colunas?: number }) {
  return (
    <div className="kv" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Esq w={i % 2 ? '38%' : '46%'} h={11} />
          <Esq w={i % 3 ? '72%' : '58%'} h={15} />
        </div>
      ))}
    </div>
  );
}

/** Itens de lista (.item): número ou ícone, texto, selos e, se quiser, um campo. */
export function EsqItens({
  n = 3,
  numero = false,
  selos = false,
  campo = false,
  acoes = 0,
}: {
  n?: number;
  numero?: boolean;
  selos?: boolean;
  campo?: boolean;
  acoes?: number;
}) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div className="item" key={i} style={{ alignItems: campo ? 'flex-start' : 'center' }} aria-hidden="true">
          {numero ? <Esq w={28} h={28} circulo /> : <Esq w={44} h={44} r={11} />}
          <div className="meta" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Esq w={['78%', '64%', '86%'][i % 3]} h={15} />
            {!selos && !campo && <Esq w="42%" h={12} />}
            {campo && <Esq w="100%" h={44} r={10} />}
            {selos && (
              <span className="esq-linha" style={{ gap: 8 }}>
                <Esq w={96} h={22} r={999} />
                <Esq w={84} h={22} r={999} />
              </span>
            )}
          </div>
          {acoes > 0 && (
            <div className="acts">
              {Array.from({ length: acoes }, (_, j) => (
                <Esq key={j} w={40} h={40} r={12} />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/** Campos de formulário: rótulo + controle. */
export function EsqCampos({ n = 3, colunas = 1 }: { n?: number; colunas?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gap: 16 }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Esq w={i % 2 ? 110 : 140} h={12} />
          <Esq w="100%" h={48} r={10} />
        </div>
      ))}
    </div>
  );
}

/** Arquivos (.ps-file) com o botão de baixar. */
export function EsqArquivos({ n = 2 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div className="ps-file" key={i} aria-hidden="true">
          <Esq w={40} h={40} r={9} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <Esq w={i % 2 ? '54%' : '70%'} h={13} />
            <Esq w="40%" h={11} />
          </div>
          <Esq w={40} h={40} r={12} />
        </div>
      ))}
    </>
  );
}

/** Botões empilhados (coluna de ações). */
export function EsqBotoes({ n = 2 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Esq key={i} w="100%" h={44} r={10} />
      ))}
    </>
  );
}

/** Cartões de escolha (.ps-choice), como na lista de formulários do atendimento. */
export function EsqEscolhas({ n = 3 }: { n?: number }) {
  return (
    <div role="status" aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span className="ps-sr">Carregando…</span>
      {Array.from({ length: n }, (_, i) => (
        <div className="ps-choice" key={i} aria-hidden="true" style={{ cursor: 'default' }}>
          <Esq w={44} h={44} r={11} />
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Esq w={['60%', '48%', '66%'][i % 3]} h={15} />
            <Esq w="36%" h={12} />
          </span>
          <Esq w={22} h={22} r={6} />
        </div>
      ))}
    </div>
  );
}

/**
 * Linhas de tabela no formato do grid: primeira coluna com duas linhas (nome e
 * detalhe), demais com uma, e a última com os botões de ação.
 */
export function LinhasEsqueleto({ colunas, linhas = 5, rotulo = 'Carregando…' }: { colunas: number; linhas?: number; rotulo?: string }) {
  return (
    <>
      {Array.from({ length: linhas }, (_, i) => (
        <tr key={i} className="esq-linha-tbl" aria-hidden={i > 0 ? 'true' : undefined}>
          {Array.from({ length: colunas }, (_, c) => (
            <td key={c}>
              {i === 0 && c === 0 && (
                <span className="ps-sr" role="status">
                  {rotulo}
                </span>
              )}
              {c === colunas - 1 ? (
                <span className="esq-linha" style={{ gap: 8 }}>
                  <Esq w={40} h={40} r={12} />
                  <Esq w={40} h={40} r={12} />
                </span>
              ) : c === 0 ? (
                <span style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Esq w={['70%', '56%', '78%', '62%', '50%'][i % 5]} h={14} />
                  <Esq w="44%" h={11} />
                </span>
              ) : (
                <Esq w={['64%', '48%', '72%'][(i + c) % 3]} h={13} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Menu lateral + conteúdo, enquanto a sessão é conferida (guards). */
export function EsqAplicativo() {
  return (
    <div className="ps app" role="status" aria-busy="true">
      <span className="ps-sr">Carregando…</span>
      <div className="side-slot" aria-hidden="true">
        <aside className="side">
          <Esq w={108} h={34} r={8} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Esq w={70} h={10} />
            {Array.from({ length: 4 }, (_, i) => (
              <Esq key={i} w="100%" h={40} r={10} />
            ))}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <Esq w="100%" h={64} r={17} />
          </div>
        </aside>
      </div>
      <main className="main">
        <EsqCabecalho acoes={1} />
        <div className="page-body">
          <section className="panel" aria-hidden="true">
            <div className="toolbar">
              <Esq w="100%" h={44} r={10} />
            </div>
            <table className="tbl">
              <tbody>
                <LinhasEsqueleto colunas={5} />
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
