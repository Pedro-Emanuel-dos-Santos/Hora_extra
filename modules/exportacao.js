// ============================================
// MÓDULO: EXPORTAÇÃO DE DADOS
// ============================================

/**
 * Exporta os dados para CSV
 */
function exportarParaCSV() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    let csv = "Data;Dia;Entrada1;Saida1;Entrada2;Saida2;Trabalhado;ExtraBanco;ExtraPaga;Falta\n";
    
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        const dados = [];
        
        colunas.forEach((coluna, index) => {
            if (index === 2 || index === 3 || index === 4 || index === 5) {
                // Inputs de horário
                const input = coluna.querySelector("input");
                dados.push(input ? input.value : "");
            } else {
                // Texto normal
                dados.push(coluna.innerText.trim());
            }
        });
        
        csv += dados.join(";") + "\n";
    });
    
    // Adicionar resumo
    csv += "\nRESUMO\n";
    csv += `Total Horas Trabalhadas;${document.getElementById("totalHoras").innerText}\n`;
    csv += `Extras Diárias (Banco);${document.getElementById("totalExtrasDiarias").innerText}\n`;
    csv += `Extras Semanais (Pagas);${document.getElementById("totalExtrasSemanais").innerText}\n`;
    csv += `Horas Faltantes;${document.getElementById("totalFaltas").innerText}\n`;
    csv += `Valor Hora;R$ ${document.getElementById("valorHora").innerText}\n`;
    csv += `Valor Extras;R$ ${document.getElementById("valorExtras").innerText}\n`;
    csv += `Descontos;R$ ${document.getElementById("valorDescontos").innerText}\n`;
    csv += `Total Líquido;R$ ${document.getElementById("totalLiquido").innerText}\n`;
    
    // Criar link para download
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

/**
 * Exporta o relatório completo para PDF (versão com imagem)
 */
