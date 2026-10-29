import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchQuestions = createAsyncThunk('quiz/fetchQuestions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/questions');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch questions');
  }
});

export const addQuestion = createAsyncThunk('quiz/addQuestion', async (questionData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/questions', questionData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add question');
  }
});

export const updateQuestion = createAsyncThunk('quiz/updateQuestion', async ({ id, questionData }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put('/questions/' + id, questionData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update question');
  }
});

export const deleteQuestion = createAsyncThunk('quiz/deleteQuestion', async (id, { rejectWithValue }) => {
  try {
    await axiosClient.delete('/questions/' + id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete question');
  }
});

// Quiz Thunks
export const fetchQuizzes = createAsyncThunk('quiz/fetchQuizzes', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/quizzes');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch quizzes');
  }
});

export const createQuiz = createAsyncThunk('quiz/createQuiz', async (quizData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/quizzes', quizData);
    return response.data.quiz || response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create quiz');
  }
});

export const updateQuiz = createAsyncThunk('quiz/updateQuiz', async ({ id, quizData }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put('/quizzes/' + id, quizData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update quiz');
  }
});

export const deleteQuiz = createAsyncThunk('quiz/deleteQuiz', async (id, { rejectWithValue }) => {
  try {
    await axiosClient.delete('/quizzes/' + id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete quiz');
  }
});

export const addQuestionToQuiz = createAsyncThunk('quiz/addQuestionToQuiz', async ({ quizId, questionId }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(`/quizzes/${quizId}/question`, { questionId });
    return response.data.quiz || response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add question to quiz');
  }
});

export const removeQuestionFromQuiz = createAsyncThunk('quiz/removeQuestionFromQuiz', async ({ quizId, questionId }, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/quizzes/${quizId}/question/${questionId}`);
    return { quizId, questionId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove question from quiz');
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    questions: [],
    quizzes: [],
    selectedQuiz: null,
    loading: false,
    quizLoading: false,
    error: null,
    // State for taking Quiz
    currentQuestionIndex: 0,
    selectedOptionIndex: null,
    score: 0,
    quizCompleted: false
  },
  reducers: {
    selectOption: (state, action) => {
      state.selectedOptionIndex = action.payload;
    },
    startSelectedQuiz: (state, action) => {
      const quiz = action.payload;
      state.selectedQuiz = quiz;
      state.questions = quiz.questions || [];
      state.currentQuestionIndex = 0;
      state.selectedOptionIndex = null;
      state.score = 0;
      state.quizCompleted = false;
    },
    exitQuiz: (state) => {
      state.selectedQuiz = null;
      state.currentQuestionIndex = 0;
      state.selectedOptionIndex = null;
      state.score = 0;
      state.quizCompleted = false;
    },
    submitAnswer: (state) => {
      if (state.selectedOptionIndex === null) return;

      const currentQ = state.questions[state.currentQuestionIndex];
      if (currentQ && state.selectedOptionIndex === currentQ.correctAnswerIndex) {
        state.score += 1;
      }

      if (state.currentQuestionIndex + 1 < state.questions.length) {
        state.currentQuestionIndex += 1;
        state.selectedOptionIndex = null;
      } else {
        state.quizCompleted = true;
      }
    },
    restartQuiz: (state) => {
      state.currentQuestionIndex = 0;
      state.selectedOptionIndex = null;
      state.score = 0;
      state.quizCompleted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload);
      })
      // Update
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload);
      })
      // Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.quizLoading = true;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.quizLoading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.quizLoading = false;
        state.error = action.payload;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
      })
      .addCase(addQuestionToQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })
      .addCase(removeQuestionFromQuiz.fulfilled, (state, action) => {
        const quiz = state.quizzes.find(q => q._id === action.payload.quizId);
        if (quiz) {
          quiz.questions = quiz.questions.filter(q => (q._id || q) !== action.payload.questionId);
        }
      });
  }
});

export const { selectOption, submitAnswer, restartQuiz, startSelectedQuiz, exitQuiz } = quizSlice.actions;
export default quizSlice.reducer;