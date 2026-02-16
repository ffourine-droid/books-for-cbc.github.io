
import React from 'react';
import { Topic, Grade } from './types';

export const CURRICULUM: Record<Grade, Topic[]> = {
  1: [
    { id: '1-1', subject_id: 'math', title: 'Counting to 20', grade: 1, order_number: 1 },
    { id: '1-2', subject_id: 'math', title: 'Basic Addition', grade: 1, order_number: 2 },
  ],
  2: [
    { id: '2-1', subject_id: 'math', title: 'Place Value', grade: 2, order_number: 1 },
    { id: '2-2', subject_id: 'math', title: 'Subtraction within 100', grade: 2, order_number: 2 },
  ],
  3: [
    { id: '3-1', subject_id: 'math', title: 'Multiplication Tables', grade: 3, order_number: 1 },
    { id: '3-2', subject_id: 'math', title: 'Fractions Intro', grade: 3, order_number: 2 },
  ],
  4: [
    { id: '4-1', subject_id: 'math', title: 'Long Division', grade: 4, order_number: 1 },
    { id: '4-2', subject_id: 'math', title: 'Decimals', grade: 4, order_number: 2 },
  ],
  5: [
    { id: '5-1', subject_id: 'math', title: 'Algebraic Thinking', grade: 5, order_number: 1 },
    { id: '5-2', subject_id: 'math', title: 'Volume and Geometry', grade: 5, order_number: 2 },
  ],
  6: [
    { id: '6-1', subject_id: 'math', title: 'Ratios and Proportions', grade: 6, order_number: 1 },
    { id: '6-2', subject_id: 'math', title: 'Negative Numbers', grade: 6, order_number: 2 },
  ],
  7: [
    { id: '7-1', subject_id: 'math', title: 'Probability', grade: 7, order_number: 1 },
    { id: '7-2', subject_id: 'math', title: 'Linear Equations', grade: 7, order_number: 2 },
  ],
  8: [
    { id: '8-1', subject_id: 'math', title: 'Pythagorean Theorem', grade: 8, order_number: 1 },
    { id: '8-2', subject_id: 'math', title: 'Exponents', grade: 8, order_number: 2 },
  ],
  9: [
    { id: '9-1', subject_id: 'math', title: 'Quadratic Equations', grade: 9, order_number: 1 },
    { id: '9-2', subject_id: 'math', title: 'Trigonometry Basics', grade: 9, order_number: 2 },
    { id: '9-3', subject_id: 'math', title: 'Linear Functions', grade: 9, order_number: 3 },
  ],
};

// Mock lessons for the demo since we don't have the full Supabase backend here
export const getLessonsForTopic = (topicId: string) => {
  const common = [
    { id: 'L1', topic_id: topicId, type: 'explanation' as const, content: "Welcome to this lesson! Let's explore the core concepts." },
  ];

  if (topicId === '9-1') {
    return [
      ...common,
      { id: 'L2', topic_id: topicId, type: 'explanation' as const, content: "A quadratic equation is any equation that can be rearranged in standard form as ax² + bx + c = 0 where x represents an unknown, and a, b, and c represent known numbers, with a ≠ 0." },
      { id: 'L3', topic_id: topicId, type: 'question' as const, content: "What is the degree of a quadratic equation?", correct_answer: "2", hint: "Look at the highest power of x." },
      { id: 'L4', topic_id: topicId, type: 'question' as const, content: "Solve for x: x² - 4 = 0 (Enter positive root)", correct_answer: "2" },
    ];
  }

  return [
    ...common,
    { id: 'L2', topic_id: topicId, type: 'explanation' as const, content: "In this section, we build on our foundational knowledge to solve more complex problems." },
    { id: 'L3', topic_id: topicId, type: 'question' as const, content: "What is 10 + 5?", correct_answer: "15" },
  ];
};

export const Icons = {
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Tutor: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3m0 0l8.14-3.907a.75.75 0 011.07.904l-1.238 3.51a.75.75 0 01-.461.462l-3.51 1.238a.75.75 0 01-.904-1.07L12 15zm0 0l-8.14-3.907a.75.75 0 00-1.07.904l1.238 3.51a.75.75 0 00.461.462l3.51 1.238a.75.75 0 00.904-1.07L12 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.174L12 6.304l7.74 3.87m-15.48 0L12 14.044l7.74-3.87m-15.48 0V6.75A2.25 2.25 0 016.51 4.5h10.98a2.25 2.25 0 012.25 2.25v3.424" />
    </svg>
  ),
};
