// ============================================
// MÓDULO: CALENDÁRIO E CONTROLE DE DIAS
// ============================================

/**
 * Preenche os selects de mês e ano com valores
 */
function preencherSelects() {
    const mesSelect = document.getElementById("mes");
    const anoSelect = document.getElementById("ano");
    const temaSelect = document.getElementById("tema");

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
    
    // Configurar evento para tema
    temaSelect.addEventListener('change', function() {
        mudarTema(this.value);
    });
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
        const diaAbreviado = getDiaAbreviado(diaSemana);
        
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

        // Adicionar atributos para controle
        tr.setAttribute('data-dia', dia);
        tr.setAttribute('data-mes', mes);
        tr.setAttribute('data-ano', ano);

        // Criar HTML da linha da tabela
        tr.innerHTML = `
            <td>
                <strong>${dataFormatada}</strong>
                <div class="dia-numero">${dia}</div>
            </td>
            <td class="dia-semana" data-diasemana="${diaSemana}">
                <span class="dia-abreviado">${diaAbreviado}</span>
                <span class="dia-completo">${nomeDiaSemana.toUpperCase()}</span>
            </td>
            <td><input type="time" class="entrada1" onchange="validarHorario(this)"></td>
            <td><input type="time" class="saida1" onchange="validarHorario(this)"></td>
            <td><input type="time" class="entrada2" onchange="validarHorario(this)"></td>
            <td><input type="time" class="saida2" onchange="validarHorario(this)"></td>
            <td class="trab">0.00</td>
            <td class="extra-diaria">0.00</td>
            <td class="extra-semanal">0.00</td>
            <td class="falta">0.00</td>
            <td class="desconto-dia">R$ 0,00</td>
        `;

        tbody.appendChild(tr);
    }
    
    // Mostrar mensagem informativa
    const diasUteis = calcularDiasUteisNoMes(mes, ano);
    const horasEsperadas = diasUteis * 8;
    
    mostrarMensagem(`📅 Calendário gerado com ${diasMes} dias (${diasUteis} úteis)!<br><small>Horas esperadas: ${horasEsperadas}h | Use "Preencher Horários" para preencher automaticamente.</small>`, "success");
    
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
            destaqueLinha(linha, "success");
            
            diasPreenchidos++;
        }
    });
    
    // Calcular automaticamente após preencher
    setTimeout(() => calcularMes(), 300);
    
    // Mostrar mensagem de confirmação
    mostrarMensagem(`✅ Horários padrão preenchidos em ${diasPreenchidos} dias úteis!<br><small>07:30-12:00 e 13:30-18:00</small>`, "success");
}

/**
 * Limpa todos os horários da tabela (com modal de confirmação)
 */
function limparHorariosComModal() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há horários para limpar!", "error");
        return;
    }
    
    mostrarModal({
        titulo: 'Limpar Horários',
        mensagem: 'Tem certeza que deseja limpar TODOS os horários?<br><small>Esta ação não pode ser desfeita.</small>',
        tipo: 'warning',
        confirmarTexto: 'Sim, Limpar Tudo',
        cancelarTexto: 'Cancelar',
        onConfirmar: () => {
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
                linha.querySelector(".desconto-dia").innerText = "R$ 0,00";
                
                // Destacar visualmente que foi limpo
                destaqueLinha(linha, "error");
                
                diasLimpos++;
            });
            
            // Resetar resumo
            resetarResumo();
            
            // Mostrar mensagem de confirmação
            mostrarMensagem(`🗑️ Todos os horários foram limpos! (${diasLimpos} dias)`, "warning");
        },
        onCancelar: () => {
            mostrarMensagem("✅ Ação cancelada!", "info");
        }
    });
}

// Versão original para compatibilidade
function limparHorarios() {
    limparHorariosComModal();
}