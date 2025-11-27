"use strict"

let db
const DB_STORAGE_KEY = "sistemaNotasDB_v2"

const appState = {
  salaAtual: "",
  materiaAtual: "",
  filtroBusca: "",
  viewAtual: "notas",
  dataSelecionada: new Date().toISOString().split('T')[0]
}

const HORARIOS = [
  "07:10 - 07:45",
  "07:45 - 08:30",
  "08:30 - 09:15",
  "09:15 - 10:00",
  "10:20 - 11:05",
  "11:05 - 11:30"
]

const getInitialData = () => {
  const nomesAlunos = [
    "Ana Clara Mendes", "Biatriz dos Santos", "Charlisson Silva", "Davi Santana",
    "Elias Guilherme", "Emely Santos", "Evellyn Leite", "Gabryel Almeida",
    "Guilherme Almeida", "Hemily Vitoria", "Ingrid Mendes", "Iarley Mendes",
    "Isabela Santos", "Joel Vitor", "Kaio de Sousa", "Kaua Batista",
    "Ludmila Goncalves", "Luiz Miguel", "Marcones William", "Nadia Fernandes",
    "Raiany Nataly", "Samara de Oliveira", "Sarah Ires", "Thailane Carvalho",
    "Verena Kaellen", "Vitor Gabriel", "Walisson Silva", "William Batista"
  ]

  const materias = ["Matemática", "Português", "História", "Geografia", "Programação Web"]

  const criarAlunos = (nomes, idStart) => {
    return nomes.map((nome, index) => ({
      id: idStart + index,
      nome: nome,
      u1: null,
      u2: null,
      u3: null,
      freqGeral: 100,
      chamada: {}
    }))
  }

  const turmas = ["3TIM1", "3TIM2", "3TIM3"]
  const banco = {}

  turmas.forEach((turma, i) => {
    banco[turma] = {}
    materias.forEach(materia => {
      banco[turma][materia] = criarAlunos(nomesAlunos, (i + 1) * 1000)
    })
  })

  return banco
}

const carregarDados = () => {
  const dadosSalvos = localStorage.getItem(DB_STORAGE_KEY)
  try {
    db = dadosSalvos ? JSON.parse(dadosSalvos) : getInitialData()
    
    Object.keys(db).forEach(turma => {
      Object.keys(db[turma]).forEach(materia => {
          db[turma][materia].forEach(aluno => {
              if (!aluno.chamada) aluno.chamada = {}
          })
      })
    })

  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    db = getInitialData()
  }
  
  if (!appState.salaAtual) appState.salaAtual = Object.keys(db)[0]
  if (!appState.materiaAtual) appState.materiaAtual = Object.keys(db[appState.salaAtual])[0]
  
  document.getElementById("date-picker").value = appState.dataSelecionada
}

const salvarDados = () => {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db))
  const msg = document.getElementById("save-message")
  msg.classList.remove("hidden")
  
  setTimeout(() => msg.classList.add("hidden"), 2000)
}

const calcularMedia = (aluno) => {
  const notas = [aluno.u1, aluno.u2, aluno.u3].filter((n) => n !== null && n !== "")
  if (notas.length === 0) return null
  const soma = notas.reduce((acc, n) => acc + parseFloat(n), 0)
  return soma / notas.length
}

const getStatus = (aluno) => {
  const media = calcularMedia(aluno)
  
  if (aluno.u1 == 0 && aluno.u2 == 0 && aluno.u3 == 0) {
      return { texto: "Desistente", classe: "status-desistente" }
  }
  if (aluno.freqGeral < 75) {
      return { texto: "Reprovado (Freq)", classe: "status-reprovado" }
  }
  
  const notasPreenchidas = [aluno.u1, aluno.u2, aluno.u3].filter((n) => n !== null && n !== "")
  if (notasPreenchidas.length < 3) {
      return { texto: "Pendente", classe: "text-gray-500 font-medium italic" }
  }
  
  if (media < 5) {
      return { texto: `Reprovado (${media.toFixed(1)})`, classe: "status-reprovado" }
  }
  return { texto: `Aprovado (${media.toFixed(1)})`, classe: "status-aprovado" }
}

