import { useState, useEffect } from "react";
import { fetchIndustries } from "@/api/homeApi";

interface SubIndustry {
    id: string | number;
    name: string;
}

interface Industry {
    id: string | number;
    name: string;
    subIndustries: SubIndustry[];
}

export function useIndustries() {
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadIndustries = async () => {
            try {
                setLoading(true);
                const data = await fetchIndustries();
                setIndustries(data);
            } catch (err) {
                setError('Failed to load industries');
            } finally {
                setLoading(false);
            }
        };

        loadIndustries();
    }, []);

    return { industries, loading, error };
}