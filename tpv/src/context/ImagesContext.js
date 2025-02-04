import { createContext } from "react";
import { useState } from "react";
import api from "../utils/api";

export const ImageContext = createContext();

export const ImagesProvider = ({ children }) => {
  const [dragging, setDragging] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // ✅ Manejo de arrastrar y soltar imágenes (Drag & Drop)
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e, setFormData) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/images/upload-image", formData);
      if (response.data.imageUrl) {
        setFormData((prev) => ({ ...prev, img: response.data.imageUrl }));
        setImageFile(file);
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  const handleFileChange = async (e, setFormData) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/images/upload-image", formData);
      if (response.data.imageUrl) {
        setFormData((prev) => ({ ...prev, img: response.data.imageUrl }));
        setImageFile(file);
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file); // Debe coincidir con `upload.single('file')` en el backend

    try {
      const response = await fetch(`${process.env.REACT_APP_SOCKET_URL}/api/images/upload-image`, {
        method: "POST",
        body: formData, // No agregues `Content-Type`, fetch lo maneja automáticamente
      });

      const data = await response.json();

      if (data.filename) {
        return data.imageUrl;
      } else {
        console.error("❌ Error al subir la imagen");
        return null;
      }
    } catch (err) {
      console.error("❌ Error en la solicitud:", err);
      return null;
    }
  };

  return (
    <ImageContext.Provider value={{ uploadImage, handleDragOver, handleDragLeave, handleDrop, handleFileChange, dragging, imageFile }}>
      {children}
    </ImageContext.Provider>
  );
};