const renderizarControles = () => {
    const selSala = document.getElementById("sala-selector")
    const selMat = document.getElementById("materia-selector")
    
    if (selSala.options.length === 0) {
      Object.keys(db).forEach(s => selSala.add(new Option(s, s)))
      selSala.value = appState.salaAtual
    }
    
    selMat.innerHTML = ""
    Object.keys(db[appState.salaAtual]).forEach(m => selMat.add(new Option(m, m)))
    selMat.value = appState.materiaAtual

    const btnNotas = document.getElementById("tab-notas")
    const btnFreq = document.getElementById("tab-freq")
    const viewNotas = document.getElementById("view-notas")
    const viewFreq = document.getElementById("view-freq")
    const dateControl = document.getElementById("date-control-container")

    if (appState.viewAtual === 'notas') {
        btnNotas.className = "tab-active pb-3 px-2 text-sm uppercase tracking-wider transition-all cursor-default"
        btnFreq.className = "tab-inactive pb-3 px-2 text-sm uppercase tracking-wider transition-all cursor-pointer"
        viewNotas.classList.remove("hidden")
        viewFreq.classList.add("hidden")
        dateControl.classList.add("hidden")
    } else {
        btnNotas.className = "tab-inactive pb-3 px-2 text-sm uppercase tracking-wider transition-all cursor-pointer"
        btnFreq.className = "tab-active pb-3 px-2 text-sm uppercase tracking-wider transition-all cursor-default"
        viewNotas.classList.add("hidden")
        viewFreq.classList.remove("hidden")
        dateControl.classList.remove("hidden")
    }
}

const renderizarTabelaNotas = (alunos) => {
  const tbody = document.getElementById("grade-table-body")
  tbody.innerHTML = ""
  const listaReprovados = document.getElementById("failure-list")
  listaReprovados.innerHTML = ""
  let temReprovado = false

  alunos.forEach(aluno => {
      const status = getStatus(aluno)
      const media = calcularMedia(aluno)
      
      const row = document.createElement("tr")
      row.className = "hover:bg-gray-50 transition-colors border-b border-gray-100"
      
      row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${status.classe === 'status-desistente' ? 'status-desistente' : ''}">
            ${aluno.nome}
          </td>
          <td class="px-2 py-4 text-center"><input type="number" data-id="${aluno.id}" data-field="u1" value="${aluno.u1 ?? ''}" max="10" step="0.1" class="w-20 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"></td>
          <td class="px-2 py-4 text-center"><input type="number" data-id="${aluno.id}" data-field="u2" value="${aluno.u2 ?? ''}" max="10" step="0.1" class="w-20 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"></td>
          <td class="px-2 py-4 text-center"><input type="number" data-id="${aluno.id}" data-field="u3" value="${aluno.u3 ?? ''}" max="10" step="0.1" class="w-20 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"></td>
          <td class="px-2 py-4 text-center"><input type="number" data-id="${aluno.id}" data-field="freqGeral" value="${aluno.freqGeral}" max="100" class="w-20 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-gray-600"></td>
          <td class="px-4 py-4 text-center font-bold text-gray-800 text-lg">${media !== null ? media.toFixed(1) : '-'}</td>
          <td class="px-6 py-4 text-sm"><span class="${status.classe}">${status.texto}</span></td>
      `
      tbody.appendChild(row)

      row.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', (e) => handleNotaChange(e, aluno))
      })

      if (status.classe.includes("reprovado") || status.classe.includes("desistente")) {
          temReprovado = true
          const li = document.createElement("li")
          li.textContent = `${aluno.nome} - ${status.texto}`
          listaReprovados.appendChild(li)
      }
  })
  
  const aviso = document.getElementById("failure-warning")
  temReprovado ? aviso.classList.remove("hidden") : aviso.classList.add("hidden")
}

const renderizarTabelaFrequencia = (alunos) => {
    const tbody = document.getElementById("freq-table-body")
    tbody.innerHTML = ""
    const dataAtual = appState.dataSelecionada

    alunos.forEach(aluno => {
        if (!aluno.chamada[dataAtual]) {
            aluno.chamada[dataAtual] = [true, true, true, true, true, true]
        }

        const presencas = aluno.chamada[dataAtual]
        const totalPresencasDia = presencas.filter(p => p).length
        const percentDia = Math.round((totalPresencasDia / 6) * 100)

        const row = document.createElement("tr")
        row.className = "hover:bg-gray-50 transition-colors border-b border-gray-100"
        
        let htmlChecks = ""
        for(let i=0; i<6; i++) {
            htmlChecks += `
              <td class="px-2 py-4 text-center border-l border-gray-100">
                  <div class="flex justify-center items-center h-full">
                    <input type="checkbox" 
                        class="custom-checkbox" 
                        title="Aula ${i+1}: ${HORARIOS[i]}"
                        ${presencas[i] ? 'checked' : ''} 
                        data-aluno="${aluno.id}" 
                        data-aula="${i}">
                  </div>
              </td>
            `
        }

        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100 z-10">
                ${aluno.nome}
            </td>
            ${htmlChecks}
            <td class="px-4 py-4 text-center text-sm font-bold ${percentDia < 100 ? 'text-orange-500' : 'text-green-600'} border-l border-gray-200">
              ${percentDia}%
            </td>
        `
        tbody.appendChild(row)

        row.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', (e) => handleFrequenciaChange(e, aluno, dataAtual))
        })
    })
}

