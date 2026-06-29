// =============================================
// TOGGLE VIEW E TEMA
// =============================================
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

function setTheme(theme) {
  document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
}

// =============================================
// CONFIGURAÇÕES - CARDS BASEADOS NO FORMULÁRIO
// =============================================
document.addEventListener('DOMContentLoaded', function () {
  const mainConfig = document.querySelector('.corpo');
  const conteudoConfig = document.querySelector('.linkCont');

  // Botão Perfil -> abre dashboard
  const btnPerfil = document.getElementById('btn_meu_perfil');
  if (btnPerfil) btnPerfil.addEventListener('click', () => toggleView('dashboard'));

  // Submit do formulário de perfil
  const form = document.getElementById('perguntas');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const nivel = form.nivel.value;
      const faixa = form.faixa.value;
      const checkboxes = form.querySelectorAll('input[name="objetivos"]:checked');
      const objetivos = Array.from(checkboxes).map(c => c.value);
      const salario = document.getElementById('salario').value;
      const comentario = document.getElementById('comentario').value;

      try {
        const resp = await fetch('http://localhost:3000/respostasForm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nivel, faixa, objetivos, salario, comentario })
        });
        if (resp.ok) {
          const salvo = await resp.json();
          localStorage.setItem('usuarioId', salvo.id);
          const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
          modal.hide();
          alert('Formulário enviado com sucesso!');
        } else {
          alert('Erro ao enviar formulário!');
        }
      } catch (err) {
        console.error('Erro:', err);
        alert('Falha na conexão com o servidor.');
      }
    });
  }

  // Botão Conteúdos -> gera cards
  if (conteudoConfig) {
    conteudoConfig.addEventListener('click', async function (e) {
      e.preventDefault();

      // Busca dados do usuário
      let dados = null;
      const id = localStorage.getItem('usuarioId');
      if (id) {
        const resp = await fetch(`http://localhost:3000/respostasForm/${id}`);
        if (resp.ok) dados = await resp.json();
        else localStorage.removeItem('usuarioId');
      }
      if (!dados) {
        const resp = await fetch('http://localhost:3000/respostasForm');
        const lista = await resp.json();
        if (lista.length > 0) {
          dados = lista[lista.length - 1];
          localStorage.setItem('usuarioId', dados.id);
        }
      }

      // Carrega categorias em paralelo
      let investimento, planejamento, aposentadoria, dividas;
      try {
        [investimento, planejamento, aposentadoria, dividas] = await Promise.all([
          fetch('http://localhost:3000/investimentos').then(r => r.json()),
          fetch('http://localhost:3000/planejamentos').then(r => r.json()),
          fetch('http://localhost:3000/aposentadoria').then(r => r.json()),
          fetch('http://localhost:3000/dividas').then(r => r.json()),
        ]);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }

      if (!dados) {
        // Sem formulário: mostra todas as categorias
        mainConfig.innerHTML = `
          <div class="row g-4">
            <div class="col-md-6 col-lg-3"><a href="investimentos.html" class="text-decoration-none"><div class="card h-100 border-0 text-white p-3" style="background:#1e2d4a;border-radius:12px;"><h5>${investimento?.titulo ?? 'Investimentos'}</h5><p style="color:#94a3b8;font-size:.9rem;">${investimento?.descricao?.substring(0,60) ?? ''}...</p><span class="text-success" style="font-size:.85rem;">Acessar <i class="fa-solid fa-arrow-right"></i></span></div></a></div>
            <div class="col-md-6 col-lg-3"><a href="planejamentos.html" class="text-decoration-none"><div class="card h-100 border-0 text-white p-3" style="background:#1e2d4a;border-radius:12px;"><h5>${planejamento?.titulo ?? 'Planejamentos'}</h5><p style="color:#94a3b8;font-size:.9rem;">${planejamento?.descricao?.substring(0,60) ?? ''}...</p><span class="text-info" style="font-size:.85rem;">Acessar <i class="fa-solid fa-arrow-right"></i></span></div></a></div>
            <div class="col-md-6 col-lg-3"><a href="aposentadoria.html" class="text-decoration-none"><div class="card h-100 border-0 text-white p-3" style="background:#1e2d4a;border-radius:12px;"><h5>${aposentadoria?.titulo ?? 'Aposentadoria'}</h5><p style="color:#94a3b8;font-size:.9rem;">${aposentadoria?.descricao?.substring(0,60) ?? ''}...</p><span class="text-warning" style="font-size:.85rem;">Acessar <i class="fa-solid fa-arrow-right"></i></span></div></a></div>
            <div class="col-md-6 col-lg-3"><a href="dividas.html" class="text-decoration-none"><div class="card h-100 border-0 text-white p-3" style="background:#1e2d4a;border-radius:12px;"><h5>${dividas?.titulo ?? 'Dívidas'}</h5><p style="color:#94a3b8;font-size:.9rem;">${dividas?.descricao?.substring(0,60) ?? ''}...</p><span class="text-danger" style="font-size:.85rem;">Acessar <i class="fa-solid fa-arrow-right"></i></span></div></a></div>
          </div>`;
        return;
      }

      // Com formulário: filtra e prioriza pelos objetivos
      const objetivosUsuario = Array.isArray(dados.objetivos) ? dados.objetivos : [];
      const ordemCategorias = ['investimentos', 'planejamento', 'aposentadoria', 'dividas'];
      if (objetivosUsuario.length > 0) {
        ordemCategorias.sort((a, b) => a === objetivosUsuario[0] ? -1 : b === objetivosUsuario[0] ? 1 : 0);
      }

      let cardsHTML = '';

      const cores = {
        investimentos: { cor: 'success', icone: 'chart-line', link: 'investimentos.html' },
        planejamento:  { cor: 'info',    icone: 'rotate',     link: 'planejamentos.html' },
        aposentadoria: { cor: 'warning', icone: 'wallet',     link: 'aposentadoria.html' },
        dividas:       { cor: 'danger',  icone: 'file-invoice-dollar', link: 'dividas.html' },
      };

      ordemCategorias.forEach(cat => {
        if (!objetivosUsuario.includes(cat)) return;
        const { cor, icone, link } = cores[cat];

        let itens = [];
        if (cat === 'investimentos' && investimento?.tiposInvestimento) itens = investimento.tiposInvestimento.map(i => ({ nome: i.nome, desc: i.descrição }));
        if (cat === 'planejamento'  && planejamento?.tiposMetodo)      itens = planejamento.tiposMetodo.map(i => ({ nome: i.nome, desc: i.descrição }));
        if (cat === 'aposentadoria' && aposentadoria?.tiposAposentadoria) itens = aposentadoria.tiposAposentadoria.map(i => ({ nome: i.nome, desc: i.descricao }));
        if (cat === 'dividas'       && dividas?.tiposDivida)           itens = dividas.tiposDivida.map(i => ({ nome: i.nome, desc: i.descricao }));

        itens.forEach(item => {
          cardsHTML += `
            <div class="col-12 col-md-6 col-lg-4 d-flex">
              <a href="${link}" class="text-decoration-none w-100">
                <div class="card h-100 border-0 text-white" style="background:#1e2d4a;border-radius:12px;">
                  <div class="card-body d-flex flex-column p-4">
                    <div class="d-flex align-items-center mb-3">
                      <div class="bg-${cor} bg-opacity-25 text-${cor} rounded p-2 me-3">
                        <i class="fa-solid fa-${icone} fa-lg"></i>
                      </div>
                      <h5 class="card-title m-0" style="color:#e2e8f0;">${item.nome}</h5>
                    </div>
                    <p class="card-text flex-grow-1" style="color:#94a3b8;font-size:.92rem;">${(item.desc ?? '').substring(0, 80)}...</p>
                    <div class="mt-3 text-${cor}" style="font-size:.85rem;font-weight:600;">
                      Acessar conteúdo <i class="fa-solid fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </a>
            </div>`;
        });
      });

      mainConfig.innerHTML = `<div class="row g-4">${cardsHTML}</div>`;

      // Registra histórico de visitação ao clicar
      mainConfig.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', async function () {
          const nome = this.querySelector('.card-title')?.textContent ?? '';
          const pagina = this.getAttribute('href');
          const usuarioId = localStorage.getItem('usuarioId');
          try {
            const r = await fetch(`http://localhost:3000/historicoVisitacao?usuarioId=${usuarioId}`);
            const lista = await r.json();
            const visita = { nome, pagina, visitadoEm: new Date().toISOString() };
            const existente = lista.find(h => h.usuarioId === usuarioId);
            if (existente) {
              existente.conteudosVisitados.push(visita);
              await fetch(`http://localhost:3000/historicoVisitacao/${existente.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudosVisitados: existente.conteudosVisitados })
              });
            } else {
              await fetch('http://localhost:3000/historicoVisitacao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, objetivos: dados.objetivos, conteudosVisitados: [visita] })
              });
            }
          } catch (err) {
            console.error('Erro ao registrar visita:', err);
          }
        });
      });
    });
  }
});