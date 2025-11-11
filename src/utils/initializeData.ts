import { updatePricing, saveService, updateContacts, updateBranding, updateSocialMedia, updateHeroImages, updateDiscount } from './api';

// Initial services data
export const initialServices = [
  {
    title: 'Прибирання квартир',
    description: 'Комплексне прибирання вашої квартири з використанням професійного обладнання',
    features: ['Вологе прибирання', 'Миття вікон', 'Чистка меблів'],
  },
  {
    title: 'Прибирання офісів',
    description: 'Підтримка чистоти у ваших офісних приміщеннях для комфортної роботи',
    features: ['Щоденне прибирання', 'Дезінфекція', 'Прибирання після ремонту'],
  },
  {
    title: 'Генеральне прибирання',
    description: 'Глибоке очищення всіх приміщень, включаючи важкодоступні місця',
    features: ['Повне прибирання', 'Чистка всіх поверхонь', 'Миття люстр'],
  },
  {
    title: 'Миття вікон',
    description: 'Професійне миття вікон з обох сторін на будь-якій висоті',
    features: ['Зовнішнє миття', 'Внутрішнє миття', 'Чистка підвіконь'],
  },
  {
    title: 'Хімчистка меблів',
    description: 'Глибока очистка меблів та килимів з професійним обладнанням',
    features: ['М\'які меблі', 'Килими', 'Матраци'],
  },
  {
    title: 'Прибирання після ремонту',
    description: 'Очищення приміщень після ремонтних робіт від будівельного пилу',
    features: ['Видалення пилу', 'Миття всіх поверхонь', 'Полірування'],
  },
];

// Initial contacts data
export const initialContacts = {
  phones: [
    {
      number: '+380 (12) 345-67-89',
      viber: true,
      telegram: true,
      whatsapp: true,
    },
  ],
  email: 'info@bliskcleaning.ua',
  address: 'Київ, Україна',
  schedule: 'Пн-Нд: 24/7',
};

// Initial pricing data based on the example website
export const initialPricingData = {
  cleaning: [
    {
      area: 'До 40 м.кв.',
      afterRepair: 'від 4400 грн.',
      general: 'від 4000 грн.',
      supporting: 'від 2200 грн.',
    },
    {
      area: '41-50 м.кв.',
      afterRepair: 'від 5500 грн.',
      general: 'від 5000 грн.',
      supporting: 'від 2700 грн.',
    },
    {
      area: '51-60 кв.м.',
      afterRepair: 'від 6600 грн.',
      general: 'від 6000 грн.',
      supporting: 'від 3300 грн.',
    },
    {
      area: '61-80 кв.м.',
      afterRepair: 'від 7700 грн.',
      general: 'від 7000 грн.',
      supporting: 'від 4400 грн.',
    },
    {
      area: '81-100 м.кв.',
      afterRepair: 'від 8800 грн.',
      general: 'від 8000 грн.',
      supporting: 'від 5000 грн.',
    },
    {
      area: '101-120 м.кв.',
      afterRepair: 'від 11000 грн.',
      general: 'від 10000 грн.',
      supporting: 'від 5500 грн.',
    },
    {
      area: '121-140 м.кв.',
      afterRepair: 'від 13500 грн.',
      general: 'від 12000 грн.',
      supporting: 'від 6600 грн.',
    },
    {
      area: 'Більше 160 м.кв.',
      afterRepair: 'Договірна',
      general: 'Договірна',
      supporting: 'Договірна',
    },
  ],
  windows: [
    {
      type: 'Сезонне миття вікон',
      price: 'від 150 грн. / м.кв. (мінімальна ціна виїзду - 2500 грн.)',
    },
    {
      type: 'Післяремонтне миття вікон',
      price: 'від 180 грн. / м.кв. (мінімальна ціна виїзду - 2500 грн.)',
    },
    {
      type: 'Зняття застарілої монтажної плівки',
      price: 'від 300 грн. / м.кв. (мінімальна ціна виїзду - 2500 грн.)',
    },
  ],
  chemistry: [
    {
      item: 'Диван',
      price: 'від 400 грн. / місце',
    },
    {
      item: 'Матрац односпальний',
      price: 'від 1000 грн.',
    },
    {
      item: 'Матрац двоспальний',
      price: 'від 1500 грн.',
    },
    {
      item: 'Крісло м\'яке',
      price: 'від 450 грн.',
    },
    {
      item: 'Стілець',
      price: 'від 200 грн.',
    },
    {
      item: 'Ковролін',
      price: 'від 80 грн / м.кв.',
    },
    {
      item: 'Килим',
      price: 'від 100 грн / м.кв.',
    },
  ],
  additional: [
    {
      service: 'Миття жалюзей',
      price: 'від 200 грн. / шт.',
    },
    {
      service: 'Прання штор та їх вивішування',
      price: 'від 300 грн. / шт.',
    },
    {
      service: 'Миття холодильника всередині',
      price: '900 грн.',
    },
  ],
};

