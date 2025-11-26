// Array de objetos com as 10 perguntas
const questions = [
    {
        id: 1,
        type: "multiple_choice",
        question: "1. Complete the sentence: When I arrived, she ________ the dinner.",
        options: ["had finished", "were finishing", "finishes", "finish"],
        answer: "had finished"
    },
    {
        id: 2,
        type: "video_drag_drop", 
        video_id: "_zEusQPWtec", // NOVO ID do YouTube (https://www.youtube.com/watch?v=tD46VAAHsNk)
        question: "2. Watch the video and complete the sentence:",
        sentence: "Gamora...I{slot} I {slot} you.",
        blanks: ["thought", "lost"],
        words_pool: ["am", "thouth", "lost", "taught", "cost"]
    },
    {
        id: 3,
        type: "word_sort", 
        question: "3. Rearrange the words to form the correct sentence: 'No sábado de manhã eu acordei e vi um cachorro bravo atrás da minha casa.'",
        correct_sentence: "On saturday morning i woke up and Saw a angry dog behind my house.",
        words: ["morning", "up", "On", "i", "my", "Saw", ".", "behind", "angry", "a", "woke", "saturday", "house", "and"]
    },
    {
        id: 4,
        type: "text_input", 
        question: "4. Fill in the blank: 'While we ___ to the airport, it started raining heavily.'",
        acceptable_answers: ["were driving"] 
    },
    {
        id: 5,
        type: "video_drag_drop", 
        video_id: "g3sQRJHuPL0", // ID do YouTube para o vídeo 2
        question: "5. Watch the video and complete the sentence:",
        sentence: "I am {slot}! {slot} I am {slot}.",
        blanks: ["inevitable","And", "Ironman"],
        words_pool: ["inevitable", "inescapable", "And", "Ironman"]
    },
    {
        id: 6,
        type: "multiple_choice",
        question: "6.Complete the sentence: By the time the teacher arrived the students____noisy.",
        options: ["were becoming", "become", "had become", "were become"],
        answer: "had become"
    },
    {
        id: 7,
        type: "drag_drop",
        question: "7. Complete the sentence(arraste as palavras): She didin't want dessert because she_____already_____.",
        sentence: "She didin't want dessert because she {slot} already {slot} .",
        blanks: ["had", "eaten"],
        words_pool: ["was", "had", "has", "eating", "eaten", "eat"]
    },
    {
       id: 8,
        type: "multiple_choice",
        question: "1. Complete the sentence: I didn’t recognize him because he _______ a beard.",
        options: ["was growing", "had grown", "grew", "has grown"],
        answer: "had grown"
    },
    {
        id: 9,
        type: "text_input", 
        question: "9. Complete the setence: They __ for two hours when the bus finally came.",
        acceptable_answers: ["had been waiting"] 
    },
    {
        id: 10,
        type: "word_sort", 
        question: "10. Form the correct sentence: 'Hoje eu estava indo ao supermercado e vi um pássaro bonito.'",
        correct_sentence: "Today i was going to the Supermarket and Saw a beautifull bird",
        words: ["beautiful", "bird", "was", "Today", "to", "going", "i", "a", "Supermarket", "and", "the", "Saw"]
    }
];

// Constantes para LocalStorage
const RANKING_KEY = 'englishQuizRanking';
const LAST_SCORE_KEY = 'lastUserScore';

// Elementos do DOM (Busca apenas no quiz.html)
const startBtn = document.getElementById('start-btn');
const usernameInput = document.getElementById('username');
const quizForm = document.getElementById('quiz-form');
const resultsDiv = document.getElementById('results');
const scoreDisplay = document.getElementById('score-display');

let username = '';

// --------------------------------------------------------------------------------
// ## FUNÇÕES DE RENDERIZAÇÃO
// --------------------------------------------------------------------------------

/** Renderiza a pergunta de Múltipla Escolha. */
function renderMultipleChoice(q, index) {
    let mcqHtml = '';
    q.options.forEach(option => {
        mcqHtml += `
            <input type="radio" id="q${q.id}-${option.replace(/\s/g, '-')}" name="question${q.id}" value="${option}" required>
            <label for="q${q.id}-${option.replace(/\s/g, '-')}" class="p-2">${option}</label>
        `;
    });
    return `<div class="options-container">${mcqHtml}</div>`;
}

