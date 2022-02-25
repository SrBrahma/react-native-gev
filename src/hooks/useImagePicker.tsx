import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


/** https://stackoverflow.com/a/18650249/10247962
 * https://stackoverflow.com/a/33448478/10247962 */
function blobToBase64(blob: any): Promise<any> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// https://docs.expo.dev/versions/latest/sdk/imagepicker/?redirected

type UseImagePickerProps = {
  ratio?: [width: number, height: number];
  /** If will resetImage on successful upload. Useful for disabling upload button and cleaning dirtiness.
   * @default true */
  resetOnUpload?: boolean;
};
type UseImagePickerReturn = {
  pickImage: () => void;
  imageUri: string | null;
  uploadImage: (fun: (data: any) => PromiseLike<any>, opts?: {
    /** @default 'blob' */
    mode: 'blob' | 'base64';
  }) => Promise<any>;
  pickedImage: boolean;
  /** Reset the imageUri (and pickedImaged). Automatically called if resetOnUpload. */
  resetImage: () => void;
};

export function useImagePicker(opts: UseImagePickerProps = {}): UseImagePickerReturn {
  const { ratio, resetOnUpload = true } = opts;

  const [imageUri, setImage] = useState<null | string>(null);

  async function pickImage() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
          Alert.alert('Nós precisamos da permissão às suas mídias para escolher uma imagem!');
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

  async function uploadImage(fun: (data: any) => PromiseLike<any>, opts?: {
    mode: 'blob' | 'base64';
  }) {
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

    if (opts?.mode === 'base64') {
      const base64 = await blobToBase64(blob);
      await fun(base64);
    }
    else if (opts?.mode === 'blob') {
      await fun(blob);
    }

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