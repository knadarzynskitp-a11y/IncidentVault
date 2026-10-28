-- Up Migration

CREATE TABLE is_part_of_lawsuit (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawsuit_id INTEGER NOT NULL REFERENCES lawsuit(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(40) NOT NULL,
    UNIQUE (lawsuit_id, user_id)
);

-- Down Migration

DROP TABLE is_part_of_lawsuit;