// ============================================
// SISTEMA DE CONTROLE DE HORAS - RH
// Versão com Extra 50% e 100%
// ============================================

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

function preencherSelects() {
    const mesSelect = document.getElementById("mes");
    const anoSelect = document.getElementById("ano");

    mesSelect.innerHTML = '';
    anoSelect.innerHTML = '';

    for (let i = 0; i < 12; i++) {
        const data = new Date(2024, i, 1);
        const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long' });
        const nomeMesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
        mesSelect.innerHTML += `<option value="${i}">${nomeMesFormatado}</option>`;
    }

    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 1; i <= anoAtual + 2; i++) {
        anoSelect.innerHTML += `<option value="${i}">${i}</option>`;
    }

    mesSelect.value = new Date().getMonth();
    anoSelect.value = anoAtual;
}

window.onload = function() {
    preencherSelects();
    
    setTimeout(() => {
        gerarCalendario();
        document.getElementById("salario").value = "2500";
    }, 100);
};

// ============================================
// 2. CONTROLE DO CALENDÁRIO
// ============================================

function gerarCalendario() {
    const mes = Number(document.getElementById("mes").value);
    const ano = Number(document.getElementById("ano").value);
    const tbody = document.getElementById("corpoTabela");

    if (isNaN(mes) || isNaN(ano)) {
        mostrarMensagem("❌ Por favor, selecione um mês e ano válidos!", "error");
        return;
    }

    tbody.innerHTML = "";

    const diasMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasMes; dia++) {
        const data = new Date(ano, mes, dia);
        const diaSemana = data.getDay();
        const nomeDiaSemana = diasSemana[diaSemana];
        
        const dataFormatada = dia.toString().padStart(2, '0') + '/' + 
                             (mes + 1).toString().padStart(2, '0') + '/' + 
                             ano;

        const tr = document.createElement("tr");

        if (diaSemana === 0) {
            tr.classList.add("domingo");
        } else if (diaSemana === 6) {
            tr.classList.add("sabado");
        }

        tr.innerHTML = `
            <td><strong>${dataFormatada}</strong></td>
            <td class="dia-semana" data-diasemana="${diaSemana}">${nomeDiaSemana.toUpperCase()}</td>
            <td><input type="time" class="entrada1" onchange="validarHorario(this)"></td>
            <td><input type="time" class="saida1" onchange="validarHorario(this)"></td>
            <td><input type="time" class="entrada2" onchange="validarHorario(this)"></td>
            <td><input type="time" class="saida2" onchange="validarHorario(this)"></td>
            <td class="trab">0.00</td>
            <td class="extra-diaria">0.00</td>
            <td class="extra-50">0.00</td>
            <td class="extra-100">0.00</td>
            <td class="falta">0.00</td>
        `;

        tbody.appendChild(tr);
    }
    
    mostrarMensagem(`📅 Calendário gerado com ${diasMes} dias!<br><small>Use "Preencher Horários Padrão" para preencher automaticamente.</small>`, "info");
    
    setTimeout(() => calcularMes(), 500);
}

// ============================================
// 3. FUNÇÕES DE PREENCHIMENTO AUTOMÁTICO
// ============================================

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
        
        if (!isFimDeSemana) {
            const inputs = linha.querySelectorAll("input[type='time']");
            
            inputs[0].value = "07:30";
            inputs[1].value = "12:00";
            inputs[2].value = "13:30";
            inputs[3].value = "18:00";
            
            destaqueLinha(linha, "#e8f6f3");
            
            diasPreenchidos++;
        }
    });
    
    setTimeout(() => calcularMes(), 300);
    
    mostrarMensagem(`✅ Horários padrão preenchidos em ${diasPreenchidos} dias úteis!<br><small>07:30-12:00 e 13:30-18:00</small>`, "success");
}

