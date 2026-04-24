# Auction Service for Streamers (Frontend) – [pointauc.com](https://pointauc.com)

## 📖 User Guide (Comprehensive Feature Reference)

The documentation below is aimed at streamers and viewers — it explains every feature of Pointauc in detail:

https://pointauc.com/docs/

## 🛠️ Tech Stack (at a glance)

- **React 19 + Vite + TypeScript**
- **Redux Toolkit** – global state management
- **Mantine** – component library
- **Socket.IO & Centrifuge** – real-time communication with the backend and external services
- **i18next** – internationalisation
- **Tailwind / CSS-Modules** – styling

## 🚀 Getting Started

### Prerequisites

- **Node.js >= 22**
- **pnpm**

### Installation & Development Server

```bash
# install dependencies
pnpm install

# start the dev server (Vite)
pnpm dev
```

## 🔐 Authenticity Verification

The code running on [pointauc.com](https://pointauc.com) can be verified against this repository. Each deployment generates SHA-256 hashes of all HTML, JS, and CSS files, published as an immutable [GitHub release](https://github.com/Pointauc/pointauc_frontend/releases) with the tag format `deploy-<commit-sha>`.

### Verify Deployed Files

```bash
# Clone the repository
git clone https://github.com/Pointauc/pointauc_frontend.git
cd pointauc_frontend

# Install dependencies
pnpm install

# Verify the deployed files
pnpm verify:authenticity
```

This script downloads the hash manifest from the latest release, fetches each file from the live site, compares hashes, and shows which files match or differ

### Why This Matters

- **Transparency**: Anyone can independently verify that the deployed website matches the source code
- **Security**: Even if our server is compromised, you can detect unauthorized modifications

### Important Note

Pointeauc uses claudflare which may inject a script into the HTML files. The Cloudflare script provides DDoS protection and bot mitigation and doesn't affect the website functionality.

If you want to verify the integrity of HTML files manually, you need to strip the claudflare script tag. This process is done AUTOMATICALLY by the verification script.

## 📝 Contribution guidelines

Contributions are welcome through issues and pull requests. By contributing to this
repository, you agree that your contribution may be distributed as part of this
project under the repository license.

## 📄 License

This repository is **source-available**, not open source.

The code in this repository is licensed under **PolyForm Noncommercial 1.0.0**.
You may use, modify, and share it for noncommercial purposes under the terms in
[LICENSE](./LICENSE). Commercial use requires separate permission from the
project owner.

Please preserve the attribution notice in [NOTICE](./NOTICE) when redistributing
the project or derivative works.

## 💡 Suggestions & Bug Reports

Found a bug or have an idea? Please [open an issue](https://github.com/Pointauc/pointauc_frontend/issues).
