# Project Objectives

The primary objective of **statmux** is to build a robust, production-grade developer analytics aggregator that multiplexes public developer data into a unified, actionable dashboard.

### Specific Objectives:
1. **Multi-Platform Data Ingestion**: Interface directly with GitHub REST/HTML endpoints, Codeforces REST API, and LeetCode GraphQL API to extract authentic user activity metrics.
2. **Secure Authentication & Isolation**: Implement industry-standard authentication (Supabase Auth / GoTrue) with strict server-side JWT verification (`requireAuth.js`) and database Row-Level Security (RLS).
3. **Automated Longitudinal Tracking**: Support both on-demand user-triggered synchronization and automated zero-touch background synchronization via external schedulers (GitHub Actions cron).
4. **Synthesized Developer Intelligence**: Compute holistic metrics including an aggregate Code Health Score (0–100, Grade A–D), difficulty distributions, and cross-platform growth indexing.
5. **Unified Chronological Timeline**: Merge heterogeneous platform events (GitHub commits, PRs, and Codeforces contest submissions) into a single chronological activity stream.
6. **High Fault Tolerance & Reliability**: Isolate upstream third-party failures so that rate limits or outages on one platform do not disrupt syncing for remaining platforms or users.
7. **Public Developer Portability**: Provide clean, unauthenticated shareable profiles (`/u/[username]`) and head-to-head comparison tooling (`/compare/[u1]/vs/[u2]`) that securely omit private user metadata.
8. **Automated Weekly Email Digests**: Distribute automated week-over-week performance deltas and Code Health changes via authenticated mxroute SMTP with zero-spam skipping and one-click cryptographic unsubscription.
