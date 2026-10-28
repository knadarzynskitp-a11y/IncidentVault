-- Up Migration

CREATE TABLE files_evidences (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidences(id),
    original_name VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER NOT NULL REFERENCES users(id)
);

-- Down Migration

DROP TABLE files_evidences;