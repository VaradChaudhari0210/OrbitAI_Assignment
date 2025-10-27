import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET all essays for the logged-in user
export async function GET() {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const essays = await prisma.essay.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ essays }, { status: 200 })
  } catch (error) {
    console.error('Error fetching essays:', error)
    return NextResponse.json({ error: 'Failed to fetch essays' }, { status: 500 })
  }
}

// POST create a new essay
export async function POST(request) {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, content } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const essay = await prisma.essay.create({
      data: {
        title: title.trim(),
        content: content || '',
        userId: session.user.id,
      },
    })

    return NextResponse.json({ essay }, { status: 201 })
  } catch (error) {
    console.error('Error creating essay:', error)
    return NextResponse.json({ error: 'Failed to create essay' }, { status: 500 })
  }
}
