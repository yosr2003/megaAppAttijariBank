-- ==========================================================
-- ORACLE DATABASE SCHEMA FOR SUPERTOUNSI
-- Focus Areas: Digital Wallet, Smart Saving, Marketplace,
--              P2P Marketplace & Food Delivery
-- ==========================================================
-- Compatible with Oracle 19c+ / 23ai
-- ==========================================================

-- ----------------------------------------------------------
-- HELPER: Generate UUID string (32 hex characters)
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_uuid RETURN VARCHAR2 IS
    v_uuid RAW(16);
BEGIN
    v_uuid := SYS_GUID();
    RETURN LOWER(
        SUBSTR(RAWTOHEX(v_uuid), 1, 8) || '-' ||
        SUBSTR(RAWTOHEX(v_uuid), 9, 4) || '-' ||
        SUBSTR(RAWTOHEX(v_uuid), 13, 4) || '-' ||
        SUBSTR(RAWTOHEX(v_uuid), 17, 4) || '-' ||
        SUBSTR(RAWTOHEX(v_uuid), 21, 12)
    );
END generate_uuid;
/

-- ----------------------------------------------------------
-- 0. USER PROFILES (Base reference)
-- ----------------------------------------------------------
CREATE TABLE profiles (
    id          VARCHAR2(36) PRIMARY KEY,
    email       VARCHAR2(255) NOT NULL CONSTRAINT uq_profiles_email UNIQUE,
    full_name   VARCHAR2(255),
    avatar_url  VARCHAR2(500),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL
);

COMMENT ON TABLE profiles IS 'User profiles - base reference for all features';

-- ----------------------------------------------------------
-- 1. FOOD DELIVERY
-- ----------------------------------------------------------

-- 1.1 Food Cuisine Categories
CREATE TABLE food_cuisine_categories (
    id          VARCHAR2(36) PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL,
    icon        VARCHAR2(50) NOT NULL,
    sort_order  NUMBER(3) DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL
);

COMMENT ON TABLE food_cuisine_categories IS 'Cuisine categories for filtering restaurants';

-- 1.2 Restaurants
CREATE TABLE food_restaurants (
    id                VARCHAR2(36) PRIMARY KEY,
    name              VARCHAR2(255) NOT NULL,
    description       CLOB,
    cuisine_type      VARCHAR2(100) NOT NULL,
    address           VARCHAR2(500) NOT NULL,
    city              VARCHAR2(255) NOT NULL,
    latitude          NUMBER(10,7),
    longitude         NUMBER(10,7),
    rating            NUMBER(2,1) DEFAULT 4.5,
    delivery_time_min NUMBER(4) NOT NULL,
    delivery_time_max NUMBER(4) NOT NULL,
    delivery_fee      NUMBER(8,3) DEFAULT 0.000,
    min_order         NUMBER(8,3) DEFAULT 0.000,
    is_open           NUMBER(1) DEFAULT 1,
    image_url         VARCHAR2(500),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT chk_food_resto_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT chk_food_resto_open CHECK (is_open IN (0, 1))
);

COMMENT ON TABLE food_restaurants IS 'Food delivery restaurants';

-- 1.3 Menu Categories (per restaurant)
CREATE TABLE food_menu_categories (
    id              VARCHAR2(36) PRIMARY KEY,
    restaurant_id   VARCHAR2(36) NOT NULL,
    name            VARCHAR2(255) NOT NULL,
    sort_order      NUMBER(3) DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_menu_cat_restaurant FOREIGN KEY (restaurant_id) REFERENCES food_restaurants(id) ON DELETE CASCADE
);

COMMENT ON TABLE food_menu_categories IS 'Menu categories within a restaurant';

-- 1.4 Menu Items
CREATE TABLE food_menu_items (
    id              VARCHAR2(36) PRIMARY KEY,
    restaurant_id   VARCHAR2(36) NOT NULL,
    category_id     VARCHAR2(36) NOT NULL,
    name            VARCHAR2(255) NOT NULL,
    description     CLOB,
    price           NUMBER(8,3) NOT NULL,
    image_url       VARCHAR2(500),
    is_available    NUMBER(1) DEFAULT 1,
    is_popular      NUMBER(1) DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_menu_item_restaurant FOREIGN KEY (restaurant_id) REFERENCES food_restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_item_category FOREIGN KEY (category_id) REFERENCES food_menu_categories(id) ON DELETE CASCADE,
    CONSTRAINT chk_menu_item_avail CHECK (is_available IN (0, 1)),
    CONSTRAINT chk_menu_item_popular CHECK (is_popular IN (0, 1))
);