/** Renderiza a pergunta de Drag and Drop (clássico ou com vídeo). */
function renderDragDrop(q) {
    let sentenceHtml = q.sentence.split('{slot}').map((part, index) => {
        let slotHtml = index < q.blanks.length ? `<span class="drop-slot" data-expected-word="${q.blanks[index]}"></span>` : '';
        return `<span>${part}</span>` + slotHtml;
    }).join('');

    let wordsHtml = q.words_pool.sort(() => Math.random() - 0.5)
        .map(word => `<div class="drag-word" draggable="true" data-word="${word}">${word}</div>`)
        .join('');

    return `
        <div class="drag-drop-question">
            <div class="sentence-area">${sentenceHtml}</div>
            <div class="draggable-words" id="dd-pool-${q.id}">${wordsHtml}</div>
        </div>
    `;
}

/** Renderiza a pergunta de Drag and Drop com VÍDEO. */
function renderVideoDragDrop(q) {
    // Iframe do YouTube com som habilitado
    const videoHtml = `
        <div class="video-container mb-3">
            <iframe 
                src="https://www.youtube.com/embed/${q.video_id}?autoplay=0&controls=1&mute=0" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        </div>
    `;

    // Lógica D&D
    let sentenceHtml = q.sentence.split('{slot}').map((part, index) => {
        let slotHtml = index < q.blanks.length ? `<span class="drop-slot" data-expected-word="${q.blanks[index]}"></span>` : '';
        return `<span>${part}</span>` + slotHtml;
    }).join('');

    let wordsHtml = q.words_pool.sort(() => Math.random() - 0.5)
        .map(word => `<div class="drag-word" draggable="true" data-word="${word}">${word}</div>`)
        .join('');

    return `
        <div class="drag-drop-question">
            ${videoHtml}
            <p class="mt-3">Complete a frase arrastando as palavras:</p>
            <div class="sentence-area">${sentenceHtml}</div>
            <div class="draggable-words" id="dd-pool-${q.id}">${wordsHtml}</div>
        </div>
    `;
}

/** Renderiza a pergunta de Input Direto. */
function renderTextInput(q) {
    let inputHtml = `
        <div class="text-input-question">
            <input type="text" id="q-${q.id}-answer" name="question${q.id}" placeholder="Digite a resposta..." required class="form-control" style="width: 50%;">
        </div>
    `;
    return inputHtml;
}

/** Renderiza a pergunta de Ordem de Palavras. */
function renderWordSort(q) {
    const shuffledWords = q.words.sort(() => Math.random() - 0.5);
    let wordsHtml = shuffledWords
        .map(word => `<div class="drag-word" draggable="true" data-word="${word}">${word}</div>`)
        .join('');

    let sortAreaHtml = `<div class="drop-slot-sort" id="sort-area-${q.id}" data-question-id="${q.id}"></div>`;

    return `
        <div class="drag-drop-question word-sort">
            <p>Arraste as palavras para a caixa na ordem correta:</p>
            <div class="sorting-target-area mb-3">
                ${sortAreaHtml}
            </div>
            <div class="draggable-words" id="word-pool-${q.id}">${wordsHtml}</div>
        </div>
    `;
}

// --------------------------------------------------------------------------------
// ## FUNÇÕES DE CONTROLE PRINCIPAIS
// --------------------------------------------------------------------------------

/** Carrega as perguntas no formulário. */
function loadQuestions() {
    if (!quizForm) return;

    let htmlContent = '';
    
    questions.forEach((q) => {
        htmlContent += `<div data-question-id="${q.id}" class="question-item">`;
        htmlContent += `<p><strong>${q.question}</strong></p>`;

        if (q.type === 'multiple_choice') {
            htmlContent += renderMultipleChoice(q);
        } else if (q.type === 'drag_drop') {
            htmlContent += renderDragDrop(q);
        } else if (q.type === 'video_drag_drop') {
            htmlContent += renderVideoDragDrop(q);
        } else if (q.type === 'text_input') { 
            htmlContent += renderTextInput(q);
        } else if (q.type === 'word_sort') { 
            htmlContent += renderWordSort(q);
        }

        htmlContent += `</div>`;
    });
    
    // Remove perguntas antigas e insere as novas
    const oldQuestions = quizForm.querySelectorAll('.question-item');
    oldQuestions.forEach(q => q.remove());
    quizForm.insertAdjacentHTML('afterbegin', htmlContent);
    
    initializeDragAndDrop();
}

