import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee`;

// Log configuration on module load
console.log('🔧 API Configuration:', {
  projectId,
  apiUrl: API_URL,
  hasAnonKey: !!publicAnonKey
});

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const fullUrl = `${API_URL}${endpoint}`;
  
  const finalHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };
  
  console.log('📡 API Call:', {
    endpoint,
    url: fullUrl,
    method: options.method || 'GET',
    hasAuth: !!publicAnonKey,
    headers: finalHeaders
  });
  
  console.log('🔐 X-Admin-Password in final headers:', finalHeaders['X-Admin-Password'] || 'NOT SET');

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: finalHeaders,
    });

    console.log('📡 Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      
      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        const error = new Error('Неправильний пароль адміністратора. Будь ласка, введіть правильний пароль.');
        error.name = 'UnauthorizedError';
        throw error;
      }
      
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error);
    
    // Provide more helpful error message
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const helpfulError = new Error(
        `Cannot connect to Edge Function at ${fullUrl}. ` +
        `Please ensure:\n` +
        `1. Edge Function is deployed in Supabase Dashboard\n` +
        `2. Project ID is correct: ${projectId}\n` +
        `3. Check your internet connection\n` +
        `4. Check browser console for CORS errors`
      );
      helpfulError.name = 'EdgeFunctionConnectionError';
      throw helpfulError;
    }
    
    throw error;
  }
}

// ============ SERVICES API ============

export async function getServices() {
  return apiCall('/services');
}

export async function saveService(password: string, service: {
  id?: string;
  title: string;
  description: string;
  features: string[];
}) {
  console.log('saveService called with password:', password ? '***' : 'EMPTY');
  const payload = { password, ...service };
  console.log('Payload keys:', Object.keys(payload));
  return apiCall('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteService(password: string, id: string) {
  return apiCall(`/services/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Password': password,
    },
  });
}

// ============ CONTACTS API ============

export async function getContacts() {
  return apiCall('/contacts');
}

export async function updateContacts(password: string, contacts: {
  phones: Array<{
    number: string;
    viber: boolean;
    telegram: boolean;
    whatsapp: boolean;
  }>;
  email: string;
  address: string;
  schedule: string;
}) {
  return apiCall('/contacts', {
    method: 'POST',
    body: JSON.stringify({ password, ...contacts }),
  });
}

// ============ PRICING API ============

export async function getPricing() {
  return apiCall('/pricing');
}

export async function updatePricing(password: string, category: string, items: any) {
  return apiCall(`/pricing/${category}`, {
    method: 'POST',
    headers: {
      'X-Admin-Password': password,
    },
    body: JSON.stringify({ items }),
  });
}

// ============ REVIEWS API ============

export async function getReviews() {
  return apiCall('/reviews');
}

export async function getAllReviews(password: string) {
  return apiCall('/reviews/all', {
    headers: {
      'X-Admin-Password': password,
    },
  });
}

export async function submitReview(review: {
  name: string;
  text: string;
  rating: number;
  image?: string;
}) {
  return apiCall('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export async function approveReview(password: string, id: string, approved: boolean) {
  return apiCall(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ password, approved }),
  });
}

export async function deleteReview(password: string, id: string) {
  return apiCall(`/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Password': password,
    },
  });
}

// ============ GALLERY API ============

export async function getGallery() {
  return apiCall('/gallery');
}

export async function addGalleryItem(password: string, item: {
  url: string;
  type: 'photo' | 'video';
  description?: string;
}) {
  return apiCall('/gallery', {
    method: 'POST',
    body: JSON.stringify({ password, ...item }),
  });
}

export async function deleteGalleryItem(password: string, id: string) {
  return apiCall(`/gallery/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Password': password,
    },
  });
}

// ============ BLOG API ============

export async function getBlogPosts() {
  return apiCall('/blog');
}

export async function getAllBlogPosts(password: string) {
  return apiCall('/blog/all', {
    headers: {
      'X-Admin-Password': password,
    },
  });
}

export async function getBlogPost(id: string) {
  return apiCall(`/blog/${id}`);
}

export async function saveBlogPost(password: string, post: {
  id?: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  published: boolean;
}) {
  return apiCall('/blog', {
    method: 'POST',
    body: JSON.stringify({ password, ...post }),
  });
}

export async function deleteBlogPost(password: string, id: string) {
  return apiCall(`/blog/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Password': password,
    },
  });
}

// ============ BRANDING API ============

export async function getBranding() {
  return apiCall('/branding');
}

export async function updateBranding(password: string, branding: {
  logo: string;
  companyName: string;
}) {
  return apiCall('/branding', {
    method: 'POST',
    body: JSON.stringify({ password, ...branding }),
  });
}

// ============ SOCIAL MEDIA API ============

export async function getSocialMedia() {
  return apiCall('/social');
}

export async function updateSocialMedia(password: string, social: {
  facebook: { url: string; enabled: boolean };
  instagram: { url: string; enabled: boolean };
}) {
  return apiCall('/social', {
    method: 'POST',
    body: JSON.stringify({ password, ...social }),
  });
}

// ============ ORDERS API ============

export async function createOrder(orderData: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
}) {
  return apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function getOrders(password: string) {
  console.log('🔐 getOrders called with password:', password ? `"${password}"` : 'EMPTY');
  console.log('🔐 Password length:', password?.length || 0);
  console.log('🔐 Password type:', typeof password);
  
  return apiCall('/orders', {
    headers: {
      'X-Admin-Password': password,
    },
  });
}

export async function updateOrderStatus(password: string, orderId: string, status: string) {
  return apiCall(`/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Password': password,
    },
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(password: string, orderId: string) {
  return apiCall(`/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Password': password,
    },
  });
}

// ============ DISCOUNT API ============

export async function getDiscount() {
  return apiCall('/discount');
}

export async function updateDiscount(password: string, discount: {
  enabled: boolean;
  percentage: number;
  description: string;
}) {
  return apiCall('/discount', {
    method: 'POST',
    body: JSON.stringify({ password, ...discount }),
  });
}

// ============ HERO IMAGES API ============

export async function getHeroImages() {
  return apiCall('/hero-images');
}

export async function updateHeroImages(password: string, images: {
  mainImage: string;
  secondaryImage: string;
}) {
  return apiCall('/hero-images', {
    method: 'POST',
    body: JSON.stringify({ password, ...images }),
  });
}

// ============ PASSWORD VALIDATION API ============

export async function validatePassword(password: string) {
  console.log('🔐 validatePassword called with password:', password ? '***' : 'EMPTY');
  return apiCall('/validate-password', {
    headers: {
      'X-Admin-Password': password,
    },
  });
}
