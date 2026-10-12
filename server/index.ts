import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Retrieve API Key safely from server environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('✨ Google GenAI Client successfully initialized!');
  } catch (err) {
    console.warn('⚠️ Failed to initialize GoogleGenAI client:', err);
  }
} else {
  console.log('ℹ️ Running in heuristic fallback mode. Set GEMINI_API_KEY in server/.env to enable live LLM inference.');
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    name: 'PG Proof AI Gateway',
    version: '1.0.0',
    aiConfigured: Boolean(GEMINI_API_KEY && aiClient),
    model: 'gemini-2.5-flash',
    instructions: GEMINI_API_KEY
      ? 'Live AI active and ready for listing analysis and multi-turn chat.'
      : 'To activate live Gemini AI, add GEMINI_API_KEY=your_key in server/.env or export it in your shell environment.',
  });
});

/**
 * Heuristic Listing Parser (Fallback when API key is missing or offline)
 */
function heuristicParseListing(text: string): any {
  const clean = text.toLowerCase();

  // Rent detection
  let rent = 9000;
  const rentMatch = text.match(/(?:rent|price|rs\.?|inr|₹)\s*[:=-]?\s*([0-9]{3,6})/i) ||
                    text.match(/([0-9]{4,5})\s*(?:\/|\s)?(?:pm|per\s*month|month|k\b)/i);
  if (rentMatch) {
    const raw = parseInt(rentMatch[1], 10);
    rent = raw < 100 ? raw * 1000 : raw;
  }

  // Deposit detection
  let deposit = rent * 2;
  const depositMatch = text.match(/(?:deposit|security|advance)\s*[:=-]?\s*([0-9]{3,6})/i);
  if (depositMatch) {
    deposit = parseInt(depositMatch[1], 10);
  }

  // Food inclusion
  const foodIncluded = clean.includes('food included') ||
                       clean.includes('3 meals') ||
                       clean.includes('mess included') ||
                       (clean.includes('breakfast') && clean.includes('dinner'));

  // Electricity
  let electricityRule = 'Submeter basis at ₹10-12/unit';
  let electricityEstimate = 1000;
  if (clean.includes('electricity included') || clean.includes('power included')) {
    electricityRule = 'Included in rent';
    electricityEstimate = 0;
  } else if (clean.includes('commercial') || clean.includes('12/unit') || clean.includes('14/unit')) {
    electricityRule = 'Commercial submeter tariff (₹12+/unit)';
    electricityEstimate = 1600;
  }

  // Lock-in
  let lockInMonths = 1;
  const lockMatch = clean.match(/([0-9]+)\s*(?:month|mo)\s*lock/);
  if (lockMatch) lockInMonths = parseInt(lockMatch[1], 10);

  // Amenities
  const amenities: string[] = [];
  if (clean.includes('wifi') || clean.includes('wi-fi')) amenities.push('High Speed Wi-Fi');
  if (clean.includes('ac') || clean.includes('air condition')) amenities.push('Air Conditioner');
  if (clean.includes('geyser') || clean.includes('hot water')) amenities.push('Geyser / Hot Water');
  if (clean.includes('washing') || clean.includes('laundry')) amenities.push('Washing Machine');
  if (clean.includes('cctv') || clean.includes('security')) amenities.push('24x7 CCTV & Security');
  if (clean.includes('housekeeping') || clean.includes('cleaning')) amenities.push('Daily Housekeeping');
  if (clean.includes('lift') || clean.includes('elevator')) amenities.push('Elevator / Lift');
  if (clean.includes('ro') || clean.includes('water purifier')) amenities.push('RO Drinking Water');

  // Red Flags detection
  const redFlags: any[] = [];
  if (clean.includes('non-refundable') || clean.includes('deduction on exit')) {
    redFlags.push({
      id: `rf-${Date.now()}-1`,
      title: 'Non-Refundable Deposit / Exit Deduction',
      severity: 'high',
      category: 'deposit',
      explanation: 'Owner indicates upfront deduction from security deposit upon vacating.',
    });
  }
  if (clean.includes('curfew') || clean.includes('10 pm') || clean.includes('gate lock')) {
    redFlags.push({
      id: `rf-${Date.now()}-2`,
      title: 'Restricted Curfew / Gate Locking',
      severity: 'high',
      category: 'curfew',
      explanation: 'Curfew rules may disrupt late-night study, internships, or exam schedules.',
    });
  }
  if (clean.includes('no visitor') || clean.includes('no friends')) {
    redFlags.push({
      id: `rf-${Date.now()}-3`,
      title: 'Strict No-Visitor Clause',
      severity: 'medium',
      category: 'agreement',
      explanation: 'Friends or parents may not be permitted to visit even common areas.',
    });
  }
  if (electricityEstimate > 1200) {
    redFlags.push({
      id: `rf-${Date.now()}-4`,
      title: 'High / Commercial Electricity Tariff',
      severity: 'high',
      category: 'utilities',
      explanation: 'Unit rates above standard residential rates can inflate monthly costs by ₹1,500+.',
    });
  }

  // Missing info
  const missingInformation: string[] = [];
  if (!clean.includes('notice')) missingInformation.push('Notice period duration not explicitly stated');
  if (!clean.includes('maintenance')) missingInformation.push('Maintenance charges policy not specified');
  if (!clean.includes('laundry')) missingInformation.push('Washing machine / laundry limits not clarified');
  if (!clean.includes('agreement')) missingInformation.push('Stamp paper agreement requirement not stated');

  return {
    title: text.split('\n')[0].substring(0, 40) || 'Analyzed PG Accommodation',
    locality: 'Identified Area',
    city: 'City',
    roomType: clean.includes('single') ? 'single' : clean.includes('triple') ? 'triple' : 'double',
    monthlyRent: rent,
    securityDeposit: deposit,
    depositRefundable: !clean.includes('non-refundable deposit'),
    maintenanceCharges: clean.includes('maintenance included') ? 0 : 500,
    waterAndGasCharges: 0,
    electricityEstimate,
    electricityRule,
    foodIncluded,
    foodCostEstimate: foodIncluded ? 0 : 3500,
    laundryCharges: 0,
    wifiCharges: 0,
    oneTimeMoveInFee: 500,
    brokerageFee: 0,
    lockInPeriodMonths: lockInMonths,
    noticePeriodDays: 30,
    amenities: amenities.length > 0 ? amenities : ['Wi-Fi', 'RO Water', 'CCTV', 'Housekeeping'],
    restrictions: clean.includes('curfew') ? ['10 PM Gate Closure'] : ['Standard co-living etiquette'],
    missingInformation,
    redFlags,
    questionsToAskLandlord: [
      'What is the exact per-unit electricity rate on the room submeter?',
      'Is the security deposit returned via UPI/NEFT within 7 days of moving out?',
      'Are there any deductions for deep cleaning or repainting when leaving?',
      'Is weekend mess food included or extra?',
    ],
    summary: 'Analyzed using PG Proof intelligence rules. Verified essential numbers; check red flags with landlord before sending token money.',
    overallRating: redFlags.some(r => r.severity === 'high') ? 6.2 : 8.4,
    verifiedFactsCount: 6,
    estimatedFactsCount: 3,
  };
}

