function decode64Binary(data)
{
    const binary = atob(data);
    const binary_buffer = new Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        binary_buffer[i] = binary.charCodeAt(i);
    };
    return binary_buffer;
};

function downloadFile(binary_string)
{
    let decoded_binary = decode64Binary(binary_string);
    let int_array = new Uint8Array(decoded_binary);
    let blob = new Blob([int_array],{type: 'image/jpeg'});
    const dl_link = document.createElement("a");
    let dl_url = window.URL.createObjectURL(blob)
    dl_link.href = dl_url;
    dl_link.setAttribute("download", "hello_world.jpg");
    dl_link.click();
    dl_link.remove();
    window.URL.revokeObjectURL(dl_url);
    delete blob;
    delete int_array;
};

// let element = document.getElementById("containing_element");
// Not a productive way of sending/downloading files on the browser but was an interesting exercise. 
// This causes browser to receive all files in binary and store inside elements. May not be memory efficient when creating many blobs with file clicked on nor in document size.
// Methods here may be used in other functionalities.
// let data = element.getAttribute("data")
// downloadFile(data);