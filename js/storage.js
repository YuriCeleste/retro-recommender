const CHAVES_DADOS_LEGADOS = [
  'retroRecommender.buscas.v1',
  'retroRecommender.produtos.v1',
  'retroRecommender.navegacao.v1',
  'retroRecommender.permagram.v1',
  'retroRecommender.superflix.v1'
];

let usuarioDadosAtivo = null;

function ativarEscopoDadosUsuario(usuario) {
  if (!usuario) throw new Error('Não é possível carregar dados sem um usuário ativo.');
  usuarioDadosAtivo = usuario;
}

function desativarEscopoDadosUsuario() {
  usuarioDadosAtivo = null;
}

function chaveDadosUsuario(chave) {
  if (!usuarioDadosAtivo) {
    throw new Error('Não é possível acessar dados sem um usuário ativo.');
  }
  return `${chave}.usuario.${encodeURIComponent(usuarioDadosAtivo)}`;
}

function migrarDadosLegadosUsuario(usuario) {
  if (localStorage.getItem('contaUsuario') !== usuario) return;

  CHAVES_DADOS_LEGADOS.forEach(chaveLegada => {
    const dadosLegados = localStorage.getItem(chaveLegada);
    const chaveUsuario = chaveDadosUsuario(chaveLegada);
    if (dadosLegados !== null && localStorage.getItem(chaveUsuario) === null) {
      localStorage.setItem(chaveUsuario, dadosLegados);
    }
  });
}
