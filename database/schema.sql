-- Rules-as-Code Platform Database Schema
-- PostgreSQL 15+

-- Create tables for scenarios
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(255),
    gross_income DECIMAL(10, 2) NOT NULL,
    pension_percentage DECIMAL(5, 2) DEFAULT 0,
    housing_costs DECIMAL(10, 2) DEFAULT 0,
    children INTEGER DEFAULT 0,
    marital_status VARCHAR(50) DEFAULT 'single',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tax_amount DECIMAL(10, 2),
    benefits_total DECIMAL(10, 2),
    net_income DECIMAL(10, 2)
);

-- Create table for calculation history
CREATE TABLE IF NOT EXISTS calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES scenarios(id),
    calculation_type VARCHAR(100),
    input_data JSONB,
    output_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for rules
CREATE TABLE IF NOT EXISTS rules (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    year INTEGER,
    legal_reference VARCHAR(500),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_at ON scenarios(created_at);
CREATE INDEX IF NOT EXISTS idx_calculations_scenario_id ON calculations(scenario_id);

-- Insert base rules
INSERT INTO rules (id, name, description, category, year, legal_reference) VALUES
    ('income_tax', 'Inkomstenbelasting', 'Dutch income tax calculation', 'tax', 2025, 'Wet inkomstenbelasting 2001'),
    ('aow_premium', 'AOW Premie', 'Old age insurance premium', 'social', 2025, 'Algemene Ouderdomswet'),
    ('ww_premium', 'WW Premie', 'Unemployment insurance premium', 'social', 2025, 'Werkloosheidswet'),
    ('huurtoeslag', 'Huurtoeslag', 'Housing allowance', 'benefits', 2025, 'Wet huurtoeslag'),
    ('zorgtoeslag', 'Zorgtoeslag', 'Healthcare subsidy', 'benefits', 2025, 'Zorgverzekeringswet'),
    ('kindgebonden_budget', 'Kindgebonden Budget', 'Child benefit', 'benefits', 2025, 'Kinderbijslagwet')
ON CONFLICT (id) DO NOTHING;
