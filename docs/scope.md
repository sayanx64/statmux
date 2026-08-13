# Project Scope

### In-Scope:
- **Authentication & Profile Management**:
  - Secure registration and sign-in via Email/Password and GitHub OAuth.
  - Profile handle configuration for GitHub, Codeforces, and LeetCode.
  - Avatar image upload with client-side canvas resizing ($500\times500$ px) and Supabase Storage persistence.
  - User notification and sync preference management with opt-in digest subscriptions.
- **Data Ingestion & Analytics**:
  - Ingestion of GitHub public repos, gists, followers, contribution weeks, and public push/PR events.
  - Ingestion of Codeforces current rating, max rating, rank, and accepted contest submissions.
  - Ingestion of LeetCode total solved count and difficulty breakdown (Easy, Medium, Hard).
  - Code Health Score calculation engine combining consistency, problem difficulty, repository quality, and contest performance.
- **Visualization & User Interface**:
  - Executive Overview with KPI cards, Code Health score card, and multi-source sparklines.
  - Statistics page with per-platform metric grids and normalized growth comparison charts.
  - Refresh management page with per-source status badges, last-sync timestamps, and execution logs.
  - Standalone Terms of Service and legal policy pages.
  - **Public Shareable Developer Cards (`/u/[username]`)**: Unauthenticated lightweight profile showing Code Health, platform handles, and latest metrics.
  - **Head-to-Head Developer Comparison (`/compare/[u1]/vs/[u2]`)**: Unauthenticated comparative workbench showing overall score differentials, metric-by-metric winner badges, and dual-ratio distribution bars.
- **Backend Architecture & Automation**:
  - Express REST API with strict JWT authentication middleware for private routes.
  - Public unauthenticated endpoints (`/api/public/:username`, `/api/public/compare/:u1/:u2`) stripping sensitive fields (`user_id`, `email`).
  - Scheduled daily cron execution via GitHub Actions (`daily-refresh.yml`) hitting secret-protected internal endpoints (`/api/internal/refresh-all`).
  - **Weekly Digest Email System**: Automated Monday digest generation calculating week-over-week deltas, rendering responsive dark-themed HTML emails, sending via mxroute SMTP (`statmux@sayan.cyou`), and supporting cryptographically signed one-click unsubscription (`/api/digest/unsubscribe`).

### Out-of-Scope:
- **Private Repository Modification**: statmux only ingests public data and does not request GitHub write permissions to repositories or codebases.
- **Real-Time Code Execution**: statmux is an analytics and telemetry engine, not an online judge or code execution sandbox.
- **Paid Platform Subscriptions**: Ingestion is restricted to public APIs and free access endpoints without bypassing third-party paywalls.
