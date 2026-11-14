/**
 * ============================================================
 *  MAIN — Retro Recommender
 * ============================================================
 */

const CHAVES_DADOS = {
  buscas: 'retroRecommender.buscas.v1',
  produtos: 'retroRecommender.produtos.v1',
  navegacao: 'retroRecommender.navegacao.v1'
};

function carregarListaSalva(chave) {
  const dados = localStorage.getItem(chave);
  if (dados === null) return [];

  const lista = JSON.parse(dados);
  if (!Array.isArray(lista)) {
    throw new Error(`Os dados salvos em "${chave}" não estão no formato esperado.`);
  }
  return lista;
}

function carregarNavegacaoSalva() {
  const dados = localStorage.getItem(CHAVES_DADOS.navegacao);
  if (dados === null) return { historico: [], indice: -1 };

  const navegacao = JSON.parse(dados);
  if (!navegacao || !Array.isArray(navegacao.historico) ||
      !Number.isInteger(navegacao.indice) ||
      navegacao.indice < -1 ||
      navegacao.indice >= navegacao.historico.length ||
      navegacao.historico.some(item => !item || typeof item.tela !== 'string')) {
    throw new Error('O histórico de navegação salvo está em um formato inválido.');
  }
  return navegacao;
}

function salvarNavegacao() {
  localStorage.setItem(CHAVES_DADOS.navegacao, JSON.stringify({
    historico,
    indice: indiceHistorico
  }));
}

let buscasSalvas = carregarListaSalva(CHAVES_DADOS.buscas);
let produtosSalvos = carregarListaSalva(CHAVES_DADOS.produtos);
const navegacaoSalva = carregarNavegacaoSalva();
let historico = navegacaoSalva.historico;
let indiceHistorico = navegacaoSalva.indice;
let estaLogado = false;

// ------------------------------------------------------------
// LOGIN, CADASTRO E LOGOUT
// ------------------------------------------------------------
function fazerLogout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    localStorage.removeItem('usuarioLogado');
    estaLogado = false;
    trocarTela('tela-login');
  }
}

function fazerCadastro() {
  const user = document.getElementById('cad-user').value.trim();
  const pass = document.getElementById('cad-pass').value.trim();
  if (user === "" || pass === "") { alert("Preencha todos os campos!"); return; }
  
  localStorage.setItem('contaUsuario', user);
  localStorage.setItem('contaSenha', pass);
  alert("Conta criada! Faça o login.");
  
  document.getElementById('cad-user').value = "";
  document.getElementById('cad-pass').value = "";
  trocarTela('tela-login');
}

function fazerLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  
  if (user === "" || pass === "") { alert("Preencha usuário e senha!"); return; }

  const contaUser = localStorage.getItem('contaUsuario');
  const contaPass = localStorage.getItem('contaSenha');

  if (contaUser === null) {
    alert("Nenhuma conta encontrada! Crie uma conta primeiro.");
    return;
  }

  if (user === contaUser && pass === contaPass) {
    localStorage.setItem('usuarioLogado', user);
    estaLogado = true;
    
    document.getElementById('login-user').value = "";
    document.getElementById('login-pass').value = "";
    
    trocarTela('tela-home');
    alert("Login realizado com sucesso!");
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// ------------------------------------------------------------
// NAVEGAÇÃO E HISTÓRICO
// ------------------------------------------------------------
function trocarTela(idTela, salvarHistorico = true) {
  estaLogado = localStorage.getItem('usuarioLogado') !== null;

  if (estaLogado && (idTela === 'tela-login' || idTela === 'tela-cadastro')) {
    return; 
  }

  if (idTela === 'tela-busca') {
    const buscaAtual = salvarHistorico
      ? buscasSalvas[buscasSalvas.length - 1]
      : historico[indiceHistorico];
    mostrarResultadosBusca(buscaAtual ? buscaAtual.termo : '');
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  const gugouHome = document.getElementById('gugou-home');
  const resultados = document.getElementById('resultados-busca');
  const telaHomeReal = document.getElementById('tela-home');

  if (idTela === 'tela-busca') {
    if (telaHomeReal) telaHomeReal.classList.add('active');
    if (gugouHome) gugouHome.style.display = "none";
    if (resultados) resultados.style.display = "block";
    atualizarBarraEndereco('tela-busca');
  } 
  else if (idTela === 'tela-home') {
    if (telaHomeReal) telaHomeReal.classList.add('active');
    if (gugouHome) gugouHome.style.display = "flex";
    if (resultados) resultados.style.display = "none";
    atualizarBarraEndereco('tela-home');
  } 
  else {
    const telaAlvo = document.getElementById(idTela);
    if (telaAlvo) telaAlvo.classList.add('active');
    if (idTela === 'tela-permagram') renderizarPermagram();
    if (idTela === 'tela-loja') renderizarLoja();
    if (idTela === 'tela-superflix') renderizarSuperflix();
    atualizarBarraEndereco(idTela);
  }

  if (salvarHistorico && idTela !== 'tela-login' && idTela !== 'tela-cadastro') {
    if (indiceHistorico < historico.length - 1) {
      historico = historico.slice(0, indiceHistorico + 1);
    }
    const entradaHistorico = { tela: idTela, data: Date.now() };
    if (idTela === 'tela-busca') {
      entradaHistorico.termo = buscasSalvas[buscasSalvas.length - 1].termo;
    }
    historico.push(entradaHistorico);
    indiceHistorico = historico.length - 1;
    salvarNavegacao();
  }
}

function voltarPagina() {
  if (indiceHistorico > 0) {
    indiceHistorico--;
    salvarNavegacao();
    trocarTela(historico[indiceHistorico].tela, false);
  }
}

function avancarPagina() {
  if (indiceHistorico < historico.length - 1) {
    indiceHistorico++;
    salvarNavegacao();
    trocarTela(historico[indiceHistorico].tela, false);
  }
}

function irParaPermagram() { trocarTela('tela-permagram'); }

function irParaSuperflix() { trocarTela('tela-superflix'); }

function alternarMenuSites(evento) {
  evento.stopPropagation();
  const menu = document.getElementById('menu-sites');
  menu.hidden = !menu.hidden;
}

function navegarParaSite(site) {
  document.getElementById('menu-sites').hidden = true;
  if (localStorage.getItem('usuarioLogado') === null) {
    alert('Faça login para navegar entre os sites.');
    return;
  }
  if (site === 'mercadoazul') irParaLoja();
  else if (site === 'gugou') trocarTela('tela-home');
  else if (site === 'permagram') irParaPermagram();
  else if (site === 'superflix') irParaSuperflix();
}

document.addEventListener('click', () => {
  document.getElementById('menu-sites').hidden = true;
});

// ------------------------------------------------------------
// RECARREGAR PÁGINA
// ------------------------------------------------------------
function recarregarPagina() {
  const telaAtiva = document.querySelector('.page.active');
  if (!telaAtiva) return;

  if (telaAtiva.id === 'tela-home') {
    trocarTela('tela-home'); 
    alert("Página do Gugou recarregada.");
  } 
  else if (telaAtiva.id === 'tela-creditos') {
    alert("Página de Créditos recarregada.");
  }
  else if (telaAtiva.id === 'tela-loja') {
    alert("Página do Mercado Azul recarregada.");
  }
}

function atualizarBarraEndereco(idTela) {
  const barra = document.getElementById('address-bar');
  if (!barra) return;
  switch(idTela) {
    case 'tela-login': barra.value = "http://www.gugou.com.br"; break;
    case 'tela-cadastro': barra.value = "http://www.gugou.com.br/cadastro"; break;
    case 'tela-home': barra.value = "http://www.gugou.com.br"; break;
    case 'tela-busca': barra.value = "http://www.gugou.com.br/search"; break;
    case 'tela-creditos': barra.value = "http://www.retrocreditos.com.br"; break;
    case 'tela-loja': barra.value = "http://www.mercadoazul.com.br"; break;
    case 'tela-permagram': barra.value = "http://www.permagram.com.br"; break;
    case 'tela-superflix': barra.value = "http://www.superflix.com.br"; break;
  }
}

function irParaCadastro() { trocarTela('tela-cadastro'); }
function irParaCreditos() { trocarTela('tela-creditos'); }
function voltarLogin() { if (!estaLogado) trocarTela('tela-login'); }
function voltarBusca() { trocarTela('tela-home'); }

function mostrarResultadosBusca(termo) {
  const termoMin = termo.toLowerCase();
  const encontrouYuri = termoMin.includes("yuriceleste") || termoMin.includes("yuri");
  const encontrouDayvson = termoMin.includes("dayvson") || termoMin.includes("devs097518");

  document.getElementById('res-yuri').style.display = encontrouYuri ? "block" : "none";
  document.getElementById('res-dayvson').style.display = encontrouDayvson ? "block" : "none";
  return encontrouYuri || encontrouDayvson;
}

// ------------------------------------------------------------
// E-COMMERCE (MERCADO AZUL)
// ------------------------------------------------------------
function irParaLoja() {
  trocarTela('tela-loja');
  renderizarLoja();
}

function renderizarLoja() {
  const grid = document.getElementById('grid-produtos');
  if (!grid) return;
  
  grid.innerHTML = "";

  const perfil = criarPerfilUsuario();

  const recomendados = CATALOGO.map(produto => {
      let score = 0;
      tokenizar(produto.palavrasChave.join(' ')).forEach(p => {
          const no = perfil.buscar(p);
          if (no) score += no.pesoTotal;
      });
      return { ...produto, score };
  }).sort((a, b) => b.score - a.score);

  recomendados.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'card-produto';
      
      const tagRecomendado = prod.score > 0 
          ? '<div class="badge-recomendacao">⭐ Recomendado</div>' 
          : '';

      div.innerHTML = `
          <h3>${prod.nome}</h3>
          <p class="preco">R$ ${prod.preco.toFixed(2)}</p>
          ${tagRecomendado}
      `;

      const botaoInteresse = document.createElement('button');
      botaoInteresse.className = 'btn-interesse';
      botaoInteresse.type = 'button';
      const interesseRegistrado = produtosSalvos.some(item => item.produtoId === prod.id);
      botaoInteresse.textContent = interesseRegistrado ? 'Interesse registrado' : 'Tenho interesse';
      botaoInteresse.disabled = interesseRegistrado;
      botaoInteresse.addEventListener('click', () => registrarInteresseProduto(prod.id));
      div.appendChild(botaoInteresse);
      grid.appendChild(div);
  });
}