function limparHorarios() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há horários para limpar!", "error");
        return;
    }
    
    if (!confirm("⚠️ Tem certeza que deseja limpar TODOS os horários?\nIsso não pode ser desfeito.")) {
        return;
    }
    
    let diasLimpos = 0;
    
    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input[type='time']");
        
        inputs.forEach(input => {
            input.value = "";
        });
        
        linha.querySelector(".trab").innerText = "0.00";
        linha.querySelector(".extra-diaria").innerText = "0.00";
        linha.querySelector(".extra-50").innerText = "0.00";
        linha.querySelector(".extra-100").innerText = "0.00";
        linha.querySelector(".falta").innerText = "0.00";
        
        destaqueLinha(linha, "#fdedec");
        
        diasLimpos++;
    });
    
    resetarResumo();
    
    mostrarMensagem(`🗑️ Todos os horários foram limpos! (${diasLimpos} dias)`, "warning");
}

// ============================================
// 4. CÁLCULO PRINCIPAL DO MÊS (ATUALIZADO)
// ============================================

function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const salario = Number(document.getElementById("salario").value) || 0;

    if (linhas.length === 0) {
        return;
    }

    let totalHorasTrabalhadas = 0;
    let totalExtrasDiarias = 0;
    let totalExtras50 = 0;
    let totalExtras100 = 0;
    let totalFaltas = 0;
    
    let semanaAtual = 1;
    const semanas = {};
    let horasSemana = 0;
    let diasUteisSemana = 0;

    linhas.forEach((linha, index) => {
        const inputs = linha.querySelectorAll("input");
        const diaSemana = parseInt(linha.querySelector(".dia-semana").getAttribute("data-diasemana"));
        const isDomingo = diaSemana === 0;
        const isSabado = diaSemana === 6;
        const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
        
        let horasTrabalhadas = calcularHorasDia(inputs);
        horasTrabalhadas = Math.round(horasTrabalhadas * 100) / 100;
        
        linha.querySelector(".trab").innerText = horasTrabalhadas.toFixed(2);
        
        resetarCelulasCalculo(linha);
        
        // Iniciar nova semana no domingo
        if (diaSemana === 0 || index === 0) {
            if (!semanas[semanaAtual]) {
                semanas[semanaAtual] = { total: 0, horas50: 0, horas100: 0 };
            }
            horasSemana = 0;
            diasUteisSemana = 0;
        }
        
        if (isDomingo) {
            // DOMINGO: TUDO é extra 100%
            if (horasTrabalhadas > 0) {
                linha.querySelector(".extra-100").innerText = horasTrabalhadas.toFixed(2);
                totalExtras100 += horasTrabalhadas;
                if (semanas[semanaAtual]) {
                    semanas[semanaAtual].horas100 += horasTrabalhadas;
                }
            }
        } 
        else if (isSabado) {
            // SÁBADO: Regras especiais
            const jornadaDiaria = 4.0; // Sábado normalmente é 4h
            
            if (horasTrabalhadas > jornadaDiaria) {
                const extraSabado = horasTrabalhadas - jornadaDiaria;
                
                // Verificar se já passou das 44h semanais
                horasSemana += horasTrabalhadas;
                if (horasSemana > 44) {
                    // Acima de 44h: extra 100%
                    const acima44 = Math.min(extraSabado, horasSemana - 44);
                    if (acima44 > 0) {
                        linha.querySelector(".extra-100").innerText = acima44.toFixed(2);
                        totalExtras100 += acima44;
                        if (semanas[semanaAtual]) {
                            semanas[semanaAtual].horas100 += acima44;
                        }
                    }
                    
                    // O restante é extra 50%
                    const restante = extraSabado - acima44;
                    if (restante > 0) {
                        linha.querySelector(".extra-50").innerText = restante.toFixed(2);
                        totalExtras50 += restante;
                        if (semanas[semanaAtual]) {
                            semanas[semanaAtual].horas50 += restante;
                        }
                    }
                } else {
                    // Abaixo de 44h: extra 50%
                    linha.querySelector(".extra-50").innerText = extraSabado.toFixed(2);
                    totalExtras50 += extraSabado;
                    if (semanas[semanaAtual]) {
                        semanas[semanaAtual].horas50 += extraSabado;
                    }
                }
                
                horasSemana += horasTrabalhadas;
            } else if (horasTrabalhadas < jornadaDiaria && horasTrabalhadas > 0) {
                const faltaDia = jornadaDiaria - horasTrabalhadas;
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                totalFaltas += faltaDia;
            }
        }
        else if (isDiaUtil) {
            // DIAS ÚTEIS (Segunda a Sexta)
            if (!semanas[semanaAtual]) {
                semanas[semanaAtual] = { total: 0, horas50: 0, horas100: 0 };
            }
            
            semanas[semanaAtual].total += horasTrabalhadas;
            horasSemana += horasTrabalhadas;
            diasUteisSemana++;
            
            const jornadaDiaria = 8.0;
            
            if (horasTrabalhadas > jornadaDiaria) {
                const extraDiaria = horasTrabalhadas - jornadaDiaria;
                
                // Verificar se já passou das 44h semanais
                if (horasSemana > 44) {
                    // Acima de 44h: extra 100%
                    const acima44 = Math.min(extraDiaria, horasSemana - 44);
                    if (acima44 > 0) {
                        linha.querySelector(".extra-100").innerText = acima44.toFixed(2);
                        totalExtras100 += acima44;
                        semanas[semanaAtual].horas100 += acima44;
                    }
                    
                    // O restante vai para banco (será pago como extra 50% no fim da semana)
                    const restante = extraDiaria - acima44;
                    if (restante > 0) {
                        linha.querySelector(".extra-diaria").innerText = restante.toFixed(2);
                        totalExtrasDiarias += restante;
                    }
                } else {
                    // Abaixo de 44h: vai para banco
                    linha.querySelector(".extra-diaria").innerText = extraDiaria.toFixed(2);
                    totalExtrasDiarias += extraDiaria;
                }
            } else if (horasTrabalhadas < jornadaDiaria && horasTrabalhadas > 0) {
                const faltaDia = jornadaDiaria - horasTrabalhadas;
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                totalFaltas += faltaDia;
            }
        }
        
        // FIM DA SEMANA - Calcular distribuição das horas do banco
        if (diaSemana === 6 || index === linhas.length - 1) {
            const jornadaSemanalLegal = 44.0;
            
            if (semanas[semanaAtual] && semanas[semanaAtual].total > jornadaSemanalLegal) {
                const extraSemanalTotal = semanas[semanaAtual].total - jornadaSemanalLegal;
                const horasBancoParaPagar = Math.min(totalExtrasDiarias, extraSemanalTotal);
                
                if (horasBancoParaPagar > 0 && diasUteisSemana > 0) {
                    const extraPorDia = horasBancoParaPagar / diasUteisSemana;
                    
                    // Encontrar dias úteis desta semana e distribuir as horas como extra 50%
                    const inicioSemana = Math.max(0, index - 6);
                    for (let i = inicioSemana; i <= index; i++) {
                        if (i < linhas.length) {
                            const diaSemanaI = parseInt(linhas[i].querySelector(".dia-semana").getAttribute("data-diasemana"));
                            if (diaSemanaI >= 1 && diaSemanaI <= 5) {
                                const extraAtual = parseFloat(linhas[i].querySelector(".extra-50").innerText) || 0;
                                linhas[i].querySelector(".extra-50").innerText = (extraAtual + extraPorDia).toFixed(2);
                            }
                        }
                    }
                    
                    totalExtras50 += horasBancoParaPagar;
                    totalExtrasDiarias -= horasBancoParaPagar;
                    
                    // Atualizar totais da semana
                    semanas[semanaAtual].horas50 += horasBancoParaPagar;
                }
            }
            
            semanaAtual++;
        }
        
        totalHorasTrabalhadas += horasTrabalhadas;
    });
    
    atualizarResumo(salario, totalHorasTrabalhadas, totalExtrasDiarias, totalExtras50, totalExtras100, totalFaltas);
}

