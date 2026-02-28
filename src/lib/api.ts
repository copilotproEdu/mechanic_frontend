// API configuration and client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to make API requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      // Non-JSON error response
    }
    const message = (errorBody && (errorBody.detail || JSON.stringify(errorBody))) || `HTTP ${response.status}`;
    throw new Error(message || 'API request failed');
  }

  // Handle empty responses (204 No Content, etc.)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
};

// API client object with all endpoints
export const api = {
  // Auth
  auth: {
    login: (credentials: { username: string; password: string }) =>
      fetchAPI('/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
    refresh: (refresh: string) =>
      fetchAPI('/auth/refresh/', { method: 'POST', body: JSON.stringify({ refresh }) }),
  },

  // Students
  students: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/students/${query}`);
    },
    get: (id: string) => fetchAPI(`/students/${id}/`),
    create: (data: any) => fetchAPI('/students/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      fetchAPI(`/students/${id}/`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
      }),
    delete: (id: string) => fetchAPI(`/students/${id}/`, { method: 'DELETE' }),
    statistics: () => fetchAPI('/students/statistics/'),
    attendanceSummary: (id: string) => fetchAPI(`/students/${id}/attendance_summary/`),
  },

  // Teachers
  teachers: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/teachers/${query}`);
    },
    get: (id: string) => fetchAPI(`/teachers/${id}/`),
    create: (data: any) => fetchAPI('/teachers/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => {
      // Check if data is FormData - if so, use PATCH and don't stringify it
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        return fetchAPI(`/teachers/${id}/`, { method: 'PATCH', body: data });
      }
      // For JSON data, use PATCH for partial updates
      return fetchAPI(`/teachers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete: (id: string) => fetchAPI(`/teachers/${id}/`, { method: 'DELETE' }),
    statistics: () => fetchAPI('/teachers/statistics/'),
  },

  // Classes
  classes: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/classes/${query}`);
    },
    get: (id: string) => fetchAPI(`/classes/${id}/`),
    create: (data: any) => fetchAPI('/classes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/classes/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/classes/${id}/`, { method: 'DELETE' }),
    statistics: () => fetchAPI('/classes/statistics/'),
    students: (id: string) => fetchAPI(`/classes/${id}/students/`),
    crecheStudents: () => fetchAPI('/classes/creche_students/'),
    promoteStudents: () => fetchAPI('/classes/promote_students/', { method: 'POST', body: JSON.stringify({}) }),
    promoteCreche: (studentIds: number[]) => fetchAPI('/classes/promote_creche_students/', { method: 'POST', body: JSON.stringify({ student_ids: studentIds }) }),
  },

  // Subjects
  subjects: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/subjects/${query}`);
    },
    get: (id: string) => fetchAPI(`/subjects/${id}/`),
    create: (data: any) => fetchAPI('/subjects/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/subjects/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/subjects/${id}/`, { method: 'DELETE' }),
    statistics: () => fetchAPI('/subjects/statistics/'),
    classSubjects: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/class-subjects/${query}`);
      },
      create: (data: any) => fetchAPI('/class-subjects/', { method: 'POST', body: JSON.stringify(data) }),
      bulkCreate: (assignments: any[]) => 
        fetchAPI('/class-subjects/bulk_create/', { method: 'POST', body: JSON.stringify({ assignments }) }),
    },
  },

  // Attendance
  attendance: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/attendance/${query}`);
    },
    get: (id: string) => fetchAPI(`/attendance/${id}/`),
    create: (data: any) => fetchAPI('/attendance/', { method: 'POST', body: JSON.stringify(data) }),
    bulkMark: (data: any[]) => fetchAPI('/attendance/bulk_mark/', { method: 'POST', body: JSON.stringify({ attendance: data }) }),
    todayStats: () => fetchAPI('/attendance/today_stats/'),
    overallStats: () => fetchAPI('/attendance/overall_stats/'),
  },

  // Fees
  fees: {
    feedingFees: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/feeding-fees/${query}`);
      },
      get: (id: string) => fetchAPI(`/feeding-fees/${id}/`),
      create: (data: any) => fetchAPI('/feeding-fees/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => fetchAPI(`/feeding-fees/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => fetchAPI(`/feeding-fees/${id}/`, { method: 'DELETE' }),
    },
    studentFeedingFees: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/student-feeding-fees/${query}`);
      },
      get: (id: string) => fetchAPI(`/student-feeding-fees/${id}/`),
      create: (data: any) => fetchAPI('/student-feeding-fees/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => fetchAPI(`/student-feeding-fees/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => fetchAPI(`/student-feeding-fees/${id}/`, { method: 'DELETE' }),
      fee_owers: () => fetchAPI('/student-feeding-fees/fee_owers/'),
    },
    structures: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/fee-structures/${query}`);
      },
      create: (data: any) => fetchAPI('/fee-structures/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => fetchAPI(`/fee-structures/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => fetchAPI(`/fee-structures/${id}/`, { method: 'DELETE' }),
    },
    studentFees: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/student-fees/${query}`);
      },
      get: (id: string) => fetchAPI(`/student-fees/${id}/`),
      create: (data: any) => fetchAPI('/student-fees/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => fetchAPI(`/student-fees/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => fetchAPI(`/student-fees/${id}/`, { method: 'DELETE' }),
      statistics: () => fetchAPI('/student-fees/statistics/'),
      fee_owers: () => fetchAPI('/student-fees/fee_owers/'),
    },
    payments: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/fee-payments/${query}`);
      },
      create: (data: any) => fetchAPI('/fee-payments/', { method: 'POST', body: JSON.stringify(data) }),
    },
    feedingFeePayments: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/feeding-fee-payments/${query}`);
      },
      create: (data: any) => fetchAPI('/feeding-fee-payments/', { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  // Exams
  exams: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/exams/${query}`);
    },
    create: (data: any) => fetchAPI('/exams/', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Results
  results: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/results/${query}`);
    },
    create: (data: any) => fetchAPI('/results/', { method: 'POST', body: JSON.stringify(data) }),
    results: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/results/${query}`);
      },
      create: (data: any) => fetchAPI('/results/', { method: 'POST', body: JSON.stringify(data) }),
    },
    exams: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/exams/${query}`);
      },
      create: (data: any) => fetchAPI('/exams/', { method: 'POST', body: JSON.stringify(data) }),
    },
    classAverage: (params: Record<string, any>) => {
      const query = '?' + new URLSearchParams(params).toString();
      return fetchAPI(`/results/class_average/${query}`);
    },
    reportCards: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/report-cards/${query}`);
      },
      get: (id: string) => fetchAPI(`/report-cards/${id}/`),
      detailed: (id: string) => fetchAPI(`/report-cards/${id}/detailed/`),
      calculatePositions: (data: any) => fetchAPI('/report-cards/calculate_positions/', { method: 'POST', body: JSON.stringify(data) }),
    },
    termReports: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/term-reports/${query}`);
      },
      get: (id: string) => fetchAPI(`/term-reports/${id}/`),
      create: (data: any) => fetchAPI('/term-reports/', { method: 'POST', body: JSON.stringify(data) }),
      createReport: (data: any) => fetchAPI('/term-reports/create_report/', { method: 'POST', body: JSON.stringify(data) }),
      submit: (id: string) => fetchAPI(`/term-reports/${id}/submit/`, { method: 'POST' }),
      exportExcel: (data: any) => {
        // For Excel download, we need to handle the blob response
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/term-reports/export_excel/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to download Excel: ${response.statusText}`);
          }
          return response.blob();
        });
      },
      exportPdf: (data: any) => {
        // For PDF download/preview
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/term-reports/export_pdf/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
          }
          return response.blob();
        });
      },
      exportStudentPdf: (data: any) => {
        // For individual student PDF report export
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/term-reports/export_student_pdf/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
          }
          return response.blob();
        });
      },
    },
    termReportEntries: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/term-report-entries/${query}`);
      },
      bulkCreate: (data: any) => {
        console.log('API: Sending bulk create request with data:', data);
        return fetchAPI('/term-report-entries/bulk_create/', { method: 'POST', body: JSON.stringify(data) });
      },
      deleteAll: () => fetchAPI('/term-report-entries/delete_all/', { method: 'POST' }),
    },
    academicTerms: {
      list: (params?: Record<string, any>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchAPI(`/academic-terms/${query}`);
      },
      get: (id: string) => fetchAPI(`/academic-terms/${id}/`),
      create: (data: any) => fetchAPI('/academic-terms/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => fetchAPI(`/academic-terms/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => fetchAPI(`/academic-terms/${id}/`, { method: 'DELETE' }),
      startTerm: (id: string, data?: any) => {
        const body = data ? JSON.stringify(data) : undefined;
        return fetchAPI(`/academic-terms/${id}/start_term/`, { method: 'POST', body });
      },
      endTerm: (id: string, data?: any) => {
        const body = data ? JSON.stringify(data) : undefined;
        return fetchAPI(`/academic-terms/${id}/end_term/`, { method: 'POST', body });
      },
      activeTerms: () => fetchAPI('/academic-terms/active_terms/'),
      availableTerms: () => fetchAPI('/academic-terms/available_terms/'),
    },
  },

  // Timetable
  timetable: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/timetable/${query}`);
    },
    create: (data: any) => fetchAPI('/timetable/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: any) => fetchAPI(`/timetable/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/timetable/${id}/`, { method: 'DELETE' }),
    byClass: (params: Record<string, any>) => {
      const query = '?' + new URLSearchParams(params).toString();
      return fetchAPI(`/timetable/by_class/${query}`);
    },
    byTeacher: (params: Record<string, any>) => {
      const query = '?' + new URLSearchParams(params).toString();
      return fetchAPI(`/timetable/by_teacher/${query}`);
    },
    timeSlots: () => fetchAPI('/time-slots/'),
  },

  // Users
  users: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/users/${query}`);
    },
    get: (id: string) => fetchAPI(`/users/${id}/`),
    create: (data: any) => fetchAPI('/users/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/users/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/users/${id}/`, { method: 'DELETE' }),
    me: () => fetchAPI('/users/me/'),
    statistics: () => fetchAPI('/users/statistics/'),
    changePassword: (data: { old_password?: string; new_password: string; new_password_confirm: string }) =>
      fetchAPI('/users/change_password/', { method: 'POST', body: JSON.stringify(data) }),
    myClasses: () => fetchAPI('/users/my_classes/'),
    myTeachingAssignments: () => fetchAPI('/users/my_teaching_assignments/'),
  },

  // Departments
  departments: {
    list: () => fetchAPI('/departments/'),
    create: (data: any) => fetchAPI('/departments/', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Enrollments
  enrollments: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/enrollments/${query}`);
    },
    create: (data: any) => fetchAPI('/enrollments/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: any) => fetchAPI(`/enrollments/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    createWithStudent: (data: any) =>
      fetchAPI('/enrollments/create_with_student/', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
      }),
  },

  // Audit Logs
  auditLogs: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/audit-logs/${query}`);
    },
  },
};

export default api;
