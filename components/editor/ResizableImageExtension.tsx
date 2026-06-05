"use client";

import { Node, mergeAttributes } from "@tiptap/react";
import {
  NodeViewWrapper,
  NodeViewProps,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Trash2,
  GripHorizontal,
} from "lucide-react";

/* ── Resize handle component ─────────────────────────────────── */

function ResizeHandle({
  position,
  onResizeStart,
}: {
  position: "right" | "bottom-right" | "bottom";
  onResizeStart: (e: React.MouseEvent, pos: string) => void;
}) {
  const cursorMap: Record<string, string> = {
    right: "e-resize",
    "bottom-right": "se-resize",
    bottom: "s-resize",
  };
  const posStyles: Record<string, React.CSSProperties> = {
    right: { top: "50%", right: -4, transform: "translateY(-50%)", width: 8, height: 32, cursor: cursorMap.right },
    "bottom-right": { bottom: -4, right: -4, width: 12, height: 12, cursor: cursorMap["bottom-right"], borderRadius: "0 0 4px 0" },
    bottom: { bottom: -4, left: "50%", transform: "translateX(-50%)", width: 32, height: 8, cursor: cursorMap.bottom },
  };

  return (
    <div
      onMouseDown={(e) => onResizeStart(e, position)}
      style={{
        position: "absolute",
        background: "var(--primary, #6366f1)",
        borderRadius: 3,
        opacity: 0.7,
        zIndex: 10,
        transition: "opacity 0.15s",
        ...posStyles[position],
      }}
      onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
      onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.7")}
    />
  );
}

/* ── Image toolbar bubble ─────────────────────────────────────── */

function ImageToolbar({
  alignment,
  width,
  onAlign,
  onSize,
  onDelete,
}: {
  alignment: string;
  width: number | string;
  onAlign: (a: string) => void;
  onSize: (preset: string) => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: -44,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "#1e293b",
        borderRadius: 8,
        padding: "4px 6px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        zIndex: 50,
        whiteSpace: "nowrap",
      }}
    >
      <TBBtn active={alignment === "left"} onClick={() => onAlign("left")} title="Align Left">
        <AlignLeft size={14} />
      </TBBtn>
      <TBBtn active={alignment === "center"} onClick={() => onAlign("center")} title="Align Center">
        <AlignCenter size={14} />
      </TBBtn>
      <TBBtn active={alignment === "right"} onClick={() => onAlign("right")} title="Align Right">
        <AlignRight size={14} />
      </TBBtn>

      <TBSep />

      <TBBtn active={false} onClick={() => onSize("25")} title="25% width">
        <span style={{ fontSize: 11, fontWeight: 600 }}>25%</span>
      </TBBtn>
      <TBBtn active={false} onClick={() => onSize("50")} title="50% width">
        <span style={{ fontSize: 11, fontWeight: 600 }}>50%</span>
      </TBBtn>
      <TBBtn active={false} onClick={() => onSize("75")} title="75% width">
        <span style={{ fontSize: 11, fontWeight: 600 }}>75%</span>
      </TBBtn>
      <TBBtn active={false} onClick={() => onSize("100")} title="100% width">
        <Maximize2 size={13} />
      </TBBtn>

      <TBSep />

      <TBBtn active={false} onClick={onDelete} title="Delete Image" danger>
        <Trash2 size={14} />
      </TBBtn>
    </div>
  );
}

function TBBtn({
  active,
  onClick,
  title,
  children,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 26,
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        color: danger ? "#f87171" : active ? "#fff" : "#94a3b8",
        background: active ? "rgba(99,102,241,0.5)" : "transparent",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.background = danger
          ? "rgba(248,113,113,0.2)"
          : "rgba(99,102,241,0.3)";
        (e.target as HTMLElement).style.color = danger ? "#fca5a5" : "#fff";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.background = active
          ? "rgba(99,102,241,0.5)"
          : "transparent";
        (e.target as HTMLElement).style.color = danger
          ? "#f87171"
          : active ? "#fff" : "#94a3b8";
      }}
    >
      {children}
    </button>
  );
}

function TBSep() {
  return <div style={{ width: 1, height: 18, background: "#334155", margin: "0 3px" }} />;
}

/* ── NodeView component ───────────────────────────────────────── */

