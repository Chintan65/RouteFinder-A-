const gridContainer = document.getElementById('grid-container');
const solveButton = document.getElementById('solve-button');
const numRows = 20;
const numCols = 20;
const grid = new Array(numRows).fill(null).map(() => new Array(numCols).fill(''));

let startCell = null;
let goalCell = null;
let isDrawing = false;

function createGrid() {
    gridContainer.innerHTML = '';
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('mousedown', handleCellClick);
            cell.addEventListener('mouseenter', handleCellEnter);
            gridContainer.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    const { row, col } = event.target.dataset;
    const cell = grid[row][col];
    if (event.shiftKey) {
        if (cell === 'obstacle') {
            grid[row][col] = '';
            event.target.classList.remove('obstacle');
        } else {
            grid[row][col] = 'obstacle';
            event.target.classList.add('obstacle');
        }
    } else if (event.ctrlKey) {
        if (startCell) {
            startCell.classList.remove('start');
        }
        startCell = event.target;
        event.target.classList.add('start');
    } else if (event.altKey) {
        if (goalCell) {
            goalCell.classList.remove('goal');
        }
        goalCell = event.target;
        event.target.classList.add('goal');
    }
}

function handleCellEnter(event) {
    if (isDrawing) {
        handleCellClick(event);
    }
}

solveButton.addEventListener('click', solve);

function solve() {
    if (!startCell || !goalCell) {
        alert('Please set both the start and goal cells.');
        return;
    }

    const openSet = new Set();
    const closedSet = new Set();
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    const start = [parseInt(startCell.dataset.row), parseInt(startCell.dataset.col)];
    const goal = [parseInt(goalCell.dataset.row), parseInt(goalCell.dataset.col)];

    function heuristic(node) {
        const dx = node[0] - goal[0];
        const dy = node[1] - goal[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    openSet.add(start.toString());
    gScore[start.toString()] = 0;
    fScore[start.toString()] = heuristic(start);

    while (openSet.size > 0) {

        let current = null;
        let minFScore = Infinity;
        for (const nodeStr of openSet) {
            if (fScore[nodeStr] < minFScore) {
                current = nodeStr.split(',').map(Number);
                minFScore = fScore[nodeStr];
            }
        }

        if (current.toString() === goal.toString()) {
            // Reconstruct the path and visualize it
            const path = reconstructPath(cameFrom, current);
            visualizePath(path);
            return;
        }

        openSet.delete(current.toString());
        closedSet.add(current.toString());


        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const neighbor = [current[0] + dx, current[1] + dy];
                if (
                    neighbor[0] >= 0 &&
                    neighbor[0] < numRows &&
                    neighbor[1] >= 0 &&
                    neighbor[1] < numCols &&
                    grid[neighbor[0]][neighbor[1]] !== 'obstacle'
                ) {
                    neighbors.push(neighbor);
                }
            }
        }

        for (const neighbor of neighbors) {
            const neighborStr = neighbor.toString();
            if (closedSet.has(neighborStr)) continue; 

            const tentativeGScore = gScore[current.toString()] + 1;

            if (!openSet.has(neighborStr)) {
                openSet.add(neighborStr);
            } else if (tentativeGScore >= gScore[neighborStr]) {
                continue;
            }
            cameFrom[neighborStr] = current.toString();
            gScore[neighborStr] = tentativeGScore;
            fScore[neighborStr] = gScore[neighborStr] + heuristic(neighbor);
        }
    }

    alert('No path found.');
}
function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[current.toString()]) {
        current = cameFrom[current.toString()].split(',').map(Number);
        path.push(current);
    }
    return path.reverse();
}

function visualizePath(path) {
    for (const [row, col] of path) {
        const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell.classList.contains('start') && !cell.classList.contains('goal')) {
            cell.classList.add('path');
        }
    }
}

createGrid();

