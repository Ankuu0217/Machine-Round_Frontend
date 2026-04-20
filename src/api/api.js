import axios from 'axios';

const ACCESS_KEY = "AXDLHEJxjkTuyXGoXH1xtOIPnsK-E7xMQOrRD3QIP0A";

// Axios instance pre-configured for Unsplash
const unsplashClient = axios.create({
    baseURL: 'https://api.unsplash.com',
    headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
    },
});

const baseApiCall = async (query) => {
    try {
        const response = await unsplashClient.get('/search/photos', {
            params: {
                query: encodeURIComponent(query),
                per_page: 20,
            },
        });

        // axios auto-parses JSON — data is already the object
        return response.data;

    } catch (err) {
        // axios throws for any non-2xx status (401, 403, etc.)
        const status = err.response?.status;
        const message = err.response?.data?.errors?.[0] || err.message;

        console.error(`Unsplash API error [${status}]:`, message);

        return { error: message, results: [] };
    }
};

export default baseApiCall;
