// scripts/clean-project.js
const { execSync } = require("child_process");
const fs = require("fs");

console.log("\n🚀 Starting Smart Project Cleanup...\n");

// Helper function to safely delete a path
function removePath(path) {
  if (fs.existsSync(path)) {
    console.log(`🗑️  Removing ${path}...`);
    fs.rmSync(path, { recursive: true, force: true });
  }
}

// 🧹 STEP 1: Remove old dependencies and caches
removePath("node_modules");
removePath("package-lock.json");
removePath("yarn.lock");
removePath(".expo");

// 🧽 STEP 2: Clear npm and Expo caches
try {
  console.log("\n🧼 Clearing npm and Expo caches...");
  execSync("npm cache clean --force", { stdio: "inherit" });
  execSync("npx expo start -c", { stdio: "inherit" });
} catch (err) {
  console.warn("⚠️ Skipped cache cleaning — Expo may not be globally installed.");
}

// 📦 STEP 3: Reinstall dependencies
try {
  console.log("\n📦 Reinstalling dependencies...");
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies reinstalled successfully!");
} catch (err) {
  console.error("❌ Error reinstalling dependencies:", err);
}

// 🕵️ STEP 4: Check for unused packages (using depcheck)
try {
  console.log("\n🔍 Checking for unused dependencies...");
  execSync("npx depcheck", { stdio: "inherit" });
} catch (err) {
  console.warn("⚠️ Depcheck not installed globally, installing temporarily...");
  execSync("npm install depcheck --save-dev", { stdio: "inherit" });
  execSync("npx depcheck", { stdio: "inherit" });
}

// 📅 STEP 5: Check for outdated packages
try {
  console.log("\n📊 Checking for outdated dependencies...");
  execSync("npm outdated || true", { stdio: "inherit" });
} catch {
  console.log("✅ Outdated check complete.");
}

console.log("\n🎉 Project cleanup and dependency health check complete!\n");