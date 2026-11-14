/**
 * ============================================================
 *  MERCADO AZUL — e-commerce simulado
 * ============================================================
 * Depende de: Trie, tokenizar(), CATALOGO, criarEl() (js/permagram.js)
 * e de globais do main.js (produtosSalvos, buscasLojaSalvas, CHAVES_DADOS,
 * chaveDadosUsuario, criarPerfilUsuario, atualizarArvorePerfilSeVisivel).
 * Deve ser carregado DEPOIS do permagram.js e ANTES do main.js.
 */

const EMOJIS_CATEGORIA = {
  'Esporte': '🏃', 'Tecnologia': '⌚', 'Áudio': '🎧', 'Vestuário': '👕',
  'Acessórios': '🎒', 'Informática': '🖱️', 'Livros': '📚', 'Cozinha': '☕',
  'Móveis': '🪑', 'Games': '🎮', 'Fotografia': '📷', 'Suplementos': '💪'
};

let abaLoja = 'recomendados'; // 'recomendados' | 'todos'

// ------------------------------------------------------------
// UTILITÁRIOS
// ------------------------------------------------------------
function normalizarTexto(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugCategoria(categoria) {
  return normalizarTexto(categoria).replace(/[^a-z0-9]/g, '');
}

function produtoCombinaComBusca(produto, termo) {
  const termos = normalizarTexto(termo).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return true;
  const alvo = normalizarTexto([produto.nome, produto.categoria, ...produto.palavrasChave].join(' '));
  return termos.every(t => alvo.includes(t));
}

// Raridade de cada token no catálogo (IDF): tokens presentes em muitos produtos
// ("tecnologia", "esporte") valem pouco; tokens específicos ("nike") valem mais.
function calcularIdfCatalogo() {
  const frequencia = new Map();
  CATALOGO.forEach(produto => {
    new Set(tokenizar(produto.palavrasChave.join(' '))).forEach(token => {
      frequencia.set(token, (frequencia.get(token) || 0) + 1);
    });
  });
  const idf = new Map();
  frequencia.forEach((qtd, token) => idf.set(token, Math.log(CATALOGO.length / qtd)));
  return idf;
}

const IDF_CATALOGO = calcularIdfCatalogo();

// Afinidade mínima para entrar em "recomendados". Sozinho, um token só passa
// se aparecer em até ~√N produtos; tokens genéricos só passam se o interesse
// for reforçado (várias fontes ou repetição, que aumentam o peso na Trie).
const LIMIAR_RECOMENDACAO = 0.5 * Math.log(CATALOGO.length);

// Soma, para cada token único do produto, peso na Trie × raridade no catálogo.
function calcularAfinidade(produto, perfil) {
  const vistos = new Set();
  const correspondencias = [];
  let score = 0;

  tokenizar(produto.palavrasChave.join(' ')).forEach(token => {
    if (vistos.has(token)) return;
    vistos.add(token);
    const no = perfil.buscar(token);
    if (!no) return;
    const contribuicao = no.pesoTotal * (IDF_CATALOGO.get(token) || 0);
    score += contribuicao;
    correspondencias.push({ token, peso: no.pesoTotal, contribuicao });
  });

  correspondencias.sort((a, b) => b.contribuicao - a.contribuicao);
  return { score, correspondencias };
}

// ------------------------------------------------------------
// AÇÕES
// ------------------------------------------------------------
function mudarAbaLoja(aba) {
  abaLoja = aba;
  renderizarLoja();
}

// Chamada com Enter ou clique em "pesquisar": registra o termo no perfil.
// (A filtragem ao digitar é feita por renderizarLoja, sem registrar nada.)
function pesquisarNaLoja() {
  const termo = document.getElementById('ml-busca').value.trim();
  if (termo === '') return;

  const tokens = tokenizar(termo);
  if (tokens.length === 0) return;

  buscasLojaSalvas.push({ termo, tokens, data: Date.now() });
  localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.buscasLoja), JSON.stringify(buscasLojaSalvas));
  atualizarArvorePerfilSeVisivel();
  renderizarLoja();
}

