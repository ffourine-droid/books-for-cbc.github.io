
import { Topic, Lesson, Grade } from '../types';
import { CURRICULUM } from '../constants';

const TOPICS_KEY = 'mathmaster_custom_topics';
const LESSONS_KEY = 'mathmaster_custom_lessons';

export const getCustomTopics = (): Topic[] => {
  const data = localStorage.getItem(TOPICS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCustomLessons = (): Lesson[] => {
  const data = localStorage.getItem(LESSONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTopic = (topic: Topic) => {
  const topics = getCustomTopics();
  localStorage.setItem(TOPICS_KEY, JSON.stringify([...topics, topic]));
};

export const saveLesson = (lesson: Lesson) => {
  const lessons = getCustomLessons();
  localStorage.setItem(LESSONS_KEY, JSON.stringify([...lessons, lesson]));
};

export const getAllTopicsForGrade = (grade: Grade): Topic[] => {
  const staticTopics = CURRICULUM[grade] || [];
  const customTopics = getCustomTopics().filter(t => t.grade === grade);
  return [...staticTopics, ...customTopics].sort((a, b) => a.order_number - b.order_number);
};

export const getAllLessonsForTopic = (topicId: string, staticLessons: Lesson[]): Lesson[] => {
  const customLessons = getCustomLessons().filter(l => l.topic_id === topicId);
  return [...staticLessons, ...customLessons];
};
