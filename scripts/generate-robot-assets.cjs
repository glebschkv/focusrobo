#!/usr/bin/env node

/**
 * Generate pixel art robot assets using the Pixel Lab API.
 *
 * Usage:
 *   PIXELLAB_API_KEY=<key> node scripts/generate-robot-assets.cjs
 *
 * Or pass the key as the first argument:
 *   node scripts/generate-robot-assets.cjs <key>
 */

const fs = require("fs");
const path = require("path");

const API_KEY = process.argv[2] || process.env.PIXELLAB_API_KEY;
if (!API_KEY) {
  console.error(
    "Error: Provide a Pixel Lab API key via PIXELLAB_API_KEY env var or as the first argument."
  );
  process.exit(1);
}

const BASE_URL = "https://api.pixellab.ai/v1";

const ROBOTS = [
  // === Assembly Line ===
  {
    name: "Bolt Bot",
    outputPath: "public/assets/robots/assembly-line/bolt-bot.png",
    description:
      "small sturdy industrial robot, blue steel body, bolt-shaped antenna, glowing blue visor eyes, compact square chassis, mechanical arms, front facing, pixel art game character sprite",
    seed: 42,
  },
  {
    name: "Gear Pup",
    outputPath: "public/assets/robots/assembly-line/gear-pup.png",
    description:
      "small cute robot dog, metallic silver body, visible spinning gears in chest, floppy mechanical ears, wagging antenna tail, happy expression, four legs, front facing, pixel art game character sprite",
    seed: 43,
  },
  {
    name: "Rivet",
    outputPath: "public/assets/robots/assembly-line/rivet.png",
    description:
      "small compact round robot, gunmetal gray body covered in rivets, single large glowing green eye, stubby arms, solid dependable build, front facing, pixel art game character sprite",
    seed: 44,
  },
  {
    name: "Spark Welder",
    outputPath: "public/assets/robots/assembly-line/spark-welder.png",
    description:
      "medium robot welder, orange and bronze body, welding torch arm shooting bright sparks, protective visor helmet, industrial apron, glowing chest core, front facing, pixel art game character sprite",
    seed: 45,
  },
  {
    name: "Turbo Tank",
    outputPath: "public/assets/robots/assembly-line/turbo-tank.png",
    description:
      "heavy armored tank robot, dark green military armor, caterpillar treads instead of legs, turbo exhaust pipes glowing red, wide sturdy body, cannon arm, front facing, pixel art game character sprite",
    seed: 46,
  },

  // === Workshop ===
  {
    name: "Wrench Bot",
    outputPath: "public/assets/robots/workshop/wrench-bot.png",
    description:
      "friendly mechanic robot, yellow hard hat, one arm is a large silver wrench, tool belt around waist, oil-stained orange body, helpful expression, front facing, pixel art game character sprite",
    seed: 50,
  },
  {
    name: "Cog Roller",
    outputPath: "public/assets/robots/workshop/cog-roller.png",
    description:
      "round rolling robot, bronze body made of interlocking cog wheels, rolls on a large gear wheel, spinning gears visible, copper and brass tones, front facing, pixel art game character sprite",
    seed: 51,
  },
  {
    name: "Chrome Cat",
    outputPath: "public/assets/robots/workshop/chrome-cat.png",
    description:
      "sleek robot cat, mirror-polished chrome silver body, glowing purple eyes, pointed metal ears, long curved tail, graceful sitting pose, reflective surface, front facing, pixel art game character sprite",
    seed: 52,
  },
  {
    name: "Piston",
    outputPath: "public/assets/robots/workshop/piston.png",
    description:
      "powerful hydraulic robot, dark steel body with exposed pistons on arms and legs, glowing orange hydraulic fluid lines, strong muscular build, steam vents, front facing, pixel art game character sprite",
    seed: 53,
  },
  {
    name: "Plasma Pup",
    outputPath: "public/assets/robots/workshop/plasma-pup.png",
    description:
      "adorable robot puppy crackling with pink and blue plasma energy, white metallic body, electric sparks around it, glowing plasma tail, excited pose, bright energy aura, front facing, pixel art game character sprite",
    seed: 54,
  },
  {
    name: "Iron Scholar",
    outputPath: "public/assets/robots/workshop/iron-scholar.png",
    description:
      "studious professor robot, dark iron body, round spectacle glasses, graduation cap, holding a glowing book, scholarly robe, wise expression, front facing, pixel art game character sprite",
    seed: 55,
  },

  // === Stealth Lab ===
  {
    name: "Shadow Drone",
    outputPath: "public/assets/robots/stealth-lab/shadow-drone.png",
    description:
      "sleek hovering drone robot, matte black stealth body, four small propellers, single red scanning eye, angular stealth aircraft shape, dark purple accents, front facing, pixel art game character sprite",
    seed: 60,
  },
  {
    name: "Neon Phantom",
    outputPath: "public/assets/robots/stealth-lab/neon-phantom.png",
    description:
      "translucent ghost-like robot, semi-transparent blue body, glowing neon cyan outlines, phasing effect with trailing afterimage, hooded cloak shape, mysterious glowing eyes, front facing, pixel art game character sprite",
    seed: 61,
  },
  {
    name: "Cipher",
    outputPath: "public/assets/robots/stealth-lab/cipher.png",
    description:
      "enigmatic spy robot, dark purple and black body, matrix-style green code scrolling on chest screen, one glowing monocle eye, trench coat silhouette, encrypted symbols floating around, front facing, pixel art game character sprite",
    seed: 62,
  },
  {
    name: "Stealth Owl",
    outputPath: "public/assets/robots/stealth-lab/stealth-owl.png",
    description:
      "robot owl, dark gray stealth body, large round night-vision green glowing eyes, folded metal wings, feather-like armor plates, perched pose, silent and watchful, front facing, pixel art game character sprite",
    seed: 63,
  },

  // === Biotech Zone ===
  {
    name: "Moss Mech",
    outputPath: "public/assets/robots/biotech-zone/moss-mech.png",
    description:
      "nature robot overgrown with green moss and small plants, earthy brown and green body, flowers growing from shoulders, wooden limbs with metal joints, gentle glowing amber eyes, front facing, pixel art game character sprite",
    seed: 70,
  },
  {
    name: "Spore Bot",
    outputPath: "public/assets/robots/biotech-zone/spore-bot.png",
    description:
      "mushroom-shaped robot, domed mushroom cap head with bioluminescent spots, releasing floating green spores, organic curved body, teal and green colors, peaceful expression, front facing, pixel art game character sprite",
    seed: 71,
  },
  {
    name: "Vine Walker",
    outputPath: "public/assets/robots/biotech-zone/vine-walker.png",
    description:
      "tall slender robot with vine-like extending limbs, green and brown organic-metal body, glowing leaf patterns on chest, tree-bark textured armor, tall and elegant, front facing, pixel art game character sprite",
    seed: 72,
  },

  // === Solar Fields ===
  {
    name: "Sun Charger",
    outputPath: "public/assets/robots/solar-fields/sun-charger.png",
    description:
      "radiant solar robot, golden yellow body, solar panel wings spread wide, glowing warm orange core, sun-ray crown on head, bright and cheerful, radiating light, front facing, pixel art game character sprite",
    seed: 80,
  },
  {
    name: "Prism Bot",
    outputPath: "public/assets/robots/solar-fields/prism-bot.png",
    description:
      "crystalline prism-shaped robot, transparent diamond body refracting rainbow light, geometric faceted design, prismatic rainbow aura, glowing white core, elegant and dazzling, front facing, pixel art game character sprite",
    seed: 81,
  },
  {
    name: "Nova",
    outputPath: "public/assets/robots/solar-fields/nova.png",
    description:
      "blazing star robot, white-hot glowing body surrounded by solar flare corona, intense orange and yellow energy radiating outward, fierce bright eyes, powerful explosive aura, front facing, pixel art game character sprite",
    seed: 82,
  },

  // === Cyber District ===
  {
    name: "Neon Sentinel",
    outputPath: "public/assets/robots/cyber-district/neon-sentinel.png",
    description:
      "elite guardian robot, sleek black armor with bright neon blue and pink light strips, visor helmet, energy shield on one arm, laser blade on other, cyberpunk city warrior, front facing, pixel art game character sprite",
    seed: 90,
  },
  {
    name: "Quantum Core",
    outputPath: "public/assets/robots/cyber-district/quantum-core.png",
    description:
      "advanced quantum computer robot, floating orb-shaped body with rotating ring around it, holographic data displays, glowing white and blue quantum energy, ethereal and futuristic, front facing, pixel art game character sprite",
    seed: 91,
  },
  {
    name: "Omega Prime",
    outputPath: "public/assets/robots/cyber-district/omega-prime.png",
    description:
      "ultimate legendary titan robot, massive golden and cyan armored body, crown fused into helmet, blazing plasma core in chest, huge shoulder pauldrons, radiating supreme power, front facing, pixel art game character sprite",
    seed: 77,
  },
  {
    name: "Focus Titan",
    outputPath: "public/assets/robots/cyber-district/focus-titan.png",
    description:
      "colossal dark titanium robot, glowing deep purple energy veins across body, enormous armored frame, concentration crystal embedded in forehead, heavy fists crackling with focus energy, legendary aura, front facing, pixel art game character sprite",
    seed: 93,
  },
];

