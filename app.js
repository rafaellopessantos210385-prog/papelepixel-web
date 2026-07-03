/* ============================================================
   app.js — Papel & Pixel | Lógica Geral do Sistema Operacional
   ============================================================ */

/* ============================================================
   MÓDULO 1 — ESTADO GLOBAL DA APLICAÇÃO
   ============================================================ */
const tabelaPrecos = {
    abnt:         120.00,  // Formatação Acadêmica ABNT
    adm:           55.00,  // Serviços Adm & Jurídico
    inovacao:      85.00,  // Inovação Radical (QR Code / Blockchain)
    pbPerPage:      0.50,  // Impressão Preto & Branco por página
    colorPerPage:   1.50,  // Impressão Colorida por página
    delivery:      15.00,  // Taxa de entrega por motoboy
};

/* Flags de estado de sessão */
let interacoesCurtasContador = 0;
let atendimentoEncerrado    = false;
let admAutenticado          = false;

// URL DA API (Substitua pela URL gerada pelo Render após o seu deploy backend)
const API_URL = "https://papelepixel-backend.onrender.com"; 

/* ============================================================
   MÓDULO 2 — INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    atualizarPrecoLiveSystem();

    const chatInput = document.getElementById('chat-input-text');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') dispararMensagemChat();
        });
    }
});

/* ============================================================
   MÓDULO 3 — NAVEGAÇÃO & CONTATO NO RODAPÉ
   ============================================================ */
