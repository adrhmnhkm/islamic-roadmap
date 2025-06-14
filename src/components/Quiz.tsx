import React, { useState } from 'react';
import { create } from 'zustand';
import { useProgressStore } from '../store/progressStore';

interface QuizStore {
  completedQuizzes: Record<string, boolean>;
  markQuizComplete: (quizId: string) => void;
}

const useQuizStore = create<QuizStore>((set) => ({
  completedQuizzes: {},
  markQuizComplete: (quizId) =>
    set((state) => ({
      completedQuizzes: { ...state.completedQuizzes, [quizId]: true },
    })),
}));

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  lessonId: string;
  topicId?: string; // Add topicId for progress tracking
  questions: Question[];
  onComplete: () => void;
}

const Quiz: React.FC<QuizProps> = ({ lessonId, topicId, questions, onComplete = () => {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const markQuizComplete = useQuizStore((state) => state.markQuizComplete);
  const progressStore = useProgressStore();

  // Start study session when quiz begins (only run once)
  React.useEffect(() => {
    if (topicId && !sessionId) {
      const id = progressStore.startStudySession(topicId);
      setSessionId(id);
    }
  }, [topicId]); // Remove sessionId and progressStore from dependencies

  const handleAnswer = (selectedOption: number) => {
    setSelectedAnswer(selectedOption);
    
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      markQuizComplete(lessonId);
      
      // End study session and update progress
      if (sessionId && topicId) {
        const percentage = (score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0)) / questions.length * 100;
        progressStore.endStudySession(sessionId, percentage);
        
        // If quiz passed (70%+), update topic progress
        if (percentage >= 70) {
          const currentProgress = progressStore.getTopicProgress(topicId);
          if (currentProgress) {
            const newCompletedLessons = Math.min(
              currentProgress.completedLessons + 1, 
              currentProgress.totalLessons
            );
            const status = newCompletedLessons === currentProgress.totalLessons ? 'completed' : 'in_progress';
            progressStore.updateTopicProgress(topicId, status, newCompletedLessons);
          }
        }
      }
      
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-primary mb-4">Hasil Kuis</h3>
        <p className="text-lg mb-4">
          Skor Anda {score} dari {questions.length} ({percentage.toFixed(1)}%)
        </p>
        {percentage >= 70 ? (
          <div className="text-green-600">
            <p className="mb-2">🎉 Selamat! Anda telah lulus kuis!</p>
            {topicId && (
              <p className="text-sm">Progress pembelajaran Anda telah diperbarui.</p>
            )}
          </div>
        ) : (
          <p className="text-red-600">Silakan pelajari kembali materi dan coba lagi kuisnya.</p>
        )}
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-primary">
          Pertanyaan {currentQuestion + 1} dari {questions.length}
        </h3>
        {sessionId && (
          <div className="text-sm text-gray-500 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Sesi belajar aktif
          </div>
        )}
      </div>
      <p className="text-lg mb-6">{question.question}</p>
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className={`w-full p-4 text-left rounded-lg transition-colors ${
              selectedAnswer === index
                ? selectedAnswer === question.correctAnswer
                  ? 'bg-green-100 border-green-500'
                  : 'bg-red-100 border-red-500'
                : 'bg-gray-50 hover:bg-gray-100'
            } border-2 ${
              selectedAnswer !== null
                ? index === question.correctAnswer
                  ? 'border-green-500'
                  : 'border-gray-200'
                : 'border-gray-200'
            }`}
            disabled={selectedAnswer !== null}
          >
            {option}
          </button>
        ))}
      </div>
      {selectedAnswer !== null && (
        <button
          onClick={handleNext}
          className="mt-6 px-6 py-2 bg-accent text-white rounded-lg hover:bg-primary transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Selesai Kuis' : 'Pertanyaan Berikutnya'}
        </button>
      )}
    </div>
  );
};

export default Quiz;