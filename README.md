# AI Essay EditorThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).



A full-stack AI-powered essay editing application built with Next.js, featuring real-time feedback on clarity, impact, and tone.## Getting Started



## FeaturesFirst, run the development server:



- 🔐 **Authentication**: Google OAuth via NextAuth.js```bash

- ✍️ **Essay Editor**: Clean, two-column layout with live editingnpm run dev

- 🤖 **AI Feedback**: Mock AI analysis providing scores and suggestions# or

- 💾 **Auto-Save**: Automatic saving of essays as you typeyarn dev

- 📊 **Dashboard**: View and manage all your essays# or

- 🎨 **Modern UI**: Clean design inspired by findmyorbit.com with Tailwind CSSpnpm dev

- ⚡ **Lottie Animation**: Beautiful logo animation on homepage# or

bun dev

## Tech Stack```



- **Framework**: Next.js 16 (App Router)Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Database**: PostgreSQL with Prisma ORM

- **Authentication**: NextAuth.js v5 (Auth.js)You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

- **Styling**: Tailwind CSS

- **Animation**: LottieThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



## Getting Started## Learn More



### PrerequisitesTo learn more about Next.js, take a look at the following resources:



- Node.js 18+ installed- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- PostgreSQL database (local or cloud)- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- Google OAuth credentials (optional for Google login)



### 1. Install Dependencies## Deploy on Vercel



```bashThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

npm install

```Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


### 2. Set Up Environment Variables

Update the `.env` file in the root directory with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/essay_editor"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# Google OAuth (Get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Set Up the Database

Generate Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

Optional - Open Prisma Studio to view your database:

```bash
npx prisma studio
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

## Project Structure

```
orbit-editor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.js       # AI analysis endpoint
│   │   │   ├── auth/[...nextauth]/route.js  # NextAuth handlers
│   │   │   └── essays/                # Essay CRUD endpoints
│   │   ├── dashboard/page.js          # Dashboard page
│   │   ├── editor/[essayId]/page.js   # Editor page
│   │   ├── layout.js                  # Root layout
│   │   └── page.js                    # Home/Login page
│   └── middleware.js                  # Auth middleware
├── lib/
│   ├── auth.js                        # NextAuth configuration
│   └── prisma.js                      # Prisma client
├── prisma/
│   └── schema.prisma                  # Database schema
└── .env                               # Environment variables
```

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Essays
- `GET /api/essays` - Get all user essays
- `POST /api/essays` - Create new essay
- `GET /api/essays/[id]` - Get specific essay
- `PUT /api/essays/[id]` - Update essay
- `DELETE /api/essays/[id]` - Delete essay

### Analysis
- `POST /api/analyze` - Analyze essay text (currently returns mock data)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production URL
5. Update OAuth redirect URIs to production URLs
6. Deploy!

## License

MIT
