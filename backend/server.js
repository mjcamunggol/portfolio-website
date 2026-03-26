/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PORTFOLIO BACKEND — server.js
 *
 *  Endpoints:
 *    POST /chat             → AI chatbot via OpenRouter (free Llama 3 model)
 *    POST /create-checkout  → PayMongo checkout session
 *    GET  /health           → health check
 *
 *  Setup:
 *    1. cp .env.example .env
 *    2. Fill in your API keys in .env
 *    3. npm install
 *    4. npm run dev  (or node server.js)
 * ═══════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Lock this down in production
  methods: ['GET', 'POST'],
}));

// ══════════════════════════════════════════════════════════════════════════
//  PERSONALIZED SYSTEM PROMPT
//  ──────────────────────────
//  Edit this block to fully personalize the AI chatbot's knowledge.
//  The assistant will only speak about what you define here.
// ══════════════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `
You are a professional portfolio assistant for a Computer Engineering student and developer.
Your job is to answer questions about this developer — their background, skills, and projects.
Keep responses concise, professional, and friendly. Use plain text (no markdown).

=== ABOUT ME ===
Name: Marisa Camunggol
Role: Computer Engineering Student & AI/Web Developer
Location: Philippines
Summary: Passionate about building impactful technology at the intersection of AI,
web development, and system design. Currently pursuing a BS in Computer Engineering.

=== EDUCATION ===
Degree: Bachelor of Science in Computer Engineering
University: Mapua University
Expected Graduation: 2027

=== KEY PROJECTS ===

1. AI-Based Filipino Sign Language Recognition
   - Real-time hand gesture recognition using computer vision and deep learning
   - Bridges communication gaps for the Filipino deaf community
   - Technologies: Python, TensorFlow, OpenCV, MediaPipe
   - Trained custom CNN model on Filipino Sign Language dataset
   - Achieved 94% accuracy on real-time gesture recognition

2. FoodLink Donation Platform
   - Web platform connecting food donors with beneficiaries
   - Reduces food waste and addresses hunger in local Filipino communities
   - Technologies: React, Node.js, MongoDB, Google Maps API
   - Features: donor/beneficiary matching, real-time notifications, route optimization

3. Student Maintenance System
   - Full-stack facility management system for campus use
   - Tracks maintenance requests, work orders, and asset records
   - Technologies: PHP, MySQL, Bootstrap, jQuery
   - Deployed at Imus Institute of Science and Technology

=== TECHNICAL SKILLS ===
- AI/ML: Python, TensorFlow, OpenCV, MediaPipe, scikit-learn
- Frontend: HTML, CSS, JavaScript, React, Three.js, WebGL
- Backend: Node.js, Express, PHP, REST APIs
- Databases: MongoDB, MySQL, PostgreSQL
- Tools: Git, VS Code, Figma, Postman, Docker (basics)
- Specializations: Computer Vision, LLM Integration, System Design

=== AVAILABILITY ===
- Open to internships, full-time work, freelance projects, and collaborations
- Can be reached via the contact form on this portfolio, or email: mjcamunggol@gmail.com
- Response time: within 24–48 hours

