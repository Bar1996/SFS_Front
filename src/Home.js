import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faTrash, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from './api/ClientApi';
import styles from './style/Home.module.css';
import { useNavigate } from 'react-router-dom';


const Home = () => {
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state for fetching files
    const [loadingUpload, setLoadingUpload] = useState(false); // Loading state for file upload
    const [renamingFile, setRenamingFile] = useState(null); // For tracking the file being renamed
    const [newFileName, setNewFileName] = useState(''); // New file name
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await api.get('/files/files');
                setFiles(response.data);
            } catch (err) {
                setError('Error fetching files');
                console.error('Error fetching files', err);
            } finally {
                setLoading(false); // Stop loading once fetch completes
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

        setLoadingUpload(true); // Start upload loading

        try {
            const response = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Add the new file data to the existing files array
            setFiles((prevFiles) => [
                ...prevFiles,
                {
                    name: response.data.name,
                    size: response.data.size,
                    modified: response.data.modified,
                    url: response.data.url,
                },
            ]);

            // Reset the file input and error state
            setFile(null);
            setError(null);
        } catch (err) {
            setError('Error uploading file.');
            console.error('Error uploading file', err);
        } finally {
            setLoadingUpload(false); // Stop upload loading
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const response = await api.get(`/files/download/${fileName}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            setError('Error downloading file.');
            console.error('Error downloading file', err);
        }
    };

    const handleDelete = async (fileName) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName}"?`);
        if (confirmDelete) {
            try {
                await api.delete(`/files/${fileName}`);
                setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
            } catch (err) {
                setError('Error deleting file.');
                console.error('Error deleting file', err);
            }
        }
    };

    const handleRename = async (fileName) => {
        try {
            const response = await api.patch(`/files/rename/${fileName}`, { newFileName });

            // Update the file name in the state
            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.name === fileName
                        ? { ...file, name: response.data.newFileName, url: `/files/download/${response.data.newFileName}` } // Update URL and name
                        : file
                )
            );

            setRenamingFile(null);
            setNewFileName('');
        } catch (err) {
            setError('Error renaming file.');
            console.error('Error renaming file', err);
        }
    };

    const cancelRename = () => {
        setRenamingFile(null);
        setNewFileName('');
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatSize = (size) => {
        const i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    const handleLogout = async () => {
        try {
            // Send logout request to the backend
            const response = await api.get('/auth/logout');
            
            if (response.status === 200) {
                // Clear any local data such as tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Redirect to the login page
                navigate('/');
            } else {
                console.error('Logout failed:', response.data);
                // Optionally show an error message to the user
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            // Handle errors gracefully, e.g., show an error message to the user
            alert('An error occurred during logout. Please try again.');
        }
    };

    return (
        <div className={styles.homeContainer}>
           <header className={styles.homeHeader}>
    <div className={styles.headerActions}>
        <label htmlFor="file-upload" className={styles.customFileUpload}>
            +
        </label>
        <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />
        <div className={styles.fileNameDisplay}>
            {file ? file.name : 'No file selected'}
        </div>
        <button
            className={styles.uploadButton}
            onClick={handleUpload}
            disabled={!file || loadingUpload}
        >
            {loadingUpload ? 'Uploading...' : <FontAwesomeIcon icon={faUpload} />}
        </button>
    </div>

    <h1>Secure Storage</h1>

    <button className={styles.logoutButton} onClick={() => handleLogout()}>
        Logout
    </button>
</header>
            <main className={styles.fileDisplay}>
                {error && <p className={styles.error}>{error}</p>}
                {loading ? (
                    <div className={styles.spinner}></div>
                ) : files.length > 0 ? (
                    <div className={styles.fileTable}>
                        <div className={styles.fileTableHeader}>
                            <span>Name</span>
                            <span>Modified</span>
                            <span>File size</span>
                            <span>Actions</span>
                        </div>
                        {files.map((file, index) => (
                            <div key={index} className={styles.fileRow}>
                                <span className={styles.fileName}>
                                    {renamingFile === file.name ? (
                                        <div className={styles.renameContainer}>
                                            <input
                                                value={newFileName}
                                                onChange={(e) => setNewFileName(e.target.value)}
                                                className={styles.renameInput}
                                                placeholder={file.name}
                                            />
                                            <button
                                                className={styles.cancelRenameButton}
                                                onClick={cancelRename}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                            <button
                                                className={styles.saveRenameButton}
                                                onClick={() => handleRename(file.name)}
                                            >
                                                <FontAwesomeIcon icon={faSave} />
                                            </button>
                                        </div>
                                    ) : (
                                        file.name
                                    )}
                                </span>
                                <span className={styles.fileModified}>
                                    {formatDate(file.modified)}
                                </span>
                                <span className={styles.fileSize}>
                                    {formatSize(file.size)}
                                </span>
                                <div className={styles.fileActions}>
                                    <button
                                        className={styles.downloadButton}
                                        onClick={() => handleDownload(file.name)}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDelete(file.name)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    {renamingFile !== file.name && (
                                        <button
                                            className={styles.renameButton}
                                            onClick={() => setRenamingFile(file.name)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noFilesMessage}>
                        <p>No files uploaded yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;