function toggleFooterContact(event) {
    if (event) event.preventDefault();
    const contactBox = document.getElementById('footer-contact-box');
    
    if (contactBox.style.display === 'block') {
        contactBox.style.display = 'none';
    } else {
        contactBox.style.display = 'block';
        contactBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/* ============================================================
   MÓDULO 4 — PAINEL ADMINISTRATIVO (CONECTADO AO NEON)
   ============================================================ */
function toggleAdminPanel(event) {
    event.preventDefault();
    const adminBox = document.getElementById('sys-admin-panel');

    if (adminBox.style.display === 'block') {
        adminBox.style.display = 'none';
        return;
    }

    if (!admAutenticado) {
        const promptLogin = prompt('ÁREA RESTRITA — Digite o Login Administrativo:');
        const promptSenha = prompt('ÁREA RESTRITA — Digite a Senha Administrativa:');

        if (promptLogin === 'admpp01' && promptSenha === 'admpp01') {
            admAutenticado = true;
            alert('Autenticação bem-sucedida! Terminal liberado, proprietário.');
        } else {
            alert('Acesso Negado! Credenciais inválidas para o Painel Administrativo.');
            return;
        }
    }

    adminBox.style.display = 'block';
    adminBox.scrollIntoView({ behavior: 'smooth' });
    
    carregarUsuariosNoPainel();
}

async function carregarUsuariosNoPainel() {
    const adminBox = document.getElementById('sys-admin-panel');
    const tabelaAntiga = document.getElementById('adm-usuarios-table-container');
    if (tabelaAntiga) tabelaAntiga.remove();

    try {
        const resposta = await fetch(`${API_URL}/listar-contatos`);
        if (!resposta.ok) throw new Error("Erro ao buscar registros.");
        
        const usuarios = await resposta.json();
        const containerTable = document.createElement('div');
        containerTable.id = 'adm-usuarios-table-container';
        containerTable.style.marginTop = '30px';
        containerTable.style.borderTop = '1px dashed var(--neon-purple)';
        containerTable.style.paddingTop = '20px';

        let htmlTabela = `
            <h3 style="font-family:var(--font-display); color:var(--neon-purple); margin-bottom:15px; font-size:1.1rem; text-transform:uppercase;">
                <i class="fa-solid fa-address-book"></i> Contatos e Endereços na Base de Dados (NEON)
            </h3>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:#fff; text-align:left; min-width: 1000px;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--neon-purple); color:var(--neon-blue); text-transform:uppercase;">
                            <th style="padding:10px;">Data/Hora</th>
                            <th style="padding:10px;">Nome</th>
                            <th style="padding:10px;">WhatsApp</th>
                            <th style="padding:10px;">E-mail</th>
                            <th style="padding:10px;">Endereço</th>
                            <th style="padding:10px;">CEP</th>
                            <th style="padding:10px;">Cidade/Estado</th>
                            <th style="padding:10px;">Mensagem</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (usuarios.length === 0) {
            htmlTabela += `<tr><td colspan="8" style="padding:15px; text-align:center; color:var(--text-muted);">Nenhum contato cadastrado na nuvem.</td></tr>`;
        } else {
            usuarios.forEach(u => {
                htmlTabela += `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;" onmouseover="this.style.backgroundColor='rgba(157,0,255,0.05)'" onmouseout="this.style.backgroundColor='transparent'">
                        <td style="padding:10px; white-space:nowrap; color:var(--text-muted);">${u.data_cadastro}</td>
                        <td style="padding:10px; font-weight:bold; color:#fff;">${u.nome}</td>
                        <td style="padding:10px; color:var(--neon-blue); white-space:nowrap;">${u.whatsapp}</td>
                        <td style="padding:10px;">${u.email}</td>
                        <td style="padding:10px; color:var(--text-muted);">${u.endereco}</td>
                        <td style="padding:10px; color:var(--text-muted);">${u.cep}</td>
                        <td style="padding:10px; color:var(--text-muted);">${u.cidade} - ${u.estado}</td>
                        <td style="padding:10px; color:#e0e0e0; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${u.mensagem}">${u.mensagem}</td>
                    </tr>
                `;
            });
        }

        htmlTabela += `</tbody></table></div>`;
        containerTable.innerHTML = htmlTabela;
        adminBox.appendChild(containerTable);

    } catch (erro) {
        console.error("Erro ao carregar dados no painel corporativo:", erro);
    }
}

function salvarNovosValoresAdmin() {
    tabelaPrecos.abnt         = parseFloat(document.getElementById('adm-val-abnt').value)     || 0;
    tabelaPrecos.adm          = parseFloat(document.getElementById('adm-val-adm').value)      || 0;
    tabelaPrecos.inovacao     = parseFloat(document.getElementById('adm-val-inovacao').value) || 0;
    tabelaPrecos.pbPerPage    = parseFloat(document.getElementById('adm-val-pb').value)       || 0;
    tabelaPrecos.colorPerPage = parseFloat(document.getElementById('adm-val-color').value)    || 0;
    tabelaPrecos.delivery     = parseFloat(document.getElementById('adm-val-delivery').value) || 0;

    alert('Tabela de novos valores gravada com sucesso! Fechando painel operacional...');
    document.getElementById('sys-admin-panel').style.display = 'none';
    atualizarPrecoLiveSystem();
}

/* ============================================================
   MÓDULO 5 — MOTOR DE ORÇAMENTO (SISTEMA INTEGRADO)
   ============================================================ */
function selectServiceCard(serviceType, event) {
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });

    const cardSelecionado = event.currentTarget;
    cardSelecionado.classList.add('selected');
    cardSelecionado.querySelector('input[type="radio"]').checked = true;

    atualizarPrecoLiveSystem();
}

function atualizarPrecoLiveSystem() {
    const radioSelecionado = document.querySelector('input[name="srv-radio-group"]:checked');
    if (!radioSelecionado) return;

    let total = 0;
    const servicoValor = radioSelecionado.value;
    if      (servicoValor === 'lanhouse_base')   total = 10.00;
    else if (servicoValor === 'adm_juridico')    total = tabelaPrecos.adm;
    else if (servicoValor === 'academico_abnt')  total = tabelaPrecos.abnt;
    else if (servicoValor === 'inovacao_radical') total = tabelaPrecos.inovacao;

    const tipoImpressao = document.getElementById('addon-print-type').value;
    const qtdPaginas    = parseInt(document.getElementById('addon-pages-qty').value) || 0;

    if      (tipoImpressao === 'pb')    total += qtdPaginas * tabelaPrecos.pbPerPage;
    else if (tipoImpressao === 'color') total += qtdPaginas * tabelaPrecos.colorPerPage;

    const modalidadeLogistica = document.getElementById('delivery-method').value;
    if (modalidadeLogistica === 'delivery') total += tabelaPrecos.delivery;

    const alertaComercial = document.getElementById('comercial-shortcut');
    if (alertaComercial) {
        alertaComercial.style.display = qtdPaginas > 150 ? 'flex' : 'none';
    }

    document.getElementById('system-live-total').innerText =
        `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/* ============================================================
   MÓDULO 6 — CHATBOT (P&P_Chat)
   ============================================================ */
function dispararMensagemChat() {
    if (atendimentoEncerrado) {
        alert('Atendimento concluído. Para nova consulta, recarregue a página.');
        return;
    }

    const inputField = document.getElementById('chat-input-text');
    const textoOriginal = inputField.value.trim();
    const textoLower    = textoOriginal.toLowerCase();

    if (!textoOriginal) return;

    inserirMensagemUI('user', textoOriginal);
    inputField.value = '';

    const ehCurta = textoOriginal.length <= 3 || ['oi', 'sim', 'nao', 'não'].includes(textoLower);
    interacoesCurtasContador = ehCurta ? interacoesCurtasContador + 1 : 0;

    setTimeout(() => {
        const querEncerrar = textoLower.includes('tchau') || textoLower.includes('obrigado');
        if (interacoesCurtasContador >= 2 || querEncerrar) {
            inserirMensagemUI('bot', '<strong>[P&P_Chat]:</strong> Teria mais alguma dúvida?');
            const negacao = textoLower.includes('nao') || textoLower.includes('não');
            if (negacao || querEncerrar) {
                atendimentoEncerrado = true;
                document.getElementById('chat-status-indicator').innerText = '○ CONCLUÍDO';
                inserirMensagemUI('bot', '<strong>[P&P_Chat]:</strong> Atendimento encerrado. Volte sempre!');
            }
            return;
        }

        const pedidoImpressao = textoLower.includes('impress') || textoLower.includes('copia') || textoLower.includes('imprimir');

        if (pedidoImpressao) {
            const temTipo      = textoLower.includes('preto') || textoLower.includes('branco') || textoLower.includes('color');
            const temQuantidade = /\d+/.test(textoLower);

            if (temTipo && temQuantidade) {
                const qtdDetectada = textoLower.match(/\d+/)[0];
                const tipoDetectado = textoLower.includes('color') ? 'color' : 'pb';
                const labelTipo = tipoDetectado === 'color' ? 'Colorida' : 'P&B';

                document.getElementById('addon-print-type').value    = tipoDetectado;
                document.getElementById('addon-pages-qty').value     = qtdDetectada;
                atualizarPrecoLiveSystem();

                inserirMensagemUI('bot',
                    `<strong>[P&P_Chat]:</strong> Pedido registrado! <strong>${qtdDetectada} pág. ${labelTipo}</strong>. Orçamento updated.`
                );
            } else {
                inserirMensagemUI('bot', `
                    <strong>[P&P_Chat]:</strong> Para orçar suas impressões, preciso do tipo (P&B ou Colorida) e da quantidade de páginas.
                    Como não identifiquei esses dados, vou te transferir ao nosso Comercial:<br><br>
                    <a href="https://wa.me/5586988303158?text=Olá,%20preciso%20de%20um%20orçamento%20de%20impressões."
                       target="_blank"
                       style="color:var(--neon-green);font-weight:bold;font-family:'Orbitron',sans-serif;
                              text-transform:uppercase;text-decoration:none;border:1px solid var(--neon-green);
                              padding:5px 10px;display:inline-block;border-radius:4px;">
                        WhatsApp Comercial
                    </a>
                `);
            }
            return;
        }

        if (textoLower.includes('abnt')) {
            inserirMensagemUI('bot',
                `<strong>[P&P_Chat]:</strong> Formatação Acadêmica ABNT: <strong>R$ ${tabelaPrecos.abnt.toFixed(2).replace('.', ',')}</strong>.`
            );
            return;
        }

        inserirMensagemUI('bot',
            '<strong>[P&P_Chat]:</strong> Sou especializado em ABNT, Contratos e Impressões. Para outras dúvidas, acesse nosso Comercial.'
        );

    }, 400);
}

function inserirMensagemUI(role, texto) {
    const container  = document.getElementById('chat-messages-container');
    const msgEl      = document.createElement('div');
    msgEl.className  = `chat-msg ${role}`;
    msgEl.innerHTML  = texto;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

/* ============================================================
   MÓDULO 7 — ENVIO DO FORMULÁRIO COMPLETO DE CADASTRO NO RODAPÉ
   ============================================================ */
async function executarOrdemSalvarTxt(event) {
    event.preventDefault();
    
    const payload = {
        nome:     document.getElementById('c-name').value,
        email:    document.getElementById('c-email').value,
        whatsapp: document.getElementById('c-whatsapp').value,
        endereco: document.getElementById('c-address').value,
        cep:      document.getElementById('c-cep').value,
        cidade:   document.getElementById('c-city').value,
        estado:   document.getElementById('c-state').value,
        mensagem: document.getElementById('c-message').value
    };

    try {
        const resposta = await fetch(`${API_URL}/enviar-contato`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            alert(`Obrigado, ${payload.nome}!\nSeus dados foram salvos no banco de dados e as informações de envio e mensagem foram transmitidas à nossa gerência.`);
            reiniciarSistema();
            document.getElementById('footer-contact-box').style.display = 'none';
        } else {
            const serverError = await resposta.json();
            alert(`Falha no processamento: ${serverError.erro || 'Tente novamente.'}`);
        }
    } catch (erro) {
        console.error("Erro de comunicação com o Back-end:", erro);
        alert("Erro ao conectar à API externa. Certifique-se de que o backend está ativo.");
    }
}

/* ============================================================
   MÓDULO 8 — RESET COMPLETO DO SISTEMA
   ============================================================ */
function reiniciarSistema() {
    const formContato = document.getElementById('contact-form-system');
    if (formContato) formContato.reset();

    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const cardPadrao = document.querySelector(".service-card[onclick*='lanhouse_base']");
    if (cardPadrao) {
        cardPadrao.classList.add('selected');
        const radioInterno = cardPadrao.querySelector('input[type="radio"]');
        if (radioInterno) radioInterno.checked = true;
    }

    interacoesCurtasContador = 0;
    atendimentoEncerrado    = false;
    
    const indicadorStatus = document.getElementById('chat-status-indicator');
    if (indicadorStatus) indicadorStatus.innerText = '● OPERACIONAL';

    const containerMensagens = document.getElementById('chat-messages-container');
    if (containerMensagens) {
        containerMensagens.innerHTML = `
            <div class="chat-msg bot">
                Olá! Eu sou o <strong>P&amp;P_Chat</strong>. Posso lhe dar suporte sobre
                formatação e soluções digitais.<br><br>
                Se precisar de <strong>impressões adicionais</strong>, fale o tipo
                (Preto e Branco ou Colorida) e a quantidade de páginas.
                Caso não saiba a quantidade, me avise para eu lhe transferir ao Comercial!
            </div>
        `;
    }

    atualizarPrecoLiveSystem();
}
