// ============================================
// MÓDULO: CÁLCULOS DE HORAS - VERSÃO PARA CARGA 11H
// ============================================

// HORÁRIOS PADRÃO
const HORARIO_INICIO_MANHA = "06:00";
const HORARIO_FIM_MANHA = "12:00";
const HORARIO_INICIO_TARDE = "13:00";
const HORARIO_FIM_TARDE = "18:00";
const HORAS_POR_DIA_UTIL = 11.0; // 6h manhã + 5h tarde = 11h

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
    
    return Math.round(horasTrabalhadas * 100) / 100;
}

/**
 * Calcula valor da hora BASEADO NA CARGA DO MÊS
 */
function calcularValorHora(salario, diasUteisMes) {
    if (salario <= 0 || diasUteisMes <= 0) return 0;
    
    // Valor hora = Salário ÷ (dias úteis × 11h)
    const horasTotaisMes = diasUteisMes * HORAS_POR_DIA_UTIL;
    return Math.round((salario / horasTotaisMes) * 100) / 100;
}

/**
 * Calcula todos os valores do mês
 */
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const { salario, mes, ano } = getDadosAtuais();

    if (linhas.length === 0) {
        mostrarMensagem("❌ Primeiro gere o calendário do mês!", "error");
        return;
    }

    // VARIÁVEIS PARA TOTAIS
    let totalHorasTrabalhadas = 0;
    let totalHorasExtras = 0;
    let totalHorasFaltantes = 0;
    let totalDescontos = 0;
    let totalValorExtras = 0;
    
    // Calcular dias úteis no mês
    const diasUteisMes = calcularDiasUteisNoMes(mes, ano);
    
    // CALCULAR VALOR DA HORA CORRETAMENTE
    const valorHora = calcularValorHora(salario, diasUteisMes);
    
    // Horas esperadas no mês (dias úteis × 11h)
    const horasEsperadasMes = Math.round(diasUteisMes * HORAS_POR_DIA_UTIL * 100) / 100;

    console.log("=== CÁLCULO PARA CARGA 11H ===");
    console.log("Salário:", salario);
    console.log("Dias úteis:", diasUteisMes);
    console.log("Horas esperadas no mês:", horasEsperadasMes);
    console.log("Valor hora:", valorHora, "(Salário ÷", horasEsperadasMes, "h)");

    // Processar cada linha/dia
    linhas.forEach((linha, index) => {
        const inputs = linha.querySelectorAll("input");
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6;
        const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
        
        // Resetar células
        linha.querySelector(".extra-diaria").innerText = "0.00";
        linha.querySelector(".extra-semanal").innerText = "0.00";
        linha.querySelector(".falta").innerText = "0.00";
        linha.querySelector(".desconto-dia").innerText = "R$ 0,00";
        
        // Calcular horas trabalhadas no dia
        let horasTrabalhadas = calcularHorasDia(inputs);
        const celulaTrab = linha.querySelector(".trab");
        celulaTrab.innerText = horasTrabalhadas.toFixed(2);
        
        // SE FOR DIA ÚTIL (segunda a sexta)
        if (isDiaUtil) {
            // Verificar se bateu ponto
            const bateuPonto = inputs[0].value || inputs[1].value || inputs[2].value || inputs[3].value;
            
            if (bateuPonto) {
                // COMPARAR COM AS 11H PADRÃO
                if (horasTrabalhadas > HORAS_POR_DIA_UTIL) {
                    // HORA EXTRA
                    const extraDia = Math.round((horasTrabalhadas - HORAS_POR_DIA_UTIL) * 100) / 100;
                    linha.querySelector(".extra-diaria").innerText = extraDia.toFixed(2);
                    totalHorasExtras += extraDia;
                    
                    console.log(`Dia ${index + 1}: ${extraDia}h extra`);
                    destaqueLinha(linha, "success");
                } 
                else if (horasTrabalhadas < HORAS_POR_DIA_UTIL) {
                    // FALTA PARCIAL
                    const faltaDia = Math.round((HORAS_POR_DIA_UTIL - horasTrabalhadas) * 100) / 100;
                    const descontoDia = Math.round(faltaDia * valorHora * 100) / 100;
                    
                    linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                    linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                    
                    totalHorasFaltantes += faltaDia;
                    totalDescontos += descontoDia;
                    
                    console.log(`Dia ${index + 1}: Falta ${faltaDia}h = ${formatarMoeda(descontoDia)}`);
                    destaqueLinha(linha, "error");
                }
            } else {
                // NÃO BATEU PONTO - FALTOU DIA INTEIRO
                const faltaDia = HORAS_POR_DIA_UTIL;
                const descontoDia = Math.round(faltaDia * valorHora * 100) / 100;
                
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                
                totalHorasFaltantes += faltaDia;
                totalDescontos += descontoDia;
                
                console.log(`Dia ${index + 1}: Faltou dia inteiro ${faltaDia}h = ${formatarMoeda(descontoDia)}`);
                destaqueLinha(linha, "error");
            }
        } 
        // FIM DE SEMANA TRABALHADO
        else if (isFimDeSemana && horasTrabalhadas > 0) {
            // TUDO É EXTRA (jornada não inclui fim de semana)
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            totalHorasExtras += horasTrabalhadas;
            
            console.log(`Dia ${index + 1}: Fim de semana ${horasTrabalhadas}h extra`);
            destaqueLinha(linha, "warning");
        }
        
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    // CALCULAR VALOR DAS EXTRAS (50% adicional)
    totalValorExtras = Math.round(totalHorasExtras * valorHora * 1.5 * 100) / 100;
    
    // CALCULAR SALÁRIO LÍQUIDO
    const salarioLiquido = Math.max(0, Math.round((salario - totalDescontos + totalValorExtras) * 100) / 100);
    
    console.log("=== RESULTADO ===");
    console.log("Total horas trabalhadas:", totalHorasTrabalhadas.toFixed(2));
    console.log("Horas extras:", totalHorasExtras.toFixed(2));
    console.log("Horas faltantes:", totalHorasFaltantes.toFixed(2));
    console.log("Descontos:", formatarMoeda(totalDescontos));
    console.log("Extras (+50%):", formatarMoeda(totalValorExtras));
    console.log("Salário líquido:", formatarMoeda(salarioLiquido));
    console.log("Fórmula:", formatarMoeda(salario), "-", formatarMoeda(totalDescontos), "+", formatarMoeda(totalValorExtras));
    
    // ATUALIZAR RESUMO
    atualizarResumo(salario, totalHorasTrabalhadas, horasEsperadasMes, totalHorasExtras, 
                    totalHorasFaltantes, totalDescontos, totalValorExtras, salarioLiquido, valorHora, diasUteisMes);
}

/**
 * Atualiza o resumo
 */
function atualizarResumo(salario, totalHoras, horasEsperadas, totalExtras, 
                         totalFaltas, descontos, valorExtras, salarioLiquido, valorHora, diasUteis) {
    
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
    
    // Destacar total líquido
    const totalLiquidoElement = document.getElementById("totalLiquido");
    totalLiquidoElement.style.animation = "pulse 0.5s ease";
    setTimeout(() => totalLiquidoElement.style.animation = "", 500);
    
    // MENSAGENS DE FEEDBACK
    if (descontos > 0) {
        document.getElementById("valorDescontos").classList.add("valor-negativo");
        
        mostrarMensagem(
            `⚠️ DESCONTO: ${formatarMoeda(descontos)}<br>` +
            `<small>${totalFaltas.toFixed(2)}h faltantes × ${formatarMoeda(valorHora)}/h</small>`,
            "warning",
            6000
        );
    } else {
        document.getElementById("valorDescontos").classList.remove("valor-negativo");
    }
    
    if (valorExtras > 0) {
        document.getElementById("valorExtras").classList.add("valor-positivo");
        
        mostrarMensagem(
            `💰 EXTRAS: +${formatarMoeda(valorExtras)}<br>` +
            `<small>${totalExtras.toFixed(2)}h × ${formatarMoeda(valorHora)} × 1.5</small>`,
            "success",
            6000
        );
    } else {
        document.getElementById("valorExtras").classList.remove("valor-positivo");
    }
    
    // RESUMO FINAL
    if (descontos > 0 || valorExtras > 0) {
        setTimeout(() => {
            mostrarMensagem(
                `📊 TOTAL: ${formatarMoeda(salarioLiquido)}<br>` +
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
    
    document.getElementById("valorDescontos").classList.remove("valor-negativo");
    document.getElementById("valorExtras").classList.remove("valor-positivo");
}