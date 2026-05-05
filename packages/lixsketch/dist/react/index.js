"use client";
import {
  loadScene,
  saveScene
} from "./chunk-6DSO57SC.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_ACCEPT_ATTR,
  compressImage,
  isAllowedImage,
  isAllowedImageDataUrl
} from "./chunk-W5P23UON.js";
import "./chunk-7TZSIR6V.js";
import "./chunk-XON7IYMZ.js";
import "./chunk-3QHZH6SO.js";
import "./chunk-A4AQHY3T.js";
import "./chunk-YKJUBFHE.js";
import "./chunk-T6ZVV5ZO.js";
import "./chunk-AJAZC37E.js";
import "./chunk-XISEAGBV.js";
import "./chunk-56SJRGL3.js";
import "./chunk-6B3YSJ5C.js";
import "./chunk-CRAY3B7U.js";
import "./chunk-QXFBG7OM.js";

// src/react/LixSketchCanvas.jsx
import { useCallback, useEffect, useRef, useState } from "react";

// src/SketchEngine.js
import rough from "roughjs";
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
    window.rough = rough;
    window.roughCanvas = rough.svg(this.svg);
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
        { Rectangle },
        { Circle },
        { Arrow },
        { Line },
        { TextShape },
        { CodeShape },
        { ImageShape },
        { IconShape },
        { Frame },
        { FreehandStroke }
      ] = await Promise.all([
        import("./Rectangle-6FE7RN6W.js"),
        import("./Circle-KPG7TKIX.js"),
        import("./Arrow-BJDAXPMH.js"),
        import("./Line-PKY4RYWA.js"),
        import("./TextShape-54ZJ66E3.js"),
        import("./CodeShape-K4DIZAIV.js"),
        import("./ImageShape-FVOQ6T5W.js"),
        import("./IconShape-4UFSLNK6.js"),
        import("./Frame-NV34TGMW.js"),
        import("./FreehandStroke-CK24NUT3.js")
      ]);
      window.Rectangle = Rectangle;
      window.Circle = Circle;
      window.Arrow = Arrow;
      window.Line = Line;
      window.TextShape = TextShape;
      window.CodeShape = CodeShape;
      window.ImageShape = ImageShape;
      window.IconShape = IconShape;
      window.Frame = Frame;
      window.FreehandStroke = FreehandStroke;
      this._modules.shapes = {
        Rectangle,
        Circle,
        Arrow,
        Line,
        TextShape,
        CodeShape,
        ImageShape,
        IconShape,
        Frame,
        FreehandStroke
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
        import("./rectangleTool-OJTI4C77.js"),
        import("./circleTool-PKGZXEGA.js"),
        import("./arrowTool-QGEUKV2V.js"),
        import("./lineTool-YVL5WTOW.js"),
        import("./textTool-2ZKCNEYJ.js"),
        import("./codeTool-2GDVACN4.js"),
        import("./imageTool-BJQZTJG7.js"),
        import("./iconTool-WC5ZJ53H.js"),
        import("./frameTool-3PBPKRL5.js"),
        import("./freehandTool-AYRB4CG3.js")
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
        import("./EventDispatcher-PG4COSJT.js"),
        import("./UndoRedo-XWWGFNPW.js"),
        import("./Selection-4LBY3FFU.js"),
        import("./ZoomPan-DHR7FLVT.js"),
        import("./CopyPaste-LSMDXOLX.js"),
        import("./EraserTrail-PA6IQLQN.js"),
        import("./ResizeShapes-LKEQTITP.js"),
        import("./ResizeCode-WAMDTKSW.js")
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
        import("./eraserTool-2GS2LQCS.js"),
        import("./laserTool-XVMV63AV.js")
      ]);
      if (undoRedo.undo) window.undo = undoRedo.undo;
      if (undoRedo.redo) window.redo = undoRedo.redo;
      if (undoRedo.pushCreateAction) window.pushCreateAction = undoRedo.pushCreateAction;
      if (undoRedo.pushDeleteAction) window.pushDeleteAction = undoRedo.pushDeleteAction;
      if (selection.multiSelection) window.multiSelection = selection.multiSelection;
      if (selection.clearAllSelections) window.clearAllSelections = selection.clearAllSelections;
      if (copyPaste.initCopyPaste) copyPaste.initCopyPaste();
      const aiRenderer = await import("./AIRenderer-WTUHSO7L.js");
      if (aiRenderer.initAIRenderer) aiRenderer.initAIRenderer();
      const graphEngine = await import("./GraphEngine-SOTWKLXO.js");
      if (graphEngine.initGraphEngine) graphEngine.initGraphEngine();
      const sceneSerializer = await import("./SceneSerializer-BS3HY5XR.js");
      if (sceneSerializer.initSceneSerializer) sceneSerializer.initSceneSerializer();
      const layerOrder = await import("./LayerOrder-XCHF4MSS.js");
      if (layerOrder.initLayerOrder) layerOrder.initLayerOrder();
      const lixScript = await import("./LixScriptParser-JYWJX375.js");
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
        const shapes = window.shapes;
        if (shapes) {
          const idx = shapes.indexOf(shape);
          if (idx !== -1) shapes.splice(idx, 1);
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
      const svg = svgRef.current;
      svg.setAttribute("viewBox", `0 0 ${svg.clientWidth || window.innerWidth} ${svg.clientHeight || window.innerHeight}`);
      const engine = new SketchEngine(svg);
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
    const svg = svgRef.current;
    if (!svg) return;
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
    observer.observe(svg, { childList: true, subtree: true, attributes: true });
    svg.addEventListener("mouseup", debounced);
    window.addEventListener("beforeunload", flush);
    return () => {
      observer.disconnect();
      svg.removeEventListener("mouseup", debounced);
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
