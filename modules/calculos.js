// ============================================
// MÓDULO: CÁLCULOS DE HORAS - VERSÃO CORRIGIDA
// ============================================

/**
 * Calcula horas trabalhadas em um dia
 */
function calcularHorasDia(inputs) {
    let horasTrabalhadas = 0;
    
    if (inputs[0].value && inputs[1].value) {
        horasTrabalhadas += diferencaHoras(inputs[0].value, inputs[1].value);
    }
    
    if (inputs[2].value && inputs[3].value) {
        horasTrabalhadas += diferencaHoras(inputs[2].value, inputs[3].value);
    }
    
    return horasTrabalhadas;
}

/**
 * Calcula todos os valores do mês - VERSÃO CORRIGIDA
 */
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const salarioInput = document.getElementById("salario");
    const salario = salarioInput.value ? parseFloat(salarioInput.value) : 0;

    if (linhas.length === 0) {
        return;
    }

    // Variáveis para totais
    let totalHorasTrabalhadas = 0;
    let totalExtrasDiarias = 0;     // Acima de 8h/dia (vai para banco)
    let totalFaltas = 0;
    
    // Para controle de horas pagas
    let totalHorasParaPagamento = 0; // Horas que serão pagas (até 8h/dia úteis + 100% fins de semana)
    let horasExtrasParaPagamento = 0; // Horas extras acima de 44h/semana e fins de semana
    
    // Controle semanal
    let semanaAtual = 1;
    const semanas = {
        [semanaAtual]: {
            total: 0,
            horasPagas: 0,
            horasExtras: 0
        }
    };

    // Processar cada linha/dia
    linhas.forEach((linha, index) => {
        const inputs = linha.querySelectorAll("input");
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6;
        const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
        
        // Calcular horas trabalhadas no dia
        let horasTrabalhadas = calcularHorasDia(inputs);
        horasTrabalhadas = Math.round(horasTrabalhadas * 100) / 100;
        
        // Atualizar célula
        linha.querySelector(".trab").innerText = horasTrabalhadas.toFixed(2);
        
        // Resetar células
        resetarCelulasCalculo(linha);
        
        // Inicializar nova semana se for domingo
        if (diaSemana === 0 && index > 0) {
            semanaAtual++;
            if (!semanas[semanaAtual]) {
                semanas[semanaAtual] = {
                    total: 0,
                    horasPagas: 0,
                    horasExtras: 0
                };
            }
        }
        
        // Adicionar à semana atual
        if (!semanas[semanaAtual]) {
            semanas[semanaAtual] = {
                total: 0,
                horasPagas: 0,
                horasExtras: 0
            };
        }
        semanas[semanaAtual].total += horasTrabalhadas;
        
        // Processar dias úteis
        if (isDiaUtil) {
            const jornadaDiaria = 8.0;
            
            if (horasTrabalhadas > jornadaDiaria) {
                // Extra diária (banco)
                const extraDiaria = horasTrabalhadas - jornadaDiaria;
                linha.querySelector(".extra-diaria").innerText = extraDiaria.toFixed(2);
                totalExtrasDiarias += extraDiaria;
                
                // Horas para pagamento: até 8h são normais, o resto é extra
                semanas[semanaAtual].horasPagas += jornadaDiaria;
                semanas[semanaAtual].horasExtras += extraDiaria;
                
                destaqueLinha(linha, "warning");
            } else if (horasTrabalhadas > 0) {
                // Horas normais ou faltas
                semanas[semanaAtual].horasPagas += horasTrabalhadas;
                
                if (horasTrabalhadas < jornadaDiaria) {
                    const faltaDia = jornadaDiaria - horasTrabalhadas;
                    linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                    totalFaltas += faltaDia;
                    destaqueLinha(linha, "error");
                }
            }
        } else if (isFimDeSemana && horasTrabalhadas > 0) {
            // FINS DE SEMANA - Todo trabalho é extra paga (100%)
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            semanas[semanaAtual].horasExtras += horasTrabalhadas; // Fim de semana é 100% extra
            destaqueLinha(linha, "success");
        }
        
        // FIM DA SEMANA (sábado) - Verificar extras semanais (acima de 44h)
        if (diaSemana === 6 || index === linhas.length - 1) {
            const jornadaSemanalLegal = 44.0;
            
            if (semanas[semanaAtual].total > jornadaSemanalLegal) {
                // Calcular horas extras da semana
                const extraSemanal = semanas[semanaAtual].total - jornadaSemanalLegal;
                
                // Distribuir entre dias úteis
                const diasUteisDaSemana = encontrarDiasUteisDaSemana(linhas, index);
                
                if (diasUteisDaSemana.length > 0) {
                    const extraPorDia = extraSemanal / diasUteisDaSemana.length;
                    
                    diasUteisDaSemana.forEach(i => {
                        const extraAtual = parseFloat(linhas[i].querySelector(".extra-semanal").innerText) || 0;
                        linhas[i].querySelector(".extra-semanal").innerText = (extraAtual + extraPorDia).toFixed(2);
                        destaqueLinha(linhas[i], "success");
                        
                        // Adicionar às horas extras para pagamento
                        semanas[semanaAtual].horasExtras += extraPorDia;
                        semanas[semanaAtual].horasPagas -= extraPorDia; // Remove das horas normais
                    });
                }
            }
        }
        
        // Acumular totais
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    // Calcular totais para pagamento
    Object.values(semanas).forEach(semana => {
        totalHorasParaPagamento += semana.horasPagas;
        horasExtrasParaPagamento += semana.horasExtras;
    });
    
    // ATUALIZAR RESUMO FINAL
    atualizarResumo(salario, totalHorasTrabalhadas, totalExtrasDiarias, horasExtrasParaPagamento, totalFaltas, totalHorasParaPagamento);
}

/**
 * Atualiza o resumo - VERSÃO SIMPLIFICADA E CORRETA
 */
function atualizarResumo(salario, totalHoras, extrasDiarias, extrasParaPagamento, faltas, horasPagas) {
    // Se não há salário
    if (!salario || salario <= 0) {
        document.getElementById("totalHoras").innerText = totalHoras.toFixed(2) + " h";
        document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2) + " h";
        document.getElementById("totalExtrasSemanais").innerText = extrasParaPagamento.toFixed(2) + " h";
        document.getElementById("totalFaltas").innerText = faltas.toFixed(2) + " h";
        document.getElementById("valorHora").innerText = "R$ 0,00";
        document.getElementById("valorExtras").innerText = "R$ 0,00";
        document.getElementById("valorDescontos").innerText = "R$ 0,00";
        document.getElementById("totalLiquido").innerText = "R$ 0,00";
        mostrarMensagem("⚠️ Informe o salário para ver os valores monetários", "warning");
        return;
    }
    
    // CÁLCULOS SIMPLIFICADOS E CORRETOS:
    const valorHora = salario / 220;
    
    // 1. Horas normais (até 220h no mês)
    const horasNormais = Math.min(horasPagas, 220);
    
    // 2. Horas extras para pagamento (acima de 220h + fins de semana + extras semanais)
    const horasExtrasPagas = Math.max(0, horasPagas - 220) + extrasParaPagamento;
    
    // 3. Valores
    const valorHorasNormais = horasNormais * valorHora;
    const valorExtras = horasExtrasPagas * valorHora * 1.5; // 50% adicional
    const valorDescontos = faltas * valorHora;
    
    // 4. Total líquido
    const totalLiquido = valorHorasNormais + valorExtras - valorDescontos;
    
    // Atualizar interface
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2) + " h";
    document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2) + " h";
    document.getElementById("totalExtrasSemanais").innerText = extrasParaPagamento.toFixed(2) + " h";
    document.getElementById("totalFaltas").innerText = faltas.toFixed(2) + " h";
    document.getElementById("valorHora").innerText = formatarMoeda(valorHora);
    document.getElementById("valorExtras").innerText = formatarMoeda(valorExtras);
    document.getElementById("valorDescontos").innerText = formatarMoeda(valorDescontos);
    document.getElementById("totalLiquido").innerText = formatarMoeda(totalLiquido);
    
    // Feedback
    if (totalHoras < 220) {
        const faltando = 220 - totalHoras;
        mostrarMensagem(`⚠️ Faltam ${faltando.toFixed(2)}h para completar 220h mensais`, "warning");
    }
    
    if (extrasParaPagamento > 0) {
        mostrarMensagem(`💰 ${extrasParaPagamento.toFixed(2)}h extras para pagamento este mês`, "success");
    }
}

/**
 * Resetar células de cálculo
 */
function resetarCelulasCalculo(linha) {
    linha.querySelector(".extra-diaria").innerText = "0.00";
    linha.querySelector(".extra-semanal").innerText = "0.00";
    linha.querySelector(".falta").innerText = "0.00";
}

/**
 * Encontrar dias úteis da semana
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