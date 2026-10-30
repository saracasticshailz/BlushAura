import { type AdminModel } from '../../../hooks/useAdmin';
import { ImageUploadEditor } from '../media/ImageUploadEditor';

type Props = Pick<AdminModel, 'imageFile' | 'setImageFile' | 'product' | 'uploading' | 'upload'>;
export function AdminImageEditor(props: Props) {
  const { imageFile, setImageFile, product, uploading, upload } = props;
  return (
    <>
      {imageFile && product && (
        <ImageUploadEditor
          file={imageFile}
          busy={uploading}
          onClose={() => setImageFile(null)}
          onApply={upload}
        />
      )}
    </>
  );
}
