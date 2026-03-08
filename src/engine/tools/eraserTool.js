/* eslint-disable */
// Eraser tool - extracted from eraserTool.js
// Depends on globals: svg, isEraserToolActive, ACTION_DELETE, historyStack, redoStack, clearAllSelections
import { createEraserTrail, updateEraserTrail, fadeOutEraserTrail, getIsErasing, setIsErasing, getTargetedElements } from '../core/EraserTrail.js';

const eraserCursorSVG = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="#222" stroke="white" stroke-width="2"/></svg>')}`;

// --- Function to highlight elements under the eraser ---
function handleElementHighlight(clientX, clientY) {
  if (!getIsErasing()) return;
  const targetedElements = getTargetedElements();

  const element = document.elementFromPoint(clientX, clientY);
  if (!element || element === svg) return;

  let elementToHighlight = element;

  while (elementToHighlight && elementToHighlight !== svg) {
    let groupType = elementToHighlight.closest("g[data-type='text-group']");
    let circleGroupType = elementToHighlight.closest("g[data-type='circle-group']");
    let squareGroupType = elementToHighlight.closest("g[data-type='square-group']");
    let lineGroupType = elementToHighlight.closest("g[data-type='line-group']");
    let arrowGroupType = elementToHighlight.closest("g[data-type='arrow-group']");

    if (squareGroupType) {
        elementToHighlight = squareGroupType;
    } else if (circleGroupType) {
        elementToHighlight = circleGroupType;
    }
    else if(lineGroupType) {
        elementToHighlight = lineGroupType
    }
    else if (arrowGroupType) {
        elementToHighlight = arrowGroupType;
    }
    else if (groupType) {
      elementToHighlight = groupType;
    }
    else if (!["g", "path", "line", "image", "circle", "polygon"].includes(elementToHighlight.tagName)) {
        elementToHighlight = null;
        break;
    }
    if (elementToHighlight) {
         if (!targetedElements.has(elementToHighlight)) {
            targetedElements.add(elementToHighlight);
            elementToHighlight.setAttribute("data-original-opacity", elementToHighlight.style.opacity || "1");
            elementToHighlight.dataset.storedOpacity = elementToHighlight.getAttribute("data-original-opacity");
            elementToHighlight.style.opacity = "0.5";
        }
        return;
    }

    elementToHighlight = elementToHighlight.parentNode;
  }

  removeHighlight();
}

function removeHighlight() {
  const targetedElements = getTargetedElements();
  targetedElements.forEach(element => {
      element.style.opacity = element.getAttribute("data-original-opacity") || "1";
  });
  targetedElements.clear();
}

function removeTargetedElements() {
    const targetedElements = getTargetedElements();
    const elementsToRemove = Array.from(targetedElements);

    if (elementsToRemove.length > 0) {
        const deletionActions = [];

        elementsToRemove.forEach(element => {
            if (element.parentNode === svg) {
                const originalOpacity = element.dataset.storedOpacity || "1";
                deletionActions.push({
                    type: ACTION_DELETE,
                    element: element,
                    parent: element.parentNode,
                    nextSibling: element.nextSibling,
                    originalOpacity: originalOpacity,
                });
                element.parentNode.removeChild(element);
            }
        });

        if (deletionActions.length > 0 && window.historyStack) {
            window.historyStack.push(...deletionActions);
        }

        window.redoStack = [];
        if (typeof clearAllSelections === 'function') clearAllSelections();
        if (typeof updateUndoRedoButtons === 'function') updateUndoRedoButtons();
        targetedElements.clear();
    }
}

// --- Event Listeners ---
svg.addEventListener("pointerdown", (e) => {
  if (isEraserToolActive) {
    setIsErasing(true);
    createEraserTrail(e.clientX, e.clientY);
    handleElementHighlight(e.clientX, e.clientY);
  }
});

svg.addEventListener("pointermove", (e) => {
  if (isEraserToolActive) {
      svg.style.cursor = `url(${eraserCursorSVG}) 10 10, auto`;
  }
  if (!getIsErasing()) return;
  updateEraserTrail(e.clientX, e.clientY);
  handleElementHighlight(e.clientX, e.clientY);
});

svg.addEventListener("pointerup", () => {
  setIsErasing(false);
  removeTargetedElements();
  fadeOutEraserTrail();
  svg.style.cursor = "default";
});

svg.addEventListener("pointerleave", (e) => {
  setIsErasing(false);
  removeTargetedElements();
  fadeOutEraserTrail();
  svg.style.cursor = "default";
});
