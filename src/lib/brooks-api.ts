const DEFAULT_API_BASE_URL = 'https://febackend.site/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }
    
    // Extract error message from various formats
    let message = `HTTP ${response.status}`;
    if (errorBody) {
      if (errorBody.detail) {
        message = errorBody.detail;
      } else if (typeof errorBody === 'object') {
        // Handle field-specific errors like {"car": ["This car already has an invoice."]}
        const firstKey = Object.keys(errorBody)[0];
        if (firstKey && errorBody[firstKey]) {
          const errorValue = errorBody[firstKey];
          message = Array.isArray(errorValue) ? errorValue[0] : errorValue;
        } else {
          message = JSON.stringify(errorBody);
        }
      } else {
        message = String(errorBody);
      }
    }
    
    throw new Error(message || 'API request failed');
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
};

export const api = {
  // Authentication
  auth: {
    login: (username: string, password: string) =>
      fetchAPI('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () =>
      fetchAPI('/auth/logout/', { method: 'POST' }),
    getCurrentUser: () =>
      fetchAPI('/auth/me/', { method: 'GET' }),
  },

  // Customers
  customers: {
    list: (search?: string) => {
      const query = search ? `?search=${search}` : '';
      return fetchAPI(`/customers/${query}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/customers/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/customers/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/customers/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Cars
  cars: {
    list: (filters?: Record<string, any>) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return fetchAPI(`/cars/?${params}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/cars/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/cars/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/cars/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/cars/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    generatePortalToken: (id: string) =>
      fetchAPI(`/cars/${id}/generate_portal_token/`, {
        method: 'POST',
      }),
    getCustomerPortal: (token: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL}/customer-portal/${token}/`).then(r => r.json()),
  },

  // Visits
  visits: {
    list: (carId?: string) => {
      const params = carId ? `?car_id=${carId}` : '';
      return fetchAPI(`/visits/${params}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/visits/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/visits/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    activate: (id: string) =>
      fetchAPI(`/visits/${id}/activate/`, {
        method: 'POST',
      }),
    complete: (id: string) =>
      fetchAPI(`/visits/${id}/complete/`, {
        method: 'POST',
      }),
  },

  // Diagnostics
  diagnostics: {
    create: (carId: string, data: any) =>
      fetchAPI('/diagnostics/', {
        method: 'POST',
        body: JSON.stringify({ car: carId, ...data }),
      }),
    get: (id: string) =>
      fetchAPI(`/diagnostics/${id}/`, { method: 'GET' }),
    update: (id: string, data: any) =>
      fetchAPI(`/diagnostics/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Inventory Items
  inventory: {
    list: (search?: string) => {
      const query = search ? `?search=${search}` : '';
      return fetchAPI(`/inventory/${query}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/inventory/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/inventory/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/inventory/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    statistics: () =>
      fetchAPI('/inventory/statistics/', { method: 'GET' }),
    on_credit: () =>
      fetchAPI('/inventory/on_credit/', { method: 'GET' }),
    pay_credit: (id: string, amount: number) =>
      fetchAPI(`/inventory/${id}/pay_credit/`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },

  // Car Inventory Assignments
  carInventory: {
    list: (carId: string) =>
      fetchAPI(`/car-inventory/?car=${carId}`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/car-inventory/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/car-inventory/${id}/`, { method: 'DELETE' }),
  },

  // Invoices
  invoices: {
    list: (filters?: Record<string, any>) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return fetchAPI(`/invoices/?${params}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/invoices/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/invoices/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/invoices/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    approve: (id: string) =>
      fetchAPI(`/invoices/${id}/approve/`, { method: 'POST' }),
    discharge: (id: string) =>
      fetchAPI(`/invoices/${id}/discharge/`, { method: 'POST' }),
    reopen: (id: string) =>
      fetchAPI(`/invoices/${id}/reopen/`, { method: 'POST' }),
  },

  // Payments
  payments: {
    list: (filters?: Record<string, any>) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return fetchAPI(`/payments/?${params}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/payments/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/payments/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Vendors
  vendors: {
    list: () =>
      fetchAPI('/vendors/', { method: 'GET' }),
    get: (id: string) =>
      fetchAPI(`/vendors/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/vendors/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Outsourced Services
  outsourcedServices: {
    list: () =>
      fetchAPI('/outsourced-services/', { method: 'GET' }),
    get: (id: string) =>
      fetchAPI(`/outsourced-services/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/outsourced-services/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    unpaid: () =>
      fetchAPI('/outsourced-services/unpaid/', { method: 'GET' }),
    makePayment: (id: string, amount: number) =>
      fetchAPI(`/outsourced-services/${id}/make_payment/`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },

  // Dashboard
  dashboard: {
    statistics: () =>
      fetchAPI('/dashboard/statistics/', { method: 'GET' }),
    managersView: () =>
      fetchAPI('/dashboard/manager/', { method: 'GET' }),
  },

  // Notifications
  notifications: {
    list: () =>
      fetchAPI('/notifications/', { method: 'GET' }),
    markAsRead: (id: string) =>
      fetchAPI(`/notifications/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ read: true }),
      }),
  },

  // Reports
  reports: {
    financial: (startDate: string, endDate: string) =>
      fetchAPI(`/reports/financial/?start_date=${startDate}&end_date=${endDate}`, {
        method: 'GET',
      }),
    workshop: (startDate: string, endDate: string) =>
      fetchAPI(`/reports/workshop/?start_date=${startDate}&end_date=${endDate}`, {
        method: 'GET',
      }),
    monthlyFinancial: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      const query = params.toString() ? `?${params}` : '';
      return fetchAPI(`/reports/monthly-financial/${query}`, { method: 'GET' });
    },
    inventoryUsage: (days?: number) => {
      const query = days ? `?days=${days}` : '';
      return fetchAPI(`/reports/inventory-usage/${query}`, { method: 'GET' });
    },
    routineServices: () =>
      fetchAPI('/reports/routine-services/', { method: 'GET' }),
    customerDebt: () =>
      fetchAPI('/reports/customer-debt/', { method: 'GET' }),
    vendorPayments: () =>
      fetchAPI('/reports/vendor-payments/', { method: 'GET' }),
  },

  // Customer Feedback
  feedback: {
    list: (customerId?: string) => {
      const query = customerId ? `?customer_id=${customerId}` : '';
      return fetchAPI(`/feedback/${query}`, { method: 'GET' });
    },
    get: (id: string) =>
      fetchAPI(`/feedback/${id}/`, { method: 'GET' }),
    create: (data: any) =>
      fetchAPI('/feedback/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/feedback/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
};

export default api;
