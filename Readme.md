# Stream

## Run with Docker Compose

Copy `.env.example` to `.env` and set strong, unique values for
`ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`. Add the Cloudinary credentials
if you want to use upload features. Docker Compose reads this project-root
`.env`; it does not load `backend/.env`. Then build and start the app:

```sh
docker compose up --build
```

The frontend is available at <http://localhost:3000>, the backend at
<http://localhost:8000>, and MongoDB at `localhost:27017`. MongoDB data is
persisted in the `mongo-data` volume. Stop the services with
`docker compose down`; the volume remains unless explicitly removed.