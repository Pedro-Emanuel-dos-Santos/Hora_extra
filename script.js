// script.js - VERSÃO CORRIGIDA

const diasSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado"
];

function preencherSelects() {
    const mes = document.getElementById("mes");
    const ano = document.getElementById("ano");

    mes.innerHTML = '<option value="">Selecione</option>';
    for (let i = 0; i < 12; i++) {
        const nomeMes = new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' });
        mes.innerHTML += `<option value="${i}">${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</option>`;
    }

    const anoAtual = new Date().getFullYear();
    ano.innerHTML = '<option value="">Selecione</option>';
    for (let i = anoAtual - 1; i <= anoAtual + 2; i++) {
        ano.innerHTML += `<option value="${i}">${i}</option>`;
    }

    mes.value = new Date().getMonth();
    ano.value = anoAtual;
}

function gerarCalendario() {
    const mes = Number(document.getElementById("mes").value);
    const ano = Number(document.getElementById("ano").value);
    const tbody = document.getElementById("corpoTabela");

    if (isNaN(mes) || isNaN(ano)) {
        alert("Por favor, selecione mês e ano válidos.");
        return;
    }

    tbody.innerHTML = "";

    const diasMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasMes; dia++) {
        const data = new Date(ano, mes, dia);
        const diaSemana = data.getDay();
        const nomeDiaSemana = diasSemana[diaSemana];
        
        // Formatar data no padrão brasileiro
        const dataFormatada = dia.toString().padStart(2, '0') + '/' + 
                             (mes + 1).toString().padStart(2, '0') + '/' + 
                             ano;

        const tr = document.createElement("tr");

        // Adicionar classes para sábado e domingo
        if (diaSemana === 0) {
            tr.classList.add("domingo");
            tr.title = "DOMINGO";
        } else if (diaSemana === 6) {
            tr.classList.add("sabado");
            tr.title = "SÁBADO";
        }

        tr.innerHTML = `
            <td><strong>${dataFormatada}</strong></td>
            <td class="dia-semana ${diaSemana === 0 || diaSemana === 6 ? 'fim-semana' : ''}">
                ${nomeDiaSemana.toUpperCase()}
                ${diaSemana === 0 ? ' 🏖️' : diaSemana === 6 ? ' ⚽' : ''}
            </td>
            <td><input type="time" class="entrada1"></td>
            <td><input type="time" class="saida1"></td>
            <td><input type="time" class="entrada2"></td>
            <td><input type="time" class="saida2"></td>
            <td class="trab">0.00</td>
            <td class="extra">0.00</td>
            <td class="falta">0.00</td>
        `;

        tbody.appendChild(tr);
    }
}

function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    const salario = Number(document.getElementById("salario").value) || 0;

    let total = 0;
    let extra = 0;
    let falta = 0;

    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input");
        const nomeDiaSemana = linha.querySelector(".dia-semana").innerText.trim();
        const isFimDeSemana = nomeDiaSemana.includes("DOMINGO") || nomeDiaSemana.includes("SÁBADO");
        
        let minutos = 0;
        let temTodosHorarios = true;

        // Verificar se todos os 4 horários foram preenchidos
        for (let input of inputs) {
            if (!input.value) {
                temTodosHorarios = false;
                break;
            }
        }

        if (temTodosHorarios) {
            // Calcular tempo do primeiro período (manhã)
            if (inputs[0].value && inputs[1].value) {
                const difManha = diferencaMinutos(inputs[0].value, inputs[1].value);
                if (difManha > 0) {
                    minutos += difManha;
                }
            }

            // Calcular tempo do segundo período (tarde)
            if (inputs[2].value && inputs[3].value) {
                const difTarde = diferencaMinutos(inputs[2].value, inputs[3].value);
                if (difTarde > 0) {
                    minutos += difTarde;
                }
            }

            // Subtrair almoço APENAS se tiver trabalhado mais que 4 horas no dia
            // (Regra comum: almoço de 1h para jornadas acima de 6h)
            if (minutos > 360) { // Mais que 6 horas
                minutos -= 60; // Descontar 1h de almoço
            }
        }

        const horas = minutos / 60;
        const horasFormatadas = horas > 0 ? horas.toFixed(2) : "0.00";
        linha.querySelector(".trab").innerText = horasFormatadas;

        // Resetar valores anteriores
        linha.querySelector(".extra").innerText = "0.00";
        linha.querySelector(".falta").innerText = "0.00";

        // Cálculo de horas extras/faltas (apenas para dias úteis)
        if (!isFimDeSemana && horas > 0) {
            if (horas > 8) {
                const extraDia = horas - 8;
                linha.querySelector(".extra").innerText = extraDia.toFixed(2);
                extra += extraDia;
            } else if (horas < 8) {
                const faltaDia = 8 - horas;
                linha.querySelector(".falta").innerText = faltaDia.toFixed(2);
                falta += faltaDia;
            }
        }

        // Para fins de semana, todo trabalho é considerado extra
        if (isFimDeSemana && horas > 0) {
            linha.querySelector(".extra").innerText = horas.toFixed(2);
            extra += horas;
        }

        total += horas;
    });

    const valorHora = salario > 0 ? salario / 220 : 0;

    document.getElementById("totalHoras").innerText = total.toFixed(2);
    document.getElementById("totalExtras").innerText = extra.toFixed(2);
    document.getElementById("totalFaltas").innerText = falta.toFixed(2);
    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
    document.getElementById("valorExtras").innerText = (extra * valorHora * 1.5).toFixed(2);
    document.getElementById("valorDescontos").innerText = (falta * valorHora).toFixed(2);
}

function diferencaMinutos(inicio, fim) {
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    
    if (h2 < h1 || (h2 === h1 && m2 < m1)) {
        // Se a saída for antes da entrada, considerar como próximo dia
        return ((h2 + 24) * 60 + m2) - (h1 * 60 + m1);
    }
    
    return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Carregar calendário ao iniciar
window.onload = function() {
    preencherSelects();
    gerarCalendario();
};