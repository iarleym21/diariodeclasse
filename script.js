// "Modo Estrito" para melhores práticas
"use strict"

// --- 1. ESTADO DA APLICAÇÃO E CONSTANTES ---

let db

const appState = {
  salaAtual: "",
  materiaAtual: "",
  filtroBusca: "",
}

const DB_STORAGE_KEY = "sistemaNotasDB"

// --- 2. LÓGICA DE DADOS ---

const getInitialData = () => {
  const nomes3TIM1 = [
    "Alexandre Borges",
    "Beatriz Lima",
    "Carlos Eduardo",
    "Diana Fernandes",
    "Eric Santos",
    "Fabiana Melo",
    "Gabriel Alves",
    "Helena Costa",
  ]
  const nomes3TIM2 = [
    "Igor Nascimento",
    "Juliana Pereira",
    "Kevin Souza",
    "Laura Batista",
    "Miguel Castro",
    "Natália Oliveira",
    "Otávio Martins",
    "Paula Ribeiro",
  ]
  const nomes3TIM3 = [
    "ANA CLARA MENDES DO NASCIMENTO",
    "BIATRIZ DOS SANTOS LIMA",
    "CHARLISSON DOS SANTOS SILVA",
    "CHRYSTIAN FELIPE DE JESUS SOUZA LIMA",
    "CINTIA DO NASCIMENTO SENA",
    "DAVI SANTANA DOS SANTOS",
    "ELIAS GUILHERME DE JESUS SANTOS",
    "EMELY SANTOS DE JESUS",
    "EVELLYN LEITE DOS SANTOS",
    "GABRYEL SANTOS ALMEIDA",
    "GRAZIELE SILVA MENEZES SANTOS",
    "GUILHERME DE ALMEIDA SANTOS",
    "HEMILY VITORIA DOS SANTOS CARMO",
    "INGRID MENDES SILVA",
    "IARLEY MENDES REIS DE JESUS",
    "INGRID VITORIA DAMASCENO VILARES DOS SANTOS",
    "ISABELA SANTOS DOS REIS",
    "JOEL VITOR PEREIRA DA SILVA",
    "ΚΑΙO DE SOUSA RIBEIRO",
    "KAUA DA CONCEICAO BATISTA",
    "LUDMILA GONCALVES SANTOS",
    "LUIZ MIGUEL SILVA SANTOS",
    "MARCONES WILLIAM SANTOS ALVES",
    "NADIA FERNANDES SANTOS",
    "RAIANY NATALY BATISTA RABELO",
    "SAMARA DE OLIVEIRA COSTA",
    "SARAH IRES REIS SANTOS",
    "THAILANE CARVALHO DOS SANTOS",
    "VERENA KAELLEN BATISTA PEREIRA",
    "VITOR GABRIEL LIMA VENTURA DOS SANTOS",
    "WALISSON DA SILVA BULHOSA",
    "WILLIAM BATISTA SANTANA",
  ]
  const nomes3TIM4 = [
    "Quintino Rocha",
    "Raquel Gomes",
    "Samuel Dantas",
    "Tatiana Nunes",
    "Ulisses Farias",
    "Valentina Barros",
    "Wesley Moreira",
    "Yasmin Correia",
  ]

  const todasAsMaterias = [
    "Análise e Projeto Sistema",
    "Arte",
    "Biologia",
    "Física",
    "Geografia",
    "Higiene, Saúde e Seg. Trab.",
    "Inst. e Manut. Computadores",
    "Internet e Prog. Web",
    "Linguagem de Programação",
    "Matemática",
    "Mundo do Trabalho",
    "Programação Visual",
    "Projeto Experimental II",
    "Português",
    "Química",
    "Redes de Computadores II",
    "Segurança de Sist. Redes",
  ]

  const criarListaAlunos = (nomes, idStart = 1) => {
    return nomes.map((nome, index) => ({
      id: idStart + index,
      nome: nome,
      u1: null,
      u2: null,
      u3: null,
      freq: 100,
    }))
  }

  const criarMateriasParaSala = (nomesAlunos, idStart) => {
    const materias = {}
    todasAsMaterias.forEach((materia) => {
      materias[materia] = criarListaAlunos(nomesAlunos, idStart)
    })
    return materias
  }

  return {
    "3TIM1": criarMateriasParaSala(nomes3TIM1, 100),
    "3TIM2": criarMateriasParaSala(nomes3TIM2, 200),
    "3TIM3": criarMateriasParaSala(nomes3TIM3, 300),
    "3TIM4": criarMateriasParaSala(nomes3TIM4, 400),
  }
}

