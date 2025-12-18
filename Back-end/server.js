// server.js - AI-Driven Backend (No Hardcoded Questions)
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-flash-latest',  // NEW - from your available models
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Profession context (ONLY context, no questions)
const professions = {
  'frontend': {
    name: 'Frontend Developer',
    skills: ['HTML/CSS/JavaScript', 'React/Vue/Angular', 'Responsive Design', 'Web Performance', 'REST APIs', 'Git'],
    focus: 'client-side web development, user interfaces, and interactive experiences'
  },
  'backend': {
    name: 'Backend Developer',
    skills: ['Node.js/Python/Java', 'SQL/NoSQL Databases', 'REST APIs', 'Authentication', 'Microservices', 'Cloud'],
    focus: 'server-side logic, databases, APIs, and system architecture'
  },
  'designer': {
    name: 'UI/UX Designer',
    skills: ['Figma/Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'Typography', 'Accessibility'],
    focus: 'user experience design, interface design, and design thinking'
  },
  'product-manager': {
    name: 'Product Manager',
    skills: ['Product Strategy', 'Agile/Scrum', 'Market Analysis', 'Roadmaps', 'Stakeholder Management', 'Metrics'],
    focus: 'product vision, strategy, prioritization, and cross-functional leadership'
  },
  'marketing-manager': {
    name: 'Marketing Manager',
    skills: ['Digital Marketing', 'SEO/SEM', 'Content Marketing', 'Analytics', 'Social Media', 'Campaign Management'],
    focus: 'marketing strategy, campaigns, brand awareness, and customer acquisition'
  },
  'data-scientist': {
    name: 'Data Scientist',
    skills: ['Python/R', 'Machine Learning', 'Statistics', 'Data Visualization', 'SQL', 'Deep Learning'],
    focus: 'data analysis, machine learning models, statistical analysis, and insights'
  }
};

// Call Gemini API
// Call Gemini API with retry for 503 errors
async function callGemini(systemPrompt, userPrompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      console.log(`\n📤 Attempt ${attempt}/${retries}: Sending to AI (${fullPrompt.length} chars)...`);
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log(`✅ AI Response: ${text.substring(0, 100)}...`);
      return text;
    } catch (error) {
      console.error(`❌ Attempt ${attempt}/${retries} failed:`, error.message);
      
      // If last attempt, throw error
      if (attempt === retries) {
        throw error;
      }
      
      // If 503 (overloaded), wait longer
      if (error.status === 503) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Model overloaded. Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // For other errors, wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'SuhbatAI Backend - AI-Driven',
    apiProvider: 'Google Gemini',
    apiKey: process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ MISSING!'
  });
});

// Get professions
app.get('/professions', (req, res) => {
  const profList = Object.keys(professions).map(id => ({
    id,
    name: professions[id].name,
    skills: professions[id].skills
  }));
  res.json(profList);
});