/** Inicia o quiz. */
function startQuiz() {
    username = usernameInput.value.trim();
    if (username) {
        document.getElementById('start-area').style.display = 'none';
        if (quizForm) quizForm.style.display = 'block';
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        loadQuestions();
    } else {
        alert("Por favor, digite seu nome para começar o quiz!");
    }
}

/** Calcula a pontuação e salva no ranking/pontuação. */
function submitQuiz(e) {
    e.preventDefault();

    let score = 0;
    const totalQuestions = questions.length;
    
    questions.forEach((q) => {
        const questionElement = document.querySelector(`[data-question-id="${q.id}"]`);

        // Lógica de correção (mantida do código anterior)
        if (q.type === 'multiple_choice') {
            const selectedOption = quizForm.elements[`question${q.id}`]?.value;
            if (selectedOption === q.answer) {
                score++;
            }
        } else if (q.type === 'drag_drop' || q.type === 'video_drag_drop') {
            const dropSlots = questionElement.querySelectorAll('.drop-slot');
            let isCorrect = true;
            dropSlots.forEach((slot, slotIndex) => {
                const slotContent = slot.textContent.trim();
                if (slotContent === "" || slotContent !== q.blanks[slotIndex]) {
                    isCorrect = false;
                }
            });
            if (isCorrect) {
                score++;
            }
        } else if (q.type === 'text_input') { 
            const inputField = questionElement.querySelector(`input[name="question${q.id}"]`);
            const userAnswer = inputField.value.trim().toLowerCase();
            const correctAnswers = q.acceptable_answers.map(a => a.toLowerCase());
            if (correctAnswers.includes(userAnswer)) {
                score++;
            }
        } else if (q.type === 'word_sort') { 
            const sortedWordsContainer = questionElement.querySelector('.drop-slot-sort');
            const sortedWords = Array.from(sortedWordsContainer.children).map(wordDiv => wordDiv.dataset.word);
            const userSentence = sortedWords.join(' ').replace(/\s+\./g, '.').trim();
            if (userSentence.toLowerCase() === q.correct_sentence.toLowerCase()) {
                score++;
            }
        }
    });

    // Salva o score no ranking geral
    saveUserRanking(username, score);
    
    // Salva o score e o nome do último quiz para a página Pontuação
    saveLastScore(username, score);

    // Redireciona para a página de pontuação
    window.location.href = 'pontuacao.html';
}

// --------------------------------------------------------------------------------
// ## FUNÇÕES DE DRAG AND DROP (D&D)
// --------------------------------------------------------------------------------

function initializeDragAndDrop() {
    const dragWords = document.querySelectorAll('.drag-word');
    const dropSlots = document.querySelectorAll('.drop-slot'); 
    const sortAreas = document.querySelectorAll('.drop-slot-sort'); // Word Sort area
    const allPools = document.querySelectorAll('.draggable-words'); // Pools

    dragWords.forEach(word => {
        word.addEventListener('dragstart', dragStart);
    });

    // Slots para D&D (preencher buracos)
    dropSlots.forEach(slot => {
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('dragleave', dragLeave);
        slot.addEventListener('drop', dropDragDrop);
    });
    
    // Slots para Word Sort (a frase final)
    sortAreas.forEach(area => {
        area.addEventListener('dragover', dragOver);
        area.addEventListener('dragleave', dragLeave);
        area.addEventListener('drop', dropWordSort);
    });
    
    // Áreas de Pool (para retornar a palavra)
    allPools.forEach(pool => {
        pool.addEventListener('dragover', dragOver);
        pool.addEventListener('dragleave', dragLeave);
        pool.addEventListener('drop', dropToPool);
    });
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.word);
    e.target.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function dragLeave(e) {
    e.target.classList.remove('drag-over');
}