=== COMMUNICATION RULES ===
- Answer ONLY questions about this developer's background, skills, and projects
- If asked something unrelated, politely redirect: "I'm here to answer questions about Marisa's portfolio. Is there something specific about their work I can help with?"
- Never make up projects or skills not listed above
- Keep answers to 2–4 sentences unless more detail is requested
- Do not use markdown formatting in your responses
`.trim();

// ══════════════════════════════════════════════════════════════════════════
//  ROUTE: POST /chat
//  ──────────────────
//  Uses OpenRouter API — FREE tier available.
//  Default model: meta-llama/llama-3-8b-instruct:free
//
//  To get your free API key:
//  1. Sign up at https://openrouter.ai
//  2. Go to Keys → Create Key
//  3. Paste in .env as OPENROUTER_API_KEY
//
//  Free models available at: https://openrouter.ai/models?q=free
// ══════════════════════════════════════════════════════════════════════════
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set in .env' });
    }

    // Build the full message history with system prompt prepended
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-20), // Keep last 20 turns to stay within context limits
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free',
        messages: fullMessages,
        max_tokens: 400,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'Portfolio AI Assistant',
        },
        timeout: 30000,
      }
    );

    const reply = response.data.choices?.[0]?.message?.content?.trim()
      || 'Sorry, I could not generate a response right now.';

    res.json({ reply });

  } catch (err) {
    console.error('[/chat] Error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const msg    = err.response?.data?.error?.message || err.message || 'AI service error';
    res.status(status).json({ error: msg });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  ROUTE: POST /create-checkout
//  ─────────────────────────────
//  Creates a PayMongo Checkout Session and returns the hosted checkout URL.
//
//  PayMongo setup:
//  1. Create account at https://dashboard.paymongo.com
//  2. Get your SECRET key from Developers → API Keys
//  3. For TEST mode: use sk_test_... key
//  4. For LIVE mode: use sk_live_... key
//  5. Paste secret key in .env as PAYMONGO_SECRET_KEY
//
//  Payment methods supported: gcash, card, grab_pay, paymaya
//  (enable these in your PayMongo dashboard first)
// ══════════════════════════════════════════════════════════════════════════
app.post('/create-checkout', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount < 50) {
      return res.status(400).json({ error: 'amount must be a number >= 50 (PHP)' });
    }

    if (!process.env.PAYMONGO_SECRET_KEY) {
      return res.status(500).json({ error: 'PAYMONGO_SECRET_KEY is not set in .env' });
    }

    const amountInCentavos = Math.round(parseFloat(amount) * 100);

    // Build success and cancel URLs — must be publicly accessible
    // In development: use ngrok or similar to expose localhost
    const baseUrl   = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/#donate?payment=success`;
    const cancelUrl  = `${baseUrl}/#donate?payment=cancelled`;

    // PayMongo Checkout Session API
    // Docs: https://developers.paymongo.com/reference/checkout-session-resource
    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            billing: {
              name:  'Portfolio Donor',
              email: 'donor@example.com', // Optional — PayMongo will ask user
            },
            send_email_receipt: true,
            show_description:   true,
            show_line_items:    true,
            cancel_url:  cancelUrl,
            success_url: successUrl,
            description: 'Support my open-source work and student projects!',
            line_items: [
              {
                currency:    'PHP',
                amount:      amountInCentavos,
                name:        'Portfolio Donation',
                description: 'Donation to support development projects',
                quantity:    1,
              },
            ],
            payment_method_types: [
              'gcash',
              'card',
              'grab_pay',
              // 'paymaya', // uncomment if enabled in your PayMongo dashboard
            ],
          },
        },
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const checkoutUrl = response.data?.data?.attributes?.checkout_url;
    if (!checkoutUrl) throw new Error('PayMongo did not return a checkout URL');

    res.json({ checkoutUrl });

  } catch (err) {
    console.error('[/create-checkout] Error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const msg    = err.response?.data?.errors?.[0]?.detail
      || err.response?.data?.message
      || err.message
      || 'Payment error';
    res.status(status).json({ error: msg });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  ROUTE: GET /health
// ══════════════════════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      paymongo:   !!process.env.PAYMONGO_SECRET_KEY,
    },
  });
});

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Portfolio backend running on http://localhost:${PORT}`);
  console.log(`   OpenRouter API key: ${process.env.OPENROUTER_API_KEY ? '✓ set' : '✗ MISSING'}`);
  console.log(`   PayMongo key:       ${process.env.PAYMONGO_SECRET_KEY ? '✓ set' : '✗ MISSING'}`);
  console.log(`\n   Health check: http://localhost:${PORT}/health\n`);
});
