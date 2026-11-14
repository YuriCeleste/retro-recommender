/**
 * ============================================================
 *  MAIN — Retro Recommender
 * ============================================================
 */

const CHAVES_DADOS = {
  buscas: 'retroRecommender.buscas.v1',
  produtos: 'retroRecommender.produtos.v1',
  navegacao: 'retroRecommender.navegacao.v1',
  buscasLoja: 'retroRecommender.buscasLoja.v1',
};

const CHAVE_CONTAS = 'retroRecommender.contas.v1';
const NOMES_FONTES_PERFIL = {
  gugou: 'Gugou',
  mercadoAzul: 'Mercado Azul',
  permagram: 'Permagram',
  superflix: 'SuperFlix'
};

function salvarContasUsuario(contas) { localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas)); }
function carregarContasUsuario() {
  const dados = localStorage.getItem(CHAVE_CONTAS);
  if (dados !== null) {
    const contas = JSON.parse(dados);
    if (!Array.isArray(contas) || contas.some(conta => !conta || typeof conta.usuario !== 'string' || typeof conta.senha !== 'string')) {
      throw new Error('As contas salvas estão em um formato inválido.');
    }
    return contas;
  }
  const usuarioLegado = localStorage.getItem('contaUsuario');
  const senhaLegada = localStorage.getItem('contaSenha');
  if (usuarioLegado === null || senhaLegada === null) return [];
  const contas = [{ usuario: usuarioLegado, senha: senhaLegada }];
  salvarContasUsuario(contas);
  return contas;
}

let contasUsuario = carregarContasUsuario();

function carregarListaSalva(chave) {
  const dados = localStorage.getItem(chaveDadosUsuario(chave));
  if (dados === null) return [];
  const lista = JSON.parse(dados);
  if (!Array.isArray(lista)) throw new Error(`Os dados salvos em "${chave}" não estão no formato esperado.`);
  return lista;
}

function carregarNavegacaoSalva() {
  const dados = localStorage.getItem(chaveDadosUsuario(CHAVES_DADOS.navegacao));
  if (dados === null) return { historico: [], indice: -1 };
  const navegacao = JSON.parse(dados);
  if (!navegacao || !Array.isArray(navegacao.historico) || !Number.isInteger(navegacao.indice) || navegacao.indice < -1 || navegacao.indice >= navegacao.historico.length || navegacao.historico.some(item => !item || typeof item.tela !== 'string')) {
    throw new Error('O histórico de navegação salvo está em um formato inválido.');
  }
  return navegacao;
}

function salvarNavegacao() {
  localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.navegacao), JSON.stringify({ historico, indice: indiceHistorico }));
}

const TELAS_POR_SITE = {
  gugou: ['tela-home', 'tela-busca'],
  mercadoAzul: ['tela-loja'],
  permagram: ['tela-permagram'],
  superflix: ['tela-superflix']
};
const NOMES_SITES = {
  gugou: 'Gugou',
  mercadoAzul: 'Mercado Azul',
  permagram: 'Permagram',
  superflix: 'SuperFlix'
};

let buscasSalvas = [];
let buscasLojaSalvas = [];
let produtosSalvos = [];
let historico = [];
let indiceHistorico = -1;
let estaLogado = false;

function ativarDadosUsuario(usuario) {
  ativarEscopoDadosUsuario(usuario);
  migrarDadosLegadosUsuario(usuario);
  buscasSalvas = carregarListaSalva(CHAVES_DADOS.buscas);
  produtosSalvos = carregarListaSalva(CHAVES_DADOS.produtos);
  buscasLojaSalvas = carregarListaSalva(CHAVES_DADOS.buscasLoja);
  const navegacaoSalva = carregarNavegacaoSalva();
  historico = navegacaoSalva.historico;
  indiceHistorico = navegacaoSalva.indice;
  ativarEstadoPermagram();
  ativarEstadoSuperflix();
}

function limparDadosUsuario() {
  buscasSalvas = [];
  produtosSalvos = [];
  buscasLojaSalvas = [];
  historico = [];
  indiceHistorico = -1;
  fecharPainelArvore();
  document.getElementById('btn-arvore-perfil').hidden = true;
  desativarEstadoPermagram();
  desativarEstadoSuperflix();
  desativarEscopoDadosUsuario();
}

