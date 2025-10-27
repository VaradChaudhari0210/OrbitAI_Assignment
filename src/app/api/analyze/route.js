import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  // Check authentication
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { text, targetUniversity } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build university-specific context
    const universityContext = targetUniversity 
      ? `\n\nIMPORTANT: This essay is specifically for ${targetUniversity}. Tailor your feedback based on what ${targetUniversity} values in their applicants (research their mission, culture, and what they look for). Consider whether the essay demonstrates fit with ${targetUniversity}'s unique characteristics and values.`
      : '\n\nNote: No specific target university was provided. Give general college application essay feedback.'

    // Create detailed prompt for college application essay analysis
    const prompt = `You are an expert college admissions essay consultant trained on successful application essays. Your goal is to help students craft standout college application essays that admissions officers will remember.${universityContext}

Analyze this college application essay focusing on what admissions officers look for:

**CLARITY (0-100)**: How clear, readable, and well-structured is the writing? Is the narrative easy to follow? Are ideas expressed precisely without confusion or ambiguity?

**TONE (0-100)**: Does the essay sound authentic and reflect the student's genuine voice? Is it confident without being arrogant? Is the tone appropriate for a college application (not too casual, not too stiff)?

**IMPACT (0-100)**: How powerfully does the student communicate their story and ideas? Is it memorable and compelling? Does it showcase unique perspectives, personal growth, or meaningful experiences that make the student stand out?

Provide:
1. Three scores (0-100) for Clarity, Tone, and Impact
2. A brief feedback summary (2-3 sentences) focusing on the essay's effectiveness as a college application essay
3. 3-5 specific, actionable suggestions that will elevate the essay, each with:
   - originalText: An exact quote from the essay (10-30 words)
   - feedback: Specific advice on how to improve it for college admissions (not just grammar fixes, but substantive improvements)
   - category: "Clarity", "Tone", or "Impact"

Focus on helping the student refine their authentic voice while meeting high admissions standards. Look for:
- Showing vs. telling (use specific examples instead of generic statements)
- Unique personal insights and growth
- Authentic voice (not trying to sound impressive, but genuinely reflective)
- Strong narrative structure and flow
- Memorable opening and closing
- Avoiding clichés and generic statements

College Application Essay:
"""
${text}
"""

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "clarityScore": 85,
  "impactScore": 78,
  "toneScore": 92,
  "feedbackSummary": "Your summary here...",
  "suggestions": [
    {
      "originalText": "exact quote from essay",
      "feedback": "specific improvement advice",
      "category": "Clarity"
    }
  ]
}`

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiText = response.text()

    // Parse the JSON response
    let analysis
    try {
      // Remove markdown code blocks if present
      const cleanedText = aiText.replace(/```json\n?|\n?```/g, '').trim()
      analysis = JSON.parse(cleanedText)

      // Validate the response structure
      if (!analysis.clarityScore || !analysis.impactScore || !analysis.toneScore) {
        throw new Error('Invalid response structure')
      }

      // Ensure scores are numbers within range
      analysis.clarityScore = Math.min(100, Math.max(0, Number(analysis.clarityScore)))
      analysis.impactScore = Math.min(100, Math.max(0, Number(analysis.impactScore)))
      analysis.toneScore = Math.min(100, Math.max(0, Number(analysis.toneScore)))

      // Ensure suggestions array exists
      if (!Array.isArray(analysis.suggestions)) {
        analysis.suggestions = []
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', aiText)
      // Fallback to mock data if parsing fails
      analysis = {
        clarityScore: 75,
        impactScore: 70,
        toneScore: 80,
        feedbackSummary: "Unable to parse AI response. Please try again.",
        suggestions: []
      }
    }

    return NextResponse.json({ analysis }, { status: 200 })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze text: ' + error.message 
    }, { status: 500 })
  }
}
