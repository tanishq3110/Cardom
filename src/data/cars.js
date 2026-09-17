/**
 * Mock car data — Cardom Featured Cars
 *
 * This data is structured to mirror the shape a Supabase query will return.
 * When Supabase is wired up, replace this array with:
 *   const { data } = await supabase.from('cars').select('*').eq('is_featured', true).limit(6)
 *
 * Field naming uses camelCase here; add a transformer if Supabase returns snake_case.
 */
export const FEATURED_CARS = [
  {
    id:           'bmw-m3-2023',
    brand:        'BMW',
    model:        'M3 Competition',
    year:         2023,
    price:        9500000,    // ₹ 95 Lakh
    mileage:      11200,      // km
    fuel:         'Petrol',
    transmission: 'Automatic',
    location:     'Mumbai, MH',
    image:        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    badge:        'Featured',
    isFeatured:   true,
  },
  {
    id:           'porsche-911-2022',
    brand:        'Porsche',
    model:        '911 Carrera S',
    year:         2022,
    price:        17500000,   // ₹ 1.75 Cr
    mileage:      8500,
    fuel:         'Petrol',
    transmission: 'Automatic',
    location:     'New Delhi, DL',
    image:        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    badge:        'Hot Deal',
    isFeatured:   false,
  },
  {
    id:           'mercedes-amg-2023',
    brand:        'Mercedes-Benz',
    model:        'AMG C 43',
    year:         2023,
    price:        7800000,    // ₹ 78 Lakh
    mileage:      15000,
    fuel:         'Petrol',
    transmission: 'Automatic',
    location:     'Bangalore, KA',
    image:        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
    badge:        'Featured',
    isFeatured:   true,
  },
  {
    id:           'audi-rs6-2022',
    brand:        'Audi',
    model:        'RS 6 Avant',
    year:         2022,
    price:        14800000,   // ₹ 1.48 Cr
    mileage:      22000,
    fuel:         'Petrol',
    transmission: 'Automatic',
    location:     'Hyderabad, TS',
    image:        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80',
    badge:        null,
    isFeatured:   false,
  },
  {
    id:           'tesla-model3-2023',
    brand:        'Tesla',
    model:        'Model 3 Performance',
    year:         2023,
    price:        6500000,    // ₹ 65 Lakh
    mileage:      9000,
    fuel:         'Electric',
    transmission: 'Automatic',
    location:     'Pune, MH',
    image:        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    badge:        'Electric',
    isFeatured:   false,
  },
  {
    id:           'toyota-supra-2022',
    brand:        'Toyota',
    model:        'GR Supra 3.0',
    year:         2022,
    price:        5200000,    // ₹ 52 Lakh
    mileage:      18000,
    fuel:         'Petrol',
    transmission: 'Automatic',
    location:     'Chennai, TN',
    image:        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
    badge:        null,
    isFeatured:   false,
  },
]

