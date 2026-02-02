// CONFIGURAÇÕES
const CARGA_DIARIA = 8;
const CARGA_SEMANAL = 40;
const ALMOCO_HORAS = 1.5;

// Converte HH:MM para decimal
function horaParaDecimal(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h + (m / 60);
}

// Calcula horas de um dia
function calcularDia(entrada, saida) {
    if (!entrada || !saida) {
        return { trabalhadas: 0, extra: 0, falta: 0 };
    }

    let total = horaParaDecimal(saida) - horaParaDecimal(entrada) - ALMOCO_HORAS;
    if (total < 0) total = 0;

    let extra = 0;
    let falta = 0;

    if (total > CARGA_DIARIA) {
        extra = total - CARGA_DIARIA;
    } else if (total < CARGA_DIARIA) {
        falta = CARGA_DIARIA - total;
    }

    return { trabalhadas: total, extra, falta };
}

// Valor da hora (salário / 220)
function calcularValorHora() {
    const salario = Number(document.getElementById("salario").value);
    if (!salario) return 0;
    return salario / 220;
}

// Gera tabela semanal
function gerarTabela() {
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex"];
    const tbody = document.getElementById("tabelaDias");

    dias.forEach((dia, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${dia}</td>
            <td><input type="time" id="entrada${index}"></td>
            <td><input type="time" id="saida${index}"></td>
            <td id="trab${index}">0</td>
            <td id="extra${index}">0</td>
            <td id="falta${index}">0</td>
        `;
        tbody.appendChild(tr);
    });
}

// Calcula semana + valores
function calcularSemanaUI() {
    let totalHoras = 0;
    let totalExtra = 0;
    let totalFalta = 0;

    for (let i = 0; i < 5; i++) {
        const entrada = document.getElementById(`entrada${i}`).value;
        const saida = document.getElementById(`saida${i}`).value;

        const resultado = calcularDia(entrada, saida);

        document.getElementById(`trab${i}`).innerText = resultado.trabalhadas.toFixed(2);
        document.getElementById(`extra${i}`).innerText = resultado.extra.toFixed(2);
        document.getElementById(`falta${i}`).innerText = resultado.falta.toFixed(2);

        totalHoras += resultado.trabalhadas;
        totalExtra += resultado.extra;
        totalFalta += resultado.falta;
    }

    const valorHora = calcularValorHora();
    const valorExtra = totalExtra * valorHora * 1.5;
    const valorDesconto = totalFalta * valorHora;

    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
    document.getElementById("totalSemana").innerText = totalHoras.toFixed(2);
    document.getElementById("extraSemana").innerText = totalExtra.toFixed(2);
    document.getElementById("faltaSemana").innerText = totalFalta.toFixed(2);
    document.getElementById("valorExtra").innerText = valorExtra.toFixed(2);
    document.getElementById("valorDesconto").innerText = valorDesconto.toFixed(2);
}

// Inicializa sistema
gerarTabela();
