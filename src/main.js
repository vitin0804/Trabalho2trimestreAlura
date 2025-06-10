// Constantes e configurações
const PALAVRAS_RUINS = new Set([
    "de", "da", "do", "em", "a", "o", "e", "para", "com", "sem", "um", "uma", "os", "as", "no", "na",
    "que", "se", "por", "mais", "menos", "já", "vai", "foi", "são", "ser", "tem", "têm", "como",
    "ou", "até", "não", "sim", "eu", "você", "ele", "ela", "nós", "vocês", "eles", "elas", "me",
    "te", "se", "lhe", "nos", "vos", "lhes", "isso", "isto", "aquilo", "muito", "muita", "muitos",
    "muitas", "todo", "toda", "todos", "todas", "outro", "outra", "outros", "outras", "mesmo",
    "mesma", "mesmos", "mesmas", "cada", "qual", "quais", "quando", "onde", "porque", "então",
    "assim", "também", "ainda", "só", "apenas", "bem", "mal", "melhor", "pior", "maior", "menor"
]);

// Elementos DOM
const botaoMostraPalavras = document.querySelector('#botao-palavrachave');
const botaoLimpar = document.querySelector('#botao-limpar');
const botaoCopiar = document.querySelector('#botao-copiar');
const entradaTexto = document.querySelector('#entrada-de-texto');
const resultadoPalavras = document.querySelector('#resultado-palavrachave');
const estatisticas = document.querySelector('#estatisticas');

// Event Listeners
botaoMostraPalavras.addEventListener('click', mostraPalavrasChave);
botaoLimpar.addEventListener('click', limparTexto);
botaoCopiar.addEventListener('click', copiarResultado);

// Adicionar animação de entrada aos elementos
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.input-section, .result-section');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 300);
    });
});

// Função principal para extrair palavras-chave
function mostraPalavrasChave() {
    const texto = entradaTexto.value.trim();
    
    if (!texto) {
        mostrarToast('Por favor, digite um texto primeiro!', 'warning');
        entradaTexto.focus();
        adicionarAnimacaoShake(entradaTexto);
        return;
    }

    // Adicionar animação de loading
    const btnText = botaoMostraPalavras.querySelector('.btn-text');
    const btnIcon = botaoMostraPalavras.querySelector('.btn-icon');
    const originalText = btnText.textContent;
    const originalIcon = btnIcon.textContent;
    
    btnText.innerHTML = 'Processando...';
    btnIcon.innerHTML = '<span class="loading"></span>';
    botaoMostraPalavras.disabled = true;
    botaoMostraPalavras.style.transform = 'scale(0.98)';

    // Simular processamento assíncrono
    setTimeout(() => {
        const palavrasChave = processaTexto(texto);
        const totalPalavras = contarPalavrasTexto(texto);
        
        if (palavrasChave.length > 0) {
            exibirResultados(palavrasChave, totalPalavras, texto);
            mostrarToast('Palavras-chave extraídas com sucesso!', 'success');
        } else {
            resultadoPalavras.innerHTML = `
                <div style="text-align: center; color: var(--text-medium);">
                    <div style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.6;">🤔</div>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-dark);">Nenhuma palavra-chave encontrada</h3>
                    <p style="font-size: 1rem; line-height: 1.6;">Tente um texto mais longo ou com conteúdo mais específico.</p>
                </div>
            `;
            estatisticas.classList.remove('show');
            mostrarToast('Nenhuma palavra-chave encontrada', 'warning');
        }

        // Restaurar botão com animação
        setTimeout(() => {
            btnText.textContent = originalText;
            btnIcon.textContent = originalIcon;
            botaoMostraPalavras.disabled = false;
            botaoMostraPalavras.style.transform = 'scale(1)';
        }, 200);
    }, 1200);
}

// Processar texto e extrair palavras-chave
function processaTexto(texto) {
    let palavras = texto.split(/\P{L}+/u);
    
    palavras = palavras
        .map(p => p.toLowerCase())
        .filter(p => p.length > 0);
    
    palavras = tiraPalavrasRuins(palavras);
    
    const frequencias = contaFrequencias(palavras);
    
    let ordenadas = Object.keys(frequencias)
        .sort((p1, p2) => frequencias[p2] - frequencias[p1]);
    
    return ordenadas.slice(0, 10);
}

// Contar frequências das palavras
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

// Filtrar palavras irrelevantes
function tiraPalavrasRuins(palavras) {
    return palavras.filter(palavra => 
        !PALAVRAS_RUINS.has(palavra) && 
        palavra.length > 2 &&
        !/^\d+$/.test(palavra) // Remove números puros
    );
}

// Contar total de palavras no texto
function contarPalavrasTexto(texto) {
    return texto.split(/\s+/).filter(palavra => palavra.length > 0).length;
}

