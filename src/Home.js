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
            await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update the file list with the newly uploaded file
            setFiles([...files, { name: file.name }]);
            setFile(null); // Clear the file input
            setError(null); // Clear any errors
        } catch (err) {
            console.error('Error uploading file', err);
            setError('Error uploading file.');
        }
    };

    const handleDownload = async (fileName) => {
        try {
            console.log('Downloading file', fileName);
            const response = await api.get(`/files/download/${fileName}`, {
                responseType: 'blob', // Handle binary data
            });

            // Create a link and trigger a download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Set the file name for download
            document.body.appendChild(link);
            link.click();

            // Clean up the link element
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Error downloading file', err);
            setError('Error downloading file.');
        }
    };

    return (
        <div className="container">
            <h1>Home Page</h1>
   
            

            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {error && <p className="error">{error}</p>}

            <h2>Uploaded Files</h2>
            {files.length > 0 ? (
                <ul>
                    {files.map((file, index) => (
                        <li key={index}>
                            <span>{file.name}</span>
                            <button onClick={() => handleDownload(file.name)}>
                                Download
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No files uploaded yet.</p>
            )}
        </div>
    );
};

export default Home;
