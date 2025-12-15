# Auction Service for Streamers (Frontend) – [pointauc.com](https://pointauc.com)

## 📖 User Guide (Comprehensive Feature Reference)

The documentation below is aimed at streamers and viewers — it explains every feature of Pointauc in detail:

https://pointauc.com/docs/

## 🛠️ Tech Stack (at a glance)

- **React 18 + Vite + TypeScript**
- **Redux Toolkit** – global state management
- **Mantine & Material-UI (MUI)** – component libraries (gradually migrating to Mantine)
- **Socket.IO & Centrifuge** – real-time communication with the backend and external services
- **i18next** – internationalisation
- **Sass / CSS-Modules** – styling (CSS-Modules preferred)

## 🚀 Getting Started

### Prerequisites

- **Node.js >= 18** (LTS recommended)
- **yarn**

### Installation & Development Server

```bash
# install dependencies
yarn install

# start the dev server (Vite)
yarn dev
```

## 🔐 Authenticity Verification

The code running on [pointauc.com](https://pointauc.com) can be verified against this repository. Each deployment generates SHA-256 hashes of all HTML, JS, and CSS files, published as an immutable [GitHub release](https://github.com/Pointauc/pointauc_frontend/releases) with the tag format `deploy-<commit-sha>`.

### Verify Deployed Files

```bash
# Clone the repository
git clone https://github.com/Pointauc/pointauc_frontend.git
cd pointauc_frontend

# Install dependencies
yarn install

# Verify the deployed files
yarn verify:authenticity
```

This script downloads the hash manifest from the latest release, fetches each file from the live site, compares hashes, and shows which files match or differ

### Why This Matters

- **Transparency**: Anyone can independently verify that the deployed website matches the source code
- **Security**: Even if our server is compromised, you can detect unauthorized modifications

## 📝 Contribution guidelines

TBD

## 💡 Suggestions & Bug Reports

Found a bug or have an idea? Please [open an issue](https://github.com/Pointauc/pointauc_frontend/issues).