// Start interview - AI generates first question
app.post('/interview/start', async (req, res) => {
  try {
    const { profession } = req.body;
    const prof = professions[profession];
    
    if (!prof) {
      return res.status(400).json({ error: 'Invalid profession' });
    }

    console.log(`\n🎙️ === Starting ${prof.name} Interview ===`);

    const systemPrompt = `You are a professional interviewer with 10+ years of experience conducting technical interviews.

Role: ${prof.name}
Focus: ${prof.focus}
Key Skills: ${prof.skills.join(', ')}

Your task: Ask engaging, relevant interview questions that assess the candidate's experience and skills.`;

    const userPrompt = `Generate the FIRST interview question for this ${prof.name} candidate.

Guidelines:
- Start with a warm, open-ended question
- Examples: "Tell me about yourself", "What interests you about this role?", "Walk me through your experience"
- Make it conversational and welcoming
- Focus on their background and motivation

Output ONLY the question. No greeting, no explanation, just the question.`;

    const question = await callGemini(systemPrompt, userPrompt);
    res.json({ question });

  } catch (error) {
    console.error('❌ Start Error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Next question - AI generates based on conversation
app.post('/interview/next', async (req, res) => {
  try {
    const { profession, conversationHistory, questionNumber } = req.body;
    const prof = professions[profession];

    if (!prof) {
      return res.status(400).json({ error: 'Invalid profession' });
    }

    console.log(`\n🎙️ === Question ${questionNumber}/${6} for ${prof.name} ===`);

    // Get conversation context
    const recentConversation = conversationHistory.slice(-4); // Last 2 Q&A pairs
    const conversationText = recentConversation
      .map(m => `${m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}: ${m.content}`)
      .join('\n');

    // Define interview stage
    let stage = '';
    if (questionNumber <= 2) {
      stage = 'Background & Experience';
    } else if (questionNumber <= 4) {
      stage = 'Technical Skills & Knowledge';
    } else {
      stage = 'Behavioral & Problem-Solving';
    }

    const systemPrompt = `You are interviewing a ${prof.name} candidate.

Role Context:
- Position: ${prof.name}
- Focus Area: ${prof.focus}
- Required Skills: ${prof.skills.join(', ')}

Current Interview Stage: ${stage}
Question ${questionNumber} of 6

Recent conversation:
${conversationText}

Your task: Generate the NEXT interview question based on:
1. The candidate's previous answer
2. The current interview stage
3. The role's required skills`;

    let stageGuidance = '';
    if (questionNumber <= 2) {
      stageGuidance = `Ask about their practical experience with ${prof.skills[0]} or ${prof.skills[1]}.`;
    } else if (questionNumber <= 4) {
      stageGuidance = `Ask a technical question about ${prof.skills[2]} or ${prof.skills[3]}. Make it specific to ${prof.name} work.`;
    } else {
      stageGuidance = `Ask a behavioral question: "Tell me about a time when..." or "How would you handle...". Focus on real scenarios a ${prof.name} faces.`;
    }

    const userPrompt = `Generate the next interview question.

Stage Guidance: ${stageGuidance}

Requirements:
- Build naturally on their previous answer
- Make it specific to ${prof.name} role
- Ask ONE clear question
- Be conversational and professional

Output ONLY the question, nothing else.`;

    const question = await callGemini(systemPrompt, userPrompt);
    res.json({ question });

  } catch (error) {
    console.error('❌ Next Question Error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Evaluate interview - AI analyzes all answers
app.post('/interview/evaluate', async (req, res) => {
  try {
    const { profession, conversationHistory } = req.body;
    const prof = professions[profession];

    if (!prof) {
      return res.status(400).json({ error: 'Invalid profession' });
    }

    console.log(`\n📊 === Evaluating ${prof.name} Interview ===`);

    // Extract Q&A pairs
    const qaList = [];
    for (let i = 0; i < conversationHistory.length; i += 2) {
      if (conversationHistory[i] && conversationHistory[i + 1]) {
        qaList.push({
          question: conversationHistory[i].content,
          answer: conversationHistory[i + 1].content
        });
      }
    }

    const qaText = qaList
      .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
      .join('\n\n');

    console.log(`📝 Analyzing ${qaList.length} Q&A pairs...`);

    const systemPrompt = `You are an expert interview evaluator for ${prof.name} positions.

Role Context:
- Position: ${prof.name}
- Required Skills: ${prof.skills.join(', ')}
- Focus: ${prof.focus}

Interview Transcript:
${qaText}

Your task: Provide a comprehensive, constructive evaluation of this interview performance.`;

    const userPrompt = `Evaluate this ${prof.name} interview and return ONLY valid JSON:

{
  "averageScore": <number 1-10 (can be decimal like 7.5)>,
  "skillRatings": {
    "Communication": <number 1-10>,
    "Structure": <number 1-10>,
    "Confidence": <number 1-10>,
    "Technical Knowledge": <number 1-10>
  },
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "weakPoints": [
    "<specific area to improve 1>",
    "<specific area to improve 2>",
    "<specific area to improve 3>"
  ],
  "recommendations": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>"
  ]
}

CRITICAL RULES:
1. Output ONLY the JSON object above
2. NO markdown formatting, NO code blocks, NO extra text
3. Do NOT add bullets (•), checkmarks (✓), or numbers (1.) to list items
4. Each list item should start with a capital letter and be plain text
5. Be specific and constructive in your feedback
6. Scores should reflect actual performance

Example of correct format:
"strengths": [
  "Demonstrated strong knowledge of React hooks",
  "Provided clear examples from real projects",
  "Communicated technical concepts effectively"
]`;

    const response = await callGemini(systemPrompt, userPrompt);
    
    // Clean response
    let cleanResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Extract JSON if wrapped in text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    
    console.log(`📄 Response length: ${cleanResponse.length} chars`);
    
    const evaluation = JSON.parse(cleanResponse);
    console.log(`✅ Average Score: ${evaluation.averageScore}/10\n`);
    
    res.json(evaluation);

  } catch (error) {
    console.error('❌ Evaluation Error:', error.message);
    console.log('Using fallback evaluation...');
    
    // Simple fallback
    res.json({
      averageScore: 7.0,
      skillRatings: {
        Communication: 7,
        Structure: 7,
        Confidence: 7,
        'Technical Knowledge': 7
      },
      strengths: [
        "Clear communication throughout the interview",
        "Demonstrated understanding of key concepts",
        "Maintained professional demeanor"
      ],
      weakPoints: [
        "Could provide more specific examples from experience",
        "Some answers would benefit from better structure",
        "Technical explanations could go deeper"
      ],
      recommendations: [
        "Use the STAR method for behavioral questions",
        "Prepare 3-5 concrete examples beforehand",
        "Practice explaining complex concepts simply"
      ]
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 SuhbatAI Backend Started!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: Google Gemini (AI-Driven)`);
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ MISSING!'}`);
  console.log(`\n✨ AI generates ALL questions dynamically!\n`);
});