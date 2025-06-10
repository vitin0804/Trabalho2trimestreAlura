// Configuração das palavras ruins (stop words)
const PALAVRAS_RUINS = new Set([
    "de", "da", "do", "em", "a", "o", "e", "para", "com", "sem", "um", "uma", "os", "as", "no", "na",
    "que", "se", "por", "mais", "menos", "já", "vai", "foi", "são", "ser", "tem", "têm", "como",
    "ou", "até", "não", "sim", "eu", "você", "ele", "ela", "nós", "vocês", "eles", "elas", "me",
    "te", "se", "lhe", "nos", "vos", "lhes", "isso", "isto", "aquilo", "muito", "bem", "só", "ainda",
    "também", "quando", "onde", "porque", "então", "mas", "porém", "contudo", "entretanto", "todavia"
]);

// Elementos do DOM
const botaoMostraPalavras = document.querySelector('#botao-palavrachave');
const entradaTexto = document.querySelector('#entrada-de-texto');
const resultadoPalavraChave = document.querySelector('#resultado-palavrachave');
const keywordsContainer = document.querySelector('#keywords-container');

// Event listeners
botaoMostraPalavras.addEventListener('click', mostraPalavrasChave);
entradaTexto.addEventListener('input', limparResultado);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    criarParticulas();
    adicionarAnimacoesIniciais();
});

function mostraPalavrasChave() {
    const texto = entradaTexto.value.trim();
    
    if (!texto) {
        mostrarErro("Por favor, digite um texto para análise.");
        return;
    }

    // Animação de loading
    iniciarLoading();
    
    // Simular processamento assíncrono
    setTimeout(() => {
        const palavrasChave = processaTexto(texto);
        exibirResultado(palavrasChave);
        finalizarLoading();
    }, 1500);
}

function processaTexto(texto) {
    // Dividir o texto em palavras usando regex para manter apenas letras
    let palavras = texto.split(/\P{L}+/u);
    
    // Converter para minúsculas
    palavras = palavras.map(p => p.toLowerCase());
    
    // Remover palavras ruins e muito curtas
    palavras = tiraPalavrasRuins(palavras);
    
    // Contar frequências
    const frequencias = contaFrequencias(palavras);
    
    // Ordenar por frequência
    let ordenadas = Object.keys(frequencias).sort((p1, p2) => frequencias[p2] - frequencias[p1]);
    
    // Retornar as 10 mais frequentes com suas frequências
    return ordenadas.slice(0, 10).map(palavra => ({
        palavra: palavra,
        frequencia: frequencias[palavra]
    }));
}

function contaFrequencias(palavras) {
    const frequencias = {};
    for (let palavra of palavras) {
        if (!frequencias[palavra]) {
            frequencias[palavra] = 0;
        }
        frequencias[palavra]++;
    }
    return frequencias;
}

function tiraPalavrasRuins(palavras) {
    return palavras.filter(palavra => 
        !PALAVRAS_RUINS.has(palavra) && 
        palavra.length > 2 && 
        /^[a-záàâãéèêíïóôõöúçñ]+$/i.test(palavra)
    );
}

function exibirResultado(palavrasChave) {
    if (palavrasChave.length === 0) {
        mostrarErro("Nenhuma palavra-chave significativa foi encontrada no texto.");
        return;
    }

    // Atualizar texto do resultado
    const totalPalavras = palavrasChave.reduce((sum, item) => sum + item.frequencia, 0);
    resultadoPalavraChave.textContent = `Encontradas ${palavrasChave.length} palavras-chave principais de um total de ${totalPalavras} palavras analisadas.`;
    resultadoPalavraChave.classList.add('has-result');

    // Limpar container de tags
    keywordsContainer.innerHTML = '';

    // Criar tags das palavras-chave com animação
    palavrasChave.forEach((item, index) => {
        setTimeout(() => {
            const tag = document.createElement('div');
            tag.className = 'keyword-tag';
            tag.textContent = `${item.palavra} (${item.frequencia})`;
            tag.style.animationDelay = `${index * 0.1}s`;
            
            // Adicionar evento de hover
            tag.addEventListener('mouseenter', () => {
                tag.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            tag.addEventListener('mouseleave', () => {
                tag.style.transform = 'translateY(0) scale(1)';
            });
            
            keywordsContainer.appendChild(tag);
        }, index * 100);
    });

    // Animação de sucesso
    resultadoPalavraChave.classList.add('pulse');
    setTimeout(() => {
        resultadoPalavraChave.classList.remove('pulse');
    }, 600);
}

function mostrarErro(mensagem) {
    resultadoPalavraChave.textContent = mensagem;
    resultadoPalavraChave.classList.remove('has-result');
    keywordsContainer.innerHTML = '';
    
    // Animação de erro
    resultadoPalavraChave.classList.add('shake');
    setTimeout(() => {
        resultadoPalavraChave.classList.remove('shake');
    }, 500);
}

function limparResultado() {
    if (entradaTexto.value.trim() === '') {
        resultadoPalavraChave.textContent = 'Digite um texto e clique em "Extrair Palavras-chave" para ver o resultado.';
        resultadoPalavraChave.classList.remove('has-result');
        keywordsContainer.innerHTML = '';
    }
}

function iniciarLoading() {
    botaoMostraPalavras.classList.add('loading');
    botaoMostraPalavras.disabled = true;
}

function finalizarLoading() {
    botaoMostraPalavras.classList.remove('loading');
    botaoMostraPalavras.disabled = false;
}

function criarParticulas() {
    const particlesContainer = document.getElementById('particles');
    const numeroParticulas = 50;

    for (let i = 0; i < numeroParticulas; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Posição aleatória
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Delay aleatório para animação
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

function adicionarAnimacoesIniciais() {
    // Animação de entrada para os elementos principais
    const elementos = document.querySelectorAll('.input-section, .result-section');
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            elemento.style.transition = 'all 0.6s ease-out';
            elemento.style.opacity = '1';
            elemento.style.transform = 'translateY(0)';
        }, 200 + (index * 200));
    });
}

// Efeitos de interação adicionais
entradaTexto.addEventListener('focus', () => {
    entradaTexto.parentElement.classList.add('pulse');
    setTimeout(() => {
        entradaTexto.parentElement.classList.remove('pulse');
    }, 600);
});

// Contador de caracteres (funcionalidade extra)
entradaTexto.addEventListener('input', () => {
    const caracteresCount = entradaTexto.value.length;
    const palavrasCount = entradaTexto.value.trim() ? entradaTexto.value.trim().split(/\s+/).length : 0;
    
    // Você pode adicionar um contador visual se desejar
    console.log(`Caracteres: ${caracteresCount}, Palavras: ${palavrasCount}`);
});

// Atalho de teclado para extrair palavras-chave
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        mostraPalavrasChave();
    }
});

// Efeito de parallax suave no scroll (se houver scroll)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle, index) => {
        const speed = (index % 3 + 1) * 0.5;
        particle.style.transform = `translateY(${scrolled * speed}px)`;
    });
});