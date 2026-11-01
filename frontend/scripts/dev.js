const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");
const { loadEnvConfig } = require("@next/env");

const frontendDirectory = path.resolve(__dirname, "..");
const backendDirectory = path.resolve(frontendDirectory, "..", "backend");

loadEnvConfig(frontendDirectory);

const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
);
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const shouldStartLaravel =
  apiUrl.protocol === "http:" && localHosts.has(apiUrl.hostname);

let laravelProcess;
let nextProcess;
let isShuttingDown = false;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function isApiAvailable() {
  try {
    const productsUrl = new URL(
      `${apiUrl.pathname.replace(/\/+$/, "")}/products`,
      apiUrl.origin,
    );
    const response = await fetch(productsUrl, {
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function startLaravel() {
  if (!shouldStartLaravel || (await isApiAvailable())) {
    return;
  }

  const port = apiUrl.port || "80";
  const publicDirectory = path.join(backendDirectory, "public");
  const defaultRouter = path.join(
    backendDirectory,
    "vendor",
    "laravel",
    "framework",
    "src",
    "Illuminate",
    "Foundation",
    "resources",
    "server.php",
  );
  const router = existsSync(path.join(backendDirectory, "server.php"))
    ? path.join(backendDirectory, "server.php")
    : defaultRouter;
  console.log(`Laravel API chưa chạy. Đang khởi động tại ${apiUrl.origin}...`);

  let startupError;
  laravelProcess = spawn(
    "php",
    ["-S", `${apiUrl.hostname}:${port}`, router],
    {
      cwd: publicDirectory,
      stdio: "inherit",
    },
  );

  laravelProcess.once("error", (error) => {
    startupError = error;
  });

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (startupError) {
      throw new Error(
        `Không thể khởi động Laravel bằng lệnh php: ${startupError.message}`,
      );
    }

    if (laravelProcess.exitCode !== null) {
      throw new Error("Laravel đã dừng trước khi API sẵn sàng.");
    }

    if (await isApiAvailable()) {
      console.log("Laravel API đã sẵn sàng.");
      return;
    }

    await wait(1000);
  }

  throw new Error(
    `Laravel API không phản hồi tại ${apiUrl.origin} sau 30 giây.`,
  );
}

function shutdown() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  if (nextProcess && nextProcess.exitCode === null) {
    nextProcess.kill();
  }
  if (laravelProcess && laravelProcess.exitCode === null) {
    laravelProcess.kill();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function main() {
  try {
    await startLaravel();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    shutdown();
    return;
  }

  const nextCli = require.resolve("next/dist/bin/next");
  nextProcess = spawn(process.execPath, [nextCli, "dev"], {
    cwd: frontendDirectory,
    stdio: "inherit",
  });

  nextProcess.once("error", (error) => {
    console.error(`Không thể khởi động Next.js: ${error.message}`);
    process.exitCode = 1;
    shutdown();
  });

  nextProcess.once("exit", (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
    shutdown();
  });
}

main();