// LOGIN, CADASTRO E LOGOUT
function fazerLogout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    localStorage.removeItem('usuarioLogado');
    estaLogado = false;
    limparDadosUsuario();
    trocarTela('tela-login');
  }
}

function fazerCadastro() {
  const user = document.getElementById('cad-user').value.trim();
  const pass = document.getElementById('cad-pass').value.trim();
  if (user === "" || pass === "") { alert("Preencha todos os campos!"); return; }
  if (contasUsuario.some(conta => conta.usuario === user)) { alert("Este usuário já existe. Escolha outro nome."); return; }
  contasUsuario.push({ usuario: user, senha: pass });
  salvarContasUsuario(contasUsuario);
  alert("Conta criada! Faça o login.");
  document.getElementById('cad-user').value = "";
  document.getElementById('cad-pass').value = "";
  trocarTela('tela-login');
}

function fazerLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (user === "" || pass === "") { alert("Preencha usuário e senha!"); return; }
  if (contasUsuario.length === 0) { alert("Nenhuma conta encontrada! Crie uma conta primeiro."); return; }
  const conta = contasUsuario.find(item => item.usuario === user && item.senha === pass);
  if (conta) {
    localStorage.setItem('usuarioLogado', user);
    ativarDadosUsuario(user);
    estaLogado = true;
    document.getElementById('btn-arvore-perfil').hidden = false;
    document.getElementById('login-user').value = "";
    document.getElementById('login-pass').value = "";
    trocarTela('tela-home');
    alert("Login realizado com sucesso!");
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// NAVEGAÇÃO E HISTÓRICO
function trocarTela(idTela, salvarHistorico = true) {
  estaLogado = localStorage.getItem('usuarioLogado') !== null;
  if (estaLogado && (idTela === 'tela-login' || idTela === 'tela-cadastro')) return;

  if (idTela === 'tela-busca') {
    const buscaAtual = salvarHistorico ? buscasSalvas[buscasSalvas.length - 1] : historico[indiceHistorico];
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
    if (indiceHistorico < historico.length - 1) historico = historico.slice(0, indiceHistorico + 1);
    const entradaHistorico = { tela: idTela, data: Date.now() };
    if (idTela === 'tela-busca') entradaHistorico.termo = buscasSalvas[buscasSalvas.length - 1].termo;
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
  if (localStorage.getItem('usuarioLogado') === null) { alert('Faça login para navegar entre os sites.'); return; }
  if (site === 'mercadoazul') irParaLoja();
  else if (site === 'gugou') trocarTela('tela-home');
  else if (site === 'permagram') irParaPermagram();
  else if (site === 'superflix') irParaSuperflix();
}

document.addEventListener('click', () => { document.getElementById('menu-sites').hidden = true; });

// RECARREGAR PÁGINA
function recarregarPagina() {
  const telaAtiva = document.querySelector('.page.active');
  if (!telaAtiva) return;
  if (telaAtiva.id === 'tela-home') { trocarTela('tela-home'); alert("Página do Gugou recarregada."); }
  else if (telaAtiva.id === 'tela-creditos') alert("Página de Créditos recarregada.");
  else if (telaAtiva.id === 'tela-loja') alert("Página do Mercado Azul recarregada.");
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

// E-COMMERCE (MERCADO AZUL)
function irParaLoja() { trocarTela('tela-loja'); }

function criarPerfilUsuario() {
  const perfil = new Trie();
  buscasSalvas.forEach(busca => { busca.tokens.forEach(token => perfil.inserir(token, 'gugou', 1.2)); });
  buscasLojaSalvas.forEach(busca => { busca.tokens.forEach(token => perfil.inserir(token, 'mercadoAzul', 1.2)); });
  produtosSalvos.forEach(interacao => { tokenizar(interacao.palavrasChave.join(' ')).forEach(token => { perfil.inserir(token, 'mercadoAzul', 1.0); }); });
  obterInteressesPermagram().forEach(interesse => { interesse.tokens.forEach(token => perfil.inserir(token, 'permagram', 1.1)); });
  obterInteressesSuperflix().forEach(interesse => { interesse.tokens.forEach(token => perfil.inserir(token, 'superflix', 1.0)); });
  return perfil;
}

// BUSCA NO GUGOU
function fazerBusca() {
  const termo = document.getElementById('search-input').value.trim();
  if (termo === "") { alert("Digite algo para pesquisar!"); return; }
  const tokens = tokenizar(termo);
  buscasSalvas.push({ termo, tokens, data: Date.now() });
  localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.buscas), JSON.stringify(buscasSalvas));
  atualizarArvorePerfilSeVisivel();
  if (mostrarResultadosBusca(termo)) {
    trocarTela('tela-busca'); 
    document.getElementById('search-input').value = "";
    return;
  }
  alert(`Pesquisa: "${termo}"\nTokens: ${tokens.join(", ")}`);
  document.getElementById('search-input').value = "";
}

function limparDadosSite(site) {
  if (!Object.prototype.hasOwnProperty.call(TELAS_POR_SITE, site)) {
    throw new Error(`Site inválido para limpeza: ${site}`);
  }
  if (!confirm(`Deseja apagar todos os dados do ${NOMES_SITES[site]}?`)) return;

  const telasRemovidas = new Set(TELAS_POR_SITE[site]);
  const historicoAteIndice = historico.slice(0, indiceHistorico + 1);
  historico = historico.filter(item => !telasRemovidas.has(item.tela));
  indiceHistorico = historicoAteIndice.filter(item => !telasRemovidas.has(item.tela)).length - 1;

  if (site === 'gugou') {
    buscasSalvas = [];
    localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.buscas), JSON.stringify(buscasSalvas));
    document.getElementById('search-input').value = '';
    document.getElementById('res-yuri').style.display = 'none';
    document.getElementById('res-dayvson').style.display = 'none';
  } else if (site === 'mercadoAzul') {
    produtosSalvos = [];
    buscasLojaSalvas = [];
    localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.produtos), JSON.stringify(produtosSalvos));
    localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.buscasLoja), JSON.stringify(buscasLojaSalvas));
    document.getElementById('ml-busca').value = '';
    abaLoja = 'recomendados';
  } else if (site === 'permagram') {
    limparEstadoPermagram();
  } else if (site === 'superflix') {
    limparEstadoSuperflix();
  }

  trocarTela(TELAS_POR_SITE[site][0]);
  atualizarArvorePerfilSeVisivel();
}

