# TrustLens Architecture

```mermaid
flowchart TD
  U[User] --> R[React + Vite]
  R -->|JWT REST requests| E[Express API]
  E --> A[Auth Middleware]
  E --> C[Controllers]
  C --> S[Application Services]
  S --> M[(MongoDB)]
  S --> AI[AI Provider Adapter]
  S --> SE[Search Provider Adapter]
  AI --> OA[OpenAI API]
  SE --> TA[Tavily Search API]
  S --> M
```

## Analysis sequence
```mermaid
sequenceDiagram
  participant User
  participant Web as React
  participant API as Express
  participant DB as MongoDB
  participant AI as AI Provider
  participant Search as Search Provider
  User->>Web: Submit claim/article/URL
  Web->>API: POST /analyses
  API->>API: Validate + extract URL content
  API->>DB: Create PROCESSING analysis
  API->>AI: Extract claims
  AI-->>API: Verifiable claims
  loop Each claim
    API->>Search: Retrieve evidence
    Search-->>API: Search results
    API->>AI: Assess claim against evidence
    AI-->>API: Assessment + explanation
  end
  API->>DB: Persist claims, evidence, report
  API-->>Web: Completed report
  Web-->>User: Render credibility report
```

## Data model
- User 1 → many Analysis
- Analysis 1 → many embedded Claims
- Claim 1 → many embedded Evidence records
- TrustedSource is a separate registry used to annotate matching source domains.

Evidence is embedded in each claim because the primary read pattern is retrieving a report with all its claim evidence. Trusted source definitions remain separate and are matched by normalized domain.
