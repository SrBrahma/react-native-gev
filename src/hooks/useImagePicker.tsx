import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


// https://docs.expo.dev/versions/latest/sdk/imagepicker/?redirected

export function useImagePicker({ ratio, resetOnUpload = true }: {
  ratio: [width: number, height: number];
  /** If will resetImage on successful upload. Useful for disabling upload button and cleaning dirtiness.
   * @default true */
  resetOnUpload?: boolean;
}): {
  pickImage: () => void;
  imageUri: string | null;
  uploadImage: (fun: (data: any) => PromiseLike<any>) => Promise<any>;
  pickedImage: boolean;
  /** Reset the imageUri (and pickedImaged). Automatically called if resetOnUpload. */
  resetImage: () => void;
  } {
  const [imageUri, setImage] = useState<null | string>(null);

  async function pickImage() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
          alert('Nós precisamos da permissão às suas mídias para escolher uma imagem!'); // TODO i18n
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: ratio,
        quality: 1,
      });
      if (!result.cancelled)
        setImage(result.uri);
    } catch (err: any) {
      Alert.alert(err);
    }
  }

  async function uploadImage(fun: (data: any) => PromiseLike<any>) {
    if (!imageUri)
      throw new Error('Image not set!');

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.warn(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', imageUri, true);
      xhr.send(null);
    });

    await fun(blob);

    // We're done with the blob, close and release it
    (blob as any).close();

    if (resetOnUpload)
      setImage(null);
  }

  return {
    imageUri,
    pickImage,
    uploadImage,
    pickedImage: !!imageUri,
    resetImage: () => setImage(null),
  };
}