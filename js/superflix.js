/**
 * ============================================================
 *  SUPERFLIX — streaming simulado
 * ============================================================
 * Depende de: tokenizar() (js/tokenizer.js) e criarEl() (js/permagram.js).
 * Deve ser carregado DEPOIS do permagram.js e ANTES do main.js.
 */

const CHAVE_SUPERFLIX = 'retroRecommender.superflix.v1';

// Filmes fictícios. Ajuste as palavras-chave para casar com o catalogo.js.
// "capa" é o número da classe .capa-N no CSS (background-image).
const FILMES_SUPERFLIX = [
  { id: 'f1', titulo: 'Maratona Final',  genero: 'Esporte',           capa: 1, palavrasChave: ['corrida', 'maratona', 'esporte', 'treino'] },
  { id: 'f2', titulo: 'Noite no Recife', genero: 'Drama',             capa: 2, palavrasChave: ['recife', 'musica', 'frevo', 'viagem'] },
  { id: 'f3', titulo: 'Pixel Heroes',    genero: 'Aventura',          capa: 3, palavrasChave: ['jogos', 'console', 'gamer', 'retro'] },
  { id: 'f4', titulo: 'Lente Dourada',   genero: 'Documentário',      capa: 4, palavrasChave: ['fotografia', 'camera', 'viagem'] },
  { id: 'f5', titulo: 'Batimentos',      genero: 'Suspense',          capa: 5, palavrasChave: ['smartwatch', 'saude', 'tecnologia'] },
  { id: 'f6', titulo: 'Acordes',         genero: 'Musical',           capa: 6, palavrasChave: ['violao', 'musica', 'banda', 'fone'] },
  { id: 'f7', titulo: 'Cheiro de Café',  genero: 'Romance',           capa: 7, palavrasChave: ['cafe', 'cafeteira', 'livro'] },
  { id: 'f8', titulo: 'Código Zero',     genero: 'Ficção científica', capa: 8, palavrasChave: ['tecnologia', 'celular', 'computador'] }
];

// ------------------------------------------------------------
// ESTADO (persistido no localStorage)
// ------------------------------------------------------------
function carregarEstadoSuperflix() {
  const dados = localStorage.getItem(chaveDadosUsuario(CHAVE_SUPERFLIX));
  if (dados === null) return { desejos: [], interesses: [] };

  const estado = JSON.parse(dados);
  if (!estado || !Array.isArray(estado.desejos) || !Array.isArray(estado.interesses)) {
    throw new Error('Os dados salvos do SuperFlix estão em um formato inválido.');
  }
  return estado;
}

let estadoSuperflix = { desejos: [], interesses: [] };

function salvarEstadoSuperflix() {
  localStorage.setItem(chaveDadosUsuario(CHAVE_SUPERFLIX), JSON.stringify(estadoSuperflix));
}

function ativarEstadoSuperflix() {
  estadoSuperflix = carregarEstadoSuperflix();
}

function desativarEstadoSuperflix() {
  estadoSuperflix = { desejos: [], interesses: [] };
}

function limparEstadoSuperflix() {
  estadoSuperflix = { desejos: [], interesses: [] };
  salvarEstadoSuperflix();
}

function estaNaListaDesejos(idFilme) {
  return estadoSuperflix.desejos.some(d => d.id === idFilme);
}

// ------------------------------------------------------------
// INTEGRAÇÃO COM O SISTEMA DE RECOMENDAÇÃO
// ------------------------------------------------------------
// Adicionar à lista registra o interesse (uma vez por filme).
// Os tokens permanecem no perfil mesmo se o filme for removido da lista.
function registrarInteresseSuperflix(filme) {
  if (estadoSuperflix.interesses.some(i => i.id === filme.id)) return;
  const texto = [filme.titulo, filme.genero, ...filme.palavrasChave].join(' ');
  estadoSuperflix.interesses.push({ id: filme.id, tokens: tokenizar(texto), data: Date.now() });
}

function obterInteressesSuperflix() {
  return estadoSuperflix.interesses;
}

// ------------------------------------------------------------
// AÇÕES
// ------------------------------------------------------------
function adicionarAosDesejos(idFilme) {
  const filme = FILMES_SUPERFLIX.find(f => f.id === idFilme);
  if (!filme || estaNaListaDesejos(idFilme)) return;

  estadoSuperflix.desejos.push({ id: idFilme, data: Date.now() });
  registrarInteresseSuperflix(filme);
  salvarEstadoSuperflix();
  renderizarSuperflix();
}

function removerDosDesejos(idFilme) {
  estadoSuperflix.desejos = estadoSuperflix.desejos.filter(d => d.id !== idFilme);
  salvarEstadoSuperflix();
  renderizarSuperflix();
}

// ------------------------------------------------------------
// RENDERIZAÇÃO
// ------------------------------------------------------------
function criarCardFilme(filme) {
  const naLista = estaNaListaDesejos(filme.id);

  const card = criarEl('div', 'sf-card');
  card.appendChild(criarEl('div', 'sf-titulo', filme.titulo));

  const capa = criarEl('div', `sf-capa capa-${filme.capa}`);
  if (naLista) capa.appendChild(criarEl('span', 'sf-badge', '✓ Na lista'));

  const overlay = criarEl('button', 'sf-overlay',
    naLista ? 'Remover da lista de desejos' : 'Adicionar na lista de desejos');
  overlay.type = 'button';
  overlay.addEventListener('click', () =>
    naLista ? removerDosDesejos(filme.id) : adicionarAosDesejos(filme.id));
  capa.appendChild(overlay);

  card.appendChild(capa);
  return card;
}

function renderizarSuperflix() {
  document.getElementById('sf-usuario').textContent =
    localStorage.getItem('usuarioLogado') || 'visitante';

  const grid = document.getElementById('sf-grid');
  grid.innerHTML = '';
  FILMES_SUPERFLIX.forEach(filme => grid.appendChild(criarCardFilme(filme)));

  const desejos = estadoSuperflix.desejos
    .map(d => FILMES_SUPERFLIX.find(f => f.id === d.id))
    .filter(Boolean);

  document.getElementById('sf-titulo-lista').textContent =
    `Minha lista de desejos (${desejos.length})`;

  const lista = document.getElementById('sf-lista');
  lista.innerHTML = '';
  if (desejos.length === 0) {
    lista.appendChild(criarEl('p', 'sf-vazio', 'Passe o mouse sobre uma capa para adicionar um filme.'));
    return;
  }
  desejos.forEach(filme => lista.appendChild(criarCardFilme(filme)));
}