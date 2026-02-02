// ============================================
// SISTEMA DE CONTROLE DE HORAS - RH
// Versão Final com Preenchimento Automático e Exportação PDF
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
        
        // Ctrl + E = Exportar PDF
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportarPDFMenu();
        }
    });
});

// ============================================
// 9. EXPORTAÇÃO DE DADOS (CSV E IMPRESSÃO)
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
// 10. EXPORTAÇÃO PARA PDF
// ============================================

/**
 * Exporta o relatório completo para PDF (versão com imagem)
 */
async function exportarParaPDF() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    // Mostrar mensagem de processamento
    mostrarMensagem("⏳ Gerando PDF... Aguarde!", "info");
    
    try {
        // Criar um elemento temporário para o PDF
        const pdfContainer = document.createElement("div");
        pdfContainer.id = "pdf-container";
        pdfContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: -9999px;
            width: 794px;
            background: white;
            padding: 40px;
            font-family: 'Arial', sans-serif;
        `;
        
        // Adicionar cabeçalho
        const mes = document.getElementById("mes").selectedOptions[0]?.text || "Mês";
        const ano = document.getElementById("ano").value || "Ano";
        
        pdfContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 15px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📅 CONTROLE MENSAL DE HORAS - RH</h1>
                <h2 style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 18px;">${mes.toUpperCase()} de ${ano}</h2>
                <p style="color: #95a5a6; margin: 5px 0; font-size: 14px;">
                    Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2c3e50; background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 16px;">
                    📊 DADOS DO FUNCIONÁRIO
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <strong>Salário Base:</strong> R$ ${document.getElementById("salario").value || "0,00"}
                    </div>
                    <div>
                        <strong>Valor Hora:</strong> R$ ${document.getElementById("valorHora").innerText}
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar a tabela
        const tabelaClone = document.querySelector(".tabela-container").cloneNode(true);
        
        // Ajustar estilos para PDF
        tabelaClone.style.width = "100%";
        tabelaClone.style.fontSize = "10px";
        tabelaClone.style.marginBottom = "20px";
        
        // Ajustar tabela
        const tabela = tabelaClone.querySelector("table");
        tabela.style.minWidth = "auto";
        tabela.style.width = "100%";
        tabela.style.borderCollapse = "collapse";
        
        // Ajustar células
        const ths = tabela.querySelectorAll("th");
        ths.forEach(th => {
            th.style.padding = "8px 6px";
            th.style.fontSize = "10px";
        });
        
        const tds = tabela.querySelectorAll("td");
        tds.forEach(td => {
            td.style.padding = "6px 4px";
            td.style.fontSize = "9px";
            td.style.border = "1px solid #ddd";
        });
        
        // Substituir inputs por texto
        const inputs = tabela.querySelectorAll("input[type='time']");
        inputs.forEach(input => {
            const parent = input.parentNode;
            parent.innerHTML = input.value || "-";
            parent.style.textAlign = "center";
        });
        
        pdfContainer.appendChild(tabelaClone);
        
        // Adicionar resumo
        const resumoClone = document.querySelector(".resumo").cloneNode(true);
        resumoClone.style.background = "none";
        resumoClone.style.border = "1px solid #ddd";
        resumoClone.style.padding = "15px";
        resumoClone.style.marginTop = "20px";
        
        // Remover estilos dos spans
        const spans = resumoClone.querySelectorAll("span");
        spans.forEach(span => {
            span.style.background = "none";
            span.style.color = "#2c3e50";
            span.style.padding = "0";
        });
        
        pdfContainer.appendChild(resumoClone);
        
        // Adicionar rodapé
        const rodape = document.createElement("div");
        rodape.style.marginTop = "30px";
        rodape.style.paddingTop = "15px";
        rodape.style.borderTop = "1px solid #eee";
        rodape.style.textAlign = "center";
        rodape.style.color = "#95a5a6";
        rodape.style.fontSize = "11px";
        rodape.innerHTML = `
            <p>Sistema de Controle de Horas - RH | Desenvolvido para gestão de ponto eletrônico</p>
            <p>Horas extras calculadas conforme legislação: 50% adicional para extras e 100% para domingos/feriados</p>
        `;
        
        pdfContainer.appendChild(rodape);
        
        // Adicionar ao body temporariamente
        document.body.appendChild(pdfContainer);
        
        // Usar html2canvas para capturar o conteúdo
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        });
        
        // Remover container temporário
        document.body.removeChild(pdfContainer);
        
        // Configurar PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Dimensões A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Calcular proporção da imagem
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Adicionar imagem ao PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Verificar se precisa de múltiplas páginas
        let yPos = 10;
        let remainingHeight = imgHeight;
        
        while (remainingHeight > 0) {
            const height = Math.min(remainingHeight, pdfHeight - 20);
            
            pdf.addImage(imgData, 'JPEG', 10, yPos, imgWidth, height, undefined, 'FAST');
            
            remainingHeight -= height;
            yPos = 0;
            
            if (remainingHeight > 0) {
                pdf.addPage();
            }
        }
        
        // Salvar o PDF
        pdf.save(`controle_horas_${mes.toLowerCase()}_${ano}.pdf`);
        
        mostrarMensagem("✅ PDF gerado com sucesso!", "success");
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        mostrarMensagem("❌ Erro ao gerar PDF: " + error.message, "error");
    }
}

/**
 * Versão alternativa mais simples de PDF (apenas dados tabulares)
 */
function exportarParaPDFSimples() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    // Cabeçalho
    const mes = document.getElementById("mes").selectedOptions[0]?.text || "Mês";
    const ano = document.getElementById("ano").value || "Ano";
    
    pdf.setFontSize(18);
    pdf.setTextColor(44, 62, 80);
    pdf.text("📅 CONTROLE MENSAL DE HORAS - RH", 15, 15);
    
    pdf.setFontSize(12);
    pdf.setTextColor(127, 140, 141);
    pdf.text(`${mes.toUpperCase()} de ${ano}`, 15, 22);
    
    // Data de geração
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pdf.internal.pageSize.getWidth() - 50, 22);
    
    // Dados do funcionário
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Salário Base: R$ ${document.getElementById("salario").value || "0,00"}`, 15, 32);
    pdf.text(`Valor Hora: R$ ${document.getElementById("valorHora").innerText}`, 15, 38);
    
    // Cabeçalho da tabela
    const colunas = ["Data", "Dia", "Ent1", "Sai1", "Ent2", "Sai2", "Trab", "ExtB", "ExtP", "Falta"];
    const colWidths = [25, 25, 20, 20, 20, 20, 20, 20, 20, 20];
    
    let y = 50;
    
    // Desenhar cabeçalho da tabela
    pdf.setFillColor(44, 62, 80);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    
    let x = 10;
    colunas.forEach((coluna, i) => {
        pdf.rect(x, y - 8, colWidths[i], 8, 'F');
        pdf.text(coluna, x + 2, y - 3);
        x += colWidths[i];
    });
    
    // Dados da tabela
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const linhas = document.querySelectorAll("#corpoTabela tr");
    let linhaAtual = 0;
    
    linhas.forEach((linha, index) => {
        if (y > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            y = 20;
            
            // Redesenhar cabeçalho
            pdf.setFillColor(44, 62, 80);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont(undefined, 'bold');
            
            x = 10;
            colunas.forEach((coluna, i) => {
                pdf.rect(x, y - 8, colWidths[i], 8, 'F');
                pdf.text(coluna, x + 2, y - 3);
                x += colWidths[i];
            });
            
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(0, 0, 0);
            y += 8;
        }
        
        const colunasLinha = linha.querySelectorAll("td");
        const dados = [];
        
        colunasLinha.forEach((coluna, colIndex) => {
            if (colIndex === 2 || colIndex === 3 || colIndex === 4 || colIndex === 5) {
                // Inputs de horário
                const input = coluna.querySelector("input");
                dados.push(input ? input.value : "-");
            } else {
                // Texto normal
                dados.push(coluna.innerText.trim());
            }
        });
        
        // Destacar fins de semana
        const diaSemana = parseInt(linha.querySelector(".dia-semana")?.getAttribute("data-diasemana") || 0);
        
        if (diaSemana === 0) {
            pdf.setFillColor(255, 245, 245);
            pdf.rect(10, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
            pdf.setTextColor(220, 53, 69);
        } else if (diaSemana === 6) {
            pdf.setFillColor(255, 249, 230);
            pdf.rect(10, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
            pdf.setTextColor(253, 126, 20);
        } else {
            pdf.setTextColor(0, 0, 0);
        }
        
        // Desenhar dados
        x = 10;
        dados.forEach((dado, i) => {
            pdf.text(dado.toString(), x + 2, y + 5);
            x += colWidths[i];
        });
        
        y += 8;
        linhaAtual++;
    });
    
    // Resumo
    y += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'bold');
    pdf.text("📊 RESUMO MENSAL", 15, y);
    
    pdf.setFont(undefined, 'normal');
    y += 8;
    pdf.text(`Total Horas Trabalhadas: ${document.getElementById("totalHoras").innerText} h`, 20, y);
    y += 6;
    pdf.text(`Extras Diárias (Banco): ${document.getElementById("totalExtrasDiarias").innerText} h`, 20, y);
    y += 6;
    pdf.setTextColor(230, 126, 34);
    pdf.text(`Extras Semanais (Pagas): ${document.getElementById("totalExtrasSemanais").innerText} h`, 20, y);
    y += 6;
    pdf.setTextColor(231, 76, 60);
    pdf.text(`Horas Faltantes: ${document.getElementById("totalFaltas").innerText} h`, 20, y);
    y += 6;
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Valor Hora: R$ ${document.getElementById("valorHora").innerText}`, 20, y);
    y += 6;
    pdf.setTextColor(46, 204, 113);
    pdf.text(`Valor Extras: R$ ${document.getElementById("valorExtras").innerText}`, 20, y);
    y += 6;
    pdf.setTextColor(192, 57, 43);
    pdf.text(`Descontos: R$ ${document.getElementById("valorDescontos").innerText}`, 20, y);
    y += 8;
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text(`TOTAL LÍQUIDO: R$ ${document.getElementById("totalLiquido").innerText}`, 20, y);
    
    // Rodapé
    pdf.setFontSize(9);
    pdf.setTextColor(149, 165, 166);
    pdf.text("Sistema de Controle de Horas - RH | Documento gerado automaticamente", 
              pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, 
              { align: 'center' });
    
    // Salvar PDF
    pdf.save(`controle_horas_${mes.toLowerCase()}_${ano}_simples.pdf`);
    mostrarMensagem("✅ PDF gerado com sucesso (versão simples)!", "success");
}

/**
 * Menu para escolher tipo de PDF
 */
function exportarPDFMenu() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    const html = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px; color: #2c3e50;">📄 Exportar para PDF</h3>
            <p style="margin-bottom: 15px;">Escolha o formato desejado:</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="btnPdfCompleto" style="padding: 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: left;">
                    <strong>📋 PDF Completo</strong><br>
                    <small>Imagem fiel da tela (recomendado para poucos dias)</small>
                </button>
                <button id="btnPdfSimples" style="padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: left;">
                    <strong>📊 PDF Simples</strong><br>
                    <small>Dados tabulares (rápido e leve para muitos dias)</small>
                </button>
            </div>
        </div>
    `;
    
    // Criar modal
    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 0;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    modalContent.innerHTML = html;
    modal.appendChild(modalContent);
    
    // Botão fechar
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #7f8c8d;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    modalContent.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // Adicionar eventos aos botões
    setTimeout(() => {
        document.getElementById("btnPdfCompleto").onclick = function() {
            document.body.removeChild(modal);
            exportarParaPDF();
        };
        
        document.getElementById("btnPdfSimples").onclick = function() {
            document.body.removeChild(modal);
            exportarParaPDFSimples();
        };
    }, 100);
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// ============================================
// 11. FUNÇÕES ADICIONAIS DE CONVENIÊNCIA
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