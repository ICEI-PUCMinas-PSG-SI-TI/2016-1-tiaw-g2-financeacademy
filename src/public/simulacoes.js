//Começo simulações
const API_URL = "http://localhost:3000/simulacoes";
const TAXA_CDI_MENSAL = 0.83;

function ValorInvalido(campo) {
  campo.classList.add("is-invalid");
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('corpoTabela')) carregarHistorico();
  if (document.getElementById('TipoInvestimento')) atualizarLabels();
});

function atualizarLabels() {
  const tipo = document.getElementById("TipoInvestimento").value;
  const labelJuros = document.getElementById("labelJuros");
  const inputJuros = document.getElementById("Juros");
  const helpJuros = document.getElementById("helpJuros");

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
  let aporte = parseFloat(document.getElementById("Aporte").value.replace(",", "."));
  let juros = parseFloat(document.getElementById("Juros").value.replace(",", "."));
  let tempo = parseInt(document.getElementById("Tempo").value);
  let tipo = document.getElementById("TipoInvestimento").value;
  let result = 0;
  let valido = true;

  if (isNaN(aporte) || aporte < 0) {
    valido = false;
    ValorInvalido(document.getElementById("Aporte"));
  } else {
    document.getElementById("Aporte").classList.remove("is-invalid");
  }

  if (isNaN(juros) || juros < 0) {
    valido = false;
    ValorInvalido(document.getElementById("Juros"));
  } else {
    document.getElementById("Juros").classList.remove("is-invalid");
  }

  if (isNaN(tempo) || tempo < 1 || tempo > 60) {
    valido = false;
    ValorInvalido(document.getElementById("Tempo"));
  } else {
    document.getElementById("Tempo").classList.remove("is-invalid");
  }

  if (valido) {
    let jurosMensalCalculado = 0;
    let nomeTipoAmigavel = "";

    if (tipo === "nominal") {
      nomeTipoAmigavel = "POUPANÇA (NOMINAL)";
      jurosMensalCalculado = juros;
    } else if (tipo === "cdi") {
      nomeTipoAmigavel = "CDB / TESOURO (CDI)";
      jurosMensalCalculado = (juros / 100) * TAXA_CDI_MENSAL;
    } else if (tipo === "cdb") {
      nomeTipoAmigavel = "LCI / LCA (ANUAL)";
      let taxaAnualDecimal = juros / 100;
      jurosMensalCalculado = ((1 + taxaAnualDecimal) ** (1 / 12) - 1) * 100;
    }

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
      .then(() => carregarHistorico())
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
  if (confirm("Tem certeza que deseja apagar todo o histórico de simulações?")) {
    fetch(API_URL)
      .then((resposta) => resposta.json())
      .then((dados) => {
        let deletarPromessas = dados.map((item) =>
          fetch(`${API_URL}/${item.id}`, { method: "DELETE" })
        );
        Promise.all(deletarPromessas).then(() => {
          document.getElementById("corpoTabela").innerHTML = "";
        });
      })
      .catch((erro) => console.error("Erro ao limpar histórico no servidor:", erro));
  }
}
//Fim de simulações

// Bloqueia letras nos campos numéricos
document.addEventListener('DOMContentLoaded', function () {
  const camposNumericos = ['Aporte', 'Juros', 'Tempo'];
  camposNumericos.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      // Permite apenas números, ponto e vírgula
      this.value = this.value.replace(/[^0-9.,]/g, '');
    });
    el.addEventListener('keypress', function (e) {
      const permitido = /[0-9.,]/.test(e.key);
      if (!permitido) e.preventDefault();
    });
  });
});