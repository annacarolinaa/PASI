import { Ic } from './icons';
import { useTema } from '../lib/tema';

const SOL = 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4';
const LUA = 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z';

const IcSol = () => (
  <Ic>
    <circle cx="12" cy="12" r="4" />
    <path d={SOL} />
  </Ic>
);
const IcLua = () => <Ic d={LUA} />;

/** "Aparência" do menu lateral: Claro | Escuro (Tema.dc / Sidebar.dc do canvas). */
export function SeletorTema() {
  const [tema, definir] = useTema();
  return (
    <div className="tema" role="group" aria-labelledby="tema-l">
      <span className="nav-label" id="tema-l">
        Aparência
      </span>
      <div className="ps-seg tema-seg">
        <button type="button" className={tema === 'claro' ? 'is-selected' : ''} aria-pressed={tema === 'claro'} onClick={() => definir('claro')}>
          <IcSol />
          Claro
        </button>
        <button type="button" className={tema === 'escuro' ? 'is-selected' : ''} aria-pressed={tema === 'escuro'} onClick={() => definir('escuro')}>
          <IcLua />
          Escuro
        </button>
      </div>
    </div>
  );
}

/** Botão sol/lua no canto das telas de acesso. */
export function BotaoTema() {
  const [tema, definir] = useTema();
  const rotulo = tema === 'escuro' ? 'Ativar modo claro' : 'Ativar modo escuro';
  return (
    <button type="button" className="tema-btn tt" onClick={() => definir(tema === 'escuro' ? 'claro' : 'escuro')} aria-label={rotulo} data-tip={rotulo}>
      {tema === 'escuro' ? <IcSol /> : <IcLua />}
    </button>
  );
}
