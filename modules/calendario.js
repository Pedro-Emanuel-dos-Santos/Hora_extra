// ============================================
// MÓDULO: CALENDÁRIO E CONTROLE DE DIAS
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
        const nomeMes = getNomeMes(i);
        mesSelect.innerHTML += `<option value="${i}">${nomeMes}</option>`;
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
 * Gera o calendário do mês selecionado
 */
function gerarCalendario() {
    const { mes, ano } = getDadosAtuais();
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

        // Criar HTML da linha da tabela
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

/**
 * Exporta funções do módulo
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        preencherSelects,
        gerarCalendario,
        preencherHorariosPadrao,
        limparHorarios
    };
}