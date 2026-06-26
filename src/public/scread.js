//Começo header Thiago Pereira

function toggleView(viewName) {
    const homeView = document.getElementById('view_home');
    const dashView = document.getElementById('view_dashboard');

    if (!homeView || !dashView) return;

    if (viewName === 'dashboard') {
        homeView.style.display = 'none';
        dashView.style.display = 'block';
    } else {
        homeView.style.display = 'block';
        dashView.style.display = 'none';
    }
}

 // Controla a transição dinâmica de classes de tema no elemento body
function setTheme(themeName) {
    // Remove classes anteriores para evitar conflitos de estilo
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Aplica a nova classe selecionada pelo usuário
    document.body.classList.add(themeName + "-theme");
}

// Inicializador de eventos da página
document.addEventListener("DOMContentLoaded", async function() {

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btn_meu_perfil, #btn_configuracoes');
        if (btn) {
            e.preventDefault();
            toggleView('dashboard');
        }
    });

    const saveBtn = document.getElementById('dash_save_data');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const email = document.getElementById('dash_input_email').value;
            const pass = document.getElementById('dash_input_password').value;

            if (!email || !pass) {
                alert("Por favor, preencha o e-mail e a senha.");
            } else {
                alert("Dados updates com sucesso!");
                document.getElementById('dash_input_email').value = '';
                document.getElementById('dash_input_password').value = '';
            }
        };
    }
//Fim do header

//Configurações - Andreia
//Configurações - Andreia
const mainConfig = document.querySelector('.corpo');
const conteudoConfig = document.querySelector('.linkCont');

// Declaração global das categorias para evitar erro de escopo entre o IF e o ELSE
let investimento, planejamento, aposentadoria, dividas;

