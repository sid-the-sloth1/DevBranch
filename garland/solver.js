//Utility Functions
function isNullOrOutOfBounds(grid, a, b) {
  if (a < 0 || a > 4 || b < 0 || b > 4) return true;
  return grid.tails[a][b] === null;
}

function getAdjacentCell(grid, a, b, direction) {
  switch (direction) {
    case "r":
      if (isNullOrOutOfBounds(grid, a, b + 1)) return null;
      return grid.tails[a][b + 1];
    case "l":
      if (isNullOrOutOfBounds(grid, a, b - 1)) return null;
      return grid.tails[a][b - 1];
    case "t":
      if (isNullOrOutOfBounds(grid, a - 1, b)) return null;
      return grid.tails[a - 1][b];
    case "b":
      if (isNullOrOutOfBounds(grid, a + 1, b)) return null;
      return grid.tails[a + 1][b];
  }
}
function getAdjacentCords(a, b, direction) {
  switch (direction) {
    case "r":
      return [a, b + 1];
    case "l":
      return [a, b - 1];
    case "t":
      return [a - 1, b];
    case "b":
      return [a + 1, b];
  }
}
function getOppositeDir(direction) {
  const dir_obj = { "r": "l", "l": "r", "t": "b", "b": "t" };
  return dir_obj[direction];
}
function getEnds(grid) {
  return { "end1_x": grid.ends[0].position[0], "end1_y": grid.ends[0].position[1], "end1_dir": grid.ends[0].side, "end2_x": grid.ends[1].position[0], "end2_y": grid.ends[1].position[1], "end2_dir": grid.ends[1].side }

}

function removeDuplicates(array) {
  return array.filter((item, index, self) =>
    index === self.findIndex((t) =>
      t.rot === item.rot && JSON.stringify(t.connections) === JSON.stringify(item.connections)
    )
  );
}
/////THE BIG BOI CODE
function isSolved(gridData) {
  let a = 0;
  let b = 0;
  const ends = getEnds(gridData);
  for (let i = 0; i < 25; i++) {
    if (!isNullOrOutOfBounds(gridData, a, b)) {
      const cell = gridData.tails[a][b];
      const connections = cell.connections;
      for (const connection of connections) {
        const adjacentCell = getAdjacentCell(gridData, a, b, connection);
        if (adjacentCell === null) {
          if (ends.end1_x === a && ends.end1_y === b) {
            if (!connections.includes(ends.end1_dir)) {
              return false;
            }
          } else if (ends.end2_x === a && ends.end2_y === b) {
            if (!connections.includes(ends.end2_dir)) {
              return false;
            }
          } else {
            return false;
          }
        } else {
          const adjacentCellConnections = adjacentCell.connections;
          if (!adjacentCellConnections.includes(getOppositeDir(connection))) {
            return false;
          }
        }
      }
    }
    if (b === 4) {
      b = 0;
      a += 1;
    } else {
      b += 1;
    }
  }
  ////
  return true;
}


