// Google Gemini AI Integration for Socratic CP Coach
// Enforces strict Socratic guardrails: NO code solutions, ONLY guiding questions & conceptual hints

export interface SocraticRequest {
  apiKey: string;
  problemTitle: string;
  problemDescription: string;
  userCode: string;
  userLanguage: string;
  userQuestion?: string;
  hintType: 'conceptual' | 'edge_cases' | 'logic_probe';
}

const SOCRATIC_SYSTEM_PROMPT = `
You are the CPmunnity "CP Coach", an expert Socratic tutor for Competitive Programming.

YOUR STRICTEST RULES (NEVER VIOLATE THESE UNDER ANY CIRCUMSTANCES):
1. NEVER write actual code solutions in any programming language (C++, Python, Java, JS, Rust, etc.).
2. NEVER output direct code snippets, function blocks, or full executable pseudocode.
3. NEVER reveal the exact direct answer or explicit algorithm implementation.
4. YOU MUST ALWAYS respond in a Socratic manner:
   - Ask 1 to 2 targeted guiding questions that force the student to discover the flaw or pattern themselves.
   - Highlight conceptual blind spots (e.g. "What happens when N is 1?", "Consider time complexity limits when N = 10^5", "Is integer overflow possible here?").
   - Nudge them toward appropriate data structures (e.g., prefix sums, priority queues, 2-pointers, binary search on answer) without writing code for it.
5. Keep your tone encouraging, analytical, and concise (under 180 words). Format your response with clear bullet points and markdown.
`;

export async function askSocraticCoach(req: SocraticRequest): Promise<string> {
  let cleanKey = (req.apiKey || '').trim();
  cleanKey = cleanKey.replace(/^['"]|['"]$/g, '').replace(/^key=/i, '');

  if (!cleanKey) {
    throw new Error('No Google Gemini API Key provided. Please set your API key in Settings or in the Assistant drawer.');
  }

  const hintPrompts = {
    conceptual: 'Give me a high-level conceptual hint or mathematical observation about this problem without revealing code.',
    edge_cases: 'Point out critical edge cases (boundary values, empty input, large numbers) I should check in my solution.',
    logic_probe: 'Review my current code logic and point out where my reasoning or complexity might break down using Socratic questions.'
  };

  const userPrompt = `
Problem: ${req.problemTitle}
Problem Description snippet:
${req.problemDescription.slice(0, 800)}...

User's Code Language: ${req.userLanguage}
User's Current Code:
\`\`\`${req.userLanguage}
${req.userCode || '// No code written yet'}
\`\`\`

Request Type: ${req.hintType.toUpperCase()}
User's explicit question: ${req.userQuestion || hintPrompts[req.hintType]}

Remember: DO NOT write any code! Ask Socratic questions and provide conceptual guidance.
`;

  // Sequential model endpoint fallback list for maximum API key compatibility
  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  let lastErrorMessage = '';

  for (const model of modelsToTry) {
    try {
      // Attempt 1: Standard v1beta payload with system_instruction
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SOCRATIC_SYSTEM_PROMPT }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          return candidateText;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        lastErrorMessage = msg;

        // Attempt 2: Fallback without system_instruction parameter (for older model configurations)
        if (response.status === 400) {
          const fallbackResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${SOCRATIC_SYSTEM_PROMPT}\n\n${userPrompt}` }]
                  }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 600
                }
              })
            }
          );
          if (fallbackResp.ok) {
            const data = await fallbackResp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 0) {
              return text;
            }
          }
        }
      }
    } catch (error: any) {
      console.warn(`Gemini model ${model} fetch error:`, error);
      lastErrorMessage = error.message || 'Network request failed.';
    }
  }

  throw new Error(`Gemini API Connection Error: ${lastErrorMessage || 'Please verify your API key is active in Google AI Studio.'}`);
}
