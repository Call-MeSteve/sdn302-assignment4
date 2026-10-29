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

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    questions: [],
    loading: false,
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
      });
  }
});

export const { selectOption, submitAnswer, restartQuiz } = quizSlice.actions;
export default quizSlice.reducer;