function criarPerfilUsuario() {
  const perfil = new Trie();

  buscasSalvas.forEach(busca => {
    busca.tokens.forEach(token => perfil.inserir(token, 'gugou', 1.2));
  });

  produtosSalvos.forEach(interacao => {
    tokenizar(interacao.palavrasChave.join(' ')).forEach(token => {
      perfil.inserir(token, 'mercadoAzul', 1.0);
    });
  });

  obterInteressesPermagram().forEach(interesse => {
    interesse.tokens.forEach(token => perfil.inserir(token, 'permagram', 1.1));
  });

  obterInteressesSuperflix().forEach(interesse => {
    interesse.tokens.forEach(token => perfil.inserir(token, 'superflix', 1.0));
  });

  return perfil;
}

function registrarInteresseProduto(produtoId) {
  if (produtosSalvos.some(item => item.produtoId === produtoId)) return;

  const produto = CATALOGO.find(item => item.id === produtoId);
  if (!produto) throw new Error(`Produto não encontrado: ${produtoId}`);

  produtosSalvos.push({
    produtoId: produto.id,
    palavrasChave: produto.palavrasChave,
    data: Date.now()
  });
  localStorage.setItem(CHAVES_DADOS.produtos, JSON.stringify(produtosSalvos));
  renderizarLoja();
}

// ------------------------------------------------------------
// BUSCA NO GUGOU
// ------------------------------------------------------------
function fazerBusca() {
  const termo = document.getElementById('search-input').value.trim();
  
  if (termo === "") { alert("Digite algo para pesquisar!"); return; }

  const tokens = tokenizar(termo);
  buscasSalvas.push({
    termo,
    tokens,
    data: Date.now()
  });
  localStorage.setItem(CHAVES_DADOS.buscas, JSON.stringify(buscasSalvas));

  const minhaTrie = criarPerfilUsuario();

  if (mostrarResultadosBusca(termo)) {
    trocarTela('tela-busca'); 
    document.getElementById('search-input').value = "";
    return;
  }

  console.log("=== PERFIL ATUAL NA TRIE ===");
  console.log(minhaTrie.coletarPerfil());
  
  alert(`Pesquisa: "${termo}"\nTokens: ${tokens.join(", ")}\n(Verifique o Console F12 para ver a árvore!)`);
  document.getElementById('search-input').value = "";
}

// ------------------------------------------------------------
// ATALHOS DE TECLADO
// ------------------------------------------------------------
document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowLeft') voltarPagina();
  else if (event.key === 'ArrowRight') avancarPagina();
  else if (event.key === 'Enter') {
    const inputBusca = document.getElementById('search-input');
    if (document.activeElement === inputBusca) fazerBusca();
  }
});

// ------------------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  estaLogado = localStorage.getItem('usuarioLogado') !== null;

  // Garante que os produtos sejam renderizados caso o usuário vá direto para a loja
  renderizarLoja();

  if (estaLogado) {
    const telaSalva = historico[indiceHistorico];
    if (telaSalva) {
      if (telaSalva.tela === 'tela-busca') {
        mostrarResultadosBusca(telaSalva.termo || '');
      }
      trocarTela(telaSalva.tela, false);
    } else {
      trocarTela('tela-home');
    }
  } else {
    trocarTela('tela-login');
  }
});