const atualizarTela = () => {
  renderizarControles()
  
  const alunos = db[appState.salaAtual][appState.materiaAtual]
  const termo = appState.filtroBusca.toLowerCase()
  const alunosFiltrados = alunos.filter(a => a.nome.toLowerCase().includes(termo))

  if (appState.viewAtual === 'notas') {
      renderizarTabelaNotas(alunosFiltrados)
  } else {
      renderizarTabelaFrequencia(alunosFiltrados)
  }
}

const handleLogin = (e) => {
  e.preventDefault()
  const u = document.getElementById("username").value
  const p = document.getElementById("password").value
  
  if (u === "admin" && p === "123") {
      document.getElementById("login-container").classList.add("hidden")
      document.getElementById("app-container").classList.remove("hidden")
      carregarDados()
      atualizarTela()
  } else {
      document.getElementById("login-error").classList.remove("hidden")
  }
}

const handleNotaChange = (e, aluno) => {
  let val = parseFloat(e.target.value)
  const field = e.target.dataset.field
  const max = field === 'freqGeral' ? 100 : 10
  
  if (isNaN(val)) val = null
  if (val !== null) {
      if (val < 0) val = 0
      if (val > max) val = max
  }
  
  aluno[field] = val
  e.target.value = val 
  
  atualizarTela()
}

const handleFrequenciaChange = (e, aluno, data) => {
    const aulaIndex = parseInt(e.target.dataset.aula)
    const isPresente = e.target.checked
    
    aluno.chamada[data][aulaIndex] = isPresente
    
    const tr = e.target.closest('tr')
    const checks = tr.querySelectorAll('input[type="checkbox"]')
    const total = Array.from(checks).filter(c => c.checked).length
    const perc = Math.round((total / 6) * 100)
    
    const tdResumo = tr.querySelector('td:last-child')
    tdResumo.textContent = `${perc}%`
    
    if (perc < 100) {
        tdResumo.classList.remove('text-green-600')
        tdResumo.classList.add('text-orange-500')
    } else {
        tdResumo.classList.remove('text-orange-500')
        tdResumo.classList.add('text-green-600')
    }
}

document.getElementById("login-form").addEventListener("submit", handleLogin)

document.getElementById("logout-button").addEventListener("click", () => window.location.reload())

document.getElementById("save-button").addEventListener("click", salvarDados)

document.getElementById("sala-selector").addEventListener("change", (e) => {
    appState.salaAtual = e.target.value
    appState.materiaAtual = Object.keys(db[appState.salaAtual])[0]
    atualizarTela()
})

document.getElementById("materia-selector").addEventListener("change", (e) => {
    appState.materiaAtual = e.target.value
    atualizarTela()
})

document.getElementById("search-bar").addEventListener("input", (e) => {
    appState.filtroBusca = e.target.value
    atualizarTela()
})

document.getElementById("tab-notas").addEventListener("click", () => {
    appState.viewAtual = 'notas'
    atualizarTela()
})

document.getElementById("tab-freq").addEventListener("click", () => {
    appState.viewAtual = 'freq'
    atualizarTela()
})

document.getElementById("date-picker").addEventListener("change", (e) => {
    appState.dataSelecionada = e.target.value
    atualizarTela()
})


vegacao = () => {
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
