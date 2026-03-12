const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

async function main() {
  const input = "assets/images/treatments/tinting-editorial.png";
  const output = "assets/images/treatments/tinting-editorial.webp";
  const width = 1600;
  const height = 800;

  const warmOverlay = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 191, g: 140, b: 109, alpha: 0.12 },
    },
  })
    .png()
    .toBuffer();

  let image = sharp(input)
    .resize(width, height, {
      fit: "cover",
      position: "centre",
    })
    .modulate({ brightness: 1.02, saturation: 0.92 })
    .composite([
      {
        input: warmOverlay,
        blend: "soft-light",
      },
    ])
    .sharpen()
    .webp({ quality: 86, effort: 6, smartSubsample: true });

  await image.toFile(output);
  console.log(`Generated ${output}`);
}

main().catch(console.error);
