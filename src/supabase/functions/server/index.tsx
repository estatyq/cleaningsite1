import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Password"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Admin password management with KV store
const DEFAULT_ADMIN_PASSWORD = "admin123"; // Default password
let ADMIN_PASSWORD = DEFAULT_ADMIN_PASSWORD;

// Helper to always get fresh password from KV store
async function getAdminPassword(): Promise<string> {
  try {
    const storedPassword = await kv.get("admin_password");
    if (storedPassword && typeof storedPassword === 'string') {
      return storedPassword;
    }
    return DEFAULT_ADMIN_PASSWORD;
  } catch (error) {
    console.log("⚠️ Error loading password from KV:", error);
    return DEFAULT_ADMIN_PASSWORD;
  }
}

// Initialize password from KV store on startup
async function initializePassword() {
  try {
    ADMIN_PASSWORD = await getAdminPassword();
    console.log("🔐 Admin password initialized:", ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD ? "default" : "custom");
  } catch (error) {
    console.log("⚠️ Error initializing password:", error);
  }
}

// Call initialization immediately
await initializePassword();

const checkAuth = async (password: string | undefined) => {
  if (!password) {
    console.log("⚠️ Auth check failed: No password provided");
    return false;
  }
  
  // Always fetch the latest password from KV store
  const currentPassword = await getAdminPassword();
  const isValid = password === currentPassword;
  
  if (!isValid) {
    console.log(`⚠️ Пароль не співпадає. Отримано: "${password}", Очікується: "${currentPassword}"`);
  } else {
    console.log("✅ Авторизація успішна");
  }
  return isValid;
};

// Health check endpoint
app.get("/make-server-4e0b1fee/health", (c) => {
  return c.json({ status: "ok" });
});