COMMENT ON TABLE food_menu_items IS 'Individual food menu items';

-- 1.5 Menu Item Extras (modifiers like extra cheese, size)
CREATE TABLE food_item_extras (
    id              VARCHAR2(36) PRIMARY KEY,
    menu_item_id    VARCHAR2(36) NOT NULL,
    name            VARCHAR2(255) NOT NULL,
    price           NUMBER(8,3) DEFAULT 0.000,
    is_required     NUMBER(1) DEFAULT 0,
    max_selectable  NUMBER(3) DEFAULT 1,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_item_extra FOREIGN KEY (menu_item_id) REFERENCES food_menu_items(id) ON DELETE CASCADE,
    CONSTRAINT chk_item_extra_req CHECK (is_required IN (0, 1))
);

COMMENT ON TABLE food_item_extras IS 'Optional extras / modifiers for menu items';

-- 1.6 Food Orders
CREATE TABLE food_orders (
    id                  VARCHAR2(36) PRIMARY KEY,
    user_id             VARCHAR2(36) NOT NULL,
    restaurant_id       VARCHAR2(36) NOT NULL,
    total_amount        NUMBER(10,3) NOT NULL,
    delivery_fee        NUMBER(8,3) NOT NULL,
    status              VARCHAR2(20) DEFAULT 'pending' NOT NULL,
    delivery_address    VARCHAR2(500) NOT NULL,
    delivery_city       VARCHAR2(255) NOT NULL,
    delivery_latitude   NUMBER(10,7),
    delivery_longitude  NUMBER(10,7),
    payment_method      VARCHAR2(20) DEFAULT 'wallet' NOT NULL,
    special_instructions CLOB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_food_order_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_food_order_restaurant FOREIGN KEY (restaurant_id) REFERENCES food_restaurants(id) ON DELETE CASCADE,
    CONSTRAINT chk_food_order_status CHECK (status IN ('pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
    CONSTRAINT chk_food_order_payment CHECK (payment_method IN ('wallet', 'card', 'cash'))
);

COMMENT ON TABLE food_orders IS 'Food delivery orders';

-- 1.7 Order Items
CREATE TABLE food_order_items (
    id              VARCHAR2(36) PRIMARY KEY,
    order_id        VARCHAR2(36) NOT NULL,
    menu_item_id    VARCHAR2(36) NOT NULL,
    quantity        NUMBER(5) DEFAULT 1 NOT NULL,
    price_at_time   NUMBER(8,3) NOT NULL,
    notes           CLOB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES food_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_menu FOREIGN KEY (menu_item_id) REFERENCES food_menu_items(id) ON DELETE CASCADE
);

COMMENT ON TABLE food_order_items IS 'Items within a food order';

-- 1.8 Order Item Extras
CREATE TABLE food_order_item_extras (
    id              VARCHAR2(36) PRIMARY KEY,
    order_item_id   VARCHAR2(36) NOT NULL,
    extra_id        VARCHAR2(36) NOT NULL,
    price_at_time   NUMBER(8,3) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_order_extra_item FOREIGN KEY (order_item_id) REFERENCES food_order_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_extra_def FOREIGN KEY (extra_id) REFERENCES food_item_extras(id) ON DELETE CASCADE
);

COMMENT ON TABLE food_order_item_extras IS 'Extras selected for each order item';


-- ----------------------------------------------------------
-- 2. DIGITAL WALLET
-- ----------------------------------------------------------

-- 2.1 Wallet Cards
CREATE TABLE wallet_cards (
    id                VARCHAR2(36) PRIMARY KEY,
    user_id           VARCHAR2(36) NOT NULL,
    card_number       VARCHAR2(50) NOT NULL,
    cardholder_name   VARCHAR2(255) NOT NULL,
    expiry_date       VARCHAR2(10) NOT NULL,
    card_type         VARCHAR2(20) DEFAULT 'Virtual',
    status            VARCHAR2(20) DEFAULT 'active',
    balance           NUMBER(12,3) DEFAULT 0.000 NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_wallet_card_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_card_type CHECK (card_type IN ('Platinum', 'Gold', 'Virtual')),
    CONSTRAINT chk_card_status CHECK (status IN ('active', 'inactive'))
);

COMMENT ON TABLE wallet_cards IS 'User virtual/physical wallet cards';

-- 2.2 Wallet Transactions
CREATE TABLE wallet_transactions (
    id                VARCHAR2(36) PRIMARY KEY,
    user_id           VARCHAR2(36) NOT NULL,
    card_id           VARCHAR2(36),
    title             VARCHAR2(255) NOT NULL,
    category          VARCHAR2(100) NOT NULL,
    amount            NUMBER(12,3) NOT NULL,
    currency          VARCHAR2(10) DEFAULT 'TND' NOT NULL,
    icon              VARCHAR2(100) DEFAULT 'swap-horizontal-outline',
    transaction_date  TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_wallet_tx_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_wallet_tx_card FOREIGN KEY (card_id) REFERENCES wallet_cards(id) ON DELETE SET NULL
);

COMMENT ON TABLE wallet_transactions IS 'Financial transactions';

-- 2.3 Wallet Documents (Identity Credentials)
CREATE TABLE wallet_documents (
    id          VARCHAR2(36) PRIMARY KEY,
    user_id     VARCHAR2(36) NOT NULL,
    title       VARCHAR2(255) NOT NULL,
    subtitle    VARCHAR2(255),
    status      VARCHAR2(20) DEFAULT 'Pending',
    icon        VARCHAR2(100) DEFAULT 'document-text-outline',
    image_url   VARCHAR2(500),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_wallet_doc_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_doc_status CHECK (status IN ('Verified', 'Pending', 'Rejected'))
);

COMMENT ON TABLE wallet_documents IS 'Identity documents and credentials';


-- ----------------------------------------------------------
-- 3. SMART SAVING (ÉPARGNE)
-- ----------------------------------------------------------

-- 3.1 Savings Goals
CREATE TABLE savings_goals (
    id              VARCHAR2(36) PRIMARY KEY,
    user_id         VARCHAR2(36) NOT NULL,
    title           VARCHAR2(255) NOT NULL,
    goal_amount     NUMBER(12,3) NOT NULL,
    current_amount  NUMBER(12,3) DEFAULT 0.000 NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_savings_goal_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE savings_goals IS 'User savings goals';


-- ----------------------------------------------------------
-- 4. MARKETPLACE (AI Subscriptions)
-- ----------------------------------------------------------

-- 4.1 Marketplace Items
CREATE TABLE marketplace_items (
    id             VARCHAR2(36) PRIMARY KEY,
    title          VARCHAR2(255) NOT NULL,
    description    CLOB,
    price_text     VARCHAR2(100) NOT NULL,
    price_amount   NUMBER(12,3) NOT NULL,
    icon           VARCHAR2(100) DEFAULT 'apps-outline',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL
);

COMMENT ON TABLE marketplace_items IS 'Marketplace apps/services offered';

-- 4.2 Marketplace Subscriptions
CREATE TABLE marketplace_subscriptions (
    id          VARCHAR2(36) PRIMARY KEY,
    user_id     VARCHAR2(36) NOT NULL,
    item_id     VARCHAR2(36) NOT NULL,
    status      VARCHAR2(20) DEFAULT 'Active',
    start_date  TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    end_date    TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_mkt_sub_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_mkt_sub_item FOREIGN KEY (item_id) REFERENCES marketplace_items(id) ON DELETE CASCADE,
    CONSTRAINT chk_mkt_sub_status CHECK (status IN ('Active', 'Cancelled', 'Expired'))
);

COMMENT ON TABLE marketplace_subscriptions IS 'User subscriptions to marketplace items';


-- ----------------------------------------------------------
-- 5. P2P MARKETPLACE (Peer-to-Peer)
-- ----------------------------------------------------------

-- 5.1 P2P Products
CREATE TABLE p2p_products (
    id            VARCHAR2(36) PRIMARY KEY,
    user_id       VARCHAR2(36) NOT NULL,
    title         VARCHAR2(255) NOT NULL,
    description   CLOB,
    category      VARCHAR2(100) NOT NULL,
    price         NUMBER(12,3) NOT NULL,
    product_condition VARCHAR2(10) NOT NULL,
    location      VARCHAR2(255) NOT NULL,
    contact_info  VARCHAR2(100) NOT NULL,
    images        CLOB, -- JSON array stored as CLOB
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_p2p_product_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_p2p_condition CHECK (product_condition IN ('New', 'Used'))
);

COMMENT ON TABLE p2p_products IS 'Peer-to-peer marketplace products';

-- 5.2 P2P Favorites
CREATE TABLE p2p_favorites (
    id          VARCHAR2(36) PRIMARY KEY,
    user_id     VARCHAR2(36) NOT NULL,
    product_id  VARCHAR2(36) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL,
    CONSTRAINT fk_p2p_fav_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_p2p_fav_product FOREIGN KEY (product_id) REFERENCES p2p_products(id) ON DELETE CASCADE,
    CONSTRAINT uq_p2p_fav UNIQUE (user_id, product_id)
);

COMMENT ON TABLE p2p_favorites IS 'User favorited products';


-- ==========================================================
-- INDEXES
-- ==========================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Food Delivery
CREATE INDEX idx_food_menu_cat_restaurant ON food_menu_categories(restaurant_id);
CREATE INDEX idx_food_menu_item_restaurant ON food_menu_items(restaurant_id);
CREATE INDEX idx_food_menu_item_category ON food_menu_items(category_id);
CREATE INDEX idx_food_item_extras_menu ON food_item_extras(menu_item_id);
CREATE INDEX idx_food_orders_user ON food_orders(user_id);
CREATE INDEX idx_food_orders_restaurant ON food_orders(restaurant_id);
CREATE INDEX idx_food_orders_status ON food_orders(status);
CREATE INDEX idx_food_order_items_order ON food_order_items(order_id);

-- Wallet
CREATE INDEX idx_wallet_cards_user ON wallet_cards(user_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_card ON wallet_transactions(card_id);
CREATE INDEX idx_wallet_documents_user ON wallet_documents(user_id);

-- Savings
CREATE INDEX idx_savings_goals_user ON savings_goals(user_id);

-- Marketplace
CREATE INDEX idx_marketplace_subs_user ON marketplace_subscriptions(user_id);
CREATE INDEX idx_marketplace_subs_item ON marketplace_subscriptions(item_id);

-- P2P
CREATE INDEX idx_p2p_products_user ON p2p_products(user_id);
CREATE INDEX idx_p2p_products_category ON p2p_products(category);
CREATE INDEX idx_p2p_favorites_user ON p2p_favorites(user_id);
CREATE INDEX idx_p2p_favorites_product ON p2p_favorites(product_id);


-- ==========================================================
-- TRIGGERS
-- ==========================================================

-- Auto-create profile on new user insert (for app-level handling)
CREATE OR REPLACE TRIGGER trg_profiles_auto_created
    BEFORE INSERT ON profiles
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := generate_uuid();
    END IF;
    IF :NEW.created_at IS NULL THEN
        :NEW.created_at := SYS_EXTRACT_UTC(SYSTIMESTAMP);
    END IF;
END;
/

-- ==========================================================
-- SEQUENCES (for sort_order auto-increment if needed)
-- ==========================================================
CREATE SEQUENCE seq_food_cuisine_sort START WITH 10 INCREMENT BY 1;
CREATE SEQUENCE seq_food_menu_sort START WITH 10 INCREMENT BY 1;


-- ==========================================================
-- SAMPLE DATA
-- ==========================================================

-- Insert Cuisine Categories
INSERT ALL
    INTO food_cuisine_categories (id, name, icon, sort_order) VALUES ('f0000000-0000-0000-0000-000000000001', 'Tunisien', 'TN', 0)
    INTO food_cuisine_categories (id, name, icon, sort_order) VALUES ('f0000000-0000-0000-0000-000000000002', 'Pizza', '🍕', 1)
    INTO food_cuisine_categories (id, name, icon, sort_order) VALUES ('f0000000-0000-0000-0000-000000000003', 'Burgers', '🍔', 2)
    INTO food_cuisine_categories (id, name, icon, sort_order) VALUES ('f0000000-0000-0000-0000-000000000004', 'Sushi', '🍣', 3)
    INTO food_cuisine_categories (id, name, icon, sort_order) VALUES ('f0000000-0000-0000-0000-000000000005', 'Healthy', '🥗', 4)
SELECT * FROM dual;

-- Insert Profile
INSERT INTO profiles (id, email, full_name, avatar_url)
VALUES ('00000000-0000-0000-0000-000000000000', 'nour.bensalah@supertounsi.tn', 'Nour Ben Salah', '');

-- Insert Sample Restaurants
INSERT ALL
    INTO food_restaurants (id, name, description, cuisine_type, address, city, latitude, longitude, rating, delivery_time_min, delivery_time_max, delivery_fee, min_order, is_open, image_url)
    VALUES ('f1111111-1111-1111-1111-111111111111', 'Restaurant Dar Zmen', 'Cuisine tunisienne authentique et traditionnelle', 'Tunisien', 'Rue de la Liberté, La Marsa', 'Tunis', 36.8796, 10.3244, 4.7, 30, 45, 5.000, 20.000, 1, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800')
    INTO food_restaurants (id, name, description, cuisine_type, address, city, latitude, longitude, rating, delivery_time_min, delivery_time_max, delivery_fee, min_order, is_open, image_url)
    VALUES ('f2222222-2222-2222-2222-222222222222', 'Pizza Palace', 'Les meilleures pizzas de Tunis !', 'Pizza', 'Avenue Habib Bourguiba, Tunis', 'Tunis', 36.8065, 10.1815, 4.5, 25, 40, 4.000, 15.000, 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800')
    INTO food_restaurants (id, name, description, cuisine_type, address, city, latitude, longitude, rating, delivery_time_min, delivery_time_max, delivery_fee, min_order, is_open, image_url)
    VALUES ('f3333333-3333-3333-3333-333333333333', 'Burger Hub', 'Burgers artisanaux avec des ingrédients frais', 'Burgers', 'Rue de France, Sousse', 'Sousse', 35.8256, 10.6336, 4.3, 20, 35, 3.500, 12.000, 1, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800')
SELECT * FROM dual;

-- Insert Menu Categories for Dar Zmen
INSERT ALL
    INTO food_menu_categories (id, restaurant_id, name, sort_order) VALUES ('fc000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'Entrées', 0)
    INTO food_menu_categories (id, restaurant_id, name, sort_order) VALUES ('fc000000-0000-0000-0000-000000000002', 'f1111111-1111-1111-1111-111111111111', 'Plats Principaux', 1)
    INTO food_menu_categories (id, restaurant_id, name, sort_order) VALUES ('fc000000-0000-0000-0000-000000000003', 'f1111111-1111-1111-1111-111111111111', 'Desserts', 2)
SELECT * FROM dual;

-- Insert Menu Items for Dar Zmen
INSERT ALL
    INTO food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
    VALUES ('fi000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000001', 'Brik à l''oeuf', 'Brik traditionnel avec oeuf et thon', 8.000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=500', 1, 1)
    INTO food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
    VALUES ('fi000000-0000-0000-0000-000000000002', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000002', 'Couscous Royal', 'Couscous aux légumes et à la viande', 25.000, 'https://images.unsplash.com/photo-1625944525882-1d4fad472736?q=80&w=500', 1, 1)
    INTO food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
    VALUES ('fi000000-0000-0000-0000-000000000003', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000002', 'Lablabi', 'Soupe traditionnelle tunisienne', 12.000, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=500', 1, 0)
    INTO food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
    VALUES ('fi000000-0000-0000-0000-000000000004', 'f1111111-1111-1111-1111-111111111111', 'fc000000-0000-0000-0000-000000000003', 'Makroudh', 'Dessert aux dattes', 6.000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=500', 1, 0)
SELECT * FROM dual;

-- Insert Menu Categories for Pizza Palace
INSERT ALL
    INTO food_menu_categories (id, restaurant_id, name, sort_order) VALUES ('fc000000-0000-0000-0000-000000000011', 'f2222222-2222-2222-2222-222222222222', 'Pizzas', 0)
    INTO food_menu_categories (id, restaurant_id, name, sort_order) VALUES ('fc000000-0000-0000-0000-000000000012', 'f2222222-2222-2222-2222-222222222222', 'Boissons', 1)
SELECT * FROM dual;

-- Insert Menu Items for Pizza Palace
INSERT ALL
    INTO food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
    VALUES ('fi000000-0000-0000-0000-000000000011', 'f2222222-2222-2222-2222-222222222222', 'fc000000-0000-0000-0000-000000000011', 'Margherita', 'Tomate, mozzarella, basilic', 15.000, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=500', 1, 1)
    INTO food_menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, is_popular)
    VALUES ('fi000000-0000-0000-0000-000000000012', 'f2222222-2222-2222-2222-222222222222', 'fc000000-0000-0000-0000-000000000011', 'Pepperoni', 'Tomate, mozzarella, pepperoni', 18.000, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=500', 1, 1)
SELECT * FROM dual;

-- Insert Marketplace Items
INSERT ALL
    INTO marketplace_items (id, title, description, price_text, price_amount, icon)
    VALUES ('m0000000-0000-0000-0000-000000000001', 'Smart Commerce AI', 'AI-powered inventory and customer insights for local shops.', 'From 29 TND / month', 29.000, 'apps-outline')
    INTO marketplace_items (id, title, description, price_text, price_amount, icon)
    VALUES ('m0000000-0000-0000-0000-000000000002', 'Tunisian Tax Helper', 'Automatic tax estimation and declaration assistance.', 'From 15 TND / month', 15.000, 'calculator-outline')
SELECT * FROM dual;

-- Insert P2P Products
INSERT ALL
    INTO p2p_products (id, user_id, title, description, category, price, product_condition, location, contact_info, images)
    VALUES ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'iPhone 14 Pro Space Black', 'iPhone 14 Pro en parfait état, 128 Go, santé batterie 89%. Fourni avec boîte et câble d''origine. Aucun choc.', 'Électronique', 2350.000, 'Used', 'Tunis, La Marsa', '+216 22 123 456', '["https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=500"]')
    INTO p2p_products (id, user_id, title, description, category, price, product_condition, location, contact_info, images)
    VALUES ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'Vespa Primavera 50cc', 'Superbe Vespa Primavera, couleur bleu ciel. Première main, révisée régulièrement. 8500 km au compteur. Parfaite pour la ville.', 'Véhicules', 5200.000, 'Used', 'Sousse, Kantaoui', '+216 55 987 654', '["https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=500"]')
    INTO p2p_products (id, user_id, title, description, category, price, product_condition, location, contact_info, images)
    VALUES ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'Veste en Cuir Vintage Zara', 'Veste en cuir noir Zara, taille M. Jamais portée, état neuf. Cuir véritable très souple.', 'Habillement', 280.000, 'New', 'Sfax, Ville', '+216 98 456 123', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500"]')
SELECT * FROM dual;

-- Insert Wallet Cards
INSERT ALL
    INTO wallet_cards (id, user_id, card_number, cardholder_name, expiry_date, card_type, status, balance)
    VALUES ('wc000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '5412 •••• •••• 3891', 'Nour Ben Salah', '09/28', 'Platinum', 'active', 12540.000)
    INTO wallet_cards (id, user_id, card_number, cardholder_name, expiry_date, card_type, status, balance)
    VALUES ('wc000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', '4111 •••• •••• 7720', 'Nour Ben Salah', '03/27', 'Gold', 'active', 4500.000)
SELECT * FROM dual;

-- Insert Wallet Transactions
INSERT ALL
    INTO wallet_transactions (id, user_id, card_id, title, category, amount, currency, icon)
    VALUES ('wt000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'wc000000-0000-0000-0000-000000000001', 'Café Sidi Bou', 'Food & drink', -18.500, 'TND', 'cafe-outline')
    INTO wallet_transactions (id, user_id, card_id, title, category, amount, currency, icon)
    VALUES ('wt000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'wc000000-0000-0000-0000-000000000001', 'Salary deposit', 'Salary', 2450.000, 'TND', 'arrow-down-outline')
    INTO wallet_transactions (id, user_id, card_id, title, category, amount, currency, icon)
    VALUES ('wt000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'wc000000-0000-0000-0000-000000000001', 'Bolt Tunisia', 'Transport', -42.900, 'TND', 'car-outline')
SELECT * FROM dual;

-- Insert Wallet Documents
INSERT ALL
    INTO wallet_documents (id, user_id, title, subtitle, status, icon)
    VALUES ('wd000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'National identity card', 'Expires 17 Sep 2031', 'Verified', 'card-outline')
    INTO wallet_documents (id, user_id, title, subtitle, status, icon)
    VALUES ('wd000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Proof of address', 'Issued 12 Jan 2026', 'Verified', 'document-text-outline')
SELECT * FROM dual;

COMMIT;

-- ==========================================================
-- DATA LOOKUP VIEWS (convenience views)
-- ==========================================================

CREATE OR REPLACE VIEW v_food_restaurants_with_cuisine AS
SELECT r.*, c.name AS cuisine_name, c.icon AS cuisine_icon
FROM food_restaurants r
JOIN food_cuisine_categories c ON LOWER(r.cuisine_type) LIKE '%' || LOWER(c.name) || '%';

CREATE OR REPLACE VIEW v_wallet_balance_summary AS
SELECT user_id, COUNT(*) AS card_count, SUM(balance) AS total_balance
FROM wallet_cards
WHERE status = 'active'
GROUP BY user_id;

CREATE OR REPLACE VIEW v_marketplace_active_subs AS
SELECT s.user_id, s.item_id, s.status, s.end_date, i.title, i.price_text, i.price_amount
FROM marketplace_subscriptions s
JOIN marketplace_items i ON s.item_id = i.id
WHERE s.status = 'Active';

