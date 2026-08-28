CREATE TABLE IF NOT EXISTS active_calls (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    caller_type VARCHAR(20) NOT NULL,
    caller_name VARCHAR(255),
    receiver_type VARCHAR(20) NOT NULL,
    receiver_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'RINGING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_active_calls_order_id ON active_calls(order_id);
CREATE INDEX IF NOT EXISTS idx_active_calls_status ON active_calls(status);
