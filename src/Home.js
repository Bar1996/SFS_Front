import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faDownload,
  faTrash,
  faEdit,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import api from "./api/ClientApi";
import styles from "./style/Home.module.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingAction, setLoadingAction] = useState(""); // Use string for more clarity
  const [renamingFile, setRenamingFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get("/files/files");
        setFiles(response.data);
      } catch (err) {
        setError("Error fetching files");
        console.error("Error fetching files", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoadingUpload(true);

    try {
      const response = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFiles((prevFiles) => [
        ...prevFiles,
        {
          name: response.data.name,
          size: response.data.size,
          modified: response.data.modified,
          url: response.data.url,
        },
      ]);

      setFile(null);
      setError(null);
    } catch (err) {
      setError("Error uploading file.");
      console.error("Error uploading file", err);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDownload = async (fileName) => {
    console.log("Setting loadingAction for download:", `download-${fileName}`);
    setLoadingAction(`download-${fileName}`);
    try {
      const response = await api.get(`/files/download/${fileName}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Error downloading file.");
      console.error("Error downloading file", err);
    } finally {
      console.log("Resetting loadingAction after download");
      setLoadingAction(""); // Reset loading state
    }
  };

  const handleDelete = async (fileName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    );
    if (confirmDelete) {
      setLoadingAction(`delete-${fileName}`);
      try {
        await api.delete(`/files/${fileName}`);
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
      } catch (err) {
        setError("Error deleting file.");
        console.error("Error deleting file", err);
      } finally {
        setLoadingAction("");
      }
    }
  };

  const handleRename = async (fileName) => {
    setLoadingAction(`rename-${fileName}`);
    try {
      const response = await api.patch(`/files/rename/${fileName}`, {
        newFileName,
      });
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.name === fileName
            ? {
                ...file,
                name: response.data.newFileName,
                url: `/files/download/${response.data.newFileName}`,
              }
            : file
        )
      );
      setRenamingFile(null);
      setNewFileName("");
    } catch (err) {
      setError("Error renaming file.");
      console.error("Error renaming file", err);
    } finally {
      setLoadingAction("");
    }
  };

  const cancelRename = () => {
    setRenamingFile(null);
    setNewFileName("");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatSize = (size) => {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      (size / Math.pow(1024, i)).toFixed(2) * 1 +
      " " +
      ["B", "KB", "MB", "GB", "TB"][i]
    );
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      const response = await api.get("/auth/logout");
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred during logout. Please try again.");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <header className={styles.homeHeader}>
        <div className={styles.headerActions}>
          <div className={styles.uploadContainer}>
            <label htmlFor="file-upload" className={styles.customFileUpload}>
              +
            </label>
            <input
              id="file-upload"
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div className={styles.fileNameDisplay}>
              {file ? file.name : "No file selected"}
            </div>
          </div>
          <button
            className={styles.uploadButton}
            onClick={handleUpload}
            disabled={!file || loadingUpload}
          >
            {loadingUpload ? (
              "Uploading..."
            ) : (
              <FontAwesomeIcon icon={faUpload} />
            )}
          </button>
        </div>
        <h1>Secure Storage</h1>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          disabled={loadingLogout}
        >
          {loadingLogout ? (
            <div className={styles.spinnerSmallLogout}></div>
          ) : (
            "Logout"
          )}
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
                      <div className={styles.fileActions}>
                        <button
                          className={styles.saveRenameaButton}
                          onClick={() => handleRename(file.name)}
                        >
                          {loadingAction === `rename-${file.name}` ? (
                            <div className={styles.spinnerSmall}></div>
                          ) : (
                            <FontAwesomeIcon icon={faSave} />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    file.name
                  )}
                </span>
                <span className={styles.fileModified}>
                  {formatDate(file.modified)}
                </span>
                <span className={styles.fileSize}>{formatSize(file.size)}</span>
                <div className={styles.fileActions}>
                  <button
                    className={styles.downloadButton}
                    onClick={() => handleDownload(file.name)}
                    disabled={loadingAction === `download-${file.name}`}
                  >
                    {loadingAction === `download-${file.name}` ? (
                      <div className={styles.spinnerSmall}></div>
                    ) : (
                      <FontAwesomeIcon icon={faDownload} />
                    )}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(file.name)}
                    disabled={loadingAction === `delete-${file.name}`}
                  >
                    {loadingAction === `delete-${file.name}` ? (
                      <div className={styles.spinnerSmall}></div>
                    ) : (
                      <FontAwesomeIcon icon={faTrash} />
                    )}
                  </button>
                  {renamingFile !== file.name && (
                    <button
                      className={styles.renameButton}
                      onClick={() => setRenamingFile(file.name)}
                      disabled={loadingAction === `rename-${file.name}`}
                    >
                      {loadingAction === `rename-${file.name}` ? (
                        <div className={styles.spinnerSmall}></div>
                      ) : (
                        <FontAwesomeIcon icon={faEdit} />
                      )}
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
