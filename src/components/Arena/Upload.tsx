import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export default function UploadImage({
  value,
  onChange,
}: {
  value?: string;
  onChange: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePath, setFilePath] = useState<string | undefined>(value);
  const [error, setError] = useState<string | undefined>();
  // 记录由 URL.createObjectURL 创建的临时 URL，便于正确 revoke
  const objectUrlRef = useRef<string | null>(null);

  // 点击触发文件选择
  const handleClick = () => {
    setError(undefined);
    fileInputRef.current?.click();
  };

  // 文件类型与大小验证
  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only supports images in JPG/PNG/GIF/WebP");
      return false;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("The image size cannot exceed 5MB");
      return false;
    }
    return true;
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!validateFile(file)) return;

    onChange(file);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const imageUrl = URL.createObjectURL(file);
    objectUrlRef.current = imageUrl;
    setFilePath(imageUrl);
    setError(undefined);
  };

  // 当外部 value 改变时同步（例如从服务器传入的图片 URL）
  useEffect(() => {
    // 如果外部传入的是同一个 object URL，不做改动
    if (value && value !== filePath) {
      // 如果之前是内部创建的 objectURL，释放掉
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setFilePath(value);
    }
    if (!value) {
      // 外部清空时也释放内部 objectURL 并清除预览
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setFilePath(undefined);
    }
  }, [filePath, value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleImageError = () => {
    setError("loading error...");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setFilePath(undefined);
  };

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        className={clsx(
          "w-24 h-24 flex flex-col justify-center items-center gap-2 overflow-hidden",
          "bg-Dark_Tier1 border border-Dark_Tier2 rounded-2xl relative",
          "md:w-30 md:h-30",
          error && "border-River_Red"
        )}
        onClick={handleClick}
      >
        {!filePath && (
          <>
            <img src="/images/upload.svg" alt="上传图标" />
            <p
              className={clsx(
                "text-center text-xs text-Dark_Secondary",
                "md:text-sm"
              )}
            >
              Upload Avatar
            </p>
          </>
        )}

        {filePath && (
          <img
            className="absolute w-full h-full top-0 right-0 object-cover"
            src={filePath}
            alt=""
            onError={handleImageError}
          />
        )}
      </button>

      {error && <p className="text-River_Red text-xs">{error}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
      />
    </section>
  );
}
