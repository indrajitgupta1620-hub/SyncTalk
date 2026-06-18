import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Summarize an array of chat messages into 3–4 bullet points.
 * Tries multiple Gemini models in sequence if one is unavailable.
 * Falls back to a basic extractive summary if no API key is configured
 * or all models fail.
 *
 * @param {Array<{sender: string, content: string, timestamp: Date}>} messages
 * @returns {Promise<string[]>} Array of bullet point strings
 */
export const summarizeMessages = async (messages) => {
  const genAI = getClient();

  // Format conversation for the prompt
  const conversation = messages
    .map((m) => `[${m.sender}]: ${m.content}`)
    .join('\n');

  if (!genAI) {
    console.warn('No GEMINI_API_KEY configured, using fallback summarizer');
    return fallbackSummary(messages);
  }

  const prompt = `You are a team communication assistant. Summarize the following team chat messages into exactly 3-4 bullet points. Focus on:
- Decisions made
- Progress updates
- Blockers or issues raised
- Pending tasks or action items

Keep each bullet point concise (1-2 sentences max). Return ONLY the bullet points, one per line, starting with "• ".

Conversation:
${conversation}`;

  // Try each model in sequence
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying summarization with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const bullets = text
        .split('\n')
        .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
        .filter((line) => line.length > 0)
        .slice(0, 4);

      if (bullets.length > 0) {
        console.log(`Summarization succeeded with model: ${modelName}`);
        return bullets;
      }
    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}`);
      // Continue to next model
    }
  }

  // All models failed — use extractive fallback
  console.warn('All Gemini models failed, using extractive fallback');
  return fallbackSummary(messages);
};

/**
 * Basic fallback summary when API is not available.
 * Extracts key patterns from messages.
 */
function fallbackSummary(messages) {
  const bullets = [];
  const participants = [...new Set(messages.map((m) => m.sender))];
  bullets.push(
    `Discussion between ${participants.length} team members: ${participants.slice(0, 5).join(', ')}`
  );

  // Find messages with action-oriented keywords
  const actionKeywords = /\b(done|completed|finished|fixed|merged|deployed|updated|created)\b/i;
  const blockerKeywords = /\b(blocked|stuck|issue|problem|bug|error|failing|broken)\b/i;
  const taskKeywords = /\b(todo|need to|should|will|plan to|going to|assign|task)\b/i;

  const actions = messages.filter((m) => actionKeywords.test(m.content));
  const blockers = messages.filter((m) => blockerKeywords.test(m.content));
  const tasks = messages.filter((m) => taskKeywords.test(m.content));

  if (actions.length > 0) {
    bullets.push(
      `Progress: "${actions[actions.length - 1].content.slice(0, 100)}"`
    );
  }
  if (blockers.length > 0) {
    bullets.push(
      `Blockers: "${blockers[blockers.length - 1].content.slice(0, 100)}"`
    );
  }
  if (tasks.length > 0) {
    bullets.push(
      `Tasks: "${tasks[tasks.length - 1].content.slice(0, 100)}"`
    );
  }

  // If we still lack context bullets, grab the most recent meaningful messages
  if (bullets.length < 3) {
    const recentMessages = messages
      .filter((m) => m.content && m.content.length > 15) // Ignore very short messages like "ok"
      .slice(-3); // Get the last 3

    for (const msg of recentMessages) {
      if (bullets.length < 4) {
        bullets.push(`Context from ${msg.sender}: "${msg.content.slice(0, 100)}"`);
      }
    }
  }

  if (bullets.length === 1) {
    bullets.push(`${messages.length} messages exchanged in this conversation.`);
  }

  return bullets.slice(0, 4);
}