// Function to initialize services
export async function initializeServices(password: string) {
  try {
    console.log('initializeServices called with password:', password ? '***' : 'EMPTY');
    for (const service of initialServices) {
      await saveService(password, service);
    }
    return { success: true };
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error; // Re-throw to let caller handle it
  }
}

// Function to initialize contacts
export async function initializeContacts(password: string) {
  try {
    await updateContacts(password, initialContacts);
    return { success: true };
  } catch (error) {
    console.error('Error initializing contacts:', error);
    return { success: false, error };
  }
}

// Function to initialize pricing data
export async function initializePricing(password: string) {
  try {
    await updatePricing(password, 'cleaning', initialPricingData.cleaning);
    await updatePricing(password, 'windows', initialPricingData.windows);
    await updatePricing(password, 'chemistry', initialPricingData.chemistry);
    await updatePricing(password, 'additional', initialPricingData.additional);
    return { success: true };
  } catch (error) {
    console.error('Error initializing pricing:', error);
    return { success: false, error };
  }
}

// Function to initialize branding
export async function initializeBranding(password: string) {
  try {
    const brandingData = {
      logo: '',
      companyName: 'БлискКлінінг'
    };
    await updateBranding(password, brandingData);
    return { success: true };
  } catch (error) {
    console.error('Error initializing branding:', error);
    return { success: false, error };
  }
}

// Function to initialize social media
export async function initializeSocialMedia(password: string) {
  try {
    const socialData = {
      facebook: { url: 'https://facebook.com', enabled: true },
      instagram: { url: 'https://instagram.com', enabled: true }
    };
    await updateSocialMedia(password, socialData);
    return { success: true };
  } catch (error) {
    console.error('Error initializing social media:', error);
    return { success: false, error };
  }
}

// Function to initialize hero images
export async function initializeHeroImages(password: string) {
  try {
    const imagesData = {
      mainImage: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
      secondaryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
    };
    await updateHeroImages(password, imagesData);
    return { success: true };
  } catch (error) {
    console.error('Error initializing hero images:', error);
    return { success: false, error };
  }
}

// Function to initialize discount
export async function initializeDiscount(password: string) {
  try {
    const discountData = {
      enabled: true,
      percentage: 20,
      description: 'Знижка на перше замовлення'
    };
    await updateDiscount(password, discountData);
    return { success: true };
  } catch (error) {
    console.error('Error initializing discount:', error);
    return { success: false, error };
  }
}

// Function to initialize all data at once
export async function initializeAllData(password: string) {
  try {
    await initializeServices(password);
    await initializeContacts(password);
    await initializeBranding(password);
    await initializeSocialMedia(password);
    await initializeHeroImages(password);
    await initializeDiscount(password);
    await initializePricing(password);
    return { success: true };
  } catch (error) {
    console.error('Error initializing all data:', error);
    return { success: false, error };
  }
}