const carregarDados = () => {
  const dadosSalvos = localStorage.getItem(DB_STORAGE_KEY)
  try {
    db = dadosSalvos ? JSON.parse(dadosSalvos) : getInitialData()
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    db = getInitialData()
  }
  appState.salaAtual = Object.keys(db)[0]
  appState.materiaAtual = Object.keys(db[appState.salaAtual])[0]
}

const salvarDados = () => {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
  }
}

// --- 3. LÓGICA DE NEGÓCIO ---

const calcularMedia = (aluno) => {
  const notas = [aluno.u1, aluno.u2, aluno.u3].filter((n) => n !== null && n !== "")
  if (notas.length === 0) return null
  const soma = notas.reduce((acc, n) => acc + parseFloat(n), 0)
  return soma / notas.length
}

const getStatus = (aluno, media) => {
  if (aluno.u1 == 0 && aluno.u2 == 0 && aluno.u3 == 0) {
    return { texto: "Desistente", classe: "status-desistente" }
  }
  if (aluno.freq < 75) {
    return { texto: "Reprovado (Frequência)", classe: "status-reprovado" }
  }

  const notasPreenchidas = [aluno.u1, aluno.u2, aluno.u3].filter((n) => n !== null && n !== "")

  if (notasPreenchidas.length < 3) {
    if (media === null) {
      return { texto: "Pendente", classe: "text-gray-500" }
    } else {
      return { texto: `Pendente (Média ${media.toFixed(1)})`, classe: "text-gray-500" }
    }
  }

  if (media < 5) {
    return { texto: `Reprovado (Média ${media.toFixed(1)})`, classe: "status-reprovado" }
  }
  return { texto: `Aprovado (Média ${media.toFixed(1)})`, classe: "status-aprovado" }
}

// --- 4. RENDERIZAÇÃO ---

const popularSeletores = () => {
  const seletorSala = document.getElementById("sala-selector")
  const seletorMateria = document.getElementById("materia-selector")

  seletorSala.innerHTML = ""
  seletorMateria.innerHTML = ""

  Object.keys(db).forEach((sala) => {
    const option = document.createElement("option")
    option.value = sala
    option.textContent = sala
    seletorSala.appendChild(option)
  })
  seletorSala.value = appState.salaAtual

  Object.keys(db[appState.salaAtual]).forEach((materia) => {
    const option = document.createElement("option")
    option.value = materia
    option.textContent = materia
    seletorMateria.appendChild(option)
  })
  seletorMateria.value = appState.materiaAtual
}

const criarInput = (id, field, valor, max, step) => {
  const input = document.createElement("input")
  input.type = "number"
  input.min = 0
  input.max = max
  input.step = step
  input.className =
    "w-16 text-center p-1 border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
  input.value = valor
  input.dataset.id = id
  input.dataset.field = field
  input.addEventListener("change", handleMudancaNota)
  return input
}

const criarLinhaAluno = (aluno) => {
  const media = calcularMedia(aluno)
  const status = getStatus(aluno, media)

  const tr = document.createElement("tr")
  tr.className = "hover:bg-gray-50"

  const nomeTd = document.createElement("td")
  nomeTd.className = `px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${
    status.classe === "status-desistente" ? status.classe : ""
  }`
  nomeTd.textContent = aluno.nome

  const campos = [
    { field: "u1", valor: aluno.u1, max: 10, step: 0.1 },
    { field: "u2", valor: aluno.u2, max: 10, step: 0.1 },
    { field: "u3", valor: aluno.u3, max: 10, step: 0.1 },
    { field: "freq", valor: aluno.freq, max: 100, step: 1 },
  ]

  const inputsTds = campos.map((campo) => {
    const td = document.createElement("td")
    td.className = "px-6 py-4 whitespace-nowrap text-center"
    const input = criarInput(aluno.id, campo.field, campo.valor, campo.max, campo.step)
    td.appendChild(input)
    return td
  })

  const mediaTd = document.createElement("td")
  mediaTd.className = `px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${status.classe}`
  mediaTd.textContent = media !== null ? media.toFixed(1) : "---"

  const statusTd = document.createElement("td")
  statusTd.className = `px-6 py-4 whitespace-nowrap text-sm ${status.classe}`
  statusTd.textContent = status.texto

  tr.appendChild(nomeTd)
  inputsTds.forEach((td) => tr.appendChild(td))
  tr.appendChild(mediaTd)
  tr.appendChild(statusTd)

  return { tr, status }
}