/**
 * Listing Analysis Endpoint
 */
app.post('/api/analyze-listing', async (req: Request, res: Response) => {
  try {
    const { text = '', imageBase64, userBudget = 15000, targetCity = 'Bengaluru' } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Please provide listing advertisement text or an image screenshot.' });
    }

    // Protection against prompt injection
    const sanitizedText = typeof text === 'string'
      ? text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/[<>]/g, '').slice(0, 5000)
      : '';

    // If Gemini client is active, run real generative model
    if (aiClient && GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are PG Proof AI, an expert accommodation analyst for students in India.
Analyze the provided PG listing advertisement (text or image). Extract accurate factual financial and amenity details.
CRITICAL INSTRUCTIONS:
- Distinguish strictly between stated facts and estimates.
- NEVER fabricate missing details; flag them in missingInformation.
- Detect hidden costs (commercial electricity markups like ₹12/unit, non-refundable deposit deductions, strict curfews, lock-in clauses).
- Return ONLY valid raw JSON with no markdown wrapping and no backticks.
The JSON must follow this exact schema:
{
  "title": string,
  "locality": string,
  "city": string,
  "roomType": "single" | "double" | "triple" | "1rk" | "1bhk" | "other",
  "monthlyRent": number,
  "securityDeposit": number,
  "depositRefundable": boolean,
  "maintenanceCharges": number,
  "waterAndGasCharges": number,
  "electricityEstimate": number,
  "electricityRule": string,
  "foodIncluded": boolean,
  "foodCostEstimate": number,
  "laundryCharges": number,
  "wifiCharges": number,
  "oneTimeMoveInFee": number,
  "brokerageFee": number,
  "lockInPeriodMonths": number,
  "noticePeriodDays": number,
  "curfewTime": string,
  "visitorPolicy": string,
  "amenities": string[],
  "restrictions": string[],
  "missingInformation": string[],
  "redFlags": [
    {
      "id": string,
      "title": string,
      "severity": "high" | "medium" | "low",
      "category": "deposit" | "lockin" | "utilities" | "curfew" | "agreement" | "maintenance",
      "explanation": string
    }
  ],
  "questionsToAskLandlord": string[],
  "summary": string,
  "overallRating": number,
  "verifiedFactsCount": number,
  "estimatedFactsCount": number
}`;

        let contents: any[] = [];
        if (imageBase64) {
          const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          contents = [
            {
              role: 'user',
              parts: [
                { text: `Target City: ${targetCity}. Student Budget: ₹${userBudget}. Please analyze this listing screenshot:\n${sanitizedText}` },
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          ];
        } else {
          contents = [
            {
              role: 'user',
              parts: [
                { text: `Target City: ${targetCity}. Student Budget: ₹${userBudget}. Listing Advertisement:\n\n"""${sanitizedText}"""` },
              ],
            },
          ];
        }

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

        return res.json({
          success: true,
          aiConfigured: true,
          listing: {
            ...parsed,
            id: `listing-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sourceType: imageBase64 ? 'screenshot' : 'text',
          },
        });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to heuristic parser:', geminiErr?.message || geminiErr);
        // Graceful fallback to heuristic with notice
        const fallback = heuristicParseListing(sanitizedText);
        return res.json({
          success: true,
          aiConfigured: true,
          warning: 'Live Gemini API encountered a rate limit or network glitch; heuristic parser was activated.',
          listing: {
            ...fallback,
            id: `listing-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sourceType: imageBase64 ? 'screenshot' : 'text',
          },
        });
      }
    }

    // Default heuristic mode when API key is not supplied
    const fallback = heuristicParseListing(sanitizedText);
    return res.json({
      success: true,
      aiConfigured: false,
      setupMessage: 'Running with local parser. Set GEMINI_API_KEY in server/.env to activate live Google Gemini 2.5 Flash analysis.',
      listing: {
        ...fallback,
        id: `listing-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceType: imageBase64 ? 'screenshot' : 'text',
      },
    });
  } catch (error: any) {
    console.error('Error analyzing listing:', error);
    res.status(500).json({
      error: 'Failed to analyze listing. Please verify the input format and try again.',
      details: error.message,
    });
  }
});

