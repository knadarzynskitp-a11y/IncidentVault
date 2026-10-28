-- Up Migration

CREATE TABLE refreshtokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hashedrefreshtoken VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Down Migration

DROP TABLE refreshtokens;