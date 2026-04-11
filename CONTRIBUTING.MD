
# Contributing to InvoiceFlow 🤝

First of all — **thank you** for considering contributing to InvoiceFlow! 🎉

Every contribution — whether it's a bug fix, new feature, or documentation improvement — is welcome.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 🤝 Code of Conduct

- Treat everyone with respect
- Provide constructive feedback
- Hateful, discriminatory, or inappropriate behavior will not be tolerated
- Maintain a professional tone in issues and PRs

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- npm v10+
- Git
- Neon account — [neon.tech](https://neon.tech) (free)

### Local Setup

```bash
# 1. Fork the repo (click the "Fork" button on GitHub)

# 2. Clone your fork
git clone https://github.com/ASHUTOSH-KUMAR-RAO/Invoiceflow.git
cd invoiceflow

# 3. Add the upstream remote
git remote add upstream https://github.com/ASHUTOSH-KUMAR-RAO/Invoiceflow.git

# 4. Install dependencies
npm install

# 5. Set up environment variables
cp .env.example .env.local
# Fill in your values in .env.local

# 6. Set up the database
npx prisma generate
npx prisma db push

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✅

---

## 🌿 Branch Strategy

We follow **Git Flow**:

| Branch | Purpose | Example |
|--------|---------|---------|
| `main` | Production — stable code only | — |
| `develop` | Active development — all changes merge here | — |
| `feature/xyz` | New feature | `feature/upi-qr-code` |
| `fix/xyz` | Bug fix | `fix/gst-calculation` |
| `hotfix/xyz` | Urgent production fix | `hotfix/login-crash` |
| `chore/xyz` | Maintenance, dependencies | `chore/update-prisma` |
| `docs/xyz` | Documentation only | `docs/update-readme` |

### Creating a branch:

```bash
# First, sync with the latest develop
git checkout develop
git pull upstream develop

# Create your branch
git checkout -b feature/your-feature-name
```

### Rules:
- **Never push directly to `main`**
- Always create feature branches from `develop`
- One branch = one feature/fix only

---

## 📝 Commit Convention

We follow the **Conventional Commits** specification.

### Format:
```
type(scope): short description

[optional body — what was done and why]

[optional footer — breaking changes, issue refs]
```

### Commit Types:

| Type | When to use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(invoice): add UPI QR generation` |
| `fix` | Bug fix | `fix(auth): resolve Google OAuth error` |
| `docs` | Docs only | `docs(readme): add installation steps` |
| `style` | Formatting, no logic change | `style(invoice): fix button alignment` |
| `refactor` | Code restructure | `refactor(lib): simplify GST calculator` |
| `test` | Add/update tests | `test(invoice): add CRUD unit tests` |
| `chore` | Build, dependencies | `chore(deps): upgrade prisma to v6` |
| `perf` | Performance improvement | `perf(dashboard): optimize chart render` |

### Scopes:

`invoice`, `client`, `auth`, `dashboard`, `pdf`, `email`, `payment`, `ui`, `lib`, `api`, `db`

### Examples:

```bash
git commit -m "feat(invoice): add WhatsApp share button"
git commit -m "fix(gst): correct IGST calculation for interstate"
git commit -m "chore(deps): update next to 16.2.0"
git commit -m "docs(contributing): add branch strategy section"

# Breaking change:
git commit -m "feat(api)!: change invoice response format

BREAKING CHANGE: invoice API now returns amount in paise"
```

### Rules:
- Keep the short description under 50 characters
- Use imperative mood ("add" not "added")
- Write in lowercase
- Do not end with a period

---

## 🔄 Pull Request Process

### Before submitting a PR:

```bash
# 1. Sync with the latest develop
git fetch upstream
git rebase upstream/develop

# 2. Check the build
npm run build

# 3. Run lint check
npm run lint

# 4. Run type check
npx tsc --noEmit
```

### PR Checklist:

- [ ] Branch was created from `develop` (not `main`)
- [ ] Commit messages follow the convention
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Docs updated for any new features
- [ ] `.env.example` updated if a new env variable was added

### PR Title Format:
```
feat(scope): description
fix(scope): description
```

### PR Description Template:

```markdown
## What does this PR do?
[Short description]

## Why?
[Problem or motivation]

## Changes made
- Change 1
- Change 2

## Screenshots (if UI change)
[Add screenshots]

## Related Issues
Closes #[issue number]
```

### Review Process:
1. Submit the PR targeting the `develop` branch
2. Automated checks will run (lint, build)
3. A code review will be conducted
4. You may receive change requests — please address them
5. Once approved, the PR will be merged

---

## 💻 Coding Standards

### TypeScript

```typescript
// ✅ Good — proper types
interface Invoice {
  id: string
  amount: number
  clientId: string
}

// ❌ Bad — using any
const invoice: any = {}

// ✅ Good — exported type
export type { Invoice }
```

### Components

```tsx
// ✅ Good — typed props, functional component
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}

// ❌ Bad — untyped props
export function Button(props: any) { ... }
```

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `InvoiceCard.tsx` |
| Pages | lowercase | `page.tsx` |
| Utilities | kebab-case | `gst-calculator.ts` |
| Hooks | camelCase with use- | `use-invoices.ts` |
| Types | kebab-case | `invoice.ts` |

### Import Order

```typescript
// 1. React/Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third party
import { z } from 'zod'
import { motion } from 'framer-motion'

// 3. Internal — lib/utils
import { cn } from '@/lib/utils'

// 4. Internal — components
import { Button } from '@/components/ui/button'

// 5. Types
import type { Invoice } from '@/types/invoice'
```

### API Routes

```typescript
// ✅ Good — proper error handling
export async function GET(req: Request) {
  try {
    const data = await prisma.invoice.findMany()
    return Response.json({ data }, { status: 200 })
  } catch (error) {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
```

---

## 🐛 Reporting Bugs

Report bugs via GitHub Issues, including:

1. **Bug description** — what happened
2. **Steps to reproduce** — exactly how to reproduce it
3. **Expected behavior** — what should have happened
4. **Actual behavior** — what actually happened
5. **Screenshots** — if it's a UI bug
6. **Environment** — OS, Node version, browser

---

## 💡 Suggesting Features

Submit a feature request via GitHub Issues with the `enhancement` label, including:

1. **Feature description** — what you want
2. **Problem it solves** — why it's needed
3. **Proposed solution** — how it could be implemented
4. **Alternatives considered** — other approaches you thought of

---

## ❓ Questions?

- Ask in GitHub Discussions
- Or open an Issue with the `question` label

---

Happy coding! 🚀

**InvoiceFlow Team**
