-- ==========================================================
-- FOOD DELIVERY DATABASE SCHEMA (Glovo-style)
-- ==========================================================

-- 1. Restaurants Table
CREATE TABLE IF NOT EXISTS public.food_restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cuisine_type TEXT NOT NULL, -- e.g., "Tunisien", "Pizza", "Burger"
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    rating NUMERIC(2, 1) DEFAULT 4.5,
    delivery_time_min INTEGER NOT NULL, -- in minutes
    delivery_time_max INTEGER NOT NULL, -- in minutes
    delivery_fee NUMERIC(8, 3) DEFAULT 0.000,
    min_order NUMERIC(8, 3) DEFAULT 0.000,
    is_open BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.food_restaurants;
CREATE POLICY "Anyone can view restaurants" ON public.food_restaurants FOR SELECT USING (true);


-- 2. Menu Categories Table (for each restaurant)
CREATE TABLE IF NOT EXISTS public.food_menu_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.food_restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., "Entrées", "Plats", "Desserts", "Boissons"
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view menu categories" ON public.food_menu_categories;
CREATE POLICY "Anyone can view menu categories" ON public.food_menu_categories FOR SELECT USING (true);


-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS public.food_menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.food_restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.food_menu_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(8, 3) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.food_menu_items;
CREATE POLICY "Anyone can view menu items" ON public.food_menu_items FOR SELECT USING (true);


