const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const jobsFile = path.join(__dirname, "openai-image-jobs.json");
const prepareScript = path.join(__dirname, "prepare-photo-assets.js");
const imageModel = "gpt-image-1";

function parseArgs(argv) {
  const options = {
    force: false,
    list: false,
    only: null,
    prepare: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--list") {
      options.list = true;
      continue;
    }

    if (arg === "--prepare") {
      options.prepare = true;
      continue;
    }

    if (arg === "--only") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("Missing value for --only");
      }

      options.only = new Set(
        value
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      );
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Generate source images with OpenAI and optionally prepare final web assets.

Usage:
  node scripts/generate-photo-assets.js [--prepare] [--force] [--only job-a,job-b] [--list]

Options:
  --prepare   Run the local photo preparation pipeline after generation
  --force     Regenerate files even when the target already exists
  --only      Comma-separated job ids or output paths to run
  --list      Print the configured jobs and exit
`);
}

function loadJobs() {
  const raw = fs.readFileSync(jobsFile, "utf8");
  const jobs = JSON.parse(raw);

  if (!Array.isArray(jobs) || jobs.length === 0) {
    throw new Error(
      "No image jobs were found in scripts/openai-image-jobs.json",
    );
  }

  return jobs;
}

function ensureApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY before running this script.");
  }

  return apiKey;
}

function shouldRunJob(job, only) {
  if (!only) {
    return true;
  }

  return only.has(job.id) || only.has(job.output);
}

function getOutputFormat(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return "jpeg";
  }

  if (extension === ".png") {
    return "png";
  }

  throw new Error(`Unsupported output format for ${filePath}`);
}

function postJson({ apiKey, pathname, body }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = https.request(
      {
        hostname: "api.openai.com",
        path: pathname,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data;

          try {
            data = JSON.parse(text);
          } catch (error) {
            reject(new Error(`OpenAI returned non-JSON output: ${text}`));
            return;
          }

          if (response.statusCode >= 400) {
            const message =
              data?.error?.message ||
              `OpenAI request failed with status ${response.statusCode}`;
            reject(new Error(message));
            return;
          }

          resolve(data);
        });
      },
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

async function generateJob(job, apiKey, force) {
  const outputPath = path.join(root, job.output);

  if (!force && fs.existsSync(outputPath)) {
    console.log(`Skipping ${job.id}; file already exists at ${job.output}`);
    return false;
  }

  console.log(`Generating ${job.id} with ${imageModel}...`);

  const response = await postJson({
    apiKey,
    pathname: "/v1/images/generations",
    body: {
      model: imageModel,
      prompt: job.prompt,
      size: job.size || "1536x1024",
      quality: job.quality || "high",
      output_format: getOutputFormat(job.output),
      ...(job.background ? { background: job.background } : {}),
    },
  });

  const base64Image = response?.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error(`No image data was returned for ${job.id}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(base64Image, "base64"));
  console.log(`Saved ${job.output}`);
  return true;
}

function runPreparePipeline() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [prepareScript], {
      cwd: root,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Photo preparation exited with code ${code}`));
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const jobs = loadJobs();

  if (options.list) {
    for (const job of jobs) {
      console.log(`${job.id}: ${job.output}`);
    }
    return;
  }

  const apiKey = ensureApiKey();
  const selectedJobs = jobs.filter((job) => shouldRunJob(job, options.only));

  if (selectedJobs.length === 0) {
    throw new Error("No matching jobs were found.");
  }

  for (const job of selectedJobs) {
    await generateJob(job, apiKey, options.force);
  }

  if (options.prepare) {
    await runPreparePipeline();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