// ============================================
// 5. FUNÇÕES AUXILIARES DE CÁLCULO
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

function resetarCelulasCalculo(linha) {
    linha.querySelector(".extra-diaria").innerText = "0.00";
    linha.querySelector(".extra-50").innerText = "0.00";
    linha.querySelector(".extra-100").innerText = "0.00";
    linha.querySelector(".falta").innerText = "0.00";
}

// ============================================
// 6. ATUALIZAÇÃO DA INTERFACE
// ============================================

function atualizarResumo(salario, totalHoras, extrasDiarias, extras50, extras100, faltas) {
    const valorHora = salario > 0 ? salario / 220 : 0;
    
    // Cálculo dos valores
    const valorExtras50 = extras50 * valorHora * 1.5;    // 50% adicional
    const valorExtras100 = extras100 * valorHora * 2.0;  // 100% adicional
    const valorTotalExtras = valorExtras50 + valorExtras100;
    const valorTotalDescontos = faltas * valorHora;
    const totalLiquido = salario + valorTotalExtras - valorTotalDescontos;
    
    // Atualizar elementos HTML
    document.getElementById("totalHoras").innerText = totalHoras.toFixed(2);
    document.getElementById("totalExtrasDiarias").innerText = extrasDiarias.toFixed(2);
    document.getElementById("totalExtras50").innerText = extras50.toFixed(2);
    document.getElementById("totalExtras100").innerText = extras100.toFixed(2);
    document.getElementById("totalFaltas").innerText = faltas.toFixed(2);
    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
    document.getElementById("valorExtras50").innerText = valorExtras50.toFixed(2);
    document.getElementById("valorExtras100").innerText = valorExtras100.toFixed(2);
    document.getElementById("valorDescontos").innerText = valorTotalDescontos.toFixed(2);
    document.getElementById("totalLiquido").innerText = totalLiquido.toFixed(2);
    
    // Atualizar título das colunas de valor
    document.querySelector('p:has(#valorExtras50)').innerHTML = `Valor Extras 50%: R$ <span id="valorExtras50">${valorExtras50.toFixed(2)}</span>`;
    document.querySelector('p:has(#valorExtras100)').innerHTML = `Valor Extras 100%: R$ <span id="valorExtras100">${valorExtras100.toFixed(2)}</span>`;
}

