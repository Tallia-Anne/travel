import { useEffect, useRef, useState } from "react";
import { FaRegFileImage } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";

const ImageSelector = ({ image, setImage, handleDeleteImg }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Gestion de la sélection de fichier
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    
    // Vérifier que le fichier sélectionné est bien une image
    if (file && file.type.startsWith("image/")) {
      setImage(file); // Mettre à jour l'image dans l'état parent
      console.log("Image sélectionnée :", file); // Débogage : afficher l'image sélectionnée
    } else {
      console.error("Le fichier sélectionné n'est pas une image");
    }
  };

  // Fonction pour déclencher la sélection de fichier
  const onChooseFile = () => {
    inputRef.current.click();
  };

    const handleRemoveImage = () => {

    setImage(null);
    handleDeleteImg();
}

  // Effet pour gérer la prévisualisation de l'image
  useEffect(() => {
    if (image && image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl); // Générer l'URL de prévisualisation
      console.log("URL de prévisualisation créée :", objectUrl); // Débogage : afficher l'URL de prévisualisation

      // Nettoyer l'URL de l'ancienne prévisualisation pour éviter les fuites de mémoire
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewUrl(null); // Réinitialiser la prévisualisation si aucune image n'est sélectionnée
    }
  }, [image]);




  return (
    <div>
      {/* Input caché pour le fichier */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      {/* Bouton ou prévisualisation */}
      {!image ? (
        <button
          className="w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50"
          onClick={onChooseFile}
        >
          <div className="w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border border-cyan-100">
            <FaRegFileImage className="text-xl text-cyan-500" />
          </div>
          <p className="text-sm text-slate-500">Browse image files to upload</p>
        </button>
      ) : (
        <div className="w-full relative">
          {/* Afficher l'image si une URL de prévisualisation est définie */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="selected"
              className="w-full h-[300px] object-cover rounded-lg"
            />
          )}
          {/* Bouton pour supprimer l'image sélectionnée */}
          <button
            onClick={() => handleRemoveImage} // Réinitialiser l'image
            className="absolute top-2 right-2 text-red-500"
          >
            <MdDeleteOutline className="text-2xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