// Exibir resultados com animação
function exibirResultados(palavrasChave, totalPalavras, textoOriginal) {
    const keywordTags = palavrasChave.map((palavra, index) => {
        const frequencia = contarOcorrencias(textoOriginal, palavra);
        return `
            <span class="keyword-tag" style="animation-delay: ${index * 0.15}s">
                ${palavra} <small>(${frequencia}x)</small>
            </span>
        `;
    }).join('');

    resultadoPalavras.innerHTML = `
        <div class="keywords-list">
            ${keywordTags}
        </div>
    `;

    // Mostrar estatísticas
    const caracteres = textoOriginal.length;
    const frases = textoOriginal.split(/[.!?]+/).filter(f => f.trim().length > 0).length;
    
    estatisticas.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; text-align: center;">
            <div style="padding: 1rem; background: var(--pure-white); border-radius: 12px; box-shadow: var(--shadow-light);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary-blue); margin-bottom: 0.25rem;">${totalPalavras}</div>
                <div style="font-size: 0.875rem; color: var(--text-medium); font-weight: 500;">Total de palavras</div>
            </div>
            <div style="padding: 1rem; background: var(--pure-white); border-radius: 12px; box-shadow: var(--shadow-light);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--light-blue); margin-bottom: 0.25rem;">${caracteres}</div>
                <div style="font-size: 0.875rem; color: var(--text-medium); font-weight: 500;">Caracteres</div>
            </div>
            <div style="padding: 1rem; background: var(--pure-white); border-radius: 12px; box-shadow: var(--shadow-light);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--sky-blue); margin-bottom: 0.25rem;">${frases}</div>
                <div style="font-size: 0.875rem; color: var(--text-medium); font-weight: 500;">Frases</div>
            </div>
            <div style="padding: 1rem; background: var(--pure-white); border-radius: 12px; box-shadow: var(--shadow-light);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--navy-blue); margin-bottom: 0.25rem;">${palavrasChave.length}</div>
                <div style="font-size: 0.875rem; color: var(--text-medium); font-weight: 500;">Palavras-chave</div>
            </div>
        </div>
    `;
    
    estatisticas.classList.add('show');
}

// Contar ocorrências de uma palavra no texto
function contarOcorrencias(texto, palavra) {
    const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
    const matches = texto.match(regex);
    return matches ? matches.length : 0;
}

// Limpar texto
function limparTexto() {
    if (!entradaTexto.value.trim()) {
        mostrarToast('O campo já está vazio!', 'info');
        adicionarAnimacaoShake(entradaTexto);
        return;
    }

    // Animação de limpeza
    entradaTexto.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    entradaTexto.style.transform = 'scale(0.98)';
    entradaTexto.style.opacity = '0.7';
    
    setTimeout(() => {
        entradaTexto.value = '';
        entradaTexto.style.transform = 'scale(1)';
        entradaTexto.style.opacity = '1';
        entradaTexto.focus();
        
        // Limpar resultados com animação
        resultadoPalavras.style.transition = 'all 0.3s ease';
        resultadoPalavras.style.opacity = '0.5';
        
        setTimeout(() => {
            resultadoPalavras.innerHTML = `
                <div style="text-align: center; color: var(--text-medium);">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.6;">📝</div>
                    <p style="font-size: 1.125rem;">Digite um texto acima e clique em "Extrair Palavras-chave" para ver os resultados.</p>
                </div>
            `;
            resultadoPalavras.style.opacity = '1';
            estatisticas.classList.remove('show');
        }, 150);
        
        mostrarToast('Texto limpo com sucesso!', 'success');
    }, 200);
}

// Copiar resultado
function copiarResultado() {
    const keywords = document.querySelectorAll('.keyword-tag');
    
    if (keywords.length === 0) {
        mostrarToast('Nenhum resultado para copiar!', 'warning');
        adicionarAnimacaoShake(botaoCopiar);
        return;
    }

    const texto = Array.from(keywords)
        .map(tag => tag.textContent.trim())
        .join(', ');

    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('Resultado copiado para a área de transferência!', 'success');
        
        // Animação no botão
        botaoCopiar.style.transform = 'scale(0.95)';
        setTimeout(() => {
            botaoCopiar.style.transform = 'scale(1)';
        }, 150);
    }).catch(() => {
        mostrarToast('Erro ao copiar. Tente novamente.', 'error');
    });
}

// Adicionar animação de shake
function adicionarAnimacaoShake(elemento) {
    elemento.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        elemento.style.animation = '';
    }, 500);
}

// Adicionar keyframe de shake ao CSS dinamicamente
const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);

// Sistema de notificações toast
function mostrarToast(mensagem, tipo = 'info') {
    // Remover toast existente
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) {
        toastExistente.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const icones = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.25rem;">${icones[tipo] || icones.info}</span>
            <span>${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(toast);

    // Remover após 4 segundos
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 400);
    }, 4000);
}

// Adicionar efeitos de hover nos botões
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        }
    });
    
    btn.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// Efeito de digitação no placeholder
let placeholderIndex = 0;
const placeholders = [
    "Digite ou cole seu texto aqui para extrair as palavras-chave mais relevantes...",
    "Cole um artigo, notícia ou qualquer texto para análise detalhada...",
    "Experimente com diferentes tipos de texto para melhores resultados...",
    "Textos maiores geram análises mais precisas e completas..."
];

setInterval(() => {
    if (document.activeElement !== entradaTexto && !entradaTexto.value) {
        entradaTexto.placeholder = placeholders[placeholderIndex];
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }
}, 5000);

// Adicionar contador de caracteres em tempo real
entradaTexto.addEventListener('input', function() {
    const caracteres = this.value.length;
    const palavras = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
    
    // Criar ou atualizar contador se não existir
    let contador = document.querySelector('.char-counter');
    if (!contador) {
        contador = document.createElement('div');
        contador.className = 'char-counter';
        this.parentNode.appendChild(contador);
    }
    
    contador.textContent = `${caracteres} caracteres • ${palavras} palavras`;
    
    // Mudar cor baseado no tamanho
    if (caracteres > 1000) {
        contador.style.color = 'var(--sky-blue)';
        contador.style.fontWeight = '600';
    } else if (caracteres > 500) {
        contador.style.color = 'var(--primary-blue)';
        contador.style.fontWeight = '500';
    } else {
        contador.style.color = 'var(--text-light)';
        contador.style.fontWeight = '400';
    }
});

// Adicionar efeito de foco suave
entradaTexto.addEventListener('focus', function() {
    this.parentNode.style.transform = 'scale(1.01)';
});

entradaTexto.addEventListener('blur', function() {
    this.parentNode.style.transform = 'scale(1)';
});