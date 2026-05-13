#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

const DEFAULT_ENV = "production";
const SYNC_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (!part.startsWith("--")) {
      args._.push(part);
      continue;
    }

    const key = part.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function runVercel(args) {
  const cliArgs = ["vercel"];
  const options = {
    encoding: "utf8",
  };

  if (process.env.VERCEL_TOKEN) {
    cliArgs.push("--token", process.env.VERCEL_TOKEN);
  }

  cliArgs.push(...args);

  try {
    const command = `npx ${cliArgs.map((arg) => `"${arg}"`).join(" ")}`;
    return execSync(command, options);
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr).trim() : "";
    const stdout = error?.stdout ? String(error.stdout).trim() : "";
    const message = [stderr, stdout].filter(Boolean).join("\n");
    throw new Error(message || error.message || "vercel command failed");
  }
}

function parseEnv(content) {
  const values = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^"|"$/g, "");
    values[key] = value;
  });
  return values;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} not found`);
  }

  return parseEnv(fs.readFileSync(filePath, "utf8"));
}

function pull(projectEnv, targetFile) {
  const pullArgs = [
    "env",
    "pull",
    targetFile,
    "--environment",
    projectEnv,
    "--yes",
  ];

  runVercel(pullArgs);
  console.log(`Pulled Vercel ${projectEnv} env to ${targetFile}`);
}

function push(projectEnv, envFile) {
  const local = readEnvFile(envFile);
  let syncedCount = 0;

  SYNC_KEYS.forEach((key) => {
    if (!(key in local)) return;

    const value = local[key];
    // Escape quotes in value for shell
    const escapedValue = value.replace(/"/g, '\\"');

    const args = [
      "env",
      "add",
      key,
      projectEnv,
      "--value",
      escapedValue,
      "--force",
      "--yes",
    ];

    runVercel(args);
    syncedCount += 1;
    console.log(`Synced ${key} to Vercel ${projectEnv}`);
  });

  console.log(`Pushed ${syncedCount} synced keys from ${envFile}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const env = args.env || DEFAULT_ENV;
  const envFile = args.file || process.env.ENV_FILE || ".env.local";

  if (!command || !["pull", "push"].includes(command)) {
    console.error(
      "Usage: sync-vercel-env.js <pull|push> [--env preview|production|development] [--file path]",
    );
    process.exit(2);
  }

  try {
    if (command === "pull") {
      pull(env, envFile);
      return;
    }

    push(env, envFile);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
