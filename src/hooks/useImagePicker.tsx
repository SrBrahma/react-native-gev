import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
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

// TODO add just number
type Ratio = [width: number, height: number];

// https://docs.expo.dev/versions/latest/sdk/imagepicker/?redirected

type UseImagePickerProps = {
  ratio?: Ratio;
  /** If will resetImage on successful upload. Useful for disabling upload button and cleaning dirtiness.
   * @default true */
  resetOnUpload?: boolean;
};

// TODO join pickImage and uploadImage?

type UseImagePickerReturn = {
  /** The URI of the selected image */
  imageUri: string | null;
  isImagePicked: boolean;

  /** Picks an image.
   * @throws */
  pickImage: (opts?: {
    /** If it shall immediatly upload after picking the image.
     * */
    uploadAfterPick?: {
      mode: 'blob' | 'base64';
      callback: (data: any) => Promise<any>;
    };
  }) => Promise<void>;

  /** Uploads the picked image.
   *
   * If you want to pick and immediatly upload it, use pickImage() with uploadAfterPick option,
   * as if you call pickImage() and uploadImage(), the image state may not be yet updated.
   * @throws */
  uploadImage: (fun: (data: any) => Promise<any>, opts?: {
    /** @default 'blob' */
    mode: 'blob' | 'base64';
  }) => Promise<any>;
  /** Reset the imageUri (and pickedImaged). Automatically called if resetOnUpload. */
  resetImage: () => void;
};


async function uploadImageByUri({ imageUri, fun, mode = 'blob' }: {
  fun: (data: any) => Promise<any>;
  imageUri: string;
  /** @default 'blob' */
  mode?: 'blob' | 'base64';
}) {
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

  try {
    if (mode === 'base64') {
      const base64 = await blobToBase64(blob);
      await fun(base64);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    else if (mode === 'blob') {
      await fun(blob);
    }
  } finally {
    // We're done with the blob, close and release it
    (blob as any).close();
  }
}

export function useImagePicker(opts: UseImagePickerProps = {}): UseImagePickerReturn {
  const { ratio, resetOnUpload = true } = opts;

  const [imageUri, setImage] = useState<null | string>(null);


  const pickImage = useCallback<UseImagePickerReturn['pickImage']>(async (opts = {}) => {
    const { uploadAfterPick } = opts;
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted')
        throw new Error('Nós precisamos da permissão às suas mídias para escolher uma imagem!');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: ratio,
      quality: 1,
    });

    // Do nothing if cancelled
    if (result.cancelled) return;

    // TODO There is base64 in the result. Could we use it instead of the below?
    const imageUri = result.uri;
    if (uploadAfterPick) {
      await uploadImageByUri({
        fun: uploadAfterPick.callback,
        mode: uploadAfterPick.mode,
        imageUri,
      });
    }
    else
      setImage(imageUri);

  }, [ratio]);


  const uploadImage = useCallback<UseImagePickerReturn['uploadImage']>(async (fun, opts) => {
    if (!imageUri)
      throw new Error('Image not set!');

    await uploadImageByUri({ fun, imageUri, mode: opts?.mode });

    if (resetOnUpload)
      setImage(null);
  }, [imageUri, resetOnUpload]);


  return {
    imageUri,
    pickImage,
    uploadImage,
    isImagePicked: !!imageUri,
    resetImage: () => setImage(null),
  };
}