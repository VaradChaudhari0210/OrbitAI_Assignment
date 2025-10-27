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
    const { text, targetUniversity, feedbackData } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build university-specific context
    const universityContext = targetUniversity 
      ? `\n\nThis essay is specifically for ${targetUniversity}. Rewrite it to better align with what ${targetUniversity} values in their applicants. Research ${targetUniversity}'s mission, culture, and what they look for in students. Ensure the rewritten essay demonstrates authentic fit with ${targetUniversity}'s unique characteristics.`
      : ''

    // Build feedback context if available
    const feedbackContext = feedbackData 
      ? `\n\nPrevious Analysis Feedback:
- Clarity Score: ${feedbackData.clarityScore}/100
- Impact Score: ${feedbackData.impactScore}/100
- Tone Score: ${feedbackData.toneScore}/100
- Summary: ${feedbackData.feedbackSummary}

Key Suggestions to Address:
${feedbackData.suggestions.map((s, i) => `${i + 1}. [${s.category}] "${s.originalText}" - ${s.feedback}`).join('\n')}`
      : ''

    // Create detailed prompt for essay rewriting
    const prompt = `You are an expert college admissions essay writer. Your task is to rewrite the following college application essay to make it more compelling, authentic, and effective.${universityContext}${feedbackContext}

IMPORTANT GUIDELINES:
1. **Preserve the student's authentic voice and core story** - Don't change what makes them unique
2. **Show, don't tell** - Replace generic statements with specific, vivid examples
3. **Strengthen the narrative** - Improve flow, structure, and storytelling
4. **Elevate impact** - Make the essay more memorable and compelling
5. **Maintain authenticity** - The essay should still sound like a real student, not overly polished
6. **Address the feedback** - Incorporate improvements based on the analysis suggestions
7. **Keep similar length** - Don't make it significantly longer or shorter
8. **Use active voice** - Replace passive constructions with active ones
9. **Remove clichés** - Replace generic phrases with original, specific language
10. **Strong opening and closing** - Make sure the essay hooks readers and ends memorably

Original Essay:
"""
${text}
"""

Respond with ONLY the rewritten essay text (no markdown, no explanations, no labels, just the essay itself):`

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const rewrittenText = response.text().trim()

    return NextResponse.json({ rewrittenText }, { status: 200 })
  } catch (error) {
    console.error('Rewrite error:', error)
    return NextResponse.json({ 
      error: 'Failed to rewrite essay: ' + error.message 
    }, { status: 500 })
  }
}
