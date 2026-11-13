/**
 * ============================================================
 *  MAIN — Retro Recommender
 * ============================================================
 */

let historico = [];
let indiceHistorico = -1;
let estaLogado = false;

// ------------------------------------------------------------
// LOGIN, CADASTRO E LOGOUT
// ------------------------------------------------------------
function fazerLogout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    localStorage.removeItem('usuarioLogado');
    estaLogado = false;
    historico = [];
    indiceHistorico = -1;
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
    
    historico = [];
    indiceHistorico = -1;
    
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
    atualizarBarraEndereco(idTela);
  }

  if (salvarHistorico && idTela !== 'tela-login' && idTela !== 'tela-cadastro') {
    if (indiceHistorico < historico.length - 1) {
      historico = historico.slice(0, indiceHistorico + 1);
    }
    historico.push({ tela: idTela });
    indiceHistorico = historico.length - 1;
  }
}

function voltarPagina() {
  if (indiceHistorico > 0) {
    indiceHistorico--;
    trocarTela(historico[indiceHistorico].tela, false);
  }
}

function avancarPagina() {
  if (indiceHistorico < historico.length - 1) {
    indiceHistorico++;
    trocarTela(historico[indiceHistorico].tela, false);
  }
}

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
  }
}

function irParaCadastro() { trocarTela('tela-cadastro'); }
function irParaCreditos() { trocarTela('tela-creditos'); }
function voltarLogin() { if (!estaLogado) trocarTela('tela-login'); }
function voltarBusca() { trocarTela('tela-home'); }

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

  const perfil = new Trie();
  perfil.inserir("corrida", "gugou", 1.2);
  perfil.inserir("tenis", "instagram", 1.0);

  const recomendados = CATALOGO.map(produto => {
      let score = 0;
      produto.palavrasChave.forEach(p => {
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
      grid.appendChild(div);
  });
}

// ------------------------------------------------------------
// BUSCA NO GUGOU
// ------------------------------------------------------------
function fazerBusca() {
  const termo = document.getElementById('search-input').value;
  
  if (termo.trim() === "") { alert("Digite algo para pesquisar!"); return; }

  const tokens = tokenizar(termo);
  
  const minhaTrie = new Trie();
  tokens.forEach(t => {
    minhaTrie.inserir(t, 'gugou', 1.2);
    console.log(`[TRIE] Inserido: ${t}`);
  });

  const termoMin = termo.toLowerCase();
  let achou = false;

  document.getElementById('res-yuri').style.display = "none";
  document.getElementById('res-dayvson').style.display = "none";

  if (termoMin.includes("yuriceleste") || termoMin.includes("yuri")) {
    document.getElementById('res-yuri').style.display = "block";
    achou = true;
  }

  if (termoMin.includes("dayvson") || termoMin.includes("devs097518")) {
    document.getElementById('res-dayvson').style.display = "block";
    achou = true;
  }

  if (achou) {
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
  historico = [];
  indiceHistorico = -1;

  // Garante que os produtos sejam renderizados caso o usuário vá direto para a loja
  renderizarLoja();

  if (estaLogado) {
    trocarTela('tela-home');
  } else {
    trocarTela('tela-login');
  }
});