// Lógica de DROP para o tipo Drag & Drop (preencher buracos)
function dropDragDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const wordText = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.drag-word[data-word="${wordText}"].dragging`);
    
    if (!draggedElement) return;

    const wordsPool = draggedElement.closest('.drag-drop-question').querySelector('.draggable-words');

    // Se o slot já tem uma palavra, move-a de volta ao pool
    if (e.target.textContent.trim() !== "") {
        const oldWordText = e.target.textContent.trim();
        const newWordDiv = document.createElement('div');
        newWordDiv.className = 'drag-word';
        newWordDiv.draggable = true;
        newWordDiv.dataset.word = oldWordText;
        newWordDiv.textContent = oldWordText;
        newWordDiv.addEventListener('dragstart', dragStart);
        wordsPool.appendChild(newWordDiv);
    }
    
    // Coloca a nova palavra no slot
    e.target.textContent = wordText;
    
    // Remove o elemento arrastado
    if (draggedElement.parentElement) {
        draggedElement.parentElement.removeChild(draggedElement);
        draggedElement.classList.remove('dragging');
    }
}

// Lógica de DROP para o tipo Word Sort (ordenar palavras)
function dropWordSort(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const wordText = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.drag-word[data-word="${wordText}"].dragging`);

    if (draggedElement) {
        let targetElement = e.target;
        
        let dropArea = targetElement.closest('.drop-slot-sort');
        if (!dropArea) return; 

        if (targetElement.classList.contains('drag-word')) {
            // Se o alvo for uma palavra no slot, insere antes dela
            targetElement.parentNode.insertBefore(draggedElement, targetElement);
        } else if (targetElement.classList.contains('drop-slot-sort')) {
            // Se o alvo for a área vazia, anexa ao final
            targetElement.appendChild(draggedElement);
        }
        
        draggedElement.classList.remove('dragging');
    }
}

