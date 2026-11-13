/**
 * ============================================================
 *  PERMAGRAM — rede social simulada
 * ============================================================
 * Depende de: tokenizar() (js/tokenizer.js)
 * Deve ser carregado ANTES do main.js.
 */

const CHAVE_PERMAGRAM = 'retroRecommender.permagram.v1';
const MAX_POSTAGENS = 5;
const TOTAL_AVATARES = 8;

// Usuários fictícios. Ajuste os textos para casar com as palavras-chave do catalogo.js.
const USUARIOS_PERMAGRAM = [
  { id: 'lia', nick: '@lia_runner', avatar: 3, posts: [
    'Treino de corrida hoje cedo, preparando para a maratona!',
    'Preciso de um tenis novo para corrida de rua.'
  ]},
  { id: 'neo', nick: '@neo_gamer', avatar: 5, posts: [
    'Setup novo: teclado mecanico e headphone para jogar a noite toda.',
    'Alguem tem dica de console para jogos retro?'
  ]},
  { id: 'bia', nick: '@bia_fotografa', avatar: 2, posts: [
    'Passei o dia testando uma camera nova na praia de Olinda.',
    'Vale a pena um tripe leve para viagem?'
  ]},
  { id: 'caio', nick: '@caio_tech', avatar: 7, posts: [
    'Meu smartwatch novo mede o sono e os batimentos.',
    'Trocando de celular, estou em duvida entre dois modelos.'
  ]},
  { id: 'duda', nick: '@duda_musica', avatar: 4, posts: [
    'Ensaio da banda hoje, violao afinado e fone de ouvido na mochila.',
    'Procurando caixa de som portatil para o fim de semana.'
  ]},
  { id: 'rafa', nick: '@rafa_cafe', avatar: 8, posts: [
    'Cafe coado na cafeteira nova, domingo perfeito.',
    'Qual livro voces recomendam para ler na praia?'
  ]}
];

// ------------------------------------------------------------
// ESTADO (persistido no localStorage)
// ------------------------------------------------------------
function carregarEstadoPermagram() {
  const dados = localStorage.getItem(CHAVE_PERMAGRAM);
  if (dados === null) {
    return {
      avatar: 1 + Math.floor(Math.random() * TOTAL_AVATARES),
      postagens: [],   // { id, texto, data }
      seguindo: [],    // { id, desde }
      interesses: []   // { id, tokens, data } -> alimenta a Trie do perfil
    };
  }

  const estado = JSON.parse(dados);
  if (!estado || !Number.isInteger(estado.avatar) ||
      !Array.isArray(estado.postagens) ||
      !Array.isArray(estado.seguindo) ||
      !Array.isArray(estado.interesses)) {
    throw new Error('Os dados salvos do Permagram estão em um formato inválido.');
  }
  return estado;
}

let estadoPermagram = carregarEstadoPermagram();

function salvarEstadoPermagram() {
  localStorage.setItem(CHAVE_PERMAGRAM, JSON.stringify(estadoPermagram));
}

// Garante que o avatar aleatório sorteado na primeira visita fique salvo
salvarEstadoPermagram();

function nickPermagram() {
  return '@' + (localStorage.getItem('usuarioLogado') || 'visitante');
}

// ------------------------------------------------------------
// INTEGRAÇÃO COM O SISTEMA DE RECOMENDAÇÃO
// ------------------------------------------------------------
// Cada postagem vira uma "interação" única (dedupe por id).
// Os tokens permanecem no perfil mesmo após apagar/parar de seguir.
function registrarInteressePermagram(id, texto) {
  if (estadoPermagram.interesses.some(i => i.id === id)) return;
  estadoPermagram.interesses.push({ id, tokens: tokenizar(texto), data: Date.now() });
}

function obterInteressesPermagram() {
  return estadoPermagram.interesses;
}

// ------------------------------------------------------------
// AÇÕES
// ------------------------------------------------------------
function publicarPostagem() {
  const campo = document.getElementById('pg-texto');
  const texto = campo.value.trim();

  if (texto === '') { alert('Escreva algo antes de postar!'); return; }
  if (estadoPermagram.postagens.length >= MAX_POSTAGENS) {
    alert(`Limite de ${MAX_POSTAGENS} postagens atingido. Apague uma para postar de novo.`);
    return;
  }

  const id = 'eu-' + Date.now();
  estadoPermagram.postagens.push({ id, texto, data: Date.now() });
  registrarInteressePermagram(id, texto);
  salvarEstadoPermagram();

  campo.value = '';
  renderizarPermagram();
}

function apagarPostagem(id) {
  estadoPermagram.postagens = estadoPermagram.postagens.filter(p => p.id !== id);
  salvarEstadoPermagram();
  renderizarPermagram();
}

function seguirUsuario(idUsuario) {
  const usuario = USUARIOS_PERMAGRAM.find(u => u.id === idUsuario);
  if (!usuario || estadoPermagram.seguindo.some(s => s.id === idUsuario)) return;

  estadoPermagram.seguindo.push({ id: idUsuario, desde: Date.now() });
  usuario.posts.forEach((texto, i) => registrarInteressePermagram(`${idUsuario}-${i}`, texto));
  salvarEstadoPermagram();
  renderizarPermagram();
}

function pararDeSeguir(idUsuario) {
  estadoPermagram.seguindo = estadoPermagram.seguindo.filter(s => s.id !== idUsuario);
  salvarEstadoPermagram();
  renderizarPermagram();
}

