// ============================================
// MÓDULO: INTERFACE E INTERAÇÃO
// ============================================

/**
 * Valida se um horário está correto
 * @param {HTMLInputElement} input - Input de horário
 */
function validarHorario(input) {
    const valor = input.value;
    if (!valor) return;
    
    // Validar formato HH:MM
    if (!validarFormatoHorario(valor)) {
        input.style.borderColor = "#e74c3c";
        input.style.boxShadow = "0 0 0 3px rgba(231, 76, 60, 0.2)";
        return;
    }
    
    // Se a validação passar
    input.style.borderColor = "#27ae60";
    input.style.boxShadow = "0 0 0 3px rgba(39, 174, 96, 0.2)";
    
    // Remover destaque após 1 segundo
    setTimeout(() => {
        input.style.borderColor = "";
        input.style.boxShadow = "";
    }, 1000);
    
    // Calcular automaticamente após mudança
    setTimeout(() => calcularMes(), 300);
}

/**
 * Destaca uma linha da tabela temporariamente
 * @param {HTMLElement} linha - Linha a ser destacada
 * @param {string} cor - Cor de destaque
 */
function destaqueLinha(linha, cor) {
    linha.style.backgroundColor = cor;
    linha.style.transition = "background-color 0.5s";
    
    setTimeout(() => {
        linha.style.backgroundColor = "";
    }, 1000);
}

/**
 * Mostra uma mensagem flutuante na tela
 * @param {string} texto - Texto da mensagem
 * @param {string} tipo - Tipo da mensagem (success, error, warning, info)
 */
function mostrarMensagem(texto, tipo = "info") {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.getElementById("mensagemFlutuante");
    if (mensagemAnterior) {
        document.body.removeChild(mensagemAnterior);
    }
    
    // Cores para cada tipo de mensagem
    const cores = {
        success: "#27ae60",
        error: "#e74c3c",
        warning: "#f39c12",
        info: "#3498db"
    };
    
    // Criar elemento da mensagem
    const mensagemDiv = document.createElement("div");
    mensagemDiv.id = "mensagemFlutuante";
    mensagemDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || "#3498db"};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-size: 0.95em;
        line-height: 1.4;
    `;
    mensagemDiv.innerHTML = texto;
    
    // Adicionar ao corpo
    document.body.appendChild(mensagemDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        mensagemDiv.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (document.body.contains(mensagemDiv)) {
                document.body.removeChild(mensagemDiv);
            }
        }, 300);
    }, 5000);
}

/**
 * Copia o resumo para a área de transferência
 */
function copiarResumo() {
    const resumo = `
RESUMO MENSAL - CONTROLE DE HORAS
===================================
Total Horas Trabalhadas: ${document.getElementById("totalHoras").innerText} h
Extras Diárias (Banco): ${document.getElementById("totalExtrasDiarias").innerText} h
Extras Semanais (Pagas): ${document.getElementById("totalExtrasSemanais").innerText} h
Horas Faltantes: ${document.getElementById("totalFaltas").innerText} h
Valor Hora: R$ ${document.getElementById("valorHora").innerText}
Valor Extras: R$ ${document.getElementById("valorExtras").innerText}
Descontos: R$ ${document.getElementById("valorDescontos").innerText}
Total Líquido: R$ ${document.getElementById("totalLiquido").innerText}
===================================
Gerado em: ${new Date().toLocaleDateString('pt-BR')}
    `;
    
    navigator.clipboard.writeText(resumo)
        .then(() => mostrarMensagem("📋 Resumo copiado para a área de transferência!", "success"))
        .catch(() => mostrarMensagem("❌ Erro ao copiar para área de transferência", "error"));
}

/**
 * Imprime a tabela e o resumo
 */
function imprimirRelatorio() {
    window.print();
}

/**
 * Exporta funções do módulo
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarHorario,
        destaqueLinha,
        mostrarMensagem,
        copiarResumo,
        imprimirRelatorio
    };
}