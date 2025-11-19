'use strict';

import { micboard, updateHash } from './app.js';

export function initImageEditor() {
    if (micboard.settingsMode === 'IMAGES') {
        return;
    }

    micboard.settingsMode = 'IMAGES';
    updateHash();

    $('#micboard').hide();
    $('.settings').hide();
    $('.images-editor').show();

    renderImageList();

    $('#upload-image-btn').off('click').on('click', function () {
        $('#image-upload-input').click();
    });

    $('#image-upload-input').off('change').on('change', function () {
        const file = this.files[0];
        if (file) {
            uploadImage(file);
        }
    });
}

function renderImageList() {
    fetch('/api/images')
        .then(response => response.json())
        .then(files => {
            const listContainer = $('#image-list');
            listContainer.empty();

            files.forEach(filename => {
                const item = $(`
          <div class="col-md-3 col-sm-4 col-6 mb-4">
            <div class="card h-100">
              <a href="/bg/${filename}" target="_blank">
                <img src="/bg/${filename}" class="card-img-top" alt="${filename}" style="height: 150px; object-fit: cover;">
              </a>
              <div class="card-body p-2">
                <h6 class="card-title text-truncate" title="${filename}">${filename}</h6>
                <div class="btn-group btn-group-sm w-100" role="group">
                  <button type="button" class="btn btn-outline-primary rename-btn" data-filename="${filename}">Rename</button>
                  <button type="button" class="btn btn-outline-danger delete-btn" data-filename="${filename}">Delete</button>
                </div>
                <a href="/bg/${filename}" download="${filename}" class="btn btn-sm btn-outline-secondary w-100 mt-1">Download</a>
              </div>
            </div>
          </div>
        `);
                listContainer.append(item);
            });

            $('.rename-btn').click(function () {
                const filename = $(this).data('filename');
                const newName = prompt("Enter new name (must end in .jpg):", filename);
                if (newName && newName !== filename) {
                    renameImage(filename, newName);
                }
            });

            $('.delete-btn').click(function () {
                const filename = $(this).data('filename');
                if (confirm(`Are you sure you want to delete ${filename}?`)) {
                    deleteImage(filename);
                }
            });
        });
}

function uploadImage(file) {
    if (!file.name.toLowerCase().endsWith('.jpg')) {
        alert('Only .jpg files are allowed.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/images?action=upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                renderImageList();
            } else {
                alert('Upload failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Upload failed.');
        });
}

function renameImage(oldName, newName) {
    if (!newName.toLowerCase().endsWith('.jpg')) {
        alert('Filename must end with .jpg');
        return;
    }

    fetch('/api/images?action=rename', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ old_name: oldName, new_name: newName })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                renderImageList();
            } else {
                alert('Rename failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Rename failed.');
        });
}

function deleteImage(filename) {
    fetch('/api/images?action=delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: filename })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                renderImageList();
            } else {
                alert('Delete failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Delete failed.');
        });
}
