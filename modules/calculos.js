// ============================================
// MÓDULO: CÁLCULOS DE HORAS - VERSÃO DEFINITIVA
// ============================================

// JORNADA PADRÃO
const HORARIO_INICIO_MANHA = "08:00";
const HORARIO_FIM_MANHA = "12:00";
const HORARIO_INICIO_TARDE = "13:30";
const HORARIO_FIM_TARDE = "18:00";
const HORAS_POR_DIA_UTIL = 8.5; // 4h manhã + 4.5h tarde = 8.5h
const DIAS_TRABALHO_POR_MES = 22; // Média de dias úteis por mês
const HORAS_POR_MES = 220; // 22 dias × 8.5h = 187h, mas usamos 220h padrão para cálculo

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
    
    // Arredondar para 2 casas decimais
    return Math.round(horasTrabalhadas * 100) / 100;
}

/**
 * Calcula valor da hora CORRETAMENTE
 * @param {number} salario - Salário base
 * @returns {number} Valor da hora
 */
function calcularValorHora(salario) {
    // Cálculo CORRETO: salário ÷ 220 horas mensais
    return salario > 0 ? Math.round((salario / 220) * 100) / 100 : 0;
}

/**
 * Calcula todos os valores do mês - LÓGICA CORRIGIDA
 */
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const { salario, mes, ano } = getDadosAtuais();

    // Se não houver linhas, não calcular
    if (linhas.length === 0) {
        mostrarMensagem("❌ Primeiro gere o calendário do mês!", "error");
        return;
    }

    // VARIÁVEIS PARA TOTAIS
    let totalHorasTrabalhadas = 0;
    let totalHorasExtras = 0;        // Todas as horas extras
    let totalHorasFaltantes = 0;     // Horas que deveriam trabalhar mas não trabalhou
    let totalDescontos = 0;          // Valor em R$ a descontar
    let totalValorExtras = 0;        // Valor em R$ das extras
    
    // CALCULAR VALOR DA HORA CORRETAMENTE
    const valorHora = calcularValorHora(salario);
    
    // Calcular dias úteis no mês
    const diasUteisMes = calcularDiasUteisNoMes(mes, ano);
    
    // Horas esperadas no mês (dias úteis × 8.5h)
    const horasEsperadasMes = Math.round(diasUteisMes * HORAS_POR_DIA_UTIL * 100) / 100;

    console.log("=== INÍCIO DO CÁLCULO ===");
    console.log("Salário:", salario);
    console.log("Valor hora:", valorHora);
    console.log("Dias úteis:", diasUteisMes);
    console.log("Horas esperadas:", horasEsperadasMes);

    // Processar cada linha/dia
    linhas.forEach((linha, index) => {
        const inputs = linha.querySelectorAll("input");
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6;
        const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
        
        // Resetar células de cálculo
        linha.querySelector(".extra-diaria").innerText = "0.00";
        linha.querySelector(".extra-semanal").innerText = "0.00";
        linha.querySelector(".falta").innerText = "0.00";
        linha.querySelector(".desconto-dia").innerText = "R$ 0,00";
        
        // Calcular horas trabalhadas no dia
        let horasTrabalhadas = calcularHorasDia(inputs);
        
        // Atualizar célula de horas trabalhadas
        const celulaTrab = linha.querySelector(".trab");
        celulaTrab.innerText = horasTrabalhadas.toFixed(2);
        
        // SE FOR DIA ÚTIL (segunda a sexta)
        if (isDiaUtil) {
            // Verificar se bateu ponto completo
            const bateuPontoCompleto = 
                inputs[0].value && inputs[1].value && 
                inputs[2].value && inputs[3].value;
            
            if (!bateuPontoCompleto) {
                // SE NÃO BATEU PONTO COMPLETO
                if (horasTrabalhadas === 0) {
                    // FALTOU O DIA INTEIRO
                    const faltaDia = HORAS_POR_DIA_UTIL;
                    const descontoDia = Math.round(faltaDia * valorHora * 100) / 100;
                    
                    linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                    linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                    
                    totalHorasFaltantes += faltaDia;
                    totalDescontos += descontoDia;
                    
                    console.log(`Dia ${index + 1}: Faltou dia inteiro - ${faltaDia}h = ${formatarMoeda(descontoDia)}`);
                    
                    // Destacar falta
                    destaqueLinha(linha, "error");
                } 
                else {
                    // BATEU PONTO PARCIAL - calcular horas faltantes
                    const horasEsperadasDia = HORAS_POR_DIA_UTIL;
                    const horasFaltantesDia = Math.max(0, horasEsperadasDia - horasTrabalhadas);
                    
                    if (horasFaltantesDia > 0) {
                        const descontoDia = Math.round(horasFaltantesDia * valorHora * 100) / 100;
                        
                        linha.querySelector(".falta").innerText = horasFaltantesDia.toFixed(2);
                        linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                        
                        totalHorasFaltantes += horasFaltantesDia;
                        totalDescontos += descontoDia;
                        
                        console.log(`Dia ${index + 1}: Faltou parcialmente - ${horasFaltantesDia}h = ${formatarMoeda(descontoDia)}`);
                        
                        // Destacar falta
                        destaqueLinha(linha, "error");
                    }
                    
                    // Verificar se tem horas extras (trabalhou mais que 8.5h)
                    if (horasTrabalhadas > HORAS_POR_DIA_UTIL) {
                        const extraDia = Math.round((horasTrabalhadas - HORAS_POR_DIA_UTIL) * 100) / 100;
                        linha.querySelector(".extra-diaria").innerText = extraDia.toFixed(2);
                        totalHorasExtras += extraDia;
                        
                        console.log(`Dia ${index + 1}: Extra - ${extraDia}h`);
                        
                        // Destacar extra
                        destaqueLinha(linha, "success");
                    }
                }
            } 
            else {
                // BATEU PONTO COMPLETO - verificar extras ou faltas
                if (horasTrabalhadas > HORAS_POR_DIA_UTIL) {
                    // HORA EXTRA
                    const extraDia = Math.round((horasTrabalhadas - HORAS_POR_DIA_UTIL) * 100) / 100;
                    linha.querySelector(".extra-diaria").innerText = extraDia.toFixed(2);
                    totalHorasExtras += extraDia;
                    
                    console.log(`Dia ${index + 1}: Extra - ${extraDia}h`);
                    
                    // Destacar extra
                    destaqueLinha(linha, "success");
                } 
                else if (horasTrabalhadas < HORAS_POR_DIA_UTIL) {
                    // FALTA PARCIAL (trabalhou menos que 8.5h)
                    const faltaDia = Math.round((HORAS_POR_DIA_UTIL - horasTrabalhadas) * 100) / 100;
                    const descontoDia = Math.round(faltaDia * valorHora * 100) / 100;
                    
                    linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                    linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                    
                    totalHorasFaltantes += faltaDia;
                    totalDescontos += descontoDia;
                    
                    console.log(`Dia ${index + 1}: Faltou parcialmente - ${faltaDia}h = ${formatarMoeda(descontoDia)}`);
                    
                    // Destacar falta
                    destaqueLinha(linha, "error");
                }
                // Se trabalhou exatamente 8.5h, não faz nada
            }
        } 
        // FIM DE SEMANA TRABALHADO
        else if (isFimDeSemana && horasTrabalhadas > 0) {
            // TUDO É EXTRA (paga com 100% adicional, ou seja, 200% do valor normal)
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            totalHorasExtras += horasTrabalhadas;
            
            console.log(`Dia ${index + 1}: Fim de semana - ${horasTrabalhadas}h extra`);
            
            // Destacar extra
            destaqueLinha(linha, "warning");
        }
        
        // Acumular total geral
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    // CALCULAR VALOR DAS HORAS EXTRAS
    // Dias úteis: 50% adicional (valor × 1.5)
    // Fins de semana: 100% adicional (valor × 2.0)
    // Para simplificar, vamos usar 50% para tudo
    totalValorExtras = Math.round(totalHorasExtras * valorHora * 1.5 * 100) / 100;
    
    // CALCULAR SALÁRIO LÍQUIDO FINAL
    // Salário Líquido = Salário Base - Descontos + Valor Extras
    const salarioLiquido = Math.max(0, Math.round((salario - totalDescontos + totalValorExtras) * 100) / 100);
    
    console.log("=== RESULTADO FINAL ===");
    console.log("Total horas trabalhadas:", totalHorasTrabalhadas.toFixed(2));
    console.log("Total horas extras:", totalHorasExtras.toFixed(2));
    console.log("Total horas faltantes:", totalHorasFaltantes.toFixed(2));
    console.log("Total descontos (R$):", formatarMoeda(totalDescontos));
    console.log("Total extras (R$):", formatarMoeda(totalValorExtras));
    console.log("Salário líquido:", formatarMoeda(salarioLiquido));
    console.log("Fórmula:", formatarMoeda(salario), "-", formatarMoeda(totalDescontos), "+", formatarMoeda(totalValorExtras), "=", formatarMoeda(salarioLiquido));
    
    // ATUALIZAR RESUMO FINAL
    atualizarResumo(salario, totalHorasTrabalhadas, horasEsperadasMes, totalHorasExtras, 
                    totalHorasFaltantes, totalDescontos, totalValorExtras, salarioLiquido, valorHora);
}

/**
 * Atualiza o resumo com os resultados finais
 */
function atualizarResumo(salario, totalHoras, horasEsperadas, totalExtras, 
                         totalFaltas, descontos, valorExtras, salarioLiquido, valorHora) {
    
    // Atualizar elementos HTML
    document.getElementById("salarioBase").innerText = formatarMoeda(salario);
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2) + " h";
    document.getElementById("horasEsperadas").innerText = horasEsperadas.toFixed(2) + " h";
    document.getElementById("totalExtrasDiarias").innerText = totalExtras.toFixed(2) + " h";
    document.getElementById("totalExtrasSemanais").innerText = "0.00 h";
    document.getElementById("totalFaltas").innerText = totalFaltas.toFixed(2) + " h";
    document.getElementById("valorHora").innerText = formatarMoeda(valorHora);
    document.getElementById("valorExtras").innerText = formatarMoeda(valorExtras);
    document.getElementById("valorDescontos").innerText = formatarMoeda(descontos);
    document.getElementById("salarioProporcional").innerText = formatarMoeda(salario);
    document.getElementById("totalLiquido").innerText = formatarMoeda(salarioLiquido);
    
    // Destacar o total líquido
    const totalLiquidoElement = document.getElementById("totalLiquido");
    totalLiquidoElement.style.animation = "pulse 0.5s ease";
    setTimeout(() => {
        totalLiquidoElement.style.animation = "";
    }, 500);
    
    // MOSTRAR MENSAGENS DE FEEDBACK
    if (descontos > 0) {
        document.getElementById("valorDescontos").classList.add("valor-negativo");
        
        // Mostrar mensagem CLARA do desconto
        mostrarMensagem(
            `⚠️ DESCONTO APLICADO: ${formatarMoeda(descontos)}<br>` +
            `<small>${totalFaltas.toFixed(2)}h faltantes × ${formatarMoeda(valorHora)}/hora</small><br>` +
            `<small>Salário: ${formatarMoeda(salario)} - ${formatarMoeda(descontos)} = ${formatarMoeda(salario - descontos)}</small>`,
            "warning",
            7000
        );
    } else {
        document.getElementById("valorDescontos").classList.remove("valor-negativo");
    }
    
    if (valorExtras > 0) {
        document.getElementById("valorExtras").classList.add("valor-positivo");
        
        // Mostrar mensagem CLARA das extras
        mostrarMensagem(
            `💰 EXTRAS: +${formatarMoeda(valorExtras)}<br>` +
            `<small>${totalExtras.toFixed(2)}h extras × ${formatarMoeda(valorHora)} × 1.5 (50% adicional)</small>`,
            "success",
            6000
        );
    } else {
        document.getElementById("valorExtras").classList.remove("valor-positivo");
    }
    
    // Mostrar resumo final
    if (descontos > 0 || valorExtras > 0) {
        setTimeout(() => {
            mostrarMensagem(
                `📊 RESUMO FINAL: ${formatarMoeda(salarioLiquido)}<br>` +
                `<small>Base: ${formatarMoeda(salario)} | ` +
                `Descontos: -${formatarMoeda(descontos)} | ` +
                `Extras: +${formatarMoeda(valorExtras)}</small>`,
                "info",
                8000
            );
        }, 1000);
    }
}

/**
 * Reseta todos os valores do resumo
 */
function resetarResumo() {
    document.getElementById("salarioBase").innerText = "R$ 0,00";
    document.getElementById("totalHoras").innerText = "0 h";
    document.getElementById("horasEsperadas").innerText = "0 h";
    document.getElementById("totalExtrasDiarias").innerText = "0 h";
    document.getElementById("totalExtrasSemanais").innerText = "0 h";
    document.getElementById("totalFaltas").innerText = "0 h";
    document.getElementById("valorHora").innerText = "R$ 0,00";
    document.getElementById("valorExtras").innerText = "R$ 0,00";
    document.getElementById("valorDescontos").innerText = "R$ 0,00";
    document.getElementById("salarioProporcional").innerText = "R$ 0,00";
    document.getElementById("totalLiquido").innerText = "R$ 0,00";
    
    // Remover classes de cor
    document.getElementById("valorDescontos").classList.remove("valor-negativo");
    document.getElementById("valorExtras").classList.remove("valor-positivo");
    document.getElementById("salarioProporcional").classList.remove("valor-negativo");
}