// ============================================
// ARQUIVO PRINCIPAL - SISTEMA DE CONTROLE DE HORAS
// ============================================

/**
 * Inicializa o sistema quando a página carrega
 */
window.onload = function() {
    preencherSelects();
    
    // Gerar calendário automaticamente após pequeno delay
    setTimeout(() => {
        gerarCalendario();
        // Preencher salário com valor exemplo
        document.getElementById("salario").value = "2500";
    }, 100);
    
    // Configurar event listeners
    configurarEventListeners();
};

/**
 * Configura os event listeners quando o DOM carrega
 */
function configurarEventListeners() {
    // Calcular automaticamente quando horários forem alterados
    document.addEventListener('change', function(e) {
        if (e.target.type === 'time') {
            setTimeout(() => {
                if (document.querySelectorAll('#corpoTabela tr').length > 0) {
                    calcularMes();
                }
            }, 300);
        }
    });
    
    // Calcular automaticamente quando salário for alterado
    document.getElementById('salario')?.addEventListener('input', function() {
        setTimeout(() => {
            if (document.querySelectorAll('#corpoTabela tr').length > 0) {
                calcularMes();
            }
        }, 500);
    });
    
    // Adicionar atalhos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl + G = Gerar Calendário
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            gerarCalendario();
        }
        
        // Ctrl + P = Preencher Horários Padrão
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            preencherHorariosPadrao();
        }
        
        // Ctrl + C = Calcular Mês
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            calcularMes();
        }
        
        // Ctrl + E = Exportar PDF
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportarPDFMenu();
        }
        
        // Ctrl + S = Exportar CSV
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportarParaCSV();
        }
    });
}

// ============================================
// EXPORTAÇÕES PARA USO GLOBAL
// ============================================

// Torna as funções disponíveis globalmente
window.gerarCalendario = gerarCalendario;
window.preencherHorariosPadrao = preencherHorariosPadrao;
window.limparHorarios = limparHorarios;
window.calcularMes = calcularMes;
window.validarHorario = validarHorario;
window.exportarParaCSV = exportarParaCSV;
window.exportarPDFMenu = exportarPDFMenu;
window.imprimirRelatorio = imprimirRelatorio;
window.copiarResumo = copiarResumo;
window.resetarResumo = resetarResumo;