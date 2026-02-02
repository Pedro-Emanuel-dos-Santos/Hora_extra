// ============================================
// MÓDULO: INTERFACE E INTERAÇÃO
// ============================================

/**
 * Valida se um horário está correto
 * @param {HTMLInputElement} input - Input de horário
 */
function validarHorario(input) {
    const valor = input.value;
    if (!valor) return;
    
    // Validar formato HH:MM
    if (!validarFormatoHorario(valor)) {
        input.style.borderColor = "#ef4444";
        input.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.2)";
        return;
    }
    
    // Se a validação passar
    input.style.borderColor = "#10b981";
    input.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.2)";
    
    // Remover destaque após 1 segundo
    setTimeout(() => {
        input.style.borderColor = "";
        input.style.boxShadow = "";
    }, 1000);
    
    // Calcular automaticamente após mudança
    setTimeout(() => calcularMes(), 300);
}

/**
 * Mostra uma mensagem flutuante na tela
 * @param {string} texto - Texto da mensagem
 * @param {string} tipo - Tipo da mensagem (success, error, warning, info)
 */
function mostrarMensagem(texto, tipo = "info", duracao = 5000) {
    const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: '💡'
    };
    
    const cores = {
        success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
    };
    
    // Remover mensagem anterior se existir
    const anterior = document.getElementById('mensagemFlutuante');
    if (anterior) anterior.remove();
    
    // Criar mensagem
    const mensagem = document.createElement('div');
    mensagem.id = 'mensagemFlutuante';
    mensagem.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        background: ${cores[tipo]};
        color: white;
        padding: 18px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 400px;
        font-size: 15px;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        backdrop-filter: blur(10px);
    `;
    
    mensagem.innerHTML = `
        <span style="font-size: 1.2em;">${icones[tipo]}</span>
        <div>${texto}</div>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            opacity: 0.7;
            transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
            ✕
        </button>
    `;
    
    document.body.appendChild(mensagem);
    
    // Remover automaticamente
    setTimeout(() => {
        if (mensagem.parentElement) {
            mensagem.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (mensagem.parentElement) {
                    mensagem.remove();
                }
            }, 300);
        }
    }, duracao);
}

/**
 * Modal para confirmações
 */
function mostrarModal(config) {
    const {
        titulo,
        mensagem,
        tipo = 'info',
        confirmarTexto = 'Confirmar',
        cancelarTexto = 'Cancelar',
        onConfirmar,
        onCancelar
    } = config;
    
    const modal = document.createElement('div');
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
        z-index: 99999;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;
    
    const conteudo = document.createElement('div');
    conteudo.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        transform: translateY(0);
        animation: fadeIn 0.4s ease;
    `;
    
    const tipos = {
        warning: { cor: '#f59e0b', icone: '⚠️' },
        danger: { cor: '#ef4444', icone: '❌' },
        info: { cor: '#3b82f6', icone: '💡' },
        success: { cor: '#10b981', icone: '✅' }
    };
    
    const tipoInfo = tipos[tipo] || tipos.info;
    
    conteudo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <span style="font-size: 2em;">${tipoInfo.icone}</span>
            <h3 style="margin: 0; color: #1f2937; font-size: 1.5em;">${titulo}</h3>
        </div>
        <p style="color: #6b7280; margin-bottom: 30px; line-height: 1.6;">${mensagem}</p>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="modalCancelar" style="
                background: #f3f4f6;
                color: #6b7280;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                ${cancelarTexto}
            </button>
            <button id="modalConfirmar" style="
                background: ${tipoInfo.cor};
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            " onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)'" 
               onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)'">
                ${confirmarTexto}
            </button>
        </div>
    `;
    
    modal.appendChild(conteudo);
    document.body.appendChild(modal);
    
    // Eventos
    document.getElementById('modalConfirmar').onclick = () => {
        if (onConfirmar) onConfirmar();
        modal.remove();
    };
    
    document.getElementById('modalCancelar').onclick = () => {
        if (onCancelar) onCancelar();
        modal.remove();
    };
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            if (onCancelar) onCancelar();
            modal.remove();
        }
    };
    
    return modal;
}

/**
 * Copia o resumo para a área de transferência
 */
function copiarResumo() {
    const resumo = `
📊 RESUMO MENSAL - CONTROLE DE HORAS
===================================
Total Horas Trabalhadas: ${document.getElementById("totalHoras").innerText}
Extras Diárias (Banco): ${document.getElementById("totalExtrasDiarias").innerText}
Extras Semanais (Pagas): ${document.getElementById("totalExtrasSemanais").innerText}
Horas Faltantes: ${document.getElementById("totalFaltas").innerText}
Valor Hora: ${document.getElementById("valorHora").innerText}
Valor Extras: ${document.getElementById("valorExtras").innerText}
Descontos: ${document.getElementById("valorDescontos").innerText}
Total Líquido: ${document.getElementById("totalLiquido").innerText}
===================================
Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    `;
    
    navigator.clipboard.writeText(resumo)
        .then(() => mostrarMensagem("📋 Resumo copiado para a área de transferência!", "success"))
        .catch(() => mostrarMensagem("❌ Erro ao copiar para área de transferência", "error"));
}

/**
 * Imprime a tabela e o resumo
 */
function imprimirRelatorio() {
    mostrarModal({
        titulo: 'Imprimir Relatório',
        mensagem: 'Deseja imprimir o relatório completo?<br><small>A tabela e o resumo serão impressos.</small>',
        tipo: 'info',
        confirmarTexto: 'Imprimir',
        cancelarTexto: 'Cancelar',
        onConfirmar: () => {
            window.print();
            mostrarMensagem("🖨️ Preparando para impressão...", "success");
        },
        onCancelar: () => {
            mostrarMensagem("✅ Impressão cancelada", "info");
        }
    });
}

/**
 * Muda o tema do sistema
 * @param {string} tema - Nome do tema (claro, escuro, azul, verde)
 */
function mudarTema(tema) {
    // Remover todos os temas
    document.body.classList.remove('tema-claro', 'tema-escuro', 'tema-azul', 'tema-verde');
    
    // Adicionar novo tema
    document.body.classList.add(`tema-${tema}`);
    
    // Salvar preferência
    localStorage.setItem('tema-rh', tema);
    
    // Atualizar select
    const temaSelect = document.getElementById('tema');
    if (temaSelect) temaSelect.value = tema;
    
    // Mostrar feedback
    const temasNomes = {
        claro: 'Claro',
        escuro: 'Escuro',
        azul: 'Azul',
        verde: 'Verde'
    };
    
    mostrarMensagem(`🎨 Tema alterado para: ${temasNomes[tema]}`, "success");
}

/**
 * Carrega o tema salvo
 */
function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema-rh') || 'claro';
    mudarTema(temaSalvo);
}