-- 4. Menu Item Extras/Modifiers Table (e.g., extra cheese, size options)
CREATE TABLE IF NOT EXISTS public.food_item_extras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES public.food_menu_items(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(8, 3) DEFAULT 0.000,
    is_required BOOLEAN DEFAULT false,
    max_selectable INTEGER DEFAULT 1, -- for multi-select options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_item_extras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view item extras" ON public.food_item_extras;
CREATE POLICY "Anyone can view item extras" ON public.food_item_extras FOR SELECT USING (true);


-- 5. Cuisine Categories Table (for filtering restaurants)
CREATE TABLE IF NOT EXISTS public.food_cuisine_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_cuisine_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view cuisine categories" ON public.food_cuisine_categories;
CREATE POLICY "Anyone can view cuisine categories" ON public.food_cuisine_categories FOR SELECT USING (true);


-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.food_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.food_restaurants(id) ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 3) NOT NULL,
    delivery_fee NUMERIC(8, 3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
    delivery_address TEXT NOT NULL,
    delivery_city TEXT NOT NULL,
    delivery_latitude NUMERIC(10, 7),
    delivery_longitude NUMERIC(10, 7),
    payment_method TEXT NOT NULL DEFAULT 'wallet' CHECK (payment_method IN ('wallet', 'cash')),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON public.food_orders;
CREATE POLICY "Users can view own orders" ON public.food_orders FOR SELECT USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');
DROP POLICY IF EXISTS "Users can create orders" ON public.food_orders;
CREATE POLICY "Users can create orders" ON public.food_orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');


-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.food_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.food_orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.food_menu_items(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time NUMERIC(8, 3) NOT NULL,
    notes TEXT, -- special instructions for this item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own order items" ON public.food_order_items;
CREATE POLICY "Users can view own order items" ON public.food_order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create order items" ON public.food_order_items;
CREATE POLICY "Users can create order items" ON public.food_order_items FOR INSERT WITH CHECK (true);


-- 8. Order Item Extras Table
CREATE TABLE IF NOT EXISTS public.food_order_item_extras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_item_id UUID REFERENCES public.food_order_items(id) ON DELETE CASCADE NOT NULL,
    extra_id UUID REFERENCES public.food_item_extras(id) ON DELETE CASCADE NOT NULL,
    price_at_time NUMERIC(8, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_order_item_extras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view order item extras" ON public.food_order_item_extras;
CREATE POLICY "Anyone can view order item extras" ON public.food_order_item_extras FOR SELECT USING (true);


-- ==========================================================
-- INSERT SAMPLE DATA
-- ==========================================================

-- Insert Cuisine Categories
INSERT INTO public.food_cuisine_categories (id, name, icon, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'Tunisien', 'TN', 0),
('f0000000-0000-0000-0000-000000000002', 'Pizza', '🍕', 1),
('f0000000-0000-0000-0000-000000000003', 'Burgers', '🍔', 2),
('f0000000-0000-0000-0000-000000000004', 'Sushi', '🍣', 3),
('f0000000-0000-0000-0000-000000000005', 'Healthy', '🥗', 4)
ON CONFLICT (id) DO NOTHING;


-- Insert Sample Restaurants
INSERT INTO public.food_restaurants (id, name, description, cuisine_type, address, city, latitude, longitude, rating, delivery_time_min, delivery_time_max, delivery_fee, min_order, is_open, image_url)
VALUES 
('f1111111-1111-1111-1111-111111111111', 'Restaurant Dar Zmen', 'Cuisine tunisienne authentique et traditionnelle', 'Tunisien', 'Rue de la Liberté, La Marsa', 'Tunis', 36.8796, 10.3244, 4.7, 30, 45, 5.000, 20.000, true, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800'),
('f2222222-2222-2222-2222-222222222222', 'Pizza Palace', 'Les meilleures pizzas de Tunis !', 'Pizza', 'Avenue Habib Bourguiba, Tunis', 'Tunis', 36.8065, 10.1815, 4.5, 25, 40, 4.000, 15.000, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800'),
('f3333333-3333-3333-3333-333333333333', 'Burger Hub', 'Burgers artisanaux avec des ingrédients frais', 'Burgers', 'Rue de France, Sousse', 'Sousse', 35.8256, 10.6336, 4.3, 20, 35, 3.500, 12.000, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800')
ON CONFLICT (id) DO NOTHING;


-- Insert Menu Categories for Dar Zmen
INSERT INTO public.food_menu_categories (id, restaurant_id, name, sort_order)
VALUES 
('fc000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'Entrées', 0),
('fc000000-0000-0000-0000-000000000002', 'f1111111-1111-1111-1111-111111111111', 'Plats Principaux', 1),
('fc000000-0000-0000-0000-000000000003', 'f1111111-1111-1111-1111-111111111111', 'Desserts', 2)
ON CONFLICT (id) DO NOTHING;


-- Insert Menu Items for Dar Zmen
INSERT INTO public.food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
VALUES 
('fi000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000001', 'Brik à l''oeuf', 'Brik traditionnel avec oeuf et thon', 8.000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=500', true, true),
('fi000000-0000-0000-0000-000000000002', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000002', 'Couscous Royal', 'Couscous aux légumes et à la viande', 25.000, 'https://images.unsplash.com/photo-1625944525882-1d4fad472736?q=80&w=500', true, true),
('fi000000-0000-0000-0000-000000000003', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000002', 'Lablabi', 'Soupe traditionnelle tunisienne', 12.000, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=500', true, false),
('fi000000-0000-0000-0000-000000000004', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000003', 'Makroudh', 'Dessert aux dattes', 6.000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=500', true, false)
ON CONFLICT (id) DO NOTHING;


-- Insert Menu Categories for Pizza Palace
INSERT INTO public.food_menu_categories (id, restaurant_id, name, sort_order)
VALUES 
('fc000000-0000-0000-0000-000000000011', 'f2222222-2222-2222-2222-222222222222', 'Pizzas', 0),
('fc000000-0000-0000-0000-000000000012', 'f2222222-2222-2222-2222-222222222222', 'Boissons', 1)
ON CONFLICT (id) DO NOTHING;


-- Insert Menu Items for Pizza Palace
INSERT INTO public.food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
VALUES 
('fi000000-0000-0000-0000-000000000011', 'f2222222-2222-2222-2222-222222222222', 'fc000000-0000-0000-0000-000000000011', 'Margherita', 'Tomate, mozzarella, basilic', 15.000, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=500', true, true),
('fi000000-0000-0000-0000-000000000012', 'f2222222-2222-2222-2222-222222222222', 'fc000000-0000-0000-0000-000000000011', 'Pepperoni', 'Tomate, mozzarella, pepperoni', 18.000, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=500', true, true)
ON CONFLICT (id) DO NOTHING;
