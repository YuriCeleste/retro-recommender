/**
 * Catálogo de Produtos do E-commerce (Fictício)
 * Cada produto tem palavras-chave que serão cruzadas com o perfil do usuário.
 *
 * Convenções das palavras-chave (passam pelo tokenizar(), então):
 *  - sem acentos e sem hífen, com 3+ letras;
 *  - 2 níveis: tags GENÉRICAS (esporte, tecnologia...) agrupam muitos produtos;
 *    tags ESPECÍFICAS (corrida, trilha, violao...) identificam poucos.
 *    O score de recomendação pondera pela raridade, então as específicas pesam mais;
 *  - a marca (sem acento) também entra como tag.
 * Os ids 1 a 15 foram mantidos para não invalidar interesses já salvos.
 */
const CATALOGO = [
    // --- Produtos originais (ids 1-15) ---
    { id: 1, nome: "Tênis de Corrida Nike", marca: "Nike", preco: 499.90, categoria: "Esporte", palavrasChave: ["tenis", "corrida", "nike", "esporte"] },
    { id: 2, nome: "Smartwatch Esportivo", marca: "Garmin", preco: 899.00, categoria: "Tecnologia", palavrasChave: ["smartwatch", "relogio", "esporte", "tecnologia", "garmin"] },
    { id: 3, nome: "Fone Bluetooth JBL", marca: "JBL", preco: 299.00, categoria: "Áudio", palavrasChave: ["fone", "audio", "musica", "jbl", "tecnologia", "bluetooth"] },
    { id: 4, nome: "Camiseta Dry-Fit", marca: "Adidas", preco: 89.90, categoria: "Vestuário", palavrasChave: ["camiseta", "roupa", "corrida", "esporte", "academia", "adidas"] },
    { id: 5, nome: "Garrafa Térmica", marca: "Stanley", preco: 120.00, categoria: "Acessórios", palavrasChave: ["garrafa", "agua", "academia", "esporte", "stanley"] },
    { id: 6, nome: "Teclado Mecânico Gamer", marca: "Redragon", preco: 350.00, categoria: "Informática", palavrasChave: ["teclado", "mecanico", "gamer", "computador", "tecnologia", "redragon"] },
    { id: 7, nome: "Mouse Sem Fio", marca: "Logitech", preco: 150.00, categoria: "Informática", palavrasChave: ["mouse", "computador", "trabalho", "tecnologia", "logitech"] },
    { id: 8, nome: "Livro: A Arte da Guerra", marca: "Martin Claret", preco: 45.00, categoria: "Livros", palavrasChave: ["livro", "leitura", "estrategia", "claret"] },
    { id: 9, nome: "Cafeteira Expresso", marca: "Oster", preco: 450.00, categoria: "Cozinha", palavrasChave: ["cafe", "cafeteira", "cozinha", "oster"] },
    { id: 10, nome: "Cadeira Gamer Ergonômica", marca: "DT3", preco: 1200.00, categoria: "Móveis", palavrasChave: ["cadeira", "gamer", "escritorio", "tecnologia", "dt3"] },
    { id: 11, nome: "Mochila para Notebook", marca: "Samsonite", preco: 180.00, categoria: "Acessórios", palavrasChave: ["mochila", "notebook", "estudo", "trabalho", "samsonite"] },
    { id: 12, nome: "Whey Protein 900g", marca: "Growth", preco: 160.00, categoria: "Suplementos", palavrasChave: ["whey", "proteina", "academia", "esporte", "growth"] },
    { id: 13, nome: "Tênis Casual", marca: "Vans", preco: 199.90, categoria: "Vestuário", palavrasChave: ["tenis", "casual", "diadia", "roupa", "vans"] },
    { id: 14, nome: "PlayStation 5", marca: "Sony", preco: 4000.00, categoria: "Games", palavrasChave: ["videogame", "console", "jogos", "gamer", "tecnologia", "sony"] },
    { id: 15, nome: "Câmera DSLR", marca: "Canon", preco: 2500.00, categoria: "Fotografia", palavrasChave: ["camera", "fotografia", "filmar", "tecnologia", "canon"] },

    // --- Esporte e bem-estar ---
    { id: 16, nome: "Tênis de Trilha", marca: "Salomon", preco: 749.90, categoria: "Esporte", palavrasChave: ["tenis", "trilha", "caminhada", "outdoor", "esporte", "salomon"] },
    { id: 17, nome: "Bermuda de Corrida", marca: "Puma", preco: 99.90, categoria: "Vestuário", palavrasChave: ["bermuda", "roupa", "corrida", "treino", "esporte", "puma"] },
    { id: 18, nome: "Fone Esportivo à Prova d'Água", marca: "Jabra", preco: 349.00, categoria: "Áudio", palavrasChave: ["fone", "audio", "bluetooth", "corrida", "treino", "esporte", "jabra"] },
    { id: 19, nome: "Tapete de Yoga", marca: "Acte", preco: 89.90, categoria: "Esporte", palavrasChave: ["yoga", "tapete", "alongamento", "treino", "bemestar", "acte"] },
    { id: 20, nome: "Kit Halteres Ajustáveis", marca: "Polimet", preco: 280.00, categoria: "Esporte", palavrasChave: ["halteres", "musculacao", "treino", "academia", "esporte", "polimet"] },
    { id: 21, nome: "Bicicleta Aro 29", marca: "Caloi", preco: 2100.00, categoria: "Esporte", palavrasChave: ["bicicleta", "ciclismo", "outdoor", "esporte", "caloi"] },

    // --- Tecnologia e informática ---
    { id: 22, nome: "Smartphone Galaxy", marca: "Samsung", preco: 1999.00, categoria: "Tecnologia", palavrasChave: ["smartphone", "camera", "tecnologia", "samsung"] },
    { id: 23, nome: "Pulseira Fitness", marca: "Xiaomi", preco: 199.00, categoria: "Tecnologia", palavrasChave: ["pulseira", "relogio", "fitness", "saude", "sono", "batimentos", "tecnologia", "xiaomi"] },
    { id: 24, nome: "Carregador Portátil 20000mAh", marca: "Anker", preco: 160.00, categoria: "Acessórios", palavrasChave: ["carregador", "bateria", "portatil", "viagem", "anker"] },
    { id: 25, nome: "Notebook Ultrafino", marca: "Acer", preco: 3200.00, categoria: "Informática", palavrasChave: ["notebook", "computador", "trabalho", "estudo", "tecnologia", "acer"] },
    { id: 26, nome: "Monitor 27 Polegadas", marca: "Dell", preco: 1100.00, categoria: "Informática", palavrasChave: ["monitor", "computador", "trabalho", "escritorio", "dell"] },
    { id: 27, nome: "Webcam Full HD", marca: "Logitech", preco: 280.00, categoria: "Informática", palavrasChave: ["webcam", "computador", "trabalho", "video", "logitech"] },
    { id: 42, nome: "Leitor de E-books Kindle", marca: "Amazon", preco: 450.00, categoria: "Tecnologia", palavrasChave: ["ebook", "leitura", "livro", "viagem", "tecnologia", "kindle"] },

    // --- Áudio e música ---
    { id: 28, nome: "Caixa de Som Portátil", marca: "JBL", preco: 450.00, categoria: "Áudio", palavrasChave: ["caixa", "som", "audio", "musica", "portatil", "praia", "jbl", "bluetooth"] },
    { id: 29, nome: "Violão Acústico", marca: "Giannini", preco: 650.00, categoria: "Música", palavrasChave: ["violao", "musica", "banda", "instrumento", "giannini"] },
    { id: 30, nome: "Afinador Digital Clip-on", marca: "Korg", preco: 80.00, categoria: "Música", palavrasChave: ["afinador", "violao", "musica", "instrumento", "korg"] },

    // --- Games ---
    { id: 31, nome: "Headphone Gamer 7.1", marca: "HyperX", preco: 520.00, categoria: "Games", palavrasChave: ["headphone", "fone", "audio", "gamer", "jogos", "hyperx"] },
    { id: 32, nome: "Controle Sem Fio para Console", marca: "Sony", preco: 450.00, categoria: "Games", palavrasChave: ["controle", "console", "jogos", "gamer", "sony"] },
    { id: 33, nome: "Console Retrô com 500 Jogos", marca: "Anbernic", preco: 380.00, categoria: "Games", palavrasChave: ["console", "retro", "jogos", "portatil", "anbernic"] },
    { id: 34, nome: "Mousepad Gamer XL", marca: "Redragon", preco: 90.00, categoria: "Games", palavrasChave: ["mousepad", "gamer", "jogos", "computador", "redragon"] },

    // --- Fotografia ---
    { id: 35, nome: "Tripé Leve para Câmera", marca: "Manfrotto", preco: 390.00, categoria: "Fotografia", palavrasChave: ["tripe", "camera", "fotografia", "viagem", "manfrotto"] },
    { id: 36, nome: "Lente 50mm f/1.8", marca: "Canon", preco: 700.00, categoria: "Fotografia", palavrasChave: ["lente", "camera", "fotografia", "canon"] },
    { id: 37, nome: "Bolsa para Câmera", marca: "Lowepro", preco: 320.00, categoria: "Fotografia", palavrasChave: ["bolsa", "camera", "fotografia", "viagem", "lowepro"] },

    // --- Cozinha ---
    { id: 38, nome: "Moedor de Café Manual", marca: "Hario", preco: 180.00, categoria: "Cozinha", palavrasChave: ["cafe", "moedor", "cozinha", "hario"] },
    { id: 39, nome: "Air Fryer 4L", marca: "Mondial", preco: 399.00, categoria: "Cozinha", palavrasChave: ["airfryer", "fritadeira", "cozinha", "mondial"] },

    // --- Livros ---
    { id: 40, nome: "Livro: Algoritmos e Estruturas de Dados", marca: "Editora Retro", preco: 89.90, categoria: "Livros", palavrasChave: ["livro", "leitura", "programacao", "algoritmos", "arvores", "estudo", "computador"] },
    { id: 41, nome: "Guia de Viagem: Recife e Olinda", marca: "Editora Retro", preco: 59.90, categoria: "Livros", palavrasChave: ["livro", "leitura", "guia", "viagem", "recife", "olinda"] },

    // --- Acessórios e vestuário ---
    { id: 43, nome: "Óculos de Sol", marca: "Ray-Ban", preco: 600.00, categoria: "Acessórios", palavrasChave: ["oculos", "sol", "praia", "viagem", "rayban"] },
    { id: 44, nome: "Chinelo Slide", marca: "Havaianas", preco: 59.90, categoria: "Vestuário", palavrasChave: ["chinelo", "praia", "casual", "roupa", "havaianas"] },
    { id: 45, nome: "Relógio Casual Analógico", marca: "Casio", preco: 250.00, categoria: "Acessórios", palavrasChave: ["relogio", "pulso", "casual", "casio"] },

    // --- Beleza, casa e suplementos ---
    { id: 46, nome: "Perfume Angel 50ml", marca: "Mugler", preco: 590.00, categoria: "Beleza", palavrasChave: ["perfume", "fragrancia", "presente", "angel", "mugler"] },
    { id: 47, nome: "Perfume Amadeirado Masculino", marca: "Boticário", preco: 220.00, categoria: "Beleza", palavrasChave: ["perfume", "fragrancia", "amadeirado", "presente", "boticario"] },
    { id: 48, nome: "Luminária de Mesa LED", marca: "Xiaomi", preco: 140.00, categoria: "Móveis", palavrasChave: ["luminaria", "escritorio", "estudo", "trabalho", "xiaomi"] },
    { id: 49, nome: "Creatina 300g", marca: "Growth", preco: 90.00, categoria: "Suplementos", palavrasChave: ["creatina", "musculacao", "treino", "academia", "esporte", "growth"] },
    { id: 50, nome: "Barra de Proteína (caixa com 12)", marca: "Max Titanium", preco: 70.00, categoria: "Suplementos", palavrasChave: ["proteina", "lanche", "academia", "esporte", "maxtitanium"] }
];