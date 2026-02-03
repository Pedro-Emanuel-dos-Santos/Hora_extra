// ============================================
// MÓDULO: CÁLCULOS DE HORAS - VERSÃO FINAL CORRIGIDA
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
    
    // Arredondar para evitar erros de precisão
    return Math.round(horasTrabalhadas * 100) / 100;
}

/**
 * Resetar células de cálculo de uma linha
 * @param {HTMLElement} linha - Linha da tabela
 */
function resetarCelulasCalculo(linha) {
    linha.querySelector(".extra-diaria").innerText = "0.00";
    linha.querySelector(".extra-semanal").innerText = "0.00";
    linha.querySelector(".falta").innerText = "0.00";
    linha.querySelector(".desconto-dia").innerText = "R$ 0,00";
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
 * Calcula todos os valores do mês - VERSÃO CORRIGIDA
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
    let totalExtrasDiarias = 0;     // Extras acima de 8h/dia (banco de horas)
    let totalExtrasSemanais = 0;    // Extras acima de 44h/semana (pagas)
    let totalFaltas = 0;
    let totalDescontosMonetario = 0;
    
    // Calcular valor da hora
    const valorHora = salario > 0 ? salario / 220 : 0;
    
    // Controle semanal aprimorado
    let semanaAtual = 1;
    const semanas = {
        1: { 
            total: 0, 
            extrasDiariasAcumuladas: 0,
            diasUteis: [],
            diasUteisIndices: []
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
        
        // NOVO: Inicializar nova semana se for domingo
        if (diaSemana === 0 && index > 0) {
            semanaAtual++;
            if (!semanas[semanaAtual]) {
                semanas[semanaAtual] = { 
                    total: 0, 
                    extrasDiariasAcumuladas: 0,
                    diasUteis: [],
                    diasUteisIndices: []
                };
            }
        }
        
        // Garantir que a semana atual existe
        if (!semanas[semanaAtual]) {
            semanas[semanaAtual] = { 
                total: 0, 
                extrasDiariasAcumuladas: 0,
                diasUteis: [],
                diasUteisIndices: []
            };
        }
        
        // Adicionar horas à semana atual
        semanas[semanaAtual].total += horasTrabalhadas;
        
        // Registrar informações dos dias úteis
        if (isDiaUtil) {
            semanas[semanaAtual].diasUteis.push({
                index: index,
                horas: horasTrabalhadas,
                linha: linha
            });
            semanas[semanaAtual].diasUteisIndices.push(index);
        }
        
        // Processar dias úteis (segunda a sexta)
        if (isDiaUtil) {
            // CÁLCULO DIÁRIO - Extra acima de 8h/dia (banco de horas)
            const jornadaDiaria = 8.0;
            
            if (horasTrabalhadas > jornadaDiaria) {
                const extraDiaria = Math.round((horasTrabalhadas - jornadaDiaria) * 100) / 100;
                linha.querySelector(".extra-diaria").innerText = extraDiaria.toFixed(2);
                totalExtrasDiarias += extraDiaria;
                
                // Acumular extras diárias na semana para possível conversão
                semanas[semanaAtual].extrasDiariasAcumuladas += extraDiaria;
                
                // Destacar extra diária
                destaqueLinha(linha, "warning");
            } else if (horasTrabalhadas < jornadaDiaria && horasTrabalhadas > 0) {
                // Falta no dia
                const faltaDia = Math.round((jornadaDiaria - horasTrabalhadas) * 100) / 100;
                const descontoDia = Math.round(faltaDia * valorHora * 100) / 100;
                
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                linha.querySelector(".desconto-dia").innerText = formatarMoeda(descontoDia);
                
                totalFaltas += faltaDia;
                totalDescontosMonetario += descontoDia;
                
                // Destacar falta
                destaqueLinha(linha, "error");
            }
        } else if (isFimDeSemana && horasTrabalhadas > 0) {
            // FINS DE SEMANA - Todo trabalho é extra paga
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            totalExtrasSemanais += horasTrabalhadas;
            
            // Destacar extra semanal
            destaqueLinha(linha, "success");
        }
        
        // FIM DA SEMANA (sábado) OU FIM DO MÊS - Calcular extras semanais
        if (diaSemana === 6 || index === linhas.length - 1) {
            const jornadaSemanalLegal = 44.0; // 44 horas semanais permitidas
            const semana = semanas[semanaAtual];
            
            if (semana && semana.total > jornadaSemanalLegal) {
                // Calcular horas extras totais da semana acima do limite legal
                const extraSemanalTotal = semana.total - jornadaSemanalLegal;
                
                // CORREÇÃO: Usar as extras diárias acumuladas ou a diferença total
                const extrasParaDistribuir = Math.min(
                    extraSemanalTotal, 
                    semana.extrasDiariasAcumuladas
                );
                
                // Se houver extras para distribuir e dias úteis na semana
                if (extrasParaDistribuir > 0 && semana.diasUteis.length > 0) {
                    // Distribuir proporcionalmente pelos dias úteis
                    const extraPorDia = extrasParaDistribuir / semana.diasUteis.length;
                    const extraPorDiaArredondado = Math.round(extraPorDia * 100) / 100;
                    
                    semana.diasUteis.forEach(diaInfo => {
                        const linhaDia = diaInfo.linha;
                        
                        // Adicionar à coluna de extras semanais (pagas)
                        const extraSemanalAtual = parseFloat(linhaDia.querySelector(".extra-semanal").innerText) || 0;
                        const novaExtraSemanal = Math.round((extraSemanalAtual + extraPorDiaArredondado) * 100) / 100;
                        linhaDia.querySelector(".extra-semanal").innerText = novaExtraSemanal.toFixed(2);
                        
                        // Reduzir da coluna de extras diárias (banco)
                        const extraDiariaAtual = parseFloat(linhaDia.querySelector(".extra-diaria").innerText) || 0;
                        if (extraDiariaAtual > 0) {
                            const novaExtraDiaria = Math.max(0, Math.round((extraDiariaAtual - extraPorDiaArredondado) * 100) / 100);
                            linhaDia.querySelector(".extra-diaria").innerText = novaExtraDiaria.toFixed(2);
                        }
                        
                        // Destacar visualmente
                        destaqueLinha(linhaDia, "success");
                    });
                    
                    // Atualizar totais
                    totalExtrasSemanais += extrasParaDistribuir;
                    totalExtrasDiarias -= extrasParaDistribuir;
                } else if (extraSemanalTotal > 0 && semana.diasUteis.length === 0) {
                    // Se não há dias úteis mas há extras (trabalhou apenas fim de semana)
                    totalExtrasSemanais += extraSemanalTotal;
                }
            }
            
            // Preparar próxima semana (se não for o último dia)
            if (index !== linhas.length - 1) {
                semanaAtual++;
                if (!semanas[semanaAtual]) {
                    semanas[semanaAtual] = { 
                        total: 0, 
                        extrasDiariasAcumuladas: 0,
                        diasUteis: [],
                        diasUteisIndices: []
                    };
                }
            }
        }
        
        // Acumular total geral
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    // ATUALIZAR RESUMO FINAL
    atualizarResumo(salario, totalHorasTrabalhadas, totalExtrasDiarias, totalExtrasSemanais, totalFaltas, totalDescontosMonetario, mes, ano);
}

/**
 * Atualiza o resumo com os resultados finais - VERSÃO PROPORCIONAL CORRIGIDA
 */
function atualizarResumo(salario, totalHoras, extrasDiarias, extrasSemanais, faltas, totalDescontos, mes, ano) {
    // Calcular valor da hora
    const valorHora = salario > 0 ? salario / 220 : 0;
    
    // Calcular dias úteis e horas esperadas
    const diasUteisMes = calcularDiasUteisNoMes(mes, ano);
    const horasEsperadasMes = diasUteisMes * 8;
    
    // CORREÇÃO: CÁLCULO PROPORCIONAL CORRETO
    // 1. Calcular percentual de horas trabalhadas
    let percentualTrabalhado = 1; // Assume 100% se horasEsperadasMes for 0
    
    if (horasEsperadasMes > 0) {
        percentualTrabalhado = totalHoras / horasEsperadasMes;
        
        // Limitar a 100% (não pode receber mais que 100% do salário por horas)
        percentualTrabalhado = Math.min(percentualTrabalhado, 1);
        
        // Se trabalhou menos que o mínimo (menos de 1 hora por dia útil em média)
        if (percentualTrabalhado < (diasUteisMes / horasEsperadasMes)) {
            percentualTrabalhado = 0; // Não trabalhou o suficiente
        }
    }
    
    // 2. Calcular salário proporcional
    let salarioProporcional = Math.round(salario * percentualTrabalhado * 100) / 100;
    
    // Garantir valores válidos
    salarioProporcional = Math.max(0, salarioProporcional);
    salarioProporcional = Math.min(salario, salarioProporcional); // Não pode ser maior que salário base
    
    // Calcular valores monetários
    const valorTotalExtras = Math.round(extrasSemanais * valorHora * 1.5 * 100) / 100; // Extras pagas com 50% adicional
    
    // Total líquido (salário proporcional + extras)
    const totalLiquido = Math.round((salarioProporcional + valorTotalExtras) * 100) / 100;
    
    // Atualizar elementos HTML
    document.getElementById("salarioBase").innerText = formatarMoeda(salario);
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2) + " h";
    document.getElementById("horasEsperadas").innerText = horasEsperadasMes.toFixed(0) + " h";
    document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2) + " h";
    document.getElementById("totalExtrasSemanais").innerText = extrasSemanais.toFixed(2) + " h";
    document.getElementById("totalFaltas").innerText = faltas.toFixed(2) + " h";
    document.getElementById("valorHora").innerText = formatarMoeda(valorHora);
    document.getElementById("valorExtras").innerText = formatarMoeda(valorTotalExtras);
    document.getElementById("valorDescontos").innerText = formatarMoeda(totalDescontos);
    document.getElementById("salarioProporcional").innerText = formatarMoeda(salarioProporcional);
    document.getElementById("totalLiquido").innerText = formatarMoeda(totalLiquido);
    
    // DEBUG: Mostrar cálculo detalhado
    console.log("=== CÁLCULO PROPORCIONAL DETALHADO ===");
    console.log("Salário base:", formatarMoeda(salario));
    console.log("Horas trabalhadas:", totalHoras.toFixed(2), "h");
    console.log("Horas esperadas:", horasEsperadasMes.toFixed(0), "h");
    console.log("Dias úteis no mês:", diasUteisMes);
    console.log("Percentual trabalhado:", (percentualTrabalhado * 100).toFixed(2) + "%");
    console.log("Salário proporcional:", formatarMoeda(salarioProporcional));
    console.log("Desconto calculado:", formatarMoeda(salario - salarioProporcional));
    console.log("Horas faltantes:", faltas.toFixed(2), "h");
    console.log("Valor hora:", formatarMoeda(valorHora));
    console.log("Extras semanais:", extrasSemanais.toFixed(2), "h");
    console.log("Valor extras (+50%):", formatarMoeda(valorTotalExtras));
    console.log("Total líquido:", formatarMoeda(totalLiquido));
    console.log("======================================");
    
    // Destacar o total líquido
    const totalLiquidoElement = document.getElementById("totalLiquido");
    totalLiquidoElement.style.animation = "pulse 0.5s ease";
    setTimeout(() => {
        totalLiquidoElement.style.animation = "";
    }, 500);
    
    // Aplicar classes de cor para valores
    if (totalDescontos > 0 || salarioProporcional < salario) {
        document.getElementById("valorDescontos").classList.add("valor-negativo");
    } else {
        document.getElementById("valorDescontos").classList.remove("valor-negativo");
    }
    
    if (valorTotalExtras > 0) {
        document.getElementById("valorExtras").classList.add("valor-positivo");
    } else {
        document.getElementById("valorExtras").classList.remove("valor-positivo");
    }
    
    if (salarioProporcional < salario) {
        document.getElementById("salarioProporcional").classList.add("valor-negativo");
        const descontoTotal = salario - salarioProporcional;
        
        // Mostrar mensagem clara do desconto
        if (faltas > 0) {
            mostrarMensagem(
                `⚠️ Desconto aplicado: ${formatarMoeda(descontoTotal)}<br>` +
                `<small>${faltas.toFixed(2)}h faltantes × ${formatarMoeda(valorHora)} = ${formatarMoeda(totalDescontos)}<br>` +
                `Salário proporcional: ${(percentualTrabalhado * 100).toFixed(1)}% de ${formatarMoeda(salario)}</small>`,
                "warning",
                6000
            );
        }
    } else {
        document.getElementById("salarioProporcional").classList.remove("valor-negativo");
    }
    
    // Mostrar mensagem se houver extras
    if (extrasSemanais > 0) {
        mostrarMensagem(
            `💰 ${extrasSemanais.toFixed(2)}h extras (+${formatarMoeda(valorTotalExtras)})<br>` +
            `<small>${extrasSemanais.toFixed(2)}h × ${formatarMoeda(valorHora)} × 1.5 (adicional 50%)</small>`,
            "success",
            5000
        );
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