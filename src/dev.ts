import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Server running locally at http://localhost:${PORT}`);
});
