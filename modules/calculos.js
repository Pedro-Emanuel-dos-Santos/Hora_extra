// ============================================
// MÓDULO: CÁLCULOS DE HORAS
// ============================================

/**
 * Calcula horas trabalhadas em um dia
 * @param {NodeList} inputs - Inputs de horário
 * @returns {number} Total de horas trabalhadas
 */
function calcularHorasDia(inputs) {
    let horasTrabalhadas = 0;
    
    // Calcular horas da manhã (entrada1 → saída1)
    if (inputs[0].value && inputs[1].value) {
        horasTrabalhadas += diferencaHoras(inputs[0].value, inputs[1].value);
    }
    
    // Calcular horas da tarde (entrada2 → saída2)
    if (inputs[2].value && inputs[3].value) {
        horasTrabalhadas += diferencaHoras(inputs[2].value, inputs[3].value);
    }
    
    return horasTrabalhadas;
}

/**
 * Resetar células de cálculo de uma linha
 * @param {HTMLElement} linha - Linha da tabela
 */
function resetarCelulasCalculo(linha) {
    linha.querySelector(".extra-diaria").innerText = "0.00";
    linha.querySelector(".extra-semanal").innerText = "0.00";
    linha.querySelector(".falta").innerText = "0.00";
}

/**
 * Encontrar dias úteis da semana atual
 * @param {NodeList} linhas - Todas as linhas da tabela
 * @param {number} indexFinal - Índice do último dia da semana
 * @returns {number[]} Array com índices dos dias úteis
 */
function encontrarDiasUteisDaSemana(linhas, indexFinal) {
    const diasUteis = [];
    const inicioSemana = Math.max(0, indexFinal - 6);
    
    for (let i = inicioSemana; i <= indexFinal; i++) {
        if (i < linhas.length) {
            const diaSemana = parseInt(linhas[i].querySelector(".dia-semana").getAttribute("data-diasemana"));
            if (diaSemana >= 1 && diaSemana <= 5) {
                diasUteis.push(i);
            }
        }
    }
    
    return diasUteis;
}

