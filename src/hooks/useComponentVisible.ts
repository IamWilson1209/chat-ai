import { useState, useEffect, useRef } from "react";

interface ComponentVisibleHook {
  ref: React.RefObject<any>;
  isComponentVisible: boolean;
  setIsComponentVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

/* 用來顯示 emoji picker 的 custom hook */
export default function useComponentVisible(initialIsVisible: boolean): ComponentVisibleHook {
  const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
  const ref = useRef<any>(null);

  /* 當滑鼠按到emoji picker外面時，關閉 */
  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsComponentVisible(false);
    }
  };

  /*
    在元件ref時，透過 document.addEventListener 
    監聽整個文件的 click 事件，並將 handleClickOutside 作為回調函數。
    第三個參數 true 表示事件在capture phase觸發，而不是冒泡階段。
    確保事件能在點擊到子元素之前被捕獲
  */
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      /* 語句返回一個清理函數，在元件卸載時移除事件監聽器，防止記憶體洩漏 */
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  /* 
    ref：用來綁定到目標元件的 DOM 節點
    isComponentVisible：當前可見狀態
    setIsComponentVisible：手動控制可見性的函數
  */
  return { ref, isComponentVisible, setIsComponentVisible };
}