import api from '../config/api';

export interface LoginPayload {
  login: string;
  senha: string;
  /** 'app' faz a API recusar quem não é paciente (profissional usa o painel web). */
  canal?: 'web' | 'app';
}

export interface CadastroPacientePayload {
  nome: string;
  cpf: string;
  email: string;
  tel_celular: string;
  sexo: string;
  dt_nascimento?: string;
  nac_estrangeira?: boolean;
  id_genero?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  senha: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post('/auth/login', payload).then((r) => r.data),

  cadastrarPaciente: (payload: CadastroPacientePayload) =>
    api.post('/usuarios/paciente', payload).then((r) => r.data),

  esqueceuSenha: (email: string) =>
    api.post('/auth/esqueceu-senha', { email }).then((r) => r.data),
};
