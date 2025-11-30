"use client";
import ImageUploader from "@/components/ImageUploader";
import ChatBox from '@/components/ChatBox';
import { usePictureStore } from '@/store/pictureStore';
import Footer from "@/components/Footer";
export default function Home() {
  const { picture } = usePictureStore();
  return (
    <>
      <ImageUploader />
      <ChatBox imageId={picture?.id} />
      <Footer />
    </>
  );
}