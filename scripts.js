const modelViewer = document.querySelector('#model');
const shareControls = document.createElement('div');
shareControls.className = 'share-controls';
shareControls.innerHTML = `
    <button class="share-button" id="shareButton">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
        Share Viewer
    </button>
    <div class="link-container">
        <input type="text" id="shareLink" readonly>
        <button class="share-button" id="copyButton">Copy</button>
        <div id="qrCode" class="qr-code"></div>
    </div>
`;
document.querySelector('main').appendChild(shareControls);

// Add QR Code library
const qrScript = document.createElement('script');
qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
document.head.appendChild(qrScript);

async function generateShareLink() {
    const params = new URLSearchParams();
    if (currentGlbUrl) params.append('glb', await getDataUrlFromBlob(currentGlbUrl));
    if (currentUsdzUrl) params.append('usdz', await getDataUrlFromBlob(currentUsdzUrl));
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    return shareUrl;
}

async function getDataUrlFromBlob(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

// Share button handler
document.getElementById('shareButton').addEventListener('click', async () => {
    try {
        const shareUrl = await generateShareLink();
        const linkContainer = document.querySelector('.link-container');
        const shareLinkInput = document.getElementById('shareLink');
        
        shareLinkInput.value = shareUrl;
        linkContainer.style.display = 'block';

        // Generate QR Code
        QRCode.toCanvas(document.getElementById('qrCode'), shareUrl, { width: 150 }, (error) => {
            if (error) console.error('QR Code generation failed:', error);
        });

        // Web Share API
        if (navigator.share) {
            navigator.share({
                title: 'View my 3D Model',
                url: shareUrl
            });
        }
    } catch (error) {
        console.error('Sharing failed:', error);
    }
});

// Copy button handler
document.getElementById('copyButton').addEventListener('click', () => {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
});

// Load from URL parameters
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('glb')) {
        modelViewer.src = params.get('glb');
    }
    
    if (params.has('usdz')) {
        modelViewer.iosSrc = params.get('usdz');
    }
});

// Modified upload handlers to use FileReader
document.getElementById('glbUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        const dataUrl = await readFileAsDataURL(file);
        if (currentGlbUrl) URL.revokeObjectURL(currentGlbUrl);
        currentGlbUrl = dataUrl;
        modelViewer.src = currentGlbUrl;
    }
});

document.getElementById('usdzUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.usdz')) {
        const dataUrl = await readFileAsDataURL(file);
        if (currentUsdzUrl) URL.revokeObjectURL(currentUsdzUrl);
        currentUsdzUrl = dataUrl;
        modelViewer.iosSrc = currentUsdzUrl;
    }
});

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}
