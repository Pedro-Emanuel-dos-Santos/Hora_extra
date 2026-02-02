// CONFIGURAÇÕES
const CARGA_DIARIA = 8;
const CARGA_SEMANAL = 40;

// Converte HH:MM para decimal
function horaParaDecimal(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h + (m / 60);
}

// Calcula horas de UM DIA (4 batidas)
function calcularDia(e1, s1, e2, s2) {
    if (!e1 || !s1 || !e2 || !s2) {
        return { trabalhadas: 0, extra: 0, falta: 0 };
    }

    const periodoManha = horaParaDecimal(s1) - horaParaDecimal(e1);
    const periodoTarde = horaParaDecimal(s2) - horaParaDecimal(e2);

    let total = periodoManha + periodoTarde;
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

// Valor da hora
function calcularValorHora() {
    const salario = Number(document.getElementById("salario").value);
    if (!salario) return 0;
    return salario / 220;
}

// Gera tabela
function gerarTabela() {
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex"];
    const tbody = document.getElementById("tabelaDias");

    dias.forEach((dia, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${dia}</td>
            <td><input type="time" id="e1_${i}"></td>
            <td><input type="time" id="s1_${i}"></td>
            <td><input type="time" id="e2_${i}"></td>
            <td><input type="time" id="s2_${i}"></td>
            <td id="trab_${i}">0</td>
            <td id="extra_${i}">0</td>
            <td id="falta_${i}">0</td>
        `;
        tbody.appendChild(tr);
    });
}

// Calcula semana
function calcularSemanaUI() {
    let totalHoras = 0;
    let totalExtra = 0;
    let totalFalta = 0;

    for (let i = 0; i < 5; i++) {
        const r = calcularDia(
            document.getElementById(`e1_${i}`).value,
            document.getElementById(`s1_${i}`).value,
            document.getElementById(`e2_${i}`).value,
            document.getElementById(`s2_${i}`).value
        );

        document.getElementById(`trab_${i}`).innerText = r.trabalhadas.toFixed(2);
        document.getElementById(`extra_${i}`).innerText = r.extra.toFixed(2);
        document.getElementById(`falta_${i}`).innerText = r.falta.toFixed(2);

        totalHoras += r.trabalhadas;
        totalExtra += r.extra;
        totalFalta += r.falta;
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

// Inicializa
gerarTabela();
