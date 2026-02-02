const CARGA_DIARIA = 8;

// Utilidades
function horaParaDecimal(h) {
    const [hh, mm] = h.split(":").map(Number);
    return hh + (mm / 60);
}

// Quantos dias tem o mês
function diasNoMes(mes, ano) {
    return new Date(ano, mes + 1, 0).getDate();
}

// Calcula um dia
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

    if (total > CARGA_DIARIA) extra = total - CARGA_DIARIA;
    else if (total < CARGA_DIARIA) falta = CARGA_DIARIA - total;

    return { trabalhadas: total, extra, falta };
}

// Valor hora
function calcularValorHora() {
    const salario = Number(document.getElementById("salario").value);
    if (!salario) return 0;
    return salario / 220;
}

// Preenche selects
function inicializarPeriodo() {
    const hoje = new Date();
    const selectMes = document.getElementById("mes");
    const selectAno = document.getElementById("ano");

    const meses = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    meses.forEach((m, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.text = m;
        if (i === hoje.getMonth()) opt.selected = true;
        selectMes.appendChild(opt);
    });

    for (let a = 2024; a <= 2030; a++) {
        const opt = document.createElement("option");
        opt.value = a;
        opt.text = a;
        if (a === hoje.getFullYear()) opt.selected = true;
        selectAno.appendChild(opt);
    }

    selectMes.onchange = gerarTabela;
    selectAno.onchange = gerarTabela;
}

// Gera tabela conforme mês/ano
function gerarTabela() {
    const mes = Number(document.getElementById("mes").value);
    const ano = Number(document.getElementById("ano").value);
    const totalDias = diasNoMes(mes, ano);

    const tbody = document.getElementById("tabelaDias");
    tbody.innerHTML = "";

    for (let d = 1; d <= totalDias; d++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d}</td>
            <td><input type="time" id="e1_${d}"></td>
            <td><input type="time" id="s1_${d}"></td>
            <td><input type="time" id="e2_${d}"></td>
            <td><input type="time" id="s2_${d}"></td>
            <td id="trab_${d}">0</td>
            <td id="extra_${d}">0</td>
            <td id="falta_${d}">0</td>
        `;
        tbody.appendChild(tr);
    }
}

// Calcula mês
function calcularMesUI() {
    const mes = Number(document.getElementById("mes").value);
    const ano = Number(document.getElementById("ano").value);
    const totalDias = diasNoMes(mes, ano);

    let totalHoras = 0;
    let totalExtra = 0;
    let totalFalta = 0;

    for (let d = 1; d <= totalDias; d++) {
        const r = calcularDia(
            document.getElementById(`e1_${d}`).value,
            document.getElementById(`s1_${d}`).value,
            document.getElementById(`e2_${d}`).value,
            document.getElementById(`s2_${d}`).value
        );

        document.getElementById(`trab_${d}`).innerText = r.trabalhadas.toFixed(2);
        document.getElementById(`extra_${d}`).innerText = r.extra.toFixed(2);
        document.getElementById(`falta_${d}`).innerText = r.falta.toFixed(2);

        totalHoras += r.trabalhadas;
        totalExtra += r.extra;
        totalFalta += r.falta;
    }

    const valorHora = calcularValorHora();
    document.getElementById("valorHora").innerText = valorHora.toFixed(2);
    document.getElementById("totalMes").innerText = totalHoras.toFixed(2);
    document.getElementById("extraMes").innerText = totalExtra.toFixed(2);
    document.getElementById("faltaMes").innerText = totalFalta.toFixed(2);
    document.getElementById("valorExtra").innerText = (totalExtra * valorHora * 1.5).toFixed(2);
    document.getElementById("valorDesconto").innerText = (totalFalta * valorHora).toFixed(2);
}

// Inicialização
inicializarPeriodo();
gerarTabela();
