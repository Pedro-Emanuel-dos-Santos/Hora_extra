// ============================================
// MÓDULO: CÁLCULOS DE HORAS - VERSÃO SIMPLIFICADA
// ============================================

// JORNADA PADRÃO
const HORARIO_INICIO_MANHA = "08:00";
const HORARIO_FIM_MANHA = "12:00";
const HORARIO_INICIO_TARDE = "13:30";
const HORARIO_FIM_TARDE = "18:00";
const HORAS_POR_DIA_UTIL = 8.5; // 4h manhã + 4.5h tarde = 8.5h
const HORAS_POR_SEMANA = 44; // Jornada legal semanal

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
 * Verifica se o horário está dentro do padrão
 * @param {string} horario - Horário a verificar
 * @param {string} tipo - 'entrada1', 'saida1', 'entrada2', 'saida2'
 * @returns {boolean} True se está dentro do padrão
 */
function horarioDentroDoPadrao(horario, tipo) {
    const horariosPadrao = {
        'entrada1': HORARIO_INICIO_MANHA,
        'saida1': HORARIO_FIM_MANHA,
        'entrada2': HORARIO_INICIO_TARDE,
        'saida2': HORARIO_FIM_TARDE
    };
    
    return horario === horariosPadrao[tipo];
}

/**
 * Preenche automaticamente os horários padrão
 */
function preencherHorariosPadrao() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    
    if (linhas.length === 0) {
        mostrarMensagem("❌ Primeiro gere o calendário do mês!", "error");
        return;
    }
    
    let diasPreenchidos = 0;
    
    linhas.forEach((linha, index) => {
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6;
        
        // Apenas para dias úteis (segunda a sexta)
        if (!isFimDeSemana) {
            const inputs = linha.querySelectorAll("input[type='time']");
            
            // Preencher com horários padrão da empresa
            inputs[0].value = HORARIO_INICIO_MANHA; // Entrada manhã
            inputs[1].value = HORARIO_FIM_MANHA;    // Saída manhã
            inputs[2].value = HORARIO_INICIO_TARDE; // Entrada tarde
            inputs[3].value = HORARIO_FIM_TARDE;    // Saída tarde
            
            // Destacar visualmente que foi preenchido
            destaqueLinha(linha, "success");
            
            diasPreenchidos++;
        }
    });
    
    // Calcular automaticamente após preencher
    setTimeout(() => calcularMes(), 300);
    
    // Mostrar mensagem de confirmação
    mostrarMensagem(
        `✅ Horários padrão preenchidos em ${diasPreenchidos} dias úteis!<br>` +
        `<small>${HORARIO_INICIO_MANHA}-${HORARIO_FIM_MANHA} e ${HORARIO_INICIO_TARDE}-${HORARIO_FIM_TARDE}</small>`, 
        "success"
    );
}

/**
 * Calcula todos os valores do mês - NOVA LÓGICA SIMPLIFICADA
 */
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const { salario, mes, ano } = getDadosAtuais();

    // Se não houver linhas, não calcular
    if (linhas.length === 0) {
        return;
    }

    // Variáveis para totais
    let totalHorasTrabalhadas = 0;
    let totalHorasExtras = 0;    // Todas as horas extras (acima do padrão)
    let totalHorasFaltantes = 0;
    let totalDescontos = 0;
    let totalValorExtras = 0;
    
    // Calcular valor da hora
    const valorHora = salario > 0 ? salario / 220 : 0;
    
    // Calcular dias úteis no mês
    const diasUteisMes = calcularDiasUteisNoMes(mes, ano);
    
    // Horas esperadas no mês (dias úteis × 8.5h)
    const horasEsperadasMes = Math.round(diasUteisMes * HORAS_POR_DIA_UTIL * 100) / 100;

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
        
        // Destacar se houver horas trabalhadas
        if (horasTrabalhadas > 0) {
            destaqueLinha(linha, "info");
        }
        
        // Processar dia útil (segunda a sexta)
        if (isDiaUtil) {
            // Verificar se bateu o ponto completo
            const bateuPonto = 
                inputs[0].value && inputs[1].value && 
                inputs[2].value && inputs[3].value;
            
            if (!bateuPonto && horasTrabalhadas === 0) {
                // FALTOU O DIA INTEIRO
                const faltaDia = HORAS_POR_DIA_UTIL;
                const descontoDia = Math.round(faltaDia * valorHora * 100) / 100;
                
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                
                totalHorasFaltantes += faltaDia;
                totalDescontos += descontoDia;
                
                // Destacar falta
                destaqueLinha(linha, "error");
            } 
            else if (bateuPonto) {
                // BATEU PONTO COMPLETO - calcular se trabalhou mais ou menos
                if (horasTrabalhadas > HORAS_POR_DIA_UTIL) {
                    // HORA EXTRA
                    const extraDia = Math.round((horasTrabalhadas - HORAS_POR_DIA_UTIL) * 100) / 100;
                    linha.querySelector(".extra-diaria").innerText = extraDia.toFixed(2);
                    totalHorasExtras += extraDia;
                    
                    // Destacar extra
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
                    
                    // Destacar falta
                    destaqueLinha(linha, "error");
                }
            }
        } 
        else if (isFimDeSemana && horasTrabalhadas > 0) {
            // FIM DE SEMANA TRABALHADO - TUDO É EXTRA
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            totalHorasExtras += horasTrabalhadas;
            
            // Destacar extra
            destaqueLinha(linha, "warning");
        }
        
        // Acumular total geral
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    // Calcular valor das horas extras (50% adicional)
    totalValorExtras = Math.round(totalHorasExtras * valorHora * 1.5 * 100) / 100;
    
    // Calcular salário líquido
    const salarioLiquido = Math.max(0, salario - totalDescontos + totalValorExtras);
    
    // ATUALIZAR RESUMO FINAL
    atualizarResumo(salario, totalHorasTrabalhadas, horasEsperadasMes, totalHorasExtras, totalHorasFaltantes, 
                    totalDescontos, totalValorExtras, salarioLiquido, valorHora, diasUteisMes);
}

