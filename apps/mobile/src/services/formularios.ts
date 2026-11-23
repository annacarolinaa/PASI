import api from '../config/api';

// -------------------------------------------------------
// Interfaces (usadas em ResponderFormulario)
// -------------------------------------------------------
export interface Opcao {
  id_opcao: number;
  texto_opcao: string;
  valor_opcao?: number;
}

export interface Pergunta {
  id_pergunta: number;
  id_tipo_pergunta: number;
  pergunta: string;
  valor_minimo?: number;
  valor_maximo?: number;
  obrigatoria?: boolean;
  tipo_pergunta: { nome?: string };
  opcao_pergunta: Opcao[];
}

export interface RespostaAtual {
  id_resposta: number;
  id_pergunta: number;
  valor_texto?: string;
  valor_numero?: number;
  valor_binario?: boolean;
  valor_data?: string;
}

export interface DetalheFormulario {
  atendimento: { id_atendimento: number; id_situacao_atendimento: number };
  formulario_paciente: {
    id_formulario_paciente: number;
    id_situacao_formulario: number;
  } | null;
  formulario: {
    id_formulario: number;
    nome?: string;
    descricao?: string;
    documentos?: { id_documento: number; caminho: string; nome_fisico?: string }[];
    pergunta: Pergunta[];
  };
  respostas: RespostaAtual[];
}

export interface RespostaItem {
  id_pergunta: number;
  valor_texto?: string;
  valor_numero?: number;
  valor_binario?: boolean;
  valor_data?: string;
  id_opcoes?: number[];
}

export const formulariosService = {
  iniciar: (idAtendimento: number, idFormulario: number) =>
    api
      .post<DetalheFormulario>(
        `/atendimentos/${idAtendimento}/formularios/${idFormulario}/iniciar`,
      )
      .then((r) => r.data),

  detalhar: (idAtendimento: number, idFormulario: number) =>
    api
      .get<DetalheFormulario>(
        `/atendimentos/${idAtendimento}/formularios/${idFormulario}/respostas`,
      )
      .then((r) => r.data),

  salvar: (idAtendimento: number, idFormulario: number, respostas: RespostaItem[]) =>
    api
      .put<DetalheFormulario>(
        `/atendimentos/${idAtendimento}/formularios/${idFormulario}/respostas`,
        { respostas },
      )
      .then((r) => r.data),

  concluir: (idAtendimento: number, idFormulario: number) =>
    api
      .post(`/atendimentos/${idAtendimento}/formularios/${idFormulario}/concluir`)
      .then((r) => r.data),
};