async function generateRobot(robot) {
  const outputPath = path.resolve(__dirname, "..", robot.outputPath);
  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping ${robot.name} (already exists)`);
    return;
  }

  console.log(`  Generating ${robot.name}...`);

  const body = {
    description: robot.description,
    negative_description: "blurry, realistic, text, watermark, logo, photo, 3d render",
    image_size: { width: 64, height: 64 },
    no_background: true,
    text_guidance_scale: 10,
    seed: robot.seed,
  };

  const res = await fetch(`${BASE_URL}/generate-image-pixflux`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status} for ${robot.name}: ${text}`);
  }

  const data = await res.json();

  const imageData = data.image.b64;
  if (!imageData) {
    throw new Error(
      `No image data in response for ${robot.name}. Keys: ${Object.keys(data).join(", ")}`
    );
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));

  const cost = data.usage?.usd ? `$${data.usage.usd.toFixed(4)}` : "unknown";
  console.log(`  Saved ${robot.name} → ${robot.outputPath} (cost: ${cost})`);
}

async function main() {
  console.log("Pixel Lab Robot Asset Generator");
  console.log(`Generating ${ROBOTS.length} robots...\n`);

  let success = 0;
  let failed = 0;

  for (const robot of ROBOTS) {
    try {
      await generateRobot(robot);
      success++;
    } catch (err) {
      console.error(`  FAILED ${robot.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`);
}

main();
