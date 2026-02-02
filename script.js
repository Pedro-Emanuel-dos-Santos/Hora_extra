// script.js - SISTEMA FINAL COM BOTÃO DE PREENCHIMENTO AUTOMÁTICO

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
// FUNÇÃO NOVA: PREENCHER HORÁRIOS PADRÃO
// ============================================
function preencherHorariosPadrao() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    
    if (linhas.length === 0) {
        alert("❌ Primeiro gere o calendário do mês!");
        return;
    }
    
    let diasPreenchidos = 0;
    
    linhas.forEach(linha => {
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6;
        
        if (!isFimDeSemana) {
            // Pegar os 4 inputs de horário desta linha
            const inputs = linha.querySelectorAll("input[type='time']");
            
            // Preencher com horários padrão da empresa
            inputs[0].value = "07:30"; // Entrada manhã
            inputs[1].value = "12:00"; // Saída manhã
            inputs[2].value = "13:30"; // Entrada tarde
            inputs[3].value = "18:00"; // Saída tarde
            
            // Destacar visualmente que foi preenchido
            linha.style.backgroundColor = "#e8f6f3";
            setTimeout(() => {
                linha.style.backgroundColor = "";
            }, 1000);
            
            diasPreenchidos++;
        }
    });
    
    // Calcular automaticamente após preencher
    setTimeout(() => {
        calcularMes();
    }, 100);
    
    // Mostrar mensagem de confirmação
    const mensagem = document.getElementById("mensagemPreenchimento");
    if (!mensagem) {
        const mensagemDiv = document.createElement("div");
        mensagemDiv.id = "mensagemPreenchimento";
        mensagemDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        mensagemDiv.innerHTML = `
            <strong>✅ Sucesso!</strong><br>
            Horários padrão preenchidos em ${diasPreenchidos} dias úteis.
            <br><small>07:30-12:00 e 13:30-18:00</small>
        `;
        document.body.appendChild(mensagemDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            mensagemDiv.style.animation = "slideOut 0.3s ease";
            setTimeout(() => {
                document.body.removeChild(mensagemDiv);
            }, 300);
        }, 5000);
    }
    
    // Adicionar animação CSS se não existir
    if (!document.querySelector('#animacoesPreenchimento')) {
        const style = document.createElement('style');
        style.id = 'animacoesPreenchimento';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// FUNÇÃO NOVA: LIMPAR TODOS OS HORÁRIOS
// ============================================
function limparHorarios() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    
    if (linhas.length === 0) {
        alert("❌ Não há horários para limpar!");
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
        linha.style.backgroundColor = "#fdedec";
        setTimeout(() => {
            linha.style.backgroundColor = "";
        }, 1000);
        
        diasLimpos++;
    });
    
    // Resetar resumo
    document.getElementById("totalHoras").innerText = "0";
    document.getElementById("totalExtrasDiarias").innerText = "0";
    document.getElementById("totalExtrasSemanais").innerText = "0";
    document.getElementById("totalFaltas").innerText = "0";
    document.getElementById("valorHora").innerText = "0.00";
    document.getElementById("valorExtras").innerText = "0.00";
    document.getElementById("valorDescontos").innerText = "0.00";
    document.getElementById("totalLiquido").innerText = "0.00";
    
    // Mostrar mensagem de confirmação
    const mensagem = document.getElementById("mensagemLimpeza");
    if (!mensagem) {
        const mensagemDiv = document.createElement("div");
        mensagemDiv.id = "mensagemLimpeza";
        mensagemDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        mensagemDiv.innerHTML = `
            <strong>🗑️ Horários Limpos!</strong><br>
            Todos os horários foram removidos (${diasLimpos} dias).
        `;
        document.body.appendChild(mensagemDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            mensagemDiv.style.animation = "slideOut 0.3s ease";
            setTimeout(() => {
                document.body.removeChild(mensagemDiv);
            }, 300);
        }, 5000);
    }
}

