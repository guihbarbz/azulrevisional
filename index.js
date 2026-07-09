document.addEventListener('DOMContentLoaded', () => {
    
    // ============================================================
    // PARTE 1: ANIMAÇÕES DO SITE
    // ============================================================
    const scrollElements = document.querySelectorAll(".scroll-element");

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
    };

    const displayScrollElement = (element) => {
        element.classList.add("scrolled");
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            }
        });
    };

    window.addEventListener("scroll", () => { 
        handleScrollAnimation();
    });
    
    handleScrollAnimation();

    // Navbar Sombra e Scroll Suave
    const nav = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        } else {
            nav.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // ============================================================
    // PARTE 2: LÓGICA DA CALCULADORA (SEM CPF)
    // ============================================================
    
    // !!! IMPORTANTE: COLOQUE SEU LINK DO SHEETMONKEY AQUI !!!
    const URL_PLANILHA = "https://api.sheetmonkey.io/form/q7Lvt6SKufEmpSNrd8ddK9"; 

    const form = document.getElementById('calcForm');
    
    // Verifica se o formulário existe na página antes de rodar a lógica
    if(form) {
        const btnCalcular = document.getElementById('btnCalcular');
        const loadingArea = document.getElementById('loadingArea');
        const resultArea = document.getElementById('resultArea');
        const btnEnviarZap = document.getElementById('btnEnviarZap');

        const inputNome = document.getElementById('nome');
        // const inputCPF foi removido
        const inputContato = document.getElementById('contato');
        const selectTipo = document.getElementById('tipoContrato');
        const inputOutro = document.getElementById('outroTipo');
        const campoOutro = document.getElementById('campoOutro');
        const inputParcela = document.getElementById('valorParcela');
        const inputTempo = document.getElementById('tempoFinanciamento');

        const displayNovaParcela = document.getElementById('displayNovaParcela');
        const displayParcelaAtual = document.getElementById('displayParcelaAtual');
        const displayBadgeEconomia = document.getElementById('displayBadgeEconomia');
        const displayEconomiaTotal = document.getElementById('displayEconomiaTotal');

        let porcentagemReducao = 0;

        // Mostrar campo "Outro"
        selectTipo.addEventListener('change', function() {
            if (this.value === 'Outro') {
                campoOutro.classList.remove('hidden');
                inputOutro.setAttribute('required', 'true');
            } else {
                campoOutro.classList.add('hidden');
                inputOutro.removeAttribute('required');
                inputOutro.value = '';
            }
        });

        // Máscara Telefone
        inputContato.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g,"");
            v = v.replace(/^(\d{2})(\d)/g,"($1) $2");
            v = v.replace(/(\d)(\d{4})$/,"$1-$2");
            e.target.value = v;
        });

        // Máscara Moeda
        inputParcela.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value === "") { e.target.value = ""; return; }
            value = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            e.target.value = value;
        });

        // Enviar Formulário
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = inputNome.value;
            // CPF removido da coleta
            const whatsapp = inputContato.value;
            let tipo = selectTipo.value;
            if (tipo === 'Outro') tipo = inputOutro.value;

            const valorParcelaTexto = inputParcela.value;
            const valorParcelaNum = parseFloat(valorParcelaTexto.replace(/[R$\s.]/g, '').replace(',', '.'));
            const tempoNum = parseInt(inputTempo.value);

            if (!valorParcelaNum || !tempoNum || valorParcelaNum <= 0) {
                alert("Por favor, preencha os valores corretamente.");
                return;
            }

            btnCalcular.classList.add('hidden');
            resultArea.classList.add('hidden');
            loadingArea.classList.remove('hidden');

            // Salva na planilha (sem CPF)
            salvarNaPlanilha(nome, tipo, whatsapp, valorParcelaTexto, tempoNum);

            setTimeout(() => {
                const fator = Math.random() * (0.45 - 0.30) + 0.30;
                porcentagemReducao = Math.round(fator * 100); 

                const reducaoMensal = valorParcelaNum * fator;
                const novaParcela = valorParcelaNum - reducaoMensal;
                const economiaTotal = reducaoMensal * tempoNum;

                displayNovaParcela.textContent = novaParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                displayParcelaAtual.textContent = valorParcelaTexto;
                displayBadgeEconomia.textContent = `Economia Mensal de ${reducaoMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                displayEconomiaTotal.textContent = economiaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                loadingArea.classList.add('hidden');
                resultArea.classList.remove('hidden');
                
                btnCalcular.textContent = "Recalcular";
                btnCalcular.classList.remove('hidden'); 
                btnCalcular.style.background = "#ccc"; 

            }, 2500);
        });

        // Botão do WhatsApp (Único lugar que leva pro Zap)
        btnEnviarZap.addEventListener('click', () => {
            const nome = inputNome.value;
            let tipo = selectTipo.value;
            if (tipo === 'Outro') tipo = inputOutro.value;
            
            const novaParcela = displayNovaParcela.textContent;
            const parcelaAntiga = displayParcelaAtual.textContent;
            const economiaTotal = displayEconomiaTotal.textContent;
            const phone = "5511946330608"; 

            const message = `*Olá! Fiz a simulação no site e vi que minha parcela pode cair ${porcentagemReducao}%.*%0A%0A` +
                            `👤 *Nome:* ${nome}%0A` +
                            `📄 *Contrato:* ${tipo}%0A` +
                            `-----------------------%0A` +
                            `🔴 *Pago Hoje:* ${parcelaAntiga}%0A` +
                            `🟢 *Parcela Justa:* ${novaParcela}%0A` +
                            `💰 *Economia Total:* ${economiaTotal}%0A` +
                            `-----------------------%0A` +
                            `_Quero garantir esse desconto._`;

            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        });
    }

    // Função de Envio (SheetMonkey) - Atualizada sem CPF
    function salvarNaPlanilha(nome, tipo, whatsapp, valorParcela, tempo) {
        if (URL_PLANILHA.includes("COLE_SUA_URL")) return;

        const dataAtual = new Date().toLocaleDateString('pt-BR'); 

        const dados = {
            "Nome Completo": nome,
            "CPF": "Não informado", // Deixamos fixo ou removemos a coluna
            "Tipo de Contrato": tipo,
            "WhatsApp": whatsapp,
            "Valor da Parcela": valorParcela,
            "Tempo de Financiamento": tempo,
            "Data da Simulação": dataAtual
        };

        fetch(URL_PLANILHA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        }).catch(err => console.error("Erro planilha:", err));
    }
});