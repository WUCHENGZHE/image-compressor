document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalInfo = document.getElementById('originalInfo');
    const compressedInfo = document.getElementById('compressedInfo');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;

    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', () => fileInput.click());

    // 处理拖拽上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#0056b3';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007AFF';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007AFF';
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    // 处理文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // 质量滑块变化时更新显示值和重新压缩
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalFile) compressImage(originalFile);
    });

    // 处理选择的文件
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            originalInfo.textContent = `大小: ${formatFileSize(file.size)}`;
            compressImage(file);
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 保持宽高比例
            const maxWidth = 1920;
            const maxHeight = 1080;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // 压缩
            canvas.toBlob((blob) => {
                compressedPreview.src = URL.createObjectURL(blob);
                compressedInfo.textContent = `大小: ${formatFileSize(blob.size)}`;
                downloadBtn.disabled = false;
                
                // 设置下载按钮事件
                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `compressed_${originalFile.name}`;
                    link.click();
                };
            }, 'image/jpeg', qualitySlider.value / 100);

            URL.revokeObjectURL(img.src);
        };
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 