function resetarResumo() {
    document.getElementById("totalHoras").innerText = "0";
    document.getElementById("totalExtrasDiarias").innerText = "0";
    document.getElementById("totalExtras50").innerText = "0";
    document.getElementById("totalExtras100").innerText = "0";
    document.getElementById("totalFaltas").innerText = "0";
    document.getElementById("valorHora").innerText = "0.00";
    document.getElementById("valorExtras50").innerText = "0.00";
    document.getElementById("valorExtras100").innerText = "0.00";
    document.getElementById("valorDescontos").innerText = "0.00";
    document.getElementById("totalLiquido").innerText = "0.00";
}

// ============================================
// 7. FUNÇÕES DE UTILITÁRIAS
// ============================================

function validarHorario(input) {
    const valor = input.value;
    if (!valor) return;
    
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(valor)) {
        input.style.borderColor = "#e74c3c";
        input.style.boxShadow = "0 0 0 3px rgba(231, 76, 60, 0.2)";
        return;
    }
    
    input.style.borderColor = "#27ae60";
    input.style.boxShadow = "0 0 0 3px rgba(39, 174, 96, 0.2)";
    
    setTimeout(() => {
        input.style.borderColor = "";
        input.style.boxShadow = "";
    }, 1000);
    
    setTimeout(() => calcularMes(), 300);
}

function destaqueLinha(linha, cor) {
    linha.style.backgroundColor = cor;
    linha.style.transition = "background-color 0.5s";
    
    setTimeout(() => {
        linha.style.backgroundColor = "";
    }, 1000);
}

