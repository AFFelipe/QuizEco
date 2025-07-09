let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let usuarioAtual = null;
let perguntas = [];
let perguntaAtual = 0;
let pontuacao = 0;

class Usuario {
  constructor(nome, email, idade, cidade) {
    this.nome = nome;
    this.email = email;
    this.idade = parseInt(idade);
    this.cidade = cidade;
    this.pontuacao = 0;
    this.dataCadastro = new Date().toLocaleDateString();
  }
}

function mostrarCadastro() {
  esconderTudo();
  document.getElementById('cadastro').classList.remove('hidden');
}

function salvarCadastro() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const idade = document.getElementById('idade').value;
  const cidade = document.getElementById('cidade').value;

  if (!nome || !email || !idade || !cidade) {
    mostrarFeedback("Preencha todos os campos.", "erro");
    return;
  }

  if (idade < 1 || idade > 120) {
    mostrarFeedback("Idade inválida. Deve ser entre 1 e 120 anos.", "erro");
    return;
  }

  if (!validarEmail(email)) {
    mostrarFeedback("E-mail inválido. Digite um e-mail válido.", "erro");
    return;
  }

  if (usuarios.some(u => u.email === email)) {
    mostrarFeedback("Este e-mail já está cadastrado.", "erro");
    return;
  }

  const novoUsuario = new Usuario(nome, email, idade, cidade);
  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  mostrarFeedback("Cadastro realizado com sucesso!", "sucesso");
  limparCadastro();
  setTimeout(voltarMenu, 1500);
}

function validarEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

function mostrarFeedback(mensagem, tipo) {
  const feedback = document.createElement('div');
  feedback.textContent = mensagem;
  feedback.className = `feedback-${tipo === 'sucesso' ? 'certo' : 'errado'}`;
  
  const form = document.querySelector('#cadastro form');
  form.insertBefore(feedback, form.lastElementChild);
  
  setTimeout(() => feedback.remove(), 3000);
}

function limparCadastro() {
  document.getElementById('nome').value = '';
  document.getElementById('email').value = '';
  document.getElementById('idade').value = '';
  document.getElementById('cidade').value = '';
}

function exibirUsuarios() {
  esconderTudo();
  document.getElementById('dadosUsuario').classList.remove('hidden');
  
  const infoDiv = document.getElementById('infoUsuario');
  infoDiv.innerHTML = '';
  
  if (usuarios.length === 0) {
    infoDiv.textContent = "Nenhum usuário cadastrado.";
    return;
  }

  const listaUsuarios = document.createElement('div');
  listaUsuarios.className = 'lista-usuarios';
  
  usuarios.forEach((usuario, index) => {
    const usuarioDiv = document.createElement('div');
    usuarioDiv.className = 'usuario-info';
    usuarioDiv.innerHTML = `
      <h3>Usuário ${index + 1}</h3>
      <p><strong>Nome:</strong> ${usuario.nome}</p>
      <p><strong>Email:</strong> ${usuario.email}</p>
      <p><strong>Idade:</strong> ${usuario.idade}</p>
      <p><strong>Cidade:</strong> ${usuario.cidade}</p>
      <p><strong>Pontuação:</strong> ${usuario.pontuacao || '0'}</p>
      <p><strong>Data de Cadastro:</strong> ${usuario.dataCadastro}</p>
    `;
    
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir Usuário';
    btnExcluir.className = 'btn-excluir';
    btnExcluir.onclick = (e) => {
      e.stopPropagation();
      excluirUsuario(index);
    };
    
    usuarioDiv.appendChild(btnExcluir);
    listaUsuarios.appendChild(usuarioDiv);
  });
  
  infoDiv.appendChild(listaUsuarios);
}

function excluirUsuario(index) {
  if (confirm(`Tem certeza que deseja excluir o usuário ${usuarios[index].nome}?`)) {
    usuarios.splice(index, 1);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    exibirUsuarios();
    
    if (usuarioAtual && !usuarios.includes(usuarioAtual)) {
      usuarioAtual = null;
    }
  }
}

function voltarMenu() {
  esconderTudo();
  document.getElementById('menu').classList.remove('hidden');
}

function esconderTudo() {
  document.querySelectorAll('.container').forEach(el => {
    el.classList.add('hidden');
  });
}

