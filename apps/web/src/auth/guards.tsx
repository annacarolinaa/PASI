import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { rotaInicial, useAuth } from './AuthContext';
import { SituacaoUsuario } from '../api/types';
import { Esq, EsqAplicativo } from '../components/Esqueleto';

/** Telas de acesso: só um esqueleto do formulário, sem o menu lateral. */
function CarregandoAcesso() {
  return (
    <div className="ps" role="status" aria-busy="true" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="ps-sr">Carregando…</span>
      <div aria-hidden="true" style={{ width: 'min(440px, calc(100vw - 48px))', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Esq w={132} h={40} r={8} />
        <Esq w="70%" h={28} r={8} />
        <Esq w="90%" h={14} />
        <Esq w="100%" h={48} r={10} />
        <Esq w="100%" h={48} r={10} />
        <Esq w="100%" h={48} r={10} />
      </div>
    </div>
  );
}

/** Só para quem NÃO está logado (login, esqueci a senha, redefinir senha). */
export function SoVisitante() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <CarregandoAcesso />;
  if (usuario) return <Navigate to={rotaInicial(usuario)} replace />;
  return <Outlet />;
}

/**
 * Exige login e uma das situações permitidas (RN-USR-08 e 09):
 * Pendência I só troca a senha; Pendência II só revisa os dados.
 */
export function ExigeSituacao({ situacoes, soMaximo = false }: { situacoes: number[]; soMaximo?: boolean }) {
  const { usuario, carregando, ehMaximo } = useAuth();
  const local = useLocation();
  if (carregando) return <EsqAplicativo />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  if (!situacoes.includes(usuario.id_situacao_usuario)) return <Navigate to={rotaInicial(usuario)} replace />;
  if (soMaximo && !ehMaximo) return <Navigate to="/atendimentos" replace />;
  return <Outlet />;
}

export const SO_DEFERIDO = [SituacaoUsuario.DEFERIDO];
export const SO_PENDENCIA_I = [SituacaoUsuario.PENDENCIA_I];
export const SO_PENDENCIA_II = [SituacaoUsuario.PENDENCIA_II];