// THE BIG BOI FUNCTION 2. THIS WILL HOPEFULLY SOLVE THE PUZZLE
function solvePuzzle(gridData) {
  const ends = getEnds(gridData);
  const matrix = gridData;
  const possible_rotations_obj = {};
  let a = 0;
  let b = 0;
  function isEnd(aa, bb) {
    if (ends.end1_x === aa && ends.end1_y === bb) return [ends.end1_dir, true];
    if (ends.end2_x === aa && ends.end2_y === bb) return [ends.end2_dir, true];
    return false;
  }
  for (let i = 0; i < 25; i++) {
    if (!isNullOrOutOfBounds(gridData, a, b)) {
      const img = matrix.tails[a][b].imageName;
      if (!img.includes("cross")) {
        if (img.includes("angle")) {
          //top row. x=0
          if (a === 0) {
            if (!isEnd(a, b)) {
              // check left cell
              if (!isNullOrOutOfBounds(gridData, a, b - 1)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
                }
              }
              // check right cell
              if (!isNullOrOutOfBounds(gridData, a, b + 1)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
                }
              }
            } else {
              const endDir = isEnd(a, b)[0];
              if (endDir === "t") {
                // check left cell
                if (!isNullOrOutOfBounds(gridData, a, b - 1)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
                  }
                }
                // check right cell
                if (!isNullOrOutOfBounds(gridData, a, b + 1)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
                  }
                }
              } else if (endDir === "l") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
                }
              } else if (endDir === "r") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
                }
              }
            }
          } else if (a === 4) {
            if (!isEnd(a, b)) {
              // check left cell
              if (!isNullOrOutOfBounds(gridData, a, b - 1)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
                }
              }
              // check right cell
              if (!isNullOrOutOfBounds(gridData, a, b + 1)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
                }
              }
            } else {
              const endDir = isEnd(a, b)[0];
              if (endDir === "b") {
                // check left cell
                if (!isNullOrOutOfBounds(gridData, a, b - 1)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
                  }
                }
                // check right cell
                if (!isNullOrOutOfBounds(gridData, a, b + 1)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
                  }
                }
              } else if (endDir === "l") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
                }
              } else if (endDir === "r") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
                }
              }
            }
          }
          //b = 0. first column
          if (b === 0) {
            if (!isEnd(a, b)) {
              // check top cell
              if (!isNullOrOutOfBounds(gridData, a - 1, b)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
                }
              }
              // check bottom cell
              if (!isNullOrOutOfBounds(gridData, a + 1, b)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
                }
              }
            } else {
              const endDir = isEnd(a, b)[0];
              if (endDir === "l") {
                // check top cell
                if (!isNullOrOutOfBounds(gridData, a - 1, b)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
                  }
                }
                // check bottom cell
                if (!isNullOrOutOfBounds(gridData, a + 1, b)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
                  }
                }
              } else if (endDir === "t") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
                }
              } else if (endDir === "b") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
                }
              }
            }
          } else if (b === 4) {
            if (!isEnd(a, b)) {
              // check top cell
              if (!isNullOrOutOfBounds(gridData, a - 1, b)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
                }
              }
              // check bottom cell
              if (!isNullOrOutOfBounds(gridData, a + 1, b)) {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
                }
              }
            } else {
              const endDir = isEnd(a, b)[0];
              if (endDir === 'r') {
                // check top cell
                if (!isNullOrOutOfBounds(gridData, a - 1, b)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
                  }
                }
                // check bottom cell
                if (!isNullOrOutOfBounds(gridData, a + 1, b)) {
                  if (!possible_rotations_obj[`${a}_${b}`]) {
                    possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
                  } else {
                    possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
                  }
                }
              } else if (endDir === "t") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
                }
              } else if (endDir === "b") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
                }
              }
            }
          }
          if (a !== 0 && a !== 4 && b !== 0 && b !== 4) {
            // check left and top cells
            if (!isNullOrOutOfBounds(gridData, a, b - 1) && !isNullOrOutOfBounds(gridData, a - 1, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 270, "connections": ["l", "t"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 270, "connections": ["l", "t"] });
              }
            }
            // left and bottom cells
            if (!isNullOrOutOfBounds(gridData, a, b - 1) && !isNullOrOutOfBounds(gridData, a + 1, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 180, "connections": ["l", "b"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 180, "connections": ["l", "b"] });
              }
            }
            // right and top cells
            if (!isNullOrOutOfBounds(gridData, a, b + 1) && !isNullOrOutOfBounds(gridData, a - 1, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["r", "t"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["r", "t"] });
              }
            }
            // right and bottom cells
            if (!isNullOrOutOfBounds(gridData, a, b + 1) && !isNullOrOutOfBounds(gridData, a + 1, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["r", "b"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["r", "b"] });
              }
            }
          }
        } else if (img.includes("straight")) {
          if (a === 0 || a === 4) {
            if (!isEnd(a, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["l", "r"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["l", "r"] });
              }
            } else {
              const endDir = isEnd(a, b)[0];
              if (endDir === "b" || endDir === "t") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["b", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["b", "t"] });
                }
              } else {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["l", "r"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["l", "r"] });
                }
              }
            }
          }
          if (b === 0 || b === 4) {
            if (!isEnd(a, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["b", "t"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["b", "t"] });
              }
            } else {
              const endDir = isEnd(a, b)[0];
              if (endDir === "l" || endDir === "r") {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["l", "r"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["l", "r"] });
                }
              } else {
                if (!possible_rotations_obj[`${a}_${b}`]) {
                  possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["b", "t"] }];
                } else {
                  possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["b", "t"] });
                }
              }
            }
          }
          if (a !== 0 && a !== 4 && b !== 0 && b !== 4) {
            //check top and bottom cells
            if (!isNullOrOutOfBounds(gridData, a - 1, b) && !isNullOrOutOfBounds(gridData, a + 1, b)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 90, "connections": ["b", "t"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 90, "connections": ["b", "t"] });
              }
            }
            // check left and right cells
            if (!isNullOrOutOfBounds(gridData, a, b - 1) && !isNullOrOutOfBounds(gridData, a, b + 1)) {
              if (!possible_rotations_obj[`${a}_${b}`]) {
                possible_rotations_obj[`${a}_${b}`] = [{ "rot": 0, "connections": ["l", "r"] }];
              } else {
                possible_rotations_obj[`${a}_${b}`].push({ "rot": 0, "connections": ["l", "r"] });
              }
            }
          }
        }
      }
    }
    if (b === 4) {
      b = 0;
      a += 1;
    } else {
      b += 1;
    }
  }

  for (const key in possible_rotations_obj) {
    if (possible_rotations_obj[key].length > 1) {
      possible_rotations_obj[key] = removeDuplicates(possible_rotations_obj[key]);
    }
  }
  function createADJs() {
    for (const key in possible_rotations_obj) {
      if (possible_rotations_obj[key].length === 1) {
        for (const possible_rot of possible_rotations_obj[key]) {
          const a = Number(key.split("_")[0]);
          const b = Number(key.split("_")[1]);
          possible_rot.adj = createLimitationsForAdjacentCells(matrix, a, b, possible_rot.connections);
        }
      }
    }
  }

  function reducePossibilities() {
    const newObj = {};
    for (const key in possible_rotations_obj) {
      if (possible_rotations_obj[key].length === 1) {
        for (const possible_rot of possible_rotations_obj[key]) {
          const a = Number(key.split("_")[0]);
          const b = Number(key.split("_")[1]);
          for (const dir in possible_rot.adj) {
            const adj = possible_rot.adj[dir];
            if (adj.length > 0) {
              const adjCell_cords = getAdjacentCords(a, b, dir);
              if (possible_rotations_obj[`${adjCell_cords[0]}_${adjCell_cords[1]}`]) {
                const adjCell = possible_rotations_obj[`${adjCell_cords[0]}_${adjCell_cords[1]}`];
                if (adjCell.length > 1) {
                  for (const rot of adjCell) {
                    if (adj.includes(rot.rot)) {
                      const n = adjCell_cords[0];
                      const p = adjCell_cords[1]
                      if (!newObj[`${n}_${p}`]) {
                        newObj[`${n}_${p}`] = [{ "rot": rot.rot, "connections": rot.connections }]
                      } else {
                        newObj[`${n}_${p}`].push({ "rot": rot.rot, "connections": rot.connections })
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    for (const key in newObj) {
      possible_rotations_obj[key] = newObj[key];
    }
  }
  createADJs();
  reducePossibilities();
  createADJs();
  reducePossibilities();
  createADJs();
  reducePossibilities();

  function isSolution(combination) {
    console.log(1)
    const testCombination = JSON.parse(JSON.stringify(matrix));
    for (const key in combination) {
      const [a, b] = key.split("_").map(Number);
      const value = combination[key];
      updateProperty(testCombination, a, b, { "rotation": value.rot, "connections": value.connections });
    }
    if (isSolved(testCombination)) {
      console.log(2)
      //createTails(testCombination.tails);
      calculateClicks(data, testCombination);
      return true;
    }
    return false;
  }


  function findSolution(keys, index, currentCombination) {
    if (index === keys.length) {
      if (isSolution(currentCombination)) {
        return true;
      }
      return false;
    }

    const key = keys[index];
    const values = possible_rotations_obj[key];

    for (const value of values) {
      currentCombination[key] = value;

      if (findSolution(keys, index + 1, currentCombination)) {

        return true;
      }
      delete currentCombination[key];
    }
    return false;
  }

  function generateCombinations() {
    const keys = Object.keys(possible_rotations_obj);
    const currentCombination = {};

    if (!findSolution(keys, 0, currentCombination)) {
      console.log("No solution found.");
    }
  }

  generateCombinations();

}
// filler code for testing
function getTime() {
  //current time in date, hour, minute, second
  const date = new Date();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${hour}:${minute}:${second}`
}
document.querySelector("#isSolved").addEventListener("click", () => {
  solvePuzzle(data);
  //document.querySelector("#resultText").innerHTML = `${getTime()}: ${isSolved(data)}`;
});
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
function possibleOptionsForAdjacentCell(grid, a, b, direction) {
  const cell = getAdjacentCell(grid, a, b, direction);
  if (cell === null) {
    return null;
  } else {
    const img = cell.imageName;
    const array = [];
    if (img.includes("angle")) {
      const possibleAngles = [0, 90, 180, 270];
      for (const angle of possibleAngles) {
        if (getConnection("angle", angle).includes(getOppositeDir(direction))) {
          array.push(angle);
        }
      }
    } else if (img.includes('straight')) {
      const possibleAngles = [0, 90];
      for (const angle of possibleAngles) {
        if (getConnection("angle", angle).includes(getOppositeDir(direction))) {
          array.push(angle);
        }
      }

    }
    return array;
  }
}
function createLimitationsForAdjacentCells(grid, a, b, connections) {
  const obj = {};
  for (const direction of connections) {
    const array = possibleOptionsForAdjacentCell(grid, a, b, direction);
    if (array !== null) {
      obj[direction] = array;
    } else {
      obj[direction] = [];
    }
  }
  return obj;
}