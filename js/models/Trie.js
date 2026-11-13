/**
 * Classe da Árvore Trie com suporte a pesos e múltiplas fontes.
 */
class Trie {
    constructor() {
        this.raiz = new NoTrie();
    }

    /**
     * Insere ou atualiza uma palavra no perfil.
     * @param {string} palavra - O token a ser inserido.
     * @param {string} fonte - De onde veio (ex: 'gugou', 'instagram').
     * @param {number} pesoBase - Peso base da fonte (ex: 1.2).
     */
    inserir(palavra, fonte, pesoBase) {
        let no = this.raiz;
        const token = palavra.toLowerCase();

        for (let letra of token) {
            if (!no.filhos[letra]) {
                no.filhos[letra] = new NoTrie();
            }
            no = no.filhos[letra];
        }

        no.fimPalavra = true;

        // 1. Fator de Reforço Multi-Fonte (1 + 0.3 * (nFontes - 1))
        no.fontes[fonte] = (no.fontes[fonte] || 0) + 1;
        const nFontes = Object.keys(no.fontes).length;
        const fatorReforco = 1 + 0.3 * (nFontes - 1);

        // 2. Atualiza o peso total
        no.pesoTotal += pesoBase * fatorReforco;
        no.ultimaVez = Date.now();
    }

    /**
     * Busca uma palavra exata e retorna o nó (ou null).
     */
    buscar(palavra) {
        let no = this.raiz;
        for (let letra of palavra.toLowerCase()) {
            if (!no.filhos[letra]) return null;
            no = no.filhos[letra];
        }
        return no.fimPalavra ? no : null;
    }

    /**
     * Retorna todas as palavras do perfil (útil para exibir no painel).
     */
    coletarPerfil(no = this.raiz, prefixo = "", out = []) {
        if (no.fimPalavra) {
            out.push({ 
                palavra: prefixo, 
                peso: no.pesoTotal.toFixed(2), 
                fontes: Object.keys(no.fontes).join(", ") 
            });
        }
        for (let letra in no.filhos) {
            this.coletarPerfil(no.filhos[letra], prefixo + letra, out);
        }
        return out;
    }
}