const renderizarTabela = () => {
  const tbody = document.getElementById("grade-table-body")
  const tituloTabela = document.getElementById("table-title")
  const avisoReprovados = document.getElementById("failure-warning")
  const listaReprovados = document.getElementById("failure-list")

  tbody.innerHTML = ""
  listaReprovados.innerHTML = ""
  let alunosReprovadosCount = 0

  tituloTabela.textContent = `Turma: ${appState.salaAtual} - Matéria: ${appState.materiaAtual}`

  const alunos = db[appState.salaAtual][appState.materiaAtual]
  const alunosFiltrados = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(appState.filtroBusca.toLowerCase()),
  )

  if (alunosFiltrados.length === 0) {
    const msg = appState.filtroBusca
      ? `Nenhum aluno encontrado para "${appState.filtroBusca}".`
      : "Nenhum aluno encontrado."
    tbody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-gray-500">${msg}</td></tr>`
    avisoReprovados.classList.add("hidden")
    return
  }

  alunosFiltrados.forEach((aluno) => {
    const { tr, status } = criarLinhaAluno(aluno)
    tbody.appendChild(tr)

    if (status.classe === "status-reprovado" || status.classe === "status-desistente") {
      alunosReprovadosCount++
      const li = document.createElement("li")
      li.textContent = `${aluno.nome}: ${status.texto}`
      listaReprovados.appendChild(li)
    }
  })

  if (alunosReprovadosCount > 0) {
    avisoReprovados.classList.remove("hidden")
  } else {
    avisoReprovados.classList.add("hidden")
  }
}

const atualizarTela = () => {
  popularSeletores()
  renderizarTabela()
}

// --- 5. HANDLERS ---

const handleLogin = (e) => {
  e.preventDefault()
  const user = document.getElementById("username").value
  const pass = document.getElementById("password").value
  const errorDiv = document.getElementById("login-error")

  if (user === "admin" && pass === "123") {
    document.getElementById("login-container").classList.add("hidden")
    document.getElementById("app-container").classList.remove("hidden")
    carregarDados()
    atualizarTela()
  } else {
    errorDiv.classList.remove("hidden")
  }
}

const handleLogout = () => {
  document.getElementById("app-container").classList.add("hidden")
  document.getElementById("login-container").classList.remove("hidden")
  document.getElementById("login-error").classList.add("hidden")
  document.getElementById("password").value = "123"
  document.getElementById("username").value = "admin"
}

const handleNavegacao = () => {
  const salaSelecionada = document.getElementById("sala-selector").value

  if (salaSelecionada !== appState.salaAtual) {
    appState.salaAtual = salaSelecionada
    appState.materiaAtual = Object.keys(db[appState.salaAtual])[0]
    popularSeletores()
  } else {
    appState.materiaAtual = document.getElementById("materia-selector").value
  }
  renderizarTabela()
}

const handleBusca = (e) => {
  appState.filtroBusca = e.target.value
  renderizarTabela()
}

const handleMudancaNota = (e) => {
  const input = e.target
  const alunoId = parseInt(input.dataset.id)
  const campo = input.dataset.field
  let valor = input.value === "" ? null : parseFloat(input.value)

  if (valor !== null) {
    const max = campo === "freq" ? 100 : 10
    if (valor < 0) valor = 0
    if (valor > max) valor = max
    input.value = valor
  }

  const alunos = db[appState.salaAtual][appState.materiaAtual]
  const aluno = alunos.find((a) => a.id === alunoId)

  if (aluno) {
    aluno[campo] = valor
    renderizarTabela()
  }
}

const handleSalvarClick = () => {
  salvarDados()
  const saveMsg = document.getElementById("save-message")
  saveMsg.classList.remove("hidden")
  setTimeout(() => {
    saveMsg.classList.add("hidden")
  }, 2000)
}

// --- 6. INICIALIZAÇÃO ---

document.getElementById("login-form").addEventListener("submit", handleLogin)
document.getElementById("logout-button").addEventListener("click", handleLogout)
document.getElementById("save-button").addEventListener("click", handleSalvarClick)
document.getElementById("sala-selector").addEventListener("change", handleNavegacao)
document.getElementById("materia-selector").addEventListener("change", handleNavegacao)
document.getElementById("search-bar").addEventListener("input", handleBusca)
