import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root — otherwise a stray lockfile further up the drive
  // makes Turbopack guess the home directory.
  turbopack: { root: here },
  // Don't scaffold AGENTS.md / CLAUDE.md — this project's discipline is the
  // ADF standing orders, not Next's boilerplate.
  agentRules: false,
};

export default nextConfig;
