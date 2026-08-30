-- ==============================================================================
-- Vidabricks Real Estate Platform - Supabase PostgreSQL Database Schema
-- Run this SQL in your Supabase project: SQL Editor -> New Query -> Paste -> Run
-- ==============================================================================

-- 1. Create AGENTS Table
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    rera_number TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    bio TEXT NOT NULL,
    photo TEXT NOT NULL,
    hero_image TEXT,
    theme_preference TEXT DEFAULT 'midnight-gold',
    experience_years INTEGER DEFAULT 0,
    location TEXT DEFAULT 'Dubai, UAE',
    specialisations TEXT[] DEFAULT '{}',
    areas TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{"English"}',
    social JSONB DEFAULT '{}',
    focus_properties JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create BROKERAGE SETTINGS Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create LEADS / INQUIRIES Table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES public.agents(id) ON DELETE CASCADE,
    agent_name TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT NOT NULL,
    message TEXT,
    property_interest TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create ANALYTICS / EVENTS Table
CREATE TABLE IF NOT EXISTS public.analytics (
    id BIGSERIAL PRIMARY KEY,
    agent_id TEXT,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & Public Read/Write Policies
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to agents (so digital cards work for all visitors)
CREATE POLICY "Public Read Agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public Upsert Agents" ON public.agents FOR ALL USING (true) WITH CHECK (true);

-- Allow public read & update on settings
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Upsert Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Allow clients to submit leads and admin to manage them
CREATE POLICY "Public Access Leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous event tracking
CREATE POLICY "Public Insert Analytics" ON public.analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Analytics" ON public.analytics FOR SELECT USING (true);

-- 6. Insert Initial Seed Data (Vidabricks Agents)
INSERT INTO public.agents (
    id, slug, first_name, last_name, job_title, rera_number, phone, whatsapp, email, bio, photo, theme_preference, experience_years, location, specialisations, areas, languages, social, focus_properties, status
) VALUES 
(
    'agent-1',
    'john-doe',
    'John',
    'Doe',
    'Senior Luxury Property Consultant',
    '52841',
    '+971 50 123 4567',
    '+971 50 123 4567',
    'john.doe@vidabricks.com',
    'Over 8 years of distinguished expertise in Dubai prime waterfront residences, ultra-luxury penthouses, and high-yield off-plan master developments. Committed to delivering bespoke investment advisory with absolute discretion.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
    'midnight-gold',
    8,
    'Dubai, UAE',
    ARRAY['Off-Plan', 'Residential Sales', 'Luxury Properties', 'Investment Advisory'],
    ARRAY['Palm Jumeirah', 'Downtown Dubai', 'Dubai Hills Estate', 'Arabian Ranches'],
    ARRAY['English', 'Arabic', 'French'],
    '{"linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "website": "https://agents.vidabricks.com/agents/john-doe"}'::jsonb,
    '[
        {
            "id": "prop-1",
            "title": "Palm Beach Towers Luxury Residences",
            "developer": "Nakheel",
            "location": "Palm Jumeirah",
            "startingPrice": "AED 3,850,000",
            "type": "1-3 Bedroom Waterfront Suites",
            "imageUrl": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            "tag": "Waterfront Living"
        },
        {
            "id": "prop-2",
            "title": "Burj Crown Sky Penthouse",
            "developer": "Emaar",
            "location": "Downtown Dubai",
            "startingPrice": "AED 8,200,000",
            "type": "4 Bedroom Sky Penthouse",
            "imageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            "tag": "Burj Khalifa Views"
        }
    ]'::jsonb,
    'active'
),
(
    'agent-2',
    'sarah-al-mansoori',
    'Sarah',
    'Al-Mansoori',
    'Director of Prime Residential',
    '41920',
    '+971 52 987 6543',
    '+971 52 987 6543',
    'sarah.mansoori@vidabricks.com',
    'Specialising in bespoke villa communities and private golf estate portfolios for high-net-worth individuals and family offices across the GCC.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    'champagne',
    11,
    'Dubai, UAE',
    ARRAY['Villas & Mansions', 'Private Estates', 'Off-Plan Portfolios'],
    ARRAY['Emirates Hills', 'Dubai Hills Estate', 'Jumeirah Golf Estates'],
    ARRAY['English', 'Arabic'],
    '{"linkedin": "https://linkedin.com", "instagram": "https://instagram.com"}'::jsonb,
    '[]'::jsonb,
    'active'
),
(
    'agent-3',
    'mikhail-romanov',
    'Mikhail',
    'Romanov',
    'International Investment Specialist',
    '63219',
    '+971 55 444 8899',
    '+971 55 444 8899',
    'mikhail.r@vidabricks.com',
    'Guiding European and CIS institutional & private buyers through tax-efficient Dubai real estate acquisitions with verified high rental yields.',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
    'dubai-sunset',
    6,
    'Dubai, UAE',
    ARRAY['Off-Plan', 'Commercial', 'Golden Visa Advisory'],
    ARRAY['Business Bay', 'DIFC', 'Dubai Marina', 'Bluewaters'],
    ARRAY['English', 'Russian'],
    '{"linkedin": "https://linkedin.com", "instagram": "https://instagram.com"}'::jsonb,
    '[]'::jsonb,
    'active'
)
ON CONFLICT (id) DO NOTHING;
