// Fonction pour chiffrer le contenu
export const encryptContent = async (content: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const passwordData = encoder.encode(password);
  
  // Créer une clé à partir du mot de passe
  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Générer une clé dérivée pour le chiffrement
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  
  // Générer un IV aléatoire
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Chiffrer le contenu
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    encryptionKey,
    data
  );
  
  // Combiner IV et contenu chiffré
  const encryptedArray = new Uint8Array(iv.length + encryptedContent.byteLength);
  encryptedArray.set(iv);
  encryptedArray.set(new Uint8Array(encryptedContent), iv.length);
  
  // Convertir en base64
  return btoa(String.fromCharCode(...encryptedArray));
};

// Fonction pour déchiffrer le contenu
export const decryptContent = async (encryptedContent: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Convertir depuis base64
  const encryptedArray = new Uint8Array(
    atob(encryptedContent).split('').map(char => char.charCodeAt(0))
  );
  
  // Extraire IV et contenu chiffré
  const iv = encryptedArray.slice(0, 12);
  const data = encryptedArray.slice(12);
  
  const passwordData = encoder.encode(password);
  
  // Recréer la clé à partir du mot de passe
  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Générer la même clé dérivée
  const decryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  );
  
  try {
    // Déchiffrer le contenu
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      decryptionKey,
      data
    );
    
    return decoder.decode(decryptedContent);
  } catch (error) {
    throw new Error("Mot de passe incorrect");
  }
};