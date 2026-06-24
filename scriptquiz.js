let perguntas = [];

let perguntaAtual = 0;
let pontuacao = 0;
let respondeu = false;


const inicio =
    document.getElementById("inicio");

const quiz =
    document.getElementById("quiz");

const btnIniciar =
    document.getElementById("btnIniciar");


const contador =
    document.getElementById("contador");

const pergunta =
    document.getElementById("pergunta");

const alternativas =
    document.getElementById("alternativas");

const resultado =
    document.getElementById("resultado");

const btnProxima =
    document.getElementById("proxima");



btnIniciar.addEventListener(
    "click",
    () => {

        inicio.style.display = "none";
        quiz.style.display = "block";

        carregarPerguntas();
    }
);


// Carregar perguntas da API JSON Server
async function carregarPerguntas() {

    try {

        const resposta =
            await fetch(
                "http://localhost:3000/perguntas"
            );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao acessar API"
            );
        }

        perguntas =
            await resposta.json();

        if (perguntas.length === 0) {

            pergunta.textContent =
                "Nenhuma pergunta encontrada.";

            return;
        }

        mostrarPergunta();

    } catch (erro) {

        pergunta.textContent =
            "Erro ao carregar o quiz.";

        console.error(erro);
    }
}


// mostrar pergunta
function mostrarPergunta() {

    respondeu = false;

    const atual =
        perguntas[perguntaAtual];

    contador.textContent =
        `Pergunta ${perguntaAtual + 1} de ${perguntas.length}`;

    pergunta.textContent =
        atual.pergunta;

    alternativas.innerHTML = "";

    atual.alternativas.forEach(
        (texto, indice) => {

            const botao =
                document.createElement("button");

            botao.textContent =
                texto;

            botao.classList.add("opcao");

            botao.addEventListener(
                "click",
                () =>
                    verificarResposta(indice)
            );

            alternativas.appendChild(botao);
        }
    );
}



function verificarResposta(
    indiceEscolhido
) {

    if (respondeu) return;

    respondeu = true;

    const correta =
        perguntas[perguntaAtual].correta;

    const botoes =
        document.querySelectorAll(
            ".opcao"
        );

    botoes.forEach(
        (botao, indice) => {

            botao.disabled = true;

            if (indice === correta) {

                botao.classList.add(
                    "correta"
                );
            }

            if (
                indice ===
                    indiceEscolhido &&
                indice !== correta
            ) {

                botao.classList.add(
                    "errada"
                );
            }
        }
    );

    if (
        indiceEscolhido === correta
    ) {

        pontuacao++;
    }
}



btnProxima.addEventListener(
    "click",
    () => {

        if (!respondeu) {

            alert(
                "Escolha uma alternativa primeiro!"
            );

            return;
        }

        perguntaAtual++;

        if (
            perguntaAtual <
            perguntas.length
        ) {

            mostrarPergunta();

        } else {

            finalizarQuiz();
        }
    }
);



function finalizarQuiz() {

    contador.textContent = "";

    pergunta.textContent =
        "Quiz Finalizado!";

    alternativas.innerHTML = "";

    resultado.textContent =
        `Você acertou ${pontuacao} de ${perguntas.length} perguntas.`;

    btnProxima.style.display =
        "none";
}