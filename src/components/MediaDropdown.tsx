import { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ImageIcon, Plus, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import Image from 'next/image';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/stores';

const MediaDropdown = () => {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const generateUploadUrl = useMutation(
    api.functions.conversations.generateUploadUrl
  );
  const sendImage = useMutation(api.functions.messages.sendImage);
  const sendVideo = useMutation(api.functions.messages.sendVideo);
  const me = useQuery(api.functions.users.getMe);

  const selectedConversation = useSelector(
    (state: RootState) => state.conversation.selectedConversation
  );

  const handleSendImage = async () => {
    setIsLoading(true);
    try {
      /* 取得 convex 暫存 url */
      const postUrl = await generateUploadUrl();

      /* POST image file 給 url */
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedImage.type },
        body: selectedImage,
      });

      /* 取得回傳 storage id */
      const { storageId } = await result.json();

      /* 儲存新的 storage id 給 Convex */
      await sendImage({
        conversation: selectedConversation!._id,
        imgId: storageId,
        sender: me!._id,
      });

      setSelectedImage(null);
    } catch (err) {
      toast.error('Failed to send image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVideo = async () => {
    setIsLoading(true);
    try {
      /* 取得 convex 暫存 url */
      const postUrl = await generateUploadUrl();

      /* POST image file 給 url */
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedVideo!.type },
        body: selectedVideo,
      });

      /* 取得回傳 storage id */
      const { storageId } = await result.json();

      /* 儲存新的 storage id 給 Convex */
      await sendVideo({
        videoId: storageId,
        conversation: selectedConversation!._id,
        sender: me!._id,
      });

      setSelectedVideo(null);
    } catch (err) {
      toast.error('Failed to send image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={imageInput}
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files![0])}
        hidden
      />

      <input
        type="file"
        ref={videoInput}
        accept="video/mp4"
        onChange={(e) => setSelectedVideo(e.target?.files![0])}
        hidden
      />

      {/* 
				When select an image, 
				jump the dialog and make the image open in this dialog 
			*/}
      {selectedImage && (
        <MediaImageDialog
          isOpen={selectedImage !== null}
          onClose={() => setSelectedImage(null)}
          selectedImage={selectedImage}
          isLoading={isLoading}
          handleSendImage={handleSendImage}
        />
      )}

      {/* 
				When select an video(using react-player), 
				jump the dialog and make the image open in this dialog 
			*/}
      {selectedVideo && (
        <MediaVideoDialog
          isOpen={selectedVideo !== null}
          onClose={() => setSelectedVideo(null)}
          selectedVideo={selectedVideo}
          isLoading={isLoading}
          handleSendVideo={handleSendVideo}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Plus className="text-gray-600 dark:text-gray-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => imageInput.current!.click()}>
            <ImageIcon size={18} className="mr-1" /> Photo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => videoInput.current!.click()}>
            <Video size={20} className="mr-1" />
            Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
export default MediaDropdown;

type MediaImageDialogProps = {
  isOpen: boolean;
  onClose: () => void; // 關閉 Dialog 的回調函數
  selectedImage: File;
  isLoading: boolean;
  handleSendImage: () => void; // 處理圖片上傳的函數
};

const MediaImageDialog = ({
  isOpen,
  onClose,
  selectedImage,
  isLoading,
  handleSendImage,
}: MediaImageDialogProps) => {
  const [renderedImage, setRenderedImage] = useState<string | null>(null);

  /* 
    用來生成臨時顯示image
    當 selectedImage 改變時，使用 JS FileReader 
    reader.onload：
      將圖片轉為 base64 格式並更新狀態 
      e 是事件物件，e.target 是 FileReader 本身
      result 是一個 base64 編碼的字串
    reader.readAsDataURL:
      告訴reader將檔案讀取為 Data URL 格式（base64 字串）
    setRenderedImage:
      將 base64 字串設置到 renderedImage 狀態，讓圖片可以在 <img> 標籤中顯示
  */
  useEffect(() => {
    if (!selectedImage) return;
    const reader = new FileReader();
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogDescription className="flex flex-col gap-10 justify-center items-center">
          {renderedImage && (
            <Image
              src={renderedImage}
              width={300}
              height={300}
              alt="selected image"
            />
          )}
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleSendImage}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

type MediaVideoDialogProps = {
  isOpen: boolean;
  onClose: () => void; // 關閉對話框的回調函數
  selectedVideo: File;
  isLoading: boolean;
  handleSendVideo: () => void; // 處理影片上傳的函數
};

const MediaVideoDialog = ({
  isOpen,
  onClose,
  selectedVideo,
  isLoading,
  handleSendVideo,
}: MediaVideoDialogProps) => {
  /*
    用來生成臨時顯示video
    URL.createObjectURL: 
      瀏覽器的原生 API，用來從檔案或二進位資料生成一個臨時的 URL 
    Blob（Binary Large Object）是表示二進位資料的物件
      將 selectedVideo（一個 File 物件）放入陣列，作為 Blob 的內容
      { type: 'video/mp4' }：指定 MIME 類型，表示這是一個 MP4 影片
  */
  const renderedVideo = URL.createObjectURL(
    new Blob([selectedVideo], { type: 'video/mp4' })
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogDescription>Video</DialogDescription>
        <div className="w-full">
          {/* 
          <ReactPlayer>：
            用於播放影片。
              url={renderedVideo}：使用生成的臨時 URL 播放影片。
              controls：顯示播放控制條（播放、暫停、音量等）
              width="100%"：影片寬度填滿容器
          */}
          {renderedVideo && (
            <ReactPlayer url={renderedVideo} controls width="100%" />
          )}
        </div>
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={handleSendVideo}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
