/**
 * Toast messages for the different errors that can occur while reading the file
 */
export const TOAST_MESSAGES = {
    "FILE_ERROR": "File should at least contain 'meta' and 'markers' sheets.",
    "ROOT_ERROR": "There should be only one root cell in the 'meta' sheet.",
    "CONS_ERROR": "Consensus value should be restricted to [0, 1] in the 'meta' sheet.",
    "PARENT_ERROR": "A cell has an unknown parent in the 'meta' sheet.",
    "CIRCULARITY_ERROR": "Found circularity in the parent-child relationship in the 'meta' sheet.",
    "MISSING_ERROR": "Missing 'n' or 'consensus' value in the 'meta' sheet.",
    "MARKERS_ERROR": "A cell in the 'markers' sheet is not present in the 'meta' sheet.",
    "META_ERROR": "A cell in the 'meta' sheet is not present in the 'markers' sheet.",
    "NEGATIVE_ERROR": "Values on the 'markers' sheet should be positive."
}

/**
 * Check if data is valid
 * 
 * @param {*} data The filtered worksheets only containing the meta and markers sheets (total of 2)
 * 
 * @returns A boolean indicating if the data is valid and an array of error messages
 */
export const Validation = (data) => {
    /**
     * Auxiliary function to search the parent of a cell (used in circularity check)
     * 
     * @param {*} cell A cell
     * 
     * @returns The parent of the cell
     */
    const getParent = (cell) => {
        // Avoiding "Cannot read property 'parent' of undefined" error by returning undefined if the cell is not found
        const parent = data.get("meta").find((d) => d[""] === cell);
        return parent ? parent["parent"] : undefined;
    }

    let toastMessages = new Set();

    // Check data size and if it has the required sheets
    if (data.size !== 2 || !data.has("meta") || !data.has("markers")) {
        return [false, TOAST_MESSAGES["FILE_ERROR"]];
    }

    // Check that only one cell is the root (has no parent)
    let count = 0;
    for (const cell of data.get("meta")) {
        if (!cell["parent"] || cell["parent"] === "?") count++;
    }
    if (count !== 1) {
        toastMessages.add(TOAST_MESSAGES["ROOT_ERROR"]);
    }

    // Check that F1 Score is well restricted to [0, 1] for the consensus value in the 'meta' sheet
    for (const cell of data.get("meta")) {
        if (cell["consensus"] < 0 || cell["consensus"] > 1) {
            toastMessages.add(TOAST_MESSAGES["CONS_ERROR"]);
            break;
        }
    }

    // Check that all other cells have a parent (present in the 'meta' sheet)
    for (const cell of data.get("meta")) {
        if (cell["parent"] && cell["parent"] !== "?" && !data.get("meta").find((d) => d[""] === cell["parent"])) {
            toastMessages.add(TOAST_MESSAGES["PARENT_ERROR"]);
            break;
        }
    }

    // Check that there is no circularity in the parent-child relationship
    let breakFlag = false;
    for (const cell of data.get("meta")) {
        let parent = cell["parent"];
        // Keep track of visited cells to detect circularity
        const visitedCells = new Set();
        while (parent && parent !== "?") {
            if (visitedCells.has(parent)) {
                toastMessages.add(TOAST_MESSAGES["CIRCULARITY_ERROR"]);
                breakFlag = true;
                break;
            }

            visitedCells.add(parent);
            parent = getParent(parent);

            if (parent === undefined) {
                toastMessages.add(TOAST_MESSAGES["PARENT_ERROR"]);
                breakFlag = true;
                break;
            }
        }
        if (breakFlag) break;
    }

    // Check that all cells have a 'n' and 'consensus' values
    for (const cell of data.get("meta")) {
        if (cell["n"] === undefined || cell["consensus"] === undefined) {
            toastMessages.add(TOAST_MESSAGES["MISSING_ERROR"]);
            break;
        }
    }

    // Check if all cells in the 'meta' sheet are present in the "markers' sheet
    for (const cell of data.get("meta")) {
        if (!data.get("markers").find((d) => d[""] === cell[""])) {
            toastMessages.add(TOAST_MESSAGES["META_ERROR"]);
            break;
        }
    }

    // Check if all cells in the 'markers' sheet are present in the 'meta' sheet
    for (const cell of data.get("markers")) {
        if (!data.get("meta").find((d) => d[""] === cell[""])) {
            toastMessages.add(TOAST_MESSAGES["MARKERS_ERROR"]);
            break;
        }
    }

    // Check if value on 'markers' sheet are positive
    breakFlag = false;
    for (const cell of data.get("markers")) {
        for (const key in cell) {
            if (key !== "") {
                if (cell[key] < 0) {
                    toastMessages.add(TOAST_MESSAGES["NEGATIVE_ERROR"]);
                    breakFlag = true;
                    break;
                }
            }
        }
        if (breakFlag) break;
    }

    return [toastMessages.size === 0, Array.from(toastMessages)];
}