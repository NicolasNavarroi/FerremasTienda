// config/productoMulter.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para productos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/products');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos para productos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const isValid = allowedTypes.includes(file.mimetype);
  
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG o WEBP'), false);
  }
};

// Configuración de Multer para productos
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (puedes ajustarlo)
    files: 1 // Solo permitir un archivo
  }
});

module.exports = {
  singleUpload: upload.single('imagen'), // Para subida única
  multipleUpload: upload.array('imagenes', 3) // Opcional para múltiples imágenes
};