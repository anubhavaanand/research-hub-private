/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Paper } from '../types';

interface CitationGraphProps {
    papers: Paper[];
    selectedPaperId: string | null;
    onSelectPaper: (id: string) => void;
}

interface Node {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    label: string;
    color: string;
    radius: number;
}

interface Edge {
    source: string;
    target: string;
}

export default function CitationGraph({ papers, selectedPaperId, onSelectPaper }: CitationGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const animationRef = useRef<number>();

    // Color palette based on paper status
    const statusColors: Record<string, string> = {
        'toread': '#64748b',
        'reading': '#f59e0b',
        'read': '#22c55e'
    };

    // Initialize nodes from papers
    useEffect(() => {
        const width = 600;
        const height = 400;

        const newNodes: Node[] = papers.map((paper, i) => {
            const angle = (2 * Math.PI * i) / papers.length;
            const r = Math.min(width, height) * 0.35;
            return {
                id: paper.id,
                x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
                y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
                vx: 0,
                vy: 0,
                label: paper.title.length > 20 ? paper.title.slice(0, 20) + '...' : paper.title,
                color: statusColors[paper.status] || '#3b82f6',
                radius: paper.citationCount ? Math.min(20, 8 + paper.citationCount / 10) : 10
            };
        });

        // Create edges based on shared authors or keywords
        const newEdges: Edge[] = [];
        for (let i = 0; i < papers.length; i++) {
            for (let j = i + 1; j < papers.length; j++) {
                // Connect papers with shared authors
                const sharedAuthors = papers[i].authors.filter(a =>
                    papers[j].authors.some(b => a.toLowerCase() === b.toLowerCase())
                );
                if (sharedAuthors.length > 0) {
                    newEdges.push({ source: papers[i].id, target: papers[j].id });
                }
                // Connect papers from same publication
                if (papers[i].publication === papers[j].publication) {
                    newEdges.push({ source: papers[i].id, target: papers[j].id });
                }
            }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [papers]);

    // Force-directed layout simulation
    useEffect(() => {
        if (nodes.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        let localNodes = [...nodes];

        const simulate = () => {
            // Apply forces
            for (let i = 0; i < localNodes.length; i++) {
                // Center gravity
                localNodes[i].vx += (width / 2 - localNodes[i].x) * 0.001;
                localNodes[i].vy += (height / 2 - localNodes[i].y) * 0.001;

                // Repulsion between all nodes
                for (let j = 0; j < localNodes.length; j++) {
                    if (i === j) continue;
                    const dx = localNodes[i].x - localNodes[j].x;
                    const dy = localNodes[i].y - localNodes[j].y;
                    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                    const force = 500 / (dist * dist);
                    localNodes[i].vx += (dx / dist) * force;
                    localNodes[i].vy += (dy / dist) * force;
                }
            }

            // Spring force for edges
            edges.forEach(edge => {
                const source = localNodes.find(n => n.id === edge.source);
                const target = localNodes.find(n => n.id === edge.target);
                if (!source || !target) return;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = (dist - 100) * 0.01;

                source.vx += (dx / dist) * force;
                source.vy += (dy / dist) * force;
                target.vx -= (dx / dist) * force;
                target.vy -= (dy / dist) * force;
            });

            // Update positions with damping
            localNodes.forEach(node => {
                node.vx *= 0.9;
                node.vy *= 0.9;
                node.x += node.vx;
                node.y += node.vy;
                // Keep in bounds
                node.x = Math.max(30, Math.min(width - 30, node.x));
                node.y = Math.max(30, Math.min(height - 30, node.y));
            });

            // Draw
            ctx.fillStyle = 'rgba(10, 22, 40, 0.95)';
            ctx.fillRect(0, 0, width, height);

            // Draw edges
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.lineWidth = 1;
            edges.forEach(edge => {
                const source = localNodes.find(n => n.id === edge.source);
                const target = localNodes.find(n => n.id === edge.target);
                if (!source || !target) return;

                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            });

            // Draw nodes
            localNodes.forEach(node => {
                const isSelected = node.id === selectedPaperId;
                const isHovered = node.id === hoveredNode;

                // Glow effect for selected
                if (isSelected || isHovered) {
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 15;
                }

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + (isSelected ? 4 : 0), 0, Math.PI * 2);
                ctx.fillStyle = isSelected ? '#fff' : node.color;
                ctx.fill();

                ctx.shadowBlur = 0;

                // Border
                ctx.strokeStyle = isSelected ? node.color : 'rgba(255,255,255,0.3)';
                ctx.lineWidth = isSelected ? 3 : 1;
                ctx.stroke();
            });

            animationRef.current = requestAnimationFrame(simulate);
        };

        simulate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [nodes, edges, selectedPaperId, hoveredNode]);

    // Handle mouse events
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const found = nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < node.radius + 5;
        });

        setHoveredNode(found?.id || null);
        canvas.style.cursor = found ? 'pointer' : 'default';
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (hoveredNode) {
            onSelectPaper(hoveredNode);
        }
    };

    if (papers.length === 0) {
        return (
            <div className="citation-graph-empty">
                <p>Add papers to see the citation network</p>
            </div>
        );
    }

    return (
        <div className="citation-graph-container">
            <div className="citation-graph-header">
                <h4>📊 Citation Network</h4>
                <span className="graph-stats">{papers.length} papers • {edges.length} connections</span>
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                className="citation-graph-canvas"
            />
            <div className="graph-legend">
                <span><span className="legend-dot" style={{ background: '#64748b' }} /> To Read</span>
                <span><span className="legend-dot" style={{ background: '#f59e0b' }} /> Reading</span>
                <span><span className="legend-dot" style={{ background: '#22c55e' }} /> Read</span>
            </div>
        </div>
    );
}
