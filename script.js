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

    for (let i = 0; i < 12; i++) {
        mes.innerHTML += `<option value="${i}">${i + 1}</option>`;
    }

    const anoAtual = new Date().getFullYear();
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

    tbody.innerHTML = "";

    const diasMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasMes; dia++) {
        const data = new Date(ano, mes, dia);
        const diaSemana = data.getDay();

        const tr = document.createElement("tr");

        if (diaSemana === 0) tr.classList.add("domingo");
        if (diaSemana === 6) tr.classList.add("sabado");

        tr.innerHTML = `
            <td>${dia}/${mes + 1}/${ano}</td>
            <td class="dia-semana">${diasSemana[diaSemana]}</td>
            <td><input type="time"></td>
            <td><input type="time"></td>
            <td><input type="time"></td>
            <td><input type="time"></td>
            <td class="trab">0</td>
            <td class="extra">0</td>
            <td class="falta">0</td>
        `;

        tbody.appendChild(tr);
    }
}

function calcularMes() {
    const linhas = document.querySelectorAll("#corpoTabela tr");

    let total = 0;
    let extra = 0;
    let falta = 0;

    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input");
        let minutos = 0;

        if (inputs[0].value && inputs[1].value) {
            minutos += diferencaMinutos(inputs[0].value, inputs[1].value);
        }
        if (inputs[2].value && inputs[3].value) {
            minutos += diferencaMinutos(inputs[2].value, inputs[3].value);
        }

        minutos -= 60; // almoço
        if (minutos < 0) minutos = 0;

        const horas = minutos / 60;
        linha.querySelector(".trab").innerText = horas.toFixed(2);

        const diaSemana = linha.querySelector(".dia-semana").innerText;

        if (horas > 8) {
            linha.querySelector(".extra").innerText = (horas - 8).toFixed(2);
            extra += horas - 8;
        } 
        else if (
            horas < 8 &&
            diaSemana !== "SÁBADO" &&
            diaSemana !== "DOMINGO"
        ) {
            linha.querySelector(".falta").innerText = (8 - horas).toFixed(2);
            falta += 8 - horas;
        }

        total += horas;
    });

    const salario = Number(document.getElementById("salario").value);
    const valorHora = salario / 220;

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
    return (h2 * 60 + m2) - (h1 * 60 + m1);
}

preencherSelects();