// Identificação do usuario - Verifica se já existe um id
if(conteudoConfig){
    conteudoConfig.addEventListener('click', async function(event) {
        event.preventDefault()

        const id = localStorage.getItem('usuarioId');
        let dados = null;
        if (id) {
            const resp = await fetch(`http://localhost:3000/respostasForm/${id}`);
            if (resp.ok) { 
                dados = await resp.json();
            } 
            else {
                //id inválido
                localStorage.removeItem('usuarioId');
            }
        }
        else {
            const resp = await fetch("http://localhost:3000/respostasForm");
            const lista = await resp.json();
            if (lista.length > 0) {
                dados = lista[lista.length - 1];
                // Salva o id encontrado pra não precisar buscar novamente
                localStorage.setItem('usuarioId', dados.id);
            }
        }
        //Carregamento das categorias
        try {
            [investimento, planejamento, aposentadoria, dividas] = await Promise.all([
                carregarInvestimentos(),
                carregarPlanejamentos(),
                carregarAposentadoria(),
                carregarDividas()
            ]);
        } catch(e) {
            console.error("Erro ao carregar categorias:", e);
        }
        console.log("dados:", dados);
        console.log("objetivos:", dados?.objetivos);
        console.log("investimento:", investimento);
        if (dados) {
            //Filtra cards pelos objetivos escolhidos no formulário
            const objetivosUsuario = dados.objetivos;
            let cardsHTML = '';

            const ordemCategorias = ['investimentos', 'planejamento', 'aposentadoria', 'dividas'];

            if (objetivosUsuario.length > 0) {
                const principal = objetivosUsuario[0];
                ordemCategorias.sort((a, b) => a === principal ? -1 : b === principal ? 1 : 0);
            }

            ordemCategorias.forEach(categoria => {
                // Gera cards de investimentos
                if (categoria === 'investimentos' && objetivosUsuario.includes('investimentos') && investimento) {
                    for (let i = 0; i < investimento.tiposInvestimento.length; i++) {
                        const item = investimento.tiposInvestimento[i];
                        cardsHTML += 
                            `<div class="col-12 col-md-6 col-lg-4 d-flex">
                                <a href="investimentos.html" class="text-decoration-none w-100">
                                    <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                                        <div class="card-body d-flex flex-column p-4">
                                            <div class="d-flex align-items-center mb-3">
                                                <div class="bg-success bg-opacity-25 text-success rounded p-2 me-3">
                                                    <i class="fa-solid fa-chart-line fa-lg"></i>
                                                </div>
                                                <h5 class="card-title m-0 text-truncate font-weight-bold" style="color: #e2e8f0; font-size: 1.15rem;">${item.nome}</h5>
                                            </div>
                                            <p class="card-text flex-grow-1" style="color: #94a3b8; font-size: 0.92rem; line-height: 1.5;">
                                                ${item.descrição.substring(0, 65)}...
                                            </p>
                                            <div class="mt-3 text-success d-flex align-items-center gap-1" style="font-size: 0.85rem; font-weight: 600;">
                                                Acessar conteúdo <i class="fa-solid fa-arrow-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                    }
                }

                // Gera cards de planejamentos
                if (categoria === 'planejamento' && objetivosUsuario.includes('planejamento') && planejamento) {
                    for (let i = 0; i < planejamento.tiposMetodo.length; i++) {
                        const item = planejamento.tiposMetodo[i];
                        cardsHTML += 
                            `<div class="col-12 col-md-6 col-lg-4 d-flex">
                                <a href="planejamentos.html" class="text-decoration-none w-100">
                                    <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                                        <div class="card-body d-flex flex-column p-4">
                                            <div class="d-flex align-items-center mb-3">
                                                <div class="bg-info bg-opacity-25 text-info rounded p-2 me-3">
                                                    <i class="fa-solid fa-rotate fa-lg"></i>
                                                </div>
                                                <h5 class="card-title m-0 text-truncate font-weight-bold" style="color: #e2e8f0; font-size: 1.15rem;">${item.nome}</h5>
                                            </div>
                                            <p class="card-text flex-grow-1" style="color: #94a3b8; font-size: 0.92rem; line-height: 1.5;">
                                                ${item.descrição.substring(0, 65)}...
                                            </p>
                                            <div class="mt-3 text-info d-flex align-items-center gap-1" style="font-size: 0.85rem; font-weight: 600;">
                                                Acessar conteúdo <i class="fa-solid fa-arrow-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                    }
                }

                // Gera cards de aposentadoria
                if (categoria === 'aposentadoria' && objetivosUsuario.includes('aposentadoria') && aposentadoria) {
                    for (let i = 0; i < aposentadoria.tiposAposentadoria.length; i++) {
                        const item = aposentadoria.tiposAposentadoria[i];
                        cardsHTML += 
                            `<div class="col-12 col-md-6 col-lg-4 d-flex">
                                <a href="aposentadoria.html" class="text-decoration-none w-100">
                                    <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                                        <div class="card-body d-flex flex-column p-4">
                                            <div class="d-flex align-items-center mb-3">
                                                <div class="bg-warning bg-opacity-25 text-warning rounded p-2 me-3">
                                                    <i class="fa-solid fa-wallet fa-lg"></i>
                                                </div>
                                                <h5 class="card-title m-0 text-truncate font-weight-bold" style="color: #e2e8f0; font-size: 1.15rem;">${item.nome}</h5>
                                            </div>
                                            <p class="card-text flex-grow-1" style="color: #94a3b8; font-size: 0.92rem; line-height: 1.5;">
                                                ${item.descricao.substring(0, 65)}...
                                            </p>
                                            <div class="mt-3 text-warning d-flex align-items-center gap-1" style="font-size: 0.85rem; font-weight: 600;">
                                                Acessar conteúdo <i class="fa-solid fa-arrow-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                    }
                }

                // Gera cards de dividas
                if (categoria === 'dividas' && objetivosUsuario.includes('dividas') && dividas) {
                    for (let i = 0; i < dividas.tiposDivida.length; i++) {
                        const item = dividas.tiposDivida[i];
                        cardsHTML += 
                            `<div class="col-12 col-md-6 col-lg-4 d-flex">
                                <a href="dividas.html" class="text-decoration-none w-100">
                                    <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                                        <div class="card-body d-flex flex-column p-4">
                                            <div class="d-flex align-items-center mb-3">
                                                <div class="bg-danger bg-opacity-25 text-danger rounded p-2 me-3">
                                                    <i class="fa-solid fa-file-invoice-dollar fa-lg"></i>
                                                </div>
                                                <h5 class="card-title m-0 text-truncate font-weight-bold" style="color: #e2e8f0; font-size: 1.15rem;">${item.nome}</h5>
                                            </div>
                                            <p class="card-text flex-grow-1" style="color: #94a3b8; font-size: 0.92rem; line-height: 1.5;">
                                                ${item.descricao.substring(0, 65)}...
                                            </p>
                                            <div class="mt-3 text-danger d-flex align-items-center gap-1" style="font-size: 0.85rem; font-weight: 600;">
                                                Acessar conteúdo <i class="fa-solid fa-arrow-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                    }
                }
            });

            //Todos os cards gerados na tela em formato de Grid Dinâmico
            mainConfig.innerHTML = `<div class="row g-4 justify-content-start p-2">${cardsHTML}</div>`;
            
            //Histórico de visitação
            const cards = mainConfig.querySelectorAll('a.text-decoration-none');

            for (let i = 0; i < cards.length; i++) {
                cards[i].addEventListener('click', async function() {

                    const nomeCard = this.querySelector('.card-title').textContent;
                    const paginaCard = this.getAttribute('href'); 

                    const usuarioId = localStorage.getItem('usuarioId');

                    try {
                        //Busca o histórico existente
                        const respHist = await fetch(`http://localhost:3000/historicoVisitacao?usuarioId=${usuarioId}`);
                        const listaHist = await respHist.json(); 

                        const novaVisita = {
                            nome: nomeCard,
                            pagina: paginaCard,
                            visitadoEm: new Date().toISOString()
                        };
                        //Confirma se o histórico pertence ao usuário
                        const histExistente = listaHist.find(h => h.usuarioId === usuarioId);

                        if (histExistente) {
                            histExistente.conteudosVisitados.push(novaVisita);

                            const respPatch = await fetch(`http://localhost:3000/historicoVisitacao/${histExistente.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ conteudosVisitados: histExistente.conteudosVisitados })
                            }); 

                            if (respPatch.ok) {
                                console.log('Histórico updated:', novaVisita);
                            } else {
                                console.error('Erro ao atualizar histórico:', respPatch.status);
                            }
                        }
                        else {
                            //Histórico inexistente
                            const respPost = await fetch('http://localhost:3000/historicoVisitacao', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    usuarioId: usuarioId,
                                    objetivos: dados.objetivos,
                                    conteudosVisitados: [novaVisita]
                                })
                            });
                            if (respPost.ok) {
                                const registrado = await respPost.json();
                                console.log('Histórico criado com id:', registrado.id);
                            } 
                            else {
                                console.error('Erro ao criar histórico:', respPost.status);
                            }
                        } 
                    }
                    catch (error) {
                        console.error('Falha na conexão:', error);
                    }
                });
            }
        }
    });
}
else {
    // Caso o elemento linkCont não exista, carrega os dados padrão preventivamente
    try {
        [investimento, planejamento, aposentadoria, dividas] = await Promise.all([
            carregarInvestimentos(),
            carregarPlanejamentos(),
            carregarAposentadoria(),
            carregarDividas()
        ]);
    } catch(e) { console.error("Erro ao pré-carregar dados offline:", e); }

    //Caso o usuário não seja identificado
    if(mainConfig) {
        mainConfig.innerHTML = 
            `<div class="row g-4 justify-content-start p-2">
                <div class="col-12 col-md-6 col-lg-3 d-flex">
                    <a href="investimentos.html" class="text-decoration-none w-100">
                        <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                            <div class="card-body p-4">
                                <h5 class="card-title font-weight-bold text-truncate" style="color: #e2e8f0;">${investimento?.titulo ?? 'Investimentos'}</h5>
                                <p class="card-text" style="color: #94a3b8; font-size: 0.9rem;">${investimento?.descrição?.substring(0, 50) ?? ''}...</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="col-12 col-md-6 col-lg-3 d-flex">
                    <a href="planejamentos.html" class="text-decoration-none w-100">
                        <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                            <div class="card-body p-4">
                                <h5 class="card-title font-weight-bold text-truncate" style="color: #e2e8f0;">${planejamento?.titulo ?? 'Planejamento'}</h5>
                                <p class="card-text" style="color: #94a3b8; font-size: 0.9rem;">${planejamento?.descricao?.substring(0, 50) ?? ''}...</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="col-12 col-md-6 col-lg-3 d-flex">
                    <a href="aposentadoria.html" class="text-decoration-none w-100">
                        <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                            <div class="card-body p-4">
                                <h5 class="card-title font-weight-bold text-truncate" style="color: #e2e8f0;">${aposentadoria?.titulo ?? 'Aposentadoria'}</h5>
                                <p class="card-text" style="color: #94a3b8; font-size: 0.9rem;">${aposentadoria?.descricao?.substring(0, 50) ?? ''}...</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="col-12 col-md-6 col-lg-3 d-flex">
                    <a href="dividas.html" class="text-decoration-none w-100">
                        <div class="card h-100 border-0 text-white card-interativo-fina" style="background: #1e2d4a; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                            <div class="card-body p-4">
                                <h5 class="card-title font-weight-bold text-truncate" style="color: #e2e8f0;">${dividas?.titulo ?? 'Dívidas'}</h5>
                                <p class="card-text" style="color: #94a3b8; font-size: 0.9rem;">${dividas?.descricao?.substring(0, 50) ?? ''}...</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>`;
    }
}
//Fim das configurações

//Começo formulário  
const form = document.getElementById("perguntas");
if(form){
    form.addEventListener("submit", async function(event){
        event.preventDefault(); 

        const nivel = form.nivel.value;
        const faixa = form.faixa.value;
        const checkboxes = form.objetivos;
        const objetivos = [];

        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            if (checkbox.checked) {
                objetivos.push(checkbox.value);
            }
        }
        const salario = document.getElementById("salario").value;
        const comentario = document.getElementById("comentario").value;

        const dadosUsuario = {
            nivel: nivel,
            faixa: faixa,
            objetivos: objetivos,
            salario: salario,
            comentario: comentario
        };
        try{
            const response = await fetch("http://localhost:3000/respostasForm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosUsuario)
            });

            if (response.ok) {
                const dadosSalvos = await response.json();
                localStorage.setItem('usuarioId', dadosSalvos.id);
                console.log("JSON enviado:", dadosUsuario);

                const modal = bootstrap.Modal.getInstance(document.getElementById("formModal"));
                modal.hide();
                alert("Formulário enviado com sucesso!");
            } else {
                alert("Erro ao enviar formulário!");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Falha na conexão com o servidor.");
        }
    });
}
//Fim formulário 

});

// Começo categorias
/* dados investimento*/
async function carregarInvestimentos() {

    /* buscar dados no JSON Server */
    const resposta = await fetch("http://localhost:3000/investimentos");
    const investimentos = await resposta.json();
    
    /* imprimir título e descrição */
    var divOutput = document.getElementById("output");
    if (divOutput) {
        divOutput.innerHTML = `
        <h1 class="titulo px-4 pt-4 mb-2">
        <a href="index.html">
        <i class="fa-solid fa-chart-column"></i></a>
        ${investimentos.titulo}
        </h1>
        
        <h4 class="mx-4">
        ${investimentos.descrição}
        </h4>
        `;

        /* imprimir lista de vantagens */
        var lista = "";
        for (let i = 0; i < investimentos.vantagens.length; i++) {
            lista += `<li>${investimentos.vantagens[i]}</li>`;
        }
        
        divOutput.innerHTML += `
        <h2 class="m-4"><i class="fa-solid fa-bolt"></i> Vantagens</h2>
        <ul>${lista}</ul>
        `;
        
        /* título dos cards */
        divOutput.innerHTML += `<h2 class="m-4 text-center">Principais Investimentos</h2>`;
        
        /* imprimir cards */
        let cards = `<div class="row row-cols-1 row-cols-md-2 g-4 justify-content-center">`;

        for (let i = 0; i < investimentos.tiposInvestimento.length; i++) {
            cards += `
            <div class="col d-flex justify-content-center">
            <div class="card m-2 w-100">
            <div class="card-body">
            <h5 class="card-title"><i class="fa-solid fa-chart-line"></i> ${investimentos.tiposInvestimento[i].nome}</h5>
            <p class="card-text text-bg-success p-3">${investimentos.tiposInvestimento[i].classificação}</p>
            <p class="card-text">${investimentos.tiposInvestimento[i].descrição}</p>
            </div>
            </div>
            </div>
            `;
        }
        
        cards += `</div>`;
        divOutput.innerHTML += cards;

        /* imprimir dica */
        divOutput.innerHTML += `
        <h4 class="dica"><i class="fa-solid fa-lightbulb"></i> ${investimentos.dica}</h4>
        `;
    }
    return investimentos;
}


/* dados planejamento */
async function carregarPlanejamentos() {

    /* buscar dados no JSON Server */
    const resposta = await fetch("http://localhost:3000/planejamentos");
    const planejamentos = await resposta.json();
    
    /* imprimir título e descrição */
    var divOutput = document.getElementById("output");
    if (divOutput) {
        divOutput.innerHTML = `
        <h1 class="titulo px-4 pt-4 mb-2">
        <a href="index.html">
        <i class="fa-solid fa-folder-open"></i></a>
        ${planejamentos.titulo}
        </h1>
        
        <h4 class="mx-4">
        ${planejamentos.descricao}
        </h4>
        `;
        
        /* imprimir lista de vantagens */
        var lista = "";
        for (let i = 0; i < planejamentos.vantagens.length; i++) {
            lista += `<li>${planejamentos.vantagens[i]}</li>`;
        }
        
        divOutput.innerHTML += `
        <h2 class="m-4"><i class="fa-solid fa-bolt"></i> Vantagens</h2>
        <ul>${lista}</ul>
        `;
        
        /* título dos cards */
        divOutput.innerHTML += `
        <h2 class="m-4 text-center">Métodos Para Planejar o Uso da Renda</h2>
        `;
        
        /* imprimir cards */
        let cards = `<div class="row row-cols-1 row-cols-md-2 g-4 justify-content-center">`;
        
        for (let i = 0; i < planejamentos.tiposMetodo.length; i++) {
            cards += `
            <div class="col d-flex justify-content-center">
            <div class="card m-2 w-100">
            <div class="card-body">
            <h5 class="card-title"><i class="fa-solid fa-rotate"></i> ${planejamentos.tiposMetodo[i].nome}</h5>
            <p class="card-text">${planejamentos.tiposMetodo[i].descrição}</p>
            </div>
            </div>
            </div>
            `;
        }
        
        cards += `</div>`;
        divOutput.innerHTML += cards;
        
        /* imprimir dica */
        divOutput.innerHTML += `
        <h4 class="dica"><i class="fa-solid fa-lightbulb"></i> ${planejamentos.dica}</h4>
        `;
    }
    return planejamentos;
}


/* dados aposentadoria */
async function carregarAposentadoria() {

    /* buscar dados no JSON Server */
    const resposta = await fetch("http://localhost:3000/aposentadoria");
    const aposentadoria = await resposta.json();
    
    /* imprimir título e descrição */
    var divOutput = document.getElementById("output");
    if (divOutput) {
        divOutput.innerHTML = `
        <h1 class="titulo px-4 pt-4 mb-2">
        <a href="index.html">
        <i class="fa-solid fa-piggy-bank"></i></a>
        ${aposentadoria.titulo}
        </h1>
        
        <h4 class="mx-4">
        ${aposentadoria.descricao}
        </h4>
        `;
        
        /* imprimir lista de vantagens */
        var lista = "";
        for (let i = 0; i < aposentadoria.vantagens.length; i++) {
            lista += `<li>${aposentadoria.vantagens[i]}</li>`;
        }
        
        divOutput.innerHTML += `
        <h2 class="m-4"><i class="fa-solid fa-bolt"></i> Vantagens</h2>
        <ul>${lista}</ul>
        `;
        
        /* título dos cards */
        divOutput.innerHTML += `
        <h2 class="m-4 text-center">Principais Formas de Construir a Aposentadoria</h2>
        `;
        
        /* imprimir cards */
        let cards = `<div class="row row-cols-1 row-cols-md-2 g-4 justify-content-center">`;
        
        for (let i = 0; i < aposentadoria.tiposAposentadoria.length; i++) {
            cards += `
            <div class="col d-flex justify-content-center">
            <div class="card m-2 w-100">
            <div class="card-body">
            <h5 class="card-title"><i class="fa-solid fa-wallet"></i> ${aposentadoria.tiposAposentadoria[i].nome}</h5>
            <p class="card-text">${aposentadoria.tiposAposentadoria[i].descricao}</p>
            </div>
            </div>
            </div>
            `;
        }
        
        cards += `</div>`;
        divOutput.innerHTML += cards;
        
        /* imprimir dica */
        divOutput.innerHTML += `
        <h4 class="dica"><i class="fa-solid fa-lightbulb"></i> ${aposentadoria.dica}</h4>
        `;
    }
    return aposentadoria;
}


/* dados dívidas */
async function carregarDividas() {
    
    /* buscar dados no JSON Server */
    const resposta = await fetch("http://localhost:3000/dividas");
    const dividas = await resposta.json();
    
    /* imprimir título e descrição */
    var divOutput = document.getElementById("output");
    if (divOutput) {
        divOutput.innerHTML = `
        <h1 class="titulo px-4 pt-4 mb-2">
        <a href="index.html">
        <i class="fa-solid fa-money-bill-wave"></i></a>
        ${dividas.titulo}
        </h1>
        
        <h4 class="mx-4">
        ${dividas.descricao}
        </h4>
        `;
        
        /* seção juros compostos */
        divOutput.innerHTML += `
        <h2 class="m-4">
        <i class="fa-solid fa-percent"></i>
        Você sabe o que é juros compostos ?
        </h2>
        
        <p class="mx-4">
        Os juros compostos ocorrem quando os juros são calculados não apenas sobre o valor inicial, mas também sobre os juros acumulados ao longo do tempo, ou seja, é gerado juros sobre juros. Nas dívidas, isso pode fazer o valor crescer rapidamente quando há atrasos no pagamento, principalmente em modalidades como cartão de crédito e cheque especial, fazendo com que o débito vire uma bola de neve.
        </p>
    `;

        /* título dos cards */
        divOutput.innerHTML += `
        <h2 class="m-4 text-center">Principais Tipos de Dívidas</h2>
        `;
        
        /* imprimir cards */
        let cards = `<div class="row row-cols-1 row-cols-md-2 g-4 justify-content-center">`;
        
        for (let i = 0; i < dividas.tiposDivida.length; i++) {
            cards += `
            <div class="col d-flex justify-content-center">
            <div class="card m-2 w-100">
            <div class="card-body">
            <h5 class="card-title"><i class="fa-solid fa-file-invoice-dollar"></i> ${dividas.tiposDivida[i].nome}</h5>
            <p class="card-text text-bg-danger p-3">${dividas.tiposDivida[i].classificacao}</p>
            <p class="card-text">${dividas.tiposDivida[i].descricao}</p>
            </div>
            </div>
            </div>
            `;
        }
        
        cards += `</div>`;
        divOutput.innerHTML += cards;
        
        /* imprimir dica */
        divOutput.innerHTML += `
        <h4 class="dica"><i class="fa-solid fa-lightbulb"></i> ${dividas.dica}</h4>
        `;
    }
    return dividas;
}
//Fim categorias

//Começo simulações
const API_URL = "http://localhost:3000/simulacoes";
const TAXA_CDI_MENSAL = 0.83;

function ValorInvalido(campo) {
  campo.classList.add("is-invalid");
}

window.onload = function () {
  if (document.getElementById('corpoTabela')) carregarHistorico();
  if (document.getElementById('TipoInvestimento')) atualizarLabels();
};

function atualizarLabels() {
  const tipo = document.getElementById("TipoInvestimento").value;
  const labelJuros = document.getElementById("labelJuros");
  const inputJuros = document.getElementById("Juros");
  const helpJuros = document.getElementById("helpJuros");

  // Limpa o valor digitado anteriormente para o placeholder aparecer limpo
  inputJuros.value = ""; 

  if (tipo === "nominal") {
    labelJuros.innerText = "Taxa de Juros (% ao mês)";
    inputJuros.placeholder = "Ex: 0.50"; 
    helpJuros.innerText = "Simulação baseada no rendimento mensal padrão da Poupança.";
  } else if (tipo === "cdi") {
    labelJuros.innerText = "Rentabilidade (% do CDI)";
    inputJuros.placeholder = "Ex: 100"; 
    helpJuros.innerText = `Considerando o CDI atual em torno de ${TAXA_CDI_MENSAL}% ao mês. 100% do CDI reflete contas como Nubank e Banco Inter.`;
  } else if (tipo === "cdb") {
    labelJuros.innerText = "Taxa Equivalente Isenta (% ao ano)";
    inputJuros.placeholder = "Ex: 11.5";
    helpJuros.innerText = "A taxa anual oferecida para ativos de Renda Fixa. O sistema vai calcular o equivalente exato por mês.";
  }
}

function simular() {
  let aporte = parseFloat(
    document.getElementById("Aporte").value.replace(",", "."),
  );
  let juros = parseFloat(
    document.getElementById("Juros").value.replace(",", "."),
  );
  let tempo = parseInt(document.getElementById("Tempo").value);
  let tipo = document.getElementById("TipoInvestimento").value;
  let result = 0;
  let valido = true;

  if (isNaN(aporte) || aporte < 0) {
    valido = false;
    ValorInvalido(document.getElementById("Aporte"));
  } else {
    document.getElementById("Aporte").classList.remove("is-invalid"); // Remove a classe de erro se o valor for válido
  }

  if (isNaN(juros) || juros < 0) {
    valido = false;
    ValorInvalido(document.getElementById("Juros"));
  } else {
    document.getElementById("Juros").classList.remove("is-invalid");
  }

  if (isNaN(tempo) || tempo < 1 || tempo > 60) { // Tempo maximo de 5 anos para evitar simulações irreais
    valido = false;
    ValorInvalido(document.getElementById("Tempo"));
  } else {
    document.getElementById("Tempo").classList.remove("is-invalid");
  }

  if (valido) {
    let jurosMensalCalculado = 0;
    let nomeTipoAmigavel = "";

    // 1. Define o nome correto e faz o cálculo baseado no value em texto do HTML
    if (tipo === "nominal") {
      nomeTipoAmigavel = "POUPANÇA";
      jurosMensalCalculado = juros; // Usa a taxa mensal direta (ex: 0.5)
    } else if (tipo === "cdi") {
      nomeTipoAmigavel = "CDB / TESOURO (CDI)";
      jurosMensalCalculado = (juros / 100) * TAXA_CDI_MENSAL; // Se for 100% do CDI -> 0.83%
    } else if (tipo === "cdb") {
      nomeTipoAmigavel = "LCI / LCA (ANUAL)";
      let taxaAnualDecimal = juros / 100;
      jurosMensalCalculado = ((1 + taxaAnualDecimal) ** (1 / 12) - 1) * 100; // Converte taxa anual para mensal
    }

    // 2. Aplica a fórmula de juros compostos
    result = aporte * (1 + jurosMensalCalculado / 100) ** tempo;

    document.getElementById("Montante").value = "R$ " + result.toFixed(2);

    const novaSimulacao = {
      dataHora: new Date().toLocaleString("pt-BR"),
      aporte: aporte,
      juros: juros,
      tempo: tempo,
      tipo: nomeTipoAmigavel,
      total: result,
    };

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaSimulacao),
    })
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Erro ao salvar no servidor");
        return resposta.json();
      })
      .then(() => {
        carregarHistorico();
      })
      .catch((erro) => console.error("Erro na comunicação com a API:", erro));
  }
}

function carregarHistorico() {
  fetch(API_URL)
    .then((resposta) => {
      if (!resposta.ok) throw new Error("Erro ao buscar histórico");
      return resposta.json();
    })
    .then((dados) => {
      let tabela = document.getElementById("corpoTabela");
      tabela.innerHTML = "";

      dados.forEach((item) => {
        let novaLinha = document.createElement("tr");
        novaLinha.innerHTML = `
          <td><small class="text-muted">${item.dataHora || "---"}</small></td>
          <td>R$ ${parseFloat(item.aporte).toFixed(2)}</td>
          <td>${item.juros}% (${item.tipo || "NOMINAL"})</td>
          <td>${item.tempo} meses</td>
          <td><strong>R$ ${parseFloat(item.total).toFixed(2)}</strong></td>
        `;
        tabela.prepend(novaLinha);
      });
    })
    .catch((erro) => console.error("Erro ao carregar histórico:", erro));
}

function limparCampos() {
  document.getElementById("Aporte").value = "";
  document.getElementById("Juros").value = "";
  document.getElementById("Tempo").value = "";
  document.getElementById("Montante").value = "";
  document.getElementById("Aporte").classList.remove("is-invalid");
  document.getElementById("Juros").classList.remove("is-invalid");
  document.getElementById("Tempo").classList.remove("is-invalid");
}

function limparHistorico() {
  if (
    confirm("Tem certeza que deseja apagar todo o histórico de simulações?")
  ) {
    fetch(API_URL)
      .then((resposta) => resposta.json())
      .then((dados) => {
        let deletarPromessas = dados.map((item) =>
          fetch(`${API_URL}/${item.id}`, { method: "DELETE" }),
        );

        Promise.all(deletarPromessas).then(() => {
          document.getElementById("corpoTabela").innerHTML = "";
        });
      })
      .catch((erro) =>
        console.error("Erro ao limpar histórico no servidor:", erro),
      );
  }
}
//Fim de simulações