function jogar() {
  if (usuarios.length === 0) {
    alert("Cadastre ao menos um usuário antes de jogar.");
    return;
  }
  esconderTudo();
  document.getElementById('selecionarUsuario').classList.remove('hidden');
  carregarListaUsuarios();
}

function carregarListaUsuarios() {
  const listaDiv = document.getElementById('listaUsuarios');
  listaDiv.innerHTML = '';
  
  if (usuarios.length === 0) {
    listaDiv.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
    return;
  }
  
  usuarios.forEach((usuario, index) => {
    const card = document.createElement('div');
    card.className = 'usuario-card';
    card.innerHTML = `
      <h3>${usuario.nome}</h3>
      <p>Idade: ${usuario.idade} | Cidade: ${usuario.cidade}</p>
      <p>Pontuação anterior: ${usuario.pontuacao || 'Nenhuma'}</p>
      <p>Cadastrado em: ${usuario.dataCadastro}</p>
    `;
    
    const btnJogar = document.createElement('button');
    btnJogar.textContent = 'Selecionar para Jogar';
    btnJogar.onclick = (e) => {
      e.stopPropagation();
      iniciarJogo(usuario);
    };
    
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir Usuário';
    btnExcluir.className = 'btn-excluir';
    btnExcluir.onclick = (e) => {
      e.stopPropagation();
      excluirUsuario(index);
    };
    
    card.appendChild(btnJogar);
    card.appendChild(btnExcluir);
    listaDiv.appendChild(card);
  });
}

function iniciarJogo(usuario) {
  usuarioAtual = usuario;
  perguntas = gerarPerguntas();
  perguntaAtual = 0;
  pontuacao = 0;
  
  esconderTudo();
  document.getElementById('quiz').classList.remove('hidden');
  document.getElementById('boasVindas').innerText = `Bem-vindo(a), ${usuarioAtual.nome}!`;
  atualizarProgresso();
  exibirPergunta();
}

function gerarPerguntas() {
  try {
    const perguntasOriginais = [
      { 
        tipo: "vf", 
        pergunta: "Reciclar papel ajuda a salvar árvores.", 
        resposta: true, 
        curiosidade: "Uma tonelada de papel reciclado salva até 20 árvores." 
      },
      { 
        tipo: "vf", 
        pergunta: "Energia solar é uma fonte de energia poluente.", 
        resposta: false, 
        curiosidade: "A energia solar é limpa, renovável e abundante." 
      },
      { 
        tipo: "multipla", 
        pergunta: "Qual destas práticas ajuda a economizar água?", 
        opcoes: [
          "Deixar a torneira aberta", 
          "Tomar banhos longos", 
          "Usar vassoura para limpar a calçada", 
          "Lavar o carro todos os dias"
        ], 
        resposta: 2, 
        curiosidade: "Usar a vassoura pode economizar até 280L de água por vez." 
      },
      { 
        tipo: "multipla", 
        pergunta: "Qual material pode ser reciclado infinitamente sem perder qualidade?", 
        opcoes: [
          "Plástico", 
          "Papel", 
          "Vidro", 
          "Isopor"
        ], 
        resposta: 2, 
        curiosidade: "O vidro pode ser reciclado infinitamente!" 
      },
      { 
        tipo: "vf", 
        pergunta: "Os créditos de carbono podem beneficiar empresas sustentáveis.", 
        resposta: true, 
        curiosidade: "Empresas sustentáveis podem vender créditos de carbono." 
      },
      { 
        tipo: "vf", 
        pergunta: "Jogar lixo na rua não prejudica o meio ambiente.", 
        resposta: false, 
        curiosidade: "Lixo na rua entope bueiros e causa enchentes." 
      },
      { 
        tipo: "vf", 
        pergunta: "Desmatamento contribui para o aumento do efeito estufa.", 
        resposta: true, 
        curiosidade: "Florestas absorvem CO₂; seu corte libera esse gás." 
      },
      { 
        tipo: "vf", 
        pergunta: "Água é um recurso natural inesgotável.", 
        resposta: false, 
        curiosidade: "Menos de 1% da água do planeta é potável." 
      },
      { 
        tipo: "vf", 
        pergunta: "Plantar árvores ajuda a combater a mudança climática.", 
        resposta: true, 
        curiosidade: "Uma árvore pode absorver até 150 kg de CO₂ por ano." 
      },
      { 
        tipo: "vf", 
        pergunta: "Reutilizar materiais é uma forma de reduzir a geração de resíduos.", 
        resposta: true, 
        curiosidade: "Reutilizar reduz a necessidade de novos recursos naturais." 
      }
    ];

    let perguntasEmbaralhadas = [];
    let indicesUsados = [];

    while (perguntasEmbaralhadas.length < perguntasOriginais.length) {
      const idx = Math.floor(Math.random() * perguntasOriginais.length);

      if (!indicesUsados.includes(idx)) {
        perguntasEmbaralhadas.push(perguntasOriginais[idx]);
        indicesUsados.push(idx);
      }
    }

    return perguntasEmbaralhadas;

  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
    alert("Ocorreu um erro ao preparar as perguntas. Tente novamente mais tarde.");
    return [];
  }
}