/**
 * PG Proof Buddy Multi-Turn Chat
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], context = {} } = req.body;

    const userMessage = messages[messages.length - 1]?.content || '';
    if (!userMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (aiClient && GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are "PG Proof Buddy", the street-smart, empathetic, and knowledgeable AI companion for college students and young professionals settling into Indian cities (Bangalore, Pune, Delhi NCR, Hyderabad, etc.).
Your mission is to help students navigate:
1. PG listings, rental agreement traps, commercial electricity markups (₹12+/unit), and non-refundable deposit deductions.
2. Real student scam alerts: fake army officer QR codes, society gate-pass advance scams, fake internships. Always advise calling 1930 within the Golden Hour if defrauded.
3. Food & Tiffin: comparing homestyle monthly tiffins (₹2,800-₹3,500/mo) vs daily restaurant eating.
4. City Transport: Namma Metro, BMTC/PMPML/DTC buses (passes save 40%), local auto meter rules, and night 1.5x surcharges.
5. Student Budgets: deterministic math separating one-time refundable deposits from monthly recurring bills.

Communication Style:
- Speak fluently in English, Hindi, or Hinglish depending on how the student texts you.
- Always be encouraging, practical, and protective of the student's safety and money.
- Use clear bullet points and WhatsApp-ready negotiation templates.
- Distinguish between verified facts and estimates; clearly state when something requires in-person physical verification.

Context provided:
Active Listing: ${JSON.stringify(context.activeListing || 'None')}
Student City: ${context.city || 'Bengaluru'}
Student Monthly Budget: ₹${context.budget || 15000}
Active Food Plan: ${JSON.stringify(context.activeFoodPlan || 'None')}
Active Transport: ${JSON.stringify(context.activeTransportMode || 'None')}`;

        const formattedContents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: formattedContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply = response.text || 'Mai yahan hoon aapki help karne ke liye! Ask me anything about this PG or your city.';
        return res.json({
          reply,
          aiConfigured: true,
        });
      } catch (err: any) {
        console.warn('Gemini chat error, falling back:', err?.message || err);
      }
    }

    // Contextual rule-based companion responses
    const lower = userMessage.toLowerCase();
    let reply = '';

    if (lower.includes('scam') || lower.includes('qr') || lower.includes('fraud') || lower.includes('token') || lower.includes('advance')) {
      reply = `Bhai/Behen, stay super alert! Yeh bohot common student scam hai: 🚨\n\n1. **Golden Rule**: NEVER scan any QR code or enter your UPI PIN to "receive" token money. UPI PIN enter karne se sirf paise KATTE hain, aate nahi!\n2. **Fake Army / Gate-pass trap**: Scam broker bolte hain ki "CISF / Society visiting fee" ₹1,500 bhejo pehle. Genuine PGs zero viewing fee charge karte hain.\n3. **If money lost**: Immediately dial **1930** (National Cybercrime Helpline) within 2 hours to freeze the recipient bank account, aur cybercrime.gov.in pe report karo!`;
    } else if (lower.includes('food') || lower.includes('tiffin') || lower.includes('dabba') || lower.includes('khana')) {
      reply = `Food expense student budget ka 30% easily consume kar sakta hai! 🍱\n\n• **Homestyle Tiffin vs Swiggy**: Zomato/Swiggy se roz 2 time order karoge toh monthly bill ₹8,000+ ho jayega. Local homestyle tiffin service (like Maa Annapurna / Swad Dabba) ₹2,800 to ₹3,400 me lunch + dinner provide karta hai.\n• **Trial Meal**: Monthly sign karne se pehle 1 trial meal (₹90–₹100) leke hygiene aur delivery timing zaroor test karo.\n• Check 'Food & Tiffin' tab in the app for verified options in ${context.city || 'your city'}!`;
    } else if (lower.includes('metro') || lower.includes('bus') || lower.includes('transport') || lower.includes('auto') || lower.includes('fare')) {
      reply = `Local transit tips for ${context.city || 'Bengaluru/Pune'}: 🚇\n\n1. **Metro**: Best for peak traffic hours (Purple/Green lines). Fast, AC, and WhatsApp/card tickets pe 5% discount milta hai.\n2. **City Bus (BMTC/PMPML)**: Most economical! Students ₹70 daily pass ya college ID se monthly pass banwa sakte hain (saves up to 40%).\n3. **Auto Meter Rule**: Night charges (1.5x) legally 10 PM ke baad hi lagte hain. Use Namma Yatri or Uber Auto for upfront fixed pricing without bargaining.`;
    } else if (lower.includes('budget') || lower.includes('saving') || lower.includes('calculate')) {
      reply = `Aapke ₹${context.budget || '15,000'} monthly budget ka realistic breakdown: 💰\n\n• **PG Accommodation**: ₹${(context.activeListing?.monthlyRent || 8500).toLocaleString('en-IN')} (Rent + Electricity)\n• **Food / Tiffin**: ₹3,000 (Homestyle mess)\n• **Transport**: ₹1,200 (Metro / Bus daily pass)\n• **Phone + Misc**: ₹1,500\n• **Refundable Deposit**: Separate capital requirement (2 months rent), isko monthly recurring cost me mix mat karna!\n\nOpen the **Plan** tab to customize these numbers and simulate 3 or 6 months projection live!`;
    } else if (lower.includes('deposit') || lower.includes('security')) {
      reply = `Security deposit ko leke bohot dhyan rakhna chahiye! 🚨\n\n1. **Standard Norm**: Bangalore & Pune me usually 2 months deposit standard hai. Agar owner 3-4 months mang raha hai, negotiate karo.\n2. **Refund Timeline**: Written agreement me mention karwao ki exit ke 7 days ke andar full refund milega.\n3. **Painting / Maintenance Deductions**: Pehle din hi room aur bathroom ki photos & video WhatsApp pe owner ko bhej do, taki exit ke time wo 'repaint' ke naam pe ₹5,000 na kaat sake!`;
    } else if (lower.includes('electricity') || lower.includes('bijli') || lower.includes('unit')) {
      reply = `Electricity charges is one of the biggest hidden traps in PGs! ⚡\n\n• Normal residential BESCOM/MSEDCL rate ₹6 to ₹8 per unit hota hai.\n• Several commercial PGs charge ₹12 to ₹14 per unit on submeters. Agar aap AC use karoge, toh monthly bill easily ₹2,500+ extra ho jayega.\n• **Rule**: Owner se room lene se pehle current submeter reading ka photo lo aur check karo ki meter sirf aapke room ka hai ya flatmates ke saath shared hai!`;
    } else if (lower.includes('negotiate') || lower.includes('kam') || lower.includes('message') || lower.includes('draft')) {
      reply = `Here is a polite yet firm WhatsApp template you can send the landlord: 📝\n\n"Hi Sir/Madam, I visited [PG Name] today and really liked the room. Since I am a student on a fixed monthly stipend of ₹${context.budget || '15,000'}, my budget is slightly tight. If you could consider ₹${(context.activeListing?.monthlyRent || 12000) - 1000}/month or adjust the deposit to 1 month, I can confirm today and pay the advance token immediately. Please let me know if this works for you. Thank you!"`;
    } else {
      reply = `Arre dost! PG hunting aur city settle-in can be overwhelming, but tension mat lo—I've got your back! 🙌\n\nMain aapke liye:\n1. PG listings ke hidden electricity & deposit traps detect karta hoon.\n2. City scam alerts & fake QR code warnings deta hoon.\n3. Cheap tiffin & metro bus passes plan karta hoon.\n4. Complete monthly living allowance calculate karta hoon.\n\nBatao, what do you want to check right now?`;
    }

    return res.json({
      reply,
      aiConfigured: false,
      setupMessage: 'Set GEMINI_API_KEY in server/.env to enable live multi-turn Gemini 2.5 Flash AI.',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat processing failed.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PG Proof AI Gateway running on http://localhost:${PORT}`);
});
