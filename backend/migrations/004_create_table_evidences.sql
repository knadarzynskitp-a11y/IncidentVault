-- Up Migration

CREATE TABLE evidences (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawsuit_id INTEGER NOT NULL REFERENCES lawsuit(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(120) NOT NULL,
    opis VARCHAR(120)
);

-- Down Migration
DROP TABLE evidences;