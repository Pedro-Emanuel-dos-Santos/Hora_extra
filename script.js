// CONFIGURAÇÕES
const CARGA_DIARIA = 8;
const DIAS_MES = 22;

// Converte hora HH:MM → decimal
function horaParaDecimal(h) {
    const [hh, mm] = h.split(":").map(Number);
    return hh + (mm / 60);
}

// Calcula um dia (4 batidas)
function calcularDia(e1, s1, e2, s2) {
    if (!e1 || !s1 || !e2 || !s2) {
        return { trabalhadas: 0, extra: 0, falta: 0 };
    }

    const manha = horaParaDecimal(s1) - horaParaDecimal(e1);
    const tarde = horaParaDecimal(s2) - horaParaDecimal(e2);

    let total = manha + tarde;
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

// Valor hora
function calcularValorHora() {
    const salario = Number(document.getElementById("salario").value);
    if (!salario) return 0;
    return salario / 220;
}

// Gera dias do mês (22 dias úteis)
function gerarTabela() {
    const tbody = document.getElementById("tabelaDias");

    for (let i = 1; i <= DIAS_MES; i++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>Dia ${i}</td>
            <td><input type="time" id="e1_${i}"></td>
            <td><input type="time" id="s1_${i}"></td>
            <td><input type="time" id="e2_${i}"></td>
            <td><input type="time" id="s2_${i}"></td>
            <td id="trab_${i}">0</td>
            <td id="extra_${i}">0</td>
            <td id="falta_${i}">0</td>
        `;
        tbody.appendChild(tr);
    }
}

// Calcula mês inteiro
function calcularMesUI() {
    let totalHoras = 0;
    let totalExtra = 0;
    let totalFalta = 0;

    for (let i = 1; i <= DIAS_MES; i++) {
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
    document.getElementById("totalMes").innerText = totalHoras.toFixed(2);
    document.getElementById("extraMes").innerText = totalExtra.toFixed(2);
    document.getElementById("faltaMes").innerText = totalFalta.toFixed(2);
    document.getElementById("valorExtra").innerText = valorExtra.toFixed(2);
    document.getElementById("valorDesconto").innerText = valorDesconto.toFixed(2);
}

// Inicializa
gerarTabela();
