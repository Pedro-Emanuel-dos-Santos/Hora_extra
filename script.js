// ============================================
// SISTEMA DE CONTROLE DE HORAS - RH
// Versão Final com Preenchimento Automático
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

// ============================================
// 1. INICIALIZAÇÃO DO SISTEMA
// ============================================

/**
 * Preenche os selects de mês e ano com valores
 */
function preencherSelects() {
    const mesSelect = document.getElementById("mes");
    const anoSelect = document.getElementById("ano");

    // Limpar selects existentes
    mesSelect.innerHTML = '';
    anoSelect.innerHTML = '';

    // Preencher meses (1 a 12)
    for (let i = 0; i < 12; i++) {
        const data = new Date(2024, i, 1);
        const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long' });
        const nomeMesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
        mesSelect.innerHTML += `<option value="${i}">${nomeMesFormatado}</option>`;
    }

    // Preencher anos (ano atual -1 até +2)
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 1; i <= anoAtual + 2; i++) {
        anoSelect.innerHTML += `<option value="${i}">${i}</option>`;
    }

    // Definir valores padrão (mês e ano atual)
    mesSelect.value = new Date().getMonth();
    anoSelect.value = anoAtual;
}

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
};

// ============================================
// 2. CONTROLE DO CALENDÁRIO
// ============================================

/**
 * Gera o calendário do mês selecionado
 */
function gerarCalendario() {
    const mes = Number(document.getElementById("mes").value);
    const ano = Number(document.getElementById("ano").value);
    const tbody = document.getElementById("corpoTabela");

    // Validar mês e ano
    if (isNaN(mes) || isNaN(ano)) {
        mostrarMensagem("❌ Por favor, selecione um mês e ano válidos!", "error");
        return;
    }

    // Limpar tabela existente
    tbody.innerHTML = "";

    // Obter número de dias no mês
    const diasMes = new Date(ano, mes + 1, 0).getDate();

    // Criar uma linha para cada dia do mês
    for (let dia = 1; dia <= diasMes; dia++) {
        const data = new Date(ano, mes, dia);
        const diaSemana = data.getDay();
        const nomeDiaSemana = diasSemana[diaSemana];
        
        // Formatar data no padrão brasileiro (DD/MM/AAAA)
        const dataFormatada = dia.toString().padStart(2, '0') + '/' + 
                             (mes + 1).toString().padStart(2, '0') + '/' + 
                             ano;

        const tr = document.createElement("tr");

        // Adicionar classes CSS para sábado e domingo
        if (diaSemana === 0) {
            tr.classList.add("domingo");
        } else if (diaSemana === 6) {
            tr.classList.add("sabado");
        }

        // Criar HTML da linha da tabela SEM preencher automaticamente
        tr.innerHTML = `
            <td><strong>${dataFormatada}</strong></td>
            <td class="dia-semana" data-diasemana="${diaSemana}">${nomeDiaSemana.toUpperCase()}</td>
            <td><input type="time" class="entrada1" onchange="validarHorario(this)"></td>
            <td><input type="time" class="saida1" onchange="validarHorario(this)"></td>
            <td><input type="time" class="entrada2" onchange="validarHorario(this)"></td>
            <td><input type="time" class="saida2" onchange="validarHorario(this)"></td>
            <td class="trab">0.00</td>
            <td class="extra-diaria">0.00</td>
            <td class="extra-semanal">0.00</td>
            <td class="falta">0.00</td>
        `;

        tbody.appendChild(tr);
    }
    
    // Mostrar mensagem informativa
    mostrarMensagem(`📅 Calendário gerado com ${diasMes} dias!<br><small>Use "Preencher Horários Padrão" para preencher automaticamente.</small>`, "info");
    
    // Calcular automaticamente (vai mostrar zeros)
    setTimeout(() => calcularMes(), 500);
}

// ============================================
// 3. FUNÇÕES DE PREENCHIMENTO AUTOMÁTICO
// ============================================