/**
 * Atualiza o resumo com os resultados finais - LÓGICA SIMPLIFICADA
 */
function atualizarResumo(salario, totalHoras, horasEsperadas, totalExtras, totalFaltas, 
                         descontos, valorExtras, salarioLiquido, valorHora, diasUteis) {
    
    // Atualizar elementos HTML
    document.getElementById("salarioBase").innerText = formatarMoeda(salario);
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2) + " h";
    document.getElementById("horasEsperadas").innerText = horasEsperadas.toFixed(2) + " h";
    document.getElementById("totalExtrasDiarias").innerText = totalExtras.toFixed(2) + " h";
    document.getElementById("totalExtrasSemanais").innerText = "0.00 h"; // Não usamos mais essa separação
    document.getElementById("totalFaltas").innerText = totalFaltas.toFixed(2) + " h";
    document.getElementById("valorHora").innerText = formatarMoeda(valorHora);
    document.getElementById("valorExtras").innerText = formatarMoeda(valorExtras);
    document.getElementById("valorDescontos").innerText = formatarMoeda(descontos);
    document.getElementById("salarioProporcional").innerText = formatarMoeda(salario);
    document.getElementById("totalLiquido").innerText = formatarMoeda(salarioLiquido);
    
    // DEBUG: Mostrar cálculo detalhado
    console.log("=== CÁLCULO SIMPLIFICADO ===");
    console.log("Salário base:", formatarMoeda(salario));
    console.log("Dias úteis no mês:", diasUteis);
    console.log("Horas esperadas:", horasEsperadas.toFixed(2), "h");
    console.log("Horas trabalhadas:", totalHoras.toFixed(2), "h");
    console.log("Horas extras:", totalExtras.toFixed(2), "h");
    console.log("Horas faltantes:", totalFaltas.toFixed(2), "h");
    console.log("Valor hora:", formatarMoeda(valorHora));
    console.log("Descontos:", formatarMoeda(descontos));
    console.log("Valor extras (+50%):", formatarMoeda(valorExtras));
    console.log("Total líquido:", formatarMoeda(salarioLiquido));
    console.log("Fórmula:", formatarMoeda(salario), "-", formatarMoeda(descontos), "+", formatarMoeda(valorExtras), "=", formatarMoeda(salarioLiquido));
    console.log("======================================");
    
    // Destacar o total líquido
    const totalLiquidoElement = document.getElementById("totalLiquido");
    totalLiquidoElement.style.animation = "pulse 0.5s ease";
    setTimeout(() => {
        totalLiquidoElement.style.animation = "";
    }, 500);
    
    // Aplicar classes de cor para valores
    if (descontos > 0) {
        document.getElementById("valorDescontos").classList.add("valor-negativo");
        
        // Mostrar mensagem do desconto
        mostrarMensagem(
            `⚠️ Desconto aplicado: ${formatarMoeda(descontos)}<br>` +
            `<small>${totalFaltas.toFixed(2)}h faltantes × ${formatarMoeda(valorHora)}</small>`,
            "warning",
            5000
        );
    } else {
        document.getElementById("valorDescontos").classList.remove("valor-negativo");
    }
    
    if (valorExtras > 0) {
        document.getElementById("valorExtras").classList.add("valor-positivo");
        
        // Mostrar mensagem das extras
        mostrarMensagem(
            `💰 ${totalExtras.toFixed(2)}h extras (+${formatarMoeda(valorExtras)})<br>` +
            `<small>${totalExtras.toFixed(2)}h × ${formatarMoeda(valorHora)} × 1.5 (adicional 50%)</small>`,
            "success",
            5000
        );
    } else {
        document.getElementById("valorExtras").classList.remove("valor-positivo");
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