function ResizableImageView(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const { src, alt, title, width, height, alignment } = node.attrs;

  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0, handle: "" });

  // Show toolbar on selection
  useEffect(() => {
    setShowToolbar(selected);
  }, [selected]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();
      const img = imgRef.current;
      if (!img) return;

      setIsResizing(true);
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        w: img.offsetWidth,
        h: img.offsetHeight,
        handle,
      };

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startPos.current.x;
        const dy = ev.clientY - startPos.current.y;

        let newW = startPos.current.w;
        let newH = startPos.current.h;

        if (handle === "right" || handle === "bottom-right") {
          newW = Math.max(60, startPos.current.w + dx);
        }
        if (handle === "bottom" || handle === "bottom-right") {
          newH = Math.max(40, startPos.current.h + dy);
        }

        // Maintain aspect ratio for corner handle
        if (handle === "bottom-right") {
          const ratio = startPos.current.w / startPos.current.h;
          newH = newW / ratio;
        }

        // If only side handle, keep height auto
        if (handle === "right") {
          updateAttributes({ width: newW, height: null });
        } else {
          updateAttributes({ width: newW, height: Math.round(newH) });
        }
      };

      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updateAttributes]
  );

  const handleAlign = useCallback(
    (a: string) => updateAttributes({ alignment: a }),
    [updateAttributes]
  );

  const handleSize = useCallback(
    (preset: string) => {
      const container = wrapRef.current?.closest(".ProseMirror");
      if (!container) {
        updateAttributes({ width: `${preset}%`, height: null });
        return;
      }
      const containerW = container.clientWidth - 40; // padding
      const pct = parseInt(preset) / 100;
      updateAttributes({ width: Math.round(containerW * pct), height: null });
    },
    [updateAttributes]
  );

  const justifyMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return (
    <NodeViewWrapper
      as="div"
      style={{
        display: "flex",
        justifyContent: justifyMap[alignment] || "center",
        margin: "0.75em 0",
        position: "relative",
      }}
    >
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          display: "inline-block",
          maxWidth: "100%",
          lineHeight: 0,
        }}
        onClick={(e) => { e.stopPropagation(); }}
      >
        {/* Toolbar */}
        {selected && !isResizing && (
          <ImageToolbar
            alignment={alignment}
            width={width}
            onAlign={handleAlign}
            onSize={handleSize}
            onDelete={deleteNode}
          />
        )}

        {/* The image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ""}
          title={title || ""}
          draggable={false}
          style={{
            width: typeof width === "number" ? width : width || "auto",
            height: typeof height === "number" ? height : height || "auto",
            maxWidth: "100%",
            borderRadius: 8,
            display: "block",
            outline: selected ? "2px solid var(--primary, #6366f1)" : "none",
            outlineOffset: 3,
            transition: isResizing ? "none" : "outline 0.15s, box-shadow 0.15s",
            boxShadow: selected ? "0 0 0 4px rgba(99,102,241,0.12)" : "none",
            cursor: "default",
          }}
        />

        {/* Resize handles — only when selected */}
        {selected && (
          <>
            <ResizeHandle position="right" onResizeStart={handleResizeStart} />
            <ResizeHandle position="bottom" onResizeStart={handleResizeStart} />
            <ResizeHandle position="bottom-right" onResizeStart={handleResizeStart} />
          </>
        )}

        {/* Size indicator while resizing */}
        {isResizing && imgRef.current && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          >
            {imgRef.current.offsetWidth} × {imgRef.current.offsetHeight}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/* ── TipTap Node Extension ────────────────────────────────────── */

export const ResizableImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      alignment: { default: "center" },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, ...rest } = HTMLAttributes;
    return [
      "figure",
      {
        style: `display:flex;justify-content:${
          alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center"
        };margin:0.75em 0;`,
      },
      [
        "img",
        mergeAttributes(rest, {
          style: [
            rest.width ? `width:${typeof rest.width === "number" ? rest.width + "px" : rest.width}` : "",
            rest.height ? `height:${typeof rest.height === "number" ? rest.height + "px" : rest.height}` : "",
            "max-width:100%",
            "border-radius:8px",
          ]
            .filter(Boolean)
            .join(";"),
        }),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string; width?: number; height?: number; alignment?: string }) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    } as any;
  },
});