// ============================================
// FUNÇÃO ATUALIZADA: GERAR CALENDÁRIO
// ============================================
function gerarCalendario() {
    const mes = Number(document.getElementById("mes").value);
    const ano = Number(document.getElementById("ano").value);
    const tbody = document.getElementById("corpoTabela");

    // Validar mês e ano
    if (isNaN(mes) || isNaN(ano)) {
        alert("❌ Por favor, selecione um mês e ano válidos!");
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
        // (O usuário usará o botão para preencher)
        tr.innerHTML = `
            <td><strong>${dataFormatada}</strong></td>
            <td class="dia-semana" data-diasemana="${diaSemana}">${nomeDiaSemana.toUpperCase()}</td>
            <td><input type="time" class="entrada1"></td>
            <td><input type="time" class="saida1"></td>
            <td><input type="time" class="entrada2"></td>
            <td><input type="time" class="saida2"></td>
            <td class="trab">0.00</td>
            <td class="extra-diaria">0.00</td>
            <td class="extra-semanal">0.00</td>
            <td class="falta">0.00</td>
        `;

        tbody.appendChild(tr);
    }
    
    // Mostrar mensagem informativa
    const mensagem = document.getElementById("mensagemCalendario");
    if (!mensagem) {
        const mensagemDiv = document.createElement("div");
        mensagemDiv.id = "mensagemCalendario";
        mensagemDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        mensagemDiv.innerHTML = `
            <strong>📅 Calendário Gerado!</strong><br>
            ${diasMes} dias do mês criados.<br>
            <small>Use "Preencher Horários Padrão" para preencher automaticamente.</small>
        `;
        document.body.appendChild(mensagemDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            mensagemDiv.style.animation = "slideOut 0.3s ease";
            setTimeout(() => {
                document.body.removeChild(mensagemDiv);
            }, 300);
        }, 5000);
    }
    
    // Calcular automaticamente (vai mostrar zeros)
    calcularMes();
}

// ============================================
// FUNÇÃO ATUALIZADA: CALCULAR MÊS
// ============================================
function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const salario = Number(document.getElementById("salario").value) || 0;

    // Se não houver linhas, não calcular
    if (linhas.length === 0) {
        return;
    }

    // Variáveis para totais
    let totalHorasTrabalhadas = 0;
    let totalExtrasDiarias = 0;
    let totalExtrasSemanais = 0;
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
            const jornadaSemanalLegal = 44.0;
            
            if (semanas[semanaAtual] && semanas[semanaAtual].total > jornadaSemanalLegal) {
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
// FUNÇÕES AUXILIARES (MANTIDAS)
// ============================================

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

function resetarCelulasCalculo(linha) {
    linha.querySelector(".extra-diaria").innerText = "0.00";
    linha.querySelector(".extra-semanal").innerText = "0.00";
    linha.querySelector(".falta").innerText = "0.00";
}

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

function diferencaHoras(inicio, fim) {
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    
    let minutosTrabalhados = 0;
    
    if (h2 < h1 || (h2 === h1 && m2 < m1)) {
        minutosTrabalhados = ((h2 + 24) * 60 + m2) - (h1 * 60 + m1);
    } else {
        minutosTrabalhados = (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    
    return Math.round((minutosTrabalhados / 60) * 100) / 100;
}

function atualizarResumo(salario, totalHoras, extrasDiarias, extrasSemanais, faltas) {
    const valorHora = salario > 0 ? salario / 220 : 0;
    const valorTotalExtras = extrasSemanais * valorHora * 1.5;
    const valorTotalDescontos = faltas * valorHora;
    const totalLiquido = salario + valorTotalExtras - valorTotalDescontos;
    
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2);
    document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2);
    document.getElementById("totalExtrasSemanais").innerText = extrasSemanais.toFixed(2);
    document.getElementById("totalFaltas").innerText = faltas.toFixed(2);
    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
    document.getElementById("valorExtras").innerText = valorTotalExtras.toFixed(2);
    document.getElementById("valorDescontos").innerText = valorTotalDescontos.toFixed(2);
    document.getElementById("totalLiquido").innerText = totalLiquido.toFixed(2);
}

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================
window.onload = function() {
    preencherSelects();
    
    setTimeout(() => {
        gerarCalendario();
        document.getElementById("salario").value = "2500";
    }, 100);
};

// ============================================
// FUNÇÃO PREENCHER SELECTS (MANTIDA)
// ============================================
function preencherSelects() {
    const mes = document.getElementById("mes");
    const ano = document.getElementById("ano");

    mes.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const nomeMes = new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' });
        mes.innerHTML += `<option value="${i}">${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</option>`;
    }

    const anoAtual = new Date().getFullYear();
    ano.innerHTML = '';
    for (let i = anoAtual - 1; i <= anoAtual + 2; i++) {
        ano.innerHTML += `<option value="${i}">${i}</option>`;
    }

    mes.value = new Date().getMonth();
    ano.value = anoAtual;
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('change', function(e) {
        if (e.target.type === 'time' || e.target.id === 'salario') {
            setTimeout(() => {
                if (document.querySelectorAll('#corpoTabela tr').length > 0) {
                    calcularMes();
                }
            }, 300);
        }
    });
});