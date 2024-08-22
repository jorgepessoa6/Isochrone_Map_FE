import {BACKEND_ENDPOINT} from "../App";
import {IsochroneRequest} from "../types/Isochrone";

class MapService {
    async isochroneInformation(body: IsochroneRequest, profile: string): Promise<any> {
        try {
            const response = await fetch(BACKEND_ENDPOINT + '/v2/isochrones/' + profile, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            });
            // Check if the request was successful (status code 2xx)
            if (response.ok) {
                return await response.json(); // You can modify this based on your needs
            } else {
                // If the request was not successful, handle the error
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

        } catch (error) {
            throw error;
        }
    }
}

export default new MapService();