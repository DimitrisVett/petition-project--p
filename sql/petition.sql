CREATE TABLE signatures(
    id SERIAL primary key,
    signature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- INSERT INTO signature (first, last, signature, created_at) VALUES ($1, $2, $3);
-- SELECT first FROM signatures ;
-- SELECT COUNT (*) FROM signatures;
