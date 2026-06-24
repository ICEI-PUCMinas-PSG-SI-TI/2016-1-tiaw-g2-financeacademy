
/*Limitar casas decimais*/

document.querySelectorAll('.campo-valor').forEach(input => {
    input.addEventListener('input', function () {
        let valor = this.value.replace(/\D/g, '');
        valor = (parseInt(valor || '0') / 100).toFixed(2);
        valor = valor.replace('.', ',');
        this.value = valor;
    });
});

/*Adicionar renda ao JSON Server*/
document.querySelector('.btn-renda').addEventListener('click', async function () {
    const input = document.querySelector('#input-renda');
    const valor = parseFloat(input.value.replace(',', '.'));

    if (!valor || valor <= 0) {
        alert('Informe um valor válido!');
        return;
    }

    const renda = {
        valor: valor,
        data: new Date().toLocaleDateString('pt-BR')
    };

    const response = await fetch('http://localhost:3000/rendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renda)
    });

    if (response.ok) {
        alert('Renda adicionada!');
        input.value = '0,00';

    }
});

/*Adicionar despesa ao JSON Server*/
document.querySelector('.btn-despesa').addEventListener('click', async function () {
    const inputDescricao = document.querySelector('#input-descricao');
    const inputValor = document.querySelector('#input-despesa');

    const descricao = inputDescricao.value.trim();
    const valor = parseFloat(inputValor.value.replace(',', '.'));

    if (!descricao) {
        alert('Informe uma descrição!');
        return;
    }

    if (!valor || valor <= 0) {
        alert('Informe um valor válido!');
        return;
    }

    const despesa = {
        descricao: descricao,
        valor: valor,
        data: new Date().toLocaleDateString('pt-BR')
    };

    const response = await fetch('http://localhost:3000/despesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(despesa)
    });

    if (response.ok) {
        alert('Despesa adicionada!');
        inputDescricao.value = '';
        inputValor.value = '0,00';

    }
});

/*Resultado*/

document.getElementById('btn-resultado').addEventListener('click', atualizarResultado);

async function atualizarResultado() {
    const [rendas, despesas] = await Promise.all([
        fetch('http://localhost:3000/rendas').then(r => r.json()),
        fetch('http://localhost:3000/despesas').then(r => r.json())
    ]);

    const totalRendas = rendas.reduce((acc, r) => acc + r.valor, 0);
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    const saldo = totalRendas - totalDespesas;

    document.getElementById('receita').textContent = 'R$ ' + totalRendas.toFixed(2).replace('.', ',');
    document.getElementById('despesas').textContent = 'R$ ' + totalDespesas.toFixed(2).replace('.', ',');
    document.getElementById('saldo').textContent = 'R$ ' + saldo.toFixed(2).replace('.', ',');

    /*Imprime mensagem na tela*/

    let mensagem = document.getElementById('mensagem');
    if (totalDespesas > totalRendas) {
        mensagem.innerHTML = `<h2> ❌ Atenção: Você está gastando mais do que ganha.</h2>`
    }
    else if (saldo == 0) {
        mensagem.innerHTML = `<h2> ⚠️ Cuidado:  Você está gastando a mesma quantidade do que ganha.</h2>`
    }
    else if (saldo >= totalRendas * 0.30) {
        mensagem.innerHTML = `<h2> ✅ Ótimo: Boa margem de sobra. </h2>`
    }
    else if (saldo < totalRendas * 0.30)
        mensagem.innerHTML = `<h2> 🙂 Ok: dá para melhorar a sobra.</h2>`

    /*Listar receitas e despesas*/

    const listaReceitas = document.getElementById('lista-receitas');
    const listaDespesas = document.getElementById('lista-despesas');

    listaReceitas.innerHTML = '';
    listaDespesas.innerHTML = '';
    rendas.forEach(renda => {
        listaReceitas.innerHTML += `
        <li>
            R$ ${renda.valor.toFixed(2).replace('.', ',')}
        </li>
        
    `;
    });
    despesas.forEach(despesa => {
        listaDespesas.innerHTML += `
        <li>
            ${despesa.descricao} -
            R$ ${despesa.valor.toFixed(2).replace('.', ',')}
        </li>
    `;
    });

    document.getElementById('resultado').style.display = 'block';
    document.getElementById('formulario').style.display = 'none';
    document.getElementById('btn-resultado').style.display = 'none';
    document.getElementById('titulo').style.display = 'none';
    
}


/*Nova simulação*/

document.getElementById('btn-nova-simulacao').addEventListener('click', async () => {

    const confirmar = confirm(
        'Deseja iniciar uma nova simulação? Todos os dados atuais serão apagados.'
    );

    if (!confirmar) {
        return;
    }

    const [rendas, despesas] = await Promise.all([
        fetch('http://localhost:3000/rendas').then(r => r.json()),
        fetch('http://localhost:3000/despesas').then(r => r.json())
    ]);

    for (const renda of rendas) {
        await fetch(`http://localhost:3000/rendas/${renda.id}`, {
            method: 'DELETE'
        });
    }

    for (const despesa of despesas) {
        await fetch(`http://localhost:3000/despesas/${despesa.id}`, {
            method: 'DELETE'
        });
    }

    document.getElementById('resultado').style.display = 'none';
    document.getElementById('formulario').style.display = 'block';
    document.getElementById('btn-resultado').style.display = 'block';
     document.getElementById('titulo').style.display = 'block';


});
