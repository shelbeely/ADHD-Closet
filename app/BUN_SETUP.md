# Bun.js Setup Guide

This project is designed to use **Bun.js** as the primary JavaScript runtime and package manager.

## Why Bun?

- **Fast**: Bun is significantly faster than Node.js/npm for installation and runtime
- **Built-in tools**: Includes bundler, test runner, and package manager
- **Better DX**: Faster feedback loops during development
- **Native TypeScript**: First-class TypeScript support without transpilation overhead

## Installation

### Linux & macOS

```bash
curl -fsSL https://bun.sh/install | bash
```

### Windows (WSL recommended)

```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Verify Installation

```bash
bun --version
# Should show: 1.3.6 or higher
```

## Usage

### Install Dependencies

```bash
bun install
```

### Development

```bash
bun run dev
# or simply
bun dev
```

### Build

```bash
bun run build
```

### Production

```bash
bun start
```

## Known Issues

### Bun Crashes in GitHub Actions / CI

Bun v1.3.x may crash in certain virtualized environments with errors like:
- `Assertion failure: Expected metadata to be set`
- `Floating point error at address 0x...`
- `Illegal instruction (core dumped)`

**This is a known Bun bug** in specific VM configurations, even when AVX/AVX2 is supported.

#### Workarounds:

1. **Option A**: Use npm/node in CI only
   ```bash
   npm install
   npm run dev
   ```

2. **Option B**: Try Bun 1.3.6 (latest stable)
   ```bash
   curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.6"
   ```

3. **Option C**: Use Bun baseline build
   ```bash
   curl -fsSL https://github.com/oven-sh/bun/releases/download/bun-v1.3.6/bun-linux-x64-baseline.zip -o bun-baseline.zip
   unzip bun-baseline.zip
   mv bun-linux-x64-baseline/bun ~/.bun/bin/bun
   ```

4. **Option D**: Enable full CPU features in VM
   - KVM: `-cpu host`
   - Proxmox: "Host" CPU type
   - VMware: Expose full CPU features

### Network Access

Bun needs access to:
- `registry.npmjs.org` (104.16.x.x via Cloudflare)
- Port 443 (HTTPS)

## For Development

The project works with both Bun and npm/node. All scripts are compatible with both runtimes.

### Using npm (fallback)

If Bun is not available or crashes in your environment:

```bash
npm install
npm run dev
npm run build
npm start
```

**Note**: Development is optimized for Bun, but npm/node compatibility is maintained for CI/CD and environments where Bun is unstable.

## Package Manager Detection

The project specifies `"packageManager": "bun@1.3.6"` in package.json, which will:
- Prompt users to install Bun if not present
- Ensure version consistency across environments
- Work with Corepack for automatic package manager selection

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun on Linux](https://github.com/oven-sh/bun)
- [Known Issues](https://github.com/oven-sh/bun/issues)
