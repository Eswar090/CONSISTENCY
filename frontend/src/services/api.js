import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const taskService = {
  getTasksByDate: async (date) => {
    const response = await api.get(`/tasks?date=${date}`);
    return response.data;
  },
  
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/complete`, { status });
    return response.data;
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
  },

  getDailySummary: async (date) => {
    const response = await api.get(`/analytics/daily?date=${date}`);
    return response.data;
  }
};

export const habitService = {
  getActiveHabits: async () => {
    const response = await api.get('/habits');
    return response.data;
  },
  
  createHabit: async (habitData) => {
    const response = await api.post('/habits', habitData);
    return response.data;
  },

  updateHabit: async (id, habitData) => {
    const response = await api.put(`/habits/${id}`, habitData);
    return response.data;
  },

  archiveHabit: async (id) => {
    await api.patch(`/habits/${id}/archive`);
  },

  getHabitLogs: async (startDate, endDate) => {
    const response = await api.get(`/habits/logs?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  toggleHabitLog: async (habitId, date, completed) => {
    const response = await api.post(`/habits/${habitId}/logs`, { date, completed });
    return response.data;
  }
};

export const consistencyService = {
  getDailyConsistency: async (date) => {
    const response = await api.get(`/consistency/daily?date=${date}`);
    return response.data;
  },

  getWeeklyConsistency: async (startDate) => {
    const response = await api.get(`/consistency/weekly?startDate=${startDate}`);
    return response.data;
  },

  getMonthlyConsistency: async (year, month) => {
    const response = await api.get(`/consistency/monthly?year=${year}&month=${month}`);
    return response.data;
  },

  getHabitStats: async (habitId) => {
    const response = await api.get(`/consistency/habits/${habitId}`);
    return response.data;
  }
};

export const analyticsService = {
  getAnalytics: async (startDate, endDate) => {
    const response = await api.get(`/analytics?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
};

export const focusService = {
  getTodayTasks: async () => {
    const response = await api.get('/focus/tasks/today');
    return response.data;
  },
  getTodaySessions: async () => {
    const response = await api.get('/focus/sessions/today');
    return response.data;
  },
  startSession: async (sessionData) => {
    const response = await api.post('/focus/sessions', sessionData);
    return response.data;
  },
  completeSession: async (id) => {
    const response = await api.put(`/focus/sessions/${id}/complete`);
    return response.data;
  },
  skipSession: async (id) => {
    const response = await api.put(`/focus/sessions/${id}/skip`);
    return response.data;
  },
  getTodayStats: async () => {
    const response = await api.get('/focus/stats/today');
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/focus/settings');
    return response.data;
  },
  updateSettings: async (settingsData) => {
    const response = await api.put('/focus/settings', settingsData);
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  }
};

export const reminderService = {
  getReminders: async () => {
    const response = await api.get('/reminders');
    return response.data;
  },
  getReminderForTask: async (taskId) => {
    const response = await api.get(`/reminders/task/${taskId}`);
    return response.data;
  },
  getReminderForHabit: async (habitId) => {
    const response = await api.get(`/reminders/habit/${habitId}`);
    return response.data;
  },
  createOrUpdateReminder: async (reminderData) => {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  },
  updateReminder: async (id, reminderData) => {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  },
  deleteReminder: async (id) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  }
};

export const goalService = {
  getGoals: () => api.get('/goals'),
  getGoalById: (id) => api.get(`/goals/${id}`),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  updateGoalStatus: (id, data) => api.patch(`/goals/${id}/status`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};

export const smartPlanService = {
  getSmartPlan: (date) => api.get(date ? `/smart-plan?date=${date}` : '/smart-plan')
};

export const aiService = {
  chat: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};

export const smartAlertService = {
  getSettings: () => api.get('/smart-alerts/settings'),
  updateSettings: (data) => api.put('/smart-alerts/settings', data),
  requestVerification: (mobileNumber) => api.post('/smart-alerts/phone/request-verification', { mobileNumber }),
  verifyPhone: (otp) => api.post('/smart-alerts/phone/verify', { otp }),
  sendTestSms: () => api.post('/smart-alerts/test'),
  getHistory: () => api.get('/smart-alerts/history'),
};

export default api;



