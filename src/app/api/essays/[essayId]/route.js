import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET a specific essay
export async function GET(request, { params }) {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { essayId } = await params

    const essay = await prisma.essay.findUnique({
      where: {
        id: essayId,
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            suggestions: true,
          },
        },
      },
    })

    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // Verify ownership
    if (essay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ essay }, { status: 200 })
  } catch (error) {
    console.error('Error fetching essay:', error)
    return NextResponse.json({ error: 'Failed to fetch essay' }, { status: 500 })
  }
}

// PUT update an essay
export async function PUT(request, { params }) {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { essayId } = await params
    const { title, content, targetUniversity } = await request.json()

    // Verify ownership
    const existingEssay = await prisma.essay.findUnique({
      where: { id: essayId },
    })

    if (!existingEssay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    if (existingEssay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const essay = await prisma.essay.update({
      where: { id: essayId },
      data: {
        ...(title && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(targetUniversity !== undefined && { targetUniversity: targetUniversity ? targetUniversity.trim() : null }),
      },
    })

    return NextResponse.json({ essay }, { status: 200 })
  } catch (error) {
    console.error('Error updating essay:', error)
    return NextResponse.json({ error: 'Failed to update essay' }, { status: 500 })
  }
}

// DELETE an essay
export async function DELETE(request, { params }) {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { essayId } = await params

    // Verify ownership
    const existingEssay = await prisma.essay.findUnique({
      where: { id: essayId },
    })

    if (!existingEssay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    if (existingEssay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.essay.delete({
      where: { id: essayId },
    })

    return NextResponse.json({ message: 'Essay deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting essay:', error)
    return NextResponse.json({ error: 'Failed to delete essay' }, { status: 500 })
  }
}