/**
 * Calcula todos os valores do mês
 */
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const { salario } = getDadosAtuais();

    // Se não houver linhas, não calcular
    if (linhas.length === 0) {
        return;
    }

    // Variáveis para totais
    let totalHorasTrabalhadas = 0;
    let totalExtrasDiarias = 0;     // Extras acima de 8h/dia (banco de horas)
    let totalExtrasSemanais = 0;    // Extras acima de 44h/semana (pagas)
    let totalFaltas = 0;
    
    // Controle semanal
    let semanaAtual = 1;
    const semanas = {};

    // Processar cada linha/dia
    linhas.forEach((linha, index) => {
        const inputs = linha.querySelectorAll("input");
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6;
        const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
        
        // Calcular horas trabalhadas no dia
        let horasTrabalhadas = calcularHorasDia(inputs);
        
        // Arredondar para 2 casas decimais
        horasTrabalhadas = Math.round(horasTrabalhadas * 100) / 100;
        
        // Atualizar célula de horas trabalhadas
        const celulaTrab = linha.querySelector(".trab");
        celulaTrab.innerText = horasTrabalhadas.toFixed(2);
        
        // Destacar se houver horas trabalhadas
        if (horasTrabalhadas > 0) {
            destaqueLinha(linha, "info");
        }
        
        // Resetar células de cálculo
        resetarCelulasCalculo(linha);
        
        // Inicializar nova semana se for domingo
        if (diaSemana === 0 || index === 0) {
            if (!semanas[semanaAtual]) {
                semanas[semanaAtual] = { total: 0 };
            }
        }
        
        // Processar dias úteis (segunda a sexta)
        if (isDiaUtil) {
            // Adicionar à semana atual
            if (!semanas[semanaAtual]) {
                semanas[semanaAtual] = { total: 0 };
            }
            semanas[semanaAtual].total += horasTrabalhadas;
            
            // CÁLCULO DIÁRIO - Extra acima de 8h/dia (banco de horas)
            const jornadaDiaria = 8.0;
            
            if (horasTrabalhadas > jornadaDiaria) {
                const extraDiaria = horasTrabalhadas - jornadaDiaria;
                linha.querySelector(".extra-diaria").innerText = extraDiaria.toFixed(2);
                totalExtrasDiarias += extraDiaria;
                
                // Destacar extra diária
                destaqueLinha(linha, "warning");
            } else if (horasTrabalhadas < jornadaDiaria && horasTrabalhadas > 0) {
                // Falta no dia
                const faltaDia = jornadaDiaria - horasTrabalhadas;
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                totalFaltas += faltaDia;
                
                // Destacar falta
                destaqueLinha(linha, "error");
            }
        } else if (isFimDeSemana && horasTrabalhadas > 0) {
            // FINS DE SEMANA - Todo trabalho é extra paga
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            totalExtrasSemanais += horasTrabalhadas;
            
            // Destacar extra semanal
            destaqueLinha(linha, "success");
            
            // Adicionar à semana também para controle
            if (semanas[semanaAtual]) {
                semanas[semanaAtual].total += horasTrabalhadas;
            }
        }
        
        // FIM DA SEMANA (sábado) - Calcular extras semanais
        if (diaSemana === 6 || index === linhas.length - 1) {
            const jornadaSemanalLegal = 44.0; // 44 horas semanais permitidas
            
            if (semanas[semanaAtual] && semanas[semanaAtual].total > jornadaSemanalLegal) {
                // Calcular horas extras da semana
                const extraSemanal = semanas[semanaAtual].total - jornadaSemanalLegal;
                
                // Encontrar todos os dias úteis desta semana
                const diasUteisDaSemana = encontrarDiasUteisDaSemana(linhas, index);
                
                // Distribuir a hora extra igualmente pelos dias úteis
                if (diasUteisDaSemana.length > 0) {
                    const extraPorDia = extraSemanal / diasUteisDaSemana.length;
                    
                    diasUteisDaSemana.forEach(i => {
                        const extraAtual = parseFloat(linhas[i].querySelector(".extra-semanal").innerText) || 0;
                        const novaExtra = (extraAtual + extraPorDia).toFixed(2);
                        linhas[i].querySelector(".extra-semanal").innerText = novaExtra;
                        
                        // Destacar dias com extra semanal
                        if (extraPorDia > 0) {
                            destaqueLinha(linhas[i], "success");
                        }
                    });
                    
                    totalExtrasSemanais += extraSemanal;
                }
            }
            
            // Preparar próxima semana
            semanaAtual++;
        }
        
        // Acumular total geral
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    // ATUALIZAR RESUMO FINAL
    atualizarResumo(salario, totalHorasTrabalhadas, totalExtrasDiarias, totalExtrasSemanais, totalFaltas);
}

/**
 * Atualiza o resumo com os resultados finais
 */
function atualizarResumo(salario, totalHoras, extrasDiarias, extrasSemanais, faltas) {
    // Calcular valor da hora
    const valorHora = salario > 0 ? salario / 220 : 0;
    
    // Calcular valores monetários
    const valorTotalExtras = extrasSemanais * valorHora * 1.5; // Extras pagas com 50% adicional
    const valorTotalDescontos = faltas * valorHora;
    const totalLiquido = salario + valorTotalExtras - valorTotalDescontos;
    
    // Atualizar elementos HTML
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2) + " h";
    document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2) + " h";
    document.getElementById("totalExtrasSemanais").innerText = extrasSemanais.toFixed(2) + " h";
    document.getElementById("totalFaltas").innerText = faltas.toFixed(2) + " h";
    document.getElementById("valorHora").innerText = formatarMoeda(valorHora);
    document.getElementById("valorExtras").innerText = formatarMoeda(valorTotalExtras);
    document.getElementById("valorDescontos").innerText = formatarMoeda(valorTotalDescontos);
    document.getElementById("totalLiquido").innerText = formatarMoeda(totalLiquido);
    
    // Destacar o total líquido
    const totalLiquidoElement = document.getElementById("totalLiquido");
    totalLiquidoElement.style.animation = "pulse 0.5s ease";
    setTimeout(() => {
        totalLiquidoElement.style.animation = "";
    }, 500);
    
    // Mostrar mensagem se houver extras ou faltas significativas
    if (extrasSemanais > 10) {
        mostrarMensagem(`⚠️ Atenção: ${extrasSemanais.toFixed(2)} horas extras este mês!`, "warning");
    }
    
    if (faltas > 8) {
        mostrarMensagem(`⚠️ Atenção: ${faltas.toFixed(2)} horas faltantes este mês!`, "error");
    }
}

/**
 * Reseta todos os valores do resumo
 */
function resetarResumo() {
    document.getElementById("totalHoras").innerText = "0 h";
    document.getElementById("totalExtrasDiarias").innerText = "0 h";
    document.getElementById("totalExtrasSemanais").innerText = "0 h";
    document.getElementById("totalFaltas").innerText = "0 h";
    document.getElementById("valorHora").innerText = "R$ 0,00";
    document.getElementById("valorExtras").innerText = "R$ 0,00";
    document.getElementById("valorDescontos").innerText = "R$ 0,00";
    document.getElementById("totalLiquido").innerText = "R$ 0,00";
}