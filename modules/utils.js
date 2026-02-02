// ============================================
// MÓDULO: UTILITÁRIOS
// ============================================

// Array com nomes dos dias da semana
const diasSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado"
];

// Array com abreviações dos dias
const diasSemanaAbrev = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

/**
 * Calcula diferença entre dois horários
 * @param {string} inicio - Horário de início (HH:MM)
 * @param {string} fim - Horário de fim (HH:MM)
 * @returns {number} Diferença em horas
 */
function diferencaHoras(inicio, fim) {
    if (!inicio || !fim) return 0;
    
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    
    let minutosTrabalhados = 0;
    
    // Tratar casos em que o horário passa da meia-noite
    if (h2 < h1 || (h2 === h1 && m2 < m1)) {
        minutosTrabalhados = ((h2 + 24) * 60 + m2) - (h1 * 60 + m1);
    } else {
        minutosTrabalhados = (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    
    // Converter minutos para horas (com 2 casas decimais)
    return Math.round((minutosTrabalhados / 60) * 100) / 100;
}

/**
 * Formata número para 2 casas decimais
 * @param {number} num - Número a ser formatado
 * @returns {string} Número formatado
 */
function formatarNumero(num) {
    return typeof num === 'number' ? num.toFixed(2) : '0.00';
}

/**
 * Formata valor monetário
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado em reais
 */
function formatarMoeda(valor) {
    return 'R$ ' + (typeof valor === 'number' ? valor.toFixed(2).replace('.', ',') : '0,00');
}

/**
 * Valida formato HH:MM
 * @param {string} horario - Horário a ser validado
 * @returns {boolean} True se válido
 */
function validarFormatoHorario(horario) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(horario);
}

/**
 * Retorna o nome do mês pelo número (0-11)
 * @param {number} mes - Número do mês (0-11)
 * @returns {string} Nome do mês
 */
function getNomeMes(mes) {
    const data = new Date(2024, mes, 1);
    const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long' });
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
}

/**
 * Retorna a abreviação do dia da semana (0-6)
 * @param {number} dia - Número do dia (0-6)
 * @returns {string} Abreviação do dia
 */
function getDiaAbreviado(dia) {
    return diasSemanaAbrev[dia] || diasSemanaAbrev[0];
}

/**
 * Retorna dados atuais do sistema
 * @returns {Object} Dados atuais
 */
function getDadosAtuais() {
    return {
        mes: Number(document.getElementById("mes").value),
        ano: Number(document.getElementById("ano").value),
        salario: Number(document.getElementById("salario").value) || 0,
        nomeMes: getNomeMes(Number(document.getElementById("mes").value))
    };
}

/**
 * Destacar uma linha da tabela temporariamente
 * @param {HTMLElement} linha - Linha a ser destacada
 * @param {string} cor - Cor de destaque (nome da classe)
 */
function destaqueLinha(linha, tipo = 'info') {
    const classes = {
        success: 'destaque-success',
        error: 'destaque-error',
        warning: 'destaque-warning',
        info: 'destaque-info'
    };
    
    linha.classList.add(classes[tipo] || 'destaque-info');
    
    setTimeout(() => {
        linha.classList.remove(classes[tipo] || 'destaque-info');
    }, 1500);
}

/**
 * Adicionar estilos CSS para destaques dinâmicos
 */
function adicionarEstilosDestaque() {
    if (!document.getElementById('estilos-destaque')) {
        const style = document.createElement('style');
        style.id = 'estilos-destaque';
        style.textContent = `
            .destaque-success { background-color: rgba(16, 185, 129, 0.1) !important; }
            .destaque-error { background-color: rgba(239, 68, 68, 0.1) !important; }
            .destaque-warning { background-color: rgba(245, 158, 11, 0.1) !important; }
            .destaque-info { background-color: rgba(59, 130, 246, 0.1) !important; }
            .destaque-success td { background-color: rgba(16, 185, 129, 0.1) !important; }
            .destaque-error td { background-color: rgba(239, 68, 68, 0.1) !important; }
            .destaque-warning td { background-color: rgba(245, 158, 11, 0.1) !important; }
            .destaque-info td { background-color: rgba(59, 130, 246, 0.1) !important; }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar estilos de destaque
adicionarEstilosDestaque();