function registrarInteresseProduto(produtoId) {
  if (produtosSalvos.some(item => item.produtoId === produtoId)) return;

  const produto = CATALOGO.find(item => item.id === produtoId);
  if (!produto) throw new Error(`Produto não encontrado: ${produtoId}`);

  produtosSalvos.push({ produtoId: produto.id, palavrasChave: produto.palavrasChave, data: Date.now() });
  localStorage.setItem(chaveDadosUsuario(CHAVES_DADOS.produtos), JSON.stringify(produtosSalvos));
  atualizarArvorePerfilSeVisivel();
  renderizarLoja();
}

// ------------------------------------------------------------
// RENDERIZAÇÃO
// ------------------------------------------------------------
function criarCardProduto({ produto, score, correspondencias }) {
  const card = criarEl('div', 'ml-card');
  card.appendChild(criarEl('div', 'ml-nome', produto.nome));

  const imagem = criarEl('div',
    `ml-imagem ml-cat-${slugCategoria(produto.categoria)}`,
    EMOJIS_CATEGORIA[produto.categoria] || '🛍️');
  card.appendChild(imagem);

  if (score >= LIMIAR_RECOMENDACAO) {
    card.appendChild(criarEl('div', 'ml-badge', '⭐ Recomendado'));
    const combina = correspondencias.filter(c => c.contribuicao > 0).slice(0, 3).map(c => c.token).join(', ');
    const detalhe = criarEl('div', 'ml-combina', `Combina com: ${combina}`);
    detalhe.title = correspondencias.map(c => `${c.token}: ${c.contribuicao.toFixed(2)}`).join('\n')
      + `\nAfinidade total: ${score.toFixed(2)}`;
    card.appendChild(detalhe);
  }

  const rodape = criarEl('div', 'ml-rodape');
  rodape.appendChild(criarEl('span', 'ml-preco',
    'R$ ' + produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })));

  const registrado = produtosSalvos.some(item => item.produtoId === produto.id);
  const botao = criarEl('button', 'ml-btn-carrinho', registrado ? '✓' : '🛒');
  botao.type = 'button';
  botao.disabled = registrado;
  botao.title = registrado ? 'Interesse já registrado' : 'Tenho interesse';
  botao.addEventListener('click', () => registrarInteresseProduto(produto.id));
  rodape.appendChild(botao);

  card.appendChild(rodape);
  return card;
}

function mensagemListaVazia(termo) {
  if (abaLoja === 'recomendados') {
    return termo.trim() === ''
      ? 'Ainda não há recomendações. Navegue pelo Gugou, Permagram e SuperFlix para formar o seu perfil.'
      : 'Nenhum produto recomendado corresponde à busca. Veja a aba "todos".';
  }
  return 'Nenhum produto encontrado.';
}

function renderizarLoja() {
  const grid = document.getElementById('ml-grid');
  if (!grid) return;

  const termo = document.getElementById('ml-busca').value;
  const perfil = criarPerfilUsuario();

  document.getElementById('ml-carrinho-qtd').textContent = produtosSalvos.length;
  document.querySelectorAll('.ml-aba').forEach(aba =>
    aba.classList.toggle('ativa', aba.dataset.aba === abaLoja));

  let itens = CATALOGO
    .filter(produto => produtoCombinaComBusca(produto, termo))
    .map(produto => ({ produto, ...calcularAfinidade(produto, perfil) }));

  if (abaLoja === 'recomendados') itens = itens.filter(item => item.score >= LIMIAR_RECOMENDACAO);
  itens.sort((a, b) => b.score - a.score);

  grid.innerHTML = '';
  if (itens.length === 0) {
    grid.appendChild(criarEl('p', 'ml-vazio', mensagemListaVazia(termo)));
    return;
  }
  itens.forEach(item => grid.appendChild(criarCardProduto(item)));
}

document.getElementById('ml-busca').addEventListener('keydown', evento => {
  if (evento.key === 'Enter') pesquisarNaLoja();
});