// Lógica de DROP para mover de volta para o Pool
function dropToPool(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const wordText = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.drag-word[data-word="${wordText}"].dragging`);
    
    const targetPool = e.target.closest('.draggable-words');

    if (draggedElement && targetPool) {
        targetPool.appendChild(draggedElement);
        draggedElement.classList.remove('dragging');
    }
}


// --------------------------------------------------------------------------------
// ## FUNÇÕES DE PONTUAÇÃO E LOCALSTORAGE
// --------------------------------------------------------------------------------

// Salva no ranking geral (melhor pontuação)
function saveUserRanking(name, score) {
    let ranking = getRanking();
    
    const existingUserIndex = ranking.findIndex(user => user.name.toLowerCase() === name.toLowerCase());

    if (existingUserIndex !== -1) {
        if (score > ranking[existingUserIndex].score) {
            ranking[existingUserIndex].score = score;
        }
    } else {
        ranking.push({ name, score, date: new Date().toISOString() });
    }

    ranking.sort((a, b) => b.score - a.score);

    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
}

function getRanking() {
    const ranking = localStorage.getItem(RANKING_KEY);
    return ranking ? JSON.parse(ranking) : [];
}

// Salva a última pontuação para a página Pontuação
function saveLastScore(name, score) {
    localStorage.setItem(LAST_SCORE_KEY, JSON.stringify({ name, score, total: questions.length }));
}

// Obtém a última pontuação
function getLastScore() {
    const lastScore = localStorage.getItem(LAST_SCORE_KEY);
    return lastScore ? JSON.parse(lastScore) : null;
}

// Gera a mensagem de feedback com base na pontuação
function generateFeedback(score, total) {
    const userName = getLastScore()?.name || 'colega';
    
    if (score > 7) { // 8, 9, 10
        return {
            title: "Resultados Fantásticos!",
            message: `Parabéns, ${userName}! Sua pontuação de ${score}/${total} é excelente. Você demonstrou um domínio impressionante do conteúdo. Continue assim!`,
            emoji: "✨",
            color: "var(--color-purple)"
        };
    } else if (score < 6) { // 0 a 5
        return {
            title: "Continue Praticando!",
            message: `Você marcou ${score}/${total}. Errar faz parte do aprendizado! Revise o material e tente novamente. A prática leva à perfeição.`,
            emoji: "📚",
            color: "var(--color-orange)"
        };
    } else { // 6 ou 7
        return {
            title: "Bom Desempenho!",
            message: `Você obteve ${score}/${total}. Parabéns pelo seu esforço! Você está no caminho certo. Um pouco mais de estudo e foco e você avançará muito!`,
            emoji: "👍",
            color: "var(--color-blue-light)"
        };
    }
}

// Exibe a pontuação e o feedback na página pontuacao.html
function displayLastScoreAndFeedback() {
    const scoreData = getLastScore();
    const pontuacaoDiv = document.getElementById('pontuacao-display');
    
    if (!pontuacaoDiv) return;

    if (scoreData) {
        const feedback = generateFeedback(scoreData.score, scoreData.total);
        
        pontuacaoDiv.innerHTML = `
            <div class="info-card p-5 text-center">
                <h1 style="color: ${feedback.color};">${feedback.emoji} ${feedback.title}</h1>
                <h2 class="display-4 my-4" style="color: var(--color-blue-dark);">
                    Pontuação: ${scoreData.score} / ${scoreData.total}
                </h2>
                <p class="lead">${feedback.message}</p>
                <hr class="my-4">
                <p>Obrigado por participar, ${scoreData.name}!</p>
                <a href="quiz.html" class="btn btn-custom-action btn-lg mt-3" style="background-color: var(--color-orange); border-color: var(--color-orange);">Tentar Novamente</a>
            </div>
        `;
    } else {
        pontuacaoDiv.innerHTML = `
            <div class="info-card p-5 text-center">
                <h1 style="color: var(--color-purple);"><i class="fas fa-question-circle"></i> Quiz Não Iniciado</h1>
                <p class="lead">Nenhuma pontuação encontrada. Por favor, comece o quiz primeiro!</p>
                <a href="quiz.html" class="btn btn-custom-action btn-lg mt-3">Começar Quiz</a>
            </div>
        `;
    }
}


// Função para exibir o ranking (usada na lateral de quiz.html)
function displayRanking() {
    const bodyElements = document.querySelectorAll('#ranking-body');
    if (!bodyElements.length) return;

    const ranking = getRanking();

    bodyElements.forEach(rankingBody => {
        rankingBody.innerHTML = '';

        // Exibe o ranking completo se for a página pontuacao-full.html (que não existe mais), ou top 5 se for a lateral
        const isFullRanking = rankingBody.closest('.full-ranking-table');
        const limit = isFullRanking ? ranking.length : 5;

        ranking.slice(0, limit).forEach((user, index) => {
            const row = rankingBody.insertRow();
            
            const cellRank = row.insertCell();
            cellRank.textContent = index + 1;
            
            const cellName = row.insertCell();
            cellName.textContent = user.name;
            
            const cellScore = row.insertCell();
            cellScore.textContent = `${user.score} / ${questions.length}`;
            
            if (index === 0) row.style.fontWeight = 'bold';
        });
    });
}


// --------------------------------------------------------------------------------
// ## INICIALIZAÇÃO
// --------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a exibição da pontuação na página pontuacao.html
    displayLastScoreAndFeedback();
    
    // Inicializa o ranking (usado na lateral de quiz.html)
    displayRanking();

    // Eventos específicos para a página do quiz (quiz.html)
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
    if (quizForm) {
        quizForm.addEventListener('submit', submitQuiz);
    }
});
// Adicione este código no FINAL do arquivo script.js

// --------------------------------------------------------------------------------
// ## JOGO DA MEMÓRIA
// --------------------------------------------------------------------------------

// Palavras para o Jogo da Memória
const memoryWords = {
    easy: {
        pairs: [
            { en: "House", pt: "Casa" },
            { en: "Water", pt: "Água" },
            { en: "Sun", pt: "Sol" },
            { en: "Book", pt: "Livro" },
            { en: "Cat", pt: "Gato" },
            { en: "Dog", pt: "Cachorro" } // 6 pares = 12 cartas (4x3)
        ],
        grid: 'memory-grid-4x3'
    },
    medium: {
        pairs: [
            { en: "Tree", pt: "Árvore" },
            { en: "Car", pt: "Carro" },
            { en: "Happy", pt: "Feliz" },
            { en: "Sad", pt: "Triste" },
            { en: "Apple", pt: "Maçã" },
            { en: "Run", pt: "Correr" },
            { en: "Jump", pt: "Pular" },
            { en: "Swim", pt: "Nadar" } // 8 pares = 16 cartas (4x4)
        ],
        grid: 'memory-grid-4x4'
    },
    hard: {
        pairs: [
            { en: "Computer", pt: "Computador" },
            { en: "Keyboard", pt: "Teclado" },
            { en: "Screen", pt: "Tela" },
            { en: "Mouse", pt: "Mouse" },
            { en: "Program", pt: "Programa" },
            { en: "Code", pt: "Código" },
            { en: "Variable", pt: "Variável" },
            { en: "Function", pt: "Função" },
            { en: "Server", pt: "Servidor" },
            { en: "Cloud", pt: "Nuvem" } // 10 pares = 20 cartas (5x4)
        ],
        grid: 'memory-grid-5x4'
    }
};

let gameBoard = [];
let cardsFlipped = [];
let matchesFound = 0;
let lockBoard = false;
let currentLevel = null;
let boardElement;
let messageElement;

/**
 * Função utilitária para embaralhar um array (Algoritmo de Fisher-Yates).
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Monta o tabuleiro do Jogo da Memória.
 * @param {string} level - O nível de dificuldade ('easy', 'medium', 'hard').
 */
function buildMemoryBoard(level) {
    const data = memoryWords[level];
    if (!data) return;

    currentLevel = level;
    matchesFound = 0;
    
    const cards = [];
    data.pairs.forEach(pair => {
        // ID único para o par
        const pairId = 'pair-' + pair.en.toLowerCase().replace(/\s/g, '-'); 
        
        cards.push({ id: pairId, type: 'en', content: pair.en, flipped: false, matched: false });
        cards.push({ id: pairId, type: 'pt', content: pair.pt, flipped: false, matched: false });
    });

    gameBoard = shuffle(cards);
    boardElement.className = `memory-board-grid ${data.grid}`;
    boardElement.innerHTML = '';
    messageElement.innerHTML = '';

    gameBoard.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.pairId = card.id;
        cardElement.dataset.index = index; // Usado para referenciar no array
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><i class="fas fa-language"></i></div>
                <div class="card-back">${card.content}</div>
            </div>
        `;
        cardElement.addEventListener('click', flipCard);
        boardElement.appendChild(cardElement);
    });
}

