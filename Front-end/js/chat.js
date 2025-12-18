document.addEventListener("DOMContentLoaded", async () => {
    // ====== GET PROFESSION FROM URL ======
    const urlParams = new URLSearchParams(window.location.search);
    const profession = urlParams.get('profession');
    
    if (!profession) {
        alert('No profession selected! Redirecting...');
        window.location.href = 'professions.html';
        return;
    }

    // Update header
    const professionNames = {
        'frontend': 'Frontend Developer',
        'backend': 'Backend Developer',
        'designer': 'UI/UX Designer',
        'product-manager': 'Product Manager',
        'marketing-manager': 'Marketing Manager',
        'data-scientist': 'Data Scientist'
    };
    
    document.getElementById('professionHeader').textContent = 
        `${professionNames[profession] || profession} Interview`;

    // ====== CHAT LOGIC ======
    let questionCount = 0;
    const maxQuestions = 6;
    let conversationHistory = [];

    const chatWindow = document.getElementById("chatWindow");
    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");

    if (!chatWindow || !sendBtn || !userInput) {
        console.error("Chat elements not found!");
        return;
    }

    // ====== HELPER FUNCTIONS ======
    function addAIMessage(text) {
        const msg = document.createElement("div");
        msg.className = "chat-message ai-message";
        msg.textContent = text;
        msg.style.opacity = 0;
        chatWindow.appendChild(msg);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        setTimeout(() => msg.style.opacity = 1, 50);
    }

    function addUserMessage(text) {
        const msg = document.createElement("div");
        msg.className = "chat-message user-message";
        msg.textContent = text;
        msg.style.opacity = 0;
        chatWindow.appendChild(msg);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        setTimeout(() => msg.style.opacity = 1, 50);
    }

    function showLoading() {
        const loading = document.createElement("div");
        loading.className = "chat-message ai-message";
        loading.id = "loading-message";
        loading.textContent = "Thinking...";
        loading.style.opacity = 0.7;
        chatWindow.appendChild(loading);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeLoading() {
        const loading = document.getElementById("loading-message");
        if (loading) loading.remove();
    }

    // ====== START INTERVIEW ======
    try {
        showLoading();
        const response = await fetch('http://localhost:3000/interview/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profession })
        });

        const data = await response.json();
        removeLoading();
        
        if (data.question) {
            addAIMessage(data.question);
            conversationHistory.push({ 
                role: 'assistant', 
                content: data.question 
            });
        } else {
            addAIMessage("Hello! Let's start your interview. Tell me about yourself.");
        }
    } catch (error) {
        removeLoading();
        console.error('Start error:', error);
        addAIMessage("Sorry, there was an error starting the interview. Please refresh the page.");
    }

    // ====== SEND BUTTON HANDLER ======
    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        // Disable input while processing
        userInput.disabled = true;
        sendBtn.disabled = true;

        addUserMessage(message);
        userInput.value = "";

        conversationHistory.push({ role: "user", content: message });
        questionCount++;

        if (questionCount >= maxQuestions) {
            await evaluateInterview();
            return;
        }

        // Get next question
        try {
            showLoading();
            const response = await fetch('http://localhost:3000/interview/next', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    profession,
                    conversationHistory,
                    questionNumber: questionCount + 1
                })
            });

            const data = await response.json();
            removeLoading();

            if (data.question) {
                addAIMessage(data.question);
                conversationHistory.push({ 
                    role: 'assistant', 
                    content: data.question 
                });
            } else {
                addAIMessage("Could you elaborate on that?");
            }
        } catch (error) {
            removeLoading();
            console.error('Next question error:', error);
            addAIMessage("Sorry, there was an error. Please try again.");
        }

        // Re-enable input
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }

    sendBtn.addEventListener("click", handleSend);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    // ====== EVALUATE INTERVIEW ======
    async function evaluateInterview() {
        document.querySelector(".chat-input-container").style.display = "none";
        
        addAIMessage("Thank you for completing the interview! Evaluating your responses...");
        
        try {
            showLoading();
            const response = await fetch('http://localhost:3000/interview/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    profession,
                    conversationHistory
                })
            });

            const evaluation = await response.json();
            removeLoading();

            // Store results in sessionStorage
            sessionStorage.setItem('interviewResults', JSON.stringify({
                profession,
                evaluation
            }));

            // Show completion message
            showInterviewComplete();
            
        } catch (error) {
            removeLoading();
            console.error('Evaluation error:', error);
            addAIMessage("There was an error evaluating your interview. Please try again.");
        }
    }

    function showInterviewComplete() {
        const box = document.getElementById("interviewComplete");
        box.classList.remove("hidden");
        setTimeout(() => box.classList.add("show"), 50);
    }

    // ====== SEE RESULTS BUTTON ======
    const resultsBtn = document.getElementById("seeResultsBtn");
    if (resultsBtn) {
        resultsBtn.addEventListener("click", () => {
            window.location.href = `results.html?profession=${profession}`;
        });
    }
});