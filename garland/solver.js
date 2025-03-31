
function calculateClicks(originalGrid, solutionGrid) {
  let a = 0;
  let b = 0;
  for (let i = 0; i < 25; i++) {
    let clicks = 0;
    const orig_cell = originalGrid.tails[a][b];
    const sol_cell = solutionGrid.tails[a][b];
    if (orig_cell !== null && sol_cell !== null) {
      const img = orig_cell.imageName;
      if (!img.includes("cross")) {
        const orig_rot = normaliseRotationValue(orig_cell.rotation, img);
        const sol_rot = normaliseRotationValue(sol_cell.rotation, img);
        if (orig_rot !== sol_rot) {
          if (img.includes("straight")) {
            clicks += 1;
          } else if (img.includes("angle")) {
            if (orig_rot > sol_rot) {
              clicks += ((360 - orig_rot) / 90) + (sol_rot / 90)
            } else {
              clicks += (sol_rot - orig_rot) / 90;
            }
          }
        }
      }
    }
    if (clicks > 0) {
      console.log(`${a}_${b}: ${clicks} clicks`);
    }
    b += 1;
    if (b === 5) {
      b = 0;
      a += 1;
    }
  }
}
function normaliseRotationValue(rotation, img) {
  let rot = rotation;
  if (rot >= 360) {
    while (rot >= 360) {
      rot -= 360;
    }
  }
  if (img.includes("straight")) {
    if (rot === 0 || rot === 180) {
      rot = 0;
    } else if (rot === 270 || rot === 90) {
      rot = 90;
    }
  } else if (img.includes("angle")) {
    if (rot === 0) {
      rot = 360;
    }
  }
  return rot;
}