/**
 * Lógica para virar a carta.
 */
function flipCard() {
    if (lockBoard) return;
    const index = parseInt(this.dataset.index);
    let card = gameBoard[index];
    
    // Não permite virar cartas já viradas, combinadas ou a mesma carta duas vezes
    if (card.flipped || card.matched || this === cardsFlipped[0]?.element) return;

    card.flipped = true;
    this.classList.add('flipped');
    
    cardsFlipped.push({ element: this, card: card });

    if (cardsFlipped.length === 2) {
        lockBoard = true;
        checkForMatch();
    }
}

/**
 * Verifica se as duas cartas viradas são um par.
 */
function checkForMatch() {
    const [card1, card2] = cardsFlipped;
    
    if (card1.card.id === card2.card.id) {
        // Combinação!
        matchesFound++;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        gameBoard[card1.element.dataset.index].matched = true;
        gameBoard[card2.element.dataset.index].matched = true;
        resetFlippedCards();
        
        if (matchesFound === memoryWords[currentLevel].pairs.length) {
            messageElement.innerHTML = '<div class="alert alert-success mt-4">Parabéns! Você completou o nível <strong>' + currentLevel.toUpperCase() + '</strong>! <i class="fas fa-check-circle"></i></div>';
        }
    } else {
        // Sem combinação. Vira as cartas de volta após um pequeno delay.
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            gameBoard[card1.element.dataset.index].flipped = false;
            gameBoard[card2.element.dataset.index].flipped = false;
            resetFlippedCards();
        }, 1000);
    }
}

/**
 * Reseta o estado das cartas viradas e do bloqueio do tabuleiro.
 */
function resetFlippedCards() {
    [cardsFlipped, lockBoard] = [[], false];
}

// --------------------------------------------------------------------------------
// ## INICIALIZAÇÃO DO JOGO DA MEMÓRIA
// --------------------------------------------------------------------------------
function initializeMemoryGame() {
    boardElement = document.getElementById('memory-board');
    messageElement = document.getElementById('game-message');
    const levelButtons = document.querySelectorAll('.btn-level');

    if (boardElement && levelButtons.length > 0) {
        levelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const level = e.currentTarget.dataset.level;
                // Remove 'active-level' de todos e adiciona ao clicado
                levelButtons.forEach(b => b.classList.remove('active-level'));
                e.currentTarget.classList.add('active-level');
                buildMemoryBoard(level);
            });
        });
    }
}

// Atualize o listener DOMContentLoaded no final de script.js para incluir a inicialização:
// ... (Código existente) ...
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a exibição da pontuação na página pontuacao.html
    displayLastScoreAndFeedback();
    
    // Inicializa o ranking (usado na lateral de quiz.html)
    displayRanking();

    // Eventos específicos para a página do quiz (quiz.html)
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
    if (quizForm) {
        quizForm.addEventListener('submit', submitQuiz);
        loadQuestions(); 
    }

    // Inicializa o Jogo da Memória se os elementos estiverem presentes
    initializeMemoryGame();
});