// Check password endpoint (for diagnostics)
app.post("/make-server-4e0b1fee/check-password", async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;
    
    const isValid = await checkAuth(password);
    
    return c.json({ 
      success: true, 
      valid: isValid,
      message: isValid ? "Password is correct" : "Password is incorrect"
    });
  } catch (error) {
    console.log("Error checking password:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ SERVICES ROUTES ============

// Get all services
app.get("/make-server-4e0b1fee/services", async (c) => {
  try {
    const data = await kv.getByPrefix("service:");
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching services:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create/update service
app.post("/make-server-4e0b1fee/services", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Service POST - Body keys:", Object.keys(body));
    console.log("Service POST - Has password:", !!body.password);
    const { password, id, title, description, features } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const serviceId = id || Date.now().toString();
    const service = {
      id: serviceId,
      title,
      description,
      features: features || [],
      createdAt: id ? (await kv.get(`service:${id}`))?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`service:${serviceId}`, service);
    return c.json({ success: true, data: service });
  } catch (error) {
    console.log("Error saving service:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete service
app.delete("/make-server-4e0b1fee/services/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const password = c.req.header("X-Admin-Password");

    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    await kv.del(`service:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting service:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ CONTACTS ROUTES ============

// Get contact info
app.get("/make-server-4e0b1fee/contacts", async (c) => {
  try {
    const data = await kv.get("contacts");
    return c.json({ success: true, data: data || {
      phones: [],
      email: "info@bliskcleaning.ua",
      address: "Київ, Україна",
      schedule: "Пн-Нд: 24/7"
    }});
  } catch (error) {
    console.log("Error fetching contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update contact info
app.post("/make-server-4e0b1fee/contacts", async (c) => {
  try {
    const body = await c.req.json();
    const { password, ...contactData } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    await kv.set("contacts", contactData);
    return c.json({ success: true, data: contactData });
  } catch (error) {
    console.log("Error updating contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});



// ============ REVIEWS ROUTES ============

// Get all approved reviews
app.get("/make-server-4e0b1fee/reviews", async (c) => {
  try {
    const allReviews = await kv.getByPrefix("review:");
    const approved = allReviews.filter((r: any) => r.approved);
    return c.json({ success: true, data: approved });
  } catch (error) {
    console.log("Error fetching reviews:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all reviews (admin only)
app.get("/make-server-4e0b1fee/reviews/all", async (c) => {
  try {
    const password = c.req.header("X-Admin-Password");
    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const data = await kv.getByPrefix("review:");
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching all reviews:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit a new review
app.post("/make-server-4e0b1fee/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { name, text, rating, image } = body;

    const review = {
      id: Date.now().toString(),
      name,
      text,
      rating,
      image: (image && image.trim() !== '') ? image.trim() : null,
      approved: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`review:${review.id}`, review);
    console.log('Review created:', review);
    return c.json({ success: true, data: review });
  } catch (error) {
    console.log("Error submitting review:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Approve/reject review (admin only)
app.put("/make-server-4e0b1fee/reviews/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { password, approved } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const review = await kv.get(`review:${id}`);
    if (!review) {
      return c.json({ success: false, error: "Review not found" }, 404);
    }

    const updated = { ...review, approved };
    await kv.set(`review:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log("Error updating review:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete review (admin only)
app.delete("/make-server-4e0b1fee/reviews/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const password = c.req.header("X-Admin-Password");

    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    await kv.del(`review:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting review:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Approve/reject review via POST (admin only)
app.post("/make-server-4e0b1fee/reviews/:id/approve", async (c) => {
  try {
    const { id } = c.req.param();
    const password = c.req.header("X-Admin-Password");
    const body = await c.req.json();
    const { approved } = body;

    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const review = await kv.get(`review:${id}`);
    if (!review) {
      return c.json({ success: false, error: "Review not found" }, 404);
    }

    const updated = { ...review, approved };
    await kv.set(`review:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log("Error approving review:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ GALLERY ROUTES ============

// Get all gallery items
app.get("/make-server-4e0b1fee/gallery", async (c) => {
  try {
    const data = await kv.getByPrefix("gallery:");
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching gallery:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add gallery item (admin only)
app.post("/make-server-4e0b1fee/gallery", async (c) => {
  try {
    const body = await c.req.json();
    const { url, type, description } = body;
    const password = c.req.header("X-Admin-Password");

    console.log(`🖼️ Gallery POST request - type: ${type}, has password: ${!!password}`);

    if (!(await checkAuth(password || ""))) {
      console.log("❌ Gallery add failed: Unauthorized");
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const item = {
      id: Date.now().toString(),
      url: (url && url.trim() !== '') ? url.trim() : '',
      type, // 'photo' or 'video'
      description: description || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`gallery:${item.id}`, item);
    console.log('✅ Gallery item added:', { id: item.id, type: item.type });
    return c.json({ success: true, data: item });
  } catch (error) {
    console.log("❌ Error adding gallery item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete gallery item (admin only)
app.delete("/make-server-4e0b1fee/gallery/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const password = c.req.header("X-Admin-Password");

    console.log(`🗑️ Gallery DELETE request - id: ${id}, has password: ${!!password}`);

    if (!(await checkAuth(password || ""))) {
      console.log("❌ Gallery delete failed: Unauthorized");
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    await kv.del(`gallery:${id}`);
    console.log(`✅ Gallery item deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("❌ Error deleting gallery item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ BLOG ROUTES ============

// Get all published blog posts
app.get("/make-server-4e0b1fee/blog", async (c) => {
  try {
    const allPosts = await kv.getByPrefix("blog:");
    const published = allPosts.filter((p: any) => p.published);
    return c.json({ success: true, data: published });
  } catch (error) {
    console.log("Error fetching blog posts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all blog posts (admin only)
app.get("/make-server-4e0b1fee/blog/all", async (c) => {
  try {
    const password = c.req.header("X-Admin-Password");
    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const data = await kv.getByPrefix("blog:");
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching all blog posts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single blog post
app.get("/make-server-4e0b1fee/blog/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const post = await kv.get(`blog:${id}`);
    
    if (!post) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    return c.json({ success: true, data: post });
  } catch (error) {
    console.log("Error fetching blog post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create/update blog post (admin only)
app.post("/make-server-4e0b1fee/blog", async (c) => {
  try {
    const body = await c.req.json();
    const { password, id, title, content, image, video, published } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const postId = id || Date.now().toString();
    const post = {
      id: postId,
      title,
      content,
      image: (image && image.trim() !== '') ? image.trim() : null,
      video: (video && video.trim() !== '') ? video.trim() : null,
      published: published || false,
      createdAt: id ? (await kv.get(`blog:${id}`))?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`blog:${postId}`, post);
    console.log('Blog post saved:', post);
    return c.json({ success: true, data: post });
  } catch (error) {
    console.log("Error saving blog post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update blog post (admin only)
app.put("/make-server-4e0b1fee/blog/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const password = c.req.header("X-Admin-Password");

    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { title, content, image, video, published } = body;

    const existingPost = await kv.get(`blog:${id}`);
    if (!existingPost) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    const post = {
      id,
      title,
      content,
      image: image || null,
      video: video || null,
      published: published !== undefined ? published : false,
      createdAt: existingPost.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`blog:${id}`, post);
    return c.json({ success: true, data: post });
  } catch (error) {
    console.log("Error updating blog post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete blog post (admin only)
app.delete("/make-server-4e0b1fee/blog/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const password = c.req.header("X-Admin-Password");

    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    await kv.del(`blog:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting blog post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ BRANDING ROUTES ============

// Get branding info (logo and company name)
app.get("/make-server-4e0b1fee/branding", async (c) => {
  try {
    const data = await kv.get("branding");
    return c.json({ 
      success: true, 
      data: data || {
        logo: "",
        companyName: "БлискКлінінг"
      }
    });
  } catch (error) {
    console.log("Error fetching branding:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update branding info (admin only)
app.post("/make-server-4e0b1fee/branding", async (c) => {
  try {
    const body = await c.req.json();
    const { password, logo, companyName } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const brandingData = {
      logo: logo || "",
      companyName: companyName || "БлискКлінінг"
    };

    await kv.set("branding", brandingData);
    return c.json({ success: true, data: brandingData });
  } catch (error) {
    console.log("Error updating branding:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ BENEFITS ROUTES ============

// Get benefits data
app.get("/make-server-4e0b1fee/benefits", async (c) => {
  try {
    const data = await kv.get("benefits");
    return c.json({ 
      success: true, 
      data: data || {
        image: "https://images.unsplash.com/photo-1758523670634-df4e12ed7a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGVhbiUyMGhvbWV8ZW58MXx8fHwxNzYyNjgwODIzfDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    });
  } catch (error) {
    console.log("Error fetching benefits:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update benefits data (admin only)
app.post("/make-server-4e0b1fee/benefits", async (c) => {
  try {
    const body = await c.req.json();
    const { password, image } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const benefitsData = { image };
    await kv.set("benefits", benefitsData);
    return c.json({ success: true, data: benefitsData });
  } catch (error) {
    console.log("Error updating benefits:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ SOCIAL MEDIA ROUTES ============

// Get social media links
app.get("/make-server-4e0b1fee/social", async (c) => {
  try {
    const data = await kv.get("social_media");
    return c.json({ 
      success: true, 
      data: data || {
        facebook: { url: "", enabled: false },
        instagram: { url: "", enabled: false }
      }
    });
  } catch (error) {
    console.log("Error fetching social media:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update social media links (admin only)
app.post("/make-server-4e0b1fee/social", async (c) => {
  try {
    const body = await c.req.json();
    const { password, ...socialData } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    await kv.set("social_media", socialData);
    return c.json({ success: true, data: socialData });
  } catch (error) {
    console.log("Error updating social media:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ ORDERS ROUTES ============

// Create a new order (public)
app.post("/make-server-4e0b1fee/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { name, phone, email, service, message } = body;

    if (!name || !phone || !service) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderData = {
      id: orderId,
      name,
      phone,
      email: email || '',
      service,
      message: message || '',
      status: 'new',
      createdAt: new Date().toISOString()
    };

    // Get existing orders
    const orders = await kv.get("orders") || [];
    orders.unshift(orderData); // Add to beginning

    await kv.set("orders", orders);
    
    console.log(`New order created: ${orderId} from ${name}`);
    return c.json({ success: true, data: orderData });
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all orders (admin only)
app.get("/make-server-4e0b1fee/orders", async (c) => {
  try {
    console.log("🔍 GET /orders - Request received");
    console.log("🔍 All headers:", Object.fromEntries(c.req.raw.headers.entries()));
    
    const password = c.req.header('X-Admin-Password');
    console.log("🔐 Password header present:", !!password);
    console.log("🔐 Password value:", password ? `"${password}"` : 'EMPTY');
    console.log("🔐 Password length:", password?.length || 0);
    
    if (!(await checkAuth(password))) {
      console.log("❌ GET /orders - Unauthorized");
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    console.log("✅ GET /orders - Authorized, fetching from KV store");
    const orders = await kv.get("orders") || [];
    console.log(`📦 GET /orders - Found ${orders.length} orders`);
    return c.json({ success: true, data: orders });
  } catch (error) {
    console.log("❌ Error fetching orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update order status (admin only)
app.patch("/make-server-4e0b1fee/orders/:id", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const orderId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    if (!['new', 'in-progress', 'completed'].includes(status)) {
      return c.json({ success: false, error: "Invalid status" }, 400);
    }

    const orders = await kv.get("orders") || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    await kv.set("orders", orders);
    return c.json({ success: true, data: orders[orderIndex] });
  } catch (error) {
    console.log("Error updating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete order (admin only)
app.delete("/make-server-4e0b1fee/orders/:id", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const orderId = c.req.param('id');
    const orders = await kv.get("orders") || [];
    const filteredOrders = orders.filter((o: any) => o.id !== orderId);

    if (filteredOrders.length === orders.length) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    await kv.set("orders", filteredOrders);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ DISCOUNT ROUTES ============

// Get discount settings
app.get("/make-server-4e0b1fee/discount", async (c) => {
  try {
    const data = await kv.get("discount_settings");
    return c.json({ 
      success: true, 
      data: data || {
        enabled: true,
        percentage: 20,
        description: "Знижка на перше замовлення"
      }
    });
  } catch (error) {
    console.log("Error fetching discount:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update discount settings (admin only)
app.post("/make-server-4e0b1fee/discount", async (c) => {
  try {
    const body = await c.req.json();
    const { password, enabled, percentage, description } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const discountData = {
      enabled: enabled !== undefined ? enabled : true,
      percentage: percentage || 20,
      description: description || "Знижка на перше замовлення"
    };

    await kv.set("discount_settings", discountData);
    return c.json({ success: true, data: discountData });
  } catch (error) {
    console.log("Error updating discount:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ HERO IMAGES ROUTES ============

// Get hero images
app.get("/make-server-4e0b1fee/hero-images", async (c) => {
  try {
    const data = await kv.get("hero_images");
    return c.json({ 
      success: true, 
      data: data || {
        mainImage: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
        secondaryImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"
      }
    });
  } catch (error) {
    console.log("Error fetching hero images:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update hero images (admin only)
app.post("/make-server-4e0b1fee/hero-images", async (c) => {
  try {
    const body = await c.req.json();
    const { password, mainImage, secondaryImage } = body;

    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const imagesData = {
      mainImage: mainImage || "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
      secondaryImage: secondaryImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"
    };

    await kv.set("hero_images", imagesData);
    return c.json({ success: true, data: imagesData });
  } catch (error) {
    console.log("Error updating hero images:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ PRICING ROUTES ============

// Get pricing data
app.get("/make-server-4e0b1fee/pricing", async (c) => {
  try {
    // Get all pricing categories individually to include keys
    const categories = ['cleaning', 'windows', 'chemistry', 'additional'];
    const result = [];
    
    for (const category of categories) {
      const data = await kv.get(`price:${category}`);
      if (data) {
        result.push({
          key: `price:${category}`,
          value: data
        });
      }
    }
    
    console.log("📊 Fetching pricing data, found", result.length, "categories");
    return c.json({ success: true, data: result });
  } catch (error) {
    console.log("Error fetching pricing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update pricing for a specific category (admin only)
app.post("/make-server-4e0b1fee/pricing/:category", async (c) => {
  try {
    const password = c.req.header("X-Admin-Password");
    if (!(await checkAuth(password || ""))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { category } = c.req.param();
    const body = await c.req.json();
    const { items } = body;

    await kv.set(`price:${category}`, items);
    return c.json({ success: true, data: items });
  } catch (error) {
    console.log("Error updating pricing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ PASSWORD MANAGEMENT ROUTES ============

// Change admin password (admin only)
app.post("/make-server-4e0b1fee/change-password", async (c) => {
  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    console.log("🔑 Password change request received");

    if (!currentPassword || !newPassword) {
      return c.json({ success: false, error: "Current and new passwords are required" }, 400);
    }

    // Verify current password
    if (!(await checkAuth(currentPassword))) {
      console.log("❌ Password change failed: Current password is incorrect");
      return c.json({ success: false, error: "Current password is incorrect" }, 401);
    }

    // Validate new password
    if (newPassword.length < 6) {
      return c.json({ success: false, error: "New password must be at least 6 characters" }, 400);
    }

    if (newPassword === currentPassword) {
      return c.json({ success: false, error: "New password must be different from current password" }, 400);
    }

    // Save new password to KV store
    await kv.set("admin_password", newPassword);
    
    // Update the in-memory password (though we now always read from KV)
    ADMIN_PASSWORD = newPassword;

    console.log("✅ Admin password changed successfully");
    return c.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log("❌ Error changing password:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get current password status (returns if using default or custom)
app.get("/make-server-4e0b1fee/password-status", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const storedPassword = await kv.get("admin_password");
    const isDefault = !storedPassword || storedPassword === DEFAULT_ADMIN_PASSWORD;

    return c.json({ 
      success: true, 
      data: {
        isDefault,
        lastChanged: storedPassword ? new Date().toISOString() : null
      }
    });
  } catch (error) {
    console.log("Error checking password status:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Validate admin password (for login)
app.get("/make-server-4e0b1fee/validate-password", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    console.log("🔐 Password validation request received");
    
    const isValid = await checkAuth(password);
    
    if (!isValid) {
      console.log("❌ Password validation failed");
      return c.json({ success: false, error: "Invalid password" }, 401);
    }
    
    console.log("✅ Password validation successful");
    return c.json({ success: true, message: "Password is valid" });
  } catch (error) {
    console.log("Error validating password:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get admin username
app.get("/make-server-4e0b1fee/admin-username", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const username = await kv.get("admin_username");
    return c.json({ 
      success: true, 
      data: {
        username: username || "Адміністратор"
      }
    });
  } catch (error) {
    console.log("Error getting username:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update admin username
app.post("/make-server-4e0b1fee/admin-username", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { username } = body;

    if (!username || username.length < 3) {
      return c.json({ success: false, error: "Username must be at least 3 characters" }, 400);
    }

    await kv.set("admin_username", username);
    console.log("✅ Admin username updated:", username);
    
    return c.json({ success: true, message: "Username updated successfully" });
  } catch (error) {
    console.log("Error updating username:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reset password to default (NO AUTH REQUIRED - for emergency access)
app.post("/make-server-4e0b1fee/reset-password", async (c) => {
  try {
    console.log("🔐 Password reset request received");
    
    // Reset to default password
    await kv.set("admin_password", DEFAULT_ADMIN_PASSWORD);
    ADMIN_PASSWORD = DEFAULT_ADMIN_PASSWORD;
    
    console.log("✅ Password reset to default:", DEFAULT_ADMIN_PASSWORD);
    
    return c.json({ 
      success: true, 
      message: "Password reset to default",
      defaultPassword: DEFAULT_ADMIN_PASSWORD
    });
  } catch (error) {
    console.log("❌ Error resetting password:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ EXPORT/IMPORT ROUTES ============

// Export all data (admin only)
app.get("/make-server-4e0b1fee/export/all", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    console.log("📦 Starting full data export...");

    // Collect all data
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      data: {
        services: await kv.getByPrefix("service:"),
        contacts: await kv.get("contacts"),
        branding: await kv.get("branding"),
        heroImages: await kv.get("hero_images"),
        benefits: await kv.get("benefits"),
        discount: await kv.get("discount_settings"),
        pricing: {
          apartment: await kv.get("pricing:apartment"),
          house: await kv.get("pricing:house"),
          office: await kv.get("pricing:office"),
          afterRepair: await kv.get("pricing:after-repair"),
        },
        reviews: await kv.getByPrefix("review:"),
        gallery: await kv.getByPrefix("gallery:"),
        blog: await kv.getByPrefix("blog:"),
        socialMedia: await kv.get("social_media"),
      }
    };

    console.log("✅ Export completed successfully");
    return c.json({ success: true, data: exportData });
  } catch (error) {
    console.log("❌ Error exporting data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Import data (admin only)
app.post("/make-server-4e0b1fee/import/all", async (c) => {
  try {
    const password = c.req.header('X-Admin-Password');
    if (!(await checkAuth(password))) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { data: importData, mode = "merge" } = body; // mode: "merge" or "overwrite"

    console.log("📥 Starting data import, mode:", mode);

    let imported = {
      services: 0,
      reviews: 0,
      gallery: 0,
      blog: 0,
      other: 0
    };

    // Import services
    if (importData.data?.services && Array.isArray(importData.data.services)) {
      if (mode === "overwrite") {
        // Delete existing services
        const existing = await kv.getByPrefix("service:");
        for (const service of existing) {
          await kv.del(`service:${service.id}`);
        }
      }
      for (const service of importData.data.services) {
        await kv.set(`service:${service.id}`, service);
        imported.services++;
      }
    }

    // Import single-value data
    const singleKeys = [
      'contacts', 'branding', 'heroImages', 'benefits', 
      'discount', 'socialMedia'
    ];
    
    for (const key of singleKeys) {
      if (importData.data?.[key]) {
        const kvKey = key === 'heroImages' ? 'hero_images' 
                    : key === 'discount' ? 'discount_settings'
                    : key === 'socialMedia' ? 'social_media'
                    : key;
        await kv.set(kvKey, importData.data[key]);
        imported.other++;
      }
    }

    // Import pricing
    if (importData.data?.pricing) {
      for (const [category, data] of Object.entries(importData.data.pricing)) {
        if (data) {
          await kv.set(`pricing:${category}`, data);
          imported.other++;
        }
      }
    }

    // Import reviews
    if (importData.data?.reviews && Array.isArray(importData.data.reviews)) {
      if (mode === "overwrite") {
        const existing = await kv.getByPrefix("review:");
        for (const review of existing) {
          await kv.del(`review:${review.id}`);
        }
      }
      for (const review of importData.data.reviews) {
        await kv.set(`review:${review.id}`, review);
        imported.reviews++;
      }
    }

    // Import gallery
    if (importData.data?.gallery && Array.isArray(importData.data.gallery)) {
      if (mode === "overwrite") {
        const existing = await kv.getByPrefix("gallery:");
        for (const item of existing) {
          await kv.del(`gallery:${item.id}`);
        }
      }
      for (const item of importData.data.gallery) {
        await kv.set(`gallery:${item.id}`, item);
        imported.gallery++;
      }
    }

    // Import blog
    if (importData.data?.blog && Array.isArray(importData.data.blog)) {
      if (mode === "overwrite") {
        const existing = await kv.getByPrefix("blog:");
        for (const post of existing) {
          await kv.del(`blog:${post.id}`);
        }
      }
      for (const post of importData.data.blog) {
        await kv.set(`blog:${post.id}`, post);
        imported.blog++;
      }
    }

    console.log("✅ Import completed:", imported);
    return c.json({ 
      success: true, 
      message: "Data imported successfully",
      imported 
    });
  } catch (error) {
    console.log("❌ Error importing data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Catch-all route for debugging
app.all("*", (c) => {
  console.log(`⚠️ Unhandled route: ${c.req.method} ${c.req.url}`);
  return c.json({ 
    success: false, 
    error: "Route not found",
    path: c.req.url,
    method: c.req.method,
    availableRoutes: [
      "GET /make-server-4e0b1fee/health",
      "GET /make-server-4e0b1fee/services",
      "POST /make-server-4e0b1fee/services",
      "GET /make-server-4e0b1fee/contacts",
      "PUT /make-server-4e0b1fee/contacts",
      "GET /make-server-4e0b1fee/branding",
      "PUT /make-server-4e0b1fee/branding",
      "GET /make-server-4e0b1fee/hero-images",
      "PUT /make-server-4e0b1fee/hero-images",
      "GET /make-server-4e0b1fee/discount",
      "PUT /make-server-4e0b1fee/discount",
      "POST /make-server-4e0b1fee/orders",
      "GET /make-server-4e0b1fee/orders",
      "PATCH /make-server-4e0b1fee/orders/:id",
      "DELETE /make-server-4e0b1fee/orders/:id",
      "POST /make-server-4e0b1fee/change-password",
      "GET /make-server-4e0b1fee/password-status",
      "GET /make-server-4e0b1fee/validate-password",
      "GET /make-server-4e0b1fee/admin-username",
      "POST /make-server-4e0b1fee/admin-username",
      "GET /make-server-4e0b1fee/export/all",
      "POST /make-server-4e0b1fee/import/all"
    ]
  }, 404);
});

console.log("🚀 Server starting...");
console.log("📍 Base path: /make-server-4e0b1fee");
console.log("🔑 Admin password:", ADMIN_PASSWORD);

Deno.serve(app.fetch);
