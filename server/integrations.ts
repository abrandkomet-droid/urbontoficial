import { Router, Request, Response } from "express";
import crypto from "crypto";

// Lazy initialization for Stripe (dynamic import)
let stripeModule: typeof import('stripe') | null = null;
let stripeClient: InstanceType<typeof import('stripe').default> | null = null;
async function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY || process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;
    if (!key) {
      console.warn('STRIPE_SECRET_KEY is missing');
      return null;
    }
    if (!stripeModule) {
      stripeModule = await import('stripe');
    }
    stripeClient = new stripeModule.default(key);
  }
  return stripeClient;
}

// Lazy initialization for Groq (dynamic import)
let groqModule: typeof import('groq-sdk') | null = null;
let groqClient: InstanceType<typeof import('groq-sdk').default> | null = null;
async function getGroq() {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY || process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!key) {
      console.warn('GROQ_API_KEY is missing');
      return null;
    }
    if (!groqModule) {
      groqModule = await import('groq-sdk');
    }
    groqClient = new groqModule.default({ apiKey: key });
  }
  return groqClient;
}

export const integrationsRouter = Router();

// --- API Health Check ---
integrationsRouter.get("/health-check", async (req: Request, res: Response) => {
  const status = {
    googleMaps: !!(process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY),
    stripe: !!(process.env.STRIPE_SECRET_KEY || process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    groq: !!(process.env.GROQ_API_KEY || process.env.EXPO_PUBLIC_GROQ_API_KEY),
    cloudinary: !!process.env.CLOUDINARY_URL,
    translation: !!process.env.VITE_GOOGLE_TRANSLATION_API_KEY,
    speech: !!process.env.VITE_GOOGLE_SPEECH_API_KEY,
    aviation: !!process.env.VITE_AVIATION_STACK_API_KEY,
    freepik: !!process.env.VITE_FREEPIK_API_KEY
  };
  res.json(status);
});

// --- 0. Stripe & Groq (New) ---

integrationsRouter.post("/stripe/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const stripe = await getStripe();
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const { amount, currency = 'usd' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

integrationsRouter.post("/ai/refine-message", async (req: Request, res: Response) => {
  try {
    const groq = await getGroq();
    if (!groq) return res.status(500).json({ error: 'Groq not configured' });

    const { text, context = 'chauffeur' } = req.body;
    const systemPrompt = context === 'chauffeur' 
      ? "You are an elite professional chauffeur. Refine the following message to be more professional, polite, and concise. Keep the original meaning."
      : "You are a premium passenger. Refine the following message to be polite and clear.";

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      model: "mixtral-8x7b-32768",
    });

    res.json({ refinedText: completion.choices[0]?.message?.content || text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Smart Chat (Full Conversational AI) ---
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const URBONT_SYSTEM_PROMPT = `You are URBONT AI, a sophisticated AI assistant for URBONT, a premium luxury chauffeur service. 

Your role:
- Help passengers with ride bookings, modifications, and inquiries
- Provide information about services, amenities, and pricing
- Assist with account management and preferences
- Handle complaints with empathy and escalate when needed
- Provide ETA updates and trip information

Tone: Professional, warm, concise. Like a high-end concierge.
Always address the user respectfully. Keep responses brief but helpful.
If you cannot help with something, offer to connect them with a human agent.`;

integrationsRouter.post("/ai/chat", async (req: Request, res: Response) => {
  try {
    const groq = await getGroq();
    if (!groq) return res.status(500).json({ error: 'Groq not configured' });

    const { messages, context } = req.body as { messages: ChatMessage[], context?: string };
    
    // Build conversation with system prompt
    const conversationMessages: ChatMessage[] = [
      { role: 'system', content: context ? `${URBONT_SYSTEM_PROMPT}\n\nAdditional context: ${context}` : URBONT_SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await groq.chat.completions.create({
      messages: conversationMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't process your request. Please try again.";
    
    res.json({ 
      response,
      usage: completion.usage
    });
  } catch (error: any) {
    console.error('[GROQ_CHAT_ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Voice-to-Text Transcription ---
integrationsRouter.post("/ai/transcribe", async (req: Request, res: Response) => {
  try {
    const groq = await getGroq();
    if (!groq) return res.status(500).json({ error: 'Groq not configured' });

    const { audioBase64, language = 'en' } = req.body;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data required' });
    }

    // Convert base64 to buffer for Groq's Whisper model
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Create a File-like object for the API
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      language: language,
      response_format: "json",
    });

    res.json({ 
      text: transcription.text,
      language: language
    });
  } catch (error: any) {
    console.error('[GROQ_TRANSCRIBE_ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// --- 1. Google Maps Enterprise (Advanced Markers & Real-time Traffic) ---

// Mock function to simulate Google Maps Directions API with Traffic
async function getRouteWithTraffic(origin: string, destination: string) {
  // In a real implementation, this would call:
  // https://maps.googleapis.com/maps/api/directions/json?origin=...&destination=...&departure_time=now&traffic_model=best_guess&key=YOUR_API_KEY
  
  console.log(`[GOOGLE_MAPS] Calculating route from ${origin} to ${destination} with traffic_model='best_guess'`);
  
  // Simulated response
  return {
    routes: [{
      legs: [{
        duration: { text: "45 mins", value: 2700 },
        duration_in_traffic: { text: "55 mins", value: 3300 }, // Traffic delay
        distance: { text: "15 miles", value: 24140 }
      }]
    }]
  };
}

integrationsRouter.post("/maps/route", async (req: Request, res: Response) => {
  const { origin, destination } = req.body;
  try {
    const routeData = await getRouteWithTraffic(origin, destination);
    res.json(routeData);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate route" });
  }
});


// --- 2. FlightAware / Aviationstack Webhook ---

// This endpoint receives updates from FlightAware Firehose or Aviationstack
integrationsRouter.post("/webhooks/flight-status", (req: Request, res: Response) => {
  const event = req.body;
  
  // Example payload structure (simplified)
  // { flight_id: "UA123", status: "landed", arrival_time: "2024-05-20T14:30:00Z" }
  
  console.log(`[FLIGHT_WEBHOOK] Received update for flight ${event.flight_id}: ${event.status}`);

  if (event.status === 'landed' || event.status === 'delayed') {
    // Logic to update ride schedule would go here (calling logistics module)
    // db.rides.update({ flight_number: event.flight_id }, { ... })
    
    res.json({ status: "processed", action: "RIDE_SCHEDULE_UPDATED" });
  } else {
    res.json({ status: "ignored", reason: "Status not relevant" });
  }
});


// --- 3. Twilio Proxy (Masked Numbers) ---

// This endpoint handles incoming calls to the Twilio Proxy Number
integrationsRouter.post("/webhooks/twilio/voice", (req: Request, res: Response) => {
  const { From, To } = req.body; // 'From' is the caller (Driver/Passenger), 'To' is the Proxy Number
  
  console.log(`[TWILIO_PROXY] Call initiated from ${From} to Proxy ${To}`);

  // 1. Lookup active ride associated with this caller
  // const ride = db.rides.find(r => r.driver_phone === From || r.passenger_phone === From);
  
  // Mock lookup
  const isDriver = From === "+15550001111"; // Mock Driver Number
  const realDestination = isDriver ? "+15550002222" : "+15550001111"; // Swap
  
  // 2. Generate TwiML to connect the call
  const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">Connecting you to your Urbont party. Please hold.</Say>
      <Dial callerId="${To}">
        <Number>${realDestination}</Number>
      </Dial>
    </Response>
  `;
  
  res.type('text/xml');
  res.send(twiml.trim());
});


// --- 5. Freepik API Proxy ---
integrationsRouter.get("/freepik/icon", async (req: Request, res: Response) => {
  const apiKey = process.env.VITE_FREEPIK_API_KEY || 'FPSXd269abd3d8ed2d36624e2df72a1ba264';
  if (!apiKey) return res.status(401).json({ error: "Missing Freepik API Key" });
  
  const { term } = req.query;
  if (!term) return res.status(400).json({ error: "Missing search term" });

  try {
    const response = await fetch(`https://api.freepik.com/v1/icons?term=${term}&limit=1`, {
      headers: {
        'Accept-Language': 'en-US',
        'Accept': 'application/json',
        'x-freepik-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Freepik API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Get the highest resolution thumbnail or the SVG if available
      const icon = data.data[0];
      const imageUrl = icon.thumbnails[0]?.url || '';
      res.json({ url: imageUrl, name: icon.name });
    } else {
      res.status(404).json({ error: "Icon not found" });
    }
  } catch (error: any) {
    console.error('[FREEPIK_API_ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to receive report updates
integrationsRouter.post("/webhooks/checkr", (req: Request, res: Response) => {
  const event = req.body;
  
  // Example payload: { type: "report.completed", data: { object: { id: "r1", status: "clear", candidate_id: "c1" } } }
  
  console.log(`[CHECKR_WEBHOOK] Received event: ${event.type}`);

  if (event.type === 'report.completed') {
    const report = event.data.object;
    const status = report.status; // 'clear', 'consider', 'suspended'
    const candidateId = report.candidate_id;
    
    // Update Driver Status in DB
    // db.users.update({ checkr_candidate_id: candidateId }, { background_check_status: status, is_verified: status === 'clear' })
    
    if (status === 'clear') {
      console.log(`[CHECKR] Candidate ${candidateId} APPROVED. Driver activated.`);
    } else {
      console.log(`[CHECKR] Candidate ${candidateId} FLAGGED (${status}). Driver suspended.`);
    }
    
    res.json({ status: "processed", outcome: status });
  } else {
    res.json({ status: "ignored" });
  }
});

// Endpoint to initiate a background check (for admin/onboarding)
integrationsRouter.post("/checkr/initiate", (req: Request, res: Response) => {
  const { driverId, ssn, licenseNumber } = req.body;
  
  // Mock API call to Checkr
  const candidateId = `cand_${crypto.randomUUID().substring(0,8)}`;
  const reportId = `rep_${crypto.randomUUID().substring(0,8)}`;
  
  console.log(`[CHECKR] Initiated background check for Driver ${driverId}`);
  
  res.json({
    status: "initiated",
    candidate_id: candidateId,
    report_id: reportId,
    estimated_completion: "2-5 days"
  });
});