// ------------------------------------------------------------
// RENDERIZAÇÃO (textContent em tudo que o usuário digita)
// ------------------------------------------------------------
function criarEl(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function criarAvatar(numero, mini = false) {
  return criarEl('div', `pg-avatar avatar-${numero}` + (mini ? ' pg-avatar-mini' : ''));
}

function montarFeed() {
  const feed = estadoPermagram.postagens.map(p => ({
    id: p.id, nick: nickPermagram(), avatar: estadoPermagram.avatar,
    texto: p.texto, data: p.data, meu: true
  }));

  estadoPermagram.seguindo.forEach(s => {
    const usuario = USUARIOS_PERMAGRAM.find(u => u.id === s.id);
    if (!usuario) return;
    usuario.posts.forEach((texto, i) => feed.push({
      id: `${usuario.id}-${i}`, nick: usuario.nick, avatar: usuario.avatar,
      texto, data: s.desde - i, meu: false
    }));
  });

  return feed.sort((a, b) => b.data - a.data);
}

function renderizarColunaPerfil() {
  const col = document.getElementById('pg-perfil');
  col.innerHTML = '';

  col.appendChild(criarAvatar(estadoPermagram.avatar));
  col.appendChild(criarEl('h3', 'pg-nick', nickPermagram()));
  col.appendChild(criarEl('h4', 'pg-subtitulo', `Seguindo (${estadoPermagram.seguindo.length})`));

  if (estadoPermagram.seguindo.length === 0) {
    col.appendChild(criarEl('p', 'pg-vazio', 'Você ainda não segue ninguém.'));
    return;
  }

  const lista = criarEl('ul', 'pg-lista');
  estadoPermagram.seguindo.forEach(s => {
    const usuario = USUARIOS_PERMAGRAM.find(u => u.id === s.id);
    if (!usuario) return;
    const li = criarEl('li', 'pg-item');
    li.appendChild(criarAvatar(usuario.avatar, true));
    li.appendChild(criarEl('span', 'pg-item-nome', usuario.nick));
    lista.appendChild(li);
  });
  col.appendChild(lista);
}

function renderizarColunaFeed() {
  const col = document.getElementById('pg-feed');
  const campoAntigo = document.getElementById('pg-texto');
  const rascunho = campoAntigo ? campoAntigo.value : '';
  col.innerHTML = '';

  const limite = estadoPermagram.postagens.length >= MAX_POSTAGENS;

  const composer = criarEl('div', 'pg-composer');
  const campo = document.createElement('textarea');
  campo.id = 'pg-texto';
  campo.maxLength = 200;
  campo.rows = 3;
  campo.placeholder = limite ? 'Limite de postagens atingido.' : 'No que você está pensando?';
  campo.value = rascunho;
  campo.disabled = limite;
  composer.appendChild(campo);

  const rodape = criarEl('div', 'pg-composer-rodape');
  rodape.appendChild(criarEl('span', 'pg-contador',
    `${estadoPermagram.postagens.length}/${MAX_POSTAGENS} postagens`));
  const botao = criarEl('button', 'pg-btn', 'Postar');
  botao.type = 'button';
  botao.disabled = limite;
  botao.addEventListener('click', publicarPostagem);
  rodape.appendChild(botao);
  composer.appendChild(rodape);
  col.appendChild(composer);

  const feed = montarFeed();
  if (feed.length === 0) {
    col.appendChild(criarEl('p', 'pg-vazio', 'Nada por aqui ainda. Poste algo ou siga alguém!'));
    return;
  }

  feed.forEach(item => {
    const post = criarEl('article', 'pg-post');
    post.appendChild(criarAvatar(item.avatar, true));

    const corpo = criarEl('div', 'pg-post-corpo');
    corpo.appendChild(criarEl('strong', 'pg-post-nome', item.nick));
    corpo.appendChild(criarEl('p', 'pg-post-texto', item.texto));
    post.appendChild(corpo);

    if (item.meu) {
      const apagar = criarEl('button', 'pg-apagar', '✕');
      apagar.type = 'button';
      apagar.title = 'Apagar postagem';
      apagar.addEventListener('click', () => apagarPostagem(item.id));
      post.appendChild(apagar);
    }
    col.appendChild(post);
  });
}

function renderizarColunaSugestoes() {
  const col = document.getElementById('pg-sugestoes');
  col.innerHTML = '';
  col.appendChild(criarEl('h4', 'pg-subtitulo', 'Pessoas para seguir'));

  const lista = criarEl('ul', 'pg-lista');
  USUARIOS_PERMAGRAM.forEach(usuario => {
    const seguindo = estadoPermagram.seguindo.some(s => s.id === usuario.id);
    const li = criarEl('li', 'pg-item');
    li.appendChild(criarAvatar(usuario.avatar, true));
    li.appendChild(criarEl('span', 'pg-item-nome', usuario.nick));

    const botao = criarEl('button', 'pg-btn pg-btn-seguir' + (seguindo ? ' seguindo' : ''),
      seguindo ? 'Parar de seguir' : 'Seguir');
    botao.type = 'button';
    botao.addEventListener('click', () =>
      seguindo ? pararDeSeguir(usuario.id) : seguirUsuario(usuario.id));
    li.appendChild(botao);
    lista.appendChild(li);
  });
  col.appendChild(lista);
}

function renderizarPermagram() {
  renderizarColunaPerfil();
  renderizarColunaFeed();
  renderizarColunaSugestoes();
}