/**
 * Preenche automaticamente os horários padrão da empresa
 * 07:30-12:00 e 13:30-18:00 para dias úteis
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
            inputs[0].value = "07:30"; // Entrada manhã
            inputs[1].value = "12:00"; // Saída manhã
            inputs[2].value = "13:30"; // Entrada tarde
            inputs[3].value = "18:00"; // Saída tarde
            
            // Destacar visualmente que foi preenchido
            destaqueLinha(linha, "#e8f6f3");
            
            diasPreenchidos++;
        }
    });
    
    // Calcular automaticamente após preencher
    setTimeout(() => calcularMes(), 300);
    
    // Mostrar mensagem de confirmação
    mostrarMensagem(`✅ Horários padrão preenchidos em ${diasPreenchidos} dias úteis!<br><small>07:30-12:00 e 13:30-18:00</small>`, "success");
}

/**
 * Limpa todos os horários da tabela
 */
function limparHorarios() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há horários para limpar!", "error");
        return;
    }
    
    // Confirmar antes de limpar
    if (!confirm("⚠️ Tem certeza que deseja limpar TODOS os horários?\nIsso não pode ser desfeito.")) {
        return;
    }
    
    let diasLimpos = 0;
    
    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input[type='time']");
        
        // Limpar todos os inputs de horário
        inputs.forEach(input => {
            input.value = "";
        });
        
        // Resetar células de cálculo
        linha.querySelector(".trab").innerText = "0.00";
        linha.querySelector(".extra-diaria").innerText = "0.00";
        linha.querySelector(".extra-semanal").innerText = "0.00";
        linha.querySelector(".falta").innerText = "0.00";
        
        // Destacar visualmente que foi limpo
        destaqueLinha(linha, "#fdedec");
        
        diasLimpos++;
    });
    
    // Resetar resumo
    resetarResumo();
    
    // Mostrar mensagem de confirmação
    mostrarMensagem(`🗑️ Todos os horários foram limpos! (${diasLimpos} dias)`, "warning");
}

// ============================================
// 4. CÁLCULO PRINCIPAL DO MÊS
// ============================================

/**
 * Calcula todos os valores do mês
 */
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const salario = Number(document.getElementById("salario").value) || 0;

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
        linha.querySelector(".trab").innerText = horasTrabalhadas.toFixed(2);
        
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
            } else if (horasTrabalhadas < jornadaDiaria && horasTrabalhadas > 0) {
                // Falta no dia
                const faltaDia = jornadaDiaria - horasTrabalhadas;
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                totalFaltas += faltaDia;
            }
        } else if (isFimDeSemana && horasTrabalhadas > 0) {
            // FINS DE SEMANA - Todo trabalho é extra paga
            linha.querySelector(".extra-semanal").innerText = horasTrabalhadas.toFixed(2);
            totalExtrasSemanais += horasTrabalhadas;
            
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
                        linhas[i].querySelector(".extra-semanal").innerText = (extraAtual + extraPorDia).toFixed(2);
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

// ============================================
// 5. FUNÇÕES AUXILIARES DE CÁLCULO
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
 * Calcula diferença entre dois horários
 * @param {string} inicio - Horário de início (HH:MM)
 * @param {string} fim - Horário de fim (HH:MM)
 * @returns {number} Diferença em horas
 */
function diferencaHoras(inicio, fim) {
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

// ============================================
// 6. ATUALIZAÇÃO DA INTERFACE
// ============================================

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
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2);
    document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2);
    document.getElementById("totalExtrasSemanais").innerText = extrasSemanais.toFixed(2);
    document.getElementById("totalFaltas").innerText = faltas.toFixed(2);
    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
    document.getElementById("valorExtras").innerText = valorTotalExtras.toFixed(2);
    document.getElementById("valorDescontos").innerText = valorTotalDescontos.toFixed(2);
    document.getElementById("totalLiquido").innerText = totalLiquido.toFixed(2);
}

/**
 * Reseta todos os valores do resumo
 */
function resetarResumo() {
    document.getElementById("totalHoras").innerText = "0";
    document.getElementById("totalExtrasDiarias").innerText = "0";
    document.getElementById("totalExtrasSemanais").innerText = "0";
    document.getElementById("totalFaltas").innerText = "0";
    document.getElementById("valorHora").innerText = "0.00";
    document.getElementById("valorExtras").innerText = "0.00";
    document.getElementById("valorDescontos").innerText = "0.00";
    document.getElementById("totalLiquido").innerText = "0.00";
}

