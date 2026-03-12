const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");

const jobs = [
  {
    input: "assets/images/source/hero-spa.jpg",
    output: "assets/images/homepage/hero-photo.webp",
    width: 1600,
    height: 760,
    position: "centre",
    modulate: { brightness: 1.02, saturation: 0.92 },
  },
  {
    input: "assets/images/source/hero-accent-left.png",
    output: "assets/images/homepage/hero-accent-left.webp",
    width: 900,
    height: 520,
    fit: "contain",
    position: "centre",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    modulate: { brightness: 1.04, saturation: 0.88 },
    addWarmOverlay: false,
    flip: false,
  },
  {
    input: "assets/images/source/hero-accent-right.png",
    output: "assets/images/homepage/hero-accent-right.webp",
    width: 900,
    height: 520,
    fit: "contain",
    position: "centre",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    modulate: { brightness: 1.04, saturation: 0.88 },
    addWarmOverlay: false,
    flip: false,
  },
  {
    input: "assets/images/source/section-accent-left.png",
    output: "assets/images/homepage/section-accent-left.webp",
    width: 700,
    height: 420,
    fit: "contain",
    position: "centre",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    modulate: { brightness: 1.03, saturation: 0.9 },
    addWarmOverlay: false,
    flip: false,
  },
  {
    input: "assets/images/source/section-accent-right.png",
    output: "assets/images/homepage/section-accent-right.webp",
    width: 700,
    height: 420,
    fit: "contain",
    position: "centre",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    modulate: { brightness: 1.03, saturation: 0.9 },
    addWarmOverlay: false,
    flip: false,
  },
  {
    input: "assets/images/source/laser-hair-removal.jpg",
    output: "assets/images/treatments/laser-hair-removal.webp",
    width: 960,
    height: 624,
    position: "centre",
    modulate: { brightness: 1.03, saturation: 0.9 },
  },
  {
    input: "assets/images/source/advanced-electrolysis.jpg",
    output: "assets/images/treatments/advanced-electrolysis.webp",
    width: 960,
    height: 624,
    position: "centre",
    modulate: { brightness: 1.03, saturation: 0.88 },
  },
  {
    input: "assets/images/source/laser-tattoo-removal.jpg",
    output: "assets/images/treatments/laser-tattoo-removal.webp",
    width: 960,
    height: 624,
    position: "centre",
    modulate: { brightness: 1.02, saturation: 0.88 },
  },
  {
    input: "anna.jpg",
    output: "assets/images/homepage/anna-portrait.webp",
    width: 640,
    height: 640,
    position: "attention",
    modulate: { brightness: 1.04, saturation: 0.9 },
  },
  {
    input: "assets/images/source/location-map.jpg",
    output: "assets/images/homepage/location-map.webp",
    width: 600,
    height: 800,
    position: "centre",
    modulate: { brightness: 1.02, saturation: 0.9 },
  },
  {
    input: "assets/images/source/site-logo.png",
    output: "assets/images/homepage/site-logo.webp",
    width: 512,
    height: 512,
    fit: "contain",
    position: "centre",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    addWarmOverlay: false,
    flip: false,
  }
];

async function processJob(job) {
  const input = path.join(root, job.input);
  const output = path.join(root, job.output);
  await fs.promises.mkdir(path.dirname(output), { recursive: true });
  const warmOverlay = await sharp({
    create: {
      width: job.width,
      height: job.height,
      channels: 4,
      background: { r: 191, g: 140, b: 109, alpha: 0.12 },
    },
  })
    .png()
    .toBuffer();

  let image = sharp(input)
    .resize(job.width, job.height, {
      fit: job.fit || "cover",
      position: job.position,
      background: job.background,
    })
    .modulate(job.modulate ?? { brightness: 1, saturation: 1 });

  if (job.flip) {
    image = image.flop();
  }

  if (job.addWarmOverlay !== false) {
    image = image.composite([
      {
        input: warmOverlay,
        blend: "soft-light",
      },
    ]);
  }

  image = image
    .sharpen()
    .webp({ quality: 86, effort: 6, smartSubsample: true });

  await image.toFile(output);
  console.log(`Generated ${job.output}`);
}

async function main() {
  for (const job of jobs) {
    await processJob(job);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
