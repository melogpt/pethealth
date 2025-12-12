import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatMessage from '../models/ChatMessage.js';
import DoctorMessage from '../models/DoctorMessage.js';
import Pet from '../models/Pet.js';
import PetOwner from '../models/PetOwner.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI initialized successfully');
  } else {
    console.warn('GEMINI_API_KEY not found in environment variables. Using fallback responses.');
  }
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
}

// AI Vet System Prompt
const AI_VET_PROMPT = `You are a professional and compassionate veterinary assistant AI. Your role is to help pet owners with their pet health concerns.

Guidelines:
- Be empathetic, professional, and caring
- Provide accurate veterinary advice based on common knowledge
- Always recommend consulting a real veterinarian for serious concerns
- Ask follow-up questions to better understand the pet's condition
- Use simple, clear language that pet owners can understand
- Be supportive and reassuring
- If you're unsure about something, admit it and suggest seeing a vet
- Respond in a conversational, friendly manner
- Keep responses concise but informative
- Respond in the same language as the user (Turkish or English)
- For urgent situations (poisoning, severe symptoms), emphasize immediate veterinary care

Remember: You are here to help, but you cannot replace professional veterinary care for serious issues.`;

// Get chat history for a pet owner
router.get('/history/:microchipNumber', async (req, res) => {
  try {
    const { microchipNumber } = req.params;

    const messages = await ChatMessage.find({ microchip_number: microchipNumber })
      .sort({ createdAt: 1 })
      .lean();

    // Format response to match frontend expectations
    const formattedMessages = messages.map(msg => ({
      ...msg,
      id: msg._id,
      created_at: msg.createdAt
    }));

    res.json({ success: true, messages: formattedMessages || [] });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Send message to AI Vet
router.post('/message', async (req, res) => {
  try {
    const { microchipNumber, message, petInfo } = req.body;

    if (!microchipNumber || !message) {
      return res.status(400).json({ success: false, message: 'Microchip number and message are required' });
    }

    // Get chat history for context
    let chatHistory = [];
    try {
      const history = await ChatMessage.find({ microchip_number: microchipNumber })
        .sort({ createdAt: 1 })
        .limit(20)
        .lean();
      chatHistory = history || [];
    } catch (err) {
      console.warn('Could not fetch chat history:', err);
      chatHistory = [];
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      microchip_number: microchipNumber,
      sender: 'user',
      message: message
    });

    // Generate AI response using Gemini
    let aiResponse;
    try {
      aiResponse = await generateAIResponse(message, petInfo, chatHistory);
    } catch (aiError) {
      console.error('Error generating AI response:', aiError.message || aiError);
      // Always use fallback if AI fails - never let it crash
      aiResponse = generateFallbackResponse(message);
    }

    // Save AI response
    const aiMessage = await ChatMessage.create({
      microchip_number: microchipNumber,
      sender: 'ai',
      message: aiResponse
    });

    res.json({
      success: true,
      userMessage: {
        id: userMessage._id,
        message: userMessage.message,
        sender: userMessage.sender,
        created_at: userMessage.createdAt.toISOString()
      },
      aiMessage: {
        id: aiMessage._id,
        message: aiMessage.message,
        sender: aiMessage.sender,
        created_at: aiMessage.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Send chat summary to doctor
router.post('/send-to-doctor', async (req, res) => {
  try {
    const { microchipNumber, summary, petInfo } = req.body;

    if (!microchipNumber || !summary) {
      return res.status(400).json({ success: false, message: 'Microchip number and summary are required' });
    }

    // Get pet and owner info
    const pet = await Pet.findOne({ microchip_number: microchipNumber })
      .populate('owner_id', 'name contact_number')
      .lean();

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Save message to doctor
    const doctorMessage = await DoctorMessage.create({
      microchip_number: microchipNumber,
      owner_name: pet.owner_id?.name || '',
      owner_contact: pet.owner_id?.contact_number || '',
      pet_name: pet.name || '',
      pet_type: pet.type || '',
      summary: summary,
      pet_info: petInfo || {},
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Message sent to doctor successfully',
      messageId: doctorMessage._id
    });
  } catch (error) {
    console.error('Error sending message to doctor:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get pending messages for doctor
router.get('/doctor/pending', async (req, res) => {
  try {
    const messages = await DoctorMessage.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    // Format response to match frontend expectations
    const formattedMessages = messages.map(msg => ({
      ...msg,
      id: msg._id,
      created_at: msg.createdAt
    }));

    res.json({ success: true, messages: formattedMessages || [] });
  } catch (error) {
    console.error('Error fetching doctor messages:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Mark message as read
router.put('/doctor/message/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await DoctorMessage.findByIdAndUpdate(
      id,
      { status: 'read', read_at: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Generate AI response using Gemini API
async function generateAIResponse(userMessage, petInfo, chatHistory = []) {
  // Fallback to simple responses if Gemini API is not configured
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback responses');
    return generateFallbackResponse(userMessage);
  }

  // Build context from pet info
  let petContext = '';
  if (petInfo) {
    petContext = `\n\nPet Information:
- Name: ${petInfo.name || 'Not provided'}
- Type: ${petInfo.type || 'Not provided'}
- Race: ${petInfo.race || 'Not provided'}
- Microchip: ${petInfo.microchip || 'Not provided'}`;
  }

  // Build conversation history
  let historyContext = '';
  if (chatHistory && chatHistory.length > 0) {
    historyContext = '\n\nPrevious conversation:\n';
    chatHistory.forEach(msg => {
      const role = msg.sender === 'user' ? 'Owner' : 'AI Vet';
      historyContext += `${role}: ${msg.message}\n`;
    });
  }

  // Detect language and construct prompt accordingly
  const isTurkish = /[çğıöşüÇĞIİÖŞÜ]/.test(userMessage) ||
    userMessage.toLowerCase().includes('kusma') ||
    userMessage.toLowerCase().includes('hasta') ||
    userMessage.toLowerCase().includes('aşı');

  const languageInstruction = isTurkish
    ? 'Lütfen Türkçe olarak yanıt verin. Kullanıcı Türkçe konuşuyor.'
    : 'Please respond in English. The user is speaking in English.';

  // Construct the full prompt (outside try-catch so it can be reused)
  const fullPrompt = `${AI_VET_PROMPT}${petContext}${historyContext}\n\n${languageInstruction}\n\nCurrent message from pet owner: ${userMessage}\n\nPlease provide a helpful, empathetic response as the AI veterinary assistant:`;

  // Try models in order of preference
  const modelsToTry = [
    'gemini-2.0-flash',      // Latest fast model (Dec 2025)
    'gemini-2.5-pro',        // Latest most capable model (Dec 2025)
    'gemini-2.0-flash-exp',  // Experimental version
    'gemini-1.5-flash',      // Fallback to 1.5
    'gemini-1.5-pro'         // Last resort
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      console.log(`✓ Successfully used model: ${modelName}`);
      return text.trim();
    } catch (error) {
      console.error(`✗ Model ${modelName} failed:`, error.message);
      // Continue to next model
      continue;
    }
  }

  // If all models failed, use fallback
  console.log('All Gemini models failed, using fallback response');
  return generateFallbackResponse(userMessage);
}

// Fallback response generator (used when Gemini API is unavailable)
function generateFallbackResponse(userMessage) {
  const message = userMessage.toLowerCase();

  // Turkish greetings
  if (message.includes('merhaba') || message.includes('selam') || message.includes('hello') || message.includes('hi')) {
    return `Merhaba! Ben AI veteriner asistanınızım. Evcil hayvanınızın sağlığı hakkında sorularınızda size yardımcı olmak için buradayım. Size nasıl yardımcı olabilirim?`;
  }

  // Vomiting / Kusma
  if (message.includes('kusma') || message.includes('vomit') || message.includes('kustu') || message.includes('kusuyor')) {
    if (message.includes('bozuk') || message.includes('spoiled') || message.includes('çürük') || message.includes('toksik')) {
      return `Bozuk et yemesi ciddi bir durum olabilir. Hemen şunları yapmalısınız:

1. **Acil Durum**: Eğer köpeğiniz sürekli kusuyorsa, halsizse veya nefes almakta zorlanıyorsa DERHAL bir veteriner kliniğine götürün.

2. **İlk Yardım**: 
   - Köpeğinize su vermeyin (en az 2-3 saat)
   - Yiyecek vermeyin
   - Köpeğinizi sakin tutun ve gözlemleyin

3. **Gözlem**: Kusma sıklığını, rengini ve köpeğin genel durumunu not edin.

4. **Veteriner Ziyareti**: Mümkün olan en kısa sürede bir veterinere danışın. Bozuk gıda zehirlenmeye neden olabilir.

Lütfen köpeğinizin durumunu yakından takip edin ve ciddi belirtiler görürseniz acil servise götürün.`;
    }
    return `Kusma sorunu yaşayan evcil hayvanınız için endişelendiğinizi anlıyorum. Kusma birçok nedenden kaynaklanabilir:

**Olası Nedenler:**
- Bozuk gıda tüketimi
- Beslenme değişikliği
- Mide rahatsızlığı
- Enfeksiyon
- Zehirlenme

**Ne Yapmalısınız:**
1. Köpeğinizi 2-3 saat yiyecek ve içecekten uzak tutun
2. Kusma sıklığını ve rengini gözlemleyin
3. Köpeğinizin genel durumunu kontrol edin (halsizlik, ateş, vb.)
4. Eğer kusma devam ederse veya köpeğiniz kötüleşirse DERHAL bir veterinere başvurun

Daha fazla bilgi verebilir misiniz? Köpeğiniz ne yedi, ne zaman kustu ve başka belirtiler var mı?`;
  }

  // Vaccination / Aşı
  if (message.includes('aşı') || message.includes('vaccin') || message.includes('vaccination')) {
    return `Aşılar evcil hayvanınızın sağlığı için çok önemlidir. Düzenli aşılar, yaygın hastalıklara karşı koruma sağlar. Köpeğinizin yaşına, cinsine ve sağlık durumuna göre bir aşı programı oluşturmanızı öneririm. Veterinerinizle köpeğinizin aşı takvimini kontrol etmenizi tavsiye ederim. Belirli aşılar hakkında daha fazla bilgi ister misiniz?`;
  }

  // Sick / Hasta
  if (message.includes('hasta') || message.includes('sick') || message.includes('ill') || message.includes('rahatsız')) {
    return `Evcil hayvanınızın hasta olduğunu duyduğuma üzüldüm. Bana belirtileri daha detaylı anlatabilir misiniz? 

**Ciddi Durumlar** (derhal veteriner gerektirir):
- Nefes almada zorluk
- Şiddetli kusma veya ishal
- Bilinç kaybı
- Nöbet geçirme
- Aşırı halsizlik

Belirtileri paylaşırsanız size daha iyi yardımcı olabilirim. Acil durumlarda lütfen derhal bir veteriner kliniğine veya acil servise başvurun.`;
  }

  // Food / Yemek
  if (message.includes('yemek') || message.includes('food') || message.includes('beslenme') || message.includes('diet') || message.includes('mama')) {
    return `Doğru beslenme, evcil hayvanınızın sağlığı için çok önemlidir. Doğru diyet, evcil hayvanınızın yaşına, cinsine ve sağlık durumuna bağlıdır. Genel beslenme yönergeleri hakkında konuşabiliriz, ancak özel öneriler için veterinerinize danışmanızı öneririm. Köpeğinizin yaşı, cinsi ve özel ihtiyaçları hakkında bilgi verebilir misiniz?`;
  }

  // Behavior / Davranış
  if (message.includes('davranış') || message.includes('behavior') || message.includes('aggressive') || message.includes('saldırgan')) {
    return `Davranış sorunları çeşitli nedenlerden kaynaklanabilir. Davranış değişiklikleri sağlık sorunları, stres veya çevresel faktörleri gösterebilir. Endişelendiğiniz belirli davranışı tarif edebilir misiniz? Ciddi davranış sorunları için bir veteriner veya hayvan davranış uzmanı ile konsültasyon yararlı olacaktır.`;
  }

  // Pain / Ağrı
  if (message.includes('ağrı') || message.includes('acı') || message.includes('pain') || message.includes('hurt')) {
    return `Evcil hayvanınızın ağrı çektiğini düşünüyorsanız, bu ciddi bir durumdur. Ağrı belirtileri şunları içerebilir:
- Halsizlik veya aktivite azalması
- İştah kaybı
- Huzursuzluk
- Belirli bölgeleri yalama veya ısırma
- Agresif davranış

Lütfen derhal bir veterinere başvurun. Ağrı kesici ilaçları asla kendi başınıza vermeyin - bazıları evcil hayvanlar için zehirli olabilir.`;
  }

  // Diarrhea / İshal
  if (message.includes('ishal') || message.includes('diarrhea') || message.includes('sulu dışkı')) {
    return `İshal sorunu yaşayan evcil hayvanınız için endişelendiğinizi anlıyorum. İshal birkaç nedenden kaynaklanabilir:

**Olası Nedenler:**
- Beslenme değişikliği
- Bozuk gıda
- Parazitler
- Enfeksiyon
- Stres

**Ne Yapmalısınız:**
1. Hafif, sindirimi kolay yiyecekler verin (haşlanmış tavuk, pilav)
2. Bol su verin (dehidrasyonu önlemek için)
3. İshal 24 saatten fazla sürerse veterineri arayın
4. Kan varsa veya köpeğiniz çok halsizse DERHAL veterineri arayın

Köpeğinizin durumu nasıl? Başka belirtiler var mı?`;
  }

  // Default - More helpful response
  return `Anladım, ${userMessage} hakkında soru soruyorsunuz. Size daha iyi yardımcı olabilmem için lütfen şu bilgileri paylaşın:

1. **Sorunun detayları**: Ne oldu, ne zaman başladı?
2. **Belirtiler**: Köpeğinizde hangi belirtileri görüyorsunuz?
3. **Davranış değişiklikleri**: Köpeğinizin davranışında değişiklik var mı?
4. **Yakın zamanda olanlar**: Son zamanlarda beslenme, çevre veya rutinde değişiklik oldu mu?

Bu bilgileri paylaşırsanız size daha spesifik önerilerde bulunabilirim. Acil durumlar için lütfen derhal bir veterinere başvurun.`;
}

export default router;
