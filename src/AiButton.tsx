import { useState } from 'react';

const AiButton = () => {
    const [funFact, setFunFact] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchFunFact = async () => {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/fun-fact');
        const data = await response.json();
        setFunFact(data.funFact);
        setLoading(false);
    }

    return (
        <>
        {loading ? <div className="absolute top-2 left-10 bg-blue-500 text-white font-bold py-2 px-4 rounded z-10">Ladataan</div> : (
        <button 
        className="absolute top-2 left-10 bg-blue-500 text-white font-bold py-2 px-4 rounded z-10 cursor-pointer"
        onClick={fetchFunFact}>
            Hauska fakta
        </button>
        )}
        {funFact ? (
            <div className="absolute top-16 left-0 bg-white p-4 rounded shadow-md mx-10 my-2">
                {funFact}
                <button
                    className="absolute top-2 right-2 text-red-500 cursor-pointer"
                    onClick={() => setFunFact('')}
                >
                    x
                </button>
            </div>
            ) : null}
        </>
    );
};

export default AiButton;
        