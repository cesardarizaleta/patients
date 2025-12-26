# Build desktop binaries with Tauri

This project includes Tauri scaffolding to build a native desktop app from the Angular build output.

Prerequisites (on the machine where you will build):
- Node 18+/npm
- Rust toolchain (stable) with cargo
  - Install via: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - After install, run: `. "$HOME/.cargo/env"` (or restart the shell)
- (Optional) `pkg-config` and `libssl-dev` / platform-specific packages for bundling

Quick steps to build a distributable:

1. Install node deps:

```bash
npm install
```

2. Ensure Rust is on PATH (source the env):

```bash
. "$HOME/.cargo/env"
```

3. Build the web app and then the Tauri bundle:

```bash
# Builds Angular app into dist/patients, then runs tauri build which packages.
npm run tauri:build
```

4. After success, find generated bundles in `src-tauri/target/release/bundle/` (linux: deb/appimage, mac: dmg, windows: msi/exe)

Notes:
- The Tauri config expects the Angular `dist/patients` folder to contain the built assets. The Tauri build runs `npm run build` automatically (see `tauri.conf.json`).
- If you want to test without packaging, run in dev mode:

```bash
npm run tauri:dev
```

This will start the Angular dev server and open the Tauri window pointed at `http://localhost:4200`.

Troubleshooting:
- If `tauri build` fails due to missing system libs, install build essentials for your OS (e.g. `build-essential`, `pkg-config`, `libssl-dev` on Debian/Ubuntu).
- For further help see the Tauri docs: https://tauri.app

Continuous integration / Windows builds
------------------------------------

Building Windows installers from Linux is non-trivial. To simplify cross-platform releases this repo includes a GitHub Actions workflow that builds both Linux and Windows bundles on the appropriate hosted runners. The workflow file is `.github/workflows/tauri-ci.yml`.

If you prefer to build Windows artifacts locally, build on a Windows machine (recommended) with Visual Studio tooling installed and then run:

```bash
. "$HOME/.cargo/env"
npm ci
npm run tauri:build
```

On GitHub Actions the `windows-latest` runner already contains the required MSVC toolchain and WiX. To produce Windows installers locally you may need to install:

- Visual Studio 2022 with "Desktop development with C++"
- WiX Toolset (for MSI bundling)

After a successful build the Windows artifacts will be available under `src-tauri/target/release/bundle/` (MSI, EXE, etc).
