# IntentMap

**IntentMap** is an intelligent lead generation tool that monitors social media (starting with Reddit) to identify high-intent prospects. It uses AI to analyze posts for "pain points" and "willingness to pay" signals, helping founders and sales teams find people who actively need their solution.

## 🚀 Features

*   **Real-time Monitoring**: Automatically scrapes targeted subreddits (e.g., r/SaaS, r/IndieHackers) every 15 minutes.
*   **Smart Filtering**: Uses keyword matching to pre-filter posts about validation, struggles, and alternatives.
*   **AI-Powered Analysis**:
    *   **Pain Score (0-10)**: How acute is the user's problem?
    *   **WTP Signal**: Does the user indicate willingness to pay?
    *   **Intent Classification**: Filters out low-quality noise.
    *   *Powered by Google Gemini and Mistral AI.*
*   **Lead Dashboard**: A modern Next.js web interface to view, sort, and manage discovered leads.
*   **Deduplication**: Ensures you don't see the same post twice.

## 🛠 Tech Stack

### Backend (Engine)
*   **Runtime**: Node.js & TypeScript
*   **Reddit API**: Snoowrap
*   **AI Models**: Google Generative AI (Gemini) & Mistral AI
*   **Queue/Rate Limiting**: Bottleneck
*   **Validation**: Zod
*   **Logging**: Winston

### Frontend (Web Dashboard)
*   **Framework**: Next.js 15 (App Router)
*   **UI Library**: React 19
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React

### Database
*   **Storage**: PostgreSQL (via Supabase)
*   **ORM/Client**: Supabase JS Client

## 📋 Prerequisites

*   **Node.js** (v18 or higher)
*   **pnpm** (recommended) or npm
*   **Supabase Account**: For the database.
*   **Reddit App Credentials**: Script type app (Client ID, Secret, Refresh Token).
*   **AI API Keys**: Google Gemini API Key and/or Mistral API Key.

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abdulmuiz44/IntentMap.git
    cd IntentMap
    ```

2.  **Install dependencies:**
    ```bash
    # Install backend dependencies
    pnpm install

    # Install frontend dependencies
    cd web
    pnpm install
    cd ..
    ```

3.  **Environment Configuration:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` and fill in your credentials:
    ```env
    REDDIT_CLIENT_ID=...
    REDDIT_CLIENT_SECRET=...
    REDDIT_REFRESH_TOKEN=...
    GEMINI_API_KEY=...
    MISTRAL_API_KEY=...
    SUPABASE_URL=...
    SUPABASE_KEY=...
    ```
    *Note: The `web` folder also needs access to Supabase keys. Create `web/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.*

4.  **Database Setup:**
    Run the SQL schema in your Supabase SQL Editor to create the `leads` table:
    *   Copy content from `schema.sql`.
    *   Paste and run it in Supabase.

## 🏃 Usage

### 1. Start the Scraper (Backend)
This runs the background worker that fetches and analyzes posts.

```bash
# In the root directory
npm run dev
```

### 2. Start the Dashboard (Frontend)
This launches the web UI to view leads.

```bash
# In the web directory
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your leads.

## 🗄 Database Schema

The `leads` table stores the following:

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Lead ID |
| `reddit_post_id` | TEXT | Original Reddit ID (deduplication) |
| `platform` | TEXT | Source platform (e.g., 'reddit') |
| `post_url` | TEXT | Link to the original post |
| `title` | TEXT | Post title |
| `selftext` | TEXT | Post body content |
| `pain_score` | INTEGER | AI-assessed pain level (1-10) |
| `wtp_signal` | BOOLEAN | Willingness to pay detected? |
| `ai_analysis` | JSONB | Full raw analysis data |

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.