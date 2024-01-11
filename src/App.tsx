import React, { useState } from 'react';
import './App.css';
import axios from "./api/axios.ts";

function App() {
    const [text, setText] = useState('');
    const [corrections, setCorrections] = useState([]);
    const checkSpelling = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevents the default form submission behavior
        try {
            const response = await axios.post('https://spellcheck-server.onrender.com/textgears/spellcheck', {
                text
            });
            setCorrections(response.data ?? [])
        } catch (error) {
            console.error('Error during API request:', error);
        }
    }
    const renderTextWithHighlights = () => {
        let lastIndex = 0;
        const segments = [];
        if(corrections.length === 0){
            return null
        }
        corrections.forEach((correction:{offset:number, length:number}, index) => {
            // Text before the misspelled word
            segments.push(text.substring(lastIndex, correction.offset));

            // The misspelled word itself
            segments.push(
                <mark key={index}>
                    {text.substring(correction.offset, correction.offset + correction.length)}
                </mark>
            );

            lastIndex = correction.offset + correction.length;
        });

        // Remaining text after the last correction
        segments.push(text.substring(lastIndex));

        return segments;
    };

    return (
        <>
            <form onSubmit={checkSpelling}>
                <input
                    type="text"
                    name="text"
                    value={text}
                    onChange={(e) => {
                        setCorrections([])
                        setText(e.target.value)
                    }} // Update state on change
                />
                <button type="submit">Check</button>
            </form>

            <div>{renderTextWithHighlights()}</div>

            {corrections.length > 0 && corrections.map((correction:{id:string,bad:string,better:string[]}) => (
                <div key={correction.id}>
                    <p>Mistake: {correction.bad}</p>
                    <p>Suggestions: {correction.better.join(', ')}</p>
                </div>
            ))}
        </>
    );
}

export default App;
