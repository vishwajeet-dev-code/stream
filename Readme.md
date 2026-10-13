# Stream

## Run in development with hot reload

1. Copy `backend/.env.example` to `backend/.env` and replace the token secret
   placeholders with strong, unique secrets.
2. From the repository root, run:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

The frontend is available at `http://localhost:8080`, the API at
`http://localhost:8000`, and MongoDB data is persisted in the `mongodb_data`
volume. The frontend source is mounted into the Vite dev server, so saving a
React file applies changes without restarting or rebuilding the container.

The default CORS allowlist includes both localhost frontend URLs. Copy the root
`.env.example` to `.env` to configure optional Compose values. For another
deployment hostname, set `CORS_ORIGIN` to the exact comma-separated browser
origins (including scheme and port), and set `VITE_API_BASE_URL` to the public
API URL before building. If you change the API host port, also update
`VITE_API_BASE_URL` to match.

To run the production Nginx frontend instead, use `docker compose up --build`.