// PAINEL DA ÁRVORE (mantido do parceiro)
function alternarPainelArvore() {
  const painel = document.getElementById('painel-arvore-perfil');
  const botao = document.getElementById('btn-arvore-perfil');
  painel.hidden = !painel.hidden;
  botao.setAttribute('aria-expanded', String(!painel.hidden));
  document.getElementById('arvore-backdrop').hidden = painel.hidden;
  if (!painel.hidden) { renderizarArvorePerfil(); document.getElementById('btn-fechar-arvore').focus(); }
}

function fecharPainelArvore() {
  const painel = document.getElementById('painel-arvore-perfil');
  if (!painel) return;
  painel.hidden = true;
  document.getElementById('arvore-backdrop').hidden = true;
  const botao = document.getElementById('btn-arvore-perfil');
  if (botao) { botao.setAttribute('aria-expanded', 'false'); if (!botao.hidden) botao.focus(); }
  document.getElementById('conteudo-arvore-perfil').textContent = '';
}

function atualizarArvorePerfilSeVisivel() {
  const painel = document.getElementById('painel-arvore-perfil');
  if (painel && !painel.hidden) renderizarArvorePerfil();
}

function criarElementoSvg(tag, atributos = {}, texto) {
  const elemento = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(atributos).forEach(([nome, valor]) => elemento.setAttribute(nome, String(valor)));
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function contarFolhasTrie(no, cache) {
  if (cache.has(no)) return cache.get(no);
  let folhas = no.fimPalavra ? 1 : 0;
  Object.keys(no.filhos).forEach(letra => { folhas += contarFolhasTrie(no.filhos[letra], cache); });
  folhas = Math.max(folhas, 1);
  cache.set(no, folhas);
  return folhas;
}

function maiorPesoTrie(no, cache) {
  if (cache.has(no)) return cache.get(no);
  let peso = no.fimPalavra ? no.pesoTotal : 0;
  Object.keys(no.filhos).forEach(letra => { peso = Math.max(peso, maiorPesoTrie(no.filhos[letra], cache)); });
  cache.set(no, peso);
  return peso;
}

function intensidadeDoPeso(peso) { return peso <= 0 ? 0 : Math.min(1, Math.log1p(peso) / Math.log1p(5)); }
function intensidadeTexto(intensidade) { return Math.max(0, (intensidade - 0.65) / 0.35); }
function misturarCores(corBase, corDestaque, intensidade) {
  const rgbBase = corBase.match(/[0-9a-f]{2}/gi).map(valor => parseInt(valor, 16));
  const rgbDestaque = corDestaque.match(/[0-9a-f]{2}/gi).map(valor => parseInt(valor, 16));
  const proporcao = Math.max(0, Math.min(1, intensidade));
  const rgb = rgbBase.map((valor, indice) => Math.round(valor + (rgbDestaque[indice] - valor) * proporcao));
  return `rgb(${rgb.join(', ')})`;
}

function profundidadeMaximaTrie(no, profundidade = 0) {
  let maxima = profundidade;
  Object.keys(no.filhos).forEach(letra => { maxima = Math.max(maxima, profundidadeMaximaTrie(no.filhos[letra], profundidade + 1)); });
  return maxima;
}

function criarLayoutTrie(noRaiz, folhasPorNo, pesosPorNo, layout) {
  const nos = [], arestas = [];
  function visitar(no, caractere, prefixo, profundidade, inicioFolha) {
    const totalFolhas = folhasPorNo.get(no);
    const atual = { tipo: prefixo ? 'caractere' : 'raiz', caractere, prefixo, peso: pesosPorNo.get(no), intensidade: intensidadeDoPeso(pesosPorNo.get(no)), x: layout.margem + (inicioFolha + totalFolhas / 2) * layout.larguraFolha, y: layout.topo + profundidade * layout.distanciaNiveis };
    nos.push(atual);
    let proximaFolha = inicioFolha;
    if (no.fimPalavra) {
      const palavra = { tipo: 'palavra', prefixo, peso: no.pesoTotal, fontes: Object.keys(no.fontes).map(fonte => NOMES_FONTES_PERFIL[fonte] || fonte), intensidade: intensidadeDoPeso(no.pesoTotal), x: layout.margem + (proximaFolha + 0.5) * layout.larguraFolha, y: layout.topo + (profundidade + 1) * layout.distanciaNiveis };
      nos.push(palavra);
      arestas.push({ de: atual, para: palavra, palavra: true });
      proximaFolha++;
    }
    Object.keys(no.filhos).sort().forEach(letra => {
      const filho = no.filhos[letra];
      const noFilho = visitar(filho, letra, prefixo + letra, profundidade + 1, proximaFolha);
      arestas.push({ de: atual, para: noFilho, palavra: false });
      proximaFolha += folhasPorNo.get(filho);
    });
    return atual;
  }
  visitar(noRaiz, '', '', 0, 0);
  return { nos, arestas };
}

function desenharNoTrie(svg, no) {
  const grupo = criarElementoSvg('g', { class: no.tipo === 'palavra' ? 'arvore-svg-palavra' : `arvore-svg-caractere${no.tipo === 'raiz' ? ' arvore-svg-raiz' : ''}`, transform: `translate(${no.x} ${no.y})` });
  if (no.tipo === 'palavra') {
    const nomeCompleto = no.prefixo;
    const nomeVisivel = nomeCompleto.length > 24 ? `${nomeCompleto.slice(0, 21)}...` : nomeCompleto;
    grupo.setAttribute('data-peso', no.peso.toFixed(2));
    grupo.appendChild(criarElementoSvg('title', {}, `${nomeCompleto} · peso ${no.peso.toFixed(2)} · fontes: ${no.fontes.join(', ')}`));
    grupo.appendChild(criarElementoSvg('rect', { x: -96, y: -30, width: 192, height: 60, rx: 13, style: `fill:${misturarCores('#eff8f2', '#15803d', no.intensidade)};stroke:${misturarCores('#9dcdb0', '#14532d', no.intensidade)}` }));
    grupo.appendChild(criarElementoSvg('text', { class: 'arvore-svg-termo', x: 0, y: -5, style: `fill:${misturarCores('#216346', '#ffffff', intensidadeTexto(no.intensidade))}` }, nomeVisivel));
    grupo.appendChild(criarElementoSvg('text', { class: 'arvore-svg-detalhe', x: 0, y: 15 }, `Peso ${no.peso.toFixed(2)} · ${no.fontes.join(' + ')}`));
  } else {
    const raio = no.tipo === 'raiz' ? 26 : 20;
    grupo.appendChild(criarElementoSvg('title', {}, no.tipo === 'raiz' ? `Raiz da Trie · maior peso descendente ${no.peso.toFixed(2)}` : `Prefixo: ${no.prefixo} · maior peso descendente ${no.peso.toFixed(2)}`));
    grupo.setAttribute('data-peso', no.peso.toFixed(2));
    grupo.appendChild(criarElementoSvg('circle', { cx: 0, cy: 0, r: raio, style: `fill:${misturarCores('#ffffff', '#15803d', no.intensidade)};stroke:${misturarCores('#8fa9c5', '#14532d', no.intensidade)}` }));
    grupo.appendChild(criarElementoSvg('text', { x: 0, y: 0, style: `fill:${misturarCores('#285d8c', '#ffffff', intensidadeTexto(no.intensidade))}` }, no.tipo === 'raiz' ? 'raiz' : no.caractere));
  }
  svg.appendChild(grupo);
}

function renderizarArvorePerfil() {
  const conteudo = document.getElementById('conteudo-arvore-perfil');
  conteudo.textContent = '';
  const perfil = criarPerfilUsuario();
  const palavras = perfil.coletarPerfil();
  const fontes = new Set();
  palavras.forEach(item => { item.fontes.split(', ').filter(Boolean).forEach(fonte => fontes.add(fonte)); });
  document.getElementById('arvore-usuario').textContent = localStorage.getItem('usuarioLogado') || 'visitante';
  document.getElementById('arvore-contagem-termos').textContent = palavras.length;
  document.getElementById('arvore-contagem-fontes').textContent = fontes.size;
  if (palavras.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'arvore-perfil-vazia';
    vazio.textContent = 'Ainda não há termos no seu perfil. Faça pesquisas ou interaja com os serviços para formar sua árvore.';
    conteudo.appendChild(vazio);
    return;
  }
  const folhasPorNo = new Map(), pesosPorNo = new Map();
  const totalFolhas = contarFolhasTrie(perfil.raiz, folhasPorNo);
  maiorPesoTrie(perfil.raiz, pesosPorNo);
  const larguraDisponivel = conteudo.clientWidth || window.innerWidth;
  const margem = 70;
  const larguraFolha = Math.max(220, (larguraDisponivel - margem * 2) / totalFolhas);
  const alturaNiveis = profundidadeMaximaTrie(perfil.raiz);
  const layout = { margem, larguraFolha, topo: 64, distanciaNiveis: 80 };
  const largura = Math.max(larguraDisponivel, margem * 2 + totalFolhas * larguraFolha);
  const altura = layout.topo + (alturaNiveis + 1) * layout.distanciaNiveis + 76;
  const arvore = criarLayoutTrie(perfil.raiz, folhasPorNo, pesosPorNo, layout);
  const svg = criarElementoSvg('svg', { class: 'arvore-svg', role: 'img', 'aria-label': `Árvore Trie com ${palavras.length} termos`, width: largura, height: altura, viewBox: `0 0 ${largura} ${altura}` });
  arvore.arestas.forEach(aresta => {
    const inicioY = aresta.de.y + (aresta.de.tipo === 'raiz' ? 26 : 20);
    const fimY = aresta.para.y - (aresta.palavra ? 30 : 20);
    const meioY = (inicioY + fimY) / 2;
    const caminho = `M ${aresta.de.x} ${inicioY} C ${aresta.de.x} ${meioY}, ${aresta.para.x} ${meioY}, ${aresta.para.x} ${fimY}`;
    svg.appendChild(criarElementoSvg('path', { class: `arvore-svg-edge${aresta.palavra ? ' arvore-svg-edge-palavra' : ''}`, style: `stroke:${misturarCores(aresta.palavra ? '#8db9a0' : '#afc1d5', '#15803d', aresta.para.intensidade)}`, d: caminho }));
  });
  arvore.nos.forEach(no => desenharNoTrie(svg, no));
  conteudo.appendChild(svg);
}

// ATALHOS DE TECLADO
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && !document.getElementById('painel-arvore-perfil').hidden) fecharPainelArvore();
  else if (event.key === 'ArrowLeft' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) voltarPagina();
  else if (event.key === 'ArrowRight' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) avancarPagina();
  else if (event.key === 'Enter') {
    const inputBusca = document.getElementById('search-input');
    if (document.activeElement === inputBusca) fazerBusca();
  }
});

