import React, { useState, useEffect } from 'react';
import api from './api/ClientApi';

const Home = () => {
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user files on component mount
        const fetchFiles = async () => {
            try {
                const response = await api.get('/files/files');
                setFiles(response.data);
            } catch (err) {
                console.error('Error fetching files', err);
            }
        };
        fetchFiles();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update the file list with the newly uploaded file
            setFiles([...files, { name: file.name, url: response.data.url }]);
            setFile(null); // Clear the file input
            setError(null); // Clear any errors
        } catch (err) {
            console.error('Error uploading file', err);
            setError('Error uploading file.');
        }
    };

    return (
        <div className="container">
            <h1>Home Page</h1>

            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {error && <p className="error">{error}</p>}

            <h2>Uploaded Files</h2>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                            {file.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
