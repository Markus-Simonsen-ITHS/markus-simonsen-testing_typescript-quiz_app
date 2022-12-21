To run this project, please follow the steps below:

1. Install the dependencies

```bash
npm install
```

This needs to be done in both the server and terminal-quiz directories.

2. Run the server

```bash
npm run start
```

3. Run the client

```bash
npm run dev
```

This produces some weird output, but this does not appear in production.
Here is how you can run the project in production:

```bash
npm run build
npm run preview
```

4. Run the tests

```bash
npm run test
```

5. Run cyress tests

```bash
npx cypress open
```

This requires the server to be running.
