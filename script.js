document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const browseBtn = document.getElementById('browse-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const availableFilesList = document.getElementById('available-files-list');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropArea.classList.add('highlight');
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle browse button click
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering dropArea click
        fileElem.click();
    });

    // Handle clicking anywhere in drop area
    dropArea.addEventListener('click', () => {
        fileElem.click();
    });

    // Handle file selection
    fileElem.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        [...files].forEach(uploadFile);
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function uploadFile(file) {
        // Create file UI item
        const fileId = `file-${Math.random().toString(36).substr(2, 9)}`;
        
        const fileItemHtml = `
            <div class="file-item" id="${fileId}">
                <div class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-size">${formatBytes(file.size)}</div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="progress-${fileId}"></div>
                    </div>
                </div>
                <div class="file-status status-uploading" id="status-${fileId}">0%</div>
            </div>
        `;
        
        uploadProgress.insertAdjacentHTML('afterbegin', fileItemHtml);
        
        // Progressively read the file strictly locally
        simulateUpload(fileId, file);
    }

    function simulateUpload(fileId, file) {
        const progressBar = document.getElementById(`progress-${fileId}`);
        const statusText = document.getElementById(`status-${fileId}`);
        const fileElement = document.getElementById(fileId);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15; // Faster local upload simulation
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                statusText.textContent = 'Done';
                statusText.classList.remove('status-uploading');
                statusText.classList.add('status-success');
                progressBar.style.background = 'var(--success)';
                
                // Add the file directly to our Available Downloads list
                addFileToAvailableDownloads(file);
                
                // Hide the upload progress bar shortly after it finishes
                setTimeout(() => {
                    if (fileElement) {
                        fileElement.style.opacity = '0';
                        setTimeout(() => fileElement.remove(), 300);
                    }
                }, 2000);
            } else {
                statusText.textContent = `${Math.round(progress)}%`;
            }
            progressBar.style.width = `${progress}%`;
        }, 100);
    }

    function addFileToAvailableDownloads(file) {
        if (!availableFilesList) return;
        
        // Create an Object URL from the exact file the user uploaded allowing immediate download
        const downloadUrl = URL.createObjectURL(file);
        
        const dateString = new Date().toISOString().split('T')[0];
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatBytes(file.size)} &bull; ${dateString} (Local)</div>
            </div>
            <a href="${downloadUrl}" download="${file.name}" class="download-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </a>
        `;
        
        availableFilesList.prepend(fileItem);
    }

    // --- Available Files Mock Data (Optional placeholder) ---
    const mockFiles = [
        { name: 'Project_Presentation.pdf', size: 4500000, date: '2026-03-25' },
        { name: 'Design_Assets.zip', size: 28500000, date: '2026-03-26' }
    ];

    function renderInitialMockFiles() {
        if (!availableFilesList) return;
        
        mockFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.animationDelay = `${index * 0.1}s`;
            
            const blob = new Blob(['Mock file content for ' + file.name], { type: 'text/plain' });
            const downloadUrl = URL.createObjectURL(blob);
            
            fileItem.innerHTML = `
                <div class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-size">${formatBytes(file.size)} &bull; ${file.date}</div>
                </div>
                <a href="${downloadUrl}" download="${file.name}" class="download-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                </a>
            `;
            
            availableFilesList.appendChild(fileItem);
        });
    }

    renderInitialMockFiles();
});
