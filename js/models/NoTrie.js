/**
 * Classe que representa um Nó da Árvore Trie.
 */
class NoTrie {
    constructor() {
        this.filhos = {};       // Letras que apontam para outros nós
        this.fimPalavra = false;
        this.pesoTotal = 0;     // Soma dos pesos de todas as fontes
        this.fontes = {};       // Ex: { google: 1.2, instagram: 1.0 }
        this.ultimaVez = 0;     // Timestamp da última atualização
    }
}