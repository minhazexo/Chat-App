import { getDownloadURL, ref, uploadBytesResumable, } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file) => {
    const date= new Date()
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `images/${date+ file.name}` ); // Use the file name dynamically
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress indicator
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');

        
      },
        (error) => {
          reject("Something went wrong! +error.code")
        // Handle unsuccessful uploads
        console.error('Upload failed:', error);
        reject(error);  // Reject the promise if there's an error
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((getDownloadURL) => {
          resolve(getDownloadURL)
           // Resolve with the download URL
        }).catch((error) => {
          reject(error); // Reject if getDownloadURL fails
        });
      }
    );
  });
};

export default upload;
