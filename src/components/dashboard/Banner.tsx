import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Banner() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    questions: [
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      }
    ]
  });
  const [formView, setFormView] = useState('list'); // 'list', 'create', 'detail'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // Store quiz ID to delete

  // For animations and enhanced grading UI
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatingQuestion, setAnimatingQuestion] = useState(null);

  // Fetch all quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.adhyan.guru/api/getall/quiz');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching quizzes: ' + err.message);
      setLoading(false);
    }
  };

  // New function to delete a quiz
  const handleDeleteQuiz = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://api.adhyan.guru/api/delete/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deleteConfirmation }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      
      setSuccessMessage('Quiz deleted successfully!');
      
      // If the deleted quiz was the currently selected one, go back to list view
      if (selectedQuiz && selectedQuiz._id === deleteConfirmation) {
        setFormView('list');
        setSelectedQuiz(null);
      }
      
      // Clear the confirmation state
      setDeleteConfirmation(null);
      
      // Refetch quizzes to update the list
      fetchQuizzes();
    } catch (err) {
      setError('Error deleting quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmation = (quizId, event) => {
    // Stop the event from bubbling up to the parent (which would show quiz details)
    event.stopPropagation();
    setDeleteConfirmation(quizId);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Validate form
      if (!newQuiz.title.trim()) {
        setError('Please enter a quiz title');
        setLoading(false);
        return;
      }
      
      // Validate all questions have complete data
      for (let question of newQuiz.questions) {
        if (!question.text.trim()) {
          setError('All questions must have text');
          setLoading(false);
          return;
        }
        
        if (question.options.some(option => !option.trim())) {
          setError('All options must have text');
          setLoading(false);
          return;
        }
        
        if (!question.correctAnswer.trim()) {
          setError('All questions must have a correct answer selected');
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch('https://api.adhyan.guru/api/create/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuiz),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }
      
      setSuccessMessage('Quiz created successfully!');
      
      // Reset form
      setNewQuiz({
        title: '',
        questions: [
          {
            text: '',
            options: ['', '', '', ''],
            correctAnswer: ''
          }
        ]
      });
      
      fetchQuizzes();
      setFormView('list');
      setLoading(false);
    } catch (err) {
      setError('Error creating quiz: ' + err.message);
      setLoading(false);
    }
  };

  const handleQuizTitleChange = (e) => {
    setNewQuiz({
      ...newQuiz,
      title: e.target.value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...newQuiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswer: value
    };
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctAnswer: ''
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (newQuiz.questions.length <= 1) {
      setError('Quiz must have at least one question');
      return;
    }
    
    const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  const showQuizDetails = (quiz) => {
    setSelectedQuiz(quiz);
    setFormView('detail');
  };

  // Function to handle selecting an answer
  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };
  
  // Enhanced submit quiz with animations
  const submitQuiz = () => {
    if (!selectedQuiz) return;
    
    // Calculate score
    let correctCount = 0;
    selectedQuiz.questions.forEach(question => {
      if (userAnswers[question._id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / selectedQuiz.questions.length) * 100);
    setQuizScore({
      correct: correctCount,
      total: selectedQuiz.questions.length,
      percentage
    });
    
    // Reveal answers one by one with animation
    revealAnswersSequentially();
  };
  
  // Function to reveal answers one by one with animations
  const revealAnswersSequentially = () => {
    setQuizSubmitted(true);
    
    // Animate questions one by one
    selectedQuiz.questions.forEach((question, index) => {
      setTimeout(() => {
        setAnimatingQuestion(index);
        
        // If it's the last question and score is good, show confetti
        if (index === selectedQuiz.questions.length - 1) {
          const percentage = Math.round((quizScore.correct / quizScore.total) * 100);
          if (percentage >= 80) {
            setTimeout(() => setShowConfetti(true), 500);
          }
        }
      }, index * 800); // Delay each question reveal by 800ms
    });
  };
  
  const resetQuizAttempt = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setShowConfetti(false);
    setAnimatingQuestion(null);
  };

  // Confetti component
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 100 }).map((_, i) => {
      const colors = ['#ffcc00', '#ff3366', '#33cc33', '#3366ff', '#cc33ff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 100;
      const delay = Math.random() * 3;
      const size = Math.random() * 0.5 + 0.5;
      
      return (
        <motion.div
          key={i}
          className="absolute w-2 h-3 bg-white rounded-sm"
          style={{ 
            left: `${x}%`, 
            top: '-20px',
            backgroundColor: color,
            scale: size,
          }}
          initial={{ y: -50 }}
          animate={{ 
            y: ['0%', '100vh'],
            rotate: [0, Math.random() * 360],
            opacity: [1, 0.8, 0]
          }}
          transition={{ 
            duration: 5,
            ease: 'easeOut',
            delay: delay
          }}
        />
      );
    });
    
    return <div className="fixed inset-0 pointer-events-none">{confettiPieces}</div>;
  };

  // Grade badge component
  const GradeBadge = ({ score }) => {
    let grade, color, icon;
    
    if (score >= 90) {
      grade = 'A';
      color = 'bg-green-500';
      icon = '🏆';
    } else if (score >= 80) {
      grade = 'B';
      color = 'bg-green-400';
      icon = '🎉';
    } else if (score >= 70) {
      grade = 'C';
      color = 'bg-yellow-400';
      icon = '👍';
    } else if (score >= 60) {
      grade = 'D';
      color = 'bg-orange-400';
      icon = '😐';
    } else {
      grade = 'F';
      color = 'bg-red-500';
      icon = '😢';
    }
    
    return (
      <motion.div
        className={`${color} text-white rounded-full w-24 h-24 flex flex-col items-center justify-center text-center shadow-lg`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <span className="text-3xl font-bold">{grade}</span>
        <span className="text-2xl">{icon}</span>
      </motion.div>
    );
  };

  // Progress bar for quiz completion
  const ProgressBar = ({ percentage }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <motion.div
          className="h-4 rounded-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    );
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!deleteConfirmation) return null;
    
    // Find the quiz title for better UX
    const quizToDelete = quizzes.find(quiz => quiz._id === deleteConfirmation);
    const quizTitle = quizToDelete ? quizToDelete.title : 'this quiz';
    
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <h3 className="text-xl font-bold mb-4">Delete Quiz</h3>
          <p className="mb-6">Are you sure you want to delete "{quizTitle}"? This action cannot be undone.</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setDeleteConfirmation(null)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteQuiz}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </div>
              ) : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quiz Manager</h2>
      
      {error && (
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}
      
      {successMessage && (
        <motion.div 
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {successMessage}
        </motion.div>
      )}
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => {
            setFormView('list');
            resetQuizAttempt();
          }}
          className={`px-4 py-2 rounded transition-colors duration-200 ${formView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          View Quizzes
        </button>
        <button 
          onClick={() => {
            setFormView('create');
            resetQuizAttempt();
          }}
          className={`px-4 py-2 rounded transition-colors duration-200 ${formView === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Create Quiz
        </button>
      </div>
      
      {formView === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">Available Quizzes</h3>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <p className="text-center p-8 text-gray-500">No quizzes available. Create one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz, index) => (
                <motion.div 
                  key={quiz._id} 
                  className="border rounded p-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                  onClick={() => showQuizDetails(quiz)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{quiz.title}</h4>
                      <p className="text-gray-600">{quiz.questions.length} questions</p>
                      <p className="text-sm text-gray-500">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                    <motion.button
                      onClick={(e) => showDeleteConfirmation(quiz._id, e)}
                      className="text-red-500 hover:text-red-600 transition-colors p-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      
      {formView === 'detail' && selectedQuiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setFormView('list');
                  resetQuizAttempt();
                }}
                className="mr-4 text-blue-500 hover:underline flex items-center"
              >
                <span className="mr-1">←</span> Back to list
              </button>
              <h3 className="text-xl font-semibold">{selectedQuiz.title}</h3>
            </div>
            <motion.button
              onClick={(e) => showDeleteConfirmation(selectedQuiz._id, e)}
              className="text-red-500 hover:text-red-600 transition-colors p-2 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Quiz
            </motion.button>
          </div>
          
          {quizSubmitted ? (
            <div>
              {showConfetti && <Confetti />}
              
              <motion.div 
                className="bg-blue-50 p-6 rounded-lg mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Quiz Results</h3>
                    <p className="text-lg">Score: {quizScore.correct}/{quizScore.total} ({quizScore.percentage}%)</p>
                    
                    {quizScore.percentage >= 80 ? (
                      <p className="text-green-600 font-medium mt-2">Great job! You passed the quiz!</p>
                    ) : quizScore.percentage >= 60 ? (
                      <p className="text-yellow-600 font-medium mt-2">You passed, but there's room for improvement.</p>
                    ) : (
                      <p className="text-red-600 font-medium mt-2">You need to study more and try again.</p>
                    )}
                    
                    <ProgressBar percentage={quizScore.percentage} />
                    
                    <button 
                      onClick={resetQuizAttempt}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                  
                  <GradeBadge score={quizScore.percentage} />
                </div>
              </motion.div>
              
              <div className="space-y-6">
                {selectedQuiz.questions.map((question, qIndex) => {
                  const userAnswer = userAnswers[question._id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const isAnimating = animatingQuestion !== null && qIndex <= animatingQuestion;
                  
                  return (
                    <motion.div 
                      key={question._id || qIndex} 
                      className="border rounded p-4 bg-white overflow-hidden"
                      initial={{ height: "auto", opacity: isAnimating ? 1 : 0 }}
                      animate={{ 
                        height: "auto", 
                        opacity: isAnimating ? 1 : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg mb-2">Question {qIndex + 1}: {question.text}</h4>
                        {isAnimating && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="space-y-2 ml-4">
                        {question.options.map((option, oIndex) => {
                          const isUserAnswer = option === userAnswer;
                          const isCorrectAnswer = option === question.correctAnswer;
                          let optionClass = "p-2 rounded ";
                          
                          if (isAnimating) {
                            if (isCorrectAnswer) {
                              optionClass += "bg-green-100 border border-green-400";
                            } else if (isUserAnswer && !isCorrectAnswer) {
                              optionClass += "bg-red-100 border border-red-400";
                            } else {
                              optionClass += "bg-gray-50";
                            }
                          } else {
                            optionClass += "bg-gray-50";
                          }
                          
                          return (
                            <motion.div
                              key={oIndex}
                              className={optionClass}
                              initial={{ x: isAnimating ? (isUserAnswer ? -20 : 0) : 0, opacity: 1 }}
                              animate={{ 
                                x: 0,
                                opacity: 1,
                                backgroundColor: isAnimating ? 
                                  (isCorrectAnswer ? "#dcfce7" : isUserAnswer ? "#fee2e2" : "#f9fafb") 
                                  : "#f9fafb"
                              }}
                              transition={{ duration: 0.5, delay: isUserAnswer ? 0.2 : 0 }}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span> {option}
                              {isAnimating && isCorrectAnswer && 
                                <motion.span 
                                  className="ml-2 text-green-600 font-medium"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                  (Correct Answer)
                                </motion.span>
                              }
                              {isAnimating && isUserAnswer && !isCorrectAnswer && 
                                <motion.span 
                                  className="ml-2 text-red-600 font-medium"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                  (Your Answer)
                                </motion.span>
                              }
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <motion.div 
                className="bg-gray-50 p-4 rounded mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-medium">Created: {new Date(selectedQuiz.createdAt).toLocaleString()}</p>
                <p className="font-medium">Questions: {selectedQuiz.questions.length}</p>
              </motion.div>
              
              <div className="space-y-6">
                {selectedQuiz.questions.map((question, qIndex) => (
                  <motion.div 
                    key={question._id || qIndex} 
                    className="border rounded p-4 bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: qIndex * 0.1 }}
                  >
                    <h4 className="font-bold text-lg mb-2">Question {qIndex + 1}: {question.text}</h4>
                    <div className="space-y-2 ml-4">
                      {question.options.map((option, oIndex) => (
                        <motion.div 
                          key={oIndex} 
                          className={`p-2 rounded cursor-pointer transition-all duration-200 ${
                            userAnswers[question._id] === option 
                              ? 'bg-blue-100 border border-blue-400' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleAnswerSelect(question._id, option)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span> {option}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="mt-6 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button 
                  onClick={submitQuiz}
                  className={`px-6 py-2 rounded text-white transition-all duration-300 flex items-center justify-center
                    ${Object.keys(userAnswers).length === selectedQuiz.questions.length
                      ? 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                  disabled={Object.keys(userAnswers).length !== selectedQuiz.questions.length}
                >
                  <span className="mr-2">Submit Quiz</span>
                  {Object.keys(userAnswers).length === selectedQuiz.questions.length && (
                    <motion.span
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5, repeat: 1, repeatType: "reverse" }}
                                        >
                                          →
                                        </motion.span>
                                      )}
                                    </button>
                                  </motion.div>
                                </div>
                              )}
                            </motion.div>
                          )}
                          
                          {formView === 'create' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <h3 className="text-xl font-semibold mb-4">Create New Quiz</h3>
                              <form onSubmit={handleCreateQuiz}>
                                <div className="mb-4">
                                  <label className="block text-gray-700 font-medium mb-2">Quiz Title</label>
                                  <input
                                    type="text"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newQuiz.title}
                                    onChange={handleQuizTitleChange}
                                    placeholder="Enter quiz title"
                                    required
                                  />
                                </div>
                                
                                {newQuiz.questions.map((question, qIndex) => (
                                  <motion.div 
                                    key={qIndex} 
                                    className="mb-6 p-4 border rounded bg-gray-50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: qIndex * 0.1 }}
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-semibold">Question {qIndex + 1}</h4>
                                      <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    
                                    <div className="mb-4">
                                      <label className="block text-gray-700 font-medium mb-2">Question Text</label>
                                      <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={question.text}
                                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                        placeholder="Enter question text"
                                        required
                                      />
                                    </div>
                                    
                                    <div className="mb-4">
                                      <label className="block text-gray-700 font-medium mb-2">Options</label>
                                      {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex mb-2">
                                          <span className="bg-gray-200 w-8 h-8 flex items-center justify-center rounded-l">
                                            {String.fromCharCode(65 + oIndex)}
                                          </span>
                                          <input
                                            type="text"
                                            className="flex-1 p-2 border border-l-0 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                            required
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div>
                                      <label className="block text-gray-700 font-medium mb-2">Correct Answer</label>
                                      <select
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={question.correctAnswer}
                                        onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                                        required
                                      >
                                        <option value="">Select correct answer</option>
                                        {question.options.map((option, oIndex) => (
                                          <option key={oIndex} value={option} disabled={!option.trim()}>
                                            Option {String.fromCharCode(65 + oIndex)}{option ? `: ${option}` : ' (empty)'}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </motion.div>
                                ))}
                                
                                <div className="flex justify-between mb-6">
                                  <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                  >
                                    Add Question
                                  </button>
                                  
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Creating...
                                      </div>
                                    ) : 'Create Quiz'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          )}
                          
                          {/* Delete confirmation modal */}
                          <DeleteConfirmationModal />
                        </div>
                      );
                    }