"use client";
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/shapes/Rectangle.js
var Rectangle_exports = {};
__export(Rectangle_exports, {
  Rectangle: () => Rectangle2
});
var rc, isDraggingShapeSquare, isResizingShapeSquare, isRotatingShapeSquare, hoveredFrame, SquarecolorOptions, backgroundColorOptionsSquare, fillStyleOptions, squareStrokeThicknessValue, squareOutlineStyleValue, Rectangle2;
var init_Rectangle = __esm({
  "src/shapes/Rectangle.js"() {
    rc = rough.svg(svg);
    isDraggingShapeSquare = false;
    isResizingShapeSquare = false;
    isRotatingShapeSquare = false;
    hoveredFrame = null;
    SquarecolorOptions = document.querySelectorAll(".squareStrokeSpan");
    backgroundColorOptionsSquare = document.querySelectorAll(".squareBackgroundSpan");
    fillStyleOptions = document.querySelectorAll(".squareFillStyleSpan");
    squareStrokeThicknessValue = document.querySelectorAll(".squareStrokeThickSpan");
    squareOutlineStyleValue = document.querySelectorAll(".squareOutlineStyle");
    Rectangle2 = class {
      constructor(x, y, width, height, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.options = {
          roughness: 1.5,
          stroke: "#fff",
          strokeWidth: 2,
          fill: "transparent",
          fillStyle: "none",
          strokeDasharray: "",
          ...options
        };
        this.element = null;
        this.isSelected = false;
        this.rotation = 0;
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.anchors = [];
        this.rotationAnchor = null;
        this.selectionPadding = 8;
        this.selectionOutline = null;
        this.shapeName = "rectangle";
        this.shapeID = `rectangle-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.group.setAttribute("id", this.shapeID);
        this.label = options.label || "";
        this.labelElement = null;
        this.labelColor = options.labelColor || "#e0e0e0";
        this.labelFontSize = options.labelFontSize || 14;
        this._isEditingLabel = false;
        this._hitArea = null;
        this._labelBg = null;
        this.shadeColor = options.shadeColor || null;
        this.shadeOpacity = options.shadeOpacity !== void 0 ? options.shadeOpacity : 0.15;
        this.shadeDirection = options.shadeDirection || "bottom";
        this._shadeRect = null;
        this._shadeGradient = null;
        if (!this.group.parentNode) {
          svg.appendChild(this.group);
        }
        this._lastDrawn = {
          width: null,
          height: null,
          options: null
        };
        this.isBeingDrawn = false;
        this._setupLabelDblClick();
        this.draw();
      }
      draw() {
        const childrenToRemove = [];
        const preserveSet = this._skipAnchors ? new Set([...this.anchors, this.selectionOutline, this.rotationAnchor].filter(Boolean)) : null;
        for (let i = 0; i < this.group.children.length; i++) {
          const child = this.group.children[i];
          if (child !== this.element && child !== this.labelElement && child !== this._hitArea && child !== this._labelBg && child !== this._shadeRect) {
            if (preserveSet && preserveSet.has(child)) continue;
            childrenToRemove.push(child);
          }
        }
        childrenToRemove.forEach((child) => this.group.removeChild(child));
        const optionsString = JSON.stringify(this.options);
        const isInitialDraw = this.element === null;
        const optionsChanged = optionsString !== this._lastDrawn.options;
        const sizeChanged = this.width !== this._lastDrawn.width || this.height !== this._lastDrawn.height;
        if (isInitialDraw || optionsChanged || !this.isBeingDrawn && sizeChanged) {
          if (this.element && this.element.parentNode === this.group) {
            this.group.removeChild(this.element);
          }
          const roughRect = rc.rectangle(0, 0, this.width, this.height, this.options);
          this.element = roughRect;
          this.group.appendChild(roughRect);
          this._lastDrawn.width = this.width;
          this._lastDrawn.height = this.height;
          this._lastDrawn.options = optionsString;
        }
        if (!this._hitArea) {
          this._hitArea = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          this._hitArea.setAttribute("fill", "transparent");
          this._hitArea.setAttribute("stroke", "none");
          this._hitArea.setAttribute("style", "pointer-events: all;");
          this.group.insertBefore(this._hitArea, this.group.firstChild);
        }
        this._hitArea.setAttribute("x", 0);
        this._hitArea.setAttribute("y", 0);
        this._hitArea.setAttribute("width", this.width);
        this._hitArea.setAttribute("height", this.height);
        this._updateShade();
        this._updateLabelElement();
        const rotateCenterX = this.width / 2;
        const rotateCenterY = this.height / 2;
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y}) rotate(${this.rotation}, ${rotateCenterX}, ${rotateCenterY})`);
        if (this.isSelected) {
          if (this._skipAnchors) {
            this.updateSelectionControls();
          } else {
            this.addAnchors();
          }
        }
        if (!this.group.parentNode) {
          this.updateAttachedArrows();
          svg.appendChild(this.group);
        }
      }
      _updateShade() {
        if (!this.shadeColor) {
          if (this._shadeRect && this._shadeRect.parentNode === this.group) {
            this.group.removeChild(this._shadeRect);
            this._shadeRect = null;
          }
          if (this._shadeGradient && this._shadeGradient.parentNode) {
            this._shadeGradient.parentNode.removeChild(this._shadeGradient);
            this._shadeGradient = null;
          }
          return;
        }
        let defs = svg.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svg.appendChild(defs);
        }
        const gradId = `shade-${this.shapeID}`;
        if (!this._shadeGradient) {
          this._shadeGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
          this._shadeGradient.setAttribute("id", gradId);
          defs.appendChild(this._shadeGradient);
        }
        const dirs = {
          top: { x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          bottom: { x1: "0%", y1: "100%", x2: "0%", y2: "0%" },
          left: { x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
          right: { x1: "100%", y1: "0%", x2: "0%", y2: "0%" }
        };
        const d = dirs[this.shadeDirection] || dirs.bottom;
        this._shadeGradient.setAttribute("x1", d.x1);
        this._shadeGradient.setAttribute("y1", d.y1);
        this._shadeGradient.setAttribute("x2", d.x2);
        this._shadeGradient.setAttribute("y2", d.y2);
        while (this._shadeGradient.firstChild) this._shadeGradient.removeChild(this._shadeGradient.firstChild);
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", this.shadeColor);
        stop1.setAttribute("stop-opacity", this.shadeOpacity);
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", this.shadeColor);
        stop2.setAttribute("stop-opacity", "0");
        this._shadeGradient.appendChild(stop1);
        this._shadeGradient.appendChild(stop2);
        if (!this._shadeRect) {
          this._shadeRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          this._shadeRect.setAttribute("pointer-events", "none");
        }
        this._shadeRect.setAttribute("x", 0);
        this._shadeRect.setAttribute("y", 0);
        this._shadeRect.setAttribute("width", this.width);
        this._shadeRect.setAttribute("height", this.height);
        this._shadeRect.setAttribute("fill", `url(#${gradId})`);
        this._shadeRect.setAttribute("rx", 2);
        if (this._shadeRect.parentNode === this.group) this.group.removeChild(this._shadeRect);
        if (this.element && this.element.nextSibling) {
          this.group.insertBefore(this._shadeRect, this.element.nextSibling);
        } else {
          this.group.appendChild(this._shadeRect);
        }
      }
      _updateLabelElement() {
        if (!this.label) {
          if (this.labelElement && this.labelElement.parentNode === this.group) {
            this.group.removeChild(this.labelElement);
            this.labelElement = null;
          }
          if (this._labelBg && this._labelBg.parentNode === this.group) {
            this.group.removeChild(this._labelBg);
            this._labelBg = null;
          }
          return;
        }
        if (!this.labelElement) {
          this.labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          this.labelElement.setAttribute("class", "shape-label");
          this.labelElement.setAttribute("pointer-events", "none");
        }
        this.labelElement.setAttribute("x", this.width / 2);
        this.labelElement.setAttribute("y", this.height / 2);
        this.labelElement.setAttribute("text-anchor", "middle");
        this.labelElement.setAttribute("dominant-baseline", "central");
        this.labelElement.setAttribute("fill", this.labelColor);
        this.labelElement.setAttribute("font-size", this.labelFontSize);
        this.labelElement.setAttribute("font-family", "lixFont, sans-serif");
        this.labelElement.textContent = this.label;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        if (!this._labelBg) {
          this._labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          this._labelBg.setAttribute("pointer-events", "none");
        }
        this._labelBg.setAttribute("fill", canvasBg);
        const hPadding = 6;
        const vPadding = 2;
        const charWidth = this.labelFontSize * 0.6;
        const bgW = this.label.length * charWidth + hPadding * 2;
        const bgH = this.labelFontSize + vPadding * 2;
        this._labelBg.setAttribute("x", this.width / 2 - bgW / 2);
        this._labelBg.setAttribute("y", this.height / 2 - bgH / 2);
        this._labelBg.setAttribute("width", bgW);
        this._labelBg.setAttribute("height", bgH);
        this._labelBg.setAttribute("rx", 3);
        if (this._labelBg.parentNode === this.group) this.group.removeChild(this._labelBg);
        if (this.labelElement.parentNode === this.group) this.group.removeChild(this.labelElement);
        this.group.appendChild(this._labelBg);
        this.group.appendChild(this.labelElement);
      }
      _setupLabelDblClick() {
        this.group.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.startLabelEdit();
        });
      }
      startLabelEdit() {
        if (this._isEditingLabel) return;
        this._isEditingLabel = true;
        if (this.labelElement) {
          this.labelElement.setAttribute("visibility", "hidden");
        }
        const ctm = this.group.getScreenCTM();
        if (!ctm) {
          this._isEditingLabel = false;
          return;
        }
        const pt1 = svg.createSVGPoint();
        pt1.x = 0;
        pt1.y = 0;
        const screenTL = pt1.matrixTransform(ctm);
        const pt2 = svg.createSVGPoint();
        pt2.x = this.width;
        pt2.y = this.height;
        const screenBR = pt2.matrixTransform(ctm);
        const screenW = Math.abs(screenBR.x - screenTL.x);
        const screenH = Math.abs(screenBR.y - screenTL.y);
        const screenX = Math.min(screenTL.x, screenBR.x);
        const screenY = Math.min(screenTL.y, screenBR.y);
        const overlay = document.createElement("div");
        overlay.className = "shape-label-editor";
        overlay.style.cssText = `
            position: fixed; z-index: 10000;
            left: ${screenX}px; top: ${screenY}px;
            width: ${screenW}px; height: ${screenH}px;
            display: flex; align-items: center; justify-content: center;
            pointer-events: auto;
        `;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        const input = document.createElement("div");
        input.setAttribute("contenteditable", "true");
        input.style.cssText = `
            max-width: ${screenW - 8}px; min-width: 30px; min-height: 20px;
            background: ${canvasBg}; border: none;
            outline: none; padding: 2px 6px;
            color: ${this.labelColor}; font-size: ${Math.max(12, this.labelFontSize * (screenW / Math.max(this.width, 1)))}px;
            font-family: lixFont, sans-serif; text-align: center;
            white-space: pre-wrap; word-break: break-word;
            cursor: text;
        `;
        if (this.label) {
          input.textContent = this.label;
        } else {
          input.innerHTML = "&nbsp;";
        }
        overlay.appendChild(input);
        document.body.appendChild(overlay);
        setTimeout(() => {
          input.focus();
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(input);
          sel.removeAllRanges();
          sel.addRange(range);
        }, 10);
        const finishEdit = () => {
          const newText = input.textContent.trim().replace(/\u00A0/g, "");
          this.label = newText;
          this._isEditingLabel = false;
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (this.labelElement) this.labelElement.setAttribute("visibility", "visible");
          this.draw();
        };
        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            input.blur();
          }
          if (e.key === "Escape") {
            input.textContent = this.label;
            input.blur();
          }
        });
        input.addEventListener("pointerdown", (e) => e.stopPropagation());
        input.addEventListener("pointermove", (e) => e.stopPropagation());
        input.addEventListener("pointerup", (e) => e.stopPropagation());
      }
      setLabel(text, color, fontSize) {
        this.label = text || "";
        if (color) this.labelColor = color;
        if (fontSize) this.labelFontSize = fontSize;
        this.draw();
      }
      setDrawingState(isDrawing3) {
        this.isBeingDrawn = isDrawing3;
      }
      getRotatedCursor(direction, angle) {
        const directions = ["ns", "nesw", "ew", "nwse"];
        angle = angle % 360;
        if (angle < 0) angle += 360;
        const baseDirectionMap = {
          "0": "nwse",
          "1": "nesw",
          "2": "nesw",
          "3": "nwse",
          "4": "ns",
          "5": "ns",
          "6": "ew",
          "7": "ew"
        };
        const baseDirection = baseDirectionMap[direction];
        let effectiveAngle = angle;
        if (baseDirection === "nesw") {
          effectiveAngle += 45;
        } else if (baseDirection === "ew") {
          effectiveAngle += 90;
        } else if (baseDirection === "nwse") {
          effectiveAngle += 135;
        }
        effectiveAngle = effectiveAngle % 360;
        if (effectiveAngle < 0) effectiveAngle += 360;
        const index = Math.round(effectiveAngle / 45) % 4;
        let finalIndex;
        if (effectiveAngle >= 337.5 || effectiveAngle < 22.5) finalIndex = 0;
        else if (effectiveAngle >= 22.5 && effectiveAngle < 67.5) finalIndex = 1;
        else if (effectiveAngle >= 67.5 && effectiveAngle < 112.5) finalIndex = 2;
        else if (effectiveAngle >= 112.5 && effectiveAngle < 157.5) finalIndex = 3;
        else if (effectiveAngle >= 157.5 && effectiveAngle < 202.5) finalIndex = 0;
        else if (effectiveAngle >= 202.5 && effectiveAngle < 247.5) finalIndex = 1;
        else if (effectiveAngle >= 247.5 && effectiveAngle < 292.5) finalIndex = 2;
        else if (effectiveAngle >= 292.5 && effectiveAngle < 337.5) finalIndex = 3;
        else finalIndex = 0;
        return directions[finalIndex];
      }
      addAnchors() {
        const zoom = window.currentZoom || 1;
        const anchorSize = 10 / zoom;
        const anchorStrokeWidth = 2;
        const self = this;
        const expandedX = -this.selectionPadding;
        const expandedY = -this.selectionPadding;
        const expandedWidth = this.width + 2 * this.selectionPadding;
        const expandedHeight = this.height + 2 * this.selectionPadding;
        const positions = [
          { x: expandedX, y: expandedY },
          { x: expandedX + expandedWidth, y: expandedY },
          { x: expandedX, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth / 2, y: expandedY },
          { x: expandedX + expandedWidth / 2, y: expandedY + expandedHeight },
          { x: expandedX, y: expandedHeight / 2 + expandedY },
          { x: expandedX + expandedWidth, y: expandedHeight / 2 + expandedY }
        ];
        const outlinePoints = [
          [positions[0].x, positions[0].y],
          [positions[1].x, positions[1].y],
          [positions[3].x, positions[3].y],
          [positions[2].x, positions[2].y],
          [positions[0].x, positions[0].y]
        ];
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        if (this.rotationAnchor && this.rotationAnchor.parentNode === this.group) {
          this.group.removeChild(this.rotationAnchor);
        }
        if (this.selectionOutline && this.selectionOutline.parentNode === this.group) {
          this.group.removeChild(this.selectionOutline);
        }
        this.anchors = [];
        const anchorDirections = {
          0: "nwse",
          1: "nesw",
          2: "nesw",
          3: "nwse",
          4: "ns",
          5: "ns",
          6: "ew",
          7: "ew"
        };
        positions.forEach((pos, i) => {
          const anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          anchor.setAttribute("x", pos.x - anchorSize / 2);
          anchor.setAttribute("y", pos.y - anchorSize / 2);
          anchor.setAttribute("width", anchorSize);
          anchor.setAttribute("height", anchorSize);
          anchor.setAttribute("class", "anchor");
          anchor.setAttribute("data-index", i);
          anchor.setAttribute("fill", "#121212");
          anchor.setAttribute("stroke", "#5B57D1");
          anchor.setAttribute("stroke-width", anchorStrokeWidth);
          anchor.setAttribute("vector-effect", "non-scaling-stroke");
          anchor.setAttribute("style", "pointer-events: all;");
          anchor.addEventListener("mouseover", function() {
            const index = this.getAttribute("data-index");
            const baseDirection = anchorDirections[index];
            const rotatedCursor = self.getRotatedCursor(index, self.rotation);
            svg.style.cursor = rotatedCursor + "-resize";
          });
          anchor.addEventListener("mouseout", function() {
            if (!isResizingShapeSquare && !isDraggingShapeSquare && !isRotatingShapeSquare) {
              svg.style.cursor = "default";
            }
          });
          this.group.appendChild(anchor);
          this.anchors[i] = anchor;
        });
        const rotationAnchorPos = { x: expandedX + expandedWidth / 2, y: expandedY - 30 / zoom };
        this.rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
        this.rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
        this.rotationAnchor.setAttribute("r", 8 / zoom);
        this.rotationAnchor.setAttribute("class", "rotate-anchor");
        this.rotationAnchor.setAttribute("fill", "#121212");
        this.rotationAnchor.setAttribute("stroke", "#5B57D1");
        this.rotationAnchor.setAttribute("stroke-width", anchorStrokeWidth);
        this.rotationAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        this.rotationAnchor.setAttribute("style", "pointer-events: all;");
        this.group.appendChild(this.rotationAnchor);
        this.rotationAnchor.addEventListener("mouseover", function() {
          if (!isResizingShapeSquare && !isDraggingShapeSquare && !isRotatingShapeSquare) {
            svg.style.cursor = "grab";
          }
        });
        this.rotationAnchor.addEventListener("mouseout", function() {
          if (!isResizingShapeSquare && !isDraggingShapeSquare && !isRotatingShapeSquare) {
            svg.style.cursor = "default";
          }
        });
        const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        outline.setAttribute("points", pointsAttr);
        outline.setAttribute("fill", "none");
        outline.setAttribute("stroke", "#5B57D1");
        outline.setAttribute("stroke-width", 1.5);
        outline.setAttribute("stroke-dasharray", "4 2");
        outline.setAttribute("vector-effect", "non-scaling-stroke");
        outline.setAttribute("style", "pointer-events: none;");
        this.group.appendChild(outline);
        this.selectionOutline = outline;
        disableAllSideBars();
        squareSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("rectangle");
        this.updateSidebar();
      }
      updateSelectionControls() {
        if (!this.selectionOutline || this.anchors.length === 0) return;
        const anchorSize = 10;
        const expandedX = -this.selectionPadding;
        const expandedY = -this.selectionPadding;
        const expandedWidth = this.width + 2 * this.selectionPadding;
        const expandedHeight = this.height + 2 * this.selectionPadding;
        const positions = [
          { x: expandedX, y: expandedY },
          { x: expandedX + expandedWidth, y: expandedY },
          { x: expandedX, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth / 2, y: expandedY },
          { x: expandedX + expandedWidth / 2, y: expandedY + expandedHeight },
          { x: expandedX, y: expandedHeight / 2 + expandedY },
          { x: expandedX + expandedWidth, y: expandedHeight / 2 + expandedY }
        ];
        positions.forEach((pos, i) => {
          if (this.anchors[i]) {
            this.anchors[i].setAttribute("x", pos.x - anchorSize / 2);
            this.anchors[i].setAttribute("y", pos.y - anchorSize / 2);
          }
        });
        const outlinePoints = [
          [positions[0].x, positions[0].y],
          [positions[1].x, positions[1].y],
          [positions[3].x, positions[3].y],
          [positions[2].x, positions[2].y],
          [positions[0].x, positions[0].y]
        ];
        this.selectionOutline.setAttribute("points", outlinePoints.map((p) => p.join(",")).join(" "));
        if (this.rotationAnchor) {
          this.rotationAnchor.setAttribute("cx", expandedX + expandedWidth / 2);
          this.rotationAnchor.setAttribute("cy", expandedY - 30);
        }
      }
      removeSelection() {
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        if (this.rotationAnchor && this.rotationAnchor.parentNode === this.group) {
          this.group.removeChild(this.rotationAnchor);
        }
        if (this.selectionOutline && this.selectionOutline.parentNode === this.group) {
          this.group.removeChild(this.selectionOutline);
        }
        this.anchors = [];
        this.rotationAnchor = null;
        this.selectionOutline = null;
        this.isSelected = false;
      }
      contains(x, y) {
        if (!this.element) return false;
        const CTM = this.group.getCTM();
        if (!CTM) return false;
        const inverseCTM = CTM.inverse();
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        const transformedPoint = svgPoint.matrixTransform(inverseCTM);
        const tolerance = 5;
        return transformedPoint.x >= -tolerance && transformedPoint.x <= this.width + tolerance && transformedPoint.y >= -tolerance && transformedPoint.y <= this.height + tolerance;
      }
      // Helper to check if a point is near an anchor
      isNearAnchor(x, y) {
        if (!this.isSelected) return null;
        const buffer = 10;
        const anchorSize = 10;
        for (let i = 0; i < this.anchors.length; i++) {
          const anchor = this.anchors[i];
          const anchorLocalX = parseFloat(anchor.getAttribute("x")) + anchorSize / 2;
          const anchorLocalY = parseFloat(anchor.getAttribute("y")) + anchorSize / 2;
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = anchorLocalX;
          svgPoint.y = anchorLocalY;
          const transformedPoint = svgPoint.matrixTransform(this.group.getCTM());
          const anchorLeft = transformedPoint.x - anchorSize / 2 - buffer;
          const anchorRight = transformedPoint.x + anchorSize / 2 + buffer;
          const anchorTop = transformedPoint.y - anchorSize / 2 - buffer;
          const anchorBottom = transformedPoint.y + anchorSize / 2 + buffer;
          if (x >= anchorLeft && x <= anchorRight && y >= anchorTop && y <= anchorBottom) {
            return { type: "resize", index: i };
          }
        }
        if (this.rotationAnchor) {
          const rotateAnchorLocalX = parseFloat(this.rotationAnchor.getAttribute("cx"));
          const rotateAnchorLocalY = parseFloat(this.rotationAnchor.getAttribute("cy"));
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = rotateAnchorLocalX;
          svgPoint.y = rotateAnchorLocalY;
          const transformedPoint = svgPoint.matrixTransform(this.group.getCTM());
          const rotateAnchorRadius = parseFloat(this.rotationAnchor.getAttribute("r"));
          const distSq = (x - transformedPoint.x) ** 2 + (y - transformedPoint.y) ** 2;
          if (distSq <= (rotateAnchorRadius + buffer) ** 2) {
            return { type: "rotate" };
          }
        }
        return null;
      }
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        const rotateCenterX = this.width / 2;
        const rotateCenterY = this.height / 2;
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y}) rotate(${this.rotation}, ${rotateCenterX}, ${rotateCenterY})`);
        this.updateAttachedArrows();
        if (isDraggingShapeSquare && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        shapes.forEach((shape) => {
          if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
            targetFrame = shape;
          }
        });
        if (this.parentFrame && isDraggingShapeSquare) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrame && hoveredFrame !== targetFrame) {
          hoveredFrame.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrame) {
          targetFrame.highlightFrame();
        }
        hoveredFrame = targetFrame;
      }
      updatePosition(anchorIndex, newMouseX, newMouseY) {
        const CTM = this.group.getCTM();
        if (!CTM) return;
        const inverseCTM = CTM.inverse();
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = newMouseX;
        svgPoint.y = newMouseY;
        const localMouse = svgPoint.matrixTransform(inverseCTM);
        const oldW = this.width;
        const oldH = this.height;
        let fixedOldX, fixedOldY, rawW, rawH;
        switch (anchorIndex) {
          case 0:
            fixedOldX = oldW;
            fixedOldY = oldH;
            rawW = oldW - localMouse.x;
            rawH = oldH - localMouse.y;
            break;
          case 1:
            fixedOldX = 0;
            fixedOldY = oldH;
            rawW = localMouse.x;
            rawH = oldH - localMouse.y;
            break;
          case 2:
            fixedOldX = oldW;
            fixedOldY = 0;
            rawW = oldW - localMouse.x;
            rawH = localMouse.y;
            break;
          case 3:
            fixedOldX = 0;
            fixedOldY = 0;
            rawW = localMouse.x;
            rawH = localMouse.y;
            break;
          case 4:
            fixedOldX = 0;
            fixedOldY = oldH;
            rawW = oldW;
            rawH = oldH - localMouse.y;
            break;
          case 5:
            fixedOldX = 0;
            fixedOldY = 0;
            rawW = oldW;
            rawH = localMouse.y;
            break;
          case 6:
            fixedOldX = oldW;
            fixedOldY = 0;
            rawW = oldW - localMouse.x;
            rawH = oldH;
            break;
          case 7:
            fixedOldX = 0;
            fixedOldY = 0;
            rawW = localMouse.x;
            rawH = oldH;
            break;
        }
        const fp = svg.createSVGPoint();
        fp.x = fixedOldX;
        fp.y = fixedOldY;
        const fixedWorld = fp.matrixTransform(CTM);
        const newW = Math.abs(rawW);
        const newH = Math.abs(rawH);
        const fixedNewX = fixedOldX === 0 ? rawW >= 0 ? 0 : newW : rawW >= 0 ? newW : 0;
        const fixedNewY = fixedOldY === 0 ? rawH >= 0 ? 0 : newH : rawH >= 0 ? newH : 0;
        const rad = this.rotation * Math.PI / 180;
        const cosR = Math.cos(rad);
        const sinR = Math.sin(rad);
        const ncx = newW / 2;
        const ncy = newH / 2;
        const dx = fixedNewX - ncx;
        const dy = fixedNewY - ncy;
        const rotX = ncx + dx * cosR - dy * sinR;
        const rotY = ncy + dx * sinR + dy * cosR;
        this.x = fixedWorld.x - rotX;
        this.y = fixedWorld.y - rotY;
        this.width = newW;
        this.height = newH;
        this.updateAttachedArrows();
      }
      updateAttachedArrows() {
        shapes.forEach((shape) => {
          if (shape && shape.shapeName === "arrow" && typeof shape.updateAttachments === "function") {
            if (shape.attachedToStart && shape.attachedToStart.shape === this || shape.attachedToEnd && shape.attachedToEnd.shape === this) {
              shape.updateAttachments();
            }
          }
        });
      }
      rotate(angle) {
        angle = angle % 360;
        if (angle < 0) angle += 360;
        this.rotation = angle;
      }
      // Method to update the sidebar based on the shape's current options
      // No-op: React sidebar handles UI updates via Zustand store
      updateSidebar() {
      }
    };
  }
});

// src/shapes/Circle.js
var Circle_exports = {};
__export(Circle_exports, {
  Circle: () => Circle2
});
var rc2, isDraggingShapeCircle, isResizingShapeCircle, isRotatingShapeCircle, hoveredFrameCircle, colorOptionsCircle, backgroundColorOptionsCircle, fillStyleOptionsCircle, strokeThicknessValueCircle, outlineStyleValueCircle, Circle2;
var init_Circle = __esm({
  "src/shapes/Circle.js"() {
    rc2 = rough.svg(svg);
    isDraggingShapeCircle = false;
    isResizingShapeCircle = false;
    isRotatingShapeCircle = false;
    hoveredFrameCircle = null;
    colorOptionsCircle = document.querySelectorAll(".circleStrokeSpan");
    backgroundColorOptionsCircle = document.querySelectorAll(".circleBackgroundSpan");
    fillStyleOptionsCircle = document.querySelectorAll(".circleFillStyleSpan");
    strokeThicknessValueCircle = document.querySelectorAll(".circleStrokeThickSpan");
    outlineStyleValueCircle = document.querySelectorAll(".circleOutlineStyle");
    Circle2 = class {
      constructor(x, y, rx, ry, options = {}) {
        this.x = x;
        this.y = y;
        this.rx = rx;
        this.ry = ry;
        this.options = {
          roughness: 1.5,
          stroke: "#fff",
          strokeWidth: 2,
          fill: "transparent",
          fillStyle: "none",
          strokeDasharray: "",
          ...options
        };
        this.element = null;
        this.isSelected = false;
        this.rotation = 0;
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.anchors = [];
        this.rotationAnchor = null;
        this.selectionPadding = 8;
        this.selectionOutline = null;
        this.shapeName = "circle";
        this.shapeID = `circle-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.group.setAttribute("id", this.shapeID);
        this.parentFrame = null;
        this.label = options.label || "";
        this.labelElement = null;
        this.labelColor = options.labelColor || "#e0e0e0";
        this.labelFontSize = options.labelFontSize || 14;
        this._isEditingLabel = false;
        this._hitArea = null;
        this._labelBg = null;
        this.shadeColor = options.shadeColor || null;
        this.shadeOpacity = options.shadeOpacity !== void 0 ? options.shadeOpacity : 0.15;
        this.shadeDirection = options.shadeDirection || "bottom";
        this._shadeEllipse = null;
        this._shadeGradient = null;
        if (!this.group.parentNode) {
          svg.appendChild(this.group);
        }
        this._lastDrawn = {
          width: null,
          height: null,
          options: null
        };
        this._setupLabelDblClick();
        this.draw();
      }
      // Add width and height properties for frame compatibility
      get width() {
        return this.rx * 2;
      }
      set width(value) {
        this.rx = value / 2;
      }
      get height() {
        return this.ry * 2;
      }
      set height(value) {
        this.ry = value / 2;
      }
      draw() {
        const childrenToRemove = [];
        const preserveSet = this._skipAnchors ? new Set([...this.anchors, this.selectionOutline, this.rotationAnchor].filter(Boolean)) : null;
        for (let i = 0; i < this.group.children.length; i++) {
          const child = this.group.children[i];
          if (child !== this.element && child !== this.labelElement && child !== this._hitArea && child !== this._labelBg && child !== this._shadeEllipse) {
            if (preserveSet && preserveSet.has(child)) continue;
            childrenToRemove.push(child);
          }
        }
        childrenToRemove.forEach((child) => this.group.removeChild(child));
        const optionsString = JSON.stringify(this.options);
        const isInitialDraw = this.element === null;
        const sizeChanged = this.rx !== this._lastDrawn.rx || this.ry !== this._lastDrawn.ry;
        const optionsChanged = optionsString !== this._lastDrawn.options;
        if (isInitialDraw || optionsChanged || sizeChanged) {
          if (this.element && this.element.parentNode === this.group) {
            this.group.removeChild(this.element);
          }
          const roughEllipse = rc2.ellipse(0, 0, this.rx * 2, this.ry * 2, this.options);
          this.element = roughEllipse;
          this.group.appendChild(roughEllipse);
          this._lastDrawn.rx = this.rx;
          this._lastDrawn.ry = this.ry;
          this._lastDrawn.options = optionsString;
        }
        if (!this._hitArea) {
          this._hitArea = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
          this._hitArea.setAttribute("fill", "transparent");
          this._hitArea.setAttribute("stroke", "none");
          this._hitArea.setAttribute("style", "pointer-events: all;");
          this.group.insertBefore(this._hitArea, this.group.firstChild);
        }
        this._hitArea.setAttribute("cx", 0);
        this._hitArea.setAttribute("cy", 0);
        this._hitArea.setAttribute("rx", this.rx);
        this._hitArea.setAttribute("ry", this.ry);
        this._updateShade();
        this._updateLabelElement();
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y}) rotate(${this.rotation}, 0, 0)`);
        if (this.isSelected) {
          if (this._skipAnchors) {
            this.updateSelectionControls();
          } else {
            this.addAnchors();
          }
        }
        if (!this.group.parentNode) {
          svg.appendChild(this.group);
        }
      }
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y}) rotate(${this.rotation}, 0, 0)`);
        this.updateAttachedArrows();
        if (isDraggingShapeCircle && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        shapes.forEach((shape) => {
          if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
            targetFrame = shape;
          }
        });
        if (this.parentFrame && isDraggingShapeCircle) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrameCircle && hoveredFrameCircle !== targetFrame) {
          hoveredFrameCircle.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrameCircle) {
          targetFrame.highlightFrame();
        }
        hoveredFrameCircle = targetFrame;
      }
      getRotatedCursor(direction, angle) {
        const directions = ["ns", "nesw", "ew", "nwse"];
        angle = angle % 360;
        if (angle < 0) angle += 360;
        const baseDirectionMap = {
          "0": "nwse",
          "1": "nesw",
          "2": "nesw",
          "3": "nwse",
          "4": "ns",
          "5": "ns",
          "6": "ew",
          "7": "ew"
        };
        const baseDirection = baseDirectionMap[direction];
        let effectiveAngle = angle;
        if (baseDirection === "nesw") {
          effectiveAngle += 45;
        } else if (baseDirection === "ew") {
          effectiveAngle += 90;
        } else if (baseDirection === "nwse") {
          effectiveAngle += 135;
        }
        effectiveAngle = effectiveAngle % 360;
        if (effectiveAngle < 0) effectiveAngle += 360;
        const index = Math.round(effectiveAngle / 45) % 4;
        let finalIndex;
        if (effectiveAngle >= 337.5 || effectiveAngle < 22.5) finalIndex = 0;
        else if (effectiveAngle >= 22.5 && effectiveAngle < 67.5) finalIndex = 1;
        else if (effectiveAngle >= 67.5 && effectiveAngle < 112.5) finalIndex = 2;
        else if (effectiveAngle >= 112.5 && effectiveAngle < 157.5) finalIndex = 3;
        else if (effectiveAngle >= 157.5 && effectiveAngle < 202.5) finalIndex = 0;
        else if (effectiveAngle >= 202.5 && effectiveAngle < 247.5) finalIndex = 1;
        else if (effectiveAngle >= 247.5 && effectiveAngle < 292.5) finalIndex = 2;
        else if (effectiveAngle >= 292.5 && effectiveAngle < 337.5) finalIndex = 3;
        else finalIndex = 0;
        return directions[finalIndex];
      }
      addAnchors() {
        const zoom = window.currentZoom || 1;
        const anchorSize = 10 / zoom;
        const anchorStrokeWidth = 2;
        const self = this;
        const expandedX = -this.rx - this.selectionPadding;
        const expandedY = -this.ry - this.selectionPadding;
        const expandedWidth = this.rx * 2 + 2 * this.selectionPadding;
        const expandedHeight = this.ry * 2 + 2 * this.selectionPadding;
        const positions = [
          { x: expandedX, y: expandedY },
          { x: expandedX + expandedWidth, y: expandedY },
          { x: expandedX, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth / 2, y: expandedY },
          { x: expandedX + expandedWidth / 2, y: expandedY + expandedHeight },
          { x: expandedX, y: expandedHeight / 2 + expandedY },
          { x: expandedX + expandedWidth, y: expandedHeight / 2 + expandedY }
        ];
        const outlinePoints = [
          [positions[0].x, positions[0].y],
          [positions[1].x, positions[1].y],
          [positions[3].x, positions[3].y],
          [positions[2].x, positions[2].y],
          [positions[0].x, positions[0].y]
        ];
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        if (this.rotationAnchor && this.rotationAnchor.parentNode === this.group) {
          this.group.removeChild(this.rotationAnchor);
        }
        if (this.selectionOutline && this.selectionOutline.parentNode === this.group) {
          this.group.removeChild(this.selectionOutline);
        }
        this.anchors = [];
        const anchorDirections = {
          0: "nwse",
          1: "nesw",
          2: "nesw",
          3: "nwse",
          4: "ns",
          5: "ns",
          6: "ew",
          7: "ew"
        };
        positions.forEach((pos, i) => {
          const anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          anchor.setAttribute("x", pos.x - anchorSize / 2);
          anchor.setAttribute("y", pos.y - anchorSize / 2);
          anchor.setAttribute("width", anchorSize);
          anchor.setAttribute("height", anchorSize);
          anchor.setAttribute("class", "anchor");
          anchor.setAttribute("data-index", i);
          anchor.setAttribute("fill", "#121212");
          anchor.setAttribute("stroke", "#5B57D1");
          anchor.setAttribute("stroke-width", anchorStrokeWidth);
          anchor.setAttribute("vector-effect", "non-scaling-stroke");
          anchor.setAttribute("style", "pointer-events: all;");
          anchor.addEventListener("mouseover", function() {
            const index = this.getAttribute("data-index");
            const baseDirection = anchorDirections[index];
            const rotatedCursor = self.getRotatedCursor(index, self.rotation);
            svg.style.cursor = rotatedCursor + "-resize";
          });
          anchor.addEventListener("mouseout", function() {
            if (!isResizingShapeCircle && !isDraggingShapeCircle && !isRotatingShapeCircle) {
              svg.style.cursor = "default";
            }
          });
          this.group.appendChild(anchor);
          this.anchors[i] = anchor;
        });
        const rotationAnchorPos = { x: expandedX + expandedWidth / 2, y: expandedY - 30 / zoom };
        this.rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
        this.rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
        this.rotationAnchor.setAttribute("r", 8 / zoom);
        this.rotationAnchor.setAttribute("class", "rotate-anchor");
        this.rotationAnchor.setAttribute("fill", "#121212");
        this.rotationAnchor.setAttribute("stroke", "#5B57D1");
        this.rotationAnchor.setAttribute("stroke-width", anchorStrokeWidth);
        this.rotationAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        this.rotationAnchor.setAttribute("style", "pointer-events: all;");
        this.group.appendChild(this.rotationAnchor);
        this.rotationAnchor.addEventListener("mouseover", function() {
          if (!isResizingShapeCircle && !isDraggingShapeCircle && !isRotatingShapeCircle) {
            svg.style.cursor = "grab";
          }
        });
        this.rotationAnchor.addEventListener("mouseout", function() {
          if (!isResizingShapeCircle && !isDraggingShapeCircle && !isRotatingShapeCircle) {
            svg.style.cursor = "default";
          }
        });
        const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        outline.setAttribute("points", pointsAttr);
        outline.setAttribute("fill", "none");
        outline.setAttribute("stroke", "#5B57D1");
        outline.setAttribute("stroke-width", 1.5);
        outline.setAttribute("vector-effect", "non-scaling-stroke");
        outline.setAttribute("stroke-dasharray", "4 2");
        outline.setAttribute("style", "pointer-events: none;");
        this.group.appendChild(outline);
        this.selectionOutline = outline;
        disableAllSideBars();
        circleSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("circle");
        this.updateSidebar();
      }
      updateSelectionControls() {
        if (!this.selectionOutline || this.anchors.length === 0) return;
        const anchorSize = 10;
        const expandedX = -this.rx - this.selectionPadding;
        const expandedY = -this.ry - this.selectionPadding;
        const expandedWidth = this.rx * 2 + 2 * this.selectionPadding;
        const expandedHeight = this.ry * 2 + 2 * this.selectionPadding;
        const positions = [
          { x: expandedX, y: expandedY },
          { x: expandedX + expandedWidth, y: expandedY },
          { x: expandedX, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight },
          { x: expandedX + expandedWidth / 2, y: expandedY },
          { x: expandedX + expandedWidth / 2, y: expandedY + expandedHeight },
          { x: expandedX, y: expandedHeight / 2 + expandedY },
          { x: expandedX + expandedWidth, y: expandedHeight / 2 + expandedY }
        ];
        positions.forEach((pos, i) => {
          if (this.anchors[i]) {
            this.anchors[i].setAttribute("x", pos.x - anchorSize / 2);
            this.anchors[i].setAttribute("y", pos.y - anchorSize / 2);
          }
        });
        const outlinePoints = [
          [positions[0].x, positions[0].y],
          [positions[1].x, positions[1].y],
          [positions[3].x, positions[3].y],
          [positions[2].x, positions[2].y],
          [positions[0].x, positions[0].y]
        ];
        this.selectionOutline.setAttribute("points", outlinePoints.map((p) => p.join(",")).join(" "));
        if (this.rotationAnchor) {
          this.rotationAnchor.setAttribute("cx", expandedX + expandedWidth / 2);
          this.rotationAnchor.setAttribute("cy", expandedY - 30);
        }
      }
      removeSelection() {
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        if (this.rotationAnchor && this.rotationAnchor.parentNode === this.group) {
          this.group.removeChild(this.rotationAnchor);
        }
        if (this.selectionOutline && this.selectionOutline.parentNode === this.group) {
          this.group.removeChild(this.selectionOutline);
        }
        this.anchors = [];
        this.rotationAnchor = null;
        this.selectionOutline = null;
        this.isSelected = false;
      }
      contains(x, y) {
        if (!this.element) return false;
        const CTM = this.group.getCTM();
        if (!CTM) return false;
        const inverseCTM = CTM.inverse();
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        const transformedPoint = svgPoint.matrixTransform(inverseCTM);
        const dx = transformedPoint.x - 0;
        const dy = transformedPoint.y - 0;
        const rx = this.rx;
        const ry = this.ry;
        return dx * dx / (rx * rx) + dy * dy / (ry * ry) <= 1.05;
      }
      isNearAnchor(x, y) {
        if (!this.isSelected) return null;
        const buffer = 10 / currentZoom;
        const anchorSize = 10 / currentZoom;
        for (let i = 0; i < this.anchors.length; i++) {
          const anchor = this.anchors[i];
          const anchorLocalX = parseFloat(anchor.getAttribute("x")) + anchorSize / 2;
          const anchorLocalY = parseFloat(anchor.getAttribute("y")) + anchorSize / 2;
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = anchorLocalX;
          svgPoint.y = anchorLocalY;
          const transformedPoint = svgPoint.matrixTransform(this.group.getCTM());
          const anchorLeft = transformedPoint.x - anchorSize / 2 - buffer;
          const anchorRight = transformedPoint.x + anchorSize / 2 + buffer;
          const anchorTop = transformedPoint.y - anchorSize / 2 - buffer;
          const anchorBottom = transformedPoint.y + anchorSize / 2 + buffer;
          if (x >= anchorLeft && x <= anchorRight && y >= anchorTop && y <= anchorBottom) {
            return { type: "resize", index: i };
          }
        }
        if (this.rotationAnchor) {
          const rotateAnchorLocalX = parseFloat(this.rotationAnchor.getAttribute("cx"));
          const rotateAnchorLocalY = parseFloat(this.rotationAnchor.getAttribute("cy"));
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = rotateAnchorLocalX;
          svgPoint.y = rotateAnchorLocalY;
          const transformedPoint = svgPoint.matrixTransform(this.group.getCTM());
          const rotateAnchorRadius = parseFloat(this.rotationAnchor.getAttribute("r")) / currentZoom;
          const distSq = (x - transformedPoint.x) ** 2 + (y - transformedPoint.y) ** 2;
          if (distSq <= (rotateAnchorRadius + buffer) ** 2) {
            return { type: "rotate" };
          }
        }
        return null;
      }
      updatePosition(anchorIndex, newMouseX, newMouseY) {
        const CTM = this.group.getCTM();
        if (!CTM) return;
        const inverseCTM = CTM.inverse();
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = newMouseX;
        svgPoint.y = newMouseY;
        const transformedPoint = svgPoint.matrixTransform(inverseCTM);
        const dx = transformedPoint.x;
        const dy = transformedPoint.y;
        const MIN_RADIUS = 10;
        switch (anchorIndex) {
          case 0:
          // top-left
          case 1:
          // top-right
          case 2:
          // bottom-left
          case 3:
            this.rx = Math.max(Math.abs(dx), MIN_RADIUS);
            this.ry = Math.max(Math.abs(dy), MIN_RADIUS);
            break;
          case 4:
          // top-center
          case 5:
            this.ry = Math.max(Math.abs(dy), MIN_RADIUS);
            break;
          case 6:
          // left-center
          case 7:
            this.rx = Math.max(Math.abs(dx), MIN_RADIUS);
            break;
        }
        this.updateAttachedArrows();
      }
      updateAttachedArrows() {
        shapes.forEach((shape) => {
          if (shape && shape.shapeName === "arrow" && typeof shape.updateAttachments === "function") {
            if (shape.attachedToStart && shape.attachedToStart.shape === this || shape.attachedToEnd && shape.attachedToEnd.shape === this) {
              shape.updateAttachments();
            }
          }
        });
      }
      _updateShade() {
        if (!this.shadeColor) {
          if (this._shadeEllipse && this._shadeEllipse.parentNode === this.group) {
            this.group.removeChild(this._shadeEllipse);
            this._shadeEllipse = null;
          }
          if (this._shadeGradient && this._shadeGradient.parentNode) {
            this._shadeGradient.parentNode.removeChild(this._shadeGradient);
            this._shadeGradient = null;
          }
          return;
        }
        let defs = svg.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svg.appendChild(defs);
        }
        const gradId = `shade-${this.shapeID}`;
        if (!this._shadeGradient) {
          this._shadeGradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
          this._shadeGradient.setAttribute("id", gradId);
          defs.appendChild(this._shadeGradient);
        }
        this._shadeGradient.setAttribute("cx", "50%");
        this._shadeGradient.setAttribute("cy", "50%");
        this._shadeGradient.setAttribute("r", "50%");
        while (this._shadeGradient.firstChild) this._shadeGradient.removeChild(this._shadeGradient.firstChild);
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", this.shadeColor);
        stop1.setAttribute("stop-opacity", this.shadeOpacity);
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", this.shadeColor);
        stop2.setAttribute("stop-opacity", "0");
        this._shadeGradient.appendChild(stop1);
        this._shadeGradient.appendChild(stop2);
        if (!this._shadeEllipse) {
          this._shadeEllipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
          this._shadeEllipse.setAttribute("pointer-events", "none");
        }
        this._shadeEllipse.setAttribute("cx", 0);
        this._shadeEllipse.setAttribute("cy", 0);
        this._shadeEllipse.setAttribute("rx", this.rx);
        this._shadeEllipse.setAttribute("ry", this.ry);
        this._shadeEllipse.setAttribute("fill", `url(#${gradId})`);
        if (this._shadeEllipse.parentNode === this.group) this.group.removeChild(this._shadeEllipse);
        if (this.element && this.element.nextSibling) {
          this.group.insertBefore(this._shadeEllipse, this.element.nextSibling);
        } else {
          this.group.appendChild(this._shadeEllipse);
        }
      }
      _updateLabelElement() {
        if (!this.label) {
          if (this.labelElement && this.labelElement.parentNode === this.group) {
            this.group.removeChild(this.labelElement);
            this.labelElement = null;
          }
          if (this._labelBg && this._labelBg.parentNode === this.group) {
            this.group.removeChild(this._labelBg);
            this._labelBg = null;
          }
          return;
        }
        if (!this.labelElement) {
          this.labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          this.labelElement.setAttribute("class", "shape-label");
          this.labelElement.setAttribute("pointer-events", "none");
        }
        this.labelElement.setAttribute("x", 0);
        this.labelElement.setAttribute("y", 0);
        this.labelElement.setAttribute("text-anchor", "middle");
        this.labelElement.setAttribute("dominant-baseline", "central");
        this.labelElement.setAttribute("fill", this.labelColor);
        this.labelElement.setAttribute("font-size", this.labelFontSize);
        this.labelElement.setAttribute("font-family", "lixFont, sans-serif");
        this.labelElement.textContent = this.label;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        if (!this._labelBg) {
          this._labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          this._labelBg.setAttribute("pointer-events", "none");
        }
        this._labelBg.setAttribute("fill", canvasBg);
        const hPadding = 6;
        const vPadding = 2;
        const charWidth = this.labelFontSize * 0.6;
        const bgW = this.label.length * charWidth + hPadding * 2;
        const bgH = this.labelFontSize + vPadding * 2;
        this._labelBg.setAttribute("x", -bgW / 2);
        this._labelBg.setAttribute("y", -bgH / 2);
        this._labelBg.setAttribute("width", bgW);
        this._labelBg.setAttribute("height", bgH);
        this._labelBg.setAttribute("rx", 3);
        if (this._labelBg.parentNode === this.group) this.group.removeChild(this._labelBg);
        if (this.labelElement.parentNode === this.group) this.group.removeChild(this.labelElement);
        this.group.appendChild(this._labelBg);
        this.group.appendChild(this.labelElement);
      }
      _setupLabelDblClick() {
        this.group.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.startLabelEdit();
        });
      }
      startLabelEdit() {
        if (this._isEditingLabel) return;
        this._isEditingLabel = true;
        if (this.labelElement) {
          this.labelElement.setAttribute("visibility", "hidden");
        }
        const ctm = this.group.getScreenCTM();
        if (!ctm) {
          this._isEditingLabel = false;
          return;
        }
        const pt1 = svg.createSVGPoint();
        pt1.x = -this.rx;
        pt1.y = -this.ry;
        const screenTL = pt1.matrixTransform(ctm);
        const pt2 = svg.createSVGPoint();
        pt2.x = this.rx;
        pt2.y = this.ry;
        const screenBR = pt2.matrixTransform(ctm);
        const screenW = Math.abs(screenBR.x - screenTL.x);
        const screenH = Math.abs(screenBR.y - screenTL.y);
        const screenX = Math.min(screenTL.x, screenBR.x);
        const screenY = Math.min(screenTL.y, screenBR.y);
        const overlay = document.createElement("div");
        overlay.className = "shape-label-editor";
        overlay.style.cssText = `
            position: fixed; z-index: 10000;
            left: ${screenX}px; top: ${screenY}px;
            width: ${screenW}px; height: ${screenH}px;
            display: flex; align-items: center; justify-content: center;
            pointer-events: auto;
        `;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        const input = document.createElement("div");
        input.setAttribute("contenteditable", "true");
        input.style.cssText = `
            max-width: ${screenW - 8}px; min-width: 30px; min-height: 20px;
            background: ${canvasBg}; border: none;
            outline: none; padding: 2px 6px;
            color: ${this.labelColor}; font-size: ${Math.max(12, this.labelFontSize * (screenW / Math.max(this.rx * 2, 1)))}px;
            font-family: lixFont, sans-serif; text-align: center;
            white-space: pre-wrap; word-break: break-word;
            cursor: text;
        `;
        if (this.label) {
          input.textContent = this.label;
        } else {
          input.innerHTML = "&nbsp;";
        }
        overlay.appendChild(input);
        document.body.appendChild(overlay);
        setTimeout(() => {
          input.focus();
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(input);
          sel.removeAllRanges();
          sel.addRange(range);
        }, 10);
        const finishEdit = () => {
          const newText = input.textContent.trim().replace(/\u00A0/g, "");
          this.label = newText;
          this._isEditingLabel = false;
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (this.labelElement) this.labelElement.setAttribute("visibility", "visible");
          this.draw();
        };
        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            input.blur();
          }
          if (e.key === "Escape") {
            input.textContent = this.label;
            input.blur();
          }
        });
        input.addEventListener("pointerdown", (e) => e.stopPropagation());
        input.addEventListener("pointermove", (e) => e.stopPropagation());
        input.addEventListener("pointerup", (e) => e.stopPropagation());
      }
      setLabel(text, color, fontSize) {
        this.label = text || "";
        if (color) this.labelColor = color;
        if (fontSize) this.labelFontSize = fontSize;
        this.draw();
      }
      rotate(angle) {
        angle = angle % 360;
        if (angle < 0) angle += 360;
        this.rotation = angle;
      }
      // No-op: React sidebar handles UI updates via Zustand store
      updateSidebar() {
      }
    };
  }
});

// src/shapes/Arrow.js
var Arrow_exports = {};
__export(Arrow_exports, {
  Arrow: () => Arrow2
});
function getSVGCoordsFromMouse(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
var isDragging, hoveredFrameArrow, dragOldPosArrow, Arrow2;
var init_Arrow = __esm({
  "src/shapes/Arrow.js"() {
    isDragging = false;
    hoveredFrameArrow = null;
    dragOldPosArrow = null;
    Arrow2 = class _Arrow {
      constructor(startPoint2, endPoint, options = {}) {
        this.startPoint = startPoint2;
        this.endPoint = endPoint;
        this.options = {
          stroke: options.stroke || "#fff",
          strokeWidth: options.strokeWidth || 2,
          strokeDasharray: options.arrowOutlineStyle === "dashed" ? "10,10" : options.arrowOutlineStyle === "dotted" ? "2,8" : "",
          fill: "none",
          ...options
        };
        this.arrowOutlineStyle = options.arrowOutlineStyle || "solid";
        this.arrowHeadStyle = options.arrowHeadStyle || "default";
        this.arrowHeadLength = parseFloat(options.arrowHeadLength || 15);
        this.arrowHeadAngleDeg = parseFloat(options.arrowHeadAngleDeg || 30);
        this.arrowCurved = options.arrowCurved !== void 0 ? options.arrowCurved : "straight";
        this.arrowCurveAmount = options.arrowCurveAmount || 50;
        this.controlPoint1 = options.controlPoint1 || null;
        this.controlPoint2 = options.controlPoint2 || null;
        this.attachedToStart = null;
        this.attachedToEnd = null;
        this.parentFrame = null;
        this.element = null;
        this.elbowX = options.elbowX !== void 0 ? options.elbowX : null;
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.isSelected = false;
        this.anchors = [];
        this.shapeName = "arrow";
        this.shapeID = `arrow-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.group.setAttribute("id", this.shapeID);
        this.label = options.label || "";
        this.labelElement = null;
        this.labelColor = options.labelColor || "#e0e0e0";
        this.labelFontSize = options.labelFontSize || 12;
        this._isEditingLabel = false;
        this._hitArea = null;
        this._labelBg = null;
        if (this.arrowCurved === "curved" && !this.controlPoint1 && !this.controlPoint2) {
          this.initializeCurveControlPoints();
        }
        svg.appendChild(this.group);
        this._setupLabelDblClick();
        this.draw();
      }
      get x() {
        return Math.min(this.startPoint.x, this.endPoint.x);
      }
      set x(value) {
        const currentX = this.x;
        const dx = value - currentX;
        this.startPoint.x += dx;
        this.endPoint.x += dx;
        if (this.controlPoint1) this.controlPoint1.x += dx;
        if (this.controlPoint2) this.controlPoint2.x += dx;
      }
      get y() {
        return Math.min(this.startPoint.y, this.endPoint.y);
      }
      set y(value) {
        const currentY = this.y;
        const dy = value - currentY;
        this.startPoint.y += dy;
        this.endPoint.y += dy;
        if (this.controlPoint1) this.controlPoint1.y += dy;
        if (this.controlPoint2) this.controlPoint2.y += dy;
      }
      get width() {
        return Math.abs(this.endPoint.x - this.startPoint.x);
      }
      set width(value) {
        const centerX = (this.startPoint.x + this.endPoint.x) / 2;
        const halfWidth = value / 2;
        this.startPoint.x = centerX - halfWidth;
        this.endPoint.x = centerX + halfWidth;
      }
      get height() {
        return Math.abs(this.endPoint.y - this.startPoint.y);
      }
      set height(value) {
        const centerY = (this.startPoint.y + this.endPoint.y) / 2;
        const halfHeight = value / 2;
        this.startPoint.y = centerY - halfHeight;
        this.endPoint.y = centerY + halfHeight;
      }
      initializeCurveControlPoints() {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const distance2 = Math.sqrt(dx * dx + dy * dy);
        if (distance2 === 0 || isNaN(distance2)) {
          this.controlPoint1 = { x: this.startPoint.x + 20, y: this.startPoint.y };
          this.controlPoint2 = { x: this.endPoint.x - 20, y: this.endPoint.y };
          return;
        }
        const perpX = -dy / distance2;
        const perpY = dx / distance2;
        const curveOffset = this.arrowCurveAmount;
        const t1 = 0.33;
        const point1X = this.startPoint.x + t1 * dx;
        const point1Y = this.startPoint.y + t1 * dy;
        this.controlPoint1 = {
          x: point1X + perpX * curveOffset,
          y: point1Y + perpY * curveOffset
        };
        const t2 = 0.67;
        const point2X = this.startPoint.x + t2 * dx;
        const point2Y = this.startPoint.y + t2 * dy;
        this.controlPoint2 = {
          x: point2X - perpX * curveOffset,
          y: point2Y - perpY * curveOffset
        };
      }
      _buildElbowPath(elbowX, shortenEnd) {
        const x1 = this.startPoint.x, y1 = this.startPoint.y;
        const x2 = this.endPoint.x, y2 = this.endPoint.y;
        const r = Math.min(
          Math.abs(this.arrowCurveAmount),
          Math.abs(elbowX - x1) / 2,
          Math.abs(x2 - elbowX) / 2,
          Math.abs(y2 - y1) / 2
        );
        const dx = elbowX >= x1 ? 1 : -1;
        const ex = x2 >= elbowX ? 1 : -1;
        const dy = y2 >= y1 ? 1 : -1;
        let endX = x2;
        if (shortenEnd) {
          endX = x2 - ex * (this.arrowHeadLength * 0.3);
        }
        if (r > 2 && Math.abs(elbowX - x1) > r * 2 && Math.abs(x2 - elbowX) > r * 2 && Math.abs(y2 - y1) > r * 2) {
          return `M ${x1} ${y1} H ${elbowX - dx * r} Q ${elbowX} ${y1} ${elbowX} ${y1 + dy * r} V ${y2 - dy * r} Q ${elbowX} ${y2} ${elbowX + ex * r} ${y2} H ${endX}`;
        }
        return `M ${x1} ${y1} H ${elbowX} V ${y2} H ${endX}`;
      }
      selectArrow() {
        this.isSelected = true;
        disableAllSideBars();
        arrowSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("arrow");
        this.updateSidebar();
        this.draw();
      }
      removeSelection() {
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        this.anchors = [];
        this.isSelected = false;
      }
      attachToShape(isStartPoint, shape, attachment) {
        if (isStartPoint) {
          this.attachedToStart = {
            shape,
            side: attachment.side,
            offset: attachment.offset
          };
          this.startPoint = attachment.point;
        } else {
          this.attachedToEnd = {
            shape,
            side: attachment.side,
            offset: attachment.offset
          };
          this.endPoint = attachment.point;
        }
        if (this.arrowCurved === "curved") {
          this.initializeCurveControlPoints();
        }
        this.draw();
      }
      draw() {
        if (this._arrowHeadEl) {
          this._arrowHeadEl.remove();
          this._arrowHeadEl = null;
        }
        const childrenToRemove = [];
        const anchorSet = this._skipAnchors ? new Set(this.anchors) : null;
        for (let i = 0; i < this.group.children.length; i++) {
          const child = this.group.children[i];
          if (child !== this.labelElement && child !== this._hitArea && child !== this._labelBg) {
            if (anchorSet && anchorSet.has(child)) continue;
            childrenToRemove.push(child);
          }
        }
        childrenToRemove.forEach((child) => this.group.removeChild(child));
        if (!this._skipAnchors) this.anchors = [];
        let pathData;
        let arrowEndPoint = this.endPoint;
        const elbowX = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          if (isNaN(this.controlPoint1.x) || isNaN(this.controlPoint1.y) || isNaN(this.controlPoint2.x) || isNaN(this.controlPoint2.y)) {
            this.initializeCurveControlPoints();
          }
          pathData = `M ${this.startPoint.x} ${this.startPoint.y} C ${this.controlPoint1.x} ${this.controlPoint1.y}, ${this.controlPoint2.x} ${this.controlPoint2.y}, ${this.endPoint.x} ${this.endPoint.y}`;
          const t = 0.95;
          const tangent = this.getCubicBezierTangent(t);
          const curveAngle = Math.atan2(tangent.y, tangent.x);
          if (this.arrowHeadStyle && this.arrowHeadStyle !== "none") {
            arrowEndPoint = {
              x: this.endPoint.x - this.arrowHeadLength * 0.3 * Math.cos(curveAngle),
              y: this.endPoint.y - this.arrowHeadLength * 0.3 * Math.sin(curveAngle)
            };
            pathData = `M ${this.startPoint.x} ${this.startPoint.y} C ${this.controlPoint1.x} ${this.controlPoint1.y}, ${this.controlPoint2.x} ${this.controlPoint2.y}, ${arrowEndPoint.x} ${arrowEndPoint.y}`;
          }
        } else if (this.arrowCurved === "elbow") {
          pathData = this._buildElbowPath(elbowX, false);
        } else {
          pathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`;
        }
        const headAngle = this._getArrowAngle(elbowX);
        if (this.arrowHeadStyle === "default") {
          const pts = this._getArrowHeadPoints(headAngle);
          pathData += ` M ${pts.x3} ${pts.y3} L ${this.endPoint.x} ${this.endPoint.y} L ${pts.x4} ${pts.y4}`;
        } else {
          this._renderArrowHead(headAngle);
        }
        const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowPath.setAttribute("d", pathData);
        arrowPath.setAttribute("stroke", this.options.stroke);
        arrowPath.setAttribute("stroke-width", this.options.strokeWidth);
        arrowPath.setAttribute("fill", this.options.fill);
        if (this.options.strokeDasharray) {
          arrowPath.setAttribute("stroke-dasharray", this.options.strokeDasharray);
        } else {
          arrowPath.removeAttribute("stroke-dasharray");
        }
        arrowPath.setAttribute("stroke-linecap", "round");
        arrowPath.setAttribute("stroke-linejoin", "round");
        arrowPath.classList.add("arrow-path");
        this.element = arrowPath;
        this.group.appendChild(this.element);
        {
          let hitPathData;
          if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
            hitPathData = `M ${this.startPoint.x} ${this.startPoint.y} C ${this.controlPoint1.x} ${this.controlPoint1.y}, ${this.controlPoint2.x} ${this.controlPoint2.y}, ${this.endPoint.x} ${this.endPoint.y}`;
          } else if (this.arrowCurved === "elbow") {
            const ex = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
            hitPathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${ex} ${this.startPoint.y} L ${ex} ${this.endPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`;
          } else {
            hitPathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`;
          }
          if (!this._hitArea) {
            this._hitArea = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._hitArea.setAttribute("fill", "none");
            this._hitArea.setAttribute("stroke", "transparent");
            this._hitArea.setAttribute("stroke-width", "20");
            this._hitArea.setAttribute("style", "pointer-events: stroke;");
            this.group.appendChild(this._hitArea);
          }
          this._hitArea.setAttribute("d", hitPathData);
        }
        this._updateLabelElement();
        if (this.isSelected) {
          if (this._skipAnchors) {
            this.updateSelectionControls();
          } else {
            this.addAnchors();
            this.addAttachmentIndicators();
          }
        }
      }
      _buildFullPathData() {
        let pathData;
        const elbowX = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          if (isNaN(this.controlPoint1.x) || isNaN(this.controlPoint1.y) || isNaN(this.controlPoint2.x) || isNaN(this.controlPoint2.y)) {
            this.initializeCurveControlPoints();
          }
          pathData = `M ${this.startPoint.x} ${this.startPoint.y} C ${this.controlPoint1.x} ${this.controlPoint1.y}, ${this.controlPoint2.x} ${this.controlPoint2.y}, ${this.endPoint.x} ${this.endPoint.y}`;
          if (this.arrowHeadStyle && this.arrowHeadStyle !== "none") {
            const t = 0.95;
            const tangent = this.getCubicBezierTangent(t);
            const angle = Math.atan2(tangent.y, tangent.x);
            const arrowEndPoint = {
              x: this.endPoint.x - this.arrowHeadLength * 0.3 * Math.cos(angle),
              y: this.endPoint.y - this.arrowHeadLength * 0.3 * Math.sin(angle)
            };
            pathData = `M ${this.startPoint.x} ${this.startPoint.y} C ${this.controlPoint1.x} ${this.controlPoint1.y}, ${this.controlPoint2.x} ${this.controlPoint2.y}, ${arrowEndPoint.x} ${arrowEndPoint.y}`;
          }
        } else if (this.arrowCurved === "elbow") {
          pathData = this._buildElbowPath(elbowX, false);
        } else {
          pathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`;
        }
        if (this.arrowHeadStyle === "default") {
          const angle = this._getArrowAngle(elbowX);
          const pts = this._getArrowHeadPoints(angle);
          pathData += ` M ${pts.x3} ${pts.y3} L ${this.endPoint.x} ${this.endPoint.y} L ${pts.x4} ${pts.y4}`;
        }
        return pathData;
      }
      _updatePathElement() {
        if (!this.element) return;
        this.element.setAttribute("d", this._buildFullPathData());
        this._updateArrowHead();
      }
      _updateHitArea() {
        if (!this._hitArea) return;
        let hitPathData;
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          hitPathData = `M ${this.startPoint.x} ${this.startPoint.y} C ${this.controlPoint1.x} ${this.controlPoint1.y}, ${this.controlPoint2.x} ${this.controlPoint2.y}, ${this.endPoint.x} ${this.endPoint.y}`;
        } else if (this.arrowCurved === "elbow") {
          const ex = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          hitPathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${ex} ${this.startPoint.y} L ${ex} ${this.endPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`;
        } else {
          hitPathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`;
        }
        this._hitArea.setAttribute("d", hitPathData);
      }
      _getMidpoint() {
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          const p = this.getCubicBezierPoint(0.5);
          return { x: p.x, y: p.y };
        }
        if (this.arrowCurved === "elbow") {
          const ex = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          return { x: ex, y: (this.startPoint.y + this.endPoint.y) / 2 };
        }
        return {
          x: (this.startPoint.x + this.endPoint.x) / 2,
          y: (this.startPoint.y + this.endPoint.y) / 2
        };
      }
      _updateAnchorPositions() {
        if (!this.anchors || this.anchors.length === 0) return;
        const anchorSize = 5 / currentZoom;
        let anchorPositions = [this.startPoint, this.endPoint];
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          const midOnCurve = this.getCubicBezierPoint(0.5);
          anchorPositions.push(midOnCurve);
        } else if (this.arrowCurved === "elbow") {
          const elbowXVal = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          const midY = (this.startPoint.y + this.endPoint.y) / 2;
          anchorPositions.push({ x: elbowXVal, y: midY });
        } else {
          const arrowAngle = Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
          const arrowHeadClearance = this.arrowHeadLength + anchorSize - 10;
          anchorPositions[1] = {
            x: this.endPoint.x + arrowHeadClearance * Math.cos(arrowAngle),
            y: this.endPoint.y + arrowHeadClearance * Math.sin(arrowAngle)
          };
        }
        anchorPositions.forEach((point, index) => {
          if (this.anchors[index]) {
            this.anchors[index].setAttribute("cx", point.x);
            this.anchors[index].setAttribute("cy", point.y);
          }
        });
      }
      _updateLabelElement() {
        if (!this.label) {
          if (this.labelElement && this.labelElement.parentNode === this.group) {
            this.group.removeChild(this.labelElement);
            this.labelElement = null;
          }
          if (this._labelBg && this._labelBg.parentNode === this.group) {
            this.group.removeChild(this._labelBg);
            this._labelBg = null;
          }
          return;
        }
        if (!this.labelElement) {
          this.labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          this.labelElement.setAttribute("class", "shape-label");
          this.labelElement.setAttribute("pointer-events", "none");
        }
        const mid = this._getMidpoint();
        this.labelElement.setAttribute("x", mid.x);
        this.labelElement.setAttribute("y", mid.y);
        this.labelElement.setAttribute("text-anchor", "middle");
        this.labelElement.setAttribute("dominant-baseline", "central");
        this.labelElement.setAttribute("fill", this.labelColor);
        this.labelElement.setAttribute("font-size", this.labelFontSize);
        this.labelElement.setAttribute("font-family", "lixFont, sans-serif");
        this.labelElement.textContent = this.label;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        if (!this._labelBg) {
          this._labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          this._labelBg.setAttribute("pointer-events", "none");
        }
        this._labelBg.setAttribute("fill", canvasBg);
        const hPadding = 4;
        const vPadding = 1;
        const charWidth = this.labelFontSize * 0.6;
        const bgW = this.label.length * charWidth + hPadding * 2;
        const bgH = this.labelFontSize + vPadding * 2;
        this._labelBg.setAttribute("x", mid.x - bgW / 2);
        this._labelBg.setAttribute("y", mid.y - bgH / 2);
        this._labelBg.setAttribute("width", bgW);
        this._labelBg.setAttribute("height", bgH);
        this._labelBg.setAttribute("rx", 2);
        if (this._labelBg.parentNode === this.group) this.group.removeChild(this._labelBg);
        if (this.labelElement.parentNode === this.group) this.group.removeChild(this.labelElement);
        this.group.appendChild(this._labelBg);
        this.group.appendChild(this.labelElement);
      }
      _setupLabelDblClick() {
        this.group.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.startLabelEdit();
        });
      }
      startLabelEdit() {
        if (this._isEditingLabel) return;
        this._isEditingLabel = true;
        if (this.labelElement) {
          this.labelElement.setAttribute("visibility", "hidden");
        }
        if (this._labelBg) {
          this._labelBg.setAttribute("visibility", "hidden");
        }
        const mid = this._getMidpoint();
        const ctm = this.group.getScreenCTM();
        if (!ctm) {
          this._isEditingLabel = false;
          return;
        }
        const pt = svg.createSVGPoint();
        pt.x = mid.x;
        pt.y = mid.y;
        const screenMid = pt.matrixTransform(ctm);
        const editW = 160;
        const editH = 28;
        const overlay = document.createElement("div");
        overlay.className = "shape-label-editor";
        overlay.style.cssText = `
            position: fixed; z-index: 10000;
            left: ${screenMid.x - editW / 2}px; top: ${screenMid.y - editH / 2}px;
            width: ${editW}px; height: ${editH}px;
            display: flex; align-items: center; justify-content: center;
            pointer-events: auto;
        `;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        const input = document.createElement("div");
        input.setAttribute("contenteditable", "true");
        input.style.cssText = `
            width: 100%; height: 100%;
            background: ${canvasBg}; border: none;
            outline: none; padding: 2px 6px;
            color: ${this.labelColor}; font-size: ${this.labelFontSize}px;
            font-family: lixFont, sans-serif; text-align: center;
            display: flex; align-items: center; justify-content: center;
            white-space: pre-wrap; word-break: break-word;
            cursor: text;
        `;
        if (this.label) {
          input.textContent = this.label;
        } else {
          input.innerHTML = "&nbsp;";
        }
        overlay.appendChild(input);
        document.body.appendChild(overlay);
        setTimeout(() => {
          input.focus();
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(input);
          sel.removeAllRanges();
          sel.addRange(range);
        }, 10);
        const finishEdit = () => {
          const newText = input.textContent.trim().replace(/\u00A0/g, "");
          this.label = newText;
          this._isEditingLabel = false;
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (this.labelElement) this.labelElement.removeAttribute("visibility");
          if (this._labelBg) this._labelBg.removeAttribute("visibility");
          this.draw();
        };
        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            input.blur();
          }
          if (e.key === "Escape") {
            input.textContent = this.label;
            input.blur();
          }
        });
        input.addEventListener("pointerdown", (e) => e.stopPropagation());
        input.addEventListener("pointermove", (e) => e.stopPropagation());
        input.addEventListener("pointerup", (e) => e.stopPropagation());
      }
      setLabel(text, color, fontSize) {
        this.label = text || "";
        if (color) this.labelColor = color;
        if (fontSize) this.labelFontSize = fontSize;
        this.draw();
      }
      getCubicBezierPoint(t) {
        if (!this.controlPoint1 || !this.controlPoint2) return this.startPoint;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        return {
          x: mt3 * this.startPoint.x + 3 * mt2 * t * this.controlPoint1.x + 3 * mt * t2 * this.controlPoint2.x + t3 * this.endPoint.x,
          y: mt3 * this.startPoint.y + 3 * mt2 * t * this.controlPoint1.y + 3 * mt * t2 * this.controlPoint2.y + t3 * this.endPoint.y
        };
      }
      getCubicBezierTangent(t) {
        if (!this.controlPoint1 || !this.controlPoint2) {
          return { x: this.endPoint.x - this.startPoint.x, y: this.endPoint.y - this.startPoint.y };
        }
        const mt = 1 - t;
        const mt2 = mt * mt;
        const t2 = t * t;
        return {
          x: 3 * mt2 * (this.controlPoint1.x - this.startPoint.x) + 6 * mt * t * (this.controlPoint2.x - this.controlPoint1.x) + 3 * t2 * (this.endPoint.x - this.controlPoint2.x),
          y: 3 * mt2 * (this.controlPoint1.y - this.startPoint.y) + 6 * mt * t * (this.controlPoint2.y - this.controlPoint1.y) + 3 * t2 * (this.endPoint.y - this.controlPoint2.y)
        };
      }
      _getArrowAngle(elbowX) {
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          const tangent = this.getCubicBezierTangent(1);
          return Math.atan2(tangent.y, tangent.x);
        } else if (this.arrowCurved === "elbow") {
          const ex = elbowX !== void 0 ? elbowX : this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          return Math.atan2(0, this.endPoint.x - ex);
        } else {
          const dx = this.endPoint.x - this.startPoint.x;
          const dy = this.endPoint.y - this.startPoint.y;
          return Math.atan2(dy, dx);
        }
      }
      _getArrowHeadPoints(angle) {
        const rad = this.arrowHeadAngleDeg * Math.PI / 180;
        return {
          x3: this.endPoint.x - this.arrowHeadLength * Math.cos(angle - rad),
          y3: this.endPoint.y - this.arrowHeadLength * Math.sin(angle - rad),
          x4: this.endPoint.x - this.arrowHeadLength * Math.cos(angle + rad),
          y4: this.endPoint.y - this.arrowHeadLength * Math.sin(angle + rad)
        };
      }
      _renderArrowHead(angle) {
        if (this._arrowHeadEl) {
          this._arrowHeadEl.remove();
          this._arrowHeadEl = null;
        }
        const style = this.arrowHeadStyle;
        if (!style || style === "default") return;
        const pts = this._getArrowHeadPoints(angle);
        const tip = this.endPoint;
        let el;
        if (style === "square") {
          const size = this.arrowHeadLength * 0.7;
          const perpX = -Math.sin(angle), perpY = Math.cos(angle);
          const backX = -Math.cos(angle), backY = -Math.sin(angle);
          const p1x = tip.x + perpX * size / 2, p1y = tip.y + perpY * size / 2;
          const p2x = tip.x - perpX * size / 2, p2y = tip.y - perpY * size / 2;
          const p3x = p2x + backX * size, p3y = p2y + backY * size;
          const p4x = p1x + backX * size, p4y = p1y + backY * size;
          el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          el.setAttribute("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`);
          el.setAttribute("fill", "none");
        } else {
          el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          el.setAttribute("points", `${pts.x3},${pts.y3} ${tip.x},${tip.y} ${pts.x4},${pts.y4}`);
          el.setAttribute("fill", style === "solid" ? this.options.stroke : "none");
        }
        el.setAttribute("stroke", this.options.stroke);
        el.setAttribute("stroke-width", this.options.strokeWidth);
        el.setAttribute("stroke-linejoin", "round");
        el.classList.add("arrow-head");
        this._arrowHeadEl = el;
        this.group.appendChild(el);
      }
      _updateArrowHead() {
        if (!this._arrowHeadEl) return;
        const style = this.arrowHeadStyle;
        if (style === "default" || !style) return;
        const elbowX = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
        const angle = this._getArrowAngle(elbowX);
        const pts = this._getArrowHeadPoints(angle);
        const tip = this.endPoint;
        if (style === "square") {
          const size = this.arrowHeadLength * 0.7;
          const perpX = -Math.sin(angle), perpY = Math.cos(angle);
          const backX = -Math.cos(angle), backY = -Math.sin(angle);
          const p1x = tip.x + perpX * size / 2, p1y = tip.y + perpY * size / 2;
          const p2x = tip.x - perpX * size / 2, p2y = tip.y - perpY * size / 2;
          const p3x = p2x + backX * size, p3y = p2y + backY * size;
          const p4x = p1x + backX * size, p4y = p1y + backY * size;
          this._arrowHeadEl.setAttribute("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`);
        } else {
          this._arrowHeadEl.setAttribute("points", `${pts.x3},${pts.y3} ${tip.x},${tip.y} ${pts.x4},${pts.y4}`);
        }
      }
      updateSelectionControls() {
        if (!this.anchors || this.anchors.length === 0) return;
        const anchorSize = 5 / currentZoom;
        let anchorPositions = [this.startPoint, this.endPoint];
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          const midOnCurve = this.getCubicBezierPoint(0.5);
          anchorPositions.push(midOnCurve);
        } else if (this.arrowCurved === "elbow") {
          const elbowXVal = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          const midY = (this.startPoint.y + this.endPoint.y) / 2;
          anchorPositions.push({ x: elbowXVal, y: midY });
        } else {
          const arrowAngle = Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
          const arrowHeadClearance = this.arrowHeadLength + anchorSize - 10;
          anchorPositions[1] = {
            x: this.endPoint.x + arrowHeadClearance * Math.cos(arrowAngle),
            y: this.endPoint.y + arrowHeadClearance * Math.sin(arrowAngle)
          };
        }
        anchorPositions.forEach((point, index) => {
          if (this.anchors[index]) {
            this.anchors[index].setAttribute("cx", point.x);
            this.anchors[index].setAttribute("cy", point.y);
            this.anchors[index].setAttribute("r", anchorSize);
          }
        });
      }
      addAnchors() {
        const anchorSize = 5 / currentZoom;
        const anchorStrokeWidth = 2 / currentZoom;
        let anchorPositions = [this.startPoint, this.endPoint];
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          const midOnCurve = this.getCubicBezierPoint(0.5);
          anchorPositions.push(midOnCurve);
        } else if (this.arrowCurved === "elbow") {
          const elbowXVal = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          const midY = (this.startPoint.y + this.endPoint.y) / 2;
          anchorPositions.push({ x: elbowXVal, y: midY });
        } else {
          const arrowAngle = Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
          const arrowHeadClearance = this.arrowHeadLength + anchorSize - 10;
          anchorPositions[1] = {
            x: this.endPoint.x + arrowHeadClearance * Math.cos(arrowAngle),
            y: this.endPoint.y + arrowHeadClearance * Math.sin(arrowAngle)
          };
        }
        disableAllSideBars();
        arrowSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("arrow");
        this.updateSidebar();
        anchorPositions.forEach((point, index) => {
          const anchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          anchor.setAttribute("cx", point.x);
          anchor.setAttribute("cy", point.y);
          anchor.setAttribute("r", anchorSize);
          if (this.arrowCurved && index >= 2) {
            anchor.setAttribute("fill", "#121212");
            anchor.setAttribute("stroke", "#5B57D1");
          } else {
            anchor.setAttribute("fill", "#121212");
            anchor.setAttribute("stroke", "#5B57D1");
          }
          anchor.setAttribute("stroke-width", anchorStrokeWidth);
          anchor.setAttribute("vector-effect", "non-scaling-stroke");
          anchor.setAttribute("class", "anchor arrow-anchor");
          anchor.setAttribute("data-index", index);
          anchor.style.cursor = "grab";
          anchor.style.pointerEvents = "all";
          anchor.addEventListener("pointerdown", (e) => this.startAnchorDrag(e, index));
          this.group.appendChild(anchor);
          this.anchors[index] = anchor;
        });
      }
      addAttachmentIndicators() {
        if (this.attachedToStart) {
          const attachPoint = this.calculateAttachedPoint(this.attachedToStart);
          const indicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          indicator.setAttribute("cx", attachPoint.x);
          indicator.setAttribute("cy", attachPoint.y);
          indicator.setAttribute("r", 4);
          indicator.setAttribute("fill", "#5B57D1");
          indicator.setAttribute("stroke", "#121212");
          indicator.setAttribute("stroke-width", 1);
          indicator.setAttribute("class", "attachment-indicator");
          this.group.appendChild(indicator);
        }
        if (this.attachedToEnd) {
          const attachPoint = this.calculateAttachedPoint(this.attachedToEnd);
          const indicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          indicator.setAttribute("cx", attachPoint.x);
          indicator.setAttribute("cy", attachPoint.y);
          indicator.setAttribute("r", 4);
          indicator.setAttribute("fill", "#5B57D1");
          indicator.setAttribute("stroke", "#121212");
          indicator.setAttribute("stroke-width", 1);
          indicator.setAttribute("class", "attachment-indicator");
          this.group.appendChild(indicator);
        }
      }
      getAttachmentState() {
        return {
          attachedToStart: this.attachedToStart ? {
            shapeId: this.attachedToStart.shape.shapeID,
            side: this.attachedToStart.side,
            offset: { ...this.attachedToStart.offset }
          } : null,
          attachedToEnd: this.attachedToEnd ? {
            shapeId: this.attachedToEnd.shape.shapeID,
            side: this.attachedToEnd.side,
            offset: { ...this.attachedToEnd.offset }
          } : null
        };
      }
      restoreAttachmentState(attachmentState) {
        this.attachedToStart = null;
        this.attachedToEnd = null;
        if (attachmentState.attachedToStart) {
          const shape = shapes.find((s) => s.shapeID === attachmentState.attachedToStart.shapeId);
          if (shape) {
            this.attachedToStart = {
              shape,
              side: attachmentState.attachedToStart.side,
              offset: { ...attachmentState.attachedToStart.offset }
            };
            this.startPoint = this.calculateAttachedPoint(this.attachedToStart);
          }
        }
        if (attachmentState.attachedToEnd) {
          const shape = shapes.find((s) => s.shapeID === attachmentState.attachedToEnd.shapeId);
          if (shape) {
            this.attachedToEnd = {
              shape,
              side: attachmentState.attachedToEnd.side,
              offset: { ...attachmentState.attachedToEnd.offset }
            };
            this.endPoint = this.calculateAttachedPoint(this.attachedToEnd);
          }
        }
        if (this.arrowCurved === "curved") {
          this.initializeCurveControlPoints();
        }
        this.draw();
      }
      static getEllipsePerimeterPoint(circle, angle) {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const a = circle.rx;
        const b = circle.ry;
        const t = Math.atan2(a * sinAngle, b * cosAngle);
        return {
          x: circle.x + a * Math.cos(t),
          y: circle.y + b * Math.sin(t)
        };
      }
      static findNearbyShape(point, tolerance = 20) {
        for (let shape of shapes) {
          if (shape.shapeName === "arrow" || shape.shapeName === "line") continue;
          let attachment = null;
          switch (shape.shapeName) {
            case "rectangle":
              attachment = _Arrow.getRectangleAttachmentPoint(point, shape, tolerance);
              break;
            case "circle":
              attachment = _Arrow.getCircleAttachmentPoint(point, shape, tolerance);
              break;
            case "frame":
              attachment = _Arrow.getFrameAttachmentPoint(point, shape, tolerance);
              break;
            case "text":
            case "code":
              if (shape.group) {
                attachment = _Arrow.getTextAttachmentPoint(point, shape.group, tolerance);
              }
              break;
            case "image":
              if (shape.element) {
                attachment = _Arrow.getImageAttachmentPoint(point, shape.element, tolerance);
              }
              break;
            case "icon":
              if (shape.element) {
                attachment = _Arrow.getIconAttachmentPoint(point, shape.element, tolerance);
              }
              break;
            case "freehandStroke":
              attachment = _Arrow.getBoundingBoxAttachmentPoint(point, shape, tolerance);
              break;
            case "line":
              attachment = _Arrow.getLineAttachmentPoint(point, shape, tolerance);
              break;
          }
          if (attachment) {
            return { shape, attachment };
          }
        }
        return null;
      }
      static getBoundingBoxAttachmentPoint(point, shape, tolerance = 20) {
        const bounds = shape.boundingBox || { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
        if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
        const sides = [
          { name: "top", start: { x: bounds.x, y: bounds.y }, end: { x: bounds.x + bounds.width, y: bounds.y } },
          { name: "right", start: { x: bounds.x + bounds.width, y: bounds.y }, end: { x: bounds.x + bounds.width, y: bounds.y + bounds.height } },
          { name: "bottom", start: { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, end: { x: bounds.x, y: bounds.y + bounds.height } },
          { name: "left", start: { x: bounds.x, y: bounds.y + bounds.height }, end: { x: bounds.x, y: bounds.y } }
        ];
        let closestSide = null;
        let minDistance2 = tolerance;
        let attachPoint = null;
        sides.forEach((side) => {
          const distance2 = _Arrow.pointToLineSegmentDistance(point, side.start, side.end);
          if (distance2 < minDistance2) {
            minDistance2 = distance2;
            closestSide = side.name;
            attachPoint = _Arrow.closestPointOnLineSegment(point, side.start, side.end);
          }
        });
        if (closestSide && attachPoint) {
          const offset = {
            x: attachPoint.x - bounds.x,
            y: attachPoint.y - bounds.y,
            side: closestSide
          };
          return { side: closestSide, point: attachPoint, offset };
        }
        return null;
      }
      static getLineAttachmentPoint(point, line, tolerance = 20) {
        const start = line.startPoint;
        const end = line.endPoint;
        if (!start || !end) return null;
        const distance2 = _Arrow.pointToLineSegmentDistance(point, start, end);
        if (distance2 >= tolerance) return null;
        const attachPoint = _Arrow.closestPointOnLineSegment(point, start, end);
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lenSq = dx * dx + dy * dy;
        const t = lenSq > 0 ? ((attachPoint.x - start.x) * dx + (attachPoint.y - start.y) * dy) / lenSq : 0;
        return {
          side: "line",
          point: attachPoint,
          offset: { t: Math.max(0, Math.min(1, t)), side: "line" }
        };
      }
      static getIconAttachmentPoint(point, iconElement, tolerance = 20) {
        if (!iconElement || iconElement.tagName !== "g" && (!iconElement.getAttribute || iconElement.getAttribute("type") !== "icon")) {
          console.warn("Invalid icon element for attachment:", iconElement);
          return null;
        }
        const iconX2 = parseFloat(iconElement.getAttribute("data-shape-x") || iconElement.getAttribute("x"));
        const iconY2 = parseFloat(iconElement.getAttribute("data-shape-y") || iconElement.getAttribute("y"));
        const iconWidth = parseFloat(iconElement.getAttribute("data-shape-width") || iconElement.getAttribute("width"));
        const iconHeight = parseFloat(iconElement.getAttribute("data-shape-height") || iconElement.getAttribute("height"));
        let rotation = 0;
        const dataRotation = iconElement.getAttribute("data-shape-rotation");
        if (dataRotation) {
          rotation = parseFloat(dataRotation) * Math.PI / 180;
        } else {
          const transform = iconElement.getAttribute("transform");
          if (transform) {
            const rotateMatch = transform.match(/rotate\(([^,]+)/);
            if (rotateMatch) {
              rotation = parseFloat(rotateMatch[1]) * Math.PI / 180;
            }
          }
        }
        const centerX = iconX2 + iconWidth / 2;
        const centerY = iconY2 + iconHeight / 2;
        const corners = [
          { x: iconX2, y: iconY2 },
          // top-left
          { x: iconX2 + iconWidth, y: iconY2 },
          // top-right
          { x: iconX2 + iconWidth, y: iconY2 + iconHeight },
          // bottom-right
          { x: iconX2, y: iconY2 + iconHeight }
          // bottom-left
        ];
        const transformedCorners = corners.map((corner) => {
          if (rotation === 0) return corner;
          const dx = corner.x - centerX;
          const dy = corner.y - centerY;
          return {
            x: centerX + dx * Math.cos(rotation) - dy * Math.sin(rotation),
            y: centerY + dx * Math.sin(rotation) + dy * Math.cos(rotation)
          };
        });
        const sides = [
          { name: "top", start: transformedCorners[0], end: transformedCorners[1] },
          { name: "right", start: transformedCorners[1], end: transformedCorners[2] },
          { name: "bottom", start: transformedCorners[2], end: transformedCorners[3] },
          { name: "left", start: transformedCorners[3], end: transformedCorners[0] }
        ];
        let closestSide = null;
        let minDistance2 = tolerance;
        let attachPoint = null;
        sides.forEach((side) => {
          const distance2 = _Arrow.pointToLineSegmentDistance(point, side.start, side.end);
          if (distance2 < minDistance2) {
            minDistance2 = distance2;
            closestSide = side.name;
            attachPoint = _Arrow.closestPointOnLineSegment(point, side.start, side.end);
          }
        });
        if (closestSide && attachPoint) {
          let localPoint = attachPoint;
          if (rotation !== 0) {
            const dx = attachPoint.x - centerX;
            const dy = attachPoint.y - centerY;
            localPoint = {
              x: centerX + dx * Math.cos(-rotation) - dy * Math.sin(-rotation),
              y: centerY + dx * Math.sin(-rotation) + dy * Math.cos(-rotation)
            };
          }
          const offset = {
            x: localPoint.x - iconX2,
            y: localPoint.y - iconY2,
            side: closestSide
          };
          return { side: closestSide, point: attachPoint, offset };
        }
        return null;
      }
      static getImageAttachmentPoint(point, imageElement, tolerance = 20) {
        if (!imageElement || imageElement.tagName !== "image" && (!imageElement.getAttribute || imageElement.getAttribute("type") !== "image")) {
          console.warn("Invalid image element for attachment:", imageElement);
          return null;
        }
        const imgX = parseFloat(imageElement.getAttribute("data-shape-x") || imageElement.getAttribute("x"));
        const imgY = parseFloat(imageElement.getAttribute("data-shape-y") || imageElement.getAttribute("y"));
        const imgWidth = parseFloat(imageElement.getAttribute("data-shape-width") || imageElement.getAttribute("width"));
        const imgHeight = parseFloat(imageElement.getAttribute("data-shape-height") || imageElement.getAttribute("height"));
        let rotation = 0;
        const dataRotation = imageElement.getAttribute("data-shape-rotation");
        if (dataRotation) {
          rotation = parseFloat(dataRotation) * Math.PI / 180;
        } else {
          const transform = imageElement.getAttribute("transform");
          if (transform) {
            const rotateMatch = transform.match(/rotate\(([^,]+)/);
            if (rotateMatch) {
              rotation = parseFloat(rotateMatch[1]) * Math.PI / 180;
            }
          }
        }
        const centerX = imgX + imgWidth / 2;
        const centerY = imgY + imgHeight / 2;
        const corners = [
          { x: imgX, y: imgY },
          // top-left
          { x: imgX + imgWidth, y: imgY },
          // top-right
          { x: imgX + imgWidth, y: imgY + imgHeight },
          // bottom-right
          { x: imgX, y: imgY + imgHeight }
          // bottom-left
        ];
        const transformedCorners = corners.map((corner) => {
          if (rotation === 0) return corner;
          const dx = corner.x - centerX;
          const dy = corner.y - centerY;
          return {
            x: centerX + dx * Math.cos(rotation) - dy * Math.sin(rotation),
            y: centerY + dx * Math.sin(rotation) + dy * Math.cos(rotation)
          };
        });
        const sides = [
          { name: "top", start: transformedCorners[0], end: transformedCorners[1] },
          { name: "right", start: transformedCorners[1], end: transformedCorners[2] },
          { name: "bottom", start: transformedCorners[2], end: transformedCorners[3] },
          { name: "left", start: transformedCorners[3], end: transformedCorners[0] }
        ];
        let closestSide = null;
        let minDistance2 = tolerance;
        let attachPoint = null;
        sides.forEach((side) => {
          const distance2 = _Arrow.pointToLineSegmentDistance(point, side.start, side.end);
          if (distance2 < minDistance2) {
            minDistance2 = distance2;
            closestSide = side.name;
            attachPoint = _Arrow.closestPointOnLineSegment(point, side.start, side.end);
          }
        });
        if (closestSide && attachPoint) {
          let localPoint = attachPoint;
          if (rotation !== 0) {
            const dx = attachPoint.x - centerX;
            const dy = attachPoint.y - centerY;
            localPoint = {
              x: centerX + dx * Math.cos(-rotation) - dy * Math.sin(-rotation),
              y: centerY + dx * Math.sin(-rotation) + dy * Math.cos(-rotation)
            };
          }
          const offset = {
            x: localPoint.x - imgX,
            y: localPoint.y - imgY,
            side: closestSide
          };
          return { side: closestSide, point: attachPoint, offset };
        }
        return null;
      }
      static getFrameAttachmentPoint(point, frame, tolerance = 20) {
        const rect = {
          left: frame.x,
          right: frame.x + frame.width,
          top: frame.y,
          bottom: frame.y + frame.height
        };
        const distances = {
          top: Math.abs(point.y - rect.top),
          bottom: Math.abs(point.y - rect.bottom),
          left: Math.abs(point.x - rect.left),
          right: Math.abs(point.x - rect.right)
        };
        let closestSide = null;
        let minDistance2 = tolerance;
        for (let side in distances) {
          if (distances[side] < minDistance2) {
            if ((side === "top" || side === "bottom") && point.x >= rect.left - tolerance && point.x <= rect.right + tolerance) {
              closestSide = side;
              minDistance2 = distances[side];
            } else if ((side === "left" || side === "right") && point.y >= rect.top - tolerance && point.y <= rect.bottom + tolerance) {
              closestSide = side;
              minDistance2 = distances[side];
            }
          }
        }
        if (closestSide) {
          let attachPoint, offset;
          switch (closestSide) {
            case "top":
              attachPoint = { x: Math.max(rect.left, Math.min(rect.right, point.x)), y: rect.top };
              offset = { x: attachPoint.x - frame.x, y: 0 };
              break;
            case "bottom":
              attachPoint = { x: Math.max(rect.left, Math.min(rect.right, point.x)), y: rect.bottom };
              offset = { x: attachPoint.x - frame.x, y: frame.height };
              break;
            case "left":
              attachPoint = { x: rect.left, y: Math.max(rect.top, Math.min(rect.bottom, point.y)) };
              offset = { x: 0, y: attachPoint.y - frame.y };
              break;
            case "right":
              attachPoint = { x: rect.right, y: Math.max(rect.top, Math.min(rect.bottom, point.y)) };
              offset = { x: frame.width, y: attachPoint.y - frame.y };
              break;
          }
          return { side: closestSide, point: attachPoint, offset };
        }
        return null;
      }
      static getRectangleAttachmentPoint(point, rectangle, tolerance = 20) {
        const rect = {
          left: rectangle.x,
          right: rectangle.x + rectangle.width,
          top: rectangle.y,
          bottom: rectangle.y + rectangle.height
        };
        const distances = {
          top: Math.abs(point.y - rect.top),
          bottom: Math.abs(point.y - rect.bottom),
          left: Math.abs(point.x - rect.left),
          right: Math.abs(point.x - rect.right)
        };
        let closestSide = null;
        let minDistance2 = tolerance;
        for (let side in distances) {
          if (distances[side] < minDistance2) {
            if ((side === "top" || side === "bottom") && point.x >= rect.left - tolerance && point.x <= rect.right + tolerance) {
              closestSide = side;
              minDistance2 = distances[side];
            } else if ((side === "left" || side === "right") && point.y >= rect.top - tolerance && point.y <= rect.bottom + tolerance) {
              closestSide = side;
              minDistance2 = distances[side];
            }
          }
        }
        if (closestSide) {
          let attachPoint, offset;
          switch (closestSide) {
            case "top":
              attachPoint = { x: Math.max(rect.left, Math.min(rect.right, point.x)), y: rect.top };
              offset = { x: attachPoint.x - rectangle.x, y: 0 };
              break;
            case "bottom":
              attachPoint = { x: Math.max(rect.left, Math.min(rect.right, point.x)), y: rect.bottom };
              offset = { x: attachPoint.x - rectangle.x, y: rectangle.height };
              break;
            case "left":
              attachPoint = { x: rect.left, y: Math.max(rect.top, Math.min(rect.bottom, point.y)) };
              offset = { x: 0, y: attachPoint.y - rectangle.y };
              break;
            case "right":
              attachPoint = { x: rect.right, y: Math.max(rect.top, Math.min(rect.bottom, point.y)) };
              offset = { x: rectangle.width, y: attachPoint.y - rectangle.y };
              break;
          }
          return { side: closestSide, point: attachPoint, offset };
        }
        return null;
      }
      static getCircleAttachmentPoint(point, circle, tolerance = 20) {
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        const averageRadius = (circle.rx + circle.ry) / 2;
        const distanceToPerimeter = Math.abs(distanceToCenter - averageRadius);
        if (distanceToPerimeter <= tolerance) {
          const angle = Math.atan2(dy, dx);
          const attachPoint = this.getEllipsePerimeterPoint(circle, angle);
          const offset = {
            angle,
            radiusRatioX: (attachPoint.x - circle.x) / circle.rx,
            radiusRatioY: (attachPoint.y - circle.y) / circle.ry
          };
          return {
            side: "perimeter",
            point: attachPoint,
            offset
          };
        }
        return null;
      }
      static getTextAttachmentPoint(point, textGroup, tolerance = 20) {
        if (!textGroup) return null;
        const groupType = textGroup.getAttribute ? textGroup.getAttribute("type") : textGroup.type;
        if (groupType !== "text" && groupType !== "code") return null;
        const textElement = textGroup.querySelector("text");
        if (!textElement) return null;
        const bbox = textElement.getBBox();
        const groupTransform = textGroup.transform.baseVal.consolidate();
        const matrix = groupTransform ? groupTransform.matrix : { e: 0, f: 0, a: 1, b: 0, c: 0, d: 1 };
        const corners = [
          { x: bbox.x, y: bbox.y },
          // top-left
          { x: bbox.x + bbox.width, y: bbox.y },
          // top-right
          { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
          // bottom-right
          { x: bbox.x, y: bbox.y + bbox.height }
          // bottom-left
        ];
        const transformedCorners = corners.map((corner) => ({
          x: corner.x * matrix.a + corner.y * matrix.c + matrix.e,
          y: corner.x * matrix.b + corner.y * matrix.d + matrix.f
        }));
        const sides = [
          { name: "top", start: transformedCorners[0], end: transformedCorners[1] },
          { name: "right", start: transformedCorners[1], end: transformedCorners[2] },
          { name: "bottom", start: transformedCorners[2], end: transformedCorners[3] },
          { name: "left", start: transformedCorners[3], end: transformedCorners[0] }
        ];
        let closestSide = null;
        let minDistance2 = tolerance;
        let attachPoint = null;
        sides.forEach((side) => {
          const distance2 = _Arrow.pointToLineSegmentDistance(point, side.start, side.end);
          if (distance2 < minDistance2) {
            minDistance2 = distance2;
            closestSide = side.name;
            attachPoint = _Arrow.closestPointOnLineSegment(point, side.start, side.end);
          }
        });
        if (closestSide && attachPoint) {
          const det = matrix.a * matrix.d - matrix.b * matrix.c;
          if (det === 0) return null;
          const invMatrix = {
            a: matrix.d / det,
            b: -matrix.b / det,
            c: -matrix.c / det,
            d: matrix.a / det,
            e: (matrix.c * matrix.f - matrix.d * matrix.e) / det,
            f: (matrix.b * matrix.e - matrix.a * matrix.f) / det
          };
          const localPoint = {
            x: attachPoint.x * invMatrix.a + attachPoint.y * invMatrix.c + invMatrix.e,
            y: attachPoint.x * invMatrix.b + attachPoint.y * invMatrix.d + invMatrix.f
          };
          const offset = {
            x: localPoint.x - bbox.x,
            y: localPoint.y - bbox.y,
            side: closestSide
          };
          return { side: closestSide, point: attachPoint, offset };
        }
        return null;
      }
      static pointToLineSegmentDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        if (lenSq === 0) {
          return Math.sqrt(A * A + B * B);
        }
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        const xx = lineStart.x + param * C;
        const yy = lineStart.y + param * D;
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
      }
      static closestPointOnLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        if (lenSq === 0) {
          return { x: lineStart.x, y: lineStart.y };
        }
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        return {
          x: lineStart.x + param * C,
          y: lineStart.y + param * D
        };
      }
      calculateAttachedPoint(attachment) {
        const shape = attachment.shape;
        const side = attachment.side;
        const offset = attachment.offset;
        if (shape.shapeName === "rectangle") {
          return _Arrow._calcRectAttachedPoint(shape.x, shape.y, shape.width, shape.height, shape.rotation, side, offset);
        }
        if (shape.shapeName === "circle") {
          if (side === "perimeter") {
            return _Arrow.getEllipsePerimeterPoint(shape, offset.angle);
          }
        }
        if (shape.shapeName === "text" || shape.shapeName === "code") {
          const groupEl = shape.group;
          if (!groupEl) return { x: shape.x || 0, y: shape.y || 0 };
          const textElement = groupEl.querySelector("text") || groupEl.querySelector("foreignObject");
          if (!textElement) return { x: shape.x || 0, y: shape.y || 0 };
          const bbox = textElement.getBBox();
          const groupTransform = groupEl.transform.baseVal.consolidate();
          const matrix = groupTransform ? groupTransform.matrix : { e: 0, f: 0, a: 1, b: 0, c: 0, d: 1 };
          let localPoint = { x: bbox.x + offset.x, y: bbox.y + offset.y };
          return {
            x: localPoint.x * matrix.a + localPoint.y * matrix.c + matrix.e,
            y: localPoint.x * matrix.b + localPoint.y * matrix.d + matrix.f
          };
        }
        if (shape.shapeName === "image") {
          return _Arrow._calcRectAttachedPoint(shape.x, shape.y, shape.width, shape.height, shape.rotation, side, offset);
        }
        if (shape.shapeName === "icon") {
          return _Arrow._calcRectAttachedPoint(shape.x, shape.y, shape.width, shape.height, shape.rotation, side, offset);
        }
        if (shape.shapeName === "frame") {
          return _Arrow._calcRectAttachedPoint(shape.x, shape.y, shape.width, shape.height, 0, side, offset);
        }
        if (shape.shapeName === "freehandStroke") {
          const bounds = shape.boundingBox || { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
          return _Arrow._calcRectAttachedPoint(bounds.x, bounds.y, bounds.width, bounds.height, 0, side, offset);
        }
        if (shape.shapeName === "line") {
          if (side === "line" && offset.t !== void 0) {
            const t = offset.t;
            return {
              x: shape.startPoint.x + t * (shape.endPoint.x - shape.startPoint.x),
              y: shape.startPoint.y + t * (shape.endPoint.y - shape.startPoint.y)
            };
          }
        }
        return { x: shape.x || 0, y: shape.y || 0 };
      }
      static _calcRectAttachedPoint(rx, ry, rw, rh, rotation, side, offset) {
        let localPoint;
        switch (side) {
          case "top":
            localPoint = { x: rx + offset.x, y: ry };
            break;
          case "bottom":
            localPoint = { x: rx + offset.x, y: ry + rh };
            break;
          case "left":
            localPoint = { x: rx, y: ry + offset.y };
            break;
          case "right":
            localPoint = { x: rx + rw, y: ry + offset.y };
            break;
          default:
            localPoint = { x: rx + offset.x, y: ry + offset.y };
        }
        if (rotation) {
          const rad = rotation * Math.PI / 180;
          const cx = rx + rw / 2;
          const cy = ry + rh / 2;
          const dx = localPoint.x - cx;
          const dy = localPoint.y - cy;
          return {
            x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
            y: cy + dx * Math.sin(rad) + dy * Math.cos(rad)
          };
        }
        return localPoint;
      }
      detachFromShape(isStartPoint) {
        if (isStartPoint) {
          this.attachedToStart = null;
        } else {
          this.attachedToEnd = null;
        }
      }
      updateAttachments() {
        let needsRedraw = false;
        if (this.attachedToStart && this.attachedToStart.shape) {
          const newPoint = this.calculateAttachedPoint(this.attachedToStart);
          if (newPoint.x !== this.startPoint.x || newPoint.y !== this.startPoint.y) {
            this.startPoint = newPoint;
            needsRedraw = true;
          }
        }
        if (this.attachedToEnd && this.attachedToEnd.shape) {
          const newPoint = this.calculateAttachedPoint(this.attachedToEnd);
          if (newPoint.x !== this.endPoint.x || newPoint.y !== this.endPoint.y) {
            this.endPoint = newPoint;
            needsRedraw = true;
          }
        }
        if (needsRedraw) {
          if (this.arrowCurved) {
            this.initializeCurveControlPoints();
          }
          this.draw();
        }
      }
      move(dx, dy) {
        if (!this.attachedToStart) {
          this.startPoint.x += dx;
          this.startPoint.y += dy;
        }
        if (!this.attachedToEnd) {
          this.endPoint.x += dx;
          this.endPoint.y += dy;
        }
        if (this.controlPoint1 && (!this.attachedToStart && !this.attachedToEnd)) {
          this.controlPoint1.x += dx;
          this.controlPoint1.y += dy;
        }
        if (this.controlPoint2 && (!this.attachedToStart && !this.attachedToEnd)) {
          this.controlPoint2.x += dx;
          this.controlPoint2.y += dy;
        }
        this._updatePathElement();
        this._updateHitArea();
        this._updateLabelElement();
        this._updateAnchorPositions();
        if (isDragging && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        shapes.forEach((shape) => {
          if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
            targetFrame = shape;
          }
        });
        if (this.parentFrame && isDragging) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrameArrow && hoveredFrameArrow !== targetFrame) {
          hoveredFrameArrow.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrameArrow) {
          targetFrame.highlightFrame();
        }
        hoveredFrameArrow = targetFrame;
      }
      isNearAnchor(x, y) {
        const anchorSize = 10 / currentZoom;
        for (let i = 0; i < this.anchors.length; i++) {
          const anchor = this.anchors[i];
          if (anchor) {
            const anchorX = parseFloat(anchor.getAttribute("cx"));
            const anchorY = parseFloat(anchor.getAttribute("cy"));
            const distance2 = Math.sqrt(Math.pow(x - anchorX, 2) + Math.pow(y - anchorY, 2));
            if (distance2 <= anchorSize) {
              return { type: "anchor", index: i };
            }
          }
        }
        return null;
      }
      startAnchorDrag(e, index) {
        e.stopPropagation();
        e.preventDefault();
        dragOldPosArrow = {
          startPoint: { x: this.startPoint.x, y: this.startPoint.y },
          endPoint: { x: this.endPoint.x, y: this.endPoint.y },
          controlPoint1: this.controlPoint1 ? { x: this.controlPoint1.x, y: this.controlPoint1.y } : null,
          controlPoint2: this.controlPoint2 ? { x: this.controlPoint2.x, y: this.controlPoint2.y } : null,
          attachments: this.getAttachmentState()
        };
        const onPointerMove = (event) => {
          const { x, y } = getSVGCoordsFromMouse(event);
          if (index === 0 || index === 1) {
            const nearbyShape = _Arrow.findNearbyShape({ x, y });
            if (nearbyShape) {
              const existingPreview = svg.querySelector(".attachment-preview");
              if (existingPreview) existingPreview.remove();
              const preview = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              preview.setAttribute("cx", nearbyShape.attachment.point.x);
              preview.setAttribute("cy", nearbyShape.attachment.point.y);
              preview.setAttribute("r", 6);
              preview.setAttribute("fill", "none");
              preview.setAttribute("stroke", "#5B57D1");
              preview.setAttribute("stroke-width", 2);
              preview.setAttribute("class", "attachment-preview");
              preview.setAttribute("opacity", "0.7");
              svg.appendChild(preview);
              this.updatePosition(index, nearbyShape.attachment.point.x, nearbyShape.attachment.point.y);
            } else {
              const existingPreview = svg.querySelector(".attachment-preview");
              if (existingPreview) existingPreview.remove();
              this.updatePosition(index, x, y);
            }
          } else {
            this.updatePosition(index, x, y);
          }
        };
        const onPointerUp = () => {
          const existingPreview = svg.querySelector(".attachment-preview");
          if (existingPreview) existingPreview.remove();
          if (index === 0) {
            const startAttachment = _Arrow.findNearbyShape(this.startPoint);
            if (startAttachment) {
              if (this.attachedToStart && this.attachedToStart.shape !== startAttachment.shape) {
                this.detachFromShape(true);
              }
              this.attachToShape(true, startAttachment.shape, startAttachment.attachment);
            } else {
              if (this.attachedToStart) {
                this.detachFromShape(true);
              }
            }
          } else if (index === 1) {
            const endAttachment = _Arrow.findNearbyShape(this.endPoint);
            if (endAttachment) {
              if (this.attachedToEnd && this.attachedToEnd.shape !== endAttachment.shape) {
                this.detachFromShape(false);
              }
              this.attachToShape(false, endAttachment.shape, endAttachment.attachment);
            } else {
              if (this.attachedToEnd) {
                this.detachFromShape(false);
              }
            }
          }
          if (dragOldPosArrow) {
            const newPos = {
              startPoint: { x: this.startPoint.x, y: this.startPoint.y },
              endPoint: { x: this.endPoint.x, y: this.endPoint.y },
              controlPoint1: this.controlPoint1 ? { x: this.controlPoint1.x, y: this.controlPoint1.y } : null,
              controlPoint2: this.controlPoint2 ? { x: this.controlPoint2.x, y: this.controlPoint2.y } : null,
              attachments: this.getAttachmentState()
            };
            const stateChanged = dragOldPosArrow.startPoint.x !== newPos.startPoint.x || dragOldPosArrow.startPoint.y !== newPos.startPoint.y || dragOldPosArrow.endPoint.x !== newPos.endPoint.x || dragOldPosArrow.endPoint.y !== newPos.endPoint.y || JSON.stringify(dragOldPosArrow.attachments) !== JSON.stringify(newPos.attachments);
            if (stateChanged) {
              pushTransformAction(this, dragOldPosArrow, newPos);
            }
            dragOldPosArrow = null;
          }
          svg.removeEventListener("pointermove", onPointerMove);
          svg.removeEventListener("pointerup", onPointerUp);
        };
        svg.addEventListener("pointermove", onPointerMove);
        svg.addEventListener("pointerup", onPointerUp);
      }
      updatePosition(anchorIndex, newViewBoxX, newViewBoxY) {
        if (anchorIndex === 0) {
          this.startPoint.x = newViewBoxX;
          this.startPoint.y = newViewBoxY;
        } else if (anchorIndex === 1) {
          this.endPoint.x = newViewBoxX;
          this.endPoint.y = newViewBoxY;
        } else if (anchorIndex === 2 && this.arrowCurved === "elbow") {
          this.elbowX = newViewBoxX;
        } else if (anchorIndex === 2 && this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          const dx = this.endPoint.x - this.startPoint.x;
          const dy = this.endPoint.y - this.startPoint.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const perpX = -dy / dist;
          const perpY = dx / dist;
          const lineMidX = (this.startPoint.x + this.endPoint.x) / 2;
          const lineMidY = (this.startPoint.y + this.endPoint.y) / 2;
          const offsetX = newViewBoxX - lineMidX;
          const offsetY = newViewBoxY - lineMidY;
          const curveAmount = offsetX * perpX + offsetY * perpY;
          const t1 = 0.33, t2 = 0.67;
          this.controlPoint1 = {
            x: this.startPoint.x + t1 * dx + perpX * curveAmount * (4 / 3),
            y: this.startPoint.y + t1 * dy + perpY * curveAmount * (4 / 3)
          };
          this.controlPoint2 = {
            x: this.startPoint.x + t2 * dx + perpX * curveAmount * (4 / 3),
            y: this.startPoint.y + t2 * dy + perpY * curveAmount * (4 / 3)
          };
        }
        this.draw();
      }
      contains(viewBoxX, viewBoxY) {
        const tolerance = Math.max(5, this.options.strokeWidth * 2) / currentZoom;
        if (this.arrowCurved === "curved" && this.controlPoint1 && this.controlPoint2) {
          return this.pointToCubicBezierDistance(viewBoxX, viewBoxY) <= tolerance;
        } else if (this.arrowCurved === "elbow") {
          const ex = this.elbowX !== null ? this.elbowX : (this.startPoint.x + this.endPoint.x) / 2;
          const d1 = this.pointToLineDistance(viewBoxX, viewBoxY, this.startPoint.x, this.startPoint.y, ex, this.startPoint.y);
          const d2 = this.pointToLineDistance(viewBoxX, viewBoxY, ex, this.startPoint.y, ex, this.endPoint.y);
          const d3 = this.pointToLineDistance(viewBoxX, viewBoxY, ex, this.endPoint.y, this.endPoint.x, this.endPoint.y);
          return Math.min(d1, d2, d3) <= tolerance;
        } else {
          return this.pointToLineDistance(viewBoxX, viewBoxY, this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y) <= tolerance;
        }
      }
      pointToCubicBezierDistance(x, y) {
        let minDistance2 = Infinity;
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const point = this.getCubicBezierPoint(t);
          const distance2 = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          minDistance2 = Math.min(minDistance2, distance2);
        }
        return minDistance2;
      }
      pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
          param = dot / lenSq;
        }
        let xx, yy;
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
      }
      updateStyle(newOptions) {
        if (newOptions.arrowOutlineStyle !== void 0) {
          this.arrowOutlineStyle = newOptions.arrowOutlineStyle;
          const style = this.arrowOutlineStyle;
          this.options.strokeDasharray = style === "dashed" ? "10,10" : style === "dotted" ? "2,8" : "";
        }
        if (newOptions.arrowHeadStyle !== void 0) {
          this.arrowHeadStyle = newOptions.arrowHeadStyle;
        }
        if (newOptions.arrowCurved !== void 0) {
          const wasCurved = this.arrowCurved;
          this.arrowCurved = newOptions.arrowCurved;
          if (this.arrowCurved === "curved" && wasCurved !== "curved") {
            this.initializeCurveControlPoints();
          } else if (this.arrowCurved !== "curved") {
            this.controlPoint1 = null;
            this.controlPoint2 = null;
          }
          if (this.arrowCurved !== "elbow") {
            this.elbowX = null;
          }
        }
        if (newOptions.elbowX !== void 0) {
          this.elbowX = newOptions.elbowX;
        }
        if (newOptions.stroke !== void 0) {
          this.options.stroke = newOptions.stroke;
        }
        if (newOptions.strokeWidth !== void 0) {
          this.options.strokeWidth = parseFloat(newOptions.strokeWidth);
        }
        if (newOptions.arrowCurveAmount !== void 0) {
          this.arrowCurveAmount = newOptions.arrowCurveAmount;
          if (this.arrowCurved) {
            this.initializeCurveControlPoints();
          }
        }
        Object.keys(newOptions).forEach((key) => newOptions[key] === void 0 && delete newOptions[key]);
        this.options = { ...this.options, ...newOptions };
        if (this.arrowOutlineStyle === "solid" && this.options.strokeDasharray) {
          delete this.options.strokeDasharray;
        }
        this.draw();
      }
      updateSidebar() {
      }
      destroy() {
        if (this.group && this.group.parentNode) {
          this.group.parentNode.removeChild(this.group);
        }
        const index = shapes.indexOf(this);
        if (index > -1) {
          shapes.splice(index, 1);
        }
        if (currentShape === this) {
          currentShape = null;
        }
      }
    };
  }
});

// src/core/UndoRedo.js
var UndoRedo_exports = {};
__export(UndoRedo_exports, {
  getCurrentSelectedElement: () => getCurrentSelectedElement,
  pushCreateAction: () => pushCreateAction,
  pushCreateActionWithAttachments: () => pushCreateActionWithAttachments,
  pushDeleteAction: () => pushDeleteAction,
  pushDeleteActionWithAttachments: () => pushDeleteActionWithAttachments,
  pushFrameAttachmentAction: () => pushFrameAttachmentAction,
  pushOptionsChangeAction: () => pushOptionsChangeAction,
  pushTransformAction: () => pushTransformAction2,
  redo: () => redo,
  setTextReferences: () => setTextReferences,
  undo: () => undo,
  updateSelectedElement: () => updateSelectedElement
});
function setTextReferences(element, updateFn, svgElement) {
  selectedElement = element;
  updateSelectionFeedback = updateFn;
  svg2 = svgElement;
}
function getCurrentSelectedElement() {
  return selectedElement;
}
function updateSelectedElement(element) {
  selectedElement = element;
}
function pushCreateAction(shape) {
  undoStack.push({
    type: "create",
    shape
  });
  redoStack.length = 0;
}
function pushDeleteAction(shape) {
  undoStack.push({
    type: "delete",
    shape
  });
  redoStack.length = 0;
}
function pushDeleteActionWithAttachments(shape) {
  let affectedArrows = [];
  if (shape.type === "text" || shape.shapeName === "text") {
    affectedArrows = shapes.filter((s) => s.shapeName === "arrow" && (s.attachedToStart?.shape === shape || s.attachedToEnd?.shape === shape)).map((arrow) => ({
      arrow,
      oldAttachments: arrow.getAttachmentState(),
      oldPoints: {
        startPoint: { ...arrow.startPoint },
        endPoint: { ...arrow.endPoint }
      }
    }));
  }
  undoStack.push({
    type: "delete",
    shape,
    affectedArrows
  });
  redoStack.length = 0;
}
function pushFrameAttachmentAction(frame, shape, action, oldFrame = null) {
  undoStack.push({
    type: "frameAttachment",
    frame,
    shape,
    action,
    // 'attach' or 'detach'
    oldFrame,
    // Previous frame if shape was moved between frames
    // Store shape position for potential restoration
    shapeState: {
      x: shape.x,
      y: shape.y,
      width: shape.width || 0,
      height: shape.height || 0,
      rotation: shape.rotation || 0
    }
  });
  redoStack.length = 0;
}
function pushCreateActionWithAttachments(shape) {
  undoStack.push({
    type: "create",
    shape,
    // Store any arrows that might need to reattach when this is undone
    potentialAttachments: []
  });
  redoStack.length = 0;
}
function pushTransformAction2(shape, oldPos, newPos) {
  if (shape.shapeName === "frame") {
    const containedShapesStates = shape.containedShapes.map((containedShape) => ({
      shape: containedShape,
      oldState: {
        x: containedShape.x - (newPos.x - oldPos.x),
        y: containedShape.y - (newPos.y - oldPos.y),
        width: containedShape.width || 0,
        height: containedShape.height || 0,
        rotation: containedShape.rotation || 0
      },
      newState: {
        x: containedShape.x,
        y: containedShape.y,
        width: containedShape.width || 0,
        height: containedShape.height || 0,
        rotation: containedShape.rotation || 0
      }
    }));
    undoStack.push({
      type: "frameTransform",
      shape,
      oldPos: {
        x: oldPos.x,
        y: oldPos.y,
        width: oldPos.width,
        height: oldPos.height,
        rotation: oldPos.rotation,
        frameName: oldPos.frameName || shape.frameName
      },
      newPos: {
        x: newPos.x,
        y: newPos.y,
        width: newPos.width,
        height: newPos.height,
        rotation: newPos.rotation,
        frameName: newPos.frameName || shape.frameName
      },
      containedShapes: containedShapesStates
    });
  } else if (shape.type === "text") {
    const currentFrame2 = shape.parentFrame || null;
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        x: oldPos.x,
        y: oldPos.y,
        rotation: oldPos.rotation,
        fontSize: oldPos.fontSize
      },
      newPos: {
        x: newPos.x,
        y: newPos.y,
        rotation: newPos.rotation,
        fontSize: newPos.fontSize
      },
      // Track frame attachment state
      frameAttachment: {
        oldFrame: oldPos.parentFrame || null,
        newFrame: currentFrame2
      },
      // Store affected arrows with their attachment states
      affectedArrows: shapes.filter((s) => s.shapeName === "arrow" && (s.attachedToStart?.shape === shape || s.attachedToEnd?.shape === shape)).map((arrow) => ({
        arrow,
        oldAttachments: arrow.getAttachmentState(),
        oldPoints: {
          startPoint: { ...arrow.startPoint },
          endPoint: { ...arrow.endPoint }
        }
      }))
    });
  } else if (shape.type === "image") {
    const currentFrame2 = shape.parentFrame || null;
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        x: oldPos.x,
        y: oldPos.y,
        width: oldPos.width,
        height: oldPos.height,
        rotation: oldPos.rotation
      },
      newPos: {
        x: newPos.x,
        y: newPos.y,
        width: newPos.width,
        height: newPos.height,
        rotation: newPos.rotation
      },
      // Track frame attachment state
      frameAttachment: {
        oldFrame: oldPos.parentFrame || null,
        newFrame: currentFrame2
      },
      // Store affected arrows with their attachment states
      affectedArrows: shapes.filter((s) => s.shapeName === "arrow" && (s.attachedToStart?.shape === shape || s.attachedToEnd?.shape === shape)).map((arrow) => ({
        arrow,
        oldAttachments: arrow.getAttachmentState(),
        oldPoints: {
          startPoint: { ...arrow.startPoint },
          endPoint: { ...arrow.endPoint }
        }
      }))
    });
  } else if (shape.shapeName === "circle") {
    const currentFrame2 = shape.parentFrame || null;
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        x: oldPos.x,
        y: oldPos.y,
        rx: oldPos.rx,
        ry: oldPos.ry,
        rotation: oldPos.rotation
      },
      newPos: {
        x: newPos.x,
        y: newPos.y,
        rx: newPos.rx,
        ry: newPos.ry,
        rotation: newPos.rotation
      },
      // Track frame attachment state
      frameAttachment: {
        oldFrame: oldPos.parentFrame || null,
        newFrame: currentFrame2
      },
      // Store affected arrows with their attachment states
      affectedArrows: shapes.filter((s) => s.shapeName === "arrow" && (s.attachedToStart?.shape === shape || s.attachedToEnd?.shape === shape)).map((arrow) => ({
        arrow,
        oldAttachments: arrow.getAttachmentState(),
        oldPoints: {
          startPoint: { ...arrow.startPoint },
          endPoint: { ...arrow.endPoint }
        }
      }))
    });
  } else if (shape.shapeName === "rectangle") {
    const currentFrame2 = shape.parentFrame || null;
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        x: oldPos.x,
        y: oldPos.y,
        width: oldPos.width,
        height: oldPos.height,
        rotation: oldPos.rotation
      },
      newPos: {
        x: newPos.x,
        y: newPos.y,
        width: newPos.width,
        height: newPos.height,
        rotation: newPos.rotation
      },
      // Track frame attachment state
      frameAttachment: {
        oldFrame: oldPos.parentFrame || null,
        newFrame: currentFrame2
      },
      // Store affected arrows with their attachment states
      affectedArrows: shapes.filter((s) => s.shapeName === "arrow" && (s.attachedToStart?.shape === shape || s.attachedToEnd?.shape === shape)).map((arrow) => ({
        arrow,
        oldAttachments: arrow.getAttachmentState(),
        oldPoints: {
          startPoint: { ...arrow.startPoint },
          endPoint: { ...arrow.endPoint }
        }
      }))
    });
  } else if (shape.shapeName === "line") {
    const currentFrame2 = shape.parentFrame || null;
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        startPoint: { x: oldPos.startPoint.x, y: oldPos.startPoint.y },
        endPoint: { x: oldPos.endPoint.x, y: oldPos.endPoint.y },
        controlPoint: oldPos.controlPoint ? { x: oldPos.controlPoint.x, y: oldPos.controlPoint.y } : null,
        isCurved: oldPos.isCurved || false
      },
      newPos: {
        startPoint: { x: newPos.startPoint.x, y: newPos.startPoint.y },
        endPoint: { x: newPos.endPoint.x, y: newPos.endPoint.y },
        controlPoint: newPos.controlPoint ? { x: newPos.controlPoint.x, y: newPos.controlPoint.y } : null,
        isCurved: newPos.isCurved || false
      },
      // Track frame attachment state
      frameAttachment: {
        oldFrame: oldPos.parentFrame || null,
        newFrame: currentFrame2
      }
    });
  } else if (shape.shapeName === "arrow") {
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        startPoint: { x: oldPos.startPoint.x, y: oldPos.startPoint.y },
        endPoint: { x: oldPos.endPoint.x, y: oldPos.endPoint.y },
        controlPoint1: oldPos.controlPoint1 ? { x: oldPos.controlPoint1.x, y: oldPos.controlPoint1.y } : null,
        controlPoint2: oldPos.controlPoint2 ? { x: oldPos.controlPoint2.x, y: oldPos.controlPoint2.y } : null,
        attachments: oldPos.attachments || shape.getAttachmentState()
      },
      newPos: {
        startPoint: { x: newPos.startPoint.x, y: newPos.startPoint.y },
        endPoint: { x: newPos.endPoint.x, y: newPos.endPoint.y },
        controlPoint1: newPos.controlPoint1 ? { x: newPos.controlPoint1.x, y: newPos.controlPoint1.y } : null,
        controlPoint2: newPos.controlPoint2 ? { x: newPos.controlPoint2.x, y: newPos.controlPoint2.y } : null,
        attachments: newPos.attachments || shape.getAttachmentState()
      }
    });
  } else if (shape.type === "icon") {
    const currentFrame2 = shape.parentFrame || null;
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        x: oldPos.x,
        y: oldPos.y,
        width: oldPos.width,
        height: oldPos.height,
        rotation: oldPos.rotation
      },
      newPos: {
        x: newPos.x,
        y: newPos.y,
        width: newPos.width,
        height: newPos.height,
        rotation: newPos.rotation
      },
      // Track frame attachment state
      frameAttachment: {
        oldFrame: oldPos.parentFrame || null,
        newFrame: currentFrame2
      },
      // Store affected arrows with their attachment states
      affectedArrows: shapes.filter((s) => s.shapeName === "arrow" && (s.attachedToStart?.shape === shape || s.attachedToEnd?.shape === shape)).map((arrow) => ({
        arrow,
        oldAttachments: arrow.getAttachmentState(),
        oldPoints: {
          startPoint: { ...arrow.startPoint },
          endPoint: { ...arrow.endPoint }
        }
      }))
    });
  } else if (shape.shapeName === "freehandStroke") {
    undoStack.push({
      type: "transform",
      shape,
      oldPos: {
        points: JSON.parse(JSON.stringify(oldPos.points)),
        rotation: oldPos.rotation
      },
      newPos: {
        points: JSON.parse(JSON.stringify(newPos.points)),
        rotation: newPos.rotation
      }
    });
  }
  redoStack.length = 0;
}
function pushOptionsChangeAction(shape, oldOptions) {
  undoStack.push({
    type: "optionsChange",
    shape,
    oldOptions
  });
  redoStack.length = 0;
}
function undo() {
  if (undoStack.length === 0) return;
  const action = undoStack.pop();
  if (action.type === "frameTransform") {
    action.shape.x = action.oldPos.x;
    action.shape.y = action.oldPos.y;
    action.shape.width = action.oldPos.width;
    action.shape.height = action.oldPos.height;
    action.shape.rotation = action.oldPos.rotation;
    action.shape.frameName = action.oldPos.frameName;
    action.containedShapes.forEach((shapeData) => {
      const shape = shapeData.shape;
      shape.x = shapeData.oldState.x;
      shape.y = shapeData.oldState.y;
      shape.width = shapeData.oldState.width;
      shape.height = shapeData.oldState.height;
      shape.rotation = shapeData.oldState.rotation;
      if (typeof shape.draw === "function") {
        shape.draw();
      }
    });
    action.shape.isSelected = false;
    if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
    action.shape.draw();
    action.shape.updateClipPath();
    redoStack.push(action);
    return;
  }
  if (action.type === "frameAttachment") {
    if (action.action === "attach") {
      const frameIndex = action.frame.containedShapes.indexOf(action.shape);
      if (frameIndex > -1) {
        action.frame.containedShapes.splice(frameIndex, 1);
        action.shape.parentFrame = null;
        if (action.shape.group && action.shape.group.parentNode === action.frame.clipGroup) {
          action.frame.clipGroup.removeChild(action.shape.group);
          svg2.appendChild(action.shape.group);
        }
      }
      if (action.oldFrame) {
        action.oldFrame.containedShapes.push(action.shape);
        action.shape.parentFrame = action.oldFrame;
        if (action.shape.group && action.shape.group.parentNode === svg2) {
          svg2.removeChild(action.shape.group);
          action.oldFrame.clipGroup.appendChild(action.shape.group);
        }
      }
    } else if (action.action === "detach") {
      if (!action.frame.containedShapes.includes(action.shape)) {
        action.frame.containedShapes.push(action.shape);
        action.shape.parentFrame = action.frame;
        if (action.shape.group && action.shape.group.parentNode === svg2) {
          svg2.removeChild(action.shape.group);
          action.frame.clipGroup.appendChild(action.shape.group);
        }
      }
    }
    action.shape.x = action.shapeState.x;
    action.shape.y = action.shapeState.y;
    action.shape.width = action.shapeState.width;
    action.shape.height = action.shapeState.height;
    action.shape.rotation = action.shapeState.rotation;
    if (typeof action.shape.draw === "function") {
      action.shape.draw();
    }
    redoStack.push(action);
    return;
  }
  if (action.type === "create" && action.shape.type === "modeConvert") {
    const newShape = action.shape.newShape;
    const newElement = action.shape.newElement;
    const oldShape = action.shape.oldShape;
    const oldElement = action.shape.oldElement;
    if (newElement && newElement.parentNode) {
      newElement.parentNode.removeChild(newElement);
    }
    const newIdx = shapes.indexOf(newShape);
    if (newIdx !== -1) shapes.splice(newIdx, 1);
    if (svg2 && oldElement) {
      svg2.appendChild(oldElement);
    }
    if (oldShape) {
      shapes.push(oldShape);
    }
    redoStack.push(action);
    return;
  }
  if (action.type === "create") {
    if (action.shape.type === "text") {
      if (action.shape.element && action.shape.element.parentNode) {
        action.shape.element.parentNode.removeChild(action.shape.element);
      } else if (action.shape.parentNode) {
        action.shape.parentNode.removeChild(action.shape);
      }
      const idx = shapes.indexOf(action.shape.element || action.shape);
      if (idx !== -1) shapes.splice(idx, 1);
      if (typeof cleanupAttachments === "function") {
        cleanupAttachments(action.shape.element || action.shape);
      }
    } else if (action.shape.type === "image") {
      action.shape.remove();
    } else if (action.shape.type === "icon") {
      action.shape.remove();
    } else {
      const idx = shapes.indexOf(action.shape);
      if (idx !== -1) shapes.splice(idx, 1);
      if (action.shape.group && action.shape.group.parentNode) {
        action.shape.group.parentNode.removeChild(action.shape.group);
      }
      if (action.shape.shapeName === "frame") {
        action.shape.destroy();
      }
    }
    redoStack.push(action);
    return;
  }
  if (action.type === "delete") {
    if (action.shape.type === "text") {
      if (svg2) {
        svg2.appendChild(action.shape.element || action.shape);
        shapes.push(action.shape.element || action.shape);
      }
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          arrow.restoreAttachmentState(arrowData.oldAttachments);
        });
      }
    } else if (action.shape.type === "image") {
      action.shape.restore();
    } else {
      shapes.push(action.shape);
      if (svg2) {
        svg2.appendChild(action.shape.group);
      }
    }
    redoStack.push(action);
    return;
  }
  if (action.type === "transform") {
    if (action.frameAttachment) {
      if (action.frameAttachment.newFrame) {
        const frameIndex = action.frameAttachment.newFrame.containedShapes.indexOf(action.shape);
        if (frameIndex > -1) {
          action.frameAttachment.newFrame.containedShapes.splice(frameIndex, 1);
          if (action.shape.group && action.shape.group.parentNode === action.frameAttachment.newFrame.clipGroup) {
            action.frameAttachment.newFrame.clipGroup.removeChild(action.shape.group);
            svg2.appendChild(action.shape.group);
          }
        }
      }
      if (action.frameAttachment.oldFrame) {
        if (!action.frameAttachment.oldFrame.containedShapes.includes(action.shape)) {
          action.frameAttachment.oldFrame.containedShapes.push(action.shape);
          action.shape.parentFrame = action.frameAttachment.oldFrame;
          if (action.shape.group && action.shape.group.parentNode === svg2) {
            svg2.removeChild(action.shape.group);
            action.frameAttachment.oldFrame.clipGroup.appendChild(action.shape.group);
          }
        }
      } else {
        action.shape.parentFrame = null;
      }
    }
    if (action.shape.type === "text") {
      const textElement = (action.shape.element || action.shape).querySelector("text");
      if (textElement && action.oldPos.fontSize !== void 0) {
        textElement.setAttribute("font-size", action.oldPos.fontSize + "px");
      }
      const centerX = textElement ? textElement.getBBox().x + textElement.getBBox().width / 2 : 0;
      const centerY = textElement ? textElement.getBBox().y + textElement.getBBox().height / 2 : 0;
      (action.shape.element || action.shape).setAttribute(
        "transform",
        `translate(${action.oldPos.x}, ${action.oldPos.y}) rotate(${action.oldPos.rotation}, ${centerX}, ${centerY})`
      );
      (action.shape.element || action.shape).setAttribute("data-x", action.oldPos.x);
      (action.shape.element || action.shape).setAttribute("data-y", action.oldPos.y);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          arrow.restoreAttachmentState(arrowData.oldAttachments);
          arrowData.newPoints = {
            startPoint: { ...arrow.startPoint },
            endPoint: { ...arrow.endPoint }
          };
          arrowData.newAttachments = arrow.getAttachmentState();
        });
      }
      if (selectedElement === (action.shape.element || action.shape) && updateSelectionFeedback) {
        setTimeout(updateSelectionFeedback, 0);
      }
    } else if (action.shape.type === "image") {
      action.shape.restore(action.oldPos);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          arrow.restoreAttachmentState(arrowData.oldAttachments);
          arrowData.newPoints = {
            startPoint: { ...arrow.startPoint },
            endPoint: { ...arrow.endPoint }
          };
          arrowData.newAttachments = arrow.getAttachmentState();
        });
      }
    } else if (action.shape.shapeName === "circle") {
      action.shape.x = action.oldPos.x;
      action.shape.y = action.oldPos.y;
      action.shape.rx = action.oldPos.rx;
      action.shape.ry = action.oldPos.ry;
      action.shape.rotation = action.oldPos.rotation;
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          arrow.restoreAttachmentState(arrowData.oldAttachments);
          arrowData.newPoints = {
            startPoint: { ...arrow.startPoint },
            endPoint: { ...arrow.endPoint }
          };
          arrowData.newAttachments = arrow.getAttachmentState();
        });
      }
    } else if (action.shape.shapeName === "line") {
      action.shape.startPoint = { x: action.oldPos.startPoint.x, y: action.oldPos.startPoint.y };
      action.shape.endPoint = { x: action.oldPos.endPoint.x, y: action.oldPos.endPoint.y };
      action.shape.isCurved = action.oldPos.isCurved || false;
      if (action.oldPos.controlPoint) {
        action.shape.controlPoint = { x: action.oldPos.controlPoint.x, y: action.oldPos.controlPoint.y };
      } else {
        action.shape.controlPoint = null;
      }
      if (action.frameAttachment) {
        if (action.frameAttachment.newFrame) {
          const frameIndex = action.frameAttachment.newFrame.containedShapes.indexOf(action.shape);
          if (frameIndex > -1) {
            action.frameAttachment.newFrame.containedShapes.splice(frameIndex, 1);
            if (action.shape.group && action.shape.group.parentNode === action.frameAttachment.newFrame.clipGroup) {
              action.frameAttachment.newFrame.clipGroup.removeChild(action.shape.group);
              svg2.appendChild(action.shape.group);
            }
          }
        }
        if (action.frameAttachment.oldFrame) {
          if (!action.frameAttachment.oldFrame.containedShapes.includes(action.shape)) {
            action.frameAttachment.oldFrame.containedShapes.push(action.shape);
            action.shape.parentFrame = action.frameAttachment.oldFrame;
            if (action.shape.group && action.shape.group.parentNode === svg2) {
              svg2.removeChild(action.shape.group);
              action.frameAttachment.oldFrame.clipGroup.appendChild(action.shape.group);
            }
          }
        } else {
          action.shape.parentFrame = null;
        }
      }
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
    } else if (action.shape.shapeName === "arrow") {
      action.shape.startPoint = { x: action.oldPos.startPoint.x, y: action.oldPos.startPoint.y };
      action.shape.endPoint = { x: action.oldPos.endPoint.x, y: action.oldPos.endPoint.y };
      action.shape.controlPoint1 = action.oldPos.controlPoint1 ? { x: action.oldPos.controlPoint1.x, y: action.oldPos.controlPoint1.y } : null;
      action.shape.controlPoint2 = action.oldPos.controlPoint2 ? { x: action.oldPos.controlPoint2.x, y: action.oldPos.controlPoint2.y } : null;
      if (action.oldPos.attachments) {
        action.shape.restoreAttachmentState(action.oldPos.attachments);
      } else {
        action.shape.attachedToStart = null;
        action.shape.attachedToEnd = null;
      }
      action.shape.isSelected = false;
      action.shape.draw();
    } else if (action.shape.type === "icon") {
      action.shape.restore(action.oldPos);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          arrow.restoreAttachmentState(arrowData.oldAttachments);
          arrowData.newPoints = {
            startPoint: { ...arrow.startPoint },
            endPoint: { ...arrow.endPoint }
          };
          arrowData.newAttachments = arrow.getAttachmentState();
        });
      }
    } else if (action.shape.shapeName === "freehandStroke") {
      action.shape.points = JSON.parse(JSON.stringify(action.oldPos.points));
      action.shape.rotation = action.oldPos.rotation;
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
    } else if (action.shape.shapeName === "rectangle") {
      action.shape.x = action.oldPos.x;
      action.shape.y = action.oldPos.y;
      action.shape.height = action.oldPos.height;
      action.shape.width = action.oldPos.width;
      action.shape.rotation = action.oldPos.rotation;
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          arrow.restoreAttachmentState(arrowData.oldAttachments);
          arrowData.newPoints = {
            startPoint: { ...arrow.startPoint },
            endPoint: { ...arrow.endPoint }
          };
          arrowData.newAttachments = arrow.getAttachmentState();
        });
      }
    }
    redoStack.push(action);
    return;
  }
  if (action.type === "optionsChange") {
    if (action.shape.type === "text") {
      const textElement = (action.shape.element || action.shape).querySelector("text");
      if (textElement) {
        if (action.oldOptions.color) textElement.setAttribute("fill", action.oldOptions.color);
        if (action.oldOptions.font) textElement.setAttribute("font-family", action.oldOptions.font);
        if (action.oldOptions.size) textElement.setAttribute("font-size", action.oldOptions.size);
        if (action.oldOptions.align) textElement.setAttribute("text-anchor", action.oldOptions.align);
        if (selectedElement === (action.shape.element || action.shape) && updateSelectionFeedback) {
          setTimeout(updateSelectionFeedback, 0);
        }
      }
    } else if (action.shape.shapeName === "arrow") {
      action.shape.options = { ...action.oldOptions };
      action.shape.arrowOutlineStyle = action.oldOptions.arrowOutlineStyle;
      action.shape.arrowHeadStyle = action.oldOptions.arrowHeadStyle;
      action.shape.arrowCurved = action.oldOptions.arrowCurved;
      action.shape.arrowCurveAmount = action.oldOptions.arrowCurveAmount;
      action.shape.draw();
    } else {
      action.shape.options = action.oldOptions;
      action.shape.draw();
    }
    redoStack.push(action);
    return;
  }
}
function redo() {
  if (redoStack.length === 0) return;
  const action = redoStack.pop();
  if (action.type === "frameTransform") {
    action.shape.x = action.newPos.x;
    action.shape.y = action.newPos.y;
    action.shape.width = action.newPos.width;
    action.shape.height = action.newPos.height;
    action.shape.rotation = action.newPos.rotation;
    action.shape.frameName = action.newPos.frameName;
    action.containedShapes.forEach((shapeData) => {
      const shape = shapeData.shape;
      shape.x = shapeData.newState.x;
      shape.y = shapeData.newState.y;
      shape.width = shapeData.newState.width;
      shape.height = shapeData.newState.height;
      shape.rotation = shapeData.newState.rotation;
      if (typeof shape.draw === "function") {
        shape.draw();
      }
    });
    action.shape.isSelected = false;
    if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
    action.shape.draw();
    action.shape.updateClipPath();
    undoStack.push(action);
    return;
  }
  if (action.type === "frameAttachment") {
    if (action.action === "attach") {
      if (action.oldFrame) {
        const oldFrameIndex = action.oldFrame.containedShapes.indexOf(action.shape);
        if (oldFrameIndex > -1) {
          action.oldFrame.containedShapes.splice(oldFrameIndex, 1);
          if (action.shape.group && action.shape.group.parentNode === action.oldFrame.clipGroup) {
            action.oldFrame.clipGroup.removeChild(action.shape.group);
            svg2.appendChild(action.shape.group);
          }
        }
      }
      if (!action.frame.containedShapes.includes(action.shape)) {
        action.frame.containedShapes.push(action.shape);
        action.shape.parentFrame = action.frame;
        if (action.shape.group && action.shape.group.parentNode === svg2) {
          svg2.removeChild(action.shape.group);
          action.frame.clipGroup.appendChild(action.shape.group);
        }
      }
    } else if (action.action === "detach") {
      const frameIndex = action.frame.containedShapes.indexOf(action.shape);
      if (frameIndex > -1) {
        action.frame.containedShapes.splice(frameIndex, 1);
        action.shape.parentFrame = null;
        if (action.shape.group && action.shape.group.parentNode === action.frame.clipGroup) {
          action.frame.clipGroup.removeChild(action.shape.group);
          svg2.appendChild(action.shape.group);
        }
      }
    }
    if (typeof action.shape.draw === "function") {
      action.shape.draw();
    }
    undoStack.push(action);
    return;
  }
  if (action.type === "create" && action.shape.type === "modeConvert") {
    const newShape = action.shape.newShape;
    const newElement = action.shape.newElement;
    const oldShape = action.shape.oldShape;
    const oldElement = action.shape.oldElement;
    if (oldElement && oldElement.parentNode) {
      oldElement.parentNode.removeChild(oldElement);
    }
    const oldIdx = shapes.indexOf(oldShape);
    if (oldIdx !== -1) shapes.splice(oldIdx, 1);
    if (svg2 && newElement) {
      svg2.appendChild(newElement);
    }
    if (newShape) {
      shapes.push(newShape);
    }
    undoStack.push(action);
    return;
  }
  if (action.type === "create") {
    if (action.shape.type === "text") {
      if (svg2) {
        svg2.appendChild(action.shape.element || action.shape);
        shapes.push(action.shape.element || action.shape);
      }
    } else if (action.shape.type === "image") {
      action.shape.restore();
    } else if (action.shape.type === "icon") {
      if (svg2 && action.shape.group) {
        svg2.appendChild(action.shape.group);
      }
      if (shapes.indexOf(action.shape) === -1) {
        shapes.push(action.shape);
      }
    } else {
      shapes.push(action.shape);
      if (svg2) {
        svg2.appendChild(action.shape.group);
      }
    }
    undoStack.push(action);
    return;
  }
  if (action.type === "delete") {
    if (action.shape.type === "text") {
      if ((action.shape.element || action.shape).parentNode) {
        (action.shape.element || action.shape).parentNode.removeChild(action.shape.element || action.shape);
      }
      const idx = shapes.indexOf(action.shape.element || action.shape);
      if (idx !== -1) shapes.splice(idx, 1);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          if (arrow.attachedToStart && arrow.attachedToStart.shape === (action.shape.element || action.shape)) {
            arrow.detachFromShape(true);
          }
          if (arrow.attachedToEnd && arrow.attachedToEnd.shape === (action.shape.element || action.shape)) {
            arrow.detachFromShape(false);
          }
          arrow.draw();
        });
      }
    } else if (action.shape.type === "image") {
      action.shape.remove();
    } else {
      const idx = shapes.indexOf(action.shape);
      if (idx !== -1) shapes.splice(idx, 1);
      if (action.shape.group && action.shape.group.parentNode) {
        action.shape.group.parentNode.removeChild(action.shape.group);
      }
      if (action.shape.shapeName === "frame") {
        action.shape.destroy();
      }
    }
    undoStack.push(action);
    return;
  }
  if (action.type === "transform") {
    if (action.frameAttachment) {
      if (action.frameAttachment.oldFrame) {
        const oldFrameIndex = action.frameAttachment.oldFrame.containedShapes.indexOf(action.shape);
        if (oldFrameIndex > -1) {
          action.frameAttachment.oldFrame.containedShapes.splice(oldFrameIndex, 1);
          if (action.shape.group && action.shape.group.parentNode === action.frameAttachment.oldFrame.clipGroup) {
            action.frameAttachment.oldFrame.clipGroup.removeChild(action.shape.group);
            svg2.appendChild(action.shape.group);
          }
        }
      }
      if (action.frameAttachment.newFrame) {
        if (!action.frameAttachment.newFrame.containedShapes.includes(action.shape)) {
          action.frameAttachment.newFrame.containedShapes.push(action.shape);
          action.shape.parentFrame = action.frameAttachment.newFrame;
          if (action.shape.group && action.shape.group.parentNode === svg2) {
            svg2.removeChild(action.shape.group);
            action.frameAttachment.newFrame.clipGroup.appendChild(action.shape.group);
          }
        }
      } else {
        action.shape.parentFrame = null;
      }
    }
    if (action.shape.type === "text") {
      const textElement = (action.shape.element || action.shape).querySelector("text");
      if (textElement && action.newPos.fontSize !== void 0) {
        textElement.setAttribute("font-size", action.newPos.fontSize + "px");
      }
      const centerX = textElement ? textElement.getBBox().x + textElement.getBBox().width / 2 : 0;
      const centerY = textElement ? textElement.getBBox().y + textElement.getBBox().height / 2 : 0;
      (action.shape.element || action.shape).setAttribute(
        "transform",
        `translate(${action.newPos.x}, ${action.newPos.y}) rotate(${action.newPos.rotation}, ${centerX}, ${centerY})`
      );
      (action.shape.element || action.shape).setAttribute("data-x", action.newPos.x);
      (action.shape.element || action.shape).setAttribute("data-y", action.newPos.y);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          if (arrowData.newAttachments) {
            arrow.restoreAttachmentState(arrowData.newAttachments);
          } else {
            arrow.updateAttachments();
          }
        });
      }
      if (selectedElement === (action.shape.element || action.shape) && updateSelectionFeedback) {
        setTimeout(updateSelectionFeedback, 0);
      }
    } else if (action.shape.type === "image") {
      action.shape.restore(action.newPos);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          if (arrowData.newAttachments) {
            arrow.restoreAttachmentState(arrowData.newAttachments);
          } else {
            arrow.updateAttachments();
          }
        });
      }
    } else if (action.shape.shapeName === "circle") {
      action.shape.x = action.newPos.x;
      action.shape.y = action.newPos.y;
      action.shape.rx = action.newPos.rx;
      action.shape.ry = action.newPos.ry;
      action.shape.rotation = action.newPos.rotation;
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          if (arrowData.newAttachments) {
            arrow.restoreAttachmentState(arrowData.newAttachments);
          } else {
            arrow.updateAttachments();
          }
        });
      }
    } else if (action.shape.shapeName === "line") {
      action.shape.startPoint = { x: action.newPos.startPoint.x, y: action.newPos.startPoint.y };
      action.shape.endPoint = { x: action.newPos.endPoint.x, y: action.newPos.endPoint.y };
      action.shape.isCurved = action.newPos.isCurved || false;
      if (action.newPos.controlPoint) {
        action.shape.controlPoint = { x: action.newPos.controlPoint.x, y: action.newPos.controlPoint.y };
      } else {
        action.shape.controlPoint = null;
      }
      if (action.frameAttachment) {
        if (action.frameAttachment.oldFrame) {
          const oldFrameIndex = action.frameAttachment.oldFrame.containedShapes.indexOf(action.shape);
          if (oldFrameIndex > -1) {
            action.frameAttachment.oldFrame.containedShapes.splice(oldFrameIndex, 1);
            if (action.shape.group && action.shape.group.parentNode === action.frameAttachment.oldFrame.clipGroup) {
              action.frameAttachment.oldFrame.clipGroup.removeChild(action.shape.group);
              svg2.appendChild(action.shape.group);
            }
          }
        }
        if (action.frameAttachment.newFrame) {
          if (!action.frameAttachment.newFrame.containedShapes.includes(action.shape)) {
            action.frameAttachment.newFrame.containedShapes.push(action.shape);
            action.shape.parentFrame = action.frameAttachment.newFrame;
            if (action.shape.group && action.shape.group.parentNode === svg2) {
              svg2.removeChild(action.shape.group);
              action.frameAttachment.newFrame.clipGroup.appendChild(action.shape.group);
            }
          }
        } else {
          action.shape.parentFrame = null;
        }
      }
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
    } else if (action.shape.shapeName === "arrow") {
      action.shape.startPoint = { x: action.newPos.startPoint.x, y: action.newPos.startPoint.y };
      action.shape.endPoint = { x: action.newPos.endPoint.x, y: action.newPos.endPoint.y };
      action.shape.controlPoint1 = action.newPos.controlPoint1 ? { x: action.newPos.controlPoint1.x, y: action.newPos.controlPoint1.y } : null;
      action.shape.controlPoint2 = action.newPos.controlPoint2 ? { x: action.newPos.controlPoint2.x, y: action.newPos.controlPoint2.y } : null;
      if (action.newPos.attachments) {
        action.shape.restoreAttachmentState(action.newPos.attachments);
      } else {
        action.shape.attachedToStart = null;
        action.shape.attachedToEnd = null;
      }
      action.shape.isSelected = false;
      action.shape.draw();
    } else if (action.shape.type === "icon") {
      action.shape.restore(action.newPos);
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          if (arrowData.newAttachments) {
            arrow.restoreAttachmentState(arrowData.newAttachments);
          } else {
            arrow.updateAttachments();
          }
        });
      }
    } else if (action.shape.shapeName === "freehandStroke") {
      action.shape.points = JSON.parse(JSON.stringify(action.newPos.points));
      action.shape.rotation = action.newPos.rotation;
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
    } else if (action.shape.shapeName === "rectangle") {
      action.shape.x = action.newPos.x;
      action.shape.y = action.newPos.y;
      action.shape.height = action.newPos.height;
      action.shape.width = action.newPos.width;
      action.shape.rotation = action.newPos.rotation;
      action.shape.isSelected = false;
      if (typeof action.shape.removeSelection === "function") action.shape.removeSelection();
      action.shape.draw();
      if (action.affectedArrows) {
        action.affectedArrows.forEach((arrowData) => {
          const arrow = arrowData.arrow;
          if (arrowData.newAttachments) {
            arrow.restoreAttachmentState(arrowData.newAttachments);
          } else {
            arrow.updateAttachments();
          }
        });
      }
    }
    undoStack.push(action);
    return;
  }
  if (action.type === "optionsChange") {
    if (action.shape.type === "text") {
      const textElement = (action.shape.element || action.shape).querySelector("text");
      if (textElement) {
        if (action.newOptions.color) textElement.setAttribute("fill", action.newOptions.color);
        if (action.newOptions.font) textElement.setAttribute("font-family", action.newOptions.font);
        if (action.newOptions.size) textElement.setAttribute("font-size", action.newOptions.size);
        if (action.newOptions.align) textElement.setAttribute("text-anchor", action.newOptions.align);
        if (selectedElement === (action.shape.element || action.shape) && updateSelectionFeedback) {
          setTimeout(updateSelectionFeedback, 0);
        }
      }
    } else if (action.shape.shapeName === "arrow") {
      const currentOptions = {
        ...action.shape.options,
        arrowOutlineStyle: action.shape.arrowOutlineStyle,
        arrowHeadStyle: action.shape.arrowHeadStyle,
        arrowCurved: action.shape.arrowCurved,
        arrowCurveAmount: action.shape.arrowCurveAmount
      };
      action.newOptions = currentOptions;
      action.shape.draw();
    } else {
      action.newOptions = action.shape.options;
      action.shape.draw();
    }
    undoStack.push(action);
    return;
  }
}
var undoStack, redoStack, selectedElement, updateSelectionFeedback, svg2;
var init_UndoRedo = __esm({
  "src/core/UndoRedo.js"() {
    undoStack = [];
    redoStack = [];
    selectedElement = null;
    updateSelectionFeedback = null;
    svg2 = null;
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.shiftKey && e.key === "z")) {
        e.preventDefault();
        redo();
      }
    });
    document.getElementById("undo")?.addEventListener("click", undo);
    document.getElementById("redo")?.addEventListener("click", redo);
    window.pushCreateAction = pushCreateAction;
    window.pushDeleteAction = pushDeleteAction;
    window.pushDeleteActionWithAttachments = pushDeleteActionWithAttachments;
    window.pushTransformAction = pushTransformAction2;
    window.pushOptionsChangeAction = pushOptionsChangeAction;
    window.pushCreateActionWithAttachments = pushCreateActionWithAttachments;
    window.undo = undo;
    window.redo = redo;
  }
});

// src/core/SnapGuides.js
function ensureGuideLayer() {
  if (guideLayer && guideLayer.parentNode) return guideLayer;
  const svg3 = window.svg;
  if (!svg3) return null;
  guideLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  guideLayer.setAttribute("id", "snap-guides");
  guideLayer.setAttribute("pointer-events", "none");
  svg3.appendChild(guideLayer);
  return guideLayer;
}
function clearGuides() {
  if (guideLayer) {
    while (guideLayer.firstChild) guideLayer.removeChild(guideLayer.firstChild);
  }
}
function drawGuide(x1, y1, x2, y2) {
  const layer = ensureGuideLayer();
  if (!layer) return;
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", GUIDE_COLOR);
  line.setAttribute("stroke-width", GUIDE_WIDTH);
  line.setAttribute("stroke-dasharray", "4 2");
  layer.appendChild(line);
}
function getShapeBounds(shape) {
  if (!shape) return null;
  const name = shape.shapeName;
  if (name === "rectangle" || name === "frame") {
    return {
      left: shape.x,
      top: shape.y,
      right: shape.x + shape.width,
      bottom: shape.y + shape.height,
      cx: shape.x + shape.width / 2,
      cy: shape.y + shape.height / 2
    };
  }
  if (name === "circle") {
    return {
      left: shape.x - shape.rx,
      top: shape.y - shape.ry,
      right: shape.x + shape.rx,
      bottom: shape.y + shape.ry,
      cx: shape.x,
      cy: shape.y
    };
  }
  if (name === "text" || name === "code" || name === "image" || name === "icon") {
    const el = shape.group || shape.element;
    if (!el) return null;
    const bbox = el.getBBox();
    return {
      left: bbox.x,
      top: bbox.y,
      right: bbox.x + bbox.width,
      bottom: bbox.y + bbox.height,
      cx: bbox.x + bbox.width / 2,
      cy: bbox.y + bbox.height / 2
    };
  }
  if (name === "line" || name === "arrow") {
    const sx = shape.startPoint?.x ?? 0;
    const sy = shape.startPoint?.y ?? 0;
    const ex = shape.endPoint?.x ?? 0;
    const ey = shape.endPoint?.y ?? 0;
    return {
      left: Math.min(sx, ex),
      top: Math.min(sy, ey),
      right: Math.max(sx, ex),
      bottom: Math.max(sy, ey),
      cx: (sx + ex) / 2,
      cy: (sy + ey) / 2
    };
  }
  return null;
}
function getCanvasGuides() {
  const vb = window.currentViewBox;
  if (!vb) return [];
  return [
    {
      // Viewport center
      left: vb.x + vb.width / 2,
      top: vb.y + vb.height / 2,
      right: vb.x + vb.width / 2,
      bottom: vb.y + vb.height / 2,
      cx: vb.x + vb.width / 2,
      cy: vb.y + vb.height / 2
    },
    {
      // Viewport edges
      left: vb.x,
      top: vb.y,
      right: vb.x + vb.width,
      bottom: vb.y + vb.height,
      cx: vb.x + vb.width / 2,
      cy: vb.y + vb.height / 2
    }
  ];
}
function calculateSnap(movingShape, shiftKey = false, mouseX, mouseY) {
  clearGuides();
  const shapes2 = window.shapes;
  if (!shapes2 || !movingShape) return { dx: 0, dy: 0 };
  const moving = getShapeBounds(movingShape);
  if (!moving) return { dx: 0, dy: 0 };
  if (activeSnapX && mouseX !== void 0) {
    if (Math.abs(mouseX - activeSnapX.mouseAtSnap) > BREAK_THRESHOLD) {
      activeSnapX = null;
    }
  }
  if (activeSnapY && mouseY !== void 0) {
    if (Math.abs(mouseY - activeSnapY.mouseAtSnap) > BREAK_THRESHOLD) {
      activeSnapY = null;
    }
  }
  let snapX = null;
  let snapY = null;
  let bestDistX = SNAP_THRESHOLD;
  let bestDistY = SNAP_THRESHOLD;
  const movingXs = [moving.left, moving.cx, moving.right];
  const movingYs = [moving.top, moving.cy, moving.bottom];
  const vb = window.currentViewBox;
  const extendY1 = vb ? vb.y : 0;
  const extendY2 = vb ? vb.y + vb.height : 1e4;
  const extendX1 = vb ? vb.x : 0;
  const extendX2 = vb ? vb.x + vb.width : 1e4;
  let otherShapeCount = 0;
  for (const shape of shapes2) {
    if (shape === movingShape) continue;
    if (window.multiSelection && window.multiSelection.selectedShapes?.has(shape)) continue;
    const other = getShapeBounds(shape);
    if (!other) continue;
    otherShapeCount++;
    const otherXs = [other.left, other.cx, other.right];
    const otherYs = [other.top, other.cy, other.bottom];
    for (const mx of movingXs) {
      for (const ox of otherXs) {
        const dist = Math.abs(mx - ox);
        if (dist < bestDistX) {
          bestDistX = dist;
          snapX = { offset: ox - mx, x: ox, extendY1, extendY2 };
        }
      }
    }
    for (const my of movingYs) {
      for (const oy of otherYs) {
        const dist = Math.abs(my - oy);
        if (dist < bestDistY) {
          bestDistY = dist;
          snapY = { offset: oy - my, y: oy, extendX1, extendX2 };
        }
      }
    }
  }
  if (shiftKey || otherShapeCount === 0 || !snapX && !snapY) {
    const canvasGuides = getCanvasGuides();
    for (const guide of canvasGuides) {
      const guideXs = [guide.left, guide.cx, guide.right];
      const guideYs = [guide.top, guide.cy, guide.bottom];
      for (const mx of movingXs) {
        for (const gx of guideXs) {
          const dist = Math.abs(mx - gx);
          if (dist < bestDistX) {
            bestDistX = dist;
            snapX = { offset: gx - mx, x: gx, extendY1, extendY2 };
          }
        }
      }
      for (const my of movingYs) {
        for (const gy of guideYs) {
          const dist = Math.abs(my - gy);
          if (dist < bestDistY) {
            bestDistY = dist;
            snapY = { offset: gy - my, y: gy, extendX1, extendX2 };
          }
        }
      }
    }
  }
  let dx = 0;
  let dy = 0;
  if (snapX && !activeSnapX) {
    dx = snapX.offset;
    drawGuide(snapX.x, snapX.extendY1, snapX.x, snapX.extendY2);
    if (mouseX !== void 0) {
      activeSnapX = { guideValue: snapX.x, mouseAtSnap: mouseX };
    }
  } else if (activeSnapX) {
    drawGuide(activeSnapX.guideValue, extendY1, activeSnapX.guideValue, extendY2);
  }
  if (snapY && !activeSnapY) {
    dy = snapY.offset;
    drawGuide(snapY.extendX1, snapY.y, snapY.extendX2, snapY.y);
    if (mouseY !== void 0) {
      activeSnapY = { guideValue: snapY.y, mouseAtSnap: mouseY };
    }
  } else if (activeSnapY) {
    drawGuide(extendX1, activeSnapY.guideValue, extendX2, activeSnapY.guideValue);
  }
  return { dx, dy };
}
function clearSnapGuides() {
  clearGuides();
  activeSnapX = null;
  activeSnapY = null;
}
var SNAP_THRESHOLD, BREAK_THRESHOLD, GUIDE_COLOR, GUIDE_WIDTH, guideLayer, activeSnapX, activeSnapY;
var init_SnapGuides = __esm({
  "src/core/SnapGuides.js"() {
    SNAP_THRESHOLD = 6;
    BREAK_THRESHOLD = 12;
    GUIDE_COLOR = "#ff4444";
    GUIDE_WIDTH = 1;
    guideLayer = null;
    activeSnapX = null;
    activeSnapY = null;
  }
});

// src/tools/arrowTool.js
var arrowTool_exports = {};
__export(arrowTool_exports, {
  cleanupAttachments: () => cleanupAttachments2,
  handleMouseDownArrow: () => handleMouseDown,
  handleMouseMoveArrow: () => handleMouseMove,
  handleMouseUpArrow: () => handleMouseUp,
  updateAttachedArrows: () => updateAttachedArrows
});
function getSVGCoordsFromMouse2(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function deleteCurrentShape() {
  if (currentShape && currentShape.shapeName === "arrow") {
    const idx = shapes.indexOf(currentShape);
    if (idx !== -1) shapes.splice(idx, 1);
    if (currentShape.group.parentNode) {
      currentShape.group.parentNode.removeChild(currentShape.group);
    }
    pushDeleteAction(currentShape);
    currentShape = null;
    disableAllSideBars();
  }
}
function detachSelectedArrow() {
  if (currentShape instanceof Arrow && currentShape.isSelected) {
    if (currentShape.attachedToStart || currentShape.attachedToEnd) {
      const oldState = {
        attachedToStart: currentShape.attachedToStart,
        attachedToEnd: currentShape.attachedToEnd,
        startPoint: { ...currentShape.startPoint },
        endPoint: { ...currentShape.endPoint }
      };
      currentShape.detachFromShape(true);
      currentShape.detachFromShape(false);
      currentShape.draw();
    }
  }
}
function updateAttachedArrows(shape) {
  if (!shape) return;
  let targetShape = shape;
  if (shape.nodeType) {
    targetShape = shapes.find((s) => s.group === shape || s.element === shape) || shape;
  }
  shapes.forEach((arrowShape) => {
    if (arrowShape instanceof Arrow) {
      let needsUpdate = false;
      if (arrowShape.attachedToStart && arrowShape.attachedToStart.shape === targetShape) {
        needsUpdate = true;
      }
      if (arrowShape.attachedToEnd && arrowShape.attachedToEnd.shape === targetShape) {
        needsUpdate = true;
      }
      if (needsUpdate) {
        arrowShape.updateAttachments();
      }
    }
  });
}
function cleanupAttachments2(deletedShape) {
  if (!deletedShape) return;
  let targetShape = deletedShape;
  if (deletedShape.nodeType) {
    targetShape = shapes.find((s) => s.group === deletedShape || s.element === deletedShape) || deletedShape;
  }
  shapes.forEach((shape) => {
    if (shape instanceof Arrow) {
      let needsDraw = false;
      if (shape.attachedToStart && shape.attachedToStart.shape === targetShape) {
        shape.detachFromShape(true);
        needsDraw = true;
      }
      if (shape.attachedToEnd && shape.attachedToEnd.shape === targetShape) {
        shape.detachFromShape(false);
        needsDraw = true;
      }
      if (needsDraw) {
        shape.draw();
      }
    }
  });
}
var currentArrow, isResizing, isDragging2, activeAnchor, isDrawingArrow, arrowStrokeColor, arrowStrokeThickness, arrowOutlineStyle, arrowCurved, arrowCurveAmount, arrowHeadStyle, startX, startY, dragOldPosArrow2, draggedShapeInitialFrameArrow, hoveredFrameArrow2, arrowStrokeColorOptions, arrowStrokeThicknessValue, arrowOutlineStyleValue, arrowTypeStyleValue, arrowHeadStyleValue, arrowCurveAmountOptions, handleMouseDown, handleMouseMove, handleMouseUp, updateSelectedArrowStyle;
var init_arrowTool = __esm({
  "src/tools/arrowTool.js"() {
    init_UndoRedo();
    init_SnapGuides();
    currentArrow = null;
    isResizing = false;
    isDragging2 = false;
    activeAnchor = null;
    isDrawingArrow = false;
    arrowStrokeColor = "#fff";
    arrowStrokeThickness = 2;
    arrowOutlineStyle = "solid";
    arrowCurved = "straight";
    arrowCurveAmount = 20;
    arrowHeadStyle = "default";
    dragOldPosArrow2 = null;
    draggedShapeInitialFrameArrow = null;
    hoveredFrameArrow2 = null;
    arrowStrokeColorOptions = document.querySelectorAll(".arrowStrokeSpan");
    arrowStrokeThicknessValue = document.querySelectorAll(".arrowStrokeThickSpan");
    arrowOutlineStyleValue = document.querySelectorAll(".arrowOutlineStyle");
    arrowTypeStyleValue = document.querySelectorAll(".arrowTypeStyle");
    arrowHeadStyleValue = document.querySelectorAll(".arrowHeadStyleSpan");
    arrowCurveAmountOptions = document.querySelectorAll(".arrowCurveSpan");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && currentShape && currentShape.shapeName === "arrow") {
        deleteCurrentShape();
      }
    });
    handleMouseDown = (e) => {
      if (!isArrowToolActive && !isSelectionToolActive) return;
      const { x, y } = getSVGCoordsFromMouse2(e);
      if (isArrowToolActive) {
        isDrawingArrow = true;
        currentArrow = new Arrow({ x, y }, { x, y }, {
          stroke: arrowStrokeColor,
          strokeWidth: arrowStrokeThickness,
          arrowOutlineStyle,
          arrowHeadStyle,
          arrowCurved,
          arrowCurveAmount
        });
        shapes.push(currentArrow);
        currentShape = currentArrow;
      } else if (isSelectionToolActive) {
        let clickedOnShape = false;
        let clickedOnAnchor = false;
        if (currentShape && currentShape.shapeName === "arrow" && currentShape.isSelected) {
          const anchorInfo = currentShape.isNearAnchor(x, y);
          if (anchorInfo && anchorInfo.type === "anchor") {
            clickedOnAnchor = true;
            clickedOnShape = true;
          }
          if (currentShape.contains(x, y)) {
            isDragging2 = true;
            dragOldPosArrow2 = {
              startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
              endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
              controlPoint1: currentShape.controlPoint1 ? { x: currentShape.controlPoint1.x, y: currentShape.controlPoint1.y } : null,
              controlPoint2: currentShape.controlPoint2 ? { x: currentShape.controlPoint2.x, y: currentShape.controlPoint2.y } : null,
              parentFrame: currentShape.parentFrame
              // Add this line
            };
            draggedShapeInitialFrameArrow = currentShape.parentFrame || null;
            if (currentShape.parentFrame) {
              currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
            }
            startX = x;
            startY = y;
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape) {
          let shapeToSelect = null;
          for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape instanceof Arrow && shape.contains(x, y)) {
              shapeToSelect = shape;
              break;
            }
          }
          if (currentShape && currentShape !== shapeToSelect) {
            currentShape.removeSelection();
            currentShape = null;
          }
          if (shapeToSelect) {
            currentShape = shapeToSelect;
            currentShape.selectArrow();
            const anchorInfo = currentShape.isNearAnchor(x, y);
            if (anchorInfo && anchorInfo.type === "anchor") {
              clickedOnAnchor = true;
            } else {
              isDragging2 = true;
              dragOldPosArrow2 = {
                startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
                endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
                controlPoint1: currentShape.controlPoint1 ? { x: currentShape.controlPoint1.x, y: currentShape.controlPoint1.y } : null,
                controlPoint2: currentShape.controlPoint2 ? { x: currentShape.controlPoint2.x, y: currentShape.controlPoint2.y } : null
              };
              startX = x;
              startY = y;
            }
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape && !clickedOnAnchor && currentShape) {
          currentShape.removeSelection();
          currentShape = null;
        }
      }
    };
    handleMouseMove = (e) => {
      const { x, y } = getSVGCoordsFromMouse2(e);
      if (isDrawingArrow && currentArrow) {
        let endX = x, endY = y;
        if (e.shiftKey) {
          const dx = x - currentArrow.startPoint.x;
          const dy = y - currentArrow.startPoint.y;
          const angle = Math.atan2(dy, dx);
          const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
          const dist = Math.sqrt(dx * dx + dy * dy);
          endX = currentArrow.startPoint.x + dist * Math.cos(snapAngle);
          endY = currentArrow.startPoint.y + dist * Math.sin(snapAngle);
        }
        currentArrow.endPoint = { x: endX, y: endY };
        const nearbyShape = Arrow.findNearbyShape({ x: endX, y: endY });
        if (nearbyShape) {
          currentArrow.endPoint = nearbyShape.attachment.point;
          svg.style.cursor = "crosshair";
          const existingPreview = svg.querySelector(".attachment-preview");
          if (existingPreview) existingPreview.remove();
          const preview = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          preview.setAttribute("cx", nearbyShape.attachment.point.x);
          preview.setAttribute("cy", nearbyShape.attachment.point.y);
          preview.setAttribute("r", 6);
          preview.setAttribute("fill", "none");
          preview.setAttribute("stroke", "#5B57D1");
          preview.setAttribute("stroke-width", 2);
          preview.setAttribute("class", "attachment-preview");
          preview.setAttribute("opacity", "0.7");
          svg.appendChild(preview);
        } else {
          const existingPreview = svg.querySelector(".attachment-preview");
          if (existingPreview) existingPreview.remove();
        }
        shapes.forEach((frame) => {
          if (frame.shapeName === "frame") {
            if (frame.isShapeInFrame(currentArrow)) {
              frame.highlightFrame();
              hoveredFrameArrow2 = frame;
            } else if (hoveredFrameArrow2 === frame) {
              frame.removeHighlight();
              hoveredFrameArrow2 = null;
            }
          }
        });
        if (currentArrow.arrowCurved) {
          currentArrow.initializeCurveControlPoints();
        }
        currentArrow.draw();
      } else if (isDragging2 && currentShape && currentShape.isSelected) {
        const dx = x - startX;
        const dy = y - startY;
        currentShape.move(dx, dy);
        startX = x;
        startY = y;
        if (window.__sketchStoreApi && window.__sketchStoreApi.getState().snapToObjects) {
          const snap = calculateSnap(currentShape, e.shiftKey, e.clientX, e.clientY);
          if (snap.dx || snap.dy) {
            currentShape.move(snap.dx, snap.dy);
          }
        } else {
          clearSnapGuides();
        }
        svg.style.cursor = "grabbing";
      } else if (isSelectionToolActive && currentShape && currentShape.isSelected) {
        const anchorInfo = currentShape.isNearAnchor(x, y);
        if (anchorInfo) {
          svg.style.cursor = "grab";
        } else if (currentShape.contains(x, y)) {
          svg.style.cursor = "move";
        } else {
          svg.style.cursor = "default";
        }
      } else if (isSelectionToolActive) {
        let hoveringOverArrow = false;
        for (let i = shapes.length - 1; i >= 0; i--) {
          const shape = shapes[i];
          if (shape instanceof Arrow && shape.contains(x, y)) {
            hoveringOverArrow = true;
            break;
          }
        }
        svg.style.cursor = hoveringOverArrow ? "pointer" : "default";
      }
    };
    handleMouseUp = (e) => {
      if (isDrawingArrow && currentArrow) {
        const existingPreview = svg.querySelector(".attachment-preview");
        if (existingPreview) existingPreview.remove();
        const dx = currentArrow.endPoint.x - currentArrow.startPoint.x;
        const dy = currentArrow.endPoint.y - currentArrow.startPoint.y;
        const lengthSq = dx * dx + dy * dy;
        if (lengthSq < (5 / currentZoom) ** 2) {
          shapes.pop();
          if (currentArrow.group.parentNode) {
            currentArrow.group.parentNode.removeChild(currentArrow.group);
          }
          currentArrow = null;
          currentShape = null;
        } else {
          const startAttachment = Arrow.findNearbyShape(currentArrow.startPoint);
          const endAttachment = Arrow.findNearbyShape(currentArrow.endPoint);
          if (startAttachment) {
            currentArrow.attachToShape(true, startAttachment.shape, startAttachment.attachment);
          }
          if (endAttachment) {
            currentArrow.attachToShape(false, endAttachment.shape, endAttachment.attachment);
          }
          const finalFrame = hoveredFrameArrow2;
          if (finalFrame) {
            finalFrame.addShapeToFrame(currentArrow);
            pushFrameAttachmentAction(finalFrame, currentArrow, "attach", null);
          }
          pushCreateAction(currentArrow);
          const drawnArrow = currentArrow;
          if (window.__sketchStoreApi) window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
          currentShape = drawnArrow;
          drawnArrow.selectArrow();
        }
        if (hoveredFrameArrow2) {
          hoveredFrameArrow2.removeHighlight();
          hoveredFrameArrow2 = null;
        }
        currentArrow = null;
      }
      if (isDragging2 && dragOldPosArrow2 && currentShape) {
        const newPos = {
          startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
          endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
          parentFrame: currentShape.parentFrame
          // Add this line
        };
        const oldPos = {
          ...dragOldPosArrow2,
          parentFrame: draggedShapeInitialFrameArrow
          // Add this line
        };
        const stateChanged = dragOldPosArrow2.startPoint.x !== newPos.startPoint.x || dragOldPosArrow2.startPoint.y !== newPos.startPoint.y || dragOldPosArrow2.endPoint.x !== newPos.endPoint.x || dragOldPosArrow2.endPoint.y !== newPos.endPoint.y;
        const frameChanged = oldPos.parentFrame !== newPos.parentFrame;
        if (stateChanged || frameChanged) {
          pushTransformAction2(currentShape, oldPos, newPos);
        }
        if (isDragging2) {
          const finalFrame = hoveredFrameArrow2;
          if (draggedShapeInitialFrameArrow !== finalFrame) {
            if (draggedShapeInitialFrameArrow) {
              draggedShapeInitialFrameArrow.removeShapeFromFrame(currentShape);
            }
            if (finalFrame) {
              finalFrame.addShapeToFrame(currentShape);
            }
            if (frameChanged) {
              pushFrameAttachmentAction(
                finalFrame || draggedShapeInitialFrameArrow,
                currentShape,
                finalFrame ? "attach" : "detach",
                draggedShapeInitialFrameArrow
              );
            }
          } else if (draggedShapeInitialFrameArrow) {
            draggedShapeInitialFrameArrow.restoreToFrame(currentShape);
          }
        }
        draggedShapeInitialFrameArrow = null;
        dragOldPosArrow2 = null;
      }
      if (hoveredFrameArrow2) {
        hoveredFrameArrow2.removeHighlight();
        hoveredFrameArrow2 = null;
      }
      clearSnapGuides();
      isDrawingArrow = false;
      isResizing = false;
      isDragging2 = false;
      activeAnchor = null;
      svg.style.cursor = "default";
    };
    svg.removeEventListener("pointerdown", handleMouseDown);
    svg.removeEventListener("pointermove", handleMouseMove);
    svg.removeEventListener("pointerup", handleMouseUp);
    updateSelectedArrowStyle = (styleChanges) => {
      if (currentShape instanceof Arrow && currentShape.isSelected) {
        const oldOptions = {
          ...currentShape.options,
          arrowOutlineStyle: currentShape.arrowOutlineStyle,
          arrowHeadStyle: currentShape.arrowHeadStyle,
          arrowCurved: currentShape.arrowCurved,
          arrowCurveAmount: currentShape.arrowCurveAmount
        };
        currentShape.updateStyle(styleChanges);
        pushOptionsChangeAction(currentShape, oldOptions);
      } else {
        if (styleChanges.stroke !== void 0) arrowStrokeColor = styleChanges.stroke;
        if (styleChanges.strokeWidth !== void 0) arrowStrokeThickness = styleChanges.strokeWidth;
        if (styleChanges.arrowOutlineStyle !== void 0) arrowOutlineStyle = styleChanges.arrowOutlineStyle;
        if (styleChanges.arrowHeadStyle !== void 0) arrowHeadStyle = styleChanges.arrowHeadStyle;
        if (styleChanges.arrowCurved !== void 0) arrowCurved = styleChanges.arrowCurved;
        if (styleChanges.arrowCurveAmount !== void 0) arrowCurveAmount = styleChanges.arrowCurveAmount;
      }
    };
    arrowStrokeColorOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        arrowStrokeColorOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newColor = span.getAttribute("data-id");
        updateSelectedArrowStyle({ stroke: newColor });
      });
    });
    arrowStrokeThicknessValue.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        arrowStrokeThicknessValue.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newThickness = parseInt(span.getAttribute("data-id"));
        updateSelectedArrowStyle({ strokeWidth: newThickness });
      });
    });
    arrowOutlineStyleValue.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        arrowOutlineStyleValue.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newStyle = span.getAttribute("data-id");
        updateSelectedArrowStyle({ arrowOutlineStyle: newStyle });
      });
    });
    arrowTypeStyleValue.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        arrowTypeStyleValue.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        updateSelectedArrowStyle({ arrowCurved: span.getAttribute("data-id") });
      });
    });
    arrowCurveAmountOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        arrowCurveAmountOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        updateSelectedArrowStyle({ arrowCurveAmount: parseInt(span.getAttribute("data-id")) });
      });
    });
    arrowHeadStyleValue.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        arrowHeadStyleValue.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newHeadStyle = span.getAttribute("data-id");
        updateSelectedArrowStyle({ arrowHeadStyle: newHeadStyle });
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "d" && e.ctrlKey) {
        e.preventDefault();
        detachSelectedArrow();
      }
    });
    window.arrowToolSettings = {
      get strokeColor() {
        return arrowStrokeColor;
      },
      set strokeColor(v) {
        arrowStrokeColor = v;
      },
      get strokeWidth() {
        return arrowStrokeThickness;
      },
      set strokeWidth(v) {
        arrowStrokeThickness = v;
      },
      get outlineStyle() {
        return arrowOutlineStyle;
      },
      set outlineStyle(v) {
        arrowOutlineStyle = v;
      },
      get headStyle() {
        return arrowHeadStyle;
      },
      set headStyle(v) {
        arrowHeadStyle = v;
      },
      get arrowCurved() {
        return arrowCurved;
      },
      set arrowCurved(v) {
        arrowCurved = v;
      },
      get curveAmount() {
        return arrowCurveAmount;
      },
      set curveAmount(v) {
        arrowCurveAmount = v;
      }
    };
    window.updateSelectedArrowStyle = updateSelectedArrowStyle;
    window.cleanupAttachments = cleanupAttachments2;
  }
});

// src/shapes/Line.js
var Line_exports = {};
__export(Line_exports, {
  Line: () => Line2
});
var rc3, lineColor, lineStrokeWidth, hoveredFrameLine, Line2;
var init_Line = __esm({
  "src/shapes/Line.js"() {
    init_arrowTool();
    rc3 = rough.svg(svg);
    lineColor = "#fff";
    lineStrokeWidth = 2;
    hoveredFrameLine = null;
    Line2 = class {
      constructor(startPoint2, endPoint, options = {}) {
        this.startPoint = startPoint2;
        this.endPoint = endPoint;
        this.options = { ...options };
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.isSelected = false;
        this.anchors = [];
        this.selectionOutline = null;
        this.shapeName = "line";
        this.shapeID = `line-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.group.setAttribute("id", this.shapeID);
        this.isCurved = false;
        this.controlPoint = null;
        this.parentFrame = null;
        this.label = options.label || "";
        this.labelElement = null;
        this.labelColor = options.labelColor || "#e0e0e0";
        this.labelFontSize = options.labelFontSize || 12;
        this._isEditingLabel = false;
        this._hitArea = null;
        this._labelBg = null;
        svg.appendChild(this.group);
        this._setupLabelDblClick();
        this.draw();
      }
      // Add position and dimension properties for frame compatibility
      get x() {
        return Math.min(this.startPoint.x, this.endPoint.x);
      }
      set x(value) {
        const currentX = this.x;
        const dx = value - currentX;
        this.startPoint.x += dx;
        this.endPoint.x += dx;
        if (this.controlPoint) {
          this.controlPoint.x += dx;
        }
      }
      get y() {
        return Math.min(this.startPoint.y, this.endPoint.y);
      }
      set y(value) {
        const currentY = this.y;
        const dy = value - currentY;
        this.startPoint.y += dy;
        this.endPoint.y += dy;
        if (this.controlPoint) {
          this.controlPoint.y += dy;
        }
      }
      get width() {
        return Math.abs(this.endPoint.x - this.startPoint.x);
      }
      set width(value) {
        const centerX = (this.startPoint.x + this.endPoint.x) / 2;
        this.startPoint.x = centerX - value / 2;
        this.endPoint.x = centerX + value / 2;
      }
      get height() {
        return Math.abs(this.endPoint.y - this.startPoint.y);
      }
      set height(value) {
        const centerY = (this.startPoint.y + this.endPoint.y) / 2;
        this.startPoint.y = centerY - value / 2;
        this.endPoint.y = centerY + value / 2;
      }
      initializeCurveControlPoint() {
        const midX = (this.startPoint.x + this.endPoint.x) / 2;
        const midY = (this.startPoint.y + this.endPoint.y) / 2;
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) {
          this.controlPoint = { x: midX, y: midY - 20 };
          return;
        }
        const perpX = -dy / length;
        const perpY = dx / length;
        const curveOffset = 30;
        this.controlPoint = {
          x: midX + perpX * curveOffset,
          y: midY + perpY * curveOffset
        };
      }
      draw() {
        const childrenToRemove = [];
        const preserveSet = this._skipAnchors ? new Set([...this.anchors, this.selectionOutline].filter(Boolean)) : null;
        for (let i = 0; i < this.group.children.length; i++) {
          const child = this.group.children[i];
          if (child !== this.labelElement && child !== this._hitArea && child !== this._labelBg) {
            if (preserveSet && preserveSet.has(child)) continue;
            childrenToRemove.push(child);
          }
        }
        childrenToRemove.forEach((child) => this.group.removeChild(child));
        const rc6 = rough.svg(svg);
        let lineElement;
        if (this.isCurved && this.controlPoint) {
          const pathData = `M ${this.startPoint.x} ${this.startPoint.y} Q ${this.controlPoint.x} ${this.controlPoint.y} ${this.endPoint.x} ${this.endPoint.y}`;
          lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
          lineElement.setAttribute("d", pathData);
          lineElement.setAttribute("stroke", this.options.stroke || lineColor);
          lineElement.setAttribute("stroke-width", this.options.strokeWidth || lineStrokeWidth);
          lineElement.setAttribute("fill", "none");
          lineElement.setAttribute("stroke-linecap", "round");
          if (this.options.strokeDasharray) {
            lineElement.setAttribute("stroke-dasharray", this.options.strokeDasharray);
          }
        } else if (this.isBeingDrawn || this.options.strokeDasharray) {
          lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
          lineElement.setAttribute("x1", this.startPoint.x);
          lineElement.setAttribute("y1", this.startPoint.y);
          lineElement.setAttribute("x2", this.endPoint.x);
          lineElement.setAttribute("y2", this.endPoint.y);
          lineElement.setAttribute("stroke", this.options.stroke || lineColor);
          lineElement.setAttribute("stroke-width", this.options.strokeWidth || lineStrokeWidth);
          lineElement.setAttribute("stroke-linecap", "round");
          if (this.options.strokeDasharray) {
            lineElement.setAttribute("stroke-dasharray", this.options.strokeDasharray);
          }
        } else {
          lineElement = rc6.line(
            this.startPoint.x,
            this.startPoint.y,
            this.endPoint.x,
            this.endPoint.y,
            this.options
          );
        }
        this.element = lineElement;
        this.group.appendChild(lineElement);
        if (!this._hitArea) {
          this._hitArea = document.createElementNS("http://www.w3.org/2000/svg", "path");
          this._hitArea.setAttribute("fill", "none");
          this._hitArea.setAttribute("stroke", "transparent");
          this._hitArea.setAttribute("stroke-width", "20");
          this._hitArea.setAttribute("style", "pointer-events: stroke;");
          this.group.appendChild(this._hitArea);
        }
        if (this.isCurved && this.controlPoint) {
          this._hitArea.setAttribute("d", `M ${this.startPoint.x} ${this.startPoint.y} Q ${this.controlPoint.x} ${this.controlPoint.y} ${this.endPoint.x} ${this.endPoint.y}`);
        } else {
          this._hitArea.setAttribute("d", `M ${this.startPoint.x} ${this.startPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`);
        }
        this._updateLabelElement();
        if (this.isSelected) {
          if (this._skipAnchors) {
            this.updateSelectionControls();
          } else {
            this.addAnchors();
          }
        }
      }
      _getMidpoint() {
        if (this.isCurved && this.controlPoint) {
          const t = 0.5;
          const mx = (1 - t) * (1 - t) * this.startPoint.x + 2 * (1 - t) * t * this.controlPoint.x + t * t * this.endPoint.x;
          const my = (1 - t) * (1 - t) * this.startPoint.y + 2 * (1 - t) * t * this.controlPoint.y + t * t * this.endPoint.y;
          return { x: mx, y: my };
        }
        return {
          x: (this.startPoint.x + this.endPoint.x) / 2,
          y: (this.startPoint.y + this.endPoint.y) / 2
        };
      }
      _updateLabelElement() {
        if (!this.label) {
          if (this.labelElement && this.labelElement.parentNode === this.group) {
            this.group.removeChild(this.labelElement);
            this.labelElement = null;
          }
          if (this._labelBg && this._labelBg.parentNode === this.group) {
            this.group.removeChild(this._labelBg);
            this._labelBg = null;
          }
          return;
        }
        if (!this.labelElement) {
          this.labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          this.labelElement.setAttribute("class", "shape-label");
          this.labelElement.setAttribute("pointer-events", "none");
        }
        const mid = this._getMidpoint();
        this.labelElement.setAttribute("x", mid.x);
        this.labelElement.setAttribute("y", mid.y);
        this.labelElement.setAttribute("text-anchor", "middle");
        this.labelElement.setAttribute("dominant-baseline", "central");
        this.labelElement.setAttribute("fill", this.labelColor);
        this.labelElement.setAttribute("font-size", this.labelFontSize);
        this.labelElement.setAttribute("font-family", "lixFont, sans-serif");
        this.labelElement.textContent = this.label;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        if (!this._labelBg) {
          this._labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          this._labelBg.setAttribute("pointer-events", "none");
        }
        this._labelBg.setAttribute("fill", canvasBg);
        const hPadding = 4;
        const vPadding = 1;
        const charWidth = this.labelFontSize * 0.6;
        const bgW = this.label.length * charWidth + hPadding * 2;
        const bgH = this.labelFontSize + vPadding * 2;
        this._labelBg.setAttribute("x", mid.x - bgW / 2);
        this._labelBg.setAttribute("y", mid.y - bgH / 2);
        this._labelBg.setAttribute("width", bgW);
        this._labelBg.setAttribute("height", bgH);
        this._labelBg.setAttribute("rx", 2);
        if (this._labelBg.parentNode === this.group) this.group.removeChild(this._labelBg);
        if (this.labelElement.parentNode === this.group) this.group.removeChild(this.labelElement);
        this.group.appendChild(this._labelBg);
        this.group.appendChild(this.labelElement);
      }
      _setupLabelDblClick() {
        this.group.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.startLabelEdit();
        });
      }
      startLabelEdit() {
        if (this._isEditingLabel) return;
        this._isEditingLabel = true;
        if (this.labelElement) {
          this.labelElement.setAttribute("visibility", "hidden");
        }
        if (this._labelBg) {
          this._labelBg.setAttribute("visibility", "hidden");
        }
        const mid = this._getMidpoint();
        const ctm = this.group.getScreenCTM();
        if (!ctm) {
          this._isEditingLabel = false;
          return;
        }
        const pt = svg.createSVGPoint();
        pt.x = mid.x;
        pt.y = mid.y;
        const screenMid = pt.matrixTransform(ctm);
        const editW = 160;
        const editH = 28;
        const overlay = document.createElement("div");
        overlay.className = "shape-label-editor";
        overlay.style.cssText = `
            position: fixed; z-index: 10000;
            left: ${screenMid.x - editW / 2}px; top: ${screenMid.y - editH / 2}px;
            width: ${editW}px; height: ${editH}px;
            display: flex; align-items: center; justify-content: center;
            pointer-events: auto;
        `;
        const canvasBg = window.getComputedStyle(svg).backgroundColor || "#000";
        const input = document.createElement("div");
        input.setAttribute("contenteditable", "true");
        input.style.cssText = `
            width: 100%; height: 100%;
            background: ${canvasBg}; border: none;
            outline: none; padding: 2px 6px;
            color: ${this.labelColor}; font-size: ${this.labelFontSize}px;
            font-family: lixFont, sans-serif; text-align: center;
            display: flex; align-items: center; justify-content: center;
            white-space: pre-wrap; word-break: break-word;
            cursor: text;
        `;
        if (this.label) {
          input.textContent = this.label;
        } else {
          input.innerHTML = "&nbsp;";
        }
        overlay.appendChild(input);
        document.body.appendChild(overlay);
        setTimeout(() => {
          input.focus();
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(input);
          sel.removeAllRanges();
          sel.addRange(range);
        }, 10);
        const finishEdit = () => {
          const newText = input.textContent.trim().replace(/\u00A0/g, "");
          this.label = newText;
          this._isEditingLabel = false;
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (this.labelElement) this.labelElement.removeAttribute("visibility");
          if (this._labelBg) this._labelBg.removeAttribute("visibility");
          this.draw();
        };
        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            input.blur();
          }
          if (e.key === "Escape") {
            input.textContent = this.label;
            input.blur();
          }
        });
        input.addEventListener("pointerdown", (e) => e.stopPropagation());
        input.addEventListener("pointermove", (e) => e.stopPropagation());
        input.addEventListener("pointerup", (e) => e.stopPropagation());
      }
      setLabel(text, color, fontSize) {
        this.label = text || "";
        if (color) this.labelColor = color;
        if (fontSize) this.labelFontSize = fontSize;
        this.draw();
      }
      updateSelectionControls() {
        if (this.anchors.length === 0) return;
        if (this.anchors[0]) {
          this.anchors[0].setAttribute("cx", this.startPoint.x);
          this.anchors[0].setAttribute("cy", this.startPoint.y);
        }
        if (this.anchors[1]) {
          this.anchors[1].setAttribute("cx", this.endPoint.x);
          this.anchors[1].setAttribute("cy", this.endPoint.y);
        }
        if (this.anchors[2]) {
          const midX = (this.startPoint.x + this.endPoint.x) / 2;
          const midY = (this.startPoint.y + this.endPoint.y) / 2;
          let anchorMidX = midX, anchorMidY = midY;
          if (this.isCurved && this.controlPoint) {
            anchorMidX = 0.25 * this.startPoint.x + 0.5 * this.controlPoint.x + 0.25 * this.endPoint.x;
            anchorMidY = 0.25 * this.startPoint.y + 0.5 * this.controlPoint.y + 0.25 * this.endPoint.y;
          }
          this.anchors[2].setAttribute("cx", anchorMidX);
          this.anchors[2].setAttribute("cy", anchorMidY);
        }
      }
      selectLine() {
        this.isSelected = true;
        this.addAnchors();
      }
      deselectLine() {
        this.isSelected = false;
        this.removeSelection();
      }
      // Update the complete removeSelection method
      removeSelection() {
        this.anchors.forEach((anchor) => {
          if (anchor && anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        this.anchors = [];
        this.isSelected = false;
      }
      addAnchors() {
        this.anchors.forEach((anchor) => {
          if (anchor && anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        this.anchors = [];
        const anchorSize = 10 / (currentZoom || 1);
        const anchorStrokeWidth = 2 / (currentZoom || 1);
        const startAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startAnchor.setAttribute("cx", this.startPoint.x);
        startAnchor.setAttribute("cy", this.startPoint.y);
        startAnchor.setAttribute("r", anchorSize / 2);
        startAnchor.setAttribute("fill", "#121212");
        startAnchor.setAttribute("stroke", "#5B57D1");
        startAnchor.setAttribute("stroke-width", anchorStrokeWidth);
        startAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        startAnchor.setAttribute("class", "anchor line-anchor");
        startAnchor.style.cursor = "grab";
        startAnchor.style.pointerEvents = "all";
        startAnchor.dataset.index = 0;
        this.group.appendChild(startAnchor);
        this.anchors[0] = startAnchor;
        const endAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        endAnchor.setAttribute("cx", this.endPoint.x);
        endAnchor.setAttribute("cy", this.endPoint.y);
        endAnchor.setAttribute("r", anchorSize / 2);
        endAnchor.setAttribute("fill", "#121212");
        endAnchor.setAttribute("stroke", "#5B57D1");
        endAnchor.setAttribute("stroke-width", anchorStrokeWidth);
        endAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        endAnchor.setAttribute("class", "anchor line-anchor");
        endAnchor.style.cursor = "grab";
        endAnchor.style.pointerEvents = "all";
        endAnchor.dataset.index = 1;
        this.group.appendChild(endAnchor);
        this.anchors[1] = endAnchor;
        const midX = (this.startPoint.x + this.endPoint.x) / 2;
        const midY = (this.startPoint.y + this.endPoint.y) / 2;
        let anchorMidX = midX, anchorMidY = midY;
        if (this.isCurved && this.controlPoint) {
          anchorMidX = 0.25 * this.startPoint.x + 0.5 * this.controlPoint.x + 0.25 * this.endPoint.x;
          anchorMidY = 0.25 * this.startPoint.y + 0.5 * this.controlPoint.y + 0.25 * this.endPoint.y;
        }
        const middleAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        middleAnchor.setAttribute("cx", anchorMidX);
        middleAnchor.setAttribute("cy", anchorMidY);
        middleAnchor.setAttribute("r", anchorSize / 2);
        middleAnchor.setAttribute("fill", this.isCurved ? "#5B57D1" : "#121212");
        middleAnchor.setAttribute("stroke", "#5B57D1");
        middleAnchor.setAttribute("stroke-width", anchorStrokeWidth);
        middleAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        middleAnchor.setAttribute("class", "anchor line-middle-anchor");
        middleAnchor.style.cursor = "grab";
        middleAnchor.style.pointerEvents = "all";
        middleAnchor.dataset.index = 2;
        this.group.appendChild(middleAnchor);
        this.anchors[2] = middleAnchor;
        disableAllSideBars();
        lineSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("line");
        this.updateSidebar();
      }
      isNearAnchor(x, y) {
        if (!this.isSelected) return null;
        const buffer = 15;
        const anchorSize = 10 / (currentZoom || 1);
        for (let i = 0; i < this.anchors.length; i++) {
          const anchor = this.anchors[i];
          if (anchor) {
            const anchorX = parseFloat(anchor.getAttribute("cx"));
            const anchorY = parseFloat(anchor.getAttribute("cy"));
            const distance2 = Math.sqrt(Math.pow(x - anchorX, 2) + Math.pow(y - anchorY, 2));
            if (distance2 <= anchorSize / 2 + buffer) {
              return { type: "anchor", index: i };
            }
          }
        }
        return null;
      }
      updatePosition(anchorIndex, newX, newY) {
        if (anchorIndex === 0) {
          this.startPoint.x = newX;
          this.startPoint.y = newY;
        } else if (anchorIndex === 1) {
          this.endPoint.x = newX;
          this.endPoint.y = newY;
        } else if (anchorIndex === 2) {
          if (!this.isCurved) {
            this.isCurved = true;
          }
          this.controlPoint = {
            x: 2 * newX - 0.5 * (this.startPoint.x + this.endPoint.x),
            y: 2 * newY - 0.5 * (this.startPoint.y + this.endPoint.y)
          };
        }
        this.draw();
      }
      updateLineElement() {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        const rc6 = rough.svg(svg);
        let lineElement;
        if (this.isCurved && this.controlPoint) {
          const pathData = `M ${this.startPoint.x} ${this.startPoint.y} Q ${this.controlPoint.x} ${this.controlPoint.y} ${this.endPoint.x} ${this.endPoint.y}`;
          lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
          lineElement.setAttribute("d", pathData);
          lineElement.setAttribute("stroke", this.options.stroke || lineColor);
          lineElement.setAttribute("stroke-width", this.options.strokeWidth || lineStrokeWidth);
          lineElement.setAttribute("fill", "none");
          lineElement.setAttribute("stroke-linecap", "round");
          if (this.options.strokeDasharray) {
            lineElement.setAttribute("stroke-dasharray", this.options.strokeDasharray);
          }
        } else if (this.options.strokeDasharray) {
          lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
          lineElement.setAttribute("x1", this.startPoint.x);
          lineElement.setAttribute("y1", this.startPoint.y);
          lineElement.setAttribute("x2", this.endPoint.x);
          lineElement.setAttribute("y2", this.endPoint.y);
          lineElement.setAttribute("stroke", this.options.stroke || lineColor);
          lineElement.setAttribute("stroke-width", this.options.strokeWidth || lineStrokeWidth);
          lineElement.setAttribute("stroke-linecap", "round");
          lineElement.setAttribute("stroke-dasharray", this.options.strokeDasharray);
        } else {
          lineElement = rc6.line(
            this.startPoint.x,
            this.startPoint.y,
            this.endPoint.x,
            this.endPoint.y,
            this.options
          );
        }
        this.element = lineElement;
        this.group.insertBefore(lineElement, this.group.firstChild);
      }
      updateAnchorPositions() {
        if (this.anchors[0]) {
          this.anchors[0].setAttribute("cx", this.startPoint.x);
          this.anchors[0].setAttribute("cy", this.startPoint.y);
        }
        if (this.anchors[1]) {
          this.anchors[1].setAttribute("cx", this.endPoint.x);
          this.anchors[1].setAttribute("cy", this.endPoint.y);
        }
        if (this.anchors[2]) {
          const midX = (this.startPoint.x + this.endPoint.x) / 2;
          const midY = (this.startPoint.y + this.endPoint.y) / 2;
          let anchorMidX = midX, anchorMidY = midY;
          if (this.isCurved && this.controlPoint) {
            anchorMidX = 0.25 * this.startPoint.x + 0.5 * this.controlPoint.x + 0.25 * this.endPoint.x;
            anchorMidY = 0.25 * this.startPoint.y + 0.5 * this.controlPoint.y + 0.25 * this.endPoint.y;
          }
          this.anchors[2].setAttribute("cx", anchorMidX);
          this.anchors[2].setAttribute("cy", anchorMidY);
          this.anchors[2].setAttribute("fill", this.isCurved ? "#5B57D1" : "#121212");
        }
      }
      // Add move method for dragging the entire line
      move(dx, dy) {
        this.startPoint.x += dx;
        this.startPoint.y += dy;
        this.endPoint.x += dx;
        this.endPoint.y += dy;
        if (this.controlPoint) {
          this.controlPoint.x += dx;
          this.controlPoint.y += dy;
        }
        this.updateLineElement();
        this.updateAnchorPositions();
        if (this._hitArea) {
          if (this.isCurved && this.controlPoint) {
            this._hitArea.setAttribute("d", `M ${this.startPoint.x} ${this.startPoint.y} Q ${this.controlPoint.x} ${this.controlPoint.y} ${this.endPoint.x} ${this.endPoint.y}`);
          } else {
            this._hitArea.setAttribute("d", `M ${this.startPoint.x} ${this.startPoint.y} L ${this.endPoint.x} ${this.endPoint.y}`);
          }
        }
        this._updateLabelElement();
        if (!this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
        this.updateAttachedArrows();
      }
      updateAttachedArrows() {
        updateAttachedArrows(this);
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        shapes.forEach((shape) => {
          if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
            targetFrame = shape;
          }
        });
        if (this.parentFrame) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrameLine && hoveredFrameLine !== targetFrame) {
          hoveredFrameLine.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrameLine) {
          targetFrame.highlightFrame();
        }
        hoveredFrameLine = targetFrame;
      }
      contains(x, y) {
        const tolerance = 8 / (currentZoom || 1);
        if (this.isCurved && this.controlPoint) {
          return this.pointToQuadraticBezierDistance(x, y) <= tolerance;
        } else {
          return this.pointToLineDistance(x, y, this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y) <= tolerance;
        }
      }
      pointToQuadraticBezierDistance(x, y) {
        let minDistance2 = Infinity;
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const point = this.getQuadraticBezierPoint(t);
          const distance2 = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          minDistance2 = Math.min(minDistance2, distance2);
        }
        return minDistance2;
      }
      getQuadraticBezierPoint(t) {
        if (!this.controlPoint) return this.startPoint;
        const mt = 1 - t;
        return {
          x: mt * mt * this.startPoint.x + 2 * mt * t * this.controlPoint.x + t * t * this.endPoint.x,
          y: mt * mt * this.startPoint.y + 2 * mt * t * this.controlPoint.y + t * t * this.endPoint.y
        };
      }
      pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
      }
      // No-op: React sidebar handles UI updates via Zustand store
      updateSidebar() {
      }
    };
  }
});

// src/shapes/TextShape.js
var TextShape_exports = {};
__export(TextShape_exports, {
  TextShape: () => TextShape2
});
function extractRotationFromTransform(el) {
  const t = el.getAttribute("transform") || "";
  const m = t.match(/rotate\(([^,)]+)/);
  return m ? parseFloat(m[1]) : 0;
}
function updateAttachedArrows2(wrapper) {
  if (!wrapper || typeof shapes === "undefined") return;
  shapes.forEach((s) => {
    if (s && s.shapeName === "arrow" && typeof s.updateAttachments === "function") {
      if (s.attachedToStart && s.attachedToStart.shape === wrapper || s.attachedToEnd && s.attachedToEnd.shape === wrapper) {
        s.updateAttachments();
      }
    }
  });
}
function updateSelectionFeedback2() {
}
function deselectElement() {
  selectedElement2 = null;
}
function selectElement(el) {
  selectedElement2 = el;
}
var isDragging3, hoveredFrameText, selectedElement2, TextShape2;
var init_TextShape = __esm({
  "src/shapes/TextShape.js"() {
    isDragging3 = false;
    hoveredFrameText = null;
    selectedElement2 = null;
    TextShape2 = class {
      constructor(groupElement) {
        this.group = groupElement;
        this.shapeName = "text";
        this.shapeID = groupElement.getAttribute("id") || `text-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.parentFrame = null;
        this.group.setAttribute("type", "text");
        this.group.setAttribute("data-type", "text-group");
        this.group.shapeName = "text";
        this.group.shapeID = this.shapeID;
      }
      // Position and dimension properties for frame compatibility
      get x() {
        const transform = this.group.transform.baseVal.consolidate();
        return transform ? transform.matrix.e : parseFloat(this.group.getAttribute("data-x")) || 0;
      }
      set x(value) {
        const transform = this.group.transform.baseVal.consolidate();
        const currentY = transform ? transform.matrix.f : parseFloat(this.group.getAttribute("data-y")) || 0;
        const rotation = extractRotationFromTransform(this.group) || 0;
        const textElement = this.group.querySelector("text");
        if (textElement) {
          const bbox = textElement.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          this.group.setAttribute("transform", `translate(${value}, ${currentY}) rotate(${rotation}, ${centerX}, ${centerY})`);
        } else {
          this.group.setAttribute("transform", `translate(${value}, ${currentY})`);
        }
        this.group.setAttribute("data-x", value);
      }
      get y() {
        const transform = this.group.transform.baseVal.consolidate();
        return transform ? transform.matrix.f : parseFloat(this.group.getAttribute("data-y")) || 0;
      }
      set y(value) {
        const transform = this.group.transform.baseVal.consolidate();
        const currentX = transform ? transform.matrix.e : parseFloat(this.group.getAttribute("data-x")) || 0;
        const rotation = extractRotationFromTransform(this.group) || 0;
        const textElement = this.group.querySelector("text");
        if (textElement) {
          const bbox = textElement.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          this.group.setAttribute("transform", `translate(${currentX}, ${value}) rotate(${rotation}, ${centerX}, ${centerY})`);
        } else {
          this.group.setAttribute("transform", `translate(${currentX}, ${value})`);
        }
        this.group.setAttribute("data-y", value);
      }
      get width() {
        const textElement = this.group.querySelector("text");
        if (textElement) {
          return textElement.getBBox().width;
        }
        return 0;
      }
      set width(value) {
      }
      get height() {
        const textElement = this.group.querySelector("text");
        if (textElement) {
          return textElement.getBBox().height;
        }
        return 0;
      }
      set height(value) {
      }
      get rotation() {
        return extractRotationFromTransform(this.group) || 0;
      }
      set rotation(value) {
        const currentTransform = this.group.transform.baseVal.consolidate();
        const currentX = currentTransform ? currentTransform.matrix.e : 0;
        const currentY = currentTransform ? currentTransform.matrix.f : 0;
        const textElement = this.group.querySelector("text");
        if (textElement) {
          const bbox = textElement.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          this.group.setAttribute("transform", `translate(${currentX}, ${currentY}) rotate(${value}, ${centerX}, ${centerY})`);
        }
      }
      move(dx, dy) {
        const currentTransform = this.group.transform.baseVal.consolidate();
        const currentX = currentTransform ? currentTransform.matrix.e : 0;
        const currentY = currentTransform ? currentTransform.matrix.f : 0;
        this.x = currentX + dx;
        this.y = currentY + dy;
        if (isDragging3 && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
        this.updateAttachedArrows();
      }
      updateAttachedArrows() {
        updateAttachedArrows2(this);
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((shape) => {
            if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
              targetFrame = shape;
            }
          });
        }
        if (this.parentFrame && isDragging3) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrameText && hoveredFrameText !== targetFrame) {
          hoveredFrameText.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrameText) {
          targetFrame.highlightFrame();
        }
        hoveredFrameText = targetFrame;
      }
      contains(x, y) {
        const textElement = this.group.querySelector("text");
        if (!textElement || typeof textElement.getBBox !== "function") return false;
        let bbox;
        try {
          bbox = textElement.getBBox();
        } catch {
          return false;
        }
        const padding = 8;
        const CTM = this.group.getCTM();
        if (!CTM) return false;
        const inverseCTM = CTM.inverse();
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        const transformedPoint = svgPoint.matrixTransform(inverseCTM);
        return transformedPoint.x >= bbox.x - padding && transformedPoint.x <= bbox.x + bbox.width + padding && transformedPoint.y >= bbox.y - padding && transformedPoint.y <= bbox.y + bbox.height + padding;
      }
      // Add draw method for consistency with other shapes
      draw() {
        if (selectedElement2 === this.group) {
          updateSelectionFeedback2();
        }
      }
      // Add methods for frame compatibility
      removeSelection() {
        if (selectedElement2 === this.group) {
          deselectElement();
        }
      }
      selectShape() {
        if (typeof window !== "undefined" && window.__selectTextElement) {
          window.__selectTextElement(this.group);
        } else {
          selectElement(this.group);
        }
      }
    };
  }
});

// src/shapes/CodeShape.js
var CodeShape_exports = {};
__export(CodeShape_exports, {
  CodeShape: () => CodeShape2
});
function extractRotationFromTransform2(el) {
  const t = el.getAttribute("transform") || "";
  const m = t.match(/rotate\(([^,)]+)/);
  return m ? parseFloat(m[1]) : 0;
}
function updateAttachedArrows3(wrapper) {
  if (!wrapper || typeof shapes === "undefined") return;
  shapes.forEach((s) => {
    if (s && s.shapeName === "arrow" && typeof s.updateAttachments === "function") {
      if (s.attachedToStart && s.attachedToStart.shape === wrapper || s.attachedToEnd && s.attachedToEnd.shape === wrapper) {
        s.updateAttachments();
      }
    }
  });
}
function adjustCodeEditorSize(editor) {
  if (!editor) return;
  editor.style.height = "auto";
  editor.style.height = editor.scrollHeight + "px";
}
function updateCodeSelectionFeedback() {
}
function deselectCodeBlock() {
  selectedCodeBlock = null;
}
function selectCodeBlock(el) {
  selectedCodeBlock = el;
}
var isCodeDragging, hoveredCodeFrame, selectedCodeBlock, CodeShape2;
var init_CodeShape = __esm({
  "src/shapes/CodeShape.js"() {
    isCodeDragging = false;
    hoveredCodeFrame = null;
    selectedCodeBlock = null;
    CodeShape2 = class {
      constructor(groupElement) {
        this.group = groupElement;
        this.shapeName = "code";
        this.shapeID = groupElement.getAttribute("id") || `code-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.parentFrame = null;
        this.group.setAttribute("type", "code");
        this.group.setAttribute("data-type", "code-group");
        this.group.shapeName = "code";
        this.group.shapeID = this.shapeID;
      }
      // Position and dimension properties for frame compatibility
      get x() {
        const transform = this.group.transform.baseVal.consolidate();
        return transform ? transform.matrix.e : parseFloat(this.group.getAttribute("data-x")) || 0;
      }
      set x(value) {
        const transform = this.group.transform.baseVal.consolidate();
        const currentY = transform ? transform.matrix.f : parseFloat(this.group.getAttribute("data-y")) || 0;
        const rotation = extractRotationFromTransform2(this.group) || 0;
        const codeBlockContainer = this.group.querySelector("foreignObject");
        if (codeBlockContainer) {
          const bbox = codeBlockContainer.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          this.group.setAttribute("transform", `translate(${value}, ${currentY}) rotate(${rotation}, ${centerX}, ${centerY})`);
        } else {
          this.group.setAttribute("transform", `translate(${value}, ${currentY})`);
        }
        this.group.setAttribute("data-x", value);
      }
      get y() {
        const transform = this.group.transform.baseVal.consolidate();
        return transform ? transform.matrix.f : parseFloat(this.group.getAttribute("data-y")) || 0;
      }
      set y(value) {
        const transform = this.group.transform.baseVal.consolidate();
        const currentX = transform ? transform.matrix.e : parseFloat(this.group.getAttribute("data-x")) || 0;
        const rotation = extractRotationFromTransform2(this.group) || 0;
        const codeBlockContainer = this.group.querySelector("foreignObject");
        if (codeBlockContainer) {
          const bbox = codeBlockContainer.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          this.group.setAttribute("transform", `translate(${currentX}, ${value}) rotate(${rotation}, ${centerX}, ${centerY})`);
        } else {
          this.group.setAttribute("transform", `translate(${currentX}, ${value})`);
        }
        this.group.setAttribute("data-y", value);
      }
      get width() {
        const codeElement = this.group.querySelector("text");
        if (codeElement) {
          return codeElement.getBBox().width;
        }
        return 0;
      }
      set width(value) {
        const codeBlockContainer = this.group.querySelector("foreignObject");
        if (codeBlockContainer) {
          codeBlockContainer.setAttribute("width", value);
          const codeEditor = codeBlockContainer.querySelector(".svg-code-editor");
          if (codeEditor) {
            codeEditor.style.width = `${value}px`;
            adjustCodeEditorSize(codeEditor);
          }
        }
      }
      get height() {
        const codeElement = this.group.querySelector("text");
        if (codeElement) {
          return codeElement.getBBox().height;
        }
        return 0;
      }
      set height(value) {
        const codeBlockContainer = this.group.querySelector("foreignObject");
        if (codeBlockContainer) {
          codeBlockContainer.setAttribute("height", value);
          const codeEditor = codeBlockContainer.querySelector(".svg-code-editor");
          if (codeEditor) {
            codeEditor.style.height = `${value}px`;
            adjustCodeEditorSize(codeEditor);
          }
        }
      }
      get rotation() {
        return extractRotationFromTransform2(this.group) || 0;
      }
      set rotation(value) {
        const currentTransform = this.group.transform.baseVal.consolidate();
        const currentX = currentTransform ? currentTransform.matrix.e : 0;
        const currentY = currentTransform ? currentTransform.matrix.f : 0;
        const codeBlockContainer = this.group.querySelector("foreignObject");
        if (codeBlockContainer) {
          const bbox = codeBlockContainer.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          this.group.setAttribute("transform", `translate(${currentX}, ${currentY}) rotate(${value}, ${centerX}, ${centerY})`);
        }
      }
      move(dx, dy) {
        const currentTransform = this.group.transform.baseVal.consolidate();
        const currentX = currentTransform ? currentTransform.matrix.e : 0;
        const currentY = currentTransform ? currentTransform.matrix.f : 0;
        this.x = currentX + dx;
        this.y = currentY + dy;
        if (isCodeDragging && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
        this.updateAttachedArrows();
      }
      updateAttachedArrows() {
        updateAttachedArrows3(this);
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((shape) => {
            if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
              targetFrame = shape;
            }
          });
        }
        if (this.parentFrame && isCodeDragging) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredCodeFrame && hoveredCodeFrame !== targetFrame) {
          hoveredCodeFrame.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredCodeFrame) {
          targetFrame.highlightFrame();
        }
        hoveredCodeFrame = targetFrame;
      }
      contains(x, y) {
        const codeElement = this.group.querySelector("text");
        if (!codeElement || typeof codeElement.getBBox !== "function") return false;
        let bbox;
        try {
          bbox = codeElement.getBBox();
        } catch {
          return false;
        }
        const padding = 8;
        const CTM = this.group.getCTM();
        if (!CTM) return false;
        const inverseCTM = CTM.inverse();
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        const transformedPoint = svgPoint.matrixTransform(inverseCTM);
        return transformedPoint.x >= bbox.x - padding && transformedPoint.x <= bbox.x + bbox.width + padding && transformedPoint.y >= bbox.y - padding && transformedPoint.y <= bbox.y + bbox.height + padding;
      }
      // Add draw method for consistency with other shapes
      draw() {
        if (selectedCodeBlock === this.group) {
          updateCodeSelectionFeedback();
        }
      }
      // Add methods for frame compatibility
      removeSelection() {
        if (selectedCodeBlock === this.group) {
          deselectCodeBlock();
        }
      }
      selectShape() {
        selectCodeBlock(this.group);
      }
    };
  }
});

// src/shapes/ImageShape.js
var ImageShape_exports = {};
__export(ImageShape_exports, {
  ImageShape: () => ImageShape2
});
function selectImage() {
}
var isDragging4, hoveredFrameImage, ImageShape2;
var init_ImageShape = __esm({
  "src/shapes/ImageShape.js"() {
    init_arrowTool();
    isDragging4 = false;
    hoveredFrameImage = null;
    ImageShape2 = class {
      constructor(element) {
        this.element = element;
        this.shapeName = "image";
        this.shapeID = element.shapeID || `image-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.parentFrame = null;
        this.uploadStatus = "pending";
        this.uploadAbortController = null;
        this._uploadIndicator = null;
        this.element.setAttribute("type", "image");
        this.element.shapeID = this.shapeID;
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.group.setAttribute("id", this.shapeID);
        if (this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.group.appendChild(this.element);
        svg.appendChild(this.group);
      }
      showUploadIndicator() {
        if (this._uploadIndicator) return;
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "upload-indicator");
        const x = this.x + 6;
        const y = this.y + 6;
        const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bg.setAttribute("cx", x + 10);
        bg.setAttribute("cy", y + 10);
        bg.setAttribute("r", 12);
        bg.setAttribute("fill", "rgba(0,0,0,0.7)");
        g.appendChild(bg);
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        icon.setAttribute("points", `${x + 10},${y + 3} ${x + 17},${y + 16} ${x + 3},${y + 16}`);
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "#FBBF24");
        icon.setAttribute("stroke-width", "1.5");
        icon.setAttribute("stroke-linejoin", "round");
        g.appendChild(icon);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x + 10);
        line.setAttribute("y1", y + 8);
        line.setAttribute("x2", x + 10);
        line.setAttribute("y2", y + 12);
        line.setAttribute("stroke", "#FBBF24");
        line.setAttribute("stroke-width", "1.5");
        line.setAttribute("stroke-linecap", "round");
        g.appendChild(line);
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", x + 10);
        dot.setAttribute("cy", y + 14.5);
        dot.setAttribute("r", 0.8);
        dot.setAttribute("fill", "#FBBF24");
        g.appendChild(dot);
        const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute("attributeName", "opacity");
        animate.setAttribute("values", "1;0.4;1");
        animate.setAttribute("dur", "1.5s");
        animate.setAttribute("repeatCount", "indefinite");
        g.appendChild(animate);
        const transform = this.element.getAttribute("transform");
        if (transform) g.setAttribute("transform", transform);
        g.style.pointerEvents = "none";
        this.group.appendChild(g);
        this._uploadIndicator = g;
      }
      removeUploadIndicator() {
        if (this._uploadIndicator && this._uploadIndicator.parentNode) {
          this._uploadIndicator.parentNode.removeChild(this._uploadIndicator);
        }
        this._uploadIndicator = null;
      }
      updateUploadIndicatorPosition() {
        if (!this._uploadIndicator) return;
        const x = this.x + 6;
        const y = this.y + 6;
        const bg = this._uploadIndicator.querySelector("circle");
        if (bg) {
          bg.setAttribute("cx", x + 10);
          bg.setAttribute("cy", y + 10);
        }
        const icon = this._uploadIndicator.querySelector("polygon");
        if (icon) icon.setAttribute("points", `${x + 10},${y + 3} ${x + 17},${y + 16} ${x + 3},${y + 16}`);
        const line = this._uploadIndicator.querySelector("line");
        if (line) {
          line.setAttribute("x1", x + 10);
          line.setAttribute("y1", y + 8);
          line.setAttribute("x2", x + 10);
          line.setAttribute("y2", y + 12);
        }
        const dots = this._uploadIndicator.querySelectorAll("circle");
        if (dots[1]) {
          dots[1].setAttribute("cx", x + 10);
          dots[1].setAttribute("cy", y + 14.5);
        }
        const transform = this.element.getAttribute("transform");
        if (transform) this._uploadIndicator.setAttribute("transform", transform);
      }
      // Position and dimension properties for frame compatibility
      get x() {
        return parseFloat(this.element.getAttribute("x"));
      }
      set x(value) {
        this.element.setAttribute("x", value);
        this.element.setAttribute("data-shape-x", value);
      }
      get y() {
        return parseFloat(this.element.getAttribute("y"));
      }
      set y(value) {
        this.element.setAttribute("y", value);
        this.element.setAttribute("data-shape-y", value);
      }
      get width() {
        return parseFloat(this.element.getAttribute("width"));
      }
      set width(value) {
        this.element.setAttribute("width", value);
        this.element.setAttribute("data-shape-width", value);
      }
      get height() {
        return parseFloat(this.element.getAttribute("height"));
      }
      set height(value) {
        this.element.setAttribute("height", value);
        this.element.setAttribute("data-shape-height", value);
      }
      get rotation() {
        const transform = this.element.getAttribute("transform");
        if (transform) {
          const rotateMatch = transform.match(/rotate\(([^,]+)/);
          if (rotateMatch) {
            return parseFloat(rotateMatch[1]);
          }
        }
        return 0;
      }
      set rotation(value) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        this.element.setAttribute("transform", `rotate(${value}, ${centerX}, ${centerY})`);
        this.element.setAttribute("data-shape-rotation", value);
      }
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        this.element.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        if (isDragging4 && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
        this.updateAttachedArrows();
      }
      updateAttachedArrows() {
        updateAttachedArrows(this);
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((shape) => {
            if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
              targetFrame = shape;
            }
          });
        }
        if (this.parentFrame && isDragging4) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrameImage && hoveredFrameImage !== targetFrame) {
          hoveredFrameImage.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrameImage) {
          targetFrame.highlightFrame();
        }
        hoveredFrameImage = targetFrame;
      }
      contains(x, y) {
        const imgX = this.x;
        const imgY = this.y;
        const imgWidth = this.width;
        const imgHeight = this.height;
        return x >= imgX && x <= imgX + imgWidth && y >= imgY && y <= imgY + imgHeight;
      }
      // Add draw method for consistency with other shapes
      draw() {
      }
      // Add methods for frame compatibility
      removeSelection() {
        svg.querySelectorAll(".selection-outline").forEach((el) => el.remove());
        svg.querySelectorAll(".resize-anchor, .rotation-anchor").forEach((el) => el.remove());
      }
      selectShape() {
        selectImage({ target: this.element, stopPropagation: () => {
        } });
      }
    };
  }
});

// src/shapes/IconShape.js
var IconShape_exports = {};
__export(IconShape_exports, {
  IconShape: () => IconShape2
});
function getSVGElement() {
  return document.getElementById("freehand-canvas");
}
function selectIcon(event) {
  if (window.__iconToolSelectIcon) {
    window.__iconToolSelectIcon(event);
  }
}
var isDragging5, hoveredFrameIcon, IconShape2;
var init_IconShape = __esm({
  "src/shapes/IconShape.js"() {
    init_arrowTool();
    isDragging5 = false;
    hoveredFrameIcon = null;
    window.__iconShapeState = {
      set isDragging(v) {
        isDragging5 = v;
      },
      get isDragging() {
        return isDragging5;
      },
      set hoveredFrameIcon(v) {
        hoveredFrameIcon = v;
      },
      get hoveredFrameIcon() {
        return hoveredFrameIcon;
      }
    };
    IconShape2 = class {
      constructor(element) {
        this.element = element;
        this.shapeName = "icon";
        this.shapeID = `icon-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.type = "icon";
        this.parentFrame = null;
        this.isDraggedOutTemporarily = false;
        this.element.setAttribute("type", "icon");
        this.element.shapeID = this.shapeID;
        this.group = this.element;
        this.group.setAttribute("id", this.shapeID);
      }
      get x() {
        return parseFloat(this.element.getAttribute("x")) || 0;
      }
      set x(value) {
        this.element.setAttribute("x", value);
        this.element.setAttribute("data-shape-x", value);
      }
      get y() {
        return parseFloat(this.element.getAttribute("y")) || 0;
      }
      set y(value) {
        this.element.setAttribute("y", value);
        this.element.setAttribute("data-shape-y", value);
      }
      get width() {
        return parseFloat(this.element.getAttribute("width")) || 100;
      }
      set width(value) {
        this.element.setAttribute("width", value);
        this.element.setAttribute("data-shape-width", value);
      }
      get height() {
        return parseFloat(this.element.getAttribute("height")) || 100;
      }
      set height(value) {
        this.element.setAttribute("height", value);
        this.element.setAttribute("data-shape-height", value);
      }
      get rotation() {
        const dataRotation = this.element.getAttribute("data-shape-rotation");
        if (dataRotation) {
          return parseFloat(dataRotation);
        }
        const transform = this.element.getAttribute("transform");
        if (transform) {
          const rotateMatch = transform.match(/rotate\(([^,\s]+)/);
          if (rotateMatch) {
            return parseFloat(rotateMatch[1]);
          }
        }
        return 0;
      }
      set rotation(value) {
        this.element.setAttribute("data-shape-rotation", value);
        const vbWidth = parseFloat(this.element.getAttribute("data-viewbox-width")) || 24;
        const vbHeight = parseFloat(this.element.getAttribute("data-viewbox-height")) || 24;
        const scale = this.width / Math.max(vbWidth, vbHeight);
        const localCenterX = this.width / 2 / scale;
        const localCenterY = this.height / 2 / scale;
        this.element.setAttribute("transform", `translate(${this.x}, ${this.y}) scale(${scale}) rotate(${value}, ${localCenterX}, ${localCenterY})`);
      }
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        const vbWidth = parseFloat(this.element.getAttribute("data-viewbox-width")) || 24;
        const vbHeight = parseFloat(this.element.getAttribute("data-viewbox-height")) || 24;
        const scale = this.width / Math.max(vbWidth, vbHeight);
        const localCenterX = this.width / 2 / scale;
        const localCenterY = this.height / 2 / scale;
        this.element.setAttribute("transform", `translate(${this.x}, ${this.y}) scale(${scale}) rotate(${this.rotation}, ${localCenterX}, ${localCenterY})`);
        this.element.setAttribute("x", this.x);
        this.element.setAttribute("y", this.y);
        this.element.setAttribute("data-shape-x", this.x);
        this.element.setAttribute("data-shape-y", this.y);
        updateAttachedArrows(this);
        if (isDragging5 && !this.isBeingMovedByFrame) {
          this.updateFrameContainment();
        }
      }
      updateFrameContainment() {
        if (this.isBeingMovedByFrame) return;
        let targetFrame = null;
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((shape) => {
            if (shape.shapeName === "frame" && shape.isShapeInFrame(this)) {
              targetFrame = shape;
            }
          });
        }
        if (this.parentFrame && isDragging5) {
          this.parentFrame.temporarilyRemoveFromFrame(this);
        }
        if (hoveredFrameIcon && hoveredFrameIcon !== targetFrame) {
          hoveredFrameIcon.removeHighlight();
        }
        if (targetFrame && targetFrame !== hoveredFrameIcon) {
          targetFrame.highlightFrame();
        }
        hoveredFrameIcon = targetFrame;
      }
      contains(x, y) {
        const iconX2 = this.x;
        const iconY2 = this.y;
        const iconWidth = this.width;
        const iconHeight = this.height;
        return x >= iconX2 && x <= iconX2 + iconWidth && y >= iconY2 && y <= iconY2 + iconHeight;
      }
      updateAttachedArrows() {
        updateAttachedArrows(this);
      }
      draw() {
        const scale = this.width / 24;
        const localCenterX = this.width / 2 / scale;
        const localCenterY = this.height / 2 / scale;
        this.element.setAttribute("transform", `translate(${this.x}, ${this.y}) scale(${scale}) rotate(${this.rotation}, ${localCenterX}, ${localCenterY})`);
        this.element.setAttribute("data-shape-x", this.x);
        this.element.setAttribute("data-shape-y", this.y);
        this.element.setAttribute("data-shape-width", this.width);
        this.element.setAttribute("data-shape-height", this.height);
        this.element.setAttribute("data-shape-rotation", this.rotation);
        updateAttachedArrows(this);
      }
      removeSelection(params) {
        if (window.__iconToolRemoveSelection) {
          window.__iconToolRemoveSelection();
        }
        this.isSelected = false;
      }
      // Called by handleMultiSelectionMouseDown — same as selectShape
      addAnchors() {
        selectIcon({ target: this.element, stopPropagation: () => {
        } });
      }
      selectShape() {
        selectIcon({ target: this.element, stopPropagation: () => {
        } });
      }
      remove() {
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          const idx = shapes.indexOf(this);
          if (idx !== -1) shapes.splice(idx, 1);
        }
        if (typeof cleanupAttachments2 === "function") {
          cleanupAttachments2(this.element);
        }
        if (this.parentFrame) {
          this.parentFrame.removeShapeFromFrame(this);
        }
        if (this.group && this.group.parentNode) {
          this.group.parentNode.removeChild(this.group);
        }
      }
      restore(pos) {
        const svg3 = getSVGElement();
        if (!this.group.parentNode && svg3) {
          svg3.appendChild(this.group);
        }
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          if (shapes.indexOf(this) === -1) {
            shapes.push(this);
          }
        }
        this.x = pos.x;
        this.y = pos.y;
        this.width = pos.width;
        this.height = pos.height;
        this.rotation = pos.rotation;
        if (pos.parentFrame) {
          this.parentFrame = pos.parentFrame;
          pos.parentFrame.addShapeToFrame(this);
        }
        const scale = pos.width / 24;
        const localCenterX = pos.width / 2 / scale;
        const localCenterY = pos.height / 2 / scale;
        this.element.setAttribute("transform", `translate(${pos.x}, ${pos.y}) scale(${scale}) rotate(${pos.rotation}, ${localCenterX}, ${localCenterY})`);
        this.element.setAttribute("data-shape-x", pos.x);
        this.element.setAttribute("data-shape-y", pos.y);
        this.element.setAttribute("data-shape-width", pos.width);
        this.element.setAttribute("data-shape-height", pos.height);
        this.element.setAttribute("data-shape-rotation", pos.rotation);
        updateAttachedArrows(this);
      }
    };
  }
});

// src/shapes/Frame.js
var Frame_exports = {};
__export(Frame_exports, {
  Frame: () => Frame2
});
function getSVGCoordsFromMouse3(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
var dragOldPosFrame, Frame2;
var init_Frame = __esm({
  "src/shapes/Frame.js"() {
    dragOldPosFrame = null;
    Frame2 = class {
      constructor(x, y, width, height, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = options.rotation || 0;
        this.frameName = options.frameName || "Frame";
        this.fillStyle = options.fillStyle || "transparent";
        this.fillColor = options.fillColor || "#1e1e28";
        this.gridSize = options.gridSize || 20;
        this.gridColor = options.gridColor || "rgba(255,255,255,0.06)";
        this.options = {
          stroke: options.stroke || "#555",
          strokeWidth: options.strokeWidth || 1,
          fill: options.fill || "transparent",
          opacity: options.opacity || 1,
          ...options
        };
        this.element = null;
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.isSelected = false;
        this.anchors = [];
        this.shapeName = "frame";
        this.shapeID = `frame-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        this.group.setAttribute("id", this.shapeID);
        this.clipGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        this.clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.clipId = `clip-${this.shapeID}`;
        this.clipPath.setAttribute("id", this.clipId);
        this.clipPath.appendChild(this.clipRect);
        this.clipGroup.setAttribute("clip-path", `url(#${this.clipId})`);
        let defs = svg.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svg.appendChild(defs);
        }
        defs.appendChild(this.clipPath);
        this.containedShapes = [];
        svg.appendChild(this.group);
        svg.appendChild(this.clipGroup);
        this.draw();
        this.updateClipPath();
      }
      draw() {
        while (this.group.firstChild) {
          this.group.removeChild(this.group.firstChild);
        }
        this.anchors = [];
        let defs = svg.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svg.appendChild(defs);
        }
        let fillValue = "transparent";
        if (this.fillStyle === "solid") {
          fillValue = this.fillColor;
        } else if (this.fillStyle === "grid") {
          const patternId = `frame-grid-${this.shapeID}`;
          let pattern = defs.querySelector(`#${patternId}`);
          if (!pattern) {
            pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
            pattern.setAttribute("id", patternId);
            pattern.setAttribute("patternUnits", "userSpaceOnUse");
            defs.appendChild(pattern);
          }
          pattern.setAttribute("x", this.x);
          pattern.setAttribute("y", this.y);
          pattern.setAttribute("width", this.gridSize);
          pattern.setAttribute("height", this.gridSize);
          while (pattern.firstChild) pattern.removeChild(pattern.firstChild);
          const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          bgRect.setAttribute("width", this.gridSize);
          bgRect.setAttribute("height", this.gridSize);
          bgRect.setAttribute("fill", this.fillColor);
          pattern.appendChild(bgRect);
          const gridPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          gridPath.setAttribute("d", `M ${this.gridSize} 0 L 0 0 0 ${this.gridSize}`);
          gridPath.setAttribute("fill", "none");
          gridPath.setAttribute("stroke", this.gridColor);
          gridPath.setAttribute("stroke-width", "0.5");
          pattern.appendChild(gridPath);
          fillValue = `url(#${patternId})`;
        }
        const frameRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        frameRect.setAttribute("x", this.x);
        frameRect.setAttribute("y", this.y);
        frameRect.setAttribute("width", this.width);
        frameRect.setAttribute("height", this.height);
        frameRect.setAttribute("stroke", this.options.stroke);
        frameRect.setAttribute("stroke-width", this.options.strokeWidth);
        frameRect.setAttribute("fill", fillValue);
        frameRect.setAttribute("opacity", this.options.opacity);
        frameRect.setAttribute("stroke-dasharray", "5,5");
        frameRect.classList.add("frame-rect");
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          frameRect.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        }
        this.element = frameRect;
        this.group.appendChild(this.element);
        this.addFrameLabel();
        if (this._frameImageURL) {
          this.setImageFromURL(this._frameImageURL, this._frameImageFit || "cover");
        }
        if (this.isSelected) {
          this.addAnchors();
        }
        this.updateClipPath();
      }
      updateAttachedArrows() {
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((shape) => {
            if (shape.shapeName === "arrow") {
              let needsUpdate = false;
              if (shape.attachedToStart && shape.attachedToStart.shape === this) {
                needsUpdate = true;
              }
              if (shape.attachedToEnd && shape.attachedToEnd.shape === this) {
                needsUpdate = true;
              }
              if (needsUpdate) {
                shape.updateAttachments();
              }
            }
          });
        }
      }
      updateClipPath() {
        this.clipRect.setAttribute("x", this.x);
        this.clipRect.setAttribute("y", this.y);
        this.clipRect.setAttribute("width", this.width);
        this.clipRect.setAttribute("height", this.height);
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          this.clipRect.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        } else {
          this.clipRect.removeAttribute("transform");
        }
      }
      addShapeToFrame(shape) {
        if (shape && !this.containedShapes.includes(shape)) {
          const oldFrame = shape.parentFrame;
          if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
            shapes.forEach((otherFrame) => {
              if (otherFrame.shapeName === "frame" && otherFrame !== this) {
                otherFrame.removeShapeFromFrame(shape);
              }
            });
          }
          this.containedShapes.push(shape);
          shape.parentFrame = this;
          const el = shape.group || shape.element;
          if (el && el.parentNode && !shape.isDraggedOutTemporarily) {
            el.parentNode.removeChild(el);
            this.clipGroup.appendChild(el);
          }
          if (shape.shapeName === "frame" && shape.clipGroup) {
            if (shape.clipGroup.parentNode) {
              shape.clipGroup.parentNode.removeChild(shape.clipGroup);
            }
            this.clipGroup.appendChild(shape.clipGroup);
          }
        }
      }
      removeShapeFromFrame(shape) {
        const index = this.containedShapes.indexOf(shape);
        if (index > -1) {
          this.containedShapes.splice(index, 1);
          if (shape.parentFrame === this) {
            shape.parentFrame = null;
          }
          const el = shape.group || shape.element;
          if (el && el.parentNode === this.clipGroup) {
            this.clipGroup.removeChild(el);
            svg.appendChild(el);
          }
          if (shape.shapeName === "frame" && shape.clipGroup && shape.clipGroup.parentNode === this.clipGroup) {
            this.clipGroup.removeChild(shape.clipGroup);
            svg.appendChild(shape.clipGroup);
          }
          delete shape.isDraggedOutTemporarily;
        }
      }
      // Check if a point is inside the frame bounds
      isPointInFrame(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
      }
      // Check if a shape overlaps with this frame
      isShapeInFrame(shape) {
        if (!shape || shape === this) return false;
        const shapeX = shape.x || 0;
        const shapeY = shape.y || 0;
        const shapeWidth = shape.width || 0;
        const shapeHeight = shape.height || 0;
        const shapeCenterX = shapeX + shapeWidth / 2;
        const shapeCenterY = shapeY + shapeHeight / 2;
        return shapeCenterX >= this.x && shapeCenterX <= this.x + this.width && shapeCenterY >= this.y && shapeCenterY <= this.y + this.height;
      }
      updateContainedShapes(applyClipping = true) {
        if (typeof shapes === "undefined" || !Array.isArray(shapes)) return;
        shapes.forEach((shape) => {
          if (shape !== this) {
            if (shape.shapeName === "frame") {
              const shapeArea = (shape.width || 0) * (shape.height || 0);
              const thisArea = (this.width || 0) * (this.height || 0);
              if (shapeArea >= thisArea) return;
            }
            const isInFrame = this.isShapeInFrame(shape);
            const isAlreadyContained = this.containedShapes.includes(shape);
            if (isInFrame && !isAlreadyContained) {
              this.addShapeToFrame(shape);
              if (!applyClipping) {
                const el = shape.group || shape.element;
                if (el && el.parentNode === this.clipGroup) {
                  this.clipGroup.removeChild(el);
                  svg.appendChild(el);
                  shape.isDraggedOutTemporarily = true;
                }
              }
            } else if (!isInFrame && isAlreadyContained) {
              this.removeShapeFromFrame(shape);
            }
          }
        });
        this.updateClipPath();
      }
      highlightFrame() {
        if (this.element) {
          this.element.setAttribute("stroke", "#5B57D1");
          this.element.setAttribute("stroke-width", "3");
          this.element.setAttribute("opacity", "0.7");
        }
      }
      // Remove frame highlight
      removeHighlight() {
        if (this.element) {
          this.element.setAttribute("stroke", this.options.stroke);
          this.element.setAttribute("stroke-width", this.options.strokeWidth);
          this.element.setAttribute("opacity", this.options.opacity);
        }
      }
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.containedShapes.forEach((shape) => {
          if (shape) {
            shape.isBeingMovedByFrame = true;
            if (typeof shape.move === "function") {
              shape.move(dx, dy);
            } else {
              shape.x += dx;
              shape.y += dy;
            }
            if (typeof shape.draw === "function") {
              shape.draw();
            }
            if (typeof shape.updateBoundingBox === "function") {
              shape.updateBoundingBox();
            }
            delete shape.isBeingMovedByFrame;
          }
        });
        this.updateAttachedArrows();
        this.draw();
        this.updateClipPath();
      }
      handleResizeLegacy(anchorIndex, currentPos, startPos, initialFrame) {
        const dx = currentPos.x - startPos.x;
        const dy = currentPos.y - startPos.y;
        switch (anchorIndex) {
          case 0:
            this.x = initialFrame.x + dx;
            this.y = initialFrame.y + dy;
            this.width = Math.max(10, initialFrame.width - dx);
            this.height = Math.max(10, initialFrame.height - dy);
            break;
          case 1:
            this.y = initialFrame.y + dy;
            this.height = Math.max(10, initialFrame.height - dy);
            break;
          case 2:
            this.y = initialFrame.y + dy;
            this.width = Math.max(10, initialFrame.width + dx);
            this.height = Math.max(10, initialFrame.height - dy);
            break;
          case 3:
            this.width = Math.max(10, initialFrame.width + dx);
            break;
          case 4:
            this.width = Math.max(10, initialFrame.width + dx);
            this.height = Math.max(10, initialFrame.height + dy);
            break;
          case 5:
            this.height = Math.max(10, initialFrame.height + dy);
            break;
          case 6:
            this.x = initialFrame.x + dx;
            this.width = Math.max(10, initialFrame.width - dx);
            this.height = Math.max(10, initialFrame.height + dy);
            break;
          case 7:
            this.x = initialFrame.x + dx;
            this.width = Math.max(10, initialFrame.width - dx);
            break;
        }
        this.updateAttachedArrows();
        this.updateContainedShapes();
      }
      destroy() {
        const isDiagramFrame = !!this._diagramType;
        [...this.containedShapes].forEach((shape) => {
          if (isDiagramFrame) {
            if (typeof window.cleanupAttachments === "function") {
              window.cleanupAttachments(shape);
            }
            const el = shape.group || shape.element;
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
            if (shape.shapeName === "frame") {
              if (shape.clipGroup && shape.clipGroup.parentNode) {
                shape.clipGroup.parentNode.removeChild(shape.clipGroup);
              }
              if (shape.clipPath && shape.clipPath.parentNode) {
                shape.clipPath.parentNode.removeChild(shape.clipPath);
              }
            }
            const idx = shapes.indexOf(shape);
            if (idx > -1) {
              shapes.splice(idx, 1);
            }
          } else {
            const el = shape.group || shape.element;
            if (el) {
              if (el.parentNode === this.clipGroup) {
                this.clipGroup.removeChild(el);
              }
              svg.appendChild(el);
            }
            if (shape.shapeName === "frame" && shape.clipGroup) {
              if (shape.clipGroup.parentNode === this.clipGroup) {
                this.clipGroup.removeChild(shape.clipGroup);
              }
              svg.appendChild(shape.clipGroup);
            }
          }
          shape.parentFrame = null;
          delete shape.isBeingMovedByFrame;
        });
        this.containedShapes = [];
        if (this.clipPath && this.clipPath.parentNode) {
          this.clipPath.parentNode.removeChild(this.clipPath);
        }
        if (this.clipGroup && this.clipGroup.parentNode) {
          this.clipGroup.parentNode.removeChild(this.clipGroup);
        }
        if (this.group && this.group.parentNode) {
          this.group.parentNode.removeChild(this.group);
        }
        const index = shapes.indexOf(this);
        if (index > -1) {
          shapes.splice(index, 1);
        }
        if (currentShape === this) {
          currentShape = null;
        }
      }
      addFrameLabel() {
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelText.setAttribute("x", this.x + 5);
        labelText.setAttribute("y", this.y - 10);
        labelText.setAttribute("font-size", `${16 / currentZoom}px`);
        labelText.setAttribute("fill", this.options.stroke);
        labelText.setAttribute("font-family", "lixFont");
        labelText.textContent = this.frameName || "Frame";
        labelText.style.cursor = "pointer";
        labelText.style.userSelect = "none";
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          labelText.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        }
        labelText.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          this.startLabelEdit(labelText);
        });
        this.group.appendChild(labelText);
        this.labelElement = labelText;
      }
      startLabelEdit(labelElement) {
        const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        foreignObject.setAttribute("x", this.x + 5);
        foreignObject.setAttribute("y", this.y - 20);
        foreignObject.setAttribute("width", Math.max(100, this.width - 10));
        foreignObject.setAttribute("height", 20);
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          foreignObject.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        }
        const input = document.createElement("input");
        input.type = "text";
        input.value = this.frameName || "Frame";
        const oldName = this.frameName;
        input.style.cssText = `
        position: absolute;
        width: 100%;
        height: 20px;
        border: 1px solid #5B57D1;
        background: transparent;
        color: ${this.options.stroke};
        font-family: "lixFont";
        font-size: ${15 / currentZoom}px;
        padding: 2px 10px;
        margin: 0;
        outline: none;
        border-radius: 2px;
        box-sizing: border-box;
    `;
        foreignObject.appendChild(input);
        this.group.appendChild(foreignObject);
        labelElement.style.display = "none";
        setTimeout(() => {
          input.focus();
          input.select();
        }, 10);
        const finishEdit = () => {
          const newName = input.value.trim() || "Frame";
          if (newName !== oldName) {
            pushTransformAction(
              this,
              {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                rotation: this.rotation,
                frameName: oldName
              },
              {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                rotation: this.rotation,
                frameName: newName
              }
            );
          }
          this.frameName = newName;
          this.group.removeChild(foreignObject);
          labelElement.style.display = "block";
          labelElement.textContent = this.frameName;
          this.labelElement = labelElement;
        };
        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            finishEdit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            this.group.removeChild(foreignObject);
            labelElement.style.display = "block";
          }
        });
        input.addEventListener("pointerdown", (e) => e.stopPropagation());
        input.addEventListener("pointermove", (e) => e.stopPropagation());
        input.addEventListener("pointerup", (e) => e.stopPropagation());
      }
      selectFrame() {
        this.isSelected = true;
        this.draw();
        this._showSidebar();
      }
      _showSidebar() {
        if (window.__showSidebarForShape) {
          window.__showSidebarForShape("frame");
        }
        const sidebar = document.getElementById("frameSideBar");
        const renameInput = document.getElementById("frameRenameInput");
        const resizeBtn = document.getElementById("frameResizeToFit");
        if (!sidebar) return;
        sidebar.classList.remove("hidden");
        if (renameInput) {
          renameInput.value = this.frameName || "Frame";
          const newInput = renameInput.cloneNode(true);
          renameInput.parentNode.replaceChild(newInput, renameInput);
          newInput.addEventListener("input", () => {
            const val = newInput.value.trim() || "Frame";
            this.frameName = val;
            if (this.labelElement) this.labelElement.textContent = val;
          });
          newInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") newInput.blur();
          });
          newInput.addEventListener("pointerdown", (e) => e.stopPropagation());
        }
        if (resizeBtn) {
          const newBtn = resizeBtn.cloneNode(true);
          resizeBtn.parentNode.replaceChild(newBtn, resizeBtn);
          newBtn.addEventListener("click", () => this.resizeToFit());
        }
      }
      resizeToFit() {
        if (this.containedShapes.length === 0) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.containedShapes.forEach((shape) => {
          if (shape.shapeName === "arrow" || shape.shapeName === "line") {
            [shape.startPoint, shape.endPoint].filter(Boolean).forEach((p) => {
              minX = Math.min(minX, p.x);
              minY = Math.min(minY, p.y);
              maxX = Math.max(maxX, p.x);
              maxY = Math.max(maxY, p.y);
            });
          } else if (typeof shape.x === "number" && typeof shape.y === "number") {
            const w = shape.width || 0;
            const h = shape.height || 0;
            minX = Math.min(minX, shape.x);
            minY = Math.min(minY, shape.y);
            maxX = Math.max(maxX, shape.x + w);
            maxY = Math.max(maxY, shape.y + h);
          }
        });
        if (!isFinite(minX)) return;
        const padding = 20;
        const oldState = { x: this.x, y: this.y, width: this.width, height: this.height, rotation: this.rotation };
        this.x = minX - padding;
        this.y = minY - padding;
        this.width = maxX - minX + padding * 2;
        this.height = maxY - minY + padding * 2;
        pushTransformAction(this, oldState, { x: this.x, y: this.y, width: this.width, height: this.height, rotation: this.rotation });
        this.draw();
        this.updateClipPath();
        this.updateContainedShapes();
      }
      removeSelection() {
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode) {
            anchor.parentNode.removeChild(anchor);
          }
        });
        this.anchors = [];
        this.isSelected = false;
        this.draw();
        const sidebar = document.getElementById("frameSideBar");
        if (sidebar) sidebar.classList.add("hidden");
      }
      addAnchors() {
        const anchorSize = 8 / currentZoom;
        const anchorStrokeWidth = 2 / currentZoom;
        const anchorPositions = [
          { x: this.x, y: this.y, cursor: "nw-resize", type: "corner" },
          // Top-left
          { x: this.x + this.width / 2, y: this.y, cursor: "n-resize", type: "edge" },
          // Top-middle
          { x: this.x + this.width, y: this.y, cursor: "ne-resize", type: "corner" },
          // Top-right
          { x: this.x + this.width, y: this.y + this.height / 2, cursor: "e-resize", type: "edge" },
          // Right-middle
          { x: this.x + this.width, y: this.y + this.height, cursor: "se-resize", type: "corner" },
          // Bottom-right
          { x: this.x + this.width / 2, y: this.y + this.height, cursor: "s-resize", type: "edge" },
          // Bottom-middle
          { x: this.x, y: this.y + this.height, cursor: "sw-resize", type: "corner" },
          // Bottom-left
          { x: this.x, y: this.y + this.height / 2, cursor: "w-resize", type: "edge" }
          // Left-middle
        ];
        const rotationHandleDistance = 30 / currentZoom;
        const rotationHandle = {
          x: this.x + this.width / 2,
          y: this.y - rotationHandleDistance,
          cursor: "grab",
          type: "rotation"
        };
        anchorPositions.push(rotationHandle);
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        outline.setAttribute("x", this.x);
        outline.setAttribute("y", this.y);
        outline.setAttribute("width", this.width);
        outline.setAttribute("height", this.height);
        outline.setAttribute("fill", "none");
        outline.setAttribute("stroke", "#5B57D1");
        outline.setAttribute("stroke-width", 1.5);
        outline.setAttribute("vector-effect", "non-scaling-stroke");
        outline.setAttribute("stroke-dasharray", "4 2");
        outline.setAttribute("style", "pointer-events: none;");
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          outline.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        }
        this.group.appendChild(outline);
        this.selectionOutline = outline;
        anchorPositions.forEach((position, index) => {
          let anchor;
          if (position.type === "rotation") {
            anchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            anchor.setAttribute("cx", position.x);
            anchor.setAttribute("cy", position.y);
            anchor.setAttribute("r", anchorSize);
            anchor.setAttribute("fill", "#121212");
            anchor.setAttribute("stroke", "#5B57D1");
            anchor.setAttribute("stroke-width", anchorStrokeWidth);
            anchor.setAttribute("vector-effect", "non-scaling-stroke");
            const rotationLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            rotationLine.setAttribute("x1", this.x + this.width / 2);
            rotationLine.setAttribute("y1", this.y);
            rotationLine.setAttribute("x2", position.x);
            rotationLine.setAttribute("y2", position.y);
            rotationLine.setAttribute("stroke", "#5B57D1");
            rotationLine.setAttribute("stroke-width", anchorStrokeWidth);
            rotationLine.setAttribute("vector-effect", "non-scaling-stroke");
            if (this.rotation !== 0) {
              const centerX = this.x + this.width / 2;
              const centerY = this.y + this.height / 2;
              rotationLine.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
            }
            this.group.appendChild(rotationLine);
          } else {
            anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            anchor.setAttribute("x", position.x - anchorSize / 2);
            anchor.setAttribute("y", position.y - anchorSize / 2);
            anchor.setAttribute("width", anchorSize);
            anchor.setAttribute("height", anchorSize);
            anchor.setAttribute("fill", "#121212");
            anchor.setAttribute("stroke", "#5B57D1");
            anchor.setAttribute("stroke-width", anchorStrokeWidth);
            anchor.setAttribute("vector-effect", "non-scaling-stroke");
          }
          if (this.rotation !== 0) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            anchor.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
          }
          anchor.style.cursor = position.cursor;
          anchor.addEventListener("pointerdown", (e) => this.startAnchorDrag(e, index));
          this.anchors.push(anchor);
          this.group.appendChild(anchor);
        });
      }
      startAnchorDrag(e, index) {
        e.stopPropagation();
        e.preventDefault();
        dragOldPosFrame = {
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
          rotation: this.rotation
        };
        const startMousePos = getSVGCoordsFromMouse3(e);
        const initialFrame = {
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
          rotation: this.rotation
        };
        const onPointerMove = (event) => {
          const currentMousePos = getSVGCoordsFromMouse3(event);
          if (index === 8) {
            this.handleRotation(currentMousePos, initialFrame);
          } else {
            this.handleResize(index, currentMousePos, startMousePos, initialFrame);
          }
          this.draw();
          this.updateContainedShapes();
        };
        const onPointerUp = () => {
          if (dragOldPosFrame) {
            const newPos = {
              x: this.x,
              y: this.y,
              width: this.width,
              height: this.height,
              rotation: this.rotation
            };
            pushTransformAction(this, dragOldPosFrame, newPos);
            dragOldPosFrame = null;
          }
          svg.removeEventListener("pointermove", onPointerMove);
          svg.removeEventListener("pointerup", onPointerUp);
          svg.style.cursor = "default";
        };
        svg.addEventListener("pointermove", onPointerMove);
        svg.addEventListener("pointerup", onPointerUp);
      }
      handleRotation(mousePos, initialFrame) {
        const centerX = initialFrame.x + initialFrame.width / 2;
        const centerY = initialFrame.y + initialFrame.height / 2;
        const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
        const newRotation = (angle * 180 / Math.PI + 90) % 360;
        const angleDiff = newRotation - this.rotation;
        const angleRad = angleDiff * Math.PI / 180;
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);
        const rotationCenter = { x: centerX, y: centerY };
        this.containedShapes.forEach((shape) => {
          if (!shape) return;
          shape.isBeingMovedByFrame = true;
          switch (shape.shapeName) {
            case "rectangle":
            case "frame":
            case "image":
            case "icon":
              const shapeCenterX = shape.x + shape.width / 2;
              const shapeCenterY = shape.y + shape.height / 2;
              const relativeX = shapeCenterX - rotationCenter.x;
              const relativeY = shapeCenterY - rotationCenter.y;
              const newCenterX = rotationCenter.x + (relativeX * cosAngle - relativeY * sinAngle);
              const newCenterY = rotationCenter.y + (relativeX * sinAngle + relativeY * cosAngle);
              shape.x = newCenterX - shape.width / 2;
              shape.y = newCenterY - shape.height / 2;
              shape.rotation = (shape.rotation || 0) + angleDiff;
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "circle":
              const circleCenterX = shape.x;
              const circleCenterY = shape.y;
              const relativeCircleX = circleCenterX - rotationCenter.x;
              const relativeCircleY = circleCenterY - rotationCenter.y;
              const newCircleCenterX = rotationCenter.x + (relativeCircleX * cosAngle - relativeCircleY * sinAngle);
              const newCircleCenterY = rotationCenter.y + (relativeCircleX * sinAngle + relativeCircleY * cosAngle);
              shape.x = newCircleCenterX;
              shape.y = newCircleCenterY;
              shape.rotation = (shape.rotation || 0) + angleDiff;
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "line":
            case "arrow":
              const relativeStartX = shape.startPoint.x - rotationCenter.x;
              const relativeStartY = shape.startPoint.y - rotationCenter.y;
              const relativeEndX = shape.endPoint.x - rotationCenter.x;
              const relativeEndY = shape.endPoint.y - rotationCenter.y;
              const newStartX = rotationCenter.x + (relativeStartX * cosAngle - relativeStartY * sinAngle);
              const newStartY = rotationCenter.y + (relativeStartX * sinAngle + relativeStartY * cosAngle);
              const newEndX = rotationCenter.x + (relativeEndX * cosAngle - relativeEndY * sinAngle);
              const newEndY = rotationCenter.y + (relativeEndX * sinAngle + relativeEndY * cosAngle);
              shape.startPoint.x = newStartX;
              shape.startPoint.y = newStartY;
              shape.endPoint.x = newEndX;
              shape.endPoint.y = newEndY;
              if (shape.shapeName === "arrow" && shape.arrowCurved && typeof shape.initializeCurveControlPoints === "function") {
                shape.initializeCurveControlPoints();
              }
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "text":
            case "code":
              const textOrCodeEl = shape.group ? shape.group.querySelector("text") || shape.group.querySelector("foreignObject") : null;
              if (textOrCodeEl) {
                const bbox = textOrCodeEl.getBBox();
                const transform = shape.group.transform.baseVal.consolidate();
                const matrix = transform ? transform.matrix : { e: 0, f: 0 };
                const textCenterX = bbox.x + matrix.e + bbox.width / 2;
                const textCenterY = bbox.y + matrix.f + bbox.height / 2;
                const relativeTextX = textCenterX - rotationCenter.x;
                const relativeTextY = textCenterY - rotationCenter.y;
                const newTextCenterX = rotationCenter.x + (relativeTextX * cosAngle - relativeTextY * sinAngle);
                const newTextCenterY = rotationCenter.y + (relativeTextX * sinAngle + relativeTextY * cosAngle);
                const newTransformX = newTextCenterX - bbox.width / 2;
                const newTransformY = newTextCenterY - bbox.height / 2;
                const newShapeRotation = (shape.rotation || 0) + angleDiff;
                const textCenterRelativeX = bbox.width / 2;
                const textCenterRelativeY = bbox.height / 2;
                shape.group.setAttribute(
                  "transform",
                  `translate(${newTransformX}, ${newTransformY}) rotate(${newShapeRotation}, ${textCenterRelativeX}, ${textCenterRelativeY})`
                );
                shape.x = newTransformX;
                shape.y = newTransformY;
                shape.rotation = newShapeRotation;
              }
              break;
            case "freehandStroke":
              if (shape.points && Array.isArray(shape.points)) {
                shape.points = shape.points.map((point) => {
                  if (!Array.isArray(point) || point.length < 2) return point;
                  const relativePointX = point[0] - rotationCenter.x;
                  const relativePointY = point[1] - rotationCenter.y;
                  const newPointX = rotationCenter.x + (relativePointX * cosAngle - relativePointY * sinAngle);
                  const newPointY = rotationCenter.y + (relativePointX * sinAngle + relativePointY * cosAngle);
                  return [newPointX, newPointY, point[2] || 0.5];
                });
                if (typeof shape.updateBoundingBox === "function") {
                  shape.updateBoundingBox();
                }
                if (typeof shape.draw === "function") {
                  shape.draw();
                }
              }
              break;
          }
          if (typeof shape.updateAttachedArrows === "function") {
            shape.updateAttachedArrows();
          }
          delete shape.isBeingMovedByFrame;
        });
        this.rotation = newRotation;
        this.updateAttachedArrows();
      }
      handleResize(anchorIndex, currentPos, startPos, initialFrame) {
        const rawDx = currentPos.x - startPos.x;
        const rawDy = currentPos.y - startPos.y;
        const rad = (this.rotation || 0) * Math.PI / 180;
        const cosR = Math.cos(rad);
        const sinR = Math.sin(rad);
        const dx = rawDx * cosR + rawDy * sinR;
        const dy = -rawDx * sinR + rawDy * cosR;
        const oldX = this.x, oldY = this.y, oldW = this.width, oldH = this.height;
        let newW, newH;
        let fixRelX, fixRelY;
        switch (anchorIndex) {
          case 0:
            newW = Math.max(10, initialFrame.width - dx);
            newH = Math.max(10, initialFrame.height - dy);
            fixRelX = initialFrame.width;
            fixRelY = initialFrame.height;
            break;
          case 1:
            newW = initialFrame.width;
            newH = Math.max(10, initialFrame.height - dy);
            fixRelX = 0;
            fixRelY = initialFrame.height;
            break;
          case 2:
            newW = Math.max(10, initialFrame.width + dx);
            newH = Math.max(10, initialFrame.height - dy);
            fixRelX = 0;
            fixRelY = initialFrame.height;
            break;
          case 3:
            newW = Math.max(10, initialFrame.width + dx);
            newH = initialFrame.height;
            fixRelX = 0;
            fixRelY = 0;
            break;
          case 4:
            newW = Math.max(10, initialFrame.width + dx);
            newH = Math.max(10, initialFrame.height + dy);
            fixRelX = 0;
            fixRelY = 0;
            break;
          case 5:
            newW = initialFrame.width;
            newH = Math.max(10, initialFrame.height + dy);
            fixRelX = 0;
            fixRelY = 0;
            break;
          case 6:
            newW = Math.max(10, initialFrame.width - dx);
            newH = Math.max(10, initialFrame.height + dy);
            fixRelX = initialFrame.width;
            fixRelY = 0;
            break;
          case 7:
            newW = Math.max(10, initialFrame.width - dx);
            newH = initialFrame.height;
            fixRelX = initialFrame.width;
            fixRelY = 0;
            break;
        }
        if (this.rotation && this.rotation !== 0) {
          const iCX = initialFrame.x + initialFrame.width / 2;
          const iCY = initialFrame.y + initialFrame.height / 2;
          const odx = initialFrame.x + fixRelX - iCX;
          const ody = initialFrame.y + fixRelY - iCY;
          const fixedWorldX = iCX + odx * cosR - ody * sinR;
          const fixedWorldY = iCY + odx * sinR + ody * cosR;
          const fixNewRelX = fixRelX === 0 ? 0 : newW;
          const fixNewRelY = fixRelY === 0 ? 0 : newH;
          const ncx = newW / 2;
          const ncy = newH / 2;
          const ndx = fixNewRelX - ncx;
          const ndy = fixNewRelY - ncy;
          const rotX = ncx + ndx * cosR - ndy * sinR;
          const rotY = ncy + ndx * sinR + ndy * cosR;
          this.x = fixedWorldX - rotX;
          this.y = fixedWorldY - rotY;
        } else {
          switch (anchorIndex) {
            case 0:
              this.x = initialFrame.x + (initialFrame.width - newW);
              this.y = initialFrame.y + (initialFrame.height - newH);
              break;
            case 1:
              this.y = initialFrame.y + (initialFrame.height - newH);
              break;
            case 2:
              this.y = initialFrame.y + (initialFrame.height - newH);
              break;
            case 3:
              break;
            case 4:
              break;
            case 5:
              break;
            case 6:
              this.x = initialFrame.x + (initialFrame.width - newW);
              break;
            case 7:
              this.x = initialFrame.x + (initialFrame.width - newW);
              break;
          }
        }
        this.width = newW;
        this.height = newH;
        if (oldW > 0 && oldH > 0) {
          const scaleX = this.width / oldW;
          const scaleY = this.height / oldH;
          if (Math.abs(scaleX - 1) > 1e-3 || Math.abs(scaleY - 1) > 1e-3) {
            this.containedShapes.forEach((shape) => {
              if (!shape) return;
              shape.isBeingMovedByFrame = true;
              switch (shape.shapeName) {
                case "rectangle":
                case "image":
                case "icon":
                case "code": {
                  const relX = (shape.x - oldX) / oldW;
                  const relY = (shape.y - oldY) / oldH;
                  const relW = shape.width / oldW;
                  const relH = shape.height / oldH;
                  shape.x = this.x + relX * this.width;
                  shape.y = this.y + relY * this.height;
                  shape.width = relW * this.width;
                  shape.height = relH * this.height;
                  if (typeof shape.draw === "function") shape.draw();
                  break;
                }
                case "circle": {
                  const relCX = (shape.x - oldX) / oldW;
                  const relCY = (shape.y - oldY) / oldH;
                  shape.x = this.x + relCX * this.width;
                  shape.y = this.y + relCY * this.height;
                  shape.rx = shape.rx / oldW * this.width;
                  shape.ry = shape.ry / oldH * this.height;
                  shape.width = shape.rx * 2;
                  shape.height = shape.ry * 2;
                  if (typeof shape.draw === "function") shape.draw();
                  break;
                }
                case "arrow":
                case "line": {
                  const relSX = (shape.startPoint.x - oldX) / oldW;
                  const relSY = (shape.startPoint.y - oldY) / oldH;
                  const relEX = (shape.endPoint.x - oldX) / oldW;
                  const relEY = (shape.endPoint.y - oldY) / oldH;
                  shape.startPoint.x = this.x + relSX * this.width;
                  shape.startPoint.y = this.y + relSY * this.height;
                  shape.endPoint.x = this.x + relEX * this.width;
                  shape.endPoint.y = this.y + relEY * this.height;
                  if (shape.controlPoint1) {
                    const relC1X = (shape.controlPoint1.x - oldX) / oldW;
                    const relC1Y = (shape.controlPoint1.y - oldY) / oldH;
                    shape.controlPoint1.x = this.x + relC1X * this.width;
                    shape.controlPoint1.y = this.y + relC1Y * this.height;
                  }
                  if (shape.controlPoint2) {
                    const relC2X = (shape.controlPoint2.x - oldX) / oldW;
                    const relC2Y = (shape.controlPoint2.y - oldY) / oldH;
                    shape.controlPoint2.x = this.x + relC2X * this.width;
                    shape.controlPoint2.y = this.y + relC2Y * this.height;
                  }
                  if (typeof shape.draw === "function") shape.draw();
                  break;
                }
                case "text": {
                  const tx = shape.x || 0;
                  const ty = shape.y || 0;
                  const relTX = (tx - oldX) / oldW;
                  const relTY = (ty - oldY) / oldH;
                  shape.x = this.x + relTX * this.width;
                  shape.y = this.y + relTY * this.height;
                  break;
                }
              }
              if (typeof shape.updateAttachedArrows === "function") {
                shape.updateAttachedArrows();
              }
              delete shape.isBeingMovedByFrame;
            });
          }
        }
        this.updateContainedShapes();
      }
      temporarilyRemoveFromFrame(shape) {
        if (shape && shape.parentFrame === this) {
          const el = shape.group || shape.element;
          if (el && el.parentNode === this.clipGroup) {
            this.clipGroup.removeChild(el);
            svg.appendChild(el);
          }
          shape.isDraggedOutTemporarily = true;
        }
      }
      // Add a method to restore clipping for a shape after drag
      restoreToFrame(shape) {
        if (shape && shape.parentFrame === this && shape.isDraggedOutTemporarily) {
          const el = shape.group || shape.element;
          if (el && el.parentNode === svg) {
            svg.removeChild(el);
            this.clipGroup.appendChild(el);
          }
          delete shape.isDraggedOutTemporarily;
        }
      }
      contains(viewBoxX, viewBoxY) {
        return viewBoxX >= this.x && viewBoxX <= this.x + this.width && viewBoxY >= this.y && viewBoxY <= this.y + this.height;
      }
      // Arrow attachment support (similar to other shapes)
      getAttachmentPoint(point, tolerance = 20) {
        const rect = {
          left: this.x,
          right: this.x + this.width,
          top: this.y,
          bottom: this.y + this.height
        };
        const distances = {
          top: Math.abs(point.y - rect.top),
          bottom: Math.abs(point.y - rect.bottom),
          left: Math.abs(point.x - rect.left),
          right: Math.abs(point.x - rect.right)
        };
        let closestSide = null;
        let minDistance2 = tolerance;
        for (let side in distances) {
          if (distances[side] < minDistance2 && ((side === "top" || side === "bottom") && point.x >= rect.left && point.x <= rect.right) || (side === "left" || side === "right") && point.y >= rect.top && point.y <= rect.bottom) {
            minDistance2 = distances[side];
            closestSide = side;
          }
        }
        if (closestSide) {
          let attachPoint;
          const offset = { x: 0, y: 0 };
          switch (closestSide) {
            case "top":
              attachPoint = { x: point.x, y: rect.top };
              offset.x = point.x - (rect.left + this.width / 2);
              break;
            case "bottom":
              attachPoint = { x: point.x, y: rect.bottom };
              offset.x = point.x - (rect.left + this.width / 2);
              break;
            case "left":
              attachPoint = { x: rect.left, y: point.y };
              offset.y = point.y - (rect.top + this.height / 2);
              break;
            case "right":
              attachPoint = { x: rect.right, y: point.y };
              offset.y = point.y - (rect.top + this.height / 2);
              break;
          }
          return { point: attachPoint, side: closestSide, offset, shape: this };
        }
        return null;
      }
      updateStyle(newOptions) {
        Object.keys(newOptions).forEach((key) => newOptions[key] === void 0 && delete newOptions[key]);
        this.options = { ...this.options, ...newOptions };
        this.draw();
      }
      destroy() {
        const isDiagramFrame = !!this._diagramType;
        [...this.containedShapes].forEach((shape) => {
          if (isDiagramFrame) {
            if (typeof window.cleanupAttachments === "function") {
              window.cleanupAttachments(shape);
            }
            const el = shape.group || shape.element;
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
            if (shape.shapeName === "frame") {
              if (shape.clipGroup && shape.clipGroup.parentNode) {
                shape.clipGroup.parentNode.removeChild(shape.clipGroup);
              }
              if (shape.clipPath && shape.clipPath.parentNode) {
                shape.clipPath.parentNode.removeChild(shape.clipPath);
              }
            }
            const idx = shapes.indexOf(shape);
            if (idx > -1) {
              shapes.splice(idx, 1);
            }
          } else {
            const el = shape.group || shape.element;
            if (el) {
              if (el.parentNode === this.clipGroup) {
                this.clipGroup.removeChild(el);
              }
              svg.appendChild(el);
            }
            if (shape.shapeName === "frame" && shape.clipGroup) {
              if (shape.clipGroup.parentNode === this.clipGroup) {
                this.clipGroup.removeChild(shape.clipGroup);
              }
              svg.appendChild(shape.clipGroup);
            }
          }
          shape.parentFrame = null;
          delete shape.isBeingMovedByFrame;
        });
        this.containedShapes = [];
        if (this.clipPath && this.clipPath.parentNode) {
          this.clipPath.parentNode.removeChild(this.clipPath);
        }
        if (this.clipGroup && this.clipGroup.parentNode) {
          this.clipGroup.parentNode.removeChild(this.clipGroup);
        }
        if (this.group && this.group.parentNode) {
          this.group.parentNode.removeChild(this.group);
        }
        const index = shapes.indexOf(this);
        if (index > -1) {
          shapes.splice(index, 1);
        }
        if (currentShape === this) {
          currentShape = null;
        }
      }
      /**
       * Set a background image for this frame from a URL.
       * The image will fit/cover the frame dimensions.
       * @param {string} url - Image URL
       * @param {string} fit - 'cover' (default) | 'contain' | 'fill'
       */
      setImageFromURL(url, fit = "cover") {
        if (!url) {
          if (this._frameImage && this._frameImage.parentNode) {
            this._frameImage.parentNode.removeChild(this._frameImage);
            this._frameImage = null;
          }
          this._frameImageURL = null;
          return;
        }
        this._frameImageURL = url;
        this._frameImageFit = fit;
        if (!this._frameImage) {
          this._frameImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
          this._frameImage.setAttribute("pointer-events", "none");
        }
        this._frameImage.setAttribute(
          "preserveAspectRatio",
          fit === "cover" ? "xMidYMid slice" : fit === "contain" ? "xMidYMid meet" : fit === "center" ? "xMidYMid meet" : "none"
        );
        this._frameImage.setAttribute("href", url);
        this._frameImage.setAttribute("x", this.x);
        this._frameImage.setAttribute("y", this.y);
        this._frameImage.setAttribute("width", this.width);
        this._frameImage.setAttribute("height", this.height);
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          this._frameImage.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        }
        if (this._frameImage.parentNode === this.group) {
          this.group.removeChild(this._frameImage);
        }
        if (this.element && this.element.nextSibling) {
          this.group.insertBefore(this._frameImage, this.element.nextSibling);
        } else {
          this.group.appendChild(this._frameImage);
        }
      }
      /**
       * Update frame image position/size (called during move/resize)
       */
      _updateFrameImage() {
        if (!this._frameImage) return;
        this._frameImage.setAttribute("x", this.x);
        this._frameImage.setAttribute("y", this.y);
        this._frameImage.setAttribute("width", this.width);
        this._frameImage.setAttribute("height", this.height);
        if (this.rotation !== 0) {
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          this._frameImage.setAttribute("transform", `rotate(${this.rotation}, ${centerX}, ${centerY})`);
        } else {
          this._frameImage.removeAttribute("transform");
        }
      }
    };
  }
});

// src/shapes/FreehandStroke.js
var FreehandStroke_exports = {};
__export(FreehandStroke_exports, {
  FreehandStroke: () => FreehandStroke2
});
import { getStroke } from "perfect-freehand";
function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";
  const pathData = [];
  pathData.push("M", stroke[0][0], stroke[0][1]);
  for (let i = 1; i < stroke.length - 1; i++) {
    const curr = stroke[i];
    const next = stroke[i + 1];
    const cpX = curr[0] + (next[0] - curr[0]) * 0.5;
    const cpY = curr[1] + (next[1] - curr[1]) * 0.5;
    pathData.push("Q", curr[0], curr[1], cpX, cpY);
  }
  if (stroke.length > 1) {
    const lastPoint2 = stroke[stroke.length - 1];
    pathData.push("L", lastPoint2[0], lastPoint2[1]);
  }
  return pathData.join(" ");
}
var FreehandStroke2;
var init_FreehandStroke = __esm({
  "src/shapes/FreehandStroke.js"() {
    FreehandStroke2 = class {
      constructor(points2 = [], options = {}) {
        this.points = points2;
        this.rawPoints = [];
        this.options = {
          stroke: "#fff",
          strokeWidth: 3,
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeOpacity: 1,
          thinning: 0.5,
          roughness: 0,
          strokeStyle: "solid",
          ...options
        };
        this.element = null;
        this.isSelected = false;
        this.rotation = 0;
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.anchors = [];
        this.rotationAnchor = null;
        this.rotationLine = null;
        this.selectionPadding = 8;
        this.selectionOutline = null;
        this.boundingBox = { x: 0, y: 0, width: 0, height: 0 };
        this.shapeName = "freehandStroke";
        this._moveOffsetX = 0;
        this._moveOffsetY = 0;
        this.parentFrame = null;
        svg.appendChild(this.group);
        this.draw();
      }
      // Add position and dimension properties for frame compatibility
      // Getters include pending move offset so callers see the visual position
      get x() {
        return this.boundingBox.x + (this._moveOffsetX || 0);
      }
      set x(value) {
        const dx = value - this.boundingBox.x - (this._moveOffsetX || 0);
        this.points = this.points.map((point) => [point[0] + dx, point[1], point[2] || 0.5]);
        this.boundingBox.x = value - (this._moveOffsetX || 0);
      }
      get y() {
        return this.boundingBox.y + (this._moveOffsetY || 0);
      }
      set y(value) {
        const dy = value - this.boundingBox.y - (this._moveOffsetY || 0);
        this.points = this.points.map((point) => [point[0], point[1] + dy, point[2] || 0.5]);
        this.boundingBox.y = value - (this._moveOffsetY || 0);
      }
      get width() {
        return this.boundingBox.width;
      }
      set width(value) {
        if (this.boundingBox.width === 0) return;
        const scaleX = value / this.boundingBox.width;
        const centerX = this.boundingBox.x + this.boundingBox.width / 2;
        this.points = this.points.map((point) => [
          centerX + (point[0] - centerX) * scaleX,
          point[1],
          point[2] || 0.5
        ]);
        this.boundingBox.width = value;
      }
      get height() {
        return this.boundingBox.height;
      }
      set height(value) {
        if (this.boundingBox.height === 0) return;
        const scaleY = value / this.boundingBox.height;
        const centerY = this.boundingBox.y + this.boundingBox.height / 2;
        this.points = this.points.map((point) => [
          point[0],
          centerY + (point[1] - centerY) * scaleY,
          point[2] || 0.5
        ]);
        this.boundingBox.height = value;
      }
      // Enhanced smoothing algorithm
      smoothPoints(points2, factor = 0.8) {
        if (points2.length < 3) return points2;
        const smoothed = [points2[0]];
        for (let i = 1; i < points2.length - 1; i++) {
          const prev = points2[i - 1];
          const curr = points2[i];
          const next = points2[i + 1];
          const smoothedX = curr[0] * (1 - factor) + (prev[0] + next[0]) * factor * 0.5;
          const smoothedY = curr[1] * (1 - factor) + (prev[1] + next[1]) * factor * 0.5;
          const pressure = curr[2] || 0.5;
          smoothed.push([smoothedX, smoothedY, pressure]);
        }
        smoothed.push(points2[points2.length - 1]);
        return smoothed;
      }
      // Interpolate points for smoother curves
      interpolatePoints(points2, steps = 2) {
        if (points2.length < 2) return points2;
        const interpolated = [points2[0]];
        for (let i = 0; i < points2.length - 1; i++) {
          const curr = points2[i];
          const next = points2[i + 1];
          for (let j = 1; j <= steps; j++) {
            const t = j / (steps + 1);
            const x = curr[0] + (next[0] - curr[0]) * t;
            const y = curr[1] + (next[1] - curr[1]) * t;
            const pressure = curr[2] + (next[2] - curr[2]) * t;
            interpolated.push([x, y, pressure]);
          }
          if (i < points2.length - 2) {
            interpolated.push(next);
          }
        }
        interpolated.push(points2[points2.length - 1]);
        return interpolated;
      }
      // Enhanced path generation with better curve fitting
      getPathData() {
        if (this.points.length < 2) return "";
        const isRough = this.options.roughness === "rough";
        const isMedium = this.options.roughness === "medium";
        let pts = this.points;
        if (isRough || isMedium) {
          const jitter = isRough ? 3.5 : 1.5;
          pts = pts.map((p, i) => {
            if (i === 0 || i === pts.length - 1) return p;
            return [
              p[0] + (Math.random() - 0.5) * jitter,
              p[1] + (Math.random() - 0.5) * jitter,
              p[2] || 0.5
            ];
          });
        }
        let smoothedPoints = this.interpolatePoints(pts, 1);
        if (!isRough) {
          smoothedPoints = this.smoothPoints(smoothedPoints, 0.6);
          smoothedPoints = this.smoothPoints(smoothedPoints, 0.4);
        }
        const thinning = this.options.thinning !== void 0 ? this.options.thinning : 0;
        const smoothing = isRough ? 0.3 : isMedium ? 0.6 : 0.9;
        const streamline = isRough ? 0.1 : isMedium ? 0.25 : 0.4;
        const stroke = getStroke(smoothedPoints, {
          size: this.options.strokeWidth,
          thinning,
          smoothing,
          streamline,
          easing: (t) => Math.sin(t * Math.PI * 0.5),
          start: {
            taper: thinning > 0 ? this.options.strokeWidth * 2 : 0,
            easing: (t) => t * t,
            cap: thinning === 0
          },
          end: {
            taper: thinning > 0 ? this.options.strokeWidth * 2 : 0,
            easing: (t) => --t * t * t + 1,
            cap: thinning === 0
          },
          simulatePressure: thinning > 0
        });
        return getSvgPathFromStroke(stroke);
      }
      // Simple centerline path used for dashed/dotted overlays
      getCenterlinePathData() {
        if (this.points.length < 2) return "";
        const d = [`M ${this.points[0][0]} ${this.points[0][1]}`];
        for (let i = 1; i < this.points.length - 1; i++) {
          const curr = this.points[i];
          const next = this.points[i + 1];
          const cpX = curr[0] + (next[0] - curr[0]) * 0.5;
          const cpY = curr[1] + (next[1] - curr[1]) * 0.5;
          d.push(`Q ${curr[0]} ${curr[1]} ${cpX} ${cpY}`);
        }
        const last = this.points[this.points.length - 1];
        d.push(`L ${last[0]} ${last[1]}`);
        return d.join(" ");
      }
      // Calculate the bounding box of the stroke
      calculateBoundingBox() {
        if (this.points.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0 };
        }
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        this.points.forEach((point) => {
          minX = Math.min(minX, point[0]);
          minY = Math.min(minY, point[1]);
          maxX = Math.max(maxX, point[0]);
          maxY = Math.max(maxY, point[1]);
        });
        if (minX === Infinity || minY === Infinity) {
          return { x: 0, y: 0, width: 0, height: 0 };
        }
        const padding = this.options.strokeWidth / 2;
        return {
          x: minX - padding,
          y: minY - padding,
          width: Math.max(0, maxX - minX + padding * 2),
          height: Math.max(0, maxY - minY + padding * 2)
        };
      }
      draw() {
        while (this.group.firstChild) {
          this.group.removeChild(this.group.firstChild);
        }
        if (this.selectionOutline && this.selectionOutline.parentNode === this.group) {
          this.group.removeChild(this.selectionOutline);
          this.selectionOutline = null;
        }
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const pathData = this.getPathData();
        path.setAttribute("d", pathData);
        path.setAttribute("fill", this.options.stroke);
        path.setAttribute("fill-opacity", this.options.strokeOpacity);
        path.setAttribute("stroke", "none");
        if (this.options.strokeStyle === "dashed" || this.options.strokeStyle === "dotted") {
          const dashArray = this.options.strokeStyle === "dashed" ? `${this.options.strokeWidth * 3} ${this.options.strokeWidth * 2}` : `${this.options.strokeWidth * 0.5} ${this.options.strokeWidth * 2}`;
          const overlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
          overlay.setAttribute("d", this.getCenterlinePathData());
          overlay.setAttribute("fill", "none");
          overlay.setAttribute("stroke", this.options.stroke);
          overlay.setAttribute("stroke-width", this.options.strokeWidth);
          overlay.setAttribute("stroke-linecap", "round");
          overlay.setAttribute("stroke-linejoin", "round");
          overlay.setAttribute("stroke-dasharray", dashArray);
          overlay.setAttribute("stroke-opacity", this.options.strokeOpacity);
          this.group.appendChild(overlay);
        }
        this.element = path;
        this.group.appendChild(path);
        this.boundingBox = this.calculateBoundingBox();
        const centerX = this.boundingBox.x + this.boundingBox.width / 2;
        const centerY = this.boundingBox.y + this.boundingBox.height / 2;
        if (!isNaN(centerX) && !isNaN(centerY)) {
          this.group.setAttribute("transform", `rotate(${this.rotation} ${centerX} ${centerY})`);
        }
        if (this.isSelected) {
          this.addAnchors();
        }
      }
      move(dx, dy) {
        this._moveOffsetX = (this._moveOffsetX || 0) + dx;
        this._moveOffsetY = (this._moveOffsetY || 0) + dy;
        const centerX = this.boundingBox.x + this.boundingBox.width / 2;
        const centerY = this.boundingBox.y + this.boundingBox.height / 2;
        const rot = this.rotation ? `rotate(${this.rotation} ${centerX} ${centerY})` : "";
        this.group.setAttribute("transform", `translate(${this._moveOffsetX}, ${this._moveOffsetY}) ${rot}`);
      }
      // Call after drag ends to bake the offset into actual point coordinates
      finalizeMove() {
        if (this._moveOffsetX || this._moveOffsetY) {
          const ox = this._moveOffsetX || 0;
          const oy = this._moveOffsetY || 0;
          this.points = this.points.map((point) => [point[0] + ox, point[1] + oy, point[2] || 0.5]);
          this._moveOffsetX = 0;
          this._moveOffsetY = 0;
          this.draw();
        }
      }
      updateAttachedArrows() {
        if (typeof window.__updateArrowsForShape === "function") {
          window.__updateArrowsForShape(this);
        }
      }
      selectStroke() {
        this.isSelected = true;
        this.draw();
        disableAllSideBars();
        paintBrushSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("freehandStroke");
        this.updateSidebar();
      }
      deselectStroke() {
        this.isSelected = false;
        this.anchors = [];
        this.rotationAnchor = null;
        this.draw();
      }
      removeSelection() {
        this.anchors.forEach((anchor) => {
          if (anchor.parentNode === this.group) {
            this.group.removeChild(anchor);
          }
        });
        if (this.rotationAnchor && this.rotationAnchor.parentNode === this.group) {
          this.group.removeChild(this.rotationAnchor);
        }
        if (this.rotationLine && this.rotationLine.parentNode === this.group) {
          this.group.removeChild(this.rotationLine);
        }
        if (this.selectionOutline && this.selectionOutline.parentNode === this.group) {
          this.group.removeChild(this.selectionOutline);
        }
        this.anchors = [];
        this.rotationAnchor = null;
        this.rotationLine = null;
        this.selectionOutline = null;
        this.isSelected = false;
      }
      // No-op: React sidebar handles UI updates via Zustand store
      updateSidebar() {
      }
      contains(x, y) {
        const ox = this._moveOffsetX || 0;
        const oy = this._moveOffsetY || 0;
        const bbX = this.boundingBox.x + ox;
        const bbY = this.boundingBox.y + oy;
        const centerX = bbX + this.boundingBox.width / 2;
        const centerY = bbY + this.boundingBox.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const angleRad = -this.rotation * Math.PI / 180;
        const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad) + centerX;
        const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad) + centerY;
        return rotatedX >= bbX && rotatedX <= bbX + this.boundingBox.width && rotatedY >= bbY && rotatedY <= bbY + this.boundingBox.height;
      }
      isNearAnchor(x, y) {
        if (!this.isSelected) return null;
        const buffer = 10;
        const anchorSize = 10 / currentZoom;
        const ox = this._moveOffsetX || 0;
        const oy = this._moveOffsetY || 0;
        const centerX = this.boundingBox.x + ox + this.boundingBox.width / 2;
        const centerY = this.boundingBox.y + oy + this.boundingBox.height / 2;
        const angleRad = -this.rotation * Math.PI / 180;
        const dx = x - centerX;
        const dy = y - centerY;
        const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad) + centerX;
        const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad) + centerY;
        const expandedX = this.boundingBox.x + ox - this.selectionPadding;
        const expandedY = this.boundingBox.y + oy - this.selectionPadding;
        const expandedWidth = this.boundingBox.width + 2 * this.selectionPadding;
        const expandedHeight = this.boundingBox.height + 2 * this.selectionPadding;
        const anchorPositions = [
          { x: expandedX, y: expandedY },
          // top-left
          { x: expandedX + expandedWidth, y: expandedY },
          // top-right
          { x: expandedX, y: expandedY + expandedHeight },
          // bottom-left
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight },
          // bottom-right
          { x: expandedX + expandedWidth / 2, y: expandedY },
          // top-center
          { x: expandedX + expandedWidth / 2, y: expandedY + expandedHeight },
          // bottom-center
          { x: expandedX, y: expandedY + expandedHeight / 2 },
          // left-center
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight / 2 }
          // right-center
        ];
        for (let i = 0; i < anchorPositions.length; i++) {
          const anchor = anchorPositions[i];
          const distance2 = Math.sqrt(Math.pow(localX - anchor.x, 2) + Math.pow(localY - anchor.y, 2));
          if (distance2 <= anchorSize / 2 + buffer) {
            return { type: "resize", index: i };
          }
        }
        if (this.rotationAnchor) {
          const rotationX = parseFloat(this.rotationAnchor.getAttribute("cx"));
          const rotationY = parseFloat(this.rotationAnchor.getAttribute("cy"));
          const distance2 = Math.sqrt(Math.pow(x - rotationX, 2) + Math.pow(y - rotationY, 2));
          if (distance2 <= anchorSize / 2 + buffer) {
            return { type: "rotate" };
          }
        }
        return null;
      }
      rotate(angle) {
        this.rotation = angle;
        if (this.isSelected && this.anchors.length > 0) {
          const cursors = ["nw-resize", "ne-resize", "sw-resize", "se-resize", "n-resize", "s-resize", "w-resize", "e-resize"];
          this.anchors.forEach((anchor, i) => {
            if (anchor) {
              const originalCursor = cursors[i];
              const rotatedCursor = this.getRotatedCursor(originalCursor, this.rotation);
              anchor.style.cursor = rotatedCursor;
            }
          });
        }
      }
      addAnchors() {
        const anchorSize = 10 / currentZoom;
        const anchorStrokeWidth = 2 / currentZoom;
        const expandedX = this.boundingBox.x - this.selectionPadding;
        const expandedY = this.boundingBox.y - this.selectionPadding;
        const expandedWidth = this.boundingBox.width + 2 * this.selectionPadding;
        const expandedHeight = this.boundingBox.height + 2 * this.selectionPadding;
        const positions = [
          { x: expandedX, y: expandedY, cursor: "nw-resize" },
          // top-left
          { x: expandedX + expandedWidth, y: expandedY, cursor: "ne-resize" },
          // top-right
          { x: expandedX, y: expandedY + expandedHeight, cursor: "sw-resize" },
          // bottom-left
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight, cursor: "se-resize" },
          // bottom-right
          { x: expandedX + expandedWidth / 2, y: expandedY, cursor: "n-resize" },
          // top-center
          { x: expandedX + expandedWidth / 2, y: expandedY + expandedHeight, cursor: "s-resize" },
          // bottom-center
          { x: expandedX, y: expandedY + expandedHeight / 2, cursor: "w-resize" },
          // left-center
          { x: expandedX + expandedWidth, y: expandedY + expandedHeight / 2, cursor: "e-resize" }
          // right-center
        ];
        positions.forEach((pos, i) => {
          const anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          anchor.setAttribute("x", pos.x - anchorSize / 2);
          anchor.setAttribute("y", pos.y - anchorSize / 2);
          anchor.setAttribute("width", anchorSize);
          anchor.setAttribute("height", anchorSize);
          anchor.setAttribute("class", "anchor");
          anchor.setAttribute("data-index", i);
          anchor.setAttribute("fill", "#121212");
          anchor.setAttribute("stroke", "#5B57D1");
          anchor.setAttribute("stroke-width", anchorStrokeWidth);
          anchor.setAttribute("vector-effect", "non-scaling-stroke");
          const rotatedCursor = this.getRotatedCursor(pos.cursor, this.rotation);
          anchor.style.cursor = rotatedCursor;
          anchor.style.pointerEvents = "all";
          this.group.appendChild(anchor);
          this.anchors[i] = anchor;
        });
        const rotationAnchorDistance = 30 / currentZoom;
        const rotationX = expandedX + expandedWidth / 2;
        const rotationY = expandedY - rotationAnchorDistance;
        const rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        rotationAnchor.setAttribute("cx", rotationX);
        rotationAnchor.setAttribute("cy", rotationY);
        rotationAnchor.setAttribute("r", anchorSize / 2);
        rotationAnchor.setAttribute("fill", "#121212");
        rotationAnchor.setAttribute("stroke", "#5B57D1");
        rotationAnchor.setAttribute("stroke-width", anchorStrokeWidth);
        rotationAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        rotationAnchor.setAttribute("class", "rotation-anchor");
        rotationAnchor.style.cursor = "grab";
        rotationAnchor.style.pointerEvents = "all";
        this.group.appendChild(rotationAnchor);
        this.rotationAnchor = rotationAnchor;
        const outlinePoints = [
          [expandedX, expandedY],
          [expandedX + expandedWidth, expandedY],
          [expandedX + expandedWidth, expandedY + expandedHeight],
          [expandedX, expandedY + expandedHeight],
          [expandedX, expandedY]
        ];
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        outline.setAttribute("points", outlinePoints.map((p) => p.join(",")).join(" "));
        outline.setAttribute("fill", "none");
        outline.setAttribute("stroke", "#5B57D1");
        outline.setAttribute("stroke-width", 1.5);
        outline.setAttribute("vector-effect", "non-scaling-stroke");
        outline.setAttribute("stroke-dasharray", "4 2");
        outline.setAttribute("style", "pointer-events: none;");
        this.group.appendChild(outline);
        this.selectionOutline = outline;
        const rotationLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        rotationLine.setAttribute("x1", rotationX);
        rotationLine.setAttribute("y1", rotationY);
        rotationLine.setAttribute("x2", expandedX + expandedWidth / 2);
        rotationLine.setAttribute("y2", expandedY);
        rotationLine.setAttribute("stroke", "#5B57D1");
        rotationLine.setAttribute("stroke-width", 1);
        rotationLine.setAttribute("vector-effect", "non-scaling-stroke");
        rotationLine.setAttribute("stroke-dasharray", "2 2");
        rotationLine.setAttribute("style", "pointer-events: none;");
        this.group.appendChild(rotationLine);
        this.rotationLine = rotationLine;
        disableAllSideBars();
        paintBrushSideBar.classList.remove("hidden");
        if (window.__showSidebarForShape) window.__showSidebarForShape("freehandStroke");
        this.updateSidebar();
      }
      getRotatedCursor(direction, angle) {
        const normalizedAngle = (angle % 360 + 360) % 360;
        const cursors = ["n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize"];
        const directionMap = {
          "n-resize": 0,
          "ne-resize": 1,
          "e-resize": 2,
          "se-resize": 3,
          "s-resize": 4,
          "sw-resize": 5,
          "w-resize": 6,
          "nw-resize": 7
        };
        if (!(direction in directionMap)) return direction;
        const rotationSteps = Math.round(normalizedAngle / 45);
        const currentIndex = directionMap[direction];
        const newIndex = (currentIndex + rotationSteps) % 8;
        return cursors[newIndex];
      }
      updatePosition(anchorIndex, newX, newY) {
        const centerX = this.boundingBox.x + this.boundingBox.width / 2;
        const centerY = this.boundingBox.y + this.boundingBox.height / 2;
        const angleRad = -this.rotation * Math.PI / 180;
        const dx = newX - centerX;
        const dy = newY - centerY;
        const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad) + centerX;
        const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad) + centerY;
        const expandedX = this.boundingBox.x - this.selectionPadding;
        const expandedY = this.boundingBox.y - this.selectionPadding;
        const expandedWidth = this.boundingBox.width + 2 * this.selectionPadding;
        const expandedHeight = this.boundingBox.height + 2 * this.selectionPadding;
        let scaleX = 1, scaleY = 1;
        switch (anchorIndex) {
          case 0:
            scaleX = (centerX - localX) / (centerX - expandedX);
            scaleY = (centerY - localY) / (centerY - expandedY);
            break;
          case 1:
            scaleX = (localX - centerX) / (expandedX + expandedWidth - centerX);
            scaleY = (centerY - localY) / (centerY - expandedY);
            break;
          case 2:
            scaleX = (centerX - localX) / (centerX - expandedX);
            scaleY = (localY - centerY) / (expandedY + expandedHeight - centerY);
            break;
          case 3:
            scaleX = (localX - centerX) / (expandedX + expandedWidth - centerX);
            scaleY = (localY - centerY) / (expandedY + expandedHeight - centerY);
            break;
          case 4:
            scaleY = (centerY - localY) / (centerY - expandedY);
            break;
          case 5:
            scaleY = (localY - centerY) / (expandedY + expandedHeight - centerY);
            break;
          case 6:
            scaleX = (centerX - localX) / (centerX - expandedX);
            break;
          case 7:
            scaleX = (localX - centerX) / (expandedX + expandedWidth - centerX);
            break;
        }
        scaleX = Math.max(0.1, Math.abs(scaleX));
        scaleY = Math.max(0.1, Math.abs(scaleY));
        this.points = this.points.map((point) => {
          const relX = point[0] - centerX;
          const relY = point[1] - centerY;
          return [
            centerX + relX * scaleX,
            centerY + relY * scaleY,
            point[2] || 0.5
          ];
        });
        this.draw();
      }
    };
  }
});

// src/tools/rectangleTool.js
var rectangleTool_exports = {};
__export(rectangleTool_exports, {
  handleMouseDownRect: () => handleMouseDownRect,
  handleMouseMoveRect: () => handleMouseMoveRect,
  handleMouseUpRect: () => handleMouseUpRect
});
function getSVGCoordsFromMouse4(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
var isDrawingSquare, isDraggingShapeSquare2, isResizingShapeSquare2, isRotatingShapeSquare2, resizingAnchorIndexSquare, startRotationMouseAngleSquare, startShapeRotationSquare, rc4, startX2, startY2, squareStrokecolor, squareBackgroundColor, squareFillStyleValue, squareStrokeThicknes, squareOutlineStyle, dragOldPosSquare, draggedShapeInitialFrame, hoveredFrame2, SquarecolorOptions2, backgroundColorOptionsSquare2, fillStyleOptions2, squareStrokeThicknessValue2, squareOutlineStyleValue2, handleMouseDownRect, handleMouseMoveRect, handleMouseUpRect;
var init_rectangleTool = __esm({
  "src/tools/rectangleTool.js"() {
    init_UndoRedo();
    init_SnapGuides();
    isDrawingSquare = false;
    isDraggingShapeSquare2 = false;
    isResizingShapeSquare2 = false;
    isRotatingShapeSquare2 = false;
    resizingAnchorIndexSquare = null;
    startRotationMouseAngleSquare = 0;
    startShapeRotationSquare = 0;
    rc4 = rough.svg(svg);
    squareStrokecolor = "#fff";
    squareBackgroundColor = "transparent";
    squareFillStyleValue = "none";
    squareStrokeThicknes = 2;
    squareOutlineStyle = "solid";
    dragOldPosSquare = null;
    draggedShapeInitialFrame = null;
    hoveredFrame2 = null;
    SquarecolorOptions2 = document.querySelectorAll(".squareStrokeSpan");
    backgroundColorOptionsSquare2 = document.querySelectorAll(".squareBackgroundSpan");
    fillStyleOptions2 = document.querySelectorAll(".squareFillStyleSpan");
    squareStrokeThicknessValue2 = document.querySelectorAll(".squareStrokeThickSpan");
    squareOutlineStyleValue2 = document.querySelectorAll(".squareOutlineStyle");
    handleMouseDownRect = (e) => {
      const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse4(e);
      if (isSquareToolActive) {
        startX2 = mouseX;
        startY2 = mouseY;
        isDrawingSquare = true;
        if (currentShape) {
          currentShape.removeSelection();
          currentShape = null;
          disableAllSideBars();
        }
        let initialOptions = {
          stroke: squareStrokecolor,
          fill: squareBackgroundColor,
          fillStyle: squareFillStyleValue,
          strokeWidth: squareStrokeThicknes
        };
        if (squareOutlineStyle === "dashed") {
          initialOptions.strokeDasharray = "10,10";
        } else if (squareOutlineStyle === "dotted") {
          initialOptions.strokeDasharray = "2,8";
        } else {
          initialOptions.strokeDasharray = "";
        }
        currentShape = new Rectangle(startX2, startY2, 0, 0, initialOptions);
        currentShape.setDrawingState(true);
      } else if (isSelectionToolActive) {
        let clickedOnShape = false;
        if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
          const anchorInfo = currentShape.isNearAnchor(mouseX, mouseY);
          if (anchorInfo) {
            dragOldPosSquare = { x: currentShape.x, y: currentShape.y, width: currentShape.width, height: currentShape.height, rotation: currentShape.rotation };
            if (anchorInfo.type === "resize") {
              isResizingShapeSquare2 = true;
              resizingAnchorIndexSquare = anchorInfo.index;
            } else if (anchorInfo.type === "rotate") {
              isRotatingShapeSquare2 = true;
              const CTM = currentShape.group.getCTM();
              if (CTM) {
                const svgPoint = svg.createSVGPoint();
                svgPoint.x = currentShape.width / 2;
                svgPoint.y = currentShape.height / 2;
                const centerSVG = svgPoint.matrixTransform(CTM);
                startRotationMouseAngleSquare = Math.atan2(mouseY - centerSVG.y, mouseX - centerSVG.x) * 180 / Math.PI;
                startShapeRotationSquare = currentShape.rotation;
              } else {
                isRotatingShapeSquare2 = false;
                console.warn("Could not get CTM for rotation.");
              }
            }
            clickedOnShape = true;
          } else if (currentShape.contains(mouseX, mouseY)) {
            isDraggingShapeSquare2 = true;
            dragOldPosSquare = { x: currentShape.x, y: currentShape.y, width: currentShape.width, height: currentShape.height, rotation: currentShape.rotation };
            draggedShapeInitialFrame = currentShape.parentFrame || null;
            if (currentShape.parentFrame) {
              currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
            }
            startX2 = mouseX;
            startY2 = mouseY;
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape) {
          let shapeToSelect = null;
          for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape.shapeName === "rectangle" && shape.contains(mouseX, mouseY)) {
              shapeToSelect = shape;
              break;
            }
          }
          if (currentShape && currentShape !== shapeToSelect) {
            currentShape.removeSelection();
            currentShape = null;
            disableAllSideBars();
          }
          if (shapeToSelect) {
            currentShape = shapeToSelect;
            currentShape.isSelected = true;
            currentShape.draw();
            isDraggingShapeSquare2 = true;
            dragOldPosSquare = { x: currentShape.x, y: currentShape.y, width: currentShape.width, height: currentShape.height, rotation: currentShape.rotation };
            draggedShapeInitialFrame = currentShape.parentFrame || null;
            if (currentShape.parentFrame) {
              currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
            }
            startX2 = mouseX;
            startY2 = mouseY;
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape && currentShape) {
          currentShape.removeSelection();
          currentShape = null;
          disableAllSideBars();
        }
      }
    };
    handleMouseMoveRect = (e) => {
      const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse4(e);
      const svgRect = svg.getBoundingClientRect();
      lastMousePos = {
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top
      };
      if (isDrawingSquare && isSquareToolActive && currentShape) {
        let width = mouseX - startX2;
        let height = mouseY - startY2;
        currentShape.x = width < 0 ? startX2 + width : startX2;
        currentShape.y = height < 0 ? startY2 + height : startY2;
        currentShape.width = Math.abs(width);
        currentShape.height = Math.abs(height);
        if (currentShape.element && currentShape.width > 0 && currentShape.height > 0) {
          if (currentShape.element.parentNode === currentShape.group) {
            currentShape.group.removeChild(currentShape.element);
          }
          const roughRect = rc4.rectangle(0, 0, currentShape.width, currentShape.height, currentShape.options);
          currentShape.element = roughRect;
          currentShape.group.appendChild(roughRect);
        }
        const rotateCenterX = currentShape.width / 2;
        const rotateCenterY = currentShape.height / 2;
        currentShape.group.setAttribute("transform", `translate(${currentShape.x}, ${currentShape.y}) rotate(${currentShape.rotation}, ${rotateCenterX}, ${rotateCenterY})`);
        shapes.forEach((frame) => {
          if (frame.shapeName === "frame") {
            if (frame.isShapeInFrame(currentShape)) {
              frame.highlightFrame();
              hoveredFrame2 = frame;
            } else if (hoveredFrame2 === frame) {
              frame.removeHighlight();
              hoveredFrame2 = null;
            }
          }
        });
      } else if (isDraggingShapeSquare2 && currentShape && currentShape.isSelected) {
        let dx = mouseX - startX2;
        let dy = mouseY - startY2;
        currentShape.move(dx, dy);
        startX2 = mouseX;
        startY2 = mouseY;
        if (window.__sketchStoreApi && window.__sketchStoreApi.getState().snapToObjects) {
          const snap = calculateSnap(currentShape, e.shiftKey, e.clientX, e.clientY);
          if (snap.dx || snap.dy) {
            currentShape.move(snap.dx, snap.dy);
          }
        } else {
          clearSnapGuides();
        }
      } else if (isResizingShapeSquare2 && currentShape && currentShape.isSelected && resizingAnchorIndexSquare !== null) {
        currentShape.updatePosition(resizingAnchorIndexSquare, mouseX, mouseY);
        currentShape._skipAnchors = true;
        currentShape.draw();
        currentShape._skipAnchors = false;
      } else if (isRotatingShapeSquare2 && currentShape && currentShape.isSelected) {
        const CTM = currentShape.group.getCTM();
        if (CTM) {
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = currentShape.width / 2;
          svgPoint.y = currentShape.height / 2;
          const centerSVG = svgPoint.matrixTransform(CTM);
          const currentRotationMouseAngle = Math.atan2(mouseY - centerSVG.y, mouseX - centerSVG.x) * 180 / Math.PI;
          const angleDiff = currentRotationMouseAngle - startRotationMouseAngleSquare;
          let newRotation = startShapeRotationSquare + angleDiff;
          const snapAngle = 15;
          if (e.shiftKey) {
            newRotation = Math.round(newRotation / snapAngle) * snapAngle;
          }
          currentShape.rotate(newRotation);
          currentShape._skipAnchors = true;
          currentShape.draw();
          currentShape._skipAnchors = false;
          svg.style.cursor = "grabbing";
        } else {
          isRotatingShapeSquare2 = false;
          svg.style.cursor = "default";
        }
      } else if (isSelectionToolActive && !isDrawingSquare && currentShape && currentShape.isSelected) {
        const anchorInfo = currentShape.isNearAnchor(mouseX, mouseY);
        if (anchorInfo) {
          if (anchorInfo.type === "resize") {
            const baseDirection = anchorInfo.index;
            const rotatedCursor = currentShape.getRotatedCursor(baseDirection, currentShape.rotation);
            svg.style.cursor = rotatedCursor + "-resize";
          } else if (anchorInfo.type === "rotate") {
            svg.style.cursor = "grab";
          }
        } else if (currentShape.contains(mouseX, mouseY)) {
          svg.style.cursor = "move";
        } else {
          svg.style.cursor = "default";
        }
      } else if (isSelectionToolActive && !isDrawingSquare && !isDraggingShapeSquare2 && !isResizingShapeSquare2 && !isRotatingShapeSquare2) {
        let hoveredShape = null;
        for (let i = shapes.length - 1; i >= 0; i--) {
          const shape = shapes[i];
          if (shape.shapeName === "rectangle" && shape.contains(mouseX, mouseY)) {
            hoveredShape = shape;
            break;
          }
        }
        if (hoveredShape) {
          svg.style.cursor = "pointer";
        } else {
          svg.style.cursor = "default";
        }
      }
    };
    handleMouseUpRect = (e) => {
      if (isDrawingSquare && currentShape) {
        currentShape.setDrawingState(false);
        if (currentShape.width === 0 || currentShape.height === 0) {
          if (currentShape.group.parentNode) {
            currentShape.group.parentNode.removeChild(currentShape.group);
          }
          currentShape = null;
        } else {
          currentShape.draw();
          shapes.push(currentShape);
          pushCreateAction(currentShape);
          const finalFrame = hoveredFrame2;
          if (finalFrame) {
            finalFrame.addShapeToFrame(currentShape);
            pushFrameAttachmentAction(finalFrame, currentShape, "attach", null);
          }
          const drawnShape = currentShape;
          if (window.__sketchStoreApi) window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
          currentShape = drawnShape;
          currentShape.isSelected = true;
          if (typeof currentShape.addAnchors === "function") {
            currentShape.addAnchors();
          }
        }
        if (hoveredFrame2) {
          hoveredFrame2.removeHighlight();
          hoveredFrame2 = null;
        }
      }
      if ((isDraggingShapeSquare2 || isResizingShapeSquare2 || isRotatingShapeSquare2) && dragOldPosSquare && currentShape) {
        const newPos = {
          x: currentShape.x,
          y: currentShape.y,
          width: currentShape.width,
          height: currentShape.height,
          rotation: currentShape.rotation,
          parentFrame: currentShape.parentFrame
        };
        const oldPos = {
          ...dragOldPosSquare,
          parentFrame: draggedShapeInitialFrame
        };
        const stateChanged = oldPos.x !== newPos.x || oldPos.y !== newPos.y || oldPos.width !== newPos.width || oldPos.height !== newPos.height || oldPos.rotation !== newPos.rotation;
        const frameChanged = oldPos.parentFrame !== newPos.parentFrame;
        if (stateChanged || frameChanged) {
          pushTransformAction2(currentShape, oldPos, newPos);
        }
        if (isDraggingShapeSquare2) {
          const finalFrame = hoveredFrame2;
          if (draggedShapeInitialFrame !== finalFrame) {
            if (draggedShapeInitialFrame) {
              draggedShapeInitialFrame.removeShapeFromFrame(currentShape);
            }
            if (finalFrame) {
              finalFrame.addShapeToFrame(currentShape);
            }
            if (frameChanged) {
              pushFrameAttachmentAction(
                finalFrame || draggedShapeInitialFrame,
                currentShape,
                finalFrame ? "attach" : "detach",
                draggedShapeInitialFrame
              );
            }
          } else if (draggedShapeInitialFrame) {
            draggedShapeInitialFrame.restoreToFrame(currentShape);
          }
        }
        dragOldPosSquare = null;
        draggedShapeInitialFrame = null;
      }
      if (hoveredFrame2) {
        hoveredFrame2.removeHighlight();
        hoveredFrame2 = null;
      }
      isDrawingSquare = false;
      isDraggingShapeSquare2 = false;
      isResizingShapeSquare2 = false;
      isRotatingShapeSquare2 = false;
      resizingAnchorIndexSquare = null;
      startRotationMouseAngleSquare = 0;
      startShapeRotationSquare = 0;
      clearSnapGuides();
      svg.style.cursor = "default";
    };
    SquarecolorOptions2.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
          pushOptionsChangeAction(currentShape, { ...currentShape.options });
          squareStrokecolor = span.getAttribute("data-id");
          currentShape.options.stroke = squareStrokecolor;
          currentShape.draw();
          currentShape.updateSidebar();
        } else {
          squareStrokecolor = span.getAttribute("data-id");
        }
        SquarecolorOptions2.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
      });
    });
    backgroundColorOptionsSquare2.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
          pushOptionsChangeAction(currentShape, { ...currentShape.options });
          squareBackgroundColor = span.getAttribute("data-id");
          currentShape.options.fill = squareBackgroundColor;
          currentShape.draw();
          currentShape.updateSidebar();
        } else {
          squareBackgroundColor = span.getAttribute("data-id");
        }
        backgroundColorOptionsSquare2.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
      });
    });
    fillStyleOptions2.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
          pushOptionsChangeAction(currentShape, { ...currentShape.options });
          squareFillStyleValue = span.getAttribute("data-id");
          currentShape.options.fillStyle = squareFillStyleValue;
          currentShape.draw();
          currentShape.updateSidebar();
        } else {
          squareFillStyleValue = span.getAttribute("data-id");
        }
        fillStyleOptions2.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
      });
    });
    squareStrokeThicknessValue2.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
          pushOptionsChangeAction(currentShape, { ...currentShape.options });
          squareStrokeThicknes = parseInt(span.getAttribute("data-id"));
          currentShape.options.strokeWidth = squareStrokeThicknes;
          currentShape.draw();
          currentShape.updateSidebar();
        } else {
          squareStrokeThicknes = parseInt(span.getAttribute("data-id"));
        }
        squareStrokeThicknessValue2.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
      });
    });
    squareOutlineStyleValue2.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
          pushOptionsChangeAction(currentShape, { ...currentShape.options });
          squareOutlineStyle = span.getAttribute("data-id");
          if (squareOutlineStyle === "dashed") {
            currentShape.options.strokeDasharray = "10,10";
          } else if (squareOutlineStyle === "dotted") {
            currentShape.options.strokeDasharray = "2,8";
          } else {
            currentShape.options.strokeDasharray = "";
          }
          currentShape.draw();
          currentShape.updateSidebar();
        } else {
          squareOutlineStyle = span.getAttribute("data-id");
        }
        squareOutlineStyleValue2.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
      });
    });
    window.Rectangle = Rectangle;
    window.rectToolSettings = {
      get strokeColor() {
        return squareStrokecolor;
      },
      set strokeColor(v) {
        squareStrokecolor = v;
      },
      get bgColor() {
        return squareBackgroundColor;
      },
      set bgColor(v) {
        squareBackgroundColor = v;
      },
      get fillStyle() {
        return squareFillStyleValue;
      },
      set fillStyle(v) {
        squareFillStyleValue = v;
      },
      get strokeWidth() {
        return squareStrokeThicknes;
      },
      set strokeWidth(v) {
        squareStrokeThicknes = v;
      },
      get outlineStyle() {
        return squareOutlineStyle;
      },
      set outlineStyle(v) {
        squareOutlineStyle = v;
      }
    };
    window.updateSelectedRectStyle = function(changes) {
      if (currentShape && currentShape.shapeName === "rectangle" && currentShape.isSelected) {
        pushOptionsChangeAction(currentShape, { ...currentShape.options });
        if (changes.stroke !== void 0) {
          squareStrokecolor = changes.stroke;
          currentShape.options.stroke = changes.stroke;
        }
        if (changes.fill !== void 0) {
          squareBackgroundColor = changes.fill;
          currentShape.options.fill = changes.fill;
        }
        if (changes.fillStyle !== void 0) {
          squareFillStyleValue = changes.fillStyle;
          currentShape.options.fillStyle = changes.fillStyle;
        }
        if (changes.strokeWidth !== void 0) {
          squareStrokeThicknes = changes.strokeWidth;
          currentShape.options.strokeWidth = changes.strokeWidth;
        }
        if (changes.outlineStyle !== void 0) {
          squareOutlineStyle = changes.outlineStyle;
          if (changes.outlineStyle === "dashed") currentShape.options.strokeDasharray = "10,10";
          else if (changes.outlineStyle === "dotted") currentShape.options.strokeDasharray = "2,8";
          else currentShape.options.strokeDasharray = "";
        }
        currentShape.draw();
      } else {
        if (changes.stroke !== void 0) squareStrokecolor = changes.stroke;
        if (changes.fill !== void 0) squareBackgroundColor = changes.fill;
        if (changes.fillStyle !== void 0) squareFillStyleValue = changes.fillStyle;
        if (changes.strokeWidth !== void 0) squareStrokeThicknes = changes.strokeWidth;
        if (changes.outlineStyle !== void 0) squareOutlineStyle = changes.outlineStyle;
      }
    };
  }
});

// src/tools/circleTool.js
var circleTool_exports = {};
__export(circleTool_exports, {
  handleMouseDownCircle: () => handleMouseDown2,
  handleMouseMoveCircle: () => handleMouseMove2,
  handleMouseUpCircle: () => handleMouseUp2
});
function getSVGCoordsFromMouse5(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function deleteCurrentShape2() {
  if (currentShape && currentShape.shapeName === "circle") {
    const idx = shapes.indexOf(currentShape);
    if (idx !== -1) shapes.splice(idx, 1);
    cleanupAttachments2(currentShape);
    if (currentShape.group.parentNode) {
      currentShape.group.parentNode.removeChild(currentShape.group);
    }
    pushDeleteAction(currentShape);
    currentShape = null;
    disableAllSideBars();
  }
}
var isDrawingCircle, isDraggingShapeCircle2, isResizingShapeCircle2, isRotatingShapeCircle2, resizingAnchorIndexCircle, startRotationMouseAngleCircle, startShapeRotationCircle, rc5, startX3, startY3, circleStrokecolor, circleBackgroundColor, circleFillStyleValue, circleStrokeThicknes, circleOutlineStyle, dragOldPosCircle, draggedShapeInitialFrameCircle, hoveredFrameCircle2, colorOptionsCircle2, backgroundColorOptionsCircle2, fillStyleOptionsCircle2, strokeThicknessValueCircle2, outlineStyleValueCircle2, handleMouseDown2, handleMouseMove2, handleMouseUp2;
var init_circleTool = __esm({
  "src/tools/circleTool.js"() {
    init_UndoRedo();
    init_arrowTool();
    init_SnapGuides();
    isDrawingCircle = false;
    isDraggingShapeCircle2 = false;
    isResizingShapeCircle2 = false;
    isRotatingShapeCircle2 = false;
    resizingAnchorIndexCircle = null;
    startRotationMouseAngleCircle = null;
    startShapeRotationCircle = null;
    rc5 = rough.svg(svg);
    circleStrokecolor = "#fff";
    circleBackgroundColor = "transparent";
    circleFillStyleValue = "none";
    circleStrokeThicknes = 2;
    circleOutlineStyle = "solid";
    dragOldPosCircle = null;
    draggedShapeInitialFrameCircle = null;
    hoveredFrameCircle2 = null;
    colorOptionsCircle2 = document.querySelectorAll(".circleStrokeSpan");
    backgroundColorOptionsCircle2 = document.querySelectorAll(".circleBackgroundSpan");
    fillStyleOptionsCircle2 = document.querySelectorAll(".circleFillStyleSpan");
    strokeThicknessValueCircle2 = document.querySelectorAll(".circleStrokeThickSpan");
    outlineStyleValueCircle2 = document.querySelectorAll(".circleOutlineStyle");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && currentShape && currentShape.shapeName === "circle") {
        deleteCurrentShape2();
      }
    });
    handleMouseDown2 = (e) => {
      const { x: svgMouseX, y: svgMouseY } = getSVGCoordsFromMouse5(e);
      if (isCircleToolActive) {
        startX3 = svgMouseX;
        startY3 = svgMouseY;
        isDrawingCircle = true;
        if (currentShape) {
          currentShape.removeSelection();
          currentShape = null;
          disableAllSideBars();
        }
        let initialOptions = {
          stroke: circleStrokecolor,
          fill: circleBackgroundColor,
          fillStyle: circleFillStyleValue,
          strokeWidth: circleStrokeThicknes
        };
        if (circleOutlineStyle === "dashed") {
          initialOptions.strokeDasharray = "5,5";
        } else if (circleOutlineStyle === "dotted") {
          initialOptions.strokeDasharray = "2,8";
        } else {
          initialOptions.strokeDasharray = "";
        }
        currentShape = new Circle(startX3, startY3, 0, 0, initialOptions);
      } else if (isSelectionToolActive) {
        let clickedOnShape = false;
        if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
          const anchorInfo = currentShape.isNearAnchor(svgMouseX, svgMouseY);
          if (anchorInfo) {
            dragOldPosCircle = {
              x: currentShape.x,
              y: currentShape.y,
              rx: currentShape.rx,
              ry: currentShape.ry,
              rotation: currentShape.rotation
            };
            if (anchorInfo.type === "resize") {
              isResizingShapeCircle2 = true;
              resizingAnchorIndexCircle = anchorInfo.index;
            } else if (anchorInfo.type === "rotate") {
              isRotatingShapeCircle2 = true;
              const CTM = currentShape.group.getCTM();
              if (CTM) {
                const svgPoint = svg.createSVGPoint();
                svgPoint.x = currentShape.x;
                svgPoint.y = currentShape.y;
                const centerSVGPoint = svgPoint.matrixTransform(CTM);
                startRotationMouseAngleCircle = Math.atan2(svgMouseY - centerSVGPoint.y, svgMouseX - centerSVGPoint.x) * (180 / Math.PI);
                startShapeRotationCircle = currentShape.rotation;
              } else {
                isRotatingShapeCircle2 = false;
              }
            }
            clickedOnShape = true;
          } else if (currentShape.contains(svgMouseX, svgMouseY)) {
            isDraggingShapeCircle2 = true;
            dragOldPosCircle = {
              x: currentShape.x,
              y: currentShape.y,
              rx: currentShape.rx,
              ry: currentShape.ry,
              rotation: currentShape.rotation
            };
            draggedShapeInitialFrameCircle = currentShape.parentFrame || null;
            if (currentShape.parentFrame) {
              currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
            }
            startX3 = svgMouseX;
            startY3 = svgMouseY;
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape) {
          let shapeToSelect = null;
          for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape.shapeName === "circle" && shape.contains(svgMouseX, svgMouseY)) {
              shapeToSelect = shape;
              break;
            }
          }
          if (currentShape && currentShape !== shapeToSelect) {
            currentShape.removeSelection();
            currentShape = null;
            disableAllSideBars();
          }
          if (shapeToSelect) {
            currentShape = shapeToSelect;
            currentShape.isSelected = true;
            currentShape.draw();
            isDraggingShapeCircle2 = true;
            dragOldPosCircle = {
              x: currentShape.x,
              y: currentShape.y,
              rx: currentShape.rx,
              ry: currentShape.ry,
              rotation: currentShape.rotation
            };
            draggedShapeInitialFrameCircle = currentShape.parentFrame || null;
            if (currentShape.parentFrame) {
              currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
            }
            startX3 = svgMouseX;
            startY3 = svgMouseY;
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape && currentShape) {
          currentShape.removeSelection();
          currentShape = null;
          disableAllSideBars();
        }
      }
    };
    handleMouseMove2 = (e) => {
      const { x: svgMouseX, y: svgMouseY } = getSVGCoordsFromMouse5(e);
      const svgRect = svg.getBoundingClientRect();
      lastMousePos = {
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top
      };
      if (isDrawingCircle && isCircleToolActive && currentShape) {
        currentShape.x = (startX3 + svgMouseX) / 2;
        currentShape.y = (startY3 + svgMouseY) / 2;
        currentShape.rx = Math.abs(svgMouseX - startX3) / 2;
        currentShape.ry = Math.abs(svgMouseY - startY3) / 2;
        currentShape.draw();
        shapes.forEach((frame) => {
          if (frame.shapeName === "frame") {
            if (frame.isShapeInFrame(currentShape)) {
              frame.highlightFrame();
              hoveredFrameCircle2 = frame;
            } else if (hoveredFrameCircle2 === frame) {
              frame.removeHighlight();
              hoveredFrameCircle2 = null;
            }
          }
        });
      } else if (isDraggingShapeCircle2 && currentShape && currentShape.isSelected) {
        const dx = svgMouseX - startX3;
        const dy = svgMouseY - startY3;
        currentShape.move(dx, dy);
        startX3 = svgMouseX;
        startY3 = svgMouseY;
        if (window.__sketchStoreApi && window.__sketchStoreApi.getState().snapToObjects) {
          const snap = calculateSnap(currentShape, e.shiftKey, e.clientX, e.clientY);
          if (snap.dx || snap.dy) {
            currentShape.move(snap.dx, snap.dy);
          }
        } else {
          clearSnapGuides();
        }
      } else if (isResizingShapeCircle2 && currentShape && currentShape.isSelected) {
        currentShape.updatePosition(resizingAnchorIndexCircle, svgMouseX, svgMouseY);
        currentShape._skipAnchors = true;
        currentShape.draw();
        currentShape._skipAnchors = false;
      } else if (isRotatingShapeCircle2 && currentShape && currentShape.isSelected) {
        const CTM = currentShape.group.getCTM();
        if (CTM) {
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = currentShape.x;
          svgPoint.y = currentShape.y;
          const centerSVGPoint = svgPoint.matrixTransform(CTM);
          const currentMouseAngle = Math.atan2(svgMouseY - centerSVGPoint.y, svgMouseX - centerSVGPoint.x) * (180 / Math.PI);
          const angleDiff = currentMouseAngle - startRotationMouseAngleCircle;
          let newRotation = startShapeRotationCircle + angleDiff;
          const snapAngle = 15;
          if (e.shiftKey) {
            newRotation = Math.round(newRotation / snapAngle) * snapAngle;
          }
          currentShape.rotate(newRotation);
          currentShape._skipAnchors = true;
          currentShape.draw();
          currentShape._skipAnchors = false;
          svg.style.cursor = "grabbing";
        } else {
          isRotatingShapeCircle2 = false;
          svg.style.cursor = "default";
        }
      } else if (isSelectionToolActive && !isDrawingCircle && currentShape && currentShape.isSelected) {
        const anchorInfo = currentShape.isNearAnchor(svgMouseX, svgMouseY);
        if (anchorInfo) {
          if (anchorInfo.type === "resize") {
            const baseDirection = anchorInfo.index;
            const rotatedCursor = currentShape.getRotatedCursor(baseDirection, currentShape.rotation);
            svg.style.cursor = rotatedCursor + "-resize";
          } else if (anchorInfo.type === "rotate") {
            svg.style.cursor = "grab";
          }
        } else if (currentShape.contains(svgMouseX, svgMouseY)) {
          svg.style.cursor = "move";
        } else {
          svg.style.cursor = "default";
        }
      } else if (isSelectionToolActive && !isDrawingCircle && !isDraggingShapeCircle2 && !isResizingShapeCircle2 && !isRotatingShapeCircle2) {
        let hoveredShape = null;
        for (let i = shapes.length - 1; i >= 0; i--) {
          const shape = shapes[i];
          if (shape.shapeName === "circle" && shape.contains(svgMouseX, svgMouseY)) {
            hoveredShape = shape;
            break;
          }
        }
        if (hoveredShape) {
          svg.style.cursor = "pointer";
        } else {
          svg.style.cursor = "default";
        }
      }
    };
    handleMouseUp2 = (e) => {
      if (isDrawingCircle && currentShape) {
        if (currentShape.rx === 0 && currentShape.ry === 0) {
          if (currentShape.group.parentNode) {
            currentShape.group.parentNode.removeChild(currentShape.group);
          }
          currentShape = null;
        } else {
          shapes.push(currentShape);
          pushCreateAction(currentShape);
          const finalFrame = hoveredFrameCircle2;
          if (finalFrame) {
            finalFrame.addShapeToFrame(currentShape);
            pushFrameAttachmentAction(finalFrame, currentShape, "attach", null);
          }
          const drawnShape = currentShape;
          if (window.__sketchStoreApi) window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
          currentShape = drawnShape;
          currentShape.isSelected = true;
          if (typeof currentShape.addAnchors === "function") {
            currentShape.addAnchors();
          }
        }
        if (hoveredFrameCircle2) {
          hoveredFrameCircle2.removeHighlight();
          hoveredFrameCircle2 = null;
        }
      }
      if ((isDraggingShapeCircle2 || isResizingShapeCircle2 || isRotatingShapeCircle2) && dragOldPosCircle && currentShape) {
        const newPos = {
          x: currentShape.x,
          y: currentShape.y,
          rx: currentShape.rx,
          ry: currentShape.ry,
          rotation: currentShape.rotation,
          parentFrame: currentShape.parentFrame
        };
        const oldPos = {
          ...dragOldPosCircle,
          parentFrame: draggedShapeInitialFrameCircle
        };
        const stateChanged = oldPos.x !== newPos.x || oldPos.y !== newPos.y || oldPos.rx !== newPos.rx || oldPos.ry !== newPos.ry || oldPos.rotation !== newPos.rotation;
        const frameChanged = oldPos.parentFrame !== newPos.parentFrame;
        if (stateChanged || frameChanged) {
          const oldPosForUndo = {
            x: oldPos.x,
            y: oldPos.y,
            rx: oldPos.rx,
            ry: oldPos.ry,
            rotation: oldPos.rotation,
            parentFrame: oldPos.parentFrame
          };
          const newPosForUndo = {
            x: newPos.x,
            y: newPos.y,
            rx: newPos.rx,
            ry: newPos.ry,
            rotation: newPos.rotation,
            parentFrame: newPos.parentFrame
          };
          pushTransformAction2(currentShape, oldPosForUndo, newPosForUndo);
        }
        if (isDraggingShapeCircle2) {
          const finalFrame = hoveredFrameCircle2;
          if (draggedShapeInitialFrameCircle !== finalFrame) {
            if (draggedShapeInitialFrameCircle) {
              draggedShapeInitialFrameCircle.removeShapeFromFrame(currentShape);
            }
            if (finalFrame) {
              finalFrame.addShapeToFrame(currentShape);
            }
            if (frameChanged) {
              pushFrameAttachmentAction(
                finalFrame || draggedShapeInitialFrameCircle,
                currentShape,
                finalFrame ? "attach" : "detach",
                draggedShapeInitialFrameCircle
              );
            }
          } else if (draggedShapeInitialFrameCircle) {
            draggedShapeInitialFrameCircle.restoreToFrame(currentShape);
          }
        }
        dragOldPosCircle = null;
        draggedShapeInitialFrameCircle = null;
      }
      if (hoveredFrameCircle2) {
        hoveredFrameCircle2.removeHighlight();
        hoveredFrameCircle2 = null;
      }
      clearSnapGuides();
      isDrawingCircle = false;
      isDraggingShapeCircle2 = false;
      isResizingShapeCircle2 = false;
      isRotatingShapeCircle2 = false;
      resizingAnchorIndexCircle = null;
      startRotationMouseAngleCircle = null;
      startShapeRotationCircle = 0;
      svg.style.cursor = "default";
    };
    colorOptionsCircle2.forEach((span) => {
      span.addEventListener("click", function(event) {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
          const color = this.getAttribute("data-id");
          const oldOptions = { ...currentShape.options };
          currentShape.options.stroke = color;
          currentShape.draw();
          currentShape.updateSidebar();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          circleStrokecolor = this.getAttribute("data-id");
        }
        colorOptionsCircle2.forEach((span2) => {
          span2.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });
    backgroundColorOptionsCircle2.forEach((span) => {
      span.addEventListener("click", function(event) {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
          const color = this.getAttribute("data-id");
          const oldOptions = { ...currentShape.options };
          currentShape.options.fill = color;
          currentShape.draw();
          currentShape.updateSidebar();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          circleBackgroundColor = this.getAttribute("data-id");
        }
        backgroundColorOptionsCircle2.forEach((span2) => {
          span2.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });
    fillStyleOptionsCircle2.forEach((span) => {
      span.addEventListener("click", function(event) {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
          const style = this.getAttribute("data-id");
          const oldOptions = { ...currentShape.options };
          currentShape.options.fillStyle = style;
          currentShape.draw();
          currentShape.updateSidebar();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          circleFillStyleValue = this.getAttribute("data-id");
        }
        fillStyleOptionsCircle2.forEach((span2) => {
          span2.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });
    strokeThicknessValueCircle2.forEach((span) => {
      span.addEventListener("click", function(event) {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
          const thick = parseInt(this.getAttribute("data-id"), 10);
          const oldOptions = { ...currentShape.options };
          currentShape.options.strokeWidth = thick;
          currentShape.draw();
          currentShape.updateSidebar();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          circleStrokeThicknes = parseInt(this.getAttribute("data-id"), 10);
        }
        strokeThicknessValueCircle2.forEach((span2) => {
          span2.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });
    outlineStyleValueCircle2.forEach((span) => {
      span.addEventListener("click", function(event) {
        event.stopPropagation();
        if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
          const style = this.getAttribute("data-id");
          const oldOptions = { ...currentShape.options };
          if (style === "dashed") {
            currentShape.options.strokeDasharray = "5,5";
          } else if (style === "dotted") {
            currentShape.options.strokeDasharray = "2,8";
          } else {
            currentShape.options.strokeDasharray = "";
          }
          currentShape.draw();
          currentShape.updateSidebar();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          circleOutlineStyle = this.getAttribute("data-id");
        }
        outlineStyleValueCircle2.forEach((span2) => {
          span2.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });
    window.Circle = Circle;
    window.circleToolSettings = {
      get strokeColor() {
        return circleStrokecolor;
      },
      set strokeColor(v) {
        circleStrokecolor = v;
      },
      get bgColor() {
        return circleBackgroundColor;
      },
      set bgColor(v) {
        circleBackgroundColor = v;
      },
      get fillStyle() {
        return circleFillStyleValue;
      },
      set fillStyle(v) {
        circleFillStyleValue = v;
      },
      get strokeWidth() {
        return circleStrokeThicknes;
      },
      set strokeWidth(v) {
        circleStrokeThicknes = v;
      },
      get outlineStyle() {
        return circleOutlineStyle;
      },
      set outlineStyle(v) {
        circleOutlineStyle = v;
      }
    };
    window.updateSelectedCircleStyle = function(changes) {
      if (currentShape && currentShape.shapeName === "circle" && currentShape.isSelected) {
        pushOptionsChangeAction(currentShape, { ...currentShape.options });
        if (changes.stroke !== void 0) {
          circleStrokecolor = changes.stroke;
          currentShape.options.stroke = changes.stroke;
        }
        if (changes.fill !== void 0) {
          circleBackgroundColor = changes.fill;
          currentShape.options.fill = changes.fill;
        }
        if (changes.fillStyle !== void 0) {
          circleFillStyleValue = changes.fillStyle;
          currentShape.options.fillStyle = changes.fillStyle;
        }
        if (changes.strokeWidth !== void 0) {
          circleStrokeThicknes = changes.strokeWidth;
          currentShape.options.strokeWidth = changes.strokeWidth;
        }
        if (changes.outlineStyle !== void 0) {
          circleOutlineStyle = changes.outlineStyle;
          if (changes.outlineStyle === "dashed") currentShape.options.strokeDasharray = "5,5";
          else if (changes.outlineStyle === "dotted") currentShape.options.strokeDasharray = "2,8";
          else currentShape.options.strokeDasharray = "";
        }
        currentShape.draw();
      } else {
        if (changes.stroke !== void 0) circleStrokecolor = changes.stroke;
        if (changes.fill !== void 0) circleBackgroundColor = changes.fill;
        if (changes.fillStyle !== void 0) circleFillStyleValue = changes.fillStyle;
        if (changes.strokeWidth !== void 0) circleStrokeThicknes = changes.strokeWidth;
        if (changes.outlineStyle !== void 0) circleOutlineStyle = changes.outlineStyle;
      }
    };
  }
});

// src/tools/lineTool.js
var lineTool_exports = {};
__export(lineTool_exports, {
  handleMouseDownLine: () => handleMouseDown3,
  handleMouseMoveLine: () => handleMouseMove3,
  handleMouseUpLine: () => handleMouseUp3
});
function getSVGCoordsFromMouse6(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function deleteCurrentShape3() {
  if (currentShape && currentShape.shapeName === "line") {
    const idx = shapes.indexOf(currentShape);
    if (idx !== -1) shapes.splice(idx, 1);
    if (currentShape.group.parentNode) {
      currentShape.group.parentNode.removeChild(currentShape.group);
    }
    pushDeleteAction(currentShape);
    currentShape = null;
    disableAllSideBars();
  }
}
var isDrawingLine, currentLine, lineColor2, lineStrokeWidth2, lineStrokeStyle, lineEdgeType, lineSktetchRate, isDraggingLine, dragOldPosLine, draggedShapeInitialFrameLine, hoveredFrameLine2, startX4, startY4, lineColorOptions, lineThicknessOptions, lineOutlineOptions, lineSlopeOptions, lineEdgeOptions, handleMouseDown3, handleMouseMove3, handleMouseUp3;
var init_lineTool = __esm({
  "src/tools/lineTool.js"() {
    init_UndoRedo();
    init_SnapGuides();
    isDrawingLine = false;
    currentLine = null;
    lineColor2 = "#fff";
    lineStrokeWidth2 = 3;
    lineStrokeStyle = "solid";
    lineEdgeType = 1;
    lineSktetchRate = 3;
    isDraggingLine = false;
    dragOldPosLine = null;
    draggedShapeInitialFrameLine = null;
    hoveredFrameLine2 = null;
    lineColorOptions = document.querySelectorAll(".lineColor > span");
    lineThicknessOptions = document.querySelectorAll(".lineThicknessSpan");
    lineOutlineOptions = document.querySelectorAll(".lineStyleSpan");
    lineSlopeOptions = document.querySelectorAll(".lineSlopeSpan");
    lineEdgeOptions = document.querySelectorAll(".lineEdgeSpan");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && currentShape && currentShape.shapeName === "line") {
        deleteCurrentShape3();
      }
    });
    handleMouseDown3 = (e) => {
      if (!isLineToolActive && !isSelectionToolActive) return;
      const { x, y } = getSVGCoordsFromMouse6(e);
      if (isLineToolActive) {
        isDrawingLine = true;
        currentLine = new Line(
          { x, y },
          { x, y },
          {
            stroke: lineColor2,
            strokeWidth: lineStrokeWidth2,
            roughness: lineSktetchRate,
            bowing: lineEdgeType,
            strokeDasharray: lineStrokeStyle === "dashed" ? "5,5" : lineStrokeStyle === "dotted" ? "2,12" : ""
          }
        );
        currentLine.isBeingDrawn = true;
        shapes.push(currentLine);
        currentShape = currentLine;
      } else if (isSelectionToolActive) {
        let clickedOnShape = false;
        if (currentShape && currentShape.shapeName === "line" && currentShape.isSelected) {
          const anchorInfo = currentShape.isNearAnchor(x, y);
          if (anchorInfo && anchorInfo.type === "anchor") {
            clickedOnShape = true;
            dragOldPosLine = {
              startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
              endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
              controlPoint: currentShape.controlPoint ? { x: currentShape.controlPoint.x, y: currentShape.controlPoint.y } : null,
              isCurved: currentShape.isCurved,
              parentFrame: currentShape.parentFrame
            };
            const anchorIndex = anchorInfo.index;
            const onPointerMove = (event) => {
              const { x: newX, y: newY } = getSVGCoordsFromMouse6(event);
              currentShape.updatePosition(anchorIndex, newX, newY);
            };
            const onPointerUp = () => {
              if (dragOldPosLine) {
                const newPos = {
                  startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
                  endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
                  controlPoint: currentShape.controlPoint ? { x: currentShape.controlPoint.x, y: currentShape.controlPoint.y } : null,
                  isCurved: currentShape.isCurved,
                  parentFrame: currentShape.parentFrame
                };
                pushTransformAction2(currentShape, dragOldPosLine, newPos);
                dragOldPosLine = null;
              }
              svg.removeEventListener("pointermove", onPointerMove);
              svg.removeEventListener("pointerup", onPointerUp);
            };
            svg.addEventListener("pointermove", onPointerMove);
            svg.addEventListener("pointerup", onPointerUp);
            e.preventDefault();
            e.stopPropagation();
          } else if (currentShape.contains(x, y)) {
            isDraggingLine = true;
            dragOldPosLine = {
              startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
              endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
              controlPoint: currentShape.controlPoint ? { x: currentShape.controlPoint.x, y: currentShape.controlPoint.y } : null,
              isCurved: currentShape.isCurved,
              parentFrame: currentShape.parentFrame
            };
            draggedShapeInitialFrameLine = currentShape.parentFrame || null;
            if (currentShape.parentFrame) {
              currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
            }
            startX4 = x;
            startY4 = y;
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape) {
          let shapeToSelect = null;
          for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape instanceof Line && shape.contains(x, y)) {
              shapeToSelect = shape;
              break;
            }
          }
          if (currentShape && currentShape !== shapeToSelect) {
            currentShape.removeSelection();
            currentShape = null;
          }
          if (shapeToSelect) {
            currentShape = shapeToSelect;
            currentShape.selectLine();
            clickedOnShape = true;
          }
        }
        if (!clickedOnShape && currentShape) {
          currentShape.removeSelection();
          currentShape = null;
        }
      }
    };
    handleMouseMove3 = (e) => {
      const { x, y } = getSVGCoordsFromMouse6(e);
      const svgRect = svg.getBoundingClientRect();
      lastMousePos = {
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top
      };
      if (isDrawingLine && currentLine) {
        let endX = x, endY = y;
        if (e.shiftKey) {
          const dx = x - currentLine.startPoint.x;
          const dy = y - currentLine.startPoint.y;
          const angle = Math.atan2(dy, dx);
          const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
          const dist = Math.sqrt(dx * dx + dy * dy);
          endX = currentLine.startPoint.x + dist * Math.cos(snapAngle);
          endY = currentLine.startPoint.y + dist * Math.sin(snapAngle);
        }
        currentLine.endPoint = { x: endX, y: endY };
        currentLine.draw();
        shapes.forEach((frame) => {
          if (frame.shapeName === "frame") {
            if (frame.isShapeInFrame(currentLine)) {
              frame.highlightFrame();
              hoveredFrameLine2 = frame;
            } else if (hoveredFrameLine2 === frame) {
              frame.removeHighlight();
              hoveredFrameLine2 = null;
            }
          }
        });
      } else if (isDraggingLine && currentShape && currentShape.isSelected) {
        const dx = x - startX4;
        const dy = y - startY4;
        currentShape.move(dx, dy);
        startX4 = x;
        startY4 = y;
        if (window.__sketchStoreApi && window.__sketchStoreApi.getState().snapToObjects) {
          const snap = calculateSnap(currentShape, e.shiftKey, e.clientX, e.clientY);
          if (snap.dx || snap.dy) {
            currentShape.move(snap.dx, snap.dy);
          }
        } else {
          clearSnapGuides();
        }
      }
    };
    handleMouseUp3 = (e) => {
      if (isDrawingLine) {
        isDrawingLine = false;
        const dx = currentLine.endPoint.x - currentLine.startPoint.x;
        const dy = currentLine.endPoint.y - currentLine.startPoint.y;
        const lengthSq = dx * dx + dy * dy;
        if (lengthSq < (5 / currentZoom) ** 2) {
          shapes.pop();
          if (currentLine.group.parentNode) {
            currentLine.group.parentNode.removeChild(currentLine.group);
          }
          currentLine = null;
          currentShape = null;
        } else {
          currentLine.isBeingDrawn = false;
          currentLine.draw();
          pushCreateAction(currentLine);
          const finalFrame = hoveredFrameLine2;
          if (finalFrame) {
            finalFrame.addShapeToFrame(currentLine);
            pushFrameAttachmentAction(finalFrame, currentLine, "attach", null);
          }
          const drawnLine = currentLine;
          if (window.__sketchStoreApi) window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
          currentShape = drawnLine;
          drawnLine.selectLine();
        }
        if (hoveredFrameLine2) {
          hoveredFrameLine2.removeHighlight();
          hoveredFrameLine2 = null;
        }
        currentLine = null;
      }
      if (isDraggingLine && dragOldPosLine && currentShape) {
        const newPos = {
          startPoint: { x: currentShape.startPoint.x, y: currentShape.startPoint.y },
          endPoint: { x: currentShape.endPoint.x, y: currentShape.endPoint.y },
          controlPoint: currentShape.controlPoint ? { x: currentShape.controlPoint.x, y: currentShape.controlPoint.y } : null,
          parentFrame: currentShape.parentFrame
        };
        const oldPos = {
          ...dragOldPosLine,
          parentFrame: draggedShapeInitialFrameLine
        };
        const stateChanged = dragOldPosLine.startPoint.x !== newPos.startPoint.x || dragOldPosLine.startPoint.y !== newPos.startPoint.y || dragOldPosLine.endPoint.x !== newPos.endPoint.x || dragOldPosLine.endPoint.y !== newPos.endPoint.y;
        const frameChanged = oldPos.parentFrame !== newPos.parentFrame;
        if (stateChanged || frameChanged) {
          pushTransformAction2(currentShape, oldPos, newPos);
        }
        if (isDraggingLine) {
          const finalFrame = hoveredFrameLine2;
          if (draggedShapeInitialFrameLine !== finalFrame) {
            if (draggedShapeInitialFrameLine) {
              draggedShapeInitialFrameLine.removeShapeFromFrame(currentShape);
            }
            if (finalFrame) {
              finalFrame.addShapeToFrame(currentShape);
            }
            if (frameChanged) {
              pushFrameAttachmentAction(
                finalFrame || draggedShapeInitialFrameLine,
                currentShape,
                finalFrame ? "attach" : "detach",
                draggedShapeInitialFrameLine
              );
            }
          } else if (draggedShapeInitialFrameLine) {
            draggedShapeInitialFrameLine.restoreToFrame(currentShape);
          }
        }
        dragOldPosLine = null;
        draggedShapeInitialFrameLine = null;
      }
      if (hoveredFrameLine2) {
        hoveredFrameLine2.removeHighlight();
        hoveredFrameLine2 = null;
      }
      clearSnapGuides();
      isDraggingLine = false;
    };
    lineColorOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        lineColorOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof Line && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.stroke = span.getAttribute("data-id");
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          lineColor2 = span.getAttribute("data-id");
        }
      });
    });
    lineThicknessOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        lineThicknessOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof Line && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.strokeWidth = parseInt(span.getAttribute("data-id"));
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          lineStrokeWidth2 = parseInt(span.getAttribute("data-id"));
        }
      });
    });
    lineOutlineOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        lineOutlineOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof Line && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          const style = span.getAttribute("data-id");
          currentShape.options.strokeDasharray = style === "dashed" ? "5,5" : style === "dotted" ? "2,12" : "";
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          lineStrokeStyle = span.getAttribute("data-id");
        }
      });
    });
    lineSlopeOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        lineSlopeOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof Line && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.roughness = parseFloat(span.getAttribute("data-id"));
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          lineSktetchRate = parseFloat(span.getAttribute("data-id"));
        }
      });
    });
    lineEdgeOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        lineEdgeOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof Line && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.bowing = parseFloat(span.getAttribute("data-id"));
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          lineEdgeType = parseFloat(span.getAttribute("data-id"));
        }
      });
    });
    window.Line = Line;
    window.lineToolSettings = {
      get strokeColor() {
        return lineColor2;
      },
      set strokeColor(v) {
        lineColor2 = v;
      },
      get strokeWidth() {
        return lineStrokeWidth2;
      },
      set strokeWidth(v) {
        lineStrokeWidth2 = v;
      },
      get strokeStyle() {
        return lineStrokeStyle;
      },
      set strokeStyle(v) {
        lineStrokeStyle = v;
      },
      get sloppiness() {
        return lineSktetchRate;
      },
      set sloppiness(v) {
        lineSktetchRate = v;
      },
      get edge() {
        return lineEdgeType;
      },
      set edge(v) {
        lineEdgeType = v;
      }
    };
    window.updateSelectedLineStyle = function(changes) {
      if (currentShape instanceof Line && currentShape.isSelected) {
        const oldOptions = { ...currentShape.options };
        if (changes.stroke !== void 0) {
          lineColor2 = changes.stroke;
          currentShape.options.stroke = changes.stroke;
        }
        if (changes.strokeWidth !== void 0) {
          lineStrokeWidth2 = changes.strokeWidth;
          currentShape.options.strokeWidth = changes.strokeWidth;
        }
        if (changes.strokeStyle !== void 0) {
          lineStrokeStyle = changes.strokeStyle;
          currentShape.options.strokeDasharray = changes.strokeStyle === "dashed" ? "5,5" : changes.strokeStyle === "dotted" ? "2,12" : "";
        }
        if (changes.sloppiness !== void 0) {
          lineSktetchRate = changes.sloppiness;
          currentShape.options.roughness = changes.sloppiness;
        }
        if (changes.edge !== void 0) {
          lineEdgeType = changes.edge;
          currentShape.options.bowing = changes.edge;
        }
        currentShape.draw();
        pushOptionsChangeAction(currentShape, oldOptions);
      } else {
        if (changes.stroke !== void 0) lineColor2 = changes.stroke;
        if (changes.strokeWidth !== void 0) lineStrokeWidth2 = changes.strokeWidth;
        if (changes.strokeStyle !== void 0) lineStrokeStyle = changes.strokeStyle;
        if (changes.sloppiness !== void 0) lineSktetchRate = changes.sloppiness;
        if (changes.edge !== void 0) lineEdgeType = changes.edge;
      }
    };
  }
});

// src/tools/codeTool.js
var codeTool_exports = {};
__export(codeTool_exports, {
  addCodeBlock: () => addCodeBlock,
  applySyntaxHighlightingToSVG: () => applySyntaxHighlightingToSVG,
  createHighlightedSVGText: () => createHighlightedSVGText,
  deselectCodeBlock: () => deselectCodeBlock2,
  extractTextFromCodeElement: () => extractTextFromCodeElement,
  getCodeLanguage: () => getCodeLanguage,
  getSelectedCodeBlock: () => getSelectedCodeBlock,
  handleCodeMouseDown: () => handleCodeMouseDown,
  handleCodeMouseMove: () => handleCodeMouseMove,
  handleCodeMouseUp: () => handleCodeMouseUp,
  makeCodeEditable: () => makeCodeEditable,
  selectCodeBlock: () => selectCodeBlock2,
  setCodeLanguage: () => setCodeLanguage,
  updateCodeBackground: () => updateCodeBackground,
  wrapCodeElement: () => wrapCodeElement
});
function wrapCodeElement(groupElement) {
  const codeShape = new CodeShape(groupElement);
  groupElement.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    const codeElement = groupElement.querySelector("text");
    if (codeElement) {
      makeCodeEditable(codeElement, groupElement, e);
    }
  });
  return codeShape;
}
function getSVGCoordinates(event, element = svg) {
  if (!svg || !svg.createSVGPoint) {
    console.error("SVG element or createSVGPoint method not available.");
    return { x: 0, y: 0 };
  }
  let pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  try {
    let screenCTM = element && typeof element.getScreenCTM === "function" && element.getScreenCTM() || svg.getScreenCTM();
    if (!screenCTM) {
      console.error("Could not get Screen CTM.");
      return { x: event.clientX, y: event.clientY };
    }
    let svgPoint = pt.matrixTransform(screenCTM.inverse());
    return {
      x: svgPoint.x,
      y: svgPoint.y
    };
  } catch (error) {
    console.error("Error getting SVG coordinates:", error);
    return { x: event.clientX, y: event.clientY };
  }
}
function addCodeBlock(event) {
  let { x, y } = getSVGCoordinates(event);
  let gElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gElement.setAttribute("data-type", "code-group");
  gElement.setAttribute("transform", `translate(${x}, ${y})`);
  let backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  backgroundRect.setAttribute("class", "code-background");
  backgroundRect.setAttribute("x", -10);
  backgroundRect.setAttribute("y", -10);
  backgroundRect.setAttribute("width", 300);
  backgroundRect.setAttribute("height", 60);
  backgroundRect.setAttribute("fill", "#161b22");
  backgroundRect.setAttribute("stroke", "#30363d");
  backgroundRect.setAttribute("stroke-width", "1");
  backgroundRect.setAttribute("rx", "6");
  backgroundRect.setAttribute("ry", "6");
  gElement.appendChild(backgroundRect);
  let codeElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  let textAlignElement = "start";
  if (codeTextAlign === "center") textAlignElement = "middle";
  else if (codeTextAlign === "right") textAlignElement = "end";
  codeElement.setAttribute("x", 0);
  codeElement.setAttribute("y", 0);
  codeElement.setAttribute("fill", codeTextColor);
  codeElement.setAttribute("font-size", codeTextSize);
  codeElement.setAttribute("font-family", codeTextFont);
  codeElement.setAttribute("text-anchor", textAlignElement);
  codeElement.setAttribute("cursor", "text");
  codeElement.setAttribute("white-space", "pre");
  codeElement.setAttribute("dominant-baseline", "hanging");
  codeElement.textContent = "";
  gElement.setAttribute("data-x", x);
  gElement.setAttribute("data-y", y);
  codeElement.setAttribute("data-initial-size", codeTextSize);
  codeElement.setAttribute("data-initial-font", codeTextFont);
  codeElement.setAttribute("data-initial-color", codeTextColor);
  codeElement.setAttribute("data-initial-align", codeTextAlign);
  codeElement.setAttribute("data-language", codeLanguage);
  codeElement.setAttribute("data-type", "code");
  gElement.appendChild(codeElement);
  svg.appendChild(gElement);
  const shapeID = `code-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
  gElement.setAttribute("id", shapeID);
  codeElement.setAttribute("id", `${shapeID}-code`);
  const codeShape = wrapCodeElement(gElement);
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    shapes.push(codeShape);
  }
  pushCreateAction({
    type: "code",
    element: codeShape,
    shapeName: "code"
  });
  makeCodeEditable(codeElement, gElement);
}
function updateSyntaxHighlighting(editor) {
  if (window.hljs) {
    window.hljs.highlightElement(editor);
  }
}
function adjustCodeEditorSize2(editor) {
  const foreignObject = editor.closest("foreignObject");
  const codeContainer = editor.closest(".svg-code-container");
  if (!foreignObject || !codeContainer) return;
  const svgRect = svg.getBoundingClientRect();
  editor.style.overflow = "visible";
  editor.style.height = "auto";
  editor.style.width = "auto";
  editor.style.whiteSpace = "pre";
  let minContentWidth = editor.scrollWidth + (parseFloat(codeContainer.style.paddingLeft) || 0) + (parseFloat(codeContainer.style.paddingRight) || 0);
  let minContentHeight = editor.scrollHeight + (parseFloat(codeContainer.style.paddingTop) || 0) + (parseFloat(codeContainer.style.paddingBottom) || 0);
  const editorRect = editor.getBoundingClientRect();
  const maxWidth = svgRect.width - (editorRect.left - svgRect.left);
  const maxHeight = svgRect.height - (editorRect.top - svgRect.top);
  let newWidth = Math.min(Math.max(minContentWidth, 50), maxWidth);
  let newHeight = Math.min(Math.max(minContentHeight, 30), maxHeight);
  foreignObject.setAttribute("width", newWidth);
  foreignObject.setAttribute("height", newHeight);
  editor.style.width = `${newWidth - (parseFloat(codeContainer.style.paddingLeft) || 0) - (parseFloat(codeContainer.style.paddingRight) || 0)}px`;
  editor.style.height = `${newHeight - (parseFloat(codeContainer.style.paddingTop) || 0) - (parseFloat(codeContainer.style.paddingBottom) || 0)}px`;
  if (editor.scrollHeight > editor.clientHeight || editor.scrollWidth > editor.clientWidth) {
    editor.style.overflow = "auto";
  } else {
    editor.style.overflow = "hidden";
  }
  if (selectedCodeBlock2 && selectedCodeBlock2.contains(foreignObject)) {
    updateCodeSelectionFeedback2();
  }
}
function makeCodeEditable(codeElement, groupElement, clickEvent = null) {
  if (document.querySelector(".svg-code-editor")) {
    return;
  }
  if (selectedCodeBlock2) {
    deselectCodeBlock2();
  }
  removeCodeSelectionFeedback();
  let editorContainer = document.createElement("div");
  editorContainer.className = "svg-code-container";
  editorContainer.style.position = "absolute";
  editorContainer.style.zIndex = "10000";
  editorContainer.style.backgroundColor = "#161b22";
  editorContainer.style.border = "1px solid #30363d";
  editorContainer.style.borderRadius = "6px";
  editorContainer.style.padding = "12px";
  editorContainer.style.fontFamily = "monospace";
  editorContainer.style.overflow = "hidden";
  editorContainer.style.minWidth = "200px";
  editorContainer.style.minHeight = "40px";
  let input = document.createElement("div");
  input.className = "svg-code-editor";
  input.contentEditable = true;
  input.style.outline = "none";
  input.style.minHeight = "30px";
  input.style.maxHeight = "400px";
  input.style.overflowY = "auto";
  input.style.whiteSpace = "pre";
  input.style.fontFamily = "lixCode, Consolas, 'Courier New', monospace";
  input.style.fontSize = codeElement.getAttribute("font-size") || codeTextSize;
  input.style.color = "#c9d1d9";
  input.style.lineHeight = "1.4";
  input.style.tabSize = "4";
  input.style.background = "transparent";
  let codeContent = extractTextFromCodeElement(codeElement);
  input.textContent = codeContent;
  editorContainer.appendChild(input);
  const svgRect = svg.getBoundingClientRect();
  let left = svgRect.left, top = svgRect.top;
  if (clickEvent) {
    left += clickEvent.clientX - svgRect.left;
    top += clickEvent.clientY - svgRect.top;
  } else {
    let groupTransformMatrix = svg.createSVGMatrix();
    if (groupElement && groupElement.transform && groupElement.transform.baseVal) {
      const transformList = groupElement.transform.baseVal;
      if (transformList.numberOfItems > 0) {
        const consolidatedTransform = transformList.consolidate();
        if (consolidatedTransform) {
          groupTransformMatrix = consolidatedTransform.matrix;
        }
      }
    }
    const codeBBox = codeElement.getBBox();
    let pt = svg.createSVGPoint();
    pt.x = codeBBox.x - 8;
    pt.y = codeBBox.y - 8;
    let screenPt = pt.matrixTransform(groupTransformMatrix.multiply(svg.getScreenCTM()));
    left = screenPt.x + svgRect.left;
    top = screenPt.y + svgRect.top;
  }
  editorContainer.style.left = `${left}px`;
  editorContainer.style.top = `${top}px`;
  document.body.appendChild(editorContainer);
  const adjustSize = () => {
    const maxWidth = svgRect.width - (left - svgRect.left);
    const maxHeight = svgRect.height - (top - svgRect.top);
    let newWidth = Math.max(300, Math.min(input.scrollWidth + 20, maxWidth));
    let newHeight = Math.max(40, Math.min(input.scrollHeight + 20, maxHeight));
    editorContainer.style.width = newWidth + "px";
    editorContainer.style.height = newHeight + "px";
    if (input.scrollHeight > input.clientHeight) {
      input.style.overflowY = "auto";
    } else {
      input.style.overflowY = "hidden";
    }
  };
  adjustSize();
  setTimeout(() => {
    input.focus();
    const range = document.createRange();
    range.selectNodeContents(input);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    applySyntaxHighlightingImproved(input);
  }, 50);
  let highlightingTimeout = null;
  let isHighlighting = false;
  let lastContent = input.textContent;
  input.addEventListener("input", function(e) {
    if (isHighlighting) return;
    if (highlightingTimeout) {
      clearTimeout(highlightingTimeout);
      highlightingTimeout = null;
    }
    const currentContent = input.textContent || input.innerText || "";
    if (currentContent === lastContent) return;
    highlightingTimeout = setTimeout(() => {
      const contentAtTimeout = input.textContent || input.innerText || "";
      if (contentAtTimeout !== lastContent && !isHighlighting) {
        applySyntaxHighlightingImproved(input);
        lastContent = contentAtTimeout;
        adjustSize();
      }
      highlightingTimeout = null;
    }, 300);
  });
  input.addEventListener("keydown", function(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "	");
    } else if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      renderCodeFromEditor(input, codeElement, true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      renderCodeFromEditor(input, codeElement, true);
    }
  });
  input.originalCodeElement = codeElement;
  input.codeGroup = groupElement;
  input.isHighlighting = () => isHighlighting;
  input.setHighlighting = (state) => {
    isHighlighting = state;
  };
  input.clearHighlightTimeout = () => {
    if (highlightingTimeout) {
      clearTimeout(highlightingTimeout);
      highlightingTimeout = null;
    }
  };
  const handleClickOutside = (event) => {
    if (!editorContainer.contains(event.target)) {
      input.clearHighlightTimeout();
      renderCodeFromEditor(input, codeElement, true);
      document.removeEventListener("pointerdown", handleClickOutside, true);
    }
  };
  document.addEventListener("pointerdown", handleClickOutside, true);
  input.handleClickOutside = handleClickOutside;
  groupElement.style.display = "none";
}
function applySyntaxHighlightingImproved(editor) {
  if (!window.hljs) {
    return;
  }
  if (editor.isHighlighting && editor.isHighlighting()) {
    return;
  }
  if (editor.setHighlighting) {
    editor.setHighlighting(true);
  }
  try {
    const selection = window.getSelection();
    let cursorOffset = 0;
    let cursorNode = null;
    let cursorNodeOffset = 0;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      cursorNode = range.startContainer;
      cursorNodeOffset = range.startOffset;
      cursorOffset = getCursorOffset(editor, cursorNode, cursorNodeOffset);
    }
    const code = editor.textContent || editor.innerText || "";
    if (!code.trim()) {
      return;
    }
    const result = window.hljs.highlightAuto(code);
    const newHTML = result.value;
    if (editor.innerHTML !== newHTML) {
      editor.innerHTML = newHTML;
      restoreCursorPositionImproved(editor, cursorOffset);
    }
    if (result.language) {
      editor.setAttribute("data-language", result.language);
    }
  } catch (error) {
  } finally {
    if (editor.setHighlighting) {
      editor.setHighlighting(false);
    }
  }
}
function restoreCursorPositionImproved(editor, targetOffset) {
  if (targetOffset < 0) return;
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    let currentOffset = 0;
    let targetNode = null;
    let targetNodeOffset = 0;
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      if (currentOffset + nodeLength >= targetOffset) {
        targetNode = node;
        targetNodeOffset = Math.max(0, Math.min(targetOffset - currentOffset, nodeLength));
        break;
      }
      currentOffset += nodeLength;
    }
    if (targetNode) {
      range.setStart(targetNode, targetNodeOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } catch (error) {
    try {
      editor.focus();
    } catch (focusError) {
    }
  }
}
function getCursorOffset(container, node, offset) {
  let cursorOffset = 0;
  if (!node || !container.contains(node)) {
    return 0;
  }
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let currentNode;
  while (currentNode = walker.nextNode()) {
    if (currentNode === node) {
      return cursorOffset + Math.max(0, Math.min(offset, currentNode.textContent.length));
    }
    cursorOffset += currentNode.textContent.length;
  }
  return cursorOffset;
}
function extractTextFromCodeElement(codeElement) {
  if (!codeElement) return "";
  let codeContent = "";
  const childNodes = codeElement.childNodes;
  if (childNodes.length === 0) {
    return codeElement.textContent || "";
  }
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    if (node.nodeType === Node.TEXT_NODE) {
      codeContent += node.textContent;
    } else if (node.tagName === "tspan") {
      const tspanText = node.textContent || "";
      codeContent += tspanText;
      if (i < childNodes.length - 1) {
        const nextNode = childNodes[i + 1];
        if (nextNode && nextNode.tagName === "tspan") {
          codeContent += "\n";
        }
      }
    }
  }
  return codeContent.replace(/\u00A0/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function renderCodeFromEditor(input, codeElement, deleteIfEmpty = false) {
  const editorContainer = input.closest(".svg-code-container");
  if (!editorContainer || !document.body.contains(editorContainer)) {
    return;
  }
  const code = input.textContent || input.innerText || "";
  const gElement = input.codeGroup;
  if (input.handleClickOutside) {
    document.removeEventListener("pointerdown", input.handleClickOutside, true);
  }
  if (input.clearHighlightTimeout) {
    input.clearHighlightTimeout();
  }
  document.body.removeChild(editorContainer);
  if (!gElement || !codeElement) {
    return;
  }
  if (!gElement.parentNode) {
    if (selectedCodeBlock2 === gElement) {
      deselectCodeBlock2();
    }
    return;
  }
  if (deleteIfEmpty && code.trim() === "") {
    let codeShape = null;
    if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
      codeShape = shapes.find((shape) => shape.shapeName === "code" && shape.group === gElement);
      if (codeShape) {
        const idx = shapes.indexOf(codeShape);
        if (idx !== -1) shapes.splice(idx, 1);
      }
    }
    pushDeleteActionWithAttachments({
      type: "code",
      element: codeShape || gElement,
      shapeName: "code"
    });
    if (typeof cleanupAttachments2 === "function") {
      cleanupAttachments2(gElement);
    }
    svg.removeChild(gElement);
    if (selectedCodeBlock2 === gElement) {
      selectedCodeBlock2 = null;
      removeCodeSelectionFeedback();
    }
  } else {
    while (codeElement.firstChild) {
      codeElement.removeChild(codeElement.firstChild);
    }
    codeElement.textContent = "";
    const storedLang = codeElement.getAttribute("data-language") || "auto";
    const highlightedCode = applySyntaxHighlightingToSVG(code, storedLang);
    createHighlightedSVGText(highlightedCode, codeElement);
    updateCodeBackground(gElement, codeElement);
    gElement.style.display = "block";
    if (typeof updateAttachedArrows === "function") {
      updateAttachedArrows(gElement);
    }
    if (selectedCodeBlock2 === gElement) {
      setTimeout(updateCodeSelectionFeedback2, 0);
    }
  }
  if (gElement.parentNode) {
    if (window.__sketchStoreApi) {
      window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
    } else {
      window.isSelectionToolActive = true;
    }
    selectCodeBlock2(gElement);
  }
}
function createHighlightedSVGText(highlightResult, parentElement) {
  if (!highlightResult || !highlightResult.value) {
    return;
  }
  const lines = highlightResult.value.split("\n");
  const x = parentElement.getAttribute("x") || 0;
  lines.forEach((line, index) => {
    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.setAttribute("x", x);
    tspan.setAttribute("dy", index === 0 ? "0" : "1.2em");
    if (line.trim()) {
      createHighlightedTspans(line, tspan, x);
      if (tspan.childNodes.length === 0) {
        tspan.textContent = line;
      }
    } else {
      tspan.textContent = " ";
    }
    parentElement.appendChild(tspan);
  });
}
function applySyntaxHighlightingToSVG(code, language) {
  if (!window.hljs) {
    return { value: code, language: null };
  }
  const lang = language || codeLanguage;
  if (lang && lang !== "auto") {
    try {
      return window.hljs.highlight(code, { language: lang });
    } catch (e) {
    }
  }
  return window.hljs.highlightAuto(code);
}
function renderCode(input, codeElement, deleteIfEmpty = false) {
  if (!input || !document.body.contains(input)) {
    return;
  }
  const code = input.value || "";
  const gElement = input.codeGroup;
  if (input.handleClickOutside) {
    document.removeEventListener("pointerdown", input.handleClickOutside, true);
  }
  document.body.removeChild(input);
  if (!gElement || !codeElement) {
    return;
  }
  if (!gElement.parentNode) {
    if (selectedCodeBlock2 === gElement) {
      deselectCodeBlock2();
    }
    return;
  }
  if (deleteIfEmpty && code.trim() === "") {
    let codeShape = null;
    if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
      codeShape = shapes.find((shape) => shape.shapeName === "code" && shape.group === gElement);
      if (codeShape) {
        const idx = shapes.indexOf(codeShape);
        if (idx !== -1) shapes.splice(idx, 1);
      }
    }
    pushDeleteActionWithAttachments({
      type: "code",
      element: codeShape || gElement,
      shapeName: "code"
    });
    if (typeof cleanupAttachments2 === "function") {
      cleanupAttachments2(gElement);
    }
    svg.removeChild(gElement);
    if (selectedCodeBlock2 === gElement) {
      selectedCodeBlock2 = null;
      removeCodeSelectionFeedback();
    }
  } else {
    while (codeElement.firstChild) {
      codeElement.removeChild(codeElement.firstChild);
    }
    const lines = code.split("\n");
    const x = codeElement.getAttribute("x") || 0;
    lines.forEach((line, index) => {
      if (window.hljs && line.trim()) {
        const result = window.hljs.highlightAuto(line);
        createHighlightedTspans(result.value, codeElement, x, index === 0 ? "0" : "1.2em");
      } else {
        let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", x);
        tspan.setAttribute("dy", index === 0 ? "0" : "1.2em");
        tspan.textContent = line.replace(/\u00A0/g, " ") || " ";
        codeElement.appendChild(tspan);
      }
    });
    updateCodeBackground(gElement, codeElement);
    gElement.style.display = "block";
    updateAttachedArrows(gElement);
    if (selectedCodeBlock2 === gElement) {
      setTimeout(updateCodeSelectionFeedback2, 0);
    }
  }
  if (gElement.parentNode) {
    if (window.__sketchStoreApi) {
      window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
    } else {
      window.isSelectionToolActive = true;
    }
    selectCodeBlock2(gElement);
  }
}
function createHighlightedTspans(highlightedHtml, parentTspan, x) {
  if (!highlightedHtml || !parentTspan) return;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = highlightedHtml;
  processHighlightedNodes(tempDiv, parentTspan);
}
function processHighlightedNodes(node, parentTspan) {
  if (!node || !parentTspan) return;
  for (let child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) {
        if (parentTspan.textContent) {
          parentTspan.textContent += child.textContent;
        } else {
          parentTspan.textContent = child.textContent;
        }
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      let styledTspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      styledTspan.textContent = child.textContent || "";
      const className = child.className || "";
      applyHighlightColor(styledTspan, className);
      parentTspan.appendChild(styledTspan);
    }
  }
}
function applyHighlightColor(tspan, className) {
  if (className.includes("hljs-keyword") || className.includes("hljs-built_in")) {
    tspan.setAttribute("fill", "#ff7b72");
  } else if (className.includes("hljs-string") || className.includes("hljs-template-string")) {
    tspan.setAttribute("fill", "#a5d6ff");
  } else if (className.includes("hljs-comment")) {
    tspan.setAttribute("fill", "#8b949e");
    tspan.setAttribute("font-style", "italic");
  } else if (className.includes("hljs-number") || className.includes("hljs-literal")) {
    tspan.setAttribute("fill", "#79c0ff");
  } else if (className.includes("hljs-function") || className.includes("hljs-title")) {
    tspan.setAttribute("fill", "#d2a8ff");
  } else if (className.includes("hljs-variable") || className.includes("hljs-name")) {
    tspan.setAttribute("fill", "#ffa657");
  } else if (className.includes("hljs-type") || className.includes("hljs-class")) {
    tspan.setAttribute("fill", "#f0883e");
  } else if (className.includes("hljs-operator") || className.includes("hljs-punctuation")) {
    tspan.setAttribute("fill", "#c9d1d9");
  } else if (className.includes("hljs-property") || className.includes("hljs-attribute")) {
    tspan.setAttribute("fill", "#79c0ff");
  } else if (className.includes("hljs-tag")) {
    tspan.setAttribute("fill", "#7ee787");
  } else if (className.includes("hljs-meta") || className.includes("hljs-doctag")) {
    tspan.setAttribute("fill", "#8b949e");
  } else if (className.includes("hljs-regexp")) {
    tspan.setAttribute("fill", "#a5d6ff");
  } else {
    tspan.setAttribute("fill", "#c9d1d9");
  }
}
function createCodeSelectionFeedback(groupElement) {
  if (!groupElement) return;
  removeCodeSelectionFeedback();
  const backgroundRect = groupElement.querySelector(".code-background");
  if (!backgroundRect) {
    return;
  }
  const x = parseFloat(backgroundRect.getAttribute("x"));
  const y = parseFloat(backgroundRect.getAttribute("y"));
  const width = parseFloat(backgroundRect.getAttribute("width"));
  const height = parseFloat(backgroundRect.getAttribute("height"));
  const zoom = window.currentZoom || 1;
  const padding = 8 / zoom;
  const handleSize = 10 / zoom;
  const handleOffset = handleSize / 2;
  const selX = x - padding;
  const selY = y - padding;
  const selWidth = width + 2 * padding;
  const selHeight = height + 2 * padding;
  const outlinePoints = [
    [selX, selY],
    [selX + selWidth, selY],
    [selX + selWidth, selY + selHeight],
    [selX, selY + selHeight],
    [selX, selY]
  ];
  const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
  codeSelectionBox = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  codeSelectionBox.setAttribute("class", "selection-box");
  codeSelectionBox.setAttribute("points", pointsAttr);
  codeSelectionBox.setAttribute("fill", "none");
  codeSelectionBox.setAttribute("stroke", "#5B57D1");
  codeSelectionBox.setAttribute("stroke-width", "1.5");
  codeSelectionBox.setAttribute("stroke-dasharray", "4 2");
  codeSelectionBox.setAttribute("vector-effect", "non-scaling-stroke");
  codeSelectionBox.setAttribute("pointer-events", "none");
  groupElement.appendChild(codeSelectionBox);
  const handlesData = [
    { name: "nw", x: selX, y: selY, cursor: "nwse-resize" },
    { name: "ne", x: selX + selWidth, y: selY, cursor: "nesw-resize" },
    { name: "sw", x: selX, y: selY + selHeight, cursor: "nesw-resize" },
    { name: "se", x: selX + selWidth, y: selY + selHeight, cursor: "nwse-resize" }
  ];
  codeResizeHandles = {};
  handlesData.forEach((handle) => {
    const handleRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    handleRect.setAttribute("class", `resize-handle resize-handle-${handle.name}`);
    handleRect.setAttribute("x", handle.x - handleOffset);
    handleRect.setAttribute("y", handle.y - handleOffset);
    handleRect.setAttribute("width", handleSize);
    handleRect.setAttribute("height", handleSize);
    handleRect.setAttribute("fill", "#121212");
    handleRect.setAttribute("stroke", "#5B57D1");
    handleRect.setAttribute("stroke-width", 2);
    handleRect.setAttribute("vector-effect", "non-scaling-stroke");
    handleRect.style.cursor = handle.cursor;
    handleRect.setAttribute("data-anchor", handle.name);
    groupElement.appendChild(handleRect);
    codeResizeHandles[handle.name] = handleRect;
    handleRect.addEventListener("pointerdown", (e) => {
      if (window.isSelectionToolActive) {
        e.stopPropagation();
        startCodeResize(e, handle.name);
      }
    });
  });
  const rotationAnchorPos = { x: selX + selWidth / 2, y: selY - 30 };
  const rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
  rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
  rotationAnchor.setAttribute("r", 8);
  rotationAnchor.setAttribute("class", "rotate-anchor");
  rotationAnchor.setAttribute("fill", "#121212");
  rotationAnchor.setAttribute("stroke", "#5B57D1");
  rotationAnchor.setAttribute("stroke-width", 2);
  rotationAnchor.setAttribute("vector-effect", "non-scaling-stroke");
  rotationAnchor.style.cursor = "grab";
  rotationAnchor.setAttribute("pointer-events", "all");
  groupElement.appendChild(rotationAnchor);
  codeResizeHandles.rotate = rotationAnchor;
  rotationAnchor.addEventListener("pointerdown", (e) => {
    if (window.isSelectionToolActive) {
      e.stopPropagation();
      startCodeRotation(e);
    }
  });
}
function updateCodeBackground(groupElement, codeElement) {
  const backgroundRect = groupElement.querySelector(".code-background");
  if (!backgroundRect || !codeElement) return;
  const textBBox = codeElement.getBBox();
  const padding = 10;
  backgroundRect.setAttribute("x", textBBox.x - padding);
  backgroundRect.setAttribute("y", textBBox.y - padding);
  backgroundRect.setAttribute("width", textBBox.width + padding * 2);
  backgroundRect.setAttribute("height", textBBox.height + padding * 2);
}
function updateCodeSelectionFeedback2() {
  if (!selectedCodeBlock2 || !codeSelectionBox) return;
  const codeElement = selectedCodeBlock2.querySelector("text");
  if (!codeElement) return;
  const wasHidden = selectedCodeBlock2.style.display === "none";
  if (wasHidden) selectedCodeBlock2.style.display = "block";
  const bbox = codeElement.getBBox();
  if (wasHidden) selectedCodeBlock2.style.display = "none";
  if (bbox.width === 0 && bbox.height === 0 && codeElement.textContent.trim() !== "") {
  }
  const zoom = window.currentZoom || 1;
  const padding = 8 / zoom;
  const handleSize = 10 / zoom;
  const handleOffset = handleSize / 2;
  const selX = bbox.x - padding;
  const selY = bbox.y - padding;
  const selWidth = Math.max(bbox.width + 2 * padding, handleSize);
  const selHeight = Math.max(bbox.height + 2 * padding, handleSize);
  const outlinePoints = [
    [selX, selY],
    [selX + selWidth, selY],
    [selX + selWidth, selY + selHeight],
    [selX, selY + selHeight],
    [selX, selY]
  ];
  const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
  codeSelectionBox.setAttribute("points", pointsAttr);
  const handlesData = [
    { name: "nw", x: selX, y: selY },
    { name: "ne", x: selX + selWidth, y: selY },
    { name: "sw", x: selX, y: selY + selHeight },
    { name: "se", x: selX + selWidth, y: selY + selHeight }
  ];
  handlesData.forEach((handle) => {
    const handleRect = codeResizeHandles[handle.name];
    if (handleRect) {
      handleRect.setAttribute("x", handle.x - handleOffset);
      handleRect.setAttribute("y", handle.y - handleOffset);
    }
  });
  const rotationAnchor = codeResizeHandles.rotate;
  if (rotationAnchor) {
    const rotationAnchorPos = { x: selX + selWidth / 2, y: selY - 30 };
    rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
    rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
  }
}
function startCodeRotation(event) {
  if (!selectedCodeBlock2 || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  isCodeRotating = true;
  isCodeDragging2 = false;
  isCodeResizing = false;
  const codeElement = selectedCodeBlock2.querySelector("text");
  if (!codeElement) return;
  const bbox = codeElement.getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  const mousePos = getSVGCoordinates(event);
  let centerPoint = svg.createSVGPoint();
  centerPoint.x = centerX;
  centerPoint.y = centerY;
  const groupTransform = selectedCodeBlock2.transform.baseVal.consolidate();
  if (groupTransform) {
    centerPoint = centerPoint.matrixTransform(groupTransform.matrix);
  }
  codeRotationStartAngle = Math.atan2(mousePos.y - centerPoint.y, mousePos.x - centerPoint.x) * 180 / Math.PI;
  const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
  codeRotationStartTransform = currentTransform ? currentTransform.matrix : svg.createSVGMatrix();
  svg.style.cursor = "grabbing";
  window.addEventListener("pointermove", handleCodeMouseMove);
  window.addEventListener("pointerup", handleCodeMouseUp);
}
function removeCodeSelectionFeedback() {
  if (selectedCodeBlock2) {
    selectedCodeBlock2.querySelectorAll(".selection-box, .resize-handle, .rotate-anchor").forEach((el) => el.remove());
  }
  codeSelectionBox = null;
  codeResizeHandles = {};
}
function selectCodeBlock2(groupElement) {
  if (!groupElement || !groupElement.parentNode) return;
  if (groupElement === selectedCodeBlock2) return;
  deselectCodeBlock2();
  selectedCodeBlock2 = groupElement;
  selectedCodeBlock2.classList.add("selected");
  createCodeSelectionFeedback(selectedCodeBlock2);
  updateSelectedElement(selectedCodeBlock2);
  const toggleSpans = document.querySelectorAll(".textCodeSpan");
  toggleSpans.forEach((el) => el.classList.remove("selected"));
  toggleSpans.forEach((el) => {
    if (el.getAttribute("data-id") === "true") el.classList.add("selected");
  });
  if (window.__showSidebarForShape) window.__showSidebarForShape("code");
}
function deselectCodeBlock2() {
  const activeEditor = document.querySelector(".svg-code-editor[contenteditable='true']");
  if (activeEditor) {
    let groupElement = activeEditor.originalGroup;
    if (groupElement) {
      renderCode(activeEditor, true);
    } else if (document.body.contains(activeEditor)) {
      activeEditor.remove();
    }
  }
  if (selectedCodeBlock2) {
    removeCodeSelectionFeedback();
    selectedCodeBlock2.classList.remove("selected");
    selectedCodeBlock2 = null;
    updateSelectedElement(null);
  }
  if (isCodeRotating) {
    isCodeRotating = false;
    codeRotationStartAngle = 0;
    codeRotationStartTransform = null;
    svg.style.cursor = "default";
    window.removeEventListener("pointermove", handleCodeMouseMove);
    window.removeEventListener("pointerup", handleCodeMouseUp);
  }
}
function startCodeDrag(event) {
  if (!selectedCodeBlock2 || event.button !== 0) return;
  if (event.target.closest(".resize-handle")) {
    return;
  }
  isCodeDragging2 = true;
  isCodeResizing = false;
  event.preventDefault();
  const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
  const initialTranslateX = currentTransform ? currentTransform.matrix.e : 0;
  const initialTranslateY = currentTransform ? currentTransform.matrix.f : 0;
  startCodePoint = getSVGCoordinates(event);
  codeDragOffsetX = startCodePoint.x - initialTranslateX;
  codeDragOffsetY = startCodePoint.y - initialTranslateY;
  let codeShape = null;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    codeShape = shapes.find((shape) => shape.shapeName === "code" && shape.group === selectedCodeBlock2);
  }
  if (codeShape) {
    draggedCodeInitialFrame = codeShape.parentFrame || null;
    if (codeShape.parentFrame) {
      codeShape.parentFrame.temporarilyRemoveFromFrame(codeShape);
    }
  }
  svg.style.cursor = "grabbing";
  window.addEventListener("pointermove", handleCodeMouseMove);
  window.addEventListener("pointerup", handleCodeMouseUp);
}
function startCodeResize(event, anchor) {
  if (!selectedCodeBlock2 || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  isCodeResizing = true;
  isCodeDragging2 = false;
  currentCodeResizeHandle = anchor;
  const codeElement = selectedCodeBlock2.querySelector("text");
  if (!codeElement) {
    isCodeResizing = false;
    return;
  }
  startCodeBBox = codeElement.getBBox();
  startCodeFontSize = parseFloat(codeElement.getAttribute("font-size") || 25);
  if (isNaN(startCodeFontSize)) startCodeFontSize = 25;
  startCodePoint = getSVGCoordinates(event, selectedCodeBlock2);
  const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
  initialCodeGroupTx = currentTransform ? currentTransform.matrix.e : 0;
  initialCodeGroupTy = currentTransform ? currentTransform.matrix.f : 0;
  const padding = 3;
  const startX7 = startCodeBBox.x - padding;
  const startY7 = startCodeBBox.y - padding;
  const startWidth = startCodeBBox.width + 2 * padding;
  const startHeight = startCodeBBox.height + 2 * padding;
  let hx = startX7;
  let hy = startY7;
  if (anchor.includes("e")) {
    hx = startX7 + startWidth;
  }
  if (anchor.includes("s")) {
    hy = startY7 + startHeight;
  }
  initialCodeHandlePosRelGroup = { x: hx, y: hy };
  svg.style.cursor = codeResizeHandles[anchor]?.style.cursor || "default";
  window.addEventListener("pointermove", handleCodeMouseMove);
  window.addEventListener("pointerup", handleCodeMouseUp);
}
function extractRotationFromTransform3(element) {
  const currentTransform = element.transform.baseVal.consolidate();
  if (currentTransform) {
    const matrix = currentTransform.matrix;
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  }
  return 0;
}
function setCodeLanguage(lang) {
  codeLanguage = lang;
  if (selectedCodeBlock2) {
    const codeElement = selectedCodeBlock2.querySelector("text");
    if (codeElement) {
      codeElement.setAttribute("data-language", lang);
    }
  }
}
function getCodeLanguage() {
  return codeLanguage;
}
function getSelectedCodeBlock() {
  return selectedCodeBlock2;
}
var codeTextSize, codeTextFont, codeTextColor, codeTextAlign, codeLanguage, codeTextColorOptions, codeTextFontOptions, codeTextSizeOptions, codeTextAlignOptions, selectedCodeBlock2, codeSelectionBox, codeResizeHandles, codeDragOffsetX, codeDragOffsetY, isCodeDragging2, isCodeResizing, currentCodeResizeHandle, startCodeBBox, startCodeFontSize, startCodePoint, isCodeRotating, codeRotationStartAngle, codeRotationStartTransform, initialCodeHandlePosRelGroup, initialCodeGroupTx, initialCodeGroupTy, draggedCodeInitialFrame, hoveredCodeFrame2, handleCodeMouseMove, handleCodeMouseUp, handleCodeMouseDown, editorStyles;
var init_codeTool = __esm({
  "src/tools/codeTool.js"() {
    init_UndoRedo();
    init_arrowTool();
    codeTextSize = "25px";
    codeTextFont = "lixCode";
    codeTextColor = "#fff";
    codeTextAlign = "left";
    codeLanguage = "auto";
    codeTextColorOptions = document.querySelectorAll(".textColorSpan");
    codeTextFontOptions = document.querySelectorAll(".textFontSpan");
    codeTextSizeOptions = document.querySelectorAll(".textSizeSpan");
    codeTextAlignOptions = document.querySelectorAll(".textAlignSpan");
    selectedCodeBlock2 = null;
    codeSelectionBox = null;
    codeResizeHandles = {};
    isCodeDragging2 = false;
    isCodeResizing = false;
    currentCodeResizeHandle = null;
    startCodeBBox = null;
    startCodeFontSize = null;
    startCodePoint = null;
    isCodeRotating = false;
    codeRotationStartAngle = 0;
    codeRotationStartTransform = null;
    initialCodeHandlePosRelGroup = null;
    initialCodeGroupTx = 0;
    initialCodeGroupTy = 0;
    draggedCodeInitialFrame = null;
    hoveredCodeFrame2 = null;
    setTextReferences(selectedCodeBlock2, updateCodeSelectionFeedback2, svg);
    handleCodeMouseMove = (event) => {
      if (!selectedCodeBlock2) return;
      event.preventDefault();
      const svgRect = svg.getBoundingClientRect();
      lastMousePos = {
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top
      };
      if (isCodeDragging2) {
        const currentPoint = getSVGCoordinates(event);
        const newTranslateX = currentPoint.x - codeDragOffsetX;
        const newTranslateY = currentPoint.y - codeDragOffsetY;
        const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
        if (currentTransform) {
          const matrix = currentTransform.matrix;
          const angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
          const codeElement = selectedCodeBlock2.querySelector("text");
          if (codeElement) {
            const bbox = codeElement.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            selectedCodeBlock2.setAttribute(
              "transform",
              `translate(${newTranslateX}, ${newTranslateY}) rotate(${angle}, ${centerX}, ${centerY})`
            );
          } else {
            selectedCodeBlock2.setAttribute("transform", `translate(${newTranslateX}, ${newTranslateY})`);
          }
        } else {
          selectedCodeBlock2.setAttribute("transform", `translate(${newTranslateX}, ${newTranslateY})`);
        }
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          const codeShape = shapes.find((shape) => shape.shapeName === "code" && shape.group === selectedCodeBlock2);
          if (codeShape) {
            codeShape.updateFrameContainment();
          }
        }
        updateAttachedArrows(selectedCodeBlock2);
      } else if (isCodeResizing) {
        const codeElement = selectedCodeBlock2.querySelector("text");
        if (!codeElement || !startCodeBBox || startCodeFontSize === null || !startCodePoint || !initialCodeHandlePosRelGroup) return;
        const currentPoint = getSVGCoordinates(event, selectedCodeBlock2);
        const startX7 = startCodeBBox.x;
        const startY7 = startCodeBBox.y;
        const startWidth = startCodeBBox.width;
        const startHeight = startCodeBBox.height;
        let anchorX, anchorY;
        switch (currentCodeResizeHandle) {
          case "nw":
            anchorX = startX7 + startWidth;
            anchorY = startY7 + startHeight;
            break;
          case "ne":
            anchorX = startX7;
            anchorY = startY7 + startHeight;
            break;
          case "sw":
            anchorX = startX7 + startWidth;
            anchorY = startY7;
            break;
          case "se":
            anchorX = startX7;
            anchorY = startY7;
            break;
        }
        const newWidth = Math.abs(currentPoint.x - anchorX);
        const newHeight = Math.abs(currentPoint.y - anchorY);
        const chosenScale = newHeight / startHeight;
        const minScale2 = 0.1;
        const maxScale2 = 10;
        const clampedScale = Math.max(minScale2, Math.min(chosenScale, maxScale2));
        const newFontSize = startCodeFontSize * clampedScale;
        const minFontSize = 5;
        const finalFontSize = Math.max(newFontSize, minFontSize);
        codeElement.setAttribute("font-size", `${finalFontSize}px`);
        const currentBBox = codeElement.getBBox();
        let newAnchorX, newAnchorY;
        switch (currentCodeResizeHandle) {
          case "nw":
            newAnchorX = currentBBox.x + currentBBox.width;
            newAnchorY = currentBBox.y + currentBBox.height;
            break;
          case "ne":
            newAnchorX = currentBBox.x;
            newAnchorY = currentBBox.y + currentBBox.height;
            break;
          case "sw":
            newAnchorX = currentBBox.x + currentBBox.width;
            newAnchorY = currentBBox.y;
            break;
          case "se":
            newAnchorX = currentBBox.x;
            newAnchorY = currentBBox.y;
            break;
        }
        const deltaX = anchorX - newAnchorX;
        const deltaY = anchorY - newAnchorY;
        const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
        if (currentTransform) {
          const matrix = currentTransform.matrix;
          const angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
          const newGroupTx = initialCodeGroupTx + deltaX;
          const newGroupTy = initialCodeGroupTy + deltaY;
          const centerX = currentBBox.x + currentBBox.width / 2;
          const centerY = currentBBox.y + currentBBox.height / 2;
          selectedCodeBlock2.setAttribute(
            "transform",
            `translate(${newGroupTx}, ${newGroupTy}) rotate(${angle}, ${centerX}, ${centerY})`
          );
        } else {
          const newGroupTx = initialCodeGroupTx + deltaX;
          const newGroupTy = initialCodeGroupTy + deltaY;
          selectedCodeBlock2.setAttribute("transform", `translate(${newGroupTx}, ${newGroupTy})`);
        }
        updateCodeBackground(selectedCodeBlock2, codeElement);
        updateAttachedArrows(selectedCodeBlock2);
        clearTimeout(selectedCodeBlock2.updateFeedbackTimeout);
        selectedCodeBlock2.updateFeedbackTimeout = setTimeout(() => {
          updateCodeSelectionFeedback2();
          delete selectedCodeBlock2.updateFeedbackTimeout;
        }, 0);
      } else if (isCodeRotating) {
        const codeElement = selectedCodeBlock2.querySelector("text");
        if (!codeElement) return;
        const bbox = codeElement.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        const mousePos = getSVGCoordinates(event);
        let centerPoint = svg.createSVGPoint();
        centerPoint.x = centerX;
        centerPoint.y = centerY;
        const groupTransform = selectedCodeBlock2.transform.baseVal.consolidate();
        if (groupTransform) {
          centerPoint = centerPoint.matrixTransform(groupTransform.matrix);
        }
        const currentAngle = Math.atan2(mousePos.y - centerPoint.y, mousePos.x - centerPoint.x) * 180 / Math.PI;
        const rotationDiff = currentAngle - codeRotationStartAngle;
        const newTransform = `translate(${codeRotationStartTransform.e}, ${codeRotationStartTransform.f}) rotate(${rotationDiff}, ${centerX}, ${centerY})`;
        selectedCodeBlock2.setAttribute("transform", newTransform);
        updateAttachedArrows(selectedCodeBlock2);
        updateCodeSelectionFeedback2();
      }
      if ((isCodeToolActive || isTextToolActive && isTextInCodeMode) && !isCodeDragging2 && !isCodeResizing && !isCodeRotating) {
        svg.style.cursor = "text";
        const { x, y } = getSVGCoordinates(event);
        const tempCodeBounds = {
          x: x - 275,
          y: y - 30,
          width: 550,
          height: 60
        };
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((frame) => {
            if (frame.shapeName === "frame") {
              if (frame.isShapeInFrame(tempCodeBounds)) {
                frame.highlightFrame();
                hoveredCodeFrame2 = frame;
              } else if (hoveredCodeFrame2 === frame) {
                frame.removeHighlight();
                hoveredCodeFrame2 = null;
              }
            }
          });
        }
      } else if (isSelectionToolActive && !isCodeDragging2 && !isCodeResizing && !isCodeRotating) {
        const targetGroup = event.target.closest('g[data-type="code-group"]');
        if (targetGroup) {
          svg.style.cursor = "move";
        } else {
          svg.style.cursor = "default";
        }
      }
    };
    handleCodeMouseUp = (event) => {
      if (event.button !== 0) return;
      if (isCodeDragging2 && selectedCodeBlock2) {
        const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
        if (currentTransform) {
          const finalTranslateX = currentTransform.matrix.e;
          const finalTranslateY = currentTransform.matrix.f;
          const initialX = parseFloat(selectedCodeBlock2.getAttribute("data-x")) || 0;
          const initialY = parseFloat(selectedCodeBlock2.getAttribute("data-y")) || 0;
          let codeShape = null;
          if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
            codeShape = shapes.find((shape) => shape.shapeName === "code" && shape.group === selectedCodeBlock2);
          }
          const oldPosWithFrame = {
            x: initialX,
            y: initialY,
            rotation: extractRotationFromTransform3(selectedCodeBlock2) || 0,
            parentFrame: draggedCodeInitialFrame
          };
          const newPosWithFrame = {
            x: finalTranslateX,
            y: finalTranslateY,
            rotation: extractRotationFromTransform3(selectedCodeBlock2) || 0,
            parentFrame: codeShape ? codeShape.parentFrame : null
          };
          const stateChanged = initialX !== finalTranslateX || initialY !== finalTranslateY;
          const frameChanged = oldPosWithFrame.parentFrame !== newPosWithFrame.parentFrame;
          if (stateChanged || frameChanged) {
            pushTransformAction2(
              {
                type: "code",
                element: selectedCodeBlock2,
                shapeName: "code"
              },
              oldPosWithFrame,
              newPosWithFrame
            );
          }
          if (codeShape) {
            const finalFrame = hoveredCodeFrame2;
            if (draggedCodeInitialFrame !== finalFrame) {
              if (draggedCodeInitialFrame) {
                draggedCodeInitialFrame.removeShapeFromFrame(codeShape);
              }
              if (finalFrame) {
                finalFrame.addShapeToFrame(codeShape);
              }
              if (frameChanged) {
                pushFrameAttachmentAction(
                  finalFrame || draggedCodeInitialFrame,
                  codeShape,
                  finalFrame ? "attach" : "detach",
                  draggedCodeInitialFrame
                );
              }
            } else if (draggedCodeInitialFrame) {
              draggedCodeInitialFrame.restoreToFrame(codeShape);
            }
          }
          selectedCodeBlock2.setAttribute("data-x", finalTranslateX);
          selectedCodeBlock2.setAttribute("data-y", finalTranslateY);
        }
        draggedCodeInitialFrame = null;
      } else if (isCodeResizing && selectedCodeBlock2) {
        const codeElement = selectedCodeBlock2.querySelector("text");
        if (codeElement) {
          const finalFontSize = codeElement.getAttribute("font-size");
          const initialFontSize = startCodeFontSize;
          const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
          if (currentTransform && initialFontSize !== parseFloat(finalFontSize)) {
            const finalTranslateX = currentTransform.matrix.e;
            const finalTranslateY = currentTransform.matrix.f;
            pushTransformAction2(
              {
                type: "code",
                element: selectedCodeBlock2,
                shapeName: "code"
              },
              {
                x: initialCodeGroupTx,
                y: initialCodeGroupTy,
                fontSize: initialFontSize,
                rotation: extractRotationFromTransform3(selectedCodeBlock2) || 0
              },
              {
                x: finalTranslateX,
                y: finalTranslateY,
                fontSize: parseFloat(finalFontSize),
                rotation: extractRotationFromTransform3(selectedCodeBlock2) || 0
              }
            );
            selectedCodeBlock2.setAttribute("data-x", finalTranslateX);
            selectedCodeBlock2.setAttribute("data-y", finalTranslateY);
          }
          clearTimeout(selectedCodeBlock2.updateFeedbackTimeout);
          updateCodeSelectionFeedback2();
        }
      } else if (isCodeRotating && selectedCodeBlock2) {
        const currentTransform = selectedCodeBlock2.transform.baseVal.consolidate();
        if (currentTransform && codeRotationStartTransform) {
          const initialRotation = Math.atan2(codeRotationStartTransform.b, codeRotationStartTransform.a) * 180 / Math.PI;
          const finalRotation = extractRotationFromTransform3(selectedCodeBlock2) || 0;
          if (Math.abs(initialRotation - finalRotation) > 1) {
            pushTransformAction2(
              {
                type: "code",
                element: selectedCodeBlock2,
                shapeName: "code"
              },
              {
                x: codeRotationStartTransform.e,
                y: codeRotationStartTransform.f,
                rotation: initialRotation
              },
              {
                x: currentTransform.matrix.e,
                y: currentTransform.matrix.f,
                rotation: finalRotation
              }
            );
          }
        }
        updateCodeSelectionFeedback2();
      }
      if (hoveredCodeFrame2) {
        hoveredCodeFrame2.removeHighlight();
        hoveredCodeFrame2 = null;
      }
      if (isSelectionToolActive) {
        const targetGroup = event.target.closest('g[data-type="code-group"]');
        const isResizeHandle = event.target.closest(".resize-handle");
        const isRotateAnchor = event.target.closest(".rotate-anchor");
        if (!targetGroup && !isResizeHandle && !isRotateAnchor && selectedCodeBlock2) {
          deselectCodeBlock2();
        }
      }
      isCodeDragging2 = false;
      isCodeResizing = false;
      isCodeRotating = false;
      currentCodeResizeHandle = null;
      startCodePoint = null;
      startCodeBBox = null;
      startCodeFontSize = null;
      codeDragOffsetX = void 0;
      codeDragOffsetY = void 0;
      initialCodeHandlePosRelGroup = null;
      initialCodeGroupTx = 0;
      initialCodeGroupTy = 0;
      codeRotationStartAngle = 0;
      codeRotationStartTransform = null;
      svg.style.cursor = "default";
      svg.removeEventListener("pointermove", handleCodeMouseMove);
      svg.removeEventListener("pointerup", handleCodeMouseUp);
    };
    handleCodeMouseDown = function(e) {
      if (!e.target) return;
      const activeContentEditor = document.querySelector(".svg-code-editor[contenteditable='true']");
      if (activeContentEditor) {
        const editorContainer = activeContentEditor.closest(".svg-code-container");
        if (editorContainer && editorContainer.contains(e.target)) {
          return;
        }
        let codeElement = activeContentEditor.originalCodeElement;
        if (codeElement) {
          renderCodeFromEditor(activeContentEditor, codeElement, true);
        } else if (editorContainer && document.body.contains(editorContainer)) {
          document.body.removeChild(editorContainer);
        }
      }
      const activeEditor = document.querySelector("textarea.svg-code-editor");
      if (activeEditor && activeEditor.contains(e.target)) {
        return;
      }
      if (activeEditor && !activeEditor.contains(e.target)) {
        let codeElement = activeEditor.originalCodeElement;
        if (codeElement) {
          renderCode(activeEditor, codeElement, true);
        } else if (document.body.contains(activeEditor)) {
          document.body.removeChild(activeEditor);
        }
      }
      const targetGroup = e.target.closest('g[data-type="code-group"]');
      if (isSelectionToolActive && e.button === 0) {
        if (targetGroup) {
          if (e.target.closest(".resize-handle") || e.target.closest(".rotate-anchor")) {
            return;
          }
          if (targetGroup === selectedCodeBlock2) {
            startCodeDrag(e);
          } else {
            selectCodeBlock2(targetGroup);
            startCodeDrag(e);
          }
        } else {
          deselectCodeBlock2();
        }
      } else if ((isCodeToolActive || isTextToolActive) && e.button === 0) {
        if (targetGroup) {
          const codeElement = targetGroup.querySelector("text");
          if (codeElement && (e.target.tagName === "text" || e.target.tagName === "tspan")) {
            makeCodeEditable(codeElement, targetGroup, e);
            e.stopPropagation();
          } else {
            deselectCodeBlock2();
            addCodeBlock(e);
          }
        } else {
          deselectCodeBlock2();
          addCodeBlock(e);
        }
      }
    };
    codeTextColorOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        codeTextColorOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newColor = span.getAttribute("data-id");
        const oldColor = codeTextColor;
        codeTextColor = newColor;
        if (selectedCodeBlock2) {
          const codeEditor = selectedCodeBlock2.querySelector(".svg-code-editor");
          if (codeEditor) {
            const currentColor = codeEditor.style.color;
            if (currentColor !== newColor) {
              pushOptionsChangeAction(
                {
                  type: "code",
                  element: selectedCodeBlock2,
                  shapeName: "code"
                },
                {
                  color: currentColor,
                  font: codeEditor.style.fontFamily,
                  size: codeEditor.style.fontSize,
                  align: codeEditor.style.textAlign
                  // Although mostly 'left'
                },
                {
                  color: newColor,
                  font: codeEditor.style.fontFamily,
                  size: codeEditor.style.fontSize,
                  align: codeEditor.style.textAlign
                }
              );
            }
            codeEditor.style.color = newColor;
            updateSyntaxHighlighting(codeEditor);
          }
        }
      });
    });
    codeTextFontOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        codeTextFontOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newFont = span.getAttribute("data-id");
        const oldFont = codeTextFont;
        codeTextFont = newFont;
        if (selectedCodeBlock2) {
          const codeEditor = selectedCodeBlock2.querySelector(".svg-code-editor");
          if (codeEditor) {
            const currentFont = codeEditor.style.fontFamily;
            if (currentFont !== newFont) {
              pushOptionsChangeAction(
                {
                  type: "code",
                  element: selectedCodeBlock2,
                  shapeName: "code"
                },
                {
                  color: codeEditor.style.color,
                  font: currentFont,
                  size: codeEditor.style.fontSize,
                  align: codeEditor.style.textAlign
                },
                {
                  color: codeEditor.style.color,
                  font: newFont,
                  size: codeEditor.style.fontSize,
                  align: codeEditor.style.textAlign
                }
              );
            }
            codeEditor.style.fontFamily = newFont;
            updateSyntaxHighlighting(codeEditor);
            setTimeout(updateCodeSelectionFeedback2, 0);
          }
        }
      });
    });
    codeTextSizeOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        codeTextSizeOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newSize = span.getAttribute("data-id") + "px";
        const oldSize = codeTextSize;
        codeTextSize = newSize;
        if (selectedCodeBlock2) {
          const codeEditor = selectedCodeBlock2.querySelector(".svg-code-editor");
          if (codeEditor) {
            const currentSize = codeEditor.style.fontSize;
            if (currentSize !== newSize) {
              pushOptionsChangeAction(
                {
                  type: "code",
                  element: selectedCodeBlock2,
                  shapeName: "code"
                },
                {
                  color: codeEditor.style.color,
                  font: codeEditor.style.fontFamily,
                  size: currentSize,
                  align: codeEditor.style.textAlign
                },
                {
                  color: codeEditor.style.color,
                  font: codeEditor.style.fontFamily,
                  size: newSize,
                  align: codeEditor.style.textAlign
                }
              );
            }
            codeEditor.style.fontSize = newSize;
            adjustCodeEditorSize2(codeEditor);
            updateSyntaxHighlighting(codeEditor);
            setTimeout(updateCodeSelectionFeedback2, 0);
          }
        }
      });
    });
    codeTextAlignOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        codeTextAlignOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newAlign = span.getAttribute("data-id");
        const oldAlign = codeTextAlign;
        codeTextAlign = newAlign;
        if (selectedCodeBlock2) {
          const codeEditor = selectedCodeBlock2.querySelector(".svg-code-editor");
          if (codeEditor) {
            const currentAlign = codeEditor.style.textAlign;
            if (currentAlign !== newAlign) {
              pushOptionsChangeAction(
                {
                  type: "code",
                  element: selectedCodeBlock2,
                  shapeName: "code"
                },
                {
                  color: codeEditor.style.color,
                  font: codeEditor.style.fontFamily,
                  size: codeEditor.style.fontSize,
                  align: currentAlign
                },
                {
                  color: codeEditor.style.color,
                  font: codeEditor.style.fontFamily,
                  size: codeEditor.style.fontSize,
                  align: newAlign
                }
              );
            }
            codeEditor.style.textAlign = newAlign;
            setTimeout(updateCodeSelectionFeedback2, 0);
          }
        }
      });
    });
    editorStyles = `
.svg-code-container {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-radius: 6px;
}

.svg-code-editor {
    scrollbar-width: thin;
    scrollbar-color: #484f58 #161b22;
}

.svg-code-editor::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.svg-code-editor::-webkit-scrollbar-track {
    background: #161b22;
    border-radius: 6px;
}

.svg-code-editor::-webkit-scrollbar-thumb {
    background: #484f58;
    border-radius: 6px;
}

.svg-code-editor::-webkit-scrollbar-thumb:hover {
    background: #6e7681;
}

/* Language detection indicator */
.svg-code-container::after {
    content: attr(data-language);
    position: absolute;
    top: -20px;
    right: 0;
    background: #007acc;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-family: monospace;
    opacity: 0.8;
}
`;
    if (!document.getElementById("code-editor-styles")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "code-editor-styles";
      styleSheet.textContent = editorStyles;
      document.head.appendChild(styleSheet);
    }
  }
});

// src/tools/textTool.js
var textTool_exports = {};
__export(textTool_exports, {
  deselectTextElement: () => deselectElement2,
  enterEditMode: () => enterEditMode,
  handleTextMouseDown: () => handleTextMouseDown,
  handleTextMouseMove: () => handleTextMouseMove,
  handleTextMouseUp: () => handleTextMouseUp,
  updateCodeToggleForShape: () => updateCodeToggleForShape
});
function switchToSelectionTool() {
  if (window.__sketchStoreApi) {
    window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
  } else {
    window.isSelectionToolActive = true;
  }
}
function wrapTextElement(groupElement) {
  const textShape = new TextShape(groupElement);
  return textShape;
}
function getSVGCoordinates2(event, element = svg) {
  if (!svg || !svg.createSVGPoint) {
    console.error("SVG element or createSVGPoint method not available.");
    return { x: 0, y: 0 };
  }
  let pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  try {
    let screenCTM = element && typeof element.getScreenCTM === "function" && element.getScreenCTM() || svg.getScreenCTM();
    if (!screenCTM) {
      console.error("Could not get Screen CTM.");
      return { x: event.clientX, y: event.clientY };
    }
    let svgPoint = pt.matrixTransform(screenCTM.inverse());
    return {
      x: svgPoint.x,
      y: svgPoint.y
    };
  } catch (error) {
    console.error("Error getting SVG coordinates:", error);
    return { x: event.clientX, y: event.clientY };
  }
}
function addText(event) {
  let { x, y } = getSVGCoordinates2(event);
  let gElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gElement.setAttribute("data-type", "text-group");
  gElement.setAttribute("transform", `translate(${x}, ${y})`);
  let textElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  let textAlignElement = "start";
  if (textAlign === "center") textAlignElement = "middle";
  else if (textAlign === "right") textAlignElement = "end";
  textElement.setAttribute("x", 0);
  textElement.setAttribute("y", 0);
  textElement.setAttribute("fill", textColor);
  textElement.setAttribute("font-size", textSize);
  textElement.setAttribute("font-family", textFont);
  textElement.setAttribute("text-anchor", textAlignElement);
  textElement.setAttribute("cursor", "default");
  textElement.setAttribute("white-space", "pre");
  textElement.setAttribute("dominant-baseline", "hanging");
  textElement.textContent = "";
  gElement.setAttribute("data-x", x);
  gElement.setAttribute("data-y", y);
  textElement.setAttribute("data-initial-size", textSize);
  textElement.setAttribute("data-initial-font", textFont);
  textElement.setAttribute("data-initial-color", textColor);
  textElement.setAttribute("data-initial-align", textAlign);
  textElement.setAttribute("data-type", "text");
  gElement.appendChild(textElement);
  svg.appendChild(gElement);
  const shapeID = `text-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
  gElement.setAttribute("id", shapeID);
  textElement.setAttribute("id", `${shapeID}-text`);
  const textShape = wrapTextElement(gElement);
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    shapes.push(textShape);
  }
  pushCreateAction({
    type: "text",
    element: textShape,
    shapeName: "text"
  });
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    shapes.forEach((shape) => {
      if (shape.shapeName === "frame" && shape.isShapeInFrame(textShape)) {
        shape.addShapeToFrame(textShape);
      }
    });
  }
  makeTextEditable(textElement, gElement);
}
function makeTextEditable(textElement, groupElement) {
  if (document.querySelector("textarea.svg-text-editor")) {
    return;
  }
  if (selectedElement3) {
    deselectElement2();
  }
  let input = document.createElement("textarea");
  input.className = "svg-text-editor";
  let textContent = "";
  const tspans = textElement.querySelectorAll("tspan");
  if (tspans.length > 0) {
    tspans.forEach((tspan, index) => {
      textContent += tspan.textContent.replace(/ /g, "\xA0");
      if (index < tspans.length - 1) {
        textContent += "\n";
      }
    });
  } else {
    textContent = textElement.textContent.replace(/ /g, "\xA0");
  }
  input.value = textContent;
  input.style.position = "absolute";
  input.style.outline = "none";
  input.style.padding = "1px";
  input.style.margin = "0";
  input.style.boxSizing = "border-box";
  input.style.overflow = "hidden";
  input.style.resize = "none";
  input.style.whiteSpace = "pre-wrap";
  input.style.minHeight = "1.2em";
  input.style.zIndex = "10000";
  const svgRect = svg.getBoundingClientRect();
  const textBBox = textElement.getBBox();
  let pt = svg.createSVGPoint();
  pt.x = textBBox.x;
  pt.y = textBBox.y;
  const groupCTM = groupElement.getScreenCTM() || svg.getScreenCTM();
  let screenPt = pt.matrixTransform(groupCTM);
  input.style.left = `${screenPt.x}px`;
  input.style.top = `${screenPt.y}px`;
  const svgZoomFactor = svg.getScreenCTM() ? svg.getScreenCTM().a : 1;
  const screenWidth = textBBox.width * svgZoomFactor;
  input.style.width = "auto";
  input.style.height = "auto";
  const currentFontSize = textElement.getAttribute("font-size") || "30px";
  const currentFontFamily = textElement.getAttribute("font-family") || "lixFont";
  const currentFill = textElement.getAttribute("fill") || "#fff";
  const currentAnchor3 = textElement.getAttribute("text-anchor") || "start";
  const rawSize = parseFloat(currentFontSize) || 30;
  const scaledFontSize = `${rawSize * svgZoomFactor}px`;
  input.style.minWidth = "150px";
  input.style.minHeight = "1.5em";
  input.style.width = "auto";
  input.style.height = "auto";
  input.style.overflow = "visible";
  input.style.whiteSpace = "pre-wrap";
  input.style.wordBreak = "break-word";
  input.style.fontSize = scaledFontSize;
  input.style.fontFamily = currentFontFamily;
  input.style.color = currentFill;
  input.style.lineHeight = "1.2em";
  input.style.textAlign = currentAnchor3 === "middle" ? "center" : currentAnchor3 === "end" ? "right" : "left";
  input.style.backgroundColor = "transparent";
  input.style.border = "none";
  input.style.outline = "none";
  document.body.appendChild(input);
  const adjustHeight = () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    const maxHeight = svgRect.height - screenPt.y;
    if (input.scrollHeight > maxHeight) {
      input.style.height = maxHeight + "px";
      input.style.overflowY = "auto";
    } else {
      input.style.overflowY = "hidden";
    }
  };
  const adjustWidth = () => {
    input.style.width = "auto";
    const maxWidth = svgRect.width - screenPt.x;
    const contentWidth = Math.max(input.scrollWidth, 150);
    if (contentWidth > maxWidth) {
      input.style.width = maxWidth + "px";
      input.style.overflowX = "auto";
    } else {
      input.style.width = contentWidth + "px";
      input.style.overflowX = "hidden";
    }
  };
  adjustHeight();
  adjustWidth();
  setTimeout(() => {
    input.focus();
    input.select();
  }, 50);
  input.addEventListener("input", adjustHeight);
  input.addEventListener("input", adjustWidth);
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      renderText(input, textElement, true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      renderText(input, textElement, true);
    }
  });
  input.originalTextElement = textElement;
  input.textGroup = groupElement;
  const handleClickOutside = (event) => {
    if (!input.contains(event.target)) {
      renderText(input, textElement, true);
      document.removeEventListener("pointerdown", handleClickOutside, true);
    }
  };
  document.addEventListener("pointerdown", handleClickOutside, true);
  input.handleClickOutside = handleClickOutside;
  const textEl = groupElement.querySelector("text");
  if (textEl) textEl.setAttribute("cursor", "text");
  groupElement.style.display = "none";
}
function renderText(input, textElement, deleteIfEmpty = false) {
  if (!input || !document.body.contains(input)) {
    return;
  }
  const text = input.value || "";
  const gElement = input.textGroup;
  if (input.handleClickOutside) {
    document.removeEventListener("pointerdown", input.handleClickOutside, true);
  }
  document.body.removeChild(input);
  if (textElement) textElement.setAttribute("cursor", "default");
  if (!gElement || !textElement) {
    return;
  }
  if (!gElement.parentNode) {
    if (selectedElement3 === gElement) {
      deselectElement2();
    }
    return;
  }
  if (deleteIfEmpty && text.trim() === "") {
    let textShape = null;
    if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
      textShape = shapes.find((shape) => shape.shapeName === "text" && shape.group === gElement);
      if (textShape) {
        const idx = shapes.indexOf(textShape);
        if (idx !== -1) shapes.splice(idx, 1);
      }
    }
    pushDeleteActionWithAttachments({
      type: "text",
      element: textShape || gElement,
      shapeName: "text"
    });
    if (typeof cleanupAttachments2 === "function") {
      cleanupAttachments2(gElement);
    }
    svg.removeChild(gElement);
    if (selectedElement3 === gElement) {
      selectedElement3 = null;
      removeSelectionFeedback();
    }
  } else {
    while (textElement.firstChild) {
      textElement.removeChild(textElement.firstChild);
    }
    const lines = text.split("\n");
    const x = textElement.getAttribute("x") || 0;
    lines.forEach((line, index) => {
      let tspan = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
      );
      tspan.setAttribute("x", x);
      tspan.setAttribute("dy", index === 0 ? "0" : "1.2em");
      tspan.textContent = line.replace(/\u00A0/g, " ") || " ";
      textElement.appendChild(tspan);
    });
    gElement.style.display = "block";
    updateAttachedArrows(gElement);
    if (selectedElement3 === gElement) {
      setTimeout(updateSelectionFeedback3, 0);
    }
  }
  if (gElement.parentNode) {
    switchToSelectionTool();
    requestAnimationFrame(() => selectElement2(gElement));
  }
}
function createSelectionFeedback(groupElement) {
  if (!groupElement) return;
  removeSelectionFeedback();
  const textElement = groupElement.querySelector("text");
  if (!textElement) {
    return;
  }
  const bbox = textElement.getBBox();
  const zoom = window.currentZoom || 1;
  const padding = 8 / zoom;
  const handleSize = 10 / zoom;
  const handleOffset = handleSize / 2;
  const anchorStrokeWidth = 2;
  const selX = bbox.x - padding;
  const selY = bbox.y - padding;
  const selWidth = bbox.width + 2 * padding;
  const selHeight = bbox.height + 2 * padding;
  const outlinePoints = [
    [selX, selY],
    [selX + selWidth, selY],
    [selX + selWidth, selY + selHeight],
    [selX, selY + selHeight],
    [selX, selY]
  ];
  const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
  selectionBox = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  selectionBox.setAttribute("class", "selection-box");
  selectionBox.setAttribute("points", pointsAttr);
  selectionBox.setAttribute("fill", "none");
  selectionBox.setAttribute("stroke", "#5B57D1");
  selectionBox.setAttribute("stroke-width", "1.5");
  selectionBox.setAttribute("stroke-dasharray", `${4 / zoom} ${2 / zoom}`);
  selectionBox.setAttribute("vector-effect", "non-scaling-stroke");
  selectionBox.setAttribute("pointer-events", "none");
  groupElement.appendChild(selectionBox);
  const handlesData = [
    { name: "nw", x: selX, y: selY, cursor: "nwse-resize" },
    { name: "ne", x: selX + selWidth, y: selY, cursor: "nesw-resize" },
    { name: "sw", x: selX, y: selY + selHeight, cursor: "nesw-resize" },
    { name: "se", x: selX + selWidth, y: selY + selHeight, cursor: "nwse-resize" }
  ];
  resizeHandles = {};
  handlesData.forEach((handle) => {
    const handleRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    handleRect.setAttribute("class", `resize-handle resize-handle-${handle.name}`);
    handleRect.setAttribute("x", handle.x - handleOffset);
    handleRect.setAttribute("y", handle.y - handleOffset);
    handleRect.setAttribute("width", handleSize);
    handleRect.setAttribute("height", handleSize);
    handleRect.setAttribute("fill", "#121212");
    handleRect.setAttribute("stroke", "#5B57D1");
    handleRect.setAttribute("stroke-width", anchorStrokeWidth);
    handleRect.setAttribute("vector-effect", "non-scaling-stroke");
    handleRect.style.cursor = handle.cursor;
    handleRect.setAttribute("data-anchor", handle.name);
    groupElement.appendChild(handleRect);
    resizeHandles[handle.name] = handleRect;
    handleRect.addEventListener("pointerdown", (e) => {
      if (window.isSelectionToolActive) {
        e.stopPropagation();
        startResize(e, handle.name);
      }
    });
  });
  const rotationAnchorPos = { x: selX + selWidth / 2, y: selY - 30 };
  const rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
  rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
  rotationAnchor.setAttribute("r", 8);
  rotationAnchor.setAttribute("class", "rotate-anchor");
  rotationAnchor.setAttribute("fill", "#121212");
  rotationAnchor.setAttribute("stroke", "#5B57D1");
  rotationAnchor.setAttribute("stroke-width", anchorStrokeWidth);
  rotationAnchor.setAttribute("vector-effect", "non-scaling-stroke");
  rotationAnchor.style.cursor = "grab";
  rotationAnchor.setAttribute("pointer-events", "all");
  groupElement.appendChild(rotationAnchor);
  resizeHandles.rotate = rotationAnchor;
  rotationAnchor.addEventListener("pointerdown", (e) => {
    if (window.isSelectionToolActive) {
      e.stopPropagation();
      startRotation(e);
    }
  });
  rotationAnchor.addEventListener("mouseover", function() {
    if (!isResizing2 && !isDragging6) {
      this.style.cursor = "grab";
    }
  });
  rotationAnchor.addEventListener("mouseout", function() {
    if (!isResizing2 && !isDragging6) {
      this.style.cursor = "default";
    }
  });
}
function updateSelectionFeedback3() {
  if (!selectedElement3 || !selectionBox) return;
  const textElement = selectedElement3.querySelector("text");
  if (!textElement) return;
  const wasHidden = selectedElement3.style.display === "none";
  if (wasHidden) selectedElement3.style.display = "block";
  const bbox = textElement.getBBox();
  if (wasHidden) selectedElement3.style.display = "none";
  if (bbox.width === 0 && bbox.height === 0 && textElement.textContent.trim() !== "") {
  }
  const zoom2 = window.currentZoom || 1;
  const padding = 8 / zoom2;
  const handleSize = 10 / zoom2;
  const handleOffset = handleSize / 2;
  const selX = bbox.x - padding;
  const selY = bbox.y - padding;
  const selWidth = Math.max(bbox.width + 2 * padding, handleSize);
  const selHeight = Math.max(bbox.height + 2 * padding, handleSize);
  const outlinePoints = [
    [selX, selY],
    [selX + selWidth, selY],
    [selX + selWidth, selY + selHeight],
    [selX, selY + selHeight],
    [selX, selY]
  ];
  const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
  selectionBox.setAttribute("points", pointsAttr);
  const handlesData = [
    { name: "nw", x: selX, y: selY },
    { name: "ne", x: selX + selWidth, y: selY },
    { name: "sw", x: selX, y: selY + selHeight },
    { name: "se", x: selX + selWidth, y: selY + selHeight }
  ];
  handlesData.forEach((handle) => {
    const handleRect = resizeHandles[handle.name];
    if (handleRect) {
      handleRect.setAttribute("x", handle.x - handleOffset);
      handleRect.setAttribute("y", handle.y - handleOffset);
    }
  });
  const rotationAnchor = resizeHandles.rotate;
  if (rotationAnchor) {
    const rotationAnchorPos = { x: selX + selWidth / 2, y: selY - 30 };
    rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
    rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
  }
}
function startRotation(event) {
  if (!selectedElement3 || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  isRotating = true;
  isDragging6 = false;
  isResizing2 = false;
  const textElement = selectedElement3.querySelector("text");
  if (!textElement) return;
  const bbox = textElement.getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  const mousePos = getSVGCoordinates2(event);
  let centerPoint = svg.createSVGPoint();
  centerPoint.x = centerX;
  centerPoint.y = centerY;
  const groupTransform = selectedElement3.transform.baseVal.consolidate();
  if (groupTransform) {
    centerPoint = centerPoint.matrixTransform(groupTransform.matrix);
  }
  rotationStartAngle = Math.atan2(mousePos.y - centerPoint.y, mousePos.x - centerPoint.x) * 180 / Math.PI;
  const currentTransform = selectedElement3.transform.baseVal.consolidate();
  rotationStartTransform = currentTransform ? currentTransform.matrix : svg.createSVGMatrix();
  svg.style.cursor = "grabbing";
  window.addEventListener("pointermove", handleMouseMove4);
  window.addEventListener("pointerup", handleMouseUp4);
}
function removeSelectionFeedback(element) {
  const target = element || selectedElement3;
  if (target) {
    target.querySelectorAll(".selection-box, .resize-handle, .rotate-anchor").forEach((el) => el.remove());
  }
  svg.querySelectorAll('g[data-type="text-group"] .selection-box, g[data-type="text-group"] .resize-handle, g[data-type="text-group"] .rotate-anchor').forEach((el) => el.remove());
  selectionBox = null;
  resizeHandles = {};
}
function selectElement2(groupElement) {
  if (!groupElement || !groupElement.parentNode) return;
  if (groupElement === selectedElement3) return;
  deselectElement2();
  selectedElement3 = groupElement;
  selectedElement3.classList.add("selected");
  createSelectionFeedback(selectedElement3);
  updateSelectedElement(selectedElement3);
  updateCodeToggleForShape("text");
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    const wrapper = shapes.find((s) => s.element === groupElement || s.group === groupElement);
    if (wrapper) {
      currentShape = wrapper;
    }
  }
  if (window.__showSidebarForShape) window.__showSidebarForShape("text");
}
function deselectElement2() {
  const activeEditor = document.querySelector("textarea.svg-text-editor");
  if (activeEditor) {
    let textElement = activeEditor.originalTextElement;
    if (textElement) {
      renderText(activeEditor, textElement, true);
    } else if (document.body.contains(activeEditor)) {
      document.body.removeChild(activeEditor);
    }
  }
  if (selectedElement3) {
    removeSelectionFeedback();
    selectedElement3.classList.remove("selected");
    selectedElement3 = null;
    updateSelectedElement(null);
    if (currentShape && (currentShape.shapeName === "text" || currentShape.shapeName === "code")) {
      currentShape = null;
    }
    if (isSelectionToolActive) {
      textSideBar.classList.add("hidden");
    }
  }
  if (isRotating) {
    isRotating = false;
    rotationStartAngle = 0;
    rotationStartTransform = null;
    svg.style.cursor = "default";
    window.removeEventListener("pointermove", handleMouseMove4);
    window.removeEventListener("pointerup", handleMouseUp4);
  }
}
function startDrag(event) {
  if (!selectedElement3 || event.button !== 0) return;
  if (event.target.closest(".resize-handle")) {
    return;
  }
  isDragging6 = true;
  isResizing2 = false;
  event.preventDefault();
  const currentTransform = selectedElement3.transform.baseVal.consolidate();
  const initialTranslateX = currentTransform ? currentTransform.matrix.e : 0;
  const initialTranslateY = currentTransform ? currentTransform.matrix.f : 0;
  startPoint = getSVGCoordinates2(event);
  dragOffsetX = startPoint.x - initialTranslateX;
  dragOffsetY = startPoint.y - initialTranslateY;
  let textShape = null;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    textShape = shapes.find((shape) => shape.shapeName === "text" && shape.group === selectedElement3);
  }
  if (textShape) {
    draggedShapeInitialFrameText = textShape.parentFrame || null;
    if (textShape.parentFrame) {
      textShape.parentFrame.temporarilyRemoveFromFrame(textShape);
    }
  }
  svg.style.cursor = "grabbing";
  svg.addEventListener("pointermove", handleMouseMove4);
  svg.addEventListener("pointerup", handleMouseUp4);
}
function startResize(event, anchor) {
  if (!selectedElement3 || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  isResizing2 = true;
  isDragging6 = false;
  currentResizeHandle = anchor;
  const textElement = selectedElement3.querySelector("text");
  if (!textElement) {
    isResizing2 = false;
    return;
  }
  startBBox = textElement.getBBox();
  startFontSize = parseFloat(textElement.getAttribute("font-size") || 30);
  if (isNaN(startFontSize)) startFontSize = 30;
  startPoint = getSVGCoordinates2(event, selectedElement3);
  const groupScreenCTM = selectedElement3.getScreenCTM();
  initialInverseScreenCTM = groupScreenCTM ? groupScreenCTM.inverse() : null;
  const currentTransform = selectedElement3.transform.baseVal.consolidate();
  initialGroupTx = currentTransform ? currentTransform.matrix.e : 0;
  initialGroupTy = currentTransform ? currentTransform.matrix.f : 0;
  const padding = 3;
  const startX7 = startBBox.x - padding;
  const startY7 = startBBox.y - padding;
  const startWidth = startBBox.width + 2 * padding;
  const startHeight = startBBox.height + 2 * padding;
  let hx = startX7;
  let hy = startY7;
  if (anchor.includes("e")) {
    hx = startX7 + startWidth;
  }
  if (anchor.includes("s")) {
    hy = startY7 + startHeight;
  }
  initialHandlePosRelGroup = { x: hx, y: hy };
  svg.style.cursor = resizeHandles[anchor]?.style.cursor || "default";
  svg.addEventListener("pointermove", handleMouseMove4);
  svg.addEventListener("pointerup", handleMouseUp4);
}
function extractRotationFromTransform4(element) {
  const currentTransform = element.transform.baseVal.consolidate();
  if (currentTransform) {
    const matrix = currentTransform.matrix;
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  }
  return 0;
}
function enterEditMode(groupElement) {
  const textEl = groupElement.querySelector("text");
  if (!textEl) return;
  if (window.__sketchStoreApi) {
    window.__sketchStoreApi.setActiveTool("text");
  } else {
    window.isTextToolActive = true;
    window.isSelectionToolActive = false;
  }
  toolExtraPopup();
  deselectElement2();
  makeTextEditable(textEl, groupElement);
}
function convertTextToCode(textGroupElement) {
  const textElement = textGroupElement.querySelector("text");
  if (!textElement) return;
  let textContent = "";
  const tspans = textElement.querySelectorAll("tspan");
  if (tspans.length > 0) {
    tspans.forEach((tspan, index) => {
      textContent += tspan.textContent;
      if (index < tspans.length - 1) textContent += "\n";
    });
  } else {
    textContent = textElement.textContent || "";
  }
  const currentTransform = textGroupElement.transform.baseVal.consolidate();
  const tx = currentTransform ? currentTransform.matrix.e : 0;
  const ty = currentTransform ? currentTransform.matrix.f : 0;
  const fontSize = textElement.getAttribute("font-size") || "25px";
  const color = textElement.getAttribute("fill") || "#fff";
  let oldTextShape = null;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    oldTextShape = shapes.find((s) => s.shapeName === "text" && s.group === textGroupElement);
    if (oldTextShape) {
      const idx = shapes.indexOf(oldTextShape);
      if (idx !== -1) shapes.splice(idx, 1);
    }
  }
  deselectElement2();
  if (textGroupElement.parentNode) {
    textGroupElement.parentNode.removeChild(textGroupElement);
  }
  const gElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gElement.setAttribute("data-type", "code-group");
  gElement.setAttribute("transform", `translate(${tx}, ${ty})`);
  const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  backgroundRect.setAttribute("class", "code-background");
  backgroundRect.setAttribute("x", -10);
  backgroundRect.setAttribute("y", -10);
  backgroundRect.setAttribute("width", 300);
  backgroundRect.setAttribute("height", 60);
  backgroundRect.setAttribute("fill", "#161b22");
  backgroundRect.setAttribute("stroke", "#30363d");
  backgroundRect.setAttribute("stroke-width", "1");
  backgroundRect.setAttribute("rx", "6");
  backgroundRect.setAttribute("ry", "6");
  gElement.appendChild(backgroundRect);
  const codeElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  codeElement.setAttribute("x", 0);
  codeElement.setAttribute("y", 0);
  codeElement.setAttribute("fill", color);
  codeElement.setAttribute("font-size", fontSize);
  codeElement.setAttribute("font-family", "lixCode");
  codeElement.setAttribute("text-anchor", "start");
  codeElement.setAttribute("cursor", "default");
  codeElement.setAttribute("white-space", "pre");
  codeElement.setAttribute("dominant-baseline", "hanging");
  codeElement.setAttribute("data-language", getCodeLanguage());
  codeElement.setAttribute("data-type", "code");
  const shapeID = `code-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
  gElement.setAttribute("id", shapeID);
  gElement.setAttribute("data-x", tx);
  gElement.setAttribute("data-y", ty);
  codeElement.setAttribute("id", `${shapeID}-code`);
  gElement.appendChild(codeElement);
  svg.appendChild(gElement);
  if (textContent.trim()) {
    const lang = getCodeLanguage();
    const highlighted = applySyntaxHighlightingToSVG(textContent, lang);
    createHighlightedSVGText(highlighted, codeElement);
    updateCodeBackground(gElement, codeElement);
  }
  const codeShape = wrapCodeElement(gElement);
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    shapes.push(codeShape);
  }
  pushModeConvertAction(oldTextShape, textGroupElement, "text", codeShape, gElement, "code");
  selectCodeBlock2(gElement);
}
function convertCodeToText(codeGroupElement) {
  const codeElement = codeGroupElement.querySelector("text");
  if (!codeElement) return;
  const textContent = extractTextFromCodeElement(codeElement);
  const currentTransform = codeGroupElement.transform.baseVal.consolidate();
  const tx = currentTransform ? currentTransform.matrix.e : 0;
  const ty = currentTransform ? currentTransform.matrix.f : 0;
  const fontSize = codeElement.getAttribute("font-size") || "30px";
  const color = codeElement.getAttribute("fill") || "#fff";
  let oldCodeShape = null;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    oldCodeShape = shapes.find((s) => s.shapeName === "code" && s.group === codeGroupElement);
    if (oldCodeShape) {
      const idx = shapes.indexOf(oldCodeShape);
      if (idx !== -1) shapes.splice(idx, 1);
    }
  }
  deselectCodeBlock2();
  if (codeGroupElement.parentNode) {
    codeGroupElement.parentNode.removeChild(codeGroupElement);
  }
  const gElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gElement.setAttribute("data-type", "text-group");
  gElement.setAttribute("transform", `translate(${tx}, ${ty})`);
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElement.setAttribute("x", 0);
  textElement.setAttribute("y", 0);
  textElement.setAttribute("fill", color);
  textElement.setAttribute("font-size", fontSize);
  textElement.setAttribute("font-family", textFont);
  textElement.setAttribute("text-anchor", "start");
  textElement.setAttribute("cursor", "default");
  textElement.setAttribute("white-space", "pre");
  textElement.setAttribute("dominant-baseline", "hanging");
  textElement.setAttribute("data-type", "text");
  const shapeID = `text-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
  gElement.setAttribute("id", shapeID);
  gElement.setAttribute("data-x", tx);
  gElement.setAttribute("data-y", ty);
  textElement.setAttribute("id", `${shapeID}-text`);
  gElement.appendChild(textElement);
  svg.appendChild(gElement);
  if (textContent.trim()) {
    const lines = textContent.split("\n");
    const x = textElement.getAttribute("x") || 0;
    lines.forEach((line, index) => {
      const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      tspan.setAttribute("x", x);
      tspan.setAttribute("dy", index === 0 ? "0" : "1.2em");
      tspan.textContent = line || " ";
      textElement.appendChild(tspan);
    });
  }
  const textShape = wrapTextElement(gElement);
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    shapes.push(textShape);
  }
  pushModeConvertAction(oldCodeShape, codeGroupElement, "code", textShape, gElement, "text");
  selectElement2(gElement);
}
function pushModeConvertAction(oldShape, oldElement, oldType, newShape, newElement, newType) {
  pushCreateAction({
    type: "modeConvert",
    oldShape,
    oldElement,
    oldType,
    newShape,
    newElement,
    newType,
    element: newShape,
    shapeName: newType
  });
}
function updateCodeToggleForShape(shapeName) {
  const isCode = shapeName === "code";
  textCodeOptions.forEach((el) => el.classList.remove("selected"));
  textCodeOptions.forEach((el) => {
    if (el.getAttribute("data-id") === "true" === isCode) {
      el.classList.add("selected");
    }
  });
  if (languageSelector) {
    languageSelector.classList.toggle("hidden", !isCode);
  }
  if (isCode && codeLanguageSelect) {
    const selectedCode = getSelectedCodeBlock();
    if (selectedCode) {
      const codeEl = selectedCode.querySelector("text");
      const lang = codeEl?.getAttribute("data-language") || "auto";
      codeLanguageSelect.value = lang;
    }
  }
}
var textSize, textFont, textColor, textAlign, textColorOptions, textFontOptions, textSizeOptions, textAlignOptions, selectedElement3, selectionBox, resizeHandles, dragOffsetX, dragOffsetY, isDragging6, isResizing2, currentResizeHandle, startBBox, startFontSize, startPoint, isRotating, rotationStartAngle, rotationStartTransform, initialHandlePosRelGroup, initialGroupTx, initialGroupTy, initialInverseScreenCTM, draggedShapeInitialFrameText, hoveredFrameText2, handleMouseMove4, handleMouseUp4, handleTextMouseDown, handleTextMouseMove, handleTextMouseUp, textCodeOptions, languageSelector, codeLanguageSelect;
var init_textTool = __esm({
  "src/tools/textTool.js"() {
    init_UndoRedo();
    init_arrowTool();
    init_codeTool();
    textSize = "30px";
    textFont = "lixFont";
    textColor = "#fff";
    textAlign = "left";
    textColorOptions = document.querySelectorAll(".textColorSpan");
    textFontOptions = document.querySelectorAll(".textFontSpan");
    textSizeOptions = document.querySelectorAll(".textSizeSpan");
    textAlignOptions = document.querySelectorAll(".textAlignSpan");
    selectedElement3 = null;
    selectionBox = null;
    resizeHandles = {};
    isDragging6 = false;
    isResizing2 = false;
    currentResizeHandle = null;
    startBBox = null;
    startFontSize = null;
    startPoint = null;
    isRotating = false;
    rotationStartAngle = 0;
    rotationStartTransform = null;
    initialHandlePosRelGroup = null;
    initialGroupTx = 0;
    initialGroupTy = 0;
    initialInverseScreenCTM = null;
    draggedShapeInitialFrameText = null;
    hoveredFrameText2 = null;
    setTextReferences(selectedElement3, updateSelectionFeedback3, svg);
    handleMouseMove4 = (event) => {
      if (!selectedElement3) return;
      event.preventDefault();
      const svgRect = svg.getBoundingClientRect();
      lastMousePos = {
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top
      };
      if (isDragging6) {
        const currentPoint = getSVGCoordinates2(event);
        const newTranslateX = currentPoint.x - dragOffsetX;
        const newTranslateY = currentPoint.y - dragOffsetY;
        const currentTransform = selectedElement3.transform.baseVal.consolidate();
        if (currentTransform) {
          const matrix = currentTransform.matrix;
          const angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
          const textElement = selectedElement3.querySelector("text");
          if (textElement) {
            const bbox = textElement.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            selectedElement3.setAttribute(
              "transform",
              `translate(${newTranslateX}, ${newTranslateY}) rotate(${angle}, ${centerX}, ${centerY})`
            );
          } else {
            selectedElement3.setAttribute("transform", `translate(${newTranslateX}, ${newTranslateY})`);
          }
        } else {
          selectedElement3.setAttribute("transform", `translate(${newTranslateX}, ${newTranslateY})`);
        }
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          const textShape = shapes.find((shape) => shape.shapeName === "text" && shape.group === selectedElement3);
          if (textShape) {
            textShape.updateFrameContainment();
          }
        }
        updateAttachedArrows(selectedElement3);
      } else if (isResizing2) {
        const textElement = selectedElement3.querySelector("text");
        if (!textElement || !startBBox || startFontSize === null || !startPoint || !initialHandlePosRelGroup) return;
        let currentPoint;
        if (initialInverseScreenCTM) {
          const pt = svg.createSVGPoint();
          pt.x = event.clientX;
          pt.y = event.clientY;
          currentPoint = pt.matrixTransform(initialInverseScreenCTM);
        } else {
          currentPoint = getSVGCoordinates2(event, selectedElement3);
        }
        const startX7 = startBBox.x;
        const startY7 = startBBox.y;
        const startWidth = startBBox.width;
        const startHeight = startBBox.height;
        let anchorX, anchorY;
        switch (currentResizeHandle) {
          case "nw":
            anchorX = startX7 + startWidth;
            anchorY = startY7 + startHeight;
            break;
          case "ne":
            anchorX = startX7;
            anchorY = startY7 + startHeight;
            break;
          case "sw":
            anchorX = startX7 + startWidth;
            anchorY = startY7;
            break;
          case "se":
            anchorX = startX7;
            anchorY = startY7;
            break;
        }
        const newWidth = Math.abs(currentPoint.x - anchorX);
        const newHeight = Math.abs(currentPoint.y - anchorY);
        const chosenScale = newHeight / startHeight;
        const minScale2 = 0.1;
        const maxScale2 = 10;
        const clampedScale = Math.max(minScale2, Math.min(chosenScale, maxScale2));
        const newFontSize = startFontSize * clampedScale;
        const minFontSize = 5;
        const finalFontSize = Math.max(newFontSize, minFontSize);
        textElement.setAttribute("font-size", `${finalFontSize}px`);
        const currentBBox = textElement.getBBox();
        let newAnchorX, newAnchorY;
        switch (currentResizeHandle) {
          case "nw":
            newAnchorX = currentBBox.x + currentBBox.width;
            newAnchorY = currentBBox.y + currentBBox.height;
            break;
          case "ne":
            newAnchorX = currentBBox.x;
            newAnchorY = currentBBox.y + currentBBox.height;
            break;
          case "sw":
            newAnchorX = currentBBox.x + currentBBox.width;
            newAnchorY = currentBBox.y;
            break;
          case "se":
            newAnchorX = currentBBox.x;
            newAnchorY = currentBBox.y;
            break;
        }
        const deltaX = anchorX - newAnchorX;
        const deltaY = anchorY - newAnchorY;
        const currentTransform = selectedElement3.transform.baseVal.consolidate();
        if (currentTransform) {
          const matrix = currentTransform.matrix;
          const angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
          const newGroupTx = initialGroupTx + deltaX;
          const newGroupTy = initialGroupTy + deltaY;
          const centerX = currentBBox.x + currentBBox.width / 2;
          const centerY = currentBBox.y + currentBBox.height / 2;
          selectedElement3.setAttribute(
            "transform",
            `translate(${newGroupTx}, ${newGroupTy}) rotate(${angle}, ${centerX}, ${centerY})`
          );
        } else {
          const newGroupTx = initialGroupTx + deltaX;
          const newGroupTy = initialGroupTy + deltaY;
          selectedElement3.setAttribute("transform", `translate(${newGroupTx}, ${newGroupTy})`);
        }
        updateAttachedArrows(selectedElement3);
        clearTimeout(selectedElement3.updateFeedbackTimeout);
        selectedElement3.updateFeedbackTimeout = setTimeout(() => {
          updateSelectionFeedback3();
          delete selectedElement3.updateFeedbackTimeout;
        }, 0);
      } else if (isRotating) {
        const textElement = selectedElement3.querySelector("text");
        if (!textElement) return;
        const bbox = textElement.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        const mousePos = getSVGCoordinates2(event);
        let centerPoint = svg.createSVGPoint();
        centerPoint.x = centerX;
        centerPoint.y = centerY;
        const groupTransform = selectedElement3.transform.baseVal.consolidate();
        if (groupTransform) {
          centerPoint = centerPoint.matrixTransform(groupTransform.matrix);
        }
        const currentAngle = Math.atan2(mousePos.y - centerPoint.y, mousePos.x - centerPoint.x) * 180 / Math.PI;
        const rotationDiff = currentAngle - rotationStartAngle;
        const newTransform = `translate(${rotationStartTransform.e}, ${rotationStartTransform.f}) rotate(${rotationDiff}, ${centerX}, ${centerY})`;
        selectedElement3.setAttribute("transform", newTransform);
        updateAttachedArrows(selectedElement3);
        updateSelectionFeedback3();
      }
    };
    handleMouseUp4 = (event) => {
      if (event.button !== 0) return;
      if (isDragging6 && selectedElement3) {
        const currentTransform = selectedElement3.transform.baseVal.consolidate();
        if (currentTransform) {
          const finalTranslateX = currentTransform.matrix.e;
          const finalTranslateY = currentTransform.matrix.f;
          const initialX = parseFloat(selectedElement3.getAttribute("data-x")) || 0;
          const initialY = parseFloat(selectedElement3.getAttribute("data-y")) || 0;
          let textShape = null;
          if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
            textShape = shapes.find((shape) => shape.shapeName === "text" && shape.group === selectedElement3);
          }
          const oldPosWithFrame = {
            x: initialX,
            y: initialY,
            rotation: extractRotationFromTransform4(selectedElement3) || 0,
            parentFrame: draggedShapeInitialFrameText
          };
          const newPosWithFrame = {
            x: finalTranslateX,
            y: finalTranslateY,
            rotation: extractRotationFromTransform4(selectedElement3) || 0,
            parentFrame: textShape ? textShape.parentFrame : null
          };
          const stateChanged = initialX !== finalTranslateX || initialY !== finalTranslateY;
          const frameChanged = oldPosWithFrame.parentFrame !== newPosWithFrame.parentFrame;
          if (stateChanged || frameChanged) {
            pushTransformAction2(
              {
                type: "text",
                element: selectedElement3,
                shapeName: "text"
              },
              oldPosWithFrame,
              newPosWithFrame
            );
          }
          if (textShape) {
            const finalFrame = hoveredFrameText2;
            if (draggedShapeInitialFrameText !== finalFrame) {
              if (draggedShapeInitialFrameText) {
                draggedShapeInitialFrameText.removeShapeFromFrame(textShape);
              }
              if (finalFrame) {
                finalFrame.addShapeToFrame(textShape);
              }
              if (frameChanged) {
                pushFrameAttachmentAction(
                  finalFrame || draggedShapeInitialFrameText,
                  textShape,
                  finalFrame ? "attach" : "detach",
                  draggedShapeInitialFrameText
                );
              }
            } else if (draggedShapeInitialFrameText) {
              draggedShapeInitialFrameText.restoreToFrame(textShape);
            }
          }
          selectedElement3.setAttribute("data-x", finalTranslateX);
          selectedElement3.setAttribute("data-y", finalTranslateY);
        }
        draggedShapeInitialFrameText = null;
      } else if (isResizing2 && selectedElement3) {
        const textElement = selectedElement3.querySelector("text");
        if (textElement) {
          const finalFontSize = textElement.getAttribute("font-size");
          const initialFontSize = startFontSize;
          const currentTransform = selectedElement3.transform.baseVal.consolidate();
          if (currentTransform && initialFontSize !== parseFloat(finalFontSize)) {
            const finalTranslateX = currentTransform.matrix.e;
            const finalTranslateY = currentTransform.matrix.f;
            pushTransformAction2(
              {
                type: "text",
                element: selectedElement3,
                shapeName: "text"
              },
              {
                x: initialGroupTx,
                y: initialGroupTy,
                fontSize: initialFontSize,
                rotation: extractRotationFromTransform4(selectedElement3) || 0
              },
              {
                x: finalTranslateX,
                y: finalTranslateY,
                fontSize: parseFloat(finalFontSize),
                rotation: extractRotationFromTransform4(selectedElement3) || 0
              }
            );
            selectedElement3.setAttribute("data-x", finalTranslateX);
            selectedElement3.setAttribute("data-y", finalTranslateY);
          }
          clearTimeout(selectedElement3.updateFeedbackTimeout);
          updateSelectionFeedback3();
        }
      } else if (isRotating && selectedElement3) {
        const currentTransform = selectedElement3.transform.baseVal.consolidate();
        if (currentTransform && rotationStartTransform) {
          const initialRotation = Math.atan2(rotationStartTransform.b, rotationStartTransform.a) * 180 / Math.PI;
          const finalRotation = extractRotationFromTransform4(selectedElement3) || 0;
          if (Math.abs(initialRotation - finalRotation) > 1) {
            pushTransformAction2(
              {
                type: "text",
                element: selectedElement3,
                shapeName: "text"
              },
              {
                x: rotationStartTransform.e,
                y: rotationStartTransform.f,
                rotation: initialRotation
              },
              {
                x: currentTransform.matrix.e,
                y: currentTransform.matrix.f,
                rotation: finalRotation
              }
            );
          }
        }
        updateSelectionFeedback3();
      }
      if (hoveredFrameText2) {
        hoveredFrameText2.removeHighlight();
        hoveredFrameText2 = null;
      }
      isDragging6 = false;
      isResizing2 = false;
      isRotating = false;
      currentResizeHandle = null;
      startPoint = null;
      startBBox = null;
      startFontSize = null;
      dragOffsetX = void 0;
      dragOffsetY = void 0;
      initialHandlePosRelGroup = null;
      initialGroupTx = 0;
      initialGroupTy = 0;
      rotationStartAngle = 0;
      rotationStartTransform = null;
      svg.style.cursor = isSelectionToolActive ? "default" : isTextToolActive ? "text" : "default";
      if (selectedElement3) {
        setTimeout(updateSelectionFeedback3, 0);
      }
      svg.removeEventListener("pointermove", handleMouseMove4);
      svg.removeEventListener("pointerup", handleMouseUp4);
      window.removeEventListener("pointermove", handleMouseMove4);
      window.removeEventListener("pointerup", handleMouseUp4);
    };
    handleTextMouseDown = function(e) {
      if (!e.target) return;
      const activeEditor = document.querySelector("textarea.svg-text-editor");
      if (activeEditor && activeEditor.contains(e.target)) {
        return;
      }
      if (activeEditor && !activeEditor.contains(e.target)) {
        let textElement = activeEditor.originalTextElement;
        if (textElement) {
          renderText(activeEditor, textElement, true);
          return;
        } else if (document.body.contains(activeEditor)) {
          document.body.removeChild(activeEditor);
        }
      }
      const targetGroup = e.target.closest('g[data-type="text-group"]');
      if (isSelectionToolActive && e.button === 0) {
        if (targetGroup) {
          if (e.target.closest(".resize-handle")) {
            return;
          }
          if (e.detail >= 2 && targetGroup === selectedElement3) {
            enterEditMode(targetGroup);
            e.stopPropagation();
            return;
          }
          if (targetGroup === selectedElement3) {
            startDrag(e);
          } else {
            selectElement2(targetGroup);
            startDrag(e);
          }
        } else {
          deselectElement2();
        }
      } else if (isTextToolActive && e.button === 0) {
        if (targetGroup) {
          if (e.detail >= 2) {
            let textEl = targetGroup.querySelector("text");
            if (textEl) {
              makeTextEditable(textEl, targetGroup);
              e.stopPropagation();
              return;
            }
          }
          if (targetGroup === selectedElement3) {
            startDrag(e);
          } else {
            selectElement2(targetGroup);
            startDrag(e);
          }
        } else {
          deselectElement2();
          addText(e);
        }
      }
    };
    handleTextMouseMove = function(e) {
      const svgRect = svg.getBoundingClientRect();
      lastMousePos = {
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top
      };
      if (isTextToolActive) {
        const targetGroup = e.target?.closest?.('g[data-type="text-group"]');
        if (targetGroup) {
          svg.style.cursor = "pointer";
        } else {
          svg.style.cursor = "crosshair";
        }
      } else if (isSelectionToolActive) {
        const targetGroup = e.target?.closest?.('g[data-type="text-group"]');
        if (targetGroup) {
          svg.style.cursor = "default";
        }
      }
      if (isTextToolActive && !isDragging6 && !isResizing2 && !isRotating) {
        const { x, y } = getSVGCoordinates2(e);
        const tempTextBounds = {
          x: x - 50,
          y: y - 20,
          width: 100,
          height: 40
        };
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.forEach((frame) => {
            if (frame.shapeName === "frame") {
              if (frame.isShapeInFrame(tempTextBounds)) {
                frame.highlightFrame();
                hoveredFrameText2 = frame;
              } else if (hoveredFrameText2 === frame) {
                frame.removeHighlight();
                hoveredFrameText2 = null;
              }
            }
          });
        }
      }
    };
    handleTextMouseUp = function(e) {
      if (hoveredFrameText2) {
        hoveredFrameText2.removeHighlight();
        hoveredFrameText2 = null;
      }
    };
    textColorOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        textColorOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newColor = span.getAttribute("data-id");
        const oldColor = textColor;
        textColor = newColor;
        if (selectedElement3) {
          const textElement = selectedElement3.querySelector("text");
          if (textElement) {
            const currentColor = textElement.getAttribute("fill");
            if (currentColor !== newColor) {
              pushOptionsChangeAction(
                {
                  type: "text",
                  element: selectedElement3,
                  shapeName: "text"
                },
                {
                  color: currentColor,
                  font: textElement.getAttribute("font-family"),
                  size: textElement.getAttribute("font-size"),
                  align: textElement.getAttribute("text-anchor")
                },
                {
                  color: newColor,
                  font: textElement.getAttribute("font-family"),
                  size: textElement.getAttribute("font-size"),
                  align: textElement.getAttribute("text-anchor")
                }
              );
            }
            textElement.setAttribute("fill", newColor);
          }
        }
      });
    });
    textFontOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        textFontOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newFont = span.getAttribute("data-id");
        const oldFont = textFont;
        textFont = newFont;
        if (selectedElement3) {
          const textElement = selectedElement3.querySelector("text");
          if (textElement) {
            const currentFont = textElement.getAttribute("font-family");
            if (currentFont !== newFont) {
              pushOptionsChangeAction(
                {
                  type: "text",
                  element: selectedElement3,
                  shapeName: "text"
                },
                {
                  color: textElement.getAttribute("fill"),
                  font: currentFont,
                  size: textElement.getAttribute("font-size"),
                  align: textElement.getAttribute("text-anchor")
                },
                {
                  color: textElement.getAttribute("fill"),
                  font: newFont,
                  size: textElement.getAttribute("font-size"),
                  align: textElement.getAttribute("text-anchor")
                }
              );
            }
            textElement.setAttribute("font-family", newFont);
            setTimeout(updateSelectionFeedback3, 0);
          }
        }
      });
    });
    textSizeOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        textSizeOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newSize = span.getAttribute("data-id") + "px";
        const oldSize = textSize;
        textSize = newSize;
        if (selectedElement3) {
          const textElement = selectedElement3.querySelector("text");
          if (textElement) {
            const currentSize = textElement.getAttribute("font-size");
            if (currentSize !== newSize) {
              pushOptionsChangeAction(
                {
                  type: "text",
                  element: selectedElement3,
                  shapeName: "text"
                },
                {
                  color: textElement.getAttribute("fill"),
                  font: textElement.getAttribute("font-family"),
                  size: currentSize,
                  align: textElement.getAttribute("text-anchor")
                },
                {
                  color: textElement.getAttribute("fill"),
                  font: textElement.getAttribute("font-family"),
                  size: newSize,
                  align: textElement.getAttribute("text-anchor")
                }
              );
            }
            textElement.setAttribute("font-size", newSize);
            setTimeout(updateSelectionFeedback3, 0);
          }
        }
      });
    });
    textAlignOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        textAlignOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const newAlign = span.getAttribute("data-id");
        const oldAlign = textAlign;
        textAlign = newAlign;
        if (selectedElement3) {
          const textElement = selectedElement3.querySelector("text");
          if (textElement) {
            const currentAnchor3 = textElement.getAttribute("text-anchor");
            let newAnchor = "start";
            if (newAlign === "center") newAnchor = "middle";
            else if (newAlign === "right") newAnchor = "end";
            if (currentAnchor3 !== newAnchor) {
              pushOptionsChangeAction(
                {
                  type: "text",
                  element: selectedElement3,
                  shapeName: "text"
                },
                {
                  color: textElement.getAttribute("fill"),
                  font: textElement.getAttribute("font-family"),
                  size: textElement.getAttribute("font-size"),
                  align: currentAnchor3
                },
                {
                  color: textElement.getAttribute("fill"),
                  font: textElement.getAttribute("font-family"),
                  size: textElement.getAttribute("font-size"),
                  align: newAnchor
                }
              );
            }
            textElement.setAttribute("text-anchor", newAnchor);
            setTimeout(updateSelectionFeedback3, 0);
          }
        }
      });
    });
    textCodeOptions = document.querySelectorAll(".textCodeSpan");
    languageSelector = document.getElementById("textLanguageSelector");
    codeLanguageSelect = document.getElementById("codeLanguageSelect");
    textCodeOptions.forEach((span) => {
      span.addEventListener("click", (event) => {
        event.stopPropagation();
        textCodeOptions.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const isCodeMode = span.getAttribute("data-id") === "true";
        isTextInCodeMode = isCodeMode;
        if (languageSelector) {
          languageSelector.classList.toggle("hidden", !isCodeMode);
        }
        if (isTextToolActive) {
          isCodeToolActive = isCodeMode;
        }
        if (isCodeMode && selectedElement3) {
          convertTextToCode(selectedElement3);
        } else if (!isCodeMode && getSelectedCodeBlock()) {
          convertCodeToText(getSelectedCodeBlock());
        }
      });
    });
    if (codeLanguageSelect) {
      codeLanguageSelect.addEventListener("change", (event) => {
        const lang = event.target.value;
        setCodeLanguage(lang);
        const selectedCode = getSelectedCodeBlock();
        if (selectedCode) {
          const codeElement = selectedCode.querySelector("text");
          if (codeElement) {
            codeElement.setAttribute("data-language", lang);
            const content = extractTextFromCodeElement(codeElement);
            while (codeElement.firstChild) {
              codeElement.removeChild(codeElement.firstChild);
            }
            const highlighted = applySyntaxHighlightingToSVG(content, lang);
            createHighlightedSVGText(highlighted, codeElement);
            updateCodeBackground(selectedCode, codeElement);
          }
        }
      });
    }
    window.updateSelectedTextStyle = function(changes) {
      const el = selectedElement3 || (window.currentShape && window.currentShape.shapeName === "text" ? window.currentShape.group : null);
      if (!el) return;
      const textElement = el.querySelector("text");
      if (!textElement) return;
      if (changes.color) {
        textElement.setAttribute("fill", changes.color);
        textColor = changes.color;
      }
      if (changes.font) {
        textElement.setAttribute("font-family", changes.font);
        textFont = changes.font;
      }
      if (changes.fontSize) {
        textElement.setAttribute("font-size", changes.fontSize);
        textSize = changes.fontSize;
      }
    };
    window.__deselectTextElement = deselectElement2;
    window.__selectTextElement = selectElement2;
    window.__convertTextToCode = function() {
      if (selectedElement3 && selectedElement3.getAttribute("data-type") === "text-group") {
        convertTextToCode(selectedElement3);
      }
    };
    window.__convertCodeToText = function() {
      let codeBlock = getSelectedCodeBlock();
      if (!codeBlock && selectedElement3 && selectedElement3.getAttribute("data-type") === "code-group") {
        codeBlock = selectedElement3;
      }
      if (codeBlock) {
        convertCodeToText(codeBlock);
      }
    };
    window.__setCodeLanguage = function(lang) {
      setCodeLanguage(lang);
      const selectedCode = getSelectedCodeBlock();
      if (selectedCode) {
        const codeElement = selectedCode.querySelector("text");
        if (codeElement) {
          codeElement.setAttribute("data-language", lang);
          const textContent = extractTextFromCodeElement(codeElement);
          while (codeElement.firstChild) codeElement.removeChild(codeElement.firstChild);
          const highlighted = applySyntaxHighlightingToSVG(textContent, lang);
          createHighlightedSVGText(highlighted, codeElement);
          updateCodeBackground(selectedCode, codeElement);
        }
      }
    };
  }
});

// src/utils/imageCompressor.js
async function compressImage(dataUrl, { maxWidth = MAX_DIMENSION, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const originalSize = Math.ceil(dataUrl.length * 0.75);
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          const ratio = maxWidth / w;
          w = maxWidth;
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const hasAlpha = detectAlpha(ctx, w, h);
        const mimeType = hasAlpha ? "image/png" : "image/jpeg";
        if (mimeType === "image/jpeg") {
          let currentQuality = quality;
          let result = canvas.toDataURL(mimeType, currentQuality);
          let resultSize = Math.ceil(result.length * 0.75);
          while (resultSize > TARGET_SIZE_BYTES && currentQuality > MIN_QUALITY) {
            currentQuality -= 0.1;
            result = canvas.toDataURL(mimeType, currentQuality);
            resultSize = Math.ceil(result.length * 0.75);
          }
          canvas.toBlob((blob) => {
            resolve({
              dataUrl: result,
              blob,
              width: w,
              height: h,
              originalSize,
              compressedSize: blob.size
            });
          }, mimeType, currentQuality);
        } else {
          const result = canvas.toDataURL(mimeType);
          canvas.toBlob((blob) => {
            resolve({
              dataUrl: result,
              blob,
              width: w,
              height: h,
              originalSize,
              compressedSize: blob.size
            });
          }, mimeType);
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = dataUrl;
  });
}
function detectAlpha(ctx, w, h) {
  const points2 = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), Math.floor(h / 2)]
  ];
  for (const [x, y] of points2) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] < 255) return true;
  }
  const topRow = ctx.getImageData(0, 0, w, 1).data;
  for (let i = 3; i < topRow.length; i += 16) {
    if (topRow[i] < 255) return true;
  }
  return false;
}
var MAX_DIMENSION, TARGET_SIZE_BYTES, MIN_QUALITY;
var init_imageCompressor = __esm({
  "src/utils/imageCompressor.js"() {
    MAX_DIMENSION = 1920;
    TARGET_SIZE_BYTES = 300 * 1024;
    MIN_QUALITY = 0.4;
  }
});

// src/utils/allowedImageTypes.js
function isAllowedImage(file) {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  if (type && ALLOWED_IMAGE_MIME_TYPES.includes(type)) return true;
  const name = (file.name || "").toLowerCase();
  if (!name) return false;
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}
function isAllowedImageDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") return false;
  const m = dataUrl.match(/^data:([^;]+);/i);
  if (!m) return false;
  return ALLOWED_IMAGE_MIME_TYPES.includes(m[1].toLowerCase());
}
var ALLOWED_IMAGE_MIME_TYPES, ALLOWED_IMAGE_EXTENSIONS, IMAGE_ACCEPT_ATTR;
var init_allowedImageTypes = __esm({
  "src/utils/allowedImageTypes.js"() {
    ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
      "image/avif",
      "image/jpeg",
      "image/png",
      "image/bmp",
      "image/svg+xml",
      "image/webp"
    ]);
    ALLOWED_IMAGE_EXTENSIONS = Object.freeze([
      ".avif",
      ".jpeg",
      ".jpg",
      ".png",
      ".bmp",
      ".svg",
      ".webp"
    ]);
    IMAGE_ACCEPT_ATTR = ALLOWED_IMAGE_MIME_TYPES.join(",");
  }
});

// src/tools/imageTool.js
var imageTool_exports = {};
__export(imageTool_exports, {
  handleMouseDownImage: () => handleMouseDownImage,
  handleMouseMoveImage: () => handleMouseMoveImage,
  handleMouseUpImage: () => handleMouseUpImage
});
function wrapImageElement(element) {
  const imageShape = new ImageShape(element);
  return imageShape;
}
async function uploadImageToCloudinary(imageShape) {
  const workerUrl = window.__WORKER_URL;
  const sessionId = window.__sessionID;
  if (!workerUrl || !sessionId) return;
  const href = imageShape.element.getAttribute("href") || "";
  if (!href.startsWith("data:")) return;
  imageShape.uploadStatus = "uploading";
  imageShape.uploadAbortController = new AbortController();
  const signal = imageShape.uploadAbortController.signal;
  imageShape.showUploadIndicator();
  try {
    const compressed = await compressImage(href);
    if (signal.aborted) return;
    const signRes = await fetch(`${workerUrl}/api/images/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        filename: `img_${Date.now()}`
      }),
      signal
    });
    if (!signRes.ok) throw new Error("Failed to get upload signature");
    const signData = await signRes.json();
    if (signal.aborted) return;
    const formData = new FormData();
    formData.append("file", compressed.blob);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);
    formData.append("public_id", signData.publicId);
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      { method: "POST", body: formData, signal }
    );
    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
    const uploadData = await uploadRes.json();
    if (signal.aborted) return;
    const cloudUrl = uploadData.secure_url || uploadData.url;
    imageShape.element.setAttribute("href", cloudUrl);
    imageShape.element.setAttribute("data-href", cloudUrl);
    imageShape.element.setAttribute("data-cloudinary-id", uploadData.public_id);
    const oldSize = imageShape.element.__fileSize || 0;
    const newSize = uploadData.bytes || compressed.compressedSize;
    imageShape.element.__fileSize = newSize;
    window.__roomImageBytesUsed = Math.max(0, (window.__roomImageBytesUsed || 0) - oldSize + newSize);
    imageShape.uploadStatus = "done";
    console.log(`[ImageUpload] Uploaded to Cloudinary: ${cloudUrl} (${(newSize / 1024).toFixed(1)}KB)`);
  } catch (err) {
    if (signal.aborted) {
      console.log("[ImageUpload] Upload aborted (image deleted)");
      return;
    }
    console.warn("[ImageUpload] Upload failed:", err);
    imageShape.uploadStatus = "failed";
  } finally {
    imageShape.removeUploadIndicator();
    imageShape.uploadAbortController = null;
  }
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
function getSVGCoordsFromMouse7(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function getImageAspectRatio(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.height / img.width);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image for aspect ratio calculation."));
    };
    img.src = dataUrl;
  });
}
function selectImage2(event) {
  if (!isSelectionToolActive) return;
  event.stopPropagation();
  if (selectedImage) {
    removeSelectionOutline();
  }
  selectedImage = event.target;
  const transform = selectedImage.getAttribute("transform");
  if (transform) {
    const rotateMatch = transform.match(/rotate\(([^,]+)/);
    if (rotateMatch) {
      imageRotation = parseFloat(rotateMatch[1]);
    }
  } else {
    imageRotation = 0;
  }
  addSelectionOutline();
  originalX = parseFloat(selectedImage.getAttribute("x"));
  originalY = parseFloat(selectedImage.getAttribute("y"));
  originalWidth = parseFloat(selectedImage.getAttribute("width"));
  originalHeight = parseFloat(selectedImage.getAttribute("height"));
  selectedImage.addEventListener("pointerdown", startDrag2);
  selectedImage.addEventListener("pointerup", stopDrag);
  selectedImage.addEventListener("pointerleave", stopDrag);
  const imageShape = typeof shapes !== "undefined" && Array.isArray(shapes) ? shapes.find((s) => s.shapeName === "image" && s.element === selectedImage) : null;
  if (imageShape) {
    window.currentShape = imageShape;
  }
  if (typeof window.__showSidebarForShape === "function") {
    window.__showSidebarForShape("image");
  }
}
function addSelectionOutline() {
  if (!selectedImage) return;
  const x = parseFloat(selectedImage.getAttribute("x"));
  const y = parseFloat(selectedImage.getAttribute("y"));
  const width = parseFloat(selectedImage.getAttribute("width"));
  const height = parseFloat(selectedImage.getAttribute("height"));
  const selectionPadding = 8;
  const expandedX = x - selectionPadding;
  const expandedY = y - selectionPadding;
  const expandedWidth = width + 2 * selectionPadding;
  const expandedHeight = height + 2 * selectionPadding;
  const outlinePoints = [
    [expandedX, expandedY],
    [expandedX + expandedWidth, expandedY],
    [expandedX + expandedWidth, expandedY + expandedHeight],
    [expandedX, expandedY + expandedHeight],
    [expandedX, expandedY]
  ];
  const pointsAttr = outlinePoints.map((p) => p.join(",")).join(" ");
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  outline.setAttribute("points", pointsAttr);
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "#5B57D1");
  outline.setAttribute("stroke-width", 1.5);
  outline.setAttribute("stroke-dasharray", "4 2");
  outline.setAttribute("style", "pointer-events: none;");
  outline.setAttribute("class", "selection-outline");
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  outline.setAttribute("transform", `rotate(${imageRotation}, ${centerX}, ${centerY})`);
  svg.appendChild(outline);
  addResizeAnchors(expandedX, expandedY, expandedWidth, expandedHeight, centerX, centerY);
  addRotationAnchor(expandedX, expandedY, expandedWidth, expandedHeight, centerX, centerY);
}
function removeSelectionOutline() {
  svg.querySelectorAll(".selection-outline").forEach((el) => el.remove());
  removeResizeAnchors();
  removeRotationAnchor();
  if (selectedImage) {
    selectedImage.removeEventListener("pointerdown", startDrag2);
    selectedImage.removeEventListener("pointerup", stopDrag);
    selectedImage.removeEventListener("pointerleave", stopDrag);
  }
}
function addResizeAnchors(x, y, width, height, centerX, centerY) {
  const zoom = window.currentZoom || 1;
  const anchorSize = 10 / zoom;
  const anchorStrokeWidth = 2;
  const positions = [
    { x, y },
    // Top-left
    { x: x + width, y },
    // Top-right
    { x, y: y + height },
    // Bottom-left
    { x: x + width, y: y + height }
    // Bottom-right
  ];
  positions.forEach((pos, i) => {
    const anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    anchor.setAttribute("x", pos.x - anchorSize / 2);
    anchor.setAttribute("y", pos.y - anchorSize / 2);
    anchor.setAttribute("width", anchorSize);
    anchor.setAttribute("height", anchorSize);
    anchor.setAttribute("fill", "#121212");
    anchor.setAttribute("stroke", "#5B57D1");
    anchor.setAttribute("stroke-width", anchorStrokeWidth);
    anchor.setAttribute("class", "resize-anchor");
    anchor.style.cursor = ["nw-resize", "ne-resize", "sw-resize", "se-resize"][i];
    anchor.setAttribute("transform", `rotate(${imageRotation}, ${centerX}, ${centerY})`);
    svg.appendChild(anchor);
    anchor.addEventListener("pointerdown", startResize2);
    anchor.addEventListener("pointerup", stopResize);
  });
}
function addRotationAnchor(x, y, width, height, centerX, centerY) {
  const anchorStrokeWidth = 2;
  const rotationAnchorPos = { x: x + width / 2, y: y - 30 };
  const rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
  rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
  rotationAnchor.setAttribute("r", 8);
  rotationAnchor.setAttribute("class", "rotation-anchor");
  rotationAnchor.setAttribute("fill", "#121212");
  rotationAnchor.setAttribute("stroke", "#5B57D1");
  rotationAnchor.setAttribute("stroke-width", anchorStrokeWidth);
  rotationAnchor.setAttribute("style", "pointer-events: all;");
  rotationAnchor.setAttribute("transform", `rotate(${imageRotation}, ${centerX}, ${centerY})`);
  svg.appendChild(rotationAnchor);
  rotationAnchor.addEventListener("pointerdown", startRotation2);
  rotationAnchor.addEventListener("pointerup", stopRotation);
  rotationAnchor.addEventListener("mouseover", function() {
    if (!isRotatingImage && !isDragging7) {
      rotationAnchor.style.cursor = "grab";
    }
  });
  rotationAnchor.addEventListener("mouseout", function() {
    if (!isRotatingImage && !isDragging7) {
      rotationAnchor.style.cursor = "default";
    }
  });
}
function removeRotationAnchor() {
  svg.querySelectorAll(".rotation-anchor").forEach((el) => el.remove());
}
function removeResizeAnchors() {
  const anchors = svg.querySelectorAll(".resize-anchor");
  anchors.forEach((anchor) => svg.removeChild(anchor));
}
function startResize2(event) {
  event.preventDefault();
  event.stopPropagation();
  currentAnchor = event.target;
  originalX = parseFloat(selectedImage.getAttribute("x"));
  originalY = parseFloat(selectedImage.getAttribute("y"));
  originalWidth = parseFloat(selectedImage.getAttribute("width"));
  originalHeight = parseFloat(selectedImage.getAttribute("height"));
  const transform = selectedImage.getAttribute("transform");
  if (transform) {
    const rotateMatch = transform.match(/rotate\(([^,]+)/);
    if (rotateMatch) {
      imageRotation = parseFloat(rotateMatch[1]);
    }
  }
  svg.addEventListener("pointermove", resizeImage);
  document.addEventListener("pointerup", stopResize);
}
function stopResize(event) {
  stopInteracting();
  document.removeEventListener("pointerup", stopResize);
}
function resizeImage(event) {
  if (!selectedImage || !currentAnchor) return;
  const { x: globalX, y: globalY } = getSVGCoordsFromMouse7(event);
  const centerX = originalX + originalWidth / 2;
  const centerY = originalY + originalHeight / 2;
  let localX = globalX;
  let localY = globalY;
  if (imageRotation !== 0) {
    const rotationRad = imageRotation * Math.PI / 180;
    const translatedX = globalX - centerX;
    const translatedY = globalY - centerY;
    localX = translatedX * Math.cos(-rotationRad) - translatedY * Math.sin(-rotationRad) + centerX;
    localY = translatedX * Math.sin(-rotationRad) + translatedY * Math.cos(-rotationRad) + centerY;
  }
  let dx = localX - originalX;
  let dy = localY - originalY;
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  let newX = originalX;
  let newY = originalY;
  const aspectRatio = originalHeight / originalWidth;
  let fixedRelX, fixedRelY;
  switch (currentAnchor.style.cursor) {
    case "nw-resize":
      newWidth = originalWidth - dx;
      newHeight = originalHeight - dy;
      if (aspect_ratio_lock) {
        newHeight = newWidth * aspectRatio;
        dy = originalHeight - newHeight;
      }
      newX = originalX + (originalWidth - newWidth);
      newY = originalY + (originalHeight - newHeight);
      fixedRelX = originalWidth;
      fixedRelY = originalHeight;
      break;
    case "ne-resize":
      newWidth = dx;
      newHeight = originalHeight - dy;
      if (aspect_ratio_lock) {
        newHeight = newWidth * aspectRatio;
        dy = originalHeight - newHeight;
      }
      newX = originalX;
      newY = originalY + (originalHeight - newHeight);
      fixedRelX = 0;
      fixedRelY = originalHeight;
      break;
    case "sw-resize":
      newWidth = originalWidth - dx;
      newHeight = dy;
      if (aspect_ratio_lock) {
        newHeight = newWidth * aspectRatio;
        dy = newHeight;
      }
      newX = originalX + (originalWidth - newWidth);
      newY = originalY;
      fixedRelX = originalWidth;
      fixedRelY = 0;
      break;
    case "se-resize":
      newWidth = dx;
      newHeight = dy;
      if (aspect_ratio_lock) {
        newHeight = newWidth * aspectRatio;
      }
      newX = originalX;
      newY = originalY;
      fixedRelX = 0;
      fixedRelY = 0;
      break;
  }
  newWidth = Math.max(minImageSize, newWidth);
  newHeight = Math.max(minImageSize, newHeight);
  if (imageRotation !== 0) {
    const rad = imageRotation * Math.PI / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);
    const oldCX = originalX + originalWidth / 2;
    const oldCY = originalY + originalHeight / 2;
    const odx = originalX + fixedRelX - oldCX;
    const ody = originalY + fixedRelY - oldCY;
    const fixedWorldX = oldCX + odx * cosR - ody * sinR;
    const fixedWorldY = oldCY + odx * sinR + ody * cosR;
    const fixedNewRelX = fixedRelX === 0 ? 0 : newWidth;
    const fixedNewRelY = fixedRelY === 0 ? 0 : newHeight;
    const ncx = newWidth / 2;
    const ncy = newHeight / 2;
    const ndx = fixedNewRelX - ncx;
    const ndy = fixedNewRelY - ncy;
    const rotX = ncx + ndx * cosR - ndy * sinR;
    const rotY = ncy + ndx * sinR + ndy * cosR;
    newX = fixedWorldX - rotX;
    newY = fixedWorldY - rotY;
  }
  selectedImage.setAttribute("width", newWidth);
  selectedImage.setAttribute("height", newHeight);
  selectedImage.setAttribute("x", newX);
  selectedImage.setAttribute("y", newY);
  selectedImage.setAttribute("data-shape-x", newX);
  selectedImage.setAttribute("data-shape-y", newY);
  selectedImage.setAttribute("data-shape-width", newWidth);
  selectedImage.setAttribute("data-shape-height", newHeight);
  const newCenterX = newX + newWidth / 2;
  const newCenterY = newY + newHeight / 2;
  selectedImage.setAttribute("transform", `rotate(${imageRotation}, ${newCenterX}, ${newCenterY})`);
  updateAttachedArrows(selectedImage);
  removeSelectionOutline();
  addSelectionOutline();
}
function stopRotation(event) {
  if (!isRotatingImage) return;
  stopInteracting();
  isRotatingImage = false;
  startRotationMouseAngle = null;
  startImageRotation = null;
  svg.removeEventListener("pointermove", rotateImage);
  document.removeEventListener("pointerup", stopRotation);
  svg.style.cursor = "default";
}
function startDrag2(event) {
  if (!isSelectionToolActive || !selectedImage) return;
  event.preventDefault();
  event.stopPropagation();
  isDragging7 = true;
  originalX = parseFloat(selectedImage.getAttribute("x"));
  originalY = parseFloat(selectedImage.getAttribute("y"));
  originalWidth = parseFloat(selectedImage.getAttribute("width"));
  originalHeight = parseFloat(selectedImage.getAttribute("height"));
  const transform = selectedImage.getAttribute("transform");
  if (transform) {
    const rotateMatch = transform.match(/rotate\(([^,]+)/);
    if (rotateMatch) {
      imageRotation = parseFloat(rotateMatch[1]);
    }
  }
  let imageShape = null;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    imageShape = shapes.find((shape) => shape.shapeName === "image" && shape.element === selectedImage);
  }
  if (imageShape) {
    draggedShapeInitialFrameImage = imageShape.parentFrame || null;
    if (imageShape.parentFrame) {
      imageShape.parentFrame.temporarilyRemoveFromFrame(imageShape);
    }
  }
  const { x, y } = getSVGCoordsFromMouse7(event);
  dragOffsetX2 = x - parseFloat(selectedImage.getAttribute("x"));
  dragOffsetY2 = y - parseFloat(selectedImage.getAttribute("y"));
  svg.addEventListener("pointermove", dragImage);
  document.addEventListener("pointerup", stopDrag);
}
function dragImage(event) {
  if (!isDragging7 || !selectedImage) return;
  const { x, y } = getSVGCoordsFromMouse7(event);
  let newX = x - dragOffsetX2;
  let newY = y - dragOffsetY2;
  selectedImage.setAttribute("x", newX);
  selectedImage.setAttribute("y", newY);
  selectedImage.setAttribute("data-shape-x", newX);
  selectedImage.setAttribute("data-shape-y", newY);
  const newCenterX = newX + parseFloat(selectedImage.getAttribute("width")) / 2;
  const newCenterY = newY + parseFloat(selectedImage.getAttribute("height")) / 2;
  selectedImage.setAttribute("transform", `rotate(${imageRotation}, ${newCenterX}, ${newCenterY})`);
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    const imageShape = shapes.find((shape) => shape.shapeName === "image" && shape.element === selectedImage);
    if (imageShape) {
      imageShape.updateFrameContainment();
    }
  }
  updateAttachedArrows(selectedImage);
  removeSelectionOutline();
  addSelectionOutline();
}
function stopDrag(event) {
  stopInteracting();
  document.removeEventListener("pointerup", stopDrag);
}
function startRotation2(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!selectedImage) return;
  isRotatingImage = true;
  const imgX = parseFloat(selectedImage.getAttribute("x"));
  const imgY = parseFloat(selectedImage.getAttribute("y"));
  const imgWidth = parseFloat(selectedImage.getAttribute("width"));
  const imgHeight = parseFloat(selectedImage.getAttribute("height"));
  const centerX = imgX + imgWidth / 2;
  const centerY = imgY + imgHeight / 2;
  const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse7(event);
  startRotationMouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
  startImageRotation = imageRotation;
  svg.addEventListener("pointermove", rotateImage);
  document.addEventListener("pointerup", stopRotation);
  svg.style.cursor = "grabbing";
}
function rotateImage(event) {
  if (!isRotatingImage || !selectedImage) return;
  const imgX = parseFloat(selectedImage.getAttribute("x"));
  const imgY = parseFloat(selectedImage.getAttribute("y"));
  const imgWidth = parseFloat(selectedImage.getAttribute("width"));
  const imgHeight = parseFloat(selectedImage.getAttribute("height"));
  const centerX = imgX + imgWidth / 2;
  const centerY = imgY + imgHeight / 2;
  const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse7(event);
  const currentMouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
  const angleDiff = currentMouseAngle - startRotationMouseAngle;
  imageRotation = startImageRotation + angleDiff;
  imageRotation = imageRotation % 360;
  if (imageRotation < 0) imageRotation += 360;
  selectedImage.setAttribute("transform", `rotate(${imageRotation}, ${centerX}, ${centerY})`);
  selectedImage.setAttribute("data-shape-rotation", imageRotation);
  updateAttachedArrows(selectedImage);
  removeSelectionOutline();
  addSelectionOutline();
}
function stopInteracting() {
  if (selectedImage && (isDragging7 || isRotatingImage || currentAnchor)) {
    const newPos = {
      x: parseFloat(selectedImage.getAttribute("x")),
      y: parseFloat(selectedImage.getAttribute("y")),
      width: parseFloat(selectedImage.getAttribute("width")),
      height: parseFloat(selectedImage.getAttribute("height")),
      rotation: imageRotation
    };
    let originalRotation = imageRotation;
    if (isRotatingImage && startImageRotation !== null) {
      originalRotation = startImageRotation;
    }
    const oldPos = {
      x: originalX,
      y: originalY,
      width: originalWidth,
      height: originalHeight,
      rotation: originalRotation
    };
    let imageShape = null;
    if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
      imageShape = shapes.find((shape) => shape.shapeName === "image" && shape.element === selectedImage);
    }
    const oldPosWithFrame = {
      ...oldPos,
      parentFrame: draggedShapeInitialFrameImage
    };
    const newPosWithFrame = {
      ...newPos,
      parentFrame: imageShape ? imageShape.parentFrame : null
    };
    const stateChanged = newPos.x !== oldPos.x || newPos.y !== oldPos.y || newPos.width !== oldPos.width || newPos.height !== oldPos.height || newPos.rotation !== oldPos.rotation;
    const frameChanged = oldPosWithFrame.parentFrame !== newPosWithFrame.parentFrame;
    if (stateChanged || frameChanged) {
      pushTransformAction2({
        type: "image",
        element: selectedImage,
        restore: (pos) => {
          selectedImage.setAttribute("x", pos.x);
          selectedImage.setAttribute("y", pos.y);
          selectedImage.setAttribute("width", pos.width);
          selectedImage.setAttribute("height", pos.height);
          const centerX = pos.x + pos.width / 2;
          const centerY = pos.y + pos.height / 2;
          selectedImage.setAttribute("transform", `rotate(${pos.rotation}, ${centerX}, ${centerY})`);
          imageRotation = pos.rotation;
          if (selectedImage) {
            removeSelectionOutline();
            addSelectionOutline();
          }
          selectedImage.setAttribute("data-shape-x", pos.x);
          selectedImage.setAttribute("data-shape-y", pos.y);
          selectedImage.setAttribute("data-shape-width", pos.width);
          selectedImage.setAttribute("data-shape-height", pos.height);
          selectedImage.setAttribute("data-shape-rotation", pos.rotation);
          updateAttachedArrows(selectedImage);
        }
      }, oldPosWithFrame, newPosWithFrame);
    }
    if (isDragging7 && imageShape) {
      const finalFrame = hoveredFrameImage2;
      if (draggedShapeInitialFrameImage !== finalFrame) {
        if (draggedShapeInitialFrameImage) {
          draggedShapeInitialFrameImage.removeShapeFromFrame(imageShape);
        }
        if (finalFrame) {
          finalFrame.addShapeToFrame(imageShape);
        }
        if (frameChanged) {
          pushFrameAttachmentAction(
            finalFrame || draggedShapeInitialFrameImage,
            imageShape,
            finalFrame ? "attach" : "detach",
            draggedShapeInitialFrameImage
          );
        }
      } else if (draggedShapeInitialFrameImage) {
        draggedShapeInitialFrameImage.restoreToFrame(imageShape);
      }
    }
    draggedShapeInitialFrameImage = null;
  }
  if (hoveredFrameImage2) {
    hoveredFrameImage2.removeHighlight();
    hoveredFrameImage2 = null;
  }
  isDragging7 = false;
  isRotatingImage = false;
  svg.removeEventListener("pointermove", dragImage);
  svg.removeEventListener("pointermove", resizeImage);
  svg.removeEventListener("pointermove", rotateImage);
  currentAnchor = null;
  startRotationMouseAngle = null;
  startImageRotation = null;
  if (selectedImage) {
    originalX = parseFloat(selectedImage.getAttribute("x"));
    originalY = parseFloat(selectedImage.getAttribute("y"));
    originalWidth = parseFloat(selectedImage.getAttribute("width"));
    originalHeight = parseFloat(selectedImage.getAttribute("height"));
    const transform = selectedImage.getAttribute("transform");
    if (transform) {
      const rotateMatch = transform.match(/rotate\(([^,]+)/);
      if (rotateMatch) {
        imageRotation = parseFloat(rotateMatch[1]);
      }
    }
    selectedImage.setAttribute("data-shape-x", originalX);
    selectedImage.setAttribute("data-shape-y", originalY);
    selectedImage.setAttribute("data-shape-width", originalWidth);
    selectedImage.setAttribute("data-shape-height", originalHeight);
    selectedImage.setAttribute("data-shape-rotation", imageRotation);
    updateAttachedArrows(selectedImage);
  }
}
function deleteCurrentImage() {
  if (selectedImage) {
    let imageShape = typeof shapes !== "undefined" && Array.isArray(shapes) ? shapes.find((s) => s.shapeName === "image" && s.element === selectedImage) : null;
    if (imageShape?.uploadAbortController) {
      imageShape.uploadAbortController.abort();
      imageShape.removeUploadIndicator();
    }
    const freedBytes = selectedImage.__fileSize || 0;
    window.__roomImageBytesUsed = Math.max(0, (window.__roomImageBytesUsed || 0) - freedBytes);
    const imgHref = selectedImage.getAttribute("href") || selectedImage.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
    if (imgHref.includes("cloudinary.com") || imgHref.includes("res.cloudinary")) {
      const match = imgHref.match(/\/upload\/(?:v\d+\/)?(lixsketch\/.+?)(?:\.\w+)?$/);
      if (match) {
        const publicId = match[1];
        const workerUrl = window.__WORKER_URL;
        if (workerUrl) {
          fetch(`${workerUrl}/api/images/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId })
          }).catch((err) => console.warn("[ImageTool] Cloudinary cleanup failed:", err));
        }
      }
    }
    if (imageShape) {
      const idx = shapes.indexOf(imageShape);
      if (idx !== -1) shapes.splice(idx, 1);
      if (imageShape.group && imageShape.group.parentNode) {
        imageShape.group.parentNode.removeChild(imageShape.group);
      }
    }
    if (!imageShape && selectedImage.parentNode) {
      selectedImage.parentNode.removeChild(selectedImage);
    }
    if (typeof cleanupAttachments2 === "function") {
      cleanupAttachments2(selectedImage);
    }
    if (imageShape) {
      pushDeleteAction(imageShape);
    }
    removeSelectionOutline();
    selectedImage = null;
  }
}
var isDraggingImage, imageToPlace, imageX, imageY, currentImageElement, selectedImage, originalX, originalY, originalWidth, originalHeight, currentAnchor, isDragging7, isRotatingImage, dragOffsetX2, dragOffsetY2, startRotationMouseAngle, startImageRotation, imageRotation, aspect_ratio_lock, minImageSize, draggedShapeInitialFrameImage, hoveredFrameImage2, ROOM_IMAGE_LIMIT_BYTES, handleImageUpload, handleMouseMoveImage, drawMiniatureImage, handleMouseDownImage, handleMouseUpImage;
var init_imageTool = __esm({
  "src/tools/imageTool.js"() {
    init_UndoRedo();
    init_arrowTool();
    init_imageCompressor();
    init_allowedImageTypes();
    isDraggingImage = false;
    imageToPlace = null;
    imageX = 0;
    imageY = 0;
    currentImageElement = null;
    selectedImage = null;
    currentAnchor = null;
    isDragging7 = false;
    isRotatingImage = false;
    startRotationMouseAngle = null;
    startImageRotation = null;
    imageRotation = 0;
    aspect_ratio_lock = true;
    minImageSize = 20;
    draggedShapeInitialFrameImage = null;
    hoveredFrameImage2 = null;
    ROOM_IMAGE_LIMIT_BYTES = 5 * 1024 * 1024;
    if (!window.__roomImageBytesUsed) window.__roomImageBytesUsed = 0;
    document.getElementById("importImage")?.addEventListener("click", () => {
      console.log("Import image clicked");
      isImageToolActive = true;
      console.log("isImageToolActive set to:", isImageToolActive);
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = IMAGE_ACCEPT_ATTR;
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      let fileSelected = false;
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          fileSelected = true;
          handleImageUpload(file);
        }
        document.body.removeChild(fileInput);
      });
      const onFocus = () => {
        window.removeEventListener("focus", onFocus);
        setTimeout(() => {
          if (!fileSelected) {
            isImageToolActive = false;
            if (window.__sketchEngine?.setActiveTool) {
              window.__sketchEngine.setActiveTool("select");
            }
            if (fileInput.parentNode) {
              document.body.removeChild(fileInput);
            }
          }
        }, 300);
      };
      window.addEventListener("focus", onFocus);
      fileInput.click();
    });
    handleImageUpload = async (file) => {
      if (!file || !isImageToolActive) return;
      if (!isAllowedImage(file)) {
        console.error("Rejected file type:", file.type, file.name);
        alert("Unsupported file type. Allowed: AVIF, JPEG, PNG, BMP, SVG, WebP.");
        isImageToolActive = false;
        return;
      }
      if (window.__roomImageBytesUsed + file.size > ROOM_IMAGE_LIMIT_BYTES) {
        const usedMB = (window.__roomImageBytesUsed / (1024 * 1024)).toFixed(2);
        const fileMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`Room image limit reached (5 MB). Used: ${usedMB} MB, this file: ${fileMB} MB. Delete some images to free space.`);
        isImageToolActive = false;
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error("File size too large");
        alert("Image file is too large. Please select an image smaller than 5 MB.");
        return;
      }
      console.log("Processing image file:", file.name, "Size:", file.size, "Type:", file.type);
      try {
        const rawDataUrl = await readFileAsDataUrl(file);
        const isSvg = (file.type || "").toLowerCase() === "image/svg+xml" || (file.name || "").toLowerCase().endsWith(".svg");
        let placedDataUrl = rawDataUrl;
        let placedSize = file.size;
        if (!isSvg) {
          try {
            const compressed = await compressImage(rawDataUrl);
            if (compressed?.dataUrl) {
              placedDataUrl = compressed.dataUrl;
              placedSize = compressed.compressedSize || placedSize;
            }
          } catch (err) {
            console.warn("[ImageTool] Pre-placement compression failed, using raw:", err);
          }
        }
        window.__pendingImageFileSize = placedSize;
        imageToPlace = placedDataUrl;
        isDraggingImage = true;
        console.log("Image loaded and ready to place", { size: placedSize, isSvg });
      } catch (err) {
        console.error("Error reading file:", err);
        alert("Error reading the image file. Please try again.");
        isImageToolActive = false;
      }
    };
    handleMouseMoveImage = (e) => {
      if (!isDraggingImage || !imageToPlace || !isImageToolActive) return;
      const { x, y } = getSVGCoordsFromMouse7(e);
      imageX = x;
      imageY = y;
      drawMiniatureImage();
      if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
        shapes.forEach((frame) => {
          if (frame.shapeName === "frame") {
            const tempImageBounds = {
              x: imageX - 50,
              // Half of miniature width
              y: imageY - 50,
              // Approximate half height
              width: 100,
              height: 100
            };
            if (frame.isShapeInFrame(tempImageBounds)) {
              frame.highlightFrame();
              hoveredFrameImage2 = frame;
            } else if (hoveredFrameImage2 === frame) {
              frame.removeHighlight();
              hoveredFrameImage2 = null;
            }
          }
        });
      }
    };
    drawMiniatureImage = () => {
      if (!isDraggingImage || !imageToPlace || !isImageToolActive) return;
      const miniatureWidth = 100;
      getImageAspectRatio(imageToPlace).then((aspectRatio) => {
        const miniatureHeight = miniatureWidth * aspectRatio;
        if (currentImageElement) {
          svg.removeChild(currentImageElement);
          currentImageElement = null;
        }
        currentImageElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
        currentImageElement.setAttribute("href", imageToPlace);
        currentImageElement.setAttribute("x", imageX - miniatureWidth / 2);
        currentImageElement.setAttribute("y", imageY - miniatureHeight / 2);
        currentImageElement.setAttribute("width", miniatureWidth);
        currentImageElement.setAttribute("height", miniatureHeight);
        currentImageElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.appendChild(currentImageElement);
      }).catch((error) => {
        console.error("Error getting aspect ratio:", error);
      });
    };
    handleMouseDownImage = async (e) => {
      if (!isDraggingImage || !imageToPlace || !isImageToolActive) {
        if (isSelectionToolActive) {
          const clickedImage = e.target.closest("image");
          if (clickedImage) {
            selectImage2({ target: clickedImage, stopPropagation: () => e.stopPropagation() });
            return;
          }
        }
        return;
      }
      try {
        let aspectRatio = await getImageAspectRatio(imageToPlace);
        if (currentImageElement) {
          svg.removeChild(currentImageElement);
          currentImageElement = null;
        }
        const placedImageWidth = 200;
        const placedImageHeight = placedImageWidth * aspectRatio;
        const { x: placedX, y: placedY } = getSVGCoordsFromMouse7(e);
        const finalImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        finalImage.setAttribute("href", imageToPlace);
        finalImage.setAttribute("x", placedX - placedImageWidth / 2);
        finalImage.setAttribute("y", placedY - placedImageHeight / 2);
        finalImage.setAttribute("width", placedImageWidth);
        finalImage.setAttribute("height", placedImageHeight);
        finalImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
        finalImage.setAttribute("data-href", imageToPlace);
        finalImage.setAttribute("data-x", placedX - placedImageWidth / 2);
        finalImage.setAttribute("data-y", placedY - placedImageHeight / 2);
        finalImage.setAttribute("data-width", placedImageWidth);
        finalImage.setAttribute("data-height", placedImageHeight);
        finalImage.setAttribute("type", "image");
        finalImage.setAttribute("data-shape-x", placedX - placedImageWidth / 2);
        finalImage.setAttribute("data-shape-y", placedY - placedImageHeight / 2);
        finalImage.setAttribute("data-shape-width", placedImageWidth);
        finalImage.setAttribute("data-shape-height", placedImageHeight);
        finalImage.setAttribute("data-shape-rotation", 0);
        finalImage.shapeID = `image-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        const imageShape = wrapImageElement(finalImage);
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          shapes.push(imageShape);
          console.log("Image added to shapes array for arrow attachment and frame functionality");
        } else {
          console.warn("shapes array not found - arrows and frames may not work with images");
        }
        const finalFrame = hoveredFrameImage2;
        if (finalFrame) {
          finalFrame.addShapeToFrame(imageShape);
          pushFrameAttachmentAction(finalFrame, imageShape, "attach", null);
        }
        pushCreateAction({
          type: "image",
          element: imageShape,
          remove: () => {
            if (imageShape.group && imageShape.group.parentNode) {
              imageShape.group.parentNode.removeChild(imageShape.group);
            }
            if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
              const idx = shapes.indexOf(imageShape);
              if (idx !== -1) shapes.splice(idx, 1);
            }
            if (typeof cleanupAttachments2 === "function") {
              cleanupAttachments2(finalImage);
            }
          },
          restore: () => {
            svg.appendChild(imageShape.group);
            if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
              if (shapes.indexOf(imageShape) === -1) {
                shapes.push(imageShape);
              }
            }
          }
        });
        const placedFileSize = window.__pendingImageFileSize || 0;
        finalImage.__fileSize = placedFileSize;
        window.__roomImageBytesUsed = (window.__roomImageBytesUsed || 0) + placedFileSize;
        window.__pendingImageFileSize = 0;
        finalImage.addEventListener("click", selectImage2);
        if (hoveredFrameImage2) {
          hoveredFrameImage2.removeHighlight();
          hoveredFrameImage2 = null;
        }
        const placedShape = imageShape;
        if (window.__sketchStoreApi) window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
        currentShape = placedShape;
        currentShape.isSelected = true;
        placedShape.selectShape();
        const uploader = typeof window !== "undefined" && window.uploadImageToCloudinary || uploadImageToCloudinary;
        uploader(imageShape).catch((err) => {
          console.warn("[ImageTool] Upload pipeline error:", err);
        });
      } catch (error) {
        console.error("Error placing image:", error);
        isDraggingImage = false;
        imageToPlace = null;
        isImageToolActive = false;
      } finally {
        isDraggingImage = false;
        imageToPlace = null;
        isImageToolActive = false;
      }
    };
    handleMouseUpImage = (e) => {
      if (isSelectionToolActive && selectedImage) {
        const clickedElement = e.target;
        const isOnSVG = clickedElement === svg || clickedElement.ownerSVGElement === svg;
        const isImageElement = clickedElement.tagName === "image";
        const isAnchorElement = clickedElement.classList.contains("resize-anchor") || clickedElement.classList.contains("rotation-anchor") || clickedElement.classList.contains("selection-outline");
        if (isOnSVG && !isImageElement && !isAnchorElement && clickedElement === svg && !isDragging7 && !isRotatingImage && !currentAnchor) {
          removeSelectionOutline();
          selectedImage = null;
          if (window.__sketchStoreApi) {
            window.__sketchStoreApi.clearSelectedShapeSidebar();
          }
        }
      }
      if (hoveredFrameImage2) {
        hoveredFrameImage2.removeHighlight();
        hoveredFrameImage2 = null;
      }
    };
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && selectedImage) {
        deleteCurrentImage();
      }
    });
    window.uploadImageToCloudinary = uploadImageToCloudinary;
    window.openImageFilePicker = function() {
      isImageToolActive = true;
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = IMAGE_ACCEPT_ATTR;
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      let fileSelected = false;
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          fileSelected = true;
          handleImageUpload(file);
        }
        document.body.removeChild(fileInput);
      });
      const onFocus = () => {
        window.removeEventListener("focus", onFocus);
        setTimeout(() => {
          if (!fileSelected) {
            isImageToolActive = false;
            if (window.__sketchEngine?.setActiveTool) {
              window.__sketchEngine.setActiveTool("select");
            }
            if (fileInput.parentNode) {
              document.body.removeChild(fileInput);
            }
          }
        }, 300);
      };
      window.addEventListener("focus", onFocus);
      fileInput.click();
    };
  }
});

// src/tools/iconTool.js
var iconTool_exports = {};
__export(iconTool_exports, {
  handleMouseDownIcon: () => handleMouseDownIcon,
  handleMouseMoveIcon: () => handleMouseMoveIcon,
  handleMouseUpIcon: () => handleMouseUpIcon,
  startDrag: () => startDrag3,
  stopDrag: () => stopDrag2
});
function getSVGElement2() {
  return document.getElementById("freehand-canvas");
}
function removeSelection() {
  const svg3 = getSVGElement2();
  if (!svg3) return;
  svg3.querySelectorAll(".selection-outline").forEach((el) => el.remove());
  removeResizeAnchors2();
  removeRotationAnchor2();
  if (selectedIcon) {
    selectedIcon.removeEventListener("pointerdown", startDrag3);
    selectedIcon.removeEventListener("pointerup", stopDrag2);
    selectedIcon.removeEventListener("pointerleave", stopDrag2);
  }
}
function wrapIconElement(element) {
  const iconShape = new IconShape(element);
  return iconShape;
}
function getSVGCoordsFromMouse8(e) {
  const svg3 = getSVGElement2();
  const viewBox = svg3.viewBox.baseVal;
  const rect = svg3.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function addSelectionOutline2() {
  if (!selectedIcon) return;
  const svg3 = getSVGElement2();
  if (!svg3) return;
  const x = parseFloat(selectedIcon.getAttribute("data-shape-x")) || 0;
  const y = parseFloat(selectedIcon.getAttribute("data-shape-y")) || 0;
  const width = parseFloat(selectedIcon.getAttribute("data-shape-width")) || 40;
  const height = parseFloat(selectedIcon.getAttribute("data-shape-height")) || 40;
  const rotation = parseFloat(selectedIcon.getAttribute("data-shape-rotation")) || 0;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const selectionPadding = Math.max(4, width * 0.08);
  const expandedX = x - selectionPadding;
  const expandedY = y - selectionPadding;
  const expandedWidth = width + 2 * selectionPadding;
  const expandedHeight = height + 2 * selectionPadding;
  removeSelection();
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  outline.setAttribute("x", expandedX);
  outline.setAttribute("y", expandedY);
  outline.setAttribute("width", expandedWidth);
  outline.setAttribute("height", expandedHeight);
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "#5B57D1");
  outline.setAttribute("stroke-width", 1.5);
  outline.setAttribute("stroke-dasharray", "4 3");
  outline.setAttribute("style", "pointer-events: none;");
  outline.setAttribute("class", "selection-outline");
  if (rotation !== 0) {
    outline.setAttribute("transform", `rotate(${rotation}, ${centerX}, ${centerY})`);
  }
  svg3.appendChild(outline);
  addResizeAnchors2(expandedX, expandedY, expandedWidth, expandedHeight, centerX, centerY, width, rotation);
  addRotationAnchor2(expandedX, expandedY, expandedWidth, expandedHeight, centerX, centerY, width, rotation);
}
function cancelDragPrep(event) {
  if (_pendingDragChecker) {
    document.removeEventListener("pointermove", _pendingDragChecker);
    _pendingDragChecker = null;
  }
  document.removeEventListener("pointerup", cancelDragPrep);
  window.removeEventListener("pointerup", cancelDragPrep);
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.removeEventListener("pointerup", cancelDragPrep);
  }
}
function startDrag3(event) {
  console.log("start dragging icon");
  if (!isSelectionToolActive || !selectedIcon) return;
  isDragging8 = true;
  if (window.__iconShapeState) window.__iconShapeState.isDragging = true;
  let iconShape = null;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    iconShape = shapes.find((shape) => shape.shapeName === "icon" && shape.element === selectedIcon);
  }
  if (iconShape) {
    draggedShapeInitialFrameIcon = iconShape.parentFrame || null;
    if (iconShape.parentFrame) {
      iconShape.parentFrame.temporarilyRemoveFromFrame(iconShape);
    }
  }
  document.addEventListener("pointermove", dragIcon);
  document.addEventListener("pointerup", stopDrag2);
  window.addEventListener("pointerup", stopDrag2);
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.addEventListener("pointerup", stopDrag2);
  }
  document.addEventListener("dragstart", preventDefaultDrag);
  document.addEventListener("selectstart", preventDefaultDrag);
}
function preventDefaultDrag(e) {
  e.preventDefault();
  return false;
}
function selectIcon2(event) {
  if (!isSelectionToolActive) return;
  event.stopPropagation();
  let targetIcon = event.target.closest ? event.target.closest('[type="icon"]') : null;
  if (!targetIcon) {
    let current = event.target;
    while (current && current !== document) {
      if (current.getAttribute && current.getAttribute("type") === "icon") {
        targetIcon = current;
        break;
      }
      current = current.parentElement;
    }
  }
  if (selectedIcon) {
    removeSelection();
  }
  selectedIcon = targetIcon;
  if (!selectedIcon) {
    console.warn("Could not find icon to select");
    return;
  }
  const transform = selectedIcon.getAttribute("transform");
  if (transform) {
    const rotateMatch = transform.match(/rotate\(([^,\s]+)/);
    if (rotateMatch) {
      iconRotation = parseFloat(rotateMatch[1]);
    }
  } else {
    iconRotation = 0;
  }
  addSelectionOutline2();
  originalX2 = parseFloat(selectedIcon.getAttribute("x")) || 0;
  originalY2 = parseFloat(selectedIcon.getAttribute("y")) || 0;
  originalWidth2 = parseFloat(selectedIcon.getAttribute("width")) || placedIconSize;
  originalHeight2 = parseFloat(selectedIcon.getAttribute("height")) || placedIconSize;
  const iconShape = typeof shapes !== "undefined" && Array.isArray(shapes) ? shapes.find((s) => s.shapeName === "icon" && s.element === selectedIcon) : null;
  if (iconShape) {
    currentShape = iconShape;
    currentShape.isSelected = true;
    if (window.__showSidebarForShape) window.__showSidebarForShape("icon");
  }
}
function addResizeAnchors2(x, y, width, height, centerX, centerY, iconWidth, rotation) {
  const svg3 = getSVGElement2();
  if (!svg3) return;
  const zoom = window.currentZoom || 1;
  const anchorSize = Math.max(8, Math.min(16, iconWidth * 0.15)) / zoom;
  const anchorStrokeWidth = Math.max(1.5, anchorSize * 0.15);
  const positions = [
    { x, y, cursor: "nw-resize" },
    { x: x + width, y, cursor: "ne-resize" },
    { x, y: y + height, cursor: "sw-resize" },
    { x: x + width, y: y + height, cursor: "se-resize" }
  ];
  positions.forEach((pos) => {
    const anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    anchor.setAttribute("x", pos.x - anchorSize / 2);
    anchor.setAttribute("y", pos.y - anchorSize / 2);
    anchor.setAttribute("width", anchorSize);
    anchor.setAttribute("height", anchorSize);
    anchor.setAttribute("fill", "#121212");
    anchor.setAttribute("stroke", "#5B57D1");
    anchor.setAttribute("stroke-width", anchorStrokeWidth);
    anchor.setAttribute("class", "resize-anchor");
    anchor.setAttribute("transform", `rotate(${rotation}, ${centerX}, ${centerY})`);
    anchor.style.cursor = pos.cursor;
    svg3.appendChild(anchor);
    anchor.addEventListener("pointerdown", startResize3);
    anchor.addEventListener("pointerup", stopResize2);
  });
}
function addRotationAnchor2(x, y, width, height, centerX, centerY, iconWidth, rotation) {
  const svg3 = getSVGElement2();
  if (!svg3) return;
  const anchorRadius = Math.max(6, Math.min(12, iconWidth * 0.12));
  const anchorStrokeWidth = Math.max(1.5, anchorRadius * 0.2);
  const rotationDistance = Math.max(25, iconWidth * 0.4);
  const rotationAnchorX = x + width / 2;
  const rotationAnchorY = y - rotationDistance;
  const rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rotationAnchor.setAttribute("cx", rotationAnchorX);
  rotationAnchor.setAttribute("cy", rotationAnchorY);
  rotationAnchor.setAttribute("r", anchorRadius);
  rotationAnchor.setAttribute("class", "rotation-anchor");
  rotationAnchor.setAttribute("fill", "#121212");
  rotationAnchor.setAttribute("stroke", "#5B57D1");
  rotationAnchor.setAttribute("stroke-width", anchorStrokeWidth);
  rotationAnchor.setAttribute("style", "pointer-events: all; cursor: grab;");
  rotationAnchor.setAttribute("transform", `rotate(${rotation}, ${centerX}, ${centerY})`);
  svg3.appendChild(rotationAnchor);
  rotationAnchor.addEventListener("pointerdown", startRotation3);
  rotationAnchor.addEventListener("pointerup", stopRotation2);
  rotationAnchor.addEventListener("mouseover", function() {
    if (!isRotatingIcon && !isDragging8) {
      rotationAnchor.style.cursor = "grab";
    }
  });
  rotationAnchor.addEventListener("mouseout", function() {
    if (!isRotatingIcon && !isDragging8) {
      rotationAnchor.style.cursor = "default";
    }
  });
}
function removeRotationAnchor2() {
  const svg3 = getSVGElement2();
  if (!svg3) return;
  svg3.querySelectorAll(".rotation-anchor").forEach((el) => el.remove());
}
function removeResizeAnchors2() {
  const svg3 = getSVGElement2();
  if (!svg3) return;
  const anchors = svg3.querySelectorAll(".resize-anchor");
  anchors.forEach((anchor) => svg3.removeChild(anchor));
}
function startResize3(event) {
  event.preventDefault();
  event.stopPropagation();
  currentAnchor2 = event.target;
  originalX2 = parseFloat(selectedIcon.getAttribute("x")) || 0;
  originalY2 = parseFloat(selectedIcon.getAttribute("y")) || 0;
  originalWidth2 = parseFloat(selectedIcon.getAttribute("width")) || 100;
  originalHeight2 = parseFloat(selectedIcon.getAttribute("height")) || 100;
  const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse8(event);
  currentAnchor2.startMouseX = mouseX;
  currentAnchor2.startMouseY = mouseY;
  currentAnchor2.iconRotation = iconRotation;
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.addEventListener("pointermove", resizeIcon);
  }
  document.addEventListener("pointerup", stopResize2);
}
function stopResize2(event) {
  stopInteracting2();
  document.removeEventListener("pointerup", stopResize2);
}
function resizeIcon(event) {
  if (!selectedIcon || !currentAnchor2) return;
  const { x: currentMouseX, y: currentMouseY } = getSVGCoordsFromMouse8(event);
  const rotation = currentAnchor2.iconRotation || 0;
  const rotationRad = rotation * Math.PI / 180;
  const rawDeltaX = currentMouseX - currentAnchor2.startMouseX;
  const rawDeltaY = currentMouseY - currentAnchor2.startMouseY;
  const deltaX = rawDeltaX * Math.cos(-rotationRad) - rawDeltaY * Math.sin(-rotationRad);
  const deltaY = rawDeltaX * Math.sin(-rotationRad) + rawDeltaY * Math.cos(-rotationRad);
  let newWidth = originalWidth2;
  let newHeight = originalHeight2;
  let newX = originalX2;
  let newY = originalY2;
  let fixedRelX, fixedRelY;
  switch (currentAnchor2.style.cursor) {
    case "nw-resize":
      newWidth = Math.max(minIconSize, originalWidth2 - deltaX);
      newHeight = Math.max(minIconSize, originalHeight2 - deltaY);
      if (aspect_ratio_lock2) {
        const scale = Math.min(newWidth / originalWidth2, newHeight / originalHeight2);
        newWidth = originalWidth2 * scale;
        newHeight = originalHeight2 * scale;
      }
      newX = originalX2 + (originalWidth2 - newWidth);
      newY = originalY2 + (originalHeight2 - newHeight);
      fixedRelX = originalWidth2;
      fixedRelY = originalHeight2;
      break;
    case "ne-resize":
      newWidth = Math.max(minIconSize, originalWidth2 + deltaX);
      newHeight = Math.max(minIconSize, originalHeight2 - deltaY);
      if (aspect_ratio_lock2) {
        const scale = Math.max(newWidth / originalWidth2, newHeight / originalHeight2);
        newWidth = originalWidth2 * scale;
        newHeight = originalHeight2 * scale;
      }
      newX = originalX2;
      newY = originalY2 + (originalHeight2 - newHeight);
      fixedRelX = 0;
      fixedRelY = originalHeight2;
      break;
    case "sw-resize":
      newWidth = Math.max(minIconSize, originalWidth2 - deltaX);
      newHeight = Math.max(minIconSize, originalHeight2 + deltaY);
      if (aspect_ratio_lock2) {
        const scale = Math.max(newWidth / originalWidth2, newHeight / originalHeight2);
        newWidth = originalWidth2 * scale;
        newHeight = originalHeight2 * scale;
      }
      newX = originalX2 + (originalWidth2 - newWidth);
      newY = originalY2;
      fixedRelX = originalWidth2;
      fixedRelY = 0;
      break;
    case "se-resize":
      newWidth = Math.max(minIconSize, originalWidth2 + deltaX);
      newHeight = Math.max(minIconSize, originalHeight2 + deltaY);
      if (aspect_ratio_lock2) {
        const scale = Math.max(newWidth / originalWidth2, newHeight / originalHeight2);
        newWidth = originalWidth2 * scale;
        newHeight = originalHeight2 * scale;
      }
      newX = originalX2;
      newY = originalY2;
      fixedRelX = 0;
      fixedRelY = 0;
      break;
  }
  if (rotation !== 0) {
    const cosR = Math.cos(rotationRad);
    const sinR = Math.sin(rotationRad);
    const oldCX = originalX2 + originalWidth2 / 2;
    const oldCY = originalY2 + originalHeight2 / 2;
    const odx = originalX2 + fixedRelX - oldCX;
    const ody = originalY2 + fixedRelY - oldCY;
    const fixedWorldX = oldCX + odx * cosR - ody * sinR;
    const fixedWorldY = oldCY + odx * sinR + ody * cosR;
    const fixedNewRelX = fixedRelX === 0 ? 0 : newWidth;
    const fixedNewRelY = fixedRelY === 0 ? 0 : newHeight;
    const ncx = newWidth / 2;
    const ncy = newHeight / 2;
    const ndx = fixedNewRelX - ncx;
    const ndy = fixedNewRelY - ncy;
    const rotX = ncx + ndx * cosR - ndy * sinR;
    const rotY = ncy + ndx * sinR + ndy * cosR;
    newX = fixedWorldX - rotX;
    newY = fixedWorldY - rotY;
  }
  selectedIcon.setAttribute("width", newWidth);
  selectedIcon.setAttribute("height", newHeight);
  selectedIcon.setAttribute("x", newX);
  selectedIcon.setAttribute("y", newY);
  selectedIcon.setAttribute("data-shape-x", newX);
  selectedIcon.setAttribute("data-shape-y", newY);
  selectedIcon.setAttribute("data-shape-width", newWidth);
  selectedIcon.setAttribute("data-shape-height", newHeight);
  const vbWidth = parseFloat(selectedIcon.getAttribute("data-viewbox-width")) || 24;
  const vbHeight = parseFloat(selectedIcon.getAttribute("data-viewbox-height")) || 24;
  const iconScale = newWidth / Math.max(vbWidth, vbHeight);
  const localCenterX = newWidth / 2 / iconScale;
  const localCenterY = newHeight / 2 / iconScale;
  selectedIcon.setAttribute("transform", `translate(${newX}, ${newY}) scale(${iconScale}) rotate(${iconRotation}, ${localCenterX}, ${localCenterY})`);
  updateAttachedArrows(selectedIcon);
  addSelectionOutline2();
}
function dragIcon(event) {
  if (!isDragging8 || !selectedIcon) return;
  const { x, y } = getSVGCoordsFromMouse8(event);
  let newX = x - dragOffsetX3;
  let newY = y - dragOffsetY3;
  selectedIcon.setAttribute("x", newX);
  selectedIcon.setAttribute("y", newY);
  selectedIcon.setAttribute("data-shape-x", newX);
  selectedIcon.setAttribute("data-shape-y", newY);
  const width = parseFloat(selectedIcon.getAttribute("width")) || 100;
  const height = parseFloat(selectedIcon.getAttribute("height")) || 100;
  const vbWidth = parseFloat(selectedIcon.getAttribute("data-viewbox-width")) || 24;
  const vbHeight = parseFloat(selectedIcon.getAttribute("data-viewbox-height")) || 24;
  const scale = width / Math.max(vbWidth, vbHeight);
  const localCenterX = width / 2 / scale;
  const localCenterY = height / 2 / scale;
  selectedIcon.setAttribute("transform", `translate(${newX}, ${newY}) scale(${scale}) rotate(${iconRotation}, ${localCenterX}, ${localCenterY})`);
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    const iconShape = shapes.find((shape) => shape.shapeName === "icon" && shape.element === selectedIcon);
    if (iconShape) {
      iconShape.x = newX;
      iconShape.y = newY;
      iconShape.updateFrameContainment();
    }
  }
  updateAttachedArrows(selectedIcon);
  removeSelection();
  addSelectionOutline2();
}
function stopDrag2(event) {
  if (!isDragging8) return;
  console.log("stop dragging icon");
  isDragging8 = false;
  if (window.__iconShapeState) window.__iconShapeState.isDragging = false;
  document.removeEventListener("pointermove", dragIcon);
  document.removeEventListener("pointerup", stopDrag2);
  window.removeEventListener("pointerup", stopDrag2);
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.removeEventListener("pointerup", stopDrag2);
  }
  document.removeEventListener("dragstart", preventDefaultDrag);
  document.removeEventListener("selectstart", preventDefaultDrag);
  stopInteracting2();
}
function startRotation3(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!selectedIcon) return;
  isRotatingIcon = true;
  console.log(selectedIcon);
  const iconX2 = parseFloat(selectedIcon.getAttribute("x"));
  const iconY2 = parseFloat(selectedIcon.getAttribute("y"));
  const iconWidth = parseFloat(selectedIcon.getAttribute("width"));
  const iconHeight = parseFloat(selectedIcon.getAttribute("height"));
  const centerX = iconX2 + iconWidth / 2;
  const centerY = iconY2 + iconHeight / 2;
  const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse8(event);
  startRotationMouseAngle2 = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
  console.log("Start rotation mouse angle:", startRotationMouseAngle2);
  startIconRotation = iconRotation;
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.addEventListener("pointermove", rotateIcon);
    svg3.style.cursor = "grabbing";
  }
  document.addEventListener("pointerup", stopRotation2);
}
function rotateIcon(event) {
  if (!isRotatingIcon || !selectedIcon) return;
  const iconX2 = parseFloat(selectedIcon.getAttribute("x")) || 0;
  const iconY2 = parseFloat(selectedIcon.getAttribute("y")) || 0;
  const iconWidth = parseFloat(selectedIcon.getAttribute("width")) || 100;
  const iconHeight = parseFloat(selectedIcon.getAttribute("height")) || 100;
  const centerX = iconX2 + iconWidth / 2;
  const centerY = iconY2 + iconHeight / 2;
  const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse8(event);
  const currentMouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
  const angleDiff = currentMouseAngle - startRotationMouseAngle2;
  iconRotation = startIconRotation + angleDiff;
  iconRotation = iconRotation % 360;
  if (iconRotation < 0) iconRotation += 360;
  const vbWidth = parseFloat(selectedIcon.getAttribute("data-viewbox-width")) || 24;
  const vbHeight = parseFloat(selectedIcon.getAttribute("data-viewbox-height")) || 24;
  const scale = iconWidth / Math.max(vbWidth, vbHeight);
  const localCenterX = iconWidth / 2 / scale;
  const localCenterY = iconHeight / 2 / scale;
  selectedIcon.setAttribute("transform", `translate(${iconX2}, ${iconY2}) scale(${scale}) rotate(${iconRotation}, ${localCenterX}, ${localCenterY})`);
  selectedIcon.setAttribute("data-shape-rotation", iconRotation);
  updateAttachedArrows(selectedIcon);
  removeSelection();
  addSelectionOutline2();
}
function stopRotation2(event) {
  if (!isRotatingIcon) return;
  stopInteracting2();
  isRotatingIcon = false;
  startRotationMouseAngle2 = null;
  startIconRotation = null;
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.removeEventListener("pointermove", rotateIcon);
    svg3.style.cursor = "default";
  }
  document.removeEventListener("pointerup", stopRotation2);
}
function stopInteracting2() {
  if (selectedIcon && (isDragging8 || isRotatingIcon || currentAnchor2)) {
    const newPos = {
      x: parseFloat(selectedIcon.getAttribute("x")) || 0,
      y: parseFloat(selectedIcon.getAttribute("y")) || 0,
      width: parseFloat(selectedIcon.getAttribute("width")) || 100,
      height: parseFloat(selectedIcon.getAttribute("height")) || 100,
      rotation: iconRotation
    };
    let originalRotation = iconRotation;
    if (isRotatingIcon && startIconRotation !== null) {
      originalRotation = startIconRotation;
    }
    const oldPos = {
      x: originalX2,
      y: originalY2,
      width: originalWidth2,
      height: originalHeight2,
      rotation: originalRotation
    };
    let iconShape = null;
    if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
      iconShape = shapes.find((shape) => shape.shapeName === "icon" && shape.element === selectedIcon);
      if (iconShape) {
        iconShape.x = newPos.x;
        iconShape.y = newPos.y;
        iconShape.width = newPos.width;
        iconShape.height = newPos.height;
        iconShape.rotation = newPos.rotation;
      }
    }
    const oldPosWithFrame = {
      ...oldPos,
      parentFrame: draggedShapeInitialFrameIcon
    };
    const newPosWithFrame = {
      ...newPos,
      parentFrame: iconShape ? iconShape.parentFrame : null
    };
    const stateChanged = newPos.x !== oldPos.x || newPos.y !== oldPos.y || newPos.width !== oldPos.width || newPos.height !== oldPos.height || newPos.rotation !== oldPos.rotation;
    const frameChanged = oldPosWithFrame.parentFrame !== newPosWithFrame.parentFrame;
    if ((stateChanged || frameChanged) && iconShape) {
      pushTransformAction2(iconShape, oldPosWithFrame, newPosWithFrame);
    }
    if (isDragging8 && iconShape) {
      const finalFrame = hoveredFrameIcon2;
      if (draggedShapeInitialFrameIcon !== finalFrame) {
        if (draggedShapeInitialFrameIcon) {
          draggedShapeInitialFrameIcon.removeShapeFromFrame(iconShape);
        }
        if (finalFrame) {
          finalFrame.addShapeToFrame(iconShape);
        }
        if (frameChanged) {
          pushFrameAttachmentAction(
            finalFrame || draggedShapeInitialFrameIcon,
            iconShape,
            finalFrame ? "attach" : "detach",
            draggedShapeInitialFrameIcon
          );
        }
      } else if (draggedShapeInitialFrameIcon) {
        draggedShapeInitialFrameIcon.restoreToFrame(iconShape);
      }
    }
    draggedShapeInitialFrameIcon = null;
  }
  if (hoveredFrameIcon2) {
    hoveredFrameIcon2.removeHighlight();
    hoveredFrameIcon2 = null;
    if (window.__iconShapeState) window.__iconShapeState.hoveredFrameIcon = null;
  }
  isDragging8 = false;
  if (window.__iconShapeState) window.__iconShapeState.isDragging = false;
  isRotatingIcon = false;
  const svg3 = getSVGElement2();
  if (svg3) {
    svg3.removeEventListener("pointermove", dragIcon);
    svg3.removeEventListener("pointermove", resizeIcon);
    svg3.removeEventListener("pointermove", rotateIcon);
  }
  document.removeEventListener("pointermove", dragIcon);
  document.removeEventListener("pointermove", resizeIcon);
  document.removeEventListener("pointermove", rotateIcon);
  currentAnchor2 = null;
  startRotationMouseAngle2 = null;
  startIconRotation = null;
  if (selectedIcon) {
    originalX2 = parseFloat(selectedIcon.getAttribute("x")) || 0;
    originalY2 = parseFloat(selectedIcon.getAttribute("y")) || 0;
    originalWidth2 = parseFloat(selectedIcon.getAttribute("width")) || 100;
    originalHeight2 = parseFloat(selectedIcon.getAttribute("height")) || 100;
    selectedIcon.setAttribute("data-shape-x", originalX2);
    selectedIcon.setAttribute("data-shape-y", originalY2);
    selectedIcon.setAttribute("data-shape-width", originalWidth2);
    selectedIcon.setAttribute("data-shape-height", originalHeight2);
    selectedIcon.setAttribute("data-shape-rotation", iconRotation);
    updateAttachedArrows(selectedIcon);
  }
}
function deleteCurrentIcon() {
  if (selectedIcon) {
    let iconShape = null;
    if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
      iconShape = shapes.find((shape) => shape.shapeName === "icon" && shape.element === selectedIcon);
      if (iconShape) {
        const idx = shapes.indexOf(iconShape);
        if (idx !== -1) shapes.splice(idx, 1);
        if (iconShape.group && iconShape.group.parentNode) {
          iconShape.group.parentNode.removeChild(iconShape.group);
        }
      }
    }
    if (!iconShape && selectedIcon.parentNode) {
      selectedIcon.parentNode.removeChild(selectedIcon);
    }
    if (typeof cleanupAttachments2 === "function") {
      cleanupAttachments2(selectedIcon);
    }
    if (iconShape) {
      pushDeleteAction(iconShape);
    }
    removeSelection();
    selectedIcon = null;
  }
}
function cleanupIconTool() {
  if (currentIconElement) {
    const svg3 = getSVGElement2();
    if (svg3 && currentIconElement.parentNode === svg3) {
      svg3.removeChild(currentIconElement);
    }
    currentIconElement = null;
  }
  isDraggingIcon = false;
  iconToPlace = null;
  document.body.style.cursor = "default";
}
var isDraggingIcon, iconToPlace, iconX, iconY, currentIconElement, selectedIcon, originalX2, originalY2, originalWidth2, originalHeight2, currentAnchor2, isDragging8, isRotatingIcon, dragOffsetX3, dragOffsetY3, startRotationMouseAngle2, startIconRotation, iconRotation, aspect_ratio_lock2, minIconSize, miniatureSize, placedIconSize, draggedShapeInitialFrameIcon, hoveredFrameIcon2, _pendingDragChecker, iconSearchInput, handleMouseMoveIcon, drawMiniatureIcon, handleMouseDownIcon, handleMouseUpIcon;
var init_iconTool = __esm({
  "src/tools/iconTool.js"() {
    init_UndoRedo();
    init_arrowTool();
    isDraggingIcon = false;
    iconToPlace = null;
    iconX = 0;
    iconY = 0;
    currentIconElement = null;
    selectedIcon = null;
    currentAnchor2 = null;
    isDragging8 = false;
    isRotatingIcon = false;
    startRotationMouseAngle2 = null;
    startIconRotation = null;
    iconRotation = 0;
    aspect_ratio_lock2 = true;
    minIconSize = 25;
    miniatureSize = 40;
    placedIconSize = 40;
    draggedShapeInitialFrameIcon = null;
    hoveredFrameIcon2 = null;
    _pendingDragChecker = null;
    iconSearchInput = document.getElementById("iconSearchInput") || document.createElement("input");
    document.getElementById("importIcon")?.addEventListener("click", () => {
      const iconContainer = document.getElementById("iconsToolBar");
      if (iconContainer) {
        if (iconContainer.classList.contains("hidden")) {
          iconContainer.classList.remove("hidden");
          iconSearchInput.focus();
        } else {
          iconContainer.classList.add("hidden");
        }
      }
    });
    handleMouseMoveIcon = (e) => {
      if (!isDraggingIcon || !iconToPlace || !isIconToolActive) return;
      const { x, y } = getSVGCoordsFromMouse8(e);
      iconX = x;
      iconY = y;
      drawMiniatureIcon();
      if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
        shapes.forEach((frame) => {
          if (frame.shapeName === "frame") {
            const tempIconBounds = {
              x: iconX - 50,
              y: iconY - 50,
              width: 100,
              height: 100
            };
            if (frame.isShapeInFrame(tempIconBounds)) {
              frame.highlightFrame();
              hoveredFrameIcon2 = frame;
              if (window.__iconShapeState) window.__iconShapeState.hoveredFrameIcon = frame;
            } else if (hoveredFrameIcon2 === frame) {
              frame.removeHighlight();
              hoveredFrameIcon2 = null;
              if (window.__iconShapeState) window.__iconShapeState.hoveredFrameIcon = null;
            }
          }
        });
      }
    };
    drawMiniatureIcon = () => {
      if (!isDraggingIcon || !iconToPlace || !isIconToolActive) return;
      const svg3 = getSVGElement2();
      if (!svg3) {
        console.error("SVG element not found for miniature icon");
        return;
      }
      if (currentIconElement) {
        svg3.removeChild(currentIconElement);
        currentIconElement = null;
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = iconToPlace;
      const svgElement = tempDiv.querySelector("svg");
      if (svgElement) {
        const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const viewBox = svgElement.getAttribute("viewBox");
        let vbWidth = 24, vbHeight = 24;
        if (viewBox) {
          const [, , widthStr, heightStr] = viewBox.split(/\s+/);
          vbWidth = parseFloat(widthStr) || 24;
          vbHeight = parseFloat(heightStr) || 24;
        } else {
          const width = svgElement.getAttribute("width");
          const height = svgElement.getAttribute("height");
          if (width && height) {
            vbWidth = parseFloat(width) || 24;
            vbHeight = parseFloat(height) || 24;
          }
        }
        const scale = miniatureSize / Math.max(vbWidth, vbHeight);
        iconGroup.setAttribute("transform", `translate(${iconX - miniatureSize / 2}, ${iconY - miniatureSize / 2}) scale(${scale})`);
        const allChildren = svgElement.children;
        for (let i = 0; i < allChildren.length; i++) {
          const clonedChild = allChildren[i].cloneNode(true);
          const applyGrayStyle = (element) => {
            if (element.nodeType === 1) {
              element.setAttribute("fill", "#666");
              element.setAttribute("stroke", "#666");
              for (let j = 0; j < element.children.length; j++) {
                applyGrayStyle(element.children[j]);
              }
            }
          };
          applyGrayStyle(clonedChild);
          iconGroup.appendChild(clonedChild);
        }
        iconGroup.setAttribute("style", "pointer-events: none; opacity: 0.7;");
        iconGroup.setAttribute("class", "miniature-icon");
        currentIconElement = iconGroup;
        svg3.appendChild(currentIconElement);
      }
    };
    handleMouseDownIcon = async (e) => {
      if (!e.target) return;
      if (isSelectionToolActive) {
        const clickedIcon = e.target.closest('[type="icon"]');
        if (clickedIcon) {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIcon === clickedIcon) {
            let checkDragStartWithThreshold = function(moveEvent) {
              const { x: currentX, y: currentY } = getSVGCoordsFromMouse8(moveEvent);
              const deltaX = Math.abs(currentX - initialMouseX);
              const deltaY = Math.abs(currentY - initialMouseY);
              if (deltaX > dragThreshold || deltaY > dragThreshold) {
                document.removeEventListener("pointermove", checkDragStartWithThreshold);
                document.removeEventListener("pointerup", cancelDragPrep);
                window.removeEventListener("pointerup", cancelDragPrep);
                const svg4 = getSVGElement2();
                if (svg4) svg4.removeEventListener("pointerup", cancelDragPrep);
                startDrag3(moveEvent);
              }
            };
            originalX2 = parseFloat(selectedIcon.getAttribute("x")) || 0;
            originalY2 = parseFloat(selectedIcon.getAttribute("y")) || 0;
            originalWidth2 = parseFloat(selectedIcon.getAttribute("width")) || placedIconSize;
            originalHeight2 = parseFloat(selectedIcon.getAttribute("height")) || placedIconSize;
            const { x, y } = getSVGCoordsFromMouse8(e);
            dragOffsetX3 = x - originalX2;
            dragOffsetY3 = y - originalY2;
            const initialMouseX = x;
            const initialMouseY = y;
            const svgEl = getSVGElement2();
            const svgRect2 = svgEl ? svgEl.getBoundingClientRect() : { width: 1536 };
            const svgViewW = svgEl ? svgEl.viewBox.baseVal.width : 1536;
            const dragThreshold = 12 * (svgViewW / svgRect2.width);
            _pendingDragChecker = checkDragStartWithThreshold;
            document.addEventListener("pointermove", checkDragStartWithThreshold);
            document.addEventListener("pointerup", cancelDragPrep);
            window.addEventListener("pointerup", cancelDragPrep);
            const svg3 = getSVGElement2();
            if (svg3) svg3.addEventListener("pointerup", cancelDragPrep);
            return;
          } else {
            selectIcon2(e);
            return;
          }
        }
        if (selectedIcon) {
          removeSelection();
          selectedIcon = null;
          if (currentShape && currentShape.shapeName === "icon") {
            currentShape = null;
          }
        }
        return;
      }
      if (!isDraggingIcon || !iconToPlace || !isIconToolActive) {
        return;
      }
      let placedIconShape = null;
      try {
        const svg3 = getSVGElement2();
        if (!svg3) {
          throw new Error("SVG element not found");
        }
        if (currentIconElement) {
          svg3.removeChild(currentIconElement);
          currentIconElement = null;
        }
        const { x: placedX, y: placedY } = getSVGCoordsFromMouse8(e);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = iconToPlace;
        const originalSvgElement = tempDiv.querySelector("svg");
        if (!originalSvgElement) {
          throw new Error("Invalid SVG content");
        }
        const finalIconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const finalX = placedX - placedIconSize / 2;
        const finalY = placedY - placedIconSize / 2;
        const viewBox = originalSvgElement.getAttribute("viewBox");
        let vbWidth = 24, vbHeight = 24;
        if (viewBox) {
          const [, , widthStr, heightStr] = viewBox.split(/\s+/);
          vbWidth = parseFloat(widthStr) || 24;
          vbHeight = parseFloat(heightStr) || 24;
        } else {
          const width = originalSvgElement.getAttribute("width");
          const height = originalSvgElement.getAttribute("height");
          if (width && height) {
            vbWidth = parseFloat(width) || 24;
            vbHeight = parseFloat(height) || 24;
          }
        }
        const scale = placedIconSize / Math.max(vbWidth, vbHeight);
        const localCenterX = placedIconSize / 2 / scale;
        const localCenterY = placedIconSize / 2 / scale;
        finalIconGroup.setAttribute("transform", `translate(${finalX}, ${finalY}) scale(${scale}) rotate(0, ${localCenterX}, ${localCenterY})`);
        finalIconGroup.setAttribute("data-viewbox-width", vbWidth);
        finalIconGroup.setAttribute("data-viewbox-height", vbHeight);
        const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        backgroundRect.setAttribute("x", 0);
        backgroundRect.setAttribute("y", 0);
        backgroundRect.setAttribute("width", vbWidth);
        backgroundRect.setAttribute("height", vbHeight);
        backgroundRect.setAttribute("fill", "transparent");
        backgroundRect.setAttribute("stroke", "none");
        backgroundRect.setAttribute("style", "pointer-events: all; cursor: pointer;");
        finalIconGroup.appendChild(backgroundRect);
        const allChildren = originalSvgElement.children;
        for (let i = 0; i < allChildren.length; i++) {
          const clonedChild = allChildren[i].cloneNode(true);
          const applyWhiteStyle = (element) => {
            if (element.nodeType === 1) {
              const fill = element.getAttribute("fill");
              const stroke = element.getAttribute("stroke");
              if (!fill || fill === "#000" || fill === "#000000" || fill === "black" || fill === "currentColor") {
                element.setAttribute("fill", "#ffffff");
              }
              if (stroke === "#000" || stroke === "#000000" || stroke === "black" || stroke === "currentColor") {
                element.setAttribute("stroke", "#ffffff");
              }
              for (let j = 0; j < element.children.length; j++) {
                applyWhiteStyle(element.children[j]);
              }
            }
          };
          applyWhiteStyle(clonedChild);
          finalIconGroup.appendChild(clonedChild);
        }
        finalIconGroup.setAttribute("x", finalX);
        finalIconGroup.setAttribute("y", finalY);
        finalIconGroup.setAttribute("width", placedIconSize);
        finalIconGroup.setAttribute("height", placedIconSize);
        finalIconGroup.setAttribute("type", "icon");
        finalIconGroup.setAttribute("data-shape-x", finalX);
        finalIconGroup.setAttribute("data-shape-y", finalY);
        finalIconGroup.setAttribute("data-shape-width", placedIconSize);
        finalIconGroup.setAttribute("data-shape-height", placedIconSize);
        finalIconGroup.setAttribute("data-shape-rotation", 0);
        finalIconGroup.shapeID = `icon-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
        finalIconGroup.setAttribute("id", finalIconGroup.shapeID);
        finalIconGroup.setAttribute("style", "cursor: pointer; pointer-events: all;");
        svg3.appendChild(finalIconGroup);
        const iconShape = wrapIconElement(finalIconGroup);
        placedIconShape = iconShape;
        if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
          const alreadyExists = shapes.some((s) => s.shapeName === "icon" && s.element === finalIconGroup);
          if (!alreadyExists) {
            shapes.push(iconShape);
          }
        }
        const finalFrame = hoveredFrameIcon2;
        if (finalFrame) {
          finalFrame.addShapeToFrame(iconShape);
          pushFrameAttachmentAction(finalFrame, iconShape, "attach", null);
        }
        pushCreateAction(iconShape);
        if (hoveredFrameIcon2) {
          hoveredFrameIcon2.removeHighlight();
          hoveredFrameIcon2 = null;
          if (window.__iconShapeState) window.__iconShapeState.hoveredFrameIcon = null;
        }
        console.log("Icon placed successfully:", finalIconGroup);
      } catch (error) {
        console.error("Error placing icon:", error);
        isDraggingIcon = false;
        iconToPlace = null;
      } finally {
        isDraggingIcon = false;
        iconToPlace = null;
        document.body.style.cursor = "default";
      }
      if (placedIconShape) {
        currentShape = placedIconShape;
        currentShape.isSelected = true;
        requestAnimationFrame(() => {
          placedIconShape.selectShape();
        });
      }
    };
    handleMouseUpIcon = (e) => {
      if (!e.target) return;
      if (hoveredFrameIcon2) {
        hoveredFrameIcon2.removeHighlight();
        hoveredFrameIcon2 = null;
      }
    };
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && selectedIcon) {
        deleteCurrentIcon();
      }
    });
    window.__cleanupIconTool = cleanupIconTool;
    window.prepareIconPlacement = function(svgContent) {
      iconToPlace = svgContent;
      isDraggingIcon = true;
      window.isIconToolActive = true;
      document.body.style.cursor = "crosshair";
    };
    window.__iconToolSelectIcon = selectIcon2;
    window.__iconToolRemoveSelection = removeSelection;
  }
});

// src/tools/frameTool.js
var frameTool_exports = {};
__export(frameTool_exports, {
  handleMouseDownFrame: () => handleMouseDown4,
  handleMouseMoveFrame: () => handleMouseMove5,
  handleMouseUpFrame: () => handleMouseUp5
});
function getSVGCoordsFromMouse9(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function deleteCurrentFrame() {
  if (currentShape && currentShape.shapeName === "frame") {
    const idx = shapes.indexOf(currentShape);
    if (idx !== -1) shapes.splice(idx, 1);
    if (currentShape.group.parentNode) {
      currentShape.group.parentNode.removeChild(currentShape.group);
    }
    pushDeleteAction(currentShape);
    currentShape = null;
  }
}
var currentFrame, isResizing3, isDragging9, activeAnchor2, isDrawingFrame, frameStrokeColor, frameStrokeThickness, frameFillColor, frameOpacity, startX5, startY5, dragOldPosFrame2, handleMouseDown4, handleMouseMove5, handleMouseUp5;
var init_frameTool = __esm({
  "src/tools/frameTool.js"() {
    init_UndoRedo();
    currentFrame = null;
    isResizing3 = false;
    isDragging9 = false;
    activeAnchor2 = null;
    isDrawingFrame = false;
    frameStrokeColor = "#888";
    frameStrokeThickness = 2;
    frameFillColor = "transparent";
    frameOpacity = 1;
    dragOldPosFrame2 = null;
    handleMouseDown4 = (e) => {
      if (!isFrameToolActive && !isSelectionToolActive) return;
      const { x, y } = getSVGCoordsFromMouse9(e);
      if (isFrameToolActive) {
        isDrawingFrame = true;
        startX5 = x;
        startY5 = y;
        currentFrame = new Frame(x, y, 0, 0, {
          stroke: frameStrokeColor,
          strokeWidth: frameStrokeThickness,
          fill: frameFillColor,
          opacity: frameOpacity
        });
        shapes.push(currentFrame);
        currentShape = currentFrame;
      } else if (isSelectionToolActive) {
        for (let i = shapes.length - 1; i >= 0; i--) {
          if (shapes[i].shapeName === "frame" && shapes[i].contains(x, y)) {
            const clickedFrame = shapes[i];
            let clickedContainedShape = false;
            if (clickedFrame.containedShapes && clickedFrame.containedShapes.length > 0) {
              for (let j = clickedFrame.containedShapes.length - 1; j >= 0; j--) {
                const inner = clickedFrame.containedShapes[j];
                if (inner.contains && inner.contains(x, y)) {
                  clickedContainedShape = true;
                  break;
                }
              }
            }
            if (clickedContainedShape) return;
            if (currentShape && currentShape !== clickedFrame) {
              currentShape.removeSelection();
            }
            currentShape = clickedFrame;
            currentShape.selectFrame();
            const anchorIndex = typeof currentShape.isNearAnchor === "function" ? currentShape.isNearAnchor(x, y) : null;
            if (anchorIndex !== null) {
              activeAnchor2 = anchorIndex;
              isResizing3 = true;
            } else {
              isDragging9 = true;
              startX5 = x;
              startY5 = y;
              dragOldPosFrame2 = {
                x: currentShape.x,
                y: currentShape.y,
                width: currentShape.width,
                height: currentShape.height,
                rotation: currentShape.rotation
              };
            }
            return;
          }
        }
        if (currentShape && currentShape.shapeName === "frame") {
          currentShape.removeSelection();
          currentShape = null;
        }
      }
    };
    handleMouseMove5 = (e) => {
      const { x, y } = getSVGCoordsFromMouse9(e);
      if (isDrawingFrame && currentFrame) {
        const width = Math.abs(x - startX5);
        const height = Math.abs(y - startY5);
        currentFrame.x = Math.min(startX5, x);
        currentFrame.y = Math.min(startY5, y);
        currentFrame.width = width;
        currentFrame.height = height;
        currentFrame.draw();
      } else if (isDragging9 && currentShape && currentShape.shapeName === "frame") {
        const dx = x - startX5;
        const dy = y - startY5;
        currentShape.move(dx, dy);
        startX5 = x;
        startY5 = y;
      }
    };
    handleMouseUp5 = (e) => {
      if (isDrawingFrame && currentFrame) {
        if (currentFrame.width < 10 || currentFrame.height < 10) {
          currentFrame.destroy();
          currentFrame = null;
          currentShape = null;
        } else {
          pushCreateAction(currentFrame);
          currentFrame.updateContainedShapes(true);
          const placedFrame = currentFrame;
          if (window.__sketchStoreApi) {
            window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
          } else {
            window.isSelectionToolActive = true;
          }
          currentShape = placedFrame;
          placedFrame.selectFrame();
        }
        isDrawingFrame = false;
      }
      if (isDragging9 && dragOldPosFrame2 && currentShape) {
        const newPos = {
          x: currentShape.x,
          y: currentShape.y,
          width: currentShape.width,
          height: currentShape.height,
          rotation: currentShape.rotation
        };
        pushTransformAction2(currentShape, dragOldPosFrame2, newPos);
        dragOldPosFrame2 = null;
        if (currentShape.shapeName === "frame") {
          currentShape.updateClipPath();
        }
      }
      if (!isDragging9) {
        shapes.forEach((shape) => {
          if (shape.shapeName !== "frame" && !shape.parentFrame) {
            shapes.forEach((frame) => {
              if (frame.shapeName === "frame") {
                if (frame.isShapeInFrame(shape)) {
                  frame.addShapeToFrame(shape);
                }
              }
            });
          }
        });
      }
      isDrawingFrame = false;
      isDragging9 = false;
      isResizing3 = false;
      activeAnchor2 = null;
      svg.style.cursor = "default";
    };
    Frame.prototype.isNearAnchor = function(x, y) {
      const anchorSize = 10 / currentZoom;
      const anchorPositions = [
        { x: this.x, y: this.y },
        { x: this.x + this.width / 2, y: this.y },
        { x: this.x + this.width, y: this.y },
        { x: this.x + this.width, y: this.y + this.height / 2 },
        { x: this.x + this.width, y: this.y + this.height },
        { x: this.x + this.width / 2, y: this.y + this.height },
        { x: this.x, y: this.y + this.height },
        { x: this.x, y: this.y + this.height / 2 },
        { x: this.x + this.width / 2, y: this.y - 30 / currentZoom }
        // Rotation handle
      ];
      for (let i = 0; i < anchorPositions.length; i++) {
        const pos = anchorPositions[i];
        const distance2 = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance2 <= anchorSize) {
          return i;
        }
      }
      return null;
    };
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && currentShape && currentShape.shapeName === "frame") {
        deleteCurrentFrame();
      }
    });
    window.Frame = Frame;
  }
});

// src/tools/freehandTool.js
var freehandTool_exports = {};
__export(freehandTool_exports, {
  handleFreehandMouseDown: () => handleMouseDown5,
  handleFreehandMouseMove: () => handleMouseMove6,
  handleFreehandMouseUp: () => handleMouseUp6
});
function getSvgCoordinates(event) {
  const rect = svg.getBoundingClientRect();
  const scaleX = currentViewBox.width / rect.width;
  const scaleY = currentViewBox.height / rect.height;
  const svgX = currentViewBox.x + (event.clientX - rect.left) * scaleX;
  const svgY = currentViewBox.y + (event.clientY - rect.top) * scaleY;
  return { x: svgX, y: svgY };
}
function updateFrameContainmentForStroke(shape) {
  if (shape.isBeingMovedByFrame) return;
  let targetFrame = null;
  shapes.forEach((s) => {
    if (s.shapeName === "frame" && s.isShapeInFrame(shape)) {
      targetFrame = s;
    }
  });
  if (shape.parentFrame && isDraggingStroke) {
    shape.parentFrame.temporarilyRemoveFromFrame(shape);
  }
  if (hoveredFrameStroke && hoveredFrameStroke !== targetFrame) {
    hoveredFrameStroke.removeHighlight();
  }
  if (targetFrame && targetFrame !== hoveredFrameStroke) {
    targetFrame.highlightFrame();
  }
  hoveredFrameStroke = targetFrame;
}
function deleteCurrentShape4() {
  if (currentShape && currentShape.shapeName === "freehandStroke") {
    const idx = shapes.indexOf(currentShape);
    if (idx !== -1) shapes.splice(idx, 1);
    if (currentShape.group.parentNode) {
      currentShape.group.parentNode.removeChild(currentShape.group);
    }
    pushDeleteAction(currentShape);
    currentShape = null;
    disableAllSideBars();
  }
}
function handleMouseDown5(e) {
  const { x, y } = getSvgCoordinates(e);
  if (isPaintToolActive) {
    isDrawingStroke = true;
    const pressure = e.pressure || 0.5;
    points = [[x, y, pressure]];
    lastPoint = [x, y, pressure];
    lastTime = Date.now();
    currentStroke = new FreehandStroke(points, {
      stroke: strokeColor,
      strokeWidth: strokeThickness
    });
    shapes.push(currentStroke);
    currentShape = currentStroke;
  } else if (isSelectionToolActive) {
    let clickedOnShape = false;
    if (currentShape && currentShape.shapeName === "freehandStroke" && currentShape.isSelected) {
      const anchorInfo = currentShape.isNearAnchor(x, y);
      if (anchorInfo) {
        if (anchorInfo.type === "resize") {
          isResizingStroke = true;
          resizingAnchorIndex = anchorInfo.index;
          dragOldPosStroke = cloneStrokeData(currentShape);
        } else if (anchorInfo.type === "rotate") {
          isRotatingStroke = true;
          const centerX = currentShape.boundingBox.x + currentShape.boundingBox.width / 2;
          const centerY = currentShape.boundingBox.y + currentShape.boundingBox.height / 2;
          startRotationMouseAngle3 = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
          startShapeRotation = currentShape.rotation;
          dragOldPosStroke = cloneStrokeData(currentShape);
        }
        clickedOnShape = true;
      } else if (currentShape.contains(x, y)) {
        isDraggingStroke = true;
        dragOldPosStroke = cloneStrokeData(currentShape);
        draggedShapeInitialFrameStroke = currentShape.parentFrame || null;
        if (currentShape.parentFrame) {
          currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
        }
        startX6 = x;
        startY6 = y;
        clickedOnShape = true;
      }
    }
    if (!clickedOnShape) {
      let shapeToSelect = null;
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape instanceof FreehandStroke && shape.contains(x, y)) {
          shapeToSelect = shape;
          break;
        }
      }
      if (currentShape && currentShape !== shapeToSelect) {
        currentShape.deselectStroke();
        currentShape = null;
      }
      if (shapeToSelect) {
        currentShape = shapeToSelect;
        currentShape.selectStroke();
        const anchorInfo = currentShape.isNearAnchor(x, y);
        if (anchorInfo) {
          if (anchorInfo.type === "resize") {
            isResizingStroke = true;
            resizingAnchorIndex = anchorInfo.index;
            dragOldPosStroke = cloneStrokeData(currentShape);
          } else if (anchorInfo.type === "rotate") {
            isRotatingStroke = true;
            const centerX = currentShape.boundingBox.x + currentShape.boundingBox.width / 2;
            const centerY = currentShape.boundingBox.y + currentShape.boundingBox.height / 2;
            startRotationMouseAngle3 = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
            startShapeRotation = currentShape.rotation;
            dragOldPosStroke = cloneStrokeData(currentShape);
          }
        } else {
          isDraggingStroke = true;
          dragOldPosStroke = cloneStrokeData(currentShape);
          draggedShapeInitialFrameStroke = currentShape.parentFrame || null;
          if (currentShape.parentFrame) {
            currentShape.parentFrame.temporarilyRemoveFromFrame(currentShape);
          }
          startX6 = x;
          startY6 = y;
        }
        clickedOnShape = true;
      }
    }
    if (!clickedOnShape && currentShape) {
      currentShape.deselectStroke();
      currentShape = null;
      disableAllSideBars();
    }
  }
}
function handleMouseMove6(e) {
  let { x, y } = getSvgCoordinates(e);
  const currentTime = Date.now();
  const svgRect = svg.getBoundingClientRect();
  lastMousePos = {
    x: e.clientX - svgRect.left,
    y: e.clientY - svgRect.top
  };
  if (isDrawingStroke && isPaintToolActive) {
    const pressure = e.pressure || 0.5;
    if (e.shiftKey && points.length > 0) {
      const startX7 = points[0][0], startY7 = points[0][1];
      const dx = x - startX7, dy = y - startY7;
      const angle = Math.atan2(dy, dx);
      const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const dist = Math.sqrt(dx * dx + dy * dy);
      x = startX7 + dist * Math.cos(snapAngle);
      y = startY7 + dist * Math.sin(snapAngle);
      points = [points[0], [x, y, pressure]];
      lastPoint = [x, y, pressure];
      currentStroke.points = points;
      currentStroke.draw();
      return;
    }
    if (lastPoint) {
      const dx = x - lastPoint[0];
      const dy = y - lastPoint[1];
      const distance2 = Math.sqrt(dx * dx + dy * dy);
      if (distance2 >= minDistance) {
        if (distance2 > maxDistance) {
          const steps = Math.ceil(distance2 / maxDistance);
          for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const interpX = lastPoint[0] + dx * t;
            const interpY = lastPoint[1] + dy * t;
            const interpPressure = lastPoint[2] + (pressure - lastPoint[2]) * t;
            points.push([interpX, interpY, interpPressure]);
          }
        }
        const timeDelta = currentTime - lastTime;
        const velocity = distance2 / Math.max(timeDelta, 1);
        const velocityPressure = Math.min(1, Math.max(0.1, 1 - velocity * 0.02));
        const finalPressure = (pressure + velocityPressure) * 0.5;
        points.push([x, y, finalPressure]);
        currentStroke.points = points;
        currentStroke.draw();
        lastPoint = [x, y, finalPressure];
        lastTime = currentTime;
      }
    } else {
      lastPoint = [x, y, pressure];
      lastTime = currentTime;
    }
    shapes.forEach((frame) => {
      if (frame.shapeName === "frame") {
        if (frame.isShapeInFrame(currentStroke)) {
          frame.highlightFrame();
          hoveredFrameStroke = frame;
        } else if (hoveredFrameStroke === frame) {
          frame.removeHighlight();
          hoveredFrameStroke = null;
        }
      }
    });
  } else if (isDraggingStroke && currentShape && currentShape.isSelected) {
    const dx = x - startX6;
    const dy = y - startY6;
    currentShape.move(dx, dy);
    startX6 = x;
    startY6 = y;
    if (!currentShape.isBeingMovedByFrame) {
      updateFrameContainmentForStroke(currentShape);
    }
    currentShape.updateAttachedArrows();
    if (window.__sketchStoreApi && window.__sketchStoreApi.getState().snapToObjects) {
      const snap = calculateSnap(currentShape, e.shiftKey, e.clientX, e.clientY);
      if (snap.dx || snap.dy) {
        currentShape.move(snap.dx, snap.dy);
      }
    } else {
      clearSnapGuides();
    }
  } else if (isResizingStroke && currentShape && currentShape.isSelected) {
    currentShape.updatePosition(resizingAnchorIndex, x, y);
  } else if (isRotatingStroke && currentShape && currentShape.isSelected) {
    const centerX = currentShape.boundingBox.x + currentShape.boundingBox.width / 2;
    const centerY = currentShape.boundingBox.y + currentShape.boundingBox.height / 2;
    const currentMouseAngle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
    const angleDiff = currentMouseAngle - startRotationMouseAngle3;
    currentShape.rotate(startShapeRotation + angleDiff);
    currentShape.draw();
  }
}
function handleMouseUp6(e) {
  if (isDrawingStroke) {
    isDrawingStroke = false;
    lastPoint = null;
    if (currentStroke && currentStroke.points.length >= 2) {
      currentStroke.draw();
      pushCreateAction(currentStroke);
      const finalFrame = hoveredFrameStroke;
      if (finalFrame) {
        finalFrame.addShapeToFrame(currentStroke);
        pushFrameAttachmentAction(finalFrame, currentStroke, "attach", null);
      }
      const drawnShape = currentStroke;
      if (window.__sketchStoreApi) window.__sketchStoreApi.setActiveTool("select", { afterDraw: true });
      currentShape = drawnShape;
      currentShape.selectStroke();
    } else if (currentStroke) {
      shapes.pop();
      if (currentStroke.group.parentNode) {
        currentStroke.group.parentNode.removeChild(currentStroke.group);
      }
    }
    if (hoveredFrameStroke) {
      hoveredFrameStroke.removeHighlight();
      hoveredFrameStroke = null;
    }
    currentStroke = null;
  }
  if ((isDraggingStroke || isResizingStroke || isRotatingStroke) && dragOldPosStroke && currentShape) {
    const newPos = cloneStrokeData(currentShape);
    const stateChanged = JSON.stringify(dragOldPosStroke.points) !== JSON.stringify(newPos.points) || dragOldPosStroke.rotation !== newPos.rotation;
    const oldPos = {
      ...dragOldPosStroke,
      parentFrame: draggedShapeInitialFrameStroke
    };
    const newPosForUndo = {
      ...newPos,
      parentFrame: currentShape.parentFrame
    };
    const frameChanged = oldPos.parentFrame !== newPosForUndo.parentFrame;
    if (stateChanged || frameChanged) {
      pushTransformAction2(currentShape, oldPos, newPosForUndo);
    }
    if (isDraggingStroke) {
      const finalFrame = hoveredFrameStroke;
      if (draggedShapeInitialFrameStroke !== finalFrame) {
        if (draggedShapeInitialFrameStroke) {
          draggedShapeInitialFrameStroke.removeShapeFromFrame(currentShape);
        }
        if (finalFrame) {
          finalFrame.addShapeToFrame(currentShape);
        }
        if (frameChanged) {
          pushFrameAttachmentAction(
            finalFrame || draggedShapeInitialFrameStroke,
            currentShape,
            finalFrame ? "attach" : "detach",
            draggedShapeInitialFrameStroke
          );
        }
      } else if (draggedShapeInitialFrameStroke) {
        draggedShapeInitialFrameStroke.restoreToFrame(currentShape);
      }
    }
    dragOldPosStroke = null;
    draggedShapeInitialFrameStroke = null;
  }
  if (hoveredFrameStroke) {
    hoveredFrameStroke.removeHighlight();
    hoveredFrameStroke = null;
  }
  if (currentShape && typeof currentShape.finalizeMove === "function") {
    currentShape.finalizeMove();
  }
  clearSnapGuides();
  isDraggingStroke = false;
  isResizingStroke = false;
  isRotatingStroke = false;
  resizingAnchorIndex = null;
  startRotationMouseAngle3 = null;
  startShapeRotation = null;
  svg.style.cursor = "default";
}
function cloneOptions(options) {
  return JSON.parse(JSON.stringify(options));
}
function cloneStrokeData(stroke) {
  return {
    points: JSON.parse(JSON.stringify(stroke.points)),
    rotation: stroke.rotation,
    options: cloneOptions(stroke.options)
  };
}
var strokeColors, strokeThicknesses, strokeStyles, strokeTapers, strokeRoughnesses, strokeColor, strokeThickness, strokeStyleValue, strokeThinning, strokeRoughnessValue, points, isDrawingStroke, currentStroke, strokeOpacity, isDraggingStroke, isResizingStroke, isRotatingStroke, dragOldPosStroke, resizingAnchorIndex, startRotationMouseAngle3, startShapeRotation, startX6, startY6, draggedShapeInitialFrameStroke, hoveredFrameStroke, lastPoint, lastTime, minDistance, maxDistance, isdraggingOpacity;
var init_freehandTool = __esm({
  "src/tools/freehandTool.js"() {
    init_UndoRedo();
    init_arrowTool();
    init_SnapGuides();
    window.__updateArrowsForShape = updateAttachedArrows;
    strokeColors = document.querySelectorAll(".strokeColors span");
    strokeThicknesses = document.querySelectorAll(".strokeThickness span");
    strokeStyles = document.querySelectorAll(".strokeStyleSpan");
    strokeTapers = document.querySelectorAll(".strokeTaperSpan");
    strokeRoughnesses = document.querySelectorAll(".strokeRoughnessSpan");
    strokeColor = "#fff";
    strokeThickness = 2;
    strokeStyleValue = "solid";
    strokeThinning = 0;
    strokeRoughnessValue = "smooth";
    points = [];
    isDrawingStroke = false;
    currentStroke = null;
    strokeOpacity = 1;
    isDraggingStroke = false;
    isResizingStroke = false;
    isRotatingStroke = false;
    dragOldPosStroke = null;
    resizingAnchorIndex = null;
    startRotationMouseAngle3 = null;
    startShapeRotation = null;
    draggedShapeInitialFrameStroke = null;
    hoveredFrameStroke = null;
    lastPoint = null;
    lastTime = 0;
    minDistance = 2;
    maxDistance = 15;
    isdraggingOpacity = false;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && currentShape && currentShape.shapeName === "freehandStroke") {
        deleteCurrentShape4();
      }
    });
    strokeColors.forEach((span) => {
      span.addEventListener("click", (event) => {
        strokeColors.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof FreehandStroke && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.stroke = span.getAttribute("data-id");
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          strokeColor = span.getAttribute("data-id");
        }
      });
    });
    strokeThicknesses.forEach((span) => {
      span.addEventListener("click", (event) => {
        strokeThicknesses.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        if (currentShape instanceof FreehandStroke && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.strokeWidth = parseInt(span.getAttribute("data-id"));
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          strokeThickness = parseInt(span.getAttribute("data-id"));
        }
      });
    });
    strokeStyles.forEach((span) => {
      span.addEventListener("click", () => {
        strokeStyles.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const val = span.getAttribute("data-id");
        if (currentShape instanceof FreehandStroke && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.strokeStyle = val;
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          strokeStyleValue = val;
        }
      });
    });
    strokeTapers.forEach((span) => {
      span.addEventListener("click", () => {
        strokeTapers.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const val = parseFloat(span.getAttribute("data-id"));
        if (currentShape instanceof FreehandStroke && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.thinning = val;
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          strokeThinning = val;
        }
      });
    });
    strokeRoughnesses.forEach((span) => {
      span.addEventListener("click", () => {
        strokeRoughnesses.forEach((el) => el.classList.remove("selected"));
        span.classList.add("selected");
        const val = span.getAttribute("data-id");
        if (currentShape instanceof FreehandStroke && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.roughness = val;
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          strokeRoughnessValue = val;
        }
      });
    });
    document.getElementById("strokeOpacity")?.addEventListener("mousedown", (event) => {
      isdraggingOpacity = true;
    });
    document.getElementById("strokeOpacity")?.addEventListener("mousemove", (event) => {
      if (isdraggingOpacity) {
        const slider = document.getElementById("strokeOpacity");
        const rect = slider.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, mouseX / rect.width * 100));
        document.getElementById("opacityContainerValue").textContent = percent.toFixed(0);
        const opacity = percent / 100;
        if (currentShape instanceof FreehandStroke && currentShape.isSelected) {
          const oldOptions = { ...currentShape.options };
          currentShape.options.strokeOpacity = opacity;
          currentShape.draw();
          pushOptionsChangeAction(currentShape, oldOptions);
        } else {
          strokeOpacity = opacity;
        }
      }
    });
    document.getElementById("strokeOpacity")?.addEventListener("mouseup", (event) => {
      isdraggingOpacity = false;
    });
    window.freehandToolSettings = {
      get strokeColor() {
        return strokeColor;
      },
      set strokeColor(v) {
        strokeColor = v;
      },
      get strokeWidth() {
        return strokeThickness;
      },
      set strokeWidth(v) {
        strokeThickness = v;
      },
      get strokeStyle() {
        return strokeStyleValue;
      },
      set strokeStyle(v) {
        strokeStyleValue = v;
      },
      get thinning() {
        return strokeThinning;
      },
      set thinning(v) {
        strokeThinning = v;
      },
      get roughness() {
        return strokeRoughnessValue;
      },
      set roughness(v) {
        strokeRoughnessValue = v;
      },
      get opacity() {
        return strokeOpacity;
      },
      set opacity(v) {
        strokeOpacity = v;
      }
    };
    window.updateSelectedFreehandStyle = function(changes) {
      if (currentShape && currentShape.shapeName === "freehandStroke" && currentShape.isSelected) {
        if (changes.stroke !== void 0) {
          strokeColor = changes.stroke;
          currentShape.options.stroke = changes.stroke;
        }
        if (changes.strokeWidth !== void 0) {
          strokeThickness = changes.strokeWidth;
          currentShape.options.strokeWidth = changes.strokeWidth;
        }
        if (changes.thinning !== void 0) {
          strokeThinning = changes.thinning;
          currentShape.options.thinning = changes.thinning;
        }
        if (changes.roughness !== void 0) {
          strokeRoughnessValue = changes.roughness;
          currentShape.options.roughness = changes.roughness;
        }
        if (changes.opacity !== void 0) {
          strokeOpacity = changes.opacity;
          currentShape.options.strokeOpacity = changes.opacity;
        }
        currentShape.draw();
      } else {
        if (changes.stroke !== void 0) strokeColor = changes.stroke;
        if (changes.strokeWidth !== void 0) strokeThickness = changes.strokeWidth;
        if (changes.thinning !== void 0) strokeThinning = changes.thinning;
        if (changes.roughness !== void 0) strokeRoughnessValue = changes.roughness;
        if (changes.opacity !== void 0) strokeOpacity = changes.opacity;
      }
    };
    window.addEventListener("pointerup", () => {
      if (isDrawingStroke) {
        isDrawingStroke = false;
        lastPoint = null;
        if (currentStroke && currentStroke.points && currentStroke.points.length >= 2) {
          currentStroke.draw();
        }
        currentStroke = null;
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isDrawingStroke) {
        isDrawingStroke = false;
        lastPoint = null;
        currentStroke = null;
      }
    });
  }
});

// src/core/Selection.js
var Selection_exports = {};
__export(Selection_exports, {
  clearAllSelections: () => clearAllSelections2,
  createMultiSelectionControls: () => createMultiSelectionControls,
  handleMultiSelectionMouseDown: () => handleMultiSelectionMouseDown,
  handleMultiSelectionMouseMove: () => handleMultiSelectionMouseMove,
  handleMultiSelectionMouseUp: () => handleMultiSelectionMouseUp,
  isDraggingMultiSelection: () => isDraggingMultiSelection,
  isMultiSelecting: () => isMultiSelecting,
  isPointInMultiSelection: () => isPointInMultiSelection,
  moveSelectedShapes: () => moveSelectedShapes,
  multiSelection: () => multiSelection,
  removeMultiSelectionControls: () => removeMultiSelectionControls,
  removeMultiSelectionRect: () => removeMultiSelectionRect,
  selectShapesInRect: () => selectShapesInRect
});
function getSVGCoordsFromMouse10(e) {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const svgX = viewBox.x + mouseX / rect.width * viewBox.width;
  const svgY = viewBox.y + mouseY / rect.height * viewBox.height;
  return { x: svgX, y: svgY };
}
function createMultiSelectionRect(startX7, startY7) {
  multiSelectionRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  multiSelectionRect.setAttribute("x", startX7);
  multiSelectionRect.setAttribute("y", startY7);
  multiSelectionRect.setAttribute("width", 0);
  multiSelectionRect.setAttribute("height", 0);
  multiSelectionRect.setAttribute("fill", "rgba(91, 87, 209, 0.1)");
  multiSelectionRect.setAttribute("stroke", "#5B57D1");
  multiSelectionRect.setAttribute("stroke-width", 1);
  multiSelectionRect.setAttribute("stroke-dasharray", "4 2");
  multiSelectionRect.setAttribute("style", "pointer-events: none;");
  svg.appendChild(multiSelectionRect);
}
function updateMultiSelectionRect(currentX, currentY) {
  if (!multiSelectionRect) return;
  const x = Math.min(multiSelectionStart.x, currentX);
  const y = Math.min(multiSelectionStart.y, currentY);
  const width = Math.abs(currentX - multiSelectionStart.x);
  const height = Math.abs(currentY - multiSelectionStart.y);
  multiSelectionRect.setAttribute("x", x);
  multiSelectionRect.setAttribute("y", y);
  multiSelectionRect.setAttribute("width", width);
  multiSelectionRect.setAttribute("height", height);
}
function removeMultiSelectionRect() {
  if (multiSelectionRect && multiSelectionRect.parentNode) {
    multiSelectionRect.parentNode.removeChild(multiSelectionRect);
  }
  multiSelectionRect = null;
  clearDragSelectHighlights();
}
function highlightShapesInSelectionRect(currentX, currentY) {
  clearDragSelectHighlights();
  if (!multiSelectionStart) return;
  const selBounds = {
    x: Math.min(multiSelectionStart.x, currentX),
    y: Math.min(multiSelectionStart.y, currentY),
    width: Math.abs(currentX - multiSelectionStart.x),
    height: Math.abs(currentY - multiSelectionStart.y)
  };
  if (selBounds.width < 5 && selBounds.height < 5) return;
  if (typeof shapes !== "undefined") {
    shapes.forEach((shape) => {
      if (isShapeInSelectionRect(shape, selBounds)) {
        if (shape.group && typeof shape.group.getBBox === "function") {
          let bbox;
          try {
            bbox = shape.group.getBBox();
          } catch {
            return;
          }
          const overlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          overlay.setAttribute("x", bbox.x - 2);
          overlay.setAttribute("y", bbox.y - 2);
          overlay.setAttribute("width", bbox.width + 4);
          overlay.setAttribute("height", bbox.height + 4);
          overlay.setAttribute("fill", "rgba(91, 87, 209, 0.12)");
          overlay.setAttribute("stroke", "#5B57D1");
          overlay.setAttribute("stroke-width", "1");
          overlay.setAttribute("stroke-opacity", "0.4");
          overlay.setAttribute("rx", "3");
          overlay.setAttribute("style", "pointer-events: none;");
          overlay.setAttribute("class", "drag-select-highlight");
          shape.group.appendChild(overlay);
          dragSelectHighlights.push(overlay);
        }
      }
    });
  }
}
function clearDragSelectHighlights() {
  dragSelectHighlights.forEach((el) => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
  dragSelectHighlights = [];
}
function isShapeInSelectionRect(shape, selectionBounds) {
  let shapeBounds;
  switch (shape.shapeName) {
    case "rectangle":
      shapeBounds = {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
      break;
    case "circle":
      shapeBounds = {
        x: shape.x - shape.rx,
        y: shape.y - shape.ry,
        width: shape.rx * 2,
        height: shape.ry * 2
      };
      break;
    case "line":
      shapeBounds = {
        x: Math.min(shape.startPoint.x, shape.endPoint.x),
        y: Math.min(shape.startPoint.y, shape.endPoint.y),
        width: Math.abs(shape.endPoint.x - shape.startPoint.x),
        height: Math.abs(shape.endPoint.y - shape.startPoint.y)
      };
      break;
    case "arrow":
      const minX = Math.min(shape.startPoint.x, shape.endPoint.x);
      const minY = Math.min(shape.startPoint.y, shape.endPoint.y);
      const maxX = Math.max(shape.startPoint.x, shape.endPoint.x);
      const maxY = Math.max(shape.startPoint.y, shape.endPoint.y);
      shapeBounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
      break;
    case "freehandStroke":
      shapeBounds = {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
      break;
    case "text":
    case "code":
      const textOrCodeEl = shape.group ? shape.group.querySelector("text") : null;
      if (textOrCodeEl && shape.group.style.display !== "none") {
        try {
          const bbox = textOrCodeEl.getBBox();
          const transform = shape.group.transform.baseVal.consolidate();
          const matrix = transform ? transform.matrix : { e: 0, f: 0 };
          shapeBounds = {
            x: bbox.x + matrix.e,
            y: bbox.y + matrix.f,
            width: bbox.width,
            height: bbox.height
          };
        } catch {
          shapeBounds = { x: 0, y: 0, width: 0, height: 0 };
        }
      } else {
        shapeBounds = { x: 0, y: 0, width: 0, height: 0 };
      }
      break;
    case "image":
      if (shape.element) {
        shapeBounds = {
          x: parseFloat(shape.element.getAttribute("x")),
          y: parseFloat(shape.element.getAttribute("y")),
          width: parseFloat(shape.element.getAttribute("width")),
          height: parseFloat(shape.element.getAttribute("height"))
        };
      } else {
        shapeBounds = { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
      }
      break;
    case "frame":
      shapeBounds = {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
      break;
    case "icon":
      shapeBounds = {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
      break;
    default:
      shapeBounds = {
        x: shape.x || 0,
        y: shape.y || 0,
        width: shape.width || 0,
        height: shape.height || 0
      };
  }
  return !(selectionBounds.x > shapeBounds.x + shapeBounds.width || selectionBounds.x + selectionBounds.width < shapeBounds.x || selectionBounds.y > shapeBounds.y + shapeBounds.height || selectionBounds.y + selectionBounds.height < shapeBounds.y);
}
function selectShapesInRect(selectionBounds) {
  multiSelection.selectShapesInRect(selectionBounds);
}
function clearAllSelections2() {
  multiSelection.clearSelection();
}
function createMultiSelectionControls() {
  multiSelection.updateControls();
}
function removeMultiSelectionControls() {
  multiSelection.removeControls();
}
function isPointInMultiSelection(x, y) {
  return multiSelection.isPointInBounds(x, y);
}
function moveSelectedShapes(dx, dy) {
  multiSelection.move(dx, dy);
}
function handleMultiSelectionMouseDown(e) {
  if (!e.target) return false;
  const { x, y } = getSVGCoordsFromMouse10(e);
  if (multiSelection.selectedShapes.size > 1) {
    const anchor = e.target.closest(".multi-selection-anchor");
    if (anchor) {
      const anchorIndex = parseInt(anchor.getAttribute("data-index"));
      multiSelection.startResize(e, anchorIndex);
      return true;
    }
    if (e.target.closest(".multi-selection-rotation-anchor")) {
      multiSelection.startRotation(e);
      return true;
    }
    let clickedOnSelectedShape = null;
    for (const shape of multiSelection.selectedShapes) {
      if (shape.contains && shape.contains(x, y)) {
        clickedOnSelectedShape = shape;
        break;
      }
    }
    if (clickedOnSelectedShape) {
      if (e.ctrlKey || e.metaKey) {
        multiSelection.removeShape(clickedOnSelectedShape);
        return true;
      }
      multiSelection.startDrag(e);
      return true;
    }
    if (multiSelection.isPointInBounds(x, y)) {
      multiSelection.startDrag(e);
      return true;
    }
  }
  if (e.target.closest(".anchor") || e.target.closest(".rotate-anchor") || e.target.closest(".rotation-anchor")) {
    return false;
  }
  let clickedOnShape = false;
  let clickedShape = null;
  if (typeof shapes !== "undefined") {
    let fallbackFrame = null;
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.contains && shape.contains(x, y)) {
        if (shape.shapeName === "frame") {
          if (!fallbackFrame) {
            fallbackFrame = shape;
          } else {
            const area = (shape.width || 0) * (shape.height || 0);
            const existingArea = (fallbackFrame.width || 0) * (fallbackFrame.height || 0);
            if (area < existingArea) {
              fallbackFrame = shape;
            }
          }
        } else {
          clickedOnShape = true;
          clickedShape = shape;
          break;
        }
      }
    }
    if (!clickedOnShape && fallbackFrame) {
      clickedOnShape = true;
      clickedShape = fallbackFrame;
    }
  }
  if (clickedOnShape && clickedShape) {
    if (e.ctrlKey || e.metaKey) {
      if (multiSelection.selectedShapes.has(clickedShape)) {
        multiSelection.removeShape(clickedShape);
      } else {
        if (currentShape && currentShape !== clickedShape && !multiSelection.selectedShapes.has(currentShape)) {
          multiSelection.addShape(currentShape);
          if (typeof currentShape.removeSelection === "function") currentShape.removeSelection();
        }
        multiSelection.addShape(clickedShape);
      }
      currentShape = null;
      return true;
    }
    if (multiSelection.selectedShapes.size > 1 && multiSelection.selectedShapes.has(clickedShape)) {
      multiSelection.startDrag(e);
      return true;
    }
    if (currentShape === clickedShape) {
      if (multiSelection.selectedShapes.size > 0) {
        multiSelection.clearSelection();
      }
      return false;
    }
    if (currentShape && typeof currentShape.removeSelection === "function") {
      currentShape.removeSelection();
    }
    multiSelection.clearSelection();
    if (clickedShape.groupId && typeof shapes !== "undefined") {
      const mates = shapes.filter((s) => s.groupId === clickedShape.groupId);
      if (mates.length > 1) {
        for (const m of mates) multiSelection.addShape(m);
        currentShape = null;
        multiSelection.startDrag(e);
        return true;
      }
    }
    currentShape = clickedShape;
    if (typeof clickedShape.addAnchors === "function") {
      clickedShape.addAnchors();
      clickedShape.isSelected = true;
    } else if (typeof clickedShape.createSelection === "function") {
      clickedShape.createSelection();
      clickedShape.isSelected = true;
    } else if (typeof clickedShape.selectShape === "function") {
      clickedShape.selectShape();
      clickedShape.isSelected = true;
    } else if (typeof clickedShape.selectFrame === "function") {
      clickedShape.selectFrame();
    }
    if (typeof clickedShape.updateSidebar === "function") {
      clickedShape.updateSidebar();
    }
    return false;
  }
  if (!clickedOnShape) {
    if (typeof currentShape !== "undefined" && currentShape && typeof currentShape.removeSelection === "function") {
      currentShape.removeSelection();
      currentShape = null;
    }
    if (window.__deselectTextElement) {
      window.__deselectTextElement();
    }
    if (typeof disableAllSideBars === "function") {
      disableAllSideBars();
    }
    multiSelectionStart = { x, y };
    isMultiSelecting = true;
    if (typeof svg !== "undefined") {
      svg.style.userSelect = "none";
      svg.style.webkitUserSelect = "none";
    }
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    createMultiSelectionRect(x, y);
    clearAllSelections2();
    return true;
  }
  return false;
}
function handleMultiSelectionMouseMove(e) {
  const { x, y } = getSVGCoordsFromMouse10(e);
  if (multiSelection.isDragging) {
    multiSelection.handleDrag(e);
    return true;
  }
  if (multiSelection.isResizing) {
    multiSelection.handleResize(e);
    return true;
  }
  if (multiSelection.isRotating) {
    multiSelection.handleRotation(e);
    return true;
  }
  if (isMultiSelecting) {
    updateMultiSelectionRect(x, y);
    highlightShapesInSelectionRect(x, y);
    return true;
  }
  if (multiSelection.selectedShapes.size > 1 && multiSelection.isPointInBounds(x, y)) {
    if (typeof svg !== "undefined") {
      svg.style.cursor = "move";
    }
    return true;
  }
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    const overShape = shapes.some((shape) => {
      if (typeof shape.contains === "function") {
        return shape.contains(x, y);
      }
      return false;
    });
    if (overShape && typeof svg !== "undefined") {
      svg.style.cursor = "move";
      return false;
    }
  }
  if (typeof svg !== "undefined" && svg.style.cursor === "move") {
    svg.style.cursor = "default";
  }
  return false;
}
function handleMultiSelectionMouseUp(e) {
  if (multiSelection.isDragging) {
    multiSelection.endDrag();
    return true;
  }
  if (multiSelection.isResizing) {
    multiSelection.isResizing = false;
    multiSelection.resizingAnchorIndex = null;
    multiSelection.initialPositions.clear();
    multiSelection._pushUndoForAll();
    multiSelection.updateControls();
    return true;
  }
  if (multiSelection.isRotating) {
    multiSelection.isRotating = false;
    multiSelection.initialPositions.clear();
    multiSelection._pushUndoForAll();
    return true;
  }
  if (isMultiSelecting) {
    const { x, y } = getSVGCoordsFromMouse10(e);
    const selectionBounds = {
      x: Math.min(multiSelectionStart.x, x),
      y: Math.min(multiSelectionStart.y, y),
      width: Math.abs(x - multiSelectionStart.x),
      height: Math.abs(y - multiSelectionStart.y)
    };
    if (selectionBounds.width > 5 && selectionBounds.height > 5) {
      let shapesInBounds = [];
      if (typeof shapes !== "undefined") {
        shapes.forEach((shape) => {
          if (isShapeInSelectionRect(shape, selectionBounds)) {
            shapesInBounds.push(shape);
          }
        });
      }
      if (shapesInBounds.length === 1) {
        const selectedShape = shapesInBounds[0];
        multiSelection.clearSelection();
        if (typeof currentShape !== "undefined") {
          currentShape = selectedShape;
        }
        if (typeof selectedShape.addAnchors === "function") {
          selectedShape.addAnchors();
          selectedShape.isSelected = true;
        } else if (typeof selectedShape.createSelection === "function") {
          selectedShape.createSelection();
          selectedShape.isSelected = true;
        } else if (typeof selectedShape.selectShape === "function") {
          selectedShape.selectShape();
          selectedShape.isSelected = true;
        }
        if (typeof selectedShape.updateSidebar === "function") {
          selectedShape.updateSidebar();
        }
      } else if (shapesInBounds.length > 1) {
        multiSelection.selectShapesInRect(selectionBounds);
      }
    }
    removeMultiSelectionRect();
    isMultiSelecting = false;
    isDraggingMultiSelection = false;
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    if (typeof svg !== "undefined") {
      svg.style.userSelect = "";
      svg.style.webkitUserSelect = "";
    }
    return true;
  }
  isMultiSelecting = false;
  isDraggingMultiSelection = false;
  document.body.style.userSelect = "";
  document.body.style.webkitUserSelect = "";
  if (typeof svg !== "undefined") {
    svg.style.userSelect = "";
    svg.style.webkitUserSelect = "";
  }
  return false;
}
function deleteSelectedShapes() {
  if (multiSelection.selectedShapes.size === 0) return;
  const shapesToDelete = Array.from(multiSelection.selectedShapes);
  multiSelection.clearSelection();
  shapesToDelete.forEach((shape) => {
    if (shape.group && shape.group.parentNode) {
      shape.group.parentNode.removeChild(shape.group);
    } else if (shape.element && shape.element.parentNode) {
      shape.element.parentNode.removeChild(shape.element);
    }
    if (shape.parentFrame && typeof shape.parentFrame.removeShapeFromFrame === "function") {
      shape.parentFrame.removeShapeFromFrame(shape);
    }
    cleanupAttachments2(shape);
    if (shape.shapeName === "frame" && typeof shape.destroy === "function") {
      shape.destroy();
    }
    const idx = shapes.indexOf(shape);
    if (idx !== -1) {
      shapes.splice(idx, 1);
    }
  });
}
function frameSelectedShapes() {
  if (multiSelection.selectedShapes.size < 2) return;
  const bounds = multiSelection.getBounds();
  if (!bounds) return;
  const padding = 20;
  const fx = bounds.x - padding;
  const fy = bounds.y - padding;
  const fw = bounds.width + padding * 2;
  const fh = bounds.height + padding * 2;
  const FrameClass = window.Frame;
  if (!FrameClass) {
    console.warn("[Selection] Frame class not available");
    return;
  }
  const frame = new FrameClass(fx, fy, fw, fh);
  shapes.push(frame);
  if (window.historyStack) {
    window.historyStack.push({
      type: window.ACTION_CREATE || "create",
      shape: frame,
      shapeName: "frame"
    });
  }
  const shapesToFrame = Array.from(multiSelection.selectedShapes);
  multiSelection.clearSelection();
  for (const shape of shapesToFrame) {
    frame.addShapeToFrame(shape);
  }
  const frameEl = frame.group;
  if (frameEl && frameEl.parentNode) {
    const frameIdx = shapes.indexOf(frame);
    if (frameIdx > 0) {
      shapes.splice(frameIdx, 1);
      let earliest = shapes.length;
      for (const s of shapesToFrame) {
        const idx = shapes.indexOf(s);
        if (idx >= 0 && idx < earliest) earliest = idx;
      }
      shapes.splice(earliest, 0, frame);
    }
  }
  if (typeof frame.selectFrame === "function") {
    frame.selectFrame();
  }
  currentShape = frame;
}
var isMultiSelecting, multiSelectionStart, multiSelectionRect, isDraggingMultiSelection, dragSelectHighlights, MultiSelection, multiSelection;
var init_Selection = __esm({
  "src/core/Selection.js"() {
    init_arrowTool();
    init_UndoRedo();
    init_SnapGuides();
    isMultiSelecting = false;
    multiSelectionStart = { x: 0, y: 0 };
    multiSelectionRect = null;
    isDraggingMultiSelection = false;
    dragSelectHighlights = [];
    MultiSelection = class {
      constructor() {
        this.selectedShapes = /* @__PURE__ */ new Set();
        this.group = null;
        this.anchors = [];
        this.outline = null;
        this.rotationAnchor = null;
        this.rotationLine = null;
        this.selectionPadding = 12;
        this.bounds = null;
        this.initialPositions = /* @__PURE__ */ new Map();
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
        this.resizingAnchorIndex = null;
        this.dragStart = { x: 0, y: 0 };
        this.rotationCenter = { x: 0, y: 0 };
        this.startRotationMouseAngle = 0;
        this._undoSnapshots = /* @__PURE__ */ new Map();
        this.initialRotation = 0;
      }
      // Capture current state of all selected shapes for undo
      _snapshotForUndo() {
        this._undoSnapshots.clear();
        this.selectedShapes.forEach((shape) => {
          this._undoSnapshots.set(shape, this._captureShapeState(shape));
        });
      }
      _captureShapeState(shape) {
        switch (shape.shapeName) {
          case "line":
          case "arrow":
            return {
              startPoint: { ...shape.startPoint },
              endPoint: { ...shape.endPoint },
              x: shape.x,
              y: shape.y,
              width: shape.width || 0,
              height: shape.height || 0,
              rotation: shape.rotation || 0
            };
          case "circle":
            return { x: shape.x, y: shape.y, rx: shape.rx, ry: shape.ry, rotation: shape.rotation || 0, width: shape.width, height: shape.height };
          case "freehandStroke":
            return { x: shape.x, y: shape.y, width: shape.width, height: shape.height, rotation: shape.rotation || 0, points: JSON.parse(JSON.stringify(shape.points)) };
          default:
            return { x: shape.x || 0, y: shape.y || 0, width: shape.width || 0, height: shape.height || 0, rotation: shape.rotation || 0 };
        }
      }
      // Push undo actions for all shapes that changed
      _pushUndoForAll() {
        this.selectedShapes.forEach((shape) => {
          const oldState = this._undoSnapshots.get(shape);
          if (!oldState) return;
          const newState = this._captureShapeState(shape);
          const changed = Object.keys(oldState).some((key) => {
            if (key === "points" || key === "startPoint" || key === "endPoint") return JSON.stringify(oldState[key]) !== JSON.stringify(newState[key]);
            return oldState[key] !== newState[key];
          });
          if (changed) {
            pushTransformAction2(shape, oldState, newState);
          }
        });
        this._undoSnapshots.clear();
      }
      addShape(shape) {
        this.selectedShapes.add(shape);
        shape.isSelected = true;
        this.updateControls();
      }
      removeShape(shape) {
        this.selectedShapes.delete(shape);
        shape.isSelected = false;
        if (this.selectedShapes.size === 0) {
          this.clearSelection();
        } else {
          this.updateControls();
        }
      }
      clearSelection() {
        this.selectedShapes.forEach((shape) => {
          shape.isSelected = false;
          if (typeof shape.removeSelection === "function") {
            shape.removeSelection();
          }
        });
        this.selectedShapes.clear();
        this.removeControls();
        if (typeof currentShape !== "undefined") {
          currentShape = null;
        }
        if (typeof disableAllSideBars === "function") {
          disableAllSideBars();
        }
      }
      selectShapesInRect(selectionBounds) {
        this.clearSelection();
        if (typeof shapes !== "undefined") {
          shapes.forEach((shape) => {
            if (isShapeInSelectionRect(shape, selectionBounds)) {
              this.addShape(shape);
            }
          });
        }
        if (this.selectedShapes.size === 1) {
          if (typeof currentShape !== "undefined") {
            currentShape = Array.from(this.selectedShapes)[0];
          }
        } else {
          if (typeof currentShape !== "undefined") {
            currentShape = null;
          }
        }
      }
      getBounds() {
        if (this.selectedShapes.size === 0) return null;
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        this.selectedShapes.forEach((shape) => {
          const shapeBounds = this.getShapeBounds(shape);
          minX = Math.min(minX, shapeBounds.x);
          minY = Math.min(minY, shapeBounds.y);
          maxX = Math.max(maxX, shapeBounds.x + shapeBounds.width);
          maxY = Math.max(maxY, shapeBounds.y + shapeBounds.height);
        });
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      }
      getShapeBounds(shape) {
        switch (shape.shapeName) {
          case "rectangle":
          case "frame":
            return {
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height
            };
          case "circle":
            return {
              x: shape.x - shape.rx,
              y: shape.y - shape.ry,
              width: shape.rx * 2,
              height: shape.ry * 2
            };
          case "line":
          case "arrow":
            return {
              x: Math.min(shape.startPoint.x, shape.endPoint.x),
              y: Math.min(shape.startPoint.y, shape.endPoint.y),
              width: Math.abs(shape.endPoint.x - shape.startPoint.x),
              height: Math.abs(shape.endPoint.y - shape.startPoint.y)
            };
          case "freehandStroke":
            return {
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height
            };
          case "text":
            const textElement = shape.group ? shape.group.querySelector("text") : null;
            if (textElement) {
              const bbox = textElement.getBBox();
              const transform = shape.group.transform.baseVal.consolidate();
              const matrix = transform ? transform.matrix : { e: 0, f: 0 };
              return {
                x: bbox.x + matrix.e,
                y: bbox.y + matrix.f,
                width: bbox.width,
                height: bbox.height
              };
            }
            return { x: 0, y: 0, width: 0, height: 0 };
          case "image":
            if (shape.element) {
              return {
                x: parseFloat(shape.element.getAttribute("x")),
                y: parseFloat(shape.element.getAttribute("y")),
                width: parseFloat(shape.element.getAttribute("width")),
                height: parseFloat(shape.element.getAttribute("height"))
              };
            }
            return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
          case "icon":
            return {
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height
            };
          default:
            return {
              x: shape.x || 0,
              y: shape.y || 0,
              width: shape.width || 0,
              height: shape.height || 0
            };
        }
      }
      updateControls() {
        this.removeControls();
        if (this.selectedShapes.size === 0) return;
        this.bounds = this.getBounds();
        if (!this.bounds) return;
        this.createControls();
      }
      createControls() {
        this.createRotatedControls(0);
      }
      createOutline(x, y, width, height) {
        const zoom = window.currentZoom || 1;
        const outlinePoints = [
          [x, y],
          [x + width, y],
          [x + width, y + height],
          [x, y + height],
          [x, y]
        ];
        this.outline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.outline.setAttribute("points", outlinePoints.map((p) => p.join(",")).join(" "));
        this.outline.setAttribute("fill", "none");
        this.outline.setAttribute("stroke", "#5B57D1");
        this.outline.setAttribute("stroke-width", 2);
        this.outline.setAttribute("stroke-dasharray", `${8 / zoom} ${4 / zoom}`);
        this.outline.setAttribute("vector-effect", "non-scaling-stroke");
        this.outline.setAttribute("style", "pointer-events: none;");
        this.group.appendChild(this.outline);
      }
      createResizeAnchors(x, y, width, height) {
        const zoom = window.currentZoom || 1;
        const anchorSize = 12 / zoom;
        const anchorPositions = [
          { x, y, index: 0 },
          { x: x + width, y, index: 1 },
          { x, y: y + height, index: 2 },
          { x: x + width, y: y + height, index: 3 },
          { x: x + width / 2, y, index: 4 },
          { x: x + width / 2, y: y + height, index: 5 },
          { x, y: y + height / 2, index: 6 },
          { x: x + width, y: y + height / 2, index: 7 }
        ];
        this.anchors = [];
        anchorPositions.forEach((pos) => {
          const anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          anchor.setAttribute("x", pos.x - anchorSize / 2);
          anchor.setAttribute("y", pos.y - anchorSize / 2);
          anchor.setAttribute("width", anchorSize);
          anchor.setAttribute("height", anchorSize);
          anchor.setAttribute("class", "multi-selection-anchor");
          anchor.setAttribute("data-index", pos.index);
          anchor.setAttribute("fill", "#121212");
          anchor.setAttribute("stroke", "#5B57D1");
          anchor.setAttribute("stroke-width", 2);
          anchor.setAttribute("vector-effect", "non-scaling-stroke");
          anchor.setAttribute("style", "pointer-events: all; cursor: pointer;");
          const cursors = ["nw-resize", "ne-resize", "sw-resize", "se-resize", "n-resize", "s-resize", "w-resize", "e-resize"];
          anchor.style.cursor = cursors[pos.index];
          anchor.addEventListener("pointerdown", (e) => this.startResize(e, pos.index));
          this.group.appendChild(anchor);
          this.anchors.push(anchor);
        });
      }
      createRotationAnchor(x, y, width, height) {
        const zoom = window.currentZoom || 1;
        const rotationAnchorPos = { x: x + width / 2, y: y - 30 / zoom };
        this.rotationAnchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rotationAnchor.setAttribute("cx", rotationAnchorPos.x);
        this.rotationAnchor.setAttribute("cy", rotationAnchorPos.y);
        this.rotationAnchor.setAttribute("r", 8 / zoom);
        this.rotationAnchor.setAttribute("class", "multi-selection-rotation-anchor");
        this.rotationAnchor.setAttribute("fill", "#121212");
        this.rotationAnchor.setAttribute("stroke", "#5B57D1");
        this.rotationAnchor.setAttribute("stroke-width", 2);
        this.rotationAnchor.setAttribute("vector-effect", "non-scaling-stroke");
        this.rotationAnchor.setAttribute("style", "pointer-events: all; cursor: grab;");
        this.rotationAnchor.addEventListener("pointerdown", (e) => this.startRotation(e));
        this.rotationLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.rotationLine.setAttribute("x1", rotationAnchorPos.x);
        this.rotationLine.setAttribute("y1", rotationAnchorPos.y);
        this.rotationLine.setAttribute("x2", x + width / 2);
        this.rotationLine.setAttribute("y2", y);
        this.rotationLine.setAttribute("stroke", "#5B57D1");
        this.rotationLine.setAttribute("stroke-width", 1);
        this.rotationLine.setAttribute("stroke-dasharray", `${3 / zoom} ${3 / zoom}`);
        this.rotationLine.setAttribute("vector-effect", "non-scaling-stroke");
        this.rotationLine.setAttribute("style", "pointer-events: none;");
        this.group.appendChild(this.rotationLine);
        this.group.appendChild(this.rotationAnchor);
      }
      removeControls() {
        if (this.group && this.group.parentNode) {
          this.group.parentNode.removeChild(this.group);
        }
        this.group = null;
        this.anchors = [];
        this.outline = null;
        this.rotationAnchor = null;
        this.rotationLine = null;
      }
      isPointInBounds(x, y) {
        if (!this.bounds) return false;
        const padding = this.selectionPadding;
        return x >= this.bounds.x - padding && x <= this.bounds.x + this.bounds.width + padding && y >= this.bounds.y - padding && y <= this.bounds.y + this.bounds.height + padding;
      }
      move(dx, dy) {
        this.selectedShapes.forEach((shape) => {
          if (shape.parentFrame && this.selectedShapes.has(shape.parentFrame)) {
            return;
          }
          if (typeof shape.move === "function") {
            shape.move(dx, dy);
          }
          if (typeof shape.updateAttachedArrows === "function") {
            shape.updateAttachedArrows();
          }
        });
        this.updateControls();
      }
      startRotation(e) {
        e.stopPropagation();
        e.preventDefault();
        this.isRotating = true;
        const currentBounds = this.getBounds();
        this.rotationCenter = {
          x: currentBounds.x + currentBounds.width / 2,
          y: currentBounds.y + currentBounds.height / 2
        };
        const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse10(e);
        this.startRotationMouseAngle = Math.atan2(mouseY - this.rotationCenter.y, mouseX - this.rotationCenter.x) * 180 / Math.PI;
        this.storeInitialPositions();
        this._snapshotForUndo();
        const onMouseMove = (event) => {
          if (this.isRotating) {
            this.handleRotation(event);
          }
        };
        const onMouseUp = () => {
          this.isRotating = false;
          this.initialPositions.clear();
          this._pushUndoForAll();
          if (typeof svg !== "undefined") {
            svg.removeEventListener("pointermove", onMouseMove);
            svg.removeEventListener("pointerup", onMouseUp);
            svg.style.cursor = "default";
          }
        };
        if (typeof svg !== "undefined") {
          svg.addEventListener("pointermove", onMouseMove);
          svg.addEventListener("pointerup", onMouseUp);
          svg.style.cursor = "grabbing";
        }
      }
      storeInitialPositions() {
        this.initialPositions.clear();
        const initialBounds = this.getBounds();
        this.initialPositions.set("initialBounds", {
          x: initialBounds.x,
          y: initialBounds.y,
          width: initialBounds.width,
          height: initialBounds.height
        });
        this.selectedShapes.forEach((shape) => {
          let shapeData;
          let shapeCenterX, shapeCenterY;
          switch (shape.shapeName) {
            case "rectangle":
            case "frame":
              shapeCenterX = shape.x + shape.width / 2;
              shapeCenterY = shape.y + shape.height / 2;
              shapeData = {
                x: shape.x,
                y: shape.y,
                width: shape.width || 0,
                height: shape.height || 0,
                rotation: shape.rotation || 0,
                centerX: shapeCenterX,
                centerY: shapeCenterY,
                relativeX: shapeCenterX - this.rotationCenter.x,
                relativeY: shapeCenterY - this.rotationCenter.y
              };
              break;
            case "icon":
              shapeCenterX = shape.x + shape.width / 2;
              shapeCenterY = shape.y + shape.height / 2;
              shapeData = {
                x: shape.x,
                y: shape.y,
                width: shape.width || 0,
                height: shape.height || 0,
                rotation: shape.rotation || 0,
                centerX: shapeCenterX,
                centerY: shapeCenterY,
                relativeX: shapeCenterX - this.rotationCenter.x,
                relativeY: shapeCenterY - this.rotationCenter.y
              };
              break;
            case "circle":
              shapeCenterX = shape.x;
              shapeCenterY = shape.y;
              shapeData = {
                x: shape.x,
                y: shape.y,
                rx: shape.rx || 0,
                ry: shape.ry || 0,
                rotation: shape.rotation || 0,
                centerX: shapeCenterX,
                centerY: shapeCenterY,
                relativeX: shapeCenterX - this.rotationCenter.x,
                relativeY: shapeCenterY - this.rotationCenter.y
              };
              break;
            case "line":
            case "arrow":
              shapeData = {
                startPoint: { ...shape.startPoint },
                endPoint: { ...shape.endPoint },
                relativeStartX: shape.startPoint.x - this.rotationCenter.x,
                relativeStartY: shape.startPoint.y - this.rotationCenter.y,
                relativeEndX: shape.endPoint.x - this.rotationCenter.x,
                relativeEndY: shape.endPoint.y - this.rotationCenter.y
              };
              break;
            case "freehandStroke":
              if (!shape.points || !Array.isArray(shape.points) || shape.points.length === 0) {
                console.warn("FreehandStroke has invalid points array");
                return;
              }
              const validPoints = shape.points.filter(
                (point) => Array.isArray(point) && point.length >= 2 && typeof point[0] === "number" && typeof point[1] === "number" && !isNaN(point[0]) && !isNaN(point[1])
              );
              if (validPoints.length === 0) {
                console.warn("FreehandStroke has no valid points");
                return;
              }
              if (typeof shape.updateBoundingBox === "function") {
                shape.updateBoundingBox();
              }
              const boundingBox = this.getShapeBounds(shape);
              shapeData = {
                x: boundingBox.x || 0,
                y: boundingBox.y || 0,
                width: boundingBox.width || 0,
                height: boundingBox.height || 0,
                points: validPoints.map((point) => [point[0], point[1], point[2] || 0.5]),
                relativePoints: validPoints.map((point) => [
                  point[0] - this.rotationCenter.x,
                  point[1] - this.rotationCenter.y,
                  point[2] || 0.5
                ]),
                boundingBox: { ...boundingBox }
              };
              break;
            case "text":
              const textBounds = this.getShapeBounds(shape);
              shapeCenterX = textBounds.x + textBounds.width / 2;
              shapeCenterY = textBounds.y + textBounds.height / 2;
              const currentTransform = shape.group.transform.baseVal.consolidate();
              const currentX = currentTransform ? currentTransform.matrix.e : 0;
              const currentY = currentTransform ? currentTransform.matrix.f : 0;
              shapeData = {
                x: currentX,
                y: currentY,
                width: shape.width || textBounds.width,
                height: shape.height || textBounds.height,
                rotation: shape.rotation || 0,
                centerX: shapeCenterX,
                centerY: shapeCenterY,
                relativeX: shapeCenterX - this.rotationCenter.x,
                relativeY: shapeCenterY - this.rotationCenter.y,
                visualBounds: textBounds,
                transformX: currentX,
                transformY: currentY
              };
              break;
            case "image":
              shapeCenterX = shape.x + (shape.width || 0) / 2;
              shapeCenterY = shape.y + (shape.height || 0) / 2;
              shapeData = {
                x: shape.x || 0,
                y: shape.y || 0,
                width: shape.width || 0,
                height: shape.height || 0,
                rotation: shape.rotation || 0,
                centerX: shapeCenterX,
                centerY: shapeCenterY,
                relativeX: shapeCenterX - this.rotationCenter.x,
                relativeY: shapeCenterY - this.rotationCenter.y
              };
              break;
            default:
              shapeCenterX = (shape.x || 0) + (shape.width || 0) / 2;
              shapeCenterY = (shape.y || 0) + (shape.height || 0) / 2;
              shapeData = {
                x: shape.x || 0,
                y: shape.y || 0,
                width: shape.width || 0,
                height: shape.height || 0,
                rotation: shape.rotation || 0,
                centerX: shapeCenterX,
                centerY: shapeCenterY,
                relativeX: shapeCenterX - this.rotationCenter.x,
                relativeY: shapeCenterY - this.rotationCenter.y
              };
          }
          if (shapeData) {
            this.initialPositions.set(shape, shapeData);
          }
        });
      }
      handleRotation(e) {
        const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse10(e);
        const currentMouseAngle = Math.atan2(mouseY - this.rotationCenter.y, mouseX - this.rotationCenter.x) * 180 / Math.PI;
        const angleDiff = currentMouseAngle - this.startRotationMouseAngle;
        const angleRad = angleDiff * Math.PI / 180;
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);
        this.selectedShapes.forEach((shape) => {
          const initialData = this.initialPositions.get(shape);
          if (!initialData) return;
          if (typeof shape.removeSelection === "function") {
            shape.removeSelection();
          }
          switch (shape.shapeName) {
            case "rectangle":
            case "frame":
            case "image":
            case "icon":
              const newCenterX = this.rotationCenter.x + (initialData.relativeX * cosAngle - initialData.relativeY * sinAngle);
              const newCenterY = this.rotationCenter.y + (initialData.relativeX * sinAngle + initialData.relativeY * cosAngle);
              shape.x = newCenterX - initialData.width / 2;
              shape.y = newCenterY - initialData.height / 2;
              shape.rotation = (initialData.rotation || 0) + angleDiff;
              if (typeof shape.rotate === "function") {
                shape.rotate(shape.rotation);
              }
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "text":
              const newTextCenterX = this.rotationCenter.x + (initialData.relativeX * cosAngle - initialData.relativeY * sinAngle);
              const newTextCenterY = this.rotationCenter.y + (initialData.relativeX * sinAngle + initialData.relativeY * cosAngle);
              const textElement = shape.group.querySelector("text");
              if (textElement) {
                const initialBbox = initialData.visualBounds;
                const newTransformX = newTextCenterX - initialBbox.width / 2;
                const newTransformY = newTextCenterY - initialBbox.height / 2;
                const newRotation = (initialData.rotation || 0) + angleDiff;
                const textCenterX = initialBbox.width / 2;
                const textCenterY = initialBbox.height / 2;
                shape.group.setAttribute(
                  "transform",
                  `translate(${newTransformX}, ${newTransformY}) rotate(${newRotation}, ${textCenterX}, ${textCenterY})`
                );
                shape.x = newTransformX;
                shape.y = newTransformY;
                shape.rotation = newRotation;
              }
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "circle":
              const newCircleCenterX = this.rotationCenter.x + (initialData.relativeX * cosAngle - initialData.relativeY * sinAngle);
              const newCircleCenterY = this.rotationCenter.y + (initialData.relativeX * sinAngle + initialData.relativeY * cosAngle);
              shape.x = newCircleCenterX;
              shape.y = newCircleCenterY;
              shape.rotation = (initialData.rotation || 0) + angleDiff;
              if (typeof shape.rotate === "function") {
                shape.rotate(shape.rotation);
              }
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "line":
            case "arrow":
              const newStartX = this.rotationCenter.x + (initialData.relativeStartX * cosAngle - initialData.relativeStartY * sinAngle);
              const newStartY = this.rotationCenter.y + (initialData.relativeStartX * sinAngle + initialData.relativeStartY * cosAngle);
              const newEndX = this.rotationCenter.x + (initialData.relativeEndX * cosAngle - initialData.relativeEndY * sinAngle);
              const newEndY = this.rotationCenter.y + (initialData.relativeEndX * sinAngle + initialData.relativeEndY * cosAngle);
              shape.startPoint.x = newStartX;
              shape.startPoint.y = newStartY;
              shape.endPoint.x = newEndX;
              shape.endPoint.y = newEndY;
              if (shape.shapeName === "arrow" && shape.arrowCurved && typeof shape.initializeCurveControlPoints === "function") {
                shape.initializeCurveControlPoints();
              }
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
            case "freehandStroke":
              if (!initialData.relativePoints || !Array.isArray(initialData.relativePoints)) {
                console.warn("FreehandStroke missing valid relativePoints");
                break;
              }
              const rotatedPoints = initialData.relativePoints.map((relPoint) => {
                if (!Array.isArray(relPoint) || relPoint.length < 2 || typeof relPoint[0] !== "number" || typeof relPoint[1] !== "number" || isNaN(relPoint[0]) || isNaN(relPoint[1])) {
                  console.warn("Invalid relative point:", relPoint);
                  return [0, 0, 0.5];
                }
                const newX = this.rotationCenter.x + (relPoint[0] * cosAngle - relPoint[1] * sinAngle);
                const newY = this.rotationCenter.y + (relPoint[0] * sinAngle + relPoint[1] * cosAngle);
                if (isNaN(newX) || isNaN(newY)) {
                  console.warn("Generated NaN coordinates:", { newX, newY, relPoint, rotationCenter: this.rotationCenter });
                  return [0, 0, 0.5];
                }
                return [newX, newY, relPoint[2] || 0.5];
              });
              shape.points = rotatedPoints.filter(
                (point) => Array.isArray(point) && point.length >= 2 && typeof point[0] === "number" && typeof point[1] === "number" && !isNaN(point[0]) && !isNaN(point[1])
              );
              if (shape.points.length === 0) {
                console.warn("No valid points after rotation");
                shape.points = [[0, 0, 0.5]];
              }
              if (typeof shape.updateBoundingBox === "function") {
                shape.updateBoundingBox();
              }
              if (typeof shape.draw === "function") {
                shape.draw();
              }
              break;
          }
          if (typeof shape.updateAttachedArrows === "function") {
            shape.updateAttachedArrows();
          }
        });
        this.updateControlsAfterRotation();
      }
      updateControlsAfterRotation() {
        this.removeControls();
        if (this.selectedShapes.size === 0) return;
        this.bounds = this.getBounds();
        if (!this.bounds) {
          return;
        }
        this.createControls();
      }
      createRotatedControls(angleDiff = 0) {
        this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.group.setAttribute("id", "multi-selection-controls");
        if (angleDiff !== 0) {
          const centerX = this.bounds.x + this.bounds.width / 2;
          const centerY = this.bounds.y + this.bounds.height / 2;
          this.group.setAttribute("transform", `rotate(${angleDiff} ${centerX} ${centerY})`);
        }
        if (typeof svg !== "undefined") {
          svg.appendChild(this.group);
        }
        if (this.selectedShapes.size > 1) {
          this.selectedShapes.forEach((shape) => {
            const b = this.getShapeBounds(shape);
            if (!b || b.width === 0 && b.height === 0) return;
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", b.x - 3);
            rect.setAttribute("y", b.y - 3);
            rect.setAttribute("width", b.width + 6);
            rect.setAttribute("height", b.height + 6);
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", "#5B57D1");
            rect.setAttribute("stroke-width", 1);
            rect.setAttribute("stroke-opacity", 0.35);
            rect.setAttribute("stroke-dasharray", "4 3");
            rect.setAttribute("rx", 3);
            rect.setAttribute("style", "pointer-events: none;");
            this.group.appendChild(rect);
          });
        }
        const expandedX = this.bounds.x - this.selectionPadding;
        const expandedY = this.bounds.y - this.selectionPadding;
        const expandedWidth = this.bounds.width + 2 * this.selectionPadding;
        const expandedHeight = this.bounds.height + 2 * this.selectionPadding;
        this.createOutline(expandedX, expandedY, expandedWidth, expandedHeight);
        this.createResizeAnchors(expandedX, expandedY, expandedWidth, expandedHeight);
        this.createRotationAnchor(expandedX, expandedY, expandedWidth, expandedHeight);
      }
      startResize(e, anchorIndex) {
        e.stopPropagation();
        e.preventDefault();
        this.isResizing = true;
        this.resizingAnchorIndex = anchorIndex;
        this._snapshotForUndo();
        this.initialPositions.clear();
        const initialBounds = this.getBounds();
        this.selectedShapes.forEach((shape) => {
          let shapeData;
          shape.removeSelection();
          switch (shape.shapeName) {
            case "rectangle":
            case "icon":
              shapeData = {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                rotation: shape.rotation
              };
              break;
            case "circle":
              shapeData = {
                x: shape.x,
                y: shape.y,
                rx: shape.rx,
                ry: shape.ry,
                rotation: shape.rotation
              };
              break;
            case "line":
            case "arrow":
              shapeData = {
                startPoint: { ...shape.startPoint },
                endPoint: { ...shape.endPoint }
              };
              break;
            default:
              shapeData = {
                x: shape.x || 0,
                y: shape.y || 0,
                width: shape.width || 0,
                height: shape.height || 0
              };
          }
          this.initialPositions.set(shape, shapeData);
        });
        this.initialPositions.set("bounds", initialBounds);
        const onMouseMove = (event) => {
          if (this.isResizing) {
            this.handleResize(event);
          }
        };
        const onMouseUp = () => {
          this.isResizing = false;
          this.resizingAnchorIndex = null;
          this.initialPositions.clear();
          this._pushUndoForAll();
          if (typeof svg !== "undefined") {
            svg.removeEventListener("pointermove", onMouseMove);
            svg.removeEventListener("pointerup", onMouseUp);
            svg.style.cursor = "default";
          }
        };
        if (typeof svg !== "undefined") {
          svg.addEventListener("pointermove", onMouseMove);
          svg.addEventListener("pointerup", onMouseUp);
        }
      }
      handleResize(e) {
        const { x: mouseX, y: mouseY } = getSVGCoordsFromMouse10(e);
        const initialBounds = this.initialPositions.get("bounds");
        if (!initialBounds) return;
        let scaleX = 1, scaleY = 1;
        let newBounds = { ...initialBounds };
        switch (this.resizingAnchorIndex) {
          case 0:
            scaleX = (initialBounds.x + initialBounds.width - mouseX) / initialBounds.width;
            scaleY = (initialBounds.y + initialBounds.height - mouseY) / initialBounds.height;
            newBounds.x = mouseX;
            newBounds.y = mouseY;
            newBounds.width = initialBounds.x + initialBounds.width - mouseX;
            newBounds.height = initialBounds.y + initialBounds.height - mouseY;
            break;
          case 1:
            scaleX = (mouseX - initialBounds.x) / initialBounds.width;
            scaleY = (initialBounds.y + initialBounds.height - mouseY) / initialBounds.height;
            newBounds.y = mouseY;
            newBounds.width = mouseX - initialBounds.x;
            newBounds.height = initialBounds.y + initialBounds.height - mouseY;
            break;
          case 2:
            scaleX = (initialBounds.x + initialBounds.width - mouseX) / initialBounds.width;
            scaleY = (mouseY - initialBounds.y) / initialBounds.height;
            newBounds.x = mouseX;
            newBounds.width = initialBounds.x + initialBounds.width - mouseX;
            newBounds.height = mouseY - initialBounds.y;
            break;
          case 3:
            scaleX = (mouseX - initialBounds.x) / initialBounds.width;
            scaleY = (mouseY - initialBounds.y) / initialBounds.height;
            newBounds.width = mouseX - initialBounds.x;
            newBounds.height = mouseY - initialBounds.y;
            break;
          case 4:
            scaleY = (initialBounds.y + initialBounds.height - mouseY) / initialBounds.height;
            newBounds.y = mouseY;
            newBounds.height = initialBounds.y + initialBounds.height - mouseY;
            break;
          case 5:
            scaleY = (mouseY - initialBounds.y) / initialBounds.height;
            newBounds.height = mouseY - initialBounds.y;
            break;
          case 6:
            scaleX = (initialBounds.x + initialBounds.width - mouseX) / initialBounds.width;
            newBounds.x = mouseX;
            newBounds.width = initialBounds.x + initialBounds.width - mouseX;
            break;
          case 7:
            scaleX = (mouseX - initialBounds.x) / initialBounds.width;
            newBounds.width = mouseX - initialBounds.x;
            break;
        }
        scaleX = Math.max(0.1, Math.abs(scaleX));
        scaleY = Math.max(0.1, Math.abs(scaleY));
        this.selectedShapes.forEach((shape) => {
          const initialData = this.initialPositions.get(shape);
          if (!initialData) return;
          switch (shape.shapeName) {
            case "rectangle":
            case "icon":
              const relX = (initialData.x - initialBounds.x) / initialBounds.width;
              const relY = (initialData.y - initialBounds.y) / initialBounds.height;
              const relW = initialData.width / initialBounds.width;
              const relH = initialData.height / initialBounds.height;
              shape.x = newBounds.x + relX * newBounds.width;
              shape.y = newBounds.y + relY * newBounds.height;
              shape.width = relW * newBounds.width;
              shape.height = relH * newBounds.height;
              shape._skipAnchors = true;
              shape.draw();
              shape._skipAnchors = false;
              break;
            case "circle":
              const relXCircle = (initialData.x - initialBounds.x) / initialBounds.width;
              const relYCircle = (initialData.y - initialBounds.y) / initialBounds.height;
              shape.x = newBounds.x + relXCircle * newBounds.width;
              shape.y = newBounds.y + relYCircle * newBounds.height;
              shape.rx = initialData.rx * scaleX;
              shape.ry = initialData.ry * scaleY;
              shape._skipAnchors = true;
              shape.draw();
              shape._skipAnchors = false;
              break;
            case "line":
            case "arrow":
              const relStartX = (initialData.startPoint.x - initialBounds.x) / initialBounds.width;
              const relStartY = (initialData.startPoint.y - initialBounds.y) / initialBounds.height;
              const relEndX = (initialData.endPoint.x - initialBounds.x) / initialBounds.width;
              const relEndY = (initialData.endPoint.y - initialBounds.y) / initialBounds.height;
              shape.startPoint.x = newBounds.x + relStartX * newBounds.width;
              shape.startPoint.y = newBounds.y + relStartY * newBounds.height;
              shape.endPoint.x = newBounds.x + relEndX * newBounds.width;
              shape.endPoint.y = newBounds.y + relEndY * newBounds.height;
              if (shape.shapeName === "arrow" && shape.arrowCurved) {
                if (typeof shape.initializeCurveControlPoints === "function") {
                  shape.initializeCurveControlPoints();
                }
              }
              shape.draw();
              break;
            default:
              const relXDefault = (initialData.x - initialBounds.x) / initialBounds.width;
              const relYDefault = (initialData.y - initialBounds.y) / initialBounds.height;
              const relWDefault = initialData.width / initialBounds.width;
              const relHDefault = initialData.height / initialBounds.height;
              shape.x = newBounds.x + relXDefault * newBounds.width;
              shape.y = newBounds.y + relYDefault * newBounds.height;
              if (shape.width !== void 0) shape.width = relWDefault * newBounds.width;
              if (shape.height !== void 0) shape.height = relHDefault * newBounds.height;
              if (typeof shape.draw === "function") {
                shape._skipAnchors = true;
                shape.draw();
                shape._skipAnchors = false;
              }
          }
          if (typeof shape.updateAttachedArrows === "function") {
            shape.updateAttachedArrows();
          }
        });
        this.updateControls();
      }
      startDrag(e) {
        this.isDragging = true;
        isDraggingMultiSelection = true;
        const { x, y } = getSVGCoordsFromMouse10(e);
        this.dragStart = { x, y };
        this._snapshotForUndo();
        this.initialPositions.clear();
        this.selectedShapes.forEach((shape) => {
          let shapeData;
          shape.removeSelection();
          switch (shape.shapeName) {
            case "rectangle":
            case "icon":
              shapeData = {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                rotation: shape.rotation
              };
              break;
            case "circle":
              shapeData = {
                x: shape.x,
                y: shape.y,
                rx: shape.rx,
                ry: shape.ry,
                rotation: shape.rotation
              };
              break;
            case "line":
            case "arrow":
              shapeData = {
                startPoint: { ...shape.startPoint },
                endPoint: { ...shape.endPoint }
              };
              break;
            default:
              shapeData = {
                x: shape.x || 0,
                y: shape.y || 0,
                width: shape.width || 0,
                height: shape.height || 0,
                rotation: shape.rotation || 0
              };
          }
          this.initialPositions.set(shape, shapeData);
        });
        if (typeof svg !== "undefined") {
          svg.style.cursor = "move";
        }
      }
      handleDrag(e) {
        if (!this.isDragging) return;
        isDraggingMultiSelection = true;
        const { x, y } = getSVGCoordsFromMouse10(e);
        let dx = x - this.dragStart.x;
        let dy = y - this.dragStart.y;
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) {
            dy = 0;
          } else {
            dx = 0;
          }
        }
        this.move(dx, dy);
        if (window.__sketchStoreApi && window.__sketchStoreApi.getState().snapToObjects) {
          const bounds = this.getBounds();
          if (bounds) {
            const virtualShape = {
              shapeName: "rectangle",
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height
            };
            const snap = calculateSnap(virtualShape, e.shiftKey, e.clientX, e.clientY);
            if (snap.dx || snap.dy) {
              this.move(snap.dx, snap.dy);
            }
          }
        } else {
          clearSnapGuides();
        }
        this.dragStart = { x, y };
      }
      endDrag() {
        if (!this.isDragging) return;
        isDraggingMultiSelection = false;
        this.isDragging = false;
        clearSnapGuides();
        this.selectedShapes.forEach((shape) => {
          if (typeof shape.finalizeMove === "function") {
            shape.finalizeMove();
          }
          shape.isSelected = true;
        });
        this.initialPositions.clear();
        this._pushUndoForAll();
        this.updateControls();
        if (typeof svg !== "undefined") {
          svg.style.cursor = "default";
        }
      }
    };
    multiSelection = new MultiSelection();
    window.addEventListener("pointerup", () => {
      if (isMultiSelecting) {
        removeMultiSelectionRect();
        isMultiSelecting = false;
        isDraggingMultiSelection = false;
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
      }
    });
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && multiSelection.selectedShapes.size > 0) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
        e.preventDefault();
        deleteSelectedShapes();
      }
    });
    window.clearAllSelections = clearAllSelections2;
    window.multiSelection = multiSelection;
    window.deleteSelectedShapes = deleteSelectedShapes;
    window.frameSelectedShapes = frameSelectedShapes;
  }
});

// src/core/EventDispatcher.js
var EventDispatcher_exports = {};
__export(EventDispatcher_exports, {
  cleanupEventDispatcher: () => cleanupEventDispatcher,
  handleMainMouseDown: () => handleMainMouseDown,
  handleMainMouseLeave: () => handleMainMouseLeave,
  handleMainMouseMove: () => handleMainMouseMove,
  handleMainMouseUp: () => handleMainMouseUp,
  initEventDispatcher: () => initEventDispatcher
});
function _autoScroll(e) {
  if (!(e.buttons & 1)) {
    _stopAutoScroll();
    return;
  }
  if (typeof currentViewBox === "undefined" || typeof currentZoom === "undefined") return;
  if (typeof isPanning !== "undefined" && isPanning) return;
  if (typeof isPanningToolActive !== "undefined" && isPanningToolActive) return;
  const rect = svg.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  let dx = 0, dy = 0;
  if (mx < EDGE_THRESHOLD) dx = -SCROLL_SPEED * (1 - mx / EDGE_THRESHOLD);
  else if (mx > rect.width - EDGE_THRESHOLD) dx = SCROLL_SPEED * (1 - (rect.width - mx) / EDGE_THRESHOLD);
  if (my < EDGE_THRESHOLD) dy = -SCROLL_SPEED * (1 - my / EDGE_THRESHOLD);
  else if (my > rect.height - EDGE_THRESHOLD) dy = SCROLL_SPEED * (1 - (rect.height - my) / EDGE_THRESHOLD);
  if (e.clientX < rect.left) dx = -SCROLL_SPEED;
  else if (e.clientX > rect.right) dx = SCROLL_SPEED;
  if (e.clientY < rect.top) dy = -SCROLL_SPEED;
  else if (e.clientY > rect.bottom) dy = SCROLL_SPEED;
  if (dx === 0 && dy === 0) {
    _stopAutoScroll();
    return;
  }
  const scale = 1 / currentZoom;
  currentViewBox.x += dx * scale;
  currentViewBox.y += dy * scale;
  svg.setAttribute("viewBox", `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`);
  if (typeof freehandCanvas !== "undefined" && freehandCanvas !== svg) {
    freehandCanvas.setAttribute("viewBox", `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`);
  }
}
function _startAutoScroll() {
  if (_autoScrollRAF) return;
  const tick = () => {
    if (_lastDragEvent) _autoScroll(_lastDragEvent);
    _autoScrollRAF = requestAnimationFrame(tick);
  };
  _autoScrollRAF = requestAnimationFrame(tick);
}
function _stopAutoScroll() {
  if (_autoScrollRAF) {
    cancelAnimationFrame(_autoScrollRAF);
    _autoScrollRAF = null;
  }
  _lastDragEvent = null;
}
function _onDocumentDragMove(e) {
  _lastDragEvent = e;
  const rect = svg.getBoundingClientRect();
  const clampedX = Math.max(rect.left, Math.min(rect.right, e.clientX));
  const clampedY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));
  const clampedEvent = new PointerEvent(e.type, {
    clientX: clampedX,
    clientY: clampedY,
    buttons: e.buttons,
    button: e.button,
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    metaKey: e.metaKey
  });
  handleMainMouseMove(clampedEvent);
}
function _onDocumentDragUp(e) {
  _stopAutoScroll();
  document.removeEventListener("pointermove", _onDocumentDragMove);
  document.removeEventListener("pointerup", _onDocumentDragUp);
  _documentDragActive = false;
  handleMainMouseUp(e);
}
function _onMouseEnter(e) {
  if (_documentDragActive) {
    document.removeEventListener("pointermove", _onDocumentDragMove);
    document.removeEventListener("pointerup", _onDocumentDragUp);
    _documentDragActive = false;
  }
}
function initEventDispatcher(svgEl) {
  if (_boundSvg) cleanupEventDispatcher();
  const target = svgEl || svg;
  target.addEventListener("pointerdown", handleMainMouseDown);
  target.addEventListener("pointermove", handleMainMouseMove);
  target.addEventListener("pointerup", handleMainMouseUp);
  target.addEventListener("pointerleave", handleMainMouseLeave);
  target.addEventListener("pointerenter", _onMouseEnter);
  target.addEventListener("dblclick", handleMainDblClick);
  _boundSvg = target;
}
function cleanupEventDispatcher() {
  _stopAutoScroll();
  if (_documentDragActive) {
    document.removeEventListener("pointermove", _onDocumentDragMove);
    document.removeEventListener("pointerup", _onDocumentDragUp);
    _documentDragActive = false;
  }
  if (_boundSvg) {
    _boundSvg.removeEventListener("pointerdown", handleMainMouseDown);
    _boundSvg.removeEventListener("pointermove", handleMainMouseMove);
    _boundSvg.removeEventListener("pointerup", handleMainMouseUp);
    _boundSvg.removeEventListener("pointerleave", handleMainMouseLeave);
    _boundSvg.removeEventListener("pointerenter", _onMouseEnter);
    _boundSvg.removeEventListener("dblclick", handleMainDblClick);
    _boundSvg = null;
  }
}
var EDGE_THRESHOLD, SCROLL_SPEED, _autoScrollRAF, _lastDragEvent, _documentDragActive, handleMainMouseDown, handleMainMouseMove, handleMainMouseUp, handleMainMouseLeave, _boundSvg, handleMainDblClick;
var init_EventDispatcher = __esm({
  "src/core/EventDispatcher.js"() {
    init_rectangleTool();
    init_arrowTool();
    init_circleTool();
    init_imageTool();
    init_lineTool();
    init_freehandTool();
    init_textTool();
    init_frameTool();
    init_Selection();
    init_iconTool();
    init_codeTool();
    EDGE_THRESHOLD = 40;
    SCROLL_SPEED = 8;
    _autoScrollRAF = null;
    _lastDragEvent = null;
    _documentDragActive = false;
    handleMainMouseDown = (e) => {
      if (!e.target) return;
      if (e.button === 1 || e.button === 2) return;
      removeMultiSelectionRect();
      if (!isSelectionToolActive) {
        if (multiSelection.selectedShapes.size > 0) {
          multiSelection.clearSelection();
        }
        if (currentShape && typeof currentShape.removeSelection === "function") {
          currentShape.removeSelection();
          currentShape = null;
        }
        if (typeof disableAllSideBars === "function") {
          disableAllSideBars();
        }
      }
      if (isSquareToolActive) {
        handleMouseDownRect(e);
      } else if (isArrowToolActive) {
        handleMouseDown(e);
      } else if (isCircleToolActive) {
        handleMouseDown2(e);
      } else if (isImageToolActive) {
        handleMouseDownImage(e);
      } else if (isLineToolActive) {
        handleMouseDown3(e);
      } else if (isPaintToolActive) {
        handleMouseDown5(e);
      } else if (isTextToolActive) {
        const targetCodeGroup = e.target.closest('g[data-type="code-group"]');
        const targetTextGroup = e.target.closest('g[data-type="text-group"]');
        if (targetCodeGroup && !targetTextGroup) {
          handleCodeMouseDown(e);
        } else if (isTextInCodeMode && !targetTextGroup && !targetCodeGroup) {
          handleCodeMouseDown(e);
        } else {
          handleTextMouseDown(e);
        }
      } else if (isFrameToolActive) {
        handleMouseDown4(e);
      } else if (isIconToolActive) {
        handleMouseDownIcon(e);
      } else if (isSelectionToolActive) {
        if (handleMultiSelectionMouseDown(e)) {
          return;
        }
        const prevShape = currentShape;
        let handled = false;
        if (currentShape?.shapeName === "rectangle") {
          handleMouseDownRect(e);
          handled = true;
        } else if (currentShape?.shapeName === "arrow") {
          handleMouseDown(e);
          handled = true;
        } else if (currentShape?.shapeName === "circle") {
          handleMouseDown2(e);
          handled = true;
        } else if (currentShape?.shapeName === "image") {
          handleMouseDownImage(e);
          handled = true;
        } else if (currentShape?.shapeName === "line") {
          handleMouseDown3(e);
          handled = true;
        } else if (currentShape?.shapeName === "freehandStroke") {
          handleMouseDown5(e);
          handled = true;
        } else if (currentShape?.shapeName === "text") {
          handleTextMouseDown(e);
          handled = true;
        } else if (currentShape?.shapeName === "frame") {
          handleMouseDown4(e);
          handled = true;
        } else if (currentShape?.shapeName === "icon") {
          handleMouseDownIcon(e);
          handled = true;
        } else if (currentShape?.shapeName === "code") {
          handleCodeMouseDown(e);
          handled = true;
        }
        if (handled && prevShape && !currentShape) {
          handled = false;
        }
        if (!handled) {
          const originalCurrentShape = currentShape;
          handleMouseDownRect(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDown2(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDown(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDownImage(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDown3(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDown5(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleTextMouseDown(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDown4(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleMouseDownIcon(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          handleCodeMouseDown(e);
          if (currentShape && currentShape !== originalCurrentShape) return;
          if (currentShape === originalCurrentShape) {
            if (currentShape) {
              currentShape.removeSelection();
              currentShape = null;
            }
          }
        }
      }
    };
    handleMainMouseMove = (e) => {
      if (e.buttons & 1) {
        _lastDragEvent = e;
        _startAutoScroll();
      } else {
        _stopAutoScroll();
      }
      if (isSquareToolActive) {
        handleMouseMoveRect(e);
      } else if (isArrowToolActive) {
        handleMouseMove(e);
      } else if (isCircleToolActive) {
        handleMouseMove2(e);
      } else if (isImageToolActive) {
        handleMouseMoveImage(e);
      } else if (isLineToolActive) {
        handleMouseMove3(e);
      } else if (isPaintToolActive) {
        handleMouseMove6(e);
      } else if (isTextToolActive) {
        handleTextMouseMove(e);
        handleCodeMouseMove(e);
      } else if (isFrameToolActive) {
        handleMouseMove5(e);
      } else if (isIconToolActive) {
        handleMouseMoveIcon(e);
      } else if (isSelectionToolActive) {
        if (isMultiSelecting || multiSelection.isDragging || multiSelection.isResizing || multiSelection.isRotating) {
          if (handleMultiSelectionMouseMove(e)) {
            return;
          }
        }
        if (currentShape?.shapeName === "rectangle") {
          handleMouseMoveRect(e);
        } else if (currentShape?.shapeName === "arrow") {
          handleMouseMove(e);
        } else if (currentShape?.shapeName === "circle") {
          handleMouseMove2(e);
        } else if (currentShape?.shapeName === "image") {
          handleMouseMoveImage(e);
        } else if (currentShape?.shapeName === "line") {
          handleMouseMove3(e);
        } else if (currentShape?.shapeName === "freehandStroke") {
          handleMouseMove6(e);
        } else if (currentShape?.shapeName === "text") {
          handleTextMouseMove(e);
        } else if (currentShape?.shapeName === "frame") {
          handleMouseMove5(e);
        } else if (currentShape?.shapeName === "icon") {
          handleMouseMoveIcon(e);
        } else if (currentShape?.shapeName === "code") {
          handleCodeMouseMove(e);
        } else {
          if (handleMultiSelectionMouseMove(e)) {
            return;
          }
          handleMouseMoveRect(e);
          handleMouseMove(e);
          handleMouseMove2(e);
          handleMouseMoveImage(e);
          handleMouseMove3(e);
          handleMouseMove6(e);
          handleTextMouseMove(e);
          handleMouseMove5(e);
          handleMouseMoveIcon(e);
          handleCodeMouseMove(e);
        }
      }
    };
    handleMainMouseUp = (e) => {
      _stopAutoScroll();
      if (isSquareToolActive) {
        handleMouseUpRect(e);
      } else if (isArrowToolActive) {
        handleMouseUp(e);
      } else if (isCircleToolActive) {
        handleMouseUp2(e);
      } else if (isImageToolActive) {
        handleMouseUpImage(e);
      } else if (isLineToolActive) {
        handleMouseUp3(e);
      } else if (isPaintToolActive) {
        handleMouseUp6(e);
      } else if (isTextToolActive) {
        handleTextMouseUp(e);
        handleCodeMouseUp(e);
      } else if (isFrameToolActive) {
        handleMouseUp5(e);
      } else if (isIconToolActive) {
        handleMouseUpIcon(e);
      } else if (isSelectionToolActive) {
        if (isMultiSelecting || multiSelection.isDragging || multiSelection.isResizing || multiSelection.isRotating) {
          handleMultiSelectionMouseUp(e);
          return;
        }
        if (currentShape?.shapeName === "rectangle") {
          handleMouseUpRect(e);
        } else if (currentShape?.shapeName === "arrow") {
          handleMouseUp(e);
        } else if (currentShape?.shapeName === "circle") {
          handleMouseUp2(e);
        } else if (currentShape?.shapeName === "image") {
          handleMouseUpImage(e);
        } else if (currentShape?.shapeName === "line") {
          handleMouseUp3(e);
        } else if (currentShape?.shapeName === "freehandStroke") {
          handleMouseUp6(e);
        } else if (currentShape?.shapeName === "text") {
          handleTextMouseUp(e);
        } else if (currentShape?.shapeName === "frame") {
          handleMouseUp5(e);
        } else if (currentShape?.shapeName === "icon") {
          handleMouseUpIcon(e);
        } else if (currentShape?.shapeName === "code") {
          handleCodeMouseUp(e);
        } else {
          handleMultiSelectionMouseUp(e);
          handleMouseUpRect(e);
          handleMouseUp(e);
          handleMouseUp2(e);
          handleMouseUpImage(e);
          handleMouseUp3(e);
          handleMouseUp6(e);
          handleTextMouseUp(e);
          handleMouseUp5(e);
          handleMouseUpIcon(e);
          handleCodeMouseUp(e);
        }
      }
    };
    handleMainMouseLeave = (e) => {
      if (e.buttons & 1) {
        _lastDragEvent = e;
        _startAutoScroll();
        if (!_documentDragActive) {
          _documentDragActive = true;
          document.addEventListener("pointermove", _onDocumentDragMove);
          document.addEventListener("pointerup", _onDocumentDragUp);
        }
        return;
      }
      handleMainMouseUp(e);
      removeMultiSelectionRect();
      if (typeof window.forceCleanupEraserTrail === "function") {
        window.forceCleanupEraserTrail();
      }
      if (typeof isDrawing !== "undefined" && isDrawing) {
        isDrawing = false;
        if (typeof lasers !== "undefined" && lasers.length > 0 && typeof fadeLaserTrail === "function") {
          const lastLaser = lasers[lasers.length - 1];
          fadeLaserTrail(lastLaser);
        }
      }
    };
    _boundSvg = null;
    handleMainDblClick = (e) => {
      if (!e.target) return;
      const targetTextGroup = e.target.closest('g[data-type="text-group"]');
      if (targetTextGroup) {
        e.stopPropagation();
        enterEditMode(targetTextGroup);
      }
    };
    if (typeof svg !== "undefined" && svg) {
      initEventDispatcher(svg);
    }
  }
});

// src/core/ZoomPan.js
var ZoomPan_exports = {};
function updateZoomDisplay() {
  zoomPercentSpan.innerText = Math.round(currentZoom * 100) + "%";
}
function updateViewBox(anchorX = null, anchorY = null) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scaledWidth = width / currentZoom;
  const scaledHeight = height / currentZoom;
  let centerX, centerY;
  if (anchorX === null || anchorY === null) {
    centerX = currentViewBox.x + currentViewBox.width / 2;
    centerY = currentViewBox.y + currentViewBox.height / 2;
  } else {
    centerX = anchorX;
    centerY = anchorY;
  }
  const viewBoxX = centerX - scaledWidth / 2;
  const viewBoxY = centerY - scaledHeight / 2;
  freehandCanvas.setAttribute(
    "viewBox",
    `${viewBoxX} ${viewBoxY} ${scaledWidth} ${scaledHeight}`
  );
  currentViewBox.x = viewBoxX;
  currentViewBox.y = viewBoxY;
  currentViewBox.width = scaledWidth;
  currentViewBox.height = scaledHeight;
}
var scrollRate, isMiddleMousePanning;
var init_ZoomPan = __esm({
  "src/core/ZoomPan.js"() {
    scrollRate = 50;
    zoomInBtn.addEventListener("click", function() {
      currentZoom *= 1.1;
      if (currentZoom > maxScale) currentZoom = maxScale;
      updateViewBox();
      updateZoomDisplay();
    });
    zoomOutBtn.addEventListener("click", function() {
      currentZoom /= 1.1;
      if (currentZoom < minScale) currentZoom = minScale;
      updateViewBox();
      updateZoomDisplay();
    });
    window.zoomFromCenter = function(direction) {
      if (direction > 0) {
        currentZoom *= 1.1;
        if (currentZoom > maxScale) currentZoom = maxScale;
      } else {
        currentZoom /= 1.1;
        if (currentZoom < minScale) currentZoom = minScale;
      }
      updateViewBox();
      updateZoomDisplay();
      if (window.__sketchStoreApi && window.__sketchStoreApi.setZoom) {
        window.__sketchStoreApi.setZoom(currentZoom);
      }
    };
    window.zoomReset = function() {
      currentZoom = 1;
      currentViewBox.x = 0;
      currentViewBox.y = 0;
      currentViewBox.width = window.innerWidth;
      currentViewBox.height = window.innerHeight;
      freehandCanvas.setAttribute(
        "viewBox",
        `0 0 ${window.innerWidth} ${window.innerHeight}`
      );
      updateZoomDisplay();
      if (window.__sketchStoreApi && window.__sketchStoreApi.setZoom) {
        window.__sketchStoreApi.setZoom(1);
      }
    };
    freehandCanvas.addEventListener("wheel", function(e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      let newZoom = currentZoom + delta;
      if (newZoom < minScale) newZoom = minScale;
      if (newZoom > maxScale) newZoom = maxScale;
      const rect = freehandCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mouseFracX = mouseX / rect.width;
      const mouseFracY = mouseY / rect.height;
      const anchorViewBoxX = currentViewBox.x + mouseFracX * currentViewBox.width;
      const anchorViewBoxY = currentViewBox.y + mouseFracY * currentViewBox.height;
      const newViewBoxWidth = rect.width / newZoom;
      const newViewBoxHeight = rect.height / newZoom;
      const newViewBoxX = anchorViewBoxX - mouseFracX * newViewBoxWidth;
      const newViewBoxY = anchorViewBoxY - mouseFracY * newViewBoxHeight;
      freehandCanvas.setAttribute(
        "viewBox",
        `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`
      );
      currentZoom = newZoom;
      currentViewBox = {
        x: newViewBoxX,
        y: newViewBoxY,
        width: newViewBoxWidth,
        height: newViewBoxHeight
      };
      updateZoomDisplay();
      if (window.__sketchStoreApi && window.__sketchStoreApi.setZoom) {
        window.__sketchStoreApi.setZoom(currentZoom);
      }
    });
    isMiddleMousePanning = false;
    freehandCanvas.addEventListener("mousedown", function(e) {
      if (e.button === 1) {
        e.preventDefault();
        isMiddleMousePanning = true;
        isPanning = true;
        startCanvasX = e.clientX;
        startCanvasY = e.clientY;
        panStart = { x: e.clientX, y: e.clientY };
        freehandCanvas.style.cursor = "grabbing";
        return;
      }
      if (isPanningToolActive) {
        isPanning = true;
        startCanvasX = e.clientX;
        startCanvasY = e.clientY;
        panStart = { x: e.clientX, y: e.clientY };
        freehandCanvas.style.cursor = "grabbing";
      }
    });
    freehandCanvas.addEventListener("mousemove", (e) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      const dxViewBox = dx / currentZoom;
      const dyViewBox = dy / currentZoom;
      currentViewBox.x -= dxViewBox;
      currentViewBox.y -= dyViewBox;
      freehandCanvas.setAttribute(
        "viewBox",
        `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`
      );
      panStart = { x: e.clientX, y: e.clientY };
    });
    freehandCanvas.addEventListener("mouseup", (e) => {
      if (isMiddleMousePanning) {
        isMiddleMousePanning = false;
        isPanning = false;
        freehandCanvas.style.cursor = "";
        return;
      }
      if (isPanningToolActive) {
        isPanning = false;
        freehandCanvas.style.cursor = "grab";
      }
    });
    freehandCanvas.addEventListener("mouseleave", () => {
      if (isMiddleMousePanning) {
        isMiddleMousePanning = false;
        isPanning = false;
        freehandCanvas.style.cursor = "";
        return;
      }
      if (isPanningToolActive) {
        isPanning = false;
        freehandCanvas.style.cursor = "grab";
      }
    });
    freehandCanvas.addEventListener("auxclick", (e) => {
      if (e.button === 1) e.preventDefault();
    });
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.ctrlKey) return;
      if (e.shiftKey) {
        currentViewBox.x += e.deltaY > 0 ? scrollRate : -scrollRate;
      } else {
        currentViewBox.y += e.deltaY > 0 ? scrollRate : -scrollRate;
      }
      svg.setAttribute(
        "viewBox",
        `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`
      );
    });
  }
});

// src/core/CopyPaste.js
var CopyPaste_exports = {};
__export(CopyPaste_exports, {
  copySelected: () => copySelected,
  initCopyPaste: () => initCopyPaste,
  pasteClipboard: () => pasteClipboard
});
function getSVGElement3() {
  return document.getElementById("freehand-canvas");
}
function cloneOptions2(options) {
  return JSON.parse(JSON.stringify(options));
}
function serializeShape(shape) {
  switch (shape.shapeName) {
    case "rectangle":
      return {
        type: "rectangle",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        options: cloneOptions2(shape.options)
      };
    case "circle":
      return {
        type: "circle",
        x: shape.x,
        y: shape.y,
        rx: shape.rx,
        ry: shape.ry,
        rotation: shape.rotation,
        options: cloneOptions2(shape.options)
      };
    case "line":
      return {
        type: "line",
        startPoint: { x: shape.startPoint.x, y: shape.startPoint.y },
        endPoint: { x: shape.endPoint.x, y: shape.endPoint.y },
        controlPoint: shape.controlPoint ? { x: shape.controlPoint.x, y: shape.controlPoint.y } : null,
        isCurved: shape.isCurved || false,
        options: cloneOptions2(shape.options)
      };
    case "arrow":
      return {
        type: "arrow",
        startPoint: { x: shape.startPoint.x, y: shape.startPoint.y },
        endPoint: { x: shape.endPoint.x, y: shape.endPoint.y },
        controlPoint1: shape.controlPoint1 ? { x: shape.controlPoint1.x, y: shape.controlPoint1.y } : null,
        controlPoint2: shape.controlPoint2 ? { x: shape.controlPoint2.x, y: shape.controlPoint2.y } : null,
        options: cloneOptions2(shape.options),
        arrowOutlineStyle: shape.arrowOutlineStyle,
        arrowHeadStyle: shape.arrowHeadStyle,
        arrowCurved: shape.arrowCurved,
        arrowCurveAmount: shape.arrowCurveAmount
      };
    case "freehandStroke":
      return {
        type: "freehandStroke",
        points: JSON.parse(JSON.stringify(shape.points)),
        rotation: shape.rotation,
        options: cloneOptions2(shape.options)
      };
    case "frame":
      return {
        type: "frame",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        frameName: shape.frameName,
        options: cloneOptions2(shape.options)
      };
    case "text": {
      const group = shape.group;
      const textEl = group.querySelector("text");
      return {
        type: "text",
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        groupHTML: group.cloneNode(true).outerHTML
      };
    }
    case "code": {
      const group = shape.group;
      return {
        type: "code",
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        groupHTML: group.cloneNode(true).outerHTML
      };
    }
    case "image": {
      const el = shape.element;
      return {
        type: "image",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        href: el.getAttribute("href") || el.getAttributeNS("http://www.w3.org/1999/xlink", "href") || ""
      };
    }
    case "icon": {
      const el = shape.element;
      return {
        type: "icon",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        elementHTML: el.cloneNode(true).outerHTML,
        viewboxWidth: parseFloat(el.getAttribute("data-viewbox-width")) || 24,
        viewboxHeight: parseFloat(el.getAttribute("data-viewbox-height")) || 24
      };
    }
    default:
      console.warn("Copy not supported for shape type:", shape.shapeName);
      return null;
  }
}
function getShapeCenter(data) {
  switch (data.type) {
    case "rectangle":
    case "frame":
      return { x: data.x + data.width / 2, y: data.y + data.height / 2 };
    case "circle":
      return { x: data.x, y: data.y };
    case "line":
      return {
        x: (data.startPoint.x + data.endPoint.x) / 2,
        y: (data.startPoint.y + data.endPoint.y) / 2
      };
    case "arrow":
      return {
        x: (data.startPoint.x + data.endPoint.x) / 2,
        y: (data.startPoint.y + data.endPoint.y) / 2
      };
    case "freehandStroke": {
      if (!data.points.length) return { x: 0, y: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      data.points.forEach((p) => {
        if (p[0] < minX) minX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] > maxY) maxY = p[1];
      });
      return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }
    case "text":
    case "code":
      return { x: data.x, y: data.y };
    case "image":
    case "icon":
      return { x: data.x + data.width / 2, y: data.y + data.height / 2 };
    default:
      return { x: 0, y: 0 };
  }
}
function createShapeFromData(data, offsetX, offsetY) {
  const svgEl = getSVGElement3();
  if (!svgEl) return null;
  switch (data.type) {
    case "rectangle": {
      const newRect = new Rectangle2(
        data.x + offsetX,
        data.y + offsetY,
        data.width,
        data.height,
        cloneOptions2(data.options)
      );
      newRect.rotation = data.rotation;
      newRect.draw();
      return newRect;
    }
    case "circle": {
      const newCircle = new Circle2(
        data.x + offsetX,
        data.y + offsetY,
        data.rx,
        data.ry,
        cloneOptions2(data.options)
      );
      newCircle.rotation = data.rotation;
      newCircle.draw();
      return newCircle;
    }
    case "line": {
      const newLine = new Line2(
        { x: data.startPoint.x + offsetX, y: data.startPoint.y + offsetY },
        { x: data.endPoint.x + offsetX, y: data.endPoint.y + offsetY },
        cloneOptions2(data.options)
      );
      if (data.isCurved && data.controlPoint) {
        newLine.isCurved = true;
        newLine.controlPoint = { x: data.controlPoint.x + offsetX, y: data.controlPoint.y + offsetY };
      }
      newLine.draw();
      return newLine;
    }
    case "arrow": {
      const opts = {
        ...cloneOptions2(data.options),
        arrowOutlineStyle: data.arrowOutlineStyle,
        arrowHeadStyle: data.arrowHeadStyle,
        arrowCurved: data.arrowCurved,
        arrowCurveAmount: data.arrowCurveAmount,
        controlPoint1: data.controlPoint1 ? { x: data.controlPoint1.x + offsetX, y: data.controlPoint1.y + offsetY } : null,
        controlPoint2: data.controlPoint2 ? { x: data.controlPoint2.x + offsetX, y: data.controlPoint2.y + offsetY } : null
      };
      const newArrow = new Arrow2(
        { x: data.startPoint.x + offsetX, y: data.startPoint.y + offsetY },
        { x: data.endPoint.x + offsetX, y: data.endPoint.y + offsetY },
        opts
      );
      return newArrow;
    }
    case "freehandStroke": {
      const offsetPoints = data.points.map((p) => [
        p[0] + offsetX,
        p[1] + offsetY,
        p[2] || 0.5
      ]);
      const newStroke = new FreehandStroke2(offsetPoints, cloneOptions2(data.options));
      newStroke.rotation = data.rotation;
      newStroke.draw();
      return newStroke;
    }
    case "frame": {
      const newFrame = new Frame2(
        data.x + offsetX,
        data.y + offsetY,
        data.width,
        data.height,
        { ...cloneOptions2(data.options), frameName: data.frameName, rotation: data.rotation }
      );
      newFrame.rotation = data.rotation;
      return newFrame;
    }
    case "text": {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data.groupHTML;
      const clonedGroup = tempDiv.firstElementChild;
      if (!clonedGroup) return null;
      const newID = `text-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
      clonedGroup.setAttribute("id", newID);
      const textChild = clonedGroup.querySelector("text");
      if (textChild) textChild.setAttribute("id", `${newID}-text`);
      const newX = data.x + offsetX;
      const newY = data.y + offsetY;
      const rotation = data.rotation || 0;
      if (textChild && rotation) {
        try {
          const bbox = { x: 0, y: 0, width: 100, height: 30 };
          clonedGroup.setAttribute("transform", `translate(${newX}, ${newY}) rotate(${rotation}, ${bbox.width / 2}, ${bbox.height / 2})`);
        } catch (e) {
          clonedGroup.setAttribute("transform", `translate(${newX}, ${newY})`);
        }
      } else {
        clonedGroup.setAttribute("transform", `translate(${newX}, ${newY})`);
      }
      clonedGroup.setAttribute("data-x", newX);
      clonedGroup.setAttribute("data-y", newY);
      svgEl.appendChild(clonedGroup);
      const textShape = new TextShape2(clonedGroup);
      return textShape;
    }
    case "code": {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data.groupHTML;
      const clonedGroup = tempDiv.firstElementChild;
      if (!clonedGroup) return null;
      const newID = `code-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
      clonedGroup.setAttribute("id", newID);
      const codeChild = clonedGroup.querySelector("text");
      if (codeChild) codeChild.setAttribute("id", `${newID}-code`);
      const newX = data.x + offsetX;
      const newY = data.y + offsetY;
      const rotation = data.rotation || 0;
      if (rotation) {
        clonedGroup.setAttribute("transform", `translate(${newX}, ${newY}) rotate(${rotation}, 0, 0)`);
      } else {
        clonedGroup.setAttribute("transform", `translate(${newX}, ${newY})`);
      }
      clonedGroup.setAttribute("data-x", newX);
      clonedGroup.setAttribute("data-y", newY);
      svgEl.appendChild(clonedGroup);
      const codeShape = new CodeShape2(clonedGroup);
      return codeShape;
    }
    case "image": {
      const imgEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
      const newX = data.x + offsetX;
      const newY = data.y + offsetY;
      imgEl.setAttribute("x", newX);
      imgEl.setAttribute("y", newY);
      imgEl.setAttribute("width", data.width);
      imgEl.setAttribute("height", data.height);
      imgEl.setAttribute("href", data.href);
      imgEl.setAttribute("data-shape-x", newX);
      imgEl.setAttribute("data-shape-y", newY);
      imgEl.setAttribute("data-shape-width", data.width);
      imgEl.setAttribute("data-shape-height", data.height);
      imgEl.setAttribute("preserveAspectRatio", "none");
      imgEl.setAttribute("style", "cursor: pointer;");
      svgEl.appendChild(imgEl);
      const imageShape = new ImageShape2(imgEl);
      imageShape.rotation = data.rotation;
      return imageShape;
    }
    case "icon": {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data.elementHTML;
      const clonedEl = tempDiv.firstElementChild;
      if (!clonedEl) return null;
      const newX = data.x + offsetX;
      const newY = data.y + offsetY;
      const newID = `icon-${String(Date.now()).slice(0, 8)}-${Math.floor(Math.random() * 1e4)}`;
      clonedEl.setAttribute("id", newID);
      clonedEl.setAttribute("x", newX);
      clonedEl.setAttribute("y", newY);
      clonedEl.setAttribute("data-shape-x", newX);
      clonedEl.setAttribute("data-shape-y", newY);
      clonedEl.setAttribute("data-shape-width", data.width);
      clonedEl.setAttribute("data-shape-height", data.height);
      clonedEl.setAttribute("data-shape-rotation", data.rotation);
      clonedEl.setAttribute("data-viewbox-width", data.viewboxWidth);
      clonedEl.setAttribute("data-viewbox-height", data.viewboxHeight);
      const scale = data.width / Math.max(data.viewboxWidth, data.viewboxHeight);
      const localCenterX = data.width / 2 / scale;
      const localCenterY = data.height / 2 / scale;
      clonedEl.setAttribute("transform", `translate(${newX}, ${newY}) scale(${scale}) rotate(${data.rotation}, ${localCenterX}, ${localCenterY})`);
      svgEl.appendChild(clonedEl);
      const iconShape = new IconShape2(clonedEl);
      return iconShape;
    }
    default:
      return null;
  }
}
function copySelected() {
  const shapesToCopy = [];
  if (window.multiSelection && window.multiSelection.selectedShapes && window.multiSelection.selectedShapes.size > 0) {
    window.multiSelection.selectedShapes.forEach((shape) => {
      const data = serializeShape(shape);
      if (data) shapesToCopy.push(data);
    });
  } else if (typeof currentShape !== "undefined" && currentShape && currentShape.isSelected) {
    const data = serializeShape(currentShape);
    if (data) shapesToCopy.push(data);
  }
  if (shapesToCopy.length === 0) return false;
  let totalX = 0, totalY = 0;
  shapesToCopy.forEach((d) => {
    const c = getShapeCenter(d);
    totalX += c.x;
    totalY += c.y;
  });
  const centerX = totalX / shapesToCopy.length;
  const centerY = totalY / shapesToCopy.length;
  clipboard = {
    shapes: shapesToCopy,
    centerX,
    centerY
  };
  pasteCount = 0;
  return true;
}
function pasteClipboard() {
  if (!clipboard || clipboard.shapes.length === 0) return false;
  pasteCount++;
  const baseOffset = 20 * pasteCount;
  const targetX = lastMouseSVG.x;
  const targetY = lastMouseSVG.y;
  const groupOffsetX = targetX - clipboard.centerX + baseOffset;
  const groupOffsetY = targetY - clipboard.centerY + baseOffset;
  if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
    shapes.forEach((s) => {
      if (s.isSelected && typeof s.removeSelection === "function") {
        s.removeSelection();
        s.isSelected = false;
      }
    });
  }
  if (window.multiSelection) {
    window.multiSelection.clearSelection();
  }
  if (typeof currentShape !== "undefined") {
    currentShape = null;
  }
  if (typeof disableAllSideBars === "function") {
    disableAllSideBars();
  }
  const pastedShapes = [];
  clipboard.shapes.forEach((data) => {
    const newShape = createShapeFromData(data, groupOffsetX, groupOffsetY);
    if (newShape) {
      if (typeof shapes !== "undefined" && Array.isArray(shapes)) {
        shapes.push(newShape);
      }
      pushCreateAction(newShape);
      pastedShapes.push(newShape);
    }
  });
  if (pastedShapes.length === 1) {
    const s = pastedShapes[0];
    s.isSelected = true;
    currentShape = s;
    if (typeof s.addAnchors === "function") {
      s.addAnchors();
    } else if (typeof s.selectShape === "function") {
      s.selectShape();
    }
  } else if (pastedShapes.length > 1 && window.multiSelection) {
    pastedShapes.forEach((s) => {
      window.multiSelection.addShape(s);
    });
    window.multiSelection.updateControls();
  }
  return true;
}
function handleCopyPasteKeydown(e) {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
    if (copySelected()) {
      e.preventDefault();
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
    if (pasteClipboard()) {
      e.preventDefault();
    }
  }
}
function handleMouseMoveForPaste(e) {
  const svgEl = getSVGElement3();
  if (!svgEl) return;
  const viewBox = svgEl.viewBox.baseVal;
  const rect = svgEl.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  lastMouseSVG.x = viewBox.x + mouseX / rect.width * viewBox.width;
  lastMouseSVG.y = viewBox.y + mouseY / rect.height * viewBox.height;
}
function handlePasteEvent(e) {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      e.preventDefault();
      const blob = item.getAsFile();
      if (!blob) return;
      if (!isAllowedImage(blob)) {
        console.warn("[CopyPaste] Rejected pasted image type:", blob.type);
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const rawDataUrl = ev.target.result;
        const isSvg = (blob.type || "").toLowerCase() === "image/svg+xml";
        let placedDataUrl = rawDataUrl;
        if (!isSvg) {
          try {
            const compressed = await compressImage(rawDataUrl);
            if (compressed?.dataUrl) placedDataUrl = compressed.dataUrl;
          } catch (err) {
            console.warn("[CopyPaste] Pre-placement compression failed, using raw:", err);
          }
        }
        placeImageFromDataUrl(placedDataUrl);
      };
      reader.readAsDataURL(blob);
      return;
    }
  }
}
function placeImageFromDataUrl(dataUrl) {
  const svgEl = getSVGElement3();
  if (!svgEl || !window.ImageShape) return;
  const img = new Image();
  img.onload = () => {
    const aspectRatio = img.height / img.width;
    const displayW = Math.min(400, img.width);
    const displayH = displayW * aspectRatio;
    const vb = svgEl.viewBox.baseVal;
    const cx = vb.x + vb.width / 2;
    const cy = vb.y + vb.height / 2;
    const imgEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
    imgEl.setAttribute("href", dataUrl);
    imgEl.setAttribute("x", cx - displayW / 2);
    imgEl.setAttribute("y", cy - displayH / 2);
    imgEl.setAttribute("width", displayW);
    imgEl.setAttribute("height", displayH);
    imgEl.setAttribute("data-shape-x", cx - displayW / 2);
    imgEl.setAttribute("data-shape-y", cy - displayH / 2);
    imgEl.setAttribute("data-shape-width", displayW);
    imgEl.setAttribute("data-shape-height", displayH);
    imgEl.setAttribute("type", "image");
    imgEl.setAttribute("preserveAspectRatio", "none");
    svgEl.appendChild(imgEl);
    const imageShape = new ImageShape2(imgEl);
    if (window.shapes) window.shapes.push(imageShape);
    if (window.pushCreateAction) window.pushCreateAction(imageShape);
    if (window.uploadImageToCloudinary) {
      window.uploadImageToCloudinary(imageShape);
    }
    console.log("[CopyPaste] Pasted image from clipboard");
  };
  img.src = dataUrl;
}
function initCopyPaste() {
  document.addEventListener("keydown", handleCopyPasteKeydown);
  document.addEventListener("pointermove", handleMouseMoveForPaste);
  document.addEventListener("paste", handlePasteEvent);
  window.copySelected = copySelected;
  window.pasteClipboard = pasteClipboard;
}
var clipboard, pasteCount, lastMouseSVG;
var init_CopyPaste = __esm({
  "src/core/CopyPaste.js"() {
    init_UndoRedo();
    init_Rectangle();
    init_Circle();
    init_Line();
    init_Arrow();
    init_FreehandStroke();
    init_Frame();
    init_TextShape();
    init_CodeShape();
    init_ImageShape();
    init_allowedImageTypes();
    init_imageCompressor();
    init_IconShape();
    clipboard = null;
    pasteCount = 0;
    lastMouseSVG = { x: 0, y: 0 };
  }
});

// src/core/EraserTrail.js
var EraserTrail_exports = {};
__export(EraserTrail_exports, {
  createEraserTrail: () => createEraserTrail,
  fadeOutEraserTrail: () => fadeOutEraserTrail,
  forceCleanupEraserTrail: () => forceCleanupEraserTrail,
  getIsErasing: () => getIsErasing,
  getTargetedElements: () => getTargetedElements,
  setIsErasing: () => setIsErasing,
  updateEraserTrail: () => updateEraserTrail
});
function getIsErasing() {
  return isErasing;
}
function setIsErasing(val) {
  isErasing = val;
}
function getTargetedElements() {
  return targetedElements;
}
function screenToSVGEraser(clientX, clientY) {
  const CTM = svg.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };
  try {
    const inv = CTM.inverse();
    return {
      x: (clientX - CTM.e) * inv.a + (clientY - CTM.f) * inv.c,
      y: (clientX - CTM.e) * inv.b + (clientY - CTM.f) * inv.d
    };
  } catch (e) {
    return {
      x: (clientX - CTM.e) / CTM.a,
      y: (clientY - CTM.f) / CTM.d
    };
  }
}
function smoothPoints(points2) {
  if (points2.length <= 2) return points2;
  const half = Math.floor(SMOOTHING_WINDOW / 2);
  const result = [points2[0]];
  for (let i = 1; i < points2.length - 1; i++) {
    let sx = 0, sy = 0, count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(points2.length - 1, i + half); j++) {
      sx += points2[j].x;
      sy += points2[j].y;
      count++;
    }
    result.push({ x: sx / count, y: sy / count });
  }
  result.push(points2[points2.length - 1]);
  return result;
}
function buildSmoothPath(rawPoints) {
  if (rawPoints.length === 0) return "";
  if (rawPoints.length === 1) return `M ${rawPoints[0].x} ${rawPoints[0].y}`;
  const points2 = smoothPoints(rawPoints);
  let d = `M ${points2[0].x} ${points2[0].y}`;
  if (points2.length === 2) {
    d += ` L ${points2[1].x} ${points2[1].y}`;
    return d;
  }
  const tension = 0.4;
  for (let i = 0; i < points2.length - 1; i++) {
    const p0 = points2[i === 0 ? 0 : i - 1];
    const p1 = points2[i];
    const p2 = points2[i + 1];
    const p3 = points2[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
function safeRemove(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}
function cleanupTrail() {
  if (fadeAnimationId) {
    cancelAnimationFrame(fadeAnimationId);
    fadeAnimationId = null;
  }
  fadeStartTime = null;
  fadeInitialPoints = null;
  safeRemove(eraserPath);
  safeRemove(eraserGlow);
  eraserPath = null;
  eraserGlow = null;
  eraserPoints = [];
}
function createEraserTrail(x, y) {
  cleanupTrail();
  eraserGlow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  eraserGlow.setAttribute("fill", "none");
  eraserGlow.setAttribute("stroke", "rgba(80, 80, 80, 0.15)");
  eraserGlow.setAttribute("stroke-width", 14 / currentZoom);
  eraserGlow.setAttribute("stroke-linecap", "round");
  eraserGlow.setAttribute("stroke-linejoin", "round");
  eraserGlow.style.pointerEvents = "none";
  svg.appendChild(eraserGlow);
  eraserPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  eraserPath.setAttribute("fill", "none");
  eraserPath.setAttribute("stroke", "rgba(53, 53, 53, 0.5)");
  eraserPath.setAttribute("stroke-width", 5 / currentZoom);
  eraserPath.setAttribute("stroke-linecap", "round");
  eraserPath.setAttribute("stroke-linejoin", "round");
  eraserPath.style.pointerEvents = "none";
  svg.appendChild(eraserPath);
  const svgPt = screenToSVGEraser(x, y);
  eraserPoints = [svgPt];
}
function updateEraserTrail(x, y) {
  if (!eraserPath) return;
  const svgPt = screenToSVGEraser(x, y);
  const last = eraserPoints[eraserPoints.length - 1];
  if (last) {
    const dist = Math.hypot(last.x - svgPt.x, last.y - svgPt.y);
    if (dist < MIN_POINT_DISTANCE / currentZoom) return;
  }
  eraserPoints.push(svgPt);
  if (eraserPoints.length > MAX_TRAIL_LENGTH) {
    eraserPoints.shift();
  }
  renderTrail(eraserPoints, 1);
}
function renderTrail(points2, opacityMul) {
  if (!eraserPath || points2.length < 2) return;
  const pathD = buildSmoothPath(points2);
  const coreW = Math.max(1.5 / currentZoom, 5 / currentZoom * opacityMul);
  const glowW = Math.max(3 / currentZoom, 14 / currentZoom * opacityMul);
  const coreOpacity = 0.5 * opacityMul;
  const glowOpacity = 0.15 * opacityMul;
  eraserPath.setAttribute("d", pathD);
  eraserPath.setAttribute("stroke", `rgba(53, 53, 53, ${coreOpacity})`);
  eraserPath.setAttribute("stroke-width", coreW);
  if (eraserGlow) {
    eraserGlow.setAttribute("d", pathD);
    eraserGlow.setAttribute("stroke", `rgba(80, 80, 80, ${glowOpacity})`);
    eraserGlow.setAttribute("stroke-width", glowW);
  }
}
function fadeOutEraserTrail() {
  if (!eraserPath) {
    cleanupTrail();
    return;
  }
  if (fadeAnimationId) {
    cancelAnimationFrame(fadeAnimationId);
  }
  fadeStartTime = performance.now();
  fadeInitialPoints = [...eraserPoints];
  function fadeStep() {
    const now = performance.now();
    const elapsed = now - fadeStartTime;
    const progress = Math.min(1, elapsed / FADE_DURATION);
    const opacity = 1 - progress * progress * progress;
    if (opacity <= 0.01 || progress >= 1) {
      cleanupTrail();
      return;
    }
    renderTrail(fadeInitialPoints, opacity);
    fadeAnimationId = requestAnimationFrame(fadeStep);
  }
  fadeAnimationId = requestAnimationFrame(fadeStep);
}
function forceCleanupEraserTrail() {
  cleanupTrail();
  isErasing = false;
}
var isErasing, eraserPath, eraserGlow, eraserPoints, targetedElements, MAX_TRAIL_LENGTH, FADE_DURATION, MIN_POINT_DISTANCE, SMOOTHING_WINDOW, fadeAnimationId, fadeStartTime, fadeInitialPoints;
var init_EraserTrail = __esm({
  "src/core/EraserTrail.js"() {
    isErasing = false;
    eraserPath = null;
    eraserGlow = null;
    eraserPoints = [];
    targetedElements = /* @__PURE__ */ new Set();
    MAX_TRAIL_LENGTH = 16;
    FADE_DURATION = 200;
    MIN_POINT_DISTANCE = 1.5;
    SMOOTHING_WINDOW = 3;
    fadeAnimationId = null;
    fadeStartTime = null;
    fadeInitialPoints = null;
  }
});

// src/core/ResizeShapes.js
var ResizeShapes_exports = {};
function clientToSVGResize(x, y) {
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function anchorPointerDown(e) {
  if (selectedElements.length !== 1) return;
  e.preventDefault();
  const anchor = e.target;
  const sel = selectedElements[0];
  console.log(sel);
  console.log(`Selected anchor type: ${anchor.anchorType}`);
  initialBBox = sel.getBBox();
  startSVG = clientToSVGResize(e.clientX, e.clientY);
  anchor.initialTransform = sel.getAttribute("transform") || "translate(0,0) scale(1,1) rotate(0)";
  isScaling = true;
  activeAnchor3 = anchor;
  svg.setPointerCapture(e.pointerId);
  isAnchorClicked = true;
}
function anchorPointerUp(e) {
  if (isScaling) {
    console.log("Pointer up on anchor");
    svg.releasePointerCapture(e.pointerId);
    isScaling = false;
    activeAnchor3 = null;
    initialBBox = null;
    startSVG = null;
    isAnchorClicked = false;
  }
}
function anchorPointerMove(e) {
  if (!isAnchorClicked) return;
  if (!isScaling || !activeAnchor3) return;
  const sel = selectedElements[0];
  if (!sel || !initialBBox || !startSVG) return;
  const currentPt = clientToSVG(e.clientX, e.clientY);
  const dx = currentPt.x - startSVG.x;
  const dy = currentPt.y - startSVG.y;
  let initialX = parseFloat(sel.getAttribute("data-x"));
  let initialY = parseFloat(sel.getAttribute("data-y"));
  let initialWidth = parseFloat(sel.getAttribute("data-width"));
  let initialHeight = parseFloat(sel.getAttribute("data-height"));
  let newWidth = initialWidth;
  let newHeight = initialHeight;
  let newX = initialX;
  let newY = initialY;
  switch (activeAnchor3.anchorType) {
    case "nw":
      newWidth = initialWidth - dx;
      newHeight = initialHeight - dy;
      newX = initialX + dx;
      newY = initialY + dy;
      break;
    case "ne":
      newWidth = initialWidth + dx;
      newHeight = initialHeight - dy;
      newY = initialY + dy;
      break;
    case "se":
      newWidth = initialWidth + dx;
      newHeight = initialHeight + dy;
      break;
    case "sw":
      newWidth = initialWidth - dx;
      newHeight = initialHeight + dy;
      newX = initialX + dx;
      break;
    case "e":
      newWidth = initialWidth + dx;
      break;
    case "w":
      newWidth = initialWidth - dx;
      newX = initialX + dx;
      break;
    case "n":
      newHeight = initialHeight - dy;
      newY = initialY + dy;
      break;
    case "s":
      newHeight = initialHeight + dy;
      break;
  }
  newWidth = Math.max(newWidth, 1);
  newHeight = Math.max(newHeight, 1);
  sel.setAttribute("data-x", newX);
  sel.setAttribute("data-y", newY);
  sel.setAttribute("data-width", newWidth);
  sel.setAttribute("data-height", newHeight);
  sel.setAttribute("x", newX);
  sel.setAttribute("y", newY);
  sel.setAttribute("width", newWidth);
  sel.setAttribute("height", newHeight);
  const fill = sel.getAttribute("fill");
  const stroke = sel.getAttribute("stroke");
  const strokeWidth = sel.getAttribute("stroke-width");
  const strokeDasharray = sel.getAttribute("stroke-dasharray");
  const rc6 = rough.svg(svg);
  const newShape = rc6.rectangle(newX, newY, newWidth, newHeight, {
    stroke,
    strokeWidth,
    fill
  });
  if (strokeDasharray) {
    newShape.setAttribute("stroke-dasharray", strokeDasharray);
  }
  for (let i = 0; i < newShape.attributes.length; i++) {
    sel.setAttribute(newShape.attributes[i].name, newShape.attributes[i].value);
  }
  sel.setAttribute("data-x", newX);
  sel.setAttribute("data-y", newY);
  sel.setAttribute("data-width", newWidth);
  sel.setAttribute("data-height", newHeight);
  sel.setAttribute("x", newX);
  sel.setAttribute("y", newY);
  sel.setAttribute("width", newWidth);
  sel.setAttribute("height", newHeight);
  removeSelectionAnchors();
  addSelectionAnchors(sel);
}
function removeSelectionAnchors() {
  if (selectionAnchors) {
    selectionAnchors.forEach((anchor) => {
      if (anchor.parentNode) {
        anchor.parentNode.removeChild(anchor);
      }
    });
    selectionAnchors = [];
  }
  const outline = svg.querySelector(".selection-outline");
  if (outline && outline.parentNode) {
    outline.parentNode.removeChild(outline);
  }
}
function addSelectionAnchors(element) {
  removeSelectionAnchors();
  const bbox = element.getBBox();
  let transform = element.getAttribute("transform") || "";
  let translateX = 0, translateY = 0;
  const translateMatch = transform.match(/translate\(([^)]+)\)/);
  if (translateMatch) {
    const coords = translateMatch[1].split(/[ ,]+/);
    translateX = parseFloat(coords[0]) || 0;
    translateY = parseFloat(coords[1]) || 0;
  }
  const padding = 5;
  const anchorPositions = [
    {
      x: bbox.x + translateX - padding,
      y: bbox.y + translateY - padding,
      cursor: "nw-resize",
      type: "nw"
    },
    {
      x: bbox.x + bbox.width + translateX + padding,
      y: bbox.y + translateY - padding,
      cursor: "ne-resize",
      type: "ne"
    },
    {
      x: bbox.x + bbox.width + translateX + padding,
      y: bbox.y + bbox.height + translateY + padding,
      cursor: "se-resize",
      type: "se"
    },
    {
      x: bbox.x + translateX - padding,
      y: bbox.y + bbox.height + translateY + padding,
      cursor: "sw-resize",
      type: "sw"
    },
    {
      x: bbox.x + bbox.width / 2 + translateX,
      y: bbox.y + translateY - padding - 20,
      cursor: "grab",
      type: "rotate"
    },
    // New anchors for the sides
    {
      x: bbox.x + translateX + bbox.width / 2,
      y: bbox.y + translateY - padding,
      cursor: "n-resize",
      type: "n"
    },
    {
      x: bbox.x + translateX + bbox.width + padding,
      y: bbox.y + translateY + bbox.height / 2,
      cursor: "e-resize",
      type: "e"
    },
    {
      x: bbox.x + translateX + bbox.width / 2,
      y: bbox.y + translateY + bbox.height + padding,
      cursor: "s-resize",
      type: "s"
    },
    {
      x: bbox.x + translateX - padding,
      y: bbox.y + translateY + bbox.height / 2,
      cursor: "w-resize",
      type: "w"
    }
  ];
  anchorPositions.forEach((pos) => {
    const anchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    anchor.setAttribute("cx", pos.x);
    anchor.setAttribute("cy", pos.y);
    anchor.setAttribute("r", 7);
    anchor.setAttribute("stroke", "#7875A6");
    anchor.style.cursor = pos.cursor;
    anchor.classList.add("anchor");
    anchor.anchorType = pos.type;
    anchor.addEventListener("pointerdown", anchorPointerDown);
    svg.appendChild(anchor);
    selectionAnchors.push(anchor);
  });
  const x = bbox.x + translateX - padding;
  const y = bbox.y + translateY - padding;
  const width = bbox.width + 2 * padding;
  const height = bbox.height + 2 * padding;
  const points2 = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
    [x, y]
  ];
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  outline.setAttribute("points", points2.map((pt) => pt[0] + "," + pt[1]).join(" "));
  outline.setAttribute("class", "selection-outline");
  outline.setAttribute("stroke", "#7875A6");
  outline.setAttribute("stroke-width", "2");
  outline.setAttribute("fill", "none");
  outline.style.pointerEvents = "none";
  svg.appendChild(outline);
}
var selectedElements, selectionAnchors, isScaling, activeAnchor3, initialBBox, startSVG, isAnchorClicked;
var init_ResizeShapes = __esm({
  "src/core/ResizeShapes.js"() {
    selectedElements = [];
    selectionAnchors = [];
    isScaling = false;
    activeAnchor3 = null;
    initialBBox = null;
    startSVG = null;
    isAnchorClicked = false;
    svg.addEventListener("pointermove", anchorPointerMove);
    svg.addEventListener("pointerup", anchorPointerUp);
  }
});

// src/core/ResizeCode.js
var ResizeCode_exports = {};
var init_ResizeCode = __esm({
  "src/core/ResizeCode.js"() {
  }
});

// src/tools/eraserTool.js
var eraserTool_exports = {};
function findTopLevelGroup(element) {
  if (!element || element === svg) return null;
  let current = element;
  while (current && current.parentNode !== svg) {
    current = current.parentNode;
    if (!current || current === document.body) return null;
  }
  return current;
}
function handleElementHighlight(clientX, clientY) {
  if (!getIsErasing()) return;
  const targetedElements2 = getTargetedElements();
  const element = document.elementFromPoint(clientX, clientY);
  if (!element || element === svg) return;
  let elementToHighlight = findTopLevelGroup(element);
  if (!elementToHighlight) return;
  if (elementToHighlight.style.pointerEvents === "none") return;
  if (!targetedElements2.has(elementToHighlight)) {
    targetedElements2.add(elementToHighlight);
    elementToHighlight.setAttribute("data-original-opacity", elementToHighlight.style.opacity || "1");
    elementToHighlight.dataset.storedOpacity = elementToHighlight.getAttribute("data-original-opacity");
    elementToHighlight.style.opacity = "0.3";
  }
}
function removeTargetedElements() {
  const targetedElements2 = getTargetedElements();
  const elementsToRemove = Array.from(targetedElements2);
  if (elementsToRemove.length > 0) {
    const deletionActions = [];
    elementsToRemove.forEach((element) => {
      const originalOpacity = element.dataset.storedOpacity || "1";
      deletionActions.push({
        type: ACTION_DELETE,
        element,
        parent: element.parentNode,
        nextSibling: element.nextSibling,
        originalOpacity
      });
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      if (window.shapes) {
        const idx = window.shapes.findIndex(
          (s) => s.element === element || s.group === element || s.wrapper === element
        );
        if (idx !== -1) {
          window.shapes.splice(idx, 1);
        }
      }
    });
    if (deletionActions.length > 0 && window.historyStack) {
      window.historyStack.push(...deletionActions);
    }
    window.redoStack = [];
    if (typeof clearAllSelections === "function") clearAllSelections();
    if (typeof updateUndoRedoButtons === "function") updateUndoRedoButtons();
    targetedElements2.clear();
  }
}
var eraserCursorSVG;
var init_eraserTool = __esm({
  "src/tools/eraserTool.js"() {
    init_EraserTrail();
    eraserCursorSVG = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="#222" stroke="white" stroke-width="2"/></svg>')}`;
    window.forceCleanupEraserTrail = forceCleanupEraserTrail;
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
      if (!getIsErasing()) return;
      setIsErasing(false);
      removeTargetedElements();
      fadeOutEraserTrail();
      svg.style.cursor = "default";
    });
    svg.addEventListener("pointerleave", (e) => {
      if (!getIsErasing()) return;
      setIsErasing(false);
      removeTargetedElements();
      fadeOutEraserTrail();
      svg.style.cursor = "default";
    });
  }
});

// src/tools/laserTool.js
var laserTool_exports = {};
function screenToViewBoxPoint(x, y) {
  const CTM = svg.getScreenCTM();
  if (!CTM) return null;
  try {
    const inverseCTM = CTM.inverse();
    return {
      x: (x - CTM.e) * inverseCTM.a + (y - CTM.f) * inverseCTM.c,
      y: (x - CTM.e) * inverseCTM.b + (y - CTM.f) * inverseCTM.d
    };
  } catch (e) {
    return {
      x: (x - CTM.e) / CTM.a,
      y: (y - CTM.f) / CTM.d
    };
  }
}
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function smoothPoints2(points2) {
  if (points2.length <= 2) return points2;
  const result = [points2[0]];
  const half = Math.floor(smoothingWindow / 2);
  for (let i = 1; i < points2.length - 1; i++) {
    let sx = 0, sy = 0, count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(points2.length - 1, i + half); j++) {
      sx += points2[j].x;
      sy += points2[j].y;
      count++;
    }
    result.push({ x: sx / count, y: sy / count, timestamp: points2[i].timestamp });
  }
  result.push(points2[points2.length - 1]);
  return result;
}
function buildSmoothPath2(rawPoints) {
  if (rawPoints.length === 0) return "";
  if (rawPoints.length === 1) return `M ${rawPoints[0].x} ${rawPoints[0].y}`;
  const points2 = smoothPoints2(rawPoints);
  let d = `M ${points2[0].x} ${points2[0].y}`;
  if (points2.length === 2) {
    d += ` L ${points2[1].x} ${points2[1].y}`;
    return d;
  }
  const tension = 0.5;
  for (let i = 0; i < points2.length - 1; i++) {
    const p0 = points2[i === 0 ? 0 : i - 1];
    const p1 = points2[i];
    const p2 = points2[i + 1];
    const p3 = points2[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
function createLaserGroup(id) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", id);
  group.style.pointerEvents = "none";
  const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  glowPath.setAttribute("fill", "none");
  glowPath.setAttribute("stroke-linecap", "round");
  glowPath.setAttribute("stroke-linejoin", "round");
  glowPath.classList.add("laser-glow");
  group.appendChild(glowPath);
  const corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  corePath.setAttribute("fill", "none");
  corePath.setAttribute("stroke-linecap", "round");
  corePath.setAttribute("stroke-linejoin", "round");
  corePath.classList.add("laser-core");
  group.appendChild(corePath);
  svg.insertBefore(group, svg.firstChild);
  return group;
}
function updateLaserAppearance(laser, isFinalFade = false) {
  let laserGroup = document.getElementById(laser.id);
  const currentTime = performance.now();
  let points2 = isFinalFade ? laser.initialPoints : [...laser.points];
  if (!isFinalFade) {
    points2 = points2.filter((p) => currentTime - p.timestamp < fadeOutDuration);
    laser.points = points2;
  }
  if (points2.length === 0) {
    if (laserGroup) laserGroup.remove();
    if (isFinalFade) fadingLasers = fadingLasers.filter((l) => l.id !== laser.id);
    else lasers2 = lasers2.filter((l) => l.id !== laser.id);
    return;
  }
  if (!laserGroup) {
    laserGroup = createLaserGroup(laser.id);
  }
  const glowPath = laserGroup.querySelector(".laser-glow");
  const corePath = laserGroup.querySelector(".laser-core");
  const oldestAge = currentTime - points2[0].timestamp;
  const newestAge = currentTime - points2[points2.length - 1].timestamp;
  const avgAge = (oldestAge + newestAge) / 2;
  const ageProgress = Math.min(1, avgAge / fadeOutDuration);
  const easedFade = 1 - ageProgress * ageProgress;
  let opacity = baseLaserOpacity * easedFade;
  let coreW = baseLaserWidth / currentZoom;
  let glowW = glowWidth / currentZoom;
  if (isFinalFade) {
    opacity *= laser.fadeProgress;
    coreW *= laser.fadeProgress;
    glowW *= laser.fadeProgress;
  }
  opacity = Math.max(0.02, opacity);
  coreW = Math.max(0.5 / currentZoom, coreW);
  glowW = Math.max(1 / currentZoom, glowW);
  const pathD = buildSmoothPath2(points2);
  glowPath.setAttribute("d", pathD);
  glowPath.setAttribute("stroke", `rgba(255, 50, 50, ${opacity * 0.25})`);
  glowPath.setAttribute("stroke-width", glowW);
  corePath.setAttribute("d", pathD);
  corePath.setAttribute("stroke", `rgba(255, 50, 50, ${opacity})`);
  corePath.setAttribute("stroke-width", coreW);
}
function addPointToCurrentLaser(screenX, screenY) {
  const currentLaser = lasers2[lasers2.length - 1];
  if (!currentLaser) return;
  const svgPoint = screenToViewBoxPoint(screenX, screenY);
  if (!svgPoint) return;
  const lastPt = currentLaser.points[currentLaser.points.length - 1];
  const adjustedThreshold = minDistanceThreshold / currentZoom;
  if (!lastPt || distance(svgPoint, lastPt) >= adjustedThreshold) {
    currentLaser.points.push({ x: svgPoint.x, y: svgPoint.y, timestamp: performance.now() });
  }
}
function drawingLoop() {
  if (!isDrawing2) {
    drawingAnimationId = null;
    return;
  }
  const currentLaser = lasers2[lasers2.length - 1];
  if (currentLaser) {
    updateLaserAppearance(currentLaser, false);
  }
  drawingAnimationId = requestAnimationFrame(drawingLoop);
}
function fadingLasersLoop() {
  if (fadingLasers.length === 0) {
    fadingAnimationId = null;
    return;
  }
  const currentTime = performance.now();
  for (let i = fadingLasers.length - 1; i >= 0; i--) {
    const laser = fadingLasers[i];
    const elapsed = currentTime - laser.fadeStartTime;
    const rawProgress = Math.min(1, elapsed / fadeOutDuration);
    laser.fadeProgress = 1 - rawProgress * rawProgress * rawProgress;
    updateLaserAppearance(laser, true);
    if (laser.fadeProgress <= 0.01) {
      const laserGroup = document.getElementById(laser.id);
      if (laserGroup) laserGroup.remove();
      fadingLasers.splice(i, 1);
    }
  }
  fadingAnimationId = requestAnimationFrame(fadingLasersLoop);
}
function fadeLaserTrail2(laser) {
  lasers2 = lasers2.filter((l) => l.id !== laser.id);
  laser.fadeStartTime = performance.now();
  laser.initialPoints = [...laser.points];
  laser.fadeProgress = 1;
  fadingLasers.push(laser);
  if (!fadingAnimationId) {
    fadingAnimationId = requestAnimationFrame(fadingLasersLoop);
  }
}
var lazerCursor, isDrawing2, lasers2, fadingLasers, fadeOutDuration, baseLaserOpacity, baseLaserWidth, glowWidth, minDistanceThreshold, smoothingWindow, drawingAnimationId, fadingAnimationId;
var init_laserTool = __esm({
  "src/tools/laserTool.js"() {
    lazerCursor = `data:image/svg+xml;base64,${btoa('<svg viewBox="0 0 24 24" stroke-width="1" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><path d="M6.164 11.755a5.314 5.314 0 0 1-4.932-5.298 5.314 5.314 0 0 1 5.311-5.311 5.314 5.314 0 0 1 5.307 5.113l8.773 8.773a3.322 3.322 0 0 1 0 4.696l-.895.895a3.322 3.322 0 0 1-4.696 0l-8.868-8.868Z" style="fill:#fff"/><path stroke="#1b1b1f" fill="#fff" d="m7.868 11.113 7.773 7.774a2.359 2.359 0 0 0 1.667.691 2.368 2.368 0 0 0 2.357-2.358c0-.625-.248-1.225-.69-1.667L11.201 7.78 9.558 9.469l-1.69 1.643v.001Zm10.273 3.606-3.333 3.333m-3.25-6.583 2 2m-7-7 3 3M3.664 3.625l1 1M2.529 6.922l1.407-.144m5.735-2.932-1.118.866M4.285 9.823l.758-1.194m1.863-6.207-.13 1.408"/></svg>')}`;
    isDrawing2 = false;
    lasers2 = [];
    fadingLasers = [];
    fadeOutDuration = 1200;
    baseLaserOpacity = 0.85;
    baseLaserWidth = 3.5;
    glowWidth = 10;
    minDistanceThreshold = 1;
    smoothingWindow = 4;
    drawingAnimationId = null;
    fadingAnimationId = null;
    svg.addEventListener("mousedown", (e) => {
      if (!isLaserToolActive) return;
      if (e.target !== svg) {
        const isUIElement = e.target.closest(".selection-box, .resize-handle");
        if (isUIElement) return;
      }
      let screenPoint = { x: e.clientX, y: e.clientY };
      let startSvgPoint = screenToViewBoxPoint(screenPoint.x, screenPoint.y);
      if (!startSvgPoint) return;
      if (isDrawing2 && lasers2.length > 0) {
        fadeLaserTrail2(lasers2[lasers2.length - 1]);
      }
      isDrawing2 = true;
      const laserId = "laserGroup_" + Date.now() + "_" + Math.random().toString(16).slice(2);
      const newLaser = {
        id: laserId,
        points: [{ x: startSvgPoint.x, y: startSvgPoint.y, timestamp: performance.now() }]
      };
      lasers2.push(newLaser);
      if (!drawingAnimationId) {
        drawingAnimationId = requestAnimationFrame(drawingLoop);
      }
    });
    svg.addEventListener("mousemove", (e) => {
      if (isLaserToolActive) {
        svg.style.cursor = `url(${lazerCursor}) 0 0, auto`;
      }
      if (!isDrawing2) return;
      addPointToCurrentLaser(e.clientX, e.clientY);
    });
    svg.addEventListener("mouseup", (e) => {
      if (!isDrawing2) return;
      isDrawing2 = false;
      if (lasers2.length > 0) {
        fadeLaserTrail2(lasers2[lasers2.length - 1]);
      }
      if (isLaserToolActive) {
        svg.style.cursor = `url(${lazerCursor}) 0 0, auto`;
      } else {
        svg.style.cursor = "default";
      }
    });
    svg.addEventListener("mouseleave", (e) => {
      if (!isDrawing2) return;
      isDrawing2 = false;
      if (lasers2.length > 0) {
        fadeLaserTrail2(lasers2[lasers2.length - 1]);
      }
    });
  }
});

// src/core/MermaidSequenceParser.js
var MermaidSequenceParser_exports = {};
__export(MermaidSequenceParser_exports, {
  parseSequenceDiagram: () => parseSequenceDiagram
});
function parseSequenceDiagram(src) {
  const lines = src.trim().split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("%%"));
  if (lines.length === 0) return null;
  if (lines[0].toLowerCase() !== "sequencediagram") return null;
  const participants = [];
  const participantSet = /* @__PURE__ */ new Set();
  const messages = [];
  const notes = [];
  const blocks = [];
  const blockStack = [];
  let title = "";
  let autoNumber = false;
  let msgIndex = 0;
  function ensureParticipant(name) {
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!participantSet.has(trimmed)) {
      participantSet.add(trimmed);
      participants.push({ name: trimmed, type: "participant" });
    }
  }
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^title\s*:/i)) {
      title = line.replace(/^title\s*:\s*/i, "").trim();
      continue;
    }
    if (line.toLowerCase() === "autonumber") {
      autoNumber = true;
      continue;
    }
    const partMatch = line.match(/^(participant|actor)\s+(.+?)(?:\s+as\s+(.+))?$/i);
    if (partMatch) {
      const type = partMatch[1].toLowerCase();
      const rawName = partMatch[3] || partMatch[2];
      const name = rawName.trim();
      if (!participantSet.has(name)) {
        participantSet.add(name);
        participants.push({ name, type });
      }
      continue;
    }
    const noteMatch = line.match(/^Note\s+(left of|right of|over)\s+([^:]+?):\s*(.+)$/i);
    if (noteMatch) {
      const position = noteMatch[1].toLowerCase();
      const targets = noteMatch[2].split(",").map((s) => s.trim());
      const text = noteMatch[3].trim();
      targets.forEach((t) => ensureParticipant(t));
      notes.push({
        position,
        targets,
        text,
        atMessage: messages.length
        // placed after this many messages
      });
      continue;
    }
    const blockStartMatch = line.match(/^(alt|else|opt|loop|par|critical|break)\s*(.*)?$/i);
    if (blockStartMatch) {
      const blockType = blockStartMatch[1].toLowerCase();
      const label = (blockStartMatch[2] || "").trim();
      if (blockType === "else") {
        if (blockStack.length > 0) {
          const current = blockStack[blockStack.length - 1];
          current.sections.push({ label, startMsg: messages.length });
        }
      } else {
        const block = {
          type: blockType,
          label,
          startMsg: messages.length,
          sections: [{ label, startMsg: messages.length }],
          endMsg: messages.length
        };
        blockStack.push(block);
      }
      continue;
    }
    if (line.toLowerCase() === "end") {
      if (blockStack.length > 0) {
        const block = blockStack.pop();
        block.endMsg = messages.length;
        blocks.push(block);
      }
      continue;
    }
    const actMatch = line.match(/^(activate|deactivate)\s+(.+)$/i);
    if (actMatch) {
      ensureParticipant(actMatch[2].trim());
      continue;
    }
    let foundArrow = null;
    let arrowPos = -1;
    for (const pattern of ARROW_PATTERNS) {
      const idx = line.indexOf(pattern);
      if (idx > 0) {
        foundArrow = pattern;
        arrowPos = idx;
        break;
      }
    }
    if (foundArrow && arrowPos > 0) {
      const from = line.substring(0, arrowPos).trim();
      const rest = line.substring(arrowPos + foundArrow.length);
      const colonIdx = rest.indexOf(":");
      let to, text;
      if (colonIdx >= 0) {
        to = rest.substring(0, colonIdx).trim();
        text = rest.substring(colonIdx + 1).trim();
      } else {
        to = rest.trim();
        text = "";
      }
      ensureParticipant(from);
      ensureParticipant(to);
      const arrowType = ARROW_TYPES[foundArrow];
      msgIndex++;
      messages.push({
        from,
        to,
        text,
        number: autoNumber ? msgIndex : null,
        ...arrowType
      });
      continue;
    }
  }
  if (participants.length === 0) return null;
  return {
    type: "sequenceDiagram",
    title,
    participants,
    messages,
    notes,
    blocks,
    autoNumber
  };
}
var ARROW_TYPES, ARROW_PATTERNS;
var init_MermaidSequenceParser = __esm({
  "src/core/MermaidSequenceParser.js"() {
    ARROW_TYPES = {
      "->>": { solid: true, arrowHead: "open", cross: false },
      "-->>": { solid: false, arrowHead: "open", cross: false },
      "->>x": { solid: true, arrowHead: "open", cross: true },
      "-->>x": { solid: false, arrowHead: "open", cross: true },
      "->": { solid: true, arrowHead: "filled", cross: false },
      "-->": { solid: false, arrowHead: "filled", cross: false },
      "-x": { solid: true, arrowHead: "cross", cross: true },
      "--x": { solid: false, arrowHead: "cross", cross: true }
    };
    ARROW_PATTERNS = Object.keys(ARROW_TYPES).sort((a, b) => b.length - a.length);
  }
});

// src/core/MermaidSequenceRenderer.js
var MermaidSequenceRenderer_exports = {};
__export(MermaidSequenceRenderer_exports, {
  parseAndRenderSequence: () => parseAndRenderSequence,
  renderSequenceOnCanvas: () => renderSequenceOnCanvas,
  renderSequencePreviewSVG: () => renderSequencePreviewSVG,
  renderSequenceSVG: () => renderSequenceSVG
});
function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function measureText(text, fontSize) {
  const avgCharWidth = fontSize * 0.55;
  return text.length * avgCharWidth;
}
function wrapText(text, fontSize, maxWidth) {
  const segments = text.split(/<br\s*\/?>/i);
  const lines = [];
  for (const segment of segments) {
    const words = segment.split(/\s+/);
    let currentLine2 = "";
    for (const word of words) {
      const testLine = currentLine2 ? currentLine2 + " " + word : word;
      if (measureText(testLine, fontSize) > maxWidth && currentLine2) {
        lines.push(currentLine2);
        currentLine2 = word;
      } else {
        currentLine2 = testLine;
      }
    }
    if (currentLine2) lines.push(currentLine2);
  }
  return lines.length > 0 ? lines : [""];
}
function renderSequenceSVG(diagram, opts = {}) {
  if (!diagram || diagram.type !== "sequenceDiagram") return "";
  const participants = diagram.participants;
  const messages = diagram.messages;
  const notes = diagram.notes;
  const blocks = diagram.blocks || [];
  const pCount = participants.length;
  if (pCount === 0) return "";
  const pIndex = /* @__PURE__ */ new Map();
  participants.forEach((p, i) => pIndex.set(p.name, i));
  const contentWidth = (pCount - 1) * PARTICIPANT_GAP + PARTICIPANT_W;
  const totalWidth = opts.width || Math.max(contentWidth + SIDE_MARGIN * 2, 400);
  const startX7 = (totalWidth - contentWidth) / 2;
  const pCenters = participants.map((_, i) => startX7 + i * PARTICIPANT_GAP + PARTICIPANT_W / 2);
  const noteAtMsg = /* @__PURE__ */ new Map();
  for (const note of notes) {
    const fontSize = 11;
    const lines = wrapText(note.text, fontSize, NOTE_MAX_W - NOTE_PAD * 2);
    const h = lines.length * (fontSize + 4) + NOTE_PAD * 2;
    if (!noteAtMsg.has(note.atMessage)) noteAtMsg.set(note.atMessage, []);
    noteAtMsg.get(note.atMessage).push({ ...note, lines, height: h });
  }
  const topBoxBottom = TOP_MARGIN + PARTICIPANT_H;
  let currentY = topBoxBottom + 30;
  const msgYPositions = [];
  for (let mi = 0; mi < messages.length; mi++) {
    const notesBefore = noteAtMsg.get(mi);
    if (notesBefore) {
      const maxNoteH = Math.max(...notesBefore.map((n) => n.height));
      currentY += maxNoteH + 10;
    }
    msgYPositions.push(currentY);
    currentY += MSG_ROW_HEIGHT;
  }
  const notesAfterLast = noteAtMsg.get(messages.length);
  if (notesAfterLast) {
    const maxNoteH = Math.max(...notesAfterLast.map((n) => n.height));
    currentY += maxNoteH + 10;
  }
  const bottomBoxTop = currentY + 20;
  const totalHeight = bottomBoxTop + PARTICIPANT_H + BOTTOM_MARGIN;
  let svg3 = "";
  const defs = [];
  defs.push(`<marker id="seq-arrow-open" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polyline points="1,1 9,3.5 1,6" fill="none" stroke="${THEME.messageLine}" stroke-width="1.5" stroke-linejoin="round" />
    </marker>`);
  defs.push(`<marker id="seq-arrow-filled" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="1,1 9,3.5 1,6" fill="${THEME.messageLine}" stroke="none" />
    </marker>`);
  svg3 += `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${THEME.bg}" rx="8" />`;
  if (diagram.title) {
    svg3 += `<text x="${totalWidth / 2}" y="${TOP_MARGIN - 8}" text-anchor="middle" fill="${THEME.participantText}" font-size="14" font-family="${FONT_FAMILY}" font-weight="600">${escapeXml(diagram.title)}</text>`;
  }
  for (let pi = 0; pi < pCount; pi++) {
    const cx = pCenters[pi];
    svg3 += `<line x1="${cx}" y1="${topBoxBottom}" x2="${cx}" y2="${bottomBoxTop}" stroke="${THEME.lifeline}" stroke-width="1" stroke-dasharray="6 4" />`;
  }
  for (let pi = 0; pi < pCount; pi++) {
    const cx = pCenters[pi];
    const bx = cx - PARTICIPANT_W / 2;
    const by = TOP_MARGIN;
    svg3 += `<g data-seq-type="participant" data-seq-id="${escapeXml(participants[pi].name)}" data-seq-pos="top">`;
    svg3 += `<rect x="${bx}" y="${by}" width="${PARTICIPANT_W}" height="${PARTICIPANT_H}" rx="4" fill="${THEME.participantBg}" stroke="${THEME.participantBorder}" stroke-width="1.5" />`;
    svg3 += `<text x="${cx}" y="${by + PARTICIPANT_H / 2 + 1}" text-anchor="middle" dominant-baseline="central" fill="${THEME.participantText}" font-size="13" font-family="${FONT_FAMILY}">${escapeXml(participants[pi].name)}</text>`;
    svg3 += `</g>`;
  }
  for (let pi = 0; pi < pCount; pi++) {
    const cx = pCenters[pi];
    const bx = cx - PARTICIPANT_W / 2;
    const by = bottomBoxTop;
    svg3 += `<g data-seq-type="participant" data-seq-id="${escapeXml(participants[pi].name)}" data-seq-pos="bottom">`;
    svg3 += `<rect x="${bx}" y="${by}" width="${PARTICIPANT_W}" height="${PARTICIPANT_H}" rx="4" fill="${THEME.participantBg}" stroke="${THEME.participantBorder}" stroke-width="1.5" />`;
    svg3 += `<text x="${cx}" y="${by + PARTICIPANT_H / 2 + 1}" text-anchor="middle" dominant-baseline="central" fill="${THEME.participantText}" font-size="13" font-family="${FONT_FAMILY}">${escapeXml(participants[pi].name)}</text>`;
    svg3 += `</g>`;
  }
  for (const block of blocks) {
    const startY7 = block.startMsg < msgYPositions.length ? msgYPositions[block.startMsg] - 20 : topBoxBottom + 20;
    const endY = block.endMsg <= msgYPositions.length ? block.endMsg < msgYPositions.length ? msgYPositions[block.endMsg] - 10 : currentY : currentY;
    const blockX = startX7 - 15;
    const blockW = contentWidth + 30;
    svg3 += `<g data-seq-type="block" data-block-type="${block.type}">`;
    svg3 += `<rect x="${blockX}" y="${startY7}" width="${blockW}" height="${endY - startY7}" rx="4" fill="${THEME.blockBg}" stroke="${THEME.blockBorder}" stroke-width="1" stroke-dasharray="4 2" />`;
    svg3 += `<rect x="${blockX}" y="${startY7}" width="${measureText(block.type, 10) + 12}" height="18" rx="3" fill="${THEME.blockBorder}" />`;
    svg3 += `<text x="${blockX + 6}" y="${startY7 + 12}" fill="${THEME.bg}" font-size="10" font-family="${FONT_FAMILY}" font-weight="600">${escapeXml(block.type)}</text>`;
    if (block.label) {
      svg3 += `<text x="${blockX + measureText(block.type, 10) + 20}" y="${startY7 + 12}" fill="${THEME.blockLabel}" font-size="10" font-family="${FONT_FAMILY}" font-style="italic">[${escapeXml(block.label)}]</text>`;
    }
    for (let si = 1; si < block.sections.length; si++) {
      const section = block.sections[si];
      const secY = section.startMsg < msgYPositions.length ? msgYPositions[section.startMsg] - 15 : endY - 10;
      svg3 += `<line x1="${blockX}" y1="${secY}" x2="${blockX + blockW}" y2="${secY}" stroke="${THEME.blockBorder}" stroke-width="1" stroke-dasharray="4 2" />`;
      if (section.label) {
        svg3 += `<text x="${blockX + 8}" y="${secY + 13}" fill="${THEME.blockLabel}" font-size="10" font-family="${FONT_FAMILY}" font-style="italic">[${escapeXml(section.label)}]</text>`;
      }
    }
    svg3 += `</g>`;
  }
  for (let mi = 0; mi < messages.length; mi++) {
    const msg = messages[mi];
    const y = msgYPositions[mi];
    const fromIdx = pIndex.get(msg.from);
    const toIdx = pIndex.get(msg.to);
    if (fromIdx === void 0 || toIdx === void 0) continue;
    const fromX = pCenters[fromIdx];
    const toX = pCenters[toIdx];
    const isSelf = fromIdx === toIdx;
    svg3 += `<g data-seq-type="message" data-seq-idx="${mi}">`;
    if (isSelf) {
      const loopW = 40;
      const loopH = 25;
      const dash = msg.solid ? "" : ` stroke-dasharray="6 3"`;
      svg3 += `<path d="M ${fromX} ${y} L ${fromX + loopW} ${y} L ${fromX + loopW} ${y + loopH} L ${fromX + 4} ${y + loopH}" fill="none" stroke="${THEME.messageLine}" stroke-width="1.5"${dash} marker-end="url(#seq-arrow-open)" />`;
      if (msg.text) {
        svg3 += `<text x="${fromX + loopW + 6}" y="${y + loopH / 2 + 1}" dominant-baseline="central" fill="${THEME.messageText}" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(msg.text)}</text>`;
      }
    } else {
      const isLeft = toX < fromX;
      const lineEndX = isLeft ? toX + 4 : toX - 4;
      const dash = msg.solid ? "" : ` stroke-dasharray="6 3"`;
      const markerId = msg.arrowHead === "filled" ? "seq-arrow-filled" : "seq-arrow-open";
      if (msg.cross) {
        svg3 += `<line x1="${fromX}" y1="${y}" x2="${lineEndX}" y2="${y}" stroke="${THEME.messageLine}" stroke-width="1.5"${dash} />`;
        const xSize = 6;
        svg3 += `<line x1="${toX - xSize}" y1="${y - xSize}" x2="${toX + xSize}" y2="${y + xSize}" stroke="${THEME.crossColor}" stroke-width="2" />`;
        svg3 += `<line x1="${toX + xSize}" y1="${y - xSize}" x2="${toX - xSize}" y2="${y + xSize}" stroke="${THEME.crossColor}" stroke-width="2" />`;
      } else {
        svg3 += `<line x1="${fromX}" y1="${y}" x2="${lineEndX}" y2="${y}" stroke="${THEME.messageLine}" stroke-width="1.5"${dash} marker-end="url(#${markerId})" />`;
      }
      if (msg.text) {
        const midX = (fromX + toX) / 2;
        const textContent = msg.number ? `${msg.number}. ${msg.text}` : msg.text;
        svg3 += `<text x="${midX}" y="${y - 8}" text-anchor="middle" fill="${THEME.messageText}" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(textContent)}</text>`;
      }
    }
    svg3 += `</g>`;
  }
  for (const [msgIdx, noteGroup] of noteAtMsg.entries()) {
    const baseY = msgIdx < msgYPositions.length ? msgYPositions[msgIdx] - 15 : msgIdx > 0 ? msgYPositions[msgIdx - 1] + MSG_ROW_HEIGHT - 15 : topBoxBottom + 30;
    for (const note of noteGroup) {
      const targetIdxs = note.targets.map((t) => pIndex.get(t)).filter((i) => i !== void 0);
      if (targetIdxs.length === 0) continue;
      const fontSize = 11;
      const lineH = fontSize + 4;
      const noteH = note.lines.length * lineH + NOTE_PAD * 2;
      const noteW = Math.min(
        NOTE_MAX_W,
        Math.max(...note.lines.map((l) => measureText(l, fontSize))) + NOTE_PAD * 2 + 10
      );
      let noteX;
      if (note.position === "left of") {
        const px = pCenters[targetIdxs[0]];
        noteX = px - PARTICIPANT_W / 2 - noteW - 8;
      } else if (note.position === "right of") {
        const px = pCenters[targetIdxs[0]];
        noteX = px + PARTICIPANT_W / 2 + 8;
      } else {
        if (targetIdxs.length >= 2) {
          const minP = Math.min(...targetIdxs);
          const maxP = Math.max(...targetIdxs);
          const center = (pCenters[minP] + pCenters[maxP]) / 2;
          noteX = center - noteW / 2;
        } else {
          noteX = pCenters[targetIdxs[0]] - noteW / 2;
        }
      }
      const noteY = baseY - noteH;
      svg3 += `<g data-seq-type="note">`;
      svg3 += `<rect x="${noteX}" y="${noteY}" width="${noteW}" height="${noteH}" rx="3" fill="${THEME.noteBg}" stroke="${THEME.noteBorder}" stroke-width="1" />`;
      note.lines.forEach((line, li) => {
        svg3 += `<text x="${noteX + NOTE_PAD}" y="${noteY + NOTE_PAD + li * lineH + fontSize}" fill="${THEME.noteText}" font-size="${fontSize}" font-family="${FONT_FAMILY}">${escapeXml(line)}</text>`;
      });
      svg3 += `</g>`;
    }
  }
  const defsStr = defs.length > 0 ? `<defs>${defs.join("")}</defs>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">${defsStr}${svg3}</svg>`;
}
function renderSequencePreviewSVG(diagram) {
  return renderSequenceSVG(diagram, { width: 620 });
}
function parseAndRenderSequence(src) {
  const diagram = parseSequenceDiagram(src);
  if (!diagram) return "";
  return renderSequenceSVG(diagram);
}
function renderSequenceOnCanvas(diagram) {
  if (!diagram || diagram.type !== "sequenceDiagram") return false;
  if (!window.svg || !window.Frame) {
    console.error("[SequenceRenderer] Engine not initialized");
    return false;
  }
  const svgMarkup = renderSequenceSVG(diagram);
  if (!svgMarkup) return false;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) return false;
  const gWidth = parseFloat(svgEl.getAttribute("width"));
  const gHeight = parseFloat(svgEl.getAttribute("height"));
  const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  const vcx = vb.x + vb.width / 2;
  const vcy = vb.y + vb.height / 2;
  const framePad = 30;
  const frameW = gWidth + framePad * 2;
  const frameH = gHeight + framePad * 2;
  const frameX = vcx - frameW / 2;
  const frameY = vcy - frameH / 2;
  const title = diagram.title || "Sequence Diagram";
  let frame;
  try {
    frame = new window.Frame(frameX, frameY, frameW, frameH, {
      stroke: "#888",
      strokeWidth: 2,
      fill: "transparent",
      opacity: 1,
      frameName: title
    });
    frame._diagramType = "sequence";
    frame._diagramData = diagram;
    window.shapes.push(frame);
    if (window.pushCreateAction) window.pushCreateAction(frame);
  } catch (err) {
    console.error("[SequenceRenderer] Frame creation failed:", err);
    return false;
  }
  const NS4 = "http://www.w3.org/2000/svg";
  try {
    const graphGroup = document.createElementNS(NS4, "g");
    graphGroup.setAttribute("data-type", "sequence-diagram");
    graphGroup.setAttribute("transform", `translate(${frameX + framePad}, ${frameY + framePad})`);
    const defs = svgEl.querySelector("defs");
    if (defs) {
      let mainDefs = window.svg.querySelector("defs");
      if (!mainDefs) {
        mainDefs = document.createElementNS(NS4, "defs");
        window.svg.insertBefore(mainDefs, window.svg.firstChild);
      }
      while (defs.firstChild) {
        mainDefs.appendChild(defs.firstChild);
      }
    }
    while (svgEl.childNodes.length > 0) {
      const child = svgEl.childNodes[0];
      if (child.nodeName === "defs") {
        svgEl.removeChild(child);
        continue;
      }
      graphGroup.appendChild(child);
    }
    window.svg.appendChild(graphGroup);
    const seqShape = {
      shapeName: "sequenceContent",
      group: graphGroup,
      element: graphGroup,
      x: frameX + framePad,
      y: frameY + framePad,
      width: gWidth,
      height: gHeight,
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y})`);
      },
      updateAttachedArrows() {
      }
    };
    window.shapes.push(seqShape);
    if (frame.addShapeToFrame) frame.addShapeToFrame(seqShape);
  } catch (err) {
    console.error("[SequenceRenderer] SVG insertion failed:", err);
  }
  window.currentShape = frame;
  if (frame.selectFrame) frame.selectFrame();
  if (window.__sketchStoreApi) window.__sketchStoreApi.setSelectedShapeSidebar("frame");
  return true;
}
var PARTICIPANT_W, PARTICIPANT_H, PARTICIPANT_GAP, MSG_ROW_HEIGHT, NOTE_PAD, NOTE_MAX_W, TOP_MARGIN, BOTTOM_MARGIN, SIDE_MARGIN, FONT_FAMILY, THEME;
var init_MermaidSequenceRenderer = __esm({
  "src/core/MermaidSequenceRenderer.js"() {
    init_MermaidSequenceParser();
    PARTICIPANT_W = 100;
    PARTICIPANT_H = 36;
    PARTICIPANT_GAP = 140;
    MSG_ROW_HEIGHT = 50;
    NOTE_PAD = 10;
    NOTE_MAX_W = 160;
    TOP_MARGIN = 30;
    BOTTOM_MARGIN = 30;
    SIDE_MARGIN = 40;
    FONT_FAMILY = "lixFont, sans-serif";
    THEME = {
      bg: "#1e1e28",
      participantBg: "#232329",
      participantBorder: "#555",
      participantText: "#e8e8ee",
      lifeline: "#444",
      messageLine: "#888",
      messageDash: "#666",
      messageText: "#e0e0e0",
      noteBg: "#3a3520",
      noteBorder: "#665e30",
      noteText: "#d4c870",
      blockBg: "rgba(80,80,120,0.12)",
      blockBorder: "#555",
      blockLabel: "#a0a0b0",
      crossColor: "#e74c3c"
    };
  }
});

// src/core/MermaidFlowchartRenderer.js
var MermaidFlowchartRenderer_exports = {};
__export(MermaidFlowchartRenderer_exports, {
  renderFlowchartOnCanvas: () => renderFlowchartOnCanvas,
  renderFlowchartPreviewSVG: () => renderFlowchartPreviewSVG,
  renderFlowchartSVG: () => renderFlowchartSVG
});
function escapeXml2(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function measureText2(text, fontSize) {
  return text.length * fontSize * 0.55;
}
function renderFlowchartSVG(diagram, opts = {}) {
  if (!diagram || !diagram.nodes || diagram.nodes.length === 0) return "";
  const nodes = diagram.nodes;
  const edges = diagram.edges || [];
  const subgraphs = diagram.subgraphs || [];
  const direction = diagram.direction || "TD";
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    const nw = n.width || NODE_W;
    const nh = n.height || NODE_H;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + nw);
    maxY = Math.max(maxY, n.y + nh);
  });
  const dw = maxX - minX || 1;
  const dh = maxY - minY || 1;
  const targetW = opts.width || dw + SIDE_MARGIN2 * 2;
  const targetH = opts.height || dh + TOP_MARGIN2 * 2;
  let scale, offX, offY;
  if (opts.width || opts.height) {
    const pad = 40;
    scale = Math.min(
      (targetW - pad * 2) / dw,
      (targetH - pad * 2) / dh,
      1.8
    );
    offX = (targetW - dw * scale) / 2 - minX * scale;
    offY = (targetH - dh * scale) / 2 - minY * scale;
  } else {
    scale = 1;
    offX = SIDE_MARGIN2 - minX;
    offY = TOP_MARGIN2 - minY;
  }
  const totalWidth = opts.width || Math.round(dw * scale + SIDE_MARGIN2 * 2);
  const totalHeight = opts.height || Math.round(dh * scale + TOP_MARGIN2 * 2);
  const nodeById = /* @__PURE__ */ new Map();
  nodes.forEach((n) => {
    const nw = (n.width || NODE_W) * scale;
    const nh = (n.height || NODE_H) * scale;
    const nx = n.x * scale + offX;
    const ny = n.y * scale + offY;
    nodeById.set(n.id, {
      x: nx,
      y: ny,
      w: nw,
      h: nh,
      cx: nx + nw / 2,
      cy: ny + nh / 2,
      type: n.type,
      label: n.label,
      fill: n.fill,
      stroke: n.stroke,
      strokeWidth: n.strokeWidth
    });
  });
  let svg3 = "";
  const defs = [];
  defs.push(`<marker id="fc-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <path d="M1,1 L9,3.5 L1,6" fill="none" stroke="${THEME2.edgeStroke}" stroke-width="1.5" stroke-linejoin="round" />
    </marker>`);
  defs.push(`<marker id="fc-arrow-thick" markerWidth="12" markerHeight="9" refX="11" refY="4.5" orient="auto">
      <path d="M1,1 L11,4.5 L1,8" fill="none" stroke="${THEME2.edgeStroke}" stroke-width="2" stroke-linejoin="round" />
    </marker>`);
  svg3 += `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${THEME2.bg}" rx="8" />`;
  for (const sg of subgraphs) {
    if (!sg.nodes || sg.nodes.length === 0) continue;
    let sgMinX = Infinity, sgMinY = Infinity, sgMaxX = -Infinity, sgMaxY = -Infinity;
    let hasNodes = false;
    for (const nid of sg.nodes) {
      const nd = nodeById.get(nid);
      if (!nd) continue;
      hasNodes = true;
      sgMinX = Math.min(sgMinX, nd.x);
      sgMinY = Math.min(sgMinY, nd.y);
      sgMaxX = Math.max(sgMaxX, nd.x + nd.w);
      sgMaxY = Math.max(sgMaxY, nd.y + nd.h);
    }
    if (!hasNodes) continue;
    const sgPad = 20 * scale;
    const sgX = sgMinX - sgPad;
    const sgY = sgMinY - sgPad - 16 * scale;
    const sgW = sgMaxX - sgMinX + sgPad * 2;
    const sgH = sgMaxY - sgMinY + sgPad * 2 + 16 * scale;
    svg3 += `<g data-fc-type="subgraph" data-fc-id="${escapeXml2(sg.id)}">`;
    svg3 += `<rect x="${sgX}" y="${sgY}" width="${sgW}" height="${sgH}" rx="6" fill="${THEME2.subgraphBg}" stroke="${THEME2.subgraphBorder}" stroke-width="1" stroke-dasharray="4 2" />`;
    if (sg.label) {
      svg3 += `<text x="${sgX + 8}" y="${sgY + 14}" fill="${THEME2.subgraphLabel}" font-size="${Math.max(9, 11 * scale)}" font-family="${FONT_FAMILY2}">${escapeXml2(sg.label)}</text>`;
    }
    svg3 += `</g>`;
  }
  edges.forEach((e) => {
    const f = nodeById.get(e.from);
    const t = nodeById.get(e.to);
    if (!f || !t) return;
    const directed = e.directed !== false;
    const edgeStyle = e.style || "normal";
    let strokeW, dashArr, markerRef;
    if (edgeStyle === "thick") {
      strokeW = 3;
      dashArr = "";
      markerRef = directed ? ' marker-end="url(#fc-arrow-thick)"' : "";
    } else if (edgeStyle === "dotted") {
      strokeW = 1.5;
      dashArr = ' stroke-dasharray="5 3"';
      markerRef = directed ? ' marker-end="url(#fc-arrow)"' : "";
    } else {
      strokeW = 1.5;
      dashArr = "";
      markerRef = directed ? ' marker-end="url(#fc-arrow)"' : "";
    }
    const eStroke = e.stroke || THEME2.edgeStroke;
    const sp = getEdgePoint(f, t);
    const ep = getEdgePoint(t, f);
    const dx = t.cx - f.cx;
    const dy = t.cy - f.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let mx = (sp.x + ep.x) / 2;
    let my = (sp.y + ep.y) / 2;
    svg3 += `<g data-fc-type="edge" data-fc-from="${escapeXml2(e.from)}" data-fc-to="${escapeXml2(e.to)}">`;
    if (dist > 0 && Math.abs(dy) > 15 && Math.abs(dx) > 15) {
      const perpX = -dy / dist;
      const perpY = dx / dist;
      const curveAmt = dist * 0.12;
      const cpx = mx + perpX * curveAmt;
      const cpy = my + perpY * curveAmt;
      mx = 0.25 * sp.x + 0.5 * cpx + 0.25 * ep.x;
      my = 0.25 * sp.y + 0.5 * cpy + 0.25 * ep.y;
      svg3 += `<path d="M ${sp.x} ${sp.y} Q ${cpx} ${cpy} ${ep.x} ${ep.y}" fill="none" stroke="${eStroke}" stroke-width="${strokeW}"${dashArr}${markerRef} />`;
    } else {
      svg3 += `<line x1="${sp.x}" y1="${sp.y}" x2="${ep.x}" y2="${ep.y}" stroke="${eStroke}" stroke-width="${strokeW}"${dashArr}${markerRef} />`;
    }
    if (e.label) {
      const labelFontSize = Math.max(8, 10 * scale);
      const labelLines = e.label.split("\n");
      const maxLineW = Math.max(...labelLines.map((l) => measureText2(l, labelFontSize)));
      const labelW = maxLineW + 12;
      const labelH = labelLines.length * (labelFontSize + 3) + 6;
      svg3 += `<rect x="${mx - labelW / 2}" y="${my - labelH / 2}" width="${labelW}" height="${labelH}" rx="3" fill="${THEME2.bg}" opacity="0.85" />`;
      if (labelLines.length === 1) {
        svg3 += `<text x="${mx}" y="${my + 1}" text-anchor="middle" dominant-baseline="central" fill="${THEME2.edgeText}" font-size="${labelFontSize}" font-family="${FONT_FAMILY2}">${escapeXml2(e.label)}</text>`;
      } else {
        const startY7 = my - (labelLines.length - 1) * (labelFontSize + 3) / 2;
        svg3 += `<text x="${mx}" text-anchor="middle" fill="${THEME2.edgeText}" font-size="${labelFontSize}" font-family="${FONT_FAMILY2}">`;
        labelLines.forEach((ln, idx) => {
          svg3 += `<tspan x="${mx}" dy="${idx === 0 ? 0 : labelFontSize + 3}" y="${idx === 0 ? startY7 : ""}">${escapeXml2(ln)}</tspan>`;
        });
        svg3 += `</text>`;
      }
    }
    svg3 += `</g>`;
  });
  nodes.forEach((n) => {
    const d = nodeById.get(n.id);
    if (!d) return;
    const nStroke = n.stroke || THEME2.nodeStroke;
    const nFill = n.fill || THEME2.nodeBg;
    const nStrokeWidth = n.strokeWidth || 1.8;
    const fontSize = Math.max(9, Math.min(13, 12 * scale));
    svg3 += `<g data-fc-type="node" data-fc-id="${escapeXml2(n.id)}">`;
    if (n.type === "circle") {
      const r = Math.min(d.w, d.h) / 2;
      svg3 += `<circle cx="${d.cx}" cy="${d.cy}" r="${r}" fill="${nFill}" stroke="${nStroke}" stroke-width="${nStrokeWidth}" />`;
    } else if (n.type === "diamond") {
      const hw = d.w / 2 * 0.85;
      const hh = d.h / 2 * 0.85;
      svg3 += `<polygon points="${d.cx},${d.cy - hh} ${d.cx + hw},${d.cy} ${d.cx},${d.cy + hh} ${d.cx - hw},${d.cy}" fill="${nFill}" stroke="${nStroke}" stroke-width="${nStrokeWidth}" />`;
    } else if (n.type === "asymmetric") {
      const notchX = d.x + 15 * scale;
      svg3 += `<polygon points="${d.x},${d.y} ${d.x + d.w},${d.y} ${d.x + d.w},${d.y + d.h} ${d.x},${d.y + d.h} ${notchX},${d.cy}" fill="${nFill}" stroke="${nStroke}" stroke-width="${nStrokeWidth}" />`;
    } else if (n.type === "roundrect") {
      svg3 += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="${12 * scale}" fill="${nFill}" stroke="${nStroke}" stroke-width="${nStrokeWidth}" />`;
    } else {
      svg3 += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="${3 * scale}" fill="${nFill}" stroke="${nStroke}" stroke-width="${nStrokeWidth}" />`;
    }
    if (n.label) {
      let labelFill = nFill && nFill !== "transparent" && nFill !== THEME2.nodeBg ? getContrastColor(nFill) : nStroke;
      if (isColorTooDark(labelFill)) labelFill = "#d0d0d0";
      const labelLines = n.label.split("\n");
      if (labelLines.length === 1) {
        svg3 += `<text x="${d.cx}" y="${d.cy}" text-anchor="middle" dominant-baseline="central" fill="${labelFill}" font-size="${fontSize}" font-family="${FONT_FAMILY2}" font-weight="500">${escapeXml2(n.label)}</text>`;
      } else {
        const lineH = fontSize + 3;
        const startY7 = d.cy - (labelLines.length - 1) * lineH / 2;
        svg3 += `<text text-anchor="middle" fill="${labelFill}" font-size="${fontSize}" font-family="${FONT_FAMILY2}" font-weight="500">`;
        labelLines.forEach((ln, idx) => {
          svg3 += `<tspan x="${d.cx}" y="${startY7 + idx * lineH}">${escapeXml2(ln)}</tspan>`;
        });
        svg3 += `</text>`;
      }
    }
    svg3 += `</g>`;
  });
  const defsStr = defs.length > 0 ? `<defs>${defs.join("")}</defs>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">${defsStr}${svg3}</svg>`;
}
function getEdgePoint(node, target) {
  const dx = target.cx - node.cx;
  const dy = target.cy - node.cy;
  if (node.type === "circle") {
    const r = Math.min(node.w, node.h) / 2;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: node.cx + dx / dist * r, y: node.cy + dy / dist * r };
  }
  if (node.type === "diamond") {
    const hw2 = node.w / 2 * 0.85;
    const hh2 = node.h / 2 * 0.85;
    const adx = Math.abs(dx) || 1e-3;
    const ady = Math.abs(dy) || 1e-3;
    const t = Math.min(hw2 / adx, hh2 / ady);
    return { x: node.cx + dx * t * 0.95, y: node.cy + dy * t * 0.95 };
  }
  const hw = node.w / 2;
  const hh = node.h / 2;
  if (Math.abs(dx) < 1e-3 || Math.abs(dy) * hw > Math.abs(dx) * hh) {
    if (dy > 0) return { x: node.cx, y: node.y + node.h };
    return { x: node.cx, y: node.y };
  }
  if (dx > 0) return { x: node.x + node.w, y: node.cy };
  return { x: node.x, y: node.cy };
}
function isColorTooDark(hex) {
  if (!hex || hex === "transparent" || hex === "none") return false;
  const rgb = parseColor(hex);
  if (!rgb) return false;
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b < 80;
}
function parseColor(hex) {
  if (!hex || hex === "transparent" || hex === "none") return null;
  let c = hex.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  if (c.length < 6) return null;
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16)
  };
}
function getLuminance(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return 0;
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
}
function getContrastColor(bgHex) {
  return getLuminance(bgHex) > 140 ? "#1a1a2e" : "#f0f0f0";
}
function renderFlowchartPreviewSVG(diagram) {
  return renderFlowchartSVG(diagram, { width: 600, height: 450 });
}
function renderFlowchartOnCanvas(diagram) {
  if (!diagram || !diagram.nodes || diagram.nodes.length === 0) return false;
  if (!window.svg || !window.Frame) {
    console.error("[FlowchartRenderer] Engine not initialized");
    return false;
  }
  const svgMarkup = renderFlowchartSVG(diagram);
  if (!svgMarkup) return false;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) return false;
  const gWidth = parseFloat(svgEl.getAttribute("width"));
  const gHeight = parseFloat(svgEl.getAttribute("height"));
  const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  const vcx = vb.x + vb.width / 2;
  const vcy = vb.y + vb.height / 2;
  const framePad = 30;
  const frameW = gWidth + framePad * 2;
  const frameH = gHeight + framePad * 2;
  const frameX = vcx - frameW / 2;
  const frameY = vcy - frameH / 2;
  const title = diagram.title || "Flowchart";
  let frame;
  try {
    frame = new window.Frame(frameX, frameY, frameW, frameH, {
      stroke: "#888",
      strokeWidth: 2,
      fill: "transparent",
      opacity: 1,
      frameName: title
    });
    frame._diagramType = "flowchart";
    frame._diagramData = diagram;
    window.shapes.push(frame);
    if (window.pushCreateAction) window.pushCreateAction(frame);
  } catch (err) {
    console.error("[FlowchartRenderer] Frame creation failed:", err);
    return false;
  }
  const NS4 = "http://www.w3.org/2000/svg";
  try {
    const graphGroup = document.createElementNS(NS4, "g");
    graphGroup.setAttribute("data-type", "flowchart-diagram");
    graphGroup.setAttribute("transform", `translate(${frameX + framePad}, ${frameY + framePad})`);
    const defs = svgEl.querySelector("defs");
    if (defs) {
      let mainDefs = window.svg.querySelector("defs");
      if (!mainDefs) {
        mainDefs = document.createElementNS(NS4, "defs");
        window.svg.insertBefore(mainDefs, window.svg.firstChild);
      }
      while (defs.firstChild) {
        mainDefs.appendChild(defs.firstChild);
      }
    }
    while (svgEl.childNodes.length > 0) {
      const child = svgEl.childNodes[0];
      if (child.nodeName === "defs") {
        svgEl.removeChild(child);
        continue;
      }
      graphGroup.appendChild(child);
    }
    window.svg.appendChild(graphGroup);
    const fcShape = {
      shapeName: "flowchartContent",
      group: graphGroup,
      element: graphGroup,
      x: frameX + framePad,
      y: frameY + framePad,
      width: gWidth,
      height: gHeight,
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y})`);
      },
      updateAttachedArrows() {
      }
    };
    window.shapes.push(fcShape);
    if (frame.addShapeToFrame) frame.addShapeToFrame(fcShape);
  } catch (err) {
    console.error("[FlowchartRenderer] SVG insertion failed:", err);
  }
  window.currentShape = frame;
  if (frame.selectFrame) frame.selectFrame();
  if (window.__sketchStoreApi) window.__sketchStoreApi.setSelectedShapeSidebar("frame");
  return true;
}
var NODE_W, NODE_H, SIDE_MARGIN2, TOP_MARGIN2, FONT_FAMILY2, THEME2;
var init_MermaidFlowchartRenderer = __esm({
  "src/core/MermaidFlowchartRenderer.js"() {
    NODE_W = 150;
    NODE_H = 50;
    SIDE_MARGIN2 = 50;
    TOP_MARGIN2 = 40;
    FONT_FAMILY2 = "lixFont, sans-serif";
    THEME2 = {
      bg: "#1e1e28",
      nodeBg: "transparent",
      nodeStroke: "#9090c0",
      nodeText: "#e0e0e0",
      edgeStroke: "#888",
      edgeText: "#a0a0b0",
      subgraphBg: "rgba(80,80,120,0.08)",
      subgraphBorder: "#555",
      subgraphLabel: "#888"
    };
  }
});

// src/core/AIRenderer.js
var AIRenderer_exports = {};
__export(AIRenderer_exports, {
  generateFramePreviewSVG: () => generateFramePreviewSVG,
  generatePreviewSVG: () => generatePreviewSVG,
  initAIRenderer: () => initAIRenderer,
  parseMermaid: () => parseMermaid,
  renderAIDiagram: () => renderAIDiagram
});
function parseMermaid(src) {
  const lines = src.trim().split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("%%"));
  if (lines.length === 0) return null;
  const headerMatch = lines[0].match(/^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/i);
  const direction = headerMatch ? headerMatch[2].toUpperCase() : "TD";
  const isHorizontal = direction === "LR" || direction === "RL";
  const startIdx = headerMatch ? 1 : 0;
  const nodesMap = /* @__PURE__ */ new Map();
  const edges = [];
  const classDefs = /* @__PURE__ */ new Map();
  const classAssigns = [];
  function cleanLabel(label) {
    return label.replace(/<br\s*\/?>/gi, "\n").replace(/"/g, "");
  }
  function parseNodeRef(raw) {
    raw = raw.trim();
    if (!raw) return null;
    let id, label, type;
    let m = raw.match(/^(\w+)\(\((.+?)\)\)$/);
    if (m) {
      id = m[1];
      label = m[2];
      type = "circle";
    }
    if (!m) {
      m = raw.match(/^(\w+)\{(.+?)\}$/);
      if (m) {
        id = m[1];
        label = m[2];
        type = "diamond";
      }
    }
    if (!m) {
      m = raw.match(/^(\w+)>(.+?)\]$/);
      if (m) {
        id = m[1];
        label = m[2];
        type = "asymmetric";
      }
    }
    if (!m) {
      m = raw.match(/^(\w+)\((.+?)\)$/);
      if (m) {
        id = m[1];
        label = m[2];
        type = "roundrect";
      }
    }
    if (!m) {
      m = raw.match(/^(\w+)\[(.+?)\]$/);
      if (m) {
        id = m[1];
        label = m[2];
        type = "rectangle";
      }
    }
    if (!m) {
      id = raw;
      label = raw;
      type = "rectangle";
    }
    label = cleanLabel(label);
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, type, label });
    } else if (label !== id) {
      nodesMap.get(id).label = label;
      nodesMap.get(id).type = type;
    }
    return id;
  }
  const subgraphs = [];
  let currentSubgraph = null;
  for (let i = startIdx; i < lines.length; i++) {
    let addToSubgraph = function(fromId, toId) {
      if (currentSubgraph) {
        if (fromId && !currentSubgraph.nodeIds.includes(fromId)) currentSubgraph.nodeIds.push(fromId);
        if (toId && !currentSubgraph.nodeIds.includes(toId)) currentSubgraph.nodeIds.push(toId);
      }
    };
    const line = lines[i].replace(/;$/, "").trim();
    if (!line) continue;
    const classDefMatch = line.match(/^classDef\s+(\w+)\s+(.+)$/i);
    if (classDefMatch) {
      const name = classDefMatch[1];
      const propsStr = classDefMatch[2].replace(/;$/, "");
      const props = {};
      for (const part of propsStr.split(",")) {
        const [key, val] = part.split(":").map((s) => s.trim());
        if (key === "fill") props.fill = val;
        else if (key === "stroke") props.stroke = val;
        else if (key === "stroke-width") props.strokeWidth = parseFloat(val);
      }
      classDefs.set(name, props);
      continue;
    }
    const classMatch = line.match(/^class\s+(.+?)\s+(\w+)$/i);
    if (classMatch) {
      const nodeIds2 = classMatch[1].split(",").map((s) => s.trim());
      classAssigns.push({ nodeIds: nodeIds2, className: classMatch[2] });
      continue;
    }
    const sgMatch = line.match(/^subgraph\s+(\w+)(?:\s*\[?"?(.+?)"?\]?)?$/i);
    if (sgMatch) {
      currentSubgraph = {
        id: sgMatch[1],
        label: sgMatch[2] || sgMatch[1],
        nodeIds: []
      };
      continue;
    }
    if (line.toLowerCase() === "end" && currentSubgraph) {
      subgraphs.push(currentSubgraph);
      currentSubgraph = null;
      continue;
    }
    let match = line.match(/^(.+?)\s*--\s*(.+?)\s*-->\s*(.+)$/);
    if (match) {
      const fromId = parseNodeRef(match[1].trim());
      const toId = parseNodeRef(match[3].trim());
      if (fromId && toId) edges.push({ from: fromId, to: toId, label: cleanLabel(match[2].trim()), directed: true, style: "normal" });
      addToSubgraph(fromId, toId);
      continue;
    }
    match = line.match(/^(.+?)\s*-\.->?\s*(?:\|([^|]*)\|)?\s*(.+)$/);
    if (match) {
      const fromId = parseNodeRef(match[1].trim());
      const toId = parseNodeRef(match[3].trim());
      const edgeLabel = match[2] ? cleanLabel(match[2].trim()) : void 0;
      if (fromId && toId) edges.push({ from: fromId, to: toId, label: edgeLabel, directed: true, style: "dotted" });
      addToSubgraph(fromId, toId);
      continue;
    }
    match = line.match(/^(.+?)\s*==>\s*(?:\|([^|]*)\|)?\s*(.+)$/);
    if (match) {
      const fromId = parseNodeRef(match[1].trim());
      const toId = parseNodeRef(match[3].trim());
      const edgeLabel = match[2] ? cleanLabel(match[2].trim()) : void 0;
      if (fromId && toId) edges.push({ from: fromId, to: toId, label: edgeLabel, directed: true, style: "thick" });
      addToSubgraph(fromId, toId);
      continue;
    }
    match = line.match(/^(.+?)\s*(-{3,})\s*(?:\|([^|]*)\|)?\s*(.+)$/);
    if (match && !match[2].includes(">")) {
      const fromId = parseNodeRef(match[1].trim());
      const toId = parseNodeRef(match[4].trim());
      const edgeLabel = match[3] ? cleanLabel(match[3].trim()) : void 0;
      if (fromId && toId) edges.push({ from: fromId, to: toId, label: edgeLabel, directed: false, style: "normal" });
      addToSubgraph(fromId, toId);
      continue;
    }
    match = line.match(/^(.+?)\s*(-{1,2}>|-->)\s*(?:\|([^|]*)\|)?\s*(.+)$/);
    if (match) {
      const fromId = parseNodeRef(match[1].trim());
      const toId = parseNodeRef(match[4].trim());
      const edgeLabel = match[3] ? cleanLabel(match[3].trim()) : void 0;
      if (fromId && toId) edges.push({ from: fromId, to: toId, label: edgeLabel, directed: true, style: "normal" });
      addToSubgraph(fromId, toId);
      continue;
    }
    const nodeId = parseNodeRef(line);
    if (nodeId && currentSubgraph) {
      if (!currentSubgraph.nodeIds.includes(nodeId)) currentSubgraph.nodeIds.push(nodeId);
    }
  }
  if (nodesMap.size === 0) return null;
  for (const assign of classAssigns) {
    const style = classDefs.get(assign.className);
    if (!style) continue;
    for (const nid of assign.nodeIds) {
      const node = nodesMap.get(nid);
      if (node) {
        if (style.fill) node.fill = style.fill;
        if (style.stroke) node.stroke = style.stroke;
        if (style.strokeWidth) node.strokeWidth = style.strokeWidth;
      }
    }
  }
  const nodeIds = Array.from(nodesMap.keys());
  const children = /* @__PURE__ */ new Map();
  const parents = /* @__PURE__ */ new Map();
  nodeIds.forEach((id) => {
    children.set(id, []);
    parents.set(id, []);
  });
  edges.forEach((e) => {
    if (children.has(e.from)) children.get(e.from).push(e.to);
    if (parents.has(e.to)) parents.get(e.to).push(e.from);
  });
  const layers = /* @__PURE__ */ new Map();
  const roots = nodeIds.filter((id) => parents.get(id).length === 0);
  if (roots.length === 0) roots.push(nodeIds[0]);
  const queue = roots.map((id) => ({ id, layer: 0 }));
  const visited = /* @__PURE__ */ new Set();
  while (queue.length > 0) {
    const { id, layer } = queue.shift();
    if (visited.has(id)) {
      if (layer > (layers.get(id) || 0)) layers.set(id, layer);
      continue;
    }
    visited.add(id);
    layers.set(id, Math.max(layer, layers.get(id) || 0));
    for (const child of children.get(id) || []) queue.push({ id: child, layer: layer + 1 });
  }
  nodeIds.forEach((id) => {
    if (!visited.has(id)) layers.set(id, 0);
  });
  const layerGroups = /* @__PURE__ */ new Map();
  layers.forEach((layer, id) => {
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer).push(id);
  });
  const nodes = [];
  Array.from(layerGroups.keys()).sort((a, b) => a - b).forEach((layerIdx, li) => {
    const group = layerGroups.get(layerIdx);
    const startOffset = -(group.length * H_SPACING) / 2 + H_SPACING / 2;
    group.forEach((id, gi) => {
      const nd = nodesMap.get(id);
      const x = isHorizontal ? li * H_SPACING : startOffset + gi * H_SPACING;
      const y = isHorizontal ? startOffset + gi * V_SPACING : li * V_SPACING;
      const labelLines = (nd.label || "").split("\n");
      const maxLineLen = Math.max(...labelLines.map((l) => l.length));
      const nw = Math.max(NODE_W2, maxLineLen * 10 + 40);
      const nh = Math.max(NODE_H2, labelLines.length * 20 + 20);
      nodes.push({
        id: nd.id,
        type: nd.type,
        label: nd.label,
        x,
        y,
        width: nw,
        height: nh,
        fill: nd.fill,
        stroke: nd.stroke,
        strokeWidth: nd.strokeWidth
      });
    });
  });
  return {
    title: "Mermaid Diagram",
    direction,
    nodes,
    edges: edges.map((e) => ({
      from: e.from,
      to: e.to,
      label: e.label,
      directed: e.directed !== false,
      style: e.style || "normal"
    })),
    subgraphs: subgraphs.length > 0 ? subgraphs.map((sg) => ({
      id: sg.id,
      label: sg.label,
      nodes: sg.nodeIds
    })) : void 0
  };
}
function renderAIDiagram(diagram) {
  if (!diagram?.nodes?.length) {
    console.error("[AIRenderer] Invalid diagram");
    return false;
  }
  const nodes = diagram.nodes;
  const edges = diagram.edges || [];
  const title = diagram.title || "AI Diagram";
  if (!window.svg || !window.Frame || !window.Rectangle) {
    console.error("[AIRenderer] Engine not initialized");
    return false;
  }
  const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  const vcx = vb.x + vb.width / 2;
  const vcy = vb.y + vb.height / 2;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || NODE_W2));
    maxY = Math.max(maxY, n.y + (n.height || NODE_H2));
  });
  const dw = maxX - minX, dh = maxY - minY;
  const ox = vcx - dw / 2 - minX;
  const oy = vcy - dh / 2 - minY;
  let frame;
  try {
    frame = new window.Frame(vcx - dw / 2 - PADDING, vcy - dh / 2 - PADDING, dw + PADDING * 2, dh + PADDING * 2, {
      stroke: "#888",
      strokeWidth: 2,
      fill: "transparent",
      opacity: 1,
      frameName: title
    });
    window.shapes.push(frame);
    if (window.pushCreateAction) window.pushCreateAction(frame);
  } catch (err) {
    console.error("[AIRenderer] Frame creation failed:", err);
    return false;
  }
  const nodeMap = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    const nx = node.x + ox, ny = node.y + oy;
    const nw = node.width || NODE_W2, nh = node.height || NODE_H2;
    const cx = nx + nw / 2, cy = ny + nh / 2;
    let shape = null;
    const nodeOpts = {
      stroke: node.stroke || "#e0e0e0",
      strokeWidth: node.strokeWidth ?? 1.5,
      fill: node.fill || "transparent",
      fillStyle: node.fillStyle || "none",
      roughness: node.roughness ?? 1,
      strokeDasharray: node.strokeDasharray || "",
      // Shading support
      shadeColor: node.shadeColor || null,
      shadeOpacity: node.shadeOpacity !== void 0 ? node.shadeOpacity : 0.15,
      shadeDirection: node.shadeDirection || "bottom",
      // Label styling
      labelColor: node.labelColor || void 0,
      labelFontSize: node.labelFontSize || void 0
    };
    try {
      if (node.type === "icon" && node.iconKeyword) {
        shape = new window.Rectangle(nx, ny, nw, nh, {
          ...nodeOpts,
          stroke: nodeOpts.stroke,
          strokeDasharray: "4 3"
        });
        fetchAndPlaceIcon(node.iconKeyword, nx, ny, nw, nh, shape, frame);
      } else if (node.type === "circle" && window.Circle) {
        shape = new window.Circle(cx, cy, nw / 2, nh / 2, nodeOpts);
      } else if (node.type === "diamond" && window.Rectangle) {
        const sz = Math.max(nw, nh) * 0.7;
        shape = new window.Rectangle(cx - sz / 2, cy - sz / 2, sz, sz, nodeOpts);
        shape.rotation = 45;
        shape.draw();
      } else if (node.type === "roundrect" && window.Rectangle) {
        shape = new window.Rectangle(nx, ny, nw, nh, { ...nodeOpts, cornerRadius: Math.min(nw, nh) * 0.2 });
      } else if (window.Rectangle) {
        shape = new window.Rectangle(nx, ny, nw, nh, nodeOpts);
      }
    } catch (err) {
      console.warn("[AIRenderer] Node creation failed:", node.id, err);
      continue;
    }
    if (!shape) continue;
    if (node.rotation && shape.rotation !== void 0 && node.type !== "diamond") {
      shape.rotation = node.rotation;
    }
    window.shapes.push(shape);
    if (window.pushCreateAction) window.pushCreateAction(shape);
    if (frame.addShapeToFrame) frame.addShapeToFrame(shape);
    nodeMap.set(node.id, { shape, x: nx, y: ny, width: nw, height: nh, centerX: cx, centerY: cy });
    if (node.label) {
      let labelColor = node.labelColor || node.stroke || "#e0e0e0";
      if (isColorTooDark2(labelColor)) {
        labelColor = "#e0e0e0";
      }
      const labelFontSize = node.labelFontSize || 14;
      if (node.type === "icon") {
        const labelY = cy + nh / 2 + 18;
        createLabel(node.label, cx, labelY, labelFontSize, labelColor, frame);
      } else if (shape && typeof shape.setLabel === "function") {
        shape.setLabel(node.label, labelColor, labelFontSize);
      } else {
        createLabel(node.label, cx, cy, labelFontSize, labelColor, frame);
      }
    }
  }
  const fanOut = /* @__PURE__ */ new Map();
  const fanIdx = /* @__PURE__ */ new Map();
  edges.forEach((e) => {
    fanOut.set(e.from, (fanOut.get(e.from) || 0) + 1);
    fanIdx.set(e, fanOut.get(e.from) - 1);
  });
  const allNodeBounds = [];
  nodeMap.forEach((n) => {
    allNodeBounds.push({ x: n.x, y: n.y, width: n.width, height: n.height });
  });
  for (const edge of edges) {
    const from = nodeMap.get(edge.from), to = nodeMap.get(edge.to);
    if (!from || !to) continue;
    const count = fanOut.get(edge.from) || 1;
    const idx = fanIdx.get(edge);
    const isDirected = edge.directed !== false;
    const edgeStyle = chooseEdgeStyle(from, to, count, idx, allNodeBounds, nodeMap, edges);
    const sp = getSpreadEdgePoint(from, to, count, idx);
    const ep = getEdgePoint2(to, from);
    const adx = ep.x - sp.x, ady = ep.y - sp.y;
    const alen = Math.sqrt(adx * adx + ady * ady) || 1;
    const nudge = 6;
    const spN = { x: sp.x + adx / alen * nudge, y: sp.y + ady / alen * nudge };
    const epN = { x: ep.x - adx / alen * nudge, y: ep.y - ady / alen * nudge };
    let connector = null;
    const edgeStroke = edge.stroke || "#e0e0e0";
    const edgeStrokeWidth = edge.strokeWidth ?? 1.5;
    const edgeLineStyle = edge.lineStyle || "solid";
    const dashMap = { solid: "", dashed: "5 3", dotted: "2 2" };
    const dashValue = dashMap[edgeLineStyle] || "";
    if (isDirected && window.Arrow) {
      try {
        const opts = {
          stroke: edgeStroke,
          strokeWidth: edgeStrokeWidth,
          roughness: 1,
          arrowOutlineStyle: edgeLineStyle,
          arrowHeadStyle: edge.arrowHeadStyle || "default"
        };
        if (edgeStyle.type === "curved") {
          opts.arrowCurved = "curved";
          opts.arrowCurveAmount = edgeStyle.curveAmount;
        } else if (edgeStyle.type === "elbow") {
          opts.arrowCurved = "elbow";
        }
        connector = new window.Arrow(spN, epN, opts);
        window.shapes.push(connector);
        if (window.pushCreateAction) window.pushCreateAction(connector);
        if (frame.addShapeToFrame) frame.addShapeToFrame(connector);
        autoAttach(connector, from.shape, true, sp);
        autoAttach(connector, to.shape, false, ep);
      } catch (err) {
        console.warn("[AIRenderer] Arrow creation failed:", edge, err);
      }
    } else if (!isDirected && window.Line) {
      try {
        const opts = {
          stroke: edgeStroke,
          strokeWidth: edgeStrokeWidth,
          roughness: 1,
          strokeDasharray: dashValue
        };
        connector = new window.Line(spN, epN, opts);
        if (edgeStyle.type === "curved") {
          connector.isCurved = true;
          if (typeof connector.initializeCurveControlPoint === "function") {
            connector.initializeCurveControlPoint();
          }
          if (typeof connector.draw === "function") connector.draw();
        }
        window.shapes.push(connector);
        if (window.pushCreateAction) window.pushCreateAction(connector);
        if (frame.addShapeToFrame) frame.addShapeToFrame(connector);
      } catch (err) {
        console.warn("[AIRenderer] Line creation failed:", edge, err);
      }
    } else if (window.Arrow) {
      try {
        connector = new window.Arrow(spN, epN, {
          stroke: edgeStroke,
          strokeWidth: edgeStrokeWidth,
          roughness: 1
        });
        window.shapes.push(connector);
        if (window.pushCreateAction) window.pushCreateAction(connector);
        if (frame.addShapeToFrame) frame.addShapeToFrame(connector);
      } catch (err) {
        console.warn("[AIRenderer] Fallback arrow creation failed:", edge, err);
      }
    }
    if (edge.label && connector) {
      const edgeLabelColor = edgeStroke === "#e0e0e0" ? "#a0a0b0" : edgeStroke;
      if (typeof connector.setLabel === "function") {
        connector.setLabel(edge.label, edgeLabelColor, 11);
      } else {
        const mx = (spN.x + epN.x) / 2;
        const my = (spN.y + epN.y) / 2 - 18;
        createLabel(edge.label, mx, my, 11, edgeLabelColor, frame);
      }
    }
  }
  const subgraphs = diagram.subgraphs || [];
  for (const sg of subgraphs) {
    if (!sg.nodes || sg.nodes.length === 0) continue;
    let sgMinX = Infinity, sgMinY = Infinity, sgMaxX = -Infinity, sgMaxY = -Infinity;
    let hasNodes = false;
    for (const nid of sg.nodes) {
      const n = nodeMap.get(nid);
      if (!n) continue;
      hasNodes = true;
      sgMinX = Math.min(sgMinX, n.x);
      sgMinY = Math.min(sgMinY, n.y);
      sgMaxX = Math.max(sgMaxX, n.x + n.width);
      sgMaxY = Math.max(sgMaxY, n.y + n.height);
    }
    if (!hasNodes) continue;
    const sgPad = 30;
    try {
      const subFrame = new window.Frame(
        sgMinX - sgPad,
        sgMinY - sgPad - 20,
        sgMaxX - sgMinX + sgPad * 2,
        sgMaxY - sgMinY + sgPad * 2 + 20,
        {
          stroke: sg.stroke || "#555",
          strokeWidth: 1,
          fill: "transparent",
          opacity: 0.6,
          frameName: sg.label || sg.id
        }
      );
      window.shapes.push(subFrame);
      if (window.pushCreateAction) window.pushCreateAction(subFrame);
      if (frame.addShapeToFrame) frame.addShapeToFrame(subFrame);
      for (const nid of sg.nodes) {
        const n = nodeMap.get(nid);
        if (n && n.shape && subFrame.addShapeToFrame) {
          subFrame.addShapeToFrame(n.shape);
        }
      }
    } catch (err) {
      console.warn("[AIRenderer] Subgraph frame failed:", sg.id, err);
    }
  }
  window.currentShape = frame;
  if (frame.selectFrame) frame.selectFrame();
  if (window.__sketchStoreApi) window.__sketchStoreApi.setSelectedShapeSidebar("frame");
  console.log(`[AIRenderer] Done: ${nodes.length} nodes, ${edges.length} edges, ${subgraphs.length} subgraphs \u2192 "${title}"`);
  return true;
}
function chooseEdgeStyle(from, to, fanCount, fanIdx, allNodeBounds, nodeMap, edges) {
  const dx = Math.abs(from.centerX - to.centerX);
  const dy = Math.abs(from.centerY - to.centerY);
  if (fanCount > 1) {
    const curveAmount = 40 + (fanIdx - (fanCount - 1) / 2) * 35;
    return { type: "curved", curveAmount };
  }
  const isHAligned = dx < ALIGN_THRESHOLD;
  const isVAligned = dy < ALIGN_THRESHOLD;
  if (isHAligned || isVAligned) {
    const sp = getEdgePoint2(from, to);
    const ep = getEdgePoint2(to, from);
    const blocked = wouldCrossNode(sp, ep, from, to, allNodeBounds);
    if (blocked) {
      return { type: "curved", curveAmount: 40 };
    }
    return { type: "straight" };
  }
  const isGridLike = dx > ALIGN_THRESHOLD * 2 && dy > ALIGN_THRESHOLD * 2;
  if (isGridLike) {
    const elbowMidX = to.centerX;
    const elbowMidY = from.centerY;
    const elbowMid = { x: elbowMidX, y: elbowMidY };
    const seg1Blocked = wouldCrossNode(
      { x: from.centerX, y: from.centerY },
      elbowMid,
      from,
      to,
      allNodeBounds
    );
    const seg2Blocked = wouldCrossNode(
      elbowMid,
      { x: to.centerX, y: to.centerY },
      from,
      to,
      allNodeBounds
    );
    if (!seg1Blocked && !seg2Blocked) {
      return { type: "elbow" };
    }
  }
  return { type: "curved", curveAmount: 25 };
}
function wouldCrossNode(p1, p2, fromNode, toNode, allNodeBounds) {
  const margin = 10;
  for (const bounds of allNodeBounds) {
    if (bounds.x === fromNode.x && bounds.y === fromNode.y) continue;
    if (bounds.x === toNode.x && bounds.y === toNode.y) continue;
    const bx = bounds.x - margin;
    const by = bounds.y - margin;
    const bw = bounds.width + margin * 2;
    const bh = bounds.height + margin * 2;
    if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, bx, by, bw, bh)) {
      return true;
    }
  }
  return false;
}
function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  const left = rx, right = rx + rw, top = ry, bottom = ry + rh;
  if (Math.max(x1, x2) < left || Math.min(x1, x2) > right) return false;
  if (Math.max(y1, y2) < top || Math.min(y1, y2) > bottom) return false;
  if (x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) return true;
  if (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom) return true;
  return segmentsIntersect(x1, y1, x2, y2, left, top, right, top) || segmentsIntersect(x1, y1, x2, y2, right, top, right, bottom) || segmentsIntersect(x1, y1, x2, y2, left, bottom, right, bottom) || segmentsIntersect(x1, y1, x2, y2, left, top, left, bottom);
}
function segmentsIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  const d1 = cross(bx1, by1, bx2, by2, ax1, ay1);
  const d2 = cross(bx1, by1, bx2, by2, ax2, ay2);
  const d3 = cross(ax1, ay1, ax2, ay2, bx1, by1);
  const d4 = cross(ax1, ay1, ax2, ay2, bx2, by2);
  if ((d1 > 0 && d2 < 0 || d1 < 0 && d2 > 0) && (d3 > 0 && d4 < 0 || d3 < 0 && d4 > 0)) {
    return true;
  }
  return false;
}
function cross(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
function autoAttach(arrow, shape, isStart, contactPoint) {
  if (!arrow || !shape) return;
  if (typeof arrow.attachToShape !== "function") return;
  try {
    let side, offset;
    if (shape.shapeName === "rectangle" || shape.shapeName === "frame") {
      const sx = shape.x, sy = shape.y, sw = shape.width, sh = shape.height;
      const cx = sx + sw / 2, cy = sy + sh / 2;
      const distTop = Math.abs(contactPoint.y - sy);
      const distBottom = Math.abs(contactPoint.y - (sy + sh));
      const distLeft = Math.abs(contactPoint.x - sx);
      const distRight = Math.abs(contactPoint.x - (sx + sw));
      const minDist = Math.min(distTop, distBottom, distLeft, distRight);
      if (minDist === distTop) {
        side = "top";
        offset = { x: contactPoint.x - sx, y: 0, side: "top" };
      } else if (minDist === distBottom) {
        side = "bottom";
        offset = { x: contactPoint.x - sx, y: sh, side: "bottom" };
      } else if (minDist === distLeft) {
        side = "left";
        offset = { x: 0, y: contactPoint.y - sy, side: "left" };
      } else {
        side = "right";
        offset = { x: sw, y: contactPoint.y - sy, side: "right" };
      }
      const attachment = { side, point: contactPoint, offset };
      arrow.attachToShape(isStart, shape, attachment);
    } else if (shape.shapeName === "circle") {
      const angle = Math.atan2(
        contactPoint.y - shape.y,
        contactPoint.x - shape.x
      );
      const attachment = {
        side: "perimeter",
        point: contactPoint,
        offset: { angle, side: "perimeter" }
      };
      arrow.attachToShape(isStart, shape, attachment);
    }
  } catch (err) {
    console.warn("[AIRenderer] Auto-attach failed:", err);
  }
}
async function fetchAndPlaceIcon(keyword, x, y, w, h, placeholderShape, frame) {
  try {
    const res = await fetch(`/api/icons/search?q=${encodeURIComponent(keyword)}&inline=1`);
    if (!res.ok) return;
    const data = await res.json();
    const results = data.results;
    if (!results || results.length === 0 || !results[0].svg) return;
    const svgContent = results[0].svg;
    if (window.svg && window.IconShape) {
      const svg3 = window.svg;
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return;
      const vbWidth = parseFloat(svgEl.getAttribute("width") || svgEl.viewBox?.baseVal?.width || 24);
      const vbHeight = parseFloat(svgEl.getAttribute("height") || svgEl.viewBox?.baseVal?.height || 24);
      const scale = Math.min(w / vbWidth, h / vbHeight);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("type", "icon");
      g.setAttribute("x", x);
      g.setAttribute("y", y);
      g.setAttribute("width", w);
      g.setAttribute("height", h);
      g.setAttribute("data-shape-x", x);
      g.setAttribute("data-shape-y", y);
      g.setAttribute("data-shape-width", w);
      g.setAttribute("data-shape-height", h);
      g.setAttribute("data-shape-rotation", "0");
      g.setAttribute("data-viewbox-width", vbWidth);
      g.setAttribute("data-viewbox-height", vbHeight);
      g.setAttribute("transform", `translate(${x}, ${y}) scale(${scale})`);
      const children = svgEl.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
      children.forEach((child) => {
        const clone = child.cloneNode(true);
        if (!clone.getAttribute("fill") || clone.getAttribute("fill") === "none" || clone.getAttribute("fill") === "black" || clone.getAttribute("fill") === "#000" || clone.getAttribute("fill") === "#000000") {
          clone.setAttribute("fill", "#ffffff");
        }
        if (clone.getAttribute("stroke") === "black" || clone.getAttribute("stroke") === "#000" || clone.getAttribute("stroke") === "#000000") {
          clone.setAttribute("stroke", "#ffffff");
        }
        g.appendChild(clone);
      });
      const hitRect = document.createElementNS(NS, "rect");
      hitRect.setAttribute("x", "0");
      hitRect.setAttribute("y", "0");
      hitRect.setAttribute("width", vbWidth);
      hitRect.setAttribute("height", vbHeight);
      hitRect.setAttribute("fill", "transparent");
      hitRect.setAttribute("stroke", "none");
      g.insertBefore(hitRect, g.firstChild);
      svg3.appendChild(g);
      const iconShape = new window.IconShape(g);
      window.shapes.push(iconShape);
      if (window.pushCreateAction) window.pushCreateAction(iconShape);
      if (frame?.addShapeToFrame) frame.addShapeToFrame(iconShape);
      if (placeholderShape) {
        const idx = window.shapes.indexOf(placeholderShape);
        if (idx !== -1) window.shapes.splice(idx, 1);
        if (placeholderShape.group && placeholderShape.group.parentNode) {
          placeholderShape.group.parentNode.removeChild(placeholderShape.group);
        }
      }
    }
  } catch (err) {
    console.warn("[AIRenderer] Icon fetch failed for keyword:", keyword, err);
  }
}
function createLabel(text, x, y, fontSize, fill, frame) {
  const svg3 = window.svg;
  if (!svg3 || !window.TextShape) return null;
  try {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("data-type", "text-group");
    g.setAttribute("transform", `translate(${x}, ${y})`);
    g.setAttribute("data-x", x);
    g.setAttribute("data-y", y);
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", 0);
    t.setAttribute("y", 0);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "central");
    t.setAttribute("fill", fill);
    t.setAttribute("font-size", fontSize);
    t.setAttribute("font-family", "lixFont, sans-serif");
    t.setAttribute("data-initial-font", "lixFont");
    t.setAttribute("data-initial-color", fill);
    t.setAttribute("data-initial-size", fontSize + "px");
    t.textContent = text;
    g.appendChild(t);
    svg3.appendChild(g);
    const shape = new window.TextShape(g);
    window.shapes.push(shape);
    if (window.pushCreateAction) window.pushCreateAction(shape);
    if (frame?.addShapeToFrame) frame.addShapeToFrame(shape);
    return shape;
  } catch (err) {
    console.warn("[AIRenderer] Label creation failed:", err);
    return null;
  }
}
function getSpreadEdgePoint(node, targetNode, count, idx) {
  if (count <= 1) return getEdgePoint2(node, targetNode);
  const dx = targetNode.centerX - node.centerX;
  const dy = targetNode.centerY - node.centerY;
  const hw = node.width / 2;
  const hh = node.height / 2;
  const spread = 0.6;
  const t = count === 1 ? 0.5 : idx / (count - 1);
  const offset = (t - 0.5) * spread;
  if (Math.abs(dx) < 1e-3 || Math.abs(dy) * hw > Math.abs(dx) * hh) {
    const px2 = node.centerX + offset * node.width;
    const py2 = dy > 0 ? node.y + node.height : node.y;
    return { x: px2, y: py2 };
  }
  const px = dx > 0 ? node.x + node.width : node.x;
  const py = node.centerY + offset * node.height;
  return { x: px, y: py };
}
function getEdgePoint2(node, targetNode) {
  const dx = targetNode.centerX - node.centerX;
  const dy = targetNode.centerY - node.centerY;
  const hw = node.width / 2;
  const hh = node.height / 2;
  if (Math.abs(dx) < 1e-3 || Math.abs(dy) * hw > Math.abs(dx) * hh) {
    if (dy > 0) return { x: node.centerX, y: node.y + node.height };
    return { x: node.centerX, y: node.y };
  }
  if (dx > 0) return { x: node.x + node.width, y: node.centerY };
  return { x: node.x, y: node.centerY };
}
function generatePreviewSVG(diagram, width = 500, height = 350) {
  if (!diagram?.nodes?.length) return "";
  const nodes = diagram.nodes;
  const edges = diagram.edges || [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || NODE_W2));
    maxY = Math.max(maxY, n.y + (n.height || NODE_H2));
  });
  const dw = maxX - minX || 1;
  const dh = maxY - minY || 1;
  const pad = 40;
  const scale = Math.min((width - pad * 2) / dw, (height - pad * 2) / dh, 1.5);
  const offX = (width - dw * scale) / 2 - minX * scale;
  const offY = (height - dh * scale) / 2 - minY * scale;
  const nodeById = /* @__PURE__ */ new Map();
  nodes.forEach((n) => {
    const nx = n.x * scale + offX;
    const ny = n.y * scale + offY;
    const nw = (n.width || NODE_W2) * scale;
    const nh = (n.height || NODE_H2) * scale;
    nodeById.set(n.id, { x: nx, y: ny, w: nw, h: nh, cx: nx + nw / 2, cy: ny + nh / 2 });
  });
  let svgContent = "";
  edges.forEach((e) => {
    const f = nodeById.get(e.from);
    const t = nodeById.get(e.to);
    if (!f || !t) return;
    const directed = e.directed !== false;
    const eColor = e.stroke || "#666";
    const markerId = directed ? `url(#preview-arrow-${eColor.replace("#", "")})` : "";
    if (directed && !svgContent.includes(`id="preview-arrow-${eColor.replace("#", "")}"`)) {
      svgContent = `<marker id="preview-arrow-${eColor.replace("#", "")}" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="${eColor}" stroke-width="1" /></marker>` + svgContent;
    }
    const eDash = e.lineStyle === "dashed" ? ' stroke-dasharray="5 3"' : e.lineStyle === "dotted" ? ' stroke-dasharray="2 2"' : "";
    const dx = t.cx - f.cx;
    const dy = t.cy - f.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let mx = (f.cx + t.cx) / 2;
    let my = (f.cy + t.cy) / 2;
    if (dist > 0 && Math.abs(dy) > 10 && Math.abs(dx) > 10) {
      const perpX = -dy / dist;
      const perpY = dx / dist;
      const curveAmt = dist * 0.15;
      const cpx = mx + perpX * curveAmt;
      const cpy = my + perpY * curveAmt;
      mx = 0.25 * f.cx + 0.5 * cpx + 0.25 * t.cx;
      my = 0.25 * f.cy + 0.5 * cpy + 0.25 * t.cy;
      svgContent += `<path d="M ${f.cx} ${f.cy} Q ${cpx} ${cpy} ${t.cx} ${t.cy}" fill="none" stroke="${eColor}" stroke-width="1.5"${eDash} marker-end="${markerId}" />`;
    } else {
      svgContent += `<line x1="${f.cx}" y1="${f.cy}" x2="${t.cx}" y2="${t.cy}" stroke="${eColor}" stroke-width="1.5"${eDash} marker-end="${markerId}" />`;
    }
    if (e.label) {
      svgContent += `<text x="${mx}" y="${my - 8}" text-anchor="middle" fill="${eColor === "#666" ? "#888" : eColor}" font-size="9" font-family="lixFont, sans-serif">${escapeXml3(e.label)}</text>`;
    }
  });
  nodes.forEach((n) => {
    const d = nodeById.get(n.id);
    if (!d) return;
    const nStroke = n.stroke || "#9090c0";
    const nFill = n.fill || "transparent";
    const nDash = n.strokeDasharray ? ` stroke-dasharray="${n.strokeDasharray}"` : "";
    if (n.type === "circle") {
      svgContent += `<ellipse cx="${d.cx}" cy="${d.cy}" rx="${d.w / 2}" ry="${d.h / 2}" fill="${nFill}" stroke="${nStroke}" stroke-width="1.5"${nDash} />`;
    } else if (n.type === "diamond") {
      const sz = Math.min(d.w, d.h) * 0.7;
      svgContent += `<rect x="${d.cx - sz / 2}" y="${d.cy - sz / 2}" width="${sz}" height="${sz}" fill="${nFill}" stroke="${nStroke}" stroke-width="1.5"${nDash} transform="rotate(45, ${d.cx}, ${d.cy})" />`;
    } else if (n.type === "roundrect") {
      svgContent += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="${Math.min(d.w, d.h) * 0.2}" fill="${nFill}" stroke="${nStroke}" stroke-width="1.5"${nDash} />`;
    } else {
      svgContent += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="4" fill="${nFill}" stroke="${nStroke}" stroke-width="1.5"${nDash} />`;
    }
    if (n.label) {
      const fontSize = Math.max(8, Math.min(12, 11 * scale));
      let labelFill = nStroke === "#9090c0" ? "#d0d0d0" : nStroke;
      if (isColorTooDark2(labelFill)) labelFill = "#d0d0d0";
      const labelY = n.type === "icon" ? d.cy + d.h / 2 + 12 * scale : d.cy;
      svgContent += `<text x="${d.cx}" y="${labelY}" text-anchor="middle" dominant-baseline="central" fill="${labelFill}" font-size="${fontSize}" font-family="lixFont, sans-serif">${escapeXml3(n.label)}</text>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${svgContent.match(/<marker[^]*?<\/marker>/g)?.join("") || ""}</defs>
  ${svgContent.replace(/<marker[^]*?<\/marker>/g, "")}
</svg>`;
}
function escapeXml3(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function isColorTooDark2(hex) {
  if (!hex || hex === "transparent" || hex === "none") return false;
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 80;
}
function generateFramePreviewSVG(frame, width = 500, height = 350) {
  if (!frame || !frame.clipGroup) return "";
  const fx = frame.x, fy = frame.y, fw = frame.width, fh = frame.height;
  if (fw <= 0 || fh <= 0) return "";
  const pad = 30;
  const scale = Math.min((width - pad * 2) / fw, (height - pad * 2) / fh, 1.5);
  const offX = (width - fw * scale) / 2 - fx * scale;
  const offY = (height - fh * scale) / 2 - fy * scale;
  let svgContent = "";
  svgContent += `<rect x="${fx * scale + offX}" y="${fy * scale + offY}" width="${fw * scale}" height="${fh * scale}" rx="6" fill="transparent" stroke="#555" stroke-width="1.5" stroke-dasharray="6 3" />`;
  if (frame.frameName) {
    svgContent += `<text x="${fx * scale + offX + 10}" y="${fy * scale + offY + 16}" fill="#888" font-size="11" font-family="lixFont, sans-serif">${escapeXml3(frame.frameName)}</text>`;
  }
  if (frame.containedShapes) {
    frame.containedShapes.forEach((shape) => {
      if (!shape) return;
      if (shape.shapeName === "rectangle") {
        const sx = shape.x * scale + offX;
        const sy = shape.y * scale + offY;
        const sw = shape.width * scale;
        const sh = shape.height * scale;
        const stroke = shape.options?.stroke || "#e0e0e0";
        const fill = shape.options?.fill || "transparent";
        if (shape.rotation === 45) {
          const sz = Math.min(sw, sh) * 0.7;
          const rcx = sx + sw / 2, rcy = sy + sh / 2;
          svgContent += `<rect x="${rcx - sz / 2}" y="${rcy - sz / 2}" width="${sz}" height="${sz}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" transform="rotate(45, ${rcx}, ${rcy})" />`;
          if (shape.label) {
            let lf = shape.labelColor || stroke;
            if (isColorTooDark2(lf)) lf = "#d0d0d0";
            const fs = Math.max(8, (shape.labelFontSize || 14) * scale);
            svgContent += `<text x="${rcx}" y="${rcy}" text-anchor="middle" dominant-baseline="central" fill="${lf}" font-size="${fs}" font-family="lixFont, sans-serif">${escapeXml3(shape.label)}</text>`;
          }
        } else {
          svgContent += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />`;
          if (shape.label) {
            let lf = shape.labelColor || stroke;
            if (isColorTooDark2(lf)) lf = "#d0d0d0";
            const fs = Math.max(8, (shape.labelFontSize || 14) * scale);
            svgContent += `<text x="${sx + sw / 2}" y="${sy + sh / 2}" text-anchor="middle" dominant-baseline="central" fill="${lf}" font-size="${fs}" font-family="lixFont, sans-serif">${escapeXml3(shape.label)}</text>`;
          }
        }
      } else if (shape.shapeName === "circle") {
        const ccx = shape.x * scale + offX;
        const ccy = shape.y * scale + offY;
        const crx = (shape.rx || 30) * scale;
        const cry = (shape.ry || 30) * scale;
        const stroke = shape.options?.stroke || "#e0e0e0";
        const fill = shape.options?.fill || "transparent";
        svgContent += `<ellipse cx="${ccx}" cy="${ccy}" rx="${crx}" ry="${cry}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />`;
        if (shape.label) {
          let lf = shape.labelColor || stroke;
          if (isColorTooDark2(lf)) lf = "#d0d0d0";
          const fs = Math.max(8, (shape.labelFontSize || 14) * scale);
          svgContent += `<text x="${ccx}" y="${ccy}" text-anchor="middle" dominant-baseline="central" fill="${lf}" font-size="${fs}" font-family="lixFont, sans-serif">${escapeXml3(shape.label)}</text>`;
        }
      } else if (shape.shapeName === "text") {
        const textEl = shape.group?.querySelector("text");
        if (textEl) {
          const tx = parseFloat(shape.group.getAttribute("data-x") || "0");
          const ty = parseFloat(shape.group.getAttribute("data-y") || "0");
          const fill = textEl.getAttribute("fill") || "#e0e0e0";
          const fontSize = Math.max(8, (parseFloat(textEl.getAttribute("font-size")) || 14) * scale);
          const text = textEl.textContent || "";
          let labelFill = fill;
          if (isColorTooDark2(labelFill)) labelFill = "#d0d0d0";
          svgContent += `<text x="${tx * scale + offX}" y="${ty * scale + offY}" text-anchor="middle" dominant-baseline="central" fill="${labelFill}" font-size="${fontSize}" font-family="lixFont, sans-serif">${escapeXml3(text)}</text>`;
        }
      } else if (shape.shapeName === "arrow") {
        const sp = shape.startPoint, ep = shape.endPoint;
        if (sp && ep) {
          const stroke = shape.options?.stroke || "#e0e0e0";
          const sx1 = sp.x * scale + offX, sy1 = sp.y * scale + offY;
          const sx2 = ep.x * scale + offX, sy2 = ep.y * scale + offY;
          if (shape.arrowCurved === "curved" && shape.controlPoint1 && shape.controlPoint2) {
            const cp1x = shape.controlPoint1.x * scale + offX;
            const cp1y = shape.controlPoint1.y * scale + offY;
            const cp2x = shape.controlPoint2.x * scale + offX;
            const cp2y = shape.controlPoint2.y * scale + offY;
            svgContent += `<path d="M ${sx1} ${sy1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${sx2} ${sy2}" fill="none" stroke="${stroke}" stroke-width="1.5" marker-end="url(#frame-preview-arrow)" />`;
          } else {
            svgContent += `<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${stroke}" stroke-width="1.5" marker-end="url(#frame-preview-arrow)" />`;
          }
          if (shape.label) {
            const amx = (sx1 + sx2) / 2, amy = (sy1 + sy2) / 2 - 8;
            const afs = Math.max(7, (shape.labelFontSize || 11) * scale);
            svgContent += `<text x="${amx}" y="${amy}" text-anchor="middle" fill="${shape.labelColor || stroke}" font-size="${afs}" font-family="lixFont, sans-serif">${escapeXml3(shape.label)}</text>`;
          }
        }
      } else if (shape.shapeName === "line") {
        const sp = shape.startPoint, ep = shape.endPoint;
        if (sp && ep) {
          const stroke = shape.options?.stroke || "#e0e0e0";
          const sx1 = sp.x * scale + offX, sy1 = sp.y * scale + offY;
          const sx2 = ep.x * scale + offX, sy2 = ep.y * scale + offY;
          if (shape.isCurved && shape.controlPoint) {
            const cpx = shape.controlPoint.x * scale + offX;
            const cpy = shape.controlPoint.y * scale + offY;
            svgContent += `<path d="M ${sx1} ${sy1} Q ${cpx} ${cpy} ${sx2} ${sy2}" fill="none" stroke="${stroke}" stroke-width="1.5" />`;
          } else {
            svgContent += `<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${stroke}" stroke-width="1.5" />`;
          }
          if (shape.label) {
            const lmx = (sx1 + sx2) / 2, lmy = (sy1 + sy2) / 2 - 8;
            const lfs = Math.max(7, (shape.labelFontSize || 11) * scale);
            svgContent += `<text x="${lmx}" y="${lmy}" text-anchor="middle" fill="${shape.labelColor || stroke}" font-size="${lfs}" font-family="lixFont, sans-serif">${escapeXml3(shape.label)}</text>`;
          }
        }
      } else if (shape.shapeName === "icon") {
        const ix = parseFloat(shape.group?.getAttribute("data-shape-x") || "0");
        const iy = parseFloat(shape.group?.getAttribute("data-shape-y") || "0");
        const iw = parseFloat(shape.group?.getAttribute("data-shape-width") || "40");
        const ih = parseFloat(shape.group?.getAttribute("data-shape-height") || "40");
        const pix = ix * scale + offX;
        const piy = iy * scale + offY;
        const piw = iw * scale;
        const pih = ih * scale;
        const iconPaths = shape.group?.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
        if (iconPaths && iconPaths.length > 0) {
          const vbW = parseFloat(shape.group?.getAttribute("data-viewbox-width") || iw);
          const vbH = parseFloat(shape.group?.getAttribute("data-viewbox-height") || ih);
          const iconScale = Math.min(piw / vbW, pih / vbH);
          svgContent += `<g transform="translate(${pix}, ${piy}) scale(${iconScale})">`;
          iconPaths.forEach((p) => {
            if (p.tagName === "rect" && p.getAttribute("fill") === "transparent" && p.getAttribute("stroke") === "none") return;
            const clone = p.cloneNode(true);
            svgContent += clone.outerHTML;
          });
          svgContent += `</g>`;
        } else {
          svgContent += `<rect x="${pix}" y="${piy}" width="${piw}" height="${pih}" rx="4" fill="transparent" stroke="#9090c0" stroke-width="1" stroke-dasharray="3 2" />`;
          svgContent += `<text x="${pix + piw / 2}" y="${piy + pih / 2}" text-anchor="middle" dominant-baseline="central" fill="#9090c0" font-size="9" font-family="lixFont">icon</text>`;
        }
      } else if (shape.shapeName === "frame") {
        const sx = shape.x * scale + offX;
        const sy = shape.y * scale + offY;
        const sw = shape.width * scale;
        const sh = shape.height * scale;
        svgContent += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="4" fill="transparent" stroke="${shape.options?.stroke || "#555"}" stroke-width="1" stroke-dasharray="4 2" opacity="0.6" />`;
        if (shape.frameName) {
          svgContent += `<text x="${sx + 6}" y="${sy + 12}" fill="#888" font-size="9" font-family="lixFont">${escapeXml3(shape.frameName)}</text>`;
        }
      }
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><marker id="frame-preview-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#e0e0e0" stroke-width="1" /></marker></defs>
  ${svgContent}
</svg>`;
}
function initAIRenderer() {
  let _seqParser = null;
  let _seqPreview = null;
  let _seqCanvas = null;
  let _fcPreview = null;
  let _fcCanvas = null;
  async function loadSequenceRenderer() {
    if (_seqParser) return;
    const mod = await Promise.resolve().then(() => (init_MermaidSequenceParser(), MermaidSequenceParser_exports));
    const rend = await Promise.resolve().then(() => (init_MermaidSequenceRenderer(), MermaidSequenceRenderer_exports));
    _seqParser = mod.parseSequenceDiagram;
    _seqPreview = rend.renderSequencePreviewSVG;
    _seqCanvas = rend.renderSequenceOnCanvas;
  }
  async function loadFlowchartRenderer() {
    if (_fcPreview) return;
    const mod = await Promise.resolve().then(() => (init_MermaidFlowchartRenderer(), MermaidFlowchartRenderer_exports));
    _fcPreview = mod.renderFlowchartPreviewSVG;
    _fcCanvas = mod.renderFlowchartOnCanvas;
  }
  function isSequenceDiagram(src) {
    return src.trim().split("\n")[0].trim().toLowerCase() === "sequencediagram";
  }
  window.__aiRenderer = renderAIDiagram;
  window.__aiPreview = generatePreviewSVG;
  window.__aiFramePreview = generateFramePreviewSVG;
  window.__mermaidParser = (src) => {
    if (isSequenceDiagram(src)) {
      try {
        if (_seqParser) return _seqParser(src);
        loadSequenceRenderer();
        return { _pendingSequence: true, src };
      } catch {
        return null;
      }
    }
    return parseMermaid(src);
  };
  window.__mermaidPreview = async (src) => {
    if (isSequenceDiagram(src)) {
      await loadSequenceRenderer();
      const diagram2 = _seqParser(src);
      if (!diagram2) return "";
      return _seqPreview(diagram2);
    }
    await loadFlowchartRenderer();
    const diagram = parseMermaid(src);
    if (!diagram) return "";
    return _fcPreview(diagram);
  };
  window.__mermaidRenderer = async (src) => {
    if (isSequenceDiagram(src)) {
      await loadSequenceRenderer();
      const diagram2 = _seqParser(src);
      if (!diagram2) {
        console.error("[AIRenderer] Sequence parse failed");
        return false;
      }
      return _seqCanvas(diagram2);
    }
    await loadFlowchartRenderer();
    const diagram = parseMermaid(src);
    if (!diagram) {
      console.error("[AIRenderer] Mermaid parse failed");
      return false;
    }
    return _fcCanvas(diagram);
  };
  loadSequenceRenderer();
  loadFlowchartRenderer();
}
var PADDING, NODE_W2, NODE_H2, H_SPACING, V_SPACING, NS, ALIGN_THRESHOLD;
var init_AIRenderer = __esm({
  "src/core/AIRenderer.js"() {
    PADDING = 80;
    NODE_W2 = 160;
    NODE_H2 = 60;
    H_SPACING = 260;
    V_SPACING = 180;
    NS = "http://www.w3.org/2000/svg";
    ALIGN_THRESHOLD = 30;
  }
});

// src/core/GraphMathParser.js
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if ("+-*/^(),".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: "num", value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let name = "";
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      tokens.push({ type: "id", value: name });
      continue;
    }
    i++;
  }
  return tokens;
}
function insertImplicitMul(tokens) {
  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    result.push(t);
    if (i + 1 < tokens.length) {
      const next = tokens[i + 1];
      const needsMul = (
        // num followed by id or (  → 2x, 2(x), 2sin(x)
        t.type === "num" && (next.type === "id" || next.value === "(") || // ) followed by ( or id or num → (x)(y), (x)2
        t.value === ")" && (next.type === "num" || next.type === "id" || next.value === "(") || // id followed by ( when id is NOT a function → x(2) means x*2
        t.type === "id" && next.value === "(" && !FUNCTIONS[t.value] || // id/num followed by id → xy means x*y
        t.type === "id" && !FUNCTIONS[t.value] && next.type === "id" || // num followed by num after implicit patterns (rare)
        t.type === "id" && !FUNCTIONS[t.value] && next.type === "num"
      );
      if (needsMul) {
        result.push({ type: "op", value: "*" });
      }
    }
  }
  return result;
}
function parse(tokens) {
  let pos = 0;
  function peek() {
    return tokens[pos];
  }
  function consume(expected) {
    const t = tokens[pos];
    if (expected && (!t || t.value !== expected)) return null;
    pos++;
    return t;
  }
  function parseExpr2() {
    let left = parseTerm();
    while (peek() && (peek().value === "+" || peek().value === "-")) {
      const op = consume().value;
      const right = parseTerm();
      const l = left, r = right;
      if (op === "+") left = (x) => l(x) + r(x);
      else left = (x) => l(x) - r(x);
    }
    return left;
  }
  function parseTerm() {
    let left = parsePower();
    while (peek() && (peek().value === "*" || peek().value === "/")) {
      const op = consume().value;
      const right = parsePower();
      const l = left, r = right;
      if (op === "*") left = (x) => l(x) * r(x);
      else left = (x) => {
        const d = r(x);
        return d === 0 ? NaN : l(x) / d;
      };
    }
    return left;
  }
  function parsePower() {
    let base = parseUnary();
    if (peek() && peek().value === "^") {
      consume();
      const exp = parsePower();
      const b = base;
      base = (x) => Math.pow(b(x), exp(x));
    }
    return base;
  }
  function parseUnary() {
    if (peek() && peek().value === "-") {
      consume();
      const val = parsePrimary();
      return (x) => -val(x);
    }
    if (peek() && peek().value === "+") {
      consume();
    }
    return parsePrimary();
  }
  function parsePrimary() {
    const t = peek();
    if (!t) return () => NaN;
    if (t.type === "num") {
      consume();
      const v = t.value;
      return () => v;
    }
    if (t.value === "(") {
      consume("(");
      const inner = parseExpr2();
      consume(")");
      return inner;
    }
    if (t.type === "id") {
      consume();
      const name = t.value.toLowerCase();
      if (CONSTANTS[name] !== void 0) {
        const v = CONSTANTS[name];
        return () => v;
      }
      if (FUNCTIONS[name] && peek() && peek().value === "(") {
        consume("(");
        const arg = parseExpr2();
        consume(")");
        const fn2 = FUNCTIONS[name];
        return (x) => fn2(arg(x));
      }
      if (name === "x") return (x) => x;
      return (x) => x;
    }
    consume();
    return () => NaN;
  }
  const fn = parseExpr2();
  return fn;
}
function parseExpression(input) {
  if (!input || typeof input !== "string") return null;
  try {
    let expr = input.trim();
    expr = expr.replace(/^[yf]\s*\(?\s*x?\s*\)?\s*=\s*/i, "");
    if (!expr) return null;
    const tokens = tokenize(expr);
    if (tokens.length === 0) return null;
    const withMul = insertImplicitMul(tokens);
    const fn = parse(withMul);
    const test1 = fn(0);
    const test2 = fn(1);
    if (typeof test1 !== "number" && typeof test2 !== "number") return null;
    return fn;
  } catch (e) {
    return null;
  }
}
function isValidExpression(input) {
  return parseExpression(input) !== null;
}
var FUNCTIONS, CONSTANTS;
var init_GraphMathParser = __esm({
  "src/core/GraphMathParser.js"() {
    FUNCTIONS = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sqrt: Math.sqrt,
      abs: Math.abs,
      log: Math.log10,
      ln: Math.log,
      exp: Math.exp,
      floor: Math.floor,
      ceil: Math.ceil
    };
    CONSTANTS = { pi: Math.PI, e: Math.E };
  }
});

// src/core/GraphRenderer.js
function niceInterval(range) {
  const rough3 = range / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(rough3)));
  const residual = rough3 / mag;
  let nice;
  if (residual <= 1.5) nice = 1;
  else if (residual <= 3) nice = 2;
  else if (residual <= 7) nice = 5;
  else nice = 10;
  return nice * mag;
}
function renderGraphSVG(equations, settings) {
  const {
    xMin = -10,
    xMax = 10,
    yMin = -10,
    yMax = 10,
    showGrid = true,
    width = 600,
    height = 400
  } = settings || {};
  const pad = { top: 20, right: 20, bottom: 35, left: 45 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const toSvgX = (x) => pad.left + (x - xMin) / xRange * plotW;
  const toSvgY = (y) => pad.top + (yMax - y) / yRange * plotH;
  let svg3 = "";
  svg3 += `<rect x="0" y="0" width="${width}" height="${height}" fill="#0d1117" rx="8" />`;
  svg3 += `<rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="#111822" />`;
  const xTick = niceInterval(xRange);
  const yTick = niceInterval(yRange);
  const xStart = Math.ceil(xMin / xTick) * xTick;
  for (let x = xStart; x <= xMax; x += xTick) {
    const sx = toSvgX(x);
    if (sx < pad.left || sx > pad.left + plotW) continue;
    if (showGrid) {
      svg3 += `<line x1="${sx}" y1="${pad.top}" x2="${sx}" y2="${pad.top + plotH}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />`;
    }
    const label = Math.abs(x) < 1e-10 ? "0" : Number.isInteger(x) ? x : x.toFixed(1);
    svg3 += `<text x="${sx}" y="${pad.top + plotH + 16}" text-anchor="middle" fill="#8b949e" font-size="10" font-family="lixCode, monospace">${label}</text>`;
  }
  const yStart = Math.ceil(yMin / yTick) * yTick;
  for (let y = yStart; y <= yMax; y += yTick) {
    const sy = toSvgY(y);
    if (sy < pad.top || sy > pad.top + plotH) continue;
    if (showGrid) {
      svg3 += `<line x1="${pad.left}" y1="${sy}" x2="${pad.left + plotW}" y2="${sy}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />`;
    }
    const label = Math.abs(y) < 1e-10 ? "0" : Number.isInteger(y) ? y : y.toFixed(1);
    svg3 += `<text x="${pad.left - 8}" y="${sy + 3}" text-anchor="end" fill="#8b949e" font-size="10" font-family="lixCode, monospace">${label}</text>`;
  }
  if (xMin <= 0 && xMax >= 0) {
    const ax = toSvgX(0);
    svg3 += `<line x1="${ax}" y1="${pad.top}" x2="${ax}" y2="${pad.top + plotH}" stroke="rgba(255,255,255,0.25)" stroke-width="1" />`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const ay = toSvgY(0);
    svg3 += `<line x1="${pad.left}" y1="${ay}" x2="${pad.left + plotW}" y2="${ay}" stroke="rgba(255,255,255,0.25)" stroke-width="1" />`;
  }
  svg3 += `<rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
  const samplesPerPixel = 2;
  const totalSamples = plotW * samplesPerPixel;
  const dx = xRange / totalSamples;
  equations.forEach((eq, eqIdx) => {
    if (!eq.expression || !eq.expression.trim()) return;
    const fn = parseExpression(eq.expression);
    if (!fn) return;
    const color = eq.color || GRAPH_COLORS[eqIdx % GRAPH_COLORS.length];
    let pathData = "";
    let drawing = false;
    for (let i = 0; i <= totalSamples; i++) {
      const x = xMin + i * dx;
      let y;
      try {
        y = fn(x);
      } catch {
        y = NaN;
      }
      if (!isFinite(y) || isNaN(y) || y < yMin - yRange * 5 || y > yMax + yRange * 5) {
        drawing = false;
        continue;
      }
      const clampedY = Math.max(yMin - yRange * 0.5, Math.min(yMax + yRange * 0.5, y));
      const sx = toSvgX(x);
      const sy = toSvgY(clampedY);
      if (!drawing) {
        pathData += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
        drawing = true;
      } else {
        pathData += `L ${sx.toFixed(1)} ${sy.toFixed(1)} `;
      }
    }
    if (pathData) {
      svg3 += `<path d="${pathData.trim()}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    }
  });
  const clipId = "graph-clip-" + Date.now();
  const defs = `<defs><clipPath id="${clipId}"><rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" /></clipPath></defs>`;
  let curves = "";
  equations.forEach((eq, eqIdx) => {
    if (!eq.expression || !eq.expression.trim()) return;
    const fn = parseExpression(eq.expression);
    if (!fn) return;
    const color = eq.color || GRAPH_COLORS[eqIdx % GRAPH_COLORS.length];
    let pathData = "";
    let drawing = false;
    for (let i = 0; i <= totalSamples; i++) {
      const x = xMin + i * dx;
      let y;
      try {
        y = fn(x);
      } catch {
        y = NaN;
      }
      if (!isFinite(y) || isNaN(y)) {
        drawing = false;
        continue;
      }
      const sx = toSvgX(x);
      const sy = toSvgY(y);
      if (!drawing) {
        pathData += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
        drawing = true;
      } else {
        pathData += `L ${sx.toFixed(1)} ${sy.toFixed(1)} `;
      }
    }
    if (pathData) {
      curves += `<path d="${pathData.trim()}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;
    }
  });
  let legendY = pad.top + 12;
  let legend = "";
  equations.forEach((eq, eqIdx) => {
    if (!eq.expression || !eq.expression.trim()) return;
    const color = eq.color || GRAPH_COLORS[eqIdx % GRAPH_COLORS.length];
    legend += `<circle cx="${pad.left + 12}" cy="${legendY}" r="4" fill="${color}" />`;
    legend += `<text x="${pad.left + 22}" y="${legendY + 3}" fill="${color}" font-size="11" font-family="lixCode, monospace">${escapeXml4(eq.expression)}</text>`;
    legendY += 18;
  });
  let cleanSvg = "";
  cleanSvg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#0d1117" rx="8" />`;
  cleanSvg += `<rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="#111822" />`;
  for (let x = xStart; x <= xMax; x += xTick) {
    const sx = toSvgX(x);
    if (sx < pad.left || sx > pad.left + plotW) continue;
    if (showGrid) {
      cleanSvg += `<line x1="${sx}" y1="${pad.top}" x2="${sx}" y2="${pad.top + plotH}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />`;
    }
    const label = Math.abs(x) < 1e-10 ? "0" : Number.isInteger(x) ? x : x.toFixed(1);
    cleanSvg += `<text x="${sx}" y="${pad.top + plotH + 16}" text-anchor="middle" fill="#8b949e" font-size="10" font-family="lixCode, monospace">${label}</text>`;
  }
  for (let y = yStart; y <= yMax; y += yTick) {
    const sy = toSvgY(y);
    if (sy < pad.top || sy > pad.top + plotH) continue;
    if (showGrid) {
      cleanSvg += `<line x1="${pad.left}" y1="${sy}" x2="${pad.left + plotW}" y2="${sy}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />`;
    }
    const label = Math.abs(y) < 1e-10 ? "0" : Number.isInteger(y) ? y : y.toFixed(1);
    cleanSvg += `<text x="${pad.left - 8}" y="${sy + 3}" text-anchor="end" fill="#8b949e" font-size="10" font-family="lixCode, monospace">${label}</text>`;
  }
  if (xMin <= 0 && xMax >= 0) {
    const ax = toSvgX(0);
    cleanSvg += `<line x1="${ax}" y1="${pad.top}" x2="${ax}" y2="${pad.top + plotH}" stroke="rgba(255,255,255,0.25)" stroke-width="1" />`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const ay = toSvgY(0);
    cleanSvg += `<line x1="${pad.left}" y1="${ay}" x2="${pad.left + plotW}" y2="${ay}" stroke="rgba(255,255,255,0.25)" stroke-width="1" />`;
  }
  cleanSvg += `<rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
  cleanSvg += `<g clip-path="url(#${clipId})">${curves}</g>`;
  cleanSvg += legend;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${cleanSvg}</svg>`;
}
function renderGraphPreviewSVG(equations, settings) {
  return renderGraphSVG(equations, {
    ...settings,
    width: 520,
    height: 380
  });
}
function escapeXml4(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var GRAPH_COLORS;
var init_GraphRenderer = __esm({
  "src/core/GraphRenderer.js"() {
    init_GraphMathParser();
    GRAPH_COLORS = [
      "#4A90D9",
      "#E74C3C",
      "#2ECC71",
      "#F39C12",
      "#9B59B6",
      "#1ABC9C",
      "#E67E22",
      "#3498DB",
      "#E91E63",
      "#00BCD4"
    ];
  }
});

// src/core/GraphEngine.js
var GraphEngine_exports = {};
__export(GraphEngine_exports, {
  initGraphEngine: () => initGraphEngine
});
function renderGraphOnCanvas(equations, settings) {
  if (!equations || equations.length === 0) return false;
  if (!window.svg || !window.Frame) {
    console.error("[GraphEngine] Engine not initialized");
    return false;
  }
  const svgMarkup = renderGraphSVG(equations, {
    ...settings,
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT
  });
  if (!svgMarkup) return false;
  const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  const vcx = vb.x + vb.width / 2;
  const vcy = vb.y + vb.height / 2;
  const frameW = GRAPH_WIDTH + 40;
  const frameH = GRAPH_HEIGHT + 40;
  const frameX = vcx - frameW / 2;
  const frameY = vcy - frameH / 2;
  const eqLabels = equations.filter((eq) => eq.expression && eq.expression.trim()).map((eq) => eq.expression.trim()).slice(0, 3);
  const title = eqLabels.length > 0 ? "Graph: " + eqLabels.join(", ") : "Graph";
  let frame;
  try {
    frame = new window.Frame(frameX, frameY, frameW, frameH, {
      stroke: "#4A90D9",
      strokeWidth: 2,
      fill: "transparent",
      opacity: 1,
      frameName: title
    });
    frame._graphData = {
      equations: equations.map((eq) => ({ expression: eq.expression, color: eq.color })),
      settings: { ...settings }
    };
    frame._frameType = "graph";
    window.shapes.push(frame);
    if (window.pushCreateAction) window.pushCreateAction(frame);
  } catch (err) {
    console.error("[GraphEngine] Frame creation failed:", err);
    return false;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) return false;
    const graphGroup = document.createElementNS(NS2, "g");
    graphGroup.setAttribute("data-type", "graph-group");
    graphGroup.setAttribute("transform", `translate(${frameX + 20}, ${frameY + 20})`);
    graphGroup.style.pointerEvents = "none";
    const defs = svgEl.querySelector("defs");
    if (defs) {
      const defsClone = defs.cloneNode(true);
      window.svg.querySelector("defs")?.appendChild(defsClone.firstChild) || window.svg.insertBefore(defsClone, window.svg.firstChild);
    }
    while (svgEl.childNodes.length > 0) {
      const child = svgEl.childNodes[0];
      if (child.nodeName === "defs") {
        svgEl.removeChild(child);
        continue;
      }
      graphGroup.appendChild(child);
    }
    window.svg.appendChild(graphGroup);
    const graphShape = {
      shapeName: "graphContent",
      group: graphGroup,
      element: graphGroup,
      x: frameX + 20,
      y: frameY + 20,
      width: GRAPH_WIDTH,
      height: GRAPH_HEIGHT,
      move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.group.setAttribute("transform", `translate(${this.x}, ${this.y})`);
      },
      updateAttachedArrows() {
      }
    };
    window.shapes.push(graphShape);
    if (frame.addShapeToFrame) frame.addShapeToFrame(graphShape);
  } catch (err) {
    console.error("[GraphEngine] SVG insertion failed:", err);
  }
  window.currentShape = frame;
  if (frame.selectFrame) frame.selectFrame();
  if (window.__sketchStoreApi) window.__sketchStoreApi.setSelectedShapeSidebar("frame");
  return true;
}
function initGraphEngine() {
  window.__graphPreview = (equations, settings) => {
    return renderGraphPreviewSVG(equations, settings);
  };
  window.__graphRenderer = renderGraphOnCanvas;
  window.__graphParser = (expr) => {
    const fn = parseExpression(expr);
    return fn ? true : false;
  };
  window.__graphValidate = isValidExpression;
  window.__graphColors = GRAPH_COLORS;
}
var NS2, GRAPH_WIDTH, GRAPH_HEIGHT;
var init_GraphEngine = __esm({
  "src/core/GraphEngine.js"() {
    init_GraphMathParser();
    init_GraphRenderer();
    NS2 = "http://www.w3.org/2000/svg";
    GRAPH_WIDTH = 600;
    GRAPH_HEIGHT = 420;
  }
});

// src/core/SceneSerializer.js
var SceneSerializer_exports = {};
__export(SceneSerializer_exports, {
  copyAsPNG: () => copyAsPNG,
  copyAsSVG: () => copyAsSVG,
  downloadScene: () => downloadScene,
  exportAsPDF: () => exportAsPDF,
  exportAsPNG: () => exportAsPNG,
  findTextOnCanvas: () => findTextOnCanvas,
  getSessionID: () => getSessionID,
  initSceneSerializer: () => initSceneSerializer,
  loadScene: () => loadScene,
  resetCanvas: () => resetCanvas,
  resetSessionID: () => resetSessionID,
  saveScene: () => saveScene,
  uploadScene: () => uploadScene,
  validateScene: () => validateScene
});
function getSessionID() {
  if (!_sessionID) {
    _sessionID = `lx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return _sessionID;
}
function resetSessionID() {
  _sessionID = null;
}
function cloneOptions3(options) {
  return JSON.parse(JSON.stringify(options));
}
function serializeShape2(shape) {
  const base = {
    shapeID: shape.shapeID,
    parentFrame: shape.parentFrame ? shape.parentFrame.shapeID : null,
    // Group membership — null when the shape isn't part of a group.
    // All shapes sharing a non-null groupId move/resize/rotate as a
    // unit (see Selection.handleMultiSelectionMouseDown).
    groupId: shape.groupId || null
  };
  switch (shape.shapeName) {
    case "rectangle":
      return {
        ...base,
        type: "rectangle",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        options: cloneOptions3(shape.options)
      };
    case "circle":
      return {
        ...base,
        type: "circle",
        x: shape.x,
        y: shape.y,
        rx: shape.rx,
        ry: shape.ry,
        rotation: shape.rotation,
        options: cloneOptions3(shape.options)
      };
    case "line":
      return {
        ...base,
        type: "line",
        startPoint: { x: shape.startPoint.x, y: shape.startPoint.y },
        endPoint: { x: shape.endPoint.x, y: shape.endPoint.y },
        controlPoint: shape.controlPoint ? { x: shape.controlPoint.x, y: shape.controlPoint.y } : null,
        isCurved: shape.isCurved || false,
        options: cloneOptions3(shape.options)
      };
    case "arrow": {
      const data = {
        ...base,
        type: "arrow",
        startPoint: { x: shape.startPoint.x, y: shape.startPoint.y },
        endPoint: { x: shape.endPoint.x, y: shape.endPoint.y },
        options: cloneOptions3(shape.options),
        arrowOutlineStyle: shape.arrowOutlineStyle,
        arrowHeadStyle: shape.arrowHeadStyle,
        arrowCurved: shape.arrowCurved,
        arrowCurveAmount: shape.arrowCurveAmount
      };
      if (shape.controlPoint1) data.controlPoint1 = { x: shape.controlPoint1.x, y: shape.controlPoint1.y };
      if (shape.controlPoint2) data.controlPoint2 = { x: shape.controlPoint2.x, y: shape.controlPoint2.y };
      if (shape.startAttachment) data.startAttachmentID = shape.startAttachment.shapeID;
      if (shape.endAttachment) data.endAttachmentID = shape.endAttachment.shapeID;
      return data;
    }
    case "freehandStroke":
      return {
        ...base,
        type: "freehandStroke",
        points: JSON.parse(JSON.stringify(shape.points)),
        rotation: shape.rotation,
        options: cloneOptions3(shape.options)
      };
    case "frame":
      return {
        ...base,
        type: "frame",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        frameName: shape.frameName,
        fillStyle: shape.fillStyle || "transparent",
        fillColor: shape.fillColor || "#1e1e28",
        gridSize: shape.gridSize || 20,
        gridColor: shape.gridColor || "rgba(255,255,255,0.06)",
        options: cloneOptions3(shape.options),
        containedShapeIDs: shape.containedShapes ? Array.from(shape.containedShapes).map((s) => s.shapeID) : []
      };
    case "text": {
      const group = shape.group;
      return {
        ...base,
        type: "text",
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        groupHTML: group.cloneNode(true).outerHTML
      };
    }
    case "code": {
      const group = shape.group;
      return {
        ...base,
        type: "code",
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        groupHTML: group.cloneNode(true).outerHTML
      };
    }
    case "image": {
      const el = shape.element;
      return {
        ...base,
        type: "image",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        href: el.getAttribute("href") || el.getAttributeNS("http://www.w3.org/1999/xlink", "href") || ""
      };
    }
    case "icon": {
      const el = shape.element;
      return {
        ...base,
        type: "icon",
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        elementHTML: el.cloneNode(true).outerHTML,
        viewboxWidth: parseFloat(el.getAttribute("data-viewbox-width")) || 24,
        viewboxHeight: parseFloat(el.getAttribute("data-viewbox-height")) || 24
      };
    }
    default:
      console.warn("[SceneSerializer] Unknown shape type:", shape.shapeName);
      return null;
  }
}
function deserializeShape(data) {
  const svgEl = window.svg;
  if (!svgEl) return null;
  const ns = "http://www.w3.org/2000/svg";
  switch (data.type) {
    case "rectangle": {
      const shape = new Rectangle2(data.x, data.y, data.width, data.height, data.options || {});
      if (data.rotation) shape.rotation = data.rotation;
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "circle": {
      const shape = new Circle2(data.x, data.y, data.rx, data.ry, data.options || {});
      if (data.rotation) shape.rotation = data.rotation;
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "line": {
      const shape = new Line2(data.startPoint, data.endPoint, data.options || {});
      if (data.controlPoint) shape.controlPoint = data.controlPoint;
      if (data.isCurved) shape.isCurved = data.isCurved;
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "arrow": {
      const shape = new Arrow2(data.startPoint, data.endPoint, data.options || {});
      if (data.controlPoint1) shape.controlPoint1 = data.controlPoint1;
      if (data.controlPoint2) shape.controlPoint2 = data.controlPoint2;
      if (data.arrowOutlineStyle) shape.arrowOutlineStyle = data.arrowOutlineStyle;
      if (data.arrowHeadStyle) shape.arrowHeadStyle = data.arrowHeadStyle;
      if (data.arrowCurved) shape.arrowCurved = data.arrowCurved;
      if (data.arrowCurveAmount) shape.arrowCurveAmount = data.arrowCurveAmount;
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "freehandStroke": {
      const shape = new FreehandStroke2(data.points, data.options || {});
      if (data.rotation) shape.rotation = data.rotation;
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "frame": {
      const frameOpts = { ...data.options || {}, frameName: data.frameName || "Frame" };
      if (data.fillStyle) frameOpts.fillStyle = data.fillStyle;
      if (data.fillColor) frameOpts.fillColor = data.fillColor;
      if (data.gridSize) frameOpts.gridSize = data.gridSize;
      if (data.gridColor) frameOpts.gridColor = data.gridColor;
      const shape = new Frame2(data.x, data.y, data.width, data.height, frameOpts);
      if (data.rotation) shape.rotation = data.rotation;
      if (data.shapeID) shape.shapeID = data.shapeID;
      shape.draw();
      return shape;
    }
    case "text": {
      if (!data.groupHTML) return null;
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<svg xmlns="${ns}">${data.groupHTML}</svg>`, "image/svg+xml");
      const group = doc.querySelector("g");
      if (!group) return null;
      const imported = svgEl.ownerDocument.importNode(group, true);
      svgEl.appendChild(imported);
      const shape = new TextShape2(imported);
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "code": {
      if (!data.groupHTML) return null;
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<svg xmlns="${ns}">${data.groupHTML}</svg>`, "image/svg+xml");
      const group = doc.querySelector("g");
      if (!group) return null;
      const imported = svgEl.ownerDocument.importNode(group, true);
      svgEl.appendChild(imported);
      const shape = new CodeShape2(imported);
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "image": {
      const imgEl = document.createElementNS(ns, "image");
      imgEl.setAttribute("x", data.x);
      imgEl.setAttribute("y", data.y);
      imgEl.setAttribute("width", data.width);
      imgEl.setAttribute("height", data.height);
      imgEl.setAttribute("href", data.href);
      imgEl.setAttribute("preserveAspectRatio", "none");
      svgEl.appendChild(imgEl);
      const shape = new ImageShape2(imgEl);
      if (data.rotation) shape.rotation = data.rotation;
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    case "icon": {
      if (!data.elementHTML) return null;
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<svg xmlns="${ns}">${data.elementHTML}</svg>`, "image/svg+xml");
      const iconGroup = doc.querySelector("g");
      if (!iconGroup) return null;
      const imported = svgEl.ownerDocument.importNode(iconGroup, true);
      svgEl.appendChild(imported);
      const shape = new IconShape2(imported);
      if (data.shapeID) shape.shapeID = data.shapeID;
      return shape;
    }
    default:
      console.warn("[SceneSerializer] Unknown type:", data.type);
      return null;
  }
}
function saveScene(workspaceName = "Untitled") {
  const allShapes = window.shapes || [];
  const serialized = [];
  for (const shape of allShapes) {
    const data = serializeShape2(shape);
    if (data) serialized.push(data);
  }
  const scene = {
    format: "lixsketch",
    version: FORMAT_VERSION,
    sessionID: getSessionID(),
    name: workspaceName,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    viewport: window.currentViewBox ? { ...window.currentViewBox } : null,
    zoom: window.currentZoom || 1,
    shapes: serialized
  };
  return scene;
}
function loadScene(sceneData) {
  if (!sceneData || sceneData.format !== "lixsketch") {
    console.error("[SceneSerializer] Invalid scene format");
    return false;
  }
  const svgEl = window.svg;
  if (!svgEl) return false;
  const existingShapes = window.shapes || [];
  existingShapes.forEach((shape) => {
    if (shape.shapeName === "frame") {
      if (shape.clipGroup && shape.clipGroup.parentNode) {
        shape.clipGroup.parentNode.removeChild(shape.clipGroup);
      }
      if (shape.clipPath && shape.clipPath.parentNode) {
        shape.clipPath.parentNode.removeChild(shape.clipPath);
      }
    }
    if (shape.group && shape.group.parentNode) {
      shape.group.parentNode.removeChild(shape.group);
    } else if (shape.element && shape.element.parentNode) {
      shape.element.parentNode.removeChild(shape.element);
    }
  });
  if (window.shapes) window.shapes.length = 0;
  else window.shapes = [];
  window.currentShape = null;
  if (window.historyStack) window.historyStack.length = 0;
  else window.historyStack = [];
  if (window.redoStack) window.redoStack.length = 0;
  else window.redoStack = [];
  const idMap = /* @__PURE__ */ new Map();
  const frameData = sceneData.shapes.filter((s) => s.type === "frame");
  const otherData = sceneData.shapes.filter((s) => s.type !== "frame");
  for (const data of frameData) {
    const shape = deserializeShape(data);
    if (shape) {
      if (data.groupId) shape.groupId = data.groupId;
      window.shapes.push(shape);
      if (data.shapeID) idMap.set(data.shapeID, shape);
    }
  }
  for (const data of otherData) {
    const shape = deserializeShape(data);
    if (shape) {
      if (data.groupId) shape.groupId = data.groupId;
      window.shapes.push(shape);
      if (data.shapeID) idMap.set(data.shapeID, shape);
    }
  }
  for (const data of frameData) {
    const frame = idMap.get(data.shapeID);
    if (frame && data.containedShapeIDs && data.containedShapeIDs.length > 0) {
      for (const childID of data.containedShapeIDs) {
        const child = idMap.get(childID);
        if (!child) {
          console.warn(`[SceneSerializer] Frame "${data.frameName}" references missing shape: ${childID}`);
          continue;
        }
        try {
          if (typeof frame.addShapeToFrame === "function") {
            frame.addShapeToFrame(child);
          } else {
            frame.containedShapes.push(child);
            child.parentFrame = frame;
          }
        } catch (err) {
          console.warn(`[SceneSerializer] Failed to restore containment for ${childID} in frame ${data.shapeID}:`, err);
          if (!frame.containedShapes.includes(child)) {
            frame.containedShapes.push(child);
          }
          child.parentFrame = frame;
        }
      }
    }
  }
  for (const data of sceneData.shapes) {
    if (data.type === "arrow") {
      const arrow = idMap.get(data.shapeID);
      if (!arrow) continue;
      if (data.startAttachmentID) {
        const target = idMap.get(data.startAttachmentID);
        if (target && arrow.setStartAttachment) arrow.setStartAttachment(target);
      }
      if (data.endAttachmentID) {
        const target = idMap.get(data.endAttachmentID);
        if (target && arrow.setEndAttachment) arrow.setEndAttachment(target);
      }
    }
  }
  if (sceneData.viewport && svgEl) {
    const vb = sceneData.viewport;
    window.currentViewBox = { ...vb };
    svgEl.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  }
  if (sceneData.zoom) {
    window.currentZoom = sceneData.zoom;
  }
  console.log(`[SceneSerializer] Loaded ${window.shapes.length} shapes from "${sceneData.name}"`);
  if (window.__sketchEngine && typeof window.__sketchEngine.setActiveTool === "function") {
    const store = window.__sketchStoreApi;
    const currentTool = store ? store.getState().activeTool : "select";
    window.__sketchEngine.setActiveTool(currentTool);
  } else {
    window.isSelectionToolActive = true;
  }
  return true;
}
function downloadScene(workspaceName = "Untitled") {
  const scene = saveScene(workspaceName);
  const json = JSON.stringify(scene, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${workspaceName.replace(/[^a-zA-Z0-9_-]/g, "_")}.lixjson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function validateScene(data) {
  if (!data || typeof data !== "object") return { valid: false, error: "Not a valid JSON object" };
  if (data.format !== "lixsketch") return { valid: false, error: "Not a LixSketch scene file (missing format field)" };
  if (!data.version || data.version > FORMAT_VERSION) return { valid: false, error: `Unsupported version: ${data.version}` };
  if (!Array.isArray(data.shapes)) return { valid: false, error: "Invalid scene: missing shapes array" };
  return {
    valid: true,
    name: data.name || "Untitled",
    shapeCount: data.shapes.length,
    sessionID: data.sessionID || null,
    createdAt: data.createdAt || null
  };
}
function uploadScene() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".lixjson,.json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return resolve(false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const validation = validateScene(data);
          if (!validation.valid) {
            console.error("[SceneSerializer] Invalid file:", validation.error);
            resolve({ success: false, error: validation.error });
            return;
          }
          resetSessionID();
          const result = loadScene(data);
          resolve({ success: result, validation });
        } catch (err) {
          console.error("[SceneSerializer] Failed to parse file:", err);
          resolve({ success: false, error: "Failed to parse JSON file" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
function exportAsPNG() {
  const svgEl = window.svg;
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true);
  const selectionEls = clone.querySelectorAll("[data-selection], .selection-handle, .resize-handle, .rotation-handle");
  selectionEls.forEach((el) => el.remove());
  const svgData = new XMLSerializer().serializeToString(clone);
  const canvas = document.createElement("canvas");
  const vb = svgEl.viewBox.baseVal;
  canvas.width = vb.width * 2;
  canvas.height = vb.height * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, vb.width, vb.height);
    ctx.drawImage(img, 0, 0, vb.width, vb.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "lixsketch-export.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, "image/png");
  };
  img.src = url;
}
function copyAsPNG() {
  const svgEl = window.svg;
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true);
  const selectionEls = clone.querySelectorAll("[data-selection], .selection-handle, .resize-handle, .rotation-handle");
  selectionEls.forEach((el) => el.remove());
  const svgData = new XMLSerializer().serializeToString(clone);
  const canvas = document.createElement("canvas");
  const vb = svgEl.viewBox.baseVal;
  canvas.width = vb.width * 2;
  canvas.height = vb.height * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, vb.width, vb.height);
    ctx.drawImage(img, 0, 0, vb.width, vb.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (!blob) return;
      navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]).catch((err) => console.warn("[SceneSerializer] Clipboard write failed:", err));
    }, "image/png");
  };
  img.src = url;
}
function copyAsSVG() {
  const svgEl = window.svg;
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true);
  const selectionEls = clone.querySelectorAll("[data-selection], .selection-handle, .resize-handle, .rotation-handle");
  selectionEls.forEach((el) => el.remove());
  const svgData = new XMLSerializer().serializeToString(clone);
  navigator.clipboard.writeText(svgData).catch((err) => console.warn("[SceneSerializer] Clipboard write failed:", err));
}
function exportAsPDF() {
  const svgEl = window.svg;
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true);
  const selectionEls = clone.querySelectorAll("[data-selection], .selection-handle, .resize-handle, .rotation-handle");
  selectionEls.forEach((el) => el.remove());
  const svgData = new XMLSerializer().serializeToString(clone);
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>LixSketch Export</title>
        <style>
            body { margin: 0; background: #121212; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            svg { max-width: 100vw; max-height: 100vh; }
            @media print { body { background: white; } }
        </style>
        </head>
        <body>${svgData}</body>
        </html>
    `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}
function resetCanvas() {
  const svgEl = window.svg;
  if (!svgEl) return;
  const existingShapes = window.shapes || [];
  existingShapes.forEach((shape) => {
    if (shape.shapeName === "frame") {
      if (shape.clipGroup && shape.clipGroup.parentNode) {
        shape.clipGroup.parentNode.removeChild(shape.clipGroup);
      }
      if (shape.clipPath && shape.clipPath.parentNode) {
        shape.clipPath.parentNode.removeChild(shape.clipPath);
      }
    }
    if (shape.group && shape.group.parentNode) {
      shape.group.parentNode.removeChild(shape.group);
    } else if (shape.element && shape.element.parentNode) {
      shape.element.parentNode.removeChild(shape.element);
    }
  });
  svgEl.querySelectorAll(
    ".selection-outline, .resize-anchor, .rotation-anchor, [data-selection]"
  ).forEach((el) => el.remove());
  if (window.shapes) window.shapes.length = 0;
  else window.shapes = [];
  window.currentShape = null;
  if (window.historyStack) window.historyStack.length = 0;
  else window.historyStack = [];
  if (window.redoStack) window.redoStack.length = 0;
  else window.redoStack = [];
  if (typeof window.clearAllSelections === "function") {
    window.clearAllSelections();
  }
  if (typeof window.disableAllSideBars === "function") {
    window.disableAllSideBars();
  }
  try {
    localStorage.removeItem("lixsketch-autosave");
    localStorage.removeItem("lixsketch-autosave-meta");
    const sid = window.__sessionID;
    if (sid) {
      localStorage.removeItem(`lixsketch-autosave-${sid}`);
      localStorage.removeItem(`lixsketch-autosave-meta-${sid}`);
    }
  } catch (_) {
  }
  console.log("[SceneSerializer] Canvas reset");
}
function findTextOnCanvas(query) {
  const allShapes = window.shapes || [];
  if (!query || query.trim() === "") return [];
  const lowerQuery = query.toLowerCase();
  const results = [];
  for (const shape of allShapes) {
    let textContent = "";
    if (shape.shapeName === "text" || shape.shapeName === "code") {
      const group = shape.group;
      if (group) {
        const textEls = group.querySelectorAll("text, tspan");
        textEls.forEach((el) => {
          if (el.textContent) textContent += el.textContent + " ";
        });
        const foreignEls = group.querySelectorAll("foreignObject *");
        foreignEls.forEach((el) => {
          if (el.textContent) textContent += el.textContent + " ";
        });
      }
    } else if (shape.shapeName === "frame") {
      textContent = shape.frameName || "";
    }
    textContent = textContent.trim();
    if (textContent && textContent.toLowerCase().includes(lowerQuery)) {
      results.push({
        shape,
        text: textContent,
        type: shape.shapeName,
        x: shape.x || 0,
        y: shape.y || 0
      });
    }
  }
  return results;
}
function initSceneSerializer() {
  window.__sceneSerializer = {
    save: saveScene,
    load: loadScene,
    download: downloadScene,
    upload: uploadScene,
    exportPNG: exportAsPNG,
    exportPDF: exportAsPDF,
    copyAsPNG,
    copyAsSVG,
    resetCanvas,
    findText: findTextOnCanvas
  };
}
var FORMAT_VERSION, _sessionID;
var init_SceneSerializer = __esm({
  "src/core/SceneSerializer.js"() {
    init_Rectangle();
    init_Circle();
    init_Line();
    init_Arrow();
    init_FreehandStroke();
    init_Frame();
    init_TextShape();
    init_CodeShape();
    init_ImageShape();
    init_IconShape();
    FORMAT_VERSION = 1;
    _sessionID = null;
  }
});

// src/core/LayerOrder.js
var LayerOrder_exports = {};
__export(LayerOrder_exports, {
  bringForward: () => bringForward,
  bringToFront: () => bringToFront,
  initLayerOrder: () => initLayerOrder,
  sendBackward: () => sendBackward,
  sendToBack: () => sendToBack
});
function bringForward(shape) {
  const shapes2 = window.shapes;
  if (!shapes2) return;
  const idx = shapes2.indexOf(shape);
  if (idx < 0 || idx >= shapes2.length - 1) return;
  [shapes2[idx], shapes2[idx + 1]] = [shapes2[idx + 1], shapes2[idx]];
  const el = shape.group || shape.element;
  const nextEl = shapes2[idx].group || shapes2[idx].element;
  if (el && nextEl && el.parentNode) {
    if (nextEl.nextSibling) {
      el.parentNode.insertBefore(el, nextEl.nextSibling);
    } else {
      el.parentNode.appendChild(el);
    }
  }
}
function sendBackward(shape) {
  const shapes2 = window.shapes;
  if (!shapes2) return;
  const idx = shapes2.indexOf(shape);
  if (idx <= 0) return;
  [shapes2[idx], shapes2[idx - 1]] = [shapes2[idx - 1], shapes2[idx]];
  const el = shape.group || shape.element;
  const prevEl = shapes2[idx].group || shapes2[idx].element;
  if (el && prevEl && el.parentNode) {
    el.parentNode.insertBefore(el, prevEl);
  }
}
function bringToFront(shape) {
  const shapes2 = window.shapes;
  if (!shapes2) return;
  const idx = shapes2.indexOf(shape);
  if (idx < 0) return;
  shapes2.splice(idx, 1);
  shapes2.push(shape);
  const el = shape.group || shape.element;
  if (el && el.parentNode) {
    el.parentNode.appendChild(el);
  }
}
function sendToBack(shape) {
  const shapes2 = window.shapes;
  if (!shapes2) return;
  const idx = shapes2.indexOf(shape);
  if (idx < 0) return;
  shapes2.splice(idx, 1);
  shapes2.unshift(shape);
  const el = shape.group || shape.element;
  if (el && el.parentNode) {
    el.parentNode.insertBefore(el, el.parentNode.firstChild);
  }
}
function initLayerOrder() {
  window.__layerOrder = { bringForward, sendBackward, bringToFront, sendToBack };
}
var init_LayerOrder = __esm({
  "src/core/LayerOrder.js"() {
  }
});

// src/core/LixScriptParser.js
var LixScriptParser_exports = {};
__export(LixScriptParser_exports, {
  initLixScriptBridge: () => initLixScriptBridge,
  parseLixScript: () => parseLixScript,
  previewLixScript: () => previewLixScript,
  renderLixScript: () => renderLixScript,
  resolveShapeRefs: () => resolveShapeRefs
});
function tokenize2(source) {
  const tokens = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNum = i + 1;
    const commentIdx = raw.indexOf("//");
    const line = commentIdx !== -1 ? raw.slice(0, commentIdx) : raw;
    const trimmed = line.trim();
    if (!trimmed) continue;
    tokens.push({ type: "LINE", value: trimmed, line: lineNum });
  }
  return tokens;
}
function parseLixScript(source) {
  const tokens = tokenize2(source);
  const variables = {};
  const shapes2 = [];
  const errors = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    const line = token.value;
    const lineNum = token.line;
    try {
      if (line.startsWith("$")) {
        const match = line.match(/^\$(\w+)\s*=\s*(.+)$/);
        if (match) {
          variables[match[1]] = match[2].trim();
        } else {
          errors.push({ line: lineNum, message: `Invalid variable syntax: ${line}` });
        }
        i++;
        continue;
      }
      const shapeMatch = line.match(/^(rect|circle|ellipse|arrow|line|text|frame|freehand|image|icon)\s+(\w+)\s+(.+)$/);
      if (shapeMatch) {
        const [, type, id, rest] = shapeMatch;
        const shape = parseShapeDeclaration(type, id, rest, lineNum, errors, variables);
        if (rest.includes("{") && !rest.includes("}")) {
          i++;
          const props = [];
          while (i < tokens.length && !tokens[i].value.startsWith("}")) {
            props.push(tokens[i].value);
            i++;
          }
          if (i < tokens.length) i++;
          parseProperties(shape, props, variables, errors);
        } else if (rest.includes("{") && rest.includes("}")) {
          const blockMatch = rest.match(/\{([^}]*)\}/);
          if (blockMatch) {
            const props = blockMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
            parseProperties(shape, props, variables, errors);
          }
          i++;
        } else {
          i++;
        }
        shapes2.push(shape);
        continue;
      }
      errors.push({ line: lineNum, message: `Unrecognized syntax: ${line}` });
      i++;
    } catch (err) {
      errors.push({ line: lineNum, message: err.message });
      i++;
    }
  }
  return { variables, shapes: shapes2, errors };
}
function parseShapeDeclaration(type, id, rest, lineNum, errors, variables) {
  const shape = { type, id, line: lineNum, props: {} };
  if (type === "arrow" || type === "line") {
    const connMatch = rest.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s*\{|$)/);
    if (connMatch) {
      shape.from = parsePointOrRef(connMatch[1].trim(), variables);
      shape.to = parsePointOrRef(connMatch[2].trim(), variables);
    } else {
      errors.push({ line: lineNum, message: `${type} requires 'from ... to ...' syntax` });
    }
  } else {
    const atMatch = rest.match(/at\s+([\w$.+\-*\s]+?),\s*([\w$.+\-*\s]+?)(?:\s+size|\s*\{|$)/);
    if (atMatch) {
      shape.x = parseExpr(atMatch[1].trim(), variables);
      shape.y = parseExpr(atMatch[2].trim(), variables);
    } else if (type !== "frame") {
      errors.push({ line: lineNum, message: `${type} requires 'at X, Y' syntax` });
    }
    const sizeMatch = rest.match(/size\s+([\w$.+\-*]+)\s*x\s*([\w$.+\-*]+)/);
    if (sizeMatch) {
      shape.width = parseExpr(sizeMatch[1].trim(), variables);
      shape.height = parseExpr(sizeMatch[2].trim(), variables);
    }
  }
  return shape;
}
function parsePointOrRef(str, variables) {
  const refMatch = str.match(/^(\w+)\.(\w+)(?:\s*([+-])\s*([\d.]+))?$/);
  if (refMatch) {
    return {
      ref: refMatch[1],
      side: refMatch[2],
      offset: refMatch[3] ? parseFloat((refMatch[3] === "-" ? "-" : "") + refMatch[4]) : 0
    };
  }
  const coordMatch = str.match(/^([\d.]+)\s*,?\s*([\d.]+)$/);
  if (coordMatch) {
    return { x: parseFloat(coordMatch[1]), y: parseFloat(coordMatch[2]) };
  }
  if (/^\w+$/.test(str)) {
    return { ref: str, side: "center", offset: 0 };
  }
  return { x: 0, y: 0 };
}
function parseExpr(str, variables) {
  let resolved = str.replace(/\$(\w+)/g, (_, name) => {
    return variables[name] !== void 0 ? variables[name] : "0";
  });
  const num = parseFloat(resolved);
  if (!isNaN(num) && String(num) === resolved.trim()) {
    return num;
  }
  if (/\w+\.\w+/.test(resolved)) {
    return { expr: resolved };
  }
  const arithMatch = resolved.match(/^([\d.]+)\s*([+-])\s*([\d.]+)$/);
  if (arithMatch) {
    const a = parseFloat(arithMatch[1]);
    const b = parseFloat(arithMatch[3]);
    return arithMatch[2] === "+" ? a + b : a - b;
  }
  return isNaN(num) ? 0 : num;
}
function parseProperties(shape, lines, variables, errors) {
  for (const line of lines) {
    const propMatch = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (!propMatch) continue;
    let [, key, value] = propMatch;
    value = value.trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\$(\w+)/g, (_, name) => {
      return variables[name] !== void 0 ? variables[name] : value;
    });
    const num = parseFloat(value);
    if (!isNaN(num) && String(num) === value) {
      shape.props[key] = num;
    } else if (value === "true") {
      shape.props[key] = true;
    } else if (value === "false") {
      shape.props[key] = false;
    } else {
      shape.props[key] = value;
    }
  }
}
function resolveShapeRefs(shapes2) {
  const shapeMap = /* @__PURE__ */ new Map();
  const MAX_PASSES = 10;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let progress = false;
    for (const s of shapes2) {
      if (typeof s.x === "number" && typeof s.y === "number" && !shapeMap.has(s.id)) {
        shapeMap.set(s.id, s);
        progress = true;
      }
    }
    let anyUnresolved = false;
    for (const s of shapes2) {
      if (s.x && typeof s.x === "object" && s.x.expr) {
        const resolved = resolveExpr(s.x.expr, shapeMap);
        if (typeof resolved === "number" && !isNaN(resolved)) {
          s.x = resolved;
          progress = true;
        } else {
          anyUnresolved = true;
        }
      }
      if (s.y && typeof s.y === "object" && s.y.expr) {
        const resolved = resolveExpr(s.y.expr, shapeMap);
        if (typeof resolved === "number" && !isNaN(resolved)) {
          s.y = resolved;
          progress = true;
        } else {
          anyUnresolved = true;
        }
      }
    }
    if (!anyUnresolved || !progress) break;
  }
  for (const s of shapes2) {
    if (s.x && typeof s.x === "object" && s.x.expr) s.x = 0;
    if (s.y && typeof s.y === "object" && s.y.expr) s.y = 0;
  }
}
function resolveExpr(expr, shapeMap) {
  const m = expr.match(/^(\w+)\.(\w+)(?:\s*([+-])\s*([\d.]+))?$/);
  if (!m) return NaN;
  const [, ref, prop, op, offsetStr] = m;
  const shape = shapeMap.get(ref);
  if (!shape) return NaN;
  let val = 0;
  switch (prop) {
    case "x":
      val = shape.x || 0;
      break;
    case "y":
      val = shape.y || 0;
      break;
    case "right":
      val = (shape.x || 0) + (shape.width || 0);
      break;
    case "left":
      val = shape.x || 0;
      break;
    case "top":
      val = shape.y || 0;
      break;
    case "bottom":
      val = (shape.y || 0) + (shape.height || 0);
      break;
    case "centerX":
      val = (shape.x || 0) + (shape.width || 0) / 2;
      break;
    case "centerY":
      val = (shape.y || 0) + (shape.height || 0) / 2;
      break;
    case "width":
      val = shape.width || 0;
      break;
    case "height":
      val = shape.height || 0;
      break;
    default:
      val = 0;
  }
  const offset = offsetStr ? parseFloat(offsetStr) : 0;
  return op === "-" ? val - offset : val + offset;
}
function renderLixScript(parsed) {
  const { shapes: shapeDefs, errors } = parsed;
  if (errors.length > 0) {
    return { success: false, shapesCreated: 0, errors };
  }
  resolveShapeRefs(shapeDefs);
  const svg3 = window.svg;
  if (!svg3) {
    return { success: false, shapesCreated: 0, errors: [{ line: 0, message: "Canvas not initialized" }] };
  }
  const createdShapes = /* @__PURE__ */ new Map();
  const renderErrors = [];
  const userFrameDef = shapeDefs.find((s) => s.type === "frame");
  let frame = null;
  let frameDef = userFrameDef;
  if (userFrameDef) {
    frame = createFrame(userFrameDef, renderErrors);
    if (frame) {
      createdShapes.set(userFrameDef.id, { instance: frame, def: userFrameDef });
    }
  }
  for (const def of shapeDefs) {
    if (def.type === "frame") continue;
    if (def.type === "arrow" || def.type === "line") continue;
    const instance = createShape(def, renderErrors);
    if (instance) {
      createdShapes.set(def.id, { instance, def });
    }
  }
  for (const def of shapeDefs) {
    if (def.type !== "arrow" && def.type !== "line") continue;
    const instance = createConnection(def, createdShapes, renderErrors);
    if (instance) {
      createdShapes.set(def.id, { instance, def });
    }
  }
  if (!frame && createdShapes.size > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [, { instance, def }] of createdShapes) {
      if (def.type === "arrow" || def.type === "line") {
        const from = resolveConnectionPoint(def.from, createdShapes);
        const to = resolveConnectionPoint(def.to, createdShapes);
        if (from) {
          minX = Math.min(minX, from.x);
          minY = Math.min(minY, from.y);
          maxX = Math.max(maxX, from.x);
          maxY = Math.max(maxY, from.y);
        }
        if (to) {
          minX = Math.min(minX, to.x);
          minY = Math.min(minY, to.y);
          maxX = Math.max(maxX, to.x);
          maxY = Math.max(maxY, to.y);
        }
      } else if (def.type !== "frame") {
        const x = def.x || 0;
        const y = def.y || 0;
        const w = def.width || 160;
        const h = def.height || 60;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      }
    }
    if (isFinite(minX)) {
      const pad = 40;
      const autoFrameDef = {
        type: "frame",
        id: "_lixscript_auto_frame",
        line: 0,
        x: minX - pad,
        y: minY - pad,
        width: maxX - minX + pad * 2,
        height: maxY - minY + pad * 2,
        props: { name: "LixScript" }
      };
      frameDef = autoFrameDef;
      frame = createFrame(autoFrameDef, renderErrors);
      if (frame) {
        createdShapes.set(autoFrameDef.id, { instance: frame, def: autoFrameDef });
      }
    }
  }
  if (frame) {
    for (const [id, { instance, def }] of createdShapes) {
      if (def.type === "frame") continue;
      if (shouldAddToFrame(def, frameDef)) {
        frame.addShapeToFrame(instance);
      }
    }
  }
  return {
    success: renderErrors.length === 0,
    shapesCreated: createdShapes.size,
    errors: renderErrors
  };
}
function shouldAddToFrame(shapeDef, frameDef) {
  if (!frameDef || !frameDef.props.contains) return true;
  const ids = frameDef.props.contains.split(",").map((s) => s.trim());
  return ids.includes(shapeDef.id);
}
function createFrame(def, errors) {
  const Frame3 = window.Frame;
  if (!Frame3) {
    errors.push({ line: def.line, message: "Frame class not available" });
    return null;
  }
  try {
    const x = def.x || 0;
    const y = def.y || 0;
    const w = def.width || 600;
    const h = def.height || 400;
    const frame = new Frame3(x, y, w, h, {
      frameName: def.props.frameName || def.props.name || def.id,
      stroke: def.props.stroke || "#555",
      strokeWidth: def.props.strokeWidth || 1,
      fill: def.props.fill || "transparent",
      fillStyle: def.props.fillStyle || "transparent",
      fillColor: def.props.fillColor || "#1e1e28",
      opacity: def.props.opacity || 1,
      rotation: def.props.rotation || 0
    });
    window.shapes.push(frame);
    if (window.pushCreateAction) window.pushCreateAction(frame);
    frame._frameType = "lixscript";
    frame._lixscriptSource = true;
    if (def.props.imageURL && typeof frame.setImageFromURL === "function") {
      frame.setImageFromURL(def.props.imageURL, def.props.imageFit || "cover");
    }
    return frame;
  } catch (err) {
    errors.push({ line: def.line, message: `Frame creation failed: ${err.message}` });
    return null;
  }
}
function createShape(def, errors) {
  try {
    switch (def.type) {
      case "rect":
        return createRect(def, errors);
      case "circle":
      case "ellipse":
        return createCircle(def, errors);
      case "text":
        return createText(def, errors);
      case "freehand":
        return createFreehand(def, errors);
      case "image":
        return createImage(def, errors);
      case "icon":
        return createIcon(def, errors);
      default:
        errors.push({ line: def.line, message: `Unknown shape type: ${def.type}` });
        return null;
    }
  } catch (err) {
    errors.push({ line: def.line, message: `Shape '${def.id}' failed: ${err.message}` });
    return null;
  }
}
function createImage(def, errors) {
  const ImageShape3 = window.ImageShape;
  if (!ImageShape3) {
    errors.push({ line: def.line, message: "ImageShape class not available" });
    return null;
  }
  const src = def.props.src || def.props.href || def.props.url || "";
  if (!src) {
    errors.push({ line: def.line, message: `Image '${def.id}' requires a src property` });
    return null;
  }
  const svgEl = document.getElementById("freehand-canvas");
  if (!svgEl) return null;
  const x = def.x || 0;
  const y = def.y || 0;
  const w = def.width || 200;
  const h = def.height || 200;
  const imgEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
  imgEl.setAttribute("href", src);
  imgEl.setAttribute("x", x);
  imgEl.setAttribute("y", y);
  imgEl.setAttribute("width", w);
  imgEl.setAttribute("height", h);
  imgEl.setAttribute("data-shape-x", x);
  imgEl.setAttribute("data-shape-y", y);
  imgEl.setAttribute("data-shape-width", w);
  imgEl.setAttribute("data-shape-height", h);
  imgEl.setAttribute("type", "image");
  imgEl.setAttribute("preserveAspectRatio", def.props.fit === "contain" ? "xMidYMid meet" : def.props.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet");
  svgEl.appendChild(imgEl);
  const shape = new ImageShape3(imgEl);
  if (def.props.rotation) shape.rotation = parseFloat(def.props.rotation);
  shape.shapeID = def.id || shape.shapeID;
  window.shapes.push(shape);
  if (window.pushCreateAction) window.pushCreateAction(shape);
  return shape;
}
function createIcon(def, errors) {
  const IconShape3 = window.IconShape;
  if (!IconShape3) {
    errors.push({ line: def.line, message: "IconShape class not available" });
    return null;
  }
  const svgEl = document.getElementById("freehand-canvas");
  if (!svgEl) return null;
  const x = def.x || 0;
  const y = def.y || 0;
  const size = def.width || 48;
  const color = def.props.color || def.props.fill || "#ffffff";
  let innerSVG = "";
  if (def.props.svg) {
    innerSVG = def.props.svg;
  } else if (def.props.name) {
    innerSVG = `<circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="1.5"/><text x="12" y="16" text-anchor="middle" fill="${color}" font-size="10" font-family="sans-serif">${(def.props.name || "?").charAt(0)}</text>`;
  } else {
    errors.push({ line: def.line, message: `Icon '${def.id}' requires a name or svg property` });
    return null;
  }
  const vbWidth = parseFloat(def.props.viewBoxWidth) || 24;
  const vbHeight = parseFloat(def.props.viewBoxHeight) || 24;
  const scale = size / Math.max(vbWidth, vbHeight);
  const localCenterX = size / 2 / scale;
  const localCenterY = size / 2 / scale;
  const rotation = def.props.rotation || 0;
  const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  iconGroup.setAttribute("transform", `translate(${x}, ${y}) scale(${scale}) rotate(${rotation}, ${localCenterX}, ${localCenterY})`);
  iconGroup.setAttribute("data-viewbox-width", vbWidth);
  iconGroup.setAttribute("data-viewbox-height", vbHeight);
  iconGroup.setAttribute("x", x);
  iconGroup.setAttribute("y", y);
  iconGroup.setAttribute("width", size);
  iconGroup.setAttribute("height", size);
  iconGroup.setAttribute("type", "icon");
  iconGroup.setAttribute("data-shape-x", x);
  iconGroup.setAttribute("data-shape-y", y);
  iconGroup.setAttribute("data-shape-width", size);
  iconGroup.setAttribute("data-shape-height", size);
  iconGroup.setAttribute("data-shape-rotation", rotation);
  iconGroup.setAttribute("style", "cursor: pointer; pointer-events: all;");
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("x", 0);
  bgRect.setAttribute("y", 0);
  bgRect.setAttribute("width", vbWidth);
  bgRect.setAttribute("height", vbHeight);
  bgRect.setAttribute("fill", "transparent");
  bgRect.setAttribute("stroke", "none");
  bgRect.setAttribute("style", "pointer-events: all;");
  iconGroup.appendChild(bgRect);
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.innerHTML = innerSVG;
  while (tempSvg.firstChild) {
    const child = tempSvg.firstChild;
    if (child.nodeType === 1) {
      const fill = child.getAttribute("fill");
      const stroke = child.getAttribute("stroke");
      if (!fill || fill === "currentColor" || fill === "#000" || fill === "#000000" || fill === "black") {
        child.setAttribute("fill", color);
      }
      if (stroke === "currentColor" || stroke === "#000" || stroke === "#000000" || stroke === "black") {
        child.setAttribute("stroke", color);
      }
    }
    iconGroup.appendChild(child);
  }
  svgEl.appendChild(iconGroup);
  const shape = new IconShape3(iconGroup);
  shape.shapeID = def.id || shape.shapeID;
  window.shapes.push(shape);
  if (window.pushCreateAction) window.pushCreateAction(shape);
  return shape;
}
function createRect(def, errors) {
  const Rectangle3 = window.Rectangle;
  if (!Rectangle3) {
    errors.push({ line: def.line, message: "Rectangle class not available" });
    return null;
  }
  const x = def.x || 0;
  const y = def.y || 0;
  const w = def.width || 160;
  const h = def.height || 60;
  const rect = new Rectangle3(x, y, w, h, {
    stroke: def.props.stroke || "#fff",
    strokeWidth: def.props.strokeWidth || 2,
    fill: def.props.fill || "transparent",
    fillStyle: def.props.fillStyle || "none",
    roughness: def.props.roughness !== void 0 ? def.props.roughness : 1.5,
    strokeDasharray: resolveStrokeStyle(def.props.style),
    shadeColor: def.props.shadeColor || null,
    shadeOpacity: def.props.shadeOpacity !== void 0 ? parseFloat(def.props.shadeOpacity) : 0.15,
    shadeDirection: def.props.shadeDirection || "bottom"
  });
  if (def.props.rotation) rect.rotation = def.props.rotation;
  if (def.props.label) {
    rect.setLabel(
      def.props.label,
      def.props.labelColor || "#e0e0e0",
      def.props.labelFontSize || 14
    );
  }
  window.shapes.push(rect);
  if (window.pushCreateAction) window.pushCreateAction(rect);
  return rect;
}
function createCircle(def, errors) {
  const Circle3 = window.Circle;
  if (!Circle3) {
    errors.push({ line: def.line, message: "Circle class not available" });
    return null;
  }
  const x = def.x || 0;
  const y = def.y || 0;
  const w = def.width || 80;
  const h = def.height || 80;
  const rx = w / 2;
  const ry = h / 2;
  const circle = new Circle3(x + rx, y + ry, rx, ry, {
    stroke: def.props.stroke || "#fff",
    strokeWidth: def.props.strokeWidth || 2,
    fill: def.props.fill || "transparent",
    fillStyle: def.props.fillStyle || "none",
    roughness: def.props.roughness !== void 0 ? def.props.roughness : 1.5,
    strokeDasharray: resolveStrokeStyle(def.props.style),
    shadeColor: def.props.shadeColor || null,
    shadeOpacity: def.props.shadeOpacity !== void 0 ? parseFloat(def.props.shadeOpacity) : 0.15,
    shadeDirection: def.props.shadeDirection || "bottom"
  });
  if (def.props.rotation) circle.rotation = def.props.rotation;
  if (def.props.label) {
    circle.setLabel(
      def.props.label,
      def.props.labelColor || "#e0e0e0",
      def.props.labelFontSize || 14
    );
  }
  window.shapes.push(circle);
  if (window.pushCreateAction) window.pushCreateAction(circle);
  return circle;
}
function createText(def, errors) {
  const TextShape3 = window.TextShape;
  const svgEl = window.svg;
  if (!TextShape3 || !svgEl) {
    errors.push({ line: def.line, message: "TextShape class not available" });
    return null;
  }
  const x = def.x || 0;
  const y = def.y || 0;
  const content = def.props.content || def.props.text || "Text";
  const color = def.props.color || def.props.fill || "#fff";
  const fontSize = def.props.fontSize || 16;
  const g = document.createElementNS(NS3, "g");
  g.setAttribute("data-type", "text-group");
  g.setAttribute("transform", `translate(${x}, ${y})`);
  g.setAttribute("data-x", x);
  g.setAttribute("data-y", y);
  const t = document.createElementNS(NS3, "text");
  t.setAttribute("x", 0);
  t.setAttribute("y", 0);
  t.setAttribute("text-anchor", def.props.anchor || "middle");
  t.setAttribute("dominant-baseline", "central");
  t.setAttribute("fill", color);
  t.setAttribute("font-size", fontSize);
  t.setAttribute("font-family", def.props.fontFamily || "lixFont, sans-serif");
  t.setAttribute("data-initial-font", def.props.fontFamily || "lixFont");
  t.setAttribute("data-initial-color", color);
  t.setAttribute("data-initial-size", fontSize + "px");
  t.textContent = content;
  g.appendChild(t);
  svgEl.appendChild(g);
  const shape = new TextShape3(g);
  window.shapes.push(shape);
  if (window.pushCreateAction) window.pushCreateAction(shape);
  return shape;
}
function createFreehand(def, errors) {
  const FreehandStroke3 = window.FreehandStroke;
  if (!FreehandStroke3) {
    errors.push({ line: def.line, message: "FreehandStroke class not available" });
    return null;
  }
  const pointsStr = def.props.points || "";
  const points2 = pointsStr.split(";").map((p) => {
    const [x, y, pressure] = p.split(",").map(Number);
    return [x || 0, y || 0, pressure || 0.5];
  }).filter((p) => !isNaN(p[0]));
  if (points2.length < 2) {
    errors.push({ line: def.line, message: "Freehand requires at least 2 points" });
    return null;
  }
  const stroke = new FreehandStroke3(points2, {
    stroke: def.props.stroke || def.props.color || "#fff",
    strokeWidth: def.props.strokeWidth || 3,
    thinning: def.props.thinning || 0.5,
    roughness: def.props.roughness || "smooth",
    strokeStyle: def.props.style || "solid"
  });
  window.shapes.push(stroke);
  if (window.pushCreateAction) window.pushCreateAction(stroke);
  return stroke;
}
function createConnection(def, createdShapes, errors) {
  const from = resolveConnectionPoint(def.from, createdShapes);
  const to = resolveConnectionPoint(def.to, createdShapes);
  if (!from || !to) {
    errors.push({ line: def.line, message: `Cannot resolve connection endpoints for '${def.id}'` });
    return null;
  }
  if (def.type === "arrow") {
    return createArrow(def, from, to, createdShapes, errors);
  } else {
    return createLine(def, from, to, errors);
  }
}
function createArrow(def, from, to, createdShapes, errors) {
  const Arrow3 = window.Arrow;
  if (!Arrow3) {
    errors.push({ line: def.line, message: "Arrow class not available" });
    return null;
  }
  const curveMode = def.props.curve || "straight";
  const arrow = new Arrow3(
    { x: from.x, y: from.y },
    { x: to.x, y: to.y },
    {
      stroke: def.props.stroke || "#fff",
      strokeWidth: def.props.strokeWidth || 2,
      arrowOutlineStyle: def.props.style || "solid",
      arrowHeadStyle: def.props.head || "default",
      arrowHeadLength: def.props.headLength || 15,
      arrowCurved: curveMode,
      arrowCurveAmount: def.props.curveAmount || 50
    }
  );
  if (def.props.label) {
    arrow.setLabel(
      def.props.label,
      def.props.labelColor || "#e0e0e0",
      def.props.labelFontSize || 12
    );
  }
  if (def.from && def.from.ref) {
    const sourceEntry = createdShapes.get(def.from.ref);
    if (sourceEntry) {
      autoAttach2(arrow, sourceEntry.instance, true, from);
    }
  }
  if (def.to && def.to.ref) {
    const targetEntry = createdShapes.get(def.to.ref);
    if (targetEntry) {
      autoAttach2(arrow, targetEntry.instance, false, to);
    }
  }
  window.shapes.push(arrow);
  if (window.pushCreateAction) window.pushCreateAction(arrow);
  return arrow;
}
function createLine(def, from, to, errors) {
  const Line3 = window.Line;
  if (!Line3) {
    errors.push({ line: def.line, message: "Line class not available" });
    return null;
  }
  const line = new Line3(
    { x: from.x, y: from.y },
    { x: to.x, y: to.y },
    {
      stroke: def.props.stroke || "#fff",
      strokeWidth: def.props.strokeWidth || 2,
      strokeDasharray: resolveStrokeStyle(def.props.style)
    }
  );
  if (def.props.curve === "true" || def.props.curve === true) {
    line.isCurved = true;
    line.initializeCurveControlPoint?.();
    line.draw();
  }
  if (def.props.label) {
    line.setLabel(
      def.props.label,
      def.props.labelColor || "#e0e0e0",
      def.props.labelFontSize || 12
    );
  }
  window.shapes.push(line);
  if (window.pushCreateAction) window.pushCreateAction(line);
  return line;
}
function resolveConnectionPoint(pointDef, createdShapes) {
  if (!pointDef) return null;
  if (pointDef.x !== void 0 && pointDef.y !== void 0) {
    return { x: pointDef.x, y: pointDef.y };
  }
  if (pointDef.ref) {
    const entry = createdShapes.get(pointDef.ref);
    if (!entry) return null;
    const shape = entry.instance;
    const def = entry.def;
    const side = pointDef.side || "center";
    const offset = pointDef.offset || 0;
    const sx = shape.x !== void 0 ? shape.x : def.x || 0;
    const sy = shape.y !== void 0 ? shape.y : def.y || 0;
    const sw = shape.width || def.width || 0;
    const sh = shape.height || def.height || 0;
    let cx, cy;
    if (shape.shapeName === "circle") {
      cx = sx;
      cy = sy;
      const rx = shape.rx || sw / 2;
      const ry = shape.ry || sh / 2;
      switch (side) {
        case "top":
          return { x: cx + offset, y: cy - ry };
        case "bottom":
          return { x: cx + offset, y: cy + ry };
        case "left":
          return { x: cx - rx, y: cy + offset };
        case "right":
          return { x: cx + rx, y: cy + offset };
        case "center":
          return { x: cx + offset, y: cy };
        default:
          return { x: cx, y: cy };
      }
    }
    cx = sx + sw / 2;
    cy = sy + sh / 2;
    switch (side) {
      case "top":
        return { x: cx + offset, y: sy };
      case "bottom":
        return { x: cx + offset, y: sy + sh };
      case "left":
        return { x: sx, y: cy + offset };
      case "right":
        return { x: sx + sw, y: cy + offset };
      case "center":
        return { x: cx + offset, y: cy };
      default:
        return { x: cx, y: cy };
    }
  }
  return null;
}
function autoAttach2(arrow, shape, isStart, connectionPoint) {
  if (!shape || !connectionPoint) return;
  const sx = shape.x || 0;
  const sy = shape.y || 0;
  const sw = shape.width || 0;
  const sh = shape.height || 0;
  let cx, cy;
  if (shape.shapeName === "circle") {
    cx = sx;
    cy = sy;
  } else {
    cx = sx + sw / 2;
    cy = sy + sh / 2;
  }
  const dx = connectionPoint.x - cx;
  const dy = connectionPoint.y - cy;
  let side = "bottom";
  if (Math.abs(dx) > Math.abs(dy)) {
    side = dx > 0 ? "right" : "left";
  } else {
    side = dy > 0 ? "bottom" : "top";
  }
  const attachment = { shape, side, offset: { x: 0, y: 0 } };
  if (isStart) {
    arrow.attachedToStart = attachment;
  } else {
    arrow.attachedToEnd = attachment;
  }
}
function previewLixScript(parsed) {
  const { shapes: defs, errors } = parsed;
  if (errors.length > 0) return "";
  resolveShapeRefs(defs);
  const shapeMap = /* @__PURE__ */ new Map();
  for (const def of defs) {
    if (def.type !== "arrow" && def.type !== "line") {
      shapeMap.set(def.id, def);
    }
  }
  function resolvePreviewPoint(pointDef) {
    if (!pointDef) return { x: 0, y: 0 };
    if (pointDef.x !== void 0 && pointDef.y !== void 0) return pointDef;
    if (pointDef.ref) {
      const target = shapeMap.get(pointDef.ref);
      if (!target) return { x: 0, y: 0 };
      const side = pointDef.side || "center";
      const offset = pointDef.offset || 0;
      const tx = target.x || 0;
      const ty = target.y || 0;
      const tw = target.width || 160;
      const th = target.height || 60;
      const cx = tx + tw / 2;
      const cy = ty + th / 2;
      switch (side) {
        case "top":
          return { x: cx + offset, y: ty };
        case "bottom":
          return { x: cx + offset, y: ty + th };
        case "left":
          return { x: tx, y: cy + offset };
        case "right":
          return { x: tx + tw, y: cy + offset };
        case "center":
          return { x: cx + offset, y: cy };
        default:
          return { x: cx, y: cy };
      }
    }
    return { x: 0, y: 0 };
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const def of defs) {
    if (def.type === "arrow" || def.type === "line") {
      const from = resolvePreviewPoint(def.from);
      const to = resolvePreviewPoint(def.to);
      minX = Math.min(minX, from.x, to.x);
      minY = Math.min(minY, from.y, to.y);
      maxX = Math.max(maxX, from.x, to.x);
      maxY = Math.max(maxY, from.y, to.y);
    } else if (def.type !== "frame") {
      const x = def.x || 0;
      const y = def.y || 0;
      const w = def.width || 160;
      const h = def.height || 60;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  }
  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 400;
    maxY = 300;
  }
  const pad = 40;
  const vw = maxX - minX + pad * 2;
  const vh = maxY - minY + pad * 2;
  let svgContent = "";
  for (const def of defs) {
    const props = def.props || {};
    switch (def.type) {
      case "rect":
        svgContent += `<rect x="${def.x || 0}" y="${def.y || 0}" width="${def.width || 160}" height="${def.height || 60}" stroke="${props.stroke || "#fff"}" stroke-width="${props.strokeWidth || 2}" fill="${props.fill || "transparent"}" rx="4" />`;
        if (props.label) {
          const cx = (def.x || 0) + (def.width || 160) / 2;
          const cy = (def.y || 0) + (def.height || 60) / 2;
          svgContent += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="${props.labelColor || "#e0e0e0"}" font-size="${props.labelFontSize || 14}" font-family="sans-serif">${escapeXml5(props.label)}</text>`;
        }
        break;
      case "circle":
      case "ellipse": {
        const rx = (def.width || 80) / 2;
        const ry = (def.height || 80) / 2;
        const cx = (def.x || 0) + rx;
        const cy = (def.y || 0) + ry;
        svgContent += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${props.stroke || "#fff"}" stroke-width="${props.strokeWidth || 2}" fill="${props.fill || "transparent"}" />`;
        if (props.label) {
          svgContent += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="${props.labelColor || "#e0e0e0"}" font-size="${props.labelFontSize || 14}" font-family="sans-serif">${escapeXml5(props.label)}</text>`;
        }
        break;
      }
      case "text": {
        const content = props.content || props.text || "Text";
        svgContent += `<text x="${def.x || 0}" y="${def.y || 0}" fill="${props.color || props.fill || "#fff"}" font-size="${props.fontSize || 16}" font-family="sans-serif">${escapeXml5(content)}</text>`;
        break;
      }
      case "arrow": {
        const fromOrig = resolvePreviewPoint(def.from);
        const toOrig = resolvePreviewPoint(def.to);
        const stroke = props.stroke || "#fff";
        const sw = props.strokeWidth || 2;
        const dash = props.style === "dashed" ? ' stroke-dasharray="10,10"' : props.style === "dotted" ? ' stroke-dasharray="2,8"' : "";
        const curve = props.curve || "straight";
        const markerId = `ah-${def.id}`;
        const headLen = 10;
        const to = shortenEndpoint(fromOrig, toOrig, headLen);
        const from = fromOrig;
        svgContent += `<defs><marker id="${markerId}" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${stroke}" /></marker></defs>`;
        if (curve === "curved") {
          const mx = (from.x + toOrig.x) / 2;
          const my = (from.y + toOrig.y) / 2;
          const dx = toOrig.x - from.x;
          const dy = toOrig.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const amt = props.curveAmount || Math.min(dist * 0.3, 80);
          const cpx = mx + dy / dist * amt;
          const cpy = my - dx / dist * amt;
          const toShort = shortenEndpoint({ x: cpx, y: cpy }, toOrig, headLen);
          svgContent += `<path d="M${from.x},${from.y} Q${cpx},${cpy} ${toShort.x},${toShort.y}" stroke="${stroke}" stroke-width="${sw}" fill="none"${dash} marker-end="url(#${markerId})" />`;
          if (props.label) {
            const lx = 0.25 * from.x + 0.5 * cpx + 0.25 * toOrig.x;
            const ly = 0.25 * from.y + 0.5 * cpy + 0.25 * toOrig.y - 8;
            svgContent += `<text x="${lx}" y="${ly}" text-anchor="middle" fill="${props.labelColor || "#a0a0b0"}" font-size="11" font-family="sans-serif">${escapeXml5(props.label)}</text>`;
          }
        } else if (curve === "elbow") {
          const midY = from.y + (toOrig.y - from.y) / 2;
          const lastFrom = { x: toOrig.x, y: midY };
          const toShort = shortenEndpoint(lastFrom, toOrig, headLen);
          svgContent += `<path d="M${from.x},${from.y} L${from.x},${midY} L${toOrig.x},${midY} L${toShort.x},${toShort.y}" stroke="${stroke}" stroke-width="${sw}" fill="none"${dash} marker-end="url(#${markerId})" />`;
          if (props.label) {
            const lx = (from.x + toOrig.x) / 2;
            const ly = midY - 8;
            svgContent += `<text x="${lx}" y="${ly}" text-anchor="middle" fill="${props.labelColor || "#a0a0b0"}" font-size="11" font-family="sans-serif">${escapeXml5(props.label)}</text>`;
          }
        } else {
          svgContent += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="${sw}"${dash} marker-end="url(#${markerId})" />`;
          if (props.label) {
            const lx = (from.x + toOrig.x) / 2;
            const ly = (from.y + toOrig.y) / 2 - 10;
            svgContent += `<text x="${lx}" y="${ly}" text-anchor="middle" fill="${props.labelColor || "#a0a0b0"}" font-size="11" font-family="sans-serif">${escapeXml5(props.label)}</text>`;
          }
        }
        break;
      }
      case "line": {
        const from = resolvePreviewPoint(def.from);
        const to = resolvePreviewPoint(def.to);
        const dash = props.style === "dashed" ? ' stroke-dasharray="10,10"' : props.style === "dotted" ? ' stroke-dasharray="2,8"' : "";
        svgContent += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${props.stroke || "#fff"}" stroke-width="${props.strokeWidth || 2}"${dash} />`;
        break;
      }
      case "frame": {
        const frameName = props.name || def.id;
        svgContent += `<rect x="${def.x || 0}" y="${def.y || 0}" width="${def.width || 600}" height="${def.height || 400}" stroke="${props.stroke || "#555"}" stroke-width="1" fill="transparent" stroke-dasharray="8,4" rx="8" />`;
        svgContent += `<text x="${(def.x || 0) + 10}" y="${(def.y || 0) - 8}" fill="#888" font-size="12" font-family="sans-serif">${escapeXml5(frameName)}</text>`;
        break;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - pad} ${minY - pad} ${vw} ${vh}" width="100%" height="100%" style="background: transparent;">
    ${svgContent}
  </svg>`;
}
function shortenEndpoint(from, to, amount) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < amount * 2) return to;
  return {
    x: to.x - dx / dist * amount,
    y: to.y - dy / dist * amount
  };
}
function escapeXml5(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function resolveStrokeStyle(style) {
  if (!style) return "";
  switch (style) {
    case "dashed":
      return "10,10";
    case "dotted":
      return "2,8";
    case "solid":
    default:
      return "";
  }
}
function initLixScriptBridge() {
  window.__lixscriptParse = parseLixScript;
  window.__lixscriptRender = renderLixScript;
  window.__lixscriptPreview = (source) => {
    const parsed = parseLixScript(source);
    return previewLixScript(parsed);
  };
  window.__lixscriptExecute = (source) => {
    const parsed = parseLixScript(source);
    if (parsed.errors.length > 0) {
      return { success: false, errors: parsed.errors, shapesCreated: 0 };
    }
    return renderLixScript(parsed);
  };
}
var NS3;
var init_LixScriptParser = __esm({
  "src/core/LixScriptParser.js"() {
    NS3 = "http://www.w3.org/2000/svg";
  }
});

// src/react/LixSketchCanvas.jsx
import { useCallback, useEffect, useRef, useState } from "react";

// src/SketchEngine.js
import rough2 from "roughjs";
var SketchEngine = class {
  constructor(svgElement, options = {}) {
    if (!svgElement || svgElement.tagName !== "svg") {
      throw new Error("SketchEngine requires an SVG element");
    }
    this.svg = svgElement;
    this.svg.style.touchAction = "none";
    this.options = {
      initialZoom: 1,
      minZoom: 0.4,
      maxZoom: 30,
      ...options
    };
    this.onEvent = options.onEvent || (() => {
    });
    this.scene = null;
    this.shapes = null;
    this._modules = {};
    this._initialized = false;
  }
  /**
   * Emit an event to the consumer callback.
   * @param {string} type - Event type (e.g. 'sidebar:select', 'zoom:change')
   * @param {*} data - Event payload
   */
  emit(type, data) {
    try {
      this.onEvent(type, data);
    } catch (e) {
      console.warn("[SketchEngine] onEvent error:", e);
    }
  }
  /**
   * Set up all the global variables that the tool/shape modules depend on.
   * Must be called BEFORE any module imports.
   */
  _initGlobals() {
    window.svg = this.svg;
    window.freehandCanvas = this.svg;
    window.rough = rough2;
    window.roughCanvas = rough2.svg(this.svg);
    window.roughGenerator = window.roughCanvas.generator;
    window.shapes = window.shapes || [];
    window.currentShape = window.currentShape || null;
    window.lastMousePos = window.lastMousePos || null;
    window.currentZoom = this.options.initialZoom;
    window.minScale = this.options.minZoom;
    window.maxScale = this.options.maxZoom;
    window.minZoom = this.options.minZoom;
    window.maxZoom = this.options.maxZoom;
    window.currentViewBox = window.currentViewBox || {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    window.isPaintToolActive = false;
    window.isTextToolActive = false;
    window.isCircleToolActive = false;
    window.isSquareToolActive = false;
    window.isLaserToolActive = false;
    window.isEraserToolActive = false;
    window.isImageToolActive = false;
    window.isArrowToolActive = false;
    window.isLineToolActive = false;
    window.isSelectionToolActive = true;
    window.isPanningToolActive = false;
    window.isFrameToolActive = false;
    window.isIconToolActive = false;
    window.isCodeToolActive = false;
    window.isTextInCodeMode = false;
    window.isPanning = false;
    window.panStart = null;
    window.startCanvasX = 0;
    window.startCanvasY = 0;
    window.currentMatrix = new DOMMatrix();
    window.currentTranslation = { x: 0, y: 0 };
    window.ACTION_CREATE = "create";
    window.ACTION_DELETE = "delete";
    window.ACTION_MODIFY = "modify";
    window.ACTION_PASTE = "paste";
    window.historyStack = window.historyStack || [];
    window.redoStack = window.redoStack || [];
    const dummyEl = document.createElement("div");
    dummyEl.classList.add("hidden");
    window.paintBrushSideBar = document.getElementById("paintBrushToolBar") || dummyEl;
    window.lineSideBar = document.getElementById("lineSideBar") || dummyEl;
    window.squareSideBar = document.getElementById("squareSideBar") || dummyEl;
    window.circleSideBar = document.getElementById("circleSideBar") || dummyEl;
    window.arrowSideBar = document.getElementById("arrowSideBar") || dummyEl;
    window.textSideBar = document.getElementById("textToolBar") || dummyEl;
    window.frameSideBar = document.getElementById("frameSideBar") || dummyEl;
    window.zoomInBtn = document.getElementById("zoomIn") || dummyEl;
    window.zoomOutBtn = document.getElementById("zoomOut") || dummyEl;
    window.zoomPercentSpan = document.getElementById("zoomPercent") || dummyEl;
    window.container = document.querySelector(".container") || document.body;
    const engine = this;
    window.disableAllSideBars = function() {
      [
        window.paintBrushSideBar,
        window.lineSideBar,
        window.squareSideBar,
        window.circleSideBar,
        window.arrowSideBar,
        window.textSideBar,
        window.frameSideBar
      ].forEach((el) => {
        if (el) el.classList.add("hidden");
      });
      engine.emit("sidebar:clear");
      if (window.__sketchStoreApi) {
        window.__sketchStoreApi.clearSelectedShapeSidebar();
      }
    };
    window.toolExtraPopup = window.toolExtraPopup || function() {
    };
    window.updateUndoRedoButtons = window.updateUndoRedoButtons || function() {
    };
    window.__showSidebarForShape = function(shapeName) {
      const sidebarMap = {
        "rectangle": "rectangle",
        "circle": "circle",
        "arrow": "arrow",
        "line": "line",
        "freehandStroke": "paintbrush",
        "text": "text",
        "code": "text",
        "frame": "frame",
        "image": "image"
      };
      const sidebar = sidebarMap[shapeName];
      engine.emit("sidebar:select", { sidebar, shapeName });
      if (sidebar && window.__sketchStoreApi) {
        window.__sketchStoreApi.setSelectedShapeSidebar(sidebar);
      }
      window.__selectedShapeIsCode = shapeName === "code";
      if (window.__onCodeModeChanged) window.__onCodeModeChanged(shapeName === "code");
    };
  }
  /**
   * Initialize engine: set globals first, then import modules.
   */
  async init() {
    if (this._initialized) return;
    this._initGlobals();
    try {
      const [
        { Rectangle: Rectangle3 },
        { Circle: Circle3 },
        { Arrow: Arrow3 },
        { Line: Line3 },
        { TextShape: TextShape3 },
        { CodeShape: CodeShape3 },
        { ImageShape: ImageShape3 },
        { IconShape: IconShape3 },
        { Frame: Frame3 },
        { FreehandStroke: FreehandStroke3 }
      ] = await Promise.all([
        Promise.resolve().then(() => (init_Rectangle(), Rectangle_exports)),
        Promise.resolve().then(() => (init_Circle(), Circle_exports)),
        Promise.resolve().then(() => (init_Arrow(), Arrow_exports)),
        Promise.resolve().then(() => (init_Line(), Line_exports)),
        Promise.resolve().then(() => (init_TextShape(), TextShape_exports)),
        Promise.resolve().then(() => (init_CodeShape(), CodeShape_exports)),
        Promise.resolve().then(() => (init_ImageShape(), ImageShape_exports)),
        Promise.resolve().then(() => (init_IconShape(), IconShape_exports)),
        Promise.resolve().then(() => (init_Frame(), Frame_exports)),
        Promise.resolve().then(() => (init_FreehandStroke(), FreehandStroke_exports))
      ]);
      window.Rectangle = Rectangle3;
      window.Circle = Circle3;
      window.Arrow = Arrow3;
      window.Line = Line3;
      window.TextShape = TextShape3;
      window.CodeShape = CodeShape3;
      window.ImageShape = ImageShape3;
      window.IconShape = IconShape3;
      window.Frame = Frame3;
      window.FreehandStroke = FreehandStroke3;
      this._modules.shapes = {
        Rectangle: Rectangle3,
        Circle: Circle3,
        Arrow: Arrow3,
        Line: Line3,
        TextShape: TextShape3,
        CodeShape: CodeShape3,
        ImageShape: ImageShape3,
        IconShape: IconShape3,
        Frame: Frame3,
        FreehandStroke: FreehandStroke3
      };
      const [
        rectangleTool,
        circleTool,
        arrowTool,
        lineTool,
        textTool,
        codeTool,
        imageTool,
        iconTool,
        frameTool,
        freehandTool
      ] = await Promise.all([
        Promise.resolve().then(() => (init_rectangleTool(), rectangleTool_exports)),
        Promise.resolve().then(() => (init_circleTool(), circleTool_exports)),
        Promise.resolve().then(() => (init_arrowTool(), arrowTool_exports)),
        Promise.resolve().then(() => (init_lineTool(), lineTool_exports)),
        Promise.resolve().then(() => (init_textTool(), textTool_exports)),
        Promise.resolve().then(() => (init_codeTool(), codeTool_exports)),
        Promise.resolve().then(() => (init_imageTool(), imageTool_exports)),
        Promise.resolve().then(() => (init_iconTool(), iconTool_exports)),
        Promise.resolve().then(() => (init_frameTool(), frameTool_exports)),
        Promise.resolve().then(() => (init_freehandTool(), freehandTool_exports))
      ]);
      this._modules.tools = {
        rectangleTool,
        circleTool,
        arrowTool,
        lineTool,
        textTool,
        codeTool,
        imageTool,
        iconTool,
        frameTool,
        freehandTool
      };
      const [
        eventDispatcher,
        undoRedo,
        selection,
        zoomPan,
        copyPaste,
        eraserTrail,
        resizeShapes,
        resizeCode
      ] = await Promise.all([
        Promise.resolve().then(() => (init_EventDispatcher(), EventDispatcher_exports)),
        Promise.resolve().then(() => (init_UndoRedo(), UndoRedo_exports)),
        Promise.resolve().then(() => (init_Selection(), Selection_exports)),
        Promise.resolve().then(() => (init_ZoomPan(), ZoomPan_exports)),
        Promise.resolve().then(() => (init_CopyPaste(), CopyPaste_exports)),
        Promise.resolve().then(() => (init_EraserTrail(), EraserTrail_exports)),
        Promise.resolve().then(() => (init_ResizeShapes(), ResizeShapes_exports)),
        Promise.resolve().then(() => (init_ResizeCode(), ResizeCode_exports))
      ]);
      this._modules.core = {
        eventDispatcher,
        undoRedo,
        selection,
        zoomPan,
        copyPaste,
        eraserTrail,
        resizeShapes,
        resizeCode
      };
      if (eventDispatcher.initEventDispatcher) {
        eventDispatcher.initEventDispatcher(this.svg);
      }
      await Promise.all([
        Promise.resolve().then(() => (init_eraserTool(), eraserTool_exports)),
        Promise.resolve().then(() => (init_laserTool(), laserTool_exports))
      ]);
      if (undoRedo.undo) window.undo = undoRedo.undo;
      if (undoRedo.redo) window.redo = undoRedo.redo;
      if (undoRedo.pushCreateAction) window.pushCreateAction = undoRedo.pushCreateAction;
      if (undoRedo.pushDeleteAction) window.pushDeleteAction = undoRedo.pushDeleteAction;
      if (selection.multiSelection) window.multiSelection = selection.multiSelection;
      if (selection.clearAllSelections) window.clearAllSelections = selection.clearAllSelections;
      if (copyPaste.initCopyPaste) copyPaste.initCopyPaste();
      const aiRenderer = await Promise.resolve().then(() => (init_AIRenderer(), AIRenderer_exports));
      if (aiRenderer.initAIRenderer) aiRenderer.initAIRenderer();
      const graphEngine = await Promise.resolve().then(() => (init_GraphEngine(), GraphEngine_exports));
      if (graphEngine.initGraphEngine) graphEngine.initGraphEngine();
      const sceneSerializer = await Promise.resolve().then(() => (init_SceneSerializer(), SceneSerializer_exports));
      if (sceneSerializer.initSceneSerializer) sceneSerializer.initSceneSerializer();
      const layerOrder = await Promise.resolve().then(() => (init_LayerOrder(), LayerOrder_exports));
      if (layerOrder.initLayerOrder) layerOrder.initLayerOrder();
      const lixScript = await Promise.resolve().then(() => (init_LixScriptParser(), LixScriptParser_exports));
      if (lixScript.initLixScriptBridge) lixScript.initLixScriptBridge();
      this.scene = window.__sceneSerializer || {
        save: sceneSerializer.saveScene,
        load: sceneSerializer.loadScene,
        download: sceneSerializer.downloadScene,
        upload: sceneSerializer.uploadScene,
        exportPNG: sceneSerializer.exportAsPNG,
        exportPDF: sceneSerializer.exportAsPDF,
        copyAsPNG: sceneSerializer.copyAsPNG,
        copyAsSVG: sceneSerializer.copyAsSVG,
        reset: sceneSerializer.resetCanvas,
        findText: sceneSerializer.findTextOnCanvas
      };
      this.shapes = window.shapes;
      this.undo = undoRedo.undo || (() => {
      });
      this.redo = undoRedo.redo || (() => {
      });
      this.lixscript = {
        parse: lixScript.parseLixScript || (() => null),
        execute: lixScript.executeLixScript || (lixScript.parseLixScript ? (code) => {
          const parsed = lixScript.parseLixScript(code);
          if (parsed && lixScript.resolveShapeRefs) lixScript.resolveShapeRefs(parsed);
          return parsed;
        } : () => null)
      };
      this._modules.sceneSerializer = sceneSerializer;
      this._modules.lixScript = lixScript;
      this._initialized = true;
      console.log("[SketchEngine] Initialized successfully");
    } catch (err) {
      console.error("[SketchEngine] Initialization failed:", err);
      throw err;
    }
  }
  /**
   * Sync tool flags from Zustand activeTool value.
   */
  setActiveTool(toolName) {
    if (window.currentShape && typeof window.currentShape.removeSelection === "function") {
      window.currentShape.removeSelection();
      window.currentShape = null;
    }
    if (typeof window.clearAllSelections === "function") {
      window.clearAllSelections();
    }
    if (typeof window.disableAllSideBars === "function") {
      window.disableAllSideBars();
    }
    if (typeof window.forceCleanupEraserTrail === "function") {
      window.forceCleanupEraserTrail();
    }
    if (typeof window.__cleanupIconTool === "function") {
      window.__cleanupIconTool();
    }
    window.isPaintToolActive = false;
    window.isSquareToolActive = false;
    window.isCircleToolActive = false;
    window.isArrowToolActive = false;
    window.isTextToolActive = false;
    window.isLaserToolActive = false;
    window.isLineToolActive = false;
    window.isEraserToolActive = false;
    window.isSelectionToolActive = false;
    window.isImageToolActive = false;
    window.isPanningToolActive = false;
    window.isFrameToolActive = false;
    window.isIconToolActive = false;
    window.isCodeToolActive = false;
    const flagMap = {
      select: "isSelectionToolActive",
      pan: "isPanningToolActive",
      rectangle: "isSquareToolActive",
      circle: "isCircleToolActive",
      line: "isLineToolActive",
      arrow: "isArrowToolActive",
      freehand: "isPaintToolActive",
      text: "isTextToolActive",
      code: "isCodeToolActive",
      eraser: "isEraserToolActive",
      laser: "isLaserToolActive",
      image: "isImageToolActive",
      frame: "isFrameToolActive",
      icon: "isIconToolActive"
    };
    const flag = flagMap[toolName];
    if (flag) window[flag] = true;
    if (toolName === "text" && window.isTextInCodeMode) {
      window.isCodeToolActive = true;
    }
    if (toolName === "image" && window.__showImageSourcePicker) {
      window.__showImageSourcePicker();
    }
    const cursorMap = {
      select: "default",
      pan: "grab",
      rectangle: "crosshair",
      circle: "crosshair",
      line: "crosshair",
      arrow: "crosshair",
      freehand: "crosshair",
      text: "crosshair",
      code: "crosshair",
      eraser: "crosshair",
      laser: "crosshair",
      image: "crosshair",
      frame: "crosshair",
      icon: "crosshair"
    };
    if (this.svg) {
      this.svg.style.cursor = cursorMap[toolName] || "default";
    }
  }
  cleanup() {
    if (this._modules.core?.eventDispatcher?.cleanupEventDispatcher) {
      this._modules.core.eventDispatcher.cleanupEventDispatcher();
    }
    window.shapes = [];
    window.currentShape = null;
    window.lastMousePos = null;
    this._modules = {};
    this._initialized = false;
    console.log("[SketchEngine] Cleaned up");
  }
};

// src/react/LixSketchCanvas.jsx
init_SceneSerializer();

// src/index.js
init_SceneSerializer();
init_imageCompressor();
init_allowedImageTypes();

// src/EngineShortcuts.js
var SHORTCUT_MAP = {
  h: TOOLS.PAN,
  v: TOOLS.SELECT,
  1: TOOLS.SELECT,
  r: TOOLS.RECTANGLE,
  2: TOOLS.RECTANGLE,
  o: TOOLS.CIRCLE,
  4: TOOLS.CIRCLE,
  a: TOOLS.ARROW,
  5: TOOLS.ARROW,
  l: TOOLS.LINE,
  6: TOOLS.LINE,
  p: TOOLS.FREEHAND,
  7: TOOLS.FREEHAND,
  t: TOOLS.TEXT,
  8: TOOLS.TEXT,
  9: TOOLS.IMAGE,
  e: TOOLS.ERASER,
  0: TOOLS.ERASER,
  i: TOOLS.ICON,
  f: TOOLS.FRAME,
  k: TOOLS.LASER
};
function isTypingTarget(target) {
  if (!target) return false;
  const tag = (target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  if (target.isContentEditable) return true;
  return false;
}
function installEngineShortcuts(engine, options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {
    };
  }
  const onToast = typeof options.onToast === "function" ? options.onToast : () => {
  };
  const skipWhen = typeof options.skipWhen === "function" ? options.skipWhen : null;
  const customSetTool = typeof options.setActiveTool === "function" ? options.setActiveTool : null;
  function setTool(tool) {
    if (customSetTool) {
      customSetTool(tool);
      return;
    }
    if (engine?.setActiveTool) engine.setActiveTool(tool);
  }
  function getActiveTool() {
    return engine?.activeTool || engine?.getActiveTool?.() || null;
  }
  function handleKeyDown(e) {
    const key = (e.key || "").toLowerCase();
    const isMod = e.ctrlKey || e.metaKey;
    if (isTypingTarget(e.target)) return;
    if (document.querySelector(".text-edit-overlay:not(.hidden)")) return;
    if (skipWhen && skipWhen(e)) return;
    if (isMod) {
      if (key === "a" && !e.shiftKey) {
        e.preventDefault();
        setTool(TOOLS.SELECT);
        if (window.multiSelection && Array.isArray(window.shapes)) {
          window.multiSelection.clearSelection();
          window.shapes.forEach((shape) => window.multiSelection.addShape(shape));
        }
        return;
      }
      if (key === "g" && !e.shiftKey) {
        e.preventDefault();
        try {
          const ms = window.multiSelection;
          const sel = ms?.selectedShapes;
          const targets = sel && sel.size > 1 ? Array.from(sel) : window.currentShape ? [window.currentShape] : [];
          if (targets.length > 1) {
            const newId = `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
            for (const s of targets) s.groupId = newId;
            if (typeof ms?.updateControls === "function") ms.updateControls();
            onToast(`Grouped ${targets.length} shapes`, { tone: "success" });
          }
        } catch (err) {
          console.warn("[EngineShortcuts] group failed:", err);
        }
        return;
      }
      if (key === "g" && e.shiftKey) {
        e.preventDefault();
        try {
          const ms = window.multiSelection;
          const sel = ms?.selectedShapes;
          const targets = sel && sel.size > 0 ? Array.from(sel) : window.currentShape ? [window.currentShape] : [];
          const groupIds = new Set(targets.map((s) => s.groupId).filter(Boolean));
          if (groupIds.size > 0 && Array.isArray(window.shapes)) {
            let cleared = 0;
            for (const s of window.shapes) {
              if (s.groupId && groupIds.has(s.groupId)) {
                s.groupId = null;
                cleared++;
              }
            }
            if (typeof ms?.updateControls === "function") ms.updateControls();
            onToast(`Ungrouped ${cleared} shapes`, { tone: "success" });
          }
        } catch (err) {
          console.warn("[EngineShortcuts] ungroup failed:", err);
        }
        return;
      }
      if (key === "d") {
        e.preventDefault();
        return;
      }
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      if (window.multiSelection?.selectedShapes?.size > 0) {
        if (typeof window.deleteSelectedShapes === "function") {
          window.deleteSelectedShapes();
        }
        return;
      }
      if (window.currentShape) {
        const shape = window.currentShape;
        const shapes2 = window.shapes;
        if (shapes2) {
          const idx = shapes2.indexOf(shape);
          if (idx !== -1) shapes2.splice(idx, 1);
        }
        if (typeof window.cleanupAttachments === "function") {
          window.cleanupAttachments(shape);
        }
        if (shape.parentFrame && typeof shape.parentFrame.removeShapeFromFrame === "function") {
          shape.parentFrame.removeShapeFromFrame(shape);
        }
        const el = shape.group || shape.element;
        if (el && el.parentNode) el.parentNode.removeChild(el);
        if (typeof window.pushDeleteAction === "function") {
          window.pushDeleteAction(shape);
        }
        window.currentShape = null;
        if (typeof window.disableAllSideBars === "function") {
          window.disableAllSideBars();
        }
      }
      return;
    }
    if (!e.shiftKey && !e.altKey) {
      const tool = SHORTCUT_MAP[key];
      if (tool) {
        e.preventDefault();
        setTool(tool);
        return;
      }
      if (e.key === "Escape") {
        window.currentShape = null;
        if (typeof window.disableAllSideBars === "function") {
          window.disableAllSideBars();
        }
        return;
      }
    }
  }
  let spaceHeld = false;
  let toolBeforeSpace = null;
  function handleSpaceDown(e) {
    if (e.code !== "Space" || spaceHeld) return;
    if (isTypingTarget(e.target)) return;
    if (skipWhen && skipWhen(e)) return;
    e.preventDefault();
    spaceHeld = true;
    const active = getActiveTool();
    if (active && active !== TOOLS.PAN) {
      toolBeforeSpace = active;
      setTool(TOOLS.PAN);
    }
  }
  function handleKeyUp(e) {
    if (e.code === "Space" && spaceHeld) {
      spaceHeld = false;
      if (toolBeforeSpace) {
        setTool(toolBeforeSpace);
        toolBeforeSpace = null;
      }
    }
  }
  function handleWheel(e) {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  }
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keydown", handleSpaceDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("wheel", handleWheel, { passive: false });
  return function uninstall() {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keydown", handleSpaceDown);
    document.removeEventListener("keyup", handleKeyUp);
    document.removeEventListener("wheel", handleWheel);
  };
}

// src/index.js
var TOOLS = {
  SELECT: "select",
  PAN: "pan",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
  ARROW: "arrow",
  FREEHAND: "freehand",
  TEXT: "text",
  CODE: "code",
  ERASER: "eraser",
  LASER: "laser",
  IMAGE: "image",
  FRAME: "frame",
  ICON: "icon"
};

// src/react/LixSketchCanvas.jsx
init_imageCompressor();

// src/react/Toolbar.jsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var I = {
  pan: /* @__PURE__ */ jsx("path", { d: "M11 11V5a1 1 0 1 1 2 0v6m0 0V3a1 1 0 1 1 2 0v8m0 0V5a1 1 0 1 1 2 0v9m0 0v3a5 5 0 0 1-5 5h-2.5c-1.7 0-3.3-.9-4.2-2.3L4 16a1.5 1.5 0 1 1 2.5-1.7L8 17V8a1 1 0 1 1 2 0v6" }),
  select: /* @__PURE__ */ jsx("path", { d: "M3 3l7 17 2-7 7-2z" }),
  rect: /* @__PURE__ */ jsx("rect", { x: "4", y: "5", width: "16", height: "14", rx: "1" }),
  circle: /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "8" }),
  line: /* @__PURE__ */ jsx("line", { x1: "5", y1: "19", x2: "19", y2: "5" }),
  arrow: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "12", x2: "18", y2: "12" }),
    /* @__PURE__ */ jsx("polyline", { points: "13 7 18 12 13 17" })
  ] }),
  text: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("polyline", { points: "6 5 18 5" }),
    /* @__PURE__ */ jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" })
  ] }),
  freehand: /* @__PURE__ */ jsx("path", { d: "M5 18c2-1 4-7 7-7s4 5 7 4" }),
  image: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "11", r: "1.5" }),
    /* @__PURE__ */ jsx("polyline", { points: "21 17 15 11 5 19" })
  ] }),
  icon: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "10", r: "0.5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "10", r: "0.5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("path", { d: "M9 15c1 1 5 1 6 0" })
  ] }),
  frame: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "4", width: "16", height: "16", rx: "1" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "9", x2: "20", y2: "9" })
  ] }),
  laser: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "21", x2: "9", y2: "15" }),
    /* @__PURE__ */ jsx("polyline", { points: "14 4 20 4 20 10" }),
    /* @__PURE__ */ jsx("polyline", { points: "20 4 9 15" })
  ] }),
  eraser: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("polyline", { points: "20 20 11 20 4 13 13 4 22 13 13 22" }),
    /* @__PURE__ */ jsx("line", { x1: "9", y1: "9", x2: "16", y2: "16" })
  ] }),
  exit: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("polyline", { points: "9 18 3 12 9 6" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "15", y2: "12" })
  ] })
};
var TOOL_ITEMS = [
  { tool: TOOLS.PAN, icon: "pan", title: "Pan (H)" },
  { tool: TOOLS.SELECT, icon: "select", title: "Select (V)" },
  "spacer",
  { tool: TOOLS.RECTANGLE, icon: "rect", title: "Rectangle (R)" },
  { tool: TOOLS.CIRCLE, icon: "circle", title: "Circle (O)" },
  { tool: TOOLS.LINE, icon: "line", title: "Line (L)" },
  { tool: TOOLS.ARROW, icon: "arrow", title: "Arrow (A)" },
  { tool: TOOLS.TEXT, icon: "text", title: "Text (T)" },
  { tool: TOOLS.FREEHAND, icon: "freehand", title: "Freehand (P)" },
  { tool: TOOLS.IMAGE, icon: "image", title: "Image (9)" },
  { tool: TOOLS.ICON, icon: "icon", title: "Icon (I)" },
  "spacer",
  { tool: TOOLS.FRAME, icon: "frame", title: "Frame (F)" },
  { tool: TOOLS.LASER, icon: "laser", title: "Laser (K)" },
  { tool: TOOLS.ERASER, icon: "eraser", title: "Eraser (E)" }
];
function ToolButton({ item, activeTool, onSelectTool }) {
  const isActive = activeTool === item.tool;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: `lixsketch-tool-btn${isActive ? " is-active" : ""}`,
      title: item.title,
      onClick: () => onSelectTool(item.tool),
      "aria-pressed": isActive,
      "aria-label": item.title,
      children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: I[item.icon] })
    }
  );
}
function Toolbar({ activeTool, onSelectTool, onExit }) {
  return /* @__PURE__ */ jsxs("div", { className: "lixsketch-toolbar", role: "toolbar", "aria-label": "Canvas tools", children: [
    TOOL_ITEMS.map(
      (item, i) => item === "spacer" ? /* @__PURE__ */ jsx("span", { className: "lixsketch-toolbar-spacer", "aria-hidden": true }, `s-${i}`) : /* @__PURE__ */ jsx(ToolButton, { item, activeTool, onSelectTool }, item.tool)
    ),
    onExit && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { className: "lixsketch-toolbar-spacer", "aria-hidden": true }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "lixsketch-tool-btn lixsketch-tool-btn--exit",
          title: "Exit canvas",
          onClick: onExit,
          "aria-label": "Exit canvas",
          children: [
            /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: I.exit }),
            /* @__PURE__ */ jsx("span", { className: "lixsketch-tool-btn-label", children: "Exit" })
          ]
        }
      )
    ] })
  ] });
}

// src/react/LixSketchCanvas.jsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var SAVE_DEBOUNCE_MS = 1500;
function LixSketchCanvas({
  initialScene = null,
  onSceneChange = null,
  onUploadImage = null,
  onExit = null,
  className = "",
  style = null
}) {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const engineRef = useRef(null);
  const lastSceneJsonRef = useRef("");
  const debounceRef = useRef(null);
  const [activeTool, setActiveToolState] = useState(TOOLS.SELECT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!svgRef.current) return;
    let cancelled = false;
    let uninstallShortcuts = null;
    (async () => {
      const svg3 = svgRef.current;
      svg3.setAttribute("viewBox", `0 0 ${svg3.clientWidth || window.innerWidth} ${svg3.clientHeight || window.innerHeight}`);
      const engine = new SketchEngine(svg3);
      await engine.init();
      if (cancelled) {
        engine.cleanup?.();
        return;
      }
      engineRef.current = engine;
      window.__sketchEngine = engine;
      installImageUploadBridge(onUploadImage);
      if (initialScene) {
        try {
          const data = typeof initialScene === "string" ? JSON.parse(initialScene) : initialScene;
          if (data && data.format === "lixsketch") {
            loadScene(data);
            lastSceneJsonRef.current = JSON.stringify(data);
          }
        } catch (err) {
          console.warn("[LixSketchCanvas] initialScene load failed:", err);
        }
      }
      engine.setActiveTool(TOOLS.SELECT);
      setActiveToolState(TOOLS.SELECT);
      uninstallShortcuts = installEngineShortcuts(engine, {
        // Mirror tool switches into local state so the toolbar UI stays in sync.
        setActiveTool: (tool) => {
          engine.setActiveTool(tool);
          setActiveToolState(tool);
        },
        skipWhen: (e) => !!e.target?.closest?.("[data-shortcut-skip]")
      });
      setReady(true);
    })().catch((err) => console.error("[LixSketchCanvas] init failed:", err));
    return () => {
      cancelled = true;
      if (uninstallShortcuts) uninstallShortcuts();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (engineRef.current?.cleanup) engineRef.current.cleanup();
      engineRef.current = null;
      if (window.__sketchEngine) delete window.__sketchEngine;
    };
  }, []);
  const onUploadImageRef = useRef(onUploadImage);
  useEffect(() => {
    onUploadImageRef.current = onUploadImage;
  }, [onUploadImage]);
  useEffect(() => {
    if (!ready) return;
    installImageUploadBridge((dataUrl) => onUploadImageRef.current?.(dataUrl));
  }, [ready]);
  useEffect(() => {
    if (!ready || !onSceneChange) return;
    const svg3 = svgRef.current;
    if (!svg3) return;
    const flush = () => {
      try {
        const scene = saveScene("Untitled");
        const json = JSON.stringify(scene);
        if (json === lastSceneJsonRef.current) return;
        lastSceneJsonRef.current = json;
        const metadata = {
          shapeCount: Array.isArray(scene.shapes) ? scene.shapes.length : 0,
          viewport: scene.viewport || null,
          zoom: scene.zoom || 1,
          sizeBytes: json.length,
          savedAt: Date.now()
        };
        onSceneChange(scene, metadata);
      } catch (err) {
        console.warn("[LixSketchCanvas] save failed:", err);
      }
    };
    const debounced = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
    };
    const observer = new MutationObserver(debounced);
    observer.observe(svg3, { childList: true, subtree: true, attributes: true });
    svg3.addEventListener("mouseup", debounced);
    window.addEventListener("beforeunload", flush);
    return () => {
      observer.disconnect();
      svg3.removeEventListener("mouseup", debounced);
      window.removeEventListener("beforeunload", flush);
      clearTimeout(debounceRef.current);
    };
  }, [ready, onSceneChange]);
  const handleSelectTool = useCallback((tool) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setActiveTool(tool);
    setActiveToolState(tool);
  }, []);
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      ref: wrapperRef,
      className: `lixsketch-canvas-root ${className}`,
      style,
      children: [
        /* @__PURE__ */ jsx2(
          Toolbar,
          {
            activeTool,
            onSelectTool: handleSelectTool,
            onExit: onExit || void 0
          }
        ),
        /* @__PURE__ */ jsx2(
          "svg",
          {
            id: "freehand-canvas",
            ref: svgRef,
            className: "lixsketch-canvas-svg",
            xmlns: "http://www.w3.org/2000/svg"
          }
        ),
        !ready && /* @__PURE__ */ jsx2("div", { className: "lixsketch-canvas-loading", children: /* @__PURE__ */ jsx2("div", { className: "lixsketch-canvas-spinner" }) })
      ]
    }
  );
}
function installImageUploadBridge(onUploadImage) {
  if (typeof window === "undefined") return;
  if (!onUploadImage) {
    window.uploadImageToCloudinary = async () => {
    };
    return;
  }
  window.uploadImageToCloudinary = async function bridgedUpload(imageShape) {
    const href = imageShape?.element?.getAttribute("href") || "";
    if (!href.startsWith("data:")) return;
    imageShape.uploadStatus = "uploading";
    imageShape.uploadAbortController = new AbortController();
    const signal = imageShape.uploadAbortController.signal;
    imageShape.showUploadIndicator?.();
    try {
      let payloadDataUrl = href;
      try {
        const compressed = await compressImage(href);
        if (compressed?.dataUrl) payloadDataUrl = compressed.dataUrl;
      } catch (err) {
        console.warn("[LixSketchCanvas] compression failed, sending raw:", err);
      }
      if (signal.aborted) return;
      const result = await onUploadImage(payloadDataUrl);
      if (signal.aborted) return;
      if (!result?.url) throw new Error(result?.error || "Upload failed");
      imageShape.element.setAttribute("href", result.url);
      imageShape.element.setAttribute("data-href", result.url);
      if (result.publicId) imageShape.element.setAttribute("data-cloudinary-id", result.publicId);
      if (typeof result.sizeBytes === "number") {
        const oldSize = imageShape.element.__fileSize || 0;
        imageShape.element.__fileSize = result.sizeBytes;
        window.__roomImageBytesUsed = Math.max(
          0,
          (window.__roomImageBytesUsed || 0) - oldSize + result.sizeBytes
        );
      }
      imageShape.uploadStatus = "done";
    } catch (err) {
      if (!signal.aborted) {
        console.warn("[LixSketchCanvas] upload failed:", err);
        imageShape.uploadStatus = "failed";
      }
    } finally {
      imageShape.removeUploadIndicator?.();
      imageShape.uploadAbortController = null;
    }
  };
}
export {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_ACCEPT_ATTR,
  LixSketchCanvas,
  SHORTCUT_MAP,
  TOOLS,
  compressImage,
  installEngineShortcuts,
  isAllowedImage,
  isAllowedImageDataUrl,
  loadScene,
  saveScene
};
//# sourceMappingURL=index.js.map