// ============================================================
// CONTROLE DE WALLPAPER
// ============================================================
function abrirModalWallpaper() {
  document.getElementById('modal-wallpaper').classList.add('ativo');
}

function fecharModalWallpaper() {
  document.getElementById('modal-wallpaper').classList.remove('ativo');
}

function aplicarWallpaper(nomeArquivo, local) {
  if (local === 'desktop') {
    const desktop = document.querySelector('.desktop');
    desktop.style.backgroundImage = `url('assets/${nomeArquivo}')`;
    localStorage.setItem('wallpaperDesktop', nomeArquivo);
  } else if (local === 'sistema') {
    const browserContent = document.getElementById('browser-content');
    browserContent.style.backgroundImage = `url('assets/${nomeArquivo}')`;
    browserContent.style.backgroundSize = 'cover';
    browserContent.style.backgroundPosition = 'center';
    localStorage.setItem('wallpaperSistema', nomeArquivo);
  }
  fecharModalWallpaper();
}

function carregarWallpaperSalvo() {
  const wallpaperDesktop = localStorage.getItem('wallpaperDesktop');
  if (wallpaperDesktop) {
    document.querySelector('.desktop').style.backgroundImage = `url('assets/${wallpaperDesktop}')`;
  }
  
  const wallpaperSistema = localStorage.getItem('wallpaperSistema');
  if (wallpaperSistema) {
    const browserContent = document.getElementById('browser-content');
    browserContent.style.backgroundImage = `url('assets/${wallpaperSistema}')`;
    browserContent.style.backgroundSize = 'cover';
    browserContent.style.backgroundPosition = 'center';
  }
}

// ============================================================
// TEMA ESCURO
// ============================================================
function alternarTema() {
  const body = document.body;
  const temaAtual = body.getAttribute('data-theme');
  
  if (temaAtual === 'dark') {
    body.removeAttribute('data-theme');
    localStorage.setItem('tema', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('tema', 'dark');
  }
}

function aplicarTemaSalvo() {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
  aplicarTemaSalvo();
  carregarWallpaperSalvo();

  const usuarioLogado = localStorage.getItem('usuarioLogado');
  const contaLogada = contasUsuario.find(conta => conta.usuario === usuarioLogado);
  if (contaLogada) {
    ativarDadosUsuario(usuarioLogado);
    estaLogado = true;
    document.getElementById('btn-arvore-perfil').hidden = false;
    const telaSalva = historico[indiceHistorico];
    if (telaSalva) {
      if (telaSalva.tela === 'tela-busca') mostrarResultadosBusca(telaSalva.termo || '');
      trocarTela(telaSalva.tela, false);
    } else {
      trocarTela('tela-home');
    }
  } else {
    localStorage.removeItem('usuarioLogado');
    trocarTela('tela-login');
  }
});