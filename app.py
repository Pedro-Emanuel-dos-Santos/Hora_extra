from flask import Flask, render_template_string, request, redirect, url_for

app = Flask(__name__)

# Banco simples em memória
funcionarios = []

BASE_HTML = """
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>RH | Sistema de Hora Extra</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f4f6f8;
            margin: 0;
        }
        header {
            background: #1e3a8a;
            color: white;
            padding: 16px 24px;
        }
        header a {
            color: white;
            margin-right: 20px;
            text-decoration: none;
            font-weight: 600;
        }
        .container {
            max-width: 520px;
            background: white;
            margin: 40px auto;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        h2 {
            margin-top: 0;
            color: #1f2933;
        }
        label {
            font-size: 14px;
            font-weight: 600;
        }
        input, select {
            width: 100%;
            padding: 12px;
            margin: 6px 0 16px 0;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            font-size: 15px;
        }
        button {
            width: 100%;
            padding: 14px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
        button:hover {
            background: #1e40af;
        }
        .box {
            background: #f9fafb;
            padding: 18px;
            border-radius: 10px;
            border-left: 5px solid #2563eb;
        }
        .total {
            font-size: 18px;
            font-weight: 700;
            color: #065f46;
        }
        ul {
            padding-left: 20px;
        }
    </style>
</head>
<body>
<header>
    <a href="/">Cálculo</a>
    <a href="/funcionarios">Funcionários</a>
</header>

<div class="container">
    {{ content | safe }}
</div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def calculo():
    resultado = None

    if request.method == 'POST':
        salario = float(request.form['salario'])
        he50 = float(request.form['he50'])
        he100 = float(request.form['he100'])

        valor_hora = salario / 220
        valor_he50 = valor_hora * 1.5 * he50
        valor_he100 = valor_hora * 2 * he100

        resultado = {
            'valor_hora': round(valor_hora, 2),
            'he50': round(valor_he50, 2),
            'he100': round(valor_he100, 2),
            'total': round(valor_he50 + valor_he100, 2)
        }

    content = render_template_string("""
        <h2>Cálculo de Hora Extra</h2>
        <form method="post">
            <label>Salário Base (R$)</label>
            <input type="number" step="0.01" name="salario" required>

            <label>Horas Extras 50%</label>
            <input type="number" step="0.01" name="he50" required>

            <label>Horas Extras 100%</label>
            <input type="number" step="0.01" name="he100" required>

            <button type="submit">Calcular</button>
        </form>

        {% if resultado %}
        <div class="box">
            <p>Valor da Hora: <strong>R$ {{ resultado.valor_hora }}</strong></p>
            <p>HE 50%: R$ {{ resultado.he50 }}</p>
            <p>HE 100%: R$ {{ resultado.he100 }}</p>
            <p class="total">Total: R$ {{ resultado.total }}</p>
        </div>
        {% endif %}
    """, resultado=resultado)

    return render_template_string(BASE_HTML, content=content)


@app.route('/funcionarios', methods=['GET', 'POST'])
def cadastro_funcionarios():
    if request.method == 'POST':
        funcionarios.append({
            'nome': request.form['nome'],
            'cargo': request.form['cargo'],
            'salario': float(request.form['salario'])
        })
        return redirect(url_for('cadastro_funcionarios'))

    content = render_template_string("""
        <h2>Cadastro de Funcionários</h2>
        <form method="post">
            <label>Nome</label>
            <input type="text" name="nome" required>

            <label>Cargo</label>
            <input type="text" name="cargo" required>

            <label>Salário</label>
            <input type="number" step="0.01" name="salario" required>

            <button type="submit">Cadastrar</button>
        </form>

        <h3>Funcionários Cadastrados</h3>
        <ul>
            {% for f in funcionarios %}
                <li>{{ f.nome }} — {{ f.cargo }} — R$ {{ f.salario }}</li>
            {% endfor %}
        </ul>
    """, funcionarios=funcionarios)

    return render_template_string(BASE_HTML, content=content)


if __name__ == '__main__':
    app.run(debug=True)
