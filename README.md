# 💬 Real-Time Live Chat Application

A production-ready, full-stack real-time chat application built with modern web technologies. Features include one-on-one messaging, group chats, typing indicators, message reactions, and real-time presence status.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Convex](https://img.shields.io/badge/Convex-Backend-green)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

## ✨ Features

### Core Functionality
- 🔐 **Authentication** - Secure signup/login with Clerk
- 👥 **User Management** - Real-time user list with online/offline status
- 🔍 **User Search** - Real-time search with debouncing
- 💬 **One-on-One Messaging** - Private conversations with instant delivery
- 📱 **Group Chats** - Create groups with multiple members
- ⏰ **Smart Timestamps** - Context-aware date formatting
- 📍 **Typing Indicators** - See when others are typing
- 🔔 **Unread Counts** - Badge notifications for unread messages
- 📜 **Auto-Scroll** - Smart scroll behavior with "New messages" button
- 🗑️ **Message Deletion** - Soft delete your own messages
- 😀 **Message Reactions** - React with emojis (👍 ❤️ 😂 😮 😢)
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

### Technical Highlights
- ⚡ **Real-Time Updates** - Powered by Convex subscriptions (no polling)
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui
- 🔒 **Type Safety** - Strict TypeScript throughout
- ⚙️ **Optimized Queries** - Batch fetching to prevent N+1 problems
- 🧹 **Clean Architecture** - Modular components and separated concerns

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Convex (database, real-time subscriptions, serverless functions)
- **Authentication:** Clerk
- **Styling:** Tailwind CSS, shadcn/ui components
- **Deployment:** Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Clerk account
- Convex account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tars
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Clerk**
   - Create an account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your API keys

4. **Set up Convex**
   ```bash
   npm install -g convex
   npx convex login
   npx convex dev
   ```
   This will create your Convex project and generate the deployment URL.

5. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   CONVEX_DEPLOY_KEY=your_deploy_key
   ```

6. **Run the development server**
   ```bash
   # Terminal 1: Convex
   npx convex dev
   
   # Terminal 2: Next.js
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tars/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── chat/              # Chat pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Sidebar.tsx       # Conversation sidebar
│   ├── MessageList.tsx   # Message display
│   └── ...
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User functions
│   ├── conversations.ts  # Conversation functions
│   ├── messages.ts       # Message functions
│   └── ...
└── lib/                  # Utilities
    ├── formatDate.ts     # Date formatting
    └── useDebounce.ts    # Debounce hook
```

## 🗄️ Database Schema

The application uses Convex with the following main tables:

- **users** - User profiles synced from Clerk
- **conversations** - Chat conversations (one-on-one and groups)
- **messages** - Chat messages with soft delete support
- **messageReactions** - Emoji reactions on messages
- **typingStatus** - Real-time typing indicators
- **readReceipts** - Unread message tracking

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Convex to Production

```bash
npx convex deploy --prod
```

Make sure to update your `NEXT_PUBLIC_CONVEX_URL` in Vercel to point to the production deployment.

## 🎯 Key Features Explained

### Real-Time Messaging
Messages are delivered instantly using Convex's real-time subscriptions. No polling or manual refresh needed.

### Typing Indicators
When a user types, other participants see a "User is typing..." indicator that automatically disappears after 2 seconds of inactivity.

### Unread Message Counts
Each conversation shows a badge with the number of unread messages. Counts update in real-time and clear when you open a conversation.

### Smart Auto-Scroll
The message list automatically scrolls to the bottom when new messages arrive. If you've scrolled up, a "New messages" button appears instead.

### Message Reactions
Click the emoji button on any message to add reactions. Toggle reactions on/off, and see counts in real-time.

## 🔧 Development

### Code Quality
- ✅ Strict TypeScript (no `any` types)
- ✅ ESLint configured
- ✅ Clean component architecture
- ✅ Optimized database queries
- ✅ Proper error handling

### Performance Optimizations
- Batch user fetching to prevent N+1 queries
- Debounced search inputs
- Efficient database indexes
- Scheduled cleanup of expired data

## 📝 License

MIT

## 👨‍💻 Author

Built for the Tars Fullstack Internship Challenge

---

**Note:** Make sure to set up your environment variables before running the application. The app requires both Clerk and Convex to be properly configured.
