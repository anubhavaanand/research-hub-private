/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Paper } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    }).format(new Date(timestamp));
};

export const MOCK_PAPERS: Paper[] = [
    {
        id: '1',
        title: "Attention Is All You Need",
        authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
        type: 'conference',
        publication: "Advances in Neural Information Processing Systems (NeurIPS)",
        year: 2017,
        pages: "5998-6008",
        abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
        addedAt: Date.now() - 10000000,
        isFavorite: true,
        fileName: "transformer_paper.pdf",
        status: 'read',
        tags: ['NLP', 'Deep Learning', 'Transformer'],
        citationCount: 125000,
        personalNotes: "Foundational paper for LLMs. The key insight is self-attention."
    },
    {
        id: '2',
        title: "Deep Residual Learning for Image Recognition",
        authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
        type: 'conference',
        publication: "CVPR",
        year: 2016,
        addedAt: Date.now() - 20000000,
        isFavorite: false,
        fileName: "resnet.pdf",
        status: 'read',
        tags: ['Computer Vision', 'ResNet', 'CNN'],
        citationCount: 210000
    },
    {
        id: '3',
        title: "A Survey on Large Language Model based Autonomous Agents",
        authors: ["Lei Wang", "Chen Ma", "Xueyang Feng", "Zeyu Zhang"],
        type: 'journal',
        publication: "Frontiers of Computer Science",
        year: 2024,
        volume: "18",
        issue: "6",
        abstract: "Autonomous agents have long been a prominent research topic in both academic and industry communities. Previous research often focuses on training agents with limited knowledge within isolated environments.",
        addedAt: Date.now(),
        isFavorite: true,
        fileName: "llm_agents.pdf",
        status: 'reading',
        tags: ['Agents', 'LLM', 'Survey'],
        citationCount: 450,
        personalNotes: "Good overview of the current agentic landscape. Check reference 12 for memory modules."
    },
    {
        id: '4',
        title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        authors: ["Jason Wei", "Xuezhi Wang", "Dale Schuurmans"],
        type: 'conference',
        publication: "NeurIPS",
        year: 2022,
        addedAt: Date.now() - 5000000,
        isFavorite: true,
        fileName: "cot_prompting.pdf",
        status: 'toread',
        tags: ['Prompt Engineering', 'Reasoning', 'LLM'],
        citationCount: 5200
    },
    {
        id: '5',
        title: "LoRA: Low-Rank Adaptation of Large Language Models",
        authors: ["Edward Hu", "Yelong Shen", "Phillip Wallis"],
        type: 'conference',
        publication: "ICLR",
        year: 2022,
        addedAt: Date.now() - 15000000,
        isFavorite: false,
        fileName: "lora_adapter.pdf",
        status: 'toread',
        tags: ['Fine-tuning', 'Efficiency'],
        citationCount: 3800
    }
];
