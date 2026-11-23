import axios from 'axios';
import api from '../config/api';

export const apoioService = {
  getGeneros: () =>
    api.get('/apoio/generos').then((r) => r.data as { id_genero: number; nome: string }[]),
};

export const buscarCep = async (cep: string) => {
  const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
  if (data.erro) return null;
  return data as {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
  };
};