function mostrarMensagem(texto, tipo = "info") {
    const mensagemAnterior = document.getElementById("mensagemFlutuante");
    if (mensagemAnterior) {
        document.body.removeChild(mensagemAnterior);
    }
    
    const cores = {
        success: "#27ae60",
        error: "#e74c3c",
        warning: "#f39c12",
        info: "#3498db"
    };
    
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
    
    document.body.appendChild(mensagemDiv);
    
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

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('change', function(e) {
        if (e.target.type === 'time') {
            setTimeout(() => {
                if (document.querySelectorAll('#corpoTabela tr').length > 0) {
                    calcularMes();
                }
            }, 300);
        }
    });
    
    document.getElementById('salario')?.addEventListener('input', function() {
        setTimeout(() => {
            if (document.querySelectorAll('#corpoTabela tr').length > 0) {
                calcularMes();
            }
        }, 500);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            gerarCalendario();
        }
        
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            preencherHorariosPadrao();
        }
        
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            calcularMes();
        }
    });
});

// ============================================
// 9. FUNÇÕES ADICIONAIS (OPCIONAIS)
// ============================================

function exportarParaCSV() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    let csv = "Data;Dia;Entrada1;Saida1;Entrada2;Saida2;Trabalhado;ExtraBanco;Extra50%;Extra100%;Falta\n";
    
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        const dados = [];
        
        colunas.forEach((coluna, index) => {
            if (index === 2 || index === 3 || index === 4 || index === 5) {
                const input = coluna.querySelector("input");
                dados.push(input ? input.value : "");
            } else {
                dados.push(coluna.innerText.trim());
            }
        });
        
        csv += dados.join(";") + "\n";
    });
    
    csv += "\nRESUMO\n";
    csv += `Total Horas Trabalhadas;${document.getElementById("totalHoras").innerText}\n`;
    csv += `Extras Diárias (Banco);${document.getElementById("totalExtrasDiarias").innerText}\n`;
    csv += `Extras 50%;${document.getElementById("totalExtras50").innerText}\n`;
    csv += `Extras 100%;${document.getElementById("totalExtras100").innerText}\n`;
    csv += `Horas Faltantes;${document.getElementById("totalFaltas").innerText}\n`;
    csv += `Valor Hora;R$ ${document.getElementById("valorHora").innerText}\n`;
    csv += `Valor Extras 50%;R$ ${document.getElementById("valorExtras50").innerText}\n`;
    csv += `Valor Extras 100%;R$ ${document.getElementById("valorExtras100").innerText}\n`;
    csv += `Descontos;R$ ${document.getElementById("valorDescontos").innerText}\n`;
    csv += `Total Líquido;R$ ${document.getElementById("totalLiquido").innerText}\n`;
    
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

function imprimirRelatorio() {
    window.print();
}

function copiarResumo() {
    const resumo = `
RESUMO MENSAL - CONTROLE DE HORAS
===================================
Total Horas Trabalhadas: ${document.getElementById("totalHoras").innerText} h
Extras Diárias (Banco): ${document.getElementById("totalExtrasDiarias").innerText} h
Extras 50% (Dias Úteis): ${document.getElementById("totalExtras50").innerText} h
Extras 100% (Fins de Semana): ${document.getElementById("totalExtras100").innerText} h
Horas Faltantes: ${document.getElementById("totalFaltas").innerText} h
Valor Hora: R$ ${document.getElementById("valorHora").innerText}
Valor Extras 50%: R$ ${document.getElementById("valorExtras50").innerText}
Valor Extras 100%: R$ ${document.getElementById("valorExtras100").innerText}
Descontos: R$ ${document.getElementById("valorDescontos").innerText}
Total Líquido: R$ ${document.getElementById("totalLiquido").innerText}
===================================
Gerado em: ${new Date().toLocaleDateString('pt-BR')}
    `;
    
    navigator.clipboard.writeText(resumo)
        .then(() => mostrarMensagem("📋 Resumo copiado para a área de transferência!", "success"))
        .catch(() => mostrarMensagem("❌ Erro ao copiar para área de transferência", "error"));
}