// ============================================
// 7. FUNÇÕES DE VALIDAÇÃO E UTILITÁRIAS
// ============================================

/**
 * Valida se um horário está correto
 * @param {HTMLInputElement} input - Input de horário
 */
function validarHorario(input) {
    const valor = input.value;
    if (!valor) return;
    
    // Validar formato HH:MM
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(valor)) {
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

// ============================================
// 8. EVENT LISTENERS
// ============================================

/**
 * Configura os event listeners quando o DOM carrega
 */
document.addEventListener('DOMContentLoaded', function() {
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
    });
});

// ============================================
// 9. EXPORTAÇÃO DE DADOS (BÔNUS)
// ============================================

/**
 * Exporta os dados para CSV
 */
function exportarParaCSV() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    let csv = "Data;Dia;Entrada1;Saida1;Entrada2;Saida2;Trabalhado;ExtraBanco;ExtraPaga;Falta\n";
    
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        const dados = [];
        
        colunas.forEach((coluna, index) => {
            if (index === 2 || index === 3 || index === 4 || index === 5) {
                // Inputs de horário
                const input = coluna.querySelector("input");
                dados.push(input ? input.value : "");
            } else {
                // Texto normal
                dados.push(coluna.innerText.trim());
            }
        });
        
        csv += dados.join(";") + "\n";
    });
    
    // Adicionar resumo
    csv += "\nRESUMO\n";
    csv += `Total Horas Trabalhadas;${document.getElementById("totalHoras").innerText}\n`;
    csv += `Extras Diárias (Banco);${document.getElementById("totalExtrasDiarias").innerText}\n`;
    csv += `Extras Semanais (Pagas);${document.getElementById("totalExtrasSemanais").innerText}\n`;
    csv += `Horas Faltantes;${document.getElementById("totalFaltas").innerText}\n`;
    csv += `Valor Hora;R$ ${document.getElementById("valorHora").innerText}\n`;
    csv += `Valor Extras;R$ ${document.getElementById("valorExtras").innerText}\n`;
    csv += `Descontos;R$ ${document.getElementById("valorDescontos").innerText}\n`;
    csv += `Total Líquido;R$ ${document.getElementById("totalLiquido").innerText}\n`;
    
    // Criar link para download
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `controle_horas_${document.getElementById("mes").value + 1}_${document.getElementById("ano").value}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensagem("📁 Dados exportados para CSV com sucesso!", "success");
}

/**
 * Imprime a tabela e o resumo
 */
function imprimirRelatorio() {
    window.print();
}

// ============================================
// 10. FUNÇÕES ADICIONAIS DE CONVENIÊNCIA
// ============================================

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
 * Adiciona botões extras à interface (opcional)
 */
function adicionarBotoesExtras() {
    const topoDiv = document.querySelector(".topo");
    
    if (!document.getElementById("btnExportar")) {
        const botaoExportar = document.createElement("button");
        botaoExportar.id = "btnExportar";
        botaoExportar.innerHTML = "📁 Exportar CSV";
        botaoExportar.onclick = exportarParaCSV;
        botaoExportar.title = "Exportar dados para arquivo CSV";
        botaoExportar.style.background = "#1abc9c";
        
        const botaoImprimir = document.createElement("button");
        botaoImprimir.id = "btnImprimir";
        botaoImprimir.innerHTML = "🖨️ Imprimir";
        botaoImprimir.onclick = imprimirRelatorio;
        botaoImprimir.title = "Imprimir relatório";
        botaoImprimir.style.background = "#7f8c8d";
        
        const botaoCopiar = document.createElement("button");
        botaoCopiar.id = "btnCopiar";
        botaoCopiar.innerHTML = "📋 Copiar Resumo";
        botaoCopiar.onclick = copiarResumo;
        botaoCopiar.title = "Copiar resumo para área de transferência";
        botaoCopiar.style.background = "#34495e";
        
        topoDiv.appendChild(botaoExportar);
        topoDiv.appendChild(botaoImprimir);
        topoDiv.appendChild(botaoCopiar);
    }
}

// Adicionar botões extras automaticamente (opcional - descomente se quiser)
// document.addEventListener('DOMContentLoaded', adicionarBotoesExtras);