import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { signOut } from "@/lib/auth"
import LottiePlayer from "@/components/LottiePlayer"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  // Fetch user's essays
  const essays = await prisma.essay.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Lottie Logo */}
            <div className="w-12 h-12">
              <LottiePlayer />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Essay Editor</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name || session.user.email}
            </span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Essays</h2>
          <NewEssayButton />
        </div>

        {/* Essays Grid */}
        {essays.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No essays yet</h3>
            <p className="text-gray-600">Click "New Essay" above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essays.map((essay) => (
              <Link
                key={essay.id}
                href={`/editor/${essay.id}`}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-cyan-500 hover:shadow-lg transition-all group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                  {essay.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {essay.content || 'No content yet...'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Updated {new Date(essay.updatedAt).toLocaleDateString()}</span>
                  <span className="text-cyan-600 group-hover:underline">Edit →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function NewEssayButton() {
  async function createEssay() {
    "use server"
    const session = await auth()
    
    if (!session?.user) {
      return
    }

    const essay = await prisma.essay.create({
      data: {
        title: 'Untitled Essay',
        content: '',
        userId: session.user.id,
      },
    })

    redirect(`/editor/${essay.id}`)
  }

  return (
    <form action={createEssay}>
      <button
        type="submit"
        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Essay
      </button>
    </form>
  )
}
