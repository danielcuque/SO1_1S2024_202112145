import React, { useState } from 'react';
import Webcam from 'react-webcam';

const App = () => {
  const [photos, setPhotos] = useState<{ base64Image: string; uploadDate: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const webcamRef = React.useRef<Webcam>(null);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    
    if (imageSrc) {
      const blob = dataURItoBlob(imageSrc);
      const file = new File([blob], 'captured-photo.png', { type: 'image/png' });
      setSelectedFile(file);
    }
  };

  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  };

  const uploadPhoto = async () => {
    try {
      if (selectedFile) {
        const formData = {
          uploadDate: new Date().toISOString(),
          base64Image: await fileToBase64(selectedFile),
        }

        console.log('formData:', formData);
  
        await fetch('http://localhost:3001/api/photos', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
  
        // Actualizar la lista de fotos después de la carga
        fetchPhotos();
  
        // Limpiar la imagen después de la carga
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result?.toString().split(',')[1] || ''); // Obtén solo la parte de datos base64 (después de la coma)
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  return (
    <div>
      <h1>Photo App</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        style={{ zIndex: 2, width: 400, height: 300 }}
      />
      <button onClick={capturePhoto}>Capture Photo</button>
      {selectedFile && (
        <img
          src={URL.createObjectURL(new Blob([selectedFile]))}
          alt="Captured"
          style={{ width: 400, height: 300 }}
        />
      )}
      <button onClick={uploadPhoto}>Upload Photo</button>

      <div>
        <h2>Photos</h2>
        <ul>
          {photos.map((photo, index) => (
            <li key={index}>
              <img src={photo.base64Image} alt={`Photo ${index}`} />
              <p>Uploaded on: {new Date(photo.uploadDate).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
