import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  leftPane: React.ReactNode;
  topRightPane: React.ReactNode;
  bottomRightPane: React.ReactNode;
}

export const SplitPaneLayout: React.FC<Props> = ({ leftPane, topRightPane, bottomRightPane }) => {
  const [leftWidth, setLeftWidth] = useState(50);
  const [topHeight, setTopHeight] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidthPercent = Math.max(20, Math.min(80, startWidth + (deltaX / containerWidth) * 100));
      setLeftWidth(newWidthPercent);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftWidth]);

  const startHorizontalResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = topHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeightPercent = Math.max(20, Math.min(80, startHeight + (deltaY / window.innerHeight) * 100));
      setTopHeight(newHeightPercent);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [topHeight]);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
      className="flex w-full h-full overflow-hidden bg-zinc-950 text-zinc-100"
    >
      {/* Left Pane: Code Editor */}
      <motion.div 
        layout
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full shadow-2xl z-10 relative bg-zinc-950 flex-shrink-0"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPane}
      </motion.div>

      {/* Resize Handle */}
      <div 
        onMouseDown={startResizing}
        className="w-1.5 h-full bg-zinc-800/80 hover:bg-zinc-700 cursor-col-resize z-50 flex-shrink-0 transition-colors group relative"
      >
        {/* Invisible wider grab area */}
        <div className="absolute inset-y-0 -left-2 -right-2" />
        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/20 via-purple-500/20 to-emerald-500/20 shadow-[0_0_10px_purple] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Right Column */}
      <motion.div 
        layout
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="h-full flex flex-col bg-zinc-900/10 flex-1 min-w-0"
      >
        {/* Top Right: Question Panel */}
        <div className="min-h-[200px] border-b border-zinc-900 overflow-hidden relative" style={{ height: `${topHeight}%` }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 to-zinc-900/50 backdrop-blur-xl" />
          <div className="relative h-full w-full">
            {topRightPane}
          </div>
        </div>

        {/* Horizontal Resize Handle */}
        <div 
          onMouseDown={startHorizontalResizing}
          className="h-1.5 w-full bg-zinc-800/80 hover:bg-zinc-700 cursor-row-resize z-50 flex-shrink-0 transition-colors group relative"
        >
          {/* Invisible wider grab area */}
          <div className="absolute inset-x-0 -top-2 -bottom-2" />
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 shadow-[0_0_10px_purple] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Bottom Right: Terminal */}
        <div className="flex-1 min-h-[200px] overflow-hidden bg-black shadow-inner">
          {bottomRightPane}
        </div>
      </motion.div>
    </motion.div>
  );
};