function exibirPergunta() {
  const p = perguntas[perguntaAtual];
  const perguntaDiv = document.getElementById('perguntaContainer');
  const opcoesDiv = document.getElementById('opcoes');

  perguntaDiv.innerHTML = `<p><strong>${p.pergunta}</strong></p>`;
  opcoesDiv.innerHTML = '';

  if (p.tipo === 'vf') {
    opcoesDiv.innerHTML = `
      <button onclick="responderVF(true)">Verdadeiro</button>
      <button onclick="responderVF(false)">Falso</button>
    `;
  } else {
    p.opcoes.forEach((op, i) => {
      const btn = document.createElement("button");
      btn.textContent = op;
      btn.onclick = () => responderMultipla(i);
      opcoesDiv.appendChild(btn);
    });
  }
}

function atualizarProgresso() {
  const porcentagem = ((perguntaAtual + 1) / perguntas.length) * 100;
  document.getElementById('progressoBarra').style.width = `${porcentagem}%`;
  document.getElementById('contadorPerguntas').textContent = 
    `${perguntaAtual + 1}/${perguntas.length}`;
}

function responderVF(resposta) {
  const correta = perguntas[perguntaAtual].resposta;
  const feedbackDiv = document.getElementById('feedback');
  
  if (resposta === correta) {
    pontuacao++;
    feedbackDiv.textContent = "✓ Resposta correta!";
    feedbackDiv.className = "feedback-certo";
  } else {
    feedbackDiv.textContent = `✗ Resposta incorreta! ${perguntas[perguntaAtual].curiosidade}`;
    feedbackDiv.className = "feedback-errado";
  }
  
  setTimeout(proximaPergunta, 2000);
}

function responderMultipla(indice) {
  const p = perguntas[perguntaAtual];
  const feedbackDiv = document.getElementById('feedback');
  
  if (indice === p.resposta) {
    pontuacao++;
    feedbackDiv.textContent = "✓ Resposta correta!";
    feedbackDiv.className = "feedback-certo";
  } else {
    feedbackDiv.textContent = `✗ Resposta incorreta! ${p.curiosidade}`;
    feedbackDiv.className = "feedback-errado";
  }
  
  setTimeout(proximaPergunta, 2000);
}

function proximaPergunta() {
  document.getElementById('feedback').className = "feedback-hidden";
  perguntaAtual++;

  if (perguntaAtual < perguntas.length) {
    exibirPergunta();
    atualizarProgresso();
  } else {
    mostrarResultado();
  }
}

function mostrarResultado() {
  esconderTudo();
  document.getElementById('resultado').classList.remove('hidden');
  document.getElementById('pontuacaoFinal').innerText = `Sua pontuação: ${pontuacao} de ${perguntas.length}`;

  usuarioAtual.pontuacao = pontuacao;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  let msg = '';
  const porcentagem = (pontuacao / perguntas.length) * 100;
  
  if (porcentagem >= 90) {
    msg = "Parabéns! Você é um(a) expert em ecologia! 🌿";
  } else if (porcentagem >= 70) {
    msg = "Muito bem! Você sabe bastante sobre o meio ambiente! ♻";
  } else if (porcentagem >= 50) {
    msg = "Bom trabalho! Continue aprendendo sobre sustentabilidade! 🌱";
  } else {
    msg = "Não desanime! O importante é aprender e melhorar! 💪";
  }

  document.getElementById('mensagemFinal').innerText = msg;
}
