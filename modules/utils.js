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
 * Exporta funções úteis
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        diasSemana,
        diferencaHoras,
        formatarNumero,
        validarFormatoHorario,
        getNomeMes,
        getDadosAtuais
    };
}