async function exportarParaPDF() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    // Mostrar mensagem de processamento
    mostrarMensagem("⏳ Gerando PDF... Aguarde!", "info");
    
    try {
        const { mes, ano, nomeMes } = getDadosAtuais();
        
        // Criar um elemento temporário para o PDF
        const pdfContainer = document.createElement("div");
        pdfContainer.id = "pdf-container";
        pdfContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: -9999px;
            width: 794px;
            background: white;
            padding: 40px;
            font-family: 'Arial', sans-serif;
        `;
        
        // Adicionar cabeçalho
        pdfContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 15px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📅 CONTROLE MENSAL DE HORAS - RH</h1>
                <h2 style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 18px;">${nomeMes.toUpperCase()} de ${ano}</h2>
                <p style="color: #95a5a6; margin: 5px 0; font-size: 14px;">
                    Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2c3e50; background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 16px;">
                    📊 DADOS DO FUNCIONÁRIO
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <strong>Salário Base:</strong> R$ ${document.getElementById("salario").value || "0,00"}
                    </div>
                    <div>
                        <strong>Valor Hora:</strong> R$ ${document.getElementById("valorHora").innerText}
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar a tabela
        const tabelaClone = document.querySelector(".tabela-container").cloneNode(true);
        tabelaClone.style.width = "100%";
        tabelaClone.style.fontSize = "10px";
        tabelaClone.style.marginBottom = "20px";
        
        const tabela = tabelaClone.querySelector("table");
        tabela.style.minWidth = "auto";
        tabela.style.width = "100%";
        tabela.style.borderCollapse = "collapse";
        
        // Ajustar células
        const ths = tabela.querySelectorAll("th");
        ths.forEach(th => {
            th.style.padding = "8px 6px";
            th.style.fontSize = "10px";
        });
        
        const tds = tabela.querySelectorAll("td");
        tds.forEach(td => {
            td.style.padding = "6px 4px";
            td.style.fontSize = "9px";
            td.style.border = "1px solid #ddd";
        });
        
        // Substituir inputs por texto
        const inputs = tabela.querySelectorAll("input[type='time']");
        inputs.forEach(input => {
            const parent = input.parentNode;
            parent.innerHTML = input.value || "-";
            parent.style.textAlign = "center";
        });
        
        pdfContainer.appendChild(tabelaClone);
        
        // Adicionar resumo
        const resumoClone = document.querySelector(".resumo").cloneNode(true);
        resumoClone.style.background = "none";
        resumoClone.style.border = "1px solid #ddd";
        resumoClone.style.padding = "15px";
        resumoClone.style.marginTop = "20px";
        
        const spans = resumoClone.querySelectorAll("span");
        spans.forEach(span => {
            span.style.background = "none";
            span.style.color = "#2c3e50";
            span.style.padding = "0";
        });
        
        pdfContainer.appendChild(resumoClone);
        
        // Adicionar rodapé
        const rodape = document.createElement("div");
        rodape.style.marginTop = "30px";
        rodape.style.paddingTop = "15px";
        rodape.style.borderTop = "1px solid #eee";
        rodape.style.textAlign = "center";
        rodape.style.color = "#95a5a6";
        rodape.style.fontSize = "11px";
        rodape.innerHTML = `
            <p>Sistema de Controle de Horas - RH | Desenvolvido para gestão de ponto eletrônico</p>
            <p>Horas extras calculadas conforme legislação: 50% adicional para extras e 100% para domingos/feriados</p>
        `;
        
        pdfContainer.appendChild(rodape);
        
        // Adicionar ao body temporariamente
        document.body.appendChild(pdfContainer);
        
        // Usar html2canvas para capturar o conteúdo
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        });
        
        // Remover container temporário
        document.body.removeChild(pdfContainer);
        
        // Configurar PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Dimensões A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Calcular proporção da imagem
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Adicionar imagem ao PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Verificar se precisa de múltiplas páginas
        let yPos = 10;
        let remainingHeight = imgHeight;
        
        while (remainingHeight > 0) {
            const height = Math.min(remainingHeight, pdfHeight - 20);
            
            pdf.addImage(imgData, 'JPEG', 10, yPos, imgWidth, height, undefined, 'FAST');
            
            remainingHeight -= height;
            yPos = 0;
            
            if (remainingHeight > 0) {
                pdf.addPage();
            }
        }
        
        // Salvar o PDF
        pdf.save(`controle_horas_${nomeMes.toLowerCase()}_${ano}.pdf`);
        
        mostrarMensagem("✅ PDF gerado com sucesso!", "success");
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        mostrarMensagem("❌ Erro ao gerar PDF: " + error.message, "error");
    }
}

/**
 * Versão alternativa mais simples de PDF (apenas dados tabulares)
 */
function exportarParaPDFSimples() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    // Cabeçalho
    const { nomeMes, ano } = getDadosAtuais();
    
    pdf.setFontSize(18);
    pdf.setTextColor(44, 62, 80);
    pdf.text("📅 CONTROLE MENSAL DE HORAS - RH", 15, 15);
    
    pdf.setFontSize(12);
    pdf.setTextColor(127, 140, 141);
    pdf.text(`${nomeMes.toUpperCase()} de ${ano}`, 15, 22);
    
    // Data de geração
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pdf.internal.pageSize.getWidth() - 50, 22);
    
    // Dados do funcionário
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Salário Base: R$ ${document.getElementById("salario").value || "0,00"}`, 15, 32);
    pdf.text(`Valor Hora: R$ ${document.getElementById("valorHora").innerText}`, 15, 38);
    
    // Cabeçalho da tabela
    const colunas = ["Data", "Dia", "Ent1", "Sai1", "Ent2", "Sai2", "Trab", "ExtB", "ExtP", "Falta"];
    const colWidths = [25, 25, 20, 20, 20, 20, 20, 20, 20, 20];
    
    let y = 50;
    
    // Desenhar cabeçalho da tabela
    pdf.setFillColor(44, 62, 80);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    
    let x = 10;
    colunas.forEach((coluna, i) => {
        pdf.rect(x, y - 8, colWidths[i], 8, 'F');
        pdf.text(coluna, x + 2, y - 3);
        x += colWidths[i];
    });
    
    // Dados da tabela
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const linhas = document.querySelectorAll("#corpoTabela tr");
    let linhaAtual = 0;
    
    linhas.forEach((linha, index) => {
        if (y > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            y = 20;
            
            // Redesenhar cabeçalho
            pdf.setFillColor(44, 62, 80);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont(undefined, 'bold');
            
            x = 10;
            colunas.forEach((coluna, i) => {
                pdf.rect(x, y - 8, colWidths[i], 8, 'F');
                pdf.text(coluna, x + 2, y - 3);
                x += colWidths[i];
            });
            
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(0, 0, 0);
            y += 8;
        }
        
        const colunasLinha = linha.querySelectorAll("td");
        const dados = [];
        
        colunasLinha.forEach((coluna, colIndex) => {
            if (colIndex === 2 || colIndex === 3 || colIndex === 4 || colIndex === 5) {
                const input = coluna.querySelector("input");
                dados.push(input ? input.value : "-");
            } else {
                dados.push(coluna.innerText.trim());
            }
        });
        
        // Destacar fins de semana
        const diaSemana = parseInt(linha.querySelector(".dia-semana")?.getAttribute("data-diasemana") || 0);
        
        if (diaSemana === 0) {
            pdf.setFillColor(255, 245, 245);
            pdf.rect(10, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
            pdf.setTextColor(220, 53, 69);
        } else if (diaSemana === 6) {
            pdf.setFillColor(255, 249, 230);
            pdf.rect(10, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
            pdf.setTextColor(253, 126, 20);
        } else {
            pdf.setTextColor(0, 0, 0);
        }
        
        // Desenhar dados
        x = 10;
        dados.forEach((dado, i) => {
            pdf.text(dado.toString(), x + 2, y + 5);
            x += colWidths[i];
        });
        
        y += 8;
        linhaAtual++;
    });
    
    // Resumo
    y += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'bold');
    pdf.text("📊 RESUMO MENSAL", 15, y);
    
    pdf.setFont(undefined, 'normal');
    y += 8;
    pdf.text(`Total Horas Trabalhadas: ${document.getElementById("totalHoras").innerText} h`, 20, y);
    y += 6;
    pdf.text(`Extras Diárias (Banco): ${document.getElementById("totalExtrasDiarias").innerText} h`, 20, y);
    y += 6;
    pdf.setTextColor(230, 126, 34);
    pdf.text(`Extras Semanais (Pagas): ${document.getElementById("totalExtrasSemanais").innerText} h`, 20, y);
    y += 6;
    pdf.setTextColor(231, 76, 60);
    pdf.text(`Horas Faltantes: ${document.getElementById("totalFaltas").innerText} h`, 20, y);
    y += 6;
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Valor Hora: R$ ${document.getElementById("valorHora").innerText}`, 20, y);
    y += 6;
    pdf.setTextColor(46, 204, 113);
    pdf.text(`Valor Extras: R$ ${document.getElementById("valorExtras").innerText}`, 20, y);
    y += 6;
    pdf.setTextColor(192, 57, 43);
    pdf.text(`Descontos: R$ ${document.getElementById("valorDescontos").innerText}`, 20, y);
    y += 8;
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text(`TOTAL LÍQUIDO: R$ ${document.getElementById("totalLiquido").innerText}`, 20, y);
    
    // Rodapé
    pdf.setFontSize(9);
    pdf.setTextColor(149, 165, 166);
    pdf.text("Sistema de Controle de Horas - RH | Documento gerado automaticamente", 
              pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, 
              { align: 'center' });
    
    // Salvar PDF
    pdf.save(`controle_horas_${nomeMes.toLowerCase()}_${ano}_simples.pdf`);
    mostrarMensagem("✅ PDF gerado com sucesso (versão simples)!", "success");
}

/**
 * Menu para escolher tipo de PDF
 */
function exportarPDFMenu() {
    const linhas = document.querySelectorAll("#corpoTabela tr");
    if (linhas.length === 0) {
        mostrarMensagem("❌ Não há dados para exportar!", "error");
        return;
    }
    
    const html = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px; color: #2c3e50;">📄 Exportar para PDF</h3>
            <p style="margin-bottom: 15px;">Escolha o formato desejado:</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="btnPdfCompleto" style="padding: 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: left;">
                    <strong>📋 PDF Completo</strong><br>
                    <small>Imagem fiel da tela (recomendado para poucos dias)</small>
                </button>
                <button id="btnPdfSimples" style="padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: left;">
                    <strong>📊 PDF Simples</strong><br>
                    <small>Dados tabulares (rápido e leve para muitos dias)</small>
                </button>
            </div>
        </div>
    `;
    
    // Criar modal
    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 0;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    modalContent.innerHTML = html;
    modal.appendChild(modalContent);
    
    // Botão fechar
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #7f8c8d;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    modalContent.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // Adicionar eventos aos botões
    setTimeout(() => {
        document.getElementById("btnPdfCompleto").onclick = function() {
            document.body.removeChild(modal);
            exportarParaPDF();
        };
        
        document.getElementById("btnPdfSimples").onclick = function() {
            document.body.removeChild(modal);
            exportarParaPDFSimples();
        };
    }, 100);
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

/**
 * Exporta funções do módulo
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exportarParaCSV,
        exportarParaPDF,
        exportarParaPDFSimples,
        exportarPDFMenu,
        imprimirRelatorio
    };
}