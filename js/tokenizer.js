/**
 * Tokenizador simples para o projeto.
 */

// Palavras que não agregam valor à busca
const STOPWORDS = ["o", "a", "de", "para", "quero", "um", "uma", "com", "em", "do", "da", "no", "na", "e", "é", "eu", "meu", "minha", "os", "as", "que"];

// Dicionário de sinônimos (transforma a palavra na categoria)
const SINONIMOS = {
    "maratona": "corrida",
    "running": "corrida",
    "tenis": "calcado",
    "sapato": "calcado",
    "smartwatch": "relogio",
    "celular": "smartphone"
};

function tokenizar(textoBruto) {
    // 1. Minúsculas e remove pontuação
    let textoLimpo = textoBruto.toLowerCase().replace(/[.,!?;:]/g, "");
    
    // 2. Separa em palavras
    let palavras = textoLimpo.split(/\s+/);
    
    // 3. Remove stopwords e aplica sinônimos
    let tokens = [];
    for (let p of palavras) {
        if (p.length > 2 && !STOPWORDS.includes(p)) {
            // Se tiver sinônimo, usa ele. Senão, usa a palavra original.
            tokens.push(SINONIMOS[p] || p); 